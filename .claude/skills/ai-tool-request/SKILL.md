---
name: ai-tool-request
description: Guia o preenchimento interativo do Formulário de Solicitação de Uso de IA (Anexo III da Política Corporativa de IA PH3A), classifica o risco automaticamente e gera o formulário em markdown pronto para submissão à Governança de IA. Use quando um colaborador precisar solicitar aprovação para usar uma ferramenta ou caso de uso de IA novo.
allowed-tools: Write, Read
---

# Skill: Solicitação de Uso de IA — Formulário Anexo III

Referência: **Política Corporativa de Uso de IA PH3A v2.0 — Seções 8.1, 9.3 e Anexo III**

## Principio

Este skill conduz o usuário pelas perguntas do formulário de forma conversacional, classifica o risco automaticamente com base nas respostas e gera o documento `.md` completo pronto para encaminhar à Governança de IA (DPO + TI).

---

## Fluxo de Execução

### Passo 1 — Apresentação

Apresente o objetivo ao usuário:

> "Vou te guiar pelo preenchimento do Formulário de Solicitação de Uso de IA (Anexo III da Política Corporativa). Ao final, vou classificar o risco e gerar o formulário pronto para submissão.
> Responda cada pergunta — pode ser de forma resumida, vou organizar o documento."

### Passo 2 — Coleta de Dados (perguntas em sequência)

Faça as perguntas abaixo **uma por vez**, aguardando resposta antes de prosseguir:

**Identificação:**
1. Qual é o seu nome e área/produto?
2. Quem é o seu gestor direto responsável?
3. Qual é a data de hoje?

**Bloco 1 — Identificação do Uso:**
4. Qual ferramenta ou modelo de IA será utilizado? (ex: Claude Code, ChatGPT, API OpenAI, etc.)
5. Descreva o caso de uso: o que a IA vai fazer, com que frequência e em qual contexto?
6. Este uso é novo ou é expansão de algo já existente?

**Bloco 2 — Dados Envolvidos:**
7. Quais tipos de dados serão enviados à IA? (marque todos: nenhum dado sensível / dados internos / dados pessoais de colaboradores / dados pessoais de clientes / dados do Big Data PH3A / código-fonte interno / outros)
8. Os dados serão anonimizados ou pseudonimizados antes de enviar para a IA? Se sim, qual método?

**Bloco 3 — Ferramenta e Fornecedor:**
9. A ferramenta possui plano enterprise com DPA ativo? Se sim, qual o número do contrato/vigência?
10. O fornecedor garante contratualmente que não usará os dados para treinar seus modelos?
11. Onde os dados são processados/armazenados pelo fornecedor (país/região)?

**Bloco 4 — Impacto e Risco:**
12. Este uso impacta diretamente clientes PH3A?
13. Há alguma decisão automatizada sem revisão humana? Se sim, quais controles existem?

### Passo 3 — Classificação Automática de Risco

Com base nas respostas, aplique a lógica abaixo:

```
RISCO ALTO (qualquer condição abaixo):
  - Dados do Big Data PH3A (CPFs, CNPJs, dados financeiros)
  - Dados pessoais de clientes SEM anonimização E SEM DPA
  - Decisão automatizada sem revisão humana
  - Ferramenta sem DPA e com dados pessoais
  - Código-fonte de sistemas críticos em ferramenta sem garantia contratual
  → Requer aprovação formal via PROC02 + avaliação SI + DPO

RISCO MÉDIO (qualquer condição abaixo, sem atingir alto):
  - Dados pessoais de colaboradores ou clientes COM anonimização ou COM DPA
  - Dados internos (processos, documentos não públicos)
  - Impacto indireto em clientes
  → Requer ciência do gestor + registro do formulário

RISCO BAIXO (todas as condições abaixo):
  - Nenhum dado sensível, pessoal ou proprietário
  - Sem impacto direto em clientes
  - Ferramenta enterprise aprovada ou sem dados internos
  → Uso permitido dentro das regras da política, formulário opcional mas recomendado
```

Informe ao usuário a classificação e a justificativa antes de gerar o documento.

### Passo 4 — Gerar o Formulário

Salve o formulário em arquivo usando **Write**:

**Nome do arquivo:** `solicitacao-ia-[area]-[YYYY-MM-DD].md`
**Local:** diretório atual ou `~/solicitacoes-ia/` se existir

Consulte o template em [formulario-template.md](formulario-template.md) para o formato exato.

### Passo 5 — Orientar Próximos Passos

Com base na classificação, oriente:

**Risco Baixo:**
> "Uso permitido. Guarde este formulário como evidência de conformidade. Não é necessário aprovação prévia, mas informe seu gestor."

**Risco Médio:**
> "Encaminhe este formulário para seu gestor direto para ciência formal. Após confirmação do gestor, o uso pode ser iniciado com os controles documentados."

**Risco Alto:**
> "Este uso requer aprovação formal. Encaminhe o formulário para: TI/Segurança da Informação + DPO. O processo segue o fluxo PROC02 (Gestão de Mudanças). O uso NÃO deve ser iniciado antes da aprovação."

---

## Regras Importantes

- Se o usuário mencionar Big Data PH3A ou dados de clientes SEM DPA: alertar imediatamente que o uso está **proibido** pela política e não gerar formulário de aprovação — gerar orientação de bloqueio
- Se a ferramenta não estiver no Anexo I (ferramentas aprovadas): classificar como risco médio mínimo independente dos dados
- Sempre incluir no formulário a data, versão da política referenciada (v2.0) e o campo de aprovações em branco para assinatura

## Ferramentas Aprovadas (Anexo I da Política)

Para referência na análise:
- Claude Code (Anthropic) — enterprise
- Codex CLI (OpenAI) — enterprise
- ChatGPT (OpenAI) — enterprise
- Gemini (Google) — enterprise
- Lovable — enterprise

Ferramentas fora desta lista = risco elevado automaticamente.
