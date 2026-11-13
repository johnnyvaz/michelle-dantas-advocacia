<!-- tasks-obsidian:inicio — bloco gerado pela skill tasks-obsidian. Editável; a reinstalação
     não o sobrescreve, apenas o cria quando ausente. Não remova os marcadores. -->
## 📋 Tarefas — `tasks/` é a fila deste projeto

Todo trabalho identificado e não executado na hora é registrado em `tasks/` — nunca em comentário
no código, nunca só na conversa. O **formato** está em [`tasks/README.md`](./tasks/README.md); o
**comportamento** em [`.claude/rules/tasks.md`](./.claude/rules/tasks.md).

| Arquivo | O que entra |
|---|---|
| `tasks/backlog.md` | trabalho futuro já decidido |
| `tasks/bugs.md` | defeito aberto |
| `tasks/features.md` | frentes em desenvolvimento (spec + histórias) |
| `tasks/ideas.md` | ideia não comprometida |
| `tasks/human.md` | 🙋 o que depende de uma pessoa — **único arquivo que o responsável acompanha** |
| `tasks/inbox.md` | 📥 instrução do responsável para o agente (chega do Obsidian) |
| `tasks/concluidas.md` | histórico append-only, nada é retomado de lá |
| `tasks/PRIORIDADE.md` | **gerado** por `scripts/prioridade.py` — não editar |

Quatro regras que mudam o que você faz:

1. **Leia `tasks/inbox.md` antes de começar.** É o canal do responsável e tem precedência sobre o
   backlog: execute, mova o item para o arquivo certo e **apague a linha** — apagar é o que
   sinaliza "consumido" e limpa o cofre no sync seguinte.
2. **Pedido a humano vai para `tasks/human.md` e só para lá.** Decisão de produto, credencial,
   ação fora do repositório, postura de segurança, mudança irreversível e aprovação de escopo
   dependem de pessoa. Pedido em qualquer outro lugar não é lido. Cada um traz o que decidir, por
   que está bloqueado, as opções com o custo de cada uma e a recomendação — respondível em uma
   linha (`→ opção B`).
3. **Nunca bloqueie em cima de um pedido**: registre, siga com o que não depende dele e diga
   explicitamente o que ficou parado.
4. **Tarefa concluída sai do arquivo de trabalho** — o item inteiro vai para `tasks/concluidas.md`
   com `✅ AAAA-MM-DD`. Nunca deixe `- [x]` em `backlog.md`, `bugs.md` ou `features.md`.

Problema fora do escopo atual: **não corrija** — registre com o marcador `🤖`, o local
(`arquivo:linha`) e por que foi deferido.

Prioridade sai de `python3 scripts/prioridade.py backlog --canon <cofre>/_operacao.yaml --write`,
nunca de estimativa em prosa. `#eis/q1..q4` na linha fixa o quadrante Eisenhower e vence o
cálculo — é como a posição definida pelo responsável entra no sistema.

Sync com o Obsidian: automático por hook a cada mudança em `tasks/*.md`; manual com
`bash scripts/sync-obsidian.sh`. O cofre é espelho de leitura — editar lá se perde.
<!-- tasks-obsidian:fim -->
