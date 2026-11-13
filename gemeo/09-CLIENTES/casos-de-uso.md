# Casos de Uso — como cada segmento usa o produto

> **Template** — preenchido via /montar-gemeo. Deriva do canon: `clientes[].{id,nome,segmento,plano,obs}` · `planos[].{id,target}`.
> **Citação parseável**: todo número preenchido usa o marcador `R$ X [canon: path.do.campo]` ou `N [calc: metrica]` — o CI compara com o canon e acusa drift (specs/001-melhorias-gemeo/contracts/formatos-arquivos.md).

**Data:** AAAA-MM · **Fontes:** `clientes[]` do canon + `07-PRODUTO/`.

---

## Para que serve

Mapear clientes reais aos casos de uso principais do produto — mostra como a proposta de
valor se materializa em contexto operacional concreto. Alimenta decisões de **pricing**
(quanto cada segmento extrai de valor) e **churn** (qual dor retém). Quando um segmento
ainda não tem cliente pagante, descreva-o como **perfil ilustrativo** (ex.: conta free em
avaliação) e marque como tal.

> **Modelo:** um bloco por caso de uso, com os 5 campos abaixo. Use 3 a 5 casos cobrindo os
> segmentos mais relevantes de `clientes[].segmento`.

---

## Caso 1 — [Título: segmento + o que resolve]

- **Cliente / segmento:** [id] — [nome] | `clientes[].segmento` | Plano: [plano] | Health: [estado]
- **Dor:** [PREENCHER: o problema operacional concreto antes do produto — em 1–2 frases.]
- **Como usa o produto:** [PREENCHER: as funcionalidades acionadas e o fluxo real de uso.]
- **Valor percebido:** [PREENCHER: o que o cliente ganha — em tempo, custo, risco evitado.]
- **Evidência:** [PREENCHER: o sinal concreto — de `clientes[].obs`, métrica de uso, fala
  do cliente. Sem evidência, marque "a confirmar".]

---

## Caso 2 — [Título]

- **Cliente / segmento:** [id] — [nome] | [segmento] | Plano: [plano] | Health: [estado]
- **Dor:** [PREENCHER]
- **Como usa o produto:** [PREENCHER]
- **Valor percebido:** [PREENCHER]
- **Evidência:** [PREENCHER]

---

## Caso 3 — [Título]

- **Cliente / segmento:** [id] — [nome] | [segmento] | Plano: [plano] | Health: [estado]
- **Dor:** [PREENCHER]
- **Como usa o produto:** [PREENCHER]
- **Valor percebido:** [PREENCHER]
- **Evidência:** [PREENCHER]

---

## Caso N — Perfil ilustrativo (segmento sem cliente pagante)

> **Nota:** quando um segmento-alvo (`planos[].target`) ainda não tem representação na base
> pagante, descreva um **perfil ilustrativo** (ex.: conta free em avaliação) e marque como
> tal — não apresente como cliente real.

- **Perfil ilustrativo:** [PREENCHER: segmento, porte, contexto] — **não é cliente pagante**
- **Dor:** [PREENCHER]
- **Como usaria o produto:** [PREENCHER]
- **Valor percebido / potencial de conversão:** [PREENCHER: plano adequado + pitch de ROI.]
- **Evidência:** perfil ilustrativo — a validar com a primeira conta real do segmento.
