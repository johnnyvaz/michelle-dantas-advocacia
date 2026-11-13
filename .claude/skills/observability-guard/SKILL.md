---
name: observability-guard
description: Observabilidade e trilhas de auditoria para projetos PH3A conforme NORM04 (Log e Trilhas de Auditoria). Análise estática que detecta logging não-estruturado (print/console.log), handlers sem log, falta de correlation/request ID e dados sensíveis em log (LGPD). Gera templates de logging estruturado (Python/structlog, Node/pino), middleware de correlation ID e helper de trilha de auditoria. Adiciona métricas obs_unstructured_logs e obs_missing_audit ao ratchet do quality-gate. Requer quality-gate instalado. Invoque com /observability-guard [caminho].
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
---

# Skill: Observability Guard — Logging Estruturado e Auditoria (PH3A)

Operacionaliza a **NORM04 (Log e Trilhas de Auditoria)**: garante que o sistema é observável e auditável —
logs estruturados, rastreáveis por requisição, e trilha de quem fez o quê em operações sensíveis — **sem vazar
dados pessoais** (LGPD/NORM16).

> **Pré-requisito:** quality gate instalado (`scripts/quality-gate.js`) — esta skill adiciona métricas ao ratchet.
> Se faltar, oriente `/quality-gate` (ou `/ph3a-loop qualidade`) antes.

---

## Passo 1 — Detectar stack e estado atual

```bash
ls scripts/quality-gate.js 2>/dev/null
# Diretórios de produção DESCOBERTOS (pastas de primeiro nível, sem testes/dependências) — o alvo pode usar
# backend/ + frontend/, api/ + web/, src/... Nunca assuma os nomes.
DIRS=$(ls -d */ 2>/dev/null | grep -Ev "^(node_modules|dist|build|coverage|migrations|e2e|tests|test|scripts|venv|\.venv|env|vendor|bin|obj|target|docs|examples|out)/$")
EXCL="--exclude-dir=node_modules --exclude-dir=__tests__ --exclude-dir=tests --exclude-dir=test --exclude-dir=venv --exclude-dir=.venv --exclude-dir=env --exclude-dir=vendor --exclude-dir=bin --exclude-dir=obj --exclude-dir=target --exclude-dir=docs --exclude-dir=examples --exclude-dir=dist --exclude-dir=build --exclude-dir=.next"
# Node/TS: logger atual?
grep -rnE "console\.(log|info|warn|error)" $DIRS --include=*.ts --include=*.js $EXCL | head
find . -maxdepth 2 -name package.json -not -path "*/node_modules/*" | xargs grep -liE "pino|winston" 2>/dev/null
# Python: logger atual?
grep -rnE "(^|[^.])print\(" $DIRS --include=*.py $EXCL | head
grep -rniE "structlog|loguru|logging" $DIRS --include=*.py $EXCL | head
```

## Passo 2 — Análise estática (achados)

Detectar e listar por severidade:

1. **Log não-estruturado** — `print(...)` / `console.log(...)` em código de produção (fora de testes/scripts).
   Deve ser substituído pelo logger estruturado.
2. **Handler/endpoint sem log** — rotas/controllers/use-cases sem nenhum log de entrada/erro.
3. **Sem correlation/request ID** — ausência de middleware que injeta um ID por requisição e o propaga aos logs.
4. **Dado sensível em log (LGPD)** — log de CPF, CNPJ, e-mail, token, senha, cartão. **Crítico** — apontar e
   sugerir mascaramento (`/anonymize-data`) ou remoção.

## Passo 3 — Gerar templates de logging estruturado

**Python (structlog)** — `app/observability/logging.py`:
```python
import structlog, logging

def configure_logging(level="INFO"):
    structlog.configure(
        processors=[
            structlog.contextvars.merge_contextvars,   # correlation id
            structlog.processors.add_log_level,
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.JSONRenderer(),        # saída estruturada
        ],
        wrapper_class=structlog.make_filtering_bound_logger(logging.getLevelName(level)),
    )

log = structlog.get_logger()
```
Middleware (FastAPI) que injeta `request_id`:
```python
import uuid, structlog
async def request_id_middleware(request, call_next):
    rid = request.headers.get("x-request-id") or str(uuid.uuid4())
    structlog.contextvars.bind_contextvars(request_id=rid)
    resp = await call_next(request)
    resp.headers["x-request-id"] = rid
    return resp
```

**Node/TS (pino)** — `src/observability/logger.ts`:
```ts
import pino from 'pino'
export const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  redact: ['*.password', '*.token', '*.cpf', 'req.headers.authorization'], // LGPD: nunca logar
  formatters: { level: (label) => ({ level: label }) },
  timestamp: pino.stdTimeFunctions.isoTime,
})
// middleware: gerar/propagar x-request-id e usar logger.child({ requestId })
```

## Passo 4 — Trilha de auditoria (NORM04)

Helper para registrar **quem / o quê / quando** em operações sensíveis (login, alteração de dados pessoais,
acesso privilegiado, export). Campos mínimos: `actor`, `action`, `resource`, `timestamp`, `request_id`,
`result`. Nunca incluir o dado sensível em si — só a referência (id) e o tipo de operação.

```ts
audit({ actor: user.id, action: 'update', resource: `cliente:${id}`, result: 'ok' })
```

Forma que escala (verificada no fixture `examples/esqueleto-fullstack`): um **middleware de rota** que registra a
trilha quando a resposta termina (`res.on('finish')`), decidindo o `result` pelo status final (2xx/3xx `ok`, 401/403
`negado`, resto `erro`) e lendo o ator do token já validado (`anonimo` antes do login). Aplicado em TODA rota que muda
estado ou autentica: `router.post('/clientes', auditar('criar', 'cliente'), handler)`. Sem tocar controller nem caso de
uso, e o scanner abaixo consegue provar por análise estática que nenhuma rota sensível ficou de fora. Um log por
requisição (método, rota sem query, status, duração) no middleware de request id fecha o "handler sem log".

## Passo 5 — Métricas no ratchet

Copie `resources/observability-scan.js` para `scripts/observability-scan.js` (verbatim). Ele descobre os arquivos de
produção **por extensão** (`.py`, `.ts`, `.tsx`, `.js`) em qualquer pasta — `backend/app/...`, `api/src/...`,
`web/src/...`, `src/...` — e ignora dependências, build, testes, ferramentas (`scripts/`, `*.config.*`), venvs (por nome
ou por `pyvenv.cfg`), `docs/` e `examples/`. Ele mede:

- **`obs_unstructured_logs`** — `print`/`console.*` em código de produção (`dir: 'desc'`, só diminui).
- **`obs_missing_audit`** — rotas que mudam estado sem chamada de trilha (`audit(`/`auditar(`) na própria declaração
  (`dir: 'desc'`): Express/Fastify `router|app.post|put|patch|delete(...)` **e** decorators Python
  `@router.post(...)`/`@app.delete(...)` (a trilha vale no decorator, p.ex. `dependencies=[Depends(auditar(...))]`, ou no
  corpo da função).
- `obs_sensitive_in_log` — dado pessoal em log (e-mail, senha, token, CPF...). **Fora do ratchet**: é crítico (LGPD) e o
  scanner sai com código 1 enquanto houver ocorrência.

**Saída 2 = nada foi analisado** (nenhum arquivo de produção encontrado). As três métricas saem `null` no relatório: 0
arquivos analisados não é "0 achados". O gate registra `skip`, nunca um zero que viraria o piso do ratchet.

> **Mudança de padrão (2026-10).** Antes o scanner só olhava `<pasta>/src` e `./src`: um projeto FastAPI com
> `backend/app/` media 0 em tudo. Quem já tinha baseline gravado com o scanner antigo vai ver `obs_*` **subir**. O
> ratchet `desc` usa `min()` e `--update` nunca sobe um valor salvo: depois de conferir que os achados novos são reais,
> **apague a chave** (`obs_unstructured_logs`/`obs_missing_audit`) de `quality-baseline.json` — ela volta como `new` —
> e rode `node scripts/quality-gate.js --update`.

Prove o scanner com um **probe invertido** antes de gravar o baseline: plante um `console.log`/`print`, uma rota POST sem
auditoria (Express **e**, se houver Python, um `@router.post`) e um `logger.info({ email })` e confira que cada contagem
sobe; depois apague.

Acrescente a `scripts/quality-gate.js`. **O gate de LGPD precisa existir na integração**: `obs_sensitive_in_log > 0`
reprova sempre (é regressão fora do ratchet, sem baseline), e relatório sem arquivo analisado vira `skip`:

```js
function measureObservability() {
  const nulo = { obs_unstructured_logs: null, obs_missing_audit: null, obs_sensitive_in_log: null };
  if (!fs.existsSync(path.join(ROOT, 'scripts', 'observability-scan.js'))) return nulo;
  // Exit 1 = dado pessoal em log (o relatório é gravado mesmo assim); exit 2 = nada analisado.
  spawnSync('node', ['scripts/observability-scan.js', '--json'], { cwd: ROOT, encoding: 'utf8' });
  try {
    const rep = JSON.parse(fs.readFileSync(path.join(ROOT, '.observability-report.json'), 'utf8'));
    if (!rep.arquivos_analisados) return nulo;
    return {
      obs_unstructured_logs: rep.obs_unstructured_logs ?? null,
      obs_missing_audit:     rep.obs_missing_audit ?? null,
      obs_sensitive_in_log:  rep.obs_sensitive_in_log ?? null,
    };
  } catch { return nulo; }
}

// Em main(), depois de montar `results` (a linha NÃO entra em `metricas`/--update: não tem baseline):
if ((obs.obs_sensitive_in_log ?? 0) > 0) {
  results.push({ label: 'Dado pessoal em log (LGPD)', current: obs.obs_sensitive_in_log, saved: 0, dir: 'desc',
    delta: obs.obs_sensitive_in_log, status: 'regressed' });
}
```

Some as duas linhas `obs_unstructured_logs`/`obs_missing_audit` ao `results` (condicionadas à **presença do scanner**, não ao
valor) e ao bloco `--update`; grave o baseline com `--update` (nunca semeie número). Adicione
`.observability-report.json` ao `.gitignore`.

## Passo 6 — Testes

Gerar teste que captura a saída de log e **assere que é JSON estruturado e contém `request_id`**; e que uma
operação sensível **emite uma entrada de auditoria** com os campos mínimos.

---

## Saída ao usuário

```
✓ Observability Guard instalado (NORM04)
  Achados: <n> logs não-estruturados, <n> handlers sem log, <n> com dado sensível (LGPD)
  Templates: logging estruturado + correlation id + trilha de auditoria
  Ratchet:   obs_unstructured_logs, obs_missing_audit
Próximo: substituir print/console.log pelos loggers e rodar /quality-check
```

## Notas

- **LGPD em primeiro lugar:** o maior risco de logging é vazar dado pessoal. A regra é logar **referências**, não
  conteúdo sensível; usar `redact`/máscara. Integra com `/anonymize-data` e `/review-code-ph3a`.
- Pareia com `/resilience-guard` (health checks/telemetria) e `/ci-pipeline` (rodar a métrica no PR).
- Aceita caminho como argumento (default: diretório atual).
