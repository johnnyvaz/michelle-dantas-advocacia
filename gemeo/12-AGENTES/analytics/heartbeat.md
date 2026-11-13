# Analytics — Heartbeat (ciclo autônomo)

> Modo autônomo da área Analytics. Disparado pelo **agendamento nativo do Claude Code** (skill
> `schedule`/cron). Cada disparo executa **um turno** do ciclo OODA e **para**. Sem runtime separado.
> Fila filtrada por `#area/analytics`.

## OBSERVAR — colete antes de interpretar
1. Ler a fila `tasks/` filtrada pela tag da área: `#area/analytics` (Grep em `tasks/*.md`).
2. Ler o contexto: `gemeo/06-MARKETING/redes/` (`metas-kpis.md`, `crescimento-semanal.md`,
   `modelo-relatorio.md`) e o canon (`marca.redes[]`, `metas.social`, `crescimento.*`).
3. Ler a memória da área: `gemeo/12-AGENTES/analytics/memoria.md`.
4. Conferir quais MCPs estão autenticados nesta execução (`google-analytics`, `meta-ads`, `search-console`).
5. Anotar quanto do **orçamento** do período já foi consumido.

## ORIENTAR — interprete
1. Priorizar por prazo (📅) + prioridade (🔺/🔼/🔽).
2. A série tem buraco? Coleta pendente vem antes de relatório: relatório sobre série furada esconde o furo.
3. **Um relatório por turno**; coleta de várias redes cabe no mesmo turno.

## DECIDIR — escolha a intervenção mínima
1. Classificar via `_FRAMEWORK/allowlist.md`:
   - **Ler métricas, anexar linha à série, escrever relatório, propor atualização do canon, abrir
     tarefa de recomendação** → reversível/interno → pode executar.
   - **Alterar campanha, gastar, publicar, responder audiência** → não é desta área; o que for Tipo 1
     vai para `tasks/human.md` pela área dona.
2. **Trabalho que ninguém pediu** (ex.: relatório mensal sem item na fila, coleta semanal automática)
   só com regra em `_FRAMEWORK/regras-proativas.md`. Regra nova nasce em `modo: registrar`: anota em
   `tasks/ideas.md` o que teria coletado ou relatado, não executa.

## AGIR — execute e registre
1. Coletar o que o MCP permitir; anexar à série com `Fonte` e `Coletado em`.
2. Escrever o relatório no formato de `modelo-relatorio.md`, com as contas saídas de script.
3. Abrir de 2 a 4 tarefas de recomendação para a área que executa (tabela do `playbook.md` §4).
4. Atualizar o estado da tarefa em `tasks/`.
5. Gravar aprendizado durável em `memoria.md` (ex.: rede cuja métrica muda de definição). Ou **nada**.
6. **Fila vazia** → encerrar registrando "nada a fazer". Não inventar leitura.

## Orçamento — fronteira honesta
- Limite de esforço por período. **Imposto por prompt + escopo de turno**; não há medidor rígido de
  tokens em rotina cron. Teto em dinheiro, quando houver: `agentes.orcamento_por_area_usd` do canon.
- Referência da área: **1 relatório por turno**.

## Contexto headless
- Rotinas agendadas costumam não ter a autenticação interativa dos MCPs de métrica.
- Sem MCP: registrar a semana como lacuna em `crescimento-semanal.md` e adiar. Nunca estimar o número.
