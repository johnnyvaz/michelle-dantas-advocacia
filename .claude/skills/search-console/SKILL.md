---
name: search-console
description: Consulta o Google Search Console via API — keywords, cliques orgânicos, impressões, CTR, posição média, páginas mais visitadas do Google Search.
triggers:
  - search console
  - keywords
  - palavras-chave
  - cliques orgânicos
  - impressões
  - posição média
  - CTR
  - indexação
  - ranqueamento
  - SEO dados
  - desempenho busca
env_required:
  - GOOGLE_SERVICE_ACCOUNT_JSON
notes: Mesmo service account do GA4. Adicionar email da SA como "Owner" no Search Console.
---

# Skill: Google Search Console

Consulta dados de desempenho orgânico via Search Console API.

## Setup (uma vez)

1. Usar o mesmo service account do GA4 (ou criar novo)
2. Search Console → Configurações → Usuários e permissões → Adicionar usuário
3. Email da service account → permissão "Proprietário"
4. Sites suportados: `https://cursos.johnnyvaz.com.br/` e `https://johnnyvaz.com.br/`

## Capacidades

- Top queries por cliques/impressões (últimos 28 dias, janela padrão do SC)
- Páginas com maior/menor CTR
- Posição média por keyword
- Performance mobile vs desktop
- Breakdown por país
