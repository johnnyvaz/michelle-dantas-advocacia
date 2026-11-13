# Template — Relatório Mensal de Métricas

> Fechar até o dia 5 do mês seguinte. Os valores entram **primeiro no canon**
> (`00-CANON/canon.yaml`), depois aqui — nunca o contrário. Com MCPs
> conectados, `/atualizar-gemeo` preenche a base automaticamente.
> Versão para investidores: `10-INVESTIDORES/updates/`.

---

# Relatório Mensal — AAAA-MM

## 1. Métricas-chave (canon: campo → valor)

| Métrica | Mês anterior | Este mês | Δ | Campo do canon |
|---------|-------------:|---------:|---|----------------|
| MRR | R$ | R$ | % | `snapshot.mrr` |
| Clientes pagantes / free | / | / | | `snapshot.clientes_*` |
| Novos pagantes no mês | | | | `crescimento.novos_clientes_pagantes_mes` |
| Churn receita / logo | % / % | % / % | | `crescimento.churn_*` |
| Uso do produto | | | | `snapshot.uso_produto.*` |
| Caixa / burn líquido / runway | | | | `financeiro.*` |
| Concentração top-3 | % | % | | `concentracao.top3_pct_do_mrr` |

## 2. Highlights (3 bullets, com número)
- [conquista mensurável]

## 3. Lowlights (3 bullets, sem maquiagem)
- [o que piorou ou travou — citar risco do `registro-de-riscos.md` se mapeado]

## 4. Riscos — mudanças no mês
| Risco | Antes → Agora | Por quê |
|-------|---------------|---------|
| R[NN] | score X → Y | [gatilho observado] |

## 5. Decisões do mês
[IDs novos no decision log: D[NN] — título]

## 6. Foco do próximo mês (máx. 3)
1. [prioridade com meta numérica]
