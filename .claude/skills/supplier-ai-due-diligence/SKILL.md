---
name: supplier-ai-due-diligence
description: Conduz due diligence de fornecedores que usam IA em seus servicos ou que sao contratados como ferramentas de IA. Verifica requisitos de DPA, clausula de nao-treinamento, data residency, retencao de dados e conformidade com NORM08 e Politica Corporativa de IA PH3A. Gera parecer estruturado para aprovacao contratual.
allowed-tools: Write, Read, WebSearch
---

# Skill: Due Diligence de Fornecedor de IA

Referência: **Política Corporativa de Uso de IA PH3A v2.0 — Seções 8.2 e 8.3 | NORM08 — Segurança de Terceiros**

## Dois Tipos de Avaliacao

Este skill cobre dois cenarios distintos da política:

**Tipo 1 — Contratacao de Ferramenta de IA**
A PH3A vai contratar uma ferramenta de IA (ex: nova API de LLM, plataforma de automacao com IA).
→ Verificar requisitos da Seção 8.2

**Tipo 2 — Fornecedor que Usa IA em seu Servico**
A PH3A vai contratar um fornecedor (ex: auditoria, consultoria, software) e esse fornecedor usa IA internamente em como presta o servico.
→ Verificar requisitos da Seção 8.3

---

## Instrucoes de Execucao

### Passo 1 — Identificar o Tipo e Contexto

Pergunte:
1. Qual e o nome do fornecedor/ferramenta sendo avaliado?
2. Este e um contrato de ferramenta de IA (Tipo 1) ou um fornecedor de servico que usa IA (Tipo 2)?
3. Qual e o servico/produto sendo contratado?
4. Dados da PH3A ou de clientes PH3A serao processados por este fornecedor? Quais tipos?
5. Voce ja tem acesso a documentacao do fornecedor (politica de privacidade, DPA, termos de uso)? Se sim, informe o caminho ou URL.

Se URLs forem fornecidas, use **WebSearch** para acessar politicas publicas de privacidade e termos de uso.

### Passo 2 — Checklist de Due Diligence

#### Para Tipo 1 — Ferramenta de IA (Seção 8.2)

Investigue e registre o status de cada item:

**DPA e Contrato:**
- [ ] Existe DPA (Data Processing Agreement) disponivel para assinatura?
- [ ] O DPA cobre o tipo de dados que a PH3A vai processar?
- [ ] Ha clausula explicita de **nao uso dos dados para treinamento** do modelo?
- [ ] Qual e o prazo de vigencia do DPA?

**Data Residency e Soberania:**
- [ ] Em qual pais/regiao os dados sao processados?
- [ ] Em qual pais/regiao os dados sao armazenados (logs, cache, fine-tuning)?
- [ ] Ha opcao de escolher regiao (ex: dados no Brasil ou na UE)?
- [ ] O fornecedor esta sujeito a leis de acesso governamental que podem afetar os dados? (ex: Cloud Act nos EUA)

**Retencao e Exclusao:**
- [ ] Qual o periodo de retencao dos prompts e respostas pelo fornecedor?
- [ ] E possivel desabilitar o armazenamento de prompts (zero data retention)?
- [ ] Qual o prazo de resposta para solicitacoes de exclusao de dados?
- [ ] Ha evidencia de exclusao efetiva (certificado, confirmacao)?

**Seguranca:**
- [ ] O fornecedor tem certificacoes de seguranca? (ISO 27001, SOC 2, etc.)
- [ ] Ha relatorio de auditoria disponivel (SOC 2 Type II ou equivalente)?
- [ ] Como o fornecedor lida com incidentes de seguranca? Qual o SLA de notificacao?
- [ ] Existe programa de bug bounty ou responsible disclosure?

**Plano Enterprise vs Gratuito:**
- [ ] O uso sera em plano enterprise com todas as garantias contratuais?
- [ ] O plano gratuito/trial tem restricoes adicionais de dados?
- [ ] Quais as diferencas de privacidade entre plano pago e gratuito?

#### Para Tipo 2 — Fornecedor que Usa IA (Seção 8.3)

**Declaracao Formal:**
- [ ] O fornecedor declarou formalmente quais ferramentas/modelos de IA utiliza na prestacao do servico?
- [ ] O fornecedor informou se dados da PH3A ou de clientes PH3A serao processados pela IA?
- [ ] O fornecedor informou em quais condicoes esses dados sao processados?

**Subcontratacao de IA:**
- [ ] O fornecedor usa APIs de IA de terceiros (OpenAI, Anthropic, Google, etc.)?
- [ ] Ha clausula no contrato vedando que o fornecedor repasse dados da PH3A a terceiros sem autorizacao?
- [ ] O fornecedor tem DPA com seus proprios fornecedores de IA?

**Controles sobre o Uso de IA pelo Fornecedor:**
- [ ] O fornecedor tem politica interna de uso de IA documentada?
- [ ] Quais controles o fornecedor aplica para evitar que colaboradores usem IA de forma inadequada com dados da PH3A?
- [ ] E possivel incluir clausula contratual restringindo o uso de IA com dados da PH3A?

### Passo 3 — Pesquisa Complementar

Se URLs ou nome do fornecedor foram fornecidos, use **WebSearch** para:
- Verificar historico de incidentes publicos de seguranca/privacidade
- Localizar politica de privacidade e termos de uso publicos
- Verificar se o fornecedor tem DPA disponivel publicamente (ex: fornecedores maiores publicam DPAs padrao)
- Verificar certificacoes de seguranca publicas

### Passo 4 — Classificar o Risco do Fornecedor

```
RISCO ALTO (qualquer item abaixo):
  - Sem DPA disponivel ou sem clausula de nao-treinamento
  - Dados processados em jurisdicao com leis de acesso governamental incompativeis
  - Sem certificacao de seguranca ou historico de incidentes relevante
  - Fornecedor nao declara uso de IA quando perguntado (Tipo 2)
  → Nao aprovar sem tratativas adicionais; escalar para DPO + TI

RISCO MEDIO:
  - DPA disponivel mas sem zero data retention ou com retencao longa (>30 dias)
  - Certificacoes de seguranca existem mas sao basicas
  - Data residency fora do Brasil mas em pais com legislacao adequada (UE, etc.)
  - Fornecedor Tipo 2 declara uso de IA mas sem controles formais
  → Aprovar com condicoes contratuais adicionais documentadas

RISCO BAIXO:
  - DPA robusto com clausula de nao-treinamento e zero data retention disponivel
  - ISO 27001 / SOC 2 Type II vigente
  - Data residency no Brasil ou UE (GDPR)
  - Plano enterprise com garantias contratuais claras
  → Aprovar seguindo processo normal NORM08
```

### Passo 5 — Gerar o Parecer

Salve usando **Write**:

**Nome:** `due-diligence-ia-[fornecedor]-[YYYY-MM-DD].md`
**Local:** diretorio atual ou `docs/fornecedores/` se existir

Use o template em [checklist.md](checklist.md) para o formato exato do documento.

### Passo 6 — Orientar Proximos Passos

Com base na classificacao:

**Risco Alto:**
> "Nao recomendado para aprovacao nas condicoes atuais. Antes de prosseguir: (1) solicitar DPA ao fornecedor, (2) negociar clausulas de retencao e nao-treinamento, (3) submeter para aprovacao conjunta DPO + TI conforme NORM08."

**Risco Medio:**
> "Aprovacao condicionada. Incluir no contrato as clausulas adicionais identificadas. Encaminhar parecer para revisao do DPO."

**Risco Baixo:**
> "Fornecedor apto para aprovacao. Encaminhar parecer ao DPO para registro. Garantir que o contrato final inclua as clausulas de DPA identificadas."

---

## Referencias Normativas

| Norma | Relevancia |
|---|---|
| NORM08 PH3A v6 | Seguranca de Terceiros — requisitos para fornecedores |
| Política Corporativa de IA PH3A v2.0 Sec 8.2 | Requisitos contratuais para ferramentas de IA |
| Política Corporativa de IA PH3A v2.0 Sec 8.3 | Fornecedores que usam IA em seus servicos |
| LGPD Art. 26 | Uso de dados por agentes publicos e privados |
| LGPD Art. 46 | Responsabilidade do controlador sobre operadores |
| ISO 27001:2022 A.5.19-A.5.22 | Seguranca na cadeia de fornecimento |
| ISO 27701:2019 6.12 | Privacidade no relacionamento com fornecedores |
