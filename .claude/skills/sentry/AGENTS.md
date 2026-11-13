# Sentry — Instruções do Agente

## Visão Geral

Integração completa de Sentry (error tracking, performance monitoring, releases) no Next.js 14+ (App Router) com:
- Detecção automática de erros (server + client + edge)
- Performance monitoring com Core Web Vitals
- Session replay (10% das sessões, 100% com erro)
- Release tracking com source maps
- Error boundaries globais
- Integração com Stripe, Supabase e APIs externas

---

## Fases de Setup

### **Fase 1: Detectar**

Rodar comandos de diagnóstico:

```bash
# Ver versão Next.js
grep '"next"' package.json

# Ver se App Router
ls src/app/layout.tsx && echo "✓ App Router" || echo "✗ Pages Router"

# Verificar se Sentry já existe
grep -i sentry package.json
```

### **Fase 2: Recomendar**

Features **sempre recomendadas**:
- ✅ Error Monitoring (já implementado)
- ✅ Performance Tracing (já implementado)
- ✅ Session Replay (já implementado)

Features **opcionais** (adicionar depois):
- Logging (integração com `winston` ou `pino`)
- Profiling (Node.js + Browser)
- AI Monitoring (rastreamento de chamadas OpenAI/Anthropic)
- Cron Monitoring (health checks)
- Metrics (custom)

### **Fase 3: Guiar Setup**

**Opção A: Wizard Automático (recomendado)**

```bash
npx @sentry/wizard@latest -i nextjs
```

Wizard vai:
- Criar configs automaticamente
- Perguntar sobre features
- Gerar source maps
- Atualizar `next.config.ts`

**Opção B: Manual**

Já feito em seu projeto:
- ✅ `instrumentation-client.ts` — browser
- ✅ `sentry.server.config.ts` — Node.js
- ✅ `sentry.edge.config.ts` — Edge Runtime
- ✅ `src/instrumentation.ts` — hook de registro
- ✅ `src/app/global-error.tsx` — error boundary
- ✅ `next.config.js` — com `withSentryConfig`

### **Fase 4: Cross-Link**

Se tiver backends (`/agente-ia-autonomo` ou `/transcription-api`), adicionar SDKs correspondentes:

| Backend | SDK | Docs |
|---------|-----|------|
| Python | `sentry-sdk` | https://docs.sentry.io/platforms/python/ |
| Node.js | `@sentry/node` | https://docs.sentry.io/platforms/node/ |
| Go | `sentry-go` | https://docs.sentry.io/platforms/go/ |

---

## Instalação e Setup

### 1. Variáveis de Ambiente

```env
# .env.local
SENTRY_DSN=https://key@o0.ingest.sentry.io/projectid
NEXT_PUBLIC_SENTRY_DSN=https://key@o0.ingest.sentry.io/projectid
NEXT_PUBLIC_ENVIRONMENT=development

# Para sourcemaps + releases (opcional, mas recomendado em produção)
SENTRY_AUTH_TOKEN=sntrys_xxxxxxxxxxxxx
SENTRY_ORG=seu-org
SENTRY_PROJECT=seu-project
```

**Onde conseguir?**
1. Ir para https://sentry.io/
2. Criar organização/projeto
3. Copiar DSN de: Settings → Projects → [seu-project] → Client Keys (DSN)
4. Gerar token em: Settings → Auth Tokens → Create New Token

### 2. Testar Inicialização

```bash
npm run dev
# Abrir console do browser (F12)
# Rodar:
Sentry.captureMessage("Test message", "info")
# Ir para dashboard Sentry — deve aparecer a mensagem
```

---

## Uso Prático

### Capturar Erros Manualmente

**Server-side (API routes, Server Components):**

```typescript
import * as Sentry from "@sentry/nextjs";
import { sentryServer } from "@/lib/sentry/server";

export async function GET(request: Request) {
  try {
    // seu código
  } catch (error) {
    sentryServer.captureException(error as Error, {
      endpoint: "GET /api/cursos",
      userId: session?.user?.id,
    });
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
```

**Client-side (React Components):**

```typescript
"use client";
import * as Sentry from "@sentry/nextjs";

export function MeuComponente() {
  const handleClick = () => {
    try {
      // seu código
    } catch (error) {
      Sentry.captureException(error);
    }
  };

  return <button onClick={handleClick}>Clique</button>;
}
```

### Error Boundary (automático)

`src/app/global-error.tsx` já captura todos os erros **não tratados** globalmente.

### Breadcrumbs (rastreamento de eventos)

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.addBreadcrumb({
  category: "auth",
  message: "Usuário fez login",
  level: "info",
  data: {
    userId: user.id,
    email: user.email,
  },
});
```

### Performance Monitoring

```typescript
const transaction = Sentry.startTransaction({
  op: "db.query",
  name: "Fetch all courses",
});

// seu código assíncrono aqui

transaction.finish();
```

### Contexto de Usuário

```typescript
import * as Sentry from "@sentry/nextjs";

const user = await getCurrentUser();
if (user) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.email?.split("@")[0],
  });
}
```

---

## Integração com Plataforma

### 1. Stripe Webhooks

```typescript
import * as Sentry from "@sentry/nextjs";

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature") || "";

  try {
    const event = stripe.webhooks.constructEvent(body, sig, WEBHOOK_SECRET);

    Sentry.addBreadcrumb({
      category: "stripe",
      message: `Webhook: ${event.type}`,
      level: "info",
      data: { eventId: event.id },
    });

    // processar evento
  } catch (error) {
    Sentry.captureException(error, { tags: { type: "stripe_webhook" } });
  }
}
```

### 2. OpenAI / Anthropic (Agent IA)

```typescript
import Anthropic from "@anthropic-ai/sdk";
import * as Sentry from "@sentry/nextjs";

try {
  const response = await anthropic.messages.create({
    model: "claude-opus-4-7",
    max_tokens: 1024,
    messages: [/* ... */],
  });
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      service: "anthropic",
      model: "claude-opus-4-7",
    },
  });
}
```

### 3. Supabase RLS + Auth Errors

```typescript
import * as Sentry from "@sentry/nextjs";
import { createClient } from "@supabase/supabase-js";

try {
  const { data, error } = await supabase
    .from("enrollments")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    Sentry.captureException(new Error(error.message), {
      tags: { type: "supabase_rls" },
      extra: { table: "enrollments", userId },
    });
  }
} catch (error) {
  Sentry.captureException(error);
}
```

---

## Release Tracking & Source Maps

### Deploy com Releases

```bash
# 1. Build
npm run build

# 2. Criar release com source maps
./scripts/sentry-release.sh v1.2.3

# 3. Deploy
netlify deploy --prod
```

### Script automático

```bash
./scripts/sentry-release.sh  # Usa git tag ou "local"
```

Isso:
- Cria release no Sentry
- Upload de source maps
- Versioning automático

---

## Verificação e Troubleshooting

### Verificar se Sentry está inicializado

```typescript
import * as Sentry from "@sentry/nextjs";

console.log("Sentry DSN:", process.env.SENTRY_DSN ? "✓" : "✗");
console.log("Sentry inicializado:", Sentry.isInitialized());
```

### Testar captura de erro

```typescript
// Em uma rota qualquer
throw new Error("Test error - Sentry capture");

// Ir para https://sentry.io/organizations/seu-org/issues/
// Deve aparecer "Test error - Sentry capture"
```

### Common Issues

| Problema | Solução |
|----------|---------|
| "DSN não funciona" | Verificar `NEXT_PUBLIC_SENTRY_DSN` vs `SENTRY_DSN` |
| "Erros não aparecem" | Reiniciar `npm run dev` após adicionar env vars |
| "Source maps não aparecem" | Gerar token + rodar `./scripts/sentry-release.sh` |
| "Session replay vazio" | Verificar `maskAllText: false` se dados sensíveis |
| "Muitos eventos" | Aumentar `tracesSampleRate` de 1.0 para 0.1 |

---

## Best Practices

1. **Não capturar erros esperados** — use try/catch, retorne HTTP status apropriado
2. **Usar tags e contexto** — facilita filtro e análise
3. **Amostrar em produção** — `tracesSampleRate: 0.1` (10%)
4. **Session replay em erros** — `replaysOnErrorSampleRate: 1.0`
5. **Source maps sempre** — upload no deploy
6. **SetUser para erros autenticados** — ajuda investigação
7. **Filtrar dados sensíveis** — usar `beforeSend`
8. **Monitorar releases** — comparar versões no dashboard

---

## Next Steps

1. ✅ Sentry instalado
2. ✅ Configs criadas
3. ⬜ Adicionar `SENTRY_DSN` + `SENTRY_AUTH_TOKEN` ao `.env.local`
4. ⬜ Rodar `npm run dev` e testar
5. ⬜ Integrar `sentryServer`/`sentryClient` ao seu código
6. ⬜ Deploy com `./scripts/sentry-release.sh`
7. ⬜ (Opcional) Adicionar Sentry a backends (`agente-ia-autonomo`, `transcription-api`)

