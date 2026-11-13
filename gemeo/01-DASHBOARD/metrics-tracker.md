# Metrics Tracker — Tabela mensal de KPIs

> **Template** — preenchido via /montar-gemeo. Deriva do canon: `_meta.data_referencia`, `snapshot.mrr`, `snapshot.clientes_total`, `snapshot.uso_produto.*`, `financeiro.runway_meses`, `unit_economics.*`, `crescimento.*`, `metas.m6_meses.*`, `metas.m12_meses.*`.
> **Citação parseável**: todo número preenchido usa o marcador `R$ X [canon: path.do.campo]` ou `N [calc: metrica]` — o CI compara com o canon e acusa drift (specs/001-melhorias-gemeo/contracts/formatos-arquivos.md).

**Data de referência:** AAAA-MM-DD
**Fonte dos dados:** [`../00-CANON/canon.yaml`](../00-CANON/canon.yaml)

> **Regra de atualização:** a coluna "Atual" só muda quando o campo correspondente no `canon.yaml` muda. Nunca edite esta tabela de forma independente — ela apenas formata o canon e o compara com `metas`.

---

## Tabela de KPIs

Uma linha por KPI que importa para o negócio. Cada linha aponta o campo do canon
que a alimenta (coluna "Fonte — Atual") e o campo de meta correspondente.

| KPI | Atual (AAAA-MM-DD) | Meta 6m | Meta 12m | Fonte — Atual | Fonte — Metas |
|-----|-------------------|---------|----------|---------------|---------------|
| MRR | R$ [X] | R$ [X] | R$ [X] | `snapshot.mrr` | `metas.m6_meses.*` / `metas.m12_meses.*` |
| Clientes pagantes (total) | [N] | [N] | [N] | `snapshot.clientes_total` | `metas.m6_meses.*` / `metas.m12_meses.*` |
| [PREENCHER: KPI de uso do produto nº1] | [N] | [N] | [N] | `snapshot.uso_produto.*` | `metas.m6_meses.*` / `metas.m12_meses.*` |
| [PREENCHER: KPI de uso do produto nº2] | [N] | [N] | [N] | `snapshot.uso_produto.*` | `metas.m6_meses.*` / `metas.m12_meses.*` |
| [PREENCHER: marco de canal/parceria] | [N] | [N] | [N] | [PREENCHER: campo do canon ou "sem registro"] | `metas.m6_meses.*` / `metas.m12_meses.*` |
| Runway | [N] meses | — | Objetivo pós-rodada: [N] meses | `financeiro.runway_meses` | `fundraising.objetivo_pos_rodada` |

---

## Notas

Use uma nota numerada para cada divergência ou ausência que mereça explicação,
de forma a nunca "maquiar" o número. Padrões comuns:

**(¹) Meta 6m abaixo do valor atual** — registre que é a meta conservadora do canon
e que o número permanece como está; não corrija para aparentar crescimento linear.

**(²) Meta derivada de outro documento** — se `metas.*` não registra o KPI, cite o
documento de produto/estratégia de onde a meta foi extraída e confirme a consistência.

**(³) Marco ainda em zero** — se o canon não registra o item (ex.: parceria não
formalizada), o valor correto é zero; a meta vira o primeiro marco a alcançar.

**(⁴) KPI sem meta por período** — se não há meta de 6m/12m, aponte o objetivo
qualitativo equivalente (ex.: `fundraising.objetivo_pos_rodada`).

---

## KPIs de Unit Economics (referência)

| Indicador | Valor | Fonte |
|-----------|-------|-------|
| CAC | R$ [X] | `unit_economics.cac` |
| LTV | R$ [X] | `unit_economics.ltv` |
| LTV/CAC | [N] | `unit_economics.ltv_cac` |
| Payback do CAC | [N] meses | `unit_economics.payback_cac_meses` |
| Ticket médio (ARPA) | R$ [X] | `unit_economics.arpa` |
| Churn logo mensal | [X]% | `crescimento.churn_logo_mensal_pct` |
| Churn receita mensal | [X]% | `crescimento.churn_receita_mensal_pct` |
| Lifetime estimado | [N] meses | `crescimento.lifetime_meses_estimado` |
| Novos pagantes/mês (média) | [N] | `crescimento.novos_clientes_pagantes_mes` |
| Conversão free → pago | [X]% | `crescimento.conversao_free_para_pago_pct` |

> **Ressalva:** em estágio early-stage, unit economics são calculados sobre amostra
> pequena. Trate como diretrizes, não como certezas estatísticas — registre a
> ressalva conforme `_meta.natureza` do canon.
