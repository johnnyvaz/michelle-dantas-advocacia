#!/usr/bin/env python3
"""sensibilidade.py — qual driver mais move uma métrica.

Perturba cada campo de entrada da métrica em ±N% (one-at-a-time) e ranqueia
por |impacto|. Campos compostos (financeiro.custos) são perturbados por
subcategoria — mostra, por exemplo, que folha domina o burn.

Uso: sensibilidade.py --metrica X [--variacao_pct 10] [--canon PATH] [--json]
"""

from __future__ import annotations

import argparse
import copy
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import calc as calcmod
from _gemeo_lib import canon_path, die_uso, emit, get_path, is_range, load_yaml, point_value


def fecho_campos(nome, cat, visto=None):
    visto = visto or set()
    if nome in visto or nome not in cat:
        return set()
    visto.add(nome)
    campos = set(cat[nome].get("campos", []))
    for dep in cat[nome].get("depende_de", []):
        campos |= fecho_campos(dep, cat, visto)
    return campos


def expande(canon, campo):
    """Campo dict (ex.: financeiro.custos) → sub-campos escalares."""
    v = get_path(canon, campo)
    if isinstance(v, dict) and not is_range(v):
        return [f"{campo}.{k}" for k, x in v.items()
                if isinstance(point_value(x), (int, float))]
    if isinstance(v, list):
        return []  # listas (clientes) não são perturbáveis ponto-a-ponto
    return [campo] if point_value(v) is not None else []


def set_path(d, dotted, val):
    node = d
    parts = dotted.split(".")
    for k in parts[:-1]:
        node = node[k]
    node[parts[-1]] = val


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--metrica", required=True)
    ap.add_argument("--variacao_pct", type=float, default=10.0)
    ap.add_argument("--canon")
    ap.add_argument("--json", action="store_true")
    a = ap.parse_args()

    cpath = canon_path(override=a.canon)
    canon = load_yaml(cpath)
    cat = load_yaml(calcmod.catalogo_path(cpath))

    try:
        base = calcmod.resolver(a.metrica, canon, cat, {})
    except calcmod.DadoFaltante as e:
        die_uso(f"métrica não computável: faltam {e.faltantes}")
    v0 = base.get("valor")
    if v0 is None:
        die_uso(f"métrica '{a.metrica}' sem valor base ({base.get('status')})")

    linhas_out, resultados = [], []
    alvos = []
    for campo in sorted(fecho_campos(a.metrica, cat)):
        alvos.extend(expande(canon, campo))
    for campo in sorted(set(alvos)):
        orig = point_value(get_path(canon, campo))
        if not isinstance(orig, (int, float)) or orig == 0:
            continue
        deltas = {}
        for sinal, fator in (("+", 1 + a.variacao_pct / 100), ("-", 1 - a.variacao_pct / 100)):
            c2 = copy.deepcopy(canon)
            set_path(c2, campo, orig * fator)
            try:
                r = calcmod.resolver(a.metrica, c2, cat, {})
                deltas[sinal] = (r.get("valor") - v0) if isinstance(r.get("valor"), (int, float)) else None
            except calcmod.DadoFaltante:
                deltas[sinal] = None
        imp = max((abs(d) for d in deltas.values() if d is not None), default=0)
        resultados.append({"driver": campo, "valor_atual": orig,
                           "delta_mais": round(deltas.get("+") or 0, 2),
                           "delta_menos": round(deltas.get("-") or 0, 2),
                           "impacto_abs": round(imp, 2)})
    resultados.sort(key=lambda r: -r["impacto_abs"])

    linhas_out.append(f"Sensibilidade de {a.metrica} (base = {v0}) a ±{a.variacao_pct}% por driver:")
    for r in resultados:
        linhas_out.append(f"  {r['driver']:45} {r['valor_atual']:>12} → "
                          f"+{a.variacao_pct:.0f}%: {r['delta_mais']:+10} · "
                          f"-{a.variacao_pct:.0f}%: {r['delta_menos']:+10}")
    emit({"metrica": a.metrica, "base": v0, "variacao_pct": a.variacao_pct,
          "ranking": resultados}, a.json, "\n".join(linhas_out))


if __name__ == "__main__":
    main()
