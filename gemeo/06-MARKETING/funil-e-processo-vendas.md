# Funil e Processo de Vendas — Etapas, playbook e SLAs

> **Template** — preenchido via /montar-gemeo. Deriva do canon: crescimento.*, unit_economics.*, metas.{m6_meses,m12_meses}.
> Toda conversão e prazo sai do canon (`crescimento`, `unit_economics`); aqui só se descreve o processo.
> **Citação parseável**: todo número preenchido usa o marcador `R$ X [canon: path.do.campo]` ou `N [calc: metrica]` — o CI compara com o canon e acusa drift (specs/001-melhorias-gemeo/contracts/formatos-arquivos.md).

[PREENCHER: data de referência AAAA-MM-DD] · **Dono**: [PREENCHER: papel responsável pelo funil].
ICP detalhado em `icp-persona.md`. Posicionamento e mensagens em `posicionamento.md`.

O funil descreve como um desconhecido vira cliente pagante. Use os números do canon como verdade;
onde não houver dado (ex.: tráfego não instrumentado), declare o gancho — nunca invente.

---

## 1. O funil hoje (números canônicos)

Desenhe as etapas com os números de `crescimento.*`. Marque como placeholder o que ainda não é medido.

```text
Tráfego (site/conteúdo)          → [PREENCHER: instrumentado? gancho: GA4 + /atualizar-analytics]
   ↓
Novos FREE: [N]/mês              → base atual: [N] contas free (snapshot.clientes_free)
   ↓  conversão free→pago: [X]%  (crescimento.conversao_free_para_pago_pct)
Novos PAGANTES: [N]/mês          → base: [N] contas (crescimento.novos_clientes_pagantes_mes)
   ↓
Ciclo de venda: [N] dias         → ticket médio R$ [X]
   (crescimento.ciclo_vendas_dias)   (snapshot.ticket_medio)
```

- **Motores de aquisição**: [PREENCHER: ex.: ① PLG (free → upgrade) e ② venda direta]. Diga qual é o mix e o que ainda não é instrumentado.
- **CAC e payback**: CAC R$ [X] (`unit_economics.cac`); payback [N] meses (`unit_economics.payback_cac_meses`). Explique como o CAC é calculado.

## 2. Canais (em ordem de aposta)

Cada canal: estado atual e a tese de por que deve funcionar.

| Canal | Estado | Tese |
|-------|--------|------|
| [PREENCHER: ex.: conteúdo/SEO] | [PREENCHER: ativo/0/meta] | [PREENCHER: por que o público está aqui] |
| [PREENCHER: ex.: parcerias] | [PREENCHER] | [PREENCHER] |
| [PREENCHER: ex.: outbound] | [PREENCHER] | [PREENCHER] |
| [PREENCHER: ex.: indicação] | [PREENCHER] | [PREENCHER] |

## 3. Playbook da venda direta

Passo a passo do processo comercial, com o SLA de follow-up de cada etapa.

1. **Qualificação** ([PREENCHER: duração]): [PREENCHER: perguntas-chave que separam quem cabe no free de quem é pagante; quem decide].
2. **Demo** ([PREENCHER: duração]): [PREENCHER: como demonstrar valor — ex.: usar um caso real do prospect]. Âncora de valor de `posicionamento.md`.
3. **Piloto**: [PREENCHER: formato do teste — ex.: conta free com o uso mais relevante do prospect].
4. **Proposta**: [PREENCHER: plano por critério de volume/uso (`planos[]`); plano superior só com contrato].
5. **Fechamento**: ciclo médio [N] dias (`crescimento.ciclo_vendas_dias`); **SLA de follow-up**: [PREENCHER: cadência — ex.: contato a cada [N] dias].

**Regras de saúde da carteira**: [PREENCHER: ex.: priorizar logos novos de segmentos diferentes a expandir o topo; toda conta de plano superior exige contrato].

## 4. Capacidade e metas

Confronte o ritmo atual com as metas do canon. Seja honesto sobre o gargalo.

- **Gargalo declarado**: [PREENCHER: quem/o quê limita o motor de vendas hoje].
- **Meta m6**: [PREENCHER: alvo de `metas.m6_meses.*`] vs. ritmo atual — alcançável? em que condição?
- **Meta m12**: [PREENCHER: alvo de `metas.m12_meses.*`] — o que precisa entrar (canais/contratações) para chegar lá?

## 5. Leitura para o oráculo

Atalhos para responder perguntas de aquisição: aponte a seção e o campo do canon, e o que NÃO existe.

- "Como crescem [N]×?" → §4: ritmo atual vs. metas canônicas + gargalo.
- "Quanto custa adquirir um cliente?" → `unit_economics.cac` com a ressalva de mix (§1); por plano, `unit_economics_por_plano`.
- Números de tráfego/visitantes **podem não existir no canon** → não inventar; citar o gancho de instrumentação.
