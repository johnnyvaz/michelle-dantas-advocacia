# Projeção Financeira 3 Anos — modelo de captação

> **Template** — preenchido via /montar-gemeo. Deriva do canon: `financeiro.*`, `snapshot.*`, `crescimento.*`, `unit_economics.*`, `premissas.gatilho_demanda.*`, `metas.*`, `fundraising.*`.
> **Citação parseável**: todo número preenchido usa o marcador `R$ X [canon: path.do.campo]` ou `N [calc: metrica]` — o CI compara com o canon e acusa drift (specs/001-melhorias-gemeo/contracts/formatos-arquivos.md).

**Fonte dos números-âncora:** `00-CANON/canon.yaml`.

> **Convenção:** valores que constam no canon são **[canon]**; valores extrapolados de premissas são **[derivado]**. Nenhuma extrapolação contradiz o canon. Todo número abaixo é placeholder até `/montar-gemeo` preencher.

---

## Contexto de partida

| Indicador | Valor | Campo do canon |
|-----------|------:|----------------|
| Caixa disponível | R$ [X] | `financeiro.caixa_atual` [canon] |
| MRR / ARR atual | R$ [X] / R$ [X] | `snapshot.mrr`, `snapshot.arr` [canon] |
| Burn bruto / líquido | R$ [X] / R$ [X] | `financeiro.burn_bruto_mensal`, `financeiro.burn_liquido_mensal` [canon] |
| Runway sem captação | [N] meses | `financeiro.runway_meses` [canon] |
| Rodada buscando | R$ [X] | `fundraising.buscando` [canon] |
| Já aportado | R$ [X] | `fundraising.ja_aportado` [canon] |
| Headcount | [N] | `time[]` [canon] |

---

## Premissas da Projeção (explícitas)

Necessárias para projetar além do snapshot. Coerentes com o canon, mas não declaradas nele como metas anuais.

| Premissa | Valor | Base no canon |
|----------|-------|---------------|
| Captação fechada em | [PREENCHER] | `fundraising` |
| Novos pagantes/mês (base) | [N] | `crescimento.novos_clientes_pagantes_mes` |
| Novos pagantes/mês (pós-alavanca) | [N] (*) | derivado de `metas.m12_meses.*` |
| Ticket médio (trajetória) | R$ [X] → R$ [X] (*) | `snapshot.ticket_medio` + expansão |
| Churn de receita mensal | [X]% | `crescimento.churn_receita_mensal_pct` |
| Margem bruta | [X]% | `financeiro.margem_bruta_pct` |
| Meta MRR em m12 | R$ [X] | `metas.m12_meses.*` [canon] |
| Break-even (MRR ≈ burn bruto) | R$ [X] | `financeiro.burn_bruto_mensal` [canon] |
| Gatilho de demanda | [PREENCHER] | `premissas.gatilho_demanda.descricao`, `.data_prevista` |

---

## Resumo Anual

### Ano 1 — [AAAA] (pós-captação)
**Premissa:** [PREENCHER: foco do ano — produto, canal direto].

| Indicador | Valor | Tipo |
|-----------|------:|------|
| Caixa início (pós-captação) | R$ [X] | [canon + derivado] |
| MRR início → fim | R$ [X] → R$ [X] (*) | [derivado] |
| Clientes ativos (fim do ano) | [N] | `metas.m6_meses.*` [canon] |
| Headcount (fim do ano) | [N] (*) | [derivado] |
| Burn bruto (fim do ano) | R$ [X] (*) | [derivado] |
| Receita anual | R$ [X] (*) | [derivado] |

**Marco crítico:** [PREENCHER].

### Ano 2 — [AAAA] (ano do gatilho de demanda)
**Premissa:** [PREENCHER: alavanca ativa, pico de demanda esperado].

| Indicador | Valor | Tipo |
|-----------|------:|------|
| **MRR (meta m12)** | **R$ [X]** | `metas.m12_meses.*` **[canon]** |
| MRR (fim do ano) | R$ [X] (*) | [derivado] |
| **Clientes ativos (m12)** | **[N]** | `metas.m12_meses.*` **[canon]** |
| Uso do produto (m12) | [N] | `metas.m12_meses.*` [canon] |
| Headcount (fim do ano) | [N] (*) | [derivado] |
| Receita anual | R$ [X] (*) | [derivado] |
| Break-even operacional | [PREENCHER] | [derivado] |

**Marco crítico:** [PREENCHER: atingir as metas de m12 — gatilho da próxima rodada].

### Ano 3 — [AAAA] (pós-pico)
**Premissa:** [PREENCHER: acima do break-even, base instalada, dados acumulados como vantagem].

| Indicador | Valor | Tipo |
|-----------|------:|------|
| MRR início → fim | R$ [X] → R$ [X] (*) | [derivado] |
| Clientes ativos (fim) | [N] (*) | [derivado] |
| Headcount (fim) | [N] (*) | [derivado] |
| Receita anual | R$ [X] (*) | [derivado] |
| Operação | [PREENCHER: lucrativa / FCF positivo?] (*) | [derivado] |

**Marco crítico:** [PREENCHER].

---

## Resumo Comparativo

| Indicador | Atual | Ano 1 | Ano 2 (m12) | Ano 3 |
|-----------|------:|------:|------------:|------:|
| MRR | R$ [X] [c] | R$ [X] [d] | **R$ [X] [c]** | R$ [X] [d] |
| Clientes ativos | [N] [c] | [N] [c] | **[N] [c]** | [N] [d] |
| Headcount | [N] [c] | [N] [d] | [N] [d] | [N] [d] |
| Caixa | R$ [X] [c] | R$ [X] [d] | R$ [X] [d] | [PREENCHER] [d] |

**Legenda:** [c] = âncora no canon / [d] = derivado de premissas coerentes.

---

## Riscos sobre a projeção (cenários)

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Gatilho de demanda atrasa | MRR do ano cai; ciclo de vendas alonga | `premissas.gatilho_demanda.data_prevista` — vender valor operacional independente do gatilho |
| Entrante/concorrente forte | TAM efetivo cai; CAC sobe | [PREENCHER: defensabilidade] |
| Churn cresce com escala | LTV comprime; LTV/CAC < 3× | Investir em CS e onboarding |
| Captação atrasa | Runway seca | Corte emergencial de burn (`financeiro.burn_liquido_mensal` → patamar mínimo) |
