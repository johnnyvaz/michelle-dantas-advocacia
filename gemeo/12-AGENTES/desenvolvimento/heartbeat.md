# Heartbeat — Desenvolvimento (ciclo autônomo)

> Modo autônomo da área de Desenvolvimento. Disparado pelo **agendamento nativo do Claude Code** (skill `schedule`/cron). Cada disparo executa **um turno** do ciclo OODA e **para**. Sem runtime separado.

## OBSERVAR — colete antes de interpretar

1. Ler a fila `tasks/` filtrada pela tag da área: `#area/desenvolvimento` (Grep em `tasks/*.md`) — incluir `bugs.md`, `backlog.md`, `features.md`.
2. Ler o canon + contexto: `gemeo/00-CANON/canon.yaml` (`produto`, `metas`), `gemeo/07-PRODUTO/STATUS.md` (estado real do código) e `CLAUDE.md` + `.claude/rules/`.
3. Ler a memória da área: `gemeo/12-AGENTES/desenvolvimento/memoria.md`.
4. Varrer sinais técnicos:
   - Incidente/alerta aberto (P1/P2) → tem prioridade absoluta.
   - PR aguardando revisão de QA; build aprovado aguardando deploy.
   - Regressão do quality-gate / achados de guards registrados em `tasks/`.
   - Bug, erro de tipo/build, teste falhando, lint quebrado.
   - Migration pendente; risco de segurança/LGPD.
5. Anotar quanto do **orçamento** do período já foi consumido.

## ORIENTAR — interprete

1. Priorizar por prazo (📅) + prioridade (🔺/🔼/🔽). Incidente P1 > bug em caminho crítico > feature.
2. Quais tarefas cabem no orçamento restante?
3. Bloqueador é sistêmico (ex.: gargalo é go-to-market, não engenharia — canon) ou local?
4. Ordem de prioridade do produto: disponibilidade > conclusão de fluxo crítico > qualidade do entregável > segurança contínua.

## DECIDIR — escolha a intervenção mínima

1. Classificar via `_FRAMEWORK/allowlist.md`:
   - **reversível/interna** (escrever teste, implementar em branch, rodar quality gate local, abrir PR, registrar bug em `tasks/`, redigir post-mortem) → executar autonomamente;
   - **irreversível/externa** (deploy em produção, aplicar migration em produção, `DROP`, mudar variável de ambiente em produção, mexer em dado de cliente) → **sinalizar para aprovação humana**; **não** executar.
2. **QA antes de deploy, sempre** — o autor não se autocertifica. Deploy só após ✅ APROVADO.

## AGIR — execute e registre

1. Executar as ações reversíveis que cabem no orçamento. Aplicar TDD (red→green→refactor) e rodar o quality gate (sem regressão) antes de propor merge.
2. Ao atingir o limite do orçamento: **parar em ponto seguro** e registrar o pendente.
3. Atualizar `tasks/` (`[/]` em progresso, `[x] ✅ data` concluída). Todo problema novo fora de escopo → registrar em `tasks/` (nunca em silêncio).
4. Gravar aprendizados duráveis em `memoria.md` (PARA) — ex.: causa raiz de um bug, decisão de arquitetura.
5. **Fila vazia / sem incidente** → encerrar registrando "nada a fazer". Não inventar refactor.

## Orçamento — fronteira honesta

- Limite de esforço por turno, imposto por prompt + escopo. Sem medidor rígido de tokens em cron.
- Parâmetros de referência (ajustar por área): `intervalo` do disparo e `teto de esforço por período`. SLAs (ex.: 99,5%) e Lighthouse ≥ 90 são defaults herdados — **ajustáveis**.

## Contexto headless

- Rotinas agendadas podem não ter o contexto de MCPs interativos (admin de banco, hospedagem, repositório).
- Nesse caso, favorecer ações de **filesystem/locais** (escrever teste, implementar, rodar gate local, abrir PR) e **adiar** (sinalizar) o que depende de MCP/deploy indisponível. Deploy é sempre Tipo 1 → aprovação humana.
