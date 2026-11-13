---
name: io-budget
description: Conta e controla queries SQL + chamadas HTTP outbound por requisição/teste, detectando padrões N+1 e regressões de I/O. Gera baseline por endpoint com ratchet — os números só podem diminuir. Integra ao quality-gate existente adicionando métricas io_sql_worst e io_http_worst. Suporta Python/SQLAlchemy/httpx/requests e Node.js/Knex (SQL por evento `query`), Prisma (evento `query`; `$use` foi removido no Prisma 7), axios (interceptor) e fetch. Requer quality-gate instalado.
allowed-tools: Read, Bash, Write, Edit, Grep, Glob
---

# Skill: IO Budget — Controle de I/O por Endpoint

Instala um **orçamento de I/O com ratchet por endpoint** em um projeto. Para cada endpoint ou função testada, registra quantas queries SQL e chamadas HTTP outbound são realizadas. O ratchet garante que esses números só podem diminuir (melhorar), nunca aumentar — protegendo contra regressões silenciosas de N+1.

---

## Etapas

### 1. Receber o alvo

O usuário pode fornecer:
- **Caminho absoluto**: `/home/johnny/GIT/PH3A/MeuProjeto`
- **Relativo ou nome**: `../MeuProjeto` ou `MeuProjeto`
- **Sem argumento**: usar o diretório de trabalho atual (`pwd`)

Verificar que `scripts/quality-gate.js` existe no projeto alvo:

```bash
test -f <PROJETO_ROOT>/scripts/quality-gate.js || echo "ERRO: execute /quality-gate primeiro"
```

Se não existir, abortar e orientar o usuário a instalar o quality-gate antes.

### 2. Detectar stack e ORM

```bash
# Backend Python
find <PROJETO_ROOT>/backend -name "requirements*.txt" 2>/dev/null | xargs grep -l "sqlalchemy\|SQLAlchemy" 2>/dev/null
find <PROJETO_ROOT>/backend -name "*.py" -maxdepth 4 | xargs grep -l "from sqlalchemy\|import sqlalchemy" 2>/dev/null | head -3

# Backend Node.js — ORM
cat <PROJETO_ROOT>/backend/package.json 2>/dev/null | grep -E "\"knex\"|\"prisma\"|\"sequelize\"|\"typeorm\""
cat <PROJETO_ROOT>/package.json 2>/dev/null | grep -E "\"knex\"|\"prisma\"|\"sequelize\"|\"typeorm\""

# HTTP client Python
find <PROJETO_ROOT>/backend -name "*.py" -maxdepth 4 | xargs grep -l "httpx\|requests\." 2>/dev/null | head -3

# HTTP client Node.js
cat <PROJETO_ROOT>/backend/package.json 2>/dev/null | grep -E "\"axios\"|\"node-fetch\"|\"got\""
```

Preencher:

| Componente | Detectado |
|------------|-----------|
| Python + SQLAlchemy | sim/não |
| Python + httpx/requests | sim/não |
| Node.js + Knex | sim/não |
| Node.js + Prisma | sim/não |
| Node.js + axios/fetch | sim/não |

### 3. Gerar os artefatos

Com base na detecção, gerar os arquivos abaixo.

---

#### 3.1 — `io-budget.json`

Criar em `<PROJETO_ROOT>/io-budget.json`:

```json
{
  "_comment": "Baseline de I/O por endpoint. Edite max_sql e max_http para ajustar limites. Use --record para capturar valores reais.",
  "endpoints": {}
}
```

---

#### 3.2 — `scripts/io-budget.js`

Criar em `<PROJETO_ROOT>/scripts/io-budget.js`:

```js
#!/usr/bin/env node
// scripts/io-budget.js
//
// Verifica o orçamento de I/O (SQL + HTTP) por endpoint.
//
//   node scripts/io-budget.js            → verifica regressões (CI)
//   node scripts/io-budget.js --record   → grava baseline inicial
//   node scripts/io-budget.js --update   → ratcheta melhorias (reduções)

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT        = path.resolve(__dirname, '..');
const BUDGET_FILE = path.join(ROOT, 'io-budget.json');
const RECORD      = process.argv.includes('--record');
const UPDATE      = process.argv.includes('--update');

// ─── Carrega baseline ────────────────────────────────────────────────────────

function loadBudget() {
  if (!fs.existsSync(BUDGET_FILE)) return { endpoints: {} };
  try {
    return JSON.parse(fs.readFileSync(BUDGET_FILE, 'utf8'));
  } catch {
    return { endpoints: {} };
  }
}

function saveBudget(data) {
  fs.writeFileSync(BUDGET_FILE, JSON.stringify(data, null, 2) + '\n');
}

// ─── Coleta resultados dos testes ────────────────────────────────────────────

function collectResults() {
  // Lê o relatório gerado pelos fixtures io_counter (Python) ou setupIOBudget (Node.js)
  const reportFile = path.join(ROOT, '.io-budget-report.json');
  if (!fs.existsSync(reportFile)) {
    console.error('⚠  .io-budget-report.json não encontrado.');
    console.error('   Execute os testes de I/O com IO_BUDGET_REPORT_FILE=<raiz>/.io-budget-report.json antes de rodar este script.');
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(reportFile, 'utf8'));
}

// ─── Avaliação por endpoint ──────────────────────────────────────────────────

const ICONS = { improved: '↓', equal: '=', regressed: '↑', new: '+', skip: '—' };

function evaluate(current, saved, direction = 'desc') {
  if (saved == null) return { status: 'new',      delta: null };
  if (current == null) return { status: 'skip',   delta: null };
  if (current < saved)  return { status: direction === 'desc' ? 'improved' : 'regressed', delta: current - saved };
  if (current > saved)  return { status: direction === 'desc' ? 'regressed' : 'improved', delta: current - saved };
  return { status: 'equal', delta: 0 };
}

function ratchet(current, saved, direction = 'desc') {
  if (saved == null || current == null) return current ?? saved;
  return direction === 'desc' ? Math.min(current, saved) : Math.max(current, saved);
}

// ─── Main ────────────────────────────────────────────────────────────────────

const budget   = loadBudget();
const results  = collectResults();
const saved    = budget.endpoints ?? {};
const regressions = [];
const updates  = {};

console.log('\n📊 IO Budget — Relatório de I/O por Endpoint\n');
console.log('Endpoint'.padEnd(40) + 'SQL atual  SQL base  HTTP atual  HTTP base  Status');
console.log('─'.repeat(90));

for (const [endpoint, current] of Object.entries(results)) {
  const base    = saved[endpoint] ?? {};
  const sqlEval = evaluate(current.sql,  base.max_sql,  'desc');
  const httpEval= evaluate(current.http, base.max_http, 'desc');

  const sqlIcon  = ICONS[sqlEval.status]  ?? '?';
  const httpIcon = ICONS[httpEval.status] ?? '?';

  const line = [
    endpoint.padEnd(40),
    String(current.sql  ?? '—').padStart(9),
    String(base.max_sql ?? '—').padStart(9),
    String(current.http ?? '—').padStart(11),
    String(base.max_http ?? '—').padStart(9),
    ` ${sqlIcon} SQL  ${httpIcon} HTTP`,
  ].join('  ');

  console.log(line);

  if (sqlEval.status === 'regressed' || httpEval.status === 'regressed') {
    regressions.push({ endpoint, current, base });
  }

  updates[endpoint] = {
    max_sql:  RECORD ? current.sql  : ratchet(current.sql,  base.max_sql,  'desc'),
    max_http: RECORD ? current.http : ratchet(current.http, base.max_http, 'desc'),
  };
}

// ─── Novos endpoints detectados mas não no baseline ─────────────────────────

if (RECORD || UPDATE) {
  budget.endpoints = updates;
  budget.updated   = new Date().toISOString().slice(0, 10);
  saveBudget(budget);
  console.log(RECORD
    ? '\n✓ Baseline inicial gravado em io-budget.json'
    : '\n✓ Baseline atualizado (ratchet aplicado)');
}

// ─── Resultado final ─────────────────────────────────────────────────────────

if (regressions.length > 0 && !RECORD && !UPDATE) {
  console.error('\n✗ IO Budget: REGRESSÕES detectadas:\n');
  for (const { endpoint, current, base } of regressions) {
    if (current.sql > (base.max_sql ?? Infinity)) {
      console.error(`  ${endpoint}: SQL ${current.sql} > baseline ${base.max_sql}`);
    }
    if (current.http > (base.max_http ?? Infinity)) {
      console.error(`  ${endpoint}: HTTP ${current.http} > baseline ${base.max_http}`);
    }
  }
  process.exit(1);
} else if (!RECORD && !UPDATE) {
  console.log('\n✓ IO Budget: OK\n');
}
```

---

#### 3.3 — `backend/tests/conftest_io.py` (stack Python)

Criar apenas se Python detectado:

```python
# backend/tests/conftest_io.py
#
# Fixture para contar queries SQL (SQLAlchemy) e chamadas HTTP (httpx/requests)
# por bloco de teste. Gera .io-budget-report.json ao final da suite.
#
# Uso:
#   def test_list_users(client, io_counter):
#       response = client.get("/users")
#       io_counter.assert_sql_max(3)   # falha se > 3 queries SQL
#       io_counter.assert_http_max(0)  # falha se > 0 chamadas HTTP externas

import json
import os
import pytest
from unittest.mock import patch
from sqlalchemy import event

# O relatório vai para IO_BUDGET_REPORT_FILE (o quality-gate aponta para a RAIZ do projeto). O default relativo a
# este arquivo é só para rodar o pytest solto; `os.getcwd()` seria o diretório do pacote, não a raiz que o gate lê.
_DEFAULT_REPORT = os.path.join(os.path.dirname(__file__), '..', '..', '.io-budget-report.json')


def _gravar_relatorio(rotulo: str, sql: int, http: int) -> None:
    """MESCLA com o que já existe: cada teste/worker grava a sua entrada sem apagar a dos outros."""
    arquivo = os.environ.get('IO_BUDGET_REPORT_FILE') or _DEFAULT_REPORT
    try:
        with open(arquivo) as f:
            atual = json.load(f)
    except (OSError, ValueError):
        atual = {}
    atual[rotulo] = {'sql': sql, 'http': http}
    with open(arquivo, 'w') as f:
        json.dump(atual, f, indent=2)


class IOCounter:
    def __init__(self):
        self.sql  = 0
        self.http = 0
        self._endpoint: str | None = None

    def label(self, name: str):
        """Define o nome do endpoint/operação para este contador."""
        self._endpoint = name
        return self

    def assert_sql_max(self, max_queries: int):
        assert self.sql <= max_queries, (
            f"N+1 detectado: {self.sql} queries SQL (máximo: {max_queries})"
        )

    def assert_http_max(self, max_calls: int):
        assert self.http <= max_calls, (
            f"HTTP budget excedido: {self.http} chamadas externas (máximo: {max_calls})"
        )

    def record(self):
        """Grava os contadores no relatório (só se o teste deu nome à operação com .label())."""
        if self._endpoint:
            _gravar_relatorio(self._endpoint, self.sql, self.http)


@pytest.fixture
def io_counter(db):
    """
    Conta queries SQL e chamadas HTTP durante um teste.
    Requer fixture `db` com sessão SQLAlchemy exposta como `db.bind` ou `db.get_bind()`.
    Adapte o listener abaixo para a engine do seu projeto.
    """
    counter = IOCounter()

    # ── SQL: SQLAlchemy event listener ────────────────────────────────────────
    try:
        engine = db.bind if hasattr(db, 'bind') else db.get_bind()

        @event.listens_for(engine, 'before_cursor_execute')
        def _count_sql(conn, cursor, statement, params, context, executemany):
            # Ignora BEGIN/COMMIT/ROLLBACK e SAVEPOINT
            stripped = statement.strip().upper()
            if not any(stripped.startswith(kw) for kw in ('BEGIN', 'COMMIT', 'ROLLBACK', 'SAVEPOINT', 'RELEASE')):
                counter.sql += 1

        yield counter

        event.remove(engine, 'before_cursor_execute', _count_sql)
        counter.record()
    except Exception:
        # Se a fixture db não estiver disponível, ainda entrega o counter
        yield counter

    # ── HTTP: mock httpx + requests ───────────────────────────────────────────


@pytest.fixture
def io_counter_full():
    """
    Versão completa: conta SQL via tracemalloc + intercepta HTTP (httpx e requests).
    Não requer fixture de banco — intercepta diretamente no transporte.
    """
    counter = IOCounter()

    original_send_httpx    = None
    original_send_requests = None

    try:
        import httpx

        original_send_httpx = httpx.Client.send

        def patched_httpx_send(self, request, **kwargs):
            counter.http += 1
            return original_send_httpx(self, request, **kwargs)

        httpx.Client.send = patched_httpx_send

        async def patched_httpx_async_send(self, request, **kwargs):
            counter.http += 1
            return await original_send_httpx(self, request, **kwargs)

    except ImportError:
        pass

    try:
        import requests

        original_send_requests = requests.Session.send

        def patched_requests_send(self, request, **kwargs):
            counter.http += 1
            return original_send_requests(self, request, **kwargs)

        requests.Session.send = patched_requests_send
    except ImportError:
        pass

    yield counter

    # Restaura originais
    try:
        import httpx
        httpx.Client.send = original_send_httpx
    except Exception:
        pass
    try:
        import requests
        requests.Session.send = original_send_requests
    except Exception:
        pass

    counter.record()
```

> **Carregamento.** `conftest_io.py` não é um `conftest.py`: o pytest não o descobre sozinho. Registre-o em
> `<backend>/tests/conftest.py` com `pytest_plugins = ["tests.conftest_io"]` (ou ajuste o caminho do pacote). Os testes
> que medem dão nome à operação (`io_counter.label("GET /users")`); quem não rotula não entra no relatório. Quem mede é um
> teste contra o **banco real** (SQLite em memória não conta o que o Postgres de produção contaria).

---

#### 3.4 — `<pacote>/src/__tests__/helpers/io-budget.ts` (stack Node.js)

Criar apenas se Node.js detectado, no pacote que roda os testes. Duas armadilhas medidas no fixture
`examples/esqueleto-fullstack` que a versão anterior deste modelo tinha:

- **Onde o relatório é gravado.** `process.cwd()` é o diretório do PACOTE (o Jest roda em `api/`), não a raiz que o
  `quality-gate.js` e o `io-budget.js` leem. O caminho vem de `IO_BUDGET_REPORT_FILE` (o gate aponta para a raiz).
- **Um arquivo de teste apaga o relatório do outro.** Cada arquivo roda em módulo isolado; gravar a sessão inteira num
  `afterAll` sobrescreve o que o arquivo anterior gravou. O helper **mescla** com o arquivo existente a cada operação.

Quem mede é um teste de **integração com o banco real** (SQL contado pelo evento `query` do Knex): contra repositório
em memória o número seria sempre 0. O que o teste afirma é o que independe de número (nenhuma chamada HTTP de saída;
listagem sem N+1: o nº de queries não cresce com o nº de registros); o número em si é **medido** e vai para o
`io-budget.json` por `--record`, nunca escolhido no teste.

```typescript
import fs from 'fs';
import { Knex } from 'knex';

/**
 * Contador de I/O (SQL + HTTP de saída) por operação, para o orçamento do `/io-budget`.
 *
 * O relatório é gravado em `IO_BUDGET_REPORT_FILE` (o quality-gate aponta para a raiz do projeto),
 * MESCLANDO com o que já existe: cada arquivo de teste roda em módulo isolado e, sem mesclar, o
 * último arquivo apagaria o relatório dos anteriores.
 */
export class IOCounter {
  sql = 0;
  http = 0;

  constructor(private readonly rotulo: string) {}

  assertSQLMax(max: number): void {
    if (this.sql > max) {
      throw new Error(
        `N+1 detectado em "${this.rotulo}": ${this.sql} queries SQL (máximo: ${max})`,
      );
    }
  }

  assertHTTPMax(max: number): void {
    if (this.http > max) {
      throw new Error(
        `HTTP budget excedido em "${this.rotulo}": ${this.http} chamadas externas (máximo: ${max})`,
      );
    }
  }

  registrar(): void {
    const arquivo = process.env.IO_BUDGET_REPORT_FILE;
    if (!arquivo) return;
    let atual: Record<string, { sql: number; http: number }> = {};
    try {
      atual = JSON.parse(fs.readFileSync(arquivo, 'utf8'));
    } catch {
      /* primeiro a gravar */
    }
    atual[this.rotulo] = { sql: this.sql, http: this.http };
    fs.writeFileSync(arquivo, JSON.stringify(atual, null, 2) + '\n');
  }
}

let ativo: IOCounter | null = null;

/** Conta toda instrução enviada ao Postgres (inclui BEGIN/COMMIT: são idas e voltas reais). */
export function contarSql(db: Knex): void {
  db.on('query', () => {
    if (ativo) ativo.sql++;
  });
}

const fetchOriginal = globalThis.fetch;

/** Conta chamadas `fetch` de saída. O supertest fala por `http`, não por `fetch`: não é contado. */
export function patchFetch(): void {
  globalThis.fetch = (async (...args: Parameters<typeof fetch>) => {
    if (ativo) ativo.http++;
    return fetchOriginal(...args);
  }) as typeof fetch;
}

export function restoreFetch(): void {
  globalThis.fetch = fetchOriginal;
}

/** Conta requisições de saída de uma instância do axios (`axios` ou `axios.create(...)`) por interceptor. */
export function contarAxios(instancia: {
  interceptors: { request: { use(fn: (config: unknown) => unknown): unknown } };
}): void {
  instancia.interceptors.request.use((config) => {
    if (ativo) ativo.http++;
    return config;
  });
}

/**
 * Conta as instruções SQL do Prisma pelo evento `query` (precisa de `log: [{ emit: 'event', level: 'query' }]` no
 * construtor). `prisma.$use` NÃO existe mais (removido no Prisma 7): o substituto são extensões (`$extends`), que
 * enxergam OPERAÇÕES do Client, não instruções — um `include` vira várias queries. Para N+1 conte instruções.
 */
export function contarPrismaSql(prisma: { $on(evento: 'query', fn: () => void): unknown }): void {
  prisma.$on('query', () => {
    if (ativo) ativo.sql++;
  });
}

export function trackIO(rotulo: string): IOCounter {
  ativo = new IOCounter(rotulo);
  return ativo;
}

/** Encerra a contagem da operação e grava no relatório. */
export function stopTracking(): void {
  ativo?.registrar();
  ativo = null;
}
```

---

#### 3.5 — Atualizar `scripts/quality-gate.js`

Inserir a função `measureIOBudget` logo antes do bloco `// ─── Main` e adicionar a chamada no main. Usar Edit para inserir:

**Função a inserir antes do main** — o relatório é sempre gerado **rodando os testes de I/O** com
`IO_BUDGET_REPORT_FILE` apontando para a raiz. Escolha **um** dos dois ramos conforme a stack detectada e **substitua os
marcadores `<...>`** (a tabela abaixo diz por quê e com quê); marcador esquecido é erro do gerador, não configuração:

| Marcador | Python (pytest + SQLAlchemy) | Node (Jest/Vitest + Knex/Prisma) |
|---|---|---|
| `<PORTA_DO_BANCO_DE_TESTE>` | porta do Postgres de teste do compose (ex.: `5443`) | idem |
| `<PACOTE>` | `backend` (ou o diretório achado no passo 2) | `api` (o pacote que roda os testes) |
| `<COMANDO>` / `<ARGS>` | `python3` / `['-m', 'pytest', 'tests', '-k', 'io_budget', '-q']` | o binário do runner do pacote (`node_modules/.bin/jest`) / `['--runInBand', '--testPathPattern=io-budget']` |

```js
// Escuta TCP no localhost (sem dependência). Sem o banco de teste de pé o I/O NÃO é medido.
function bancoDeTesteAcessivel(porta = Number(process.env.DB_TEST_PORTA ?? <PORTA_DO_BANCO_DE_TESTE>)) {
  const r = spawnSync(process.execPath, ['-e',
    `const s=require('net').connect(${porta},'127.0.0.1');` +
    `s.on('connect',()=>process.exit(0));s.on('error',()=>process.exit(1));setTimeout(()=>process.exit(1),1500)`]);
  return r.status === 0;
}

function measureIOBudget() {
  const nulo = { io_sql_worst: null, io_http_worst: null };
  const budgetFile = path.join(ROOT, 'io-budget.json');
  const reportFile = path.join(ROOT, '.io-budget-report.json');
  if (!fs.existsSync(budgetFile)) return nulo;

  // Sem banco, NÃO finge que mediu: avisa e devolve nulo (a linha fica '—').
  if (!bancoDeTesteAcessivel()) {
    process.stderr.write('⚠ io-budget: banco de teste indisponível — não medido\n');
    return nulo;
  }
  fs.rmSync(reportFile, { force: true });
  // Python: o conftest_io.py lê IO_BUDGET_REPORT_FILE e grava o relatório (mesclando). Node: idem via helper io-budget.ts.
  spawnSync('<COMANDO>', <ARGS>,
    { cwd: path.join(ROOT, '<PACOTE>'), encoding: 'utf8', env: { ...process.env, IO_BUDGET_REPORT_FILE: reportFile } });

  try {
    const report   = JSON.parse(fs.readFileSync(reportFile, 'utf8'));
    const sqlVals  = Object.values(report).map((e) => e.sql  ?? 0);
    const httpVals = Object.values(report).map((e) => e.http ?? 0);
    return {
      io_sql_worst:  sqlVals.length  ? Math.max(...sqlVals)  : null,
      io_http_worst: httpVals.length ? Math.max(...httpVals) : null,
    };
  } catch {
    return nulo;
  }
}
```

**Adições à tabela de métricas no main** (junto com as existentes):

```js
{ key: 'io_sql_worst',  label: 'I/O SQL pior caso',  dir: 'desc', ...io.io_sql_worst  != null ? { current: io.io_sql_worst,  saved: baseline.io_sql_worst  } : {} },
{ key: 'io_http_worst', label: 'I/O HTTP pior caso', dir: 'desc', ...io.io_http_worst != null ? { current: io.io_http_worst, saved: baseline.io_http_worst } : {} },
```

---

#### 3.6 — Atualizar `quality-baseline.json`

Adicionar ao objeto `metrics`:

**Não semeie `999`.** O ratchet `desc` aceita qualquer valor abaixo da semente e, se a medição for nula, a semente fica
no arquivo como se fosse medida. Grave `io-budget.json` com `node scripts/io-budget.js --record` e o baseline com
`node scripts/quality-gate.js --update` (banco de teste de pé): os números gravados são os medidos.

---

#### 3.7 — Atualizar hook `pre-commit`

Verificar se `scripts/hooks/pre-commit` existe e adicionar ao final (antes do `exit 0`):

```bash
# IO Budget check
if [ -f "io-budget.json" ] && [ -f ".io-budget-report.json" ]; then
  echo "→ Verificando IO Budget..."
  node scripts/io-budget.js || exit 1
fi
```

### 4. Confirmar criação

Listar os arquivos criados e exibir próximos passos:

```
✓ io-budget.json criado
✓ scripts/io-budget.js criado
✓ [backend/tests/conftest_io.py | <pacote>/src/__tests__/helpers/io-budget.ts] criado(s)
✓ scripts/quality-gate.js atualizado (measureIOBudget adicionado)
✓ quality-baseline.json atualizado
✓ scripts/hooks/pre-commit atualizado

Próximos passos:
  1. Adicione a fixture io_counter nos seus testes de endpoint
  2. Execute os testes de I/O com IO_BUDGET_REPORT_FILE=$PWD/.io-budget-report.json para gerar o relatório
  3. Rode: node scripts/io-budget.js --record  (grava baseline inicial)
  4. Adicione .io-budget-report.json ao .gitignore (é gerado em runtime)
  5. Commite io-budget.json com os valores iniciais
```

---

## Exemplos de uso

```
/io-budget                          → usa diretório atual
/io-budget /home/johnny/GIT/MeuProjeto
/io-budget ../OutroProjeto
```

---

## Referências

- SQLAlchemy events: `sqlalchemy.event.listen`
- Knex query events: `knex.on('query', callback)`
- Prisma middleware: `prisma.$use(middleware)`
- httpx transport: `httpx.Client.send`
- fast-check para race conditions: `/property-race-guard`
