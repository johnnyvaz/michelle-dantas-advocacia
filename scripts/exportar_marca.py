#!/usr/bin/env python3
"""exportar_marca.py — ponte entre gemeo/14-MARCA/ e PRODUCT.md / DESIGN.md da raiz.

A skill /impeccable (e outras ferramentas de design) leem `PRODUCT.md` (estratégico: registro,
usuários, personalidade, anti-referências, princípios, acessibilidade) e `DESIGN.md` (visual,
formato Google Stitch). O gêmeo é a FONTE: estes arquivos são gerados a partir de 14-MARCA/,
e `--importar` faz o caminho inverso para projetos que já os têm.

Uso:
  exportar_marca.py                 # gemeo/14-MARCA → PRODUCT.md + DESIGN.md na raiz
  exportar_marca.py --check         # só mostra o que seria escrito e as lacunas
  exportar_marca.py --importar      # PRODUCT.md + DESIGN.md → seções vazias de 14-MARCA
  opções: --raiz DIR (padrão: raiz do repo) · --force · --json

Regras:
  - Só exporta seção sem `[PREENCHER` (mesmo critério do completude.py); o resto é lacuna listada.
  - PRODUCT.md exige registro `brand` ou `product`; sem ele, não é escrito (exit 1).
  - Não sobrescreve PRODUCT.md/DESIGN.md que não foram gerados por este script, salvo --force.
  - Importar só preenche seção que ainda tem `[PREENCHER`; seção já preenchida e diferente é
    conflito listado (sobrescreve só com --force).

Exit: 0 ok · 1 lacuna que impede a escrita / conflito · 2 erro de uso
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from datetime import date
from pathlib import Path

PASTA = Path("gemeo") / "14-MARCA"
MARCA_GERADO = "<!-- gerado por scripts/exportar_marca.py a partir de gemeo/14-MARCA/ — edite lá, não aqui -->"
MARCA_IMPORTADO = "<!-- importado de DESIGN.md por scripts/exportar_marca.py"
REGISTROS = {"brand", "product"}

PLATAFORMA = "plataforma-de-marca.md"
VOZ = "voz-e-tom.md"
REFS = "referencias-e-anti-referencias.md"
SUPERF = "superficies.md"
ACESS = "acessibilidade.md"
VISUAL = "identidade-visual.md"

# Seção do PRODUCT.md → seções de 14-MARCA que a compõem (em ordem). Mapeamento 1:1 por
# subtítulo: com mais de uma origem, cada uma vira um `### <título>` e volta para o lugar
# certo no --importar. Round-trip sem perda é contrato (tests/test_exportar_marca.py).
PRODUCT = [
    ("Register", [(SUPERF, "Registro padrão")]),
    ("Users", [(SUPERF, "Usuário e tarefa por superfície")]),
    ("Product Purpose", [(PLATAFORMA, "Tese"), (PLATAFORMA, "Propósito, missão e visão")]),
    ("Brand Personality", [(PLATAFORMA, "Arquétipo"), (PLATAFORMA, "Personalidade em 3 palavras"),
                           (PLATAFORMA, "Emoções-alvo"), (VOZ, "Princípios de voz")]),
    ("Anti-references", [(REFS, "Anti-referências (com o que nunca parecer)")]),
    ("Design Principles", [(PLATAFORMA, "Princípios estratégicos de design e comunicação")]),
    ("Accessibility & Inclusion", [(ACESS, "Nível-alvo"), (ACESS, "Necessidades conhecidas do público"),
                                   (ACESS, "Regras")]),
]

H2 = re.compile(r"^## (.+?)\s*$")
H3 = re.compile(r"^### (.+?)\s*$")


# ------------------------------------------------------------------ seções markdown

def _span(linhas: list[str], titulo: str) -> tuple[int, int] | None:
    """(início do corpo, fim exclusivo) da seção `## titulo`; fim = próximo `## `."""
    ini = next((i for i, l in enumerate(linhas) if (m := H2.match(l)) and m.group(1) == titulo), None)
    if ini is None:
        return None
    fim = next((j for j in range(ini + 1, len(linhas)) if H2.match(linhas[j])), len(linhas))
    return ini + 1, fim


def _limpa(corpo: list[str]) -> str:
    """Tira brancos das pontas e o separador `---` que fecha a seção."""
    while corpo and not corpo[-1].strip():
        corpo = corpo[:-1]
    if corpo and corpo[-1].strip() == "---":
        corpo = corpo[:-1]
    return "\n".join(corpo).strip()


def ler_secao(texto: str, titulo: str) -> str | None:
    linhas = texto.splitlines()
    s = _span(linhas, titulo)
    return None if s is None else _limpa(linhas[s[0]:s[1]])


def gravar_secao(texto: str, titulo: str, corpo: str) -> str:
    linhas = texto.splitlines()
    s = _span(linhas, titulo)
    if s is None:
        raise KeyError(titulo)
    original = linhas[s[0]:s[1]]
    fecha = [l for l in original if l.strip()][-1:] == ["---"]
    novo = ["", *corpo.strip().splitlines(), ""] + (["---", ""] if fecha else [])
    return "\n".join(linhas[:s[0]] + novo + linhas[s[1]:]) + "\n"


def preenchida(corpo: str | None) -> bool:
    return bool(corpo) and "[PREENCHER" not in corpo


def secoes_h2(texto: str) -> dict[str, str]:
    out, atual, buf = {}, None, []
    for l in texto.splitlines():
        m = H2.match(l)
        if m:
            if atual:
                out[atual] = _limpa(buf)
            atual, buf = m.group(1), []
        elif atual:
            buf.append(l)
    if atual:
        out[atual] = _limpa(buf)
    return out


def secoes_h3(corpo: str) -> dict[str, str]:
    out, atual, buf = {}, None, []
    for l in corpo.splitlines():
        m = H3.match(l)
        if m:
            if atual:
                out[atual] = _limpa(buf)
            atual, buf = m.group(1), []
        elif atual:
            buf.append(l)
    if atual:
        out[atual] = _limpa(buf)
    return out


# ------------------------------------------------------------------ exportar

def montar_product(marca: Path) -> tuple[str | None, list[str]]:
    textos: dict[str, str] = {}
    lacunas: list[str] = []
    partes = ["# Product", "", MARCA_GERADO, ""]
    registro = None
    for secao, origens in PRODUCT:
        blocos = []
        for arq, titulo in origens:
            if arq not in textos:
                p = marca / arq
                textos[arq] = p.read_text(encoding="utf-8") if p.exists() else ""
            corpo = ler_secao(textos[arq], titulo)
            if not preenchida(corpo):
                lacunas.append(f"{PASTA / arq} § {titulo}")
                continue
            blocos.append((titulo, corpo))
        if secao == "Register":
            valor = blocos[0][1].strip().lower() if blocos else ""
            if valor in REGISTROS:
                registro = valor
                partes += ["## Register", "", registro, ""]
            elif blocos:
                lacunas.append(f"{PASTA / SUPERF} § Registro padrão: '{valor}' não é brand nem product")
            continue
        if not blocos:
            continue
        partes += [f"## {secao}", ""]
        if len(origens) == 1:
            partes += [blocos[0][1], ""]
        else:
            for titulo, corpo in blocos:
                partes += [f"### {titulo}", "", corpo, ""]
    return ("\n".join(partes).rstrip() + "\n") if registro else None, lacunas


def montar_design(marca: Path) -> tuple[str | None, list[str]]:
    p = marca / VISUAL
    if not p.exists():
        return None, [f"{PASTA / VISUAL} (ausente)"]
    texto = p.read_text(encoding="utf-8")
    if "[PREENCHER" in texto:
        return None, [f"{PASTA / VISUAL} (ainda tem [PREENCHER])"]
    fm, corpo = _frontmatter(texto)
    corpo = "\n".join(l for l in corpo.splitlines() if not l.startswith(MARCA_IMPORTADO)).strip()
    return f"{fm}{MARCA_GERADO}\n\n{corpo}\n", []


def _frontmatter(texto: str) -> tuple[str, str]:
    if texto.startswith("---\n"):
        fim = texto.find("\n---\n", 4)
        if fim != -1:
            return texto[:fim + 5], texto[fim + 5:]
    return "", texto


def _pode_escrever(destino: Path, force: bool) -> bool:
    if not destino.exists() or force:
        return True
    return MARCA_GERADO in destino.read_text(encoding="utf-8")


def exportar(raiz: Path, check: bool, force: bool) -> dict:
    marca = raiz / PASTA
    res = {"modo": "exportar", "escritos": [], "bloqueados": [], "lacunas": []}
    for nome, montar in (("PRODUCT.md", montar_product), ("DESIGN.md", montar_design)):
        conteudo, lacunas = montar(marca)
        res["lacunas"] += lacunas
        if conteudo is None:
            res["bloqueados"].append(f"{nome}: lacuna impede a geração")
            continue
        destino = raiz / nome
        if not _pode_escrever(destino, force):
            res["bloqueados"].append(f"{nome}: existe e não foi gerado por este script (use --importar ou --force)")
            continue
        if not check:
            destino.write_text(conteudo, encoding="utf-8")
        res["escritos"].append(nome)
    return res


# ------------------------------------------------------------------ importar

def importar(raiz: Path, check: bool, force: bool) -> dict:
    marca = raiz / PASTA
    res = {"modo": "importar", "escritos": [], "conflitos": [], "ignorados": []}
    textos: dict[str, str] = {}

    def gravar(arq: str, titulo: str, corpo: str, origem: str) -> None:
        if arq not in textos:
            textos[arq] = (marca / arq).read_text(encoding="utf-8")
        atual = ler_secao(textos[arq], titulo)
        if atual is None:
            res["ignorados"].append(f"{PASTA / arq} § {titulo}: seção não existe no template")
            return
        if preenchida(atual) and atual.strip() != corpo.strip() and not force:
            res["conflitos"].append(f"{PASTA / arq} § {titulo}: já preenchida e diferente de {origem}")
            return
        textos[arq] = gravar_secao(textos[arq], titulo, corpo)
        res["escritos"].append(f"{PASTA / arq} § {titulo}")

    prod = raiz / "PRODUCT.md"
    if prod.exists():
        h2 = secoes_h2(prod.read_text(encoding="utf-8"))
        mapa = dict(PRODUCT)
        for secao, corpo in h2.items():
            if secao not in mapa:
                res["ignorados"].append(f"PRODUCT.md § {secao}: sem lugar em 14-MARCA")
                continue
            if not corpo.strip():
                continue
            origens = mapa[secao]
            subs = secoes_h3(corpo) if len(origens) > 1 else {}
            casadas = [(a, t) for a, t in origens if t in subs]
            if casadas:
                for arq, titulo in casadas:
                    gravar(arq, titulo, subs[titulo], f"PRODUCT.md § {secao}")
            else:
                arq, titulo = origens[0]
                gravar(arq, titulo, corpo, f"PRODUCT.md § {secao}")

    design = raiz / "DESIGN.md"
    if design.exists():
        alvo = marca / VISUAL
        atual = alvo.read_text(encoding="utf-8") if alvo.exists() else ""
        fm, corpo = _frontmatter(design.read_text(encoding="utf-8"))
        corpo = "\n".join(l for l in corpo.splitlines() if l.strip() != MARCA_GERADO).strip()
        if "[PREENCHER" in atual or not atual or force:
            selo = f"{MARCA_IMPORTADO} em {date.today().isoformat()} -->"
            textos[VISUAL] = f"{fm}{selo}\n\n{corpo}\n"
            res["escritos"].append(f"{PASTA / VISUAL} (DESIGN.md inteiro)")
        else:
            _, corpo_atual = _frontmatter(atual)
            limpo = "\n".join(l for l in corpo_atual.splitlines()
                              if not l.startswith(MARCA_IMPORTADO)).strip()
            if limpo != corpo:
                res["conflitos"].append(f"{PASTA / VISUAL}: já preenchido e diferente de DESIGN.md")

    if not prod.exists() and not design.exists():
        res["ignorados"].append("nem PRODUCT.md nem DESIGN.md na raiz — nada a importar")
    if not check:
        for arq, txt in textos.items():
            (marca / arq).write_text(txt, encoding="utf-8")
    return res


# ------------------------------------------------------------------ CLI

def _humano(res: dict, check: bool) -> str:
    verbo = "seria escrito" if check else "escrito"
    linhas = [f"exportar_marca ({res['modo']}{', --check' if check else ''})"]
    linhas += [f"  ✓ {verbo}: {x}" for x in res["escritos"]]
    for chave, simbolo in (("bloqueados", "✘"), ("conflitos", "✘"), ("lacunas", "·"), ("ignorados", "·")):
        linhas += [f"  {simbolo} {chave[:-1] if chave.endswith('s') else chave}: {x}" for x in res.get(chave, [])]
    return "\n".join(linhas)


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--importar", action="store_true")
    ap.add_argument("--check", action="store_true")
    ap.add_argument("--force", action="store_true")
    ap.add_argument("--raiz", default=None)
    ap.add_argument("--json", action="store_true")
    a = ap.parse_args(argv)

    # Sem --raiz: sobe a partir do cwd até achar gemeo/ — instalado por plugin, o script
    # não mora dentro do projeto, então __file__ não serve de âncora.
    if a.raiz:
        raiz = Path(a.raiz).resolve()
    else:
        aqui = Path.cwd().resolve()
        raiz = next((c for c in [aqui, *aqui.parents] if (c / "gemeo").is_dir()), aqui)
    if not (raiz / PASTA).is_dir():
        print(f"ERRO de uso: {raiz / PASTA} não existe — o projeto ainda não tem 14-MARCA", file=sys.stderr)
        return 2

    res = (importar if a.importar else exportar)(raiz, a.check, a.force)
    print(json.dumps(res, ensure_ascii=False, indent=2) if a.json else _humano(res, a.check))
    falhou = res.get("bloqueados") or res.get("conflitos")
    return 1 if falhou and not res["escritos"] else 0


if __name__ == "__main__":
    sys.exit(main())
