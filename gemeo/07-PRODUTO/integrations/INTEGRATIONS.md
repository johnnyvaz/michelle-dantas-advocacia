# Integrações — parceiros externos e dependências

> **Template** — preenchido via /montar-gemeo. Deriva do canon: `produto.{implementado,em_construcao}`.
> **Citação parseável**: todo número preenchido usa o marcador `R$ X [canon: path.do.campo]` ou `N [calc: metrica]` — o CI compara com o canon e acusa drift (specs/001-melhorias-gemeo/contracts/formatos-arquivos.md).

> Inventário das integrações externas: com quem, para quê, em que estado e se a
> dependência é crítica. **Resuma; não duplique documentação do repo** — fluxos de
> autenticação, mapeamento de campos e exemplos de chamada vivem no código.

## Inventário

> Uma linha por integração. `Dependência crítica?` = Sim quando a indisponibilidade
> do parceiro derruba uma função central do produto (mapeie em `registro-de-riscos.md`).

| Parceiro / API | Papel no produto | Status | Dependência crítica? |
|----------------|------------------|--------|:--------------------:|
| `[PREENCHER: parceiro/API]` | `[PREENCHER: o que habilita]` | `[PREENCHER: ativo/parcial/planejado]` | `[PREENCHER: Sim/Não]` |
| `[PREENCHER: parceiro/API]` | `[PREENCHER: o que habilita]` | `[PREENCHER: status]` | `[PREENCHER: Sim/Não]` |
| `[PREENCHER: parceiro/API]` | `[PREENCHER: o que habilita]` | `[PREENCHER: status]` | `[PREENCHER: Sim/Não]` |

## Notas por integração

> Para cada dependência crítica (Sim), uma frase: o que acontece se cair e qual o
> plano B. Não detalhe o protocolo — isso é responsabilidade do repo.

- `[PREENCHER: parceiro]` — `[PREENCHER: impacto se indisponível + fallback, 1 frase]`

## Custos e contratos

- Integrações com custo por uso entram em `financeiro.custos.apis_terceiros`.
- Integração que exige contrato/credencial de terceiro: `[PREENCHER: qual e status]`.
