#!/usr/bin/env node
// scripts/quality-gate.js
//
// Quality gate com ratchet — mdantas-site (Next.js, JavaScript, sem backend separado)
//
//   node scripts/quality-gate.js           → verifica regressões (CI / pre-commit)
//   node scripts/quality-gate.js --update  → avança o baseline nas métricas que melhoraram
//
// O que este gate mede hoje: duplicação (jscpd), complexidade (complexity-scan.mjs) e
// logs fora do padrão (observability-scan.js). O projeto NÃO tem testes automáticos nem
// TypeScript, então não há métrica de teste, cobertura ou erro de tipo — elas entram aqui
// quando os testes existirem (/tdd). Ausência declarada, não número inventado.

'use strict';

const { spawnSync } = require('child_process');
const fs   = require('fs');
const path = require('path');

const ROOT          = path.resolve(__dirname, '..');
const BASELINE_FILE = path.join(ROOT, 'quality-baseline.json');
const UPDATE        = process.argv.includes('--update');
const CPD_OUT       = path.join(ROOT, '.jscpd-report');

// Pastas com código próprio. `public/assets/js` é biblioteca de terceiros e fica fora.
const FONTES = ['app', 'components', 'lib', 'utils', 'utlis', 'data'];

function instalado(...partes) {
  return fs.existsSync(path.join(ROOT, ...partes));
}

// ─── Coleta ──────────────────────────────────────────────────────────────────

function measureDuplicates() {
  const jscpd = path.join(ROOT, 'node_modules', '.bin', 'jscpd');
  if (!fs.existsSync(jscpd)) return { pct: null };

  const fontes = FONTES.filter((d) => instalado(d));
  fs.rmSync(CPD_OUT, { recursive: true, force: true });
  spawnSync(
    jscpd,
    [...fontes, '--format', 'javascript,jsx', '--reporters', 'json', '--output', CPD_OUT, '--silent'],
    { cwd: ROOT, encoding: 'utf8' }
  );

  try {
    const report = JSON.parse(fs.readFileSync(path.join(CPD_OUT, 'jscpd-report.json'), 'utf8'));
    const raw = report?.statistics?.total?.percentage ?? null;
    return { pct: raw !== null ? Math.round(raw * 10) / 10 : null };
  } catch {
    return { pct: null };
  }
}

// ─── Complexidade ciclomática ────────────────────────────────────────────────

// Se o lizard não estiver instalado o scanner sai ≠ 0 → métrica 'skip', nunca um número inventado.
function measureComplexity() {
  const nulo = { complexity_worst: null, complexity_over_limit: null };
  if (!instalado('scripts', 'complexity-scan.mjs')) return nulo;

  const res = spawnSync('node', ['scripts/complexity-scan.mjs', '--json'], { cwd: ROOT, encoding: 'utf8' });
  if (res.status !== 0) {
    if (res.stderr) process.stderr.write(res.stderr);
    return nulo;
  }
  try {
    const rep = JSON.parse(fs.readFileSync(path.join(ROOT, '.complexity-report.json'), 'utf8'));
    return {
      complexity_worst:      rep.metricas?.complexity_worst      ?? null,
      complexity_over_limit: rep.metricas?.complexity_over_limit ?? null,
    };
  } catch {
    return nulo;
  }
}

// ─── Observabilidade (NORM04) ────────────────────────────────────────────────

function measureObservability() {
  const nulo = { obs_unstructured_logs: null, obs_missing_audit: null, obs_sensitive_in_log: null };
  if (!instalado('scripts', 'observability-scan.js')) return nulo;
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

  const delta  = Math.round((current - saved) * 10) / 10;
  const better = dir === 'asc' ? delta > 0 : delta < 0;
  return { label, current, saved, dir, delta, status: delta === 0 ? 'equal' : better ? 'improved' : 'regressed' };
}

function ratchet(current, saved, dir) {
  if (current === null || current === undefined) return saved ?? null;
  if (saved   === null || saved   === undefined) return current;
  return dir === 'asc' ? Math.max(current, saved) : Math.min(current, saved);
}

// Métrica não medida e sem valor salvo fica FORA do arquivo (nunca grava semente nem null).
function manter(chave, current, saved, dir) {
  const v = ratchet(current, saved, dir);
  return v === null || v === undefined ? {} : { [chave]: v };
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

  const cpd = measureDuplicates();
  const cx  = measureComplexity();
  const obs = measureObservability();
  const b   = loadBaseline();

  const temCx  = instalado('scripts', 'complexity-scan.mjs');
  const temObs = instalado('scripts', 'observability-scan.js');

  // Guard instalado SEMPRE aparece na tabela (condicionado à presença do scanner, não ao valor).
  const results = [
    evaluate('Duplicação de código (%)', cpd.pct, b.code_duplicates_pct, 'desc'),
    ...(temCx ? [
      evaluate('Complexidade — pior função (CCN)', cx.complexity_worst,      b.complexity_worst,      'desc'),
      evaluate('Complexidade — acima do limite',   cx.complexity_over_limit, b.complexity_over_limit, 'desc'),
    ] : []),
    ...(temObs ? [
      evaluate('Logs fora do padrão (console)',    obs.obs_unstructured_logs, b.obs_unstructured_logs, 'desc'),
      evaluate('Rotas sem trilha de auditoria',    obs.obs_missing_audit,     b.obs_missing_audit,     'desc'),
    ] : []),
  ];

  // LGPD: dado pessoal em log reprova sempre — regressão fora do ratchet, sem baseline.
  if ((obs.obs_sensitive_in_log ?? 0) > 0) {
    results.push({ label: 'Dado pessoal em log (LGPD)', current: obs.obs_sensitive_in_log, saved: 0, dir: 'desc',
      delta: obs.obs_sensitive_in_log, status: 'regressed' });
  }

  console.log(`  ${'Métrica'.padEnd(38)} ${'Baseline'.padStart(8)}  ${'Atual'.padStart(10)}`);
  console.log('  ' + '─'.repeat(62));
  results.forEach(r => console.log(row(r)));
  console.log('');

  const regressions  = results.filter(r => r.status === 'regressed');
  const improvements = results.filter(r => r.status === 'improved' || r.status === 'new');

  if (UPDATE) {
    const updated = {
      ...manter('code_duplicates_pct',   cpd.pct,                   b.code_duplicates_pct,   'desc'),
      ...manter('complexity_worst',      cx.complexity_worst,       b.complexity_worst,      'desc'),
      ...manter('complexity_over_limit', cx.complexity_over_limit,  b.complexity_over_limit, 'desc'),
      ...manter('obs_unstructured_logs', obs.obs_unstructured_logs, b.obs_unstructured_logs, 'desc'),
      ...manter('obs_missing_audit',     obs.obs_missing_audit,     b.obs_missing_audit,     'desc'),
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

    if (instalado('scripts', 'raio-x.cjs')) {
      const rx = spawnSync(process.execPath, ['scripts/raio-x.cjs'], { cwd: ROOT, encoding: 'utf8' });
      process.stdout.write(rx.stdout ?? '');
    }
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
