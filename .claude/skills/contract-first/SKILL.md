---
name: contract-first
description: Instala e faz scaffold de testes de contrato executáveis em .http (httpyac) com ambiente TOTALMENTE ISOLADO (docker-compose efêmero + mocks, seed fresco) e uma perna E2E externa headless (@playwright/test), amarrando um loop de desenvolvimento red/green — teste INTERNO (contrato da API) + teste EXTERNO (browser). Detecta a stack do projeto-alvo no install (Node/pnpm/npm, Docker, framework web, porta da API). Configura também o playwright-cli para debug interativo. Complementa /tdd (unit) e /quality-gate (ratchet). Invoque com /contract-first [caminho].
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
---

# Skill: Contract-First — testes .http isolados + loop interno/externo (PH3A)

Esta skill é um **scaffold/installer** (como `/quality-gate`). Rodando num projeto-alvo, ela:

1. **detecta a stack** do projeto e instala o tooling de teste;
2. faz **scaffold** de contratos executáveis `.http` (httpyac) — o teste **INTERNO** (contrato da API);
3. sobe uma **stack de teste totalmente isolada** (docker-compose efêmero, DB descartável, externos mockados);
4. configura a perna **EXTERNA** E2E headless (`@playwright/test`) + o `playwright-cli` para debug interativo;
5. amarra tudo num **loop de desenvolvimento** red/green (`scripts/test-loop.sh` + npm scripts + `/loop`).

> **Divisão do trabalho de teste PH3A:** `/tdd` = unit/integração (Jest/Vitest/pytest) · `/property-race-guard` = property/race · **`/contract-first` = contrato `.http` (interno) + E2E browser (externo), em ambiente isolado** · `/quality-gate` mede tudo no ratchet.

---

## ⚠️ Regra de ouro — segredos e LGPD (inviolável)

Este repositório tem `secret_guard` e a regra **"nunca dados reais"**. Ao fazer scaffold:

- **NUNCA** copie tokens/JWT/credenciais reais para nenhum arquivo. Todos os templates usam **placeholders** (`{{TEST_EMAIL}}`, `<TOKEN_CAPTURADO_EM_RUNTIME>`) — o token é obtido **em runtime** pelo bloco `{% %}` do login e gravado só em memória/env de teste.
- Credenciais de teste são **fictícias** e vivem em `contract-first/http-client.env.json`, que **deve entrar no `.gitignore`** (a skill adiciona).
- Dados de payload são **sintéticos** (use `/synthetic-data-generator` se precisar de CPF/CNPJ válidos fictícios). Nunca use PII de produção.

---

## Passo 1 — Detectar a stack do projeto-alvo

Rode a partir da raiz do projeto (aceita `[caminho]` como argumento; default: `.`).

```bash
# Gerenciador de pacotes
ls pnpm-lock.yaml package-lock.json yarn.lock 2>/dev/null
# App/API: onde está o package.json da API e a porta que ela sobe
find . -maxdepth 2 -name package.json -not -path '*/node_modules/*' 2>/dev/null
grep -rEn "listen\(|PORT|localhost:[0-9]+" --include=*.ts --include=*.js -l 2>/dev/null | head
# Docker disponível? (define isolamento por container vs. fallback)
command -v docker && docker compose version 2>/dev/null
ls docker-compose*.yml 2>/dev/null
# Web/E2E: framework do front (define baseURL e webServer do playwright)
grep -lE '"(react|vue|next|vite|@angular/core)"' */package.json package.json 2>/dev/null
```

Anote: **PM** (`pnpm`/`npm`/`yarn`), **dir da API** + **porta** + **prefixo de rota** (ex.: `/api/v1`), **Docker sim/não**, **dir do web** + **porta do dev server**. Tudo o que for scaffold é parametrizado por esses valores — **não hardcode caminhos de outro projeto**.

## Passo 2 — Instalar o tooling

Use o PM detectado (exemplos com `pnpm`):

```bash
# INTERNO: runner de contratos .http
pnpm add -D httpyac dotenv-cli
# EXTERNO: E2E headless determinístico
pnpm add -D @playwright/test
pnpm exec playwright install chromium          # sem sudo: baixa só o navegador
# `--with-deps` instala bibliotecas do SISTEMA e exige sudo/root — use só em runner de CI ou máquina que o permita.
# Se faltar uma biblioteca do sistema, o launch do Chromium diz qual: peça ao dono a instalação em vez de forçar.
```

**playwright-cli** (debug interativo dirigido por agente) é uma ferramenta à parte — **não a redocumente aqui**. Verifique a disponibilidade e aponte para a skill padrão:

```bash
command -v playwright-cli || echo "use: npx playwright-cli  (ver skill 'playwright-cli')"
```

## Passo 3 — Scaffold dos contratos `.http` (teste INTERNO)

Crie `contract-first/` na raiz do módulo da API, copiando os templates de `resources/` e **substituindo os placeholders** pelos valores do Passo 1:

```
contract-first/
├── .httpyac.json            # de resources/httpyac.config.json  (environments → baseUrl)
├── http-client.env.json     # de resources/env.http-client.json.tmpl  (credenciais FICTÍCIAS) → .gitignore
├── setup.http               # de resources/setup.http.tmpl  (register → login → captura token)
└── <entidade>/
    └── <entidade>.http      # de resources/crud-example.http.tmpl  (CRUD happy + sad, com asserções)
```

Regras (detalhadas em `references/httpyac-cheatsheet.md`):
- **Dois tipos de placeholder — não confunda:** `__ENTITY__`/`__entity__`/`__path__` são placeholders de **scaffold** (substitua ao criar o arquivo, ex.: `__entity__`→`empresa`, `__path__`→`empresas`); tudo em `{{...}}` (`{{baseUrl}}`, `{{authToken}}`, `{{email}}`…) é **variável httpyac de runtime** resolvida pelo env — **não substitua**. Preencha os valores de teste no `http-client.env.json`, não nos `.http`.
- Cada request tem `# @name` único e **asserções `??`** (`?? status == 201`, `?? body data.id exists`) — não só respostas comentadas.
- O `setup.http` captura o token no bloco `{% %}` e grava via `setEnvVar('authToken', ...)`; os demais usam `Authorization: Bearer {{authToken}}`.
- Sempre cobrir **happy path + sad paths** (400/401/404) — o contrato documenta o erro.

Adicione os npm scripts (ajuste o `--env` e o dotenv ao projeto):

```jsonc
{
  "scripts": {
    "test:contract":      "dotenv -e .env.test -- httpyac ./contract-first/**/*.http --env test --all",
    "test:contract:setup":"dotenv -e .env.test -- httpyac ./contract-first/setup.http --env test --all"
  }
}
```

## Passo 4 — Ambiente TOTALMENTE ISOLADO

> **Credenciais do compose de teste FIXAS (fictícias), sem `${VAR:-padrão}`.** O Docker Compose carrega o `.env` da
> pasta automaticamente: `USUARIO_TESTE_SENHA=${USUARIO_TESTE_SENHA:-x}` pega o valor do `.env` de DESENVOLVIMENTO e o
> login do `setup.http` passa a falhar com 401 sem motivo aparente. Isolado inclui isso.

"Isolado" = a rodada **não toca estado compartilhado/prod** e é **reproduzível** (seed fresco a cada run).

- **Com Docker (default):** copie `resources/docker-compose.test.yml.tmpl` → `docker-compose.test.yml`, adaptando serviços à stack (ex.: `db-test` Postgres efêmero com `tmpfs`, a `api` em `NODE_ENV=test` apontando para `db-test`, e **mocks** dos externos — Asaas/ClickHouse/etc. — via container `wiremock`/`mockserver` ou stubs). Nada de portas/volumes de prod.
- **Sem Docker (fallback):** use um **banco de teste local dedicado** (schema separado, migrado + seed no setup) e **mocke as chamadas externas** — no plano interno via interceptors do httpyac; no plano externo via `page.route(...)` do Playwright (ver `references/httpyac-cheatsheet.md`).

O seed roda no início do `test-loop.sh` (Passo 6). A stack é derrubada no fim (trap).

## Passo 5 — Perna EXTERNA (E2E browser headless)

> **Monorepo:** o `webServer.command` do modelo (`pnpm dev`) sobe o que o `dev` da RAIZ definir — num projeto cujo
> `dev` é `docker compose up` isso é errado. Suba o web dev server do pacote web (`pnpm --dir web exec vite --port <P>
> --strictPort`) **apontado para a api de TESTE**, numa porta própria e com `reuseExistingServer: false`: reaproveitar
> um Vite já aberto cairia na api de desenvolvimento.

Copie:
- `resources/playwright.config.ts.tmpl` → `playwright.config.ts` (headless; `baseURL` = URL do web/dev server; `webServer` opcional para subir o front na CI; `retries` no CI).
- `resources/e2e.example.spec.ts.tmpl` → `e2e/<fluxo>.spec.ts` (ex.: login → ação → asserção visível ao usuário).

npm scripts:

```jsonc
{
  "scripts": {
    "test:e2e":      "playwright test",
    "test:e2e:ui":   "playwright test --ui",
    "test:e2e:debug":"playwright test --debug"
  }
}
```

> **Papéis distintos:** `@playwright/test` = perna externa **automatizada/determinística** do loop e da CI. `playwright-cli` = **exploração/debug interativo** quando um E2E quebra (snapshot, `route` mock, `console`/`network`). Não dirija o loop de regressão com o `playwright-cli`.

## Passo 6 — Loop de desenvolvimento (interno → externo, isolado)

Copie `resources/test-loop.sh` → `scripts/test-loop.sh` (`chmod +x`). Ajuste `CONTRACT_DIR` (onde ficam os `.http`), `PM` e
`API_HEALTH_URL`. Ele orquestra uma rodada completa:

```
scripts/test-loop.sh
  1. up      → docker-compose.test.yml (ou fallback)  →  DB efêmero + mocks     [ISOLADO]
  2. seed    → migrate + seed sintético (estado reproduzível)
  3. INTERNO → httpyac contract-first/**/*.http        →  contrato da API (rápido)
  4. EXTERNO → playwright test                         →  fluxo real no browser
  5. down    → trap derruba a stack sempre; relatório red/green
```

**Códigos de saída e `SEED_CMD`** (o que o script diz, para ninguém confundir com verde):

| exit | significado |
|---|---|
| 0 | loop verde: contrato **e** e2e rodaram e passaram |
| 1 | alguma perna falhou (ou a API não ficou saudável) |
| 2 | flag desconhecida |
| **3** | **sem `docker` no PATH e sem `--no-docker`**: contrato e e2e **não foram executados por falta de ambiente**. Não é verde. Em CI sem Docker, o job precisa de um runner com Docker ou de `--no-docker` com a stack de teste já de pé |

`SEED_CMD` vazio (o padrão) significa "a API migra e semeia ao subir (comando do serviço no compose)"; o script avisa isso
no log. Se a API **não** semeia sozinha, informe o comando (`SEED_CMD="$PM run migrate:latest"`), senão os contratos
rodam contra banco vazio e falham por dados, não por defeito.

npm script + cadência com o primitivo `/loop` (não escrevemos watcher próprio):

```jsonc
{ "scripts": { "test:loop": "bash scripts/test-loop.sh" } }
```

```bash
# rodada única
pnpm test:loop
# loop contínuo de desenvolvimento (re-executa a cada intervalo)
/loop 2m pnpm test:loop
```

Quando um teste externo quebra, abra o `playwright-cli` para inspecionar interativamente; corrija; o `/loop` re-valida.

## Passo 7 — Fechar

- Confirme que `contract-first/http-client.env.json` está no `.gitignore` e que **nenhum** arquivo tem token/credencial real (`grep -rEn "eyJ[A-Za-z0-9_-]{10,}" contract-first/` deve vir vazio).
- Rode uma vez: `pnpm test:loop` — deve subir isolado, passar interno+externo e derrubar a stack.
- (Opcional) `/quality-gate` já mede a suíte no ratchet; garanta que os novos testes entram na medição.

---

## Templates (em `resources/`)

| Arquivo | Vira | Papel |
|---|---|---|
| `setup.http.tmpl` | `contract-first/setup.http` | register → login → **captura de token** (`{% %}`) |
| `crud-example.http.tmpl` | `contract-first/<ent>/<ent>.http` | CRUD happy+sad com asserções `??` |
| `httpyac.config.json` | `contract-first/.httpyac.json` | environments → `baseUrl` por ambiente |
| `env.http-client.json.tmpl` | `contract-first/http-client.env.json` | credenciais **fictícias** (→ `.gitignore`) |
| `docker-compose.test.yml.tmpl` | `docker-compose.test.yml` | stack efêmera isolada (db + api + mocks) |
| `playwright.config.ts.tmpl` | `playwright.config.ts` | config E2E headless |
| `e2e.example.spec.ts.tmpl` | `e2e/<fluxo>.spec.ts` | exemplo E2E externo |
| `test-loop.sh` | `scripts/test-loop.sh` | runner interno+externo com setup/teardown isolado |

Referência de sintaxe: `references/httpyac-cheatsheet.md`.

## Checklist

- [ ] Stack detectada (PM, dir/porta da API, prefixo de rota, Docker?, dir/porta do web)?
- [ ] `httpyac` + `@playwright/test` instalados; `playwright install` rodado; `playwright-cli` verificado?
- [ ] `contract-first/` com `setup.http` (captura de token) + exemplo CRUD com asserções `??`?
- [ ] `http-client.env.json` com credenciais **fictícias** e no `.gitignore`?
- [ ] Ambiente isolado (docker-compose.test.yml **ou** fallback DB de teste + mocks)?
- [ ] `playwright.config.ts` + 1 `.spec.ts` de exemplo (headless)?
- [ ] `scripts/test-loop.sh` (interno→externo, teardown no trap) + npm scripts `test:contract`/`test:e2e`/`test:loop`?
- [ ] `grep` de JWT/segredo em `contract-first/` veio **vazio**?
- [ ] `pnpm test:loop` roda verde ponta a ponta e derruba a stack?
