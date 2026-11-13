#!/usr/bin/env python3
"""Padroniza tasks/*.md no formato de tasks/README.md.

Três programas leem esses arquivos — prioridade.py, obsidian-panel.js e obsidian-index.js — e
cada um tem um extrator por dialeto. Formato que não casa nenhum extrator não dá erro: o item
desaparece da contagem em silêncio. Este script converge os dialetos legados no canônico.

O que faz, em ordem:
  1. placeholders     remove os itens de exemplo que o template deixou
  2. human.md         converte o dialeto checkbox `[APROVAR]` no canônico `### H-0xx ·` +
                      `**Estado:**`, e completa o `**Estado:**` que falta no dialeto heading
  3. marcadores       reordena os marcadores da linha na ordem do contrato
  4. concluídos       aponta `[x]`/`[-]` que ficaram nos arquivos de trabalho (não move: o
                      bloco tem contexto e mover é decisão de quem conhece o item)
  5. #area/           confere a tag de roteamento contra o elenco de agentes do projeto:
                      alias conhecido é normalizado (`--apply`); órfã é só REPORTADA — criar
                      agente ou renomear a tag é decisão do dono

DRY-RUN por padrão: sem `--apply` nada é escrito. Idempotente — rodar de novo não muda nada.

Uso:
  python3 scripts/migrar-tasks.py [caminho-do-repo ...] [--apply] [--quiet]
                                  [--tasks DIR] [--sem-reordenar]

`--sem-reordenar` pula o passo 3. Em acervo grande e já em uso a reordenação é cosmética
(o parser aceita qualquer ordem) e produz centenas de linhas de diff sem ganho — medido:
279 linhas na plataforma-cursos só para mover `🤖` depois de `#area/`.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

# ── reaproveita a detecção de placeholder da skill, quando disponível ──────────
_LP = (Path(__file__).parent.parent / ".claude" / "skills" / "tasks-obsidian"
       / "resources" / "limpar-placeholders.py")

FRASES_TEMPLATE = (
    "descreva", "exemplo —", "exemplo -", "nome da feature", "nome da frente",
    "ação proposta em uma frase", "acao proposta em uma frase",
    "ação que precisa de decisão", "acao que precisa de decisao",
    "primeira tarefa do negócio", "primeira tarefa do negocio",
)
PLACEHOLDER_INLINE = re.compile(r"\{\{[^}]*\}\}|#area/x\b")
ENCAPSULADO = re.compile(r"^\s*-\s+(?:\[[ x/-]\]\s+)?(?:\[APROVAR\]\s+)?[\[<]([^\]>]{3,})[\]>]")

TASK_LINE = re.compile(r"^(?P<pre>\s*-\s*\[(?P<estado>[ xX/\-])\]\s*)(?P<corpo>.*)$")
ESTADO_LINE = re.compile(r"^\s*\*\*Estado:\*\*")  # dialeto canônico de human.md
APROVAR = re.compile(r"\[APROVAR\]\s*")
MARKER = re.compile(r"\s*\[prio:\s*-?[0-9.]+\s+calc:prioridade\]")

# Marcadores, na ordem do contrato (tasks/README.md).
M_DATA = re.compile(r"📅\s*(\d{4}-\d{2}-\d{2})")
M_PRAZO = re.compile(r"🎯\s*(\d{4}-\d{2}-\d{2})")
M_SEV = re.compile(r"(🔺|🔼|🔽)\s*(alta|média|media|baixa)?", re.IGNORECASE)
M_AREA = re.compile(r"#area/(\S+)")
M_ESFORCO = re.compile(r"#esforco/([pmg])\b")
M_MODELO = re.compile(r"#modelo/(opus|sonnet|haiku)\b", re.IGNORECASE)
M_EIS = re.compile(r"#eis/(q[1-4])\b", re.IGNORECASE)
M_AGENTE = re.compile(r"🤖")
SEV_NOME = {"🔺": "alta", "🔼": "média", "🔽": "baixa"}


def eh_placeholder(linha: str) -> bool:
    if not re.match(r"^\s*-\s+(?:\[[ x/-]\]\s+)?", linha):
        return False
    if PLACEHOLDER_INLINE.search(re.sub(r"`[^`]*`", "", linha)):
        return True
    m = ENCAPSULADO.match(linha)
    return bool(m and any(f in m.group(1).strip().lower() for f in FRASES_TEMPLATE))


# ─────────────────────────────────────────────── 1. placeholders

def remove_placeholders(linhas: list[str]) -> tuple[list[str], int]:
    """Remove item-exemplo e as sub-linhas dele. Preserva blocos de código."""
    saida, pulando, em_bloco, n = [], False, False, 0
    for ln in linhas:
        if ln.lstrip().startswith("```"):
            em_bloco, pulando = not em_bloco, False
            saida.append(ln)
            continue
        if em_bloco:
            saida.append(ln)
            continue
        if eh_placeholder(ln):
            pulando, n = True, n + 1
            continue
        if pulando and (ln.startswith(("  ", "\t")) or not ln.strip()):
            if not ln.strip():
                pulando = False
                saida.append(ln)
            continue
        pulando = False
        saida.append(ln)
    return saida, n


def remove_frente_exemplo(linhas: list[str]) -> tuple[list[str], int]:
    """`## [ ] [Nome da Feature 001]` até o próximo `##`/`---`.

    O `[A-Z…]` dentro dos colchetes é o que separa exemplo de frente real: sem ele o grupo
    de estado retrocede e `## [/] 013 - Sprint de Suporte` casaria pelo `[` do `[/]`.
    """
    saida, pulando, n = [], False, 0
    for ln in linhas:
        mh = re.match(r"^## (?:\[[ x/-]\]\s+)?\[([^\]]{3,})\]", ln)
        if mh and any(f in mh.group(1).lower() for f in FRASES_TEMPLATE):
            pulando, n = True, n + 1
            continue
        if pulando:
            if ln.startswith("## ") or ln.startswith("---"):
                pulando = False
            else:
                continue
        saida.append(ln)
    return saida, n


# ─────────────────────────────────────────────── 2. human.md canônico

def _proximo_id(usados: set[str]) -> str:
    n = 1
    while f"H-{n:03d}" in usados:
        n += 1
    usados.add(f"H-{n:03d}")
    return f"H-{n:03d}"


def canoniza_human(linhas: list[str]) -> tuple[list[str], int]:
    """Converte `- [ ] [APROVAR] …` em `### H-0xx · …` + `**Estado:**`, e completa o
    `**Estado:**` ausente nos blocos que já usam heading.

    O corpo é preservado como está: são decisões irreversíveis, com motivo/impacto/rollback
    escritos por quem analisou. Reescrever prosa aqui seria perder informação.
    """
    usados = {m.group(1) for ln in linhas
              if (m := re.match(r"^#{2,4}\s+(H-\d+)\b", ln))}
    saida, convertidos = [], 0
    i, total = 0, len(linhas)
    em_bloco = False
    while i < total:
        ln = linhas[i]
        if ln.lstrip().startswith("```"):
            em_bloco = not em_bloco
            saida.append(ln)
            i += 1
            continue
        if em_bloco:
            saida.append(ln)
            i += 1
            continue

        m = TASK_LINE.match(ln)
        if m and APROVAR.search(m.group("corpo")):
            corpo = APROVAR.sub("", MARKER.sub("", m.group("corpo"))).strip()
            estado = m.group("estado")
            titulo, meta = _parte_titulo_e_meta(corpo)
            hid = _proximo_id(usados)
            marca = ("✅ aprovado" if estado in ("x", "X")
                     else "❌ rejeitado" if estado == "-"
                     else "🔄 em curso" if estado == "/"
                     else "⏳ pendente")
            saida.append(f"### {hid} · {titulo}")
            saida.append(f"**Estado:** {' · '.join([marca] + meta)}")
            convertidos += 1
            # As sub-linhas indentadas viram bullets de primeiro nível do bloco.
            i += 1
            while i < total and (linhas[i].startswith(("  ", "\t"))
                                 or not linhas[i].strip()):
                filho = linhas[i]
                if filho.strip():
                    saida.append(re.sub(r"^\s+-\s*", "- ", filho))
                else:
                    saida.append("")
                    if i + 1 < total and not linhas[i + 1].startswith(("  ", "\t")):
                        break
                i += 1
            continue

        mh = re.match(r"^(#{2,4})\s+(H-\d+)\s*[·:•\-–]\s*(.+)$", ln)
        if mh:
            saida.append(f"### {mh.group(2)} · {mh.group(3).strip()}")
            # Já tem **Estado:** logo abaixo? Se não, insere um inferido do corpo do bloco.
            resto = linhas[i + 1:i + 12]
            if not any(re.search(r"\*\*Estado:\*\*", r) for r in resto):
                bloco = "\n".join(linhas[i + 1:i + 30])
                decidido = re.search(r"✅|❌|^\s*→\s*\S", bloco, re.MULTILINE)
                meta = _meta_de_texto(bloco + "\n" + ln)
                marca = "✅ decidido" if decidido else "⏳ pendente"
                saida.append(f"**Estado:** {' · '.join([marca] + meta)}")
                convertidos += 1
            i += 1
            continue

        saida.append(ln)
        i += 1
    return saida, convertidos


def _parte_titulo_e_meta(corpo: str) -> tuple[str, list[str]]:
    """Separa o texto do item dos marcadores, devolvendo os marcadores em ordem."""
    meta = _meta_de_texto(corpo)
    titulo = corpo
    for rx in (M_DATA, M_PRAZO, M_AREA, M_ESFORCO, M_MODELO, M_EIS):
        titulo = rx.sub("", titulo)
    titulo = M_SEV.sub("", titulo)
    titulo = M_AGENTE.sub("", titulo)
    return re.sub(r"\s{2,}", " ", titulo).strip(" ·—-"), meta


def _meta_de_texto(texto: str) -> list[str]:
    out = []
    if m := M_DATA.search(texto):
        out.append(f"📅 {m.group(1)}")
    if m := M_PRAZO.search(texto):
        out.append(f"🎯 {m.group(1)}")
    if m := M_SEV.search(texto):
        out.append(f"{m.group(1)} {SEV_NOME[m.group(1)]}")
    if m := M_AREA.search(texto):
        out.append(f"#area/{m.group(1)}")
    if m := M_ESFORCO.search(texto):
        out.append(f"#esforco/{m.group(1)}")
    if m := M_MODELO.search(texto):
        out.append(f"#modelo/{m.group(1).lower()}")
    return out


# ─────────────────────────────────────────────── 3. ordem dos marcadores

def divergencia_severidade(linha: str) -> str | None:
    """Emoji e palavra discordando (`🔼 alta`) — devolve a descrição do conflito.

    NÃO é normalizado: o parser usa o emoji, mas quem escreveu pode ter errado o emoji e
    acertado a palavra. Reescrever para o emoji faria o texto concordar com o valor errado e
    apagaria o único sinal de que há dúvida. Fica para decisão humana.
    """
    m = re.search(r"(🔺|🔼|🔽)\s*(alta|média|media|baixa)", linha, re.IGNORECASE)
    if not m:
        return None
    palavra = m.group(2).lower().replace("media", "média")
    return None if palavra == SEV_NOME[m.group(1)] else f"{m.group(1)} vs '{palavra}'"


def normaliza_linha(linha: str) -> str:
    """Reordena os marcadores para a ordem do contrato, sem alterar o texto da tarefa."""
    m = TASK_LINE.match(linha)
    if not m or eh_placeholder(linha) or divergencia_severidade(linha):
        return linha
    corpo_orig = m.group("corpo")
    marcador = MARKER.search(corpo_orig)
    corpo = MARKER.sub("", corpo_orig)
    if "✅" in corpo or "❌" in corpo:
        return linha  # linha de item fechado: a data de conclusão tem posição própria
    titulo, meta = _parte_titulo_e_meta(corpo)
    if not titulo:
        return linha
    if M_EIS.search(corpo):
        meta.append(f"#eis/{M_EIS.search(corpo).group(1).lower()}")
    if M_AGENTE.search(corpo):
        meta.append("🤖")
    novo = f"{m.group('pre')}{' '.join([titulo] + meta)}"
    if marcador:
        novo += marcador.group(0)
    return novo if novo.strip() != linha.strip() else linha


# ─────────────────────────────────────────────── 4. concluídos fora de lugar

def concluidos_em_arquivo_de_trabalho(linhas: list[str]) -> int:
    return sum(1 for ln in linhas
               if (m := TASK_LINE.match(ln)) and m.group("estado") in ("x", "X", "-"))


# ─────────────────────────────────────────────── 5. #area/ contra o elenco

# Agente cujo nome NÃO é a área que ele atende. `seguranca` tem dois (blue e red team),
# por isso a validação não pode ser 1:1 ingênua.
AGENTE_ATENDE = {
    "soc": "seguranca",
    "redteam": "seguranca",
}

# Tag legada → área canônica. Só entra aqui o que a matriz de roteamento
# (gemeo/12-AGENTES/README.md) já resolve — `infra` e `deploy` estão escritos na
# linha de `desenvolvimento`. Alias é normalizado com `--apply`; o que não está
# aqui é órfã e vira relatório, nunca reescrita automática.
ALIAS_AREA = {
    "engenharia": "desenvolvimento",
    "eng": "desenvolvimento",
    "infra": "desenvolvimento",
    "deploy": "desenvolvimento",
    "dev": "desenvolvimento",
    "qualidade": "desenvolvimento",
    "conteudo": "conteudo-cursos",
    "cursos": "conteudo-cursos",
    "juridico": "operacoes",
    "legal": "operacoes",
    "sec": "seguranca",
}


def areas_do_projeto(raiz: Path, quieto: bool) -> set[str] | None:
    """`elenco_areas` + o aviso de que a validação foi pulada."""
    areas = elenco_areas(raiz)
    if areas is None and not quieto:
        print(f"   (sem .claude/agents/ em {raiz.name} — "
              f"validação de #area/ pulada; projeto em modo plugin?)")
    return areas


def elenco_areas(raiz: Path) -> set[str] | None:
    """Áreas atendidas por algum `agente-*.md` do projeto.

    `None` quando não há como saber — projeto em modo **plugin** não tem
    `.claude/agents/` no repo, e nesse caso validar acusaria tudo como órfão.
    """
    d = raiz / ".claude" / "agents"
    if not d.is_dir():
        return None
    nomes = [p.stem.removeprefix("agente-") for p in d.glob("agente-*.md")]
    if not nomes:
        return None
    return {AGENTE_ATENDE.get(n, n) for n in nomes}


def portadora_de_area(ln: str) -> bool:
    """Linha onde `#area/` é roteamento de verdade — os DOIS dialetos da fila.

    `- [ ] título … #area/x` (backlog/bugs/features) e `**Estado:** … #area/x`
    (dialeto canônico de `human.md`). Sem o segundo, a validação passa por cima da
    fila humana inteira — foi o furo encontrado ao rodar contra o DATA-DOSSIE.
    """
    return bool(TASK_LINE.match(ln) or ESTADO_LINE.match(ln))


def valida_areas(linhas: list[str], areas: set[str],
                 aplicar_alias: bool) -> tuple[list[str], list[str]]:
    """Normaliza alias e reporta órfã. Só olha linha que roteia de verdade."""
    saida, notas, orfas, renomeadas = [], [], {}, 0
    em_bloco = False
    for i, ln in enumerate(linhas, 1):
        if ln.lstrip().startswith("```"):
            em_bloco = not em_bloco
        if em_bloco or not portadora_de_area(ln) or eh_placeholder(ln):
            saida.append(ln)
            continue
        m = M_AREA.search(ln)
        if not m:
            saida.append(ln)
            continue
        tag = m.group(1)
        if tag in areas:
            saida.append(ln)
            continue
        alvo = ALIAS_AREA.get(tag)
        if alvo and alvo in areas:
            if aplicar_alias:
                ln = ln.replace(f"#area/{tag}", f"#area/{alvo}")
                renomeadas += 1
            else:
                notas.append(f"  L{i}: #area/{tag} → #area/{alvo} (alias; --apply renomeia)")
        else:
            orfas.setdefault(tag, []).append(i)
        saida.append(ln)

    if renomeadas:
        notas.append(f"{renomeadas} tag(s) #area/ normalizada(s) por alias")
    for tag, lins in sorted(orfas.items()):
        linhas_txt = ", ".join(f"L{n}" for n in lins)
        notas.append(f"⚠ #area/{tag} sem agente correspondente ({linhas_txt}) — "
                     f"crie `.claude/agents/agente-{tag}.md` ou renomeie a tag")
    return saida, notas


# ─────────────────────────────────────────────── orquestração

TRABALHO = ("backlog.md", "bugs.md", "features.md")
NAO_TOCAR = ("README.md", "PRIORIDADE.md", "ALLOWLIST.md", "concluidas.md", "inbox.md")


def migra_arquivo(p: Path, reordenar: bool = True,
                  areas: set[str] | None = None,
                  aplicar: bool = False) -> tuple[list[str] | None, list[str]]:
    """Devolve (linhas novas ou None se nada muda, lista de mudanças descritas)."""
    original = p.read_text(encoding="utf-8").splitlines()
    linhas, notas = list(original), []

    linhas, n = remove_placeholders(linhas)
    if n:
        notas.append(f"{n} placeholder(s) removido(s)")
    if p.name == "features.md":
        linhas, n = remove_frente_exemplo(linhas)
        if n:
            notas.append(f"{n} frente-exemplo removida")
    if p.name == "human.md":
        linhas, n = canoniza_human(linhas)
        if n:
            notas.append(f"{n} item(ns) no formato canônico")
    elif reordenar:
        antes = list(linhas)
        linhas = [normaliza_linha(ln) for ln in linhas]
        n = sum(1 for a, b in zip(antes, linhas) if a != b)
        if n:
            notas.append(f"{n} linha(s) com marcadores reordenados")
    if p.name in TRABALHO:
        n = concluidos_em_arquivo_de_trabalho(linhas)
        if n:
            notas.append(f"⚠ {n} item(ns) fechado(s) a mover para concluidas.md (manual)")
    if areas is not None:
        linhas, notas_area = valida_areas(linhas, areas, aplicar)
        notas.extend(notas_area)
    conflitos = [(i, d) for i, ln in enumerate(linhas, 1)
                 if (d := divergencia_severidade(ln))]
    for i, d in conflitos:
        notas.append(f"⚠ L{i}: severidade ambígua ({d}) — preservada; o motor usa o emoji")

    while len(linhas) > 1 and not linhas[-1].strip() and not linhas[-2].strip():
        linhas.pop()
    return (linhas if linhas != original else None), notas


def main() -> int:
    argv = sys.argv[1:]
    alvos = [a for a in argv if not a.startswith("--")] or ["."]
    aplicar = "--apply" in argv
    quieto = "--quiet" in argv
    reordenar = "--sem-reordenar" not in argv
    tasks_rel = None
    if "--tasks" in argv:
        i = argv.index("--tasks")
        tasks_rel = argv[i + 1] if i + 1 < len(argv) else None
        if tasks_rel in alvos:
            alvos.remove(tasks_rel)
    total_arq = total_mud = 0

    for alvo in alvos:
        tdir = Path(alvo).resolve() / (tasks_rel or "tasks")
        if not tdir.is_dir():
            print(f"✗ {alvo}: sem tasks/", file=sys.stderr)
            continue
        areas = areas_do_projeto(tdir.parent, quieto)
        cabecalho = False
        for p in sorted(tdir.glob("*.md")):
            if p.name in NAO_TOCAR:
                continue
            novas, notas = migra_arquivo(p, reordenar, areas, aplicar)
            if not notas and novas is None:
                continue
            if not cabecalho:
                print(f"\n── {tdir.parent.name}")
                cabecalho = True
            total_arq += 1
            print(f"   {p.name}: {'; '.join(notas) or 'formatação'}")
            if novas is not None:
                total_mud += 1
                if aplicar:
                    p.write_text("\n".join(novas) + "\n", encoding="utf-8")

    print()
    if aplicar:
        print(f"✓ {total_mud} arquivo(s) reescrito(s) em {len(alvos)} projeto(s)")
    else:
        print(f"DRY-RUN — {total_mud} arquivo(s) seriam reescritos ({total_arq} com achados).")
        print("Revise o que está acima e rode de novo com --apply.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
