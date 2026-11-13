# Matriz de Decisão e Adesão — previsão de adesão do time

> **Template** — preenchido via /montar-gemeo. Deriva do canon: `time[].{nome,cargo,decisor,perfil_cognitivo}`.
> **Citação parseável**: todo número preenchido usa o marcador `R$ X [canon: path.do.campo]` ou `N [calc: metrica]` — o CI compara com o canon e acusa drift (specs/001-melhorias-gemeo/contracts/formatos-arquivos.md).

> 🧠 **Baseada nos perfis cognitivos** do time (`Team/perfil-*.md`). A confiança da matriz
> herda a do perfil mais fraco que ela usa: se algum perfil é 🟡 ilustrativo, a previsão é
> ilustrativa — ver `../metodologia.md`. **Peça-chave do diferencial do gêmeo.**

**Data:** AAAA-MM · **Origem:** perfis em `./` + decisões do canon.

---

## O que esta matriz faz

Cruza os **decisores** (`time[].decisor` verdadeiro) com as **decisões estratégicas
recorrentes** e prevê a **postura** de cada um — ancorando cada célula num **driver do
perfil** ou num **número do canon**, nunca em achismo. É o insumo que deixa o oráculo
responder não só *"qual o impacto?"* mas *"o time abraça?"*.

**Legenda de postura (apenas estes 3 estados):** 🟢 **Apoia** · 🟡 **Neutro/condiciona** · 🔴 **Resiste**

**Regra do veredito (por que não é só contar votos):** cada decisão tem um *dono natural*
pela área e pelo peso societário. Captação/diluição tende a ser do bloco fundador; preço e
aquisição pesam para quem toca comercial; headcount de engenharia e dívida técnica pesam
para quem toca produto. O veredito pondera **quem é dono + quantos apoiam**.

---

## Matriz

> Tipos de decisão nas **linhas**, decisores nas **colunas**. Célula = postura 🟢🟡🔴 +
> 1 linha de racional (driver do perfil ou número do canon). Substitua os rótulos de coluna
> pelos nomes reais de `time[]`.

| Decisão estratégica | [Decisor 1] | [Decisor 2] | [Decisor 3] | Veredito provável |
|---------------------|:-----------:|:-----------:|:-----------:|-------------------|
| **Pricing** — alterar preço/planos | 🟢/🟡/🔴 | 🟢/🟡/🔴 | 🟢/🟡/🔴 | [PREENCHER] |
| **Contratação** — abrir headcount | 🟢/🟡/🔴 | 🟢/🟡/🔴 | 🟢/🟡/🔴 | [PREENCHER] |
| **Captação** — levantar rodada / diluir | 🟢/🟡/🔴 | 🟢/🟡/🔴 | 🟢/🟡/🔴 | [PREENCHER] |
| **Pivot** — mudar foco de produto/canal | 🟢/🟡/🔴 | 🟢/🟡/🔴 | 🟢/🟡/🔴 | [PREENCHER] |
| **[outra decisão recorrente]** | 🟢/🟡/🔴 | 🟢/🟡/🔴 | 🟢/🟡/🔴 | [PREENCHER] |

### Racional por célula (1 linha cada)

[PREENCHER: para cada postura acima, uma linha ligando à evidência. Ex.:
"[Decisor 1] 🔴 em Captação — driver de controle/autonomia: diluição alta ataca o gatilho
de resistência dele." Toda célula precisa de uma âncora: driver do perfil **ou** número do canon.]

### Argumento que convence cada decisor (por decisão)

| Decisão | Convencer [Decisor 1] | Convencer [Decisor 2] | Convencer [Decisor 3] |
|---------|----------------------|----------------------|----------------------|
| Pricing | [PREENCHER] | [PREENCHER] | [PREENCHER] |
| Contratação | [PREENCHER] | [PREENCHER] | [PREENCHER] |
| Captação | [PREENCHER] | [PREENCHER] | [PREENCHER] |
| Pivot | [PREENCHER] | [PREENCHER] | [PREENCHER] |

---

## Como detalhar uma célula crítica

Para a decisão mais sensível, abra duas camadas (modelo de resposta do oráculo):

1. **Camada numérica (do canon):** o número que define a decisão (preço, diluição,
   headcount, etc.) e a conta visível.
2. **Camada de adesão (por que o time reage assim):** para cada decisor, o **driver
   dominante** do perfil que explica a postura 🟢🟡🔴.
3. **Veredito + contraproposta:** o que o time fecha, e — se não fecha — quem precisa ser
   convencido e com qual argumento.

> Decisão divergente não é problema: registrar **também as posições 🔴/🟡** é exatamente o
> que alimenta a camada de adesão. Cada veredito vira (ou referencia) uma entrada no
> `02-ESTRATEGIA/registro-de-decisoes.md`.
