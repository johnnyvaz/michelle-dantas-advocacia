#!/usr/bin/env python3
"""Acha referência pendurada: caminho do repositório citado em documento e inexistente.

Regra que motivou o script (spec 005, FR-030): em 2026-09-09 três arquivos apontavam
para artefatos que não existiam — `tasks/human.md` citava a allowlist, `.claude/rules/
pentest.md` citava o ROE e `AGENTS.md` apontava para o plano da spec 004. Regra que
aponta para arquivo ausente não governa nada, e três casos em três arquivos é padrão,
não acidente.

Uso:
    python3 scripts/verificar_referencias.py            # relatório humano
    python3 scripts/verificar_referencias.py --json     # para o coletor da catraca

Saída: 0 sem referência pendurada, 1 com. `--json` sempre sai 0 (quem decide é a catraca).
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent

# Onde procurar. Documento que governa comportamento, não código.
# FR-030 é sobre REGRA: "nenhuma regra do repositório pode referenciar artefato de
# governança inexistente". Regra é o documento que governa o comportamento AGORA —
# `.claude/rules/`, `CLAUDE.md`, `AGENTS.md`. Fila (`tasks/`) e spec descrevem TRABALHO,
# e referência para frente ali é normal, não defeito: um `tasks.md` cita por definição
# os arquivos que as fases ainda vão criar. Varrer os dois produzia 46 achados dos quais
# 43 eram trabalho planejado — o oposto de um sinal.
FONTES = (
    ".claude/rules/*.md",
    "CLAUDE.md",
    "AGENTS.md",
)

IGNORADAS = RAIZ / "scripts/qualidade/referencias-ignoradas.txt"

# Um trecho em crase é candidato a caminho SÓ quando é caminho de verdade: começa por
# um diretório de topo conhecido e tem barra. Nome de arquivo solto em prosa
# (`tasks.md`, `canon.yaml`) é NOME, não caminho — tratá-lo como caminho de raiz produzia
# 152 achados, dos quais 148 eram ruído, e um detector que grita assim é ignorado.
TOPO = (
    "packages/", "scripts/", "specs/", ".specify/", ".claude/", ".github/",
    "infra/", "gemeo/", "tasks/", "docs/",
)
# Marcador de gabarito: o documento fala do FORMATO do caminho, não de um arquivo.
PLACEHOLDER = re.compile(r"<[^>]*>|NNN|\{[^}]*\}|\.\.\.")
CRASE = re.compile(r"`([^`\n]+)`")
CERCA = re.compile(r"^\s*```")


def candidato(trecho: str) -> str | None:
    """Devolve o caminho normalizado, ou None se o trecho não é um caminho do repo."""
    bruto = trecho.strip()
    if not bruto or " " in bruto or bruto.startswith(("http", "-", "$", "#", "@", "/")):
        return None
    # `arquivo.ts:143`, `arquivo.ts:143-150`, `arquivo.py:main` e `common.sh:funcao()`
    # citam um ponto DENTRO do arquivo; o alvo da verificação é o arquivo.
    caminho = re.sub(r":[\w.()-]+$", "", bruto).rstrip("/")
    if not caminho:
        return None
    if not caminho.startswith(TOPO) or "/" not in caminho:
        return None
    if PLACEHOLDER.search(caminho):
        return None
    return caminho


def existe(caminho: str) -> bool:
    if any(c in caminho for c in "*?["):
        return any(RAIZ.glob(caminho))
    return (RAIZ / caminho).exists()


def carregar_ignoradas() -> set[str]:
    if not IGNORADAS.exists():
        return set()
    itens = set()
    for linha in IGNORADAS.read_text(encoding="utf-8").splitlines():
        limpa = linha.strip()
        if not limpa or limpa.startswith("#"):
            continue
        # Formato: <caminho> <espaço> <motivo>. O motivo é obrigatório e fica versionado.
        itens.add(limpa.split(maxsplit=1)[0])
    return itens


def varrer() -> list[dict[str, str]]:
    ignoradas = carregar_ignoradas()
    achados: list[dict[str, str]] = []
    vistos: set[tuple[str, str]] = set()

    for padrao in FONTES:
        for arquivo in sorted(RAIZ.glob(padrao)):
            relativo = arquivo.relative_to(RAIZ).as_posix()
            dentro_da_cerca = False
            for numero, linha in enumerate(arquivo.read_text(encoding="utf-8").splitlines(), 1):
                # Bloco cercado é ilustrativo por natureza: caminho de exemplo ali não
                # é referência do documento, e reportá-lo encheria o arquivo de exceções.
                if CERCA.match(linha):
                    dentro_da_cerca = not dentro_da_cerca
                    continue
                if dentro_da_cerca:
                    continue
                for trecho in CRASE.findall(linha):
                    caminho = candidato(trecho)
                    if caminho is None or caminho in ignoradas or existe(caminho):
                        continue
                    chave = (relativo, caminho)
                    if chave in vistos:
                        continue
                    vistos.add(chave)
                    achados.append({"local": f"{relativo}:{numero}", "caminho": caminho})
    return achados


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--json", action="store_true", help="saída para o coletor da catraca")
    args = parser.parse_args()

    achados = varrer()

    if args.json:
        print(json.dumps({"total": len(achados), "achados": achados}, ensure_ascii=False))
        return 0

    if not achados:
        print("Nenhuma referência pendurada.")
        return 0

    print(f"{len(achados)} referência(s) pendurada(s):\n")
    for achado in achados:
        print(f"  {achado['local']}  →  {achado['caminho']}")
    print(
        "\nCorrija o caminho, crie o artefato, ou declare a exceção com o motivo em"
        f"\n{IGNORADAS.relative_to(RAIZ)}"
    )
    return 1


if __name__ == "__main__":
    sys.exit(main())
