# Heartbeat — Segurança (ciclo autônomo)

> Modo autônomo da área. Cada disparo executa **um turno** do ciclo OODA e **para**.

## OBSERVAR
1. Ler a fila `#area/seguranca` (Grep em `tasks/*.md`) e o lote de eventos pendente.
2. Ler o canon (`gemeo/00-CANON/canon.yaml`) — estado do negócio pondera o risco.
3. Ler `gemeo/12-AGENTES/seguranca/memoria.md` e `soc-feedback.yaml`.

## ORIENTAR
1. Rodar `python3 scripts/prioridade.py soc --in <lote>` → entidades pontuadas + bandas.
2. Separar **EXISTENCIAL/ALTA** (escalar) de **Média** (alertar/correlacionar) e **Baixa** (registrar).
3. Conferir itens graves **em aberto sem atenção** — o anti-decaimento já os mantém no topo.

## DECIDIR (allowlist `_FRAMEWORK/allowlist.md`)
- **reversível/interna** (registrar, correlacionar, atualizar memória/feedback) → executar.
- **irreversível/externa** (bloquear, banir IP, abrir incidente externo) → **aprovação humana**.

## AGIR
1. Escalar Alta/EXISTENCIAL para `tasks/human.md` com a justificativa do `prioridade.py`.
2. Registrar desfechos confirmados em `soc-feedback.yaml` (alimenta `recalibrar.py`).
3. Atualizar `tasks/` (`[/]`/`[x]`). Parar em ponto seguro ao fim do orçamento.
