---
name: reduzir-fila
description: >
  Reduz a fila de trabalho (`tasks/`) por prioridade: a cada disparo pega o item de maior
  prioridade que NÃO depende do dono, despacha ao agente da área (roteamento do
  /orquestrador-empresa, modelo da tag `#modelo/`), verifica, commita em branch e fecha o item.
  O que é Tipo 1 (irreversível/externo) vai para `tasks/human.md` e é pulado — nunca executado.
  Feita para rodar em loop: `/loop 30m /reduzir-fila`. Use quando o usuário pedir para reduzir,
  zerar, esvaziar ou tocar a fila, "faz o que não depende de mim", ou "trabalha no backlog".
allowed-tools: Read, Grep, Glob, Edit, Write, Bash, Task, Agent
argument-hint: "[--max N] [--area <area>] [--dry-run]"
triggers:
  - reduzir fila
  - zerar fila
  - tocar a fila
  - o que não depende de mim
  - trabalhar no backlog
gates: [aprovacao-humana, sem-exfiltracao, conta-visivel, dado-datado]
---

# Reduzir a fila

Um disparo = **um turno**: escolhe, executa e fecha até `--max` itens (padrão **1**) e **para**.
O ritmo vem de fora (`/loop 30m /reduzir-fila`); esta skill nunca entra em laço sozinha.

Roda no **main loop** pelo mesmo motivo do `/orquestrador-empresa`: só o main loop despacha
subagente. Não a transforme em agente.

## O que "já aprovado" quer dizer

Invocar esta skill é a autorização do dono para **Tipo 2** — o que está em ✅ de
`gemeo/12-AGENTES/_FRAMEWORK/allowlist.md` (reversível/interno: código **em branch**, teste,
doc, rascunho, tarefa, memória da área). Não destrava nada de 🛑: `push`, merge em `main`, PR,
deploy, publicar, enviar a cliente, gastar, apagar dado, probe ativo. Esses vão para
`tasks/human.md` e o item é **pulado** (doutrina, recusas 6 e 7 — não há argumento que as mova).

**Não pergunte no meio do loop.** Rodando por `/loop`, o dono não está olhando: decisão dele vira
item em `human.md` (`tasks.md` inviolável 2, caso "ninguém presente"), nunca `AskUserQuestion` —
uma pergunta travaria todos os disparos seguintes. Siga para o próximo item elegível.

## Argumentos

| Arg | Efeito |
|---|---|
| `--max N` | itens fechados por disparo (padrão 1; teto 3 — mais que isso concentra erro num turno só) |
| `--area <area>` | só itens com `#area/<area>` |
| `--dry-run` | mostra o que faria (item escolhido, classificação, agente, modelo) e não toca em nada |

## Fluxo de um disparo

### 0. Pré-condições — falhou, pare e diga qual

- `git status --porcelain`: alterações que **não** são desta skill (fora de `tasks/` e da branch
  de fila) ⇒ pare. Não misture trabalho do dono com o do agente.
- Branch: em `main`/`master`, crie ou troque para `fila/<AAAA-MM-DD>`. Já em `fila/*`, continue
  nela. Em outra branch de feature, **não troque** — trabalhe nela e diga isso no relatório.
- Orçamento, se o canon declara teto:
  `python3 scripts/custo.py checar --agente agente-<area> --n 1 --modo interativo`.
  Exit 3 ⇒ pare em ponto seguro e registre em `human.md`.

### 1. Canal de volta antes do backlog

Mesma precedência de `.claude/rules/tasks.md`:
1. `tasks/inbox.md` — instrução nova do dono. Execute se for Tipo 2; senão transcreva. Apague a
   linha consumida.
2. `tasks/human.md` com `**Solução:**` preenchida e sem `🚀 executado` — destravado pelo dono.
   Execute a parte Tipo 2, registre `**Estado:** 🚀 executado <data>`. **Nunca** escreva nem
   apague `**Solução:**`.

Isso conta para `--max`.

### 2. Escolher pela prioridade — o motor ordena, não você

```bash
python3 scripts/prioridade.py backlog --json --write [--canon <cofre>/_operacao.yaml]
```

- Use `resultados` na ordem em que vieram (banda + EV). Nunca reordene em prosa.
- **Motor recusou** (canon todo `null`, sem `_operacao.yaml`): use `tasks/PRIORIDADE.md` se existir,
  declarando o `asof` e a idade (gate `dado-datado`). Sem nenhum dos dois: ordem fixa
  `🔺 → 🔼 → 🔽`, depois `📅` mais antigo — e diga que é o fallback, não o motor.
- Exit 3 (item EXISTENCIAL no topo): ele é **do dono** — garanta que está em `human.md` e siga.

**Elegível** = aberto `[ ]` em `backlog.md`, `bugs.md` ou `features.md`, e **nenhum** destes:
- `[/]` (já em andamento) · `#eis/q4` (o dono mandou adiar);
- sub-bullet `Bloqueado por:` cujo bloqueador ainda está aberto;
- já tem `[APROVAR]` pendente em `human.md` para a mesma ação;
- `spec.md` (espelho gerado — trabalho de spec fecha em `specs/<feature>/tasks.md`);
- `#area/` órfã (sem `.claude/agents/agente-<area>.md`).

### 3. Classificar o item — Tipo 1 ou Tipo 2

Leia `Contexto`/`Ação` e confronte com `allowlist.md` e com a tabela "O que depende de humano" de
`.claude/rules/tasks.md`.

- **Inteiro Tipo 2** → passo 4.
- **Tem parte Tipo 1** (ex.: "corrigir e publicar") → execute só a parte Tipo 2 e registre a
  parte Tipo 1 em `human.md`.
- **Todo Tipo 1, ou é decisão de produto/negócio/escopo** → registre em `human.md` no formato
  `[APROVAR]` do `allowlist.md` (deduplique antes; inclua `**Solução:** _(pendente)_`) e volte
  ao passo 2 para o próximo item. Não conta para `--max`.
- **Ambíguo** → trate como Tipo 1. Na dúvida, pedir aprovação (allowlist).

### 4. Executar — despacho por área

- Área = tag `#area/`; sem tag, matriz de roteamento do `/orquestrador-empresa`.
  `#area/seguranca` ⇒ `agente-soc` (defesa) ou `agente-redteam` (análise — **nunca** probe ativo).
- Modelo = tag `#modelo/` (sem tag: default de `tasks/README.md`). Passe no parâmetro `model`
  do despacho. Subir de modelo é permitido com motivo no `Contexto:`; descer, não.
- Marque o item `[/]` antes de despachar.
- Prompt do despacho: o bloco inteiro do item, a branch atual, e as regras: Tipo 2 apenas, não
  commitar, não fazer push, não editar `tasks/`, devolver (a) arquivos alterados, (b) como
  verificou, (c) o que aprendeu — ou **nada**.

### 5. Verificar — você confere, não confia

- Leia o `git diff` do que o agente fez. Fora do escopo do item ⇒ reverta o excedente.
- Rode a verificação do projeto: a que o item pede, os testes do que mudou, e as checagens de
  `.claude/` quando a mudança tocar skills (`python3 scripts/publicar_skills.py --check`).
- **Falhou** ⇒ uma tentativa de correção. Falhou de novo ⇒ desfaça as mudanças do item (só os
  arquivos dele), volte o item para `[ ]` com sub-bullet `Tentativa <data>: <motivo>` e siga.
  Nunca afrouxe o teste ou o gate para fechar (doutrina, recusa 9).

### 6. Fechar

1. `git add` só dos arquivos do item + commit Conventional (`fix(...)`/`feat(...)`/`docs(...)`),
   uma tarefa por commit. **Sem push.**
2. Mova o bloco inteiro do item para `tasks/concluidas.md` com `✅ <data>` e a seção de origem.
3. Aprendizado não-vazio devolvido pelo agente ⇒ timeline de `gemeo/12-AGENTES/<area>/memoria.md`.
   "nada" não grava (Regra de ouro: não inventar aprendizado). Formato e invioláveis: passo 5 do
   `/orquestrador-empresa` e `gemeo/12-AGENTES/_FRAMEWORK/memoria-template.md`.
4. Garanta **um** item em `human.md` para revisar a branch:
   `[APROVAR] Revisar e integrar a branch fila/<data> (<n> commits)` — atualize a contagem do
   que já existe em vez de criar outro.

### 7. Relatório — curto, porque repete a cada disparo

```
fila: <aberta antes> → <aberta depois> · branch fila/<data> (+<n> commits)
✅ <item> — agente-<area> (<modelo>) · <verificação>
🛑 <item> → human.md (<motivo em 5 palavras>)
⏭ próximo: <item> | fila Tipo 2 vazia
```

Fila Tipo 2 vazia ⇒ diga isso em uma linha e não invente trabalho. Se estiver rodando em
`/loop`, sugira encerrar o loop.

## Gates

- `aprovacao-humana` — tudo 🛑 para em `human.md`; a branch nunca chega a `main` sem o dono.
- `sem-exfiltracao` — os agentes trabalham no repo; nada do corpus vai para fora.
- `conta-visivel` — a ordem sai de `prioridade.py`; o fallback é uma regra fixa e declarada.
- `dado-datado` — `PRIORIDADE.md` usado como fallback carrega o `asof` no relatório.
- `canon-ancorado` não se aplica à skill: ela não cita número de negócio. Se o item citar, o
  agente da área responde pelo gate.
