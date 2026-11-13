# FAQ de Objeções — rebater investidor com o canon

> **Template** — preenchido via /montar-gemeo. Deriva do canon: `snapshot.*`, `mercado.*`, `crescimento.*`, `unit_economics.*`, `concentracao.top3_pct_do_mrr`, `premissas.gatilho_demanda.*`, `financeiro.runway_meses`, `fundraising.*`, `cap_table.*`, `time[]`.
> **Citação parseável**: todo número preenchido usa o marcador `R$ X [canon: path.do.campo]` ou `N [calc: metrica]` — o CI compara com o canon e acusa drift (specs/001-melhorias-gemeo/contracts/formatos-arquivos.md).

**Papel:** as objeções típicas de investidor (estilo Shark Tank) e a resposta-padrão — **sempre honesta, sempre com o número do canon**. O padrão é sempre o mesmo: *admitir o fato + mostrar o plano + citar a fonte*. Nunca minimizar risco real — a credibilidade da resposta honesta é a estratégia.

---

## O1 — "MRR pequeno demais. Isso é hobby, não empresa."
**Resposta:** [PREENCHER: tempo de empresa/produto no ar e o salto de 0 → tração atual] (`snapshot.meses_operacao`, `snapshot.clientes_pagantes`). O que se vende não é o MRR de hoje, mas a posição na janela e o LTV/CAC de [X] (`unit_economics.ltv_cac`).
**Fontes:** `snapshot.*`, `unit_economics.ltv_cac`.

## O2 — "Valuation cap caro para o ARR de hoje."
**Resposta:** estágio inicial não precifica múltiplo de receita — precifica **mercado × timing × time**. TAM de [N] empresas; a âncora de valor que elas já pagam soma R$ [X] (`mercado.ancora_de_valor`); o SOM ano-1 é [N] ([X]% do TAM). O cap está coerente com a meta de MRR R$ [X] em m12.
**Fontes:** `mercado.*`, `metas.m12_meses.*`, `fundraising.valuation_cap`.

## O3 (universal) — "O mercado é pequeno demais."
**Resposta:** TAM [N] / SAM [N] / SOM ano-1 [N] (`mercado.tam_empresas`, `.sam_empresas`, `.som_ano1_empresas`). Captar [X]% do SAM já sustenta o modelo; a âncora de valor (R$ [X], `mercado.ancora_de_valor`) mostra orçamento existente, não um mercado a criar do zero.
**Fontes:** `mercado.*`.

## O4 (universal) — "E se o gatilho de demanda atrasar? Sua tese morre."
**Resposta honesta:** o gatilho está previsto para [data] (`premissas.gatilho_demanda.data_prevista`) e pesa [X]% da demanda (`premissas.gatilho_demanda.peso_na_demanda_pct`) — ou seja, [PREENCHER: a fração residual] sobrevive a um atraso. A rodada compra [N] meses de runway (`fundraising.objetivo_pos_rodada`), suficientes para atravessar o atraso e chegar do outro lado com a base instalada que os atrasados vão precisar.
**Fontes:** `premissas.gatilho_demanda.*`, `financeiro.runway_meses`, `fundraising.objetivo_pos_rodada`.

## O5 (universal) — "Concentração de receita: poucos clientes seguram tudo."
**Resposta:** top-3 = [X]% do MRR (`concentracao.top3_pct_do_mrr`) — é o risco nº 1, registrado com dono e gatilho (ver `02-ESTRATEGIA/registro-de-riscos.md`). Plano: meta de reduzir a concentração, contrato anual na maior conta, plano de sucesso na conta em atenção. Não escondemos — está no risk register.
**Fontes:** `concentracao.top3_pct_do_mrr`, `registro-de-riscos.md`.

## O6 — "Runway curto. Vocês estão desesperados — eu dito o preço."
**Resposta:** captar com [N] meses de caixa é **timing planejado** (captação leva meses), não desespero (`financeiro.runway_meses`). Há plano B documentado: corte de burn (`financeiro.burn_liquido_mensal` → patamar mínimo), bridge do conversível, antecipação de anuais. Quem precifica desespero não tem plano B.
**Fontes:** `financeiro.runway_meses`, `financeiro.burn_liquido_mensal`, `registro-de-riscos.md`.

## O7 (universal) — "Time pequeno demais para executar isso."
**Resposta:** [N] pessoas (`time[]`), com os perfis cobrindo produto, construção e venda. Os decisores estão definidos (`time[].decisor`). [PREENCHER: por que a combinação cobre as três causas comuns de morte de startup]. Parte do uso da rodada é contratar para os gargalos.
**Fontes:** `time[]`, `fundraising.uso_recursos_pct`.

## O8 — "Founders muito diluídos não remam."
**Resposta:** cap table limpo — founders com [X]% hoje (`cap_table.atual[]`), ESOP [X]% (`cap_table.esop_alocado_pct`), conversível convertendo [X]% na rodada (`cap_table.conversiveis[]`). Pós-rodada no cap-alvo, founders ficam com [X]% (`cap_table.simulacoes.*`) — maioria absoluta e fôlego para a próxima rodada.
**Fontes:** `cap_table.*`, `10-INVESTIDORES/cap-table.md`.

## O9 (universal) — "Por que agora?"
**Resposta:** [PREENCHER: o gatilho que abre a janela] (`premissas.gatilho_demanda.descricao`, `.data_prevista`) cria urgência de compra agora; [X]% da demanda deriva dele (`.peso_na_demanda_pct`). Quem capturar o mercado e acumular dados nesta janela ganha uma vantagem que não se compra depois.
**Fontes:** `premissas.gatilho_demanda.*`.

## O10 — "Me mostra o produto. Existe ou é slide?"
**Resposta honesta:** o core existe e está em uso (`snapshot.uso_produto.*`). O que **não** existe ainda: [PREENCHER: o que está em construção — é parte do uso da rodada]. Não é vaporware nem produto completo: é exatamente o estágio que o cheque financia.
**Fontes:** `snapshot.uso_produto.*`, `07-PRODUTO/STATUS.md`.

## O11 — "Fecho agora: R$ [X] por [X]%."
**Resposta:** a conta não fecha para quem opera a empresa. A esse percentual, o post-money fica **abaixo do cap do conversível** — ele converte por `valor ÷ post-money` (fatia maior) e os founders caem para minoria já na primeira rodada (`cap_table.simulacoes.*`, ver Simulação B em `cap-table.md`). Contraproposta ancorada no cap-alvo, onde os founders saem com >50%.
**Fontes:** `cap_table.simulacoes.*`, `cap-table.md`.

---

## Leitura para o oráculo
1. Objeção reconhecida → usar a resposta-padrão **com os números e fontes daqui** (pode reformular o texto, nunca os números).
2. Padrão: **admitir o fato + mostrar o plano + citar a fonte**. Nunca minimizar risco real.
3. Objeção nova → derivar do canon e sinalizar que é derivação nova (candidata a entrar neste FAQ).
