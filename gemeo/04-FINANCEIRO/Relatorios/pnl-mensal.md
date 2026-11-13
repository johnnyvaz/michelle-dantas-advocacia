# DRE Mensal Simplificada — P&L gerencial do mês

> **Template** — preenchido via /montar-gemeo. Ao preencher, **renomeie o arquivo para `pnl-mensal-AAAA-MM.md`** (um por competência). Deriva do canon: `snapshot.mrr`, `financeiro.{burn_bruto_mensal,burn_liquido_mensal,margem_bruta_pct,custo_servico_por_cliente_mes,custos.{folha,infra,apis_terceiros,marketing,ferramentas_saas,contabil_juridico,outros}}`, `snapshot.clientes_pagantes`.
> **Citação parseável**: todo número preenchido usa o marcador `R$ X [canon: path.do.campo]` ou `N [calc: metrica]` — o CI compara com o canon e acusa drift (specs/001-melhorias-gemeo/contracts/formatos-arquivos.md).

**Competência**: `AAAA-MM` · **Emitido em**: `AAAA-MM-DD`
**Empresa**: [PREENCHER: `empresa.razao_social` · `empresa.cnpj`] · **Regime**: gerencial (caixa) · **Moeda**: `_meta.moeda`

---

## Demonstrativo do mês

| Linha | Conta | Valor |
|------:|-------|------:|
| **(+)** | **Receita recorrente (MRR)** | `R$ [X]` |
| | | |
| **(−)** | **Custos e despesas** | `(R$ [X])` |
| | Folha (pró-labore + salários) | `(R$ [X])` (`financeiro.custos.folha`) |
| | Infraestrutura | `(R$ [X])` (`financeiro.custos.infra`) |
| | APIs de terceiros | `(R$ [X])` (`financeiro.custos.apis_terceiros`) |
| | Marketing | `(R$ [X])` (`financeiro.custos.marketing`) |
| | Ferramentas / SaaS internos | `(R$ [X])` (`financeiro.custos.ferramentas_saas`) |
| | Contábil / jurídico | `(R$ [X])` (`financeiro.custos.contabil_juridico`) |
| | Outros | `(R$ [X])` (`financeiro.custos.outros`) |
| | | |
| **(=)** | **Resultado do mês (burn líquido)** | `(R$ [X])` |

`Resultado = receita − custos` (= `financeiro.burn_liquido_mensal`).

> Some apenas as linhas de `financeiro.custos.*` que existirem no canon — não invente categorias nem valores. A soma das linhas deve igualar `financeiro.burn_bruto_mensal`.

---

## Indicadores derivados do mês
| Indicador | Valor | Conta |
|-----------|------:|-------|
| Receita | `R$ [X]` | = MRR (`snapshot.clientes_pagantes` contas pagantes) |
| Custos totais (burn bruto) | `R$ [X]` | soma das linhas de custo |
| Resultado (burn líquido) | `R$ [X]` | receita − custos |
| Cobertura de custos pela receita | `[X]%` | receita ÷ custos totais |
| Folha sobre custos totais | `[X]%` | folha ÷ custos totais |
| Margem bruta | `[X]%` | `financeiro.margem_bruta_pct` (custo direto ≈ custo de servir/conta) |

---

## Comentário da gestão
[PREENCHER: 2–3 leituras honestas do mês. Distinguir custo de *entregar* o produto (custo de servir, escalável) do custo de *operar a empresa* (folha). Apontar se a alavanca é receita (escala) ou corte de custo.]

> **Sustenta o oráculo** ("Quanto custa entregar e qual a margem? Têm lucro?"): margem bruta `[X]%`, mas resultado mensal `R$ [X]`. Empresa [PREENCHER: dá / não dá] lucro hoje — a alavanca é [PREENCHER].

**Fonte**: `00-CANON/canon.yaml`.
