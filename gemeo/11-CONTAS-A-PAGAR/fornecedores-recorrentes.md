# Fornecedores Recorrentes — Detalhe do burn mensal

> **Template** — preenchido via /montar-gemeo. Deriva do canon: `_meta.moeda`, `financeiro.custos.{folha,infra,apis_terceiros,marketing,ferramentas_saas,contabil_juridico,outros}`, `financeiro.burn_bruto_mensal`.
> **Citação parseável**: todo número preenchido usa o marcador `R$ X [canon: path.do.campo]` ou `N [calc: metrica]` — o CI compara com o canon e acusa drift (specs/001-melhorias-gemeo/contracts/formatos-arquivos.md).

**Data de referência:** AAAA-MM-DD
**Fonte:** [`../00-CANON/canon.yaml`](../00-CANON/canon.yaml) — valores na moeda de `_meta.moeda`.

> **Como preencher:** uma seção por categoria de `financeiro.custos.*`. Liste os
> fornecedores reais; o **subtotal de cada seção deve bater com o campo do canon
> citado**. Vencimento e forma de pagamento são operacionais (não vivem no canon).

---

## Infraestrutura — R$ [X]/mês (`financeiro.custos.infra`)

| Fornecedor | Serviço | Valor/mês | Vencimento | Forma |
|------------|---------|----------:|------------|-------|
| [PREENCHER: fornecedor] | [serviço] | R$ [X] | dia [N] | cartão / boleto / débito |
| [PREENCHER: fornecedor] | [serviço] | R$ [X] | dia [N] | cartão / boleto / débito |
| **Subtotal infra** | | **R$ [X]** | | |

---

## APIs e Serviços de Terceiros — R$ [X]/mês (`financeiro.custos.apis_terceiros`)

| Fornecedor | Serviço | Valor/mês | Vencimento | Forma |
|------------|---------|----------:|------------|-------|
| [PREENCHER: fornecedor] | [serviço] | R$ [X] | dia [N] | cartão / boleto / débito |
| **Subtotal APIs** | | **R$ [X]** | | |

---

## Ferramentas SaaS — R$ [X]/mês (`financeiro.custos.ferramentas_saas`)

| Fornecedor | Serviço | Valor/mês | Vencimento | Forma |
|------------|---------|----------:|------------|-------|
| [PREENCHER: fornecedor] | [serviço] | R$ [X] | dia [N] | cartão / boleto / débito |
| **Subtotal ferramentas** | | **R$ [X]** | | |

---

## Contábil e Jurídico — R$ [X]/mês (`financeiro.custos.contabil_juridico`)

| Fornecedor | Serviço | Valor/mês | Vencimento | Forma |
|------------|---------|----------:|------------|-------|
| [PREENCHER: escritório contábil] | [serviço] | R$ [X] | dia [N] | boleto / débito |
| **Subtotal contábil/jurídico** | | **R$ [X]** | | |

---

## Resumo (deve fechar com o canon)

| Categoria | Total mensal | Campo do canon |
|-----------|-------------:|----------------|
| Folha | R$ [X] | `financeiro.custos.folha` |
| Infraestrutura | R$ [X] | `financeiro.custos.infra` |
| APIs e serviços | R$ [X] | `financeiro.custos.apis_terceiros` |
| Marketing | R$ [X] | `financeiro.custos.marketing` |
| Ferramentas SaaS | R$ [X] | `financeiro.custos.ferramentas_saas` |
| Contábil/Jurídico | R$ [X] | `financeiro.custos.contabil_juridico` |
| Outros | R$ [X] | `financeiro.custos.outros` |
| **Burn bruto total** | **R$ [X]** | `financeiro.burn_bruto_mensal` |

> **Reconciliação:** a soma das categorias **tem de igualar** `financeiro.burn_bruto_mensal`.
> Se uma categoria (ex.: marketing) é gerida por outra área e não está detalhada
> aqui, registre em nota — mas o total continua fechando com o canon. Qualquer
> diferença é erro de dado: corrija o canon primeiro, depois esta tabela.
