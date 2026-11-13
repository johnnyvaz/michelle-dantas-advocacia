#!/usr/bin/env node
// scripts/observability-scan.js
//
// Análise estática de observabilidade (NORM04): logging não estruturado, rota sensível sem trilha de
// auditoria e dado pessoal em log. Alimenta as métricas obs_unstructured_logs e obs_missing_audit do
// quality-gate.
//
//   node scripts/observability-scan.js          → console
//   node scripts/observability-scan.js --json   → grava .observability-report.json
//
// Saída:  0 ok · 1 dado pessoal em log (LGPD: reprova sempre, fora do ratchet)
//         2 NADA foi analisado (nenhum .py/.ts/.tsx/.js de produção encontrado). Nesse caso as métricas saem
//           `null` no relatório: 0 arquivos analisados NÃO é "0 achados" — o gate marca skip, nunca um zero falso.
//
// Os arquivos de produção são descobertos por EXTENSÃO em qualquer pasta (backend/app/..., api/src/...,
// web/src/..., src/...), não por uma pasta `src/` fixa: um projeto FastAPI com `backend/app/` tem o Python visível.
// Fora: dependências, build, testes, ferramentas (scripts/, e2e/, *.config.*), venvs (por nome OU por `pyvenv.cfg`)
// e exemplos/docs. A comparação é pelo NOME da entrada relativa à raiz — nunca pelo caminho absoluto.

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT    = path.resolve(__dirname, '..');
const AS_JSON = process.argv.includes('--json');

// Lista única de exclusão (idêntica nos scanners memory-guard, resilience-scan e arch-tradeoff).
const IGNORADOS = new Set([
  'node_modules', 'dist', 'build', 'coverage', 'migrations', 'e2e', 'tests', 'test', '__tests__', 'scripts',
  'venv', '.venv', 'env', 'vendor', 'bin', 'obj', 'target', 'docs', 'examples', '.next', 'out',
  '__pycache__', 'site-packages', '.git',
]);
const EH_TESTE = /(^|[\\/])(__tests__|test|tests)[\\/]|\.(test|spec)\.[tj]sx?$|(^|[\\/])(test_[^\\/]*|[^\\/]*_test|conftest)\.py$/;
const EH_FERRAMENTA = /(^|[\\/])([^\\/]*\.config(\.[^\\/]+)?\.[cm]?[tj]s|knexfile\.[cm]?[tj]s|setup\.py|manage\.py)$/;

const TRILHA_JS     = /\baudit(ar)?\(/;
const TRILHA_PY     = /\baudit(ar)?\(|\bDepends\(\s*audit/;
// Express/Fastify: <router|app|server|fastify|xxxRouter>.post|put|patch|delete(...)
const ROTA_JS       = /\b(router|app|server|fastify|\w+Router)\.(post|put|patch|delete)\(([\s\S]*?)\);/g;
// FastAPI/Flask/Starlette: @router.post("/x") · @app.delete(...) · @bp.put(...)
const ROTA_PY       = /^[ \t]*@\w+(?:\.\w+)*\.(post|put|patch|delete)\(/gm;
const CONSOLE       = /\bconsole\.(log|info|warn|error|debug)\(/g;
const PRINT_PY      = /(^|[^.\w])print\(/g;
const DADO_SENSIVEL_EM_LOG =
  /\b(log|logger)\.(trace|debug|info|warn|warning|error|fatal|critical)\([^)]*\b(email|senha|password|token|cpf|authorization)\b/i;
// CNPJ identifica pessoa jurídica: fora da LGPD, não é achado.

/**
 * Texto fixo entre aspas não vaza ("falha ao validar token"). O conteúdo de `${...}` fica: interpolar o e-mail
 * no texto da mensagem continua sendo achado.
 */
function semTextoFixo(linha) {
  return linha
    .replace(/'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"/g, "''")
    .replace(/`(?:[^`\\]|\\.)*`/g, (t) => (t.match(/\$\{[^}]*\}/g) ?? []).join(' '));
}

/** O próprio logger é o destino autorizado do console: não conta como log solto. */
const EH_LOGGER = /(^|[\\/])(logging|logger)([\\/]|\.[cm]?[jt]s$)/i;

function ehVenv(dir) {
  return fs.existsSync(path.join(dir, 'pyvenv.cfg'));
}

function listar(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORADOS.has(e.name) || e.name.startsWith('.')) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (!ehVenv(p)) listar(p, acc); continue; }
    const rel = path.relative(ROOT, p);
    if (/\.(ts|tsx|js|jsx|py)$/.test(e.name) && !/\.d\.ts$/.test(e.name)
        && !EH_TESTE.test(rel) && !EH_FERRAMENTA.test(rel)) acc.push(p);
  }
  return acc;
}

// Texto balanceado a partir do '(' em `abre` (ignora parênteses dentro de strings).
function argumentosBalanceados(texto, abre) {
  let prof = 0, aspas = null;
  for (let i = abre; i < texto.length; i++) {
    const c = texto[i];
    if (aspas) { if (c === '\\') i++; else if (c === aspas) aspas = null; continue; }
    if (c === '"' || c === "'" || c === '`') aspas = c;
    else if (c === '(') prof++;
    else if (c === ')' && --prof === 0) return texto.slice(abre, i + 1);
  }
  return texto.slice(abre);
}

// Corpo da função que o decorator anota: da linha do `def` até a próxima linha de indentação <= a do decorator.
function corpoDaFuncao(linhas, idxDecorator) {
  const indent = (l) => l.match(/^[ \t]*/)[0].length;
  const base = indent(linhas[idxDecorator]);
  let i = idxDecorator + 1;
  while (i < linhas.length && /^\s*@/.test(linhas[i])) i++;           // outros decorators empilhados
  const corpo = [];
  for (; i < linhas.length; i++) {
    const l = linhas[i];
    if (corpo.length > 0 && l.trim() && indent(l) <= base && !/^\s*[)\]]/.test(l)) break;
    corpo.push(l);
  }
  return corpo.join('\n');
}

// Arquivo que o git ignora (runtime, venv de nome arbitrário, artefato local) não é código do projeto.
function semIgnoradosPeloGit(lista) {
  const r = require('child_process').spawnSync('git', ['check-ignore', '--stdin'], {
    cwd: ROOT, input: lista.map((a) => path.relative(ROOT, a)).join('\n'), encoding: 'utf8',
  });
  if (r.error || (r.status !== 0 && r.status !== 1)) return lista;   // fora de repositório git: não filtra
  const ignorados = new Set(r.stdout.split('\n').filter(Boolean));
  return lista.filter((a) => !ignorados.has(path.relative(ROOT, a)));
}

const arquivos = semIgnoradosPeloGit(listar(ROOT));
const naoEstruturados = [];
const semAuditoria    = [];
const sensiveis       = [];

for (const arq of arquivos) {
  const rel = path.relative(ROOT, arq);
  const texto = fs.readFileSync(arq, 'utf8');
  const linhas = texto.split('\n');
  const ehPy = arq.endsWith('.py');

  linhas.forEach((linha, i) => {
    if (/^\s*(\/\/|#|\*)/.test(linha)) return;
    if (!EH_LOGGER.test(rel) && (CONSOLE.test(linha) || (ehPy && PRINT_PY.test(linha)))) naoEstruturados.push(`${rel}:${i + 1}`);
    CONSOLE.lastIndex = 0;
    PRINT_PY.lastIndex = 0;
    if (DADO_SENSIVEL_EM_LOG.test(semTextoFixo(linha))) sensiveis.push(`${rel}:${i + 1}`);
  });

  if (ehPy) {
    for (const m of texto.matchAll(ROTA_PY)) {
      const abre = m.index + m[0].length - 1;
      const decl = argumentosBalanceados(texto, abre);
      const idx = texto.slice(0, m.index).split('\n').length;       // 1-based da linha do decorator
      if (!TRILHA_PY.test(decl) && !TRILHA_PY.test(corpoDaFuncao(linhas, idx - 1))) {
        semAuditoria.push(`${rel}:${idx} ${m[1].toUpperCase()}`);
      }
    }
  } else {
    for (const m of texto.matchAll(ROTA_JS)) {
      if (!TRILHA_JS.test(m[3])) {
        const linha = texto.slice(0, m.index).split('\n').length;
        semAuditoria.push(`${rel}:${linha} ${m[2].toUpperCase()}`);
      }
    }
  }
}

const nada = arquivos.length === 0;
const relatorio = {
  date: new Date().toISOString().slice(0, 10),
  obs_unstructured_logs: nada ? null : naoEstruturados.length,
  obs_missing_audit:     nada ? null : semAuditoria.length,
  obs_sensitive_in_log:  nada ? null : sensiveis.length,
  arquivos_analisados: arquivos.length,
  ...(nada ? { erro: 'nenhum arquivo .py/.ts/.tsx/.js de produção encontrado — nada foi medido' } : {}),
  detalhes: { naoEstruturados, semAuditoria, sensiveis },
};

if (AS_JSON) {
  fs.writeFileSync(path.join(ROOT, '.observability-report.json'), JSON.stringify(relatorio, null, 2));
  console.log(`obs_unstructured_logs=${relatorio.obs_unstructured_logs}`);
  console.log(`obs_missing_audit=${relatorio.obs_missing_audit}`);
  console.log(`obs_sensitive_in_log=${relatorio.obs_sensitive_in_log}`);
} else {
  console.log('\n🔭 Observability Guard — NORM04\n');
  console.log(`Arquivos analisados          : ${arquivos.length}`);
  console.log(`Logs não estruturados        : ${naoEstruturados.length}`);
  console.log(`Rotas sensíveis sem auditoria: ${semAuditoria.length}`);
  console.log(`Dado sensível em log (LGPD)  : ${sensiveis.length}`);
  for (const [titulo, lista] of [['console/print', naoEstruturados], ['sem auditoria', semAuditoria], ['dado sensível em log', sensiveis]]) {
    if (lista.length) { console.log(`\n⚠  ${titulo}:`); lista.forEach((l) => console.log('  ' + l)); }
  }
}

if (nada) {
  console.error('✗ observability-scan: ' + relatorio.erro);
  process.exit(2);
}
// Dado pessoal em log é crítico (LGPD): reprova sempre, fora do ratchet.
process.exit(sensiveis.length > 0 ? 1 : 0);
