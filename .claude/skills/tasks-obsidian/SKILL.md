---
name: tasks-obsidian
description: Instala o sistema de tarefas com espelho no Obsidian num projeto PH3A. Cria tasks/ (backlog, bugs, features, ideas, human, concluidas, inbox), os scripts de sync e painel, e o hook do Claude Code que sincroniza sozinho quando tasks/ muda. O cofre vira o posto de comando de vários projetos — painel por projeto, painel geral consolidado e um INBOX.md por onde o humano manda instruções que chegam aos agentes. Use quando o usuário pedir para instalar o sistema de tarefas, ligar um projeto ao Obsidian, ou controlar vários projetos por um cofre só.
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
---

# Skill: Sistema de tarefas com espelho no Obsidian

Liga um repositório a um cofre Obsidian, de forma que **um cofre só governe vários projetos**:
cada projeto publica seu painel, o cofre consolida tudo num painel geral, e o humano devolve
instruções por um único arquivo de entrada.

## O modelo, em uma frase

**O repositório é a verdade, o cofre é a vista — com uma exceção deliberada: o `INBOX.md`.**

| Direção | O quê | Regra |
|---|---|---|
| `tasks/` → cofre | backlog, bugs, features, ideas, human, concluidas | Espelho **com remoção**: arquivo que sai do repositório sai do cofre |
| repositório → cofre | `00 Painel`, `01 Todas as tarefas`, `_estado.json` | Gerados a cada sync, sempre sobrescritos |
| cofre ↔ repositório | **`INBOX.md`** | Único canal de volta. Merge de três vias: linha nova de qualquer lado entra, linha apagada por qualquer lado sai |

Sem o `INBOX.md`, o cofre seria só leitura e o usuário não teria como mandar trabalho. Com ele:
escreve no Obsidian → chega em `tasks/inbox.md` → o agente lê, executa, move para o arquivo certo
e apaga a linha → a limpeza volta ao cofre no sync seguinte.

**Por que merge e não "mais novo vence":** medido — com as duas cópias escritas entre dois syncs
(e a janela de 2s que o rsync precisa para comparar mtime entre WSL e NTFS), cada lado fica com a
própria versão e a instrução do humano **nunca chega ao agente**. `obsidian-inbox-merge.js` guarda
a última versão sincronizada em `.git/.obsidian-inbox-base`: é ela que distingue "linha nova" de
"linha consumida", senão o que o agente apagou ressuscita a cada sync.

## O que a instalação cria

```
<projeto>/
├── scripts/
│   ├── sync-obsidian.sh            # espelho + INBOX + dispara os dois geradores
│   ├── importar-spec.py            # spec ativa (.specify/feature.json) → tasks/spec.md
│   ├── obsidian-panel.js           # painel deste projeto + _estado.json
│   ├── obsidian-index.js           # painel geral do cofre (varre os _estado.json)
│   ├── obsidian-inbox-merge.js     # reconcilia o INBOX (merge de três vias)
│   └── hooks/obsidian-sync-hook.sh # mark (PostToolUse) / flush (Stop)
└── tasks/
    ├── backlog.md  bugs.md  features.md  ideas.md  human.md
    ├── spec.md         # GERADO da spec ativa, uma linha por User Story aberta
    ├── concluidas.md   # histórico append-only
    └── inbox.md        # espelho local do INBOX.md do cofre
```

No cofre:

```
<Cofre>/
├── 00 Painel Geral.md          # todos os projetos, ordenado por quem espera decisão
├── <Projeto>/
│   ├── 00 Painel.md            # números, fila humana, 🔺 alta, índice de seções
│   ├── 01 Todas as tarefas.md  # tabela achatada, ordenada por prioridade
│   ├── INBOX.md                # ← você escreve aqui
│   ├── _estado.json            # resumo consumido pelo painel geral
│   └── tasks/                  # espelho fiel dos arquivos
```

## Passos da instalação

### 1. Descobrir o alvo e o cofre

```bash
REPO=<caminho do projeto>            # pergunte se não veio no comando
ls "$REPO/tasks" 2>/dev/null         # já existe sistema de tarefas?
ls -d /mnt/c/Users/*/Documents/Obsidian/*/.obsidian 2>/dev/null   # onde está o cofre
```

O `sync-obsidian.sh` autodetecta o cofre procurando `.obsidian/`. Só defina `OBSIDIAN_VAULT`
se houver mais de um cofre na máquina. O usuário do WSL costuma ser diferente do usuário do
Windows (`johnny` × `johnny.ferreira`) — nunca monte o caminho a partir de `$USER`.

### 2. Copiar os scripts

Os passos 2–6 estão automatizados em `resources/instalar.sh <projeto>` (idempotente, com as
verificações desta página embutidas). Instalação em lote: rode um projeto por vez e leia a saída —
uma falha fica contida num projeto só.

A fonte é `BOILERPLATE-IA/scripts/` — a **mesma** que `scripts/propagar-tasks.sh` distribui aos
projetos já instalados. `resources/` teve cópias próprias desses arquivos até 2026-08-10, quando
mediu-se que estavam 4 dias e ~100 linhas atrás: instalação nova recebia gerador velho, e a
propagação corrigia só os antigos. Não recrie as cópias.

```bash
B=/home/johnny/GIT/PH3A/PROJETOS/BOILERPLATE-IA
cp "$B/scripts"/{obsidian-panel.js,obsidian-index.js,obsidian-inbox-merge.js,sync-obsidian.sh} "$REPO/scripts/"
cp "$B/scripts"/{prioridade.py,migrar-tasks.py,importar-spec.py} "$REPO/scripts/"
cp "$B/scripts/hooks/obsidian-sync-hook.sh" "$REPO/scripts/hooks/"
chmod +x "$REPO/scripts/sync-obsidian.sh" "$REPO/scripts/hooks/obsidian-sync-hook.sh"
```

`prioridade.py` exige `gemeo/00-CANON/prioridade.yaml`; sem ele o sync roda mas sai sem matriz e
sem `PRIORIDADE.md`. Copie do boilerplate quando faltar, nunca por cima de um existente.

### 3. Criar os arquivos de tarefas que faltarem

Só o que **não existe** — nunca sobrescreva backlog/bugs/human de um projeto em andamento.
Troque `{{PROJECT_NAME}}` pelo nome do projeto e `{{DATA}}` pela data de hoje.

```bash
for t in INBOX concluidas backlog bugs; do
    alvo="$REPO/tasks/$([ "$t" = INBOX ] && echo inbox || echo "$t").md"
    [ -f "$alvo" ] || sed "s/{{PROJECT_NAME}}/$NOME/g; s/{{DATA}}/$(date +%F)/g" "$R/templates/$t.md" > "$alvo"
done
```

`human.md`, `features.md`, `ideas.md` e `README.md` **não têm template aqui** — copie de
`BOILERPLATE-IA/tasks/` com a mesma substituição. **`human.md` é o que mais importa**: sem ele o
projeto entra no `00 Painel Geral` com fila humana zerada, que é exatamente o sintoma do modo de
falha descrito abaixo — e o painel geral existe para mostrar quem espera decisão.

### 4. Instalar a **instrução** — sem ela o mecanismo fica invisível

Os passos anteriores entregam scripts, arquivos e hook. Nada disso diz ao agente do projeto que
a fila existe. Medido em 2026-08-10: **10 dos 13 projetos com `CLAUDE.md` não mencionavam
`tasks/`** — o agente registrava achado em comentário no código, ou em nada, e a fila humana
ficava vazia enquanto o `human.md` era o único arquivo que o dono acompanhava.

`tasks/README.md` **não resolve isso**: é contrato de formato, e só é aberto por quem já sabe que
deve ir lá. O que entra no contexto sempre é o `CLAUDE.md` da raiz.

```bash
cp "$BOILER/.claude/rules/tasks.md" "$REPO/.claude/rules/tasks.md"   # paths: tasks/**
```

E o bloco de `resources/templates/CLAUDE-tasks.md` no `CLAUDE.md` da raiz, delimitado por
`<!-- tasks-obsidian:inicio -->` / `:fim` (é como a reinstalação sabe que já está lá):

| Situação do `CLAUDE.md` | O que fazer |
|---|---|
| não existe | criar com `# <NOME>` + o bloco |
| já tem os marcadores | nada |
| já cita `tasks/human.md` (seção própria) | **não injetar** — conferir se cobre as quatro regras. Duas fontes para a mesma regra divergem na primeira edição |
| existe e não fala de tarefas | anexar o bloco no fim |

As quatro regras que o bloco precisa carregar, porque mudam o que o agente faz: **ler `inbox.md`
antes de começar** · **pedido a humano só em `human.md`** · **nunca bloquear em cima de um
pedido** · **concluída sai do arquivo de trabalho para `concluidas.md`**.

### 5. Registrar o hook — **anexando**, nunca substituindo

O projeto quase sempre já tem hooks. Anexe aos arrays existentes:

```bash
jq '
  .hooks.PostToolUse = ((.hooks.PostToolUse // []) | map(
      if (.matcher // "") | test("Edit") then
        .hooks += [{"type":"command","command":"bash \"$CLAUDE_PROJECT_DIR/scripts/hooks/obsidian-sync-hook.sh\" mark"}]
      else . end))
  | .hooks.Stop = ((.hooks.Stop // []) | if length > 0 then
        (.[0].hooks += [{"type":"command","command":"bash \"$CLAUDE_PROJECT_DIR/scripts/hooks/obsidian-sync-hook.sh\" flush","timeout":60,"statusMessage":"Sincronizando Obsidian..."}])
      else [{"hooks":[{"type":"command","command":"bash \"$CLAUDE_PROJECT_DIR/scripts/hooks/obsidian-sync-hook.sh\" flush","timeout":60,"statusMessage":"Sincronizando Obsidian..."}]}] end)
' .claude/settings.json > /tmp/s.json && mv /tmp/s.json .claude/settings.json
```

O caminho vai **sempre** ancorado em `"$CLAUDE_PROJECT_DIR/..."` (com as aspas): relativo ao cwd,
o hook morre assim que a sessão sai da raiz do projeto.

Se o projeto não tiver bloco `PostToolUse` casando `Edit`, crie um com matcher
`"Write|Edit|MultiEdit"`. **Confira que nada sumiu** antes de seguir:

```bash
jq -r '.hooks | to_entries[] | "\(.key): \(.value | map(.hooks[].command) | join(" + "))"' .claude/settings.json
```

Todos os comandos que existiam antes têm de continuar na lista. Um merge errado mata em silêncio
os guards de segurança e de canon do projeto.

Mas **preservação não é presença**: o `map(if … test("Edit"))` não acrescenta nada se nenhum bloco
`PostToolUse` casar `Edit`, e o comando acima passa igual. Cheque também que os dois entraram — e
cheque **antes** de anexar, senão a reinstalação duplica o hook (medido em `DATA-DOSSIE`):

```bash
jq -e '[.hooks//{} | .[]? | .[]?.hooks[]?.command] | any(test("obsidian-sync-hook[^ ]*[ \"]+mark$"))' .claude/settings.json
```

O `test()` com aspas no meio não é capricho: em projeto que usa `$CLAUDE_PROJECT_DIR` o comando é
`bash "$CLAUDE_PROJECT_DIR/scripts/hooks/obsidian-sync-hook.sh" mark`, e um `contains("…sh mark")`
dá **falso negativo** — foi assim que a duplicação aconteceu.

Caminho relativo (`scripts/hooks/…`) é a convenção do boilerplate. Em projeto que usa
`$CLAUDE_PROJECT_DIR`, siga a convenção de lá — inclusive quanto ao **arquivo**: se os hooks do
projeto moram em `settings.local.json` (não versionado), anexe lá, não no `settings.json`.

### 6. Rodar e conferir os números

```bash
cd "$REPO" && bash scripts/sync-obsidian.sh
```

O sync imprime a contagem por arquivo. **Confira contra um grep independente** — é o único
antídoto contra o modo de falha descrito abaixo:

```bash
grep -cE '^- \[[ /x-]\]' tasks/backlog.md tasks/bugs.md
```

### 7. Conferir a instrução, não só os números

O passo 4 é o que se perde numa instalação apressada — e a falha é silenciosa: tudo sincroniza,
só o agente não sabe da fila. Confira nos dois arquivos:

```bash
grep -c "tasks/human.md" "$REPO/CLAUDE.md"        # > 0
ls "$REPO/.claude/rules/tasks.md"                 # existe
```

## Integração com a skill `priorizar`

O painel **não tem critério próprio de prioridade** — quando existe cálculo, ele obedece:

| Fonte | O que o painel faz |
|---|---|
| `tasks/PRIORIDADE.md` | Vira a seção **🎯 Fila priorizada** no topo, com banda, score, EV e link para a tarefa real. Banda `EXISTENCIAL` sobe como callout de perigo |
| `[prio: N calc:prioridade]` na linha | Ordena `01 Todas as tarefas` por score; ganha coluna 🎯. Item sem score cai depois, na prioridade declarada |
| Nada disso | Ordena por 🔺/🔼/🔽, como antes |

O casamento entre a linha do `PRIORIDADE.md` e a tarefa usa **o mesmo slug de `_id_from_body`**
(`scripts/prioridade.py`), replicado em `slugPrioridade()`. Se aquele slug mudar, mude aqui junto
— senão a fila priorizada vira uma lista de ids sem link. Item que não casa **aparece mesmo assim**,
com o id cru e um aviso de "PRIORIDADE.md desatualizado": esconder o que a priorização elegeu seria
pior que mostrar feio.

Fluxo de uso: `/priorizar` → `python3 scripts/prioridade.py <corpus> --write` → sync → o painel
mostra a fila calculada, no cofre, para todos os projetos.

**Score negativo é legítimo** (bandas MEDIA/BAIXA saem abaixo de zero) e todos os regexes daqui
aceitam o sinal — o `MARKER_RE` de `prioridade.py` **não** aceita, e o efeito medido está em
`tasks/bugs.md` do boilerplate (o item muda de identidade e acumula marcador a cada rodada).
`prioridade.py` também varre `tasks/inbox.md`, então marca a instrução crua do humano; mesma
entrada de bugs. Cuidado ao escrever exemplo de tarefa em comentário HTML dentro de `tasks/`:
`prioridade.py` não filtra `<!-- -->` e adota o exemplo como tarefa real.

## O modo de falha que importa

**Cada arquivo tem uma forma diferente, e `human.md` tem dois dialetos em uso na PH3A:**

| Arquivo | Forma | Se o extrator errar |
|---|---|---|
| `backlog`, `bugs` | `- [ ]` nível zero sob `##`/`###` | conta errado |
| `features` | `## [/] 002 - Nome` + itens, **ou** lista simples | frentes somem |
| `human` (boilerplate) | `- [ ] [APROVAR] … 🔺 alta #area/x` | **fila humana reporta zero** |
| `human` (heading) | `### H-0xx · título` sob bucket `##` | **fila humana reporta zero** |
| `ideas` | bullets sob `##` **ou** sob `###` | ideias reportam zero |
| `concluidas` | `## origem › título ✅ data`, data às vezes só no corpo | histórico vazio |

O gerador detecta o dialeto de `human.md` por conteúdo e imprime qual usou. **Um regex único
reportaria zero justamente no arquivo que a pessoa acompanha** — por isso os totais saem no fim
de todo sync: é o que separa "formato novo" de "silêncio".

Bloco de código é neutralizado na leitura: os arquivos trazem exemplos de formato que, sem isso,
entrariam na contagem como tarefa real.

## Detalhes que custaram caro (não desfaça sem testar)

- **`|` dentro de wikilink em tabela precisa ser escapado** (`[[a\|b]]`). Sem isso o Obsidian lê
  como separador de coluna e parte o link — o formatador de tabela dele reescreve o arquivo e
  quebra tudo de uma vez. Verificado no cofre.
- **Link usa caminho completo** (`Projeto/tasks/backlog`). Com vários projetos há N `backlog.md`
  no cofre e o nome curto resolve para o projeto errado.
- **Colchete no rótulo** fecha o wikilink antes da hora — títulos com `[Exemplo]` viram `]]]`.
- **Classe de emoji em regex exige a flag `u`.** Sem ela, `[🔺🔼🔽]` casa o surrogate alto de
  `🚨` (ambos `\uD83D`) e mutila o título.
- **`--exclude` do rsync protege da deleção**, não causa. Para o cofre nunca reter um
  `database.md` que já foi copiado por engano, é preciso `--delete-excluded`.
- **`set -o pipefail`**: sem ele o `| grep` engole a falha do rsync e o sync termina com "✓".
- **Guard do cofre**: renomear a pasta dentro do Obsidian acontece. Sem checar `.obsidian/`, o
  `mkdir -p` recria um diretório fantasma no caminho antigo e o sync "funciona" para lugar nenhum.
- **Projeto com `"type": "module"` no `package.json`** trata todo `.js` como ESM e os três
  geradores (CommonJS) morrem em `require is not defined`. Medido em `PH3A-STUDIO-CORRETO`.
  Renomeie-os para `.cjs` e ajuste as três chamadas em `sync-obsidian.sh`; **não** resolva com um
  `scripts/package.json` de `type: commonjs` — os outros scripts do projeto (`quality-gate.js`,
  `io-budget.js`) são ESM de verdade e quebrariam junto.

### Detalhe não verificado

Âncora de heading que contém crase sai **sem** a crase (`#H-011 · TTL para allowed_ips`), porque
crase dentro de `[[…]]` abre código inline no parser. Não foi confirmado no aplicativo se o
Obsidian indexa o heading com a formatação literal — se indexar, esses links caem no topo do
arquivo em vez da seção. Vale um clique de teste ao instalar; se falhar, preserve a crase na
âncora em `ancora()` (`obsidian-panel.js`) e mantenha só o escape do pipe.

## Índices concorrentes

O boilerplate já tem duas coisas que cobrem terreno parecido, e nenhuma foi removida:

- `scripts/aggregate-tasks.sh` — concatena as tarefas de todos os projetos num arquivo só. Não
  tem painel por projeto, nem estado, nem canal de entrada.
- `projetos.md` — índice escrito à mão, com ponteiro para a fila humana de cada projeto.

Depois que os projetos estiverem sincronizando, **`00 Painel Geral` é o índice autoritativo**:
ele reflete o estado real a cada sync, enquanto os outros dois envelhecem em silêncio. Aposentar
os dois é decisão do responsável — proponha, não execute.

## Como o agente usa o INBOX

No início de uma sessão de trabalho no projeto:

1. Ler `tasks/inbox.md` — se houver item, é instrução do humano e tem precedência sobre o backlog
2. Executar o que for reversível/interno; o que for irreversível/externo vira item em `human.md`
3. Mover cada item para o arquivo de tarefas correto (ou resolvê-lo direto)
4. **Apagar a linha de `tasks/inbox.md`** — é isso que sinaliza "consumido" e limpa o cofre

Decisão sobre a fila humana também pode chegar por aí (`H-011 → opção B`): transcreva para
`human.md`, que continua sendo o registro canônico, e siga a regra de arquivamento.
