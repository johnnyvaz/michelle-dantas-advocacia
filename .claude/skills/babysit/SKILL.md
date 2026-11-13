---
name: babysit
description: >-
  Mantém um PR merge-ready em loop: verifica CI, resolve conflitos,
  corrige issues apontadas em review e resolve automaticamente as
  threads já endereçadas. Provider-aware: detecta GitHub (gh) ou
  Azure DevOps (az repos/az pipelines) pelo remote. Use com /loop
  para monitoramento contínuo.
allowed-tools: Bash, Read, Edit, Write, Grep
---

# Babysit PR

Seu objetivo é levar este PR ao estado **merge-ready**. Você é o **zelador, não o autor**: corrige o que é mecânico (CI, conflito trivial, thread já endereçada) e **para no que exige decisão humana**. O merge em si é sempre do humano.

Esta skill é **provider-aware**. No Passo 0 você detecta o provedor; em cada passo seguinte rode **apenas o bloco do provedor detectado**. Repita os passos até todos os critérios do quality gate (Passo 7) estarem satisfeitos.

---

## Passo 0 — Detectar o provedor

```bash
git remote get-url origin
```

- contém `github.com` → **PROVIDER = github** — requer `gh auth status` ok.
- contém `visualstudio.com` ou `dev.azure.com` → **PROVIDER = azure** — requer a extensão `azure-devops` (`az extension add --name azure-devops`) e autenticação (`az login` **ou** `export AZURE_DEVOPS_EXT_PAT=<pat>`).
- outro → **pare** e pergunte ao usuário qual provedor usar.

**Azure DevOps — derive e exporte os identificadores do remote** (formatos `https://{org}.visualstudio.com/{project}/_git/{repo}` ou `https://dev.azure.com/{org}/{project}/_git/{repo}`):

```bash
ORG_URL="https://{org}.visualstudio.com"   # ou https://dev.azure.com/{org}
PROJECT="{project}"
REPO="{repo}"
# Reuse em todos os comandos: --org "$ORG_URL" --project "$PROJECT"
```

Se a auth do provedor falhar, peça `! gh auth login` (github) ou `! az login` (azure) e encerre.

---

## Passo 1 — Identificar o PR alvo

Se `$ARGUMENTS` contém número/URL de PR, use direto. Caso contrário, infira da branch atual.

**GitHub:**
```bash
gh pr view --json number,url,headRefName,baseRefName
```

**Azure DevOps:**
```bash
BRANCH="$(git rev-parse --abbrev-ref HEAD)"
az repos pr list --org "$ORG_URL" --project "$PROJECT" \
  --source-branch "$BRANCH" --status active \
  --query "[0].{id:pullRequestId, title:title, source:sourceRefName, target:targetRefName}"
```

Guarde o id/número do PR para os próximos passos.

---

## Passo 2 — Snapshot do estado atual

**GitHub:**
```bash
gh pr view <number> --json number,title,state,mergeable,reviewDecision,headRefName,baseRefName,commits
gh pr checks <number>
```

**Azure DevOps:**
```bash
az repos pr show --id <id> --org "$ORG_URL" \
  --query "{title:title, status:status, mergeStatus:mergeStatus, isDraft:isDraft, \
            source:sourceRefName, target:targetRefName, \
            reviewers:reviewers[].{name:displayName, vote:vote}}"
# Políticas/CI (build validation, required reviewers):
az repos pr policy list --id <id> --org "$ORG_URL" \
  --query "[].{policy:configuration.type.displayName, status:status}"
```

Monte um resumo interno com: **mergeável?**, **aprovado?**, **checks/políticas passando ou falhando?**

> Mapa de equivalência (use o do seu provedor):
> | Conceito | GitHub | Azure DevOps |
> |---|---|---|
> | mergeável | `mergeable == MERGEABLE` | `mergeStatus == succeeded` |
> | aprovado | `reviewDecision == APPROVED` | todos os reviewers obrigatórios com `vote == 10` |
> | CI verde | `checks` todos `pass`/`success` | `policy list` todas com `status == approved` |
> | conflito | `mergeStateStatus == DIRTY` | `mergeStatus == conflicts` |
>
> Votos Azure DevOps: `10` aprovado · `5` aprovado c/ sugestões · `0` sem voto · `-5` aguardando autor · `-10` rejeitado.

---

## Passo 3 — Carregar as threads de revisão

**GitHub:**
```bash
gh api graphql -f query='
query($owner: String!, $repo: String!, $pr: Int!) {
  repository(owner: $owner, name: $repo) {
    pullRequest(number: $pr) {
      headRefOid
      author { login }
      reviewThreads(first: 100) {
        nodes { id isResolved isOutdated path line
          comments(last: 5) { nodes { id body author { login } createdAt updatedAt } } }
      }
    }
  }
}' -f owner=OWNER -f repo=REPO -F pr=NUMBER
```

**Azure DevOps:**
```bash
az devops invoke --org "$ORG_URL" \
  --area git --resource pullRequestThreads --http-method GET \
  --route-parameters project="$PROJECT" repositoryId="$REPO" pullRequestId=<id> \
  --api-version 7.1 \
  --query "value[?!isDeleted].{id:id, status:status, file:threadContext.filePath, \
           line:threadContext.rightFileStart.line, \
           comments:comments[].{author:author.displayName, content:content, updated:lastUpdatedDate}}"
```
> Status de thread no Azure DevOps: `active` (aberta) · `fixed`/`closed`/`byDesign`/`wontFix` (encerradas) · `pending`. Trate `active`/`pending` como "aberta". Se a forma do JSON variar pela versão da API, **inspecione a saída** antes de mapear os campos.

---

## Passo 4 — Classificar cada thread aberta

Para cada thread aberta (GitHub: `isResolved == false`; Azure: `status` em `active`/`pending`):

**Elegível para auto-resolve** (qualquer condição):
- código mudou após o comentário (GitHub: `isOutdated == true`; Azure: comentário anterior ao `headRefOid`/último push — confirme pela data);
- o último comentário foi do **autor do PR** (revisor já respondido);
- a thread não pede mudança (informativa ou elogio).

**Requer ação humana** (não auto-resolver):
- último comentário é do **revisor** sem resposta do autor;
- pede mudança de comportamento ou decisão de arquitetura não-trivial.

Monte duas listas: `para_resolver` e `requer_acao`.

---

## Passo 5 — Resolver as threads elegíveis

**GitHub:**
```bash
gh api graphql -f query='
mutation($threadId: ID!) {
  resolveReviewThread(input: { threadId: $threadId }) { thread { id isResolved } }
}' -f threadId="THREAD_ID"
```

**Azure DevOps** (PATCH do status da thread para `fixed`):
```bash
printf '{"status":"fixed"}' > /tmp/thread-status.json
az devops invoke --org "$ORG_URL" \
  --area git --resource pullRequestThreads --http-method PATCH \
  --route-parameters project="$PROJECT" repositoryId="$REPO" pullRequestId=<id> threadId=<threadId> \
  --api-version 7.1 --in-file /tmp/thread-status.json
```

Reporte cada thread resolvida com: arquivo, linha e trecho do comentário original.

---

## Passo 6 — Tratar problemas bloqueantes

Processe na ordem. **Pare na primeira que não conseguir resolver sozinho.**

### 6a. CI / políticas falhando

**GitHub:**
```bash
gh run list --branch <headRefName> --limit 5
gh run view <run-id> --log-failed
```

**Azure DevOps:**
```bash
# Identifique a política/build reprovada (Passo 2) e a run da branch de merge:
az pipelines runs list --org "$ORG_URL" --project "$PROJECT" \
  --branch "refs/pull/<id>/merge" --top 5 \
  --query "[].{id:id, result:result, status:status, pipeline:definition.name}"
az pipelines runs show --org "$ORG_URL" --project "$PROJECT" --id <runId>
# Logs da etapa que falhou (via timeline da build):
az devops invoke --org "$ORG_URL" --area build --resource timeline --http-method GET \
  --route-parameters project="$PROJECT" buildId=<runId> --api-version 7.1 \
  --query "records[?result=='failed'].{task:name, log:log.url}"
```

Se o erro for pequeno e de escopo claro (lint, type error, import faltando): aplique o fix mínimo, commite e **push na branch de feature** (nunca em `main`). Se for lógica de negócio ou mudança grande: **reporte ao usuário e pare**.

### 6b. Conflito de merge

**GitHub:** `mergeStateStatus == DIRTY` · **Azure DevOps:** `mergeStatus == conflicts`.

```bash
git fetch origin <baseRefName>
git merge origin/<baseRefName>
```

Auto-resolva **apenas** quando a intenção das duas partes for idêntica (ex.: ambas adicionaram a mesma linha). Ambiguidade semântica → **pare e descreva o conflito** ao usuário.

### 6c. Threads em `requer_acao`

Para cada thread aberta pelo revisor e não respondida:
- mudança pequena e inequívoca → **apresente o diff proposto e peça confirmação** antes de editar;
- ambígua → redija uma resposta explicando o raciocínio e **pergunte** se deve postar.

---

## Passo 7 — Quality gate

| Critério | GitHub | Azure DevOps |
|---|---|---|
| Sem conflito | `mergeable == MERGEABLE` | `mergeStatus == succeeded` |
| CI verde | checks `pass`/`success` | `policy list` todas `approved` |
| Aprovado | `reviewDecision == APPROVED` | reviewers obrigatórios `vote == 10` |
| Zero threads abertas | nenhuma `isResolved == false` | nenhuma `status` em `active`/`pending` |

**Tudo verde:** reporte "PR merge-ready ✓" com resumo do que foi feito e encerre. **O merge/conclusão do PR é ação humana** — não conclua o PR sozinho.

**Ainda há pendências:** liste claramente o que falta e sugira monitoramento contínuo:
```
/loop 3m /babysit <number-ou-id>
```

---

## Salvaguardas

- Nunca usar `--force` em push.
- Nunca usar `--no-verify` em commits.
- Push **somente na branch de feature**, nunca em `main` (e nunca concluir/aprovar o PR — isso é do humano).
- Nunca resolver thread cujo último comentário seja do revisor sem resposta do autor.
- Nunca editar arquivos de lógica de negócio sem confirmação explícita do usuário.
- Se a auth do provedor falhar: pedir `! gh auth login` (github) ou `! az login` (azure) e encerrar.

---

## Exemplos de uso

```bash
/babysit                    # PR da branch atual
/babysit 42                 # PR específico por número/id
/loop 3m /babysit 42        # monitoramento contínuo a cada 3 minutos
```
