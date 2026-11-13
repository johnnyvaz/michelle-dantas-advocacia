---
name: ci-pipeline
description: Gera o pipeline de CI (GitHub Actions ou Azure Pipelines) que roda testes + o quality gate com ratchet (node scripts/quality-gate.js) + SonarQube a cada PR e push na main. Transforma o ratchet local em gate de merge no servidor — quem dá --no-verify ou não usa o loop não consegue regredir a qualidade. Detecta a stack e adapta os jobs. Requer quality-gate instalado. Invoque com /ci-pipeline [caminho].
allowed-tools: Read, Write, Edit, Bash, Glob
---

# Skill: CI/CD Pipeline — Gate de Qualidade no Servidor (PH3A)

Gera o workflow de CI que **executa o ratchet a cada PR/push**. Sem isso, `quality-gate`/`quality-check` só rodam
na máquina do dev e no pre-commit (burláveis com `--no-verify`). Esta skill fecha o loop: a regressão **reprova o
build** e bloqueia o merge.

> **Pré-requisito:** o projeto precisa ter o quality gate instalado (`scripts/quality-gate.js`). Se não tiver,
> oriente a rodar `/quality-gate` (ou `/ph3a-loop qualidade`) primeiro.

---

## Passo 1 — Detectar stack e CI existente

```bash
ls scripts/quality-gate.js 2>/dev/null            # pré-requisito
ls .github/workflows/ 2>/dev/null                 # GitHub Actions existente?
ls azure-pipelines.yml 2>/dev/null                # Azure Pipelines existente?
cat package.json 2>/dev/null | grep -E '"test"|"build"|vitest|jest'
ls */requirements.txt */pyproject.toml requirements.txt pyproject.toml 2>/dev/null
ls pnpm-lock.yaml */pnpm-lock.yaml package-lock.json */package-lock.json 2>/dev/null   # gerenciador: pnpm ou npm
ls sonar-project.properties 2>/dev/null
```

Identificar: backend (Python/Node), frontend (TS), monorepo, comandos de teste, e se há SonarQube configurado.

## Passo 2 — Escolher a plataforma

- **GitHub Actions** (default) se houver remoto GitHub.
- **Azure Pipelines** se o deploy é Azure DevOps/AKS (padrão de vários projetos PH3A).

Se ambíguo, perguntar. **Não sobrescrever** um workflow existente — informar e oferecer mesclar/criar variante.

## Passo 3 — Gerar o workflow

O job obrigatório roda o ratchet **sem `--update`** (qualquer regressão → exit 1 → build vermelho):

```bash
node scripts/quality-gate.js
```

Se `scripts/sca-scan.sh` existe (skill `/sca-guard`), o pipeline precisa rodá-lo **antes** do gate, em step próprio
(`bash scripts/sca-scan.sh`, `continue-on-error` no GitHub; `continueOnError: true` no Azure): o gate lê o
`.sca-report.json`, não roda o audit. Sem esse step o gate não tem relatório e `sca_high`/`sca_critical` viram `skip`.

### GitHub Actions — `.github/workflows/quality.yml` (Python + TS)

```yaml
name: quality
on:
  pull_request:
  push:
    branches: [main]

jobs:
  quality-gate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: "20" }
      - uses: actions/setup-python@v5
        with: { python-version: "3.11" }

      # Dependências (adaptar à stack detectada)
      - run: pip install -r backend/requirements.txt pytest pytest-cov
      - run: npm --prefix {{FRONTEND_DIR}} ci

      # Ratchet — reprova em regressão de qualquer métrica
      - name: Quality gate (ratchet)
        run: node scripts/quality-gate.js

  sonarqube:           # opcional — só se sonar-project.properties existir
    runs-on: ubuntu-latest
    if: ${{ hashFiles('sonar-project.properties') != '' }}
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - uses: SonarSource/sonarqube-scan-action@v3
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
          SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}
```

**Node-only:** remover o setup Python e usar `npm ci` + `npm test` na raiz.
**Monorepo Node com pnpm (api/ + web/)** — `npm ci` falha sem `package-lock.json`; use o gerenciador do lockfile:

```yaml
      - uses: pnpm/action-setup@v4
        with: { version: "9.15.9" }          # a de packageManager do package.json
      - uses: actions/setup-node@v4
        with: { node-version: "20", cache: pnpm, cache-dependency-path: "**/pnpm-lock.yaml" }
      - run: pnpm install --frozen-lockfile          # raiz (quando há package.json/lockfile na raiz)
      - run: pnpm --dir api install --frozen-lockfile
      - run: pnpm --dir web install --frozen-lockfile
      # Testes e stack isolada antes do ratchet (a skill /contract-first gera o compose de teste)
      - run: pnpm --dir api test:unit
      - run: pnpm --dir web test
      - run: docker compose -f docker-compose.test.yml up -d --build --wait
      - run: pnpm test:contract && pnpm test:e2e
      # SCA em step PRÓPRIO (depende de rede/advisory DB): grava .sca-report.json mesmo quando reprova ou não mede.
      # `continue-on-error` deixa o gate rodar depois e transformar o relatório em regressão (high/critical sobem)
      # ou em skip (null = pacote não medido). O gate LÊ o relatório; ele não roda o audit.
      - run: bash scripts/sca-scan.sh
        continue-on-error: true
      - run: node scripts/quality-gate.js          # SEM --update
```

> **`QUALITY_GATE_SEM_SCA=1` não faz parte do snippet.** Só existe em gates que a implementam (o `quality-gate.js` do
> fixture a lê; o template da skill `/quality-gate` documenta a variável). Num gate sem essa leitura ela é um no-op, e num
> gate com ela o SCA **some do CI sem substituto**. Se precisar da variável (CI sem rede), mantenha o step
> `bash scripts/sca-scan.sh` em outro job que tenha rede — nunca retire o SCA do pipeline.

**Alvo em subpasta de outro repositório** (fixture, exemplo, monorepo hospedeiro): o GitHub só lê `.github/workflows/`
da RAIZ do repositório. Gere o pipeline como **insumo** dentro do alvo (`<ALVO>/ci/quality.yml`) e diga ao dono que o
job real precisa entrar no workflow do repositório hospedeiro — não escreva em `.github/` do hospedeiro.
**Python-only:** remover os passos de Node/frontend.

### Azure Pipelines — `azure-pipelines.yml`

```yaml
trigger:
  branches: { include: [main] }
pr:
  branches: { include: ['*'] }

pool: { vmImage: ubuntu-latest }

steps:
  - task: NodeTool@0
    inputs: { versionSpec: "20.x" }
  - task: UsePythonVersion@0
    inputs: { versionSpec: "3.11" }     # remover se não houver Python
  - script: pip install -r backend/requirements.txt pytest pytest-cov
    displayName: Deps backend
  - script: npm --prefix {{FRONTEND_DIR}} ci
    displayName: Deps frontend
  - script: bash scripts/sca-scan.sh        # se o /sca-guard estiver instalado; o gate lê .sca-report.json
    displayName: SCA (audit de dependências)
    continueOnError: true
  - script: node scripts/quality-gate.js
    displayName: Quality gate (ratchet)
```

## Passo 4 — Substituições e secrets

- `{{FRONTEND_DIR}}` → `frontend` ou `.` conforme a stack.
- Comandos de teste/deps adaptados à stack detectada.
- Documentar ao usuário que `SONAR_TOKEN`/`SONAR_HOST_URL` vão em **secrets do repositório** (GitHub) ou
  **variáveis do pipeline** (Azure), nunca no YAML.

## Passo 5 — Verificar

- Validar o YAML (parse).
- Confirmar que o passo `node scripts/quality-gate.js` está **sem `--update`** (senão o gate auto-avança o
  baseline e nunca reprova).
- Lembrar: o baseline (`quality-baseline.json`) deve estar commitado para o ratchet comparar no CI.

---

## Notas

- Esta skill **gera o pipeline**; o veredito de qualidade continua sendo do `quality-gate.js`. CI e pre-commit
  rodam o mesmo comando — consistência local↔servidor.
- Em monorepo, rodar `node scripts/quality-gate.js` uma vez na raiz já cobre backend+frontend (o script agrega).
- Idempotente: nunca sobrescrever workflow existente sem confirmar.
- Aceita caminho como argumento (default: diretório atual).
