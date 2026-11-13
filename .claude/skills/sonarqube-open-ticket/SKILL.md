---
name: sonarqube-open-ticket
description: Abre um chamado (User Story + Tasks filhas) no Azure DevOps para um lote de apontamentos do SonarQube. Genérica/parametrizável — a config do tracker (org, projeto, areaPath, sprint) vem de um arquivo de config do projeto ou de variáveis de ambiente. Grava rastreabilidade local em .tmp/sonar-tickets/. Chamada pela skill sonarqube-review, mas pode ser invocada passando o payload manualmente. Invoque com /sonarqube-open-ticket.
allowed-tools: Read, Write, Bash
---

# SonarQube Open Ticket — PH3A (genérica)

Recebe um lote de apontamentos (segmentado pela skill `sonarqube-review`) e cria no Azure DevOps:
- 1 **User Story** representando o lote
- N **Tasks** filhas (uma por agrupamento de arquivo, máx. 5)

> Esta skill é **parametrizável**: nada de org/projeto/área fica hardcoded. A config vem do projeto (ver Passo 0).
> Toda a inteligência validada do fluxo ADO está preservada (REST PATCH, fallback de sprint, evitar `TF200016`).

> **Instrução ao agente:** antes de executar, declare `$agentModel` com o nome amigável do LLM em uso
> (ex.: `$agentModel = "Claude Opus 4.8"`). Se não declarado, o rodapé exibirá `IA (modelo não informado)`.

---

## Passo 0 — Carregar configuração do projeto (parametrização)

A config do tracker é resolvida nesta ordem: **arquivo `sonar-ado.config.json` na raiz** → **variáveis de ambiente**
→ **perguntar ao usuário**. Nunca hardcode valores de projeto na skill.

> **Primeira vez no projeto?** Há um modelo versionado junto da skill. Copie-o para a raiz e preencha:
> ```bash
> cp .claude/skills/sonarqube-open-ticket/sonar-ado.config.example.json sonar-ado.config.json
> ```
> O `sonar-ado.config.json` real é gitignored (pode conter nomes internos).

`sonar-ado.config.json` (exemplo — os valores abaixo são os do DataCob V4, troque pelos do seu projeto):
```json
{
  "org":            "https://dev.azure.com/ph3a",
  "project":        "General",
  "areaPath":       "General\\DataCob",
  "sprintAreaName": "DataCob",
  "projectLabel":   "DataCob V4",
  "tags":           "sonarqube"
}
```

```powershell
# Carregar config
$cfgPath = "sonar-ado.config.json"
if (Test-Path $cfgPath) {
    $cfg = Get-Content $cfgPath -Raw | ConvertFrom-Json
} else {
    $cfg = [pscustomobject]@{
        org            = $env:ADO_ORG
        project        = $env:ADO_PROJECT
        areaPath       = $env:ADO_AREA_PATH
        sprintAreaName = $env:ADO_SPRINT_AREA
        projectLabel   = $env:ADO_PROJECT_LABEL
        tags           = ($env:ADO_TAGS ? $env:ADO_TAGS : "sonarqube")
    }
}
foreach ($k in "org","project","areaPath","sprintAreaName") {
    if ([string]::IsNullOrWhiteSpace($cfg.$k)) {
        Write-Error "Config ADO incompleta: '$k' ausente. Preencha sonar-ado.config.json ou as variáveis ADO_*."
        return
    }
}
$org = $cfg.org; $project = $cfg.project; $areaPath = $cfg.areaPath
$adoRestBase = $org
if ([string]::IsNullOrWhiteSpace($cfg.projectLabel)) { $cfg | Add-Member projectLabel $project -Force }
$tags = if ($cfg.tags) { $cfg.tags } else { "sonarqube" }
```

> **Armadilhas validadas (genéricas):**
> - O **nome do projeto ADO** muitas vezes difere do nome do produto (no DataCob, é `General`, não `DataCob`).
>   Usar o nome errado causa `TF200016`. Por isso vem da config, não adivinhado.
> - `AreaPath` e `IterationPath` **não aceitam barra inicial** — formato `"<Projeto>\\<Area>\\<Sprint>"`.

---

## Payload esperado (recebido de sonarqube-review)

```json
{
  "title": "[<projectLabel>] Apontamento SonarQube - VULNERABILITY HIGH em <module>",
  "type": "VULNERABILITY",
  "severity": "HIGH",
  "module": "<module>",
  "groups": [
    { "file": "src/.../Repo.cs",
      "items": [ { "key": "AX...", "rule": "csharpsquid:S2077", "message": "...", "line": 42 } ] }
  ],
  "sonarKeys": ["AX..."]
}
```

> **Taxonomia (SonarQube 24.x — MQR):** `type` = VULNERABILITY (SECURITY) | BUG (RELIABILITY) | HOTSPOT.
> `severity` para issues = impact severity (BLOCKER/HIGH/MEDIUM/LOW/INFO); para hotspots = vulnerabilityProbability.

---

## Passo 1 — Pré-requisitos

```powershell
if (-not (Get-Command az -ErrorAction SilentlyContinue)) {
    Write-Error "Azure CLI nao encontrado. Instale az CLI com a extensao Azure DevOps."
    return
}
```

## Passo 2 — Access token ADO

Operações de campo (area, iteration, description) usam REST API diretamente — `az boards work-item update` falha
com paths que contêm espaços. O token é obtido uma vez e reutilizado.

```powershell
$tokenResp   = & az account get-access-token --resource "499b84ac-1321-427f-aa17-267ca6975798" --output json | ConvertFrom-Json
$accessToken = $tokenResp.accessToken
$adoHeaders  = @{ Authorization = "Bearer $accessToken"; "Content-Type" = "application/json-patch+json" }
```

## Passo 3 — Detectar sprint corrente

```powershell
$iterationPath = $null
try { . ".specify/scripts/powershell/common.ps1"; $iterationPath = Get-CurrentIteration -project $project -org $org } catch { }

if ([string]::IsNullOrWhiteSpace($iterationPath)) {
    $today = Get-Date
    $raw   = (& az boards iteration project list --project $project --org $org --depth 3 --output json 2>&1) -join ""
    $obj   = $raw | ConvertFrom-Json
    $areaNode = $obj.children | Where-Object { $_.name -eq $cfg.sprintAreaName }
    $sprint   = $areaNode.children | Where-Object {
        $_.attributes.startDate -and $_.attributes.finishDate -and
        [datetime]$_.attributes.startDate -le $today -and [datetime]$_.attributes.finishDate -ge $today
    } | Select-Object -First 1
    if ($sprint) { $iterationPath = $sprint.path -replace "^\\", "" }   # sem barra inicial
}
if ([string]::IsNullOrWhiteSpace($iterationPath)) { Write-Error "Nao foi possivel detectar a sprint ativa."; return }
Write-Host "Sprint detectada: $iterationPath"
```

## Passo 4 — Montar descrição (User Story e Tasks)

```powershell
if ([string]::IsNullOrWhiteSpace($agentModel)) { $agentModel = "IA (modelo não informado)" }

function Build-StoryHtml {
    param($payload, $agentModel, $projectLabel)
    $html  = "<h2>Contexto</h2><p>Apontamento gerado pela análise do SonarQube no projeto $projectLabel.</p><ul>"
    $html += "<li><strong>Tipo:</strong> $($payload.type)</li><li><strong>Severidade:</strong> $($payload.severity)</li>"
    $html += "<li><strong>Módulo:</strong> $($payload.module)</li><li><strong>Total de itens:</strong> $($payload.sonarKeys.Count)</li></ul>"
    $html += "<h2>Arquivos afetados</h2>"
    foreach ($g in $payload.groups) {
        $html += "<h3>$($g.file)</h3><ul>"
        foreach ($i in $g.items) { $html += "<li><strong>Linha $($i.line)</strong> — Regra: <code>$($i.rule)</code><br/>$($i.message)</li>" }
        $html += "</ul>"
    }
    $html += "<h2>Critério de aceite</h2><p>Todos os itens listados resolvidos ou marcados como aceitos no SonarQube.</p>"
    $html += "<hr/><p><em>Chamado gerado com assistência de $agentModel</em></p>"
    return $html
}
function Build-TaskHtml {
    param($group, $agentModel)
    $rulesList = ($group.items | Select-Object -ExpandProperty rule -Unique) -join ", "
    $html  = "<h2>Arquivo</h2><p><strong>$($group.file)</strong></p><h2>Regra</h2><p>$rulesList</p><h2>Ocorrências</h2><ul>"
    foreach ($i in $group.items) { $html += "<li><strong>Linha $($i.line):</strong> $($i.message)</li>" }
    $html += "</ul><h2>Critério de aceite</h2><p>Todas as ocorrências resolvidas ou aceitas no SonarQube.</p>"
    $html += "<hr/><p><em>Chamado gerado com assistência de $agentModel</em></p>"
    return $html
}
```

## Passo 5 — Confirmar com o usuário

```
Resumo do chamado a ser aberto:
  Tipo Work Item : User Story
  Título         : <payload.title>
  Área           : <areaPath>
  Sprint         : <iterationPath>
  Tasks filhas   : <N> (uma por arquivo)
  Tags           : <tags>
Confirmar criação? [S/n]
```

## Passo 6 — Criar User Story + Tasks (REST API)

`az boards work-item create` cria o item (título + tag); todos os outros campos via PATCH REST — evita
truncamento de descrição e falha com espaço no IterationPath.

```powershell
function New-AdoWorkItem {
    param([string]$type, [string]$title, [string]$areaPath, [string]$iterationPath, [string]$descHtml)
    $raw = & az boards work-item create --type $type --title $title `
        --fields "System.Tags=$tags" --org $org --project $project --output json 2>&1
    if ($LASTEXITCODE -ne 0) { throw "Falha ao criar $type`: $raw" }
    $id = [int]($raw | ConvertFrom-Json).id
    $body = ConvertTo-Json @(
        @{ op="replace"; path="/fields/System.AreaPath";      value=$areaPath }
        @{ op="replace"; path="/fields/System.IterationPath"; value=$iterationPath }
        @{ op="replace"; path="/fields/System.Description";   value=$descHtml }
    ) -Compress
    Invoke-RestMethod -Uri "$adoRestBase/$project/_apis/wit/workitems/${id}?api-version=7.1" `
        -Method Patch -Body $body -Headers $adoHeaders | Out-Null
    return $id
}

$storyDesc = Build-StoryHtml -payload $payload -agentModel $agentModel -projectLabel $cfg.projectLabel
$storyId   = New-AdoWorkItem -type "User Story" -title $payload.title -areaPath $areaPath -iterationPath $iterationPath -descHtml $storyDesc
Write-Host "User Story criada: AB#$storyId"

$taskIds = @()
foreach ($group in $payload.groups) {
    $fileName  = Split-Path $group.file -Leaf
    $linesList = ($group.items | ForEach-Object { $_.line }) -join ", "
    $taskTitle = "Corrigir $($payload.type.ToLower()) em $fileName (linha $linesList)"
    $taskDesc  = Build-TaskHtml -group $group -agentModel $agentModel
    $taskId    = New-AdoWorkItem -type "Task" -title $taskTitle -areaPath $areaPath -iterationPath $iterationPath -descHtml $taskDesc
    & az boards work-item relation add --id $taskId --relation-type "Parent" --target-id $storyId --org $org --output none | Out-Null
    $taskIds += $taskId
    Write-Host "  Task criada: AB#$taskId — $taskTitle"
}
```

## Passo 7 — Rastreabilidade local

```powershell
$ticketsDir = ".tmp/sonar-tickets"
New-Item -ItemType Directory -Path $ticketsDir -Force | Out-Null
$slug       = ($payload.module -replace "[^a-zA-Z0-9]", "-").ToLower()
$dateStr    = (Get-Date).ToString("yyyyMMdd")
$filePath   = Join-Path $ticketsDir "$dateStr-$($payload.type.ToLower())-$($payload.severity.ToLower())-$slug.md"
$adoEditUrl = "$adoRestBase/$project/_workitems/edit"
@"
# $($payload.title)

- **status:** aberto
- **data:** $(Get-Date -Format "yyyy-MM-dd")
- **User Story:** AB#$storyId — $adoEditUrl/$storyId
- **Tasks:**
$(($taskIds | ForEach-Object { "  - AB#$_ — $adoEditUrl/$_" }) -join "`n")
- **Tipo:** $($payload.type)  | **Severidade:** $($payload.severity)  | **Módulo:** $($payload.module)
- **Sonar keys:** $($payload.sonarKeys -join ", ")

## Arquivos
$(($payload.groups | ForEach-Object { "- $($_.file)" }) -join "`n")
"@ | Set-Content $filePath -Encoding UTF8
Write-Host "Rastreabilidade gravada em: $filePath"
```

## Passo 8 — Reportar resultado

```
Chamado aberto!
  User Story : AB#<id> — <título>
  Sprint     : <iterationPath>
  Tasks      : AB#X, AB#Y, AB#Z
  Link       : <org>/<project>/_workitems/edit/<id>
  Registro   : .tmp/sonar-tickets/<arquivo>.md
```

---

## Regras obrigatórias

- **Nunca criar chamado sem confirmação humana explícita.**
- **Toda config de projeto vem de `sonar-ado.config.json`/env** — nunca hardcode org/projeto/área na skill.
- O **nome do projeto ADO** pode diferir do nome do produto (ex.: DataCob → projeto `General`). Errar causa `TF200016`.
- `AreaPath`/`IterationPath` **sem barra inicial**.
- Area, iteration e description sempre via **REST API PATCH** — nunca via `az boards work-item update` (falha com espaço no path).
- Tag obrigatória (default `sonarqube`).
- **Máximo 5 Tasks por chamado** (a segmentação em lotes é responsabilidade da `sonarqube-review`).
- Descrição completa — nunca resumir o conteúdo do SonarQube.
- Gravar sempre o arquivo de rastreabilidade em `.tmp/sonar-tickets/` após criação bem-sucedida (adicionar `.tmp/` ao `.gitignore`).
- Se `az` CLI não estiver disponível, avisar e encerrar sem erro fatal.
