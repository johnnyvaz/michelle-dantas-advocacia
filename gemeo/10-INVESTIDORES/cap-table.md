# Cap Table — sociedade atual e diluição

> **Template** — preenchido via /montar-gemeo. Deriva do canon: `cap_table.{atual[],esop_alocado_pct,esop_disponivel_pct,conversiveis[],simulacoes.*}`, `fundraising.*`, `financeiro.caixa_atual`.
> **Citação parseável**: todo número preenchido usa o marcador `R$ X [canon: path.do.campo]` ou `N [calc: metrica]` — o CI compara com o canon e acusa drift (specs/001-melhorias-gemeo/contracts/formatos-arquivos.md).

**Fonte numérica:** `00-CANON/canon.yaml` → `cap_table` (este doc só explica; os números vivem lá).

---

## 1. Composição atual (fully diluted, pré-rodada)

| Sócio | Papel | % | Aporte |
|-------|-------|--:|-------:|
| [PREENCHER] | [PREENCHER] | [X]% | R$ [X] |
| ESOP (pool de opções) | Time | [X]% | — |
| **Total** | | **100%** | **R$ [X]** |

*(Fonte: `cap_table.atual[]` — campos `socio`, `papel`, `pct`, `aporte`.)*

- **Founders juntos: [X]%** — [PREENCHER: cap table limpo? algum investidor com equity direto?].

### ESOP

| Beneficiário | Alocado |
|--------------|--------:|
| [PREENCHER] | [X]% |
| **Alocado** | [X]% (`cap_table.esop_alocado_pct`) |
| **Disponível** | [X]% (`cap_table.esop_disponivel_pct`) |

---

## 2. Conversível ainda NÃO convertido

| Termo | Valor |
|-------|-------|
| Investidor | [PREENCHER] (`cap_table.conversiveis[].nome`) |
| Perfil | [PREENCHER] (`cap_table.conversiveis[].perfil`) |
| Instrumento | [PREENCHER] (`cap_table.conversiveis[].instrumento`) |
| Valor | R$ [X] (`cap_table.conversiveis[].valor`) |
| Cap | R$ [X] (`cap_table.conversiveis[].cap`) |
| Conversão no cap | [X]% (`cap_table.conversiveis[].converte_pct_no_cap`) |

> O conversível converte na próxima rodada por **`valor ÷ min(cap, post-money da rodada)`**. Se o cap dele for menor que o post-money da rodada, ele é recompensado por ter entrado primeiro.

### Capital já aportado (amarração com o financeiro)

```text
Founders ............ R$ [X]
Conversível ......... R$ [X]
Total aportado ...... R$ [X]   (fundraising.ja_aportado)
Queima acumulada .... R$ [X]
Caixa atual ......... R$ [X]   (financeiro.caixa_atual)  ← deve fechar
```

---

## 3. Fórmula de diluição (modelo simplificado para simulação)

> Não é a mecânica jurídica exata de um conversível — é o modelo de simulação do gêmeo.

1. **Novo investidor:** `pct = valor_da_rodada ÷ post-money`.
2. **Conversível:** converte por `valor ÷ min(cap, post-money)`.
3. **Demais sócios (founders, ESOP):** diluem **pro-rata** pela fatia restante.
4. **Checagem de controle:** somar founders pós-rodada e comparar com **50%**.

---

## 4. Simulação A — rodada-alvo (post-money ≥ cap do conversível)

Novo investidor: [X]% (`= buscando ÷ post-money`). Conversível converte no **cap** (cap < post-money).

| Sócio | Antes | Depois |
|-------|------:|-------:|
| [Founder 1] | [X]% | [X]% |
| [Founder 2] | [X]% | [X]% |
| ESOP | [X]% | [X]% |
| Conversível (convertido) | — | [X]% |
| Novo investidor | — | [X]% |
| **Founders juntos** | [X]% | **[X]% ✅ > 50%** |

*(Fonte: `cap_table.simulacoes.*`.)*

**Founders mantêm maioria absoluta** — controle preservado.

---

## 5. Simulação B — oferta agressiva (post-money < cap do conversível)

Quando a rodada é precificada **abaixo do cap do conversível**, ele converte ao **post-money** (não ao cap): `valor ÷ post-money` → fatia **maior**.

| Sócio | Antes | Depois |
|-------|------:|-------:|
| [Founder 1] | [X]% | [X]% |
| [Founder 2] | [X]% | [X]% |
| ESOP | [X]% | [X]% |
| Conversível (convertido) | — | [X]% |
| Novo investidor | — | [X]% |
| **Founders juntos** | [X]% | **[X]% ❌ < 50%** |

**Efeito a observar:** precificar abaixo do cap do conversível dá a ele uma fatia **maior** que na Simulação A — e os founders podem cair para **minoria já na primeira rodada**.

---

## 6. Leitura para o oráculo

- Toda simulação de diluição usa `cap_table` do canon e a **fórmula simplificada** acima.
- A checagem `founders > 50%` é o fundamento numérico para aceitar/recusar uma oferta — não é apego, é aritmética.
- Perguntas que este doc habilita: *"quanto o conversível tem?"*, *"quanto sobra pros founders pós-rodada?"*, *"e se eu oferecer R$ [X] por [X]%?"*.
