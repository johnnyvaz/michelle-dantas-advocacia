# Estúdio — Heartbeat (ciclo autônomo)

> Modo autônomo da área Estúdio. Disparado pelo **agendamento nativo do Claude Code** (skill
> `schedule`/cron). Cada disparo executa **um turno** do ciclo OODA e **para**. Sem runtime separado.
> Fila filtrada por `#area/estudio`.

## OBSERVAR — colete antes de interpretar
1. Ler a fila `tasks/` filtrada pela tag da área: `#area/estudio` (Grep em `tasks/*.md`).
2. Para cada item, confirmar que o conteúdo de origem existe e está pronto (não é rascunho).
3. Ler `gemeo/14-MARCA/identidade-visual.md` e `acessibilidade.md`.
4. Ler a memória da área: `gemeo/12-AGENTES/estudio/memoria.md`.
5. Anotar quanto do **orçamento** do período já foi consumido.

## ORIENTAR — interprete
1. Priorizar por prazo (📅) + prioridade (🔺/🔼/🔽). Gravação marcada vem primeiro.
2. Origem não pronta → o trabalho não é desta área; devolver para a área dona.
3. **Um kit por turno.**

## DECIDIR — escolha a intervenção mínima
1. Classificar via `_FRAMEWORK/allowlist.md`:
   - **Escrever o kit (roteiros, deck-plan, artefatos), abrir tarefa de lacuna** → reversível/interno →
     pode executar.
   - **Gravar, editar vídeo, publicar, subir para o player** → humano ou Tipo 1 → `tasks/human.md`, e parar.
2. **Trabalho que ninguém pediu** (ex.: produzir kit de toda aula nova sem item na fila) só com regra
   em `_FRAMEWORK/regras-proativas.md`. Regra nova nasce em `modo: registrar`: anota em `tasks/ideas.md`
   que teria produzido o kit, não produz.

## AGIR — execute e registre
1. Seguir o pipeline do `playbook.md` §1 e rodar o checklist §4.
2. Lacuna na origem → tarefa `#area/conteudo-cursos` ou `#area/copy`, herdando o pedido.
3. Atualizar o estado da tarefa em `tasks/`.
4. Gravar aprendizado durável em `memoria.md` (ex.: taxa de fala real medida na gravação). Ou **nada**.
5. **Fila vazia** → encerrar registrando "nada a fazer". Não escolher sozinho o que encenar.

## Orçamento — fronteira honesta
- Limite de esforço por período. **Imposto por prompt + escopo de turno**; não há medidor rígido de
  tokens em rotina cron. Teto em dinheiro, quando houver: `agentes.orcamento_por_area_usd` do canon.
- Referência da área: **1 kit por turno**.

## Contexto headless
- O kit é só arquivo: cabe inteiro no modo headless. Render de deck que dependa de ferramenta gráfica
  ou de outra máquina → adiar e sinalizar.
