#!/usr/bin/env node
// scripts/arch-scan.mjs  (RESOURCE — ESM, para projetos "type": "module")
//
// Verifica as fronteiras de arquitetura (ArchUnitTS) e gera .arch-scan-report.json.
// Para projetos CommonJS (sem "type":"module"), use a variante arch-scan.cjs.
//
//   node scripts/arch-scan.mjs          → console + exit 1 se houver hard-fail
//   node scripts/arch-scan.mjs --json   → grava .arch-scan-report.json (p/ quality-gate)
//
// ADAPTAR: o comando que roda o report. Com bun (roda TS nativo): "bun tests/...".
// Sem bun: "npx tsx tests/architecture/arch-report.ts".

import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const AS_JSON = process.argv.includes('--json');
const REPORT_CMD = 'bun tests/architecture/arch-report.ts'; // ou: npx tsx tests/architecture/arch-report.ts

function runReport() {
  try {
    const out = execSync(REPORT_CMD, { cwd: ROOT, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
    const line = out.trim().split('\n').filter(Boolean).pop() ?? '';
    return JSON.parse(line);
  } catch (e) {
    console.error('arch-scan: falha ao executar arch-report.ts');
    console.error((e.stdout ?? '') + (e.stderr ?? e.message ?? ''));
    return null;
  }
}

const report = runReport();

if (!report || report.error) {
  if (AS_JSON) {
    writeFileSync(
      resolve(ROOT, '.arch-scan-report.json'),
      JSON.stringify({ arch_violations: null, arch_cycles: null, arch_enforced_violations: null, arch_misconfigured_rules: null }, null, 2),
    );
  }
  process.exit(2);
}

if (AS_JSON) {
  writeFileSync(resolve(ROOT, '.arch-scan-report.json'), JSON.stringify(report, null, 2));
  console.log(`arch_violations=${report.arch_violations}`);
  console.log(`arch_cycles=${report.arch_cycles}`);
} else {
  console.log('\n🏛  Arch Guard — Fronteiras de Arquitetura\n');
  for (const r of report.byRule) {
    const tag = r.misconfigured ? '⚠ MALCONFIG' : r.violations === 0 ? '✓' : '✗';
    console.log(`${tag} [${r.mode}] ${r.name}: ${r.violations} violação(ões)`);
    for (const s of r.samples) console.log(`      ${s}`);
  }
  console.log(
    `\nTotal: ${report.arch_violations} violações | enforced: ${report.arch_enforced_violations} | ciclos: ${report.arch_cycles} | mal configuradas: ${report.arch_misconfigured_rules}`,
  );
}

// Hard-fail: regra 'enforced' violada ou regra mal configurada (glob vazio).
const hardFail = (report.arch_enforced_violations || 0) + (report.arch_misconfigured_rules || 0);
process.exit(hardFail > 0 ? 1 : 0);
