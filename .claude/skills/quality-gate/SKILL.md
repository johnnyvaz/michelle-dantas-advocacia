---
name: quality-gate
description: Cria quality-gate completo com ratchet pattern para projetos PH3A. Gera scripts/quality-gate.js, quality-baseline.json, .jscpdrc.json, scripts/release.sh, scripts/sonar-scan.sh, scripts/sonar-report.sh, sonar-project.properties e git hooks. Detecta automaticamente a stack (Python/FastAPI + React/TypeScript, Node.js, etc.) e adapta todas as métricas ao projeto alvo. Use quando o usuário pedir para criar, configurar ou instalar um quality gate em um projeto.
allowed-tools: Read, Bash, Write, Edit, Glob
---

# Skill: Quality Gate — Padrão PH3A

Instala um **quality gate com ratchet pattern** completo em um projeto, idêntico ao usado no NOC-PH3A. O ratchet garante que as métricas só podem melhorar: uma vez que coverage sobe para 80%, nunca pode cair abaixo disso.

---

## Etapas

### 1. Receber o alvo

O usuário pode fornecer:
- **Caminho absoluto**: `/home/johnny/GIT/PH3A/MeuProjeto`
- **Relativo ou nome**: `../MeuProjeto` ou `MeuProjeto`
- **Sem argumento**: usar o diretório de trabalho atual (`pwd`)

### 2. Analisar a stack do projeto

Use **Read**, **Bash** (`ls`, `find`) e **Glob** para detectar:

```bash
# Verificar estrutura raiz
ls <PROJETO_ROOT>/

# Os pacotes NÃO têm nome fixo: backend/ e frontend/ são só os nomes mais comuns. Acha-se o diretório por
# convenção de nome (backend|api|server e frontend|web|client|app) e anota-se qual existe — esses nomes
# alimentam {{BACKEND_DIR}} e {{FRONTEND_DIR}} em todo o resto da skill. Um alvo com api/ + web/ (forma do
# DATA-DOSSIE) é monorepo tanto quanto um com backend/ + frontend/.
for d in backend api server; do [ -d "<PROJETO_ROOT>/$d" ] && echo "backend: $d"; done
for d in frontend web client app; do [ -d "<PROJETO_ROOT>/$d" ] && echo "frontend: $d"; done

# Backend (use o diretório achado acima no lugar de <BACKEND_DIR>)
ls <PROJETO_ROOT>/<BACKEND_DIR>/  2>/dev/null
cat <PROJETO_ROOT>/<BACKEND_DIR>/requirements.txt 2>/dev/null   # Python
cat <PROJETO_ROOT>/<BACKEND_DIR>/package.json 2>/dev/null       # Node.js
find <PROJETO_ROOT>/<BACKEND_DIR> -name "*.py" -maxdepth 3 2>/dev/null | head -5

# Frontend
cat <PROJETO_ROOT>/<FRONTEND_DIR>/package.json 2>/dev/null
ls <PROJETO_ROOT>/<FRONTEND_DIR>/ 2>/dev/null

# Raiz (monolito Node.js)
cat <PROJETO_ROOT>/package.json 2>/dev/null

# Testes existentes
find <PROJETO_ROOT> -not -path "*/node_modules/*" \( -name "pytest.ini" -o -name "jest.config*" -o -name "vitest.config*" \) 2>/dev/null
find <PROJETO_ROOT> -path "*/tests/*" -name "*.py" 2>/dev/null | head -5

# CI/CD existente
ls <PROJETO_ROOT>/.github/workflows/ 2>/dev/null
ls <PROJETO_ROOT>/azure-pipelines.yml 2>/dev/null
```

**Preencher a tabela de detecção:**

| Componente | Detectado | Detalhes |
|------------|-----------|----------|
| Backend Python | sim/não | FastAPI, Django, Flask, etc. |
| Backend Node.js | sim/não | Express, Fastify, etc. |
| Frontend TypeScript | sim/não | React+Vite, Vue, Angular, etc. |
| Framework de teste backend | sim/não | pytest, jest, mocha |
| Framework de teste frontend | sim/não | vitest, jest |
| SonarQube | sim/não | sonar-project.properties existente? |
| CI/CD | sim/não | GitHub Actions, Azure Pipelines |
| Monorepo | sim/não | dois pacotes (backend|api|server + frontend|web|client) com `package.json`/lockfile próprios |

### 3. Solicitar informações faltantes (se necessário)

Se não conseguir detectar automaticamente:

```
Não encontrei [informação]. Para configurar o quality gate:
  - Nome do projeto (para SonarQube): ex: NOC-PH3A
  - Diretório de testes backend: ex: backend/tests
  - Diretório de sources frontend: ex: frontend/src
```

### 4. Gerar os artefatos

Com base na detecção, gerar TODOS os arquivos abaixo adaptados ao projeto.

---

## Artefatos a Gerar

### 4.1 — `scripts/quality-gate.js`

Ratchet-based quality gate. Adaptar as funções `measure*` à stack detectada.

**Para backend Python + frontend TypeScript (padrão NOC-PH3A):**

```javascript
#!/usr/bin/env node
// scripts/quality-gate.js
//
// Quality gate com ratchet — {{PROJECT_NAME}}
//
//   node scripts/quality-gate.js           → verifica regressões (CI)
//   node scripts/quality-gate.js --update  → avança baseline para métricas que melhoraram

'use strict';

const { spawnSync } = require('child_process');
const fs   = require('fs');
const path = require('path');

const ROOT          = path.resolve(__dirname, '..');
const BASELINE_FILE = path.join(ROOT, 'quality-baseline.json');
const UPDATE        = process.argv.includes('--update');
const CPD_OUT       = path.join(ROOT, '.jscpd-report');

// ─── Coleta ──────────────────────────────────────────────────────────────────

function measureBackend() {
  const proc = spawnSync(
    'python3',
    ['-m', 'pytest', '{{BACKEND_TESTS_DIR}}', '--tb=no', '-q'],
    { cwd: ROOT, encoding: 'utf8' }
  );
  const out = (proc.stdout ?? '') + (proc.stderr ?? '');

  const sm  = out.match(/(\d+) passed(?:,\s+(\d+) failed)?/);
  const cov = out.match(/^TOTAL\s+\d+\s+\d+\s+(\d+)%/m);

  return {
    passed:   sm  ? +sm[1]          : 0,
    failed:   sm  ? +(sm[2] ?? '0') : 0,
    coverage: cov ? +cov[1]         : null,
  };
}

function measureFrontend() {
  const tsc  = path.join(ROOT, '{{FRONTEND_DIR}}', 'node_modules', '.bin', 'tsc');
  // ⚠ `-p {{TSCONFIG_APP}}`, não o tsconfig.json raiz — ver a nota abaixo.
  const proc = spawnSync(tsc, ['-p', '{{TSCONFIG_APP}}', '--noEmit'],
    { cwd: path.join(ROOT, '{{FRONTEND_DIR}}'), encoding: 'utf8' });

  if (proc.error) return { ts_errors: null };
  const out = (proc.stdout ?? '') + (proc.stderr ?? '');
  return { ts_errors: (out.match(/error TS\d+/g) ?? []).length };
}

function measureDuplicates() {
  const jscpd = path.join(ROOT, '{{FRONTEND_DIR}}', 'node_modules', '.bin', 'jscpd');
  if (!fs.existsSync(jscpd)) return { pct: null };

  spawnSync(
    jscpd,
    ['{{BACKEND_SRC_DIR}}', '{{FRONTEND_SRC_DIR}}',
     '--reporters', 'json',
     '--output', CPD_OUT,
     '--silent'],
    { cwd: ROOT, encoding: 'utf8' }
  );

  try {
    const report = JSON.parse(
      fs.readFileSync(path.join(CPD_OUT, 'jscpd-report.json'), 'utf8')
    );
    const raw = report?.statistics?.total?.percentage ?? null;
    return { pct: raw !== null ? Math.round(raw * 10) / 10 : null };
  } catch {
    return { pct: null };
  }
}

// ─── Baseline ────────────────────────────────────────────────────────────────

function loadBaseline() {
  if (!fs.existsSync(BASELINE_FILE)) return {};
  try { return JSON.parse(fs.readFileSync(BASELINE_FILE, 'utf8')).metrics ?? {}; }
  catch { return {}; }
}

function saveBaseline(metrics) {
  fs.writeFileSync(
    BASELINE_FILE,
    JSON.stringify({ updated: new Date().toISOString().slice(0, 10), metrics }, null, 2) + '\n'
  );
}

// ─── Avaliação ────────────────────────────────────────────────────────────────

// dir: 'asc' = maior é melhor | 'desc' = menor é melhor
function evaluate(label, current, saved, dir) {
  if (current === null || current === undefined)
    return { label, current: null, saved, dir, status: 'skip' };
  if (saved === null || saved === undefined)
    return { label, current, saved: null, dir, delta: null, status: 'new' };

  const delta  = current - saved;
  const better = dir === 'asc' ? delta > 0 : delta < 0;
  return { label, current, saved, dir, delta, status: delta === 0 ? 'equal' : better ? 'improved' : 'regressed' };
}

function ratchet(current, saved, dir) {
  if (current === null || current === undefined) return saved ?? null;
  if (saved   === null || saved   === undefined) return current;
  return dir === 'asc' ? Math.max(current, saved) : Math.min(current, saved);
}

// ─── Apresentação ────────────────────────────────────────────────────────────

const ICONS = { improved: '↑', equal: '=', regressed: '✗', skip: '—', new: '+' };

function row(r) {
  const icon  = ICONS[r.status] ?? '?';
  const base  = r.saved   != null ? String(r.saved)   : '—';
  const cur   = r.current != null ? String(r.current) : 'n/a';
  const delta = r.delta != null && r.delta !== 0
    ? ` (${r.delta > 0 ? '+' : ''}${r.delta})`
    : '';
  return `  ${icon}  ${r.label.padEnd(38)} ${base.padStart(8)}  ${(cur + delta).padStart(10)}`;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  process.stdout.write('Coletando métricas...\n\n');

  const be  = measureBackend();
  const fe  = measureFrontend();
  const cpd = measureDuplicates();
  const b   = loadBaseline();

  const results = [
    evaluate('Backend — testes passando',    be.passed,    b.backend_tests_passed, 'asc' ),
    evaluate('Backend — testes falhando',    be.failed,    b.backend_tests_failed, 'desc'),
    evaluate('Backend — cobertura (%)',       be.coverage,  b.backend_coverage_pct, 'asc' ),
    evaluate('Frontend — erros TypeScript',  fe.ts_errors, b.frontend_ts_errors,   'desc'),
    evaluate('Duplicação de código (%)',      cpd.pct,      b.code_duplicates_pct,  'desc'),
  ];

  console.log(`  ${'Métrica'.padEnd(38)} ${'Baseline'.padStart(8)}  ${'Atual'.padStart(10)}`);
  console.log('  ' + '─'.repeat(62));
  results.forEach(r => console.log(row(r)));
  console.log('');

  const regressions  = results.filter(r => r.status === 'regressed');
  const improvements = results.filter(r => r.status === 'improved' || r.status === 'new');

  if (UPDATE) {
    const updated = {
      backend_tests_passed: ratchet(be.passed,    b.backend_tests_passed, 'asc' ),
      backend_tests_failed: ratchet(be.failed,    b.backend_tests_failed, 'desc'),
      backend_coverage_pct: ratchet(be.coverage,  b.backend_coverage_pct, 'asc' ),
      frontend_ts_errors:   ratchet(fe.ts_errors, b.frontend_ts_errors,   'desc'),
      code_duplicates_pct:  ratchet(cpd.pct,      b.code_duplicates_pct,  'desc'),
    };
    saveBaseline(updated);

    if (improvements.length > 0) {
      console.log(`Baseline atualizado — ${improvements.length} melhoria(s):`);
      improvements.forEach(r =>
        console.log(`  ↑  ${r.label}: ${r.saved ?? '—'} → ${r.current}`)
      );
    } else {
      console.log('Baseline sem alteração (nenhuma melhoria detectada).');
    }
    console.log('');
  }

  if (regressions.length > 0) {
    process.stderr.write(`✗ Quality gate: ${regressions.length} regressão(ões)\n\n`);
    regressions.forEach(r => {
      const op = r.dir === 'asc' ? '>=' : '<=';
      process.stderr.write(`   ${r.label}: esperado ${op}${r.saved}, obtido ${r.current}\n`);
    });
    process.stderr.write('\n');
    process.exit(1);
  }

  console.log('✓ Quality gate: OK');
}

main();
```

> ### ⚠ Antes de confiar em `ts_errors`: prove que o tsc está vendo os arquivos
>
> Scaffold Vite/Lovable/CRA moderno entrega **três** tsconfig: `tsconfig.json` (solução),
> `tsconfig.app.json` (o código) e `tsconfig.node.json` (as ferramentas). O raiz costuma ser
> `{"files": [], "references": [...]}` — e `tsc --noEmit` contra ele **compila zero arquivo e
> sai com 0**. A métrica nasce verde e nunca fica vermelha: teatro perfeito.
>
> Descubra qual arquivo usar com dois comandos, sempre, antes de gravar o baseline:
>
> ```bash
> cd <FRONTEND_DIR>
> ./node_modules/.bin/tsc --noEmit --listFiles | grep -c "/src/"                 # 0 = cego
> ./node_modules/.bin/tsc -p tsconfig.app.json --noEmit --listFiles | grep -c "/src/"
> ```
>
> E confirme com **probe invertido** — acrescente `const x: number = "erro";` a um arquivo de
> `src/`, rode os dois, e veja qual acusa. Medido no DATA-DOSSIE: o raiz reportou **0 erros**
> sobre **0 arquivos**; o `tsconfig.app.json`, 1 erro sobre 306 arquivos. Substitua
> `{{TSCONFIG_APP}}` pelo que acusou. Se o projeto tem um único `tsconfig.json` com `include`,
> use `['--noEmit']` sem `-p` — o probe também confirma isso.
>
> O mesmo vale para o backend: um `tsconfig.typecheck.json` separado no repo é sinal de que o
> default diverge, e o probe custa dois minutos.

**Para monorepo Node (api/ + web/, Jest + Vitest, pnpm)** — verificado no fixture `examples/esqueleto-fullstack`:

- `measureBackend()`: rode o Jest do pacote com `--coverage --coverageReporters=json-summary --json --outputFile=<tmp>` e
  leia `numPassedTests`, `numFailedTests` **+ `numRuntimeErrorTestSuites`** (suíte que nem compila não pode contar
  como "0 falhas") e `coverage-summary.json → total.lines.pct`. Se o processo sair ≠ 0 e `failed` der 0, grave `failed = 1`.
- `measureFrontend()`: `vitest run --reporter=json --outputFile=<tmp>`; `tsc -p tsconfig.app.json --noEmit` por pacote
  (ver o aviso do probe invertido abaixo — vale para o backend também).
- `measureDuplicates()`: `jscpd <BACKEND_DIR>/src <FRONTEND_DIR>/src` com o binário do **pnpm da raiz** (ou do pacote).
- **Métrica essencial que não mediu é regressão, não `skip`**: testes e erros de tipo não podem ficar `—`. Marque
  `ESSENCIAIS = new Set([...])` e transforme `skip` em `regressed ("não medido")` para essas chaves — senão um Jest
  quebrado deixa o gate verde.
- `--update` **nunca grava semente**: com medição ausente e sem valor salvo a chave fica fora do arquivo (em vez de
  `999`/`100`), e com valor salvo o salvo é preservado. Quem confere o baseline é um verificador (métrica ausente,
  `null`, valor-semente ou `testes <= 0` ⇒ exit ≠ 0), porque o gate trata métrica sem valor salvo como "nova" e passa.
- Cada guard (`complexity`, `arch`, `io`, `memory`…) aparece na tabela **se o scanner existe**, mesmo com valor nulo
  (ver `instalado()` na skill `/complexity-guard`).
- **SCA e `QUALITY_GATE_SEM_SCA`.** `measureSca()` lê `.sca-report.json` (gravado por `scripts/sca-scan.sh`, da skill
  `/sca-guard`); o gate nunca roda o audit ao vivo. Variável opcional **`QUALITY_GATE_SEM_SCA=1`**: com ela o gate não
  avalia `sca_high`/`sca_critical` (nem as inclui na tabela). Só vale em gates que a leem — leia-a no topo
  (`const SEM_SCA = process.env.QUALITY_GATE_SEM_SCA === '1'`) e condicione `measureSca()` e as duas linhas a
  `!SEM_SCA && instalado('scripts', 'sca-scan.sh')`. **Não a use no CI para "não depender de rede"**: o SCA some do
  pipeline sem substituto. O padrão é rodar `bash scripts/sca-scan.sh` num step próprio (ver `/ci-pipeline`) e deixar o
  gate ler o relatório: `null` (não medido) vira `skip`, subida de high/critical vira regressão.
- **Dado pessoal em log não é métrica.** `obs_sensitive_in_log > 0` (da skill `/observability-guard`) entra em `results`
  como regressão sem baseline: reprova sempre.

**Para projetos somente Node.js (sem backend Python):**
- Remover `measureBackend()` e suas métricas
- Adaptar `measureFrontend()` para o diretório raiz se não houver `frontend/`
- Usar `npm test` com Jest/Vitest em vez de pytest

**Para projetos somente Python (sem frontend TypeScript):**
- Remover `measureFrontend()` e `measureDuplicates()` (ou ajustar para usar jscpd Python-only)
- Manter só as métricas `backend_*`

**Para monolito Node.js (sem subdiretório `frontend/`):**
- `tsc` em `ROOT` em vez de `ROOT/frontend`
- `jscpd` em `src/` em vez de `backend/src` e `frontend/src`

---

### 4.2 — `quality-baseline.json`

Baseline inicial zerado. O ratchet vai avançando automaticamente a cada release.

```json
{
  "updated": "{{HOJE}}",
  "metrics": {
    "backend_tests_passed": 0,
    "backend_tests_failed": 0,
    "backend_coverage_pct": 0,
    "frontend_ts_errors": 0,
    "code_duplicates_pct": 100
  }
}
```

> **Nota:** Omitir métricas irrelevantes para a stack. Ex: projeto só Python → remover `frontend_ts_errors` e `code_duplicates_pct` (ou adaptá-las).

---

### 4.3 — `.jscpdrc.json`

Configuração de detecção de código duplicado.

```json
{
  "minLines": 5,
  "minTokens": 50,
  "ignore": [
    "**/node_modules/**",
    "**/dist/**",
    "**/coverage/**",
    "**/__pycache__/**",
    "**/*.spec.ts",
    "**/*.test.ts",
    "**/*.spec.py",
    "**/*.test.py"
  ]
}
```

---

### 4.4 — `scripts/release.sh`

Script de versionamento semântico automático via Conventional Commits.
Adaptar a referência ao nome do projeto no changelog.

```bash
#!/usr/bin/env bash
set -euo pipefail

APPLY=0
if [ "${1:-}" = "--apply" ]; then
  APPLY=1
fi

CURRENT_VERSION="$(tr -d '[:space:]' < VERSION 2>/dev/null || printf '0.0.0')"
LATEST_TAG="$(git describe --tags --abbrev=0 --match 'v[0-9]*.[0-9]*.[0-9]*' 2>/dev/null || true)"

if [ -n "$LATEST_TAG" ]; then
  RANGE="${LATEST_TAG}..HEAD"
else
  RANGE="HEAD"
fi

COMMITS="$(git log --format=%s "$RANGE" 2>/dev/null || true)"

IFS=. read -r MAJOR MINOR PATCH <<EOF
$CURRENT_VERSION
EOF

MAJOR="${MAJOR:-0}"
MINOR="${MINOR:-0}"
PATCH="${PATCH:-0}"

BUMP="patch"
if printf '%s\n' "$COMMITS" | grep -Eq '(^|!:)BREAKING CHANGE|^[a-z]+(\([^)]+\))?!:'; then
  BUMP="major"
elif printf '%s\n' "$COMMITS" | grep -Eq '^feat(\([^)]+\))?:'; then
  BUMP="minor"
elif printf '%s\n' "$COMMITS" | grep -Eq '^(fix|perf)(\([^)]+\))?:'; then
  BUMP="patch"
fi

case "$BUMP" in
  major) MAJOR=$((MAJOR + 1)); MINOR=0; PATCH=0 ;;
  minor) MINOR=$((MINOR + 1)); PATCH=0 ;;
  patch) PATCH=$((PATCH + 1)) ;;
esac

NEXT_VERSION="${MAJOR}.${MINOR}.${PATCH}"

if [ "$APPLY" -eq 0 ]; then
  printf '%s\n' "$NEXT_VERSION"
  exit 0
fi

TODAY="$(date +%F)"
TMP_CHANGELOG="$(mktemp)"

{
  printf '# Changelog\n\n'
  printf 'All notable changes to {{PROJECT_NAME}} will be documented in this file.\n\n'
  printf '## [%s] - %s\n\n' "$NEXT_VERSION" "$TODAY"
  if [ -n "$COMMITS" ]; then
    printf '%s\n' "$COMMITS" | sed '/^[[:space:]]*$/d; s/^/- /'
  else
    printf -- '- Maintenance release.\n'
  fi
  printf '\n'
  if [ -f CHANGELOG.md ]; then
    awk 'NR > 4 { print }' CHANGELOG.md
  fi
} > "$TMP_CHANGELOG"

printf '%s\n' "$NEXT_VERSION" > VERSION
mv "$TMP_CHANGELOG" CHANGELOG.md
printf '%s\n' "$NEXT_VERSION"
```

---

### 4.5 — `scripts/sonar-scan.sh`

Script de execução do SonarQube Scanner via Docker.

```bash
#!/usr/bin/env bash
# scripts/sonar-scan.sh — roda o SonarQube Scanner localmente via Docker
#
# Pré-requisitos:
#   - SonarQube rodando: docker compose -f infra/compose.yml up sonarqube -d
#   - Token gerado em http://localhost:9000 → My Account → Security → Generate Token
#   - Token salvo em .sonar-token (gitignored) ou exportado como SONAR_TOKEN
#
# Uso:
#   ./scripts/sonar-scan.sh
#   SONAR_TOKEN=<token> ./scripts/sonar-scan.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

TOKEN="${SONAR_TOKEN:-$(cat "$ROOT/.sonar-token" 2>/dev/null | tr -d '[:space:]' || true)}"
if [ -z "$TOKEN" ]; then
  echo "Erro: SONAR_TOKEN não definido."
  echo "Opções:"
  echo "  export SONAR_TOKEN=<token>"
  echo "  echo '<token>' > .sonar-token   (gitignored)"
  exit 1
fi

echo "Gerando relatórios de coverage..."

cd "$ROOT"
# Adaptar conforme stack detectada:
{{COVERAGE_COMMANDS}}

echo "Iniciando scan SonarQube..."
SONAR_TOKEN="$TOKEN" docker compose -f infra/compose.yml --profile scan run --rm sonar-scanner
```

**`{{COVERAGE_COMMANDS}}` por stack:**

Para Python + frontend:
```bash
python3 -m pytest --tb=no -q 2>/dev/null || true
cd "$ROOT/frontend"
node_modules/.bin/vitest run --coverage --reporter=silent 2>/dev/null || true
cd "$ROOT"
```

Para Python apenas:
```bash
python3 -m pytest --tb=no -q 2>/dev/null || true
```

Para Node.js apenas:
```bash
npm run test:coverage --silent 2>/dev/null || true
```

---

### 4.6 — `scripts/sonar-report.sh`

Script para buscar métricas e issues do SonarQube e salvar em `sonar-report.json`.
Substituir `PROJECT="{{PROJECT_NAME}}"` pelo nome real.

A fonte é o `scripts/sonar-report.sh` do BoilerplateIA (a mesma que o NOC-PH3A usa em
`PROJETOS/NOC-PH3A/scripts/`): copie e substitua só a linha `PROJECT="..."` pelo nome do projeto alvo.
O caminho antigo (`/home/johnny/GIT/PH3A/NOC-PH3A/...`) não existe — o NOC fica sob `PROJETOS/`.

> **Segredos:** troque `curl -u "$TOKEN:"` por um cabeçalho montado antes
> (`AUTH_HEADER="Authorization: Basic $(printf '%s:' "$TOKEN" | base64 -w0)"` e `curl -H "$AUTH_HEADER"`). O gitleaks
> (regra `curl-auth-user`) confunde `-u "$TOKEN:"` com credencial literal e reprova o repositório inteiro.

---

### 4.7 — `sonar-project.properties`

**Gerar apenas se não existir.**

```properties
sonar.projectKey={{PROJECT_KEY}}
sonar.projectName={{PROJECT_NAME}}
sonar.sourceEncoding=UTF-8

# Fontes e testes
sonar.sources={{SONAR_SOURCES}}
sonar.tests={{SONAR_TESTS}}

sonar.exclusions=\
  **/node_modules/**,\
  **/dist/**,\
  **/coverage/**,\
  **/__pycache__/**,\
  **/.venv/**,\
  specs/**,\
  docs/**,\
  infra/**,\
  frontend/src/**/*.test.ts,\
  frontend/src/**/*.test.tsx,\
  frontend/src/**/*.spec.ts,\
  frontend/src/**/*.spec.tsx

sonar.coverage.exclusions=\
  {{SONAR_TESTS}}/**,\
  {{FRONTEND_DIR}}/src/main.tsx,\
  {{FRONTEND_DIR}}/src/index.tsx

# Python (backend) — remover se não houver Python
sonar.python.version=3.11
sonar.python.coverage.reportPaths=coverage-backend.xml
sonar.python.xunit.reportPath=test-results-backend.xml

# TypeScript (frontend) — remover se não houver TypeScript
sonar.javascript.lcov.reportPaths={{FRONTEND_DIR}}/coverage/lcov.info
sonar.typescript.lcov.reportPaths={{FRONTEND_DIR}}/coverage/lcov.info
```

**Mapeamento `{{SONAR_SOURCES}}` por stack:**
- Python + React: `backend/src,frontend/src`
- Python apenas: `src` ou `backend/src`
- Node.js apenas: `src`

---

### 4.8 — Git Hooks

Criar em `scripts/hooks/`:

**`scripts/hooks/pre-commit`** — roda quality gate antes de commit:
```bash
#!/usr/bin/env bash
set -euo pipefail
echo "→ Quality gate (pre-commit)..."
node scripts/quality-gate.js
```

**`scripts/hooks/commit-msg`** — valida Conventional Commits:
```bash
#!/usr/bin/env bash
# Valida formato: type(scope)?: description
COMMIT_MSG="$(cat "$1")"
PATTERN='^(feat|fix|docs|style|refactor|perf|test|chore|ci|build|revert)(\(.+\))?(!)?: .{1,100}'
if ! echo "$COMMIT_MSG" | grep -Eq "$PATTERN"; then
  echo "Erro: commit message não segue Conventional Commits."
  echo "Formato: type(scope)?: description"
  echo "Tipos: feat|fix|docs|style|refactor|perf|test|chore|ci|build|revert"
  echo "Exemplo: feat(auth): adicionar login com OAuth"
  exit 1
fi
```

**`scripts/hooks/install-hooks.sh`** — instala os hooks acima **só se o alvo for a raiz do próprio repositório git**:
```bash
#!/usr/bin/env bash
set -euo pipefail
HOOKS_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HOOKS_DIR/../.." && pwd)"

# Dentro de outro repositório (fixture, monorepo, subpasta), o git-dir resolvido é o do HOSPEDEIRO e o
# hook sobrescreveria o dele — um efeito colateral que ninguém pediu.
TOPLEVEL="$(git -C "$ROOT" rev-parse --show-toplevel 2>/dev/null || true)"
if [ -z "$TOPLEVEL" ] || [ "$(cd "$TOPLEVEL" && pwd -P)" != "$(cd "$ROOT" && pwd -P)" ]; then
  echo "⚠ $ROOT não é a raiz de um repositório git (raiz: ${TOPLEVEL:-nenhuma})."
  echo "  Nada foi instalado nos hooks do git. Os hooks ficam disponíveis em scripts/hooks/."
  # exit 0: este script é chamado por `npm prepare`/`postinstall`; sair ≠ 0 quebraria o `npm install` de quem
  # clona o projeto como subpasta/fixture. O aviso acima basta.
  exit 0
fi

GIT_HOOKS="$(git -C "$ROOT" rev-parse --git-dir)/hooks"
for hook in pre-commit commit-msg post-commit; do
  src="$HOOKS_DIR/$hook"
  dst="$GIT_HOOKS/$hook"
  if [ -f "$src" ]; then
    cp "$src" "$dst"
    chmod +x "$dst"
    echo "  ✓ $hook instalado"
  fi
done
echo "Git hooks instalados em $GIT_HOOKS"
```

---

### 4.9 — `.gitignore` (adições)

Verificar se `.gitignore` existe e adicionar entradas se não estiverem presentes:

```
# Quality Gate
.jscpd-report/
.sonar-token
.sonar-user-token
coverage-backend.xml
test-results-backend.xml
```

---

### 4.10 — `VERSION` (arquivo de versão)

Se não existir:
```
0.0.0
```

---

## Regras de Substituição de Variáveis

| Variável | Como detectar |
|----------|---------------|
| `{{PROJECT_NAME}}` | Resolver em runtime: canon `gemeo/00-CANON/canon.yaml` → CLAUDE.md → `name` do package.json → nome do diretório raiz. Nunca deixar `{{PROJECT_NAME}}` cru na saída gerada. |
| `{{PROJECT_KEY}}` | Igual a `{{PROJECT_NAME}}`, uppercase com hífens |
| `{{BACKEND_TESTS_DIR}}` | Buscar por `tests/`, `test/` dentro de `backend/` |
| `{{BACKEND_SRC_DIR}}` | `backend/src` ou `src/` se não houver `backend/` |
| `{{FRONTEND_DIR}}` | `frontend` se existir, ou `.` |
| `{{FRONTEND_SRC_DIR}}` | `frontend/src` ou `src` |
| `{{SONAR_SOURCES}}` | Detectado pela stack |
| `{{SONAR_TESTS}}` | Diretório de testes backend |
| `{{HOJE}}` | Data atual em formato `YYYY-MM-DD` |

---

## Permissões dos Scripts

Após criar os arquivos `.sh`, torná-los executáveis:

```bash
chmod +x scripts/quality-gate.js
chmod +x scripts/release.sh
chmod +x scripts/sonar-scan.sh
chmod +x scripts/sonar-report.sh
chmod +x scripts/hooks/pre-commit
chmod +x scripts/hooks/commit-msg
chmod +x scripts/hooks/install-hooks.sh
```

---

## Verificações Pós-Criação

Após gerar os arquivos, verificar:

1. **Executar dry-run** (se o projeto tiver dependências instaladas):
   ```bash
   node scripts/quality-gate.js
   ```
   Se falhar por dependências ausentes, informar o usuário com os comandos para instalá-las.

2. **Verificar baseline inicial**: O `quality-baseline.json` começa com zeros (exceto `code_duplicates_pct: 100`). Na primeira execução real, rodar `--update` para capturar o estado atual:
   ```bash
   node scripts/quality-gate.js --update
   ```

3. **Instalar git hooks** (opcional, informar o usuário):
   ```bash
   bash scripts/hooks/install-hooks.sh
   ```

---

## Saída ao Usuário

Ao concluir, exibir um resumo:

```
✓ Quality gate instalado em <PROJETO_ROOT>

Arquivos criados:
  scripts/quality-gate.js        — ratchet de métricas (CI + local)
  scripts/release.sh             — versionamento semântico automático
  scripts/sonar-scan.sh          — scan SonarQube via Docker
  scripts/sonar-report.sh        — coleta métricas/issues do SonarQube
  scripts/hooks/pre-commit       — valida métricas antes de commit
  scripts/hooks/commit-msg       — enforça Conventional Commits
  scripts/hooks/install-hooks.sh — instala os hooks acima
  quality-baseline.json          — baseline inicial (zeros)
  .jscpdrc.json                  — configuração de detecção de duplicatas
  sonar-project.properties       — configuração do SonarQube

Próximos passos:
  1. Instalar dependências (pytest-cov, jscpd):
     pip install pytest pytest-cov
     cd frontend && npm install jscpd --save-dev

  2. Capturar baseline do estado atual:
     node scripts/quality-gate.js --update

  3. (Opcional) Instalar git hooks:
     bash scripts/hooks/install-hooks.sh

  4. Commitar os arquivos:
     git add scripts/ quality-baseline.json .jscpdrc.json sonar-project.properties VERSION
     git commit -m "chore(ci): instalar quality gate com ratchet pattern"
```

---

## Notas Importantes

- **Nunca sobrescrever** `quality-baseline.json` se já existir — apenas informar o usuário.
- **Nunca sobrescrever** `sonar-project.properties` se já existir — apenas informar divergências.
- Se o projeto não tiver `scripts/` criado, criar o diretório.
- Para projetos com **somente frontend** (sem backend Python/Node separado), simplificar o `quality-gate.js` removendo as métricas inexistentes.
- O arquivo `scripts/sonar-report.sh` requer um **User Token** do SonarQube (diferente do Analysis Token) — documentar isso claramente no output ao usuário.
- O `scripts/release.sh` requer que o projeto use **Conventional Commits** — mencionar isso se o projeto não parecer usá-los.

---

## Exemplos de Uso

```
/quality-gate /home/johnny/GIT/PH3A/MeuProjeto
/quality-gate ../OutroProjeto
/quality-gate                        (usa o diretório atual)
/quality-gate . --sonar-only         (apenas sonar-project.properties)
/quality-gate . --hooks-only         (apenas git hooks)
```
