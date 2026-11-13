---
name: atualizar-ranking
description: Atualiza as métricas de SEO/ranqueamento do Gêmeo Digital a partir do Google Search Console (MCP `search-console`). Use quando o usuário pedir para atualizar ranking, SEO, posição no Google, clicks/impressões orgânicas ou tráfego de busca.
---

# atualizar-ranking — Search Console → SEO/aquisição

Atualiza o corpus (`gemeo/`) com dados reais do **Google Search Console** (MCP `search-console`).

## Pré-requisito
MCP `search-console` conectado. Se não, **avise e pare** — não invente posições/queries.

## Passos
1. Consulte o MCP `search-console` (últimos 28 dias):
   - clicks, impressões, CTR, **posição média**;
   - top 5–10 queries e top 5–10 páginas.
2. Atualize (ou crie) `gemeo/06-MARKETING/seo-metricas.md` com esses números + a data. Estrutura:
   total clicks/impressões, CTR, posição média, tabela de top queries e top páginas.
3. SEO é canal de **aquisição orgânica**: se houver leads atribuíveis, use como contexto para
   `crescimento.novos_free_mes` no canon — mas **não duplique** o que o GA4 já contabiliza (cruze).
4. Anote a origem: `via Search Console MCP em <AAAA-MM-DD>`.

## Regras
- O GSC dá **tráfego/ranking**, não MRR nem carteira — **não** toque em financeiro/clientes.
- Não invente queries nem posições; use só o que o MCP retornar.
