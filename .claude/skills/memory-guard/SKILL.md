---
name: memory-guard
description: >-
  Detecta memory leaks, caches sem TTL e crescimento descontrolado de memória. Abordagem dual: análise estática (padrões de leak) + instrumentação de testes ao estilo pprof/LeakCanary (tracemalloc Python, process.memoryUsage Node.js). Adiciona métricas memory_static_findings e memory_alloc_max_kb ao ratchet do quality-gate. Suporta Python e Node.js/TypeScript. Requer quality-gate instalado.
allowed-tools: Read, Bash, Write, Edit, Grep, Glob
---

# Skill: Memory Guard — Detecção de Memory Leaks

Instala detecção de **memory leaks** em duas camadas:

1. **Análise estática** — varre o código-fonte em busca de padrões que causam leaks (caches globais sem limite, listeners não removidos, timers sem cleanup). Roda imediatamente, sem executar o código.
2. **Instrumentação de testes** — instrumenta a suite de testes com profiling de memória ao estilo `pprof` (Go/Google) e `LeakCanary` (Android): mede alocações durante cada teste e falha se ultrapassar o threshold.

O ratchet garante que `memory_static_findings` e `memory_alloc_max_kb` só podem diminuir.

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

### 2. Executar análise estática imediata

Antes de gerar qualquer arquivo, **varre o projeto e exibe os achados**:

```bash
ROOT=<PROJETO_ROOT>

echo "=== ANÁLISE ESTÁTICA DE MEMORY LEAKS ==="

# Diretórios de produção DESCOBERTOS (pastas de primeiro nível, sem testes/dependências): o alvo pode usar
# backend/ + frontend/, api/ + web/, src/... Nunca assuma os nomes.
DIRS=$(ls -d "$ROOT"/*/ 2>/dev/null | grep -Ev "/(node_modules|dist|build|coverage|migrations|e2e|tests|test|__tests__|scripts|venv|\.venv|env|vendor|bin|obj|target|docs|examples|out)/$")
# Mesma lista de exclusão do memory-guard.js (e do resilience-scan.js/arch-tradeoff): uniforme, por nome.
EXCL="--exclude-dir=node_modules --exclude-dir=__tests__ --exclude-dir=tests --exclude-dir=test --exclude-dir=dist --exclude-dir=build --exclude-dir=coverage --exclude-dir=migrations --exclude-dir=e2e --exclude-dir=scripts --exclude-dir=venv --exclude-dir=.venv --exclude-dir=env --exclude-dir=vendor --exclude-dir=bin --exclude-dir=obj --exclude-dir=target --exclude-dir=docs --exclude-dir=examples --exclude-dir=.next --exclude-dir=out --exclude-dir=__pycache__ --exclude-dir=site-packages"

# ── Python ────────────────────────────────────────────────────────────────────
echo "--- Python ---"

# lru_cache sem maxsize (crescimento ilimitado)
grep -rn "lru_cache()" $DIRS --include="*.py" $EXCL 2>/dev/null | grep -v "lru_cache(maxsize" | head -20

# dicionários globais que podem crescer sem fim
grep -rn "^[A-Z_].*= {}" $DIRS --include="*.py" $EXCL 2>/dev/null | head -10
grep -rn "^[A-Z_].*= \[\]" $DIRS --include="*.py" $EXCL 2>/dev/null | head -10

# asyncio.Task sem cancel no shutdown
grep -rn "asyncio\.create_task\|loop\.create_task" $DIRS --include="*.py" $EXCL 2>/dev/null | head -10

# ── Node.js ───────────────────────────────────────────────────────────────────
echo "--- Node.js ---"

# setInterval sem clearInterval armazenado
grep -rn "setInterval" $DIRS --include="*.ts" --include="*.js" $EXCL 2>/dev/null | \
  grep -v "clearInterval\|const.*setInterval\|let.*setInterval\|this\._" | head -10

# EventEmitter sem removeListener (process.on/req.on/res.on não acumulam: vivem uma vez por processo/requisição)
grep -rn "\.on(" $DIRS --include="*.ts" --include="*.js" $EXCL 2>/dev/null | \
  grep -v "removeListener\|removeAllListeners\|once(\|process\.on(\|req\.on(\|res\.on(" | head -10

# Map/Set globais sem limite
grep -rn "new Map()\|new Set()" $DIRS --include="*.ts" --include="*.js" $EXCL 2>/dev/null | \
  grep -v "//\|\.size\s*<\s*MAX\|maxSize" | head -10

# Cache sem TTL
grep -rn "cache\[.*\] =\|\.set(.*)" $DIRS --include="*.ts" --include="*.js" $EXCL 2>/dev/null | \
  grep -vi "ttl\|expire\|timeout\|maxage\|maxSize\|lru" | head -10
```

Exibir os resultados ao usuário imediatamente antes de continuar.

### 3. Detectar stack

```bash
find <PROJETO_ROOT>/backend -name "*.py" -maxdepth 3 2>/dev/null | head -3
cat <PROJETO_ROOT>/backend/package.json 2>/dev/null | grep -E "node|typescript"
cat <PROJETO_ROOT>/package.json 2>/dev/null | grep -E "node|typescript"
```

### 4. Gerar os artefatos

---

#### 4.1 — `scripts/memory-guard.js`

Copie `resources/memory-guard.js` para `scripts/memory-guard.js` (**verbatim** — está em `resources/` para ser testado:
`tests/test_scanner_memoria.py` roda exatamente estes bytes). O que ele faz:

- Pastas de produção **descobertas** (primeiro nível), nunca `backend/`/`frontend/` fixos. Sem o diretório do alvo no
  `cmd` do grep: um `'backend/'` embutido fazia o achado Python ser contado **uma vez por pasta descoberta**.
- **Uma lista de exclusão única**, por nome de entrada (nunca pelo caminho absoluto): `node_modules`, `dist`, `build`,
  `coverage`, `migrations`, `e2e`, `tests`/`test`/`__tests__`, `scripts`, `venv`, `.venv`, `env`, `vendor`, `bin`, `obj`,
  `target`, `docs`, `examples`, `.next`, `out`, `__pycache__`, `site-packages`. Além disso, qualquer pasta com
  `pyvenv.cfg` (venv de nome arbitrário) fica fora. A mesma lista vale no inventário shell do passo 2.
- O mesmo `arquivo:linha` nunca conta duas vezes.

> **Nota de migração do baseline (leia antes de rodar o gate num projeto que já tinha `memory_static_findings`).**
> A varredura estática já devolveu **sempre 0** (grep quebrado, diretórios fixos); quem gravou baseline com ela tem
> `memory_static_findings: 0` — e o scanner correto, ao achar algo real, **reprova**. É o comportamento certo: o 0 antigo
> era cegueira, não qualidade. Confira os achados (`node scripts/memory-guard.js`), corrija os reais ou aceite os
> legítimos e regrave o baseline. **`--update` sozinho não adianta**: o ratchet `desc` usa `min()` e nunca sobe um valor
> salvo. O caminho é **apagar a chave** `memory_static_findings` de `quality-baseline.json` (ela volta como `new`), rodar
> `node scripts/quality-gate.js --update` e conferir com o verificador de baseline. Faça isso por chave, só nas que o
> scanner mudou, e registre o porquê.

---

#### 4.2 — `memory-thresholds.json`

```json
{
  "updated": "{{HOJE}}",
  "thresholds": {
    "max_alloc_kb_python": 5120,
    "max_heap_mb_nodejs": 256,
    "max_static_findings_high": 0,
    "max_static_findings_medium": 5
  },
  "_comment": "Ajuste os thresholds conforme o projeto. O ratchet garante que memory_static_findings e memory_alloc_max_kb só diminuem."
}
```

---

#### 4.3 — `backend/tests/conftest_memory.py` (Python)

Criar apenas se Python detectado:

```python
# backend/tests/conftest_memory.py
#
# Fixture de profiling de memória ao estilo pprof/LeakCanary.
# Usa tracemalloc para medir alocações durante cada teste.
#
# Uso:
#   def test_process_large_list(memory_snapshot):
#       result = process(data)
#       memory_snapshot.assert_max_kb(512)  # falha se alocar > 512 KB

import os
import tracemalloc
import pytest

_DEFAULT_MAX_KB = int(os.getenv('MEMORY_MAX_ALLOC_KB', '5120'))  # 5 MB padrão


class MemorySnapshot:
    def __init__(self):
        self._start_snapshot = None
        self._stats = None

    def capture(self):
        self._start_snapshot = tracemalloc.take_snapshot()

    def stats(self):
        if not self._stats:
            end = tracemalloc.take_snapshot()
            self._stats = end.compare_to(self._start_snapshot, 'lineno')
        return self._stats

    def top_allocations(self, n: int = 5) -> list[str]:
        return [
            f"{stat.size / 1024:.1f} KB — {stat.traceback.format()[0]}"
            for stat in self.stats()[:n]
        ]

    def total_kb(self) -> float:
        return sum(max(0, s.size_diff) for s in self.stats()) / 1024

    def assert_max_kb(self, max_kb: int = _DEFAULT_MAX_KB):
        total = self.total_kb()
        assert total <= max_kb, (
            f"Memory budget excedido: {total:.1f} KB (máximo: {max_kb} KB)\n"
            f"Top alocações:\n" + "\n".join(self.top_allocations())
        )


@pytest.fixture
def memory_snapshot():
    """Inicia tracemalloc e retorna um MemorySnapshot para assertions."""
    tracemalloc.start()
    snap = MemorySnapshot()
    snap.capture()
    yield snap
    tracemalloc.stop()


@pytest.fixture(autouse=False)
def no_memory_regression(memory_snapshot):
    """
    Fixture auto-aplicável que falha se o teste alocar mais do que
    MEMORY_MAX_ALLOC_KB (padrão: 5120 KB / 5 MB).
    Aplique com @pytest.mark.usefixtures('no_memory_regression').
    """
    yield
    memory_snapshot.assert_max_kb()
```

---

#### 4.4 — `<pacote>/src/__tests__/helpers/memory-guard.ts` (Node.js)

Criar apenas se Node.js detectado (no pacote que roda os testes; ajuste `<RELATIVO_ATE_A_RAIZ>` até a raiz
do projeto, onde fica `memory-thresholds.json`). Verificado em `examples/esqueleto-fullstack`:

- O pico precisa ser **gravado** (`registrar()`): sem isso `memory_alloc_max_kb` fica sempre nulo em Node — só o
  `conftest_memory.py` do Python o alimentava.
- O relatório acumula o **máximo** entre arquivos de teste (cada arquivo roda em módulo isolado).
- Grave o pico em **degraus** (`RESOLUCAO_KB`): o heap retido oscila alguns KB entre execuções do mesmo código e o
  valor cru faria o ratchet reprovar por ruído. Meça a oscilação (8 execuções) antes de escolher o degrau.
- Sem `--expose-gc` o teste se declara pulado (`gcDisponivel`) em vez de medir lixo.

```typescript
import fs from 'fs';
import path from 'path';

/**
 * Perfil de memória por teste (estilo pprof/LeakCanary) para Node.
 * Requer `--expose-gc` (o quality-gate roda o jest assim); sem GC forçado o número não é confiável e
 * o teste é pulado de propósito, em vez de medir lixo.
 *
 * `MEMORY_ALLOC_REPORT_FILE` aponta o relatório lido pelo quality-gate; o arquivo acumula o PICO (máximo)
 * entre todos os testes, mesmo com vários arquivos de teste (cada arquivo roda em módulo isolado).
 */
/**
 * Resolução do pico gravado no relatório. O heap retido oscila alguns KB entre execuções do MESMO código
 * (medido: 59–80 KB em 8 execuções); gravar o valor cru faria o ratchet reprovar por ruído. Arredondar
 * para cima em degraus de 256 KB (muito acima do ruído medido) mantém o gate estável e ainda pega
 * crescimento real.
 */
export const RESOLUCAO_KB = 256;

/** Teto de heap retido por teste: `memory-thresholds.json` da raiz (default da skill: 256 MB), ou a variável. */
function limiteMbDoArquivo(): number {
  try {
    const arquivo = path.resolve(__dirname, '<RELATIVO_ATE_A_RAIZ>/memory-thresholds.json');
    return JSON.parse(fs.readFileSync(arquivo, 'utf8')).thresholds.max_heap_mb_nodejs;
  } catch {
    return 256;
  }
}
const LIMITE_MB_PADRAO = Number(process.env.MEMORY_MAX_HEAP_MB ?? limiteMbDoArquivo());

export const gcDisponivel = typeof globalThis.gc === 'function';

function coletar(): number {
  globalThis.gc?.();
  globalThis.gc?.();
  return process.memoryUsage().heapUsed;
}

export class MemoryTracker {
  private readonly antes: number;

  constructor(private readonly rotulo: string) {
    this.antes = coletar();
  }

  /** Heap retido (KB) desde a criação, depois de forçar o GC. */
  retidoKb(): number {
    return Math.max(0, Math.round((coletar() - this.antes) / 1024));
  }

  assertMaxMB(maxMB: number = LIMITE_MB_PADRAO): number {
    const kb = this.retidoKb();
    if (kb / 1024 > maxMB) {
      throw new Error(
        `Memory budget excedido em "${this.rotulo}": +${(kb / 1024).toFixed(2)} MB (máximo: ${maxMB} MB)`,
      );
    }
    return kb;
  }

  /** Acumula o pico do teste no relatório do gate. */
  registrar(kb: number): void {
    const arquivo = process.env.MEMORY_ALLOC_REPORT_FILE;
    if (!arquivo) return;
    let atual = 0;
    try {
      atual = JSON.parse(fs.readFileSync(arquivo, 'utf8')).alloc_max_kb ?? 0;
    } catch {
      /* primeiro teste a gravar */
    }
    const degrau = Math.ceil(kb / RESOLUCAO_KB) * RESOLUCAO_KB;
    fs.writeFileSync(arquivo, JSON.stringify({ alloc_max_kb: Math.max(atual, degrau) }) + '\n');
  }
}

export function startMemoryTracking(rotulo: string): MemoryTracker {
  return new MemoryTracker(rotulo);
}
```

---

#### 4.5 — Atualizar `scripts/quality-gate.js`

Inserir `measureMemory` antes do bloco `// ─── Main`:

```js
function measureMemory() {
  const nulo = { memory_static_findings: null, memory_alloc_max_kb: null };
  if (!fs.existsSync(path.join(ROOT, 'scripts', 'memory-guard.js'))) return nulo;

  // Achados estáticos: roda o scanner e lê o relatório.
  spawnSync('node', ['scripts/memory-guard.js', '--json'], { cwd: ROOT, encoding: 'utf8' });
  let estatico = null;
  try { estatico = JSON.parse(fs.readFileSync(path.join(ROOT, '.memory-guard-report.json'), 'utf8')).total ?? null; }
  catch { /* sem relatório: skip */ }

  // Pico de heap (Node): roda o teste de memória com --expose-gc; o helper grava o máximo no arquivo apontado.
  // (Jest: node --expose-gc node_modules/jest/bin/jest.js · Vitest: execArgv ['--expose-gc'] no config.)
  const relatorio = path.join(ROOT, '.quality-tmp', 'memory-alloc.json');
  fs.mkdirSync(path.dirname(relatorio), { recursive: true });
  fs.rmSync(relatorio, { force: true });
  spawnSync(process.execPath, ['--expose-gc', path.join(ROOT, '<PACOTE>', 'node_modules', 'jest', 'bin', 'jest.js'),
    '--runInBand', '--silent', '--testPathPattern=memory'],
  { cwd: path.join(ROOT, '<PACOTE>'), encoding: 'utf8', env: { ...process.env, MEMORY_ALLOC_REPORT_FILE: relatorio } });
  let alloc = null;
  try { alloc = JSON.parse(fs.readFileSync(relatorio, 'utf8')).alloc_max_kb ?? null; } catch { /* skip */ }

  // Python: o conftest_memory.py popula memory_alloc_max_kb pelos próprios testes; aqui fica null.
  return { memory_static_findings: estatico, memory_alloc_max_kb: alloc };
}
```

**Adições ao ratchet** (as DUAS métricas, sempre — uma linha ausente é indistinguível de skill nunca instalada):

```js
{ key: 'memory_static_findings', label: 'Memory leaks (estático)',     dir: 'desc', current: mem.memory_static_findings, saved: baseline.memory_static_findings },
{ key: 'memory_alloc_max_kb',    label: 'Memória — pico de heap (KB)', dir: 'desc', current: mem.memory_alloc_max_kb,    saved: baseline.memory_alloc_max_kb },
```

---

#### 4.6 — Atualizar `quality-baseline.json`

**Não semeie `999`/`999999`.** Um valor-semente que a medição nunca substitui fica no baseline como se fosse medida
(e o ratchet `desc` aceita qualquer valor abaixo dele). Rode `node scripts/quality-gate.js --update` com tudo de pé:
os dois números gravados são os medidos. Se uma delas não puder ser medida neste alvo, deixe a chave **ausente** e
registre o motivo — nunca um número inventado.

### 5. Confirmar criação

```
✓ scripts/memory-guard.js criado
✓ memory-thresholds.json criado
✓ [backend/tests/conftest_memory.py] criado (Python)
✓ [<pacote>/src/__tests__/helpers/memory-guard.ts] criado (Node.js)
✓ scripts/quality-gate.js atualizado
✓ quality-baseline.json atualizado

Próximos passos:
  1. Execute: node scripts/memory-guard.js   (análise estática imediata)
  2. Revise os achados HIGH — são os mais críticos
  3. Adicione a fixture memory_snapshot nos testes críticos
  4. Para Node.js: configure --expose-gc no vitest.config.ts ou jest.config
  5. Execute node scripts/memory-guard.js --record para gravar baseline inicial
```

---

## Exemplos de uso

```
/memory-guard
/memory-guard /home/johnny/GIT/PH3A/MeuProjeto
```

---

## Referências

- tracemalloc (Python): https://docs.python.org/3/library/tracemalloc.html
- pprof (Go, conceito): https://pkg.go.dev/runtime/pprof
- LeakCanary (Android, conceito): https://square.github.io/leakcanary/
- process.memoryUsage (Node.js): https://nodejs.org/api/process.html#processmemoryusage
- --expose-gc em Node.js: https://nodejs.org/en/docs/guides/diagnostics-flamegraph
