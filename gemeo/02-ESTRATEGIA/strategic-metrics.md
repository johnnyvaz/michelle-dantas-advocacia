# Métricas Estratégicas — North Star e guardrails

> **Template** — preenchido via /montar-gemeo. Deriva do canon: `snapshot.uso_produto.*`, `crescimento.*`, `unit_economics.*`, `financeiro.*`, `concentracao.*`, `metas.m6_meses.*`, `metas.m12_meses.*`.
> **Citação parseável**: todo número preenchido usa o marcador `R$ X [canon: path.do.campo]` ou `N [calc: metrica]` — o CI compara com o canon e acusa drift (specs/001-melhorias-gemeo/contracts/formatos-arquivos.md).

---

## North Star Metric

> ## ⭐ [PREENCHER: a métrica que captura valor entregue ao cliente]
> **Definição:** [PREENCHER — defina sem ambiguidade o que conta e em qual janela].
> **Hoje (AAAA-MM-DD):** `[N]` (`snapshot.uso_produto.*`).

### Por que esta é a North Star

A North Star tem que capturar **valor entregue ao cliente**, não vaidade. Critérios para escolher a sua:

- Mede **uso real**, não intenção (um cadastro mede intenção; o produto sendo usado mede valor).
- **Antecede receita e retenção:** cliente que extrai valor renova, expande, vira referência; cliente sem uso é churn latente.
- **Alimenta o ativo defensável** (lock-in / dados acumulados).
- Conecta diretamente às metas de 12 meses (`metas.m12_meses.*`).

> **Honestidade de instrumentação:** se a métrica composta ainda não é medida diretamente, declare o **proxy** atual (`snapshot.uso_produto.*`) e registre que instrumentar a North Star real é tarefa de produto (`produto.em_construcao`).

---

## Árvore de métricas

A North Star se decompõe em quatro alavancas. Mover qualquer uma move a North Star — e cada uma tem dono e meta no canon.

```
                    ⭐ [NORTH STAR]
                  (proxy: snapshot.uso_produto.*)
                              │
   ┌──────────────┬──────────┴──────────┬───────────────────┐
A. AQUISIÇÃO   B. ATIVAÇÃO/USO       C. RETENÇÃO          D. ECONOMIA
(quantas orgs) (entregam valor?)     (continuam?)         (vale a pena?)
   │              │                     │                    │
crescimento.*   snapshot.uso_produto.* crescimento.churn_*  unit_economics.*
metas.*                                concentracao.*       financeiro.*
```

### A. Aquisição — *quantas organizações entram*
| Métrica | Hoje | 6 meses | 12 meses | Campo do canon |
|---------|------|---------|----------|----------------|
| [métrica-mãe de aquisição] | `[N]` | `[N]` | `[N]` | `snapshot.*` / `metas.*` |
| Clientes pagantes | `[N]` | — | — | `snapshot.clientes_pagantes` |
| Novos pagantes/mês | `[N]` | — | — | `crescimento.novos_clientes_pagantes_mes` |
| Conversão free→pago | `[X]%` | — | — | `crescimento.conversao_free_para_pago_pct` |
| Ciclo de vendas | `[N]` dias | — | — | `crescimento.ciclo_vendas_dias` |

### B. Ativação / Uso — *o produto entrega valor* (insumo direto da North Star)
| Métrica | Hoje | 6 meses | 12 meses | Campo |
|---------|------|---------|----------|-------|
| [uso primário] | `[N]` | `[N]` | `[N]` | `snapshot.uso_produto.*` / `metas.*` |
| [uso secundário] | `[N]` | `[N]` | `[N]` | `snapshot.uso_produto.*` |

> Cite a **origem correta** de cada meta: se uma meta de 6 meses vier de um documento de produto e não do canon (`metas.m6_meses.*`), aponte a origem real — não force tudo para o canon.

### C. Retenção — *clientes continuam e o risco está diluído*
| Métrica | Hoje | Campo |
|---------|------|-------|
| Churn de receita | `[X]%`/mês | `crescimento.churn_receita_mensal_pct` |
| Churn de logo | `[X]%`/mês | `crescimento.churn_logo_mensal_pct` |
| Lifetime estimado | `[N]` meses | `crescimento.lifetime_meses_estimado` |
| Concentração top-3 | `[X]%` do MRR | `concentracao.top3_pct_do_mrr` (⚠️ guardrail — ver [`scenario-planning.md`](./scenario-planning.md)) |

### D. Economia — *o negócio para em pé*
| Métrica | Hoje | Meta | Campo |
|---------|------|------|-------|
| MRR / ARR | R$ `[X]` / R$ `[X]` | R$ `[X]` (12m) | `snapshot.mrr` / `snapshot.arr` / `metas.*` |
| ARPA | R$ `[X]` | — | `unit_economics.arpa` |
| CAC | R$ `[X]` | — | `unit_economics.cac` |
| LTV | R$ `[X]` | — | `unit_economics.ltv` |
| **LTV/CAC** | **`[N]`** | manter saudável | `unit_economics.ltv_cac` |
| Payback do CAC | `[N]` meses | — | `unit_economics.payback_cac_meses` |
| Margem bruta | `[X]%` | — | `financeiro.margem_bruta_pct` |
| Burn líquido | R$ `[X]`/mês | reduzir | `financeiro.burn_liquido_mensal` |
| **Runway** | **`[N]` meses** | `[N]`m pós-rodada | `financeiro.runway_meses` |

---

## Guardrails (não negociáveis ao crescer)

| Guardrail | Limite | Campo | Por quê |
|-----------|--------|-------|---------|
| LTV/CAC | ≥ `[N]` | `unit_economics.ltv_cac` | crescer sem estourar o custo de aquisição |
| Concentração top-3 | < `[X]%` | `concentracao.top3_pct_do_mrr` | cada nova conta deve **diluir**, não concentrar |
| Runway | não encurtar antes da rodada | `financeiro.runway_meses` | disciplina de caixa |
| Churn de receita | ≤ `[X]%`/mês | `crescimento.churn_receita_mensal_pct` | retenção é a base do composto |

---

## Como as métricas guiam a estratégia

- Identifique a **restrição binding** de hoje (nem sempre é receita) e direcione o foco do trimestre ([`OKRs/trimestre-atual.md`](./OKRs/trimestre-atual.md)).
- A North Star protege contra o **churn latente**: uso baixo numa conta antecipa o cancelamento.
- Calcule o **break-even** (MRR que cobre o burn bruto) e diga, com a conta, se o run-rate atual chega antes do caixa secar — daí a rodada e o motor de canais.

---

*Coerência: todos os valores derivam de `snapshot.*`, `crescimento.*`, `unit_economics.*`, `financeiro.*` e `metas.*`. A North Star é métrica derivada, não número novo.*
