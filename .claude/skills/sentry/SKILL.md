---
name: sentry
description: >-
  Integra error tracking, performance monitoring, session replay e releases com Sentry em projetos Next.js 14+ (App Router). Use quando o usuário pedir rastreamento de erros, monitoramento de performance, sourcemaps, release tracking ou error boundary global.
---

# Sentry — Error Tracking & Monitoring

Integração de error tracking, performance monitoring e releases com Sentry para Next.js 14+ (App Router).

## Triggers

- `sentry`, `error tracking`, `rastreamento de erros`
- `performance monitoring`, `performance`, `monitoramento de performance`
- `release tracking`, `releases`, `sourcemaps`
- `session replay`, `replay`, `gravação de sessão`
- `breadcrumbs`, `eventos`, `rastreamento de eventos`
- `global error`, `error boundary`, `erro global`

## Setup Rápido

```bash
# Opção 1: Wizard automático (recomendado)
npx @sentry/wizard@latest -i nextjs

# Opção 2: Já configurado (veja AGENTS.md para manual)
```

## Arquivos Principais

```
instrumentation-client.ts         # Client runtime (browser)
sentry.server.config.ts           # Server runtime (Node.js)
sentry.edge.config.ts             # Edge runtime
src/instrumentation.ts            # Entry point (registro automático)
src/app/global-error.tsx          # Error boundary global (App Router)
src/lib/sentry/
├── client.ts                      # Wrapper client
├── server.ts                      # Wrapper server
└── logger.ts                      # Logging centralizado (opcional)

scripts/
└── sentry-release.sh              # Deploy com source maps

.env.sentry.example                # Template de variáveis
```

## Quando Usar

- Rastrear erros não tratados
- Monitorar performance de rotas e APIs
- Implementar breadcrumbs customizados
- Integrar com CI/CD para releases
- Debugar erros em produção
- Analisar sessions com replay
- Correlacionar erros com usuários
