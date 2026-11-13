#!/usr/bin/env python3
"""Hook SessionStart: avisa o agente dos itens RESPONDIDOS da fila humana.

Por que existe: quando o dono escreve `**Solução:**` num item do `tasks/human.md`, a decisão
está tomada e o que sobra é TRABALHO, mas nenhuma fila de trabalho fica sabendo. O heartbeat
agendado lê `backlog`/`bugs`/`features`, não o `human.md`, e só executa o que é reversível e
`#auto/sim`, o que quase nunca é o caso de uma decisão. Resultado medido na plataforma-cursos:
item respondido parado por duas semanas, porque ninguém olhava.

O hook não executa nada. Ele conta os respondidos e põe no contexto da sessão a instrução de
propor, no primeiro turno, o destino de cada um: virar tarefa na fila certa (e sair do
`human.md`) ou ser executado agora, se for pequeno e reversível. Roda com o dono presente,
que é quando faz sentido, porque a resposta quase sempre leva a algo que ele precisa ver.

Não tem regra própria: quem decide o que é "respondido" e "decidido" é o `parse_human` do
`scripts/prioridade.py` DO PROJETO (o mesmo que o motor e o painel usam). Motor antigo, sem o
campo `respondido`, é avisado, nunca lido como "zero respondidos".

Sem respondidos, não escreve nada. Saída: JSON de SessionStart (`additionalContext` para o
agente, `systemMessage` para a pessoa). Exit sempre 0: aviso não pode travar a sessão.
"""
from __future__ import annotations

import importlib.util
import json
import os
import re
import sys
from pathlib import Path

ARQUIVO = Path("tasks") / "human.md"
MOTOR = Path("scripts") / "prioridade.py"
MAX_LISTADOS = 8


def raiz(payload: dict) -> Path | None:
    """Projeto: env do Claude Code, senão sobe a partir do cwd da sessão.

    Nunca pela localização do script: no modo plugin ele mora no cache de plugins (ou no
    próprio boilerplate), e subir a partir dali leria a fila de outro repositório.
    """
    cands = [os.environ.get("CLAUDE_PROJECT_DIR"), payload.get("cwd"), os.getcwd()]
    for c in filter(None, cands):
        p = Path(c).resolve()
        for d in [p, *p.parents]:
            if (d / ARQUIVO).is_file():
                return d
    return None


def carregar_motor(root: Path):
    spec = importlib.util.spec_from_file_location("prioridade_projeto", root / MOTOR)
    mod = importlib.util.module_from_spec(spec)
    sys.path.insert(0, str(root / "scripts"))  # o motor importa vizinhos (_gemeo_lib)
    spec.loader.exec_module(mod)
    return mod


def respondidos(root: Path) -> list[dict]:
    P = carregar_motor(root)
    itens = P.parse_human(root / ARQUIVO)
    abertos = [it for it in itens if it.get("aberto")]
    if abertos and not all("respondido" in it for it in abertos):
        raise RuntimeError("scripts/prioridade.py sem o campo `respondido` (motor antigo)")
    return [it for it in abertos if it.get("respondido")]


def titulo(it: dict) -> str:
    """O título sem a cauda de metadados (`📅 … 🔼 … #area/…`), que só polui o contexto."""
    bruto = it.get("_body") or it.get("id") or "?"
    return re.split(r"\s(?:📅|🎯|🔺|🔼|🔽|⏫|⏬|🤖|#[\w-]+/)", bruto)[0].strip()[:100]


def mensagem(itens: list[dict]) -> str:
    linhas = [f"- {titulo(it)}" for it in itens[:MAX_LISTADOS]]
    if len(itens) > MAX_LISTADOS:
        linhas.append(f"- … e mais {len(itens) - MAX_LISTADOS}")
    return "\n".join([
        f"Fila humana: {len(itens)} item(ns) do tasks/human.md já RESPONDIDO(S) pelo dono e "
        "esperando o agente:",
        *linhas,
        "",
        "Decisão respondida é trabalho, não espera. No primeiro turno, antes de qualquer outra "
        "coisa, proponha ao usuário o destino de cada item e só aja depois da confirmação dele:",
        "1. Virar tarefa na fila certa e SAIR do human.md: backlog/bugs/features com #area e "
        "#exec (formato de tasks/README.md); ou a fila humana da pessoa (ex.: johnny.md) quando "
        "a próxima ação é dela, como aplicar algo em produção.",
        "2. Ser executado agora, se for pequeno e reversível.",
        "Ao tirar um item do human.md, registre em tasks/concluidas.md a decisão e para onde o "
        "trabalho foi. Nada irreversível ou externo sem aprovação explícita.",
    ])


def main() -> int:
    try:
        payload = json.load(sys.stdin)
    except (json.JSONDecodeError, ValueError):
        payload = {}
    root = raiz(payload if isinstance(payload, dict) else {})
    if root is None or not (root / MOTOR).is_file():
        return 0  # projeto sem fila humana ou sem motor: nada a avisar
    try:
        itens = respondidos(root)
    except Exception as e:  # noqa: BLE001 — aviso nunca trava a sessão, mas falha é dita
        print(json.dumps({"systemMessage": f"⚠ fila humana sem leitura: {str(e)[:200]}"},
                         ensure_ascii=False))
        return 0
    if not itens:
        return 0
    print(json.dumps({
        "systemMessage": f"🙋 Fila humana: {len(itens)} respondido(s) esperando o agente",
        "hookSpecificOutput": {"hookEventName": "SessionStart", "additionalContext": mensagem(itens)},
    }, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
