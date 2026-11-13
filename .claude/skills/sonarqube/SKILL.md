---
name: sonarqube
description: >-
  Análise de qualidade de código estilo SonarQube — sem servidor, sem token, sem Docker. Usa capacidades nativas do Claude (Read, Grep, Glob) para detectar bugs, vulnerabilidades, code smells, duplicações e hotspots de segurança. Invoque com /sonarqube seguido do caminho ou PR. Modos: autofix (corrige automaticamente) ou list (só lista findings).
allowed-tools: Read, Grep, Glob, Bash, Write, Edit, MultiEdit
---

# Skill: SonarQube Local — Análise de Qualidade de Código

Replica as categorias do SonarQube usando análise estática nativa.
Não requer servidor, token ou Docker.

---

## Categorias de Análise (espelhando o SonarQube)

| Categoria SQ | O que analisar |
|---|---|
| **Reliability** (Bugs) | Código que pode causar comportamento inesperado em runtime |
| **Security** (Vulnerabilities) | Falhas exploráveis: injection, XSS, auth, exposição de dados |
| **Security Hotspots** | Código sensível que precisa revisão humana |
| **Maintainability** (Code Smells) | Código difícil de manter: complexidade, duplicação, dead code |
| **Coverage** | Ausência de testes para código crítico |
| **Duplications** | Blocos de código duplicados (>10 linhas similares) |

---

## Instruções ao Claude

### 1. Receber escopo

O usuário pode fornecer:
- **Arquivo**: `src/api/users.ts`
- **Diretório**: `src/services/`
- **Glob**: `src/**/*.ts`
- **Branch diff**: "analise o que mudou neste branch" → usar `git diff main...HEAD --name-only`
- **Sem argumento**: analisar todos os arquivos staged (`git diff --cached --name-only`)

### 2. Perguntar modo (se não especificado)

```
Modo de análise:
  1) list     — listar findings sem alterar código (padrão)
  2) autofix  — corrigir automaticamente o que for seguro
```

### 3. Perguntar severidade mínima (se não especificado)

```
Severidade mínima:
  1) blocker  — só crítico
  2) high     — alto e acima (padrão)
  3) medium   — médio e acima
  4) all      — todos
```

### 4. Coletar arquivos

```bash
# Branch diff:
git diff main...HEAD --name-only

# Staged:
git diff --cached --name-only

# Diretório:
# Usar Glob: src/**/*.{ts,tsx,js,jsx,py,cs,java}
```

### 5. Para cada arquivo: Ler e analisar

Use **Read** para ler o arquivo completo. Analise linha a linha contra os critérios abaixo.

---

## Critérios de Análise

### 🔴 BLOCKER — Bugs de Reliability

Código que **vai** quebrar em runtime:

- `null` / `undefined` dereference sem guarda: `obj.prop` quando `obj` pode ser null
- Promise sem `.catch()` ou `await` em async
- Variável usada antes de ser declarada/inicializada
- Condição always-true ou always-false (ex: `if (x === x)`)
- Loop infinito sem break condition
- Return em void sem valor, mas o tipo espera valor
- Comparação com `==` onde `===` é necessário por tipo

### 🔴 BLOCKER — Security Vulnerabilities

- SQL Injection: concatenação de string em query
- Command Injection: `exec()`, `spawn()` com input não sanitizado
- Path Traversal: `fs.readFile(userInput)`
- Credenciais hardcoded: `password =`, `secret =`, chaves em código
- Deserialização insegura: `JSON.parse(userInput)` sem validação

### 🟠 HIGH — Bugs de Reliability

- `parseInt()` sem radix: `parseInt(value)` → deve ser `parseInt(value, 10)`
- `typeof` com tipo inválido: `typeof x === 'integer'`
- Shadowing de variável em escopo aninhado
- Retorno implícito `undefined` em função que deveria retornar valor
- `===` com tipos diferentes nunca vai ser `true`

### 🟠 HIGH — Security Hotspots

Requerem revisão humana — podem ou não ser problema:
- `Math.random()` para geração de tokens/IDs de segurança
- `console.log` com objetos que podem conter dados pessoais
- `localStorage` ou `sessionStorage` com dados sensíveis
- CORS configurado com wildcard `*`
- Headers de segurança ausentes (X-Frame-Options, CSP, HSTS)
- Algoritmos fracos: MD5, SHA1 para hash de senha

### 🟡 MEDIUM — Code Smells: Complexidade

- Função com mais de **30 linhas** (exceto casos declarativos)
- Função com mais de **4 parâmetros**
- Complexidade ciclomática > 10: `if/else if/switch/for/while/catch` acumulados
- Nesting profundo: mais de **4 níveis** de indentação
- Arquivo com mais de **300 linhas**

### 🟡 MEDIUM — Code Smells: Manutenibilidade

- `TODO`, `FIXME`, `HACK`, `XXX` no código
- Código comentado (blocos de código comentados, não comentários explicativos)
- Magic numbers sem constante nomeada: `if (status === 42)` sem nome
- Funções/variáveis não utilizadas (dead code)
- `any` em TypeScript onde tipo específico é possível
- Switch sem `default`

### 🟡 MEDIUM — Code Smells: Duplicações

Blocos de **10+ linhas** similares em mais de um arquivo ou na mesma função.
Detectar: funções com lógica idêntica em arquivos diferentes, copy-paste de blocos.

### 🟢 LOW — Code Smells: Estilo e Convenções

- Nomes de variáveis de 1 letra (exceto `i`, `j`, `k` em loops, `e` em catch)
- Múltiplos `return` em função simples onde um único seria mais claro
- Imports não utilizados
- `console.log` / `console.error` em código de produção (não em dev/teste)
- `var` em TypeScript/JS moderno (usar `const`/`let`)

### ℹ️ INFO — Cobertura (Coverage)

Identificar ausência de testes para:
- Funções `public` sem arquivo de teste correspondente
- Casos de erro/exceção sem teste
- Lógica de negócio sem teste (UseCases, Services)

---

## Formato do Relatório

Salvar em `.sonarqube/report-[YYYY-MM-DD].md` e exibir resumo no chat.

```markdown
# SonarQube Local — Relatório de Análise

**Data:** [data atual]
**Escopo:** [arquivos analisados]
**Modo:** list / autofix
**Severidade mínima:** high

---

## Dashboard

| Categoria | Blocker | High | Medium | Low | Info |
|-----------|---------|------|--------|-----|------|
| Bugs (Reliability) | X | X | X | X | - |
| Vulnerabilities (Security) | X | X | X | - | - |
| Security Hotspots | - | X | X | - | - |
| Code Smells | - | - | X | X | - |
| Duplications | - | - | X | - | - |
| Coverage | - | - | - | - | X |
| **TOTAL** | **X** | **X** | **X** | **X** | **X** |

**Quality Gate:** ✅ PASSED / ❌ FAILED

> FAILED se: qualquer Blocker OU mais de 3 High

---

## Findings (ordenados por severidade)

### 🔴 [BUG-001] Promise sem tratamento de erro

**Categoria:** Reliability (Bug)
**Severidade:** BLOCKER
**Arquivo:** `src/services/FooService.ts:42`
**Regra:** `promise-without-catch`

```typescript
// Código atual:
fetchData(url);  // Promise não awaited, sem .catch()

// Correção sugerida:
await fetchData(url);  // ou .catch(handleError)
```

**Impacto:** Erros silenciosos em produção.

---

### 🟠 [SEC-001] Hotspot: Math.random() para token

**Categoria:** Security Hotspot
**Severidade:** HIGH
**Arquivo:** `src/utils/token.ts:15`
**Regra:** `weak-rng`

**Revisar:** `Math.random()` não é criptograficamente seguro para tokens.
**Sugestão:** Usar `crypto.randomBytes()` ou `crypto.randomUUID()`.

---

### 🟡 [SMELL-001] Função complexa (32 linhas)

[...]

---

## Duplicações Detectadas

| Bloco | Arquivo A | Arquivo B | Linhas |
|-------|-----------|-----------|--------|
| Lógica de paginação | `src/repos/FooRepo.ts:40-55` | `src/repos/BarRepo.ts:22-37` | 15 |

---

## Coverage — Funções sem Teste

| Função | Arquivo | Criticidade |
|--------|---------|-------------|
| `processPayment()` | `src/services/PaymentService.ts` | Alta |

---

## Próximos Passos

- [ ] Corrigir Blockers (SLA: imediato)
- [ ] Revisar Security Hotspots (SLA: 7 dias)
- [ ] Refatorar Code Smells High (SLA: próxima sprint)
```

---

## Modo Autofix

Se o usuário escolheu `autofix`:

1. Corrigir apenas issues **seguros de corrigir automaticamente**:
   - `parseInt` sem radix → adicionar `, 10`
   - `var` → `const` ou `let`
   - Imports não utilizados → remover
   - `console.log` em produção → remover ou substituir por logger
   - Magic numbers → extrair constante nomeada

2. **Não corrigir automaticamente** (listar para revisão humana):
   - Vulnerabilidades de segurança (requerem contexto)
   - Lógica de negócio complexa
   - Duplicações (requerem decisão arquitetural)
   - Hotspots de segurança

3. Após autofix: re-analisar e mostrar findings restantes.

4. **Nunca commitar automaticamente** — mostrar o diff e aguardar confirmação.

---

## Integração com tasks/ (Anti-Entropia)

Se encontrar issues fora do escopo do trabalho atual:
- **NÃO implementar** — adicionar em `tasks/bugs.md` ou `tasks/backlog.md`
- Formato: `- [ ] [SQ] Descrição 📅 data 🔼 prioridade 🤖`
  - `Local: src/file.ts:42`
  - `Regra: promise-without-catch`

---

## Outputs Gerados

| Arquivo | Conteúdo |
|---|---|
| `.sonarqube/report-[data].md` | Relatório completo |
| `.sonarqube/findings.json` | Findings em JSON para integração |

Adicionar ao `.gitignore`: `.sonarqube/`

---

## Exemplos de Uso

```
/sonarqube src/services/PaymentService.ts
/sonarqube src/api/ --mode autofix --severity high
/sonarqube --scope branch    (analisa diff do branch atual vs main)
/sonarqube --scope staged    (analisa apenas arquivos staged)
```
