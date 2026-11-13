#!/usr/bin/env python3
"""validar_canon.py — contrato de dados + consistências agregadas do canon.

Verifica:
  1. Schema (tipos/faixas plausíveis) — gemeo/00-CANON/canon.schema.json
  2. Consistências agregadas (só quando ambos os lados existem):
       custos.folha = Σ time[].custo
       snapshot.mrr = Σ clientes[].mrr
       burn_bruto_mensal = Σ custos.*
       clientes_total = pagantes + free
  3. Faixas triangulares: min <= provavel <= max
  4. Sincronia time[].perfil_cognitivo ↔ gemeo/08-PESSOAS/Team/ (aviso)
  4b. Dado datado: marca.redes[] (seguidores com data_ref, sem rede repetida, metas.social com rede
      declarada), dados.bases[] (registros com atualizado_em), atendimento (medido com data_ref) — aviso
  5. Anotações de origem em valores numéricos (aviso; erro com --strict)

Uso: validar_canon.py [--canon PATH] [--schema PATH] [--adequacao] [--strict] [--json]
Exit: 0 ok (ou --adequacao) · 1 violações · 2 uso.
Violações saem no stderr com a CONTA ESPERADA — formato consumido pelo hook
PostToolUse (exit 2 do hook → o Claude se autocorrige).
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from _gemeo_lib import (EXIT_DADO, canon_path, die_uso, emit, get_path,
                        is_range, load_yaml, point_value)

TOLERANCIA = 0.01  # 1 centavo / fração de conta


def _erro(viols, regra, msg):
    viols.append({"severidade": "erro", "regra": regra, "detalhe": msg})


def _aviso(viols, regra, msg):
    viols.append({"severidade": "aviso", "regra": regra, "detalhe": msg})


def checa_schema(canon: dict, schema_path: Path, viols: list) -> None:
    import jsonschema

    schema = json.loads(schema_path.read_text(encoding="utf-8"))
    # YAML parseia datas como objetos date; o schema espera string — normaliza
    def norm(o):
        import datetime
        if isinstance(o, (datetime.date, datetime.datetime)):
            return o.isoformat()
        if isinstance(o, dict):
            return {k: norm(v) for k, v in o.items()}
        if isinstance(o, list):
            return [norm(v) for v in o]
        return o

    validator = jsonschema.Draft202012Validator(schema)
    for e in validator.iter_errors(norm(canon)):
        _erro(viols, "schema", f"{'.'.join(str(p) for p in e.absolute_path)}: {e.message}")


def checa_consistencias(canon: dict, viols: list) -> None:
    def soma(lista, chave):
        itens = get_path(canon, lista) or []
        vals = [point_value(i.get(chave)) for i in itens if i.get(chave) is not None]
        return (sum(vals), len(vals)) if vals else (None, 0)

    # orçamento dos agentes: Σ por área ≤ teto do mês
    teto = point_value(get_path(canon, "agentes.orcamento_mensal_usd"))
    por_area = get_path(canon, "agentes.orcamento_por_area_usd") or {}
    vals = [point_value(v) for v in por_area.values() if v is not None]
    if teto is not None and vals and sum(vals) - teto > TOLERANCIA:
        _erro(viols, "consistencia.orcamento_agentes",
              f"Σ agentes.orcamento_por_area_usd={round(sum(vals), 2)} > "
              f"agentes.orcamento_mensal_usd={teto} — as áreas somam mais que o teto do mês")

    # folha = Σ time[].custo
    folha = point_value(get_path(canon, "financeiro.custos.folha"))
    soma_time, n = soma("time", "custo")
    if folha is not None and soma_time is not None and abs(folha - soma_time) > TOLERANCIA:
        _erro(viols, "consistencia.folha",
              f"financeiro.custos.folha={folha} ≠ Σ time[].custo={soma_time} "
              f"({n} pessoas; diferença {round(folha - soma_time, 2)})")

    # mrr = Σ clientes[].mrr
    mrr = point_value(get_path(canon, "snapshot.mrr"))
    soma_cli, n = soma("clientes", "mrr")
    if mrr is not None and soma_cli is not None and abs(mrr - soma_cli) > TOLERANCIA:
        _erro(viols, "consistencia.mrr",
              f"snapshot.mrr={mrr} ≠ Σ clientes[].mrr={soma_cli} "
              f"({n} contas; diferença {round(mrr - soma_cli, 2)})")

    # burn_bruto = Σ custos.*
    burn = point_value(get_path(canon, "financeiro.burn_bruto_mensal"))
    custos = get_path(canon, "financeiro.custos") or {}
    vals = [point_value(v) for v in custos.values() if v is not None]
    if burn is not None and vals and abs(burn - sum(vals)) > TOLERANCIA:
        _erro(viols, "consistencia.burn",
              f"financeiro.burn_bruto_mensal={burn} ≠ Σ custos.*={sum(vals)} "
              f"(diferença {round(burn - sum(vals), 2)})")

    # clientes_total = pagantes + free
    total = point_value(get_path(canon, "snapshot.clientes_total"))
    pag = point_value(get_path(canon, "snapshot.clientes_pagantes"))
    free = point_value(get_path(canon, "snapshot.clientes_free"))
    if None not in (total, pag, free) and abs(total - (pag + free)) > TOLERANCIA:
        _erro(viols, "consistencia.clientes_total",
              f"snapshot.clientes_total={total} ≠ pagantes({pag}) + free({free}) = {pag + free}")


def checa_faixas(node, caminho: str, viols: list) -> None:
    if is_range(node):
        if not (node["min"] <= node["provavel"] <= node["max"]):
            _erro(viols, "faixa",
                  f"{caminho}: exige min <= provavel <= max "
                  f"(got min={node['min']}, provavel={node['provavel']}, max={node['max']})")
        return
    if isinstance(node, dict):
        for k, v in node.items():
            checa_faixas(v, f"{caminho}.{k}" if caminho else k, viols)
    elif isinstance(node, list):
        for i, v in enumerate(node):
            checa_faixas(v, f"{caminho}[{i}]", viols)


def checa_perfis(canon: dict, cpath: Path, viols: list) -> None:
    base = cpath.parent.parent / "08-PESSOAS" / "Team"
    for p in get_path(canon, "time") or []:
        slug = p.get("perfil_cognitivo")
        if not slug:
            continue
        existe = (base / slug).is_dir() or (base / f"perfil-{slug}.md").exists()
        if not existe:
            _aviso(viols, "perfil",
                   f"time[]: perfil_cognitivo '{slug}' sem pasta Team/{slug}/ nem "
                   f"Team/perfil-{slug}.md — criar via /montar-gemeo (dossiê ou intake)")


def checa_redes(canon: dict, viols: list) -> None:
    """Número de marca, dados e atendimento sem data é foto sem idade (gate dado-datado)."""
    vistas = set()
    for i, r in enumerate(get_path(canon, "marca.redes") or []):
        nome = r.get("rede")
        if nome in vistas:
            _aviso(viols, "marca", f"marca.redes[{i}]: rede '{nome}' repetida — uma linha por rede")
        vistas.add(nome)
        if r.get("seguidores") is not None and not r.get("data_ref"):
            _aviso(viols, "marca",
                   f"marca.redes[{i}] ({nome}): seguidores sem data_ref — número sem idade")
    for i, b in enumerate(get_path(canon, "dados.bases") or []):
        if b.get("registros") is not None and not b.get("atualizado_em"):
            _aviso(viols, "dados",
                   f"dados.bases[{i}] ({b.get('nome')}): registros sem atualizado_em — volume sem idade")
    at = get_path(canon, "atendimento") or {}
    medidos = [k for k in ("tickets_mes", "primeira_resposta_real_horas", "csat_pct", "nps")
               if at.get(k) is not None]
    if medidos and not at.get("data_ref"):
        _aviso(viols, "atendimento",
               f"atendimento: {', '.join(medidos)} sem data_ref — medição sem período")
    for rede in (get_path(canon, "metas.social") or {}):
        if rede not in vistas:
            _aviso(viols, "marca",
                   f"metas.social.{rede}: rede sem linha em marca.redes[] — meta sem ponto de partida")


# valor numérico "puro" (não data AAAA-MM-DD, não lista/dict vazio)
VALOR_RE = re.compile(r"^\s*[a-z_]+:\s*-?\d+(\.\d+)?\s*$")
DATA_RE = re.compile(r":\s*\d{4}-\d{2}(-\d{2})?\s*$")


def checa_origem(cpath: Path, viols: list) -> None:
    for n, linha in enumerate(cpath.read_text(encoding="utf-8").splitlines(), 1):
        if VALOR_RE.match(linha) and not DATA_RE.search(linha):
            campo = linha.split(":")[0].strip()
            _aviso(viols, "origem",
                   f"linha {n} ({campo}): valor numérico sem anotação de origem "
                   f"(# via <fonte> em <data> / # estimativa / # premissa)")


def checa_prioridade(cpath: Path, viols: list) -> None:
    """Valida gemeo/00-CANON/prioridade.yaml (modelo de priorização), se presente."""
    mp = cpath.parent / "prioridade.yaml"
    sp = cpath.parent / "prioridade.schema.json"
    if not mp.exists():
        return
    model = load_yaml(mp)
    if sp.exists():
        import jsonschema
        schema = json.loads(sp.read_text(encoding="utf-8"))
        for e in jsonschema.Draft7Validator(schema).iter_errors(model):
            _erro(viols, "prioridade-schema",
                  f"{'.'.join(str(p) for p in e.absolute_path)}: {e.message}")
    anc = model.get("score_ancoras") or {}
    if anc and not (anc.get("score_prior", 0) < anc.get("score_meio", 0) < anc.get("score_forte", 0)):
        _erro(viols, "prioridade", "score_ancoras devem ser crescentes (prior<meio<forte)")
    for lente, cfg in (model.get("lentes") or {}).items():
        if cfg.get("prior_ref") not in (model.get("priors") or {}):
            _erro(viols, "prioridade", f"lente '{lente}': prior_ref ausente em priors")
        for ev, d in (cfg.get("evidencias") or {}).items():
            if not isinstance(d, dict) or "lr" not in d:
                _erro(viols, "prioridade", f"lente '{lente}': evidência '{ev}' sem LR (lacuna)")
    for nome, obj in (model.get("objetivos") or {}).items():
        if (obj.get("ativacao") or {}).get("tipo") != "sempre" and not obj.get("fonte"):
            _aviso(viols, "prioridade", f"objetivo '{nome}' sem fonte e não é 'sempre' — nunca ativa")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--canon")
    ap.add_argument("--schema")
    ap.add_argument("--adequacao", action="store_true",
                    help="corpus legado: relatório completo, exit 0")
    ap.add_argument("--strict", action="store_true",
                    help="avisos também reprovam")
    ap.add_argument("--json", action="store_true")
    a = ap.parse_args()

    cpath = canon_path(override=a.canon)
    canon = load_yaml(cpath)
    spath = Path(a.schema) if a.schema else cpath.parent / "canon.schema.json"
    if not spath.exists():
        spath = Path(__file__).resolve().parent.parent / "gemeo" / "00-CANON" / "canon.schema.json"
    if not spath.exists():
        die_uso("canon.schema.json não encontrado")

    viols: list = []
    checa_schema(canon, spath, viols)
    checa_consistencias(canon, viols)
    checa_faixas(canon, "", viols)
    checa_perfis(canon, cpath, viols)
    checa_redes(canon, viols)
    checa_origem(cpath, viols)
    checa_prioridade(cpath, viols)

    erros = [v for v in viols if v["severidade"] == "erro"]
    avisos = [v for v in viols if v["severidade"] == "aviso"]
    payload = {"canon": str(cpath), "erros": erros, "avisos": avisos,
               "resultado": "ok" if not erros else "violacoes"}

    linhas = [f"validar_canon: {len(erros)} erro(s), {len(avisos)} aviso(s) em {cpath}"]
    for v in erros:
        linhas.append(f"  ERRO  [{v['regra']}] {v['detalhe']}")
    for v in avisos:
        linhas.append(f"  aviso [{v['regra']}] {v['detalhe']}")
    emit(payload, a.json, "\n".join(linhas))

    if a.adequacao:
        return
    if erros or (a.strict and avisos):
        for v in erros:
            print(f"[{v['regra']}] {v['detalhe']}", file=sys.stderr)
        sys.exit(EXIT_DADO)


if __name__ == "__main__":
    main()
