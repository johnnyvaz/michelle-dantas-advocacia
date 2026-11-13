# Escolha de modelo: Opus 5.5, Sonnet 5.5 e Haiku 5.5

**Versão:** 1.1 · **Data da pesquisa:** 2026-10-08 · **Público:** agentes de área, `/orquestrador-empresa` e quem monta subagentes.

> **Dado datado.** Preços, IDs e datas abaixo são de fonte pública da Anthropic (não do canon) e
> foram conferidos em 2026-10-08. Modelo e preço mudam: se a data passar de ~90 dias, reconfira
> em [Models overview](https://platform.claude.com/docs/en/about-claude/models/overview) antes de decidir.
> Os números aqui são **citação de fornecedor**; nenhuma conta foi feita em prosa (doutrina, gate `conta-visivel`).

## 1. Resumo em 30 segundos

| Se a tarefa é... | Use | Effort inicial |
|---|---|---|
| Longa, autônoma, com julgamento sustentado (refactor grande, pentest, análise multi-fonte, computer use) | **Opus 5.5** | `medium` (default) → `high` se o eval pedir |
| Cotidiana e bem delimitada (bug, feature pequena, documento, planilha, copy, revisão) | **Sonnet 5.5** | `medium` p/ agentic coding; `low` p/ chat |
| Alto volume, baixa latência, classificação, triagem, extração, roteamento, subagente de leitura | **Haiku 5.5** | `low` p/ classificação/extração; `medium` (default) p/ subagente |
| Opus 5.5 em `xhigh`/`max` ainda reprova no eval | Fable 5.1 (exceção, aprovar custo) | `high` |

Regra prática: **comece pelo modelo mais barato que passa no seu eval**, e ajuste **effort antes de trocar de modelo**
(guia oficial: "tuning effort is often a better lever than switching models").

## 2. Os três modelos

Os três compartilham: contexto de 1M tokens, saída de 128K, conhecimento confiável até jun/2026,
thinking adaptativo e o tokenizer novo (~30% mais tokens que o dos modelos até a geração 4.6 para o mesmo texto).

### Claude Opus 5.5 — `claude-opus-5-5` (lançado em 2026-09-22)

- **Papel:** trabalho agêntico longo e trabalho de conhecimento. Oficialmente é o ponto de partida para a maioria das cargas.
- **Preço:** US$ 4 entrada / US$ 20 saída por MTok; cache read US$ 0,20. Anthropic diz ~40% mais barato que o Opus 5 em carga típica e saída ~30% mais rápida.
- **Thinking:** adaptativo, **sempre ligado** (não dá para desligar). Default de effort é `medium` (o Opus 5 era `high`).
- **Resultados divulgados:** no `medium`, iguala ou supera o Opus 5 em `max`; supera o Fable 5.1 em coding agêntico, trabalho de conhecimento e computer use.
- **Extras:** fast mode (preview, ~2,5x de velocidade a US$ 8 / US$ 40 por MTok, só API própria da Anthropic); task budgets (beta); escrita mais clara, informação importante no início.
- **Salvaguardas:** tarefas de cyber de maior risco roteiam para Opus 4.8 para usuários externos; biologia exige programa de verificação. Relevante para `agente-redteam` e `agente-soc` (ver §5).
- **Aposentadoria:** não antes de 2027-09-22.

### Claude Sonnet 5.5 — `claude-sonnet-5-5` (lançado em 2026-09-28)

- **Papel:** "melhor combinação de velocidade e inteligência" — trabalho cotidiano de código, agente e empresa.
- **Preço:** US$ 2 entrada / US$ 10 saída por MTok; cache write US$ 2,50; **cache read US$ 0,10** (reduzido de US$ 0,20 em 2026-10-07, junto do lançamento do Haiku 5.5). Mesmo preço-base do Sonnet 5, mas a Anthropic cita até ~30% menos custo por tarefa (menos tokens e menos chamadas de ferramenta) e saída 30%+ mais rápida.
- **Thinking:** adaptativo (`thinking: disabled` retorna 400; para desligar use `between_tools`, só até `high`). Default de effort da API é `high` (níveis recalibrados — reexecute o sweep; comece em `medium` para coding agêntico e `low` para chat).
- **Onde brilha:** correção de bug delimitada, documentos/slides/planilhas, iteração rápida, atendimento, análise financeira. Em trabalho de conhecimento (GDPval-AA) fica quase empatado com o Opus 5.5.
- **Onde perde:** a própria Anthropic diz que o Opus 5.5 é "claramente mais forte em trabalho aberto e complexo que exige julgamento sustentado". O Sonnet 5.5 complementa o Opus **em effort baixo**, onde custa menos.
- **Salvaguardas:** primeiro Sonnet com proteções de cyber e fallback como os modelos maiores (cyber de maior risco cai para o Sonnet 5).
- **Aposentadoria:** não antes de 2027-09-28.

### Claude Haiku 5.5 — `claude-haiku-5-5` (lançado em 2026-10-07)

- **Papel:** "o modelo pequeno mais barato, mais rápido e mais capaz" que a Anthropic já lançou. Models overview: "high-volume, latency-sensitive tasks such as classification, extraction, and routing". O anúncio cita resumo, compactação, consulta a banco, classificação, atendimento em tempo real, browser use e **subagente** ao lado de Opus 5.5/Sonnet 5.5.
- **Preço — atenção: em duas faixas pelo tamanho do prompt** (único da linha atual com isso):

  | | prompt até 100K tokens | prompt acima de 100K tokens |
  |---|---|---|
  | Entrada | US$ 0,10 / MTok | US$ 0,50 / MTok |
  | Saída | US$ 0,50 / MTok | US$ 2,50 / MTok |
  | Cache write 5m / 1h | US$ 0,125 / US$ 0,20 | US$ 0,625 / US$ 1 |
  | Cache read | US$ 0,01 / MTok | US$ 0,05 / MTok |
  | Batch (entrada / saída) | US$ 0,05 / US$ 0,25 | US$ 0,25 / US$ 1,25 |

  A Anthropic diz que ele custa "around 75% less to run" que o Haiku 4.5 em média (90% até 100K, 50% acima),
  já descontado que o tokenizer novo usa um pouco mais de tokens por tarefa. Ele é barato **porque o prompt é curto**:
  desenhe a tarefa para caber abaixo de 100K.
- **Thinking:** adaptativo, **ligado por padrão**; `budget_tokens` retorna 400. É o **primeiro Haiku com `effort`** (`low` → `max`), default `medium`. Em `low` ele pode pular o thinking em pedidos simples.
- **Benchmarks divulgados (Anthropic, não reproduzidos):** salto grande sobre o Haiku 4.5 em trabalho de conhecimento (GDPval-AA), computer use (OSWorld) e raciocínio (HLE), mas **fica bem atrás do Sonnet 5.5 em coding agêntico** (Terminal-Bench 4.0). A própria Anthropic: Sonnet e Opus "remain better choices for complex agentic coding tasks".
- **Velocidade:** o mais rápido da linha em velocidade padrão; o Opus em fast mode é mais rápido que ele.
- **Salvaguardas:** cyber mais restritivo que o Haiku 4.5 e "somewhat less restrictive" que o Sonnet 5.5 — **bloqueia pedidos de penetration testing** e técnicas típicas de atacante. Biologia igual à do Sonnet 5.5. **Não tem fallback no servidor**: recusa chega como `stop_reason: "refusal"` e o código tem que tratar.
- **Disponibilidade:** Claude API, Bedrock, Google Cloud, Microsoft Foundry e Claude Platform on AWS — o ID é `claude-haiku-5-5` em todas (Bedrock: `anthropic.claude-haiku-5-5`). Sem sufixo de data, sem alias separado.
- **Aposentadoria:** não antes de 2027-10-07.

### Legado: Claude Haiku 4.5 — `claude-haiku-4-5-20251001`

Continua **ativo**, mas sem razão para código novo: o Haiku 5.5 é mais barato e mais capaz. Aposentadoria
"não antes de 2026-10-15", mas em 2026-10-08 ainda **não havia aviso de deprecação**; a Anthropic promete ao
menos 60 dias de aviso antes de aposentar. Qualquer coisa que ainda chame `claude-haiku-4-5` deve migrar (guia na §7; no
Claude Code, `/claude-api migrate this project to claude-haiku-5-5`).

## 3. Como decidir (ordem de perguntas)

1. **O erro é caro ou irreversível?** (segurança, contrato, dinheiro, texto que sai para cliente) → Opus 5.5, e a decisão continua humana (`aprovacao-humana`).
2. **A tarefa é curta, bem especificada e verificável por teste/lint/revisão?** → Sonnet 5.5.
3. **É volume? milhares de itens, resposta curta, formato fixo?** → Haiku 5.5 em `low` (ou Sonnet 5.5 em `low` se o Haiku reprovar).
4. **O prompt passa de 100K tokens?** → o Haiku 5.5 muda de faixa de preço. Reduza o contexto (resuma, recorte, cache) ou compare o custo por tarefa com o Sonnet 5.5 no eval.
5. **É coding agêntico de várias etapas?** → não Haiku; Sonnet 5.5 ou Opus 5.5.
6. **Envolve pentest ou técnica ofensiva?** → não Haiku (salvaguarda de cyber bloqueia); Opus 5.5.
7. **Precisa de computer use ou horas de trabalho autônomo?** → Opus 5.5.
8. **Teste antes de subir:** rode o mesmo eval no modelo menor com o effort certo. Só suba de modelo se reprovar com evidência. Custo se julga **por tarefa concluída**, não por requisição.

Antipadrões:
- Trocar de modelo para "economizar" sem eval — retrabalho custa mais.
- Effort `max` por hábito. Raramente compensa fora de problema difícil comprovado.
- Cascata de três modelos quando um modelo em effort baixo resolve: cada modelo tem cache próprio.
- Confiar em `temperature`/`top_p`/`top_k` nos modelos 5.5 — valores não default retornam 400.
- Mandar o corpus inteiro para o Haiku "porque é barato": acima de 100K tokens a faixa de preço sobe.

## 4. Padrões de combinação

- **Orquestrador + workers:** Opus 5.5 planeja e consolida; Sonnet 5.5 (julgamento moderado) ou Haiku 5.5 (leitura/triagem/extração em massa) executam. Aplicável ao fan-out de `/analisar-negocio` (lentes) e a `/atualizar-gemeo` (coletores em paralelo).
- **Executor + advisor:** executor Sonnet 5.5 consulta Opus 5.5 nas decisões difíceis. O advisor tem que ser **pelo menos tão capaz** quanto o executor; par inválido dá 400.
- **Fan-out largo custa caro** (contraponto da doutrina): reduza lentes antes de disparar em Opus. Com Haiku 5.5 como worker, o custo por worker cai, mas o erro de premissa replicado continua.

## 5. Sugestão por agente (proposta — dono decide)

Hoje **todos** os agentes em `.claude/agents/*.md` estão com `model: opus`. Isto é uma **proposta**, não uma mudança aplicada; alterar frontmatter é decisão do dono e deve passar por eval por agente.

| Agente | Sugestão | Justificativa |
|---|---|---|
| `agente-desenvolvimento` | Opus 5.5 (features grandes) / Sonnet 5.5 (bug e teste delimitados) | coding agêntico é onde o Sonnet 5.5 é mais forte; Haiku 5.5 fica atrás aqui |
| `agente-redteam` | Opus 5.5 | julgamento sustentado; atenção às salvaguardas de cyber (podem rotear para modelo anterior). **Não use Haiku 5.5**: bloqueia pentest |
| `agente-soc` | Opus 5.5 na análise de incidente; Haiku 5.5 na triagem em lote | triagem Bayesiana em volume vs. correlação complexa. Triagem é defensiva, mas valide no eval a taxa de `refusal` em eventos de ataque — Haiku 5.5 não tem fallback |
| `agente-financeiro` | Opus 5.5 | número errado é caro; cálculo continua em script |
| `agente-operacoes` (LGPD/contratos) | Opus 5.5 | erro jurídico é caro |
| `agente-vendas` | Sonnet 5.5 | propostas e follow-ups bem delimitados |
| `agente-marketing`, `agente-copy` | Sonnet 5.5 | conteúdo e tom; escala bem e é rápido |
| `agente-conteudo-cursos` | Sonnet 5.5 | documentos, quiz e roteiros |
| `agente-marca` | Sonnet 5.5 | auditoria contra regra escrita: delimitada e verificável |
| `agente-analytics` | Sonnet 5.5 (Opus 5.5 no relatório trimestral) | leitura de métrica com conta em script; o julgamento pesa na recomendação |
| `agente-social` | Sonnet 5.5 (Haiku 5.5 para adaptar em lote) | adaptação por rede é volume de formato fixo |
| `agente-ideias` | Opus 5.5 | pauta é trabalho aberto: cruzar acervo e sinais é onde ideia rasa custa caro |
| `agente-estudio` | Sonnet 5.5 | tradução fiel de conteúdo pronto para roteiro e deck-plan |
| `agente-design` | Sonnet 5.5 (Opus 5.5 se for muito visual/complexo) | visão forte em ambos |
| `analista` (fan-out de lentes) | Sonnet 5.5 ou Haiku 5.5 nos workers; consolidação em Opus 5.5 | muitas invocações paralelas; Haiku 5.5 só se a lente couber abaixo de 100K tokens |

## 6. Regras de integração (quebras nos modelos 5.5)

Vale para qualquer script ou skill que chame a API diretamente:

- **`budget_tokens` dá 400** nos três. Use `thinking: {"type": "adaptive"}` (ou omita) e controle com `output_config.effort`.
- **Thinking não desliga** no Opus 5.5 (`disabled` dá 400). No Sonnet 5.5, `disabled` também dá 400. No Haiku 5.5, o lever é effort baixo.
- **Thinking conta em `max_tokens`**: `max_tokens` pequeno herdado do Haiku 4.5 pode parar com `stop_reason: "max_tokens"` antes de qualquer texto. Aumente ou baixe o effort.
- **Leia blocos por `type`**, nunca pela posição: a resposta pode começar com bloco `thinking`.
- **`tool_choice` forçado (`any`/`tool`)**: dá 400 no Opus 5.5 e no Sonnet 5.5. No Haiku 5.5 é aceito, mas a resposta vem **sem thinking**. Nos três, prefira `auto` + instrução, `strict: true` ou structured outputs.
- **Sem prefill** de resposta do assistente (400 nos três, inclusive no Haiku 5.5 com thinking desligado).
- **Display de thinking** vem vazio por padrão; use `display: "summarized"` ou `"updates"` se precisar mostrar.
- **`temperature`/`top_p`/`top_k`** não default retornam 400. O SDK Python v1.0+ nem aceita os parâmetros (`TypeError`).
- **Conversa append-only**: mudar `system`, `tools` ou mensagens anteriores e reenviar blocos de thinking dá 400. Thinking só vale na conta que o produziu.
- **Recontagem de tokens**: o mesmo texto vira ~30% mais tokens no Haiku 5.5 que no Haiku 4.5. Refaça contagem, `max_tokens` e estimativa de custo com `model: claude-haiku-5-5`.
- **Computer use:** só `computer_toolset_20260801` na API própria e no Google Cloud (os três). Haiku 5.5 também suporta browser use (`browser_toolset_20260801`).
- **Priority Tier não cobre** Opus 5.5, Sonnet 5.5 nem Haiku 5.5.
- **Fallback por recusa:** ao escrever código para Opus 5.5 ou Sonnet 5.5, inclua `fallbacks: "default"` (beta `server-side-fallback-2026-07-01`). **Haiku 5.5 não tem fallback no servidor** — trate `stop_reason: "refusal"` no cliente.
- **Prompts herdados de modelo antigo** costumam ser prescritivos demais; revise ao migrar.
- **Batch API:** 50% de desconto; até 300K tokens de saída com o beta `output-300k-2026-03-24` (vale também para o Haiku 5.5).

Detalhe completo: guias de migração oficiais (fontes na §7).

## 7. Fontes (conferidas em 2026-10-08)

- [Models overview](https://platform.claude.com/docs/en/about-claude/models/overview) — IDs, preços, contexto, effort default, aposentadoria.
- [Pricing](https://platform.claude.com/docs/en/about-claude/pricing) — faixas do Haiku 5.5, cache e batch.
- [Model deprecations](https://platform.claude.com/docs/en/about-claude/model-deprecations) — status do Haiku 4.5.
- [Choosing a model](https://platform.claude.com/docs/en/about-claude/models/choosing-a-model) — matriz de escolha e combinação.
- [Haiku 5.5 migration guide](https://platform.claude.com/docs/en/models/haiku-5-5/migration-guide) — quebras de API vindo do Haiku 4.5.
- [Introducing Claude Opus 5.5](https://www.anthropic.com/claude-opus-5-5) — anúncio de 2026-09-22.
- [Introducing Claude Sonnet 5.5](https://www.anthropic.com/claude-sonnet-5-5) — anúncio de 2026-09-28.
- [Introducing Claude Haiku 5.5](https://www.anthropic.com/claude-haiku-5-5) — anúncio de 2026-10-07.
- [TechCrunch sobre o Opus 5.5](https://techcrunch.com/2026/09/22/anthropic-releases-opus-5-5-with-lower-prices-and-fable-level-performance/) e [VentureBeat sobre o Sonnet 5.5](https://venturebeat.com/technology/anthropic-launches-claude-sonnet-5-5-with-30-cost-reduction-per-task-due-to-faster-speeds-and-fewer-tool-calls) — cobertura independente.
- Benchmarks (Terminal-Bench, GDPval-AA, OSWorld, HLE etc.) são **divulgados pela Anthropic**, não reproduzidos aqui; valide no eval do seu caso.

## 8. Manutenção

- Reconfira esta página quando: a Anthropic anunciar a data de aposentadoria do Haiku 4.5, o preço mudar, ou sair modelo novo na linha.
- Emenda de agente (trocar `model:` no frontmatter) entra como proposta em `tasks/human.md` com o eval que a sustenta.

### Histórico

- **1.1 — 2026-10-08:** entra o Haiku 5.5 (lançado em 2026-10-07) no lugar do Haiku 4.5, que vira legado; cache read do Sonnet 5.5 cai para US$ 0,10; quebras de API do Haiku 5.5 na §6; perguntas de decisão sobre faixa de 100K tokens, coding agêntico e salvaguarda de cyber.
- **1.0 — 2026-09-29:** primeira versão (Opus 5.5, Sonnet 5.5, Haiku 4.5).
