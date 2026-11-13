---
name: atualizar-analytics
description: Atualiza as métricas de crescimento/tráfego do Gêmeo Digital a partir do Google Analytics 4 (MCP `ga4`). Use quando o usuário pedir para atualizar analytics, tráfego, sessões, conversões ou o funil de aquisição do oráculo.
---

# atualizar-analytics — GA4 → crescimento/funil

Atualiza o corpus do gêmeo (`gemeo/`) com dados reais do **Google Analytics 4** (MCP `ga4`).

## Pré-requisito
MCP `ga4` conectado (cheque com `claude mcp list`). Se não estiver, **avise qual credencial falta e pare** — não invente números.

## Passos
1. Consulte o MCP `ga4` (período: mês corrente + últimos 28 dias):
   - sessões, usuários ativos, novos usuários;
   - eventos de signup (cadastros free) e de upgrade (free→pago), se configurados;
   - canais/origem de aquisição.
2. Mapeie para `gemeo/00-CANON/canon.yaml`:
   | GA4 | Campo do canon |
   |-----|----------------|
   | novos signups free / mês | `crescimento.novos_free_mes` |
   | upgrades free→pago / mês | `crescimento.novos_clientes_pagantes_mes` (cruze com Stripe/Supabase) |
   | taxa de conversão free→pago | `crescimento.conversao_free_para_pago_pct` |
3. **Atualize o canon primeiro**; depois reflita em `gemeo/01-DASHBOARD/metrics-tracker.md`.
4. Em cada valor alterado, anote a origem: `# via GA4 MCP em <AAAA-MM-DD>`.

## Regras
- **Não invente.** Se o GA4 não traz o dado (ex.: conversão não rastreada), deixe o campo como está e registre a lacuna na resposta.
- O canon é a fonte da verdade — números mudam só lá; os `.md` derivam.
- **Não** confunda métricas de uso do produto (vêm do banco → `atualizar-produto`) com tráfego do site (GA4).
