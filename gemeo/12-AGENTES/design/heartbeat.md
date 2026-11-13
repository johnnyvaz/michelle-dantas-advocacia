# Heartbeat — Design (ciclo autônomo)

> Modo autônomo da área. Disparado pelo agendamento nativo do Claude Code (skill `schedule`/cron). Cada disparo executa **um turno** do ciclo OODA e **para**.

## OBSERVAR — colete antes de interpretar
1. Ler a fila filtrada pela área: `#area/design` (Grep em `tasks/*.md`).
2. Ler o contexto: `gemeo/07-PRODUTO/` e as regras visuais do projeto em `.claude/rules/`.
3. Ler a memória: `gemeo/12-AGENTES/design/memoria.md`.
4. Anotar quanto do **orçamento** (esforço) do período já foi consumido.

## ORIENTAR — interprete
1. Priorizar por prazo (📅) + prioridade (🔺/🔼/🔽).
2. Cada tarefa é pública ou administrativa? Definir o sistema antes de tudo.
3. É peça de marketing (gerar arte) ou ajuste de UI (código)?

## DECIDIR — escolha a intervenção mínima
1. Classificar cada tarefa via `_FRAMEWORK/allowlist.md`:
   - **reversível/interna** (rascunhar layout, gerar arte/overlay/thumbnail como artefato interno, ajustar UI em branch) → executar;
   - **irreversível/externa** (publicar peça em canal, deploy de UI em produção) → **sinalizar para aprovação humana**, não executar.

## AGIR — execute e registre
1. Executar as reversíveis que cabem no orçamento (gerar arte, propor layout, ajustar componente em branch).
2. Ao atingir o limite: **parar em ponto seguro** e registrar o pendente.
3. Atualizar `tasks/` (`[/]` em progresso, `[x] ✅ data` concluída).
4. Gravar aprendizados duráveis em `memoria.md` (padrão PARA).
5. **Fila vazia / sem fonte** → encerrar com "nada a fazer" (não inventar trabalho).

## Orçamento — fronteira honesta
- Teto de esforço por período, **imposto por prompt + escopo de turno** (não há medidor rígido de tokens em rotina cron).
- Geração de imagem consome custo externo — tratar como ação que pode exigir aprovação se gastar dinheiro.

## Contexto headless
- Rotinas agendadas podem não ter contexto interativo de APIs de geração de imagem. Nesse caso, favorecer artefatos de filesystem (layout, especificação visual) e **adiar** o que depende de serviço indisponível.
