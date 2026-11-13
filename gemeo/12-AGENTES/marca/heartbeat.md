# Marca — Heartbeat (ciclo autônomo)

> Modo autônomo da área Marca. Disparado pelo **agendamento nativo do Claude Code** (skill
> `schedule`/cron). Cada disparo executa **um turno** do ciclo OODA e **para**. Sem runtime separado.
> Fila filtrada por `#area/marca`.

## OBSERVAR — colete antes de interpretar
1. Ler a fila `tasks/` filtrada pela tag da área: `#area/marca` (Grep em `tasks/*.md`).
2. Ler a régua: `gemeo/14-MARCA/` (os arquivos que o pedido toca) e `gemeo/00-CANON/canon.yaml`
   (só para conferir número citado na peça).
3. Ler a memória da área: `gemeo/12-AGENTES/marca/memoria.md`.
4. Anotar quanto do **orçamento** do período já foi consumido.

## ORIENTAR — interprete
1. Priorizar por prazo (📅) + prioridade (🔺/🔼/🔽). Peça com publicação pendente em `tasks/human.md`
   vem primeiro: um parecer antes da decisão do dono vale mais que depois.
2. **Uma auditoria por turno.** Parecer pela metade é pior que nenhum.
3. O problema é da peça (achado) ou da marca (regra ausente ou contraditória → proposta)?

## DECIDIR — escolha a intervenção mínima
1. Classificar via `_FRAMEWORK/allowlist.md`:
   - **Auditar, escrever parecer, abrir tarefa de correção para a área dona, propor ajuste em
     `gemeo/PROPOSTAS/`** → reversível/interno → pode executar.
   - **Editar `14-MARCA/`, aplicar correção na peça, publicar** → não é desta área. Mudança de marca é
     decisão do dono; publicação é Tipo 1 e vai para `tasks/human.md`.
2. **Trabalho que ninguém pediu** (ex.: varrer o site por drift sem item na fila) só com regra em
   `_FRAMEWORK/regras-proativas.md`. Regra nova nasce em `modo: registrar`: anota em `tasks/ideas.md`
   o que teria auditado, não audita.

## AGIR — execute e registre
1. Escrever o parecer no formato do `playbook.md`, ao lado da peça ou anexado à tarefa.
2. Achado crítico ou importante → item na fila da área dona (`#area/copy`, `#area/design`,
   `#area/desenvolvimento`), herdando o pedido da tarefa auditada.
3. Atualizar o estado da tarefa em `tasks/` (`[/]` em progresso; concluído sai para `concluidas.md`).
4. Gravar aprendizado durável em `memoria.md` (ex.: regra que gera atrito recorrente). Ou **nada**.
5. **Fila vazia** → encerrar registrando "nada a fazer". Não inventar auditoria.

## Orçamento — fronteira honesta
- Limite de esforço por período. **Imposto por prompt + escopo de turno**; não há medidor rígido de
  tokens em rotina cron. Teto em dinheiro, quando houver: `agentes.orcamento_por_area_usd` do canon.
- Referência da área: **1 parecer por turno**.

## Contexto headless
- Peça que só existe atrás de login ou de MCP sem autenticação → adiar e sinalizar, não auditar de memória.
