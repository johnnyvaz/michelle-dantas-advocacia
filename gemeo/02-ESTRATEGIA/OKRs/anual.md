# OKRs Anuais — objetivos do ano

> **Template** — preenchido via /montar-gemeo. Deriva do canon: `metas.m6_meses.*`, `metas.m12_meses.*`, `fundraising.*`, `unit_economics.*`, `concentracao.*`.
> **Citação parseável**: todo número preenchido usa o marcador `R$ X [canon: path.do.campo]` ou `N [calc: metrica]` — o CI compara com o canon e acusa drift (specs/001-melhorias-gemeo/contracts/formatos-arquivos.md).

---

**Período:** [ANO] (ano-móvel a partir do marco de referência) · **Atualizado em:** AAAA-MM-DD
**Fonte:** `00-CANON/canon.yaml` (`metas.*`, `fundraising.*`) · [`../strategic-metrics.md`](../strategic-metrics.md)

---

## Tema do ano: **[PREENCHER: a frase que resume a prioridade do ano]**

[PREENCHER: 2–3 linhas. Ordene as prioridades — ex. (1) não morrer (caixa/runway), (2) provar a alavanca de crescimento, (3) crescer base e uso rumo a `metas.m12_meses.*`.]

> Todas as metas-fim **espelham** `metas.m12_meses.*`. Os OKRs não inventam alvo — traduzem o canon em foco. A coluna **atual** é atualizada via /atualizar-gemeo; a **fonte** aponta o campo do canon.

---

## O1 — [PREENCHER: objetivo de escala — base e receita]

*Por que:* [PREENCHER — é a métrica-mãe da tese].

| KR | Meta 12m | Atual | Fonte (canon) |
|----|----------|-------|---------------|
| **KR1** — [métrica-mãe de aquisição] | `[N]` | `[N]` | `metas.m12_meses.*` |
| **KR2** — MRR | R$ `[X]` | R$ `[X]` | `metas.m12_meses.*` |
| **KR3** — Marco intermediário (6m) | `[N]` | `[N]` | `metas.m6_meses.*` |

*Dono:* [cargo]. *Trava:* [PREENCHER — qual motor entrega cada KR].

## O2 — [PREENCHER: objetivo da alavanca de distribuição]

*Por que:* [PREENCHER — sem ela, O1 não fecha].

| KR | Meta 12m | Atual | Fonte (canon) |
|----|----------|-------|---------------|
| **KR1** — [driver da alavanca] | `[N]` | `[N]` | `metas.m12_meses.*` |
| **KR2** — Marco de 6m | `[N]` | `[N]` | `metas.m6_meses.*` |
| **KR3** — [marco de produto que destrava a alavanca] | [meta] | [atual] | `produto.em_construcao` |

*Dono:* [cargo] + [cargo].

## O3 — [PREENCHER: objetivo de uso do produto / North Star]

*Por que:* uso real → retenção → lock-in. É a North Star de [`../strategic-metrics.md`](../strategic-metrics.md).

| KR | Meta 12m | Atual | Fonte (canon) |
|----|----------|-------|---------------|
| **KR1** — [uso primário] | `[N]` | `[N]` | `metas.m12_meses.*` |
| **KR2** — [uso secundário] | `[N]` | `[N]` | `metas.m12_meses.*` |
| **KR3** — Instrumentar a North Star real | [meta] | [atual] | `produto.em_construcao` |

*Dono:* [cargo].

## O4 — [PREENCHER: objetivo de sobrevivência financeira]

*Por que:* sem a rodada, o runway não alcança o break-even. Destrava todas as outras.

| KR | Meta 12m | Atual | Fonte (canon) |
|----|----------|-------|---------------|
| **KR1** — Captar a rodada | R$ `[X]` | R$ `[X]` | `fundraising.buscando` |
| **KR2** — Estender runway | `[N]` meses | `[N]` meses | `fundraising.objetivo_pos_rodada` |
| **KR3** — Guardrail: LTV/CAC | ≥ `[N]` | `[N]` | `unit_economics.ltv_cac` |
| **KR4** — Guardrail: concentração top-3 | < `[X]%` | `[X]%` | `concentracao.top3_pct_do_mrr` |

*Dono:* [cargo]. *Nota:* KR3/KR4 são **guardrails** — crescer sem estourar o CAC nem aumentar a concentração.

---

## Como os OKRs anuais se desdobram nos trimestres

| Objetivo | [Q atual] | [Q seguinte] |
|----------|-----------|--------------|
| O1 | [foco] | [foco] |
| O2 | [foco] | [foco] |
| O3 | [foco] | [foco] |
| O4 | [foco] | [foco] |

O foco imediato está em [`trimestre-atual.md`](./trimestre-atual.md).

---

*Coerência: O1/O2/O3 espelham `metas.m12_meses.*` e os marcos de `metas.m6_meses.*`; O4 espelha `fundraising.*`. Guardrails de `unit_economics.*` e `concentracao.*`. Sem número novo.*
