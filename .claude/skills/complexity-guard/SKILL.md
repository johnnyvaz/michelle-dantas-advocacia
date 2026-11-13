---
name: complexity-guard
description: Trava a complexidade ciclomática (CCN) por função no ratchet do quality-gate. Mede com lizard (Python, TypeScript, TSX, JavaScript, Go, C#, Java, Kotlin, Ruby, PHP, Rust) e adiciona as métricas complexity_worst (pior função do projeto) e complexity_over_limit (débito - funções acima do limite), que só podem diminuir. Enforcement duplo - ratchet mede o débito legado sem travar; limite_hard opcional dá hard-fail no pre-commit/CI. Os arquivos-modelo verificados ficam em resources/. Requer quality-gate instalado. Invoque com /complexity-guard [caminho].
allowed-tools: Read, Bash, Write, Edit, Grep, Glob
---

# Skill: Complexity Guard — Complexidade Ciclomática no Ratchet

Fecha a lacuna do `/quality-gate`: cobertura, duplicação e erros de tipo entram no
ratchet, mas **nada impede uma função com CCN 40 de entrar no repo**. Esta skill mede
complexidade ciclomática por função e coloca duas métricas na catraca.

## Dois motores — a escolha muda o número, não só a ferramenta

| Motor | Quando | Por quê |
|-------|--------|---------|
| **eslint** (`complexity`) | projeto só TS/JS | parser real do TypeScript; preciso em TSX moderno |
| **[lizard](https://github.com/terryyin/lizard)** | Python, Go, C#, Java, monorepo poliglota | multi-linguagem com uma dependência |

O scanner escolhe sozinho (`motor: "auto"`): usa eslint quando **todo** path é TS/JS e
cada workspace tem `eslint` + `@typescript-eslint/parser`; senão, lizard. Force com
`"motor": "eslint"` ou `"lizard"` no `complexity-thresholds.json`.

**Repositório poliglota com TS** (ex.: SPA React + scripts Python): use `"motor": "misto"`.
O eslint mede TS/JS e o lizard mede o resto, com TS/JS excluído para não contar duas vezes.
O `auto` cairia no lizard e mediria o TSX com o defeito descrito abaixo.

> ⚠ **Por que isso não é detalhe.** O parser TS do lizard conta o `{` de um **tipo de
> retorno objeto-literal** (`function f(): { a: string } {`) como início de corpo, perde
> o rastro das chaves e funde o resto do arquivo numa função só. Medido num Next.js real:
> ele reportou **uma** função de CCN 90 chamada `fmtDate` — que na verdade tem 5 linhas e
> CCN 3 — onde o ESLint viu **15** funções, a pior com 27. E o efeito não é só inflar:
> como funde, ele **esconde**. No mesmo projeto o lizard dava pior CCN 90 e 437 acima do
> limite; o ESLint, **163 e 520**. Num monorepo TS o lizard viu 4.342 funções, o ESLint
> 6.890. Em projeto TypeScript, medir com lizard produz um número que não corresponde ao
> código — e um culpado errado no relatório.

## Modelo mental: dois níveis (igual ao arch-guard)

| Nível | Config | Comportamento | Para quê |
|-------|--------|---------------|----------|
| **ratchet** | `limite_ccn` (padrão 10) | mede o débito; só pode cair | débito legado — adoção incremental |
| **hard** | `limite_hard` (padrão `null` = desligado) | **hard-fail** no `--check` (pre-commit/CI) | teto absoluto, quando o débito já caiu |

Adoção incremental: comece só com o ratchet (`limite_hard: null`), reduza
`complexity_over_limit` até perto de zero, e **só então** ligue `limite_hard` como teto.

## Métricas que entram no ratchet

| Métrica | Direção | Significado |
|---------|---------|-------------|
| `complexity_worst` | `desc` | maior CCN do projeto — ninguém cria função pior que a pior atual |
| `complexity_over_limit` | `desc` | nº de funções acima de `limite_ccn` — o débito agregado |

As duas juntas cobrem os dois modos de piorar: **uma** função monstruosa nova
(`complexity_worst`) e **muitas** funções medianamente ruins (`complexity_over_limit`).

## Fatos do lizard — verificados empiricamente (v1.23.0)

Valem quando o lizard **é** o motor (projeto poliglota). Em TS/JS, prefira o eslint.

Rodados contra código real (backend FastAPI + frontend React 19/TSX do NOC-PH3A,
serviço Go do INTEGRADOR-WHATSAPP):

- Saída `--csv` **não tem cabeçalho** (só com `-V`). Colunas:
  `nloc, ccn, token, param, length, "location", "file", "function", "long_name", start, end`.
- O lizard **troca `"` por `'`** dentro dos campos, mas os campos **contêm vírgulas**
  (assinaturas). Parse posicional por `split(',')` quebra — o scanner usa parser CSV.
- ⚠ **Path inexistente faz o lizard pendurar** (sem erro, sem timeout). O scanner filtra
  os `paths` por `existsSync` antes de chamar; **nunca remova esse filtro**.
- Sem `-l`, varre todas as linguagens que conhece — inclusive `tsx`. Não é preciso
  declarar linguagem por projeto.
- `-x`/`--exclude` é cumulativo e aceita glob (562 funções com os excludes padrão vs.
  909 sem, no mesmo alvo).
- Rápido: ~0,4 s para 57 arquivos Python + 130 TSX com `-t 4`.
- Componentes React contam como função (o `Dashboard.tsx` do NOC deu **CCN 31**);
  arrow functions anônimas viram `(anonymous)` — por isso o relatório sempre mostra
  `arquivo:linha`, não só o nome.

## Arquivos-modelo (`resources/`)

A skill **copia** de `resources/` em vez de transcrever. Ver `resources/README.md`.

- `complexity-scan.mjs` — **verbatim** (ESM `.mjs`: funciona com ou sem `"type":"module"`)
- `complexity-thresholds.json` — template (ou gere com `--init`)

No motor eslint, o scanner gera `scripts/complexity.eslint.config.mjs` no primeiro uso —
config isolado, com `complexity: ['error', 0]` para que toda função reporte o próprio CCN.
Fica **separado** do `eslint.config` do projeto de propósito: nada da medição deve
influenciar o lint normal. É versionado (é política), diferente do relatório e do venv.

---

## Etapas

### 1. Receber o alvo e checar o pré-requisito

```bash
ROOT=<PROJETO_ROOT>
test -f "$ROOT/scripts/quality-gate.js" || echo "ERRO: execute /quality-gate primeiro"
command -v python3 >/dev/null || echo "ERRO: lizard precisa de Python 3"
```

Sem `scripts/quality-gate.js` não há catraca onde pendurar a métrica — **pare** e
rode `/quality-gate` antes.

### 2. Copiar o scanner e instalar o lizard

```bash
cp <SKILL_DIR>/resources/complexity-scan.mjs "$ROOT/scripts/complexity-scan.mjs"
cd "$ROOT" && node scripts/complexity-scan.mjs --setup
```

`--setup` cria `.complexity-venv/` na raiz e instala o lizard ali. Se o projeto já tem
venv (`.venv`, `backend/.venv`) ou o lizard no PATH, o scanner acha sozinho — a ordem de
busca é: `LIZARD_BIN` → `.complexity-venv` → `.venv`/`venv`/`backend/.venv` → PATH →
`python3 -m lizard`.

### 3. Gerar a config e ajustar os paths

```bash
cd "$ROOT" && node scripts/complexity-scan.mjs --init
```

O `--init` detecta os diretórios de fonte (`backend/src`, `frontend/src`, `src`, `app`,
`internal`, `cmd`…). **Revise `complexity-thresholds.json`**:

```json
{
  "limite_ccn": 10,
  "limite_hard": null,
  "paths": ["backend/src", "frontend/src"],
  "exclude": ["*/node_modules/*", "*/tests/*", "*.test.ts", "..."],
  "ignorar": []
}
```

- `limite_ccn: 10` é o padrão de mercado (SonarQube, McCabe). Em legado muito complexo,
  suba para 15 no primeiro ciclo e desça depois — o ratchet é sobre **não piorar**.
- `ignorar` isenta funções específicas: `"arquivo.py::funcao"` (preciso) ou `"funcao"`
  (por nome). Use com parcimônia — é dívida declarada, não desculpa.
- Testes ficam **fora** por padrão: teste com muito `if` é legítimo e poluiria a métrica.

### 4. Rodar o scan e mostrar os achados ao usuário

```bash
cd "$ROOT" && node scripts/complexity-scan.mjs --top 20
```

Exibir a tabela ao usuário **antes** de mexer no quality-gate — é o retrato do débito
atual e a base para decidir `limite_ccn`. Saída real (NOC-PH3A):

```
  Funções analisadas ............... 562
  Pior CCN ......................... 31
  CCN médio ........................ 2.4
  Acima do limite (> 10) ........... 9

   CCN  Função                             Local
  ────────────────────────────────────────────────────────────────────────────
    31  Dashboard                          frontend/src/components/Dashboard.tsx:80
    30  renderRow                          frontend/src/components/IncidentTable.tsx:273
    17  handler                            frontend/src/components/Dashboard.tsx:326
    15  verify_supabase_token              backend/src/security/supabase_auth.py:23
```

### 5. Integrar ao `scripts/quality-gate.js`

Inserir `measureComplexity` antes do bloco `// ─── Apresentação`:

```js
// ─── Complexidade ciclomática ────────────────────────────────────────────────

// Roda scripts/complexity-scan.mjs (motor: lizard) e lê as métricas do relatório.
// Medir ao vivo aqui é seguro: o CCN depende só do código do repo, não de um
// advisory DB externo que muda sozinho (como no SCA). Se o lizard não estiver
// instalado o scanner sai com exit 2 → métrica 'skip', nunca um número inventado.
function measureComplexity() {
  const scanner = path.join(ROOT, 'scripts', 'complexity-scan.mjs');
  if (!fs.existsSync(scanner)) return { complexity_worst: null, complexity_over_limit: null };

  const res = spawnSync('node', ['scripts/complexity-scan.mjs', '--json'],
    { cwd: ROOT, encoding: 'utf8' });

  if (res.status !== 0) {
    if (res.stderr) process.stderr.write(res.stderr);
    return { complexity_worst: null, complexity_over_limit: null };
  }
  try {
    const rep = JSON.parse(fs.readFileSync(path.join(ROOT, '.complexity-report.json'), 'utf8'));
    return {
      complexity_worst:      rep.metricas?.complexity_worst      ?? null,
      complexity_over_limit: rep.metricas?.complexity_over_limit ?? null,
    };
  } catch {
    return { complexity_worst: null, complexity_over_limit: null };
  }
}
```

Em `main()`, junto das outras medições:

```js
const cx = measureComplexity();
```

Duas linhas em `results`, condicionadas à **presença do scanner** — não ao valor:

```js
// Guard instalado deve SEMPRE aparecer na tabela: se o scanner existe mas a
// medição falhou, a linha sai como '—' (skip). Condicionar ao valor faria a
// métrica sumir em silêncio — indistinguível de nunca ter sido instalada.
function instalado(...partes) {
  return fs.existsSync(path.join(ROOT, ...partes));
}
```

```js
...(instalado('scripts', 'complexity-scan.mjs') ? [evaluate('Complexidade — pior função (CCN)', cx.complexity_worst,      b.complexity_worst,      'desc')] : []),
...(instalado('scripts', 'complexity-scan.mjs') ? [evaluate('Complexidade — acima do limite',   cx.complexity_over_limit, b.complexity_over_limit, 'desc')] : []),
```

> ⚠ O condicional por valor (`cx.complexity_worst != null ? …`) parece equivalente e
> não é: no dia em que o lizard falta no runner do CI, a métrica **desaparece da
> tabela** e o gate passa verde sem nunca ter olhado complexidade. Ninguém percebe
> uma linha que não existe; todo mundo percebe uma linha com `—`.

E no bloco `if (UPDATE)`, dentro de `updated`, **com fallback ao baseline salvo** —
sem ele, um `--update` rodado sem o lizard instalado **apagaria** a métrica do arquivo
versionado, zerando a catraca em silêncio:

```js
...(cx.complexity_worst != null
      ? { complexity_worst: ratchet(cx.complexity_worst, b.complexity_worst, 'desc') }
      : (b.complexity_worst != null ? { complexity_worst: b.complexity_worst } : {})),
...(cx.complexity_over_limit != null
      ? { complexity_over_limit: ratchet(cx.complexity_over_limit, b.complexity_over_limit, 'desc') }
      : (b.complexity_over_limit != null ? { complexity_over_limit: b.complexity_over_limit } : {})),
```

> Se o gate do projeto já usa esse padrão condicional para I/O budget ou SCA, **siga o
> padrão local** — ele existe justamente porque essas métricas são opcionais.

Validar antes de seguir: `node --check scripts/quality-gate.js`.

### 6. Semear o baseline

Duas formas, mesmo resultado:

**a) Suíte barata** — semeie alto e deixe o ratchet puxar para baixo:

```json
"complexity_worst": 999,
"complexity_over_limit": 999
```

```bash
cd "$ROOT" && node scripts/quality-gate.js --update
```

**b) Suíte cara** (`--update` roda testes + tsc + jscpd e leva minutos) — escreva
direto em `quality-baseline.json` os dois números que o scan acabou de medir. É
exatamente o que o `--update` gravaria, sem pagar a suíte inteira:

```json
"complexity_worst": 213,
"complexity_over_limit": 160
```

Depois rode `node scripts/quality-gate.js` (sem `--update`) para confirmar que as duas
linhas novas aparecem como `=` (equal).

### 7. `.gitignore`

```
.complexity-venv/
.complexity-report.json
```

`complexity-thresholds.json` **é versionado** (é a política do projeto).

### 8. Opcional — hard-fail no pre-commit

Só depois que o débito estiver baixo. Defina `limite_hard` (ex.: 25) e acrescente ao
`scripts/hooks/pre-commit`, antes do quality-gate:

```bash
node scripts/complexity-scan.mjs --check || exit 1
```

### 9. Opcional — CI

O runner do CI precisa do lizard. No job de qualidade, antes do quality-gate:

```yaml
- run: python3 -m pip install --quiet --user lizard
```

Se `/ci-pipeline` já estiver instalado, adicione a linha ao job existente em vez de
criar outro.

⚠ **Confira a versão do Node do runner.** O scanner é `.mjs` justamente por isso: um
`.js` com `import` e sem `"type": "module"` no `package.json` só roda por detecção
automática de sintaxe, que é padrão a partir do **Node 22.7**. Em runner com Node 20 —
comum em pipeline antigo — esse arquivo quebra com `SyntaxError`. Se o projeto já tem
outros scripts ESM em `.js`, eles quebram no CI mesmo sem esta skill: vale checar.

### 10. Confirmar

```
✓ scripts/complexity-scan.mjs criado
✓ complexity-thresholds.json criado (limite_ccn: N, paths: ...)
✓ .complexity-venv/ com lizard instalado
✓ scripts/quality-gate.js atualizado (measureComplexity + 2 métricas)
✓ quality-baseline.json semeado e atualizado
✓ .gitignore atualizado

Estado atual: pior CCN = X · Y função(ões) acima de N

Próximos passos:
  1. node scripts/complexity-scan.mjs --top 20   → lista de refatoração
  2. Ataque as 3 piores — cada refatoração baixa o baseline permanentemente
  3. Quando complexity_over_limit chegar perto de 0, ligue limite_hard
```

---

## Como baixar o CCN (guia rápido de refatoração)

CCN = 1 + nº de ramos (`if`, `elif`, `for`, `while`, `case`, `catch`, `&&`, `||`, `?:`).
Baixar de verdade significa **remover ramos**, não espalhá-los:

| Padrão | Efeito |
|--------|--------|
| **Early return / guard clause** | elimina o `else` e o aninhamento |
| **Tabela de despacho** (dict/map de handlers) | troca uma cadeia de 10 `elif` por 1 lookup |
| **Extrair sub-função coesa** | move ramos para outra função — só vale se a extraída ficar abaixo do limite |
| **Polimorfismo / estratégia** | mata o `switch` por tipo |
| **Validação declarativa** (Pydantic, zod) | remove os `if not campo: raise` |
| **Componente React**: extrair subcomponentes e hooks | JSX condicional conta como ramo |

Anti-padrão: quebrar a função em 5 pedaços que só ela chama, sem coesão — o CCN cai no
relatório e a legibilidade piora. A métrica é sintoma, não meta.

---

## Exemplos de uso

```
/complexity-guard
/complexity-guard /home/johnny/GIT/PH3A/PROJETOS/NOC-PH3A
```

Comandos do scanner, depois de instalado:

```bash
node scripts/complexity-scan.mjs             # tabela das piores
node scripts/complexity-scan.mjs --top 30    # top N
node scripts/complexity-scan.mjs --json      # .complexity-report.json (quality-gate)
node scripts/complexity-scan.mjs --check     # exit 1 se passar de limite_hard
node scripts/complexity-scan.mjs --setup     # instala o lizard em .complexity-venv/
node scripts/complexity-scan.mjs --init      # gera complexity-thresholds.json
```

---

## Relação com as outras skills

- `/quality-gate` — **pré-requisito**: é dono do ratchet e do baseline.
- `/quality-check` — executa o gate (já inclui esta métrica depois da integração).
- `/sonarqube` — também aponta complexidade > 10, mas como **relatório**; aqui vira gate.
- `/arch-guard` — mesmo modelo de dois níveis (freeze/ratchet vs. enforced/hard-fail).
- `/tdd` — refatorar função complexa sem teste é aposta; escreva o teste antes.

---

## Referências

- lizard: https://github.com/terryyin/lizard
- McCabe, *A Complexity Measure* (1976): https://doi.org/10.1109/TSE.1976.233837
- Regra de complexidade do SonarQube: https://rules.sonarsource.com/python/RSPEC-3776
