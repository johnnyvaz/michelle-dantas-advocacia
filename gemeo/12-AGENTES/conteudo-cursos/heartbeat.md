# Conteúdo / Cursos — Heartbeat (ciclo autônomo de COMPLETUDE)

> Modo autônomo da área. Disparado pelo **agendamento nativo do Claude Code** (skill `schedule`/cron). Cada disparo executa **um turno** do ciclo OODA e **para**. Sem runtime separado.
>
> **Objetivo do heartbeat:** levar **todos os cursos do catálogo** ao formato completo — cada aula com todos os seus formatos e dados prontos para a plataforma. A fonte de verdade do estado é o scanner de completude do conteúdo (uma rotina determinística que reporta o estado real e o próximo gap); registre o caminho do scanner real do projeto aqui quando existir.

## OBSERVAR — colete antes de interpretar
1. **Rodar o scanner de completude** para saber o estado real e o próximo gap priorizado (1 unidade): `{num, name, dir, next, skill, gap}`. Sem scanner ainda disponível, levantar o gap manualmente cruzando o material de cada curso (aulas escritas × formatos pendentes).
2. Ler a fila `tasks/` por `#area/conteudo-cursos` (Grep em `tasks/*.md`) — uma tarefa com prazo/prioridade **sobrepõe** o gap do scanner.
3. Ler a memória da área: `gemeo/12-AGENTES/conteudo-cursos/memoria.md` (não repetir trabalho já registrado).
4. Anotar quanto do **orçamento** do período já foi consumido.

## ORIENTAR — interprete
1. Priorizar por intervenção mínima, fechando cursos inteiros, na ordem do pipeline: `semear` → `gerar-formato` (quem já tem aulas) → `escrever-aulas` (backlog mais caro). Dentro de cada eixo, vence quem está mais perto de fechar.
2. Classificar a capacidade do gap no pipeline:
   - `semear` → **converter para a plataforma** (gera/consolida os registros das aulas). Barato: 1 curso por turno.
   - `gerar-formato` → **gerar aula visual / derivar formato** (por aula). Caro: **fatiar por aula/módulo** — uma aula densa pode consumir um turno.
   - `escrever-aulas` → **escrever aula em texto**. Mais caro ainda: 1 aula por turno.
3. Definir a **unidade de trabalho do turno** que cabe no orçamento: 1 curso semeado, ou 1 módulo de formato (3–7 aulas), ou 1 aula de texto. Preferir **fechar uma unidade inteira** a deixar várias pela metade.

## DECIDIR — escolha a intervenção mínima
1. Classificar via `_FRAMEWORK/allowlist.md`:
   - **reversível/interna** (escrever `.md` de aula, gerar arquivos de conteúdo na pasta do curso, rodar scanner/validador, atualizar memória/tarefa) → **executar autonomamente**;
   - **irreversível/externa** (aplicar dados na plataforma/banco remoto, publicar curso, mudar preço/SKU) → **sinalizar para aprovação humana**; não executar.
2. Em dúvida sobre título/número/conteúdo de curso → **declarar a lacuna**, não inventar.
3. Usar **sempre as capacidades próprias** da área — nunca escrever os dados/aula à mão fora delas.

## AGIR — execute e registre
1. Executar a capacidade do gap na unidade escolhida (o scanner informa em que diretório o curso vive).
2. Após gerar/alterar os dados de um curso, **rodar o validador** da plataforma. Dado com erro pendente **não conta** como concluído; registrar em `tasks/bugs.md`.
3. **Re-rodar o scanner** para refletir o avanço no relatório de completude do conteúdo.
4. Ao atingir o limite do orçamento: **parar em ponto seguro** (fim de uma aula/arquivo/módulo) e registrar o pendente.
5. Atualizar o estado das tarefas em `tasks/` (`[/]` em progresso, `[x] ✅ data` concluída) e gravar aprendizados duráveis em `memoria.md` (estrutura PARA).
6. **Scanner reporta tudo completo / nenhum gap** → encerrar registrando "completude atingida" (não inventar curso ou aula).

## Orçamento — fronteira honesta
- Limite de esforço por período. **Imposto por prompt + escopo de turno** — não há medidor rígido de tokens em rotina cron.
- Formatos visuais e aulas são caros: calibrar o disparo para **uma unidade de trabalho** (1 curso semeado, 1 módulo de formato, 1 aula), não a trilha toda.
- Quando o backlog é grande (centenas de aulas), o heartbeat é o **regime permanente** que mantém a completude; o **backfill em massa** do acervo atual é um job à parte (Workflow/agente), decidido pelo humano.
- Se rodado via ferramenta `Workflow`, o primitivo `budget` é o teto **rígido** mais próximo.

## Contexto headless
- Rotinas agendadas podem não ter autenticação interativa de MCPs (ex.: banco/plataforma remota).
- Nesse caso, favorecer ações de **filesystem/locais** (gerar `.md`/conteúdo, validar localmente, rodar o scanner) e **adiar** (sinalizar) o que depende de MCP indisponível — como aplicar migration/seed no remoto.
