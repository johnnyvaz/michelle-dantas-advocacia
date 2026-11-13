#!/usr/bin/env node
// scripts/memory-guard.js
//
// Análise estática de padrões de memory leak.
// Gera relatório e conta findings para integração com quality-gate.
//
//   node scripts/memory-guard.js           → análise e saída no console
//   node scripts/memory-guard.js --json    → saída em .memory-guard-report.json
//
// Diretórios de produção DESCOBERTOS (pastas de primeiro nível), não fixos em backend/ e frontend/: o alvo pode
// usar api/ e web/, src/... Dependências, build, testes, exemplos e venvs ficam de fora (lista única, idêntica nos
// scanners memory-guard, resilience-scan e arch-tradeoff; comparada pelo NOME da entrada, nunca por caminho absoluto).

'use strict';

const { spawnSync } = require('child_process');
const fs   = require('fs');
const path = require('path');

const ROOT    = path.resolve(__dirname, '..');
const AS_JSON = process.argv.includes('--json');

const IGNORADOS = new Set([
  'node_modules', 'dist', 'build', 'coverage', 'migrations', 'e2e', 'tests', 'test', '__tests__', 'scripts',
  'venv', '.venv', 'env', 'vendor', 'bin', 'obj', 'target', 'docs', 'examples', '.next', 'out',
  '__pycache__', 'site-packages', '.git',
]);

const SRC_DIRS = fs.readdirSync(ROOT, { withFileTypes: true })
  .filter((e) => e.isDirectory() && !IGNORADOS.has(e.name) && !e.name.startsWith('.')
    && !fs.existsSync(path.join(ROOT, e.name, 'pyvenv.cfg')))
  .map((e) => `${e.name}/`);

// Venv com nome arbitrário (tem `pyvenv.cfg`) aninhado em qualquer pasta de produção: entra na exclusão pelo nome.
function venvsAninhados(dir, prof = 0, acc = new Set()) {
  if (prof > 3) return acc;
  let entradas = [];
  try { entradas = fs.readdirSync(dir, { withFileTypes: true }); } catch { return acc; }
  for (const e of entradas) {
    if (!e.isDirectory() || IGNORADOS.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (fs.existsSync(path.join(p, 'pyvenv.cfg'))) acc.add(e.name);
    else venvsAninhados(p, prof + 1, acc);
  }
  return acc;
}
const EXCLUIR = [...new Set([...IGNORADOS, ...SRC_DIRS.flatMap((d) => [...venvsAninhados(path.join(ROOT, d))])])]
  .map((n) => `--exclude-dir=${n}`);

// Saída do grep -rn: "arquivo:linha:conteúdo". Os filtros abaixo olham só o conteúdo.
const conteudo = (line) => line.split(':').slice(2).join(':');

// `.on("evento", fn)` cujo `.off("evento", fn)` / `removeListener("evento", fn)` está no mesmo arquivo (o cleanup
// de um useEffect fica em outra linha): não é listener acumulando.
function desfeitoNoArquivo(line) {
  const m = /\.on\(\s*(['"`][^'"`]+['"`])\s*,\s*([\w$.]+)/.exec(conteudo(line));
  if (!m) return false;
  let fonte;
  try { fonte = fs.readFileSync(path.join(ROOT, line.split(':')[0]), 'utf8'); } catch { return false; }
  const ev = m[1].slice(1, -1).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const fn = m[2].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`\\.(?:off|removeListener|removeEventListener)\\(\\s*['"\`]${ev}['"\`]\\s*,\\s*${fn}\\b`).test(fonte);
}

const PATTERNS = [
  // ── Python ──────────────────────────────────────────────────────────────────
  {
    lang: 'Python',
    severity: 'HIGH',
    description: 'lru_cache sem maxsize — cresce indefinidamente',
    cmd: ['grep', '-rn', 'lru_cache()', '--include=*.py'],
    filter: (line) => !line.includes('lru_cache(maxsize'),
  },
  {
    lang: 'Python',
    severity: 'MEDIUM',
    description: 'asyncio.Task criada sem referência para cancel()',
    cmd: ['grep', '-rn', 'asyncio.create_task\\|loop.create_task', '--include=*.py'],
    filter: () => true,
  },
  {
    lang: 'Python',
    severity: 'MEDIUM',
    description: 'Variável global mutável sem limite (possível acumulação)',
    cmd: ['grep', '-rn', '^[A-Z_]\\+.*= {}\\|^[A-Z_]\\+.*= \\[\\]', '--include=*.py'],
    filter: () => true,
  },
  // ── Node.js ─────────────────────────────────────────────────────────────────
  {
    lang: 'Node.js',
    severity: 'HIGH',
    description: 'setInterval sem clearInterval — timer nunca limpo',
    cmd: ['grep', '-rn', 'setInterval', '--include=*.ts', '--include=*.tsx', '--include=*.js', '--include=*.jsx'],
    filter: (line) => !line.includes('clearInterval') && !line.includes('const ') && !line.includes('this.'),
  },
  {
    lang: 'Node.js',
    severity: 'HIGH',
    description: 'EventEmitter .on() sem removeListener — listener acumula',
    cmd: ['grep', '-rn', '\\.on(', '--include=*.ts', '--include=*.tsx', '--include=*.js', '--include=*.jsx'],
    // `process.on` roda uma vez por processo; `req.on`/`res.on` morrem com a requisição (o emissor é coletado
    // junto): nenhum acumula. O risco é `.on` em emissor de vida longa (pool, socket, bus) dentro de um laço.
    filter: (line) => !line.includes('removeListener') && !line.includes('once(') && !line.includes('//')
      && !/\b(process|req|res)\.on\(/.test(line) && !desfeitoNoArquivo(line),
  },
  {
    lang: 'Node.js',
    severity: 'MEDIUM',
    description: 'new Map() / new Set() global sem política de limpeza',
    cmd: ['grep', '-rn', 'new Map()\\|new Set()', '--include=*.ts', '--include=*.tsx', '--include=*.js', '--include=*.jsx'],
    // Global = declaração no topo do módulo (coluna 0). Map local em função ou parâmetro default morre com a chamada.
    filter: (line) => !line.includes('test') && !line.includes('spec')
      && /^(export\s+)?(const|let|var)\s+[\w$]+[^=]*=\s*new (Map|Set)\(/.test(conteudo(line)),
  },
  {
    lang: 'Node.js',
    severity: 'MEDIUM',
    description: 'Cache sem TTL ou maxSize detectado',
    cmd: ['grep', '-rni', 'cache\\[.*\\] =\\|\\.set(', '--include=*.ts', '--include=*.tsx', '--include=*.js', '--include=*.jsx'],
    // Só receptor que se chama cache: `.set(` sozinho casava URLSearchParams e contadores locais.
    filter: (line) => !['ttl', 'expire', 'maxsize', 'lru', 'test', 'spec'].some(k => line.toLowerCase().includes(k))
      && /\bcache\w*\s*\[.*\]\s*=|\b[\w$]*cache[\w$]*\.set\(/i.test(conteudo(line)),
  },
];

const findings = [];
const vistos = new Set();   // o mesmo arquivo:linha nunca conta duas vezes

for (const pattern of PATTERNS) {
  for (const dir of SRC_DIRS) {
    // cmd[0] é o próprio 'grep': passá-lo como argumento o transformava no PATTERN e a varredura nunca achava nada.
    const args = [...pattern.cmd.slice(1), ...EXCLUIR, dir];
    const result = spawnSync(pattern.cmd[0], args, { cwd: ROOT, encoding: 'utf8' });
    if (result.error || !result.stdout.trim()) continue;

    const lines = result.stdout.split('\n').filter(Boolean).filter(pattern.filter);
    for (const line of lines) {
      const chave = `${pattern.description}|${line.trim()}`;
      if (vistos.has(chave)) continue;
      vistos.add(chave);
      findings.push({ severity: pattern.severity, lang: pattern.lang, description: pattern.description, location: line.trim() });
    }
  }
}

// ── Saída ────────────────────────────────────────────────────────────────────

if (AS_JSON) {
  const report = { date: new Date().toISOString().slice(0, 10), total: findings.length, findings };
  fs.writeFileSync(path.join(ROOT, '.memory-guard-report.json'), JSON.stringify(report, null, 2));
  console.log(`memory_static_findings=${findings.length}`);
} else {
  if (findings.length === 0) {
    console.log('✓ Memory Guard: nenhum padrão de leak encontrado');
  } else {
    console.log(`\n⚠  Memory Guard: ${findings.length} padrão(ões) encontrado(s)\n`);
    const high   = findings.filter(f => f.severity === 'HIGH');
    const medium = findings.filter(f => f.severity === 'MEDIUM');

    if (high.length)   { console.log(`[HIGH]   ${high.length} achados:`);   high.forEach(f => console.log(`  → ${f.description}\n    ${f.location}`)); }
    if (medium.length) { console.log(`[MEDIUM] ${medium.length} achados:`); medium.forEach(f => console.log(`  → ${f.description}\n    ${f.location}`)); }
  }
}

process.exit(findings.filter(f => f.severity === 'HIGH').length > 0 ? 1 : 0);
