---
name: sonarqube-review
description: Lê os apontamentos do SonarQube de um projeto (via scripts/sonar-report.sh ou API), segmenta em lotes por tipo/severidade/módulo/arquivo (máx. 5 grupos de arquivo por lote) e, com confirmação, abre um chamado por lote chamando /sonarqube-open-ticket. Faz dedupe contra chamados já abertos em .tmp/sonar-tickets/. É a etapa de leitura/triagem do fluxo "leitura e resolução do SonarQube". Invoque com /sonarqube-review [severidade-mínima].
allowed-tools: Read, Bash, Write, Skill
---

# SonarQube Review — Leitura e Triagem (PH3A)

Etapa de **leitura** do fluxo de resolução do SonarQube: busca os apontamentos do servidor, **segmenta em lotes
tratáveis** e dispara a abertura de chamado (`/sonarqube-open-ticket`) para cada lote. Pareia com a `/sonarqube`
(análise serverless, autofix/list) e com o `quality-gate` (cobertura/duplicação no ratchet).

> **Distinção:** `/sonarqube` faz análise estática local (sem servidor). Esta skill lê um **servidor SonarQube
> real** (issues/hotspots persistidos) e organiza o trabalho de remediação em chamados rastreáveis.

---

## Passo 1 — Obter os apontamentos do SonarQube

Reusar o script existente (preferido) ou a API:

```bash
# Reusa scripts/sonar-report.sh, que escreve sonar-report.json (issues + métricas + quality gate).
# Requer User Token: .sonar-user-token ou SONAR_USER_TOKEN (ver cabeçalho do script).
if [ -f scripts/sonar-report.sh ]; then
  bash scripts/sonar-report.sh || true
fi
ls sonar-report.json 2>/dev/null
```

- Se `sonar-report.json` não existir e o script falhar, orientar a configurar o User Token / `SONAR_HOST_URL` e o
  `PROJECT` (project key — vem de `sonar-project.properties`). Sem servidor configurado, sugerir `/sonarqube`
  (análise local) como alternativa.
- O **project key** sai de `sonar-project.properties` (`sonar.projectKey`). O `sonar-report.sh` do boilerplate tem
  um `PROJECT` que deve refletir esse key — ajustar se divergir.

## Passo 2 — Normalizar a taxonomia (SonarQube 24.x — MQR)

Para cada issue de `sonar-report.json`, determinar:
- **type**: `VULNERABILITY` (SECURITY) | `BUG` (RELIABILITY) | `HOTSPOT`. (Em relatórios antigos pode vir
  `CODE_SMELL`/`SECURITY_HOTSPOT` — mapear: hotspot→HOTSPOT, code_smell→BUG/maintainability conforme o caso.)
- **severity**: impact severity `BLOCKER`/`HIGH`/`MEDIUM`/`LOW`/`INFO` (issues) ou `vulnerabilityProbability`
  `HIGH`/`MEDIUM`/`LOW` (hotspots). Em relatórios antigos (`BLOCKER`/`CRITICAL`/`MAJOR`/`MINOR`/`INFO`), tratar
  `CRITICAL`→`HIGH`, `MAJOR`→`MEDIUM`, `MINOR`→`LOW`.
- **module**: derivar do caminho do arquivo — o primeiro segmento significativo abaixo de `src/`
  (ex.: `src/modules/Pagamentos/...` → `Pagamentos`). Se não houver estrutura clara, usar o project key.

Aplicar o filtro de **severidade mínima** se passado como argumento (ex.: `/sonarqube-review HIGH` ignora
MEDIUM/LOW/INFO). Default: `HIGH` (prioriza o que importa).

## Passo 3 — Dedupe contra chamados já abertos

```bash
ls .tmp/sonar-tickets/*.md 2>/dev/null
```

Ler os arquivos de rastreabilidade e coletar as `Sonar keys` já com chamado aberto. **Excluir** dos lotes
qualquer issue cuja `key` já apareça — não reabrir chamado para o que já está em tratamento.

## Passo 4 — Segmentar em lotes

Regras de segmentação (cada lote vira UM chamado):

1. Agrupar issues por **(type, severity, module)** — um lote por combinação.
2. Dentro do lote, agrupar por **arquivo** (`groups[].file` com seus `items`).
3. **Máximo 5 grupos de arquivo por lote** (limite de Tasks). Se um (type,severity,module) tiver mais de 5
   arquivos, **dividir em múltiplos lotes** (parte 1/N, 2/N…) e dizer isso ao usuário (sem truncar silenciosamente).
4. Ordenar lotes por severidade (BLOCKER/HIGH primeiro).

Montar o payload por lote no schema esperado pela `/sonarqube-open-ticket`:

```json
{
  "title": "[<projectLabel>] Apontamento SonarQube - <TYPE> <SEVERITY> em <module>",
  "type": "<TYPE>", "severity": "<SEVERITY>", "module": "<module>",
  "groups": [ { "file": "<path>", "items": [ { "key": "...", "rule": "...", "message": "...", "line": 0 } ] } ],
  "sonarKeys": ["..."]
}
```

## Passo 5 — Confirmar o plano e abrir os chamados

Mostrar o **plano de lotes** antes de abrir nada:

```
Apontamentos lidos: <N> (após filtro de severidade e dedupe)
Lotes a abrir: <M>
  1) VULNERABILITY HIGH  em Pagamentos        — 3 arquivos, 7 itens
  2) BUG MEDIUM          em Faturamento (1/2) — 5 arquivos, 12 itens
  ...
Abrir os chamados? [S/n]  (você confirma cada um individualmente na sub-skill)
```

Para cada lote confirmado, invocar **`/sonarqube-open-ticket`** passando o payload. A sub-skill faz sua própria
confirmação, cria a User Story + Tasks e grava a rastreabilidade — o que alimenta o dedupe do Passo 3 na próxima
execução.

## Passo 6 — Resumo final

```
Triagem concluída.
  Lotes abertos: <M>  | Itens cobertos: <N>  | Já em tratamento (dedupe): <K>
  Chamados: AB#... , AB#...
  Registros: .tmp/sonar-tickets/
```

---

## Notas

- **Genérica**: nada de projeto fica hardcoded aqui; o tracker é responsabilidade da `/sonarqube-open-ticket`
  (config em `sonar-ado.config.json`). O project key sai de `sonar-project.properties`.
- **Não enviar conteúdo de código para fora** — a leitura usa a API do SonarQube local/corporativo.
- Pareia com `/sonarqube` (autofix local de itens simples) — itens triviais podem ser corrigidos direto em vez de
  virar chamado; itens que exigem trabalho/decisão viram chamado por esta skill.
- Aceita a severidade mínima como argumento (default `HIGH`).
- Adicionar `.tmp/` ao `.gitignore`.
