---
name: property-race-guard
description: Instala property-based testing (Hypothesis para Python, fast-check para Node.js/TypeScript) com foco em detectar race conditions em código assíncrono. Gera templates com padrões prontos (concurrent writes, TOCTOU, idempotência). Adiciona métrica property_tests_count ao ratchet do quality-gate — nunca pode diminuir. Requer quality-gate instalado.
allowed-tools: Read, Bash, Write, Edit, Grep, Glob
---

# Skill: Property Race Guard — Property-Based Testing & Race Conditions

Instala **property-based testing** com foco em race conditions em projetos PH3A. Usa `hypothesis` (Python) e `fast-check` (TypeScript/Node.js) para gerar automaticamente casos de teste que exploram estados concorrentes impossíveis de prever com testes unitários tradicionais.

O ratchet garante que `property_tests_count` nunca diminui — removendo um property test é uma regressão detectada no CI.

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

### 2. Detectar stack

```bash
# Python
# <BACKEND_DIR>/<FRONTEND_DIR> = os diretórios achados na detecção do /quality-gate (backend|api|server,
# frontend|web|client...) — não assuma os nomes. Sem eles, a raiz.
find <PROJETO_ROOT>/<BACKEND_DIR> -name "requirements*.txt" 2>/dev/null | xargs grep -l "fastapi\|django\|flask" 2>/dev/null
find <PROJETO_ROOT>/<BACKEND_DIR> -name "*.py" -maxdepth 3 2>/dev/null | head -3

# Node.js / TypeScript
cat <PROJETO_ROOT>/<BACKEND_DIR>/package.json 2>/dev/null | grep -E "\"typescript\"|\"ts-node\"|\"jest\"|\"vitest\""
cat <PROJETO_ROOT>/<FRONTEND_DIR>/package.json 2>/dev/null | grep -E "\"vitest\"|\"jest\""
cat <PROJETO_ROOT>/package.json 2>/dev/null | grep -E "\"vitest\"|\"jest\""

# Hypothesis já instalado?
find <PROJETO_ROOT> -name "requirements*.txt" | xargs grep "hypothesis" 2>/dev/null

# fast-check já instalado? (em qualquer pacote)
find <PROJETO_ROOT> -name package.json -not -path "*/node_modules/*" | xargs grep -l "fast-check" 2>/dev/null
```

### 3. Gerar os artefatos

---

#### 3.1 — `scripts/install-property-deps.sh`

```bash
#!/usr/bin/env bash
# scripts/install-property-deps.sh
# Garante o fast-check / Hypothesis SÓ onde há (ou haverá) testes de propriedade — nunca em todo pacote.
# Pacotes Node: os que já têm uma pasta property/ ou os nomeados em PACOTES="api web". Idempotente.
# Python: uv → poetry → requirements.txt (pip exige venv: PEP 668). Falha ALTO (exit 1) se não deixou NADA pronto:
# projeto novo, sem pasta property/ nem PACOTES, não pode imprimir "✓" sem ter feito nada.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PRONTOS=0   # pacotes com a dependência instalada agora OU que já a declaravam
EXCL=( -not -path '*/node_modules/*' -not -path '*/venv/*' -not -path '*/.venv/*' -not -path '*/env/*' \
       -not -path '*/vendor/*' -not -path '*/site-packages/*' -not -path '*/dist/*' -not -path '*/build/*' \
       -not -path '*/target/*' -not -path '*/.git/*' )

# ── Python ────────────────────────────────────────────────────────────────────
while IFS= read -r DIR; do
  NOME="$(basename "$DIR")"
  if grep -qis 'hypothesis' "$DIR"/requirements*.txt "$DIR/pyproject.toml"; then
    echo "✓ $NOME: hypothesis já declarado"; PRONTOS=$((PRONTOS + 1))
  elif [ -f "$DIR/uv.lock" ] && command -v uv >/dev/null 2>&1; then
    (cd "$DIR" && uv add --dev hypothesis anyio pytest-anyio); PRONTOS=$((PRONTOS + 1))
  elif { [ -f "$DIR/poetry.lock" ] || grep -qs '^\[tool\.poetry\]' "$DIR/pyproject.toml"; } && command -v poetry >/dev/null 2>&1; then
    (cd "$DIR" && poetry add --group dev hypothesis anyio pytest-anyio); PRONTOS=$((PRONTOS + 1))
  elif [ -f "$DIR/requirements.txt" ]; then
    if ! python3 -c 'import sys; sys.exit(0 if sys.prefix != sys.base_prefix else 1)'; then
      echo "✗ $NOME: requirements.txt sem virtualenv ativo (PEP 668). Ative o venv e rode de novo." >&2; exit 1
    fi
    echo "→ Instalando Hypothesis + anyio ($NOME)..."
    pip install hypothesis anyio pytest-anyio 2>/dev/null || pip install hypothesis anyio pytest-asyncio
    printf 'hypothesis\n' | tee -a "$DIR/requirements.txt" >/dev/null
    PRONTOS=$((PRONTOS + 1))
  else
    echo "⚠ $NOME: sem uv.lock/poetry/requirements.txt — adicione hypothesis à mão" >&2
  fi
done < <(find "$ROOT" -maxdepth 3 \( -name 'requirements*.txt' -o -name pyproject.toml \) "${EXCL[@]}" -exec dirname {} \; | sort -u)

# ── Node.js ───────────────────────────────────────────────────────────────────
while IFS= read -r PKG; do
  NOME="$(basename "$PKG")"
  TEM_PROPERTY="$(find "$PKG" -type d -name property "${EXCL[@]}" | head -1)"
  if [ -z "$TEM_PROPERTY" ] && ! echo " ${PACOTES:-} " | grep -q " $NOME "; then continue; fi
  if grep -q '"fast-check"' "$PKG/package.json"; then
    echo "✓ $NOME: fast-check já instalado"
  elif [ -f "$PKG/pnpm-lock.yaml" ]; then
    (cd "$PKG" && pnpm add -D fast-check)
  elif [ -f "$PKG/yarn.lock" ]; then
    (cd "$PKG" && yarn add -D fast-check)
  else
    (cd "$PKG" && npm install --save-dev fast-check)
  fi
  PRONTOS=$((PRONTOS + 1))
done < <(find "$ROOT" -maxdepth 2 -name package.json "${EXCL[@]}" -exec dirname {} \;)

if [ "$PRONTOS" -eq 0 ]; then
  echo "✗ Nada instalado: nenhum pacote Python (requirements/pyproject) nem pacote Node com pasta property/." >&2
  echo "  Crie <pacote>/src/__tests__/property/ ou nomeie o pacote: PACOTES=\"api\" bash scripts/install-property-deps.sh" >&2
  exit 1
fi
echo ""
echo "✓ Dependências de property-based testing prontas em $PRONTOS pacote(s)."
```

---

#### 3.2 — `scripts/race-guard.sh`

```bash
#!/usr/bin/env bash
# scripts/race-guard.sh
# Executa os property tests (Hypothesis em Python, fast-check em Node) de QUALQUER pacote e exibe a contagem.
# Falha (exit 1) se nenhum property test for encontrado.
#
# Os diretórios de teste de propriedade são DESCOBERTOS (qualquer pasta `property/` fora de node_modules, venvs e
# build): backend/tests/property, api/src/__tests__/property, src/test/property... — nunca uma lista fixa.
# Uma mesma pasta pode ter Python E TypeScript: os dois rodam. O gerenciador Node é o do lockfile (pnpm/yarn/npm).
# Property tests que tocam banco exigem o banco de teste de pé antes.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
FOUND=0
EXCL=( -not -path '*/node_modules/*' -not -path '*/venv/*' -not -path '*/.venv/*' -not -path '*/env/*' \
       -not -path '*/vendor/*' -not -path '*/site-packages/*' -not -path '*/dist/*' -not -path '*/build/*' \
       -not -path '*/target/*' -not -path '*/.git/*' )

while IFS= read -r DIR; do
  REL="${DIR#"$ROOT"/}"
  if grep -rq "@given" "$DIR" --include='*.py' 2>/dev/null; then
    echo "→ Rodando property tests Python (Hypothesis) em $REL..."
    python3 -m pytest "$DIR" -q --tb=short 2>&1 | tail -20
    COUNT=$(grep -r "@given" "$DIR" --include='*.py' 2>/dev/null | wc -l | tr -d ' ')
    echo "  Encontrados: $COUNT testes @given"
    FOUND=$((FOUND + COUNT))
  fi
  if grep -rq "fc\.assert" "$DIR" --include='*.ts' --include='*.js' 2>/dev/null; then
    # O pacote é o diretório com package.json mais próximo acima do diretório de propriedade.
    PKG="$DIR"
    while [ "$PKG" != "$ROOT" ] && [ ! -f "$PKG/package.json" ]; do PKG="$(dirname "$PKG")"; done
    if   [ -f "$PKG/pnpm-lock.yaml" ]; then PM=(pnpm run --silent)
    elif [ -f "$PKG/yarn.lock" ];      then PM=(yarn --silent)
    else                                    PM=(npm run --silent); fi
    echo "→ Rodando property tests Node (fast-check) em $REL com ${PM[0]}..."
    if grep -q '"test:property"' "$PKG/package.json"; then
      (cd "$PKG" && "${PM[@]}" test:property 2>&1 | tail -20)
    else
      (cd "$PKG" && npx --no-install vitest run "$DIR" 2>&1 | tail -20) || \
      (cd "$PKG" && npx --no-install jest "$DIR" 2>&1 | tail -20) || \
      { echo "✗ $REL: sem script test:property e sem vitest/jest utilizável" >&2; exit 1; }
    fi
    COUNT=$(grep -r "fc\.assert" "$DIR" --include='*.ts' --include='*.js' 2>/dev/null | wc -l | tr -d ' ')
    echo "  Encontrados: $COUNT fc.assert"
    FOUND=$((FOUND + COUNT))
  fi
done < <(find "$ROOT" -type d -name property "${EXCL[@]}")

echo ""
if [ "$FOUND" -eq 0 ]; then
  echo "⚠  Nenhum property test encontrado."
  echo "   Adicione testes em uma pasta property/ do pacote (ex.: <pacote>/src/__tests__/property/)."
  exit 1
fi

echo "✓ Race Guard: $FOUND property tests executados"
```

---

#### 3.3 — `backend/tests/property/conftest_property.py` (Python)

Criar apenas se Python detectado:

```python
# backend/tests/property/conftest_property.py
#
# Configuração global de Hypothesis para property tests PH3A.
# Define perfil "ci" (menos exemplos, deadline desativado) e "dev" (mais exemplos).

import pytest
from hypothesis import HealthCheck, Phase, settings

# Perfil padrão para CI
settings.register_profile(
    "ci",
    max_examples=100,
    deadline=None,
    suppress_health_check=[HealthCheck.too_slow, HealthCheck.data_too_large],
    phases=[Phase.explicit, Phase.reuse, Phase.generate, Phase.shrink],
)

# Perfil para desenvolvimento local (mais exploratório)
settings.register_profile(
    "dev",
    max_examples=500,
    deadline=None,
    suppress_health_check=list(HealthCheck),
)

# Ativa perfil CI por padrão (sobreposto por HYPOTHESIS_PROFILE=dev)
settings.load_profile("ci")


@pytest.fixture
def anyio_backend():
    """Backend anyio para testes async com Hypothesis."""
    return "asyncio"
```

---

#### 3.4 — `backend/tests/property/test_race_template.py` (Python)

Criar apenas se Python detectado:

```python
# backend/tests/property/test_race_template.py
#
# Templates de property-based tests para race conditions.
# ADAPTE para as entidades e funções do seu projeto.
# Remova o prefixo "template_" dos nomes para ativar os testes.

import asyncio
from hypothesis import given, settings
from hypothesis import strategies as st
import pytest


# ─── Padrão 1: Invariante de domínio ────────────────────────────────────────
#
# Garante que uma invariante se mantém para qualquer entrada válida.
# Ex: saldo nunca pode ficar negativo após N transações válidas.

@given(st.lists(st.integers(min_value=1, max_value=10_000), min_size=1, max_size=20))
@settings(max_examples=200, deadline=None)
def template_invariant_balance_never_negative(amounts: list[int]):
    """Substitua pela sua lógica de domínio."""
    # from app.services.finance import apply_transactions, get_balance
    # apply_transactions(amounts)
    # assert get_balance() >= 0
    pass


# ─── Padrão 2: Concurrent writes sem race condition ──────────────────────────
#
# Verifica que N operações concorrentes resultam no estado correto,
# independentemente da ordem de execução (asyncio.gather).

@given(st.lists(st.integers(min_value=1, max_value=1_000), min_size=2, max_size=10))
@settings(max_examples=100, deadline=None)
def template_concurrent_counter_no_race(increments: list[int]):
    """
    Substitua reset_counter / increment_counter / get_counter
    pelas suas funções de estado compartilhado.
    """
    async def run():
        # await reset_counter()
        # await asyncio.gather(*[increment_counter(n) for n in increments])
        # result = await get_counter()
        # assert result == sum(increments), f"Race condition: {result} != {sum(increments)}"
        assert sum(increments) == sum(increments)  # placeholder

    asyncio.run(run())


# ─── Padrão 3: TOCTOU (Time-of-check-to-time-of-use) ────────────────────────
#
# Verifica que verificação de condição e uso do recurso são atômicos.
# Ex: verificar saldo suficiente e depois debitar.

@given(
    initial_balance=st.integers(min_value=0, max_value=10_000),
    debit_amounts=st.lists(st.integers(min_value=1, max_value=500), min_size=2, max_size=5),
)
@settings(max_examples=100, deadline=None)
def template_toctou_debit_atomic(initial_balance: int, debit_amounts: list[int]):
    """
    Verifica que débitos concorrentes nunca resultam em saldo negativo
    quando o saldo inicial é insuficiente para cobrir todos.
    """
    async def run():
        total_debit = sum(debit_amounts)
        # Se saldo < total, nem todos devem ser aprovados
        if initial_balance < total_debit:
            # await set_balance(initial_balance)
            # results = await asyncio.gather(
            #     *[try_debit(a) for a in debit_amounts],
            #     return_exceptions=True
            # )
            # final = await get_balance()
            # assert final >= 0, f"Saldo negativo detectado: {final}"
            pass

    asyncio.run(run())


# ─── Padrão 4: Idempotência ──────────────────────────────────────────────────
#
# Verifica que executar a operação N vezes == executar 1 vez.

@given(
    payload=st.fixed_dictionaries({
        'id': st.integers(min_value=1, max_value=9999),
        'value': st.text(min_size=1, max_size=50),
    }),
    repeat=st.integers(min_value=1, max_value=5),
)
@settings(max_examples=100, deadline=None)
def template_idempotent_upsert(payload: dict, repeat: int):
    """
    Verifica que criar/atualizar o mesmo recurso N vezes
    resulta no mesmo estado que fazer 1 vez.
    """
    async def run():
        results = []
        for _ in range(repeat):
            # result = await upsert_resource(payload)
            # results.append(result)
            results.append(payload)
        # Todos os resultados devem ser idênticos
        assert all(r == results[0] for r in results), "Operação não é idempotente"

    asyncio.run(run())
```

---

#### 3.5 — `<pacote>/src/test/property/setup-property.ts` (Node.js)

Criar apenas se Node.js detectado:

```typescript
// src/test/property/setup-property.ts
//
// Configuração global de fast-check para property tests PH3A.
// Importar no topo dos arquivos de property test.

import * as fc from 'fast-check';

// Configuração global: seed fixo para reprodutibilidade em CI
fc.configureGlobal({
  numRuns: 100,
  seed: 42,
  // Aumentar para dev: numRuns: 500
  verbose: process.env.FC_VERBOSE === '1' ? fc.VerbosityLevel.Verbose : fc.VerbosityLevel.None,
});

export { fc };

// ─── Helpers reutilizáveis ───────────────────────────────────────────────────

/** Gera uma lista de valores únicos a partir de um arbitrary */
export function uniqueList<T>(arb: fc.Arbitrary<T>, { min = 1, max = 10 } = {}) {
  return fc.array(arb, { minLength: min, maxLength: max }).filter(
    (arr) => new Set(arr).size === arr.length
  );
}

/** Arbitrary para IDs numéricos positivos */
export const positiveId = fc.integer({ min: 1, max: 999_999 });

/** Arbitrary para valores monetários (centavos) */
export const monetaryAmount = fc.integer({ min: 1, max: 1_000_000 });

/** Arbitrary para listas de valores monetários */
export const monetaryAmounts = (min = 2, max = 10) =>
  fc.array(monetaryAmount, { minLength: min, maxLength: max });
```

---

#### 3.6 — `<pacote>/src/test/property/race-conditions.test.ts` (Node.js)

Criar apenas se Node.js detectado:

```typescript
// src/test/property/race-conditions.test.ts
//
// Templates de property tests para race conditions com fast-check.
// ADAPTE para as funções do seu projeto.
// Remova o `.skip` dos describe/it para ativar os testes.

import { describe, it, expect } from 'vitest'; // ou 'jest' conforme o projeto
import * as fc from 'fast-check';
import { monetaryAmounts } from './setup-property';

// ─── Padrão 1: Concurrent writes — fc.scheduler ───────────────────────────
//
// fc.scheduler() simula todos os orderings possíveis de Promises.
// Se seu código depende de ordem, o scheduler vai encontrar o caso que quebra.

describe.skip('Concurrent writes — counter', () => {
  it('contador deve ser exato independente do interleaving', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.scheduler(),
        monetaryAmounts(2, 8),
        async (scheduler, amounts) => {
          // Substitua por suas funções reais:
          // await resetCounter();
          // const tasks = amounts.map((n) =>
          //   scheduler.schedule(Promise.resolve().then(() => incrementCounter(n)))
          // );
          // await scheduler.waitAll();
          // expect(await getCounter()).toBe(amounts.reduce((a, b) => a + b, 0));
          expect(amounts.reduce((a, b) => a + b, 0)).toBeGreaterThan(0); // placeholder
        }
      )
    );
  });
});

// ─── Padrão 2: TOCTOU — débito concorrente ────────────────────────────────

describe.skip('TOCTOU — débito concorrente', () => {
  it('saldo nunca deve ficar negativo com débitos concorrentes', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.scheduler(),
        fc.integer({ min: 100, max: 10_000 }),
        monetaryAmounts(2, 6),
        async (scheduler, initialBalance, debits) => {
          // await setBalance(initialBalance);
          // const tasks = debits.map((amount) =>
          //   scheduler.schedule(
          //     Promise.resolve().then(() => tryDebit(amount))
          //   )
          // );
          // await scheduler.waitAll();
          // const finalBalance = await getBalance();
          // expect(finalBalance).toBeGreaterThanOrEqual(0);
          expect(initialBalance).toBeGreaterThan(0); // placeholder
        }
      )
    );
  });
});

// ─── Padrão 3: Idempotência ───────────────────────────────────────────────

describe.skip('Idempotência — upsert', () => {
  it('executar upsert N vezes deve resultar no mesmo estado', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          id: fc.integer({ min: 1, max: 9999 }),
          value: fc.string({ minLength: 1, maxLength: 50 }),
        }),
        fc.integer({ min: 1, max: 5 }),
        async (payload, repeat) => {
          const results = await Promise.all(
            Array.from({ length: repeat }, async () => {
              // return upsertResource(payload);
              return payload; // placeholder
            })
          );
          expect(results.every((r) => JSON.stringify(r) === JSON.stringify(results[0]))).toBe(true);
        }
      )
    );
  });
});

// ─── Padrão 4: Invariante de domínio ─────────────────────────────────────

describe.skip('Invariante de domínio', () => {
  it('invariante deve se manter para qualquer entrada válida', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 1, max: 1000 }), { minLength: 1 }),
        (items) => {
          // Substitua pela sua invariante de domínio
          // const result = processItems(items);
          // expect(result).toSatisfy(isValid);
          expect(items.length).toBeGreaterThan(0); // placeholder
        }
      )
    );
  });
});
```

---

#### 3.7 — Atualizar `scripts/quality-gate.js`

Inserir `measurePropertyTests` antes do bloco `// ─── Main`:

```js
function measurePropertyTests() {
  // Conta @given (Python) e fc.assert (Node) em QUALQUER pasta `property/` do projeto — a lista de diretórios não é
  // fixa (backend/tests/property, api/src/__tests__/property, src/test/property...). Uma lista fixa devolve 0 para
  // quem usa outra estrutura, e 0 é o piso do ratchet: o gate passa verde sem olhar nada.
  const IGNORADOS = new Set(['node_modules', 'dist', 'build', 'target', 'venv', '.venv', 'env', 'vendor', 'bin', 'obj',
    'site-packages', '__pycache__', 'out', '.next', '.git']);
  let count = 0;
  const visita = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      // Dependências e venvs NUNCA entram: um `@given` dentro de site-packages inflaria o piso do ratchet (asc).
      if (IGNORADOS.has(e.name) || e.name.startsWith('.')) continue;
      const p = path.join(dir, e.name);
      if (e.isDirectory()) { if (!fs.existsSync(path.join(p, 'pyvenv.cfg'))) visita(p); }
      else if (/[\\/]property[\\/]/.test(path.relative(ROOT, p))) {
        const texto = fs.readFileSync(p, 'utf8');
        if (/\.py$/.test(e.name)) count += (texto.match(/@given/g) ?? []).length;
        else if (/\.(ts|js)$/.test(e.name)) count += (texto.match(/fc\.assert/g) ?? []).length;
      }
    }
  };
  visita(ROOT);
  return { property_tests_count: count };
}
```

**Adições ao ratchet no main:**

```js
{ key: 'property_tests_count', label: 'Property tests (PBT)', dir: 'asc', current: prop.property_tests_count, saved: baseline.property_tests_count },
```

---

#### 3.8 — Atualizar `quality-baseline.json`

```json
"property_tests_count": 0
```

### 4. Confirmar criação

```
✓ scripts/install-property-deps.sh criado
✓ scripts/race-guard.sh criado
✓ [backend/tests/property/conftest_property.py] criado (Python)
✓ [backend/tests/property/test_race_template.py] criado (Python)
✓ [src/test/property/setup-property.ts] criado (Node.js)
✓ [src/test/property/race-conditions.test.ts] criado (Node.js)
✓ scripts/quality-gate.js atualizado
✓ quality-baseline.json atualizado

Próximos passos:
  1. Execute: bash scripts/install-property-deps.sh
  2. Adapte os templates removendo o prefixo "template_" e o ".skip"
  3. Conecte às funções reais do seu projeto
  4. Execute: bash scripts/race-guard.sh
  5. Commite os templates adaptados
```

---

## Exemplos de uso

```
/property-race-guard
/property-race-guard /home/johnny/GIT/PH3A/MeuProjeto
```

---

## Referências

- Hypothesis: https://hypothesis.readthedocs.io/
- fast-check: https://fast-check.dev/
- fc.scheduler: https://fast-check.dev/docs/advanced/race-conditions/
- anyio + pytest: https://anyio.readthedocs.io/en/stable/testing.html
