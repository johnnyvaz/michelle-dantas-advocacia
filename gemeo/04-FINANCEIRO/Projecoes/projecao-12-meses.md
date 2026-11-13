# Projeção 12 Meses — Dois cenários de caixa

> **Template** — preenchido via /montar-gemeo. Deriva do canon: `snapshot.{mrr,clientes_pagantes,ticket_medio}`, `financeiro.{caixa_atual,burn_bruto_mensal,custo_servico_por_cliente_mes}`, `crescimento.{novos_clientes_pagantes_mes,churn_receita_mensal_pct,churn_logo_mensal_pct}`, `premissas.gatilho_demanda.{descricao,peso_na_demanda_pct,data_prevista,cenario_sem_gatilho.{queda_demanda_pct,aumento_ciclo_vendas_pct,demanda_residual_pct}}`, `fundraising.buscando`.
> **Citação parseável**: todo número preenchido usa o marcador `R$ X [canon: path.do.campo]` ou `N [calc: metrica]` — o CI compara com o canon e acusa drift (specs/001-melhorias-gemeo/contracts/formatos-arquivos.md).

**Emitido em**: `AAAA-MM-DD` (`_meta.data_referencia`) · **Horizonte**: 12 meses (`AAAA-MM` → `AAAA-MM`)
**Cenários**: Base (com gatilho de demanda) · Conservador (sem gatilho)

---

## Premissas comuns (vindas do canon)
| Premissa | Valor | Origem |
|----------|------:|--------|
| Ponto de partida | MRR `R$ [X]` · `[N]` pagantes | `snapshot` |
| Caixa inicial | `R$ [X]` | `financeiro.caixa_atual` |
| Burn bruto base | `R$ [X]`/mês | `financeiro.burn_bruto_mensal` |
| Ticket médio (novos) | `R$ [X]`/conta | `snapshot.ticket_medio` |
| Churn de receita | `[X]%`/mês sobre o MRR | `crescimento.churn_receita_mensal_pct` |
| Churn de logo | `[X]%`/mês sobre as contas | `crescimento.churn_logo_mensal_pct` |
| Custo de servir | `R$ [X]`/conta/mês | `financeiro.custo_servico_por_cliente_mes` |
| Novos pagantes (base) | `+[N]`/mês | `crescimento.novos_clientes_pagantes_mes` |

**Mecânica do modelo (igual nos dois cenários):**
`MRR(mês) = MRR(mês−1) − churn_receita + (novos pagantes × ticket_médio)`, com `churn_receita = [X]% × MRR(mês−1)`.
`pagantes(mês) = pagantes(mês−1) + novos − churn_logo`. Custos sobem levemente: cada nova conta adiciona `R$ [X]`/mês de custo de servir.

> Arredondar ao inteiro da moeda. Premissas de cenário que **não** estão no canon → marcar `[estimativa]`.

---

## Cenário Base — "com gatilho de demanda"
**Responde:** o que acontece se o gatilho de demanda se materializar na data prevista?
**Premissas adicionais** (`premissas.gatilho_demanda.*`):
- Gatilho: [PREENCHER: `premissas.gatilho_demanda.descricao`], previsto para `AAAA-MM` (`...data_prevista`), peso `[X]%` na demanda (`...peso_na_demanda_pct`).
- [PREENCHER: aceleração de aquisição / aporte se houver, ex. `fundraising.buscando`] `[estimativa]`.

| Mês | Pagantes | MRR | Custos | Resultado | Caixa final |
|-----|---------:|----:|-------:|----------:|------------:|
| `AAAA-MM` (partida) | `[N]` | `R$ [X]` | `R$ [X]` | `R$ [X]` | `R$ [X]` |
| `AAAA-MM` | `[N]` | `R$ [X]` | `R$ [X]` | `R$ [X]` | `R$ [X]` |
| … (preencher os 12 meses) | | | | | |

**Leitura:** [PREENCHER: o caixa seca em quando? MRR chega a quanto? atinge break-even?]

---

## Cenário Conservador — "sem gatilho"
**Responde:** e se o gatilho **não** ocorrer (ou atrasar)?
**Premissas adicionais** (`premissas.gatilho_demanda.cenario_sem_gatilho.*`):
- Queda de demanda: `[X]%` (`...queda_demanda_pct`).
- Aumento do ciclo de vendas: `[X]%` (`...aumento_ciclo_vendas_pct`).
- Demanda residual: `[X]%` da base (`...demanda_residual_pct`) → novos pagantes caem para `+[N]`/mês.

| Mês | Pagantes | MRR | Custos | Resultado | Caixa final |
|-----|---------:|----:|-------:|----------:|------------:|
| `AAAA-MM` (partida) | `[N]` | `R$ [X]` | `R$ [X]` | `R$ [X]` | `R$ [X]` |
| `AAAA-MM` | `[N]` | `R$ [X]` | `R$ [X]` | `R$ [X]` | `R$ [X]` |
| … (preencher os 12 meses) | | | | | |

**Leitura:** [PREENCHER: quanto antes o caixa seca vs. base? gap até o break-even?]

---

## Base × Conservador (foto no fim do horizonte)
| Indicador (mês 12) | Base | Conservador |
|--------------------|-----:|------------:|
| Pagantes | `[N]` | `[N]` |
| MRR | `R$ [X]` | `R$ [X]` |
| Caixa final | `R$ [X]` | `R$ [X]` |
| Caixa seca em | `AAAA-MM` / não seca | `AAAA-MM` |
| Atinge break-even? | [PREENCHER] | [PREENCHER] |

## Síntese para o oráculo
> "Quando acaba o dinheiro e quando vira o jogo?" → [PREENCHER: resuma os dois cenários, o runway de cada um e a condição (gatilho/alavanca) que separa sobrevivência de break-even]. Cruze com `Projecoes/break-even.md`.

**Fonte**: `00-CANON/canon.yaml`.
