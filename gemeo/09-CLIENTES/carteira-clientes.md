# Carteira de Clientes — todas as contas pagantes + free

> **Template** — preenchido via /montar-gemeo. Deriva do canon: `clientes[].{id,nome,segmento,plano,mrr,cliente_desde,health,obs}` · `planos[].{id,preco,target}` · `snapshot.{clientes_pagantes,clientes_free}` · `crescimento.conversao_free_para_pago_pct`.
> **Citação parseável**: todo número preenchido usa o marcador `R$ X [canon: path.do.campo]` ou `N [calc: metrica]` — o CI compara com o canon e acusa drift (specs/001-melhorias-gemeo/contracts/formatos-arquivos.md).

**Data:** AAAA-MM · **Fonte:** `clientes[]` do canon.

---

## 1. Contas pagantes ([N])

> Uma linha por entrada de `clientes[]`. Health usa os 3 estados de `health-e-churn.md`.

| ID | Nome | Segmento | Plano | MRR | Cliente desde | Health | Observação |
|----|------|----------|-------|----:|---------------|--------|------------|
| [id] | [nome] | [segmento] | [plano] | R$ [X] | AAAA-MM | Bom/Atenção/Risco | `clientes[].obs` |
| [id] | [nome] | [segmento] | [plano] | R$ [X] | AAAA-MM | Bom/Atenção/Risco | — |

---

## 2. Subtotais por plano e conferência do MRR

> O total tem que **fechar com `snapshot.mrr`**. Some os `clientes[].mrr`; se não bater,
> o erro está no canon — corrija lá.

| Plano | Contas | MRR unitário | MRR total |
|-------|-------:|-------------:|----------:|
| [plano] (`planos[].id`) | [N] | R$ [X] | **R$ [X]** |
| [plano] | [N] | R$ [X] | **R$ [X]** |
| **Total** | **[N]** | — | **R$ [X]** |

> Conferência: somar as linhas = R$ [X] ✓ (= `snapshot.mrr`).

---

## 3. Contas Free ([N]) — topo de funil

[PREENCHER: quantas contas no plano free (`snapshot.clientes_free`), perfil predominante
(segmentos), e por que são o reservatório de conversão.]

Com conversão free-para-pago de `crescimento.conversao_free_para_pago_pct` = [X]%, o canon
projeta ~`concentracao.free_convertiveis_estimados` = [N] contas com perfil de conversão
imediata.

[PREENCHER: estratégias de nurturing — onboarding, conteúdo, oferta de upgrade.]

---

## 4. Leitura da carteira

- **Por plano:** [PREENCHER: onde está o MRR — concentrado no topo (poucas contas grandes)
  ou pulverizado (muitas contas pequenas)? Implicação.]
- **Por segmento:** [PREENCHER: a base é mono-segmento ou diversificada? O que isso diz
  sobre dependência de mercado.]

> A leitura de **risco de concentração** dessa base está em [`analise-concentracao.md`](./analise-concentracao.md).
