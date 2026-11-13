# Resumo Executivo — Status por departamento

> **Template** — preenchido via /montar-gemeo. Deriva do canon: `empresa.*`, `snapshot.*`, `financeiro.*`, `unit_economics.*`, `crescimento.*`, `concentracao.*`, `planos[]`, `clientes[]`, `time[]`, `produto.*`, `mercado.*`, `premissas.gatilho_demanda.*`, `fundraising.*`.
> **Citação parseável**: todo número preenchido usa o marcador `R$ X [canon: path.do.campo]` ou `N [calc: metrica]` — o CI compara com o canon e acusa drift (specs/001-melhorias-gemeo/contracts/formatos-arquivos.md).

**Data de referência:** AAAA-MM-DD
**Fonte dos dados:** [`../00-CANON/canon.yaml`](../00-CANON/canon.yaml) e documentos de cada pasta.

> **Como preencher:** um parágrafo curto por pasta (02–11). Cada bloco abre com um
> status `🟢` (em dia) / `🟡` (atenção) / `🔴` (crítico) e cita os campos do canon
> que sustentam a leitura. Não invente número: campo `null` → "sem dado no canon".

---

## 02 — ESTRATÉGIA

**Status: 🟡 [PREENCHER: frase de status]**

Ancore a estratégia no principal gatilho de demanda ([X]% da demanda — `premissas.gatilho_demanda.peso_na_demanda_pct`). Dimensione o alvo do ano 1 (`mercado.som_ano1_empresas`) dentro do SAM (`mercado.sam_empresas`). Aponte o estágio (`empresa.estagio`) e os meses de operação (`snapshot.meses_operacao`). **Atenção:** descreva o cenário sem o gatilho (`premissas.gatilho_demanda.cenario_sem_gatilho.*`) e o plano de contingência.

---

## 03 — OPERAÇÕES

**Status: 🟡 [PREENCHER: frase de status]**

Resuma o que está em produção pelos KPIs de uso (`snapshot.uso_produto.*`) e o custo de infra (`financeiro.custos.infra`). Cite o custo de servir por cliente (`financeiro.custo_servico_por_cliente_mes`) e a equipe técnica (`time[]`). Aponte o ciclo de vendas (`crescimento.ciclo_vendas_dias`) e a conversão free → pago (`crescimento.conversao_free_para_pago_pct`).

---

## 04 — FINANCEIRO

**Status: 🟡 [PREENCHER: frase de status]**

| Indicador | Valor | Fonte |
|-----------|-------|-------|
| MRR | R$ [X] | `snapshot.mrr` |
| ARR | R$ [X] | `snapshot.arr` |
| Burn bruto/mês | R$ [X] | `financeiro.burn_bruto_mensal` |
| Burn líquido/mês | R$ [X] | `financeiro.burn_liquido_mensal` |
| Caixa | R$ [X] | `financeiro.caixa_atual` |
| Runway | [N] meses | `financeiro.runway_meses` |
| Margem bruta | [X]% | `financeiro.margem_bruta_pct` |

Calcule o MRR de break-even e compare ao ritmo atual de novos pagantes; explicite se o patamar é atingido antes do caixa secar e o papel da rodada (`fundraising.objetivo_pos_rodada`).

---

## 05 — JURÍDICO

**Status: 🟢 [PREENCHER: frase de status]**

Registre a constituição (`empresa.razao_social`, `empresa.cnpj`, `empresa.fundacao`), o estado dos contratos/termos/privacidade e o instrumento da rodada (`fundraising.rodada_atual`, `fundraising.valuation_cap`). Aponte contencioso relevante, se houver.

---

## 06 — MARKETING

**Status: 🟡 [PREENCHER: frase de status]**

Cite o investimento (`financeiro.custos.marketing`) e o responsável (`time[]`). Aponte o canal principal atual e a alavanca-alvo de escala. Quantifique o Free a nutrir (`snapshot.clientes_free`) e o potencial de conversão (`concentracao.free_convertiveis_estimados`). Traga o CAC (`unit_economics.cac`) e a meta de reduzi-lo.

---

## 07 — PRODUTO

**Status: 🟡 [PREENCHER: frase de status]**

Liste o que está entregue vs. em construção (`produto.implementado`, `produto.em_construcao`) e as dependências críticas para o canal. Aponte o backlog priorizado. Liste os planos ativos (`planos[]`).

---

## 08 — PESSOAS

**Status: 🟢 [PREENCHER: frase de status]**

| Nome | Cargo | Custo/mês | Fonte |
|------|-------|-----------|-------|
| [PREENCHER] | [cargo] | R$ [X] | `time[]` |
| **Total folha** | | **R$ [X]** | `financeiro.custos.folha` |

Identifique o núcleo decisor e seus perfis (`time[].decisor`, `time[].perfil_cognitivo`). Aponte que as próximas contratações dependem da captação.

---

## 09 — CLIENTES

**Status: 🟡 [PREENCHER: frase de status]**

| Métrica | Valor | Fonte |
|---------|-------|-------|
| Clientes pagantes | [N] | `snapshot.clientes_pagantes` |
| Clientes free | [N] | `snapshot.clientes_free` |
| Ticket médio | R$ [X] | `snapshot.ticket_medio` |
| Churn logo / receita | [X]% / [X]% | `crescimento.churn_logo_mensal_pct` / `crescimento.churn_receita_mensal_pct` |
| LTV estimado | R$ [X] | `unit_economics.ltv` |
| Top-3 (% MRR) | [X]% | `concentracao.top3_pct_do_mrr` |

Liste os clientes em atenção/risco (`clientes[].health`) e destaque a concentração no topo como principal risco de carteira (`concentracao.top3_ids`).

---

## 10 — INVESTIDORES

**Status: 🟡 [PREENCHER: frase de status]**

Descreva a rodada (`fundraising.rodada_atual`), o quanto se busca (`fundraising.buscando`), o cap (`fundraising.valuation_cap`) e o já aportado (`fundraising.ja_aportado`). Cite o uso de recursos (`fundraising.uso_recursos_pct`) e o objetivo pós-rodada (`fundraising.objetivo_pos_rodada`).

---

## 11 — CONTAS A PAGAR

**Status: 🟡 [PREENCHER: frase de status]**

| Item | Valor/mês | Fonte |
|------|-----------|-------|
| Folha | R$ [X] | `financeiro.custos.folha` |
| Infraestrutura | R$ [X] | `financeiro.custos.infra` |
| APIs terceiros | R$ [X] | `financeiro.custos.apis_terceiros` |
| Marketing | R$ [X] | `financeiro.custos.marketing` |
| Ferramentas SaaS | R$ [X] | `financeiro.custos.ferramentas_saas` |
| Contábil/Jurídico | R$ [X] | `financeiro.custos.contabil_juridico` |
| **Total burn bruto** | **R$ [X]** | `financeiro.burn_bruto_mensal` |
