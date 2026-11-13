#!/usr/bin/env python3
"""calc.py — computa métricas do catálogo (gemeo/00-CANON/metricas.yaml).

O oráculo NUNCA calcula em prosa: seleciona a métrica e roda este script.
O stdout é a "conta visível" citável na resposta.

Uso:
  calc.py <metrica> [--canon PATH] [--json]
  calc.py --all [--write] [--canon PATH] [--json]
  calc.py --listar [--canon PATH] [--json]

Exit: 0 ok · 1 erro de dado (campo faltante) · 2 erro de uso.
Contrato: specs/001-melhorias-gemeo/contracts/scripts-cli.md
"""

from __future__ import annotations

import argparse
import datetime
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from _gemeo_lib import (EXIT_DADO, canon_path, die_dado, die_uso, emit,
                        get_path, is_range, load_yaml, point_value,
                        save_canon_field)

PATH_RE = re.compile(r"[a-z_][a-z0-9_]*(?:\.[a-z_][a-z0-9_]*)+")
IDENT_RE = re.compile(r"\b[a-z_][a-z0-9_]*\b")
FUNCS = {"soma_custos", "topn_mrr", "topn_ids", "contar", "soma"}


def _num(x: float):
    """Arredonda a 2 casas; inteiro exato vira int (evita 97.0 no canon)."""
    r = round(float(x), 2)
    return int(r) if r == int(r) else r


class DadoFaltante(Exception):
    def __init__(self, metrica: str, faltantes: list[str]):
        self.metrica, self.faltantes = metrica, faltantes


def catalogo_path(cpath: Path) -> Path:
    local = cpath.parent / "metricas.yaml"
    if local.exists():
        return local
    fallback = Path(__file__).resolve().parent.parent / "gemeo" / "00-CANON" / "metricas.yaml"
    if fallback.exists():
        return fallback
    die_uso("metricas.yaml não encontrado ao lado do canon nem no repositório")


def campo_presente(canon: dict, campo: str):
    """Valor 'presente': escalar não-nulo, lista não-vazia, ou dict com algum valor."""
    v = get_path(canon, campo)
    if v is None:
        return None
    if isinstance(v, list):
        return v if v else None
    if isinstance(v, dict) and not is_range(v):
        vals = [x for x in v.values() if x is not None]
        return v if vals else None
    return v


def faltantes_de(canon: dict, met: dict) -> list[str]:
    return [c for c in met.get("campos", []) if campo_presente(canon, c) is None]


def nao_aplicavel(canon: dict, met: dict) -> bool:
    removidas = set(get_path(canon, "_meta.secoes_removidas") or [])
    return any(c.split(".")[0] in removidas for c in met.get("campos", []))


def funcoes(canon: dict) -> dict:
    def soma(lista: str, chave: str) -> float:
        itens = get_path(canon, lista) or []
        return sum(point_value(i.get(chave)) or 0 for i in itens)

    def soma_custos() -> float:
        custos = get_path(canon, "financeiro.custos") or {}
        return sum(point_value(v) for v in custos.values() if v is not None)

    def _clientes_ordenados():
        cli = get_path(canon, "clientes") or []
        return sorted(cli, key=lambda c: point_value(c.get("mrr")) or 0, reverse=True)

    def topn_mrr(n: int) -> float:
        return sum(point_value(c.get("mrr")) or 0 for c in _clientes_ordenados()[:n])

    def topn_ids(n: int) -> list:
        return [c.get("id") for c in _clientes_ordenados()[:n]]

    def contar(lista: str) -> int:
        return len(get_path(canon, lista) or [])

    return {"soma": soma, "soma_custos": soma_custos, "topn_mrr": topn_mrr,
            "topn_ids": topn_ids, "contar": contar}


def resolver(nome: str, canon: dict, cat: dict, memo: dict, trilha: list | None = None):
    """Resolve uma métrica (recursivo via depende_de). Retorna dict-resultado."""
    if nome in memo:
        return memo[nome]
    trilha = trilha or []
    if nome in trilha:
        die_uso(f"ciclo no catálogo de métricas: {' -> '.join(trilha + [nome])}")
    met = cat.get(nome)
    if met is None:
        die_uso(f"métrica desconhecida: {nome} (use --listar)")

    if nao_aplicavel(canon, met):
        memo[nome] = {"metrica": nome, "status": "nao_aplicavel",
                      "motivo": "seção removida em _meta.secoes_removidas"}
        return memo[nome]

    falt = faltantes_de(canon, met)
    if falt:
        raise DadoFaltante(nome, falt)

    formula = met["formula"]
    ns = {"__builtins__": {}, "min": min, "max": max, "abs": abs, "round": round}
    ns.update(funcoes(canon))
    inputs = {}

    # 1) paths pontilhados → variáveis
    expr = formula
    for i, m in enumerate(sorted(set(PATH_RE.findall(formula)), key=len, reverse=True)):
        var = f"__p{i}"
        val = point_value(get_path(canon, m))
        if val is None:
            raise DadoFaltante(nome, [m])
        ns[var] = val
        inputs[m] = val
        expr = expr.replace(m, var)

    # 2) identificadores que são métricas do catálogo → resolve recursivo
    for ident in set(IDENT_RE.findall(expr)):
        if ident in cat and ident not in FUNCS and not ident.startswith("__"):
            sub = resolver(ident, canon, cat, memo, trilha + [nome])
            if sub.get("status") != "ok":
                raise DadoFaltante(nome, sub.get("faltantes", [f"(via {ident})"]))
            ns[ident] = sub["valor"]
            inputs[f"[metrica] {ident}"] = sub["valor"]

    try:
        bruto = eval(expr, ns)  # nosec — namespace restrito, fórmulas do catálogo versionado
    except ZeroDivisionError:
        memo[nome] = {"metrica": nome, "status": "indefinido",
                      "motivo": "divisão por zero (denominador = 0 no canon)",
                      "formula": formula, "inputs": inputs}
        return memo[nome]

    res = {"metrica": nome, "status": "ok", "formula": formula,
           "inputs": inputs, "unidade": met.get("unidade"),
           "valor": _num(bruto) if isinstance(bruto, (int, float)) else bruto,
           "desambiguacao": met.get("desambiguacao", "").strip() or None,
           "grava_em": met.get("grava_em")}

    # regra especial documentada no catálogo: runway com burn líquido <= 0
    if nome == "runway_meses":
        bl = ns.get("burn_liquido_mensal")
        if bl is not None and bl <= 0:
            res.update(valor=None, status="nao_queima_caixa",
                       motivo="burn líquido <= 0 — o negócio se paga; runway não se aplica")
    memo[nome] = res
    return res


def humano(r: dict) -> str:
    if r["status"] == "nao_aplicavel":
        return f"{r['metrica']}: não se aplica ({r['motivo']})"
    if r["status"] == "indefinido":
        return f"{r['metrica']}: indefinido — {r['motivo']}"
    if r["status"] == "nao_queima_caixa":
        return f"{r['metrica']}: o negócio se paga (burn líquido <= 0) — runway não se aplica"
    linhas = [f"{r['metrica']} = {r['formula']}"]
    for k, v in r["inputs"].items():
        linhas.append(f"  {k} = {v}")
    linhas.append(f"  => {r['valor']} {r.get('unidade') or ''}".rstrip())
    if r.get("desambiguacao"):
        linhas.append(f"  nota: {r['desambiguacao']}")
    return "\n".join(linhas)


def main() -> None:
    ap = argparse.ArgumentParser(add_help=True)
    ap.add_argument("metrica", nargs="?")
    ap.add_argument("--canon")
    ap.add_argument("--all", action="store_true")
    ap.add_argument("--write", action="store_true")
    ap.add_argument("--listar", action="store_true")
    ap.add_argument("--json", action="store_true")
    a = ap.parse_args()

    cpath = canon_path(override=a.canon)
    canon = load_yaml(cpath)
    cat = load_yaml(catalogo_path(cpath))

    if a.listar:
        memo: dict = {}
        out = []
        for nome, met in cat.items():
            if nao_aplicavel(canon, met):
                st = "nao_aplicavel"
            else:
                st = "sem_dado" if faltantes_de(canon, met) else "ok"
            out.append({"metrica": nome, "status": st, "unidade": met.get("unidade")})
        emit({"metricas": out}, a.json,
             "\n".join(f"{o['metrica']:28} {o['status']}" for o in out))
        return

    memo = {}
    if a.all:
        resultados, faltas = [], []
        for nome in cat:
            try:
                resultados.append(resolver(nome, canon, cat, memo))
            except DadoFaltante as e:
                resultados.append({"metrica": nome, "status": "sem_dado",
                                   "faltantes": e.faltantes})
                faltas.append(e)
        if a.write:
            hoje = datetime.date.today().isoformat()
            for r in resultados:
                if r.get("status") == "ok" and r.get("grava_em"):
                    save_canon_field(cpath, r["grava_em"], r["valor"],
                                     origem=f"(derivado) via calc.py em {hoje}")
        emit({"resultados": resultados}, a.json,
             "\n\n".join(humano(r) if r["status"] != "sem_dado"
                         else f"{r['metrica']}: SEM DADO — faltam: {', '.join(r['faltantes'])}"
                         for r in resultados))
        return

    if not a.metrica:
        die_uso("informe uma métrica, --all ou --listar")
    try:
        r = resolver(a.metrica, canon, cat, memo)
    except DadoFaltante as e:
        print(f"não tenho esse dado — campos faltantes para '{e.metrica}':", file=sys.stderr)
        for c in e.faltantes:
            print(f"  - {c}  (preencher via /montar-gemeo ou skill /atualizar-* da fonte)",
                  file=sys.stderr)
        sys.exit(EXIT_DADO)
    if a.write and r.get("status") == "ok" and r.get("grava_em"):
        save_canon_field(cpath, r["grava_em"], r["valor"],
                         origem=f"(derivado) via calc.py em {datetime.date.today().isoformat()}")
    emit(r, a.json, humano(r))


if __name__ == "__main__":
    main()
