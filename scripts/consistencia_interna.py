#!/usr/bin/env python3
"""consistencia_interna.py — lint do repositório do gêmeo.

Verifica: links markdown internos quebrados, referências a pastas renomeadas,
menções desatualizadas a intervalos de pastas ("01–11"), slugs de perfil órfãos
no canon, e IDs duplicados (P/D/C/G).

Uso: consistencia_interna.py [--raiz PATH] [--json]   · exit 1 com quebras
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import yaml

from _gemeo_lib import EXIT_DADO, emit, get_path, load_yaml

LINK_RE = re.compile(r"\]\(([^)#http][^)#]*)\)")

# Arquivos-molde: existem para ser COPIADOS a um projeto-alvo, onde os links resolvem.
# Validá-los contra a árvore deste repo só produz falso positivo.
MOLDES = (
    "templates/",            # templates/CLAUDE.md e afins
    "/resources/templates/",  # moldes distribuídos dentro de skills
    "projetos.md",           # aponta para os repositórios irmãos do workspace
)
INTERVALO_RE = re.compile(r"\b01[–-]1[12]\b|pastas?\s+01\s*[–-]\s*1[12]")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--raiz", default=".")
    ap.add_argument("--json", action="store_true")
    a = ap.parse_args()
    raiz = Path(a.raiz).resolve()
    problemas: list[str] = []

    mds = [p for p in raiz.rglob("*.md")
           if ".git" not in p.parts and "node_modules" not in p.parts
           and "specs" not in p.parts and "evals/.runs" not in str(p)]

    # 1) links internos quebrados + 2) refs a pasta renomeada + 3) intervalos velhos
    for md in mds:
        txt = md.read_text(encoding="utf-8", errors="ignore")
        rel = md.relative_to(raiz)
        rel_txt = str(rel).replace("\\", "/")
        e_template = ("[PREENCHER" in txt or "TEMPLATE" in md.name.upper()
                      or any(m in "/" + rel_txt for m in MOLDES))
        for m in LINK_RE.finditer(txt):
            if e_template:
                break  # placeholders de template não são links reais
            alvo = m.group(1).strip().split(" ")[0]
            if (alvo.startswith(("http", "mailto:", "data:", "<", "$"))
                    or "{" in alvo or "[" in alvo):
                continue
            destino = (md.parent / alvo).resolve()
            if not destino.exists():
                problemas.append(f"link quebrado: {rel} → {alvo}")
        if re.search(r"(?<![\w/-])CONTABILIDADE/", txt) and "13-CONTABILIDADE" not in txt:
            problemas.append(f"ref antiga 'CONTABILIDADE/' (renomeada p/ 13-): {rel}")
        if INTERVALO_RE.search(txt):
            problemas.append(f"intervalo desatualizado (hoje 01–13; a 12 é AGENTES): {rel}")

    # 4) slugs de perfil órfãos (todo canon do repo, inclusive fixtures)
    for canon_f in raiz.rglob("00-CANON/canon.yaml"):
        canon = load_yaml(canon_f)
        team = canon_f.parent.parent / "08-PESSOAS" / "Team"
        for p in get_path(canon, "time") or []:
            slug = p.get("perfil_cognitivo")
            if slug and not ((team / slug).is_dir() or (team / f"perfil-{slug}.md").exists()):
                problemas.append(f"perfil órfão: {canon_f.relative_to(raiz)} → time[].{slug}")

    # 5) IDs duplicados por família
    ids: dict[str, list] = {}
    for pasta, prefixo in [("PROPOSTAS", "P"), ("DECISOES", "D"), ("CENARIOS", "C")]:
        for f in raiz.rglob(f"{pasta}/{prefixo}[0-9]*.md"):
            m = re.match(rf"({prefixo}\d+)", f.stem)
            if m:
                escopo = str(f.relative_to(raiz)).split(pasta)[0]  # por corpus
                ids.setdefault((escopo, m.group(1)), []).append(str(f.relative_to(raiz)))
    for (escopo, pid), arquivos in ids.items():
        if len(arquivos) > 1:
            problemas.append(f"id duplicado {pid} em {escopo}: {arquivos}")
    golden = raiz / "evals" / "golden.yaml"
    if golden.exists():
        gids = [g.get("id") for g in yaml.safe_load(golden.read_text(encoding="utf-8")) or []]
        dups = {g for g in gids if gids.count(g) > 1}
        for g in sorted(dups):
            problemas.append(f"id duplicado no golden: {g}")

    payload = {"problemas": problemas, "resultado": "ok" if not problemas else "quebras"}
    emit(payload, a.json,
         "consistência interna: OK — zero referências quebradas" if not problemas
         else "consistência interna: QUEBRAS\n" + "\n".join(f"  - {p}" for p in problemas))
    if problemas:
        sys.exit(EXIT_DADO)


if __name__ == "__main__":
    main()
