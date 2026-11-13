# Heartbeat — Operações (ciclo autônomo)

> Modo autônomo da área. Disparado pelo agendamento nativo do Claude Code (skill `schedule`/cron). Cada disparo executa **um turno** do ciclo OODA e **para**.

## OBSERVAR — colete antes de interpretar
1. Ler a fila filtrada pela área: `#area/operacoes` (Grep em `tasks/*.md`).
2. Ler o canon + contexto: `gemeo/00-CANON/canon.yaml` e `gemeo/05-JURIDICO/`.
3. Ler a memória: `gemeo/12-AGENTES/operacoes/memoria.md`.
4. Anotar quanto do **orçamento** (esforço) do período já foi consumido.

## ORIENTAR — interprete
1. Priorizar por prazo (📅) + prioridade (🔺/🔼/🔽).
2. Há solicitação de titular (acesso/exclusão) com prazo de 15 dias correndo?
3. Termos/política com mais de 3 meses sem revisão? Novo tipo de dado ou integração?
4. O canon está descolando da realidade (números desatualizados)?

## DECIDIR — escolha a intervenção mínima
1. Classificar cada tarefa via `_FRAMEWORK/allowlist.md`:
   - **reversível/interna** (revisar documento, rascunhar cláusula, atualizar canon/memória, gerar script de anonimização) → executar;
   - **irreversível/externa** (deploy, exclusão de dados, publicar termos) → **sinalizar para aprovação humana**, não executar.

## AGIR — execute e registre
1. Executar as reversíveis que cabem no orçamento (revisar contratos/termos, consolidar canon via `atualizar-*`, gerar scripts).
2. Ao atingir o limite: **parar em ponto seguro** e registrar o pendente.
3. Atualizar `tasks/` (`[/]` em progresso, `[x] ✅ data` concluída).
4. Gravar aprendizados duráveis em `memoria.md` (padrão PARA).
5. **Fila vazia / sem fonte** → encerrar com "nada a fazer" (não inventar trabalho).

## Orçamento — fronteira honesta
- Teto de esforço por período, **imposto por prompt + escopo de turno** (não há medidor rígido de tokens em rotina cron).
- Se rodado via `Workflow`, o primitivo `budget` é o teto rígido mais próximo.

## Contexto headless
- Rotinas agendadas podem não ter o contexto interativo de MCPs (tracker, repositório, banco). Nesse caso, favorecer ações de filesystem (revisão de documento, atualização do canon local) e **adiar** o que depende de MCP indisponível.
