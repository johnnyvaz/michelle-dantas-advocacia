---
name: atualizar-financeiro
description: Atualiza MRR, ARR, assinaturas e churn do Gêmeo Digital a partir do Stripe (MCP `stripe`). Use quando o usuário pedir para atualizar financeiro, MRR, ARR, receita, assinaturas ou churn do oráculo.
---

# atualizar-financeiro — Stripe → MRR / ARR / churn

## Pré-requisito
MCP `stripe` conectado (chave restrita, leitura). Se não, **avise e pare**.

## Passos
1. Consulte o MCP `stripe`: assinaturas ativas, MRR atual, novas/canceladas no mês, receita.
2. Mapeie ao canon `gemeo/00-CANON/canon.yaml`:
   | Stripe | Campo do canon |
   |--------|----------------|
   | MRR | `snapshot.mrr` |
   | MRR × 12 | `snapshot.arr` (derivado) |
   | churn de receita / mês | `crescimento.churn_receita_mensal_pct` |
   | cancelamentos ÷ ativos | `crescimento.churn_logo_mensal_pct` |
   | MRR ÷ assinantes | `unit_economics.arpa` |
3. **Recalcule os derivados que dependem do MRR**, mostrando a conta:
   `financeiro.burn_liquido_mensal` (= `burn_bruto_mensal` − MRR) e `financeiro.runway_meses` (= `caixa_atual` ÷ burn_liquido).
4. Reflita em `gemeo/04-FINANCEIRO/*` (métricas, P&L, projeção). Anote origem+data.

## Regras
- Stripe dá **receita/assinaturas**, **não** caixa nem custos: `financeiro.caixa_atual` e `burn_bruto_mensal` vêm do controle interno — **não altere sem fonte**.
- Recalcule runway/burn a partir dos novos números (com a conta visível); não chute.
