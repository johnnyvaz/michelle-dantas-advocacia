# Processos-Chave — Cadeia de valor ponta a ponta

> **Template** — preenchido via /montar-gemeo. Deriva do canon: `crescimento.*`, `snapshot.uso_produto.*`, `produto.{implementado,em_construcao}`, `clientes[].health`, `financeiro.custos`, `fundraising.uso_recursos_pct`, `metas.m12_meses.*`.
> **Citação parseável**: todo número preenchido usa o marcador `R$ X [canon: path.do.campo]` ou `N [calc: metrica]` — o CI compara com o canon e acusa drift (specs/001-melhorias-gemeo/contracts/formatos-arquivos.md).

**Data de referência**: `AAAA-MM-DD` (`_meta.data_referencia`)
**Papel**: como o valor flui do lead à entrega — quem faz o quê, com qual ferramenta, e **o que ainda é manual** (honestidade operacional, amarrada a `produto.*`). Complementa `Workflows/workflows.md`.

---

## Visão da cadeia

[PREENCHER: desenhe o fluxo macro em texto/ASCII. Padrão genérico:]

```text
P1 Aquisição → P2 Onboarding → P3 Entrega → P4 Operação/Analytics
                                                   ↓
                            P6 Cobrança  ←  P5 Suporte/Renovação
```

> Numere P1..Pn na ordem em que o valor flui. Cada negócio tem o seu — não force os 6 abaixo se a cadeia for menor.

## P1 — Aquisição → Signup
- **Dono**: [PREENCHER: papel, não nome] · **Ferramentas**: [PREENCHER]
- **Entrada → Saída**: visitante → conteúdo/canal → signup ou pedido de demo
- **Métricas**: `[N]` novos free/mês, `[N]` novos pagantes/mês (`crescimento.novos_free_mes`, `crescimento.novos_clientes_pagantes_mes`)
- **Status de automação**: [PREENCHER: automatizado / manual-assistido / manual]
- **Riscos**: [PREENCHER: o que quebra este processo]

## P2 — Onboarding e ativação
- **Dono**: [PREENCHER] · **Ferramentas**: [PREENCHER]
- **Entrada → Saída**: dados do cliente → validação → conta ativada e usável
- **SLA interno**: [PREENCHER: ex. conta pagante ativada em ≤ [N] dias úteis]
- **Status**: [PREENCHER] — se o self-service ainda não existe, declare aqui (`produto.em_construcao`)
- **Métrica**: `[N]` (`snapshot.uso_produto.*`)
- **Riscos**: [PREENCHER]

## P3 — Entrega do core (o que o produto faz)
- **Dono**: [PREENCHER] · **Ferramentas**: [PREENCHER: o que é software de verdade, `produto.implementado`]
- **Entrada → Saída**: insumo do cliente → processamento → artefato entregue
- **Status**: [PREENCHER: este costuma ser o processo mais automatizado — é o core]
- **Métrica**: `[N]` (`snapshot.uso_produto.*`)
- **Riscos**: [PREENCHER]

## P4 — Operação contínua + Analytics
- **Dono**: [PREENCHER] · **Ferramentas**: [PREENCHER]
- **Entrada → Saída**: uso do produto pelo cliente final → eventos registrados → analytics/painel
- **Status**: [PREENCHER]
- **Métrica**: `[N]` (`snapshot.uso_produto.*`)
- **COMPONENTE CRÍTICO**: [PREENCHER: componente cuja indisponibilidade exige post-mortem]. Identifique o serviço cujo downtime tem impacto irreversível ou sem "deploy de correção" — é o SLA mais crítico da empresa. Incidente nele → abrir `99-TEMPLATES/postmortem.md`.

## P5 — Suporte e Customer Success / Renovação
- **Dono**: [PREENCHER] · **Ferramentas**: [PREENCHER: helpdesk dedicado? ou ainda e-mail/mensageria?]
- **Entrada → Saída**: pedido → triagem → resposta; revisão de health da carteira
- **Status**: [PREENCHER] — se o health tracking é planilha + julgamento, diga (explica por que `clientes[].health` é qualitativo)
- **Métricas-guarda**: churn logo `[X]%`/mês, churn receita `[X]%`/mês (`crescimento.churn_logo_mensal_pct`, `crescimento.churn_receita_mensal_pct`)
- **Riscos**: [PREENCHER]

## P6 — Cobrança e faturamento
- **Dono**: [PREENCHER] · **Ferramentas**: [PREENCHER: gateway de pagamento? ou faturamento manual via contabilidade?]
- **Entrada → Saída**: fechamento mensal → emissão/cobrança → conciliação
- **Status**: [PREENCHER]
- **Métrica**: MRR `R$ [X]` (`snapshot.mrr`); inadimplência [PREENCHER]
- **Riscos**: [PREENCHER]

---

## Resumo honesto da automação

| Processo | Estado |
|----------|--------|
| [PREENCHER: P_ que é core de software testado] | ✅ automatizado |
| [PREENCHER: P_ automatizado até certo ponto] | ✅ parcial |
| [PREENCHER: P_ ainda manuais] | ⚠️ manual-assistido — escalam até ~`[N]` contas, depois quebram |

> Declare o **teto de contas** que a operação manual atual aguenta. Esse teto é o gatilho de investimento: abaixo dele, scripts bastam; acima, é preciso self-service.
> Se a rodada aloca % em produto/engenharia (`fundraising.uso_recursos_pct`), é para transformar os P_ manuais em self-service **antes** de bater o teto — relacione com a meta de organizações em m12 (`metas.m12_meses.*`).

## Leitura para o oráculo
- "Vocês escalam?" → resposta honesta: core automatizado, casca operacional manual com teto de ~`[N]` contas e plano financiado para resolvê-la (esta página + `produto.*`).
- Custo dos processos → `financeiro.custos` (não estimar valores novos).
