# Framework de Decisão — critérios, alçadas e quem decide

> **Template** — preenchido via /montar-gemeo. Deriva do canon: `time[].{nome,cargo,custo,decisor,perfil_cognitivo}`, `financeiro.runway_meses`.
> **Citação parseável**: todo número preenchido usa o marcador `R$ X [canon: path.do.campo]` ou `N [calc: metrica]` — o CI compara com o canon e acusa drift (specs/001-melhorias-gemeo/contracts/formatos-arquivos.md).

---

## Princípio: número primeiro, adesão depois

Decisão tem **duas camadas**, e ambas importam:

1. **Camada numérica** — a decisão fecha em número a partir do canon? (impacto em MRR, runway, CAC, concentração). É o que [`scenario-planning.md`](./scenario-planning.md) computa.
2. **Camada de adesão** — o time **abraça** a decisão? Uma decisão correta no número que o time não compra **não se executa**. O Gêmeo Digital modela essa segunda camada.

> O número diz *o que é certo*. A adesão diz *o que vai acontecer de verdade*. Boa decisão precisa das duas.

---

## Quem decide o quê (núcleo decisor)

O canon marca os decisores em `time[].decisor = true`. Quem não é decisor executa e é consultado no escopo de domínio, mas não vota em decisões estratégicas.

| Decisor (`time[].cargo`) | Custo/mês | Perfil cognitivo | Domínio de decisão |
|--------------------------|-----------|------------------|--------------------|
| [PREENCHER: cargo] | R$ `[X]` | `time[].perfil_cognitivo` | [PREENCHER: ex. visão, fundraising, desempate] |
| [PREENCHER: cargo] | R$ `[X]` | `time[].perfil_cognitivo` | [PREENCHER: ex. produto, roadmap técnico] |
| [PREENCHER: cargo] | R$ `[X]` | `time[].perfil_cognitivo` | [PREENCHER: ex. canais, pricing, parcerias] |

*(Origem: `time[]` do canon. Perfis cognitivos detalhados em `08-PESSOAS/Team/`.)*

### Matriz de alçada (RAPID simplificado)

| Tipo de decisão | Decide (D) | Recomenda (R) | Consultados | Exemplos |
|-----------------|-----------|---------------|-------------|----------|
| **Estratégica / irreversível** | [decisor + consenso] | [demais decisores] | time todo | [aceitar investimento, pivô, mudar tese] |
| **Produto / técnica** | [dono de produto] | [CEO] | executores | [roadmap, integrações, stack, contratar dev] |
| **Comercial / growth** | [dono de growth] | [CEO] | — | [pricing, abrir canal, fechar parceiro] |
| **Financeira material** (> `[X]%` do runway) | [CEO + dono do modelo] | — | [growth] | [contratações, gasto de marketing, uso da rodada] |
| **Operacional do dia a dia** | responsável da área | — | — | sem fórum |

**Regra de reversibilidade:** decisão **reversível e barata** → o dono da área decide e segue (valor "velocidade com runway curto"). Decisão **irreversível ou cara** → passa pelo fórum dos decisores e pela camada de adesão.

---

## O cruzamento impacto × adesão

Para decisões estratégicas, cruze dois eixos:

- **Eixo X — Impacto** (do número): quanto a decisão move MRR / runway / risco, computado em [`scenario-planning.md`](./scenario-planning.md).
- **Eixo Y — Adesão do time:** a probabilidade de cada decisor abraçar a decisão, derivada dos perfis cognitivos.

> **Onde isto vive:** a matriz que cruza **impacto × adesão** é mantida em `08-PESSOAS/Team/matriz-decisao-adesao.md`. O oráculo lê os perfis de `08-PESSOAS/Team/` e prevê a reação de cada decisor — não só *se* é certa, mas *se o time vai abraçá-la* e **quem precisa ser convencido, com qual argumento**.

### Quadrantes de decisão

| | **Adesão alta** | **Adesão baixa** |
|---|---|---|
| **Impacto alto** | ✅ **Executar já** — alinhado e relevante | ⚠️ **Convencer antes de agir** — identificar o cético e o argumento que o move (dados/runway) |
| **Impacto baixo** | 👍 **Delegar** — o dono da área segue | 🗑️ **Descartar** — não vale o atrito |

> Exemplo a preencher: uma decisão de **impacto alto × adesão dividida** mostra as duas camadas operando — o número diz que é certo, e a matriz aponta **quem** convencer e **com qual argumento**. Registre o caso em [`registro-de-decisoes.md`](./registro-de-decisoes.md).

---

## Ritmo de decisão (cadência)

| Fórum | Frequência | Quem | Decide |
|-------|-----------|------|--------|
| Stand-up | diária | time todo | desbloqueio operacional |
| Revisão de métricas | semanal | decisores | ajuste de growth/produto contra o canon |
| Comitê estratégico | mensal | decisores | cenários, OKRs, decisões irreversíveis |
| Revisão de OKR | trimestral | time todo | replanejamento (ver [`OKRs/`](./OKRs/)) |

---

## Princípios que governam toda decisão

1. **Número antes de narrativa** — começa no canon; sem dado, não se inventa.
2. **Reversível e barato → rápido; irreversível ou caro → fórum + adesão.**
3. **Runway é restrição dura** — decisão que encurta `financeiro.runway_meses` exige justificativa explícita de retorno.
4. **Adesão não é unanimidade** — é saber quem precisa ser convencido e como; o desempate final é do CEO.
5. **Honestidade sobre risco** — a decisão considera o cenário ruim, não só o esperado ([`scenario-planning.md`](./scenario-planning.md)).

---

*Coerência: decisores, cargos e custos de `time[]`; alçada financeira ancorada em `financeiro.runway_meses`; camada de adesão referencia `08-PESSOAS/Team/matriz-decisao-adesao.md`. Nenhum número novo.*
