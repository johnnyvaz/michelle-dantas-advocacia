---
name: otel-guard
description: Telemetria do ciclo agêntico do gêmeo. Valida os manifestos de rodada (gemeo/PROPOSTAS/RUNS/R###.yaml, gravados por scripts/rodada.py), audita quais skills de fan-out ainda não emitem manifesto, mostra o mapeamento para spans das GenAI semantic conventions do OpenTelemetry (invoke_workflow / invoke_agent) e conduz a decisão de ligar o exportador OTLP, que é opt-in e Tipo 1. Não é o observability-guard, que cuida do log da aplicação sob NORM04, e não depende do quality-gate. Use quando o usuário pedir telemetria, custo ou latência por rodada/worker, OpenTelemetry, traces de agente, ou "qual lente rende mais". Invoque com /otel-guard [caminho].
allowed-tools: Read, Bash, Grep, Glob, Edit
gates: [sem-exfiltracao, aprovacao-humana, dado-datado]
---

# otel-guard: telemetria do ciclo agêntico

Uma rodada de fan-out (o `/analisar-negocio` despacha 5 analistas) custa de 3 a 10 vezes um agente
único, e até aqui nada media qual worker produziu valor e qual só custou tokens
(`docs/grafo/05-mercado.md`, "Observabilidade: OpenTelemetry venceu"; S-09 de `docs/grafo/04-plano.md`).
Esta skill cuida das três camadas dessa medição:

1. **Manifesto de rodada**: `gemeo/PROPOSTAS/RUNS/R###.yaml`, uma linha por worker, gravado por
   `scripts/rodada.py gravar` e nunca escrito à mão.
2. **Spans OpenTelemetry GenAI**: o mesmo manifesto lido como trace. Sem rede por padrão.
3. **Exportador OTLP**: opt-in duplo. Ligar é decisão do dono.

> **Não é o `/observability-guard`.** Aquele mede o log da **aplicação** (NORM04) e depende do
> `quality-gate.js`. Este mede o **ciclo de agentes** do gêmeo e não depende do ratchet: o público
> é o loop, não o código do produto (decisão do dono, 2026-11-03).

## Passo 0: aplica-se?

```bash
ls scripts/rodada.py gemeo/00-CANON/canon.yaml 2>/dev/null
ls gemeo/PROPOSTAS/RUNS/ 2>/dev/null
```

- Sem `scripts/rodada.py` ou sem o gêmeo: a skill **não se aplica**. O motor viaja com o plugin
  `ph3a-gemeo` (ou com o modo cópia). Diga isso e pare.
- Sem `RUNS/`: nenhuma rodada foi registrada ainda. Siga para o passo 2, que é o que tem a dizer.

## Passo 1: validar os manifestos

```bash
python3 scripts/rodada.py validar gemeo/PROPOSTAS/RUNS/R*.yaml
```

Exit 1 é manifesto incoerente (persistidas maior que candidatas, lente repetida, número negativo,
campo desconhecido). **Não corrija o YAML à mão**: manifesto é registro. Reporte o erro e a rodada.
A causa costuma estar no emissor, que passou a contagem errada.

Se dois manifestos seguidos têm o mesmo `canon_sha` e o segundo tem `persistidas > 0` em alguma
lente, aponte: é o sinal de proposta rasa que o `/analisar-negocio` já prevê (o dedup deveria ter
zerado a segunda rodada).

## Passo 2: auditar os emissores

Toda skill que despacha workers em paralelo deveria gravar manifesto. Ache as que despacham e
confira se emitem:

```bash
grep -l "allowed-tools:.*\(Task\|Agent\)" .claude/skills/*/SKILL.md \
  | xargs grep -L "scripts/rodada.py gravar"
```

A lista que sair é de skills que fazem fan-out sem telemetria. O emissor de referência é o passo
4c do `/analisar-negocio`. Ligar um emissor novo é edição em branch (Tipo 2): mude o mínimo, com um
passo `rodada.py gravar` depois do registro de custo e antes do resumo. Skill que despacha **um**
agente só (sem fan-out) não precisa de manifesto. Diga isso, não force.

## Passo 3: ler a rodada como trace (sem rede)

```bash
python3 scripts/rodada.py spans gemeo/PROPOSTAS/RUNS/R001.yaml          # legível
python3 scripts/rodada.py spans gemeo/PROPOSTAS/RUNS/R001.yaml --json   # o que o exportador mandaria
```

Mapeamento (nomes conferidos em `open-telemetry/semantic-conventions-genai`,
`docs/gen-ai/gen-ai-agent-spans.md`, em 2026-11-03; a convenção está em status **Development** e os
nomes podem mudar, por isso vivem em constantes no topo de `rodada.py`):

| Manifesto | Span (kind INTERNAL) | Atributos |
|---|---|---|
| a rodada | `invoke_workflow <origem>` (raiz) | `gen_ai.operation.name=invoke_workflow`, `gen_ai.workflow.name`, `gen_ai.conversation.id=<rodada>`, `ph3a.rodada`, `ph3a.origem`, `ph3a.canon_sha`, `ph3a.completude`, `ph3a.custo_usd` |
| cada worker | `invoke_agent <agente>` (filho) | `gen_ai.operation.name=invoke_agent`, `gen_ai.agent.name`, `gen_ai.request.model`, `gen_ai.usage.input_tokens`, `gen_ai.usage.output_tokens`, `ph3a.lente`, `ph3a.candidatas`, `ph3a.duplicadas`, `ph3a.citacao_orfa`, `ph3a.persistidas` |
| `status: falha` | filho com status ERROR | `error.type=_OTHER` |

Campo `null` no manifesto **não vira atributo**: zero no lugar de "não sei" seria número inventado.
A raiz carrega a origem e a rodada, que é a tag de atribuição de custo agregada por root span.

## Passo 4: ligar o exportador (Tipo 1, decisão do dono)

Exportar manda telemetria do gêmeo para fora do repositório. Mesmo sem conteúdo, nome de lente,
contagem e custo por rodada descrevem como a empresa decide. Por isso:

- **Por padrão nada sai.** Sem `OTEL_EXPORTER_OTLP_ENDPOINT`, `gravar` só grava o YAML e nem
  importa a biblioteca.
- **O endpoint sozinho não basta.** Essa variável é genérica, e qualquer processo instrumentado da
  máquina pode tê-la. O exportador exige também `PH3A_OTEL_EXPORTAR=1`, que é o consentimento
  deste projeto.
- **A biblioteca é opcional.** Sem `opentelemetry-sdk` e `opentelemetry-exporter-otlp`, o YAML é
  gravado, sai um aviso e o exit continua 0. Coletor fora do ar dá o mesmo resultado.
- **Só sai a lista fechada** (`ATRIBUTOS_PERMITIDOS` em `rodada.py`). Os atributos de conteúdo da
  convenção (`gen_ai.input.messages`, `gen_ai.output.messages`, `gen_ai.system_instructions`,
  `gen_ai.tool.definitions`) **nunca** são emitidos, nem com opt-in.

**Ligar é Tipo 1.** Você não liga. Registre em `tasks/human.md` e pare:

```markdown
- [ ] Ligar exportador OTel do gêmeo neste projeto? 📅 AAAA-MM-DD 🔼 média #area/desenvolvimento
  - Contexto: /otel-guard. Sai por OTLP a lista fechada de rodada.py (contagens, lentes, tokens, custo); nenhum conteúdo.
  - Decisão: qual coletor (próprio? de terceiro?), quem acessa e por quanto tempo guarda.
  - Como ligar: PH3A_OTEL_EXPORTAR=1 e OTEL_EXPORTER_OTLP_ENDPOINT=<coletor> no `env` de `.claude/settings.local.json` (não versionado), mais `pip install opentelemetry-sdk opentelemetry-exporter-otlp`.
```

Coletor de terceiro (Langfuse cloud, Braintrust, Datadog) é IA ou serviço de terceiro: a decisão
inclui a política de IA da PH3A, não só a técnica. Coletor próprio na rede interna é o caminho de
menor risco. Depois que o dono decidir, confira com
`python3 scripts/rodada.py exportar gemeo/PROPOSTAS/RUNS/<última>.yaml`.

## Saída

Feche com três linhas: manifestos válidos ou inválidos (com a rodada), skills de fan-out sem
emissor, e o estado do exportador (desligado, ligado, ou parado em `tasks/human.md`). No
`/ph3a-loop`, os desfechos são os de sempre: aplica e passa, não se aplica (sem gêmeo), ou parada
na aprovação humana (exportador).

## Gates

- `sem-exfiltracao`: nada sai sem opt-in duplo, e o que sai é a lista fechada.
- `aprovacao-humana`: ligar o exportador vai para `tasks/human.md`.
- `dado-datado`: todo manifesto tem `fim` (e `inicio`, quando conhecido) em UTC.
- `canon-ancorado` não se aplica: o manifesto não cita número do negócio, só contagens operacionais
  da própria rodada.
- `conta-visivel` não se aplica: a skill não faz conta. Agregado por lente, quando existir, sai de
  script.
