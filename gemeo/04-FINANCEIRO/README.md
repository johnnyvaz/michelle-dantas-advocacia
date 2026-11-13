# 04-FINANCEIRO — Saúde financeira

Deriva de `canon.financeiro`, `canon.unit_economics` e `canon.crescimento`.
- `Metricas/metricas-saas.md` — MRR/ARR, churn, LTV/CAC, payback (via `/atualizar-financeiro`).
- `Metricas/unit-economics-por-plano.md` — decomposição por plano; espelha `unit_economics_por_plano.*` e fecha com os agregados.
- `Projecoes/break-even.md` — a conta: quantos clientes × ticket cobrem o burn.
- `Projecoes/projecao-12-meses.md` — projeção em 2 cenários (com/sem gatilho de demanda), premissas explícitas.
- `Relatorios/pnl-mensal-AAAA-MM.md` — P&L simplificado, um por competência.

**Regra**: o gateway de pagamento dá receita/assinaturas; `caixa_atual` e `burn_bruto` vêm do controle interno.
