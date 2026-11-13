# Registro de Riscos — risk register vivo

> **Template** — preenchido via /montar-gemeo. Deriva do canon: `concentracao.*`, `premissas.gatilho_demanda.*`, `financeiro.*`, `crescimento.churn_*`, `produto.*`, `time[]`.
> **Citação parseável**: todo número preenchido usa o marcador `R$ X [canon: path.do.campo]` ou `N [calc: metrica]` — o CI compara com o canon e acusa drift (specs/001-melhorias-gemeo/contracts/formatos-arquivos.md).

---

**Data de referência:** AAAA-MM-DD
**Papel:** riscos discretos com probabilidade × impacto, mitigação e dono. Complementa [`scenario-planning.md`](./scenario-planning.md) (cenários macro) — aqui é o nível operacional, revisado mensalmente.
**Escala:** probabilidade e impacto em B(1) / M(2) / A(3); **score = prob × impacto** (máx. 9). Ordene a matriz por score.

---

## Matriz-resumo (ordenada por score)

| ID | Risco | Prob | Impacto | Score | Dono (`time[].cargo`) | Campo do canon |
|----|-------|:----:|:-------:|:-----:|------------------------|----------------|
| R[NN] | [PREENCHER: ex. concentração de receita no top-3] | A | A | **`[N]`** | [cargo] | `concentracao.top3_pct_do_mrr` |
| R[NN] | [PREENCHER: ex. gatilho de demanda atrasar/afrouxar] | M | A | **`[N]`** | [cargo] | `premissas.gatilho_demanda.*` |
| R[NN] | [PREENCHER: ex. rodada falhar com runway curto] | M | A | **`[N]`** | [cargo] | `financeiro.runway_meses` |
| R[NN] | [PREENCHER: ex. incumbente comoditizar o básico] | M | M | `[N]` | [cargo] | `mercado.*` |
| R[NN] | [PREENCHER: ex. churn pós-adoção] | M | M | `[N]` | [cargo] | `crescimento.churn_receita_mensal_pct` |
| R[NN] | [PREENCHER: ex. bus factor de engenharia] | B | A | `[N]` | [cargo] | `produto.*` / `time[]` |
| R[NN] | [PREENCHER: ex. compliance / dados] | B | M | `[N]` | [cargo] | [campo] |

> Crie quantas linhas precisar. Toda linha aponta um **indicador canônico** — sem campo no canon, o risco entra primeiro lá.

---

## Detalhe dos riscos críticos (score ≥ [N])

Para cada risco de score alto, abra um bloco. Modelo (exemplo — substituir):

### R[NN] — [Título do risco]
- **Exposição:** [PREENCHER: a quantificação do risco com o número do canon — ex. `concentracao.top3_pct_do_mrr` = `[X]%`; o que se perde se materializar].
- **Mitigação:** [PREENCHER: o plano registrado — meta numérica, ação, dono. Ex. reduzir o indicador para `[X]%` até AAAA-MM-DD].
- **Gatilho de revisão:** [PREENCHER: o evento observável que faz o risco subir de score ou disparar resposta — ex. churn de qualquer conta grande].

---

## Riscos monitorados (score < [N])

Para os riscos menores, uma linha cada com a defesa estrutural:

- **R[NN] — [título]:** [PREENCHER: por que é gerenciável hoje + métrica-guarda + gatilho].
- **R[NN] — [título]:** [PREENCHER].

---

## Como o oráculo deve usar este registro

1. Pergunta sobre "o que pode dar errado / maior risco" → começar pelo **maior score** e citar o número.
2. Toda resposta de risco cita o **indicador canônico** e a **mitigação registrada** — não inventar planos novos.
3. Riscos conversam com [`scenario-planning.md`](./scenario-planning.md): o cenário pessimista é a combinação dos riscos de maior score.
