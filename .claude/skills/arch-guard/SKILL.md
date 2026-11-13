---
name: arch-guard
description: Trava as fronteiras de arquitetura de projetos TypeScript ao estilo ArchUnit (Java), usando ArchUnitTS. Define camadas e fronteiras entre pacotes (monorepo), regras de dependência permitidas/proibidas, detecta ciclos de import e impõe nomenclatura. Enforcement duplo - regras "enforced" dão hard-fail no CI/pre-commit (como ArchRule); regras "freeze" (débito legado, equivalente ao FreezingArchRule) entram no ratchet do quality-gate via a métrica arch_violations, que só pode diminuir. Os arquivos-modelo verificados ficam em resources/. Requer quality-gate instalado.
allowed-tools: Read, Bash, Write, Edit, Grep, Glob
---

# Skill: Arch Guard — Travar a Arquitetura em TypeScript (estilo ArchUnit)

Faz pelo TypeScript o que o **ArchUnit** faz pelo Java: transforma as regras de
arquitetura (limites de camada, fronteiras entre pacotes, ausência de ciclos,
nomenclatura) em **testes executáveis** que falham quando alguém cruza uma fronteira
proibida.

Motor: **[ArchUnitTS](https://github.com/LukasNiessen/ArchUnitTS)** (`archunit` no npm),
a porta mais fiel do ArchUnit para TS — mesma API fluente
`projectFiles().inFolder(...).shouldNot().dependOnFiles()...`.

## Modelo mental: dois níveis de regra

| Nível | Equivale no ArchUnit Java | Comportamento | Onde vive |
|-------|---------------------------|---------------|-----------|
| **`enforced`** | `ArchRule` | **Hard-fail** — qualquer violação quebra CI/pre-commit | `tests/architecture/architecture.test.ts` |
| **`freeze`** | `FreezingArchRule` | **Ratchet** — a contagem só pode cair; não trava o build | métrica no `quality-gate` |

Adoção incremental: comece uma regra como `freeze` (mede o débito sem travar), reduza
até **zero**, e **promova** para `enforced`.

## Fatos da API ArchUnitTS — verificados empiricamente (v2.3.0)

Todo o código gerado depende destes fatos (confirmados rodando a lib, inclusive num
monorepo bun real):

- `await rule.check()` retorna um **array** de violações; `.length === 0` = OK.
- Violação de dependência: `{ dependency: { sourceLabel, targetLabel, cumulatedEdges:[{external}] }, isNegated }`.
- **Glob sem arquivos NÃO lança** — retorna uma violação de "empty test"
  `{ filters, message: "No files found matching pattern(s)...", isNegated }`. O código
  gerado a classifica como *regra mal configurada*, nunca como violação de arquitetura.
- `.check()` roda **standalone** (via `bun` ou `npx tsx`), sem Jest/Vitest.
- `projectFiles(tsConfigFilePath?)` aceita o caminho de um tsconfig. Exige um tsconfig
  que **inclua** os arquivos (cuidado com `files: []` + project references — não inclui nada).
- **Funcionam:** `dependOnFiles`, `haveNoCycles`, `haveName`. **Quebrada na v2.3.0:**
  `metrics()` (LCOM/coupling) — `guessLocationOfTsconfig is not a function`. Não use.

> ⚠ **Monorepo — a armadilha decisiva:** quando os pacotes se importam por **nome de
> workspace** (`@org/core`), o ArchUnitTS resolve esse import como **external** e as
> regras inter-pacote por pasta passam **vazias** — um ✓ verde que não verifica nada.
> A correção: um `tsconfig.arch.json` na raiz com `baseUrl`+`paths` mapeando cada nome
> de workspace para `packages/<pkg>/src`. **Sempre valide com um probe invertido**
> (uma dependência que SABIDAMENTE existe deve gerar violação > 0; inspecione
> `cumulatedEdges[0].external === false`).

## Arquivos-modelo (`resources/`)

A skill **copia** de `resources/` em vez de transcrever (menos erro). Ver
`resources/README.md` para o mapa completo. Resumo:

- `arch-report.ts` — **verbatim** (invariante; type-clean sem `@types/node`)
- `arch-scan.mjs` — quase-verbatim (ajuste só `REPORT_CMD`; sem `bun`, `npx tsx tests/architecture/arch-report.ts`)
- `arch.rules.ts` — **template** (helpers verbatim; regras reescritas por projeto)
- `architecture.test.ts` — template (ajuste só o import do runner)
- `tsconfig.arch.json` — template (monorepo: preencha `paths`)
- `install-arch-deps.sh` — detecta o gerenciador (bun/pnpm/yarn/npm)

---

## Etapas

### 1. Receber o alvo e checar pré-requisitos

```bash
ROOT=<PROJETO_ROOT>
test -f "$ROOT/scripts/quality-gate.js" || echo "ERRO: execute /quality-gate primeiro"
find "$ROOT" -maxdepth 2 -name "tsconfig*.json" -not -path "*/node_modules/*"   # ArchUnitTS precisa de tsconfig
```

### 2. Detectar a arquitetura, a stack e o runner

```bash
ROOT=<PROJETO_ROOT>
# camadas single-package:
ls -d "$ROOT"/src/*/ 2>/dev/null
# monorepo:
ls -d "$ROOT"/packages/*/ 2>/dev/null
grep -h '"name"' "$ROOT"/packages/*/package.json 2>/dev/null          # nomes de workspace
grep -rhoE 'from "@[^"]+"' "$ROOT"/packages --include="*.ts" | sort | uniq -c | sort -rn | head  # imports cross-package
# runner + gerenciador:
ls "$ROOT"/{bun.lock,pnpm-lock.yaml,yarn.lock} 2>/dev/null
grep -E '"test"|vitest|jest' "$ROOT"/package.json 2>/dev/null
```

Definir: `SRC_ROOT`/pacotes, runner (`bun:test`/`vitest`/`jest`), gerenciador,
e se é **monorepo** (imports por nome de workspace).

### 3. (Monorepo) Criar `tsconfig.arch.json` e VALIDAR com probe invertido

Copie `resources/tsconfig.arch.json` para a **raiz** e preencha `paths` com os nomes
reais dos workspaces → `packages/<pkg>/src`. **Copie `baseUrl` e `paths` do tsconfig real do projeto**
(`tsconfig.base.json`, `tsconfig.json`...), não do template: alias perdido (`@/*`, `@app/*`, `@org/pkg`) faz o import
resolver como *external* e as regras ficam vazias — vale também em single-package que usa alias. Ajuste o `include` aos
diretórios de código reais. Então prove que a detecção funciona,
**antes** de escrever as regras finais — rode um probe com uma dependência que existe:

```ts
// probe temporário: uma dependência REAL (ex.: app importa core) DEVE acusar > 0
const r = projectFiles('tsconfig.arch.json').inFolder('packages/app/**')
  .shouldNot().dependOnFiles().inFolder('packages/core/**');
console.log((await r.check()).length);  // 0 = paths errado (regras seriam teatro); >0 = OK
```

Confirme também o file-set (uma regra `haveName('*.NUNCA')` deve violar = nº de arquivos).
Apague o probe depois. Em **single-package sem nenhum alias de import**, pule esta etapa e use `projectFiles()` sem argumento; com alias, o
`tsconfig.arch.json` com os `paths` copiados continua obrigatório.

### 4. Definir as regras (`arch.rules.ts`) e medir o estado atual

Copie `resources/arch.rules.ts`, mantenha os helpers, e **reescreva `archRules`** com
as fronteiras reais. Remova regras de pastas inexistentes (glob vazio = hard-fail).
Rode o report uma vez para ver o estado:

```bash
bun tests/architecture/arch-report.ts            # ou: npx tsx ...
```

Regra em **0 violações** → pode nascer `enforced`. Com débito → `freeze`.

### 5. Copiar os demais artefatos

- `resources/arch-report.ts` → `tests/architecture/arch-report.ts` (verbatim)
- `resources/architecture.test.ts` → `tests/architecture/` (ajuste o import do runner)
- `resources/arch-scan.mjs` → `scripts/` (ajuste `REPORT_CMD`; use `.cjs`/`require` se o projeto não for `"type":"module"`)
- `resources/install-arch-deps.sh` → `scripts/` e rode-o

> **Após copiar, rode o formatter/linter do projeto** (`biome check --write`,
> `prettier --write`, `eslint --fix`) sobre os arquivos novos — os resources usam um
> estilo neutro (aspas simples, espaços) e, se o projeto exige outro (ex.: Biome PH3A =
> tabs + aspas duplas), os arquivos entram como **erros de formatação** e regridem a
> métrica de lint do quality-gate. Os helpers já evitam `any` (usam `unknown` + narrowing),
> e os arquivos de teste/scan/report **não** entram no `tsconfig` do app (ficam fora do
> `bun run typecheck`); valide-os rodando `bun test` / `bun arch-report.ts`. Adicione
> `.arch-scan-report.json` ao ignore do **gitignore E do linter** (ex.: `biome.json`).

### 6. Integrar ao `quality-gate` do alvo

**Detecte o formato do `quality-gate.js` existente** — há dois padrões em uso na PH3A;
use o que o arquivo do alvo realmente tiver:

**Formato A — `evaluate()`/`ratchet()` (template /quality-gate, baseline com `metrics:`):**
```js
// função de coleta: o scan só grava .arch-scan-report.json com --json (sem a flag ele só imprime e o gate leria nada)
function measureArch() {
  const nulo = { arch_violations: null, arch_cycles: null };
  if (!fs.existsSync(path.join(ROOT, 'scripts', 'arch-scan.mjs'))) return nulo;
  spawnSync('node', ['scripts/arch-scan.mjs', '--json'], { cwd: ROOT, encoding: 'utf8' });
  try {
    const r = JSON.parse(fs.readFileSync(path.join(ROOT, '.arch-scan-report.json'), 'utf8'));
    return { arch_violations: r.arch_violations ?? null, arch_cycles: r.arch_cycles ?? null };
  } catch { return nulo; }
}

const arch = measureArch();
// no array `results`:
evaluate('Violações de arquitetura', arch.arch_violations, b.arch_violations, 'desc'),
evaluate('Ciclos de import',         arch.arch_cycles,     b.arch_cycles,     'desc'),
// no bloco --update (objeto `updated`):
arch_violations: ratchet(arch.arch_violations, b.arch_violations, 'desc'),
arch_cycles:     ratchet(arch.arch_cycles,     b.arch_cycles,     'desc'),
```

**Formato B — `assertNotIncreased()` / `current` flat (ex.: monorepo bun):**
```js
// função de coleta:
function measureArch() {
  const out = run("bun tests/architecture/arch-report.ts 2>&1");           // ou: npx tsx ...
  const line = out.trim().split("\n").reverse()
    .find((l) => l.trim().startsWith("{") && l.includes("arch_violations"));
  if (!line) return { arch_violations: 0, arch_cycles: 0 };
  try { const r = JSON.parse(line); return { arch_violations: r.arch_violations ?? 0, arch_cycles: r.arch_cycles ?? 0 }; }
  catch { return { arch_violations: 0, arch_cycles: 0 }; }
}
// no objeto `current`: arch_violations: arch.arch_violations, arch_cycles: arch.arch_cycles
// nas verificações:
assertNotIncreased("arch_violations", "Violações de arquitetura");
assertNotIncreased("arch_cycles", "Ciclos de import");
```

Em ambos, `dir`/sentido é **menor-é-melhor**. Em seguida, grave o baseline com os
valores atuais (formato A: `--update`; formato B: adicione `arch_violations`/`arch_cycles`
ao `quality-baseline.json` — manualmente para não recoletar/alterar métricas alheias).

### 7. Enforcement duplo (hook + CI)

- **Pre-commit:** adicione `node scripts/arch-scan.mjs` ao hook (husky, `.git/hooks` ou
  `simple-git-hooks` no `package.json`; reaplique com `bunx simple-git-hooks`).
- **CI:** se o pipeline já roda o quality-gate (ex.: `bun run quality:check`), o arch
  **já está coberto** pela integração da etapa 6 — não precisa de step novo. Caso
  contrário, adicione um step `node scripts/arch-scan.mjs` (ou `bun test tests/architecture`).
- **`.gitignore`:** adicione `.arch-scan-report.json`.

### 8. Confirmar

Liste os arquivos criados/alterados e o estado (`node scripts/arch-scan.mjs`). Lembre o
usuário: reduza o débito `freeze` e promova `freeze → enforced` ao zerar.

---

## Exemplos de uso

```
/arch-guard
/arch-guard /home/johnny/GIT/PH3A/MeuProjeto
```

## Mapa ArchUnit (Java) → ArchUnitTS

| Intenção | ArchUnit (Java) | ArchUnitTS |
|----------|-----------------|------------|
| Camada/pacote X não depende de Y | `noClasses().that().resideInAPackage("..x..").should().dependOnClassesThat().resideInAPackage("..y..")` | `projectFiles(TS).inFolder('packages/x/**').shouldNot().dependOnFiles().inFolder('packages/y/**')` |
| Sem ciclos | `slices()...should().beFreeOfCycles()` | `projectFiles(TS).inFolder('src/**').should().haveNoCycles()` |
| Convenção de nome | `classes()...haveSimpleNameEndingWith("Service")` | `projectFiles(TS).inFolder('**/services/**').should().haveName('*.service.ts')` |
| Congelar débito legado | `FreezingArchRule.freeze(rule)` | `mode: 'freeze'` → ratchet |

## Notas importantes

- **Empty-test protection** — glob sem arquivos = regra **mal configurada** (hard-fail no
  scan), nunca violação de arquitetura. Não deixe regras default apontando para pastas ausentes.
- **Monorepo** — sem `tsconfig.arch.json` + `paths`, regras inter-pacote são teatro. Valide
  sempre com o probe invertido (etapa 3).
- **Promoção freeze → enforced** é o coração da adoção incremental; nunca afrouxe uma
  regra já `enforced`.
- **Runner** — o teste usa `.check()` (portável). Só o import muda: `bun:test`/`vitest`/`jest`.

## Referências

- ArchUnitTS: https://github.com/LukasNiessen/ArchUnitTS — docs: https://lukasniessen.github.io/ArchUnitTS/
- ArchUnit (Java) `FreezingArchRule`: https://www.archunit.org/userguide/html/000_Index.html#_freezing_arch_rules
- Clean Architecture / camadas: https://martinfowler.com/bliki/PresentationDomainDataLayering.html
