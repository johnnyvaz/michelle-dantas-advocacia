# Unit Economics por Plano — Onde a margem nasce

> **Template** — preenchido via /montar-gemeo. Deriva do canon: `unit_economics_por_plano.<plano>.{contas,mrr_total,custo_servico_mes,margem_contribuicao_mes,ltv,ltv_cac,payback_cac_meses}`, `planos[].{id,preco}`, `financeiro.{custo_servico_por_cliente_mes,margem_bruta_pct}`, `unit_economics.ltv`, `crescimento.conversao_free_para_pago_pct`, `premissas.elasticidade_preco.<plano>`.
> **Citação parseável**: todo número preenchido usa o marcador `R$ X [canon: path.do.campo]` ou `N [calc: metrica]` — o CI compara com o canon e acusa drift (specs/001-melhorias-gemeo/contracts/formatos-arquivos.md).

**Data de referência**: `AAAA-MM-DD` (`_meta.data_referencia`)
**Fonte numérica**: `00-CANON/canon.yaml` → `unit_economics_por_plano` (os números vivem lá; este doc interpreta). É a mecânica financeira do produto: onde a margem nasce e onde ela mora.

---

## 1. A tabela (uma linha por plano de `planos[]`)

| Plano | Contas | Preço | MRR total | % do MRR | Custo de servir/mês | Margem contribuição/mês | LTV | LTV/CAC | Payback CAC |
|-------|:------:|------:|----------:|---------:|--------------------:|------------------------:|----:|--------:|------------:|
| [Free] | `[N]` | `R$ 0` | — | — | `R$ [X]` | — | — | — | — |
| [PREENCHER: plano 1] | `[N]` | `R$ [X]` | `R$ [X]` | `[X]%` | `R$ [X]` | `R$ [X]` | `R$ [X]` | `[X]×` | `[N]` m |
| [PREENCHER: plano 2] | `[N]` | `R$ [X]` | `R$ [X]` | `[X]%` | `R$ [X]` | `R$ [X]` | `R$ [X]` | `[X]×` | `[N]` m |
| [PREENCHER: plano n] | `[N]` | `R$ [X]` | `R$ [X]` | `[X]%` | `R$ [X]` | `R$ [X]` | `R$ [X]` | `[X]×` | `[N]` m |

> Colunas espelham `unit_economics_por_plano.<plano>.*`. `margem_contribuicao_mes = preço − custo_servico_mes`.

**Regra de fechamento com os agregados canônicos** (verificar programaticamente):
- **Custo médio de servir** = `Σ(contas × custo_servico_mes) ÷ Σ contas pagantes` → deve igualar `financeiro.custo_servico_por_cliente_mes`.
- **Margem bruta** = `(MRR total − custo direto total) ÷ MRR total`, onde custo direto total inclui o parque free → deve igualar `financeiro.margem_bruta_pct`.
- **LTV agregado** = média ponderada dos LTV por plano → deve igualar `unit_economics.ltv`.
- Se as somas por plano **não fecham** com os agregados, o canon está inconsistente — corrigir lá, nunca mascarar aqui.

## 2. O que a decomposição revela (preencher com base na tabela)
1. **Planos de entrada podem não se pagar com CAC de venda direta** — se LTV/CAC < 3 e payback alto, o plano só faz sentido vindo do funil PLG (free → upgrade), com automação em vez de esforço comercial.
2. **A margem mora no topo — e o topo concentra.** [PREENCHER: % do MRR vindo dos planos de topo]. Qualidade de unit economics e risco de concentração costumam ser o mesmo fato visto de dois lados (ver `02-ESTRATEGIA/registro-de-riscos.md`).
3. **O free é pipeline** se converte a `[X]%`/mês (`crescimento.conversao_free_para_pago_pct`) por uma fração do CAC de venda direta. [PREENCHER: custo do parque free vs. valor das conversões].
4. **Para onde empurrar o mix** — [PREENCHER: qual upgrade gera mais margem incremental por conta]. Pondere margem vs. concentração: diversificar logos no topo costuma vencer engordar as poucas contas-âncora.

## 3. Limites honestos desta análise
- **Churn por plano** pode ainda não ser medido → o LTV usa lifetime médio para todos. A elasticidade canônica (`premissas.elasticidade_preco.<plano>`) sugere que planos de entrada têm lifetime real menor e os de topo, maior → o contraste da tabela tende a estar subestimado.
- **CAC blended** (`unit_economics.cac` é único): o CAC real do plano de entrada via PLG é menor; o do topo, maior. Medir CAC por canal é meta de instrumentação.
- **Amostra pequena** se a carteira for de poucas contas: diretriz, não estatística.

## 4. Leitura para o oráculo
- Perguntas de margem/custo por plano → usar **somente** `unit_economics_por_plano` (não recalcular por outra via).
- "Qual plano é o melhor negócio?" → planos de topo na margem, **com** a ressalva de concentração e CAC blended (§3).

**Fonte**: `00-CANON/canon.yaml`.
