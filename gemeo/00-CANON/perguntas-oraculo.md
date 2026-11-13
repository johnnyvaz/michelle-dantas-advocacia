# Perguntas-alvo do oráculo

> As perguntas que este gêmeo digital **precisa** saber responder. Elas definem o que o
> canon deve conter: se uma pergunta não é computável a partir do `canon.yaml`, ou o canon
> ganha o dado, ou a pergunta sai da lista. Escreva 5–10, nas categorias que importarem.

## Como escrever uma boa pergunta

- **Computável**: a resposta sai de números do canon + uma conta visível.
- **Decisória**: responde algo que você de fato vai decidir (preço, contratação, investimento).
- **Com adesão** (opcional): se envolve outras pessoas, o oráculo cruza com `08-PESSOAS`.

## Perguntas (exemplos — substitua pelas suas)

### Investimento / valuation
1. _"Me ofereceram R$ X por Y% — fechado?"_ → exige `cap_table` ou premissas de valuation no canon.

### Pricing
2. _"E se eu aumentar o preço do plano X em N%?"_ → exige `planos[]`, `clientes[]`, elasticidade assumida.

### Crescimento / runway
3. _"Em quantos meses acaba o caixa no ritmo atual?"_ → `financeiro.runway_meses` (derivado, com conta).
4. _"Quantos clientes novos/mês preciso para break-even?"_ → `burn_bruto`, `ticket_medio`.

### Pessoas / decisão
5. _"Se eu decidir X, quem do time compra a ideia?"_ → exige perfis em `08-PESSOAS/Team/`.

---

**Regra**: pergunta sem dado no canon → o oráculo responde *"não tenho esse dado"* e aponta
qual campo do canon precisaria existir.
