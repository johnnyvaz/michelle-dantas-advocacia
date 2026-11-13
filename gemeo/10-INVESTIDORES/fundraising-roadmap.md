# Fundraising Roadmap — fases e prontidão da captação

> **Template** — preenchido via /montar-gemeo. Deriva do canon: `fundraising.*`, `financeiro.runway_meses`, `financeiro.burn_bruto_mensal`, `crescimento.*`, `premissas.gatilho_demanda.*`, `metas.{m6_meses.*,m12_meses.*}`.
> **Citação parseável**: todo número preenchido usa o marcador `R$ X [canon: path.do.campo]` ou `N [calc: metrica]` — o CI compara com o canon e acusa drift (specs/001-melhorias-gemeo/contracts/formatos-arquivos.md).

**Fonte dos números-âncora:** `00-CANON/canon.yaml`.

---

## Visão geral da trajetória

A captação se organiza em momentos separados por marcos. Cada rodada só abre quando os critérios de prontidão da anterior estão batidos.

```
[AGORA]            [MARCO m12]            [ESCALA]
   |                    |                     |
Rodada atual          Próxima             Rodada futura
R$ [X] @ cap          R$ [X]              R$ [X]
   |                    |                     |
Destrava runway    Prova de tração     Escala / expansão
e marcos de m6     + timing de mercado
```

---

## Rodada atual

### Estrutura
| Item | Valor | Campo do canon |
|------|-------|----------------|
| Instrumento | [PREENCHER] | `fundraising.rodada_atual` |
| Buscando | R$ [X] | `fundraising.buscando` |
| Valuation cap | R$ [X] | `fundraising.valuation_cap` |
| Já aportado | R$ [X] | `fundraising.ja_aportado` |

### Por que agora
- Runway atual: **[N] meses** (caixa seca em [PREENCHER]) — `financeiro.runway_meses`.
- Break-even exige MRR ≈ R$ [X] (`financeiro.burn_bruto_mensal`); no ritmo atual (`crescimento.novos_clientes_pagantes_mes`) esse patamar não chega antes do caixa secar.
- Janela do gatilho de demanda: `premissas.gatilho_demanda.data_prevista` — quem acumular vantagem agora não a compra depois.

### Uso dos recursos
| Destino | % | O que constrói |
|---------|--:|----------------|
| [PREENCHER] | [X]% | [PREENCHER] |

*(Fonte: `fundraising.uso_recursos_pct`.)*

### O que a rodada compra
- Runway de [N] meses — `fundraising.objetivo_pos_rodada`.
- Tempo para atingir os marcos de prontidão da próxima rodada (abaixo).

### Perfil do investidor-alvo
- [PREENCHER: anjos com experiência no setor; fundos do estágio; estratégicos].
- Ticket por investidor: R$ [X]; rodada de [N] investidores.

---

## Critérios de prontidão para a próxima rodada

A próxima rodada abre quando a tração de escala e o timing de mercado estiverem provados simultaneamente.

| Critério | Meta | Quando | Campo do canon |
|----------|------|--------|----------------|
| MRR | R$ [X] | m12 | `metas.m12_meses.*` [canon] |
| Clientes ativos | [N] | m12 | `metas.m12_meses.*` [canon] |
| Uso do produto | [N] | m12 | `metas.m12_meses.*` [canon] |
| Marco de canal/distribuição | [PREENCHER] | m12 | `metas.m12_meses.*` [canon] |
| Churn de receita estabilizado | [X]% | m12 | derivado de `crescimento.churn_receita_mensal_pct` |
| Break-even operacional | R$ [X] | [PREENCHER] | derivado de `financeiro.burn_bruto_mensal` |

**Marcos intermediários (m6):** [PREENCHER] — `metas.m6_meses.*` [canon].

**Por que esses marcos importam:** [PREENCHER: cada um prova que o modelo escala — não só que vende].

---

## Pipeline de investidores

Preencher conforme conversas avançam. Um investidor por linha.

| Investidor | Tipo | Ticket alvo | Estágio | Próximo passo | Atualizado em |
|------------|------|------------:|---------|---------------|---------------|
| [PREENCHER] | [anjo/fundo/estratégico] | R$ [X] | [contato/em conversa/DD/term sheet] | [PREENCHER] | [AAAA-MM-DD] |

---

## Rodadas futuras (horizonte)

| Rodada | Instrumento | Captação | Timing | Tipo |
|--------|-------------|---------:|--------|------|
| Próxima | [PREENCHER] | R$ [X] | [PREENCHER] | derivado |
| Seguinte | [PREENCHER] | R$ [X] | [PREENCHER] | derivado |

*(*) Valuation futuro é estimativa de mercado, não compromisso da empresa.*

---

## Riscos da estratégia de fundraising

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Rodada não fecha no prazo | [PREENCHER] | Crítico | Corte de burn (`financeiro.burn_liquido_mensal` → mínimo); runway estende |
| Gatilho de demanda atrasa | [PREENCHER] | Alto | Marcos via valor operacional (não só o gatilho) — `premissas.gatilho_demanda.*` |
| Mercado de capital esfria | [PREENCHER] | Alto | Eficiência de capital; opção de bridge entre rodadas |
| Entrante implementa antes | [PREENCHER] | Médio | Defensabilidade já construída |

---

*Números-âncora derivam de `00-CANON/canon.yaml`. Projeções [derivado] são extrapolações coerentes e se atualizam quando o canon muda.*
