#!/usr/bin/env python3
"""esqueleto_drift.py — detecta drift entre as skills do molde e o fixture do esqueleto.

O fixture `examples/esqueleto-fullstack/` foi gerado por skills. Se uma skill muda e o fixture
não é regenerado, o job `esqueleto` do CI passaria a validar um artefato velho. Dois mecanismos:

  (a) verbatim — o arquivo instalado é cópia byte a byte de um arquivo da skill: comparação direta.
  (b) hash     — o manifesto guarda o sha256 de `SKILL.md` e de cada arquivo de
                 `resources/`/`references/`; fonte mudou e manifesto não => reprova.

Limite honesto do (b): prova que alguém *reconheceu* a mudança, não que o artefato foi
regenerado corretamente; quem prova isso é o resto do job (unidade, contrato, e2e e gate).

Uso:
  esqueleto_drift.py --check    # exit 1 em divergência ("skill X / artefato Y")
  esqueleto_drift.py --update   # regrava os hashes (preserva `tabela` e as listas `verbatim`)

Manifesto: examples/esqueleto-fullstack/.skills-instaladas.json
  tabela: {skill: "a+b" | "b"}            (mantida à mão: qual mecanismo vale para a skill)
  skills: {skill: {verbatim: [{fixture, skill}], sha256_skill_md, arquivos: {rel: sha256}}}

Contrato: specs/006-esqueleto-fullstack/contracts/ci-job.md
Exit: 0 ok · 1 divergência · 2 erro de uso
"""

from __future__ import annotations

import argparse
import hashlib
import json
import sys
from pathlib import Path

RAIZ_PADRAO = Path(__file__).resolve().parents[1]
FIXTURE = Path("examples") / "esqueleto-fullstack"
MANIFESTO = FIXTURE / ".skills-instaladas.json"
SUBPASTAS = ("resources", "references")
MECANISMOS = {"a+b", "b"}


def _sha(p: Path) -> str:
    return hashlib.sha256(p.read_bytes()).hexdigest()


def _dir_skill(raiz: Path, nome: str) -> Path:
    return raiz / ".claude" / "skills" / nome


def _arquivos_da_skill(raiz: Path, nome: str) -> dict[str, str]:
    base = _dir_skill(raiz, nome)
    out: dict[str, str] = {}
    for sub in SUBPASTAS:
        for p in sorted((base / sub).rglob("*")) if (base / sub).is_dir() else []:
            if p.is_file():
                out[p.relative_to(base).as_posix()] = _sha(p)
    return out


def _carregar(raiz: Path) -> dict | None:
    p = raiz / MANIFESTO
    if not p.is_file():
        return None
    return json.loads(p.read_text())


def verificar(raiz: Path) -> list[str]:
    """Lista ordenada de divergências; vazia = sem drift."""
    m = _carregar(raiz)
    if m is None:
        return [f"manifesto ausente: {MANIFESTO.as_posix()} (rode --update)"]
    tabela = m.get("tabela", {})
    skills = m.get("skills", {})
    erros: list[str] = []

    for nome in sorted(set(skills) - set(tabela)):
        erros.append(f"skill {nome} / tabela: skill no manifesto sem mecanismo na tabela")
    for nome in sorted(set(tabela) - set(skills)):
        erros.append(f"skill {nome} / manifesto: skill na tabela sem entrada em skills")

    for nome in sorted(set(tabela) & set(skills)):
        mec, ent = tabela[nome], skills[nome]
        base = _dir_skill(raiz, nome)
        if mec not in MECANISMOS:
            erros.append(f"skill {nome} / tabela: mecanismo inválido {mec!r}")
            continue
        verb = ent.get("verbatim", [])
        if mec == "a+b" and not verb:
            erros.append(f"skill {nome} / verbatim: mecanismo a+b exige lista verbatim não vazia")
        if mec == "b" and verb:
            erros.append(f"skill {nome} / verbatim: mecanismo b não admite lista verbatim")
        if not (base / "SKILL.md").is_file():
            erros.append(f"skill {nome} / SKILL.md: skill ausente na fonte")
            continue

        for v in verb:
            fonte, inst = base / v["skill"], raiz / FIXTURE / v["fixture"]
            if not fonte.is_file():
                erros.append(f"skill {nome} / {v['skill']}: arquivo ausente na fonte")
            elif not inst.is_file():
                erros.append(f"skill {nome} / {v['fixture']}: verbatim ausente no fixture")
            elif fonte.read_bytes() != inst.read_bytes():
                erros.append(f"skill {nome} / {v['fixture']}: verbatim divergente de {v['skill']}")

        if ent.get("sha256_skill_md") != _sha(base / "SKILL.md"):
            erros.append(f"skill {nome} / SKILL.md: hash difere do manifesto (rode --update após reinstalar no fixture)")
        atuais, salvos = _arquivos_da_skill(raiz, nome), ent.get("arquivos", {})
        for rel in sorted(set(atuais) | set(salvos)):
            if rel not in atuais:
                erros.append(f"skill {nome} / {rel}: removido da fonte")
            elif rel not in salvos:
                erros.append(f"skill {nome} / {rel}: arquivo novo fora do manifesto")
            elif atuais[rel] != salvos[rel]:
                erros.append(f"skill {nome} / {rel}: hash difere do manifesto")
    return sorted(erros)


def atualizar(raiz: Path) -> None:
    """Regrava hashes. `tabela` e `verbatim` são declarações humanas: não são tocadas."""
    m = _carregar(raiz)
    if m is None:
        raise SystemExit(f"manifesto ausente: crie {MANIFESTO.as_posix()} com `tabela` e `skills`")
    skills = m.setdefault("skills", {})
    for nome in m.get("tabela", {}):
        ent = skills.setdefault(nome, {})
        base = _dir_skill(raiz, nome)
        if not (base / "SKILL.md").is_file():
            raise SystemExit(f"skill {nome}: SKILL.md ausente em {base}")
        ent.setdefault("verbatim", [])
        ent["sha256_skill_md"] = _sha(base / "SKILL.md")
        ent["arquivos"] = _arquivos_da_skill(raiz, nome)
    (raiz / MANIFESTO).write_text(json.dumps(m, indent=2, sort_keys=True, ensure_ascii=False) + "\n")


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    g = ap.add_mutually_exclusive_group(required=True)
    g.add_argument("--check", action="store_true")
    g.add_argument("--update", action="store_true")
    ap.add_argument("--raiz", type=Path, default=RAIZ_PADRAO)
    a = ap.parse_args(argv)
    if a.update:
        atualizar(a.raiz)
        print(f"manifesto regravado: {MANIFESTO.as_posix()}")
        return 0
    erros = verificar(a.raiz)
    for e in erros:
        print(f"DRIFT {e}")
    if erros:
        print(f"{len(erros)} divergência(s) entre skills e fixture", file=sys.stderr)
        return 1
    print("sem drift: skills e fixture em dia")
    return 0


if __name__ == "__main__":
    sys.exit(main())
