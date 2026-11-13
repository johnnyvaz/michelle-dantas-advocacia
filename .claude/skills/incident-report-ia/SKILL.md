---
name: incident-report-ia
description: Guia o reporte estruturado de incidentes relacionados ao uso de IA na PH3A (envio acidental de dados sensiveis para IA, suspeita de vazamento via ferramenta de IA, uso nao autorizado, comportamento inesperado de sistemas de IA). Gera o relatorio no formato da NORM09 com campos especificos para incidentes de IA. Use imediatamente apos identificar ou suspeitar de um incidente.
allowed-tools: Write, Read
---

# Skill: Reporte de Incidente de IA

Referência: **Política Corporativa de Uso de IA PH3A v2.0 — Seção 11.3 | NORM09 — Gerenciamento de Incidentes**

## AVISO IMPORTANTE

> Se o incidente envolver vazamento confirmado de dados pessoais, notifique imediatamente o DPO e a area de Seguranca da Informacao — NAO espere gerar o relatorio para fazer o contato inicial.
>
> Prazos legais: LGPD Art. 48 exige comunicacao a ANPD e aos titulares em prazo razoavel. NORM31 define o fluxo interno.

---

## Instrucoes de Execucao

### Passo 1 — Triagem Inicial

Antes de qualquer coisa, pergunte:

> "O incidente esta em andamento agora ou ja foi contido?"

**Se em andamento:**
> "Antes de preencher o relatorio: (1) Pare de usar a ferramenta de IA envolvida imediatamente. (2) Nao delete nada — preserve evidencias. (3) Avise verbalmente seu gestor direto agora. Depois voltamos para documentar."

**Se ja contido ou suspeita ainda sendo investigada:** prosseguir com a entrevista.

### Passo 2 — Classificar o Tipo de Incidente

Pergunte qual situacao melhor descreve o ocorrido (pode ser mais de uma):

| Tipo | Descricao |
|---|---|
| **A** | Envio acidental de dados sensiveis para ferramenta de IA nao autorizada |
| **B** | Envio de dados sensiveis para ferramenta autorizada, mas alem do permitido (ex: CPFs reais em prompt) |
| **C** | Suspeita de que dados enviados a IA foram retidos ou vazaram para terceiros |
| **D** | Uso de ferramenta de IA nao aprovada com dados internos ou de clientes |
| **E** | Comportamento inesperado de sistema de IA embarcado em produto PH3A |
| **F** | Saida de IA com informacao falsa ou prejudicial entregue a cliente sem revisao humana |
| **G** | Acesso nao autorizado a sistema de IA corporativo |
| **H** | Outro — descrever |

### Passo 3 — Coleta de Informacoes

Faca as perguntas em sequencia:

**Identificacao:**
1. Seu nome, area e cargo?
2. Data e hora em que o incidente ocorreu (ou foi percebido)?
3. Como voce identificou o incidente?

**Descricao do Incidente:**
4. Qual ferramenta de IA estava sendo utilizada?
5. Qual era o objetivo do uso da ferramenta no momento do incidente?
6. O que exatamente aconteceu? (descrever com o maximo de detalhe possivel)

**Dados Envolvidos:**
7. Que tipo de dados foram expostos ou potencialmente comprometidos?
   - [ ] Dados pessoais de clientes (CPF, nome, email, telefone, etc.)
   - [ ] Dados do Big Data PH3A
   - [ ] Credenciais, tokens ou chaves de API
   - [ ] Codigo-fonte de sistemas internos
   - [ ] Dados estrategicos ou confidenciais da empresa
   - [ ] Dados de colaboradores
   - [ ] Nao identificado ainda
8. Volume estimado de registros ou titulares potencialmente afetados?
9. Os dados foram apenas enviados ao modelo, ou ha evidencia de que foram armazenados/retidos?

**Contexto:**
10. O uso era para uma atividade de trabalho legitima?
11. O usuario sabia que aquele uso estava fora da politica?
12. Havia orientacao previa (treinamento, aviso) sobre a restricao?

**Acoes ja tomadas:**
13. O que ja foi feito desde que o incidente foi identificado?
14. A ferramenta de IA foi contactada para solicitacao de exclusao dos dados? (se aplicavel)
15. Gestor direto ja foi informado?

### Passo 4 — Classificar a Severidade

Aplique a matriz:

```
CRITICO:
  - Dados pessoais em larga escala (>100 titulares) expostos a IA sem DPA
  - Credenciais de producao enviadas a IA externa
  - Big Data PH3A enviado a IA aberta/sem contrato
  - Sistema de IA de produto com comportamento que gerou dano a cliente
  → Acao: Notificar DPO + TI imediatamente; avaliar notificacao ANPD

ALTO:
  - Dados pessoais (<100 titulares) ou dados confidenciais enviados a IA sem DPA
  - Uso nao autorizado com dados de clientes em ferramenta sem contrato
  - Saida incorreta de IA entregue a cliente (sem dano confirmado)
  → Acao: Notificar DPO + TI em ate 4 horas

MEDIO:
  - Dados internos (nao pessoais) enviados a IA nao aprovada
  - Uso de ferramenta de IA pessoal em atividade corporativa sem dados sensiveis
  - Comportamento inesperado de IA sem impacto em dados ou clientes
  → Acao: Notificar gestor e SI em ate 24 horas

BAIXO:
  - Violacao de politica sem exposicao de dados (ex: uso de IA pessoal para texto generico)
  - Suspeita nao confirmada
  → Acao: Registrar e informar gestor
```

### Passo 5 — Gerar o Relatorio

Salve usando **Write**:

**Nome:** `incidente-ia-[YYYY-MM-DD]-[tipo]-[sequencial].md`
**Local:** diretorio atual, ou local indicado pelo usuario

Use o template em [template.md](template.md).

### Passo 6 — Orientar Proximos Passos

Com base na severidade, oriente:

**CRITICO:**
```
ACOES IMEDIATAS:
1. Contatar DPO agora: [dpo@ph3a.com.br]
2. Contatar TI/SI agora
3. Solicitar ao fornecedor de IA exclusao dos dados (via suporte enterprise)
4. Preservar todos os logs e evidencias
5. Nao comunicar publicamente antes de alinhamento com DPO
6. Avaliar obrigacao de notificacao a ANPD (LGPD Art. 48 + NORM31)
```

**ALTO:**
```
ACOES EM ATE 4 HORAS:
1. Encaminhar relatorio ao DPO e TI/SI
2. Solicitar exclusao dos dados ao fornecedor se aplicavel
3. Registrar no sistema de gestao de incidentes (NORM09)
```

**MEDIO/BAIXO:**
```
1. Encaminhar relatorio ao gestor direto
2. Registrar como nao conformidade para analise (NORM09)
3. Usar como insumo para treinamento de conscientizacao
```

---

## Casos Especiais

### Incidente em Sistema de IA Embarcado (DataCubo, DataDossie)
Alem do fluxo normal: registrar no log do produto, acionar time de produto responsavel, avaliar se e necessario desabilitar o componente de IA ate investigacao.

### Fornecedor de IA como Fonte do Incidente
Se o vazamento partiu do fornecedor (ex: breach na OpenAI, Google, Anthropic): seguir adicionalmente o fluxo da NORM08 (Seguranca de Terceiros) e NORM31 (Incidentes de Violacao de Dados Pessoais).

---

## Referencias Normativas

| Norma | Relevancia |
|---|---|
| NORM09 PH3A v8 | Procedimento de gerenciamento de incidentes |
| NORM31 PH3A v5 | Incidentes de violacao de dados pessoais |
| NORM16 PH3A v9 | Privacidade e reporte de incidentes de dados |
| LGPD Art. 48 | Comunicacao de incidente de segurança a ANPD |
| Política Corporativa de IA PH3A v2.0 Sec 11.3 | Tipos de incidente de IA e fluxo de reporte |
| ISO 27001:2022 A.5.24-A.5.28 | Gestao de incidentes de segurança |
