---
name: atualizar-jira
description: Atualiza progresso de OKRs, operações e roadmap do Gêmeo Digital a partir do Jira/Atlassian (MCP `atlassian`). Use quando o usuário pedir para atualizar OKRs, sprints, tarefas, roadmap ou status de projetos.
---

# atualizar-jira — Atlassian → OKRs / operações / roadmap

Atualiza o corpus (`gemeo/`) com dados reais do **Jira** (MCP `atlassian`, oficial Rovo).

## Pré-requisito
MCP `atlassian` conectado (OAuth no 1º uso). Se não, **avise e pare**.

## Passos
1. Consulte o MCP `atlassian`:
   - épicos/iniciativas em andamento e % de conclusão;
   - status do sprint atual (issues por status: a fazer / fazendo / feito);
   - entregas com due date no horizonte.
2. Mapeie:
   - **Progresso de KRs** → `gemeo/02-ESTRATEGIA/OKRs/` (atualize a coluna "atual" de cada KR).
   - **Roadmap/entregas de produto** → `gemeo/07-PRODUTO` (status de features vs. roadmap).
   - **Operações** (workflows/tarefas) → `gemeo/03-OPERACOES`.
3. Se um KR tem métrica numérica que também vive no canon (`canon.metas.*`),
   atualize o **canon** e cite a fonte.
4. Anote a origem: `via Jira (Atlassian MCP) em <AAAA-MM-DD>`.

## Regras
- Jira dá **status/progresso**, não números financeiros nem de carteira.
- Use o status real das issues — **não** estime progresso que o Jira não mostra.
