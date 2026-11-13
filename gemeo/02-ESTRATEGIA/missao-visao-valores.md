# Missão, Visão e Valores — identidade e tese do negócio

> **Template** — preenchido via /montar-gemeo. Deriva do canon: `empresa.one_liner`, `empresa.estagio`, `snapshot.*`, `concentracao.*`, `financeiro.runway_meses`, `premissas.gatilho_demanda.*`, `metas.m12_meses.*`.
> **Citação parseável**: todo número preenchido usa o marcador `R$ X [canon: path.do.campo]` ou `N [calc: metrica]` — o CI compara com o canon e acusa drift (specs/001-melhorias-gemeo/contracts/formatos-arquivos.md).

---

## One-liner (canon)

> [PREENCHER: copie `empresa.one_liner` do canon, sem reescrever]
> — `empresa.one_liner`

Missão, visão e valores abaixo são a **leitura humana** desse one-liner para o estágio atual (`empresa.estagio`). Não são aspiração genérica: são o filtro que decide o que fazer e o que recusar enquanto o negócio tem `[N]` pessoas e `financeiro.runway_meses` de caixa.

---

## Missão (por que existimos — hoje)

**[PREENCHER: a missão em uma frase concreta e datada — o problema real que você resolve para o seu cliente-alvo, não um slogan abstrato]**

> Regra de estilo: missão concreta, não "revolucionar o setor". Descreva a transformação que o cliente vive ao usar o produto. Ancore no segmento que aparece em `clientes[].segmento` e na dor que o produto endereça (`produto.implementado`).

## Visão (onde queremos chegar)

**[PREENCHER: o que o negócio quer ser — o padrão de fato / a camada essencial no seu mercado]**

A visão de 12 meses é **mensurável e vive no canon** (`metas.m12_meses.*`). Traduza-a aqui em uma frase, sem repetir os números (eles ficam em `OKRs/anual.md` e `strategic-metrics.md`).

> **Honestidade de estágio:** a visão é grande, a tração é pequena (`snapshot.clientes_pagantes` pagantes, `snapshot.mrr` de MRR). Não finja o contrário — diga em voz alta qual é a ponte entre os dois (o motor de [`growth-strategy.md`](./growth-strategy.md)).

## Valores

Escolha de 3 a 5 valores **porque resolvem tensões reais** do estágio — não porque soam bem. Para cada um: nome curto + 2–3 linhas de como ele governa decisões. Sugestões de eixos que costumam importar numa fase inicial:

### 1. [PREENCHER: ex. "Número antes de narrativa"]
Toda decisão começa nos dados do canon. Se a tese não fecha em número, é hipótese, não estratégia — o próprio Gêmeo Digital existe para responder com dado rastreável, não opinião. *(Reflete a "regra de ouro" do repositório: número primeiro, sem inventar dado.)*

### 2. [PREENCHER: ex. "Honestidade sobre risco"]
Nomeie a fragilidade estrutural com números do canon (concentração em `concentracao.top3_pct_do_mrr`, dependência de gatilho em `premissas.gatilho_demanda.peso_na_demanda_pct`, prazo de caixa em `financeiro.runway_meses`). Risco nomeado é risco gerenciável.

### 3. [PREENCHER: ex. "Foco em quem o incumbente não atende"]
Defina o ICP que ninguém serve bem e que vocês servem por desenho. Cada feature passa pelo crivo "isso ajuda o cliente do nosso ICP?".

### 4. [PREENCHER: ex. "Velocidade com runway curto"]
Com caixa contado (`financeiro.runway_meses`), tempo é o recurso mais escasso. Prefira o experimento barato e reversível à decisão perfeita atrasada. Crivo: "qual o impacto no runway?".

### 5. [PREENCHER: ex. "Construir distribuição, não só produto"]
Produto bom não se vende sozinho. O valor composto vem dos canais ([`growth-strategy.md`](./growth-strategy.md)). Crescimento é responsabilidade de produto e de growth juntos.

---

## Como isto conecta ao resto da estratégia

- A **missão** define o ICP e o produto → `07-PRODUTO/`.
- A **visão** vira metas numéricas → [`strategic-metrics.md`](./strategic-metrics.md) e [`OKRs/anual.md`](./OKRs/anual.md).
- Os **valores** governam como decidimos → [`decision-framework.md`](./decision-framework.md).

---

*Coerência: missão e visão derivam de `empresa.one_liner` e `metas.m12_meses.*`. Nenhum número novo é introduzido aqui — todos vivem no canon.*
