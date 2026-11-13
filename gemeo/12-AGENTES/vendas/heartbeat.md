# Heartbeat — Vendas (ciclo autônomo)

> Modo autônomo da área de Vendas. Disparado pelo **agendamento nativo do Claude Code** (skill `schedule`/cron). Cada disparo executa **um turno** do ciclo OODA e **para**. Sem runtime separado.

## OBSERVAR — colete antes de interpretar

1. Ler a fila `tasks/` filtrada pela tag da área: `#area/vendas` (Grep em `tasks/*.md`).
2. Ler o canon + contexto da área: `gemeo/00-CANON/canon.yaml` (`planos`, `crescimento`, `metas`), `gemeo/06-MARKETING/` e `gemeo/09-CLIENTES/`.
3. Ler a memória da área: `gemeo/12-AGENTES/vendas/memoria.md`.
4. Varrer o estado do funil que estiver registrado nas tarefas:
   - Respostas de prospects não tratadas (classificar: interesse / não-interesse / já viu o material).
   - Follow-ups vencidos pela cadência do playbook (+5 / +7 / +14 dias).
   - Leads qualificados aguardando descoberta/proposta.
   - Contas em onboarding (D+0…D+90) e seus check-ins do dia; contas 🟡/🔴.
   - Contratos próximos do fim (<30 dias) → janela de renovação.
5. Anotar quanto do **orçamento** do período já foi consumido.

## ORIENTAR — interprete

1. Priorizar por prazo (📅) + prioridade (🔺/🔼/🔽).
2. Quais tarefas cabem no orçamento restante?
3. Bloqueador é sistêmico (ex.: o gargalo de conversão topo→pago declarado no canon) ou local?
4. Métricas no alvo? Aplicar **satisficing** — se os 3 indicadores-chave estão verdes, não otimizar o que já funciona.

## DECIDIR — escolha a intervenção mínima

1. Para cada tarefa candidata, classificar via `_FRAMEWORK/allowlist.md`:
   - **reversível/interna** (rascunhar mensagem, atualizar estágio no pipeline, preparar follow-up, anotar score de saúde) → pode executar autonomamente;
   - **irreversível/externa** (enviar mensagem a prospect/cliente real, enviar proposta, dar desconto, prometer preço fora do canon) → **sinalizar para aprovação humana** em `tasks/human.md` (deduplicando), **não** executar.
2. Aplicar Tipo 1 vs Tipo 2 do playbook: desconto > 15% ou proposta fora do padrão = Tipo 1 → escalar.

## AGIR — execute e registre

1. Executar as ações reversíveis que cabem no orçamento (preparar drafts, organizar pipeline, montar relatório de conversão).
2. Ao atingir o limite do orçamento: **parar em ponto seguro** e registrar o pendente.
3. Atualizar o estado das tarefas em `tasks/` (`[/]` em progresso, `[x] ✅ data` concluída).
4. Gravar aprendizados duráveis em `memoria.md` (padrão PARA) — ex.: objeção nova + script que funcionou.
5. **Fila vazia / sem fonte** → encerrar registrando "nada a fazer". Não inventar prospecção.

## Orçamento — fronteira honesta

- Limite de esforço por turno, imposto por prompt + escopo. Não há medidor rígido de tokens em rotina cron.
- Parâmetros de referência (ajustar por área): `intervalo` do disparo e `teto de esforço por período`. A cota de "~5 primeiros contatos/dia" do playbook é um default herdado — **ajustável**.

## Contexto headless

- Rotinas agendadas podem não ter o contexto de MCPs interativos (WhatsApp/CRM externo).
- Nesse caso, favorecer ações de **filesystem/locais** (rascunhos, organização do pipeline em `tasks/`) e **adiar** (sinalizar) o que depende de MCP/canal indisponível.
