---
name: atualizar-gemeo
description: Atualiza o Gêmeo Digital rodando todas as fontes de dados conectadas (produto, financeiro, analytics, ranking, jira) e consolidando o canon. Use quando o usuário pedir para "atualizar o gêmeo", "atualizar tudo", "refresh dos dados" ou antes de uma demo/reunião.
gates: [canon-ancorado, dado-datado]
---

# atualizar-gemeo — orquestradora

Roda as skills de atualização das fontes **conectadas** e consolida o canon (`gemeo/00-CANON/canon.yaml`).

## Passos
1. Verifique quais MCPs estão conectados (`claude mcp list`, ou tente cada um): `supabase`,
   `github`, `stripe`, `ga4`, `search-console`, `atlassian`.
2. Execute, **nesta ordem** (fonte da verdade primeiro), só para os conectados:
   1. `atualizar-produto` (Supabase/GitHub) — carteira, uso, STATUS.
   2. `atualizar-financeiro` (Stripe) — MRR/ARR/churn.
   3. `atualizar-analytics` (GA4) — crescimento/conversão.
   4. `atualizar-ranking` (Search Console) — SEO/aquisição.
   5. `atualizar-jira` (Atlassian) — OKRs/operações/roadmap.
   Liste os **não conectados** — e **não invente** os dados deles.
3. **Recalcule os derivados do canon** de forma consistente (uma vez, no fim):
   `arr`, `clientes_total`, `ticket_medio`, `burn_liquido_mensal`, `runway_meses`, `concentracao.*`.
4. Atualize `gemeo/01-DASHBOARD/metrics-tracker.md`.
5. Carimbe `_meta.data_referencia` no canon com a data de hoje e registre as fontes usadas.
6. Resuma ao usuário: tabela `campo: antes → depois (fonte)` e quais fontes faltaram.

## Regras
- Produto (Supabase) e financeiro (Stripe) **antes** do resto — são a fonte da verdade.
- O canon é a única fonte da verdade; derivados são **recalculados**, nunca chutados.
- Sem fonte conectada para um número → **mantém o valor** e marca como "não atualizado".
