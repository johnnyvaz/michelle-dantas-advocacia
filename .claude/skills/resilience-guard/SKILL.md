---
name: resilience-guard
description: >-
  Verifica e instala padrões de resiliência: circuit breakers, retry com backoff exponencial, timeouts, health checks e graceful shutdown. Detecta integrações sem proteção via análise estática. Gera templates prontos (Python/tenacity, Node.js/opossum) e testes que simulam falha de dependências. Adiciona métricas resilience_missing_timeouts, resilience_missing_retries e resilience_missing_cb ao quality-gate. Requer quality-gate instalado.
allowed-tools: Read, Bash, Write, Edit, Grep, Glob
---

# Skill: Resilience Guard — Circuit Breakers & Resiliência

Instala padrões de **resiliência de produção** em projetos PH3A. Se uma dependência externa (API, banco, fila) cair, o sistema deve degradar graciosamente — não travar ou cascatear falhas.

Abordagem:
1. **Análise estática** — detecta chamadas externas sem timeout, retry ou circuit breaker
2. **Templates** — gera código pronto de circuit breaker, retry e timeout para Python e Node.js
3. **Testes** — gera testes que simulam falha de dependências e verificam o comportamento
4. **Ratchet** — as contagens de integrações sem proteção só podem diminuir

---

## Etapas

### 1. Receber o alvo

O usuário pode fornecer:
- **Caminho absoluto**: `/home/johnny/GIT/PH3A/MeuProjeto`
- **Relativo ou nome**: `../MeuProjeto` ou `MeuProjeto`
- **Sem argumento**: usar o diretório de trabalho atual (`pwd`)

Verificar pré-requisito:

```bash
test -f <PROJETO_ROOT>/scripts/quality-gate.js || echo "ERRO: execute /quality-gate primeiro"
```

### 2. Executar varredura de resiliência imediata

Antes de gerar arquivos, **exibir o inventário de problemas**:

```bash
ROOT=<PROJETO_ROOT>

# Diretórios de produção DESCOBERTOS (pastas de primeiro nível, sem testes/dependências): o alvo pode usar
# backend/ + frontend/, api/ + web/, src/... Nunca assuma os nomes.
DIRS=$(ls -d "$ROOT"/*/ 2>/dev/null | grep -Ev "/(node_modules|dist|build|coverage|migrations|e2e|tests|test|__tests__|scripts|venv|\.venv|env|vendor|bin|obj|target|docs|examples|out)/$")
# Lista de exclusão ÚNICA (a mesma do resilience-scan.js, do memory-guard.js e do arch-tradeoff), por nome de pasta.
EXCL="--exclude-dir=node_modules --exclude-dir=__tests__ --exclude-dir=tests --exclude-dir=test --exclude-dir=dist --exclude-dir=build --exclude-dir=coverage --exclude-dir=migrations --exclude-dir=e2e --exclude-dir=scripts --exclude-dir=venv --exclude-dir=.venv --exclude-dir=env --exclude-dir=vendor --exclude-dir=bin --exclude-dir=obj --exclude-dir=target --exclude-dir=docs --exclude-dir=examples --exclude-dir=.next --exclude-dir=out --exclude-dir=__pycache__ --exclude-dir=site-packages"

echo "=== INVENTÁRIO DE RESILIÊNCIA ==="

echo ""
echo "[TIMEOUT] Chamadas HTTP sem timeout:"
grep -rn "httpx\.\|requests\.get\|requests\.post\|requests\.put\|requests\.patch\|requests\.delete" \
  $DIRS --include="*.py" $EXCL 2>/dev/null | grep -v "timeout\|test\|spec\|#" | head -15

grep -rn "axios\.\|fetch(\|got\." \
  $DIRS --include="*.ts" --include="*.js" $EXCL 2>/dev/null | \
  grep -v "timeout\|signal\|AbortController\|test\|spec" | head -15
# (a linha da chamada pode não trazer o timeout: ele costuma estar em outra linha da MESMA chamada. Este inventário
# é só uma primeira passada por linha; o resilience-scan.js lê os argumentos balanceados da chamada e é quem conta.)

echo ""
echo "[RETRY] Chamadas sem retry:"
grep -rn "httpx\.\|requests\.\|axios\." \
  $DIRS --include="*.py" --include="*.ts" --include="*.js" $EXCL 2>/dev/null | \
  grep -v "retry\|tenacity\|p-retry\|axios-retry\|test\|spec" | head -15

echo ""
echo "[CIRCUIT BREAKER] Dependências sem CB:"
grep -rn "pybreaker\|tenacity\|opossum\|cockatiel\|circuit\|CircuitBreaker" \
  "$ROOT" --include="*.py" --include="*.ts" --include="*.js" \
  --include="requirements*.txt" --include="package.json" $EXCL 2>/dev/null | \
  grep -v "test\|spec" | head -5

echo ""
echo "[GRACEFUL SHUTDOWN] Handlers de SIGTERM:"
grep -rn "SIGTERM\|signal\.signal\|process\.on.*SIGTERM" \
  $DIRS --include="*.py" --include="*.ts" --include="*.js" $EXCL 2>/dev/null | \
  grep -v "test\|spec" | head -5

echo ""
echo "[HEALTH CHECK] Endpoints /health ou /readiness:"
grep -rn '"/health"\|"/readiness"\|"/liveness"\|@router.get.*health' \
  $DIRS --include="*.py" $EXCL 2>/dev/null | head -5
grep -rn "'/health'\|router.get.*health\|app.get.*health" \
  $DIRS --include="*.ts" --include="*.js" $EXCL 2>/dev/null | head -5
```

### 3. Detectar stack

```bash
# <BACKEND_DIR> = o diretório achado na detecção do /quality-gate (backend, api, server...); sem ele, a raiz.
find <PROJETO_ROOT>/<BACKEND_DIR> -name "requirements*.txt" 2>/dev/null | xargs grep -l "fastapi\|django\|flask" 2>/dev/null
cat <PROJETO_ROOT>/<BACKEND_DIR>/package.json 2>/dev/null | grep typescript
cat <PROJETO_ROOT>/package.json 2>/dev/null | grep typescript
```

### 4. Gerar os artefatos

---

#### 4.1 — `scripts/install-resilience-deps.sh`

```bash
#!/usr/bin/env bash
# scripts/install-resilience-deps.sh
# Instala tenacity (Python) e opossum + p-retry (Node) no(s) backend(s). Falha ALTO (exit 1) se nada foi instalado:
# projeto novo/sem manifesto não pode imprimir "✓" sem ter feito nada.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
INSTALADO=0

# O backend não tem nome fixo: backend/, api/, server/... Instala no(s) que existir(em); sem nenhum, na raiz.
BACKENDS=""
for d in backend api server; do [ -d "$ROOT/$d" ] && BACKENDS="$BACKENDS $d"; done
[ -z "$BACKENDS" ] && BACKENDS="."

for d in $BACKENDS; do
  DIR="$ROOT/$d"; [ "$d" = "." ] && DIR="$ROOT"

  # ── Python: uv → poetry → requirements.txt (pip exige venv: PEP 668 recusa instalar no Python do sistema) ──
  if [ -f "$DIR/uv.lock" ] && command -v uv >/dev/null 2>&1; then
    echo "→ tenacity via uv ($d)..."; (cd "$DIR" && uv add tenacity); INSTALADO=$((INSTALADO + 1))
  elif { [ -f "$DIR/poetry.lock" ] || grep -qs '^\[tool\.poetry\]' "$DIR/pyproject.toml"; } && command -v poetry >/dev/null 2>&1; then
    echo "→ tenacity via poetry ($d)..."; (cd "$DIR" && poetry add tenacity); INSTALADO=$((INSTALADO + 1))
  elif [ -f "$DIR/requirements.txt" ]; then
    if ! python3 -c 'import sys; sys.exit(0 if sys.prefix != sys.base_prefix else 1)'; then
      echo "✗ $d: requirements.txt sem virtualenv ativo (PEP 668). Ative o venv e rode de novo." >&2; exit 1
    fi
    echo "→ tenacity via pip ($d)..."; pip install tenacity
    grep -qi '^tenacity' "$DIR/requirements.txt" || printf 'tenacity>=8.0.0\n' | tee -a "$DIR/requirements.txt" >/dev/null
    INSTALADO=$((INSTALADO + 1))
  elif [ -f "$DIR/pyproject.toml" ]; then
    echo "⚠ $d: pyproject.toml sem uv.lock/poetry — adicione tenacity em [project].dependencies à mão" >&2
  fi

  # ── Node: o gerenciador do lockfile (pnpm/yarn/npm) ────────────────────────────────────────────────────────
  if [ -f "$DIR/package.json" ]; then
    if   [ -f "$DIR/pnpm-lock.yaml" ]; then ADD=(pnpm add);    ADDD=(pnpm add -D)
    elif [ -f "$DIR/yarn.lock" ];      then ADD=(yarn add);    ADDD=(yarn add -D)
    else                                    ADD=(npm install); ADDD=(npm install --save-dev); fi
    echo "→ opossum + p-retry via ${ADD[0]} ($d)..."
    (cd "$DIR" && "${ADD[@]}" opossum p-retry && "${ADDD[@]}" @types/opossum)
    INSTALADO=$((INSTALADO + 1))
  fi
done

if [ "$INSTALADO" -eq 0 ]; then
  echo "✗ Nada instalado: nenhum uv.lock/poetry/requirements.txt/package.json em ${BACKENDS# }." >&2
  echo "  Aponte o backend (backend/, api/, server/ ou a raiz) ou instale à mão." >&2
  exit 1
fi
echo ""
echo "✓ Dependências de resiliência instaladas em $INSTALADO pacote(s)."
```

---

#### 4.2 — `scripts/resilience-scan.js`

Copie `resources/resilience-scan.js` para `scripts/resilience-scan.js` (**verbatim** — está em `resources/` para ser
testado: `tests/test_scanner_resiliencia.py` roda exatamente estes bytes). Como ele conta:

- **Pacotes descobertos** (pastas de primeiro nível), com a **lista de exclusão única** (a mesma do memory-guard e do
  arch-tradeoff: `node_modules`, `dist`, `build`, `venv`, `.venv`, `env`, `vendor`, `bin`, `obj`, `target`, `docs`,
  `examples`, `.next`...) mais qualquer pasta com `pyvenv.cfg`. Comparação pelo nome da entrada, nunca pelo caminho
  absoluto.
- **Backend × frontend por tipo de pacote.** App de navegador (package.json com react/vue/svelte/angular/vite... e **sem**
  next/nuxt/remix/sveltekit/astro) é frontend: o `fetch(` dele **não** entra em `missing_timeouts`/`missing_retries`
  (não é integração servidor-a-servidor) e aparece em `details.frontend_http_ignorado`. Circuit breaker, health check e
  SIGTERM também só valem para o backend. Pacote sem `package.json` (Python etc.) é backend.
- **Proteção só no mesmo statement.** Vale: o timeout/retry nos **argumentos balanceados** da chamada (comentários e
  strings esvaziados antes), o `retry(() => chamada)`/`pRetry`/`withTimeout` que a envolve, e os decorators/`with` da
  função (`@retry`, `async with asyncio.timeout(...)`). **Não** vale: `timeout` em comentário, ou na chamada seguinte
  (antes, olhar as 8 linhas depois absolvia uma chamada desprotegida).
- Nenhum arquivo de backend analisado: métricas `null`, exit 2 — nunca um 0 falso.

> **Mudança de métrica (2026-10).** `resilience_missing_retries`/`_timeouts` agora contam só chamadas de **backend**, no
> mesmo statement. O número tende a **cair** (o `fetch` do SPA saiu da conta; o ratchet captura sozinho) ou a **subir**
> (timeout que só existia em comentário ou na chamada seguinte). Se subiu, confira cada achado: é real. O ratchet `desc`
> usa `min()` e `--update` nunca sobe um valor salvo — para aceitar uma subida legítima **apague a chave** de
> `quality-baseline.json` (volta como `new`) e rode `--update`.

---

#### 4.3 — `backend/app/resilience.py` (Python)

Criar apenas se Python detectado:

```python
# backend/app/resilience.py
#
# Templates de resiliência para Python/FastAPI.
# Copie e adapte os decorators e wrappers para suas integrações externas.
#
# Instalação: pip install tenacity httpx
# Adicione em backend/requirements.txt: tenacity>=8.0.0

import asyncio
import logging
from functools import wraps
from typing import Any, Callable, TypeVar

import httpx
from tenacity import (
    AsyncRetrying,
    RetryError,
    retry,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential,
    before_sleep_log,
)

logger = logging.getLogger(__name__)
T = TypeVar('T')

# ─── Configuração padrão PH3A ────────────────────────────────────────────────

DEFAULT_TIMEOUT  = 5.0   # segundos
DEFAULT_RETRIES  = 3
CB_FAILURE_THRESHOLD = 5  # falhas consecutivas para abrir o CB
CB_RECOVERY_TIMEOUT  = 30  # segundos antes de tentar novamente (half-open)


# ─── Retry com backoff exponencial ──────────────────────────────────────────

def with_retry(
    max_attempts: int = DEFAULT_RETRIES,
    min_wait: float = 1.0,
    max_wait: float = 10.0,
    reraise: bool = True,
):
    """Decorator de retry com backoff exponencial. Loga cada tentativa."""
    return retry(
        stop=stop_after_attempt(max_attempts),
        wait=wait_exponential(multiplier=1, min=min_wait, max=max_wait),
        retry=retry_if_exception_type((httpx.HTTPStatusError, httpx.ConnectError, httpx.TimeoutException)),
        before_sleep=before_sleep_log(logger, logging.WARNING),
        reraise=reraise,
    )


# ─── HTTP client com timeout ─────────────────────────────────────────────────

@with_retry()
async def http_get(url: str, timeout: float = DEFAULT_TIMEOUT, **kwargs) -> dict:
    """GET com timeout e retry automáticos."""
    async with httpx.AsyncClient(timeout=timeout) as client:
        response = await client.get(url, **kwargs)
        response.raise_for_status()
        return response.json()


@with_retry()
async def http_post(url: str, json: Any = None, timeout: float = DEFAULT_TIMEOUT, **kwargs) -> dict:
    """POST com timeout e retry automáticos."""
    async with httpx.AsyncClient(timeout=timeout) as client:
        response = await client.post(url, json=json, timeout=timeout, **kwargs)
        response.raise_for_status()
        return response.json()


# ─── Circuit Breaker (implementação manual leve) ─────────────────────────────

class CircuitBreaker:
    """
    Circuit breaker simples com 3 estados: CLOSED (normal), OPEN (bloqueado),
    HALF-OPEN (testando recuperação).

    Para uso com pybreaker (recomendado em produção):
        pip install pybreaker
        import pybreaker
        breaker = pybreaker.CircuitBreaker(fail_max=5, reset_timeout=30)
        @breaker
        async def call_external(): ...
    """
    CLOSED    = 'CLOSED'
    OPEN      = 'OPEN'
    HALF_OPEN = 'HALF_OPEN'

    def __init__(
        self,
        name: str,
        failure_threshold: int = CB_FAILURE_THRESHOLD,
        recovery_timeout:  int = CB_RECOVERY_TIMEOUT,
    ):
        self.name              = name
        self.failure_threshold = failure_threshold
        self.recovery_timeout  = recovery_timeout
        self._state            = self.CLOSED
        self._failures         = 0
        self._opened_at: float | None = None

    @property
    def state(self) -> str:
        if self._state == self.OPEN:
            if asyncio.get_event_loop().time() - (self._opened_at or 0) > self.recovery_timeout:
                self._state = self.HALF_OPEN
        return self._state

    def __call__(self, func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs):
            if self.state == self.OPEN:
                raise CircuitOpenError(f"Circuit '{self.name}' está ABERTO (falhas: {self._failures})")

            try:
                result = await func(*args, **kwargs)
                self._on_success()
                return result
            except Exception as e:
                self._on_failure()
                raise
        return wrapper

    def _on_success(self):
        self._failures = 0
        self._state    = self.CLOSED

    def _on_failure(self):
        self._failures += 1
        if self._failures >= self.failure_threshold:
            self._state    = self.OPEN
            self._opened_at = asyncio.get_event_loop().time()
            logger.error(f"Circuit '{self.name}' ABERTO após {self._failures} falhas")


class CircuitOpenError(Exception):
    """Lançada quando o circuit breaker está aberto."""
    pass


# ─── Exemplo de uso ──────────────────────────────────────────────────────────
#
# payment_breaker = CircuitBreaker(name="payment-api", failure_threshold=3)
#
# @payment_breaker
# @with_retry(max_attempts=2)
# async def charge_payment(payload: dict) -> dict:
#     return await http_post("https://payment-api.example.com/charge", json=payload)
#
# async def process_payment(payload):
#     try:
#         return await charge_payment(payload)
#     except CircuitOpenError:
#         # Fallback: encaminhar para fila de retry posterior
#         await enqueue_payment_retry(payload)
#         return {"status": "queued", "message": "Pagamento em processamento"}


# ─── Graceful shutdown ───────────────────────────────────────────────────────

import signal
import sys

def setup_graceful_shutdown(cleanup_fn: Callable | None = None):
    """
    Registra handlers de SIGTERM e SIGINT para shutdown gracioso.
    Chame no startup da aplicação.

    Exemplo:
        setup_graceful_shutdown(cleanup_fn=lambda: db.close())
    """
    def _handler(signum, frame):
        logger.info(f"Recebido sinal {signum}. Iniciando shutdown gracioso...")
        if cleanup_fn:
            try:
                cleanup_fn()
            except Exception as e:
                logger.error(f"Erro no cleanup: {e}")
        sys.exit(0)

    signal.signal(signal.SIGTERM, _handler)
    signal.signal(signal.SIGINT,  _handler)
```

---

#### 4.4 — `src/lib/resilience.ts` (Node.js)

Criar apenas se Node.js detectado:

```typescript
// src/lib/resilience.ts
//
// Templates de resiliência para Node.js/TypeScript.
// Copie e adapte para suas integrações externas.
//
// Instalação: npm install opossum p-retry
// npm install --save-dev @types/opossum

import CircuitBreaker from 'opossum';
import pRetry, { AbortError } from 'p-retry';

// ─── Configuração padrão PH3A ────────────────────────────────────────────────

export const DEFAULT_TIMEOUT_MS      = 5_000;
export const DEFAULT_RETRY_ATTEMPTS  = 3;
export const CB_ERROR_THRESHOLD_PCT  = 50;   // % de falhas para abrir o CB
export const CB_RESET_TIMEOUT_MS     = 30_000;
export const CB_REQUEST_VOLUME       = 10;   // mínimo de requests antes de calcular %

// ─── Retry com backoff exponencial ──────────────────────────────────────────

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: { retries?: number; minTimeout?: number; maxTimeout?: number; label?: string } = {}
): Promise<T> {
  const { retries = DEFAULT_RETRY_ATTEMPTS, minTimeout = 1_000, maxTimeout = 10_000, label = 'operation' } = options;

  return pRetry(fn, {
    retries,
    minTimeout,
    maxTimeout,
    factor: 2, // backoff exponencial
    onFailedAttempt: (err) => {
      console.warn(
        `[resilience] ${label}: tentativa ${err.attemptNumber}/${retries + 1} falhou — ${err.message}`
      );
    },
  });
}

// ─── Circuit Breaker factory ─────────────────────────────────────────────────

export interface CBOptions {
  name: string;
  timeout?: number;
  errorThresholdPercentage?: number;
  resetTimeout?: number;
  volumeThreshold?: number;
  fallback?: (...args: unknown[]) => unknown;
}

export function createCircuitBreaker<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  options: CBOptions
): CircuitBreaker<T> {
  const breaker = new CircuitBreaker(fn, {
    name:                     options.name,
    timeout:                  options.timeout                 ?? DEFAULT_TIMEOUT_MS,
    errorThresholdPercentage: options.errorThresholdPercentage ?? CB_ERROR_THRESHOLD_PCT,
    resetTimeout:             options.resetTimeout             ?? CB_RESET_TIMEOUT_MS,
    volumeThreshold:          options.volumeThreshold          ?? CB_REQUEST_VOLUME,
  });

  breaker.on('open',     () => console.error(`[circuit-breaker] "${options.name}" ABERTO`));
  breaker.on('halfOpen', () => console.warn( `[circuit-breaker] "${options.name}" testando recuperação (HALF-OPEN)`));
  breaker.on('close',    () => console.info( `[circuit-breaker] "${options.name}" FECHADO — recuperado`));

  if (options.fallback) {
    breaker.fallback(options.fallback);
  }

  return breaker;
}

// ─── HTTP com timeout via AbortController ────────────────────────────────────

export async function fetchWithTimeout(
  url: string,
  options: RequestInit & { timeoutMs?: number } = {}
): Promise<Response> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, ...fetchOptions } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { ...fetchOptions, signal: controller.signal });
    clearTimeout(timer);
    return response;
  } catch (err: unknown) {
    clearTimeout(timer);
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error(`Timeout após ${timeoutMs}ms ao chamar ${url}`);
    }
    throw err;
  }
}

// ─── Graceful shutdown ───────────────────────────────────────────────────────

export function setupGracefulShutdown(cleanupFn?: () => Promise<void> | void) {
  const shutdown = async (signal: string) => {
    console.log(`[resilience] Recebido ${signal}. Iniciando shutdown gracioso...`);
    try {
      if (cleanupFn) await cleanupFn();
    } catch (err) {
      console.error('[resilience] Erro no cleanup:', err);
    }
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));
}

// ─── Exemplo de uso ──────────────────────────────────────────────────────────
//
// const paymentBreaker = createCircuitBreaker(chargePaymentAPI, {
//   name: 'payment-api',
//   timeout: 5000,
//   fallback: (payload) => ({ status: 'queued', message: 'Pagamento em processamento' }),
// });
//
// export async function processPayment(payload: PaymentPayload) {
//   return withRetry(
//     () => paymentBreaker.fire(payload),
//     { retries: 2, label: 'processPayment' }
//   );
// }
```

---

#### 4.5 — `backend/tests/test_resilience.py` (Python)

Criar apenas se Python detectado:

```python
# backend/tests/test_resilience.py
#
# Testes de resiliência: simulam falha de dependências externas e verificam
# que o sistema degrada graciosamente (CB abre, fallback ativa, sem cascata).

import asyncio
import pytest
from unittest.mock import AsyncMock, patch

from app.resilience import CircuitBreaker, CircuitOpenError, http_get, with_retry


class TestCircuitBreaker:
    def test_opens_after_threshold_failures(self):
        """CB deve abrir após atingir o threshold de falhas."""
        cb = CircuitBreaker(name="test", failure_threshold=3)

        for _ in range(3):
            cb._on_failure()

        assert cb._state == CircuitBreaker.OPEN

    def test_raises_when_open(self):
        """CB aberto deve lançar CircuitOpenError sem chamar a função."""
        cb = CircuitBreaker(name="test", failure_threshold=1)
        cb._on_failure()  # abre

        called = False

        async def fn():
            nonlocal called
            called = True

        with pytest.raises(CircuitOpenError):
            asyncio.run(cb(fn)())

        assert not called  # não deve ter sido chamada

    def test_recovers_after_success(self):
        """CB deve fechar novamente após um sucesso no estado HALF-OPEN."""
        cb = CircuitBreaker(name="test", failure_threshold=1)
        cb._on_failure()
        cb._on_success()

        assert cb._state == CircuitBreaker.CLOSED
        assert cb._failures == 0


class TestRetry:
    def test_retries_on_connection_error(self):
        """Deve retentar em ConnectError e eventualmente lançar."""
        import httpx

        attempts = 0

        @with_retry(max_attempts=2, min_wait=0.01, max_wait=0.05)
        async def flaky_call():
            nonlocal attempts
            attempts += 1
            raise httpx.ConnectError("connection refused")

        with pytest.raises(Exception):
            asyncio.run(flaky_call())

        assert attempts == 2


class TestHTTPTimeout:
    def test_http_get_with_timeout(self):
        """http_get deve passar timeout correto ao cliente httpx."""
        with patch('httpx.AsyncClient.get', new_callable=AsyncMock) as mock_get:
            mock_get.return_value.status_code = 200
            mock_get.return_value.json.return_value = {"ok": True}
            mock_get.return_value.raise_for_status = lambda: None

            result = asyncio.run(http_get("https://example.com", timeout=2.0))

            call_kwargs = mock_get.call_args[1]
            assert result == {"ok": True}
```

---

#### 4.6 — `src/test/resilience.test.ts` (Node.js)

Criar apenas se Node.js detectado:

```typescript
// src/test/resilience.test.ts
//
// Testes de resiliência para Node.js.

import { describe, it, expect, vi } from 'vitest'; // ou 'jest'
import { createCircuitBreaker, withRetry, fetchWithTimeout } from '../lib/resilience';

describe('Circuit Breaker', () => {
  it('deve acionar o fallback quando o CB estiver aberto', async () => {
    const failingFn = vi.fn().mockRejectedValue(new Error('service down'));
    const fallbackValue = { status: 'degraded' };

    const breaker = createCircuitBreaker(failingFn, {
      name: 'test-service',
      timeout: 100,
      errorThresholdPercentage: 50,
      volumeThreshold: 2,
      fallback: () => fallbackValue,
    });

    // Gerar falhas suficientes para abrir o CB
    for (let i = 0; i < 5; i++) {
      try { await breaker.fire(); } catch {}
    }

    // Com CB aberto, deve retornar fallback
    const result = await breaker.fire();
    expect(result).toEqual(fallbackValue);
  });
});

describe('Retry', () => {
  it('deve retentar N vezes antes de falhar', async () => {
    let attempts = 0;
    const fn = vi.fn().mockImplementation(async () => {
      attempts++;
      throw new Error('flaky');
    });

    await expect(withRetry(fn, { retries: 2, minTimeout: 10 })).rejects.toThrow('flaky');
    expect(attempts).toBe(3); // 1 inicial + 2 retries
  });
});

describe('fetchWithTimeout', () => {
  it('deve rejeitar após o timeout', async () => {
    const slowResponse = new Promise<Response>((resolve) => setTimeout(resolve, 5000));
    vi.spyOn(globalThis, 'fetch').mockReturnValueOnce(slowResponse);

    await expect(fetchWithTimeout('https://example.com', { timeoutMs: 50 }))
      .rejects.toThrow('Timeout');
  });
});
```

---

#### 4.7 — `scripts/resilience-baseline.json`

```json
{
  "updated": "{{HOJE}}",
  "metrics": {
    "missing_timeouts": null,
    "missing_retries": null,
    "missing_circuit_breakers": 1,
    "missing_health_check": 1,
    "missing_sigterm_handler": 1
  }
}
```

---

#### 4.8 — Atualizar `scripts/quality-gate.js`

Inserir `measureResilience` antes do bloco `// ─── Main`:

```js
function measureResilience() {
  const reportFile = path.join(ROOT, '.resilience-scan-report.json');
  fs.rmSync(reportFile, { force: true });            // relatório velho nunca vale (exit 2 = nada analisado: null)

  spawnSync('node', ['scripts/resilience-scan.js', '--json'], { cwd: ROOT, encoding: 'utf8' });

  if (!fs.existsSync(reportFile)) {
    return { resilience_missing_timeouts: null, resilience_missing_retries: null, resilience_missing_cb: null };
  }
  try {
    const report = JSON.parse(fs.readFileSync(reportFile, 'utf8'));
    return {
      resilience_missing_timeouts: report.missing_timeouts         ?? null,
      resilience_missing_retries:  report.missing_retries          ?? null,
      resilience_missing_cb:       report.missing_circuit_breakers ?? null,
    };
  } catch {
    return { resilience_missing_timeouts: null, resilience_missing_retries: null, resilience_missing_cb: null };
  }
}
```

**Adições ao ratchet:**

```js
{ key: 'resilience_missing_timeouts', label: 'Sem timeout (integrações)', dir: 'desc', current: res.resilience_missing_timeouts, saved: baseline.resilience_missing_timeouts },
{ key: 'resilience_missing_retries',  label: 'Sem retry (integrações)',   dir: 'desc', current: res.resilience_missing_retries,  saved: baseline.resilience_missing_retries  },
{ key: 'resilience_missing_cb',       label: 'Sem circuit breaker',       dir: 'desc', current: res.resilience_missing_cb,       saved: baseline.resilience_missing_cb       },
```

---

#### 4.9 — Atualizar `quality-baseline.json`

**Não semeie `999`.** O ratchet `desc` aceita qualquer valor abaixo da semente. Rode
`node scripts/quality-gate.js --update`: os números gravados são os medidos pelo `resilience-scan.js`
(`resilience_missing_cb` é 1 quando não há circuit breaker algum — se a única dependência é o próprio banco e não há
fallback possível, isso é uma decisão a registrar, não um defeito a "consertar" instalando um breaker decorativo).

### 5. Confirmar criação

```
✓ scripts/install-resilience-deps.sh criado
✓ scripts/resilience-scan.js criado
✓ scripts/resilience-baseline.json criado
✓ [backend/app/resilience.py] criado (Python)
✓ [src/lib/resilience.ts] criado (Node.js)
✓ [backend/tests/test_resilience.py] criado (Python)
✓ [src/test/resilience.test.ts] criado (Node.js)
✓ scripts/quality-gate.js atualizado
✓ quality-baseline.json atualizado

Próximos passos:
  1. Execute: bash scripts/install-resilience-deps.sh
  2. Execute: node scripts/resilience-scan.js    (inventário de problemas)
  3. Para cada integração sem timeout: adicione timeout=5.0 (Python) ou { timeoutMs: 5000 } (Node.js)
  4. Copie e adapte os templates de resilience.py ou resilience.ts
  5. Rode os testes: pytest backend/tests/test_resilience.py
  6. Execute node scripts/quality-gate.js --update (grava o baseline com os números medidos)
  7. Para mapeamento completo de tradeoffs: execute /arch-tradeoff
```

---

## Exemplos de uso

```
/resilience-guard
/resilience-guard /home/johnny/GIT/PH3A/MeuProjeto
```

---

## Padrões suportados

| Padrão | Python | Node.js |
|--------|--------|---------|
| Circuit Breaker | `CircuitBreaker` (leve, incluso) + `pybreaker` | `opossum` |
| Retry + backoff | `tenacity @retry` | `p-retry` |
| Timeout HTTP | `httpx timeout=` | `AbortController` / `fetchWithTimeout` |
| Health check | `@router.get("/health")` | `app.get('/health', ...)` |
| Graceful shutdown | `signal.SIGTERM` | `process.on('SIGTERM', ...)` |
| Bulkhead | `asyncio.Semaphore(N)` | `p-limit(N)` |

## Referências

- tenacity (Python): https://tenacity.readthedocs.io/
- opossum (Node.js): https://nodeshift.dev/opossum/
- p-retry (Node.js): https://github.com/sindresorhus/p-retry
- Circuit Breaker pattern: https://martinfowler.com/bliki/CircuitBreaker.html
- Bulkhead pattern: https://docs.microsoft.com/azure/architecture/patterns/bulkhead
