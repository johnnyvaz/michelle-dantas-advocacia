# PRD — problema, solução e escopo

> **Template** — preenchido via /montar-gemeo. Deriva do canon: `empresa.one_liner`, `planos[].{id,preco,limites,target}`, `metas.{m6_meses,m12_meses}`, `mercado.{tam_empresas,sam_empresas,som_ano1_empresas,ancora_de_valor}`, `premissas.gatilho_demanda.descricao`.
> **Citação parseável**: todo número preenchido usa o marcador `R$ X [canon: path.do.campo]` ou `N [calc: metrica]` — o CI compara com o canon e acusa drift (specs/001-melhorias-gemeo/contracts/formatos-arquivos.md).

> Documento de produto: o que ele faz, para quem e por quê agora. **Resuma; não
> duplique documentação do repo** — requisitos técnicos detalhados ficam no código.

## 1. Visão

> Espelha `empresa.one_liner`. Uma frase: o que faz, para quem, por que agora.

`[PREENCHER: o produto em uma frase]`

**Por que agora**: `[PREENCHER: o gatilho de mercado — espelha premissas.gatilho_demanda.descricao]`

## 2. Problema

| Dor | Impacto no negócio do cliente |
|-----|-------------------------------|
| `[PREENCHER: dor 1]` | `[PREENCHER: o que custa para o cliente hoje]` |
| `[PREENCHER: dor 2]` | `[PREENCHER: impacto]` |

## 3. Solução

`[PREENCHER: como o produto resolve as dores acima, em 3–5 bullets de alto nível]`

## 4. Personas / ICP

> Uma linha por segmento. O ICP principal é o foco comercial.

| Segmento | Perfil | Dor principal | Urgência |
|----------|--------|---------------|----------|
| `[PREENCHER: segmento]` | `[PREENCHER: porte/perfil]` | `[PREENCHER: dor]` | `[PREENCHER: alta/média/baixa]` |

**ICP principal**: `[PREENCHER: descrição do cliente ideal em 1–2 frases]`

## 5. Escopo por fase

| Fase | Entrega | Status |
|------|---------|--------|
| Fase 1 (MVP) | `[PREENCHER: fluxo principal fim a fim]` | `[PREENCHER]` |
| Fase 2 | `[PREENCHER: enriquecimento]` | `[PREENCHER]` |
| Fase 3+ | `[PREENCHER: escala]` | `[PREENCHER]` |

**Fora do escopo (MVP)**: `[PREENCHER: o que fica para depois, explicitamente]`

## 6. Planos e limites

> Espelha `planos[]`. `limites` usa as mesmas chaves de `snapshot.uso_produto.*`.

| Plano (`id`) | Limites | Preço/mês | Target |
|--------------|---------|-----------|--------|
| `[PREENCHER: id]` | `[PREENCHER: limites]` | R$ [X] | `[PREENCHER: target]` |
| `[PREENCHER: id]` | `[PREENCHER: limites]` | R$ [X] | `[PREENCHER: target]` |

## 7. Métricas de sucesso

> Espelham `metas.m6_meses` e `metas.m12_meses`.

| KPI | Meta 6 meses | Meta 12 meses |
|-----|-------------:|--------------:|
| `[PREENCHER: KPI de uso]` | `[N]` | `[N]` |
| MRR | R$ [X] | R$ [X] |

**Tamanho de mercado**: TAM `[N]` · SAM `[N]` · SOM ano 1 `[N]` empresas. Âncora de
valor: `[PREENCHER: custo/alternativa que o ICP já paga — mercado.ancora_de_valor]`.
