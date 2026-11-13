# Métricas SaaS — Painel de saúde recorrente

> **Template** — preenchido via /montar-gemeo. Deriva do canon: `snapshot.{mrr,arr,ticket_medio,clientes_pagantes}`, `unit_economics.{cac,ltv,ltv_cac,payback_cac_meses,arpa}`, `crescimento.{churn_logo_mensal_pct,churn_receita_mensal_pct,lifetime_meses_estimado}`, `financeiro.{margem_bruta_pct,custo_servico_por_cliente_mes,burn_bruto_mensal,burn_liquido_mensal,caixa_atual,runway_meses}`.
> **Citação parseável**: todo número preenchido usa o marcador `R$ X [canon: path.do.campo]` ou `N [calc: metrica]` — o CI compara com o canon e acusa drift (specs/001-melhorias-gemeo/contracts/formatos-arquivos.md).

**Data de referência**: `AAAA-MM-DD` (`_meta.data_referencia`) · **Estágio**: [PREENCHER] · **Moeda**: `_meta.moeda`

> ⚠️ **Ressalva early-stage**: se a carteira pagante e o tempo de operação forem pequenos (`snapshot.clientes_pagantes`, `snapshot.meses_operacao`), as métricas de unit economics (CAC, LTV, LTV/CAC, payback, lifetime) são **diretrizes calculadas sobre amostra pequena**, não certezas estatísticas. O churn tende a subir conforme a base cresce, o que comprime LTV e LTV/CAC. Trate como sinais de direção. (Remova esta ressalva quando a base for estatisticamente robusta.)

---

## 1. Painel consolidado

| Métrica | Valor | Campo do canon | Fórmula / definição |
|---------|------:|----------------|---------------------|
| MRR | `R$ [X]` | `snapshot.mrr` | Receita recorrente mensal (soma da carteira pagante) |
| ARR | `R$ [X]` | `snapshot.arr` | MRR × 12 |
| Ticket médio (ARPA) | `R$ [X]` | `unit_economics.arpa` | MRR ÷ `snapshot.clientes_pagantes` |
| CAC | `R$ [X]` | `unit_economics.cac` | (marketing + esforço de vendas) ÷ novos pagantes |
| LTV | `R$ [X]` | `unit_economics.ltv` | ARPA × margem bruta × lifetime |
| LTV/CAC | `[X]×` | `unit_economics.ltv_cac` | LTV ÷ CAC |
| Payback do CAC | `[N]` meses | `unit_economics.payback_cac_meses` | CAC ÷ (ARPA × margem bruta) |
| Churn de logo | `[X]%`/mês | `crescimento.churn_logo_mensal_pct` | % de **contas** que cancelam/mês |
| Churn de receita | `[X]%`/mês | `crescimento.churn_receita_mensal_pct` | % de **MRR** perdido/mês |
| Margem bruta | `[X]%` | `financeiro.margem_bruta_pct` | (receita − custo de servir) ÷ receita |
| Custo de servir | `R$ [X]`/conta/mês | `financeiro.custo_servico_por_cliente_mes` | custo direto (infra + APIs) por conta |
| Burn bruto | `R$ [X]`/mês | `financeiro.burn_bruto_mensal` | soma de todos os custos mensais |
| Burn líquido | `R$ [X]`/mês | `financeiro.burn_liquido_mensal` | burn bruto − receita |
| Runway | `[N]` meses | `financeiro.runway_meses` | caixa ÷ burn líquido |

Legenda de saúde (preencher): 🟢 saudável · 🟡 atenção · 🔴 risco.

---

## 2. Receita
- **MRR** — número-âncora; todo o resto (ARR, ticket, projeções) deriva dele.
- **ARR** — `MRR × 12`. É como investidores comparam SaaS entre si.
- **ARPA** — `MRR ÷ pagantes`. Sobe quando a carteira tem planos de topo puxando a média.

## 3. Unit economics
- **CAC** — custo de adquirir um cliente pagante. Compare com o ciclo de vendas (`crescimento.ciclo_vendas_dias`).
- **LTV** — `ARPA × margem bruta × lifetime`, onde `lifetime = 1 ÷ churn de receita` (`crescimento.lifetime_meses_estimado`).
- **LTV/CAC** — referência de mercado **≥ 3×**. Acima é forte; abaixo, a aquisição não se paga.
- **Payback do CAC** — `CAC ÷ (ARPA × margem)`. **< 12 meses** é ótimo em SaaS.

## 4. Retenção (churn)
- **Churn de logo** mede *quantos clientes* saem; **churn de receita** mede *quanto dinheiro* sai.
- Em SaaS B2B saudável, **churn de receita < churn de logo**: quem cancela tende a ser conta de ticket baixo, e as contas maiores ficam.
- `lifetime ≈ 1 ÷ churn de receita` → base do cálculo de LTV.

## 5. Margem e custo de servir
- **Margem bruta** isola o custo de *entregar* o serviço (infra + APIs por conta), não o de *vender*.
- **Custo de servir** é variável por conta e deve **escalar bem**: dobrar a base não dobra o custo unitário. Confronte com a decomposição em `unit-economics-por-plano.md`.

## 6. Caixa e sobrevivência
- **Burn bruto** = soma das linhas de `financeiro.custos.*` (ver `Relatorios/pnl-mensal-AAAA-MM.md`).
- **Burn líquido** = `burn bruto − receita`. É o quanto o caixa cai de fato por mês.
- **Runway** = `caixa ÷ burn líquido`. Aponte o mês previsto de fim de caixa — é o principal risco operacional. Detalhe mês a mês em `Projecoes/projecao-12-meses.md`.

---

## 7. Síntese para o oráculo
- **"Qual a margem? Têm lucro?"** → margem bruta `[X]%`; lucro líquido [PREENCHER: sim/não] — o burn líquido é `R$ [X]`/mês. Distinga: produto rentável por conta vs. empresa ainda no prejuízo por falta de volume de receita.
- **"CAC e LTV?"** → CAC `R$ [X]`, LTV `R$ [X]`, LTV/CAC `[X]×`, payback `[N]` meses. Com a ressalva de amostra early-stage quando aplicável.

**Fonte**: `00-CANON/canon.yaml`.
