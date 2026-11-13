// tests/architecture/arch.rules.ts  (RESOURCE — TEMPLATE inicial; sempre adaptar por projeto)
//
// O TOPO (tipos + helpers) é INVARIANTE — copie verbatim.
// O array `archRules` é um EXEMPLO — reescreva com as camadas/pacotes reais do alvo.
//
// mode: 'enforced' -> hard-fail no teste/scan/CI (como ArchRule)
// mode: 'freeze'   -> ratchet no quality-gate (como FreezingArchRule); promova a 'enforced' ao zerar.

import { projectFiles } from 'archunit';

export type ArchMode = 'enforced' | 'freeze';

export interface ArchRule {
  name: string;
  mode: ArchMode;
  build: () => { check: () => Promise<unknown[]> };
}

// ─── INVARIANTE: helpers compartilhados (testes + report) ─────────────────────

type ViolationLike = {
  message?: string;
  dependency?: { sourceLabel?: string; targetLabel?: string };
};

/** Glob sem arquivos vira "empty test" — é regra mal configurada, NÃO violação de arquitetura. */
export function isEmptyTestViolation(v: unknown): boolean {
  const m = (v as ViolationLike)?.message;
  return typeof m === 'string' && m.includes('No files found');
}
export function isRealViolation(v: unknown): boolean {
  return !isEmptyTestViolation(v);
}
export function formatViolation(v: unknown): string {
  const vl = v as ViolationLike;
  if (vl?.dependency?.sourceLabel) {
    return `${vl.dependency.sourceLabel} → ${vl.dependency.targetLabel}`;
  }
  return vl?.message ?? JSON.stringify(v);
}

// ─── ADAPTAR daqui para baixo ─────────────────────────────────────────────────
//
// projectFiles(tsConfigFilePath?) aceita o caminho de um tsconfig dedicado.
// Em MONOREPO isto é OBRIGATÓRIO: aponte para um tsconfig.arch.json com `paths`
// mapeando os nomes de workspace (ex.: @org/pkg → packages/pkg/src), senão os
// imports por nome resolvem como "external" e as regras passam vazias (teatro).
// Em projeto single-package basta `projectFiles()` (acha o tsconfig.json da raiz).

const TS = 'tsconfig.arch.json'; // single-package: troque por projectFiles() sem argumento

export const archRules: ArchRule[] = [
  // ── Exemplo A — camadas DDD (single-package, imports relativos) ─────────────
  // {
  //   name: 'domain não pode depender de infrastructure',
  //   mode: 'enforced',
  //   build: () => projectFiles().inFolder('src/domain/**')
  //     .shouldNot().dependOnFiles().inFolder('src/infrastructure/**'),
  // },

  // ── Exemplo B — fronteiras entre pacotes (monorepo; exige tsconfig.arch.json+paths) ──
  {
    name: 'núcleo não pode depender de um consumidor',
    mode: 'enforced',
    build: () => projectFiles(TS).inFolder('packages/core/**')
      .shouldNot().dependOnFiles().inFolder('packages/app/**'),
  },

  // ── Sem ciclos (bom como 'freeze' inicial — mede o débito sem travar) ───────
  {
    name: 'sem ciclos de import em packages/**',
    mode: 'freeze',
    build: () => projectFiles(TS).inFolder('packages/**').should().haveNoCycles(),
  },
];
