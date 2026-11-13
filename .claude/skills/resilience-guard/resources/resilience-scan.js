#!/usr/bin/env node
// scripts/resilience-scan.js
//
// Análise estática de padrões de resiliência ausentes.
// Gera .resilience-scan-report.json para integração com quality-gate.
//
//   node scripts/resilience-scan.js          → console
//   node scripts/resilience-scan.js --json   → .resilience-scan-report.json
//
// Saída:  0 ok · 1 há chamada sem timeout ou nenhum circuit breaker · 2 nada analisado (métricas null no relatório)
//
// Decisões de método (cada uma medida contra falso positivo/negativo):
//  • Pacotes = pastas de primeiro nível (backend/, api/, web/, src/...), nunca nomes fixos. Exclusão por NOME de
//    entrada (lista única, idêntica à do memory-guard e do arch-tradeoff) + qualquer pasta com `pyvenv.cfg`.
//  • BACKEND × FRONTEND por tipo de pacote: um pacote que é app de navegador (package.json com react/vue/svelte/
//    angular/solid/preact/vite... e SEM framework com servidor: next/nuxt/remix/sveltekit/astro) é FRONTEND. O `fetch(`
//    do navegador não é integração servidor-a-servidor: fica fora de missing_timeouts/missing_retries (aparece em
//    `details.frontend_http_ignorado`, para ser visto). Antes o frontend contava como "sem timeout/retry".
//  • Proteção só vale no MESMO statement: os argumentos balanceados da chamada (com comentários e strings esvaziados),
//    o `retry(() => chamada)`/`withTimeout(chamada)` que a envolve, ou os decorators/`with` da função (`@retry`,
//    `async with asyncio.timeout(...)`). Um "timeout" em comentário ou na chamada seguinte NÃO absolve (antes, olhar as
//    8 linhas seguintes absolvia).

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT    = path.resolve(__dirname, '..');
const AS_JSON = process.argv.includes('--json');

const IGNORADOS = new Set([
  'node_modules', 'dist', 'build', 'coverage', 'migrations', 'e2e', 'tests', 'test', '__tests__', 'scripts',
  'venv', '.venv', 'env', 'vendor', 'bin', 'obj', 'target', 'docs', 'examples', '.next', 'out',
  '__pycache__', 'site-packages', '.git',
  // Corpus do gêmeo, specs e fila de tarefas: markdown e exemplos, não código da aplicação.
  'gemeo', 'specs', 'tasks',
]);
const EH_TESTE = /(^|[\\/])(__tests__|test|tests)[\\/]|\.(test|spec)\.[cm]?[tj]sx?$|(^|[\\/])(test_[^\\/]*|[^\\/]*_test|conftest)\.py$/;
const EXT = /\.(py|ts|tsx|js|jsx|mjs|cjs)$/;

const FRAMEWORK_NAVEGADOR = /"(react|react-dom|vue|svelte|@angular\/core|solid-js|preact|vite|react-scripts|@vitejs\/[\w-]+)"\s*:/;
const FRAMEWORK_COM_SERVIDOR = /"(next|nuxt|@remix-run\/[\w-]+|@sveltejs\/kit|astro)"\s*:/;
const NOMES_FRONTEND = new Set(['web', 'frontend', 'client', 'ui', 'webapp']);

const RE_TIMEOUT = /timeout|AbortSignal|AbortController|\bsignal\b|wait_for|fail_after|move_on_after/i;
const RE_RETRY   = /retry|tenacity|backoff/i;
const RE_ENVOLVE_TIMEOUT = /timeout|wait_for|fail_after|move_on_after/i;

// Chamadas de integração HTTP. `(?<![.\w$])` evita `obj.fetch(` de outro objeto; `window.`/`globalThis.` valem.
// `urlopen` é o cliente HTTP da biblioteca padrão (urllib.request): projeto sem dependência o usa.
const CHAMADAS_PY = /\b(?:(?:httpx|requests)\.(?:get|post|put|patch|delete|head|options|request|stream|Client|AsyncClient)|(?:urllib\.request\.)?urlopen)\s*\(/g;
const CHAMADAS_JS = /(?<![.\w$])(?:(?:globalThis|window)\.)?fetch\s*\(|\b(?:axios|got|ky)(?:\.(?:get|post|put|patch|delete|head|options|request|create|stream))?\s*\(/g;

const RE_CB     = /pybreaker|CircuitBreaker|@circuit\b|opossum|cockatiel/;
const RE_HEALTH = /['"]\/(?:health|healthz|readiness|liveness|ready|live|saude)['"]|\.(?:get|route)\([^)]*health/i;

// ── Descoberta de pacotes ────────────────────────────────────────────────────

const ehVenv = (dir) => fs.existsSync(path.join(dir, 'pyvenv.cfg'));

function lerPackageJson(dir) {
  for (const p of [path.join(dir, 'package.json'), path.join(ROOT, 'package.json')]) {
    try { return fs.readFileSync(p, 'utf8'); } catch { /* tenta o da raiz */ }
  }
  return null;
}

/** Next com `output: 'export'` gera site estático: todo `fetch` roda no navegador, como num SPA. */
function ehExportEstatico(dir) {
  return ['next.config.ts', 'next.config.js', 'next.config.mjs'].some((f) => {
    try { return /output\s*:\s*['"]export['"]/.test(fs.readFileSync(path.join(dir, f), 'utf8')); }
    catch { return false; }
  });
}

function ehFrontend(nome, dir) {
  const pj = lerPackageJson(dir);
  if (pj && ehExportEstatico(dir)) return true;
  if (pj) return FRAMEWORK_NAVEGADOR.test(pj) && !FRAMEWORK_COM_SERVIDOR.test(pj);
  return NOMES_FRONTEND.has(nome);
}

function listar(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORADOS.has(e.name) || e.name.startsWith('.')) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (!ehVenv(p)) listar(p, acc); continue; }
    if (EXT.test(e.name) && !/\.d\.ts$/.test(e.name) && !EH_TESTE.test(path.relative(ROOT, p))) acc.push(p);
  }
  return acc;
}

const pacotes = fs.readdirSync(ROOT, { withFileTypes: true })
  .filter((e) => e.isDirectory() && !IGNORADOS.has(e.name) && !e.name.startsWith('.') && !ehVenv(path.join(ROOT, e.name)))
  .map((e) => ({ nome: e.name, dir: path.join(ROOT, e.name), frontend: ehFrontend(e.name, path.join(ROOT, e.name)) }));

// resilience-scan.json (opcional, na raiz): {"incluir": ["scripts/atlas"]} — código de produto que mora numa
// pasta da lista de exclusão (ex.: integrações em scripts/) entra como pacote. Pasta inexistente é erro alto.
const CONFIG = (() => {
  try { return JSON.parse(fs.readFileSync(path.join(ROOT, 'resilience-scan.json'), 'utf8')); } catch { return {}; }
})();
for (const rel of CONFIG.incluir ?? []) {
  const dir = path.join(ROOT, rel);
  if (!fs.existsSync(dir)) { console.error(`✗ resilience-scan.json: "${rel}" não existe`); process.exit(2); }
  pacotes.push({ nome: rel, dir, frontend: ehFrontend(rel, dir) });
}

// ── Texto: comentários e strings esvaziados (mesmo comprimento, mesmas quebras de linha) ───────────────

function mascarar(texto, py, esvaziarStrings) {
  const out = texto.split('');
  const n = texto.length;
  const limpa = (a, b) => { for (let k = a; k < b; k++) if (out[k] !== '\n') out[k] = ' '; };
  let i = 0;
  while (i < n) {
    const c = texto[i];
    const tri = texto.slice(i, i + 3);
    if (py ? c === '#' : (c === '/' && texto[i + 1] === '/')) {
      let j = texto.indexOf('\n', i); if (j < 0) j = n;
      limpa(i, j); i = j; continue;
    }
    if (!py && c === '/' && texto[i + 1] === '*') {
      let j = texto.indexOf('*/', i + 2); j = j < 0 ? n : j + 2;
      limpa(i, j); i = j; continue;
    }
    if (py && (tri === '"""' || tri === "'''")) {
      let j = texto.indexOf(tri, i + 3); j = j < 0 ? n : j + 3;
      limpa(i + 3, Math.max(i + 3, j - 3)); i = j; continue;     // docstring nunca é código
    }
    if (c === '"' || c === "'" || (!py && c === '`')) {
      let j = i + 1;
      while (j < n && texto[j] !== c) {
        if (texto[j] === '\\') j++;
        else if (texto[j] === '\n' && c !== '`') break;
        j++;
      }
      if (esvaziarStrings) limpa(i + 1, Math.min(j, n));
      i = j + 1; continue;
    }
    i++;
  }
  return out.join('');
}

// Argumentos balanceados a partir do '(' em `abre`.
function argumentos(m, abre) {
  let prof = 0;
  for (let i = abre; i < m.length; i++) {
    if (m[i] === '(') prof++;
    else if (m[i] === ')' && --prof === 0) return m.slice(abre, i + 1);
  }
  return m.slice(abre);
}

// Nomes das chamadas que ENVOLVEM a posição `pos` (retry(() => fetch(..)), withTimeout(fetch(..))).
function chamadasEnvolventes(m, pos) {
  const pilha = [];
  for (let i = 0; i < pos; i++) {
    if (m[i] === '(') pilha.push((m.slice(Math.max(0, i - 80), i).match(/([\w$.]+)\s*$/) ?? [, ''])[1]);
    else if (m[i] === ')') pilha.pop();
  }
  return pilha.join(' ');
}

// Python: linhas de indentação menor acima da chamada (`with`, `for attempt in Retrying`, `def`) e os decorators do def.
function ancestraisPy(linhas, idx) {
  const indent = (l) => l.match(/^[ \t]*/)[0].length;
  let atual = indent(linhas[idx]);
  const acc = [];
  for (let i = idx - 1; i >= 0; i--) {
    const l = linhas[i];
    if (!l.trim()) continue;
    const d = indent(l);
    if (d >= atual) continue;
    acc.push(l); atual = d;
    if (/^\s*(async\s+)?def\s/.test(l)) {
      for (let k = i - 1; k >= 0 && /^\s*@/.test(linhas[k]); k--) acc.push(linhas[k]);
      break;
    }
  }
  return acc.join('\n');
}

// ── Varredura ────────────────────────────────────────────────────────────────

const semTimeout = [];
const semRetry   = [];
const frontendIgnorado = [];
let hasCB = false, hasHealth = false, hasSigterm = false;
let arquivosBackend = 0, arquivosFrontend = 0;

for (const pac of pacotes) {
  for (const arq of listar(pac.dir)) {
    const rel = path.relative(ROOT, arq);
    const py = arq.endsWith('.py');
    const bruto = fs.readFileSync(arq, 'utf8');
    const m = mascarar(bruto, py, true);                 // comentários e strings esvaziados
    const c = mascarar(bruto, py, false);                // só sem comentários (import 'opossum' continua visível)
    const linhas = m.split('\n');
    const linhaDe = (pos) => m.slice(0, pos).split('\n').length;

    // O pacote herda "frontend" do package.json da raiz, mas Python nunca roda no navegador e uma Edge
    // Function Deno (Deno.serve) é servidor: a decisão final é por arquivo.
    const frontend = pac.frontend && !py && !/\bDeno\.serve\(/.test(c);
    if (frontend) arquivosFrontend++; else arquivosBackend++;

    if (!frontend) {
      if (RE_CB.test(c)) hasCB = true;
      if (RE_HEALTH.test(c)) hasHealth = true;
      if (/SIGTERM/.test(c)) hasSigterm = true;
    }

    const alvo = py ? CHAMADAS_PY : CHAMADAS_JS;
    alvo.lastIndex = 0;
    for (const hit of m.matchAll(alvo)) {
      const abre = hit.index + hit[0].length - 1;
      const stmt = argumentos(m, abre);
      const env  = chamadasEnvolventes(m, hit.index);
      const anc  = py ? ancestraisPy(linhas, linhaDe(hit.index) - 1) : '';
      const ref  = `${rel}:${linhaDe(hit.index)}: ${bruto.split('\n')[linhaDe(hit.index) - 1].trim().slice(0, 120)}`;

      if (frontend) { frontendIgnorado.push(ref); continue; }
      if (!RE_TIMEOUT.test(stmt) && !RE_ENVOLVE_TIMEOUT.test(env) && !RE_ENVOLVE_TIMEOUT.test(anc)) semTimeout.push(ref);
      if (!RE_RETRY.test(stmt) && !RE_RETRY.test(env) && !RE_RETRY.test(anc)) semRetry.push(ref);
    }
  }
}

// ── Relatório ────────────────────────────────────────────────────────────────

const nada = arquivosBackend === 0;
const report = {
  date:                     new Date().toISOString().slice(0, 10),
  missing_timeouts:         nada ? null : semTimeout.length,
  missing_retries:          nada ? null : semRetry.length,
  missing_circuit_breakers: nada ? null : (hasCB ? 0 : 1),
  missing_health_check:     nada ? null : (hasHealth ? 0 : 1),
  missing_sigterm_handler:  nada ? null : (hasSigterm ? 0 : 1),
  arquivos_backend: arquivosBackend,
  arquivos_frontend: arquivosFrontend,
  pacotes: Object.fromEntries(pacotes.map((p) => [p.nome, p.frontend ? 'frontend' : 'backend'])),
  ...(nada ? { erro: 'nenhum arquivo .py/.ts/.js de pacote backend encontrado — nada foi medido' } : {}),
  details: {
    http_without_timeout:  semTimeout.slice(0, 10),
    http_without_retry:    semRetry.slice(0, 10),
    // Listas completas: o /raio-x agrupa por arquivo para mostrar onde está o problema.
    http_without_timeout_todos: semTimeout,
    http_without_retry_todos:   semRetry,
    frontend_http_ignorado: frontendIgnorado.length,
    circuit_breaker_found: hasCB,
    health_check_found:    hasHealth,
    sigterm_found:         hasSigterm,
  },
};

if (AS_JSON) {
  fs.writeFileSync(path.join(ROOT, '.resilience-scan-report.json'), JSON.stringify(report, null, 2));
  console.log(`missing_timeouts=${report.missing_timeouts}`);
  console.log(`missing_retries=${report.missing_retries}`);
  console.log(`missing_circuit_breakers=${report.missing_circuit_breakers}`);
} else {
  console.log('\n🛡  Resilience Guard — Inventário\n');
  console.log(`Pacotes                : ${Object.entries(report.pacotes).map(([n, t]) => `${n} (${t})`).join(', ') || '—'}`);
  console.log(`Chamadas sem timeout   : ${report.missing_timeouts}`);
  console.log(`Chamadas sem retry     : ${report.missing_retries}`);
  console.log(`Circuit breaker        : ${hasCB ? '✓ presente' : '✗ ausente'}`);
  console.log(`Health check           : ${hasHealth ? '✓ presente' : '✗ ausente'}`);
  console.log(`SIGTERM handler        : ${hasSigterm ? '✓ presente' : '✗ ausente'}`);
  console.log(`HTTP de frontend (fora): ${frontendIgnorado.length}`);

  if (report.details.http_without_timeout.length > 0) {
    console.log('\n⚠  HTTP sem timeout:');
    report.details.http_without_timeout.forEach(l => console.log('  ' + l));
  }
  if (!hasCB) {
    console.log('\n⚠  Nenhum circuit breaker detectado. Execute /resilience-guard para instalar templates.');
  }
}

if (nada) {
  console.error('✗ resilience-scan: ' + report.erro);
  process.exit(2);
}
const criticalIssues = report.missing_timeouts + report.missing_circuit_breakers;
process.exit(criticalIssues > 0 ? 1 : 0);
