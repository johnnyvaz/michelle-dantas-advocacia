#!/usr/bin/env python3
"""propostas.py — manutenção do backlog gemeo/PROPOSTAS/.

  propostas.py indexar                       → regenera INDEX.md
  propostas.py dedup --candidata FILE        → duplicada_de: <id> ou ok (+ proximo_id)
  propostas.py status <id> <novo> [--decisao DNNNN] [--fato-novo "..."]

Transições: nova → em_avaliacao → aceita|rejeitada.
aceita/rejeitada exigem --decisao; rejeitada→nova exige --fato-novo.
"""

from __future__ import annotations

import argparse
import datetime
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import yaml

from _gemeo_lib import EXIT_DADO, die_uso, emit, repo_root

VALIDAS = {"nova": {"em_avaliacao", "rejeitada"},
           "em_avaliacao": {"aceita", "rejeitada", "nova"},
           "rejeitada": {"nova"}, "aceita": set()}


def pasta() -> Path:
    return repo_root(Path.cwd()) / "gemeo" / "PROPOSTAS"


def frontmatter(f: Path) -> dict:
    txt = f.read_text(encoding="utf-8")
    if txt.startswith("---"):
        try:
            return yaml.safe_load(txt.split("---")[1]) or {}
        except yaml.YAMLError:
            return {}
    return {}


def todas():
    return sorted((f, frontmatter(f)) for f in pasta().glob("P[0-9]*.md"))


def campos_citados(texto: str) -> set:
    return set(re.findall(r"\[(?:canon|calc):\s*([a-z0-9_.]+)\]", texto))


def cmd_indexar(a):
    linhas = ["# PROPOSTAS — índice (gerado por scripts/propostas.py)", "",
              "| ID | Título | Dimensão | Status | Decisão |", "|----|--------|----------|--------|---------|"]
    for f, fm in todas():
        linhas.append(f"| {fm.get('id', f.stem)} | {fm.get('titulo', '?')} | "
                      f"{fm.get('dimensao', '?')} | {fm.get('status', '?')} | "
                      f"{fm.get('decisao_relacionada') or '—'} |")
    (pasta() / "INDEX.md").write_text("\n".join(linhas) + "\n", encoding="utf-8")
    print(f"INDEX.md regenerado ({len(todas())} propostas)")


def cmd_dedup(a):
    cand = Path(a.candidata)
    fm_c = frontmatter(cand)
    cit_c = campos_citados(cand.read_text(encoding="utf-8"))
    tit_c = set(re.findall(r"\w{4,}", (fm_c.get("titulo") or "").lower()))
    existentes = todas()
    for f, fm in existentes:
        if f.resolve() == cand.resolve():
            continue
        tit = set(re.findall(r"\w{4,}", (fm.get("titulo") or "").lower()))
        cit = campos_citados(f.read_text(encoding="utf-8"))
        sim_tit = len(tit_c & tit) / max(len(tit_c | tit), 1)
        sim_cit = len(cit_c & cit) / max(len(cit_c | cit), 1) if cit_c | cit else 0
        mesma_dim = fm.get("dimensao") == fm_c.get("dimensao")
        if mesma_dim and (sim_tit >= 0.5 or (sim_tit >= 0.3 and sim_cit >= 0.5)):
            bloqueia = fm.get("status") == "rejeitada" and not fm_c.get("fato_novo")
            emit({"duplicada_de": fm.get("id", f.stem), "status_existente": fm.get("status"),
                  "reabre_sem_fato_novo": bloqueia}, a.json,
                 f"DUPLICADA de {fm.get('id', f.stem)} (status {fm.get('status')})"
                 + (" — rejeitada: NÃO reapresentar sem fato_novo" if bloqueia else ""))
            sys.exit(EXIT_DADO if bloqueia else 0)
    n = max([int(re.match(r"P(\d+)", fm.get("id", "P0000")).group(1))
             for _, fm in existentes if re.match(r"P(\d+)", fm.get("id", ""))] or [0])
    emit({"duplicada_de": None, "proximo_id": f"P{n+1:04d}"}, a.json,
         f"ok — sem duplicata; próximo id: P{n+1:04d}")


def cmd_status(a):
    alvo = next(((f, fm) for f, fm in todas() if fm.get("id") == a.id), None)
    if not alvo:
        die_uso(f"proposta {a.id} não encontrada")
    f, fm = alvo
    atual = fm.get("status", "nova")
    if a.novo not in VALIDAS.get(atual, set()):
        die_uso(f"transição inválida: {atual} → {a.novo}")
    if a.novo in ("aceita", "rejeitada") and not a.decisao:
        die_uso(f"status '{a.novo}' exige --decisao DNNNN (registre o BDR primeiro)")
    if atual == "rejeitada" and a.novo == "nova" and not a.fato_novo:
        die_uso("reabrir proposta rejeitada exige --fato-novo \"...\"")
    txt = f.read_text(encoding="utf-8")
    txt = re.sub(r"^status:.*$", f"status: {a.novo}", txt, count=1, flags=re.M)
    if a.decisao:
        txt = re.sub(r"^decisao_relacionada:.*$", f"decisao_relacionada: {a.decisao}",
                     txt, count=1, flags=re.M)
    if a.fato_novo:
        txt = re.sub(r"^fato_novo:.*$", f'fato_novo: "{a.fato_novo} ({datetime.date.today()})"',
                     txt, count=1, flags=re.M)
    f.write_text(txt, encoding="utf-8")
    print(f"{a.id}: {atual} → {a.novo}" + (f" (decisão {a.decisao})" if a.decisao else ""))
    cmd_indexar(a)


def main():
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)
    s1 = sub.add_parser("indexar"); s1.add_argument("--json", action="store_true")
    s2 = sub.add_parser("dedup"); s2.add_argument("--candidata", required=True)
    s2.add_argument("--json", action="store_true")
    s3 = sub.add_parser("status"); s3.add_argument("id"); s3.add_argument("novo")
    s3.add_argument("--decisao"); s3.add_argument("--fato-novo", dest="fato_novo")
    s3.add_argument("--json", action="store_true")
    a = ap.parse_args()
    {"indexar": cmd_indexar, "dedup": cmd_dedup, "status": cmd_status}[a.cmd](a)


if __name__ == "__main__":
    main()
