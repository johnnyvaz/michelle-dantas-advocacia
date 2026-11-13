---
name: review-code
description: Revisa codigo interno PH3A verificando conformidade com normas de seguranca (NORM11, PROC09), OWASP Top 10, LGPD, ISO 27001 e boas praticas de desenvolvimento seguro. Use quando o usuario pedir para revisar, auditar, analisar seguranca de codigo, verificar vulnerabilidades, ou validar conformidade de codigo fonte.
allowed-tools: Read, Grep, Glob, Bash, WebSearch, Write
---

# Skill: Revisao de Seguranca de Codigo Interno PH3A

Este skill revisa codigo fonte verificando conformidade com:
- **PH3A NORM11** - Norma de Seguranca para Desenvolvimento e Aquisicao de Software v6
- **PH3A PROC09** - Procedimento de Seguranca em Desenvolvimento de Software v6
- **PH3A PROC20** - Procedimento de Projeto e Desenvolvimento v2
- **PH3A NORM15** - Norma de Gestao de Vulnerabilidades e Ameacas v6
- **OWASP Top 10** - Web Application Security Risks
- **OWASP Top 10 for LLM** - Riscos especificos de aplicacoes com IA
- **ISO 27001:2022** - Controles A.8.25 a A.8.31 (Desenvolvimento Seguro)
- **LGPD** - Lei 13.709/2018, Art. 46 (Seguranca desde a concepcao)
- **CMN 4.893/2021** - Art. 3o e Art. 5o (Desenvolvimento seguro)

## Instrucoes

### 1. Receber o Codigo para Revisao

O usuario pode fornecer o codigo de diversas formas:

- **Caminho de arquivo**: Path para arquivo(s) no repositorio
- **Diretorio**: Path para diretorio com multiplos arquivos
- **Texto colado**: Codigo colado diretamente no chat
- **Pull Request**: Referencia a um PR para revisar diff

Se for caminho de arquivo ou diretorio, use **Read** e **Glob** para localizar e ler o conteudo.

Se for diretorio, use **Glob** para listar arquivos relevantes (ex: `**/*.py`, `**/*.js`, `**/*.cs`, `**/*.java`, `**/*.sql`).

### 2. Identificar Contexto do Codigo

Antes de iniciar a revisao, determine:

| Aspecto | O que identificar |
|---------|-------------------|
| Linguagem | Python, C#, Java, JavaScript/TypeScript, SQL, etc. |
| Tipo de sistema | Web app, API, batch, ETL, microservico, modelo ML |
| Dados processados | Dados publicos, internos, confidenciais, sensiveis/regulados |
| Integracao | Banco de dados, APIs externas, servicos internos |
| Framework | .NET, Django, Spring, Express, etc. |

### 3. Verificar OWASP Top 10 (PROC09 Secao 4)

Analise o codigo contra cada categoria OWASP:

#### 3.1 Injecao (A03:2021)

- [ ] SQL Injection: Uso de queries parametrizadas vs concatenacao
- [ ] Command Injection: Execucao de comandos do SO com input do usuario
- [ ] LDAP Injection: Queries LDAP com input nao sanitizado
- [ ] NoSQL Injection: Operacoes MongoDB/similares sem sanitizacao
- [ ] ORM Injection: Uso inseguro de ORMs

**O que buscar:**
```
# Padroes PERIGOSOS (exemplos):
query = "SELECT * FROM users WHERE id = " + user_input
os.system("ping " + host)
cursor.execute(f"DELETE FROM {table}")
db.collection.find({$where: user_input})
```

**Correcao esperada:**
```
# Padroes SEGUROS:
cursor.execute("SELECT * FROM users WHERE id = %s", (user_input,))
subprocess.run(["ping", host], shell=False)
```

#### 3.2 Quebra de Autenticacao (A07:2021)

- [ ] Credenciais hardcoded no codigo
- [ ] Tokens/senhas em texto claro
- [ ] Sessoes sem expiracao
- [ ] Ausencia de rate limiting em login
- [ ] Uso de algoritmos de hash fracos (MD5, SHA1 para senhas)
- [ ] Autenticacao via AD quando possivel (NORM11 Secao 3)

**O que buscar:**
```
password = "admin123"
API_KEY = "sk-xxxxxxxxxxxx"
token = request.headers.get("Authorization")  # sem validacao
hashlib.md5(password.encode())
```

#### 3.3 Cross-Site Scripting - XSS (A03:2021)

- [ ] Output encoding em respostas HTML
- [ ] Headers de seguranca (X-XSS-Protection, CSP, X-Frame-Options)
- [ ] Sanitizacao de inputs em formularios
- [ ] DOM-based XSS em JavaScript

**Headers obrigatorios (PROC09 Secao 4.3):**
- X-XSS-Protection
- HTTP Strict Transport Security (HSTS)
- X-Frame-Options
- X-Content-Type-Options
- Content-Security-Policy

#### 3.4 Referencia Insegura a Objetos (A01:2021)

- [ ] IDOR: Acesso direto a objetos sem verificacao de autorizacao
- [ ] Path Traversal: Acesso a arquivos fora do escopo
- [ ] Exposicao de IDs internos em URLs/APIs

#### 3.5 Configuracao Incorreta (A05:2021)

- [ ] Debug mode em producao
- [ ] Senhas default de frameworks/webservices
- [ ] Portas desnecessarias expostas
- [ ] Stack traces expostos ao usuario
- [ ] CORS permissivo (Access-Control-Allow-Origin: *)

#### 3.6 Exposicao de Dados Sensiveis (A02:2021)

- [ ] Dados pessoais (CPF, email, telefone) sem criptografia
- [ ] Dados sensiveis em logs
- [ ] Autocomplete habilitado em campos sensiveis (PROC09 Secao 4.6)
- [ ] Cache de paginas com dados sensiveis
- [ ] Dados sensiveis em URLs (query strings)
- [ ] Conexoes sem TLS/HTTPS

#### 3.7 CSRF (A01:2021)

- [ ] Tokens anti-CSRF em formularios
- [ ] Uso correto de POST vs GET (PROC09 Secao 4.7)
- [ ] SameSite attribute em cookies

#### 3.8 Componentes Vulneraveis (A06:2021)

- [ ] Dependencias com CVEs conhecidas
- [ ] Bibliotecas desatualizadas
- [ ] Pacotes sem manutencao
- [ ] Uso de versoes com vulnerabilidades conhecidas

### 4. Verificar Controles NORM11

Valide os requisitos minimos de seguranca para desenvolvimento:

| Controle NORM11 | O que verificar |
|-----------------|-----------------|
| Logging (Secao 3) | Sistema possui logs de inclusao, alteracao, consulta e exclusao |
| Autenticacao (Secao 3) | Mecanismos de validacao e identificacao de usuarios |
| Gerenciamento de sessao | Sessao valida apos login, consistente entre paginas |
| Usuario sistemico | Usuario exclusivo para interface com banco de dados |
| Segregacao de perfis | Usuarios comuns separados de administradores |
| Comunicacao entre sistemas | Via banco ou conexao segura (nao arquivos texto) |
| Criptografia em transito | Dados sensiveis criptografados na conexao |
| Gestao de acessos | Interface para gestao de permissoes (se nao via AD) |
| Trilha de auditoria | Interface para extracao de relatorios de auditoria |
| Validacao de entrada | Controles de integridade em entradas manuais |

### 5. Verificar Privacy by Design (LGPD Art. 46 / PROC09 Secao 6)

Se o codigo processa dados pessoais:

| Principio | Verificacao |
|-----------|-------------|
| Minimizacao | Coleta apenas dados necessarios? |
| Anonimizacao | Usa dados anonimizados quando possivel? |
| Consentimento | Implementa mecanismos de opt-in/opt-out? |
| Direitos do titular | Permite acesso, correcao, exclusao? |
| Retencao limitada | Implementa TTL para dados pessoais? |
| Log de acesso | Registra quem acessou dados pessoais? |
| Criptografia | Dados sensiveis criptografados em repouso e transito? |

### 6. Verificar Uso de IA no Codigo (NORM11 Secao 3.1 / PROC09)

Se o codigo envolve IA ou foi gerado por IA:

**Ferramentas de IA permitidas:**
| Ferramenta | Status | Condicoes |
|------------|--------|-----------|
| GitHub Copilot Business | Permitido | Telemetria desabilitada |
| ChatGPT Enterprise | Condicionado | Sem codigo sensivel |
| Claude Enterprise | Condicionado | Sem codigo sensivel |
| Copilot Individual | PROIBIDO | Dados de treinamento nao controlados |
| ChatGPT Free | PROIBIDO | Sem garantias de privacidade |

**Verificacoes para codigo com IA:**
- [ ] Codigo gerado por IA teve code review humano
- [ ] Nao contem logica de negocio proprietaria exposta
- [ ] Nao contem credenciais (mesmo comentadas)
- [ ] Nao contem queries com dados reais
- [ ] Nao contem estruturas de banco de producao
- [ ] Licencas de trechos sugeridos foram validadas
- [ ] Origem do codigo documentada (comentario)

**Verificacoes para sistemas com IA (PROC20):**
- [ ] RIPD realizado se dados pessoais envolvidos
- [ ] Dados de treinamento com origem documentada
- [ ] Modelo versionado (MLflow ou equivalente)
- [ ] Testes de vies/fairness executados
- [ ] Monitoramento de drift implementado
- [ ] Sanitizacao contra prompt injection

### 7. Verificar Quality Gates SonarQube (PROC09 Secao 5 / PROC20)

Verificar se o codigo atende aos quality gates:

| Metrica | Threshold | Bloqueante |
|---------|-----------|------------|
| Bugs criticos | 0 | Sim |
| Vulnerabilidades criticas | 0 | Sim |
| Code smells | Rating A | Nao |
| Cobertura de testes | > 60% | Nao |
| Duplicacao | < 3% | Nao |

**Regras de seguranca especificas:**
- SQL Injection
- XSS
- Hardcoded credentials
- Insecure deserialization
- Path traversal

### 8. Verificar Seguranca de Secrets

Buscar ativamente no codigo:

**Padroes de secrets (bloqueante - PROC09):**
```
# Regex para detectar:
password\s*=\s*["'][^"']+["']
api[_-]?key\s*=\s*["'][^"']+["']
secret\s*=\s*["'][^"']+["']
token\s*=\s*["'][^"']+["']
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
PRIVATE[_-]?KEY
BEGIN RSA PRIVATE KEY
jdbc:.*password=
connectionString.*Password=
Authorization:\s*Bearer\s+[A-Za-z0-9\-._~+/]+=*
```

**Padroes de dados sensiveis em codigo:**
```
# CPF (LGPD - dado pessoal)
\d{3}\.\d{3}\.\d{3}-\d{2}
# CNPJ
\d{2}\.\d{3}\.\d{3}/\d{4}-\d{2}
# Email hardcoded
[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}
# IP interno
192\.168\.\d+\.\d+
10\.\d+\.\d+\.\d+
```

### 9. Verificar Conformidade Regulatoria

**ISO 27001:2022 - Controles de Desenvolvimento:**
| Controle | Requisito | Verificacao |
|----------|-----------|-------------|
| A.8.25 | Ciclo de vida de desenvolvimento seguro | Processo SDLC documentado |
| A.8.26 | Requisitos de seguranca de aplicacoes | Requisitos definidos antes do dev |
| A.8.27 | Arquitetura de sistemas seguros | Principios de engenharia segura |
| A.8.28 | Codificacao segura | Praticas de secure coding |
| A.8.29 | Testes de seguranca | SAST/DAST executados |
| A.8.30 | Desenvolvimento terceirizado | Controles sobre terceiros |
| A.8.31 | Separacao de ambientes | Dev/Homolog/Prod separados |

**CMN 4.893/2021:**
| Artigo | Requisito | Verificacao |
|--------|-----------|-------------|
| Art. 3o, I | Autenticacao e criptografia | Implementados no codigo |
| Art. 3o, III | Prevencao de intrusao | Validacao de inputs |
| Art. 5o | Desenvolvimento seguro | Seguindo PROC09 |

**SLAs de Remediacao (NORM15):**
| Severidade (CVSS) | Prazo | Escalonamento |
|-------------------|-------|---------------|
| Critica (9.0-10.0) | 72 horas | Imediato ao Comite SI |
| Alta (7.0-8.9) | 7 dias | Gestor de TI |
| Media (4.0-6.9) | 30 dias | Relatorio mensal |
| Baixa (0.1-3.9) | 90 dias | Relatorio trimestral |

### 10. Gerar Arquivo de Relatorio

**OBRIGATORIO:** O relatorio deve ser salvo em arquivo usando a ferramenta **Write**.

**Convencao de nomes:**
- Arquivo unico: `review-[nome-do-arquivo]-[YYYY-MM-DD].md`
- Diretorio: `review-[nome-do-diretorio]-[YYYY-MM-DD].md`
- PR: `review-PR[numero]-[YYYY-MM-DD].md`

**Local de saida:** Mesmo diretorio do codigo revisado, ou um diretorio `reviews/` se existir.

**REGRA PRINCIPAL: Todos os achados devem ser listados em ordem decrescente de gravidade** (Critico > Alto > Medio > Baixo). Dentro da mesma severidade, ordenar por CVSS estimado (maior primeiro). Cada achado recebe um ID sequencial global unico.

Produza o relatorio no formato abaixo e salve com **Write**:

```markdown
# Relatorio de Revisao de Seguranca de Codigo

**Data da revisao:** [data atual]
**Revisor:** Claude Code
**Arquivo(s):** [caminhos dos arquivos revisados]
**Linguagem:** [linguagem identificada]
**Tipo de sistema:** [web/API/batch/ETL/ML]
**Classificacao de dados:** [Publico/Interno/Confidencial/Sensivel]

---

## Resumo Executivo

| Categoria | Critico | Alto | Medio | Baixo |
|-----------|---------|------|-------|-------|
| OWASP Top 10 | X | X | X | X |
| Norma NORM11 | X | X | X | X |
| Privacy by Design | X | X | X | X |
| Secrets/Credenciais | X | X | X | X |
| Codigo IA | X | X | X | X |
| **TOTAL** | **X** | **X** | **X** | **X** |

**Veredicto:** [APROVADO / APROVADO COM RESSALVAS / REPROVADO]

**Bloqueantes para deploy:** [Sim/Nao] - [lista se houver]

---

## Indice de Achados (Ordenado por Gravidade)

| # | ID | Severidade | CVSS Est. | Titulo | Arquivo:Linha | OWASP | Norma | SLA |
|---|-----|------------|-----------|--------|---------------|-------|-------|-----|
| 1 | CR-001 | CRITICA | 9.8 | SQL Injection em endpoint publico | src/api.py:42 | A03 | PROC09 4.1 | 72h |
| 2 | CR-002 | CRITICA | 9.5 | Credencial hardcoded | src/config.py:10 | A07 | NORM11 3 | 72h |
| 3 | AL-001 | ALTA | 8.2 | IDOR em API de usuarios | src/users.py:88 | A01 | NORM11 3 | 7d |
| 4 | MD-001 | MEDIA | 5.3 | Falta header CSP | src/app.py:15 | A05 | PROC09 4.3 | 30d |
| 5 | BX-001 | BAIXA | 2.1 | Autocomplete em campo sensivel | src/form.html:22 | A02 | PROC09 4.6 | 90d |

*(A tabela acima e um exemplo. Preencher com achados reais encontrados.)*

---

## Detalhamento dos Achados

### 1. Achados Criticos

### [CR-001] [Titulo do achado]

**Severidade:** CRITICA
**OWASP:** [Categoria OWASP se aplicavel]
**Norma:** [Norma PH3A violada]
**Arquivo:** [caminho:linha]
**SLA de correcao:** 72 horas (NORM15)

**Codigo vulneravel:**
```[linguagem]
[codigo com o problema]
```

**Problema:**
[Descricao do problema e impacto potencial]

**Correcao sugerida:**
```[linguagem]
[codigo corrigido]
```

**Fundamentacao:**
> "[Citacao da norma ou legislacao]"
> — **Fonte:** [Norma], [Secao/Artigo]

---

## 2. Achados Altos

### [AL-001] [Titulo do achado]

[Mesmo formato...]

---

## 3. Achados Medios

### [MD-001] [Titulo do achado]

[Mesmo formato...]

---

## 4. Achados Baixos

### [BX-001] [Titulo do achado]

[Mesmo formato...]

---

## 5. Verificacao de Conformidade

### OWASP Top 10

| # | Categoria | Status | Observacao |
|---|-----------|--------|------------|
| A01 | Broken Access Control | OK/NOK/N/A | [detalhe] |
| A02 | Cryptographic Failures | OK/NOK/N/A | [detalhe] |
| A03 | Injection | OK/NOK/N/A | [detalhe] |
| A04 | Insecure Design | OK/NOK/N/A | [detalhe] |
| A05 | Security Misconfiguration | OK/NOK/N/A | [detalhe] |
| A06 | Vulnerable Components | OK/NOK/N/A | [detalhe] |
| A07 | Auth Failures | OK/NOK/N/A | [detalhe] |
| A08 | Software/Data Integrity | OK/NOK/N/A | [detalhe] |
| A09 | Logging Failures | OK/NOK/N/A | [detalhe] |
| A10 | SSRF | OK/NOK/N/A | [detalhe] |

### NORM11 - Requisitos Minimos

| Requisito | Status | Observacao |
|-----------|--------|------------|
| Logging CRUD | OK/NOK/N/A | [detalhe] |
| Autenticacao | OK/NOK/N/A | [detalhe] |
| Gerenciamento sessao | OK/NOK/N/A | [detalhe] |
| Usuario sistemico BD | OK/NOK/N/A | [detalhe] |
| Segregacao perfis | OK/NOK/N/A | [detalhe] |
| Comunicacao segura | OK/NOK/N/A | [detalhe] |
| Criptografia transito | OK/NOK/N/A | [detalhe] |
| Validacao entrada | OK/NOK/N/A | [detalhe] |

### Privacy by Design (se aplicavel)

| Principio | Status | Observacao |
|-----------|--------|------------|
| Minimizacao dados | OK/NOK/N/A | [detalhe] |
| Anonimizacao | OK/NOK/N/A | [detalhe] |
| Consentimento | OK/NOK/N/A | [detalhe] |
| Direitos titular | OK/NOK/N/A | [detalhe] |
| Retencao limitada | OK/NOK/N/A | [detalhe] |
| Log de acesso | OK/NOK/N/A | [detalhe] |
| Criptografia | OK/NOK/N/A | [detalhe] |

### ISO 27001 - Controles de Desenvolvimento

| Controle | Status | Observacao |
|----------|--------|------------|
| A.8.25 SDLC seguro | OK/NOK/N/A | [detalhe] |
| A.8.26 Requisitos seguranca | OK/NOK/N/A | [detalhe] |
| A.8.27 Arquitetura segura | OK/NOK/N/A | [detalhe] |
| A.8.28 Codificacao segura | OK/NOK/N/A | [detalhe] |
| A.8.29 Testes seguranca | OK/NOK/N/A | [detalhe] |
| A.8.31 Separacao ambientes | OK/NOK/N/A | [detalhe] |

---

## 6. Nao Conformidades Normativas (Ordenadas por Gravidade)

| # | Norma Violada | Secao/Artigo | Descricao da Nao Conformidade | Severidade | Achado Ref. | Acao Corretiva |
|---|---------------|--------------|-------------------------------|------------|-------------|----------------|
| 1 | PROC09 | Secao 4.1 | Queries SQL sem parametrizacao | CRITICA | CR-001 | Implementar prepared statements |
| 2 | NORM11 | Secao 3 | Credenciais em texto claro no codigo | CRITICA | CR-002 | Mover para vault/env vars |
| 3 | LGPD | Art. 46 | Dados pessoais sem criptografia | ALTA | AL-001 | Implementar criptografia AES-256 |
| 4 | ISO 27001 | A.8.28 | Praticas de codificacao insegura | MEDIA | MD-001 | Adicionar headers de seguranca |

*(A tabela acima e um exemplo. Preencher com nao conformidades reais encontradas.)*

---

## 7. Recomendacoes Prioritarias

1. **[CRITICO]** [Acao corretiva urgente - SLA 72h]
2. **[ALTO]** [Segunda prioridade - SLA 7 dias]
3. **[MEDIO]** [Melhorias recomendadas - SLA 30 dias]

---

## 8. Proximos Passos

- [ ] Corrigir achados criticos (SLA 72h)
- [ ] Corrigir achados altos (SLA 7 dias)
- [ ] Executar SonarQube apos correcoes
- [ ] Solicitar re-review apos correcoes
- [ ] Documentar excecoes aceitas (se houver)
- [ ] Atualizar registro de vulnerabilidades

---

## Referencias

| # | Norma | Secao | Descricao |
|---|-------|-------|-----------|
| 1 | PH3A NORM11 v6 | Secao 3 | Requisitos minimos de seguranca |
| 2 | PH3A PROC09 v6 | Secao 4 | Riscos OWASP em desenvolvimento |
| 3 | PH3A NORM15 v6 | SLAs | Prazos de remediacao |
| 4 | ISO 27001:2022 | A.8.25-A.8.31 | Desenvolvimento seguro |
| 5 | LGPD | Art. 46 | Seguranca desde concepcao |
| 6 | CMN 4.893/2021 | Art. 3-5 | Seguranca cibernetica |
| 7 | OWASP Top 10 | 2021 | Riscos de seguranca web |
```

## Exemplos de Uso

### Exemplo 1: Revisar arquivo especifico
```
Usuario: Revise o codigo em /src/api/users.py
```

**Acoes do skill:**
1. Ler arquivo com Read
2. Identificar linguagem (Python) e contexto (API)
3. Verificar OWASP Top 10
4. Verificar conformidade NORM11
5. Buscar secrets/credenciais
6. Gerar relatorio completo

### Exemplo 2: Revisar diretorio
```
Usuario: Revise a seguranca do diretorio /src/services/
```

**Acoes do skill:**
1. Glob para listar arquivos relevantes
2. Ler cada arquivo
3. Analise consolidada
4. Relatorio com achados por arquivo

### Exemplo 3: Revisar codigo colado
```
Usuario: Revise este codigo:
def login(request):
    user = request.POST['username']
    pwd = request.POST['password']
    query = f"SELECT * FROM users WHERE user='{user}' AND pass='{pwd}'"
```

**Resposta esperada:** Identificar SQL Injection (CRITICO), falta de hash de senha, falta de CSRF token, etc.

### Exemplo 4: Revisar PR/diff
```
Usuario: Revise as mudancas no PR #42
```

**Acoes do skill:**
1. Usar Bash com `gh pr diff 42` para obter diff
2. Analisar apenas as mudancas
3. Focar em regressoes de seguranca
4. Relatorio focado no delta

### Exemplo 5: Revisar sistema com IA
```
Usuario: Revise o codigo do nosso chatbot em /src/ai/chatbot.py
```

**Acoes do skill:**
1. Ler arquivo
2. Verificar OWASP Top 10 + OWASP Top 10 for LLM
3. Verificar sanitizacao contra prompt injection
4. Validar protecao de modelo
5. Verificar se dados pessoais estao protegidos
6. Relatorio com secao especifica de IA

## Criterios de Severidade

| Severidade | Criterio | Exemplo | Bloqueante |
|------------|----------|---------|------------|
| **CRITICA** | Exploravel remotamente, sem autenticacao | SQL Injection em endpoint publico | Sim |
| **ALTA** | Exploravel com autenticacao ou acesso interno | IDOR em API autenticada | Sim |
| **MEDIA** | Requer condicoes especificas para explorar | XSS refletido com interacao do usuario | Nao |
| **BAIXA** | Informacional ou boas praticas | Falta de header X-Content-Type | Nao |

**Criterios de bloqueio de deploy (PROC09):**
- Vulnerabilidade critica nao tratada
- Credencial detectada no codigo
- Dependencia com CVE critica conhecida
- Falha em teste de prompt injection (se aplicavel)

## Geracao Obrigatoria de Arquivo

**IMPORTANTE:** Apos concluir a analise, o skill DEVE:

1. **Gerar o relatorio em arquivo markdown** usando a ferramenta **Write**
2. O arquivo deve conter TODOS os achados ordenados por gravidade (Critico > Alto > Medio > Baixo)
3. Informar ao usuario o caminho do arquivo gerado
4. Exibir no chat apenas o **Resumo Executivo** e o **Indice de Achados**

**Logica de nomeacao do arquivo:**
```
Se codigo revisado esta em: /projeto/src/api/users.py
Arquivo gerado em:          /projeto/src/api/review-users-2026-02-20.md

Se codigo revisado esta em: /projeto/src/services/
Arquivo gerado em:          /projeto/src/services/review-services-2026-02-20.md

Se revisando PR #42:
Arquivo gerado em:          ./review-PR42-2026-02-20.md
```

**Se o diretorio `reviews/` existir no projeto, usar esse diretorio como destino.**

## Notas Importantes

1. **Nunca execute codigo** - A revisao e estatica, apenas analise visual
2. **Nao altere o codigo** - Apenas sugira correcoes no relatorio
3. **Priorize achados** - Foque nos criticos e altos primeiro
4. **Contextualize** - Considere o tipo de sistema e dados processados
5. **Fundamente** - Cite a norma PH3A ou legislacao relevante para cada achado
6. **SonarQube** - Lembre que o codigo tambem sera analisado em https://sonarqube.ph3a.com.br
7. **Segregacao de ambientes** - Verifique se nao ha indicios de mix entre dev/homolog/prod
8. **Dados PH3A** - O contexto e de uma empresa de dados (215M CPFs, 25M CNPJs) - seguranca de dados pessoais e prioridade maxima
9. **Arquivo obrigatorio** - SEMPRE gerar o arquivo .md com o relatorio completo

## Schema unificado de finding + handoff (spec 005)

Além do relatório .md, **emita cada achado também no schema unificado de finding verificado** — o mesmo do `/pentest-dinamico` e do `sca-guard` — para que toda a plataforma de segurança fale um formato só e alimente o loop red→blue.

- Gabarito: o `finding-template.md` da skill `/pentest-dinamico`.
- Achados do review nascem `status: "hipotese"` e `origem: "review-code-ph3a"` (revisão estática não confirma exploração).
- **CVSS pelo script** (Regra de ouro): você escolhe o `cvss_vetor`; rode `python3 scripts/cvss.py --in <findings.json> --write` para preencher `cvss_score`/`cvss_severidade`. Nunca escreva o score à mão.
- Grave os findings em `gemeo/12-AGENTES/seguranca/findings/findings.json` (dedup por causa-raiz/endpoint).
  > **Alvo sob `examples/` (fixture) ou fora do repositório do corpus** (o alvo é de outro projeto, não do negócio onde
  > a skill roda): grave `findings.json` e o relatório **dentro do alvo** (`<ALVO>/reviews/`), rode `cvss.py --in`
  > nesse arquivo, e **não** rode `importar_findings.py` nem `prioridade.py all`. Eles escrevem no corpus (`gemeo/`) e
  > na fila de prioridade (`tasks/PRIORIDADE.md`) do hospedeiro com achados que não são do negócio dele. O
  > `escopo-autorizado.yaml` do hospedeiro também não é tocado: o alvo não entra no ROE por estar numa subpasta.
  >
  > **Teste concreto:** `git -C <ALVO> rev-parse --show-toplevel` igual à raiz do repositório onde a skill roda **e** alvo
  > fora de `examples/` ⇒ é código do próprio negócio (`/review-code-ph3a api/` num projeto instalado): fluxo normal,
  > findings em `gemeo/12-AGENTES/seguranca/findings/` e loop `importar_findings.py` + `prioridade.py all`. Subpasta do
  > próprio repositório **não** corta o loop red→blue.

- **Priorização**: `python3 scripts/importar_findings.py --in <findings.json> --out <eventos>` → `python3 scripts/prioridade.py all --in <eventos>`.

**Handoff ao `/pentest-dinamico`** (sem quebrar a regra "nunca execute código"): quando um achado estático precisar de **verificação dinâmica** de exploitabilidade, **encaminhe-o** ao `/pentest-dinamico` (que executa sob governança — ROE + aprovação), em vez de executar aqui. Você continua estático; a execução migra para a skill governada, que promove o finding a `status: "confirmado"`.

## Arquivos de Referencia

Para criterios detalhados, padroes de vulnerabilidade e citacoes completas, consulte:
- [checklist.md](checklist.md) - Checklist completo de verificacao (OWASP, NORM11, Privacy, Secrets, Headers, IA, SonarQube)
- [referencias.md](referencias.md) - Citacoes exatas das normas PH3A (NORM11, PROC09, NORM15), LGPD, ISO 27001, CMN e OWASP
- [patterns.md](patterns.md) - Padroes de vulnerabilidade por linguagem (Python, C#, JavaScript/React/Node.js) com exemplos PERIGOSO vs SEGURO

## Stack Tecnologica PH3A

| Camada | Tecnologias |
|--------|-------------|
| Backend | Python, C# (.NET) |
| Frontend | JavaScript/TypeScript, React |
| Backend API | Node.js |
| CI/CD | Azure DevOps |
| SAST | SonarQube (sonarqube.ph3a.com.br) |
| Versionamento | Git (Azure DevOps) |
| Metodologia | SCRUM |
