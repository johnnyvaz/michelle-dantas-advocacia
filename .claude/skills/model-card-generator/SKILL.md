---
name: model-card-generator
description: Gera o Model Card padronizado PH3A para modelos e componentes de IA embarcados em produtos (DataCubo, DataDossie e outros). Obrigatorio antes da implantacao em producao conforme Secao 9.4 da Politica Corporativa de IA. Conduz entrevista estruturada com o time de produto/desenvolvimento e salva o documento em markdown.
allowed-tools: Write, Read, Glob
---

# Skill: Gerador de Model Card — Produtos com IA Embarcada

Referência: **Política Corporativa de Uso de IA PH3A v2.0 — Seções 7, 9.4 e Anexo II**

## Quando usar

- Antes de implantar em produção qualquer componente de IA em produtos PH3A
- Ao atualizar a versão do modelo ou mudar o fornecedor da API
- Ao expandir os dados de entrada de um modelo existente
- Ao conduzir auditoria de IA (Seção 11.2)

---

## Instrucoes de Execucao

### Passo 1 — Identificar o Produto e Contexto

Se o usuario nao informar, pergunte:
1. Qual produto? (DataCubo, DataDossie, ou outro — informe o nome)
2. Qual componente/funcionalidade de IA especificamente?
3. Voce tem acesso a documentacao existente sobre este modelo? (ofereça para ler com Read se tiver caminho)

### Passo 2 — Coleta de Informacoes (entrevista estruturada)

Faca as perguntas em blocos, aguardando resposta antes do proximo bloco:

**Bloco A — Identificacao do Modelo:**
1. Qual o nome/versao do modelo ou API utilizado? (ex: gpt-4o, claude-3-5-sonnet, modelo interno XYZ v2)
2. Qual o fornecedor? (Anthropic, OpenAI, Google, modelo proprio, etc.)
3. O modelo e acessado via API de terceiro ou esta hospedado internamente?
4. Qual a data de inicio de uso em producao (prevista ou atual)?

**Bloco B — Finalidade e Funcionalidade:**
5. Qual e a finalidade principal deste componente de IA? (em 1-3 frases)
6. Quais tarefas especificas ele executa? (classificacao, geracao de texto, scoring, sumarizacao, etc.)
7. Qual e o output esperado e como ele e usado no produto?
8. Ha supervisao humana sobre as saidas antes de chegarem ao usuario final?

**Bloco C — Dados de Entrada:**
9. Que tipos de dados sao enviados ao modelo? (textos, estruturados, imagens, etc.)
10. Esses dados incluem dados pessoais (nomes, CPF, etc.)? Se sim, quais?
11. Os dados sao anonimizados ou pseudonimizados antes de enviar ao modelo?
12. De onde vem os dados de entrada? (dados do proprio cliente no produto, Big Data PH3A, dados publicos, etc.)

**Bloco D — Treinamento (se modelo proprio ou fine-tuning):**
13. O modelo foi treinado ou ajustado (fine-tuned) com dados proprios?
14. Se sim: quais dados foram usados no treinamento? Origem, volume, periodo?
15. Houve avaliacao de vies (bias) e fairness no dataset de treinamento?
16. Existe documentacao dos dados de treinamento (data card)?

**Bloco E — Performance e Limitacoes:**
17. Quais metricas de performance foram medidas? (acuracia, precisao, recall, F1, etc.) — valores se disponiveis
18. Quais sao as limitacoes conhecidas do modelo neste contexto?
19. Em quais cenarios o modelo performa pior ou pode errar?
20. Ha testes de regressao automatizados para monitorar degradacao?

**Bloco F — Riscos e Controles:**
21. Quais os principais riscos identificados para este uso? (vies, alucinacao, privacidade, etc.)
22. Quais controles tecticos existem para mitigar esses riscos?
23. Ha mecanismo de fallback se o modelo retornar resultado invalido ou inesperado?
24. Como incidentes relacionados a este componente sao reportados?

**Bloco G — Conformidade:**
25. Existe DPA ativo com o fornecedor do modelo?
26. O fornecedor garante que nao usa os dados para treinar seus modelos?
27. Onde os dados sao processados (pais/regiao)?
28. Foi conduzido RIPD para este produto? (obrigatorio se dados pessoais envolvidos)
29. Qual a base legal LGPD para o processamento de dados pessoais neste componente?

### Passo 3 — Gerar o Model Card

Salve o arquivo usando **Write**:

**Nome:** `model-card-[produto]-[componente]-v[versao]-[YYYY-MM-DD].md`
**Local:** diretorio atual, ou `docs/ia/` se existir no projeto

Use o template em [template.md](template.md) para o formato exato.

### Passo 4 — Identificar Gaps

Apos gerar o documento, liste os itens em aberto que precisam ser resolvidos antes da implantacao em producao:

```markdown
## Pendencias para Liberacao em Producao

| # | Item | Responsavel | Prazo |
|---|---|---|---|
| 1 | [item pendente] | [quem] | [quando] |
```

Itens **bloqueantes** (nao pode ir a producao sem):
- DPA ativo com fornecedor (se dados pessoais)
- RIPD aprovado pelo DPO (se dados pessoais)
- Metricas de performance documentadas
- Mecanismo de fallback definido

---

## Referencias Normativas

| Norma | Relevancia |
|---|---|
| Política Corporativa de IA PH3A v2.0, Sec 9.4 | Model Card obrigatorio antes de producao |
| Política Corporativa de IA PH3A v2.0, Sec 7 | Manutencao de Model Card para modelos com dados pessoais |
| Política Corporativa de IA PH3A v2.0, Anexo II | Exemplos DataCubo e DataDossie |
| LGPD Art. 20 | Direito a explicacao em decisoes automatizadas |
| ISO 27001:2022 A.8.25 | Ciclo de vida de desenvolvimento seguro |
| ISO 27701:2019 8.4.2 | Minimizacao no processamento por terceiros |
