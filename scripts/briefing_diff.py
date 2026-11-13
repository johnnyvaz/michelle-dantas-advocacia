#!/usr/bin/env python3
"""briefing_diff.py — insumo do /briefing: o que mudou entre dois estados do canon.

Junta: diff de campos (antes/depois), alertas ativos, variância das métricas-chave,
propostas novas/pendentes e decisões cujos números justificadores desviaram.

Uso: briefing_diff.py [--de <ref>] [--para worktree|<ref>] [--canon PATH] [--json]
Default: --de HEAD --para worktree.
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import calc as calcmod
from _gemeo_lib import (canon_at_ref, canon_path, emit, get_path, load_yaml,
                        point_value, repo_root)


def achatar(d, prefixo=""):
    out = {}
    if isinstance(d, dict):
        from _gemeo_lib import is_range
        if is_range(d):
            out[prefixo] = d["provavel"]
            return out
        for k, v in d.items():
            out.update(achatar(v, f"{prefixo}.{k}" if prefixo else k))
    elif isinstance(d, list):
        out[prefixo + ".__len__"] = len(d)
    elif isinstance(d, (int, float)) and not isinstance(d, bool):
        out[prefixo] = d
    return out


def rodar(args):
    r = subprocess.run([sys.executable] + args, capture_output=True, text=True)
    try:
        return json.loads(r.stdout) if r.stdout.strip() else {}
    except json.JSONDecodeError:
        return {"raw": r.stdout[-500:]}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--de", default="HEAD")
    ap.add_argument("--para", default="worktree")
    ap.add_argument("--canon")
    ap.add_argument("--json", action="store_true")
    a = ap.parse_args()

    cpath = canon_path(override=a.canon)
    root = repo_root(Path.cwd())
    antigo = canon_at_ref(root, a.de, canon_file=cpath)
    novo = load_yaml(cpath) if a.para == "worktree" else canon_at_ref(root, a.para, canon_file=cpath)

    fa, fn = achatar(antigo), achatar(novo)
    mudancas = []
    for k in sorted(set(fa) | set(fn)):
        va, vn = fa.get(k), fn.get(k)
        if va != vn:
            mudancas.append({"campo": k, "antes": va, "depois": vn})

    sdir = str(Path(__file__).parent)
    alertas = rodar([f"{sdir}/alertas.py", "--canon", str(cpath),
                     "--baseline", a.de, "--json"]).get("alertas", [])
    variancia = rodar([f"{sdir}/variancia.py", "--de", a.de, "--para", a.para,
                       "--canon", str(cpath), "--json"]).get("mudancas", [])

    # propostas pendentes
    propostas_dir = cpath.parent.parent.parent / "gemeo" / "PROPOSTAS"
    if not propostas_dir.exists():
        propostas_dir = root / "gemeo" / "PROPOSTAS"
    pendentes = []
    for f in sorted(propostas_dir.glob("P*.md")):
        txt = f.read_text(encoding="utf-8")
        if "status: nova" in txt or "status: em_avaliacao" in txt:
            titulo = next((l.split(":", 1)[1].strip().strip('"') for l in txt.splitlines()
                           if l.startswith("titulo:")), f.stem)
            pendentes.append({"id": f.stem.split("-")[0], "titulo": titulo})

    # decisões com justificativa desviada
    decisoes_dir = propostas_dir.parent / "DECISOES"
    desviadas = []
    import yaml as _y
    for f in sorted(decisoes_dir.glob("D*.md")) if decisoes_dir.exists() else []:
        txt = f.read_text(encoding="utf-8")
        if txt.startswith("---"):
            fm = _y.safe_load(txt.split("---")[1]) or {}
            for cj in fm.get("campos_justificativa") or []:
                atual = point_value(get_path(novo, cj.get("campo", "")))
                epoca = cj.get("valor_na_epoca")
                if atual is not None and isinstance(epoca, (int, float)) and epoca:
                    if abs(atual - epoca) / max(abs(epoca), 1e-9) > 0.25:
                        desviadas.append({"decisao": fm.get("id", f.stem),
                                          "campo": cj["campo"],
                                          "na_epoca": epoca, "agora": atual})

    payload = {"de": a.de, "para": a.para, "mudancas": mudancas, "alertas": alertas,
               "variancia": variancia, "propostas_pendentes": pendentes,
               "decisoes_a_revisitar": desviadas}
    linhas = [f"briefing_diff {a.de} → {a.para}:",
              f"  {len(mudancas)} campo(s) mudaram · {len(alertas)} alerta(s) · "
              f"{len(pendentes)} proposta(s) pendente(s) · {len(desviadas)} decisão(ões) a revisitar"]
    for m in mudancas[:20]:
        linhas.append(f"    {m['campo']}: {m['antes']} → {m['depois']}")
    emit(payload, a.json, "\n".join(linhas))


if __name__ == "__main__":
    main()
