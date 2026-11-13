#!/usr/bin/env python3
"""alertas.py — checa os limiares declarados em canon.alertas.*.

Para cada chave (métrica do catálogo ou campo do canon) com {minimo}/{maximo}:
compara o valor atual, busca baseline no git (HEAD por padrão) e monta hipótese
de causa pelos drivers (drivers.yaml) que mudaram.

Saída: alertas estruturados (métrica, limiar, valor, baseline, magnitude,
hipótese, ação sugerida). Exit 0 sem alertas · 3 com alertas · 1 erro de dado.
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import calc as calcmod
from _gemeo_lib import (EXIT_ALERTA, canon_at_ref, canon_path, emit, get_path,
                        load_yaml, point_value, repo_root)

ACOES = {
    "runway_meses": "revisar cenário pessimista; antecipar conversa de captação/corte de burn",
    "churn_receita_mensal_pct": "rodar playbook de resgate (09-CLIENTES/health-e-churn.md) nas contas em atenção/risco",
    "top3_pct_do_mrr": "priorizar diversificação de carteira; blindar contas-âncora (09-CLIENTES/analise-concentracao.md)",
}


def valor_de(chave, canon, cat, cpath):
    if chave in cat:
        try:
            r = calcmod.resolver(chave, canon, cat, {})
            return r.get("valor")
        except calcmod.DadoFaltante:
            return None
    return point_value(get_path(canon, chave))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--canon")
    ap.add_argument("--baseline", default="HEAD", help="ref git para baseline")
    ap.add_argument("--json", action="store_true")
    a = ap.parse_args()

    cpath = canon_path(override=a.canon)
    canon = load_yaml(cpath)
    cat = load_yaml(calcmod.catalogo_path(cpath))
    limiares = canon.get("alertas") or {}
    drivers_map = {}
    dpath = cpath.parent / "drivers.yaml"
    if dpath.exists():
        drivers_map = load_yaml(dpath)

    try:
        root = repo_root(Path.cwd())
        antigo = canon_at_ref(root, a.baseline, canon_file=cpath)
    except SystemExit:
        antigo = {}

    alertas = []
    for chave, lim in limiares.items():
        atual = valor_de(chave, canon, cat, cpath)
        if atual is None:
            continue
        violou, regra = False, ""
        if "minimo" in lim and atual < lim["minimo"]:
            violou, regra = True, f"mínimo {lim['minimo']}"
        if "maximo" in lim and atual > lim["maximo"]:
            violou, regra = True, f"máximo {lim['maximo']}"
        if not violou:
            continue
        base = valor_de(chave, antigo, cat, cpath) if antigo else None
        # hipótese: drivers da chave que mudaram vs baseline
        hipoteses = []
        candidatos = []
        for k, v in drivers_map.items():
            if chave in k or k.endswith(chave):
                candidatos = v.get("drivers", [])
                break
        for drv in candidatos:
            va = point_value(get_path(antigo, drv)) if antigo else None
            vn = point_value(get_path(canon, drv))
            if va is not None and vn is not None and abs(vn - va) > 1e-9:
                hipoteses.append(f"{drv}: {va} → {vn}")
        alertas.append({
            "metrica": chave, "limiar": lim, "valor_atual": atual,
            "baseline": base,
            "magnitude": round(atual - base, 2) if isinstance(base, (int, float)) else None,
            "hipotese": "; ".join(hipoteses) or "drivers sem mudança registrada — investigar",
            "acao_sugerida": ACOES.get(chave, "levar ao ritual semanal com prioridade"),
            "violacao": regra,
        })

    if not alertas:
        emit({"alertas": []}, a.json, "alertas: nenhum limiar violado")
        return
    linhas = [f"🚨 {len(alertas)} alerta(s):"]
    for al in alertas:
        linhas += [
            f"  {al['metrica']} = {al['valor_atual']} (violou {al['violacao']})",
            f"    baseline: {al['baseline']} · magnitude: {al['magnitude']}",
            f"    hipótese: {al['hipotese']}",
            f"    ação: {al['acao_sugerida']}",
        ]
    emit({"alertas": alertas}, a.json, "\n".join(linhas))
    sys.exit(EXIT_ALERTA)


if __name__ == "__main__":
    main()
