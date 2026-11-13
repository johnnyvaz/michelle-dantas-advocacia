# Heartbeat — Financeiro (ciclo autônomo)

> Modo autônomo da área. Disparado pelo agendamento nativo do Claude Code (skill `schedule`/cron). Cada disparo executa **um turno** do ciclo OODA e **para**.

## OBSERVAR — colete antes de interpretar
1. Ler a fila filtrada pela área: `#area/financeiro` (Grep em `tasks/*.md`).
2. Ler o canon + contexto: `gemeo/00-CANON/canon.yaml` (`financeiro`, `unit_economics`, `planos`, `crescimento`, `metas`) e `gemeo/04-FINANCEIRO/`.
3. Ler a memória: `gemeo/12-AGENTES/financeiro/memoria.md`.
4. Anotar quanto do **orçamento** (esforço) do período já foi consumido.

## ORIENTAR — interprete
1. Priorizar por prazo (📅) + prioridade (🔺/🔼/🔽).
2. Algum número-chave mudou (burn, preço, receita)? Recalcular break-even e runway.
3. Há lacuna nova no canon (custo `null` que já dá para preencher)? É local ou sistêmica?

## DECIDIR — escolha a intervenção mínima
1. Classificar cada tarefa via `_FRAMEWORK/allowlist.md`:
   - **reversível/interna** (relatório, recálculo, atualizar memória/gêmeo) → executar;
   - **irreversível/externa** (mudar preço no gateway de pagamento, gastar, deploy) → **sinalizar para aprovação humana**, não executar.

## AGIR — execute e registre
1. Executar as reversíveis que cabem no orçamento (recalcular unit economics, break-even; rascunhar P&L/relatório).
2. Ao atingir o limite: **parar em ponto seguro** e registrar o pendente.
3. Atualizar `tasks/` (`[/]` em progresso, `[x] ✅ data` concluída).
4. Gravar aprendizados duráveis em `memoria.md` (padrão PARA).
5. **Fila vazia / sem fonte** → encerrar com "nada a fazer" (não inventar trabalho).

## Orçamento — fronteira honesta
- Teto de esforço por período, **imposto por prompt + escopo de turno** (não há medidor rígido de tokens em rotina cron).
- Se rodado via `Workflow`, o primitivo `budget` é o teto rígido mais próximo.

## Contexto headless
- Rotinas agendadas podem não ter o contexto interativo de MCPs (gateway de pagamento, banco). Nesse caso, favorecer ações de filesystem (recálculo sobre o canon) e **adiar** o que depende de MCP indisponível.
