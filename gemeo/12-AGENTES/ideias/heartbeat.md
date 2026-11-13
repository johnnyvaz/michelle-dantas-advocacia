# Ideias — Heartbeat (ciclo autônomo)

> Modo autônomo da área Ideias. Disparado pelo **agendamento nativo do Claude Code** (skill
> `schedule`/cron). Cada disparo executa **um turno** do ciclo OODA e **para**. Sem runtime separado.
> Fila filtrada por `#area/ideias`.

## OBSERVAR — colete antes de interpretar
1. Ler a fila `tasks/` filtrada pela tag da área: `#area/ideias` (Grep em `tasks/*.md`).
2. Ler os pilares e a cadência: `gemeo/06-MARKETING/redes/calendario-editorial.md`.
3. Ler a última pauta em `gemeo/06-MARKETING/redes/pautas/` e a memória da área
   (`gemeo/12-AGENTES/ideias/memoria.md`) para não repetir.
4. Anotar quanto do **orçamento** do período já foi consumido.

## ORIENTAR — interprete
1. Priorizar por prazo (📅) + prioridade (🔺/🔼/🔽).
2. Já existe pauta para o período? Duas pautas para a mesma data é ruído.
3. **Uma pauta por turno.**

## DECIDIR — escolha a intervenção mínima
1. Classificar via `_FRAMEWORK/allowlist.md`:
   - **Pesquisar sinais, escrever a pauta, abrir tarefa de handoff** → reversível/interno → pode executar.
   - **Publicar, agendar, anunciar** → não é desta área; o que for Tipo 1 vai para `tasks/human.md` pela
     área dona.
2. **Trabalho que ninguém pediu** (ex.: pauta diária automática sem item na fila) só com regra em
   `_FRAMEWORK/regras-proativas.md`. Regra nova nasce em `modo: registrar`: anota em `tasks/ideas.md`
   que teria gerado a pauta, não gera.

## AGIR — execute e registre
1. Buscar sinais cruzando cada pilar; guardar link e data.
2. Escrever a pauta no formato do `playbook.md` §3.
3. Abrir a tarefa de escolha para o dono só quando o item de origem pedir; a pauta em si não vai para
   `tasks/human.md` (não é ação irreversível).
4. Atualizar o estado da tarefa em `tasks/`.
5. Gravar aprendizado durável em `memoria.md` (ex.: pilar que nunca rende sinal). Ou **nada**.
6. **Fila vazia** → encerrar registrando "nada a fazer". Não inventar pauta.

## Orçamento — fronteira honesta
- Limite de esforço por período. **Imposto por prompt + escopo de turno**; não há medidor rígido de
  tokens em rotina cron. Teto em dinheiro, quando houver: `agentes.orcamento_por_area_usd` do canon.
- Referência da área: **1 pauta por turno**; busca na web limitada aos pilares do calendário.

## Contexto headless
- Sem busca na web disponível, a pauta sai "só acervo" e diz isso no topo.
