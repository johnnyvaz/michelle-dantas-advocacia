# Agendamento do Heartbeat (modo autônomo) — como ligar

> Como disparar os ciclos OODA dos agentes (FR-008) usando o **agendamento nativo do Claude Code** (skill `schedule` / rotinas cron). Sem runtime separado.
>
> ⚠️ **Criar uma rotina agendada é uma ação recorrente que roda sozinha.** Este documento dá o procedimento; **quem liga é você** (decisão do fundador). Não há cron criado por padrão.

## O que é disparado

Cada disparo executa **um turno** do ciclo OODA de uma área, lendo o `heartbeat.md` daquela área. O prompt agendado deve ser, em essência:

```
Execute um ciclo de heartbeat da área <ÁREA> seguindo
gemeo/12-AGENTES/<area>/heartbeat.md e gemeo/12-AGENTES/_FRAMEWORK/allowlist.md.
Pegue tarefas #area/<area> da fila tasks/, faça o que cabe no orçamento,
sinalize ações irreversíveis em tasks/human.md ([APROVAR]) e pare reportando pendências.
```

## Como ligar (skill `schedule`)

1. Defina **cadência conservadora** por área (comece raro e aumente pelo volume real): **1×/dia** para marketing/copy/conteudo-cursos; **dias úteis** para vendas; **semanal** para financeiro/operacoes.
2. Use a skill `/schedule` para criar a rotina com o prompt acima (uma rotina por área, ou uma do orquestrador que despacha as áreas com fila).
3. Defina o **orçamento por disparo** (teto de esforço) — ver "fronteira honesta" abaixo.

## Orçamento — fronteira honesta (research.md D4)

- O orçamento é **mole**: imposto por prompt + escopo de um turno. **Não** há medidor rígido de tokens em rotina cron.
- Para teto **rígido**, rode o ciclo via a ferramenta `Workflow` (primitivo `budget`).
- Ao atingir o limite, o agente **para em ponto seguro** e registra o pendente.

## Contexto headless

- Rotinas agendadas podem **não** ter a autenticação interativa de alguns MCPs (`google-analytics`, `meta-ads`, `stripe`, etc.).
- Por isso o modo autônomo favorece ações de **filesystem/locais** (rascunhar, triar `tasks/`, atualizar gemeo/memória) e **adia/sinaliza** as que dependem de MCP indisponível.

## Allowlist (sempre)

Toda rotina respeita `gemeo/12-AGENTES/_FRAMEWORK/allowlist.md`: publicar, enviar a lead/cliente, gastar, `push` em prod/main e apagar dados **exigem aprovação humana** (a rotina registra na fila humana `tasks/human.md` com `[APROVAR]`, não executa).

## Alimentando a fila automaticamente

Para que os agentes autônomos tenham trabalho despachável, alimente a fila `tasks/` (com tag `#area/<area>`) a partir de duas fontes: **lacunas do cérebro** (campos `null` no canon, seções incompletas em `COMPLETUDE.md`, propostas em `gemeo/PROPOSTAS/`) e **achados de qualidade** (apontamentos do `/sonarqube` / `/quality-check`). A geração automática dessa fila é opcional e fica a cargo do projeto — não há gerador embutido por padrão.

Gerar tarefa sozinho é trabalho que ninguém pediu, então passa por uma regra de
[`regras-proativas.md`](regras-proativas.md). Toda regra começa em `modo: registrar`: por um tempo,
o heartbeat só anota em `tasks/ideas.md` o que teria criado. Promova a regra para `agir` depois
que os registros mostrarem que ela acerta. Ligue o agendamento com as regras ainda em `registrar`.
