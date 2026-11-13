# Analytics — Playbook

> Como coletar, relatar e recomendar. Deriva de `gemeo/06-MARKETING/redes/` e do canon e **nunca os
> contradiz**. Se um número divergir, o canon prevalece.

## Objetivo da área

Transformar a leitura dos canais em poucas decisões, cada uma ancorada em dado com fonte e data.

---

## 1. Coleta

| Dado | Fonte | Como |
|---|---|---|
| Seguidores, alcance, engajamento por rede | insights da rede / `meta-ads` | leitura; registrar data da coleta |
| Sessões vindas de social, conversão | GA4 (`google-analytics`, `atualizar-analytics`) | leitura por canal de origem |
| Busca orgânica | `search-console`, `atualizar-ranking` | cliques, impressões, posição |
| Concorrentes | perfis públicos (WebFetch) | rubrica de `concorrentes.md` |

Regras da coleta:

- Uma linha por semana e rede em `crescimento-semanal.md`, **append-only**, com `Fonte` e `Coletado em`.
- Foto atual → proposta para `marca.redes[]` do canon via `/atualizar-analytics`, nunca editada à mão.
- MCP indisponível → a semana fica como lacuna, e a lacuna entra no relatório.

---

## 2. Relatório (mensal)

Estrutura de `modelo-relatorio.md`. Em todo relatório:

1. **Resumo em 3 linhas**: o que mudou, contra a meta (`metas.social` do canon) e contra o mês anterior.
2. **Aquisição primeiro**, vaidade depois: sessões, leads e oportunidades com origem social antes de
   seguidores.
3. **Formato e horário** que renderam, com o tamanho da amostra (3 posts não fazem padrão).
4. **Lacunas**: semanas sem coleta, redes sem acesso, meta não definida.
5. **Recomendações** (2 a 4): dado → hipótese → ação → área que executa.

Toda variação e taxa sai de script com a saída à vista (doutrina, recusas 1 e 2).

---

## 3. Benchmark de concorrentes

- Só concorrente listado em `concorrentes.md`, pela rubrica de lá (cadência, formato, engajamento visível).
- Dado público tem data de coleta; perfil fechado ou métrica não visível é lacuna.
- Benchmark informa, não dita: "o concorrente posta 2× mais" não é recomendação sem hipótese de efeito.

---

## 4. Fechar o loop

| Recomendação sobre | Vira tarefa de |
|---|---|
| cadência, formato, horário, hashtag, CTA orgânico | `#area/social` |
| pauta e ganchos | `#area/ideias` |
| mídia paga, campanha, SEO | `#area/marketing` |
| conversão no site | `#area/desenvolvimento` |

A tarefa herda o pedido do relatório (achado no caminho de trabalho autorizado). Relatório que ninguém
pediu, no heartbeat, só com regra em `_FRAMEWORK/regras-proativas.md`.

---

## Ferramentas (skills) e quando usar cada uma

| Skill | Quando usar |
|-------|-------------|
| `google-analytics`, `atualizar-analytics` | GA4: tráfego social → site |
| `meta-ads` | Insights orgânicos e pagos (somente leitura) |
| `search-console`, `atualizar-ranking` | SEO |
| `oraculo` | Simular efeito de meta; a conta é do script |

---

## O que NÃO fazer

- Alterar campanha, orçamento ou público (é `marketing`, com aprovação humana).
- Preencher semana sem coleta por interpolação.
- Gravar número em prosa sem `[canon: ...]` ou sem fonte e data.
- Recomendar a partir de vaidade sem dizer que é vaidade.
