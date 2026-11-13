---
name: priorizar
description: >
  Ordena a fila de trabalho (tarefas, bugs, decisões do dono, eventos de segurança, propostas)
  pela contribuição esperada ao retorno, com raciocínio Bayesiano, e classifica cada item num
  quadrante da matriz Eisenhower. Use quando o usuário perguntar "o que fazer primeiro",
  "priorize o backlog", "qual o foco agora", "o que decidir hoje", "triar eventos de segurança",
  ou para gerar tasks/PRIORIDADE.md e a matriz no cofre Obsidian.
triggers:
  - priorizar
  - prioridade
  - o que fazer primeiro
  - qual o foco
  - matriz eisenhower
  - foco de hoje
  - triar eventos
  - fila priorizada
gates: [canon-ancorado, conta-visivel]
---

# Priorizar — motor Bayesiano + matriz Eisenhower

Roda `scripts/prioridade.py` e apresenta a fila ordenada com a decomposição de cada item.

## Fluxo

1. Escolher o corpus: `backlog` (tarefas, bugs **e** a fila humana), `human` (só as decisões do
   dono), `soc` (eventos de segurança), `propostas`, ou `all`.
2. Rodar:
   ```bash
   python3 scripts/prioridade.py <corpus> [--canon <cofre>/_operacao.yaml] \
       [--model <prioridade.yaml>] [--in <lote>] [--top 10] [--write] [--emit-json <arq>]
   ```
   - `--canon` **é o normal, não a exceção**: o canon de negócio nasce todo `null` e, sem
     nenhum objetivo resolvido, o motor recusa priorizar. O cofre gera `_operacao.yaml` com
     métricas que o próprio sistema mede (decisões pendentes, bugs, atrasos).
   - `--write` gera `tasks/PRIORIDADE.md` e injeta `[prio: <score> calc:prioridade]` nas linhas.
   - `--emit-json` alimenta o gerador do cofre (matriz e foco do dia).
   - `--model` calibra os pesos num lugar só para vários projetos.
3. Apresentar o **top-N** com, para cada item: quadrante, banda, score, EV e a **justificativa**
   (evidências que elevaram/reduziram + objetivos ativos).
4. Recomendar a primeira ação. Item **EXISTENCIAL** vira decisão do dono — registre em
   `gemeo/DECISOES/` (BDR) se ele decidir agir; agentes propõem, nunca executam.

## A matriz Eisenhower

| | Urgente | Não urgente |
|---|---|---|
| **Importante** | Q1 fazer agora | Q2 agendar |
| **Não importante** | Q3 rápido ou delegar | Q4 descartar ou adiar |

- **Importância** = `score` (posterior Bayesiano × objetivos ativos)
- **Urgência** = o maior entre: piso da lente, prazo `🎯` e idade sem atenção (anti-decaimento)
- **Ordem dentro do quadrante** = EV
- **Override**: `#eis/q1..q4` na linha vence o cálculo (a saída marca `quadrante_origem`)
- Limiares em `eisenhower:` no `prioridade.yaml`

Fora dos quadrantes, de propósito: itens `[/]` em progresso (já receberam atenção — aparecem em
"Em andamento") e itens sem idade resolvível (aparecem em "sem data", com o total declarado).

## A fila humana é a fila principal

`tasks/human.md` **entra** na priorização: cada item ali bloqueia trabalho do agente. Tem o
prior mais alto do sistema (`priors.human`) e um `piso_urgencia` na lente — decisão parada é
urgente por natureza, não por idade.

O motor **lê e nunca escreve** em `human.md`: o dono responde na própria linha do item
(`→ opção B`), e reescrever a linha destruiria isso. Mesma regra para `inbox.md`, cujo merge de
três vias compara linhas por string exata.

## Regras

- O score sai do script — **nunca** estime prioridade em prosa (regra de ouro).
- Sem objetivo resolvido no canon o script recusa e diz o que falta; repasse isso, não invente
  prioridade. Com `_operacao.yaml` do cofre isso não acontece.
- Exit code 3 = há item EXISTENCIAL no topo: destaque-o.
- Objetivos reescalam a fila, não a reordenam: `impacto` é o mesmo multiplicador para todos os
  itens da lente. Quem dispersa a fila são as evidências e a urgência.
- Guarda com `fonte:` lê o canon, não o item: se disparar, **todos** os itens viram EXISTENCIAL
  com `ev=+inf`. Guarda nova deve ser por `evidencia:`. Travado em `tests/test_prioridade.py`.
- Recalibrar pesos por feedback: `python3 scripts/recalibrar.py --write`
  (rótulos em `gemeo/00-CANON/prioridade-feedback.yaml`).

## Fontes por corpus

| Corpus | De onde vêm os itens |
|---|---|
| `backlog` | `tasks/*.md` **+** `tasks/human.md` — formato em `tasks/README.md` |
| `human` | só `tasks/human.md` (três dialetos aceitos; canônico é `### H-0xx ·` + `**Estado:**`) |
| `soc` | só via `--in <arquivo.jsonl\|yaml>` (lote de eventos) |
| `propostas` | só via `--in`; as de `/analisar-negocio` vivem em `gemeo/PROPOSTAS/` |

Nunca lidos (não são fila): `README.md`, `PRIORIDADE.md`, `ALLOWLIST.md`, `inbox.md`,
`concluidas.md`. Itens `[x]`/`[-]` e linhas de exemplo do template também não entram.

## Evidências derivadas da linha

O que o motor extrai sozinho de `tasks/*.md`, sem ninguém preencher nada:

| Evidência | Vem de |
|---|---|
| `severidade_p1/p2/p3` | `🔺` / `🔼` / `🔽` |
| `area_sensivel` | `#area/seguranca` |
| `tipo_bug` | o item estar em `bugs.md` |
| `stale` | idade maior que `decaimento.meia_vida_dias` |
| `reincidente` | o título casar com uma entrada de `concluidas.md` |
| `quick_win` | `#esforco/p` |
| `prazo_vencido` | `🎯` no passado |
| `aguardando_decisao` `risco_ativo` `irreversivel` | lente `human` |

Idade, em cascata: `📅` da linha → `git blame` da linha → mtime do arquivo. **73% das tarefas
do acervo não têm `📅`** — sem a cascata elas nunca seriam urgentes, e ninguém veria isso.
