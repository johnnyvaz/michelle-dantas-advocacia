#!/usr/bin/env python3
"""Tira os itens de exemplo dos arquivos de tasks recém-criados.

Sem isso o `00 Painel Geral` abre com decisões e tarefas que ninguém escreveu — o `[Exemplo]` do
human.md vira "esperando você", e o `[Descreva a primeira tarefa]` vira backlog. Cabeçalho,
seções e instruções de formato ficam; só o item-exemplo sai.
"""
import re
import sys
from pathlib import Path

# Quatro formas de placeholder no acervo. Mesmo critério de `_placeholder` em
# scripts/prioridade.py e de `ehPlaceholder` em scripts/obsidian-panel.js — se divergirem,
# o painel conta um total, a matriz mostra outro, e ninguém confia em nenhum dos dois.
# Detecção por TEXTO CONHECIDO do template, não por forma.
#
# A heurística anterior ("título começa com `[`") produzia falso positivo destrutivo: em
# DATA-DOSSIE os títulos reais começam com tag entre colchetes — `- [ ] [RH] DossierPdfService
# grava accessToken…`. Medido: 338 linhas de bugs e histórico reais seriam apagadas. Aqui só
# sai o que os próprios templates escreveram.
FRASES_TEMPLATE = (
    "descreva",                        # [Descreva a primeira tarefa prioritária] etc.
    "exemplo —", "exemplo -",          # [Exemplo — ação irreversível/externa…]
    "nome da feature", "nome da frente",
    "ação proposta em uma frase", "acao proposta em uma frase",
    "ação que precisa de decisão", "acao que precisa de decisao",
    "primeira tarefa do negócio", "primeira tarefa do negocio",
)
# `{{DATA}}` não substituído e a área-exemplo `#area/x` são marcas inequívocas de template.
PLACEHOLDER_INLINE = re.compile(r"\{\{[^}]*\}\}|#area/x\b")
# Título "encapsulado": `[algo]` ou `<algo>` ocupando o começo do item.
ENCAPSULADO = re.compile(r"^\s*-\s+(?:\[[ x/-]\]\s+)?(?:\[APROVAR\]\s+)?[\[<]([^\]>]{3,})[\]>]")
PLACEHOLDER = ENCAPSULADO  # nome mantido: o instalador e os testes o referenciam


def _frase_de_template(texto: str) -> bool:
    t = texto.strip().lower()
    return any(f in t for f in FRASES_TEMPLATE)


def _eh_placeholder(ln: str) -> bool:
    """Só é placeholder o que o template escreveu — na dúvida, preserva."""
    if not re.match(r"^\s*-\s+(?:\[[ x/-]\]\s+)?", ln):
        return False
    # `{{DATA}}` citado em código (`` `{{DATA}}` ``) é conteúdo: há bug no acervo sobre isso.
    if PLACEHOLDER_INLINE.search(re.sub(r"`[^`]*`", "", ln)):
        return True
    m = ENCAPSULADO.match(ln)
    return bool(m and _frase_de_template(m.group(1)))


def limpa_itens(linhas):
    """Remove item cujo título é placeholder (`[Descreva…]`, `[Exemplo…]`) e suas linhas filhas."""
    saida, pulando, em_bloco = [], False, False
    for ln in linhas:
        if ln.startswith("```"):
            em_bloco = not em_bloco
            pulando = False
            saida.append(ln)
            continue
        if em_bloco:                       # exemplo de formato dentro de bloco: preserva
            saida.append(ln)
            continue
        if _eh_placeholder(ln):
            pulando = True
            continue
        if pulando and (ln.startswith(("  ", "\t")) or not ln.strip()):
            if not ln.strip():             # linha em branco encerra o item, mas fica
                pulando = False
                saida.append(ln)
            continue
        pulando = False
        saida.append(ln)
    return saida


def limpa_features(linhas):
    """Remove a frente de exemplo inteira (`## [ ] [Nome da Feature 001]` até o próximo `##`/`---`).

    ⚠️ O `[A-ZÀ-Ú…]` depois do `\\[` é o que separa exemplo de frente real: sem ele o grupo
    de estado retrocede e `## [/] 013 - Sprint de Suporte` casa pelo `[` do próprio `[/]`.
    Medido em HELPDESK-CHAT: a sprint 013 inteira (49 linhas de trabalho) seria apagada.
    """
    saida, pulando = [], False
    for ln in linhas:
        mh = re.match(r"^## (?:\[[ x/-]\]\s+)?\[([^\]]{3,})\]", ln)
        if mh and _frase_de_template(mh.group(1)):
            pulando = True
            continue
        if pulando:
            if ln.startswith("## ") or ln.startswith("---"):
                pulando = False
            else:
                continue
        saida.append(ln)
    return saida


def limpa_inbox(linhas):
    """Esvazia o corpo do INBOX: o comentário-guia conta como instrução no merge."""
    return [ln for ln in linhas if "Escreva abaixo. Apague este comentário" not in ln]


def limpa_human(linhas):
    """human.md nos três dialetos.

    Além dos itens `- [ ] [APROVAR] [Exemplo…]` (que `limpa_itens` já pega), remove o bloco
    de heading-exemplo do dialeto canônico — `### H-000 · <título>` até o próximo heading.
    Sem isso o painel geral anuncia "esperando você" para uma decisão que ninguém escreveu:
    seis dos 16 projetos inflavam o total só com esse item.
    """
    saida, pulando = [], False
    for ln in limpa_itens(linhas):
        mh = re.match(r"^#{2,4}\s+(?:H-\d+\s*[·:•\-–]\s*)?(.+)$", ln)
        if mh and (_frase_de_template(mh.group(1)) or PLACEHOLDER_INLINE.search(mh.group(1))):
            pulando = True
            continue
        if pulando:
            if ln.startswith("#") or ln.startswith("---"):
                pulando = False
            else:
                continue
        saida.append(ln)
    return saida


HANDLERS = {"features.md": limpa_features, "inbox.md": limpa_inbox, "human.md": limpa_human}

for caminho in sys.argv[1:]:
    p = Path(caminho)
    if not p.exists():
        print(f"  · {p} não existe")
        continue
    antes = p.read_text(encoding="utf-8").splitlines(keepends=True)
    depois = HANDLERS.get(p.name, limpa_itens)(antes)
    while len(depois) > 1 and not depois[-1].strip() and not depois[-2].strip():
        depois.pop()
    if antes == depois:
        print(f"  · {p.parent.parent.name}/{p.name} sem placeholder")
    else:
        p.write_text("".join(depois), encoding="utf-8")
        print(f"  ✂ {p.parent.parent.name}/{p.name}: -{len(antes) - len(depois)} linha(s)")
