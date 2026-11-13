#!/usr/bin/env python3
"""Semeia a linha `**Solução:** _(pendente)_` nos itens ABERTOS das filas humanas.

Por que existe: o campo funciona sem estar no arquivo — quem escreve `**Solução:**` num bloco
destrava o item, e ponto. Mas responder exige lembrar a sintaxe, e o dono está lendo o
`human.md`, não o contrato. A linha semeada é o convite: ele preenche em vez de recordar.
Nos 20 `human.md` do acervo são ~104 itens abertos, e nenhum no `DATA-DOSSIE` (o mais denso,
52 itens no dialeto `heading`) tinha onde escrever.

O que este script NÃO faz:

- **Não toca em item decidido.** Semear `_(pendente)_` num `✅ aprovado` sugeriria que falta
  resposta onde a decisão já está registrada. A regra de "decidido" vem de
  `prioridade.py:human_decidido` — a MESMA do motor, importada, nunca reescrita aqui.
- **Não reescreve nada.** Insere uma linha por bloco e não mexe em mais caractere nenhum.
- **Não repõe o campo consumido.** Idempotente por presença de qualquer alias
  (`Solução`/`Decisão`/`Resposta`) no bloco: item já respondido ou já semeado fica intocado.

Cobre os dois dialetos do acervo, cada um no seu lugar:

    heading    `### H-001 · título`  →  linha depois de `**Estado:**` (ou do heading)
    checkbox   `- [ ] [APROVAR] …`   →  sub-bullet depois dos outros sub-bullets do item

Todas as filas declaradas em `tasks/.filas.yaml` entram, não só `human.md`: um projeto pode ter
`dalvani.md` e `mazucco.md`, e cada uma é a fila de uma pessoa de verdade.

DRY-RUN por padrão: sem `--apply` nada é escrito.

Uso:
  python3 scripts/migrar-solucao.py                       # mostra o que faria em todos
  python3 scripts/migrar-solucao.py ../DATA-DOSSIE        # só nesse projeto
  python3 scripts/migrar-solucao.py ../DATA-DOSSIE --apply
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import prioridade as P  # noqa: E402  — regexes e regra de "decidido" vêm do motor

CAMPO = "**Solução:** _(pendente)_"
SUB = f"  - {CAMPO}"


def semeia(texto: str) -> tuple[str, int, int]:
    """(texto novo, semeados, intocados). Intocado = aberto que já tinha o campo."""
    linhas = texto.splitlines()
    # `_linhas_uteis` devolve TODAS as linhas, com `""` no lugar das que estão dentro de fence
    # — não uma lista filtrada. Detectar sobre `neutras` (mesmo tamanho e ordem que `linhas`) é
    # o que impede semear o exemplo de formato que o próprio `human.md` documenta; a primeira
    # versão filtrava por índice e semeava o exemplo, com o teste a pegar.
    neutras = [v for _, v in P._linhas_uteis(texto)]
    inserir: dict[int, str] = {}   # índice 0-based da linha APÓS a qual inserir → conteúdo
    semeados = intocados = 0

    secao = ""
    bloco = None   # {ini, estado_em, corpo[], estado}
    pend = None    # {ini, ultimo_sub, corpo[], aberto}

    def fecha_bloco():
        nonlocal bloco, semeados, intocados
        if bloco is None:
            return
        b, bloco = bloco, None
        corpo = "\n".join(b["corpo"])
        if P.human_decidido(b["estado"] or "", corpo, secao):
            return
        if P.SOLUCAO_RE.search(f"{b['estado'] or ''}\n{corpo}"):
            intocados += 1
            return
        if P._placeholder(b["titulo"]) or "{{" in corpo:
            return          # item de exemplo do template
        # Depois de `**Estado:**` quando existe: os dois são metadado do bloco e ficam juntos,
        # antes da prosa. Sem `**Estado:**`, logo abaixo do heading.
        inserir[b["estado_em"] if b["estado_em"] is not None else b["ini"]] = CAMPO
        semeados += 1

    def fecha_pend():
        nonlocal pend, semeados, intocados
        if pend is None:
            return
        p, pend = pend, None
        if not p["aberto"]:
            return
        corpo = "\n".join(p["corpo"])
        if P.SOLUCAO_RE.search(corpo):
            intocados += 1
            return
        if P._placeholder(p["titulo"]) or "{{" in corpo:
            return
        # Fim dos sub-bullets do item — nunca no meio, senão a linha entra antes de
        # `- **Rollback:**` e o bloco perde a ordem que o template estabelece.
        inserir[p["ultimo_sub"]] = SUB
        semeados += 1

    for i, ln in enumerate(neutras):
        mc = P.TASK_LINE_RE.match(ln)
        nivel_zero = mc and not ln.startswith((" ", "\t"))

        if mc and nivel_zero and bloco is None:
            fecha_pend()
            corpo_item = P.APROVAR_RE.sub("", P.MARKER_RE.sub("", mc.group("body"))).strip()
            pend = {"ini": i, "ultimo_sub": i, "corpo": [], "aberto": mc.group("state") in (" ", "/"),
                    "titulo": corpo_item}
            continue

        mid = P.HUMAN_ID_RE.match(ln)
        mh = mid or P.HUMAN_HEAD_RE.match(ln)
        if ln.startswith("## ") and not mid:
            fecha_pend()
            fecha_bloco()
            secao = ln[3:].strip()
            continue
        if mh:
            fecha_pend()
            fecha_bloco()
            bloco = {"ini": i, "estado_em": None, "corpo": [], "estado": None,
                     "titulo": mh.group("titulo")}
            continue

        if bloco is not None:
            me = P.ESTADO_RE.search(ln)
            if me:
                bloco["estado"] = me.group("estado").strip()
                bloco["estado_em"] = i
            bloco["corpo"].append(ln)
        elif pend is not None:
            if ln.startswith((" ", "\t")) and ln.strip():
                pend["ultimo_sub"] = i        # sub-bullet do item
            pend["corpo"].append(ln)
    fecha_pend()
    fecha_bloco()

    if not inserir:
        return texto, 0, intocados
    fora = []
    for i, ln in enumerate(linhas):
        fora.append(ln)
        if i in inserir:
            fora.append(inserir[i])
    return "\n".join(fora) + ("\n" if texto.endswith("\n") else ""), semeados, intocados


def main() -> int:
    aplica = "--apply" in sys.argv
    alvos = [a for a in sys.argv[1:] if not a.startswith("-")]

    boiler = Path(__file__).resolve().parent.parent
    dirs = ([Path(a).resolve() for a in alvos] if alvos else
            sorted(d for d in boiler.parent.iterdir() if (d / "tasks").is_dir()))

    tot_s = tot_i = arquivos = 0
    for d in dirs:
        tdir = d / "tasks"
        if not tdir.is_dir():
            print(f"· {d.name} — sem tasks/")
            continue
        filas = P.filas_humanas(tdir)
        if not filas:
            continue
        for arquivo, pessoa in sorted(filas.items()):
            md = tdir / arquivo
            texto = md.read_text(encoding="utf-8")
            novo, s, ig = semeia(texto)
            if not s:
                print(f"· {d.name}/{arquivo} — nada a semear"
                      + (f" ({ig} já com o campo)" if ig else ""))
                continue
            if aplica:
                md.write_text(novo, encoding="utf-8")
            print(f"{'✓' if aplica else '→'} {d.name}/{arquivo} ({pessoa}) — {s} item(ns)"
                  + (f", {ig} intocado(s)" if ig else ""))
            tot_s += s
            tot_i += ig
            arquivos += 1

    print(f"\n{tot_s} item(ns) em {arquivos} arquivo(s)"
          + (f" · {tot_i} já tinham o campo" if tot_i else ""))
    if not aplica and tot_s:
        print("DRY-RUN — rode com --apply para escrever.")
        print("Depois: bash scripts/sync-obsidian.sh no projeto (o painel não deve mudar —")
        print("`_(pendente)_` conta como vazio, então nenhum item vira 'respondido').")
    return 0


if __name__ == "__main__":
    sys.exit(main())
