---
name: prompt-audit
description: Analisa um prompt que o usuario pretende enviar para uma ferramenta de IA e verifica se contem dados proibidos pela Politica Corporativa de IA PH3A (dados pessoais, credenciais, codigo sensivel, dados do Big Data). Nao precisa acessar sistemas externos — analisa apenas o texto fornecido. Use antes de enviar qualquer prompt com duvida sobre o conteudo.
allowed-tools: Read
gates: [sem-exfiltracao]
---

# Skill: Auditoria de Prompt — Verificacao Pre-Envio

Referência: **Política Corporativa de Uso de IA PH3A v2.0 — Seções 6.1 e 6.2**

## Principio de Seguranca

> **Este skill analisa o TEXT do prompt ANTES do envio para a IA.**
> Nenhum dado e enviado a sistemas externos — a analise e feita localmente pelo Claude Code.
> O objetivo e ser a "ultima barreira" antes de um vazamento acidental.

---

## Instrucoes de Execucao

### Passo 1 — Receber o Prompt

O usuario pode fornecer o prompt de duas formas:
- **Texto colado** diretamente no chat
- **Caminho de arquivo** contendo o prompt (use Read para ler)

Se o usuario nao fornecer o prompt, peça:
> "Cole o prompt que deseja verificar, ou informe o caminho do arquivo."

### Passo 2 — Analise de Conteudo Proibido

Verifique o prompt contra todas as categorias abaixo:

#### Categoria 1 — Dados Pessoais (LGPD / Seção 6.1)

Busque padrões de:

| Tipo | Padrão a detectar | Severidade |
|---|---|---|
| CPF | `\d{3}[\.\-]?\d{3}[\.\-]?\d{3}[\.\-]?\d{2}` | CRITICO |
| CNPJ | `\d{2}[\.\-]?\d{3}[\.\-]?\d{3}[\/]?\d{4}[\.\-]?\d{2}` | CRITICO |
| Email | `[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}` | ALTO |
| Telefone | `\(?\d{2}\)?\s?[\d\s\-]{8,10}\d` | ALTO |
| CEP | `\d{5}[\-]?\d{3}` | MEDIO |
| RG | `\d{2}[\.\-]?\d{3}[\.\-]?\d{3}[\.\-]?[0-9X]` | ALTO |
| Data nascimento com nome | Combinacao de data + nome proximo | ALTO |
| Numero cartao | `(?:\d{4}[\s\-]?){3}\d{4}` | CRITICO |

#### Categoria 2 — Credenciais e Segredos (Seção 6.1 — Proibição Absoluta)

Busque padrões de:

| Tipo | Indicadores | Severidade |
|---|---|---|
| Senha hardcoded | `password\s*[=:]\s*["'][^"']+["']`, `senha\s*[=:]\s*\S+` | CRITICO |
| API Key / Token | `api[_\-]?key\s*[=:]\s*["']?\S+`, `Bearer\s+[A-Za-z0-9\-._~+\/]+=*` | CRITICO |
| Secret | `secret\s*[=:]\s*["']?\S+` | CRITICO |
| Chave AWS | `AKIA[0-9A-Z]{16}`, `AWS_SECRET` | CRITICO |
| Chave privada | `BEGIN (RSA|EC|OPENSSH) PRIVATE KEY` | CRITICO |
| Connection string | `(jdbc|mongodb|postgresql|mysql):\/\/.*:.*@` | CRITICO |
| .env content | Linhas no formato `VARIAVEL=valor` em bloco | ALTO |

#### Categoria 3 — Codigo Sensivel (Seção 6.3)

Identifique se o prompt contem codigo que:

| Indicador | Severidade |
|---|---|
| Acessa tabelas com CPF, CNPJ, dados financeiros diretamente | CRITICO |
| Contem SELECT/INSERT/UPDATE em tabelas com nomes suspeitos (`clientes`, `pessoas`, `cadastro`, `bigdata`, `cpf`) | ALTO |
| Contém strings de conexão a bancos de producao | CRITICO |
| Contem IPs internos (192.168.x.x, 10.x.x.x, 172.16-31.x.x) de producao | ALTO |
| Contem nomes de servidores internos PH3A | ALTO |
| Contem logica de negocio proprietaria descrita de forma detalhada | MEDIO |

#### Categoria 4 — Dados do Big Data PH3A (Seção 6.1 — Proibição Absoluta)

Indícios de que o prompt contém dados da base proprietária:

| Indicador | Severidade |
|---|---|
| Multiplos CPFs em sequencia (lista, CSV, array) | CRITICO |
| Multiplos CNPJs em sequencia | CRITICO |
| Mencao explicita a "Big Data", "base PH3A", "DataBusca", "DataTag" + dados | CRITICO |
| Estrutura de dados com campos tipicos de cadastro de pessoas em massa | ALTO |

#### Categoria 5 — Dados de Clientes Identificaveis (Seção 6.2)

| Indicador | Severidade |
|---|---|
| Combinacao nome + empresa + email (identificacao de cliente) | ALTO |
| Contrato, proposta ou documento com nome de cliente real | ALTO |
| Historico de atendimento com dados do cliente | ALTO |
| Screenshot ou transcricao de conversa com cliente identificado | ALTO |

### Passo 3 — Verificacao de Contexto

Alem dos padroes acima, avalie o contexto geral:

- O prompt descreve um cenario de negocio com detalhes que permitem identificar pessoas ou empresas reais?
- O prompt menciona volumes de dados sugestivos de exportacao de base (ex: "os primeiros 1000 registros")?
- O prompt pede para a IA processar, classificar ou transformar o que parece ser dados reais?

### Passo 4 — Gerar Veredicto

Produza o resultado no formato:

```markdown
## Resultado da Auditoria de Prompt

**Data:** [data]
**Veredicto:** APROVADO / APROVADO COM RESSALVAS / REPROVADO

---

### Resumo

| Categoria | Ocorrencias | Severidade Maxima |
|---|---|---|
| Dados Pessoais | X | CRITICO/ALTO/MEDIO/OK |
| Credenciais/Segredos | X | CRITICO/ALTO/MEDIO/OK |
| Codigo Sensivel | X | CRITICO/ALTO/MEDIO/OK |
| Big Data PH3A | X | CRITICO/ALTO/MEDIO/OK |
| Dados de Clientes | X | CRITICO/ALTO/MEDIO/OK |

---

### Achados

#### [CRITICO] [Tipo de dado encontrado]
**Trecho:** `[trecho anonimizado do prompt — substituir o dado por *** mas manter contexto]`
**Problema:** [explicacao]
**Regra violada:** Política de IA PH3A v2.0, Seção [X]
**Acao:** [o que fazer]

---

### Como corrigir

[Instrucoes especificas para remover ou substituir cada dado encontrado]

Sugestoes:
- Substituir dados reais por ficticios equivalentes
- Usar o skill /anonymize-data para gerar versao anonimizada
- Descrever a estrutura sem incluir os dados
- Usar dados sinteticos (skill /synthetic-data-generator)
```

### Veredictos

| Veredicto | Condicao | Acao recomendada |
|---|---|---|
| **APROVADO** | Nenhum achado | Prompt pode ser enviado |
| **APROVADO COM RESSALVAS** | Apenas achados MEDIO | Revisar os pontos indicados, mas e possivel enviar com cuidado |
| **REPROVADO** | Qualquer achado CRITICO ou ALTO | Nao enviar — corrigir primeiro |

---

## Casos Especiais

### Prompt de Desenvolvimento
Se o prompt e claramente de desenvolvimento (ex: "como fazer X em Python"), verifique apenas se ha dados reais embutidos no exemplo de codigo. Codigo sem dados reais = APROVADO.

### Prompt com Dados de Exemplo
Se o usuario afirmar que os dados sao ficticios, verificar se os CPFs/CNPJs sao validos algoritmicamente. CPF/CNPJ com digito verificador valido = suspeito de ser real, alertar.

### Duvida sobre dado ser real ou ficticio
Em caso de duvida, classificar como ALTO e recomendar substituicao por dado comprovadamente ficticio.

---

## Notas

1. Este skill nao substitui julgamento humano — e um apoio, nao um guardian automatico
2. Textos em linguagem natural podem conter dados pessoais sem padroes regex (ex: "o cliente da Rua X numero Y") — alertar sobre limitacao
3. Se o prompt for muito longo (>500 linhas), sugerir dividir em partes para analise
4. Registrar uso deste skill e evidencia de due diligence conforme NORM04
