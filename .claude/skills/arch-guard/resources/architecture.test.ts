// tests/architecture/architecture.test.ts  (RESOURCE — TEMPLATE)
//
// Testes de arquitetura — regras 'enforced' (hard-fail). Usa `.check()` (portável,
// funciona em qualquer runner sem matcher especial nem `globals: true`).
//
// ADAPTAR APENAS o import do runner conforme o projeto:
//   bun     → import { describe, expect, it } from 'bun:test';
//   vitest  → import { describe, expect, it } from 'vitest';
//   jest    → globais (remova o import) ou from '@jest/globals';
//   node    → sem runner instalado (raiz sem Jest/Vitest): `node:test` + `node:assert/strict`, rodando com
//             `node --import tsx --test tests/architecture/architecture.test.ts` (passe o ARQUIVO: em Node 24 o
//             diretório não é aceito). Troque `expect(x).toEqual([])` por `assert.deepEqual(x, [])`.

import { describe, expect, it } from 'bun:test';
import { archRules, formatViolation, isRealViolation } from './arch.rules';

describe('Arquitetura (enforced)', () => {
  for (const rule of archRules.filter((r) => r.mode === 'enforced')) {
    // 3º arg = timeout (ms). A 1ª análise faz cold start do ArchUnitTS (parse do projeto
    // inteiro) e estoura o timeout padrão de 5s do bun/jest. Funciona em bun:test/vitest/jest.
    it(rule.name, async () => {
      const violations = (await rule.build().check()).filter(isRealViolation);
      expect(violations.map(formatViolation)).toEqual([]);
    }, 120_000);
  }
});
