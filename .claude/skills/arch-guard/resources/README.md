# Resources — arch-guard

Arquivos-modelo da skill. A skill **copia** estes arquivos para o projeto-alvo
(em vez de transcrevê-los), reduzindo risco de erro. Todos foram validados
empiricamente contra `archunit@2.3.0` (incl. num monorepo bun real).

| Arquivo | Tipo | Destino no alvo | Adaptação |
|---------|------|-----------------|-----------|
| `arch-report.ts` | **verbatim** (invariante) | `tests/architecture/arch-report.ts` | nenhuma |
| `arch-scan.mjs` | quase-verbatim | `scripts/arch-scan.mjs` | só `REPORT_CMD` (bun vs `npx tsx`) |
| `arch.rules.ts` | **template** | `tests/architecture/arch.rules.ts` | helpers verbatim; regras reescritas por projeto |
| `architecture.test.ts` | template | `tests/architecture/architecture.test.ts` | só o import do runner (bun/vitest/jest) |
| `tsconfig.arch.json` | template | `tsconfig.arch.json` (RAIZ) | `paths` dos workspaces; só monorepo |
| `install-arch-deps.sh` | quase-verbatim | `scripts/install-arch-deps.sh` | detecta o gerenciador sozinho |

**Verbatim** = copie sem alterar. **Template** = ponto de partida, sempre ajustado.

Notas de ouro (aprendidas em instalação real):
1. `tsconfig.arch.json` fica na **raiz** — os labels do ArchUnitTS são relativos ao diretório dele.
2. Em **monorepo**, o `paths` é obrigatório; sem ele, imports por nome (`@org/pkg`) viram `external` e as regras inter-pacote passam vazias (teatro). Valide com um **probe invertido** (uma dependência que existe deve dar violação > 0).
3. O `arch-report.ts` é **type-clean sem `@types/node`** (não usa `process`) — não regride `ts_errors` do quality-gate.
4. `metrics()` (LCOM/coupling) está **quebrada** na v2.3.0 — não use. `dependOnFiles`, `haveNoCycles` e `haveName` funcionam.
