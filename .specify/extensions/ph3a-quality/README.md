# Extension `ph3a-quality`

Pluga o **ciclo contínuo de qualidade PH3A** nos hooks do ciclo de desenvolvimento do Spec Kit
(`specify → plan → tasks → implement`). Em vez de lembrar de rodar a qualidade manualmente, ela **auto-dispara**
nas fases certas.

## Como funciona

As skills do speckit (ex: `speckit-implement`) leem `.specify/extensions.yml`, encontram os hooks da fase
(`before_implement`, `after_implement`, ...), filtram por `enabled`, e convertem o `command` em slash command
(`ponto → hífen`). Esta extension encadeia skills que **já existem** no projeto:

| Hook | Comando | Optional | Efeito |
|---|---|---|---|
| `before_implement` | `/quality-gate` | sim (prompt) | Garante o quality-gate **instalado** antes de implementar |
| `after_plan` | `/arch-guard` | sim (prompt) | Checa fronteiras de arquitetura após o plano |
| `after_implement` | `/quality-check` | **não** (auto) | **Executa** o ratchet (`node scripts/quality-gate.js`) e reprova em regressão |
| `after_implement` | `/review-code-ph3a` | sim (prompt) | Revisão de segurança (OWASP/NORM11/LGPD) |

> **`/quality-gate` instala; `/quality-check` enforça.** O `after_implement` mandatório usa `/quality-check`
> (que roda `node scripts/quality-gate.js` e reprova em regressão), não o instalador `/quality-gate`. É o que
> faz a qualidade auto-disparar e efetivamente bloquear regressões a cada implementação. A revisão de segurança
> (`/review-code-ph3a`) é **opcional** (prompt), para não rodar uma análise pesada a cada ciclo sem o usuário pedir.

## Instalação / registro

A skill `/ph3a-loop` (Fase 3) faz isto automaticamente. Manualmente:

1. Copiar esta pasta para `<projeto>/.specify/extensions/ph3a-quality/`.
2. Mesclar as entradas de hook abaixo em `<projeto>/.specify/extensions.yml` e adicionar `ph3a-quality` à
   lista `installed:`.

```yaml
installed:
  - agent-context
  - git
  - ph3a-quality        # <- adicionar

hooks:
  before_implement:
    - extension: ph3a-quality
      command: quality-gate
      enabled: true
      optional: true
      priority: 20
      prompt: "Garantir que o quality-gate PH3A está instalado antes de implementar?"
      description: "Garante o quality-gate (ratchet) antes da implementação"
      condition: null
  after_plan:
    - extension: ph3a-quality
      command: arch-guard
      enabled: true
      optional: true
      priority: 20
      prompt: "Verificar fronteiras de arquitetura (arch-guard) após o plano?"
      description: "Checagem de fronteiras de arquitetura PH3A após o planejamento"
      condition: null
  after_implement:
    - extension: ph3a-quality
      command: quality-check
      enabled: true
      optional: false
      priority: 20
      prompt: "Rodar o quality check (ratchet) após a implementação?"
      description: "Executa node scripts/quality-gate.js após a implementação — bloqueia regressões"
      condition: null
    - extension: ph3a-quality
      command: review-code-ph3a
      enabled: true
      optional: true
      priority: 30
      prompt: "Revisar segurança do código (review-code-ph3a) após implementação?"
      description: "Revisão de segurança PH3A (OWASP/NORM11/LGPD) após implementação"
      condition: null
```

## Ajustes

- Para **desligar** um hook sem removê-lo: `enabled: false` na entrada correspondente em `extensions.yml`.
- Para tornar o quality-gate `after_implement` apenas sugerido (não automático): mude `optional: false` → `true`.
- As entradas convivem com os hooks das extensions `git` e `agent-context` na mesma fase (são listas).

## Pré-requisitos no projeto

As skills referenciadas precisam existir no projeto: `quality-gate`, `arch-guard`, `review-code-ph3a`.
O `init.sh` (modo com qualidade/segurança) e a `/ph3a-loop` as copiam.
