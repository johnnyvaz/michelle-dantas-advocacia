# Social — Heartbeat (ciclo autônomo)

> Modo autônomo da área Social. Disparado pelo **agendamento nativo do Claude Code** (skill
> `schedule`/cron). Cada disparo executa **um turno** do ciclo OODA e **para**. Sem runtime separado.
> Fila filtrada por `#area/social`.

## OBSERVAR — colete antes de interpretar
1. Ler a fila `tasks/` filtrada pela tag da área: `#area/social` (Grep em `tasks/*.md`).
2. Ler a pauta mais recente do `agente-ideias` e `gemeo/06-MARKETING/redes/calendario-editorial.md`.
3. Ler em `tasks/human.md` os pedidos de publicação já abertos (para não duplicar).
4. Ler a memória da área: `gemeo/12-AGENTES/social/memoria.md`.
5. Anotar quanto do **orçamento** do período já foi consumido.

## ORIENTAR — interprete
1. Priorizar por prazo (📅) + prioridade (🔺/🔼/🔽). Peça com data de publicação mais próxima primeiro.
2. Há pauta para a semana? Sem pauta, o trabalho é pedir pauta, não produzir post.
3. Um pacote de rede por vez: fechar uma rede antes de abrir a próxima.

## DECIDIR — escolha a intervenção mínima
1. Classificar via `_FRAMEWORK/allowlist.md`:
   - **Montar calendário, adaptar por rede, escrever pacote, rascunhar resposta, abrir tarefa** →
     reversível/interno → pode executar.
   - **Publicar, agendar de fato na plataforma, enviar resposta pública ou DM** → irreversível/externo
     → **sinalizar em `tasks/human.md` e parar**. Nunca executar.
2. **Trabalho que ninguém pediu** (ex.: montar a semana sem item na fila, varrer comentários) só com
   regra em `_FRAMEWORK/regras-proativas.md`. Regra nova nasce em `modo: registrar`: anota em
   `tasks/ideas.md` o que teria feito, não faz.

## AGIR — execute e registre
1. Escrever o(s) pacote(s) que cabem no orçamento (`playbook.md` §3).
2. Criar ou atualizar **um** pedido de publicação por semana em `tasks/human.md`, deduplicado, e **parar**.
3. Lead quente → tarefa `#area/vendas`; falta arte → `#area/design`; falta pauta → `#area/ideias`.
4. Atualizar o estado da tarefa em `tasks/`.
5. Gravar aprendizado durável em `memoria.md`. Ou **nada**.
6. **Fila vazia / sem pauta** → encerrar registrando "nada a fazer". Não inventar post.

## Orçamento — fronteira honesta
- Limite de esforço por período. **Imposto por prompt + escopo de turno**; não há medidor rígido de
  tokens em rotina cron. Teto em dinheiro, quando houver: `agentes.orcamento_por_area_usd` do canon.
- Referência da área: **1 semana de pacotes por turno**.

## Contexto headless
- Sem acesso às plataformas, a área trabalha só em arquivo (calendário, pacote, rascunho), que é
  exatamente o que lhe cabe. Ler comentários que dependem de MCP sem autenticação → adiar e sinalizar.
