# Break-even — Quanta receita zera o burn

> **Template** — preenchido via /montar-gemeo. Deriva do canon: `financeiro.{burn_bruto_mensal,custos.folha,margem_bruta_pct}`, `snapshot.{mrr,ticket_medio,clientes_pagantes}`, `planos[].preco`, `unit_economics.arpa`, `time[].custo`, `metas.m12_meses.*`, `fundraising.uso_recursos_pct`.
> **Citação parseável**: todo número preenchido usa o marcador `R$ X [canon: path.do.campo]` ou `N [calc: metrica]` — o CI compara com o canon e acusa drift (specs/001-melhorias-gemeo/contracts/formatos-arquivos.md).

**Emitido em**: `AAAA-MM-DD` (`_meta.data_referencia`)
**Pergunta central**: quanto de receita recorrente zera o burn? E quantos clientes isso significa?

---

## 1. O alvo: MRR que cobre o burn

Break-even operacional = quando a receita recorrente mensal cobre **todos** os custos, ou seja, **MRR = burn bruto** (no break-even, por definição, o burn líquido vai a zero).

| Variável | Valor | Origem |
|----------|------:|--------|
| Burn bruto (custos totais/mês) | `R$ [X]` | `financeiro.burn_bruto_mensal` |
| MRR atual | `R$ [X]` | `snapshot.mrr` |
| Gap até o break-even | `R$ [X]` | burn bruto − MRR |
| Múltiplo necessário | `[X]×` | burn bruto ÷ MRR |

> **Fórmula geral (válida sempre):** contas no break-even = `burn_bruto ÷ margem_de_contribuição_por_conta`, onde `margem_de_contribuição_por_conta = ticket_médio × margem_bruta`.
> **Simplificação de alta margem:** quando a margem bruta é alta (ex. ≥ 80%), a margem de contribuição ≈ ticket, então **break-even MRR ≈ burn bruto** e **contas ≈ burn_bruto ÷ ticket_médio**. Use a fórmula completa se a margem for baixa.

## 2. Quantos clientes? Depende do mix de plano

Preços de `planos[].preco`. O número de contas no break-even varia com o mix:

### 2.1 Mixes "puros" (um só plano) — limites do intervalo
| Se tudo fosse… | Conta | Contas p/ break-even |
|----------------|-------|---------------------:|
| Só [plano de entrada] | burn ÷ `R$ [X]` | `[N]` |
| Só [plano intermediário] | burn ÷ `R$ [X]` | `[N]` |
| Só [plano de topo] | burn ÷ `R$ [X]` | `[N]` |
| No ticket médio atual | burn ÷ `R$ [X]` (`snapshot.ticket_medio`) | `[N]` |

> O break-even mora entre o limite do plano de topo (poucas contas, difícil de vender em volume) e o do plano de entrada (muitas contas, ticket baixo). O caminho realista é um **mix** ancorado no ticket médio.

### 2.2 Mix realista (espelha a carteira atual, escalada)
Mantendo a proporção atual (`unit_economics_por_plano.*`) e escalando pelo múltiplo do §1:

| Plano | Hoje | No break-even | MRR do plano |
|-------|-----:|--------------:|-------------:|
| [PREENCHER] | `[N]` | `[N]` | `R$ [X]` |
| **Total** | `[N]` | `[N]` | `≈ R$ [X]` |

> Cruze com `metas.m12_meses.*`: se parte da meta de organizações é free, o break-even em **pagantes** chega **antes** da meta total de logos. O gargalo costuma ser **receita por conta + volume de pagantes**, não logos totais.

### 2.3 O atalho dos planos de topo
Como os planos de topo concentram receita, subir o mix para o topo **derruba a contagem de contas necessária**. É a alavanca mais eficiente de break-even — ao custo de ciclo de venda mais longo (`crescimento.ciclo_vendas_dias`).

## 3. Sensibilidade: e se a folha subir?
A folha costuma ser a maior fatia do burn (`financeiro.custos.folha` sobre `financeiro.burn_bruto_mensal` = `[X]%`). Contratar mexe direto no alvo. Cenário: **+[N] pessoa(s)**.

> Premissa de custo: `time[].custo` traz a referência salarial. Incremento ≈ `[N] × R$ [X]` (+ encargos). Marque `[estimativa]` o que não estiver no canon.

| Cenário | Burn bruto | Novo alvo (MRR) | Contas no ticket médio | Δ vs. hoje |
|---------|-----------:|----------------:|-----------------------:|-----------:|
| Base (canon) | `R$ [X]` | `R$ [X]` | `[N]` | — |
| +[N] contratação(ões) | `R$ [X]` | `R$ [X]` | `[N]` | `+[N]` |

> **Regra:** toda contratação precisa ser financiada por crescimento já contratado, ou encurta o runway. Em estágio inicial a ordem certa é **crescer receita primeiro, contratar depois** — ou contratar com o caixa da rodada explicitamente alocado (`fundraising.uso_recursos_pct`).

## 4. Quando o break-even chega? (cruzamento com a projeção)
- Confronte com `Projecoes/projecao-12-meses.md`: em qual cenário e mês o MRR cruza o alvo? [PREENCHER]
- Se a venda direta linear não chega ao alvo no horizonte, declare qual **alavanca** muda o crescimento de linear para super-linear (ex. canal de parceiros) e quando o break-even passa a ser plausível. [PREENCHER]

## 5. Síntese para o oráculo
> "Quando vira o jogo?" → break-even exige **MRR ≈ `R$ [X]`** (`[X]×` o atual), equivalente a **`[N]` contas pagantes** no ticket médio. No ritmo atual [PREENCHER: chega/não chega] antes de o caixa secar — por isso [PREENCHER: a rodada / a alavanca de canal] existe.

**Fonte**: `00-CANON/canon.yaml`.
