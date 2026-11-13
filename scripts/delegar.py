#!/usr/bin/env python3
"""Semeia filas humanas por pessoa nos projetos, a partir de um mapa declarativo.

Por que existe: até 2026-08-21 a delegação da PH3A vivia em três arquivos mantidos à mão na
raiz do workspace (`delegar.md`, as seções DELEGUE de `LISTA-DE-TAREFAS.md` e o
`PRIORIDADES-DALVANI.md`) — fora do sistema de tarefas, e por isso invisível ao motor de
prioridade, ao painel e ao cofre. O mecanismo de fila por pessoa já existia
(`tasks/.filas.yaml`, lido por `prioridade.py:filas_humanas` e `obsidian-panel.js:filasHumanas`)
e só estava em uso na plataforma-cursos. Este script liga o mecanismo nos projetos PH3A.

**O mapa é ENTRADA, não registro.** Depois de aplicado, quem manda é `tasks/<pessoa>.md` no
repositório: a pessoa responde na própria linha e o agente lê de lá. Por isso o script é
APPEND-ONLY e idempotente por título — nunca reescreve nem remove item que já está na fila.
Se sobrescrevesse, a resposta dada pela pessoa seria apagada no run seguinte, e a delegação
voltaria a ter duas fontes de verdade — o problema que ele existe para resolver.

Tirar item da fila é ato humano: marque `[x]` (feito) ou `[-]` (cancelado) no arquivo da
pessoa. Apagar a linha do YAML não remove nada.

Por que `.filas.yaml` é escrito em TODO projeto com `tasks/`, e não só nos que têm delegação:
`obsidian-index.js` resolve o dono com o PRIMEIRO `dono` não-nulo que encontra entre os
projetos e compara com a pessoa de cada item. Declarar `_dono: Johnny` em alguns repos e
deixar os outros no default (a string literal `"dono"`) faz o Foco de Hoje listar as decisões
do próprio Johnny como "👤 Aguardando dono" em vez de "🙋 Suas decisões".

Uso:
  python3 scripts/delegar.py <mapa.yaml>                 # dry-run (padrão)
  python3 scripts/delegar.py <mapa.yaml> --apply
  python3 scripts/delegar.py <mapa.yaml> --apply --so DATA-DOSSIE --so SGSI
"""
import datetime
import re
import sys
import unicodedata
from pathlib import Path

HOJE = datetime.date.today().isoformat()

SEVERIDADE = {"alta": "🔺 alta", "media": "🔼 média", "média": "🔼 média", "baixa": "🔽 baixa"}
# Ordem fixa dos marcadores — o parser aceita qualquer ordem, mas a ordem fixa é o que mantém
# a linha legível e o diff limpo (tasks/README.md).
SUB_LABELS = ("contexto", "local", "acao", "bloqueado_por", "efeito")
ROTULO = {"contexto": "Contexto", "local": "Local", "acao": "Ação",
          "bloqueado_por": "Bloqueado por", "efeito": "Efeito"}


def erro(msg: str) -> None:
    print(f"✗ {msg}", file=sys.stderr)
    sys.exit(1)


def slug_arquivo(pessoa: str) -> str:
    """Nome do arquivo da fila. 'Fabio Melo' → 'fabio-melo.md'."""
    base = unicodedata.normalize("NFKD", pessoa).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", base.lower()).strip("-") + ".md"


def yaml_raso(texto: str) -> dict:
    """Lê o subconjunto de YAML deste mapa: escalares, mapas aninhados e listas de mapas.

    Sem PyYAML de propósito: o script roda em N repos que não compartilham virtualenv, e
    `prioridade.py`/`obsidian-panel.js` leem o `.filas.yaml` do mesmo jeito (uma linha por
    chave). Se um dia o mapa precisar de mais que isto, é sinal de que virou registro — e
    registro é o `tasks/<pessoa>.md`, não o mapa.

    Exige que todo filho seja MAIS indentado que a chave que o abre (inclusive itens de
    lista) — o estilo compacto `chave:\n- item` na mesma coluna não é aceito, e o erro diz
    a linha em vez de montar uma árvore errada em silêncio.
    """
    raiz: dict = {}
    pilha: list[tuple[int, object]] = [(-1, raiz)]
    linhas = texto.splitlines()

    for n, linha in enumerate(linhas, 1):
        if not linha.strip() or linha.lstrip().startswith("#"):
            continue
        ind = len(linha) - len(linha.lstrip())
        corpo = linha.strip()
        item_lista = corpo.startswith("- ")
        if item_lista:
            corpo = corpo[2:].strip()

        while len(pilha) > 1 and pilha[-1][0] >= ind:
            pilha.pop()
        pai = pilha[-1][1]

        if item_lista:
            if not isinstance(pai, list):
                erro(f"linha {n}: item de lista sob algo que não é lista"
                     " — confira a indentação da chave que abre a lista")
            novo_item: dict = {}
            pai.append(novo_item)
            # O dict do item vive no nível do próprio `- `: as chaves irmãs vêm indentadas
            # depois dele, e o `- ` seguinte (mesma coluna) tem de derrubar este frame.
            pilha.append((ind, novo_item))
            pai = novo_item
            if not corpo:
                continue

        m = re.match(r"^([\w.\-]+)\s*:\s*(.*)$", corpo)
        if not m:
            erro(f"linha {n}: esperava 'chave: valor' — veio {corpo!r}")
        chave, valor = m.group(1), m.group(2).strip()
        if not isinstance(pai, dict):
            erro(f"linha {n}: '{chave}:' fora de um mapa")

        if valor == "":
            filho = _descobre_filho(linhas, n, ind)
            pai[chave] = [] if filho == "lista" else {}
            pilha.append((ind, pai[chave]))
        else:
            pai[chave] = valor.strip('"').strip("'")
    return raiz


def _descobre_filho(linhas: list[str], apos: int, ind_pai: int) -> str:
    """Uma chave vazia abre lista ou mapa? Decide pela primeira linha filha de verdade."""
    for linha in linhas[apos:]:
        if not linha.strip() or linha.lstrip().startswith("#"):
            continue
        ind = len(linha) - len(linha.lstrip())
        if ind <= ind_pai:
            return "mapa"   # nada aninhado: chave vazia
        return "lista" if linha.lstrip().startswith("- ") else "mapa"
    return "mapa"


def normaliza_titulo(t: str) -> str:
    """Identidade do item para deduplicar. Marcadores saem; o texto é a identidade.

    Mesma regra de `prioridade.py`: toda tag sai do slug, senão marcar `#esforco/g` num item
    existente o transformaria em item novo e ele seria semeado de novo.
    """
    # A severidade é emoji + PALAVRA (`🔼 média`): tirar só o emoji deixa "media" colado no
    # fim do título, e aí o item semeado nunca casa com o que já está na fila — foi assim que
    # a fila do Ramalho ganhou o mesmo item duas vezes em 2026-08-21.
    t = re.sub(r"[🔺🔼🔽]\s*(alta|m[eé]dia|baixa)?", " ", t)
    t = re.sub(r"[📅🎯🤖✅❌⏳]", " ", t)
    t = re.sub(r"#\S+", " ", t)
    t = re.sub(r"\[prio:[^\]]*\]", " ", t)
    t = re.sub(r"\d{4}-\d{2}-\d{2}", " ", t)
    t = unicodedata.normalize("NFKD", t).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", " ", t.lower()).strip()


def linha_item(item: dict) -> list[str]:
    """Uma tarefa no formato de tasks/README.md, dialeto checkbox.

    Sem `[APROVAR]`: num arquivo que já É a fila de uma pessoa, todo `- [ ]` de nível zero é
    pedido dela — é assim que a plataforma-cursos escreve, e os dois parsers aceitam.
    """
    titulo = (item.get("titulo") or "").strip()
    if not titulo:
        erro(f"item sem 'titulo': {item!r}")
    partes = [f"- [ ] {titulo}", f"📅 {item.get('registrada', HOJE)}"]
    if item.get("prazo"):
        partes.append(f"🎯 {item['prazo']}")
    if item.get("prioridade"):
        sev = SEVERIDADE.get(str(item["prioridade"]).lower())
        if not sev:
            erro(f"prioridade inválida em {titulo!r}: {item['prioridade']}")
        partes.append(sev)
    area = item.get("area")
    if area:
        # `#area/x` é a área-exemplo do template e é tratada como placeholder pelos parsers:
        # o item sumiria da contagem em silêncio.
        if area.strip().lower() == "x":
            erro(f"area 'x' é placeholder do template — use a área real em {titulo!r}")
        partes.append(f"#area/{area}")
    if item.get("esforco"):
        partes.append(f"#esforco/{item['esforco']}")
    if item.get("modelo"):
        partes.append(f"#modelo/{item['modelo']}")
    if item.get("eis"):
        partes.append(f"#eis/{item['eis']}")

    linhas = [" ".join(partes)]
    for chave in SUB_LABELS:
        if item.get(chave):
            linhas.append(f"  - {ROTULO[chave]}: {item[chave]}")
    return linhas


CABECALHO = """# 👤 {pessoa} — o que depende de você

> **Fila de uma pessoa.** Tudo aqui está travando trabalho neste projeto e só {pessoa} pode
> resolver ou decidir. Não é backlog de agente: o que o agente pode fazer sozinho está em
> `backlog.md` e `bugs.md`.

**Como responder** — na própria linha do item, sem mudar o título (o título é a identidade do
item para o motor de prioridade; reescrevê-lo cria item novo e zera a idade acumulada):

| Marca | Significado |
|---|---|
| `- [ ]` | pendente — continua na fila e na matriz Eisenhower |
| `- [/]` | em andamento — sai dos quadrantes, aparece como "Em andamento" |
| `- [x]` | feito — anote `✅ AAAA-MM-DD` e mova o item para `concluidas.md` |
| `- [-]` | cancelado — anote o motivo e mova para `concluidas.md` |

Decisão que precisa de resposta escrita: responda na linha (`→ opção B`) ou como sub-bullet
`- Decisão: …`.

Um relatório só do que depende de {pessoa}, para encaminhar:

```bash
python3 scripts/relatorio.py --pessoa {pessoa}
```

---

## ⏳ Aguardando {pessoa}
"""


def garante_fila_pessoa(tdir: Path, pessoa: str, itens: list[dict], apply: bool) -> list[str]:
    """Cria o arquivo da fila se faltar e faz APPEND dos itens que ainda não estão nela."""
    alvo = tdir / slug_arquivo(pessoa)
    mudancas: list[str] = []

    if alvo.exists():
        texto = alvo.read_text(encoding="utf-8")
        existentes = {normaliza_titulo(m.group(1))
                      for m in re.finditer(r"^\s*- \[[ x/\-]\]\s*(.+)$", texto, re.M)}
    else:
        texto = CABECALHO.format(pessoa=pessoa)
        existentes = set()
        mudancas.append(f"criar {alvo.name}")

    novas: list[str] = []
    for item in itens:
        # Comparação por PREFIXO, não igualdade: a linha na fila cresce depois de semeada
        # (marcadores, `→ opção B`, `✅ aprovado por …`), e igualdade exata re-semearia um
        # item que a pessoa já respondeu. O título é sempre o começo da linha.
        alvo_norm = normaliza_titulo(item.get("titulo", ""))
        if alvo_norm and any(e.startswith(alvo_norm) for e in existentes):
            continue
        novas.extend(linha_item(item))
        mudancas.append(f"+ {item['titulo'][:58]}")

    if not novas and alvo.exists():
        return mudancas

    if apply:
        corpo = texto.rstrip("\n")
        if novas:
            corpo += "\n" + "\n".join(novas)
        alvo.write_text(corpo + "\n", encoding="utf-8")
    return mudancas


def garante_filas_yaml(tdir: Path, dono: str, pessoas: list[str], apply: bool) -> list[str]:
    """Declara as filas do projeto, preservando o que já estava no arquivo.

    O parser (nos dois programas) só aceita `arquivo.md: Pessoa` se o arquivo existir — então
    este passo roda DEPOIS de criar as filas, senão a declaração é silenciosamente ignorada.
    """
    cfg = tdir / ".filas.yaml"
    linhas = cfg.read_text(encoding="utf-8").splitlines() if cfg.exists() else []
    declarados = {m.group(1) for m in
                  (re.match(r"^\s*([\w.\-]+\.md)\s*:", l) for l in linhas) if m}
    tem_dono = any(re.match(r"^\s*_dono\s*:", l) for l in linhas)

    novas: list[str] = []
    if not linhas:
        novas += [
            "# Filas humanas deste projeto: arquivo → pessoa.",
            "# Lido por scripts/prioridade.py e scripts/obsidian-panel.js. Uma linha por fila.",
            "# `_dono` é quem opera o cofre: a fila dele é \"suas decisões\" no Foco de Hoje,",
            "# as outras são \"aguardando <pessoa>\" (cobrança).",
        ]
    if not tem_dono:
        novas.append(f"_dono: {dono}")
    # `human.md` TEM de ser declarado junto: o parser dos dois programas devolve só o que o
    # arquivo lista (`if (Object.keys(mapa).length) return mapa`), sem somar o default. Declarar
    # apenas `wesley.md` tiraria `human.md` do mapa e as decisões do dono desapareceriam da
    # contagem em silêncio — 68 delas, medido no cofre em 2026-08-21.
    for arq, pessoa in [("human.md", dono)] + [(slug_arquivo(p), p) for p in pessoas]:
        if arq not in declarados and (tdir / arq).exists():
            novas.append(f"{arq}: {pessoa}")
            declarados.add(arq)

    if not novas:
        return []
    if apply:
        corpo = "\n".join(linhas + novas).strip("\n")
        cfg.write_text(corpo + "\n", encoding="utf-8")
    return [f"filas.yaml: {l}" for l in novas if not l.startswith("#")]


def main() -> None:
    args = sys.argv[1:]
    apply = "--apply" in args
    so: list[str] = []
    mapa_path = None
    i = 0
    resto = [a for a in args if a != "--apply"]
    while i < len(resto):
        if resto[i] == "--so":
            if i + 1 >= len(resto):
                erro("--so exige o nome do projeto")
            so.append(resto[i + 1])
            i += 2
            continue
        if resto[i].startswith("-"):
            erro(f"opção desconhecida: {resto[i]}")
        mapa_path = resto[i]
        i += 1
    if not mapa_path:
        erro("uso: delegar.py <mapa.yaml> [--apply] [--so PROJETO]…")

    mapa = yaml_raso(Path(mapa_path).read_text(encoding="utf-8"))
    dono = mapa.get("_dono") or erro("mapa sem `_dono:`")
    raiz = Path(mapa.get("raiz") or Path(mapa_path).resolve().parent)
    pessoas_mapa = mapa.get("pessoas") or {}
    if not isinstance(pessoas_mapa, dict) or not pessoas_mapa:
        erro("mapa sem `pessoas:`")

    # projeto → {pessoa: [itens]}
    por_projeto: dict[str, dict[str, list]] = {}
    for pessoa, projetos in pessoas_mapa.items():
        for projeto, itens in (projetos or {}).items():
            if not isinstance(itens, list):
                erro(f"{pessoa}/{projeto}: esperava lista de itens")
            por_projeto.setdefault(projeto, {})[pessoa] = itens

    faltando = [p for p in por_projeto if not (raiz / p / "tasks").is_dir()]
    if faltando:
        erro("sem tasks/ (o sistema não está instalado): " + ", ".join(sorted(faltando))
             + "\n  Instale com a skill tasks-obsidian antes de delegar nele.")

    # Todo projeto com tasks/ recebe `.filas.yaml` — ver docstring do módulo.
    todos = sorted(d.name for d in raiz.iterdir() if (d / "tasks").is_dir())
    if so:
        todos = [p for p in todos if p in so]
        por_projeto = {k: v for k, v in por_projeto.items() if k in so}

    tocados = 0
    for projeto in todos:
        tdir = raiz / projeto / "tasks"
        mudancas: list[str] = []
        for pessoa, itens in sorted(por_projeto.get(projeto, {}).items()):
            mudancas += garante_fila_pessoa(tdir, pessoa, itens, apply)
        mudancas += garante_filas_yaml(
            tdir, dono, sorted(por_projeto.get(projeto, {})), apply)
        if mudancas:
            tocados += 1
            print(f"→ {projeto}")
            for m in mudancas:
                print(f"    {m}")
        else:
            print(f"✓ {projeto} — já em dia")

    print()
    if apply:
        print(f"✓ {tocados} projeto(s) atualizado(s).")
        print("  Rode 'bash scripts/sync-obsidian.sh' em um deles para regenerar o cofre.")
    else:
        print(f"DRY-RUN — {tocados} projeto(s) seriam atualizados. Rode de novo com --apply.")


if __name__ == "__main__":
    main()
