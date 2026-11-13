# Template — Orquestrador (genérico)

> O orquestrador é uma **skill** (roda no **main loop** — só o main loop dispara subagentes via `Task`). Recebe uma tarefa, identifica a área e encaminha ao(s) agente(s), consolidando o resultado.

## Entrada
- Tarefa em linguagem natural, ou uma linha de `tasks/` com `#area/<area>`.

## Processo
1. **Classificar** pela matriz de roteamento (`gemeo/12-AGENTES/README.md`).
2. **Área única** → invocar `agente-<area>` via `Task`.
3. **Multi-área** → dividir, invocar agentes em paralelo (`Task`), **reconciliar** sem retrabalho.
4. **Consolidar** num retorno único.
5. **Ambiguidade/lacuna** → declarar o que falta (não chutar a área).

## Matriz de roteamento
| Classe de tarefa | Área |
|---|---|
| <classe> | <area> |

## Saída
- Resultado consolidado + qual(is) agente(s) executou(aram).
