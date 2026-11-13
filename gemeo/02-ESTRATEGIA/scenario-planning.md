# Planejamento de Cenários — base, otimista e pessimista

> **Template** — preenchido via /montar-gemeo. Deriva do canon: `snapshot.*`, `financeiro.*`, `concentracao.*`, `crescimento.*`, `premissas.gatilho_demanda.*`, `premissas.elasticidade_preco.<plano>`, `metas.*`.
> **Citação parseável**: todo número preenchido usa o marcador `R$ X [canon: path.do.campo]` ou `N [calc: metrica]` — o CI compara com o canon e acusa drift (specs/001-melhorias-gemeo/contracts/formatos-arquivos.md).

---

## Para que serve este documento

É o coração do Gêmeo Digital no modo de decisão. Cada cenário é **computável a partir do canon**: parte de premissas com origem rastreável, descreve o impacto qualitativo e fecha numa estimativa quantitativa. São estes cenários que sustentam as respostas do oráculo a perguntas do tipo "e se...".

**Regra de cálculo:** quando o canon não traz um número (ex.: CAC de um canal novo), o cenário escreve "sem dado no canon" e mantém a análise direcional — **nunca inventa cifra**.

### Baseline (foto de AAAA-MM-DD — `snapshot.*` + `financeiro.*`)

| Variável | Valor | Campo do canon |
|----------|-------|----------------|
| MRR | R$ `[X]` | `snapshot.mrr` |
| Clientes pagantes | `[N]` | `snapshot.clientes_pagantes` |
| Caixa atual | R$ `[X]` | `financeiro.caixa_atual` |
| Burn bruto / líquido mensal | R$ `[X]` / R$ `[X]` | `financeiro.burn_bruto_mensal` / `financeiro.burn_liquido_mensal` |
| Runway | `[N]` meses | `financeiro.runway_meses` |
| Concentração top-3 | `[X]%` do MRR | `concentracao.top3_pct_do_mrr` |

> **Nota metodológica sobre runway:** verifique se o burn é majoritariamente **fixo** (folha em `financeiro.custos.folha` vs. `financeiro.burn_bruto_mensal`). Se for, choques de **receita** mexem pouco no runway de curto prazo (o dano é de *trajetória* — break-even, sinal a investidor), enquanto choques de **custo** (contratar) cortam runway direto. Deixe isso explícito em cada cenário.

---

## Cenário BASE (o esperado)

> **Premissa:** o run-rate atual de `crescimento.*` se mantém; o gatilho de demanda ocorre no prazo previsto (`premissas.gatilho_demanda.data_prevista`).

- **Premissas (canon):** [PREENCHER — aquisição `crescimento.novos_clientes_pagantes_mes`, churn `crescimento.churn_receita_mensal_pct`, ciclo `crescimento.ciclo_vendas_dias`].
- **Cálculo / trajetória:** [PREENCHER — projeção até os marcos de `metas.m6_meses.*` e `metas.m12_meses.*`, com a conta visível].
- **Veredito:** [PREENCHER — o plano-padrão sob este cenário].

## Cenário OTIMISTA (o que destrava a aceleração)

> **Premissa:** a alavanca principal performa acima do esperado (ex.: o motor de escala de [`growth-strategy.md`](./growth-strategy.md) engata; um movimento de preço favorável onde a elasticidade permite).

- **Premissas (canon):** [PREENCHER — ex. elasticidade do plano menos sensível em `premissas.elasticidade_preco.<plano>`; aceleração de aquisição].
- **Cálculo:** [PREENCHER — efeito em MRR / runway / data de break-even; mostre a conta].
- **Veredito:** [PREENCHER — onde reinvestir o upside sem estourar guardrails].

## Cenário PESSIMISTA (o que precisamos sobreviver)

> **Premissa:** combine os choques estruturais que o canon torna visíveis — o gatilho de demanda falha **e/ou** a receita concentra-se mais.

- **Premissas (canon — `premissas.gatilho_demanda.cenario_sem_gatilho.*`):** queda de demanda `[X]%` (`queda_demanda_pct`), ciclo `+[X]%` (`aumento_ciclo_vendas_pct`), demanda residual `[X]%` (`demanda_residual_pct`).
- **Choque de concentração (`concentracao.*`):** perder o top-`[N]` derruba `[X]%` do MRR; mostre o runway antes/depois (lembre da nota metodológica — se o burn é fixo, o runway cai pouco; o dano é de tese).
- **Cálculo:** [PREENCHER — aquisição reduzida `crescimento.novos_clientes_pagantes_mes` × (1 − queda); ciclo `crescimento.ciclo_vendas_dias` × fator; conta visível].
- **Veredito / plano B:** [PREENCHER — ex. vender o valor permanente, não o gatilho; diversificar carteira; cortar burn].

---

## Síntese e gatilhos de replanejamento

| Cenário | Variável-chave | Efeito quantitativo | Decisão |
|---------|----------------|---------------------|---------|
| Base | run-rate `crescimento.*` | [PREENCHER] | [seguir plano] |
| Otimista | [alavanca] | [PREENCHER] | [reinvestir upside] |
| Pessimista | gatilho + concentração | [PREENCHER] | [plano B] |

**Gatilhos de replanejamento (revisar os cenários quando):**
- [PREENCHER: ex. mudança oficial no prazo do gatilho de demanda] → reprojetar na semana.
- Churn de qualquer conta grande (`clientes[].health` em alerta) → recomputar concentração.
- Sem term sheet até AAAA-MM-DD (`fundraising.*`) → ativar plano de corte de burn.
- Qualquer premissa do canon mudar em `[X]%` → recomputar o cenário afetado.

---

*Coerência: todos os números derivam de `snapshot.*`, `financeiro.*`, `concentracao.*`, `crescimento.*` e `premissas.*` do canon. Lacunas são sinalizadas, não preenchidas.*
