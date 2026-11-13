---
id: P0000
titulo: "[título acionável da proposta]"
dimensao: financeiro          # financeiro|crescimento|clientes|operacoes|pessoas|lacunas
gerada_em: AAAA-MM-DD
gerada_por: "[analista (lente: <dimensao>, rodada R###) | humano]"
canon_sha: "[git rev-parse --short HEAD]"
status: nova                  # nova | em_avaliacao | aceita | rejeitada
decisao_relacionada: null     # DNNNN quando aceita/rejeitada (obrigatório)
fato_novo: null               # obrigatório ao reabrir proposta rejeitada
---

# P0000 — [Título]

## Diagnóstico
[O problema/oportunidade, ancorado no canon: cada número com `[canon: path]` ou
`[calc: metrica]`. Sem número órfão.]

## Impacto esperado
[A conta visível (output de calc.py/montecarlo.py colado) — ou, se faltar dado:
"sem dado no canon" + o campo que destravaria a quantificação.]

## Esforço e risco
[Estimativa honesta: o que custa (tempo/dinheiro/foco), o que pode dar errado,
reversibilidade.]

## Mapa de adesão
| Decisor | Postura prevista | Âncora (driver/perfil ou número) | Argumento que move |
|---------|:---------------:|----------------------------------|--------------------|
| [nome] | 🟢/🟡/🔴 | [driver do perfil + confiança 🟡🟠🟢] | [de "como convencer"] |

*(Decisor sem perfil → declarado de fora do mapa.)*

## Próximo passo se aceita
[1–2 linhas: a primeira ação concreta e quem toca.]
