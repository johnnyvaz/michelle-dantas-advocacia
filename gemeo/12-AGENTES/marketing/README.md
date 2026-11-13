# Marketing — Área de Agentes

> Papel: **aquisição e demanda**. Transforma o cérebro do negócio (canon + contexto) em estratégia de canais, campanhas, anúncios, SEO e thumbnails que levam um desconhecido até o topo do funil de `{{EMPRESA}}`. Profundidade: **★★★ a fundo**.

## O que esta área faz

O agente de marketing reúne **estratégia (CMO) + execução paga (tráfego) + SEO**. A presença orgânica do dia a dia é das áreas `ideias` (pauta), `social` (calendário, pacote, comunidade) e `analytics` (relatório de redes); o marketing dá a direção e lê o resultado.

- **Direção do orgânico** — ritmo-alvo, ângulos por linha de produto, artigos de blog, newsletter e séries. Cadência regular antes de qualquer mídia paga; a operação por rede é da `social`.
- **Tráfego pago** — campanhas em LinkedIn Ads, Google Search Ads e Meta Ads; segmentação, criativos, UTM e otimização por CPL/ROAS. Só ativa **após validação orgânica e quando houver verba** (ver canon).
- **Lead quente** — recebe da `social` o contato com interesse real e garante a **passagem para vendas** (não fecha venda aqui).
- **SEO / ranqueamento** — acompanhar posição, cliques e impressões; pautar conteúdo pela intenção de busca.
- **Thumbnails e overlays** — peças visuais no padrão visual da marca para vídeo e lives (ver `.claude/rules/brand-visual-marketing.md`).

## Fronteira com outras áreas

| Esta área (marketing) | NÃO esta área |
|---|---|
| Distribuir, anunciar, ranquear, engajar, capturar lead | Escrever a **voz da marca** e a copy fina de página → área **copy** |
| Pautar e amplificar conteúdo | Produzir **aulas/cursos/podcast/livro** → área **conteudo-cursos** |
| Identificar lead quente e **repassar** | **Qualificar, propor, fechar** → área **vendas** |
| Identidade aplicada a peças de marketing | **UI / layout / identidade visual** de produto → área **design** |
| Estratégia de canais, campanha, mídia paga, SEO | **Pauta** recorrente → **ideias**; **operação orgânica por rede** (calendário, pacote, comunidade) → **social**; **relatório de redes** → **analytics**; **auditoria de marca** → **marca**; **kit de gravação** → **estudio** |

> Quando o projeto tem os agentes `ideias`, `social` e `analytics`, o marketing fica com a estratégia,
> a campanha e o pago; sem eles, absorve essas funções como antes.

> Regra prática: marketing **leva até a porta**; vendas converte. Marketing **pauta e amplifica**; copy escreve a voz.

## Skills-ferramenta da área

| Skill | Quando usar |
|-------|-------------|
| _(skill de artigo de blog do projeto)_ | Escrever artigo de blog no padrão da marca |
| _(skill de imagem de header do projeto)_ | Gerar a imagem de header (16:9) do artigo de blog |
| _(skill de thumbnail do projeto)_ | Thumbnail cinematográfica de vídeo/live |
| `meta-ads` | Consultar/operar campanhas Meta (Facebook/Instagram): métricas, ROAS, CPC, Pixel |
| `google-analytics` | Tráfego, sessões, conversões, fontes (GA4) |
| `search-console` | Keywords, cliques orgânicos, impressões, CTR, posição (Google Search) |
| `atualizar-ranking` | Atualizar as métricas de SEO/ranqueamento do gêmeo |
| `atualizar-analytics` | Atualizar as métricas de tráfego/aquisição do gêmeo |
| _(skill de overlay de gravação/live do projeto)_ | Overlays PNG transparentes para gravação/live |
| `demo-sales-meeting` | Roteiro de demonstração/pitch para reunião (apoio ao funil) |

## Pastas do cérebro que esta área lê

- **Canon (fonte da verdade):** `gemeo/00-CANON/canon.yaml` — `empresa`, `planos`, `crescimento`, `financeiro.custos.marketing`, `premissas.gatilho_demanda`, `metas`. Números do negócio saem **sempre** daqui.
- **Contexto de marketing:** `gemeo/06-MARKETING/` — `posicionamento.md`, `icp-persona.md`, `funil-e-processo-vendas.md`, `seo-metricas.md`.
- **Voz da marca (para alinhar tom):** `gemeo/12-AGENTES/copy/`; e as regras visuais `.claude/rules/brand-visual-marketing.md`.

## Artefatos da área

| Arquivo | Conteúdo |
|---|---|
| `README.md` | este — papel, ferramentas, fontes |
| `persona.md` | voz, identidade e postura do agente de marketing |
| `playbook.md` | conhecimento de domínio: formatos, cadência, hooks, tráfego pago, métricas |
| `heartbeat.md` | ciclo OODA autônomo (fila filtrada por `#area/marketing`) |
| `memoria.md` | memória persistente (padrão PARA) |

## Linhas de produto (escopo do negócio)

A marca pode ser **guarda-chuva** de mais de uma linha de produto. O marketing serve a todas — nenhuma delas é o escopo único. As linhas reais vêm do canon (`planos[]`, `premissas.gatilho_demanda`); abaixo, os **papéis genéricos** que costumam existir num funil:

- **Oferta principal** (`{{PRODUTO_PAGO}}`) — produto pago de tabela no canon (`planos[]`). É o que o funil quer vender.
- **Topo de funil / ativação** (`{{PRODUTO_FREE}}`) — gratuito, porta de entrada e isca de ativação (`planos[]`).
- **Lead magnet / gatilho de demanda** (`{{LEAD_MAGNET}}`) — usado como gatilho de demanda (`premissas.gatilho_demanda`); um caso de aplicação não é o negócio inteiro.

> A CRAFT do marketing (formatos, cadência, métricas) é transferível entre linhas. Ao escrever uma peça, identifique **qual linha** ela serve e ajuste o ângulo — não trave tudo em uma só.
