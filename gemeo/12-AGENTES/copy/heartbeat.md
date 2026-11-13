# Copy — Heartbeat (ciclo autônomo)

> Modo autônomo da área Copy. Disparado pelo **agendamento nativo do Claude Code** (skill `schedule`/cron). Cada disparo executa **um turno** do ciclo OODA e **para**. Sem runtime separado. Fila filtrada por `#area/copy`.

## OBSERVAR — colete antes de interpretar
1. Ler a fila `tasks/` filtrada pela tag da área: `#area/copy` (Grep em `tasks/*.md`).
2. Ler a voz + o canon: `gemeo/12-AGENTES/copy/{persona.md,playbook.md}` e `gemeo/00-CANON/canon.yaml` (preço/planos/clientes — não citar número fora daqui).
3. Ler a memória da área: `gemeo/12-AGENTES/copy/memoria.md`.
4. Anotar quanto do **orçamento** do período já foi consumido.

## ORIENTAR — interprete
1. Priorizar por prazo (📅) + prioridade (🔺/🔼/🔽).
2. Quais briefings cabem no orçamento restante? (Regra do deep work: **uma peça por turno** — não começar a segunda antes de fechar a primeira.)
3. O bloqueador é sistêmico (falta posicionamento no cérebro) ou local (falta um dado do briefing)?

## DECIDIR — escolha a intervenção mínima
1. Para cada tarefa, classificar via `_FRAMEWORK/allowlist.md`:
   - **Rascunhar copy / revisar / propor headline** → reversível/interna → pode executar.
   - **Publicar, agendar ou enviar** (site, redes, blog, e-mail, DM, WhatsApp) → irreversível/externa → **sinalizar para aprovação humana** (não executar).
2. Tipo 2 (reversível) → executar; Tipo 1 (difícil reverter) → documentar antes.

## AGIR — execute e registre
1. Escrever o(s) rascunho(s) reversível(is) que cabem no orçamento — enxutos, fiéis à voz, autorrevisados ("isto faz alguém parar e pensar? há insight específico? soa fiel à voz da marca?").
2. Ao atingir o limite do orçamento: **parar em ponto seguro** e registrar o que ficou pendente.
3. Atualizar o estado das tarefas em `tasks/` (`[/]` em progresso, `[x] ✅ data` concluída). Para publicação, registrar `[APROVAR]` na fila humana `tasks/human.md` e **parar**.
4. Gravar aprendizados duráveis em `memoria.md` (estrutura PARA) — ex.: uma headline que converteu, uma objeção de voz recorrente.
5. **Fila vazia / sem briefing** → encerrar registrando "nada a fazer" (não inventar trabalho nem escrever peça sem demanda).

## Orçamento — fronteira honesta
- Limite de esforço por período. **Imposto por prompt + escopo de turno** — não há medidor rígido de tokens em rotina cron.
- Se rodado via ferramenta `Workflow`, o primitivo `budget` é o teto **rígido** mais próximo.
- Referência da área: **1 peça de copy por turno** (deep work); rever no máximo 2 ciclos de revisão antes de escalar para decisão humana.

## Contexto headless
- Rotinas agendadas podem não ter o contexto de autenticação interativa de alguns MCPs.
- Nesse caso, favorecer ações de **filesystem/locais** (rascunhar, revisar, organizar) e **adiar** (sinalizar) o que dependa de MCP ou publicação externa.
