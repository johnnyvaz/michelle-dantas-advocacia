---
name: atualizar-produto
description: Atualiza o status de produto/engenharia e os números reais de clientes/uso do Gêmeo Digital a partir do GitHub (MCP `github`) e do Supabase (MCP `supabase`). Use quando o usuário pedir para atualizar o STATUS do produto, testes/CI, ou os números reais de clientes e uso.
---

# atualizar-produto — GitHub + Supabase → STATUS + dados reais

## Pré-requisito
MCPs `github` e/ou `supabase` conectados. Use os disponíveis; **avise** os que faltarem.

## GitHub (engenharia)
1. Consulte o MCP `github` nos repos listados em `canon.produto.repos` (se vazio, pergunte
   quais são e **registre no canon**): último status de CI, PRs abertos/mesclados, frequência de deploy.
2. Atualize `gemeo/07-PRODUTO/STATUS.md`: resultado de testes/build, implementado vs. stub, e a data.

## Supabase (fonte da verdade do produto — read-only)
3. **Mapeamento tabelas→canon** (fixado na 1ª execução): se a tabela abaixo estiver vazia,
   inspecione o schema do banco, proponha o mapeamento ao usuário e **edite esta skill**
   para registrá-lo — execuções futuras não devem redescobrir.

   | Consulta no Supabase | Campo do canon |
   |----------------------|----------------|
   | _(preencher na 1ª execução)_ — ex.: count de orgs/tenants pagantes | `snapshot.clientes_pagantes` |
   | _(preencher)_ — orgs free | `snapshot.clientes_free` |
   | _(preencher)_ — métricas de uso (ex.: buscas/mês, SKUs indexados, lojas ativas) | `snapshot.uso_produto.*` |
   | _(preencher)_ — carteira (cliente, plano, mrr) | `clientes[]` |

4. Recalcule derivados (`clientes_total`, `concentracao.*`) e atualize `gemeo/09-CLIENTES/carteira.md`.
5. Anote origem+data (`via Supabase/GitHub MCP em <AAAA-MM-DD>`).

## Regras
- Supabase é a fonte da verdade de **uso e carteira**; MRR/financeiro detalhado vem do Stripe (`atualizar-financeiro`).
- **Conte de fato** — não estime. Operação **read-only**: nunca escreva no banco.
