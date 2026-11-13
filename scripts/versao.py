#!/usr/bin/env python3
"""versao.py — coerência entre tag, CHANGELOG e manifestos dos plugins.

O repositório distribui 5 plugins por um marketplace privado e nunca cortou uma versão:
zero tags e um `[Unreleased]` parado. Na prática, um projeto instalado por plugin não
consegue dizer qual versão tem, nem voltar atrás.

Este script é o gate da parte que não depende de decisão nenhuma: **não existe release
sem entrada no CHANGELOG**, e os manifestos não podem divergir do marketplace. A regra vem
do release do newsjack, que recusa publicar tag sem notas.

Sobre declarar `version` nos manifestos: hoje os plugins não declaram, e o CLAUDE.md trata
isso como recurso — sem `version`, a atualização segue o SHA e é automática. Fixar versão
traz rollback e custa esse automatismo. Enquanto a escolha não for feita, `--check` valida
o que existe e avisa; com `--versao X.Y.Z`, confere que todos os manifestos declaram
exatamente essa versão.

Uso:
  versao.py --check [--versao X.Y.Z] [--json]

Exit: 0 ok · 1 incoerência · 2 uso.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
MARKETPLACE = RAIZ / ".claude-plugin" / "marketplace.json"
PLUGINS = RAIZ / "plugins"
CHANGELOG = RAIZ / "CHANGELOG.md"

SEMVER = re.compile(r"^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$")


def secoes_changelog() -> list[str]:
    txt = CHANGELOG.read_text(encoding="utf-8")
    return re.findall(r"(?m)^##\s*\[?([^\]\s]+)\]?", txt)


def manifestos() -> dict[str, dict]:
    out = {}
    for p in sorted(PLUGINS.iterdir()):
        m = p / ".claude-plugin" / "plugin.json"
        if m.is_file():
            out[p.name] = json.loads(m.read_text(encoding="utf-8"))
    return out


def checar(versao: str | None) -> list[str]:
    problemas: list[str] = []
    mk = json.loads(MARKETPLACE.read_text(encoding="utf-8"))
    listados = {p["name"]: p for p in mk.get("plugins", [])}
    manif = manifestos()

    # 1) todo plugin em disco está no marketplace, e vice-versa
    for nome in set(manif) - set(listados):
        problemas.append(f"plugin {nome} existe em plugins/ mas não está no marketplace")
    for nome in set(listados) - set(manif):
        problemas.append(f"marketplace lista {nome}, que não existe em plugins/")

    # 2) nome do manifesto bate com o do marketplace
    for nome, m in manif.items():
        if m.get("name") != nome:
            problemas.append(f"{nome}: manifesto se chama {m.get('name')!r}")

    # 3) se alguém declarou version, todos têm de declarar — meia adoção é pior que nenhuma
    declaram = {n: m["version"] for n, m in manif.items() if m.get("version")}
    if declaram and len(declaram) != len(manif):
        faltam = sorted(set(manif) - set(declaram))
        problemas.append(f"version declarada só em alguns plugins; faltam: {', '.join(faltam)}")
    for nome, v in declaram.items():
        if not SEMVER.match(str(v)):
            problemas.append(f"{nome}: version {v!r} não é semver")
        alvo = listados.get(nome, {}).get("version")
        if alvo and str(alvo) != str(v):
            problemas.append(f"{nome}: manifesto {v} ≠ marketplace {alvo}")

    # 4) o gate que independe de tudo: release exige nota no CHANGELOG
    if versao:
        if not SEMVER.match(versao):
            problemas.append(f"versão pedida não é semver: {versao}")
        secs = secoes_changelog()
        if versao not in secs and f"v{versao}" not in secs:
            problemas.append(f"CHANGELOG.md não tem seção para {versao} — "
                             "renomeie [Unreleased] antes de cortar a tag")
        for nome, m in manif.items():
            if str(m.get("version") or "") != versao:
                problemas.append(f"{nome}: manifesto em {m.get('version')!r}, tag pede {versao}")
    return problemas


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--check", action="store_true")
    ap.add_argument("--versao")
    ap.add_argument("--json", action="store_true")
    a = ap.parse_args()
    if not a.check:
        ap.print_help()
        return 2

    problemas = checar(a.versao)
    manif = manifestos()
    sem_versao = [n for n, m in manif.items() if not m.get("version")]

    if a.json:
        print(json.dumps({"ok": not problemas, "problemas": problemas,
                          "plugins": len(manif), "sem_version": sem_versao},
                         ensure_ascii=False, indent=2))
    elif problemas:
        print("✘ incoerência de versão:")
        for p in problemas:
            print(f"    {p}")
    else:
        print(f"✓ {len(manif)} plugin(s) coerentes com o marketplace")
        if sem_versao and not a.versao:
            print("  nota: nenhum manifesto declara `version` — a atualização segue o SHA "
                  "(automática, sem rollback). Decisão registrada no CLAUDE.md.")
    return 1 if problemas else 0


if __name__ == "__main__":
    sys.exit(main())
