#!/usr/bin/env python3
"""montecarlo.py — simulação probabilística sobre as faixas triangulares do canon.

Modos:
  --metrica X                     → distribuição estática da métrica (amostra os
                                    campos com faixa {min,max,provavel}).
  --projecao --meses N            → projeção de caixa/MRR mês a mês com a mecânica:
        MRR(t) = MRR(t-1) × (1 − churn) + novos × ticket
        caixa(t) = caixa(t-1) − (burn_bruto − MRR(t))
        pagantes(t) = pagantes(t-1) + novos − churn_logo×pagantes(t-1)
  --limiar "caixa>=0@12" ou "runway_meses>=6"  → probabilidade do limiar.

Saída: P10/P50/P90 + P(limiar) + PREMISSAS usadas (campo, faixa, origem ponto).
Driver sem faixa → tratado como determinístico; o relatório lista quais faixas
habilitariam mais incerteza modelada. Sem NENHUMA faixa → modo determinístico
declarado. --seed para reprodutibilidade (evals).
"""

from __future__ import annotations

import argparse
import random
import re
import statistics
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import calc as calcmod
from _gemeo_lib import canon_path, die_uso, emit, get_path, is_range, load_yaml, point_value

CAMPOS_PROJECAO = {
    "mrr": "snapshot.mrr",
    "pagantes": "snapshot.clientes_pagantes",
    "caixa": "financeiro.caixa_atual",
    "novos": "crescimento.novos_clientes_pagantes_mes",
    "churn_rec": "crescimento.churn_receita_mensal_pct",
    "churn_logo": "crescimento.churn_logo_mensal_pct",
    "ticket": "snapshot.ticket_medio",
}


def acha_faixas(node, caminho=""):
    out = {}
    if is_range(node):
        out[caminho] = node
    elif isinstance(node, dict):
        for k, v in node.items():
            out.update(acha_faixas(v, f"{caminho}.{k}" if caminho else k))
    return out


def amostra(faixa, rng):
    return rng.triangular(faixa["min"], faixa["max"], faixa["provavel"])


def set_path(d, dotted, val):
    node = d
    parts = dotted.split(".")
    for k in parts[:-1]:
        node = node[k]
    node[parts[-1]] = val


def pct(valores, p):
    s = sorted(valores)
    k = max(0, min(len(s) - 1, int(round(p / 100 * (len(s) - 1)))))
    return round(s[k], 2)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--metrica")
    ap.add_argument("--projecao", action="store_true")
    ap.add_argument("--meses", type=int, default=12)
    ap.add_argument("--limiar", help='ex.: "caixa>=0@12" ou "runway_meses>=6"')
    ap.add_argument("--iteracoes", type=int, default=10000)
    ap.add_argument("--seed", type=int)
    ap.add_argument("--canon")
    ap.add_argument("--json", action="store_true")
    a = ap.parse_args()

    if not a.metrica and not a.projecao:
        die_uso("use --metrica X ou --projecao")
    cpath = canon_path(override=a.canon)
    canon = load_yaml(cpath)
    cat = load_yaml(calcmod.catalogo_path(cpath))
    rng = random.Random(a.seed)
    faixas = acha_faixas(canon)

    premissas = [{"campo": c, "min": f["min"], "max": f["max"], "provavel": f["provavel"],
                  "distribuicao": "triangular"} for c, f in faixas.items()]
    limiar = None
    if a.limiar:
        m = re.match(r"([a-z_]+)\s*(>=|<=)\s*(-?[\d.]+)(?:@(\d+))?$", a.limiar.strip())
        if not m:
            die_uso('limiar inválido — ex.: "caixa>=0@12" ou "runway_meses>=6"')
        limiar = {"alvo": m.group(1), "op": m.group(2), "valor": float(m.group(3)),
                  "mes": int(m.group(4)) if m.group(4) else None}

    import copy
    valores, hits = [], 0

    if a.metrica:
        # fecho de campos da métrica (inclui depende_de recursivo)
        def fecho(nome, visto=None):
            visto = visto or set()
            if nome in visto or nome not in cat:
                return set()
            visto.add(nome)
            campos = set(cat[nome].get("campos", []))
            for dep in cat[nome].get("depende_de", []):
                campos |= fecho(dep, visto)
            return campos

        campos_metrica = fecho(a.metrica)
        relevantes = {c: f for c, f in faixas.items()
                      if any(c == cm or c.startswith(cm + ".") for cm in campos_metrica)}
        if not relevantes:
            r = calcmod.resolver(a.metrica, canon, cat, {})
            emit({"modo": "deterministico",
                  "motivo": "nenhum campo de entrada desta métrica tem faixa no canon",
                  "resultado": r,
                  "habilitaria": sorted(campos_metrica)},
                 a.json,
                 f"DETERMINÍSTICO: {a.metrica} = {r.get('valor')} — nenhum input desta métrica "
                 f"tem faixa {{min,max,provavel}} no canon.\n"
                 f"Faixas nestes campos habilitariam a distribuição: {', '.join(sorted(campos_metrica))}.\n"
                 f"(Para incerteza de TRAJETÓRIA — caixa/runway ao longo do tempo — use --projecao.)")
            return
        for _ in range(a.iteracoes):
            c2 = copy.deepcopy(canon)
            for campo, fx in relevantes.items():
                set_path(c2, campo, amostra(fx, rng))
            try:
                r = calcmod.resolver(a.metrica, c2, cat, {})
            except calcmod.DadoFaltante as e:
                die_uso(f"métrica não computável: faltam {e.faltantes}")
            v = r.get("valor")
            if v is None:
                continue
            valores.append(v)
            if limiar and limiar["alvo"] == a.metrica:
                ok = v >= limiar["valor"] if limiar["op"] == ">=" else v <= limiar["valor"]
                hits += ok
        alvo_nome = a.metrica

    else:  # projeção de caixa
        base = {k: point_value(get_path(canon, p)) for k, p in CAMPOS_PROJECAO.items()}
        faltam = [p for k, p in CAMPOS_PROJECAO.items() if base[k] is None]
        if faltam:
            print("não tenho esse dado — projeção exige:", file=sys.stderr)
            for f in faltam:
                print(f"  - {f}", file=sys.stderr)
            sys.exit(1)
        burn_bruto = calcmod.resolver("burn_bruto_mensal", canon, cat, {}).get("valor")
        series_final = []
        for _ in range(a.iteracoes):
            novos = amostra(faixas[CAMPOS_PROJECAO["novos"]], rng) if CAMPOS_PROJECAO["novos"] in faixas else base["novos"]
            churn = (amostra(faixas[CAMPOS_PROJECAO["churn_rec"]], rng) if CAMPOS_PROJECAO["churn_rec"] in faixas else base["churn_rec"]) / 100.0
            mrr, caixa = base["mrr"], base["caixa"]
            mes_limiar_ok = True
            for mes in range(1, a.meses + 1):
                mrr = mrr * (1 - churn) + novos * base["ticket"]
                caixa = caixa - (burn_bruto - mrr)
                if limiar and limiar["alvo"] == "caixa" and limiar["mes"] == mes:
                    ok = caixa >= limiar["valor"] if limiar["op"] == ">=" else caixa <= limiar["valor"]
                    mes_limiar_ok = ok
            series_final.append(caixa)
            if limiar and limiar["alvo"] == "caixa":
                hits += mes_limiar_ok if limiar["mes"] else (caixa >= limiar["valor"])
        valores = series_final
        alvo_nome = f"caixa no mês {a.meses}"

    if not valores:
        die_uso("simulação não produziu valores")
    payload = {
        "alvo": alvo_nome, "iteracoes": len(valores), "seed": a.seed,
        "P10": pct(valores, 10), "P50": pct(valores, 50), "P90": pct(valores, 90),
        "media": round(statistics.mean(valores), 2),
        "premissas": premissas,
        "nota": "P10 = cenário de planejamento de sobrevivência; faixas triangulares declaradas no canon",
    }
    if limiar:
        payload["limiar"] = {**limiar, "probabilidade_pct": round(100 * hits / len(valores), 1)}

    linhas = [f"Monte Carlo — {alvo_nome} ({len(valores)} iterações"
              + (f", seed={a.seed}" if a.seed is not None else "") + ")",
              f"  P10 = {payload['P10']} · P50 = {payload['P50']} · P90 = {payload['P90']} (média {payload['media']})"]
    if limiar:
        linhas.append(f"  P({limiar['alvo']} {limiar['op']} {limiar['valor']}"
                      + (f" no mês {limiar['mes']}" if limiar.get("mes") else "")
                      + f") = {payload['limiar']['probabilidade_pct']}%")
    linhas.append("  Premissas (faixas triangulares do canon):")
    for p in premissas:
        linhas.append(f"    {p['campo']}: {p['min']}–{p['max']} (provável {p['provavel']})")
    emit(payload, a.json, "\n".join(linhas))


if __name__ == "__main__":
    main()
