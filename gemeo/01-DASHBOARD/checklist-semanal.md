# Checklist Semanal — Ritual de gestão

> **Template** — preenchido via /montar-gemeo. Deriva do canon: `snapshot.mrr`, `snapshot.ticket_medio`, `snapshot.clientes_free`, `snapshot.uso_produto.*`, `financeiro.caixa_atual`, `financeiro.burn_liquido_mensal`, `financeiro.runway_meses`, `financeiro.custos.folha`, `crescimento.*`, `concentracao.*`, `clientes[].health`, `time[]`, `fundraising.*`, `metas.m12_meses.*`.
> **Citação parseável**: todo número preenchido usa o marcador `R$ X [canon: path.do.campo]` ou `N [calc: metrica]` — o CI compara com o canon e acusa drift (specs/001-melhorias-gemeo/contracts/formatos-arquivos.md).

**Responsável:** [PREENCHER: nome — cargo do dono do ritual]
**Frequência:** [PREENCHER: ex. toda segunda-feira / primeiro dia útil da semana]
**Fonte de dados:** [`../00-CANON/canon.yaml`](../00-CANON/canon.yaml) — atualize o canon **antes** de rodar o checklist (ou rode `/atualizar-gemeo`).

---

## Estrutura do ritual

Ajuste a duração de cada bloco à realidade do negócio. Os tempos abaixo são guia.

| Bloco | Tempo | Tema |
|-------|-------|------|
| 1 | [N] min | MRR e Receita |
| 2 | [N] min | Caixa e Runway |
| 3 | [N] min | Pipeline de Vendas |
| 4 | [N] min | Health de Clientes |
| 5 | [N] min | Pessoas e Contratações |

---

## Bloco 1 — MRR e Receita

- [ ] Qual o MRR desta semana? (referência: R$ [X] — `snapshot.mrr`)
- [ ] Houve expansão (upgrade) ou contração (downgrade) na semana?
- [ ] Quantos novos pagantes entraram no mês corrente? (referência: [N]/mês — `crescimento.novos_clientes_pagantes_mes`)
- [ ] O ticket médio está estável, subindo ou caindo? (referência: R$ [X] — `snapshot.ticket_medio`)
- [ ] Estamos no ritmo para a meta de MRR de 12m? (`metas.m12_meses.*`)

**Ação se MRR cair:** investigar o churn (qual cliente, plano, motivo) e atualizar `clientes[].health` no canon.

---

## Bloco 2 — Caixa e Runway

- [ ] Qual o caixa disponível hoje? (referência: R$ [X] — `financeiro.caixa_atual`)
- [ ] O burn líquido da semana está dentro do esperado? (referência: R$ [X]/mês ÷ ~4 semanas — `financeiro.burn_liquido_mensal`)
- [ ] O runway ainda é de pelo menos [N] meses? (referência: [N] meses — `financeiro.runway_meses`)
- [ ] Houve despesa extraordinária (contratação, jurídico, infra extra)?
- [ ] Qual o status da rodada? (meta: R$ [X] @ cap R$ [X] — `fundraising.buscando`, `fundraising.valuation_cap`)

**Alerta crítico:** se o runway cair abaixo de [N] meses sem rodada fechada, acionar o plano de contingência de corte de burn.

---

## Bloco 3 — Pipeline de Vendas

- [ ] Quantos clientes no Free hoje? (referência: [N] — `snapshot.clientes_free`)
- [ ] Quantos estão quentes para conversão? (referência: [N] — `concentracao.free_convertiveis_estimados`)
- [ ] Quantos novos free entraram esta semana? (referência: [N]/mês — `crescimento.novos_free_mes`)
- [ ] Quantas oportunidades abertas no pipeline e em que etapa? (referência ciclo: [N] dias — `crescimento.ciclo_vendas_dias`)
- [ ] Há negociação relevante (maior plano) em andamento?
- [ ] Status das conversas de canal/parceria? (meta: `metas.m6_meses.*`)

**Ação se pipeline estiver fraco:** revisar o plano de ativação da semana seguinte com o responsável de growth (`time[]`).

---

## Bloco 4 — Health de Clientes

Revise os clientes em atenção e risco (uma linha por cliente sinalizado):

| Cliente | Plano | MRR | Status | Ação pendente |
|---------|-------|-----|--------|----------------|
| [PREENCHER: id] | [plano] | R$ [X] | atenção / risco | [PREENCHER: ação] |

*(Fonte: `clientes[].health` — atualizar após cada interação.)*

- [ ] Algum cliente "bom" reduziu uso esta semana?
- [ ] Os KPIs de uso do produto estão crescendo? (referência: `snapshot.uso_produto.*`; meta 12m: `metas.m12_meses.*`)
- [ ] Há suporte aberto sem resposta há mais de [N]h?

**Alerta de concentração:** os 3 maiores clientes representam [X]% do MRR (`concentracao.top3_pct_do_mrr`). Acompanhe o health deles com prioridade máxima.

---

## Bloco 5 — Pessoas e Contratações

- [ ] O time está funcionando sem gargalos críticos? (`time[]`)
- [ ] Há backlog técnico bloqueando vendas ou retenção?
- [ ] Há contratação em andamento? Qual o status?
- [ ] Há atrito no núcleo decisor que precisa ser tratado antes da semana? (`time[].decisor`)
- [ ] A folha do mês está dentro do previsto? (referência: R$ [X]/mês — `financeiro.custos.folha`)

**Próximas contratações:** dependem do fechamento da rodada (`fundraising.uso_recursos_pct`).

---

## Encerramento do ritual

1. Atualizar o `canon.yaml` com qualquer número novo (MRR, caixa, novos clientes, health).
2. Registrar os [N] riscos mais urgentes da semana em uma nota rápida.
3. Definir a prioridade nº1 de cada área para a semana seguinte.

> O canon atualizado alimenta o oráculo: a próxima sessão de perguntas reflete a realidade mais recente.
