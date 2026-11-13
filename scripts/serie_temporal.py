#!/usr/bin/env python3
"""serie_temporal.py — histórico de um campo do canon via git log.

Percorre os commits que tocaram o canon.yaml e extrai (data_referencia, valor, sha).

Uso: serie_temporal.py --campo <path.do.canon|metrica> [--desde AAAA-MM] [--canon PATH] [--json]
"""

from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path

import yaml

sys.path.insert(0, str(Path(__file__).parent))
import calc as calcmod
from _gemeo_lib import canon_path, die_uso, emit, get_path, load_yaml, point_value


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--campo", required=True)
    ap.add_argument("--desde")
    ap.add_argument("--canon")
    ap.add_argument("--json", action="store_true")
    a = ap.parse_args()

    cpath = canon_path(override=a.canon).resolve()
    top = Path(subprocess.run(["git", "rev-parse", "--show-toplevel"],
                              capture_output=True, text=True, cwd=cpath.parent
                              ).stdout.strip())
    rel = cpath.relative_to(top).as_posix()
    log = subprocess.run(["git", "-C", str(top), "log", "--format=%h %cs", "--", rel],
                         capture_output=True, text=True).stdout.strip().splitlines()
    if not log:
        die_uso(f"sem histórico git para {rel}")

    cat = load_yaml(calcmod.catalogo_path(cpath))
    serie = []
    for linha in reversed(log):  # cronológico
        sha, data_commit = linha.split()
        if a.desde and data_commit < a.desde:
            continue
        raw = subprocess.run(["git", "-C", str(top), "show", f"{sha}:{rel}"],
                             capture_output=True, text=True)
        if raw.returncode != 0:
            continue
        canon = yaml.safe_load(raw.stdout) or {}
        if a.campo in cat:
            try:
                v = calcmod.resolver(a.campo, canon, cat, {}).get("valor")
            except calcmod.DadoFaltante:
                v = None
        else:
            v = point_value(get_path(canon, a.campo))
        ref = get_path(canon, "_meta.data_referencia")
        serie.append({"commit": sha, "data_commit": data_commit,
                      "data_referencia": str(ref) if ref else None, "valor": v})

    linhas = [f"série temporal de {a.campo} ({len(serie)} pontos):"]
    for p in serie:
        linhas.append(f"  {p['data_referencia'] or p['data_commit']}  {p['valor']}  ({p['commit']})")
    emit({"campo": a.campo, "serie": serie}, a.json, "\n".join(linhas))


if __name__ == "__main__":
    main()
