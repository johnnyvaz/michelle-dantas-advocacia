---
name: ph3a-loop
description: Orquestrador do ciclo de vida PH3A. Roda as skills de padronização, qualidade, segurança e deploy na ordem de dependência correta, com gates interativos entre as fases. É data-driven — lê catalog.yml — e suporta modos seletivos (completo, qualidade, seguranca, deploy). Use para preparar um projeto novo do zero com os padrões PH3A (bootstrap) ou para rodar uma fase específica. Invoque com /ph3a-loop [modo] [caminho].
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, Skill
---

# Skill: Loop de Ciclo de Vida PH3A

Orquestrador único que faz o sistema **interagir skill a skill** para deixar qualquer projeto PH3A no padrão:
organizar → definir padrões → instalar qualidade → (desenvolver) → verificar → deploy. Encadeia as skills
existentes na **ordem de dependência correta** (o `quality-gate` é pré-requisito dos guards) e ativa o ciclo
contínuo de qualidade nos hooks do speckit.

A skill **não conhece a lista de skills na unha** — ela lê `.claude/skills/ph3a-loop/catalog.yml`. Skills novas
adicionadas ao catálogo entram no loop automaticamente.

---

## Invocação

```
/ph3a-loop                       → modo interativo: pergunta o modo, usa o diretório atual
/ph3a-loop completo              → bootstrap completo no diretório atual
/ph3a-loop qualidade             → só a fase de qualidade
/ph3a-loop seguranca             → só as skills de segurança/conformidade IA
/ph3a-loop deploy                → só o gate/scaffold de deploy
/ph3a-loop completo /caminho/projeto
```

Argumentos (em qualquer ordem):
- **modo**: `completo` | `qualidade` | `seguranca` | `deploy` (default: perguntar)
- **caminho**: caminho do projeto-alvo (default: `pwd`)

---

## Passo 0 — Carregar contexto

1. Resolver o **alvo** (`<ALVO>`): argumento de caminho, ou `pwd`.
2. Ler o catálogo. Procure nesta ordem (o primeiro que existir):
   - `<ALVO>/.claude/skills/ph3a-loop/catalog.yml` (projeto já tem o loop copiado)
   - `.claude/skills/ph3a-loop/catalog.yml` (rodando a partir do BoilerplateIA)
3. Se o **modo** não veio no argumento, perguntar:

```
Qual modo do loop PH3A?
  1) Completo    — organizar + padrões + qualidade + segurança + deploy
  2) Qualidade   — quality-gate + guards + análise (sonar, analisador)
  3) Segurança   — revisão de código + conformidade IA (LGPD, prompt-audit, RIPD, ...)
  4) Deploy      — gate de quality-gate + scaffold de deploy
```

4. Selecionar do catálogo as entradas cujas `categoria` pertencem ao modo:
   - `completo`  → `organizacao`, `padroes`, `qualidade`, `seguranca`, `deploy`
   - `qualidade` → `qualidade`
   - `seguranca` → `seguranca`
   - `deploy`    → `deploy`

5. **Ordenar** a execução por `fase` (organizar → padroes → qualidade → verificar → deploy) e, dentro da fase,
   por `ordem` crescente. Respeitar `requires`: nunca rodar uma skill antes das skills listadas em `requires`
   (na prática, isso garante `quality-gate` antes de qualquer guard/`arch-guard`/`deploy`).

6. **Detectar a stack** do alvo (reusar a lógica da skill `quality-gate`): Python/FastAPI, Node/TS, monorepo,
   frameworks de teste, CI. Guardar para passar às sub-skills.

7. Mostrar o **plano de execução** (tabela: fase → skill → ação) e pedir confirmação antes de começar.

---

## Princípios de execução (valem para todas as fases)

- **Idempotente**: antes de cada skill, detectar se o artefato já existe (ex: `quality-baseline.json`,
  `sonar-project.properties`, `.specify/memory/constitution.md`). Se existir, **não sobrescrever** — informar e
  oferecer pular ou atualizar. Nunca regredir um baseline de ratchet.
- **Gate interativo entre fases**: ao terminar uma fase, mostrar o que foi feito e perguntar
  `Continuar para a fase «X»? (s/n)`. O usuário pode parar a qualquer momento — o estado fica consistente.
- **Invocar sub-skills**: para cada entrada selecionada, invoque a skill correspondente via barra
  (ex: `/quality-gate <ALVO>`), passando o alvo e a stack detectada. Se a invocação por barra não estiver
  disponível, leia `.claude/skills/<skill>/SKILL.md` do alvo (ou do BoilerplateIA) e siga suas instruções.
- **Pré-checagem de `requires`**: se uma skill exige `quality-gate` e ele não está instalado no alvo, **recuse**
  e instale o `quality-gate` primeiro (ou volte à fase de qualidade).

---

## Fase 0 — Organizar  (categoria `organizacao`, só no modo completo)

Garante a base do projeto. Reusa o `init.sh` do BoilerplateIA (depositar arquivos) — mas como esta skill roda
dentro do Claude, faça as verificações diretamente e crie só o que faltar:

- `git` inicializado? Se não, perguntar antes de `git init`.
- `.claude/memory/` (architecture.md, decisions.md, patterns.md, database.md) — copiar do template se faltar,
  substituindo `{{PROJECT_NAME}}`. Garantir `.claude/memory/database.md` no `.gitignore`.
- `tasks/` (backlog, features, bugs, ideas) — copiar se faltar.
- Hooks de commit (Conventional Commits) — `scripts/hooks/` + instalar em `.git/hooks/`. **Só se `<ALVO>` for a
  raiz do próprio repositório git** (`git -C <ALVO> rev-parse --show-toplevel` igual a `<ALVO>`). Se o alvo for
  uma subpasta de outro repositório (fixture, monorepo), grave os hooks só em `<ALVO>/scripts/hooks/` e **não**
  toque `.git/hooks/` nem `core.hooksPath`: o hook cairia no repositório hospedeiro e sobrescreveria o dele.
- `CHANGELOG.md` inicial — se faltar.
- `.devcontainer/` — opcional, perguntar.
- Demais skills da categoria `organizacao` (todas citadas no resumo final):
  `fluxo-git-ph3a` (convenção de branch/commit — aplica, sem efeito externo), `protocolo-aprovacao`
  (aplica, sem efeito externo), `tasks-obsidian` (cria o painel local de `tasks/`) e `telegram`
  (**não se aplica** quando não há canal externo autorizado: integração externa, só com aprovação humana).
- **`/mapear-projeto <ALVO>`** — por último na fase: lê o código e escreve o mapa consultável em
  `<ALVO>/gemeo/07-PRODUTO/mapa/` (`INDEX.md` é a porta de consulta), depois propõe preencher os
  templates de `07-PRODUTO` — aplica só o que o usuário confirmar. Mapa já em dia (inventário sem
  diferença) é **aplica e passa**; alvo sem código próprio é **não se aplica**.

Ao final: resumo do que foi organizado. Gate → Fase 1.

---

## Fase 1 — Padrões  (categoria `padroes`)

1. **Constituição** (`speckit-constitution`): se `<ALVO>/.specify/memory/constitution.md` ainda for o template
   (placeholders `[PRINCIPLE_...]`) ou não existir, invocar `/speckit-constitution` **alimentado pelo seed PH3A**
   em `templates/ph3a-constitution-seed.md`. Passar o conteúdo do seed como base dos princípios. Se já houver uma
   constituição preenchida, mostrar e perguntar se deseja revisar.
2. (Modos completo e segurança) As skills de conformidade de fase `padroes` (`prompt-audit`, `anonymize-data`,
   `synthetic-data-generator`, `ai-tool-request`, `model-card-generator`, `ripd-assistant`,
   `supplier-ai-due-diligence`) são **sob demanda** — elas geram artefatos para situações específicas. Nesta fase,
   apenas garanta que estão instaladas no projeto e liste ao usuário quando usar cada uma (não execute todas).
   No resumo final elas recebem o desfecho **não se aplica**, com o motivo (ex.: projeto sem IA embarcada e sem
   dado pessoal; `ai-tool-request`, `model-card-generator` e `ripd-assistant` só existem diante de IA
   embarcada/dado pessoal; `supplier-ai-due-diligence`, de fornecedor de IA).

Gate → Fase 2.

---

## Fase 2 — Qualidade  (categoria `qualidade`)

A fase percorre **toda** entrada de `categoria: qualidade` do catálogo — não só as que esta prosa nomeia. Skill
nova no catálogo entra aqui sem editar este arquivo; a lista abaixo é a ordem rígida das que existem hoje.

**Ordem rígida (do catálogo, por `ordem` e respeitando `requires`):**

1. **`/quality-gate <ALVO>`** — SEMPRE primeiro. Instala o ratchet (`scripts/quality-gate.js`,
   `quality-baseline.json`, `.jscpdrc.json`, `release.sh`, sonar scripts, hooks). Capturar baseline inicial com
   `node scripts/quality-gate.js --update` quando as dependências estiverem instaladas. A detecção da stack
   vale para a **estrutura real** do alvo (`api/`+`web/`, `backend/`+`frontend/`, `src/`), não só uma delas.
2. **`/arch-guard <ALVO>`** — fronteiras de arquitetura; define camadas e regras, integra `arch_violations` ao
   ratchet. (requer quality-gate)
3. **Guards** — `/complexity-guard`, `/io-budget`, `/memory-guard`, `/property-race-guard`, `/resilience-guard`,
   `/observability-guard`: cada um adiciona suas métricas ao ratchet. Perguntar quais aplicar (todos por
   default). (requerem quality-gate)
   Fora do ratchet, **`/otel-guard`** valida os manifestos de rodada do gêmeo e audita as skills de
   fan-out sem emissor. Sem gêmeo no alvo, **não se aplica**. O exportador OTLP nunca é ligado pelo
   loop: fica **parada na aprovação humana**.
4. **Testes**: `/tdd` (conduz os testes de unidade que alimentam o ratchet) e `/contract-first` (contratos
   `.http` + e2e em ambiente isolado; gera `scripts/test-loop.sh`).
5. **Análise** (documental, sem métrica de ratchet): `/arch-tradeoff`, `/analisador-projetos`, `/sonarqube`
   (modo `list`, sem autofix), `/sonarqube-review` (lê servidor SonarQube — **não se aplica** sem servidor
   configurado) e `/sonarqube-open-ticket` (**não se aplica**: abre chamado em tracker externo).
6. **`/ci-pipeline <ALVO>`** — gera o pipeline do alvo (requer quality-gate). Em alvo que não é raiz de
   repositório, o resultado é só insumo: o CI real vive no repositório hospedeiro.

Ao final, rodar **`/quality-check <ALVO>`** (= `node scripts/quality-gate.js`, sem `--update`) para confirmar que
está verde. Lembrete: `/quality-gate` **instala** o gate; `/quality-check` **executa** o ratchet e reprova em
regressão (é o que o hook `after_implement` dispara).

Com o gate verde, **`/raio-x <ALVO>`** traduz o resultado para quem não é técnico (nota A–E, semáforo por tema,
arquivos que mais concentram problema) em `docs/QUALIDADE.md`, `docs/qualidade/raio-x.html` e no README, e liga o
raio-x ao `--update` do gate. Antes, calibra os scanners (o raio-x expõe o número que eles contam). As tarefas
por tema (`--tasks`) só entram na fila se o usuário pedir. Gate → Fase 2b.

---

## Fase 2b — Segurança  (categoria `seguranca`, modos completo e seguranca)

1. **`/review-code-ph3a <ALVO>`** — revisão de segurança do código próprio. Achado de severidade alta é
   corrigido ou registrado; sem achado alto, desfecho **aplica e passa**.
2. **`/sca-guard <ALVO>`** — audit de dependências, secret scanning e SBOM. Mesma regra de hooks da Fase 0
   (nunca no `.git` do hospedeiro).
3. **`/pentest-dinamico <ALVO>`** — **somente modo análise (tabletop)**. Probe ativo é ação Tipo 1: exige alvo em
   `gemeo/12-AGENTES/seguranca/escopo-autorizado.yaml` e aprovação humana, e o loop **nunca** o dispara nem
   edita o ROE. Sem ROE, o desfecho é análise concluída e *probe parado na aprovação humana*.
4. **`/incident-report-ia`** — **não se aplica**: só existe diante de um incidente de IA.
5. As demais da categoria (`prompt-audit`, `anonymize-data`, `synthetic-data-generator`, `ai-tool-request`,
   `model-card-generator`, `ripd-assistant`, `supplier-ai-due-diligence`) são sob demanda e já foram tratadas
   na Fase 1.

Gate → Fase 3.

---

## Fase 3 — Ativar ciclo contínuo  (modo completo / qualidade)

Plugar a qualidade no ciclo de desenvolvimento speckit, para que ela **auto-dispare**:

1. Verificar se `<ALVO>/.specify/` existe (speckit instalado). Se não, informar que o ciclo contínuo depende do
   speckit e oferecer copiar o scaffold `.specify/` do BoilerplateIA.
2. Registrar a extension **`ph3a-quality`**: copiar `.specify/extensions/ph3a-quality/` para o alvo e **mesclar**
   as entradas de hook em `<ALVO>/.specify/extensions.yml` (e adicionar `ph3a-quality` à lista `installed:`).
   Não duplicar entradas se já existirem. Detalhes em `.specify/extensions/ph3a-quality/README.md`.

A partir daí, ao usar o ciclo speckit (`/speckit-specify → /speckit-plan → /speckit-tasks → /speckit-implement`),
os hooks PH3A disparam `/quality-gate` e `/review-code-ph3a` nas fases certas. Gate → Fase 4.

---

## Fase 4 — Deploy  (categoria `deploy`)

**Scaffold-and-gate** — esta skill NÃO executa um deploy genérico (os comandos reais são específicos do projeto).
Ela prepara e protege:

1. Garantir que a skill `deploy` está em `<ALVO>/.claude/skills/deploy/SKILL.md` (copiar do BoilerplateIA se
   faltar) e **parametrizá-la** para a stack detectada: substituir `{{PROJECT_NAME}}` e preencher os comandos de
   build/deploy/health/rollback que o usuário informar (perguntar). Se o usuário não souber ainda, deixar os
   placeholders e avisar para personalizar.
2. Garantir o **gate de quality-gate** no deploy: o passo "Pré-deploy" da skill `deploy` roda
   `node scripts/quality-gate.js` e **bloqueia** o deploy se houver regressão.
3. Conectar `scripts/release.sh` (versionamento semântico via Conventional Commits) ao fluxo, se presente.

Ao final: lembrar que `/deploy` é interativo e exige quality-gate verde + branch correta. **O loop nunca executa
o deploy**: o desfecho da skill `deploy` é sempre *parada na aprovação humana*. O mesmo vale para `push` e
qualquer outra ação externa.

---

## Saída final

Resumo consolidado:

```
✓ Loop PH3A — modo «<modo>» concluído em <ALVO>

Fases executadas:
  [✓] Organizar     — memory/, tasks/, hooks, changelog, mapa do código (07-PRODUTO/mapa/)
  [✓] Padrões       — constituição PH3A, arch-guard (fronteiras)
  [✓] Qualidade     — quality-gate + guards + análise
  [✓] Ciclo contínuo— extension ph3a-quality registrada (auto-dispara no speckit)
  [✓] Deploy        — skill deploy parametrizada + gate de quality-gate

Próximos passos:
  • Capturar baseline real:        node scripts/quality-gate.js --update
  • Instalar git hooks:            bash scripts/hooks/install-hooks.sh
  • Iniciar uma feature:           /speckit-specify "<descrição>"
  • Deploy quando verde:           /deploy
```

Adapte o resumo às fases efetivamente rodadas pelo modo escolhido.

### Desfecho por skill (obrigatório no resumo)

Além das fases, o resumo traz **uma linha por skill selecionada** pelo modo (as categorias do passo 0.4), cada
uma com exatamente um destes três desfechos:

| Desfecho | Quando |
|---|---|
| **aplica e passa** | a skill rodou, gerou/atualizou o que lhe cabe e a verificação dela ficou verde |
| **não se aplica** | a skill não faz sentido no alvo; o **motivo** vem escrito na mesma linha |
| **parada na aprovação humana** | a skill chegou ao ponto Tipo 1 (deploy, push, ação externa, probe ativo) e parou |

Skill sem linha, ou com qualquer outro desfecho (erro, "pulada", "depois"), faz o loop terminar **vermelho** —
não anuncie «concluído». Uma skill que falha por defeito da própria skill é corrigida na fonte
(`.claude/skills/<skill>/`), não contornada no alvo.

---

## Notas

- **Reuso, não reimplementação**: esta skill orquestra as skills existentes; toda a lógica de cada métrica vive
  na skill correspondente. Se algo precisa mudar em qualidade, muda-se a skill, não o orquestrador.
- **Crescimento do catálogo**: para incluir uma skill nova no loop, adicione uma entrada em `catalog.yml`
  (`categoria`, `tipo`, `fase`, `requires`, `ordem`). Nada nesta SKILL.md precisa mudar.
- **Modos isolados**: `qualidade`, `seguranca` e `deploy` não tocam fora da sua categoria. Útil para rodar uma
  parte do loop em projeto já existente sem reorganizar tudo.
