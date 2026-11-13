# Features — inventário de funcionalidades

> **Template** — preenchido via /montar-gemeo. Deriva do canon: `produto.{implementado,em_construcao}`, `planos[].id`.
> **Citação parseável**: todo número preenchido usa o marcador `R$ X [canon: path.do.campo]` ou `N [calc: metrica]` — o CI compara com o canon e acusa drift (specs/001-melhorias-gemeo/contracts/formatos-arquivos.md).

> Inventário enxuto: o que existe, em que plano entra e qual a evidência no código.
> **Resuma; não duplique documentação do repo** — comportamento detalhado, regras de
> negócio e exemplos vivem no código. Status deve casar com `STATUS.md`.

## Convenção de status

- **Implementado** — funciona e tem evidência (código + teste).
- **Parcial** — existe parcialmente ou é stub (espelha `produto.em_construcao`).
- **Planejado** — só no roadmap, ainda sem código.

## Inventário

> Uma linha por feature. `Plano` referencia um `planos[].id`. `Evidência` aponta o
> arquivo/módulo no repo (caminho), não cola o código.

| Feature | Status | Plano (`planos[].id`) | Evidência no código |
|---------|--------|-----------------------|---------------------|
| `[PREENCHER: feature]` | Implementado | `[PREENCHER: id]` | `[PREENCHER: caminho no repo]` |
| `[PREENCHER: feature]` | Implementado | `[PREENCHER: id]` | `[PREENCHER: caminho no repo]` |
| `[PREENCHER: feature]` | Parcial | `[PREENCHER: id]` | `[PREENCHER: caminho / stub]` |
| `[PREENCHER: feature]` | Planejado | `[PREENCHER: id]` | — (roadmap) |

## Notas

- Diferenças entre o que está aqui e o que está no `STATUS.md` indicam corpus
  desatualizado — rode `/atualizar-produto`.
- Feature por trás de plano pago deve constar em `planos[].limites`/`target`.
