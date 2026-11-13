---
name: montar-gemeo
description: Monta o Gêmeo Digital de um negócio novo - entrevista guiada + busca automática de dados (repos, MCPs, site, docs) até o corpus ficar completo. Use quando o usuário pedir para "montar o gêmeo", "preencher o canon", "configurar o oráculo", ou logo após clonar o gemeo-framework num negócio.
gates: [canon-ancorado, sem-exfiltracao]
---

# montar-gemeo — onboarding guiado do Gêmeo Digital

Leva `gemeo/` de skeleton a corpus completo (nível Cod2D ou além, medido por
`gemeo/COMPLETUDE.md`), **sem inventar nada**: cada dado entra com fonte declarada
(usuário, MCP, repo, site, documento).

## Princípios

1. **Perguntas-alvo dirigem tudo.** As perguntas em `00-CANON/perguntas-oraculo.md`
   definem quais campos do canon PRECISAM ficar não-nulos. Sem pergunta que o use,
   um campo é opcional.
2. **Buscar antes de perguntar.** Ordem de fontes: corpus já preenchido → repos de
   código locais/GitHub → MCPs conectados → site público do negócio → documentos que
   o usuário indicar → **só então** perguntar ao usuário.
3. **Canon primeiro, prosa depois.** Nenhum documento de pasta 01–16 é preenchido
   antes do número correspondente existir no canon.
4. **Sessões incrementais.** Cada sessão começa pelo diagnóstico (Fase 0) e termina
   atualizando `COMPLETUDE.md` — dá para parar e retomar a qualquer momento.
5. **Estimativa ≠ fato.** O que o usuário estimar entra marcado
   (`# estimativa do founder em <data>`); o que vier de premissa vai para `premissas.*`.

## Fase 0 — Diagnóstico (sempre, em toda sessão)

1. Leia `gemeo/00-CANON/canon.yaml` e `gemeo/COMPLETUDE.md`.
2. Conte: campos não-nulos do canon, arquivos de prosa preenchidos vs. template.
3. Reporte o nível atual (☆ → ★★★) e proponha o próximo bloco de trabalho (não tente
   tudo de uma vez — blocos de 20–40 min).

## Fase 1 — Identidade e perguntas-alvo (entrevista curta)

1. Preencha `empresa.*` (razão social, estágio, one_liner…) perguntando ao usuário.
2. Construa com o usuário as **5–10 perguntas** de `perguntas-oraculo.md` — cada uma
   nas categorias: investimento, pricing, crescimento/runway, pessoas/decisão.
3. Para cada pergunta, liste os campos do canon que ela exige → essa é a lista de
   pendências priorizada das fases seguintes.
4. Comece o `gemeo/GLOSSARIO.md`: codinomes de repositório ↔ nome público, siglas e termos
   com sentido próprio aqui. É barato e evita que todo agente seguinte erre nome.

## Fase 1b — Marca (entrevista em rodadas)

Preenche `gemeo/14-MARCA/`. O roteiro é o do `impeccable teach`, trazido para o gêmeo:
**modo entrevista, não modo confirmação**. Não transforme uma frase do usuário num
documento inteiro inferido para ele só aprovar.

1. **Antes de perguntar, varra:** `14-MARCA/` já preenchido, `PRODUCT.md`/`DESIGN.md` na raiz
   (se existirem, `python3 scripts/exportar_marca.py --importar` e pule o que já veio), o site
   e o README. Forme a **hipótese de registro** (brand × product) pelas rotas: `/`, `/sobre`,
   `/precos`, `/blog` → brand; `/app`, `/dashboard`, `/admin` → product.
2. **Rodadas de 2 ou 3 perguntas**, esperando a resposta entre elas, usando a ferramenta de
   pergunta estruturada quando houver. Use o que inferiu como **opção**, não como fato:
   - **Rodada 1:** registro de cada superfície (`superficies.md`), quem usa e em que contexto,
     e o resultado que a marca quer provocar.
   - **Rodada 2:** personalidade em 3 palavras, referências **reais** com o que copiar de cada uma,
     e **anti-referências** (`plataforma-de-marca.md`, `referencias-e-anti-referencias.md`).
   - **Rodada 3:** Para/Contra/Com, léxico dizemos/evitamos, tom por persona (`voz-e-tom.md`).
   - **Rodada 4:** acessibilidade (nível WCAG, necessidades do público) e arquitetura de marca
     (marca-mãe, produtos, codinomes que não podem vazar).
3. **Não pergunte cor, fonte nem raio aqui.** Visual sai do scan da Fase 2 e é confirmado depois.
4. Nenhum arquivo de `14-MARCA/` é escrito antes de pelo menos uma rodada respondida. Resposta
   incerta fica `[PREENCHER]`.

## Fase 2 — Busca automática (o que dá para descobrir sozinho)

| Fonte | O que extrair | Destino |
|-------|---------------|---------|
| Repos de código (locais ou MCP `github`) | módulos implementados vs. stub, testes, CI | `produto.*` + `07-PRODUTO/STATUS.md` |
| MCP `supabase` (ou banco indicado) | contagens reais de clientes/uso | delegue à skill `atualizar-produto` |
| MCP `stripe` | MRR, assinaturas, churn | delegue à skill `atualizar-financeiro` |
| MCP `ga4` / `search-console` | tráfego, conversão, SEO | delegue às skills `atualizar-analytics` / `atualizar-ranking` |
| MCP `atlassian` | OKRs, sprints, roadmap | delegue à skill `atualizar-jira` |
| Site público do negócio (WebFetch) | planos/preços publicados, posicionamento, ICP aparente | `planos[]`, `06-MARKETING/posicionamento.md` (como rascunho a validar) |
| Código do front (tokens CSS, `tailwind.config`, `theme`, fontes importadas) | paleta, tipografia, raios, espaçamento | frontmatter de `14-MARCA/identidade-visual.md` (rascunho; descrição qualitativa confirmada com o usuário) |
| `public/`, `assets/`, `static/`, favicon | logos, ícones, selos | `14-MARCA/ativos.md` (licença de fonte e validade de selo perguntadas, nunca supostas) |
| Perfis sociais públicos (WebFetch) | redes ativas, handles, seguidores visíveis | `marca.redes[]` com `data_ref` e `fonte`; operação em `06-MARKETING/redes/` |
| Schemas, migrations e jobs de carga (e `07-PRODUTO/mapa/`) | bases existentes, origem de cada uma, frequência dos jobs | `15-DADOS/catalogo-de-bases.md` e `linhagem.md` (rascunho); volume e última carga em `dados.bases[]` só com consulta real datada |
| Ferramenta de suporte (Chatwoot, Zendesk, helpdesk) | canais, volume de tickets, tempo de resposta, motivos | `atendimento.*` com `data_ref`; `09-CLIENTES/atendimento-e-suporte.md` |
| Políticas e normas internas, relatórios do quality gate, `/sca-guard`, pentest | índice de normas, controles verificados por máquina | `16-CONFORMIDADE/escopo-e-normas.md` e `controles.md` (estado observado, evidência apontada) |
| Documentos indicados (planilhas, contratos, pitch) | números históricos, cap table | seção correspondente, com origem anotada |

Liste o que **não** foi possível obter — vira pauta da Fase 3.

## Fase 3 — Entrevista numérica (o que nenhuma fonte automática dá)

Pergunte em blocos curtos, gravando a resposta direto no canon com origem:
1. **Financeiro interno**: `financeiro.caixa_atual`, `custos.*` (folha, infra, marketing…).
2. **Time**: `time[]` (nome, cargo, custo, quem é decisor).
3. **Societário**: `cap_table.atual[]`, conversíveis, ESOP — ou remover a seção
   (registrando em `_meta.secoes_removidas`) se não se aplica.
4. **Mercado e premissas**: TAM/SAM/SOM com critério declarado, `ancora_de_valor`,
   `gatilho_demanda`, `elasticidade_preco` (estimativas marcadas como premissa).
5. **Metas**: `metas.m6_meses` / `m12_meses` e, se houver redes ativas, `metas.social`.
6. **Contexto operacional** (o que nenhuma ferramenta revela; pergunte ao dono de cada tema):
   - **Dados:** quais bases são diferencial, de que fonte vêm, com que contrato e base legal
     (`15-DADOS/fontes-e-licencas.md`). Fonte sem contrato ou base legal conhecida é registrada
     como **lacuna de risco**, não suposta.
   - **Atendimento:** níveis, escalonamento e SLA, e se o SLA é contratual ou meta interna.
   - **Conformidade:** escopo do SGSI, certificações e validade, últimas auditorias e não
     conformidades abertas (`16-CONFORMIDADE/`). NC crítica só com evidência (doutrina, recusa 8).
   - **Ecossistema:** parceiros, JV, canais e o impacto se cada um sair
     (`02-ESTRATEGIA/ecossistema-e-parcerias.md`); ferramentas em uso e quem administra
     (`11-CONTAS-A-PAGAR/stack-corporativo.md`).

## Fase 4 — Camada de adesão (o diferencial do gêmeo)

Para cada `time[].decisor: true`:
1. Aplique o intake de `08-PESSOAS/Team/perfil-TEMPLATE.md` — 10–15 perguntas ao
   usuário sobre a pessoa (estilo de decisão, apetite a risco, gatilhos de
   resistência, o que a convence).
2. Gere `08-PESSOAS/Team/perfil-<slug>.md` marcado como **ilustrativo** (perfil
   definitivo exige entrevista/transcrição da própria pessoa).
3. Consolide `08-PESSOAS/Team/matriz-decisao-adesao.md`: por tipo de decisão,
   posição esperada 🟢🟡🔴 de cada decisor.

## Fase 5 — Derivar a prosa

1. Recalcule **todos os derivados** do canon com a conta visível (arr, ticket_medio,
   burn_liquido, runway, concentracao, lifetime, ltv…). Verifique consistência:
   `custos.folha` = Σ `time[].custo`; `snapshot.mrr` = Σ `clientes[].mrr`;
   `burn_bruto` = Σ `custos.*`.
2. Preencha os templates das pastas 01–16 **a partir do canon** (cada arquivo já
   indica os campos que cita). Priorize na ordem das perguntas-alvo.
3. Carimbe `_meta.data_referencia` e a origem de cada bloco.
4. Com `14-MARCA/` preenchida, ofereça `python3 scripts/exportar_marca.py` para gerar
   `PRODUCT.md`/`DESIGN.md` na raiz (o que a skill `/impeccable` lê). Não sobrescreve sem `--force`.

## Fase 6 — Validação final

1. Teste 2–3 perguntas de `perguntas-oraculo.md` com a skill `oraculo` — a resposta
   deve sair com número, conta e fonte, **sem** "não tenho esse dado".
2. Atualize `gemeo/COMPLETUDE.md` (checkboxes + data) e reporte: nível atingido,
   o que falta para o próximo nível, e qual bloco atacar na próxima sessão.

## Regras

- **Nunca** preencher um número sem fonte — nem "para ficar bonito". Placeholder null
  é informação ("não sabemos ainda"); número chutado é mentira que contamina simulações.
- Dados sensíveis (caixa, salários, cap table) ficam no repo do negócio — confirme com
  o usuário se o repo é privado antes de gravá-los.
- Se o negócio não tem uma dimensão (ex.: não capta, não tem free tier), **remova** a
  seção/arquivo e registre — corpus enxuto e verdadeiro vale mais que completo e oco.
