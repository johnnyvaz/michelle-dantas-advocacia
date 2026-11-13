# OKRs do Trimestre — recorte trimestral atual

> **Template** — preenchido via /montar-gemeo. Deriva do canon: `snapshot.*`, `crescimento.*`, `metas.m6_meses.*`, `metas.m12_meses.*`, `fundraising.*`, `financeiro.runway_meses`.
> **Citação parseável**: todo número preenchido usa o marcador `R$ X [canon: path.do.campo]` ou `N [calc: metrica]` — o CI compara com o canon e acusa drift (specs/001-melhorias-gemeo/contracts/formatos-arquivos.md).

---

**Trimestre:** [Qn] [ANO] (AAAA-MM-DD → AAAA-MM-DD) · **Atualizado em:** AAAA-MM-DD
**Fonte:** `00-CANON/canon.yaml` · [`anual.md`](./anual.md)

> A coluna **atual** é atualizada via **/atualizar-jira** (progresso de sprints/tarefas). KRs são o recorte trimestral dos objetivos de [`anual.md`](./anual.md).

---

## Foco do trimestre: **[PREENCHER: a frase que decide o trimestre]**

[PREENCHER: 2–3 linhas. Diga qual é a **restrição binding agora** — nem sempre é o MRR. Se um marco de 6m já foi atingido, olhe para frente (rumo a `metas.m12_meses.*`), não "sandbague" no número já batido.]

> Baseline do trimestre (AAAA-MM-DD, `snapshot.*`): `[N]` clientes totais, MRR R$ `[X]`, runway `[N]` meses.

---

## O1 — [PREENCHER: recorte trimestral do O1 anual]

*Por que:* [PREENCHER].

| KR | Baseline | Meta [Qn] | Atual | Origem / cálculo |
|----|----------|-----------|-------|------------------|
| **KR1** — [aquisição] | `[N]` | `[N]` | `[N]` | projeção (`crescimento.*`) |
| **KR2** — Clientes pagantes | `[N]` | `[N]` | `[N]` | `+[N]`/mês − churn `[X]%` |
| **KR3** — MRR | R$ `[X]` | R$ `[X]` | R$ `[X]` | projeção |

*Dono:* [cargo].

## O2 — [PREENCHER: recorte trimestral da alavanca]

*Por que:* [PREENCHER — o objetivo mais importante do trimestre, em geral].

| KR | Baseline | Meta [Qn] | Atual | Origem |
|----|----------|-----------|-------|--------|
| **KR1** — [driver da alavanca] | `[N]` | `[N]` | `[N]` | `metas.m6_meses.*` |
| **KR2** — [marco de produto] | [estado] | [meta] | [atual] | `produto.em_construcao` |
| **KR3** — [primeiros resultados do canal] | `[N]` | `[N]` | `[N]` | derivado |

*Dono:* [cargo] + [cargo]. *Sem dado no canon:* não fixe CAC de canal inventado — meça resultados observáveis.

## O3 — [PREENCHER: recorte trimestral de uso / North Star]

*Por que:* [PREENCHER].

| KR | Baseline | Meta [Qn] | Atual | Origem |
|----|----------|-----------|-------|--------|
| **KR1** — Instrumentar a North Star | proxy | [meta] | [atual] | `produto.em_construcao` |
| **KR2** — [uso] | `[N]` | `[N]` | `[N]` | `snapshot.uso_produto.*` |
| **KR3** — Resgatar conta em risco | [estado] | [meta] | [atual] | `clientes[].health` |

*Dono:* [cargo].

## O4 — [PREENCHER: recorte trimestral de caixa / fundraising]

*Por que:* [PREENCHER — o caixa seca em AAAA-MM-DD; a captação não pode esperar].

| KR | Baseline | Meta [Qn] | Atual | Origem |
|----|----------|-----------|-------|--------|
| **KR1** — Roadshow / conversas | — | `[N]` | `[N]` | `fundraising.rodada_atual` |
| **KR2** — Term sheets | `[N]` | `[N]` | `[N]` | `fundraising.buscando` |
| **KR3** — Disciplina de runway | `[N]` meses | não encurtar | `[N]` | `financeiro.runway_meses` |

*Dono:* [cargo].

---

## Guardrails do trimestre (não negociáveis)

- **Runway:** nenhuma decisão que encurte `financeiro.runway_meses` antes da rodada (ver [`../scenario-planning.md`](../scenario-planning.md)).
- **Pricing:** mover preço só onde `premissas.elasticidade_preco.<plano>` permite — não no plano mais sensível.
- **Concentração:** cada nova conta deve **diluir** `concentracao.top3_pct_do_mrr`, não concentrar mais.

---

*Coerência: metas de [Qn] derivam da projeção de `crescimento.*` e dos marcos de `metas.m6_meses.*`; o foco é forward, rumo a `metas.m12_meses.*`. Guardrails de [`../scenario-planning.md`](../scenario-planning.md). Sem número novo.*
