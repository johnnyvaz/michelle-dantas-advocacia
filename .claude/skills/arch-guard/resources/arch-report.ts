// tests/architecture/arch-report.ts  (RESOURCE — copiar VERBATIM)
//
// Executado por scripts/arch-scan.{mjs,js} e por measureArch() no quality-gate.
// Imprime um JSON com as contagens que alimentam o ratchet. NÃO falha — só mede.
// Invariante entre projetos: não precisa de adaptação.

import { archRules, formatViolation, isEmptyTestViolation, isRealViolation } from './arch.rules';

interface RuleResult {
  name: string;
  mode: string;
  violations: number;
  misconfigured: boolean;
  samples: string[];
}

async function main() {
  const byRule: RuleResult[] = [];
  let archViolations = 0;
  let enforcedViolations = 0;
  let cycles = 0;
  let misconfigured = 0;

  for (const rule of archRules) {
    let raw: unknown[] = [];
    try {
      raw = await rule.build().check();
    } catch (e) {
      byRule.push({ name: rule.name, mode: rule.mode, violations: 0, misconfigured: true, samples: [e instanceof Error ? e.message : String(e)] });
      misconfigured++;
      continue;
    }

    const empty = raw.some(isEmptyTestViolation);
    const real = raw.filter(isRealViolation);

    if (empty) misconfigured++;
    archViolations += real.length;
    if (rule.mode === 'enforced') enforcedViolations += real.length;
    if (/cicl|cycle/i.test(rule.name)) cycles += real.length;

    byRule.push({
      name: rule.name,
      mode: rule.mode,
      violations: real.length,
      misconfigured: empty,
      samples: real.slice(0, 5).map(formatViolation),
    });
  }

  console.log(JSON.stringify({
    arch_violations: archViolations,
    arch_enforced_violations: enforcedViolations,
    arch_cycles: cycles,
    arch_misconfigured_rules: misconfigured,
    byRule,
  }));
}

main().catch((e) => {
  // Sem process.exit (mantém type-clean sem @types/node): o scan detecta a falha pelo campo `error`.
  console.log(JSON.stringify({
    error: e instanceof Error ? e.message : String(e),
    arch_violations: null, arch_enforced_violations: null, arch_cycles: null, arch_misconfigured_rules: null,
  }));
});
