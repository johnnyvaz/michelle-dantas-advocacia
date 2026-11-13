#!/usr/bin/env python3
"""variancia.py — decompõe a mudança de métricas entre dois estados do canon.

Para cada métrica que mudou entre --de e --para (refs git, ou --para worktree),
atribui a variação por driver (one-at-a-time: recomputa a métrica trocando um
input de cada vez do estado antigo para o novo).

Uso: variancia.py --de <ref> [--para <ref>|worktree] [--metrica X] [--canon PATH] [--json]
"""

from __future__ import annotations

import argparse
import copy
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import calc as calcmod
from _gemeo_lib import (canon_at_ref, canon_path, die_uso, emit, get_path,
                        is_range, load_yaml, point_value, repo_root)
from sensibilidade import expande, fecho_campos, set_path

METRICAS_CHAVE = ["runway_meses", "burn_liquido_mensal", "ltv_cac", "top3_pct_do_mrr"]


def valor(metrica, canon, cat):
    try:
        r = calcmod.resolver(metrica, canon, cat, {})
        return r.get("valor")
    except calcmod.DadoFaltante:
        return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--de", required=True)
    ap.add_argument("--para", default="worktree")
    ap.add_argument("--metrica")
    ap.add_argument("--canon")
    ap.add_argument("--json", action="store_true")
    a = ap.parse_args()

    cpath = canon_path(override=a.canon)
    root = repo_root(cpath)
    antigo = canon_at_ref(root, a.de, canon_file=cpath)
    novo = load_yaml(cpath) if a.para == "worktree" else canon_at_ref(root, a.para, canon_file=cpath)
    cat = load_yaml(calcmod.catalogo_path(cpath))

    metricas = [a.metrica] if a.metrica else METRICAS_CHAVE
    saida, linhas = [], []
    for met in metricas:
        v0, v1 = valor(met, antigo, cat), valor(met, novo, cat)
        if v0 is None or v1 is None or abs(v1 - v0) < 0.005:
            continue
        contribs = []
        for campo in sorted({c for base in fecho_campos(met, cat)
                             for c in expande(novo, base)}):
            va, vn = point_value(get_path(antigo, campo)), point_value(get_path(novo, campo))
            if va is None or vn is None or abs((vn or 0) - (va or 0)) < 1e-9:
                continue
            c2 = copy.deepcopy(antigo)
            set_path(c2, campo, vn)
            vi = valor(met, c2, cat)
            if vi is not None:
                contribs.append({"driver": campo, "de": va, "para": vn,
                                 "contribuicao": round(vi - v0, 2)})
        contribs.sort(key=lambda c: -abs(c["contribuicao"]))
        saida.append({"metrica": met, "antes": v0, "depois": v1,
                      "delta": round(v1 - v0, 2), "por_driver": contribs})
        linhas.append(f"{met}: {v0} → {v1} (Δ {round(v1 - v0, 2)})")
        for c in contribs:
            linhas.append(f"    {c['driver']}: {c['de']} → {c['para']}  ⇒  Δ {c['contribuicao']:+}")

    if not saida:
        linhas = [f"nenhuma mudança nas métricas-chave entre {a.de} e {a.para}"]
    emit({"de": a.de, "para": a.para, "mudancas": saida}, a.json, "\n".join(linhas))


if __name__ == "__main__":
    main()
