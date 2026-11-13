# Análise de Concentração de Receita — risco do top da carteira

> **Template** — preenchido via /montar-gemeo. Deriva do canon: `concentracao.{top3_ids,top3_mrr,top3_pct_do_mrr,free_convertiveis_estimados}` · `clientes[].{id,nome,plano,mrr,health}` · `snapshot.mrr`.
> **Citação parseável**: todo número preenchido usa o marcador `R$ X [canon: path.do.campo]` ou `N [calc: metrica]` — o CI compara com o canon e acusa drift (specs/001-melhorias-gemeo/contracts/formatos-arquivos.md).

**Data:** AAAA-MM · **Fonte:** `clientes[]` e `concentracao` do canon.

---

## 1. Concentração no topo

Os [N] maiores clientes (`concentracao.top3_ids`) respondem por `concentracao.top3_mrr` =
R$ [X], equivalente a `concentracao.top3_pct_do_mrr` = [X]% do MRR total (`snapshot.mrr` = R$ [X]).

| Posição | ID | Nome | Plano | MRR | % do MRR |
|---------|----|------|-------|----:|---------:|
| 1º | [id] | [nome] | [plano] | R$ [X] | [X]% |
| 2º | [id] | [nome] | [plano] | R$ [X] | [X]% |
| 3º | [id] | [nome] | [plano] | R$ [X] | [X]% |
| — | — | **Top combinado** | — | **R$ [X]** | **[X]%** |
| — | — | Demais [N] contas | — | R$ [X] | [X]% |

---

## 2. Impacto de perda individual (churn isolado)

> MRR residual e queda % se cada uma do topo saísse sozinha. Cálculo: `clientes[].mrr` ÷ `snapshot.mrr`.

| Cenário | MRR perdido | MRR residual | Queda no MRR |
|---------|------------:|-------------:|-------------:|
| Perda do 1º ([id]) | R$ [X] | R$ [X] | **−[X]%** |
| Perda do 2º ([id]) | R$ [X] | R$ [X] | **−[X]%** |

## 3. Impacto de perda conjunta

| Cenário | MRR perdido | MRR residual | Queda no MRR |
|---------|------------:|-------------:|-------------:|
| Perda simultânea do top | R$ [X] | R$ [X] | **−[X]%** |

[PREENCHER: com o MRR residual, quanto do custo mensal a receita ainda cobriria? É um
cenário sustentável ou exige reação imediata?]

---

## 4. Limiar de risco

| Faixa `top3_pct_do_mrr` | Leitura |
|-------------------------|---------|
| **acima de ~40%** | Risco alto — uma saída no topo abala a operação. |
| **20–40%** | Atenção — monitorar de perto e diversificar. |
| **abaixo de ~20%** | Saudável — base pulverizada, churn isolado absorvível. |

[PREENCHER: em qual faixa a empresa está hoje, segundo `concentracao.top3_pct_do_mrr`.]

> **Agravante a checar:** se algum cliente do topo está em `health` = Atenção/Risco, os dois
> fatores se somam (peso de receita + saúde degradada). Cruzar com [`health-e-churn.md`](./health-e-churn.md).

---

## 5. Plano de mitigação

| Ação | Prioridade | Dono sugerido |
|------|-----------|---------------|
| [PREENCHER: blindar contas do topo — contrato/relacionamento] | Alta | [cargo de `time[]`] |
| [PREENCHER: acelerar pipeline de novas contas grandes para diluir] | Média-alta | [cargo] |
| [PREENCHER: monitorar health das contas-âncora] | Média | [cargo] |

> **Meta:** reduzir `top3_pct_do_mrr` para abaixo de [X]% à medida que a base cresce.
