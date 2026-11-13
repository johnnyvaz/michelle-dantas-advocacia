---
name: ripd-assistant
description: Guia a elaboracao do Relatorio de Impacto a Protecao de Dados (RIPD) para produtos e processos que envolvem IA com dados pessoais na PH3A. Conduz entrevista estruturada, identifica riscos, sugere controles e gera o documento base para revisao e aprovacao do DPO. Obrigatorio para DataCubo e condicional para DataDossie conforme Politica Corporativa de IA v2.0.
allowed-tools: Write, Read, Glob
---

# Skill: Assistente de RIPD — Relatório de Impacto à Proteção de Dados

Referência: **Política Corporativa de Uso de IA PH3A v2.0 — Seções 7 e 9.4 | LGPD Art. 38**

## Quando e obrigatorio

Conforme a Política Corporativa de IA PH3A:
- **DataCubo**: RIPD obrigatório (agente IA com acesso a dados reais do cliente)
- **DataDossie**: Avaliar necessidade com DPO (classificação de perfil de pessoas)
- **Qualquer modelo de IA** que processe dados pessoais de clientes ou colaboradores
- **Fine-tuning** com dados pessoais
- **Decisoes automatizadas** com impacto em pessoas (LGPD Art. 20)

---

## Instrucoes de Execucao

### Passo 1 — Identificar o Escopo

Pergunte ao usuario:
1. Qual produto, processo ou funcionalidade sera avaliado?
2. Voce tem documentacao existente sobre este produto? (ofereça Read se tiver caminho)
3. Existe um RIPD anterior para este produto que sera atualizado, ou e um novo?

Se for atualizacao, leia o RIPD anterior com Read e identifique as secoes que mudaram.

### Passo 2 — Entrevista Estruturada

Conduza em blocos:

**Bloco 1 — Descricao do Tratamento:**
1. Qual e a finalidade do tratamento de dados neste produto/processo?
2. Quais categorias de dados pessoais sao tratadas? (dados cadastrais, financeiros, comportamentais, sensiveis LGPD Art. 5 II, etc.)
3. Quais sao os titulares dos dados? (clientes PH3A, pessoas fisicas da base, colaboradores, etc.)
4. Qual e o volume estimado de titulares afetados?
5. Quem sao os operadores e suboperadores que processam esses dados? (fornecedores de API de IA, provedores de nuvem, etc.)
6. Os dados sao transferidos para fora do Brasil? Para onde?

**Bloco 2 — Necessidade e Proporcionalidade:**
7. Por que e necessario usar dados pessoais para esta finalidade? Nao seria possivel com dados anonimizados?
8. Quais dados poderiam ser eliminados ou substituidos sem prejudicar a funcionalidade?
9. Por quanto tempo os dados (e os logs de interacao com a IA) sao retidos?
10. Ha mecanismo para exclusao de dados a pedido do titular?

**Bloco 3 — Riscos Identificados:**

Para cada risco abaixo, pergunte se e aplicavel e qual a probabilidade (Alta/Media/Baixa) e impacto (Alto/Medio/Baixo):

- Acesso nao autorizado aos dados pessoais pelo modelo de IA ou pelo fornecedor
- Uso dos dados pelo fornecedor para treinar seus modelos (vazamento indireto)
- Alucinacao ou erro do modelo gerando informacao falsa sobre o titular
- Discriminacao ou decisao injusta baseada em output do modelo
- Vazamento de dados por prompt injection ou manipulacao do agente
- Reidentificacao de dados pseudonimizados via cross-referencia pelo modelo
- Retencao de dados alem do necessario nos logs do fornecedor
- Falta de explicabilidade em decisoes automatizadas (LGPD Art. 20)

**Bloco 4 — Medidas de Mitigacao:**
11. Quais controles tecnicos existem ou serao implementados para cada risco?
12. Ha DPA ativo com o fornecedor de IA? Com clausula de nao-treinamento?
13. Como o titular e informado sobre o uso de IA no tratamento dos seus dados?
14. Existe canal para o titular exercer seus direitos (acesso, correcao, exclusao, oposicao)?
15. O Model Card do componente de IA foi elaborado?

**Bloco 5 — Base Legal:**
16. Qual a base legal LGPD para o tratamento? (consentimento / execucao de contrato / legitimo interesse / obrigacao legal / etc.)
17. Se legitimo interesse: foi conduzida a LIA (Legitimate Interest Assessment)?
18. Se consentimento: como e coletado e como pode ser revogado?

### Passo 3 — Calcular Nivel de Risco Residual

Para cada risco identificado:

```
Nivel de Risco = Probabilidade × Impacto

Alta × Alto   = CRITICO  → controle obrigatorio antes de producao
Alta × Medio  = ALTO     → plano de acao com prazo definido
Media × Alto  = ALTO
Media × Medio = MEDIO    → monitorar e revisar anualmente
Baixa × Qualquer = BAIXO → documentar e monitorar
```

### Passo 4 — Gerar o RIPD

Salve usando **Write**:

**Nome:** `RIPD-[produto]-v[versao]-[YYYY-MM-DD].md`
**Local:** diretorio atual, ou `docs/privacidade/` se existir

Use o template em [template.md](template.md) para formato exato.

### Passo 5 — Orientar Proximos Passos

Sempre ao final:
- Identificar riscos CRITICOS que bloqueiam producao
- Listar pendencias para aprovacao do DPO
- Informar que o RIPD e documento vivo — deve ser revisado a cada mudanca significativa no tratamento

---

## Observacoes Importantes

1. **Este skill gera o documento base** — a aprovacao formal e responsabilidade do DPO
2. O RIPD gerado e um rascunho estruturado, nao um documento juridicamente finalizado
3. Para produtos novos com risco ALTO/CRITICO: nao implantar em producao sem aprovacao do DPO
4. O RIPD deve ser revisado sempre que: mudar o modelo de IA, mudar o fornecedor, ampliar o escopo de dados ou ocorrer incidente relevante

## Referencias Normativas

| Norma | Relevancia |
|---|---|
| LGPD Art. 38 | Obrigatoriedade do RIPD para operacoes de alto risco |
| LGPD Art. 20 | Direito a revisao de decisoes automatizadas |
| LGPD Art. 5, II | Definicao de dados sensiveis |
| ISO 27701:2019 7.2.5 | Avaliacao de impacto a privacidade |
| ISO 27001:2022 A.5.34 | Privacidade e protecao de dados pessoais |
| Política Corporativa de IA PH3A v2.0 Sec 7 | Obrigatoriedade de RIPD para IA com dados pessoais |
| Política Corporativa de IA PH3A v2.0 Sec 9.4 | RIPD como pre-requisito para producao |
