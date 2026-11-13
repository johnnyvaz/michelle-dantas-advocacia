# Sentry Setup — Checklist Rápido

## 1. Preparar Sentry Project

1. Ir para https://sentry.io/
2. Criar uma organização (ou usar existente)
3. Criar um project com **Node.js** (para backend)
4. Copiar as variáveis de ambiente

## 2. Variáveis de Ambiente

Adicionar ao `.env.local`:

```env
# Copiar de https://sentry.io/settings/cod2d-software/projects/4511398739247104/keys/
SENTRY_DSN=https://examplePublicKey@o0.ingest.sentry.io/0
NEXT_PUBLIC_SENTRY_DSN=https://examplePublicKey@o0.ingest.sentry.io/0

# Para deployment + sourcemaps
SENTRY_AUTH_TOKEN=sntrys_xxxxxxxxxxxxxxxxxxxxx
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project

# Ambiente
NEXT_PUBLIC_ENVIRONMENT=development
```

## 3. Verificar Instalação

```bash
# Verificar se Sentry está inicializado
npm run dev

# Abrir console e testar
# No browser devtools:
Sentry.captureMessage("Test message")
```

## 4. Testar no Dashboard

1. Abrir https://sentry.io/organizations/YOUR_ORG/issues/
2. Procurar "Test message"
3. Se aparecer, está funcionando ✓

## 5. Integrar ao Código

### Server-side (API routes, Server Components)

```typescript
import { sentryServer } from "@/lib/sentry/server";

try {
  // seu código
} catch (error) {
  sentryServer.captureException(error as Error);
}
```

### Client-side (React Components)

```typescript
'use client'
import { sentryClient } from "@/lib/sentry/client";

function MyComponent() {
  const handleClick = () => {
    try {
      // seu código
    } catch (error) {
      sentryClient.captureException(error as Error);
    }
  };
}
```

## 6. Deploy

Antes de fazer deploy, rodar:

```bash
./scripts/sentry-release.sh  # Cria release com sourcemaps
pnpm run build
netlify deploy --prod
```

## 7. Monitorar

Ir para https://sentry.io/organizations/YOUR_ORG/issues/ para ver erros em produção.

## Troubleshooting

**"Sentry não está capturando erros"**
- Verificar se `SENTRY_DSN` está no `.env.local`
- Verificar if `npm run dev` foi reiniciado após adicionar env vars
- Checar console do browser (aba "Network") para requests para `ingest.sentry.io`

**"Sourcemaps não estão sendo enviados"**
- Checar se `SENTRY_AUTH_TOKEN` está correto
- Rodar `./scripts/sentry-release.sh` manualmente antes de build
- Ver output do build para erros de upload
