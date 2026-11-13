#!/usr/bin/env python3
"""Onde faltam datas: blocos e itens de tasks/*.md, com e sem prazo.

Serve para dimensionar a sessão de datas antes de começar a perguntar — e, depois dela, para
ver o que ficou sem compromisso de propósito. Não escreve nada.

Uso:
  python3 mapa-prazos.py                 # o projeto do diretório atual
  python3 mapa-prazos.py --todos         # todos os projetos irmãos com tasks/
  python3 mapa-prazos.py <dir> [<dir>…]  # projetos específicos
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

FILAS_PADRAO = ("backlog.md", "bugs.md", "features.md")
TASK = re.compile(r"^- \[[ /]\]")
HEAD = re.compile(r"^(#{2,4})\s+(.*)$")
PRAZO = re.compile(r"🎯\s*(\d{4}-\d{2}-\d{2})")
PRAZO_BLOCO = re.compile(r"^\*\*(?:Prazo|Entrega)\:?\*\*\s*:?\s*(?:🎯\s*)?(\d{4}-\d{2}-\d{2})")
FILA_DECLARADA = re.compile(r"^\s*([A-Za-z0-9_.-]+\.md)\s*:\s*(.*?)\s*$")


def analisa(tdir: Path, arquivos: tuple[str, ...] = FILAS_PADRAO) -> list[dict]:
    """Um registro por bloco, com a herança hierárquica do parser (### herda do ##)."""
    blocos: list[dict] = []
    for nome in arquivos:
        f = tdir / nome
        if not f.exists():
            continue
        prazos: dict[int, str] = {}
        atual: dict | None = None
        nivel = 1
        dentro_fence = False
        for ln in f.read_text(encoding="utf-8").splitlines():
            # Exemplo em bloco de código não é conteúdo — o parser também o neutraliza.
            if ln.lstrip().startswith(("```", "~~~")):
                dentro_fence = not dentro_fence
                continue
            if dentro_fence:
                continue
            mh = HEAD.match(ln)
            if mh:
                nivel = len(mh.group(1))
                for n in [k for k in prazos if k >= nivel]:
                    del prazos[n]
                pb = PRAZO.search(ln)
                if pb:
                    prazos[nivel] = pb.group(1)
                atual = {"arquivo": nome, "bloco": mh.group(2).strip(), "nivel": nivel,
                         "itens": 0, "datados": 0, "robo": "🤖" in ln,
                         "prazo": prazos.get(max(prazos)) if prazos else None}
                blocos.append(atual)
                continue
            pb = PRAZO_BLOCO.match(ln)
            if pb:
                prazos[nivel] = pb.group(1)
                if atual:
                    atual["prazo"] = pb.group(1)
                continue
            if TASK.match(ln) and atual:
                atual["itens"] += 1
                herdado = prazos.get(max(prazos)) if prazos else None
                if PRAZO.search(ln) or herdado:
                    atual["datados"] += 1
                if "🤖" in ln:
                    atual.setdefault("itens_robo", 0)
                    atual["itens_robo"] += 1
    return [b for b in blocos if b["itens"]]


FECHADO = ("✅ aprovado", "❌ rejeitado", "🚀 executado")


def filas_humanas(tdir: Path) -> list[tuple[str, str]]:
    """Filas humanas declaradas em `.filas.yaml`, com fallback para `human.md` legado."""
    config = tdir / ".filas.yaml"
    declaradas: list[tuple[str, str]] = []
    if config.exists():
        for linha in config.read_text(encoding="utf-8").splitlines():
            m = FILA_DECLARADA.match(linha)
            if not m:
                continue
            nome, pessoa = m.groups()
            # O contrato aceita nomes simples ou entre aspas. Comentário depois do valor
            # não faz parte do nome da pessoa.
            pessoa = re.split(r"\s+#", pessoa, maxsplit=1)[0].strip().strip("'\"")
            declaradas.append((nome, pessoa or nome.removesuffix(".md")))
    if declaradas:
        return declaradas
    return [("human.md", "dono")] if (tdir / "human.md").exists() else []


def usa_checkboxes(arquivo: Path) -> bool:
    """Distingue o dialeto checkbox do dialeto legado de itens em `###`."""
    dentro_fence = False
    for linha in arquivo.read_text(encoding="utf-8").splitlines():
        if linha.lstrip().startswith(("```", "~~~")):
            dentro_fence = not dentro_fence
            continue
        if not dentro_fence and TASK.match(linha):
            return True
    return False


def analisa_human(tdir: Path, nome: str = "human.md") -> list[dict]:
    """Fila humana no dialeto legado, com item em heading e prazo herdado da seção.

    Fica fora de `analisa` porque esse dialeto não usa checkbox: cada item é um heading
    `### H-0xx` com uma linha `**Estado:**`. Sem isto o mapa esconderia justamente os
    compromissos do dono — no DATA-DOSSIE, 4 dos 45 itens datados.
    """
    f = tdir / nome
    if not f.exists():
        return []
    blocos: list[dict] = []
    atual: dict | None = None
    item: list[str] | None = None
    prazo_secao: str | None = None
    dentro_fence = False

    def fecha_item() -> None:
        if not (atual and item):
            return
        texto = "\n".join(item)
        if any(m in texto for m in FECHADO):     # já resolvido: não é fila
            return
        atual["itens"] += 1
        if PRAZO.search(texto) or prazo_secao:
            atual["datados"] += 1

    for ln in f.read_text(encoding="utf-8").splitlines():
        if ln.lstrip().startswith(("```", "~~~")):
            dentro_fence = not dentro_fence
            continue
        if dentro_fence:
            continue
        if ln.startswith("## "):
            fecha_item()
            item = None
            pb = PRAZO.search(ln)
            prazo_secao = pb.group(1) if pb else None
            atual = {"arquivo": nome, "bloco": ln[3:].strip(), "nivel": 2,
                     "itens": 0, "datados": 0, "robo": False, "prazo": prazo_secao}
            blocos.append(atual)
            continue
        pb = PRAZO_BLOCO.match(ln)
        if pb and item is None:
            prazo_secao = pb.group(1)
            if atual:
                atual["prazo"] = prazo_secao
            continue
        if ln.startswith("### "):
            fecha_item()
            item = [ln]
            continue
        if item is not None:
            item.append(ln)
    fecha_item()
    return [b for b in blocos if b["itens"]]


def mostra(raiz: Path) -> tuple[int, int]:
    tdir = raiz / "tasks"
    humanas = [(nome, pessoa) for nome, pessoa in filas_humanas(tdir)
               if (tdir / nome).is_file() and nome not in FILAS_PADRAO]
    humanas_checkbox = tuple(nome for nome, _ in humanas if usa_checkboxes(tdir / nome))
    humanas_heading = tuple(nome for nome, _ in humanas if nome not in humanas_checkbox)
    blocos = analisa(tdir, FILAS_PADRAO + humanas_checkbox)
    for nome in humanas_heading:
        blocos += analisa_human(tdir, nome)
    if not blocos:
        return 0, 0
    print(f"\n━━━ {raiz.name} ━━━")
    itens = datados = 0
    for b in blocos:
        itens += b["itens"]
        datados += b["datados"]
        falta = b["itens"] - b["datados"]
        marca = "✓" if falta == 0 else " "
        robo = " 🤖" if b["robo"] or b.get("itens_robo") == b["itens"] else ""
        # Bloco sem `**Prazo:**` cujos itens têm `🎯` na linha não é "sem prazo": dizer isso
        # mandaria datar de novo o que já está datado.
        if b["prazo"]:
            prazo = f"🎯 {b['prazo']}"
        elif falta == 0:
            prazo = "itens c/ 🎯"
        elif b["datados"]:
            prazo = f"parcial {b['datados']}/{b['itens']}"
        else:
            prazo = "sem prazo"
        print(f"  {marca} {b['arquivo']:11} {prazo:15} {b['itens']:3} itens"
              f"{f' ({falta} sem data)' if falta else '':16}{robo}  {b['bloco'][:52]}")
    print(f"  → {datados}/{itens} itens com prazo em {len(blocos)} blocos")
    # A contagem do dialeto por heading pode divergir do `humano_pendentes` que o painel
    # mostra: lá o número sai do parser canônico (`prioridade.py:parse_human`), que resolve
    # dialetos e sub-headings. Aqui serve para orientar onde faltam datas, não para auditar.
    return itens, datados


def encontra_projeto(inicio: Path | None = None) -> Path:
    """Projeto mais próximo do cwd; independe de a skill estar local ou em plugin."""
    atual = (inicio or Path.cwd()).resolve()
    for candidato in (atual, *atual.parents):
        if (candidato / "tasks").is_dir():
            return candidato
    raise SystemExit("ERRO: nenhum diretório tasks/ encontrado no diretório atual ou em seus pais")


def main() -> int:
    args = [a for a in sys.argv[1:] if not a.startswith("-")]
    todos = "--todos" in sys.argv
    if args:
        dirs = [Path(a).resolve() for a in args]
    else:
        projeto = encontra_projeto()
        if todos:
            dirs = sorted(d for d in projeto.parent.iterdir() if (d / "tasks").is_dir())
        else:
            dirs = [projeto]

    tot = dat = 0
    for d in dirs:
        i, x = mostra(d)
        tot += i
        dat += x
    if len(dirs) > 1:
        print(f"\n═══ TOTAL: {dat}/{tot} itens com prazo ═══")
        print("Contagem para orientar a sessão de datas; o número canônico de cada projeto sai")
        print("de `python3 scripts/prioridade.py all --emit-json`.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
