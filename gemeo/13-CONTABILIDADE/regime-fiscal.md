# Regime Fiscal — Tributação e obrigações

> **Template** — preenchido via /montar-gemeo. Deriva do canon: `empresa.razao_social`, `empresa.cnpj`, `financeiro.custos.contabil_juridico`, `financeiro.receita_mensal`, `snapshot.arr`, `time[]`.
> **Citação parseável**: todo número preenchido usa o marcador `R$ X [canon: path.do.campo]` ou `N [calc: metrica]` — o CI compara com o canon e acusa drift (specs/001-melhorias-gemeo/contracts/formatos-arquivos.md).

**Data de referência:** AAAA-MM-DD
**Empresa:** [PREENCHER: razão social — `empresa.razao_social`] · CNPJ [PREENCHER: `empresa.cnpj`]

> **Propósito:** registrar o regime tributário, as alíquotas aplicáveis e as
> obrigações recorrentes. Alíquotas e limites mudam por exercício e por receita —
> **valide com o contador** e mantenha como placeholders até confirmação.

---

## Regime tributário

- **Regime atual:** [PREENCHER: Simples Nacional / Lucro Presumido / Lucro Real]
  — escolha conforme receita e tipo de atividade. Revisar elegibilidade a cada exercício.
- **Limite de enquadramento:** receita bruta anual até R$ [X] (`snapshot.arr` para acompanhar a margem ao teto).
- **Regime futuro:** migração para [PREENCHER: regime] avaliada quando a receita mensal ultrapassar R$ [X] (`financeiro.receita_mensal`).
- **Atividade principal (CNAE):** [PREENCHER: código CNAE — descrição].

---

## Alíquotas aplicáveis (validar com o contador)

| Tributo | Alíquota | Base | Observação |
|---------|---------:|------|------------|
| [PREENCHER: ex. tributo unificado / federal] | [X]% | [PREENCHER] | depende da faixa de receita |
| [PREENCHER] | [X]% | [PREENCHER] | |

> As alíquotas dependem da faixa de receita e do regime. Não fixe número sem
> confirmação do escritório contábil.

---

## Obrigações recorrentes

| Obrigação | Periodicidade | Vencimento | Responsável |
|-----------|---------------|------------|-------------|
| Guia de recolhimento de imposto | mensal | dia [N] | escritório contábil |
| Notas fiscais de serviço (emissão) | por venda | — | financeiro interno |
| Folha / encargos trabalhistas | mensal | dia [N] | escritório contábil |
| Declarações acessórias | [PREENCHER: mensal/anual] | AAAA-MM-DD | escritório contábil |
| Balancete | mensal | até dia [N] do mês seguinte | escritório contábil |

---

## Responsáveis

- **Escritório contábil externo:** custo em `financeiro.custos.contabil_juridico` (ver `../11-CONTAS-A-PAGAR/fornecedores-recorrentes.md`).
- **Ponto focal interno:** [PREENCHER: nome — cargo, ex. CEO até contratar CFO] (`time[]`).
