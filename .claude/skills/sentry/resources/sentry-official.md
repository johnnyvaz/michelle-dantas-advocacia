# Sentry Official Docs

- **Setup Guide:** https://docs.sentry.io/platforms/javascript/guides/nextjs/
- **SDK API:** https://docs.sentry.io/platforms/javascript/enriching-events/
- **Performance:** https://docs.sentry.io/platforms/javascript/performance/
- **Session Replay:** https://docs.sentry.io/platforms/javascript/session-replay/
- **Releases:** https://docs.sentry.io/product/releases/health/

## Quick Reference

### Init
```typescript
Sentry.init({ dsn, tracesSampleRate: 0.1 })
```

### Capture
```typescript
Sentry.captureException(error)
Sentry.captureMessage("texto")
```

### Context
```typescript
Sentry.setUser({ id, email })
Sentry.setTag("feature", "value")
Sentry.setContext("custom", { data })
```

### Breadcrumbs
```typescript
Sentry.addBreadcrumb({ category, message, level })
```

### Transactions
```typescript
const txn = Sentry.startTransaction({ op, name })
// ... async work ...
txn.finish()
```
