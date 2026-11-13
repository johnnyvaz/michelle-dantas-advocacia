---
name: datar
description: >
  Conduz uma sessão de datas: percorre os blocos de tasks/*.md, pergunta o prazo de cada um ao
  dono, grava `**Prazo:** 🎯 AAAA-MM-DD` no bloco (ou `🎯` na linha do item) e valida com o
  motor de prioridade. Use quando o usuário disser "vamos colocar as datas", "preciso de prazo
  nas tarefas", "datar o backlog", "quando cada frente entrega", ou quando o painel mostrar
  compromissos sem `🎯`.
triggers:
  - datar
  - colocar datas
  - colocar prazo
  - prazo das tarefas
  - data de entrega
  - quando entrega
  - agenda do projeto
---

# Datar — prazo por bloco, decidido pelo dono

Prazo é **compromisso com alguém**. Sem `🎯`, a urgência de um item vem só da idade, e o motor
mede envelhecimento em vez de compromisso — foi o estado de 19 dos 21 projetos até 2026-08-25,
quando o portfólio tinha 2 prazos em 276 itens pendentes.

## O que NÃO fazer

- **Não invente data.** Nenhum `🎯` entra sem o dono ter dito o dia. Prazo inventado vira
  atraso falso, e o painel perde a credibilidade que justifica existir.
- **Não date achado do agente.** Item com `🤖` que ninguém de fora cobrou fica sem prazo. Se
  tudo tem prazo, `🎯` deixa de significar "estão esperando isto".
- **Não use `📅` como prazo.** `📅` é data de registro. Datar um item antigo com `📅` de hoje
  zera a idade dele e apaga o histórico que alimenta a urgência.
- **Não date bloco de 9 itens heterogêneos** só para preencher: nove atrasados no mesmo dia
  não informam nada. Ou o bloco é uma entrega, ou o prazo vai no item.

## Fluxo

1. **Mapear.** Rodar o levantamento para saber o tamanho do trabalho e onde faltam datas:
   ```bash
   MAPA="${CLAUDE_PLUGIN_ROOT:-.claude}/skills/datar/resources/mapa-prazos.py"
   python3 "$MAPA"          # este projeto (detectado a partir do diretório atual)
   python3 "$MAPA" --todos  # portfólio inteiro
   ```
   O mapa inclui todas as filas humanas declaradas em `tasks/.filas.yaml`, não apenas
   `human.md`.

2. **Perguntar em lotes.** Um lote de até 4 blocos por vez, do mais concreto para o mais vago:
   frentes de `features.md` primeiro (são entregas com nome), depois blocos de produto de
   `backlog.md`, depois `bugs.md`. Em cada pergunta, dizer **quantos itens** o bloco tem, a
   **severidade** que já carrega e se é `🤖` — é o que permite ao dono responder "sem prazo"
   com convicção. Ofereça sempre a saída "sem prazo agora".

3. **Agrupar o que sobra.** Os blocos de achado `🤖` viram UMA pergunta ("todos sem prazo?"),
   não vinte. No DATA-DOSSIE isso economizou 24 perguntas.

4. **Gravar.** Prazo de entrega inteira vai no bloco; prazo de um item só vai na linha:
   ```markdown
   ## [/] 002 - Página de Empresa (CNPJ)

   **Branch:** `002-cnpj-company-page`
   **Prazo:** 🎯 2026-09-15
   ```
   Na linha, a ordem é `📅` → `🎯` → severidade: `- [ ] Título 📅 2026-04-01 🎯 2026-09-11 🔺 alta`.
   Contrato completo em `tasks/README.md` › *Prazo de bloco*.

5. **Validar sempre.** O formato que não casa não dá erro: desaparece.
   ```bash
   python3 scripts/prioridade.py all --asof $(date +%F) \
     --canon <cofre>/_operacao.yaml --emit-json /tmp/prio.json
   python3 -c "import json; d=json.load(open('/tmp/prio.json')); \
   print([(i['prazo'], i.get('origem_prazo'), i['id'][:40]) for i in d['resultados'] if i.get('prazo')])"
   ```
   `origem_prazo` diz de onde veio: `🎯` (linha) ou `bloco` (herdado). **Confira a contagem
   contra o que você gravou** — foi assim que se descobriu que subseção `###` apagava o prazo
   da seção-mãe: 13 itens datados onde deviam ser 17.

6. **Publicar.** `bash scripts/sync-obsidian.sh` no projeto e, se o painel for consumir,
   `bash scripts/publicar-estado.sh --commit` no repo `projetos-ia`.

## Aproveitar a conversa

Datar expõe backlog podre, e o dono está com o arquivo aberto — é o momento de perguntar. No
DATA-DOSSIE saíram três itens: um fora de escopo, um já coberto por trabalho em curso e uma
duplicata. Item removido a pedido vai para `concluidas.md` com `- [-]` e o **motivo**;
duplicata sai direto, porque repetição não é trabalho cancelado.

## Depois

Item datado só sobe na matriz quando o prazo entra no horizonte de urgência
(`prazo.horizonte_dias`, 14 por padrão em `gemeo/00-CANON/prioridade.yaml`). Entrega para
daqui a um mês **continua em Q4** — isso é o motor funcionando, não a data sendo ignorada.
Diga isso ao dono, senão ele conclui que o prazo não pegou.
