# Pitch Deck — roteiro de captação slide a slide

> **Template** — preenchido via /montar-gemeo. Deriva do canon: `empresa.*`, `mercado.*`, `snapshot.*`, `crescimento.*`, `unit_economics.*`, `premissas.gatilho_demanda.*`, `financeiro.margem_bruta_pct`, `time[]`, `fundraising.*`.
> **Citação parseável**: todo número preenchido usa o marcador `R$ X [canon: path.do.campo]` ou `N [calc: metrica]` — o CI compara com o canon e acusa drift (specs/001-melhorias-gemeo/contracts/formatos-arquivos.md).

**Uso:** demo do oráculo, reuniões com anjos e fundos. Cada slide aponta o campo do canon que o alimenta — nenhum número é digitado aqui à mão.
**Fonte única dos números:** `00-CANON/canon.yaml`.

---

## Slide 1 — Capa

**[`empresa.nome_fantasia`]**
*[`empresa.one_liner`]*

> [PREENCHER: uma frase que situe o produto e o "porquê agora" — deriva de `empresa.one_liner` + `premissas.gatilho_demanda.descricao`]

Estágio: [`empresa.estagio`] · Fundação: [`empresa.fundacao`]

---

## Slide 2 — Problema

### [PREENCHER: o problema em uma manchete — a dor que o cliente sente hoje]

[PREENCHER: descreva a dor concreta do ICP. Liste as consequências em tabela — quanto mais tangível, melhor.]

| Limitação atual | Impacto no negócio |
|-----------------|--------------------|
| [PREENCHER] | [PREENCHER] |

> Se há um **gatilho de demanda** (prazo regulatório, mudança de mercado), ele entra aqui: `premissas.gatilho_demanda.descricao` e `.data_prevista`. É o que cria urgência de compra.

---

## Slide 3 — Solução

### [PREENCHER: a solução em uma frase — o que muda na vida do cliente]

> Ancore a manchete no posicionamento do canon: `empresa.one_liner`.

[PREENCHER: como o produto resolve cada limitação do slide anterior. 3–5 bullets concretos, não features soltas.]

**Defensabilidade / lock-in:** [PREENCHER: o que retém o cliente — dados acumulados, custo de troca, efeito de rede].

---

## Slide 4 — Mercado (TAM / SAM / SOM)

| | Empresas | Descrição |
|--|----------|-----------|
| **TAM** | [N] | [PREENCHER] (`mercado.tam_empresas`) |
| **SAM** | [N] | [PREENCHER: recorte atingível] (`mercado.sam_empresas`) |
| **SOM (ano 1)** | [N] | [PREENCHER: meta realista do 1º ano] (`mercado.som_ano1_empresas`) |

**Por que agora:**
- [PREENCHER: o gatilho que cria a janela] — [X]% da demanda deriva dele (`premissas.gatilho_demanda.peso_na_demanda_pct`, data: `premissas.gatilho_demanda.data_prevista`).
- Âncora de valor: [PREENCHER] (`mercado.ancora_de_valor`).

---

## Slide 5 — Tração

| Métrica | Valor | Campo do canon |
|---------|------:|----------------|
| MRR / ARR | R$ [X] / R$ [X] | `snapshot.mrr`, `snapshot.arr` |
| Clientes pagantes / free | [N] / [N] | `snapshot.clientes_pagantes`, `snapshot.clientes_free` |
| Uso do produto | [N] | `snapshot.uso_produto.*` |
| Ticket médio | R$ [X] | `snapshot.ticket_medio` |
| Novos pagantes/mês | [N] | `crescimento.novos_clientes_pagantes_mes` |
| LTV / CAC | [X] | `unit_economics.ltv_cac` |
| Payback do CAC | [N] meses | `unit_economics.payback_cac_meses` |
| Margem bruta | [X]% | `financeiro.margem_bruta_pct` |

**Conversão free → pago:** [X]% (`crescimento.conversao_free_para_pago_pct`).
**Clientes âncora:** [PREENCHER: 1–2 contas de referência, sem expor dado sensível].

---

## Slide 6 — Modelo de Negócio

**Receita:** [PREENCHER: como cobra — recorrência, planos]. Margem bruta de [X]% (`financeiro.margem_bruta_pct`).

**Canais de distribuição:**
1. [PREENCHER: canal direto — CAC `unit_economics.cac`].
2. [PREENCHER: canal de alavanca — parceiros/revenda que reduzem o CAC].

| Indicador | Valor | Campo do canon |
|-----------|------:|----------------|
| CAC | R$ [X] | `unit_economics.cac` |
| LTV | R$ [X] | `unit_economics.ltv` |
| LTV/CAC | [X] | `unit_economics.ltv_cac` |
| ARPA | R$ [X] | `unit_economics.arpa` |

*Ressalva honesta: [PREENCHER se a amostra ainda é early-stage].*

---

## Slide 7 — Time

| Nome | Cargo | Decisor? |
|------|-------|----------|
| [PREENCHER] | [PREENCHER] | [`time[].decisor`] |

*(Fonte: `time[]`.)*

**Por que esse time:** [PREENCHER: como os perfis cobrem produto, construção e venda — as três causas comuns de morte de startup].

---

## Slide 8 — O Pedido (Ask)

**Rodada:** [`fundraising.rodada_atual`] · **Buscando:** R$ [X] (`fundraising.buscando`) · **Valuation cap:** R$ [X] (`fundraising.valuation_cap`)
**Já aportado:** R$ [X] (`fundraising.ja_aportado`).

| Destino | % | Objetivo |
|---------|--:|----------|
| [PREENCHER] | [X]% | [PREENCHER] |

*(Fonte: `fundraising.uso_recursos_pct`.)*

**O que o cheque compra:** [PREENCHER: runway e marcos] — `fundraising.objetivo_pos_rodada`.

---

*Todos os números derivam de `00-CANON/canon.yaml` (fonte única). Campo `null` no canon → o slide diz "dado ainda não disponível", nunca inventa.*
