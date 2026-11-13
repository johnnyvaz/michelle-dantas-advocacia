# Checklist de Revisao de Seguranca de Codigo

Este documento detalha todos os criterios de verificacao para revisao de codigo interno PH3A.

---

## 1. OWASP Top 10 (2021)

Baseado em PROC09 Secao 4 e OWASP Top 10:2021.

### A01 - Broken Access Control

| Criterio | O que verificar | Severidade |
|----------|-----------------|------------|
| IDOR | Objetos acessados por ID sem verificacao de autorizacao | ALTA |
| Path Traversal | Input do usuario usado em caminhos de arquivo | CRITICA |
| Bypass CORS | CORS configurado com `*` ou origens excessivas | MEDIA |
| Falta de autorizacao | Endpoints sem verificacao de permissao | CRITICA |
| Escalacao horizontal | Usuario A acessa dados do usuario B | CRITICA |
| Escalacao vertical | Usuario comum acessa funcoes de admin | CRITICA |

**Verificacao:**
- [ ] Todos os endpoints possuem verificacao de autorizacao
- [ ] IDs de objetos nao sao previsíveis (UUID vs sequential)
- [ ] CORS esta configurado com origens especificas
- [ ] Principio de menor privilegio aplicado
- [ ] Funcoes administrativas separadas e protegidas

### A02 - Cryptographic Failures

| Criterio | O que verificar | Severidade |
|----------|-----------------|------------|
| Dados em transito | HTTPS/TLS em todas as conexoes | CRITICA |
| Dados em repouso | Criptografia de dados sensiveis no banco | ALTA |
| Algoritmos fracos | MD5, SHA1, DES para criptografia | ALTA |
| Chaves hardcoded | Chaves criptograficas no codigo | CRITICA |
| Padding Oracle | Modo CBC sem HMAC | MEDIA |

**Verificacao:**
- [ ] Conexoes usam TLS 1.2+
- [ ] Dados sensiveis criptografados em repouso (AES-256)
- [ ] Senhas com hash bcrypt/scrypt/argon2 (nao MD5/SHA1)
- [ ] Chaves criptograficas em vault/env (nao hardcoded)
- [ ] Certificados validos e nao auto-assinados em producao

### A03 - Injection

| Criterio | O que verificar | Severidade |
|----------|-----------------|------------|
| SQL Injection | Queries concatenadas com input | CRITICA |
| Command Injection | Comandos OS com input do usuario | CRITICA |
| LDAP Injection | Queries LDAP com input nao sanitizado | ALTA |
| XSS (Reflected) | Output sem encoding | ALTA |
| XSS (Stored) | Input salvo e exibido sem sanitizacao | CRITICA |
| XSS (DOM) | Manipulacao DOM com input | MEDIA |
| Template Injection | Input em templates server-side | CRITICA |
| NoSQL Injection | Operadores MongoDB no input | ALTA |

**Verificacao:**
- [ ] Queries SQL parametrizadas (prepared statements)
- [ ] Comandos OS sem input do usuario (ou whitelisted)
- [ ] Output HTML com encoding adequado
- [ ] Headers de seguranca configurados (CSP, X-XSS-Protection)
- [ ] Input validado e sanitizado no servidor

### A04 - Insecure Design

| Criterio | O que verificar | Severidade |
|----------|-----------------|------------|
| Falta rate limiting | Endpoints sensiveis sem limite | ALTA |
| Falta de validacao | Logica de negocio sem verificacoes | MEDIA |
| Trust boundaries | Confianca implicita em dados externos | ALTA |
| Threat modeling | Sem modelagem de ameacas | MEDIA |

**Verificacao:**
- [ ] Rate limiting em login, reset senha, APIs publicas
- [ ] Validacao de logica de negocio (nao apenas input)
- [ ] Dados de sistemas externos tratados como nao confiaveis
- [ ] Funcionalidades criticas com verificacao adicional

### A05 - Security Misconfiguration

| Criterio | O que verificar | Severidade |
|----------|-----------------|------------|
| Debug em producao | Debug mode, stack traces | ALTA |
| Senhas default | Credenciais padrao de frameworks | CRITICA |
| Headers ausentes | Security headers nao configurados | MEDIA |
| Permissoes excessivas | Servicos com privilegios desnecessarios | ALTA |
| Features desnecessarias | Funcoes habilitadas sem uso | MEDIA |

**Verificacao:**
- [ ] Debug desabilitado em producao
- [ ] Stack traces nao expostos ao usuario
- [ ] Security headers configurados (ver secao Headers)
- [ ] Servicos rodando com menor privilegio
- [ ] Diretorio listing desabilitado

### A06 - Vulnerable and Outdated Components

| Criterio | O que verificar | Severidade |
|----------|-----------------|------------|
| CVEs conhecidas | Dependencias com vulnerabilidades | CRITICA |
| Versoes desatualizadas | Pacotes sem update ha muito tempo | MEDIA |
| Sem manutencao | Bibliotecas abandonadas | MEDIA |
| Licencas | Licencas incompativeis | BAIXA |

**Verificacao:**
- [ ] `npm audit` / `pip audit` / equivalente executado
- [ ] Nenhuma dependencia com CVE critica
- [ ] Dependencias atualizadas (ultima versao estavel)
- [ ] Lock files presentes (package-lock.json, etc.)

### A07 - Identification and Authentication Failures

| Criterio | O que verificar | Severidade |
|----------|-----------------|------------|
| Credenciais fracas | Senhas curtas ou sem complexidade | ALTA |
| Brute force | Sem protecao contra tentativas massivas | ALTA |
| Session fixation | Sessao nao renovada apos login | ALTA |
| Tokens inseguros | JWT sem verificacao, tokens previsiveis | CRITICA |
| MFA ausente | Sem segundo fator em areas criticas | MEDIA |

**Verificacao:**
- [ ] Politica de senhas conforme NORM27
- [ ] Account lockout ou rate limiting
- [ ] Sessoes renovadas apos autenticacao
- [ ] Tokens JWT com verificacao de assinatura e expiracao
- [ ] Autenticacao via AD quando possivel (NORM11)

### A08 - Software and Data Integrity Failures

| Criterio | O que verificar | Severidade |
|----------|-----------------|------------|
| CI/CD inseguro | Pipeline sem verificacao de integridade | ALTA |
| Desserializacao | Input desserializado sem validacao | CRITICA |
| Atualizacoes | Updates sem verificacao de assinatura | ALTA |

**Verificacao:**
- [ ] Integridade de pacotes verificada (checksums)
- [ ] Desserializacao com whitelist de classes
- [ ] Pipeline CI/CD com verificacoes de seguranca

### A09 - Security Logging and Monitoring Failures

| Criterio | O que verificar | Severidade |
|----------|-----------------|------------|
| Logs ausentes | Eventos criticos nao registrados | ALTA |
| Logs insuficientes | Faltam dados para investigacao | MEDIA |
| Dados sensiveis em logs | PII, senhas, tokens em logs | ALTA |
| Alertas ausentes | Sem alertas para eventos criticos | MEDIA |

**Verificacao:**
- [ ] Login/logout registrados (NORM11 Secao 3)
- [ ] CRUD registrado (inclusao, alteracao, consulta, exclusao)
- [ ] Dados sensiveis mascarados em logs
- [ ] Logs conforme NORM04 (ver skill analyze-log)

### A10 - Server-Side Request Forgery (SSRF)

| Criterio | O que verificar | Severidade |
|----------|-----------------|------------|
| SSRF direto | URL fornecida pelo usuario usada em request | CRITICA |
| SSRF parcial | Parte da URL controlada pelo usuario | ALTA |
| DNS rebinding | Resolucao DNS nao validada | MEDIA |

**Verificacao:**
- [ ] URLs de destino em whitelist
- [ ] Requisicoes a IPs privados bloqueadas
- [ ] Redirect chains nao seguidas automaticamente

---

## 2. Controles NORM11 - Requisitos Minimos

Baseado na Norma de Seguranca para Desenvolvimento e Aquisicao de Software v6, Secao 3.

| # | Requisito | Verificacao | Severidade se Ausente |
|---|-----------|-------------|----------------------|
| N1 | Gestor responsavel | Sistema possui gestor designado | MEDIA |
| N2 | Logging CRUD | Logs de inclusao, alteracao, consulta e exclusao | ALTA |
| N3 | Logs conforme NORM04 | Logs seguem norma de Log e Trilhas de Auditoria | ALTA |
| N4 | Autenticacao de usuarios | Mecanismos de validacao e identificacao | CRITICA |
| N5 | Testes de seguranca | Testes funcionais de seguranca durante desenvolvimento | ALTA |
| N6 | Documentacao de mudancas | Manutencoes documentadas e aprovadas | MEDIA |
| N7 | Codificacao segura | Metodologia que garanta CIA + auditabilidade | ALTA |
| N8 | Documentacao tecnica | Documentacao tecnica e manual atualizados | BAIXA |
| N9 | Validacao de entrada | Controles de integridade em entradas manuais | ALTA |
| N10 | Segregacao de poderes | Principio de segregacao | ALTA |
| N11 | Versionamento | Versoes anteriores guardadas | MEDIA |
| N12 | Cronograma de testes | Testes e homologacao antes de producao | ALTA |
| N13 | Autenticacao via AD | Prioritariamente AD, excecoes aprovadas | MEDIA |
| N14 | Criptografia em transito | Dados sensiveis criptografados na conexao | CRITICA |
| N15 | Gerenciamento de sessao | Sessao apos login, consistente entre paginas | ALTA |
| N16 | Usuario sistemico BD | Usuario exclusivo para interface com banco | ALTA |
| N17 | Segregacao de perfis | Usuarios comuns vs privilegiados | ALTA |
| N18 | Comunicacao segura | Via BD ou conexao segura (nao texto aberto) | CRITICA |
| N19 | Interface de gestao de acessos | Gestao de permissoes (se nao via AD) | MEDIA |
| N20 | Trilha de auditoria | Interface para extracao de relatorios | ALTA |

---

## 3. Privacy by Design (LGPD / PROC09)

Aplicavel quando o codigo processa dados pessoais.

| # | Principio | Verificacao | Norma |
|---|-----------|-------------|-------|
| P1 | Minimizacao | Coleta apenas dados necessarios para a finalidade | LGPD Art. 6o, III |
| P2 | Anonimizacao | Dados anonimizados quando possivel | LGPD Art. 12 |
| P3 | Pseudonimizacao | Pseudonimizacao como medida adicional | LGPD Art. 13 |
| P4 | Consentimento | Mecanismos de opt-in/opt-out | LGPD Art. 7-8 |
| P5 | Direitos titular | APIs para acesso, correcao, exclusao | LGPD Art. 18 |
| P6 | Retencao limitada | TTL para dados pessoais | LGPD Art. 15-16 |
| P7 | Log de acesso PII | Registro de quem acessou dados pessoais | LGPD Art. 46 |
| P8 | Criptografia PII | Dados sensiveis criptografados | LGPD Art. 46 |
| P9 | Portabilidade | Exportacao de dados em formato interoperavel | LGPD Art. 18, V |
| P10 | Base legal | Finalidade documentada para cada tratamento | LGPD Art. 7 |

**Checklist rapido:**
- [ ] Dados pessoais identificados e documentados
- [ ] Base legal definida para cada tratamento
- [ ] Minimizacao aplicada (nao coleta dados desnecessarios)
- [ ] Criptografia em repouso e transito para PII
- [ ] Mecanismo de exclusao implementado
- [ ] Logs de acesso a dados pessoais
- [ ] Retencao com prazo definido (TTL)

---

## 4. Seguranca de Secrets

| # | Tipo | Regex de Deteccao | Severidade |
|---|------|-------------------|------------|
| S1 | Senha hardcoded | `password\s*=\s*["'][^"']+["']` | CRITICA |
| S2 | API Key | `api[_-]?key\s*=\s*["'][^"']+["']` | CRITICA |
| S3 | Secret | `secret\s*=\s*["'][^"']+["']` | CRITICA |
| S4 | Token | `token\s*=\s*["'][^"']+["']` | CRITICA |
| S5 | AWS Access Key | `AKIA[0-9A-Z]{16}` | CRITICA |
| S6 | AWS Secret Key | `AWS_SECRET_ACCESS_KEY` | CRITICA |
| S7 | Private Key | `BEGIN RSA PRIVATE KEY` | CRITICA |
| S8 | JDBC Password | `jdbc:.*password=` | CRITICA |
| S9 | Connection String | `connectionString.*Password=` | CRITICA |
| S10 | Bearer Token | `Authorization:\s*Bearer\s+[A-Za-z0-9]` | ALTA |
| S11 | CPF hardcoded | `\d{3}\.\d{3}\.\d{3}-\d{2}` | ALTA |
| S12 | CNPJ hardcoded | `\d{2}\.\d{3}\.\d{3}/\d{4}-\d{2}` | ALTA |
| S13 | Email hardcoded | `[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}` | MEDIA |
| S14 | IP interno | `(192\.168\|10\.)\d+\.\d+` | MEDIA |

---

## 5. Security Headers

Baseado em PROC09 Secao 4.3.

| Header | Valor Recomendado | Severidade se Ausente |
|--------|-------------------|----------------------|
| `X-XSS-Protection` | `1; mode=block` | MEDIA |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | ALTA |
| `X-Frame-Options` | `DENY` ou `SAMEORIGIN` | MEDIA |
| `X-Content-Type-Options` | `nosniff` | MEDIA |
| `Content-Security-Policy` | Politica restritiva | ALTA |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | BAIXA |
| `Permissions-Policy` | Restringir features do navegador | BAIXA |
| `Cache-Control` | `no-store` para paginas com dados sensiveis | ALTA |

---

## 6. Verificacao de IA (NORM11 3.1 / PROC09)

### Codigo Gerado por IA

| # | Verificacao | Severidade |
|---|-------------|------------|
| IA1 | Code review humano realizado | ALTA |
| IA2 | Nao contem logica proprietaria | ALTA |
| IA3 | Nao contem credenciais | CRITICA |
| IA4 | Nao contem queries com dados reais | ALTA |
| IA5 | Nao contem estruturas de banco producao | ALTA |
| IA6 | Licencas validadas | MEDIA |
| IA7 | Origem documentada (comentario) | BAIXA |

### Sistemas com IA / ML (PROC20)

| # | Verificacao | Severidade |
|---|-------------|------------|
| ML1 | RIPD se dados pessoais | CRITICA |
| ML2 | Origem dos dados documentada | ALTA |
| ML3 | Modelo versionado | MEDIA |
| ML4 | Testes de vies/fairness | ALTA |
| ML5 | Monitoramento de drift | MEDIA |
| ML6 | Sanitizacao contra prompt injection | CRITICA |
| ML7 | Rate limiting em APIs de modelo | ALTA |
| ML8 | Protecao contra model extraction | ALTA |

---

## 7. SonarQube Quality Gates (PROC09 / PROC20)

| Metrica | Threshold | Bloqueante |
|---------|-----------|------------|
| Bugs criticos | 0 | Sim |
| Vulnerabilidades criticas | 0 | Sim |
| Code smells | Rating A | Nao |
| Cobertura de testes | > 60% | Nao |
| Duplicacao | < 3% | Nao |
| Security Hotspots revisados | 100% | Sim |

---

## 8. ISO 27001 - Controles de Desenvolvimento

| Controle | Descricao | O que verificar |
|----------|-----------|-----------------|
| A.8.25 | SDLC seguro | Processo de desenvolvimento documentado |
| A.8.26 | Requisitos seguranca | Requisitos definidos antes do desenvolvimento |
| A.8.27 | Arquitetura segura | Principios de engenharia segura aplicados |
| A.8.28 | Codificacao segura | OWASP Top 10 mitigado, input validation |
| A.8.29 | Testes seguranca | SAST/DAST executados antes de producao |
| A.8.30 | Dev terceirizado | Requisitos de seguranca em contratos |
| A.8.31 | Separacao ambientes | Dev/Homolog/Prod separados e isolados |
| A.8.32 | Gestao de mudancas | Mudancas controladas e documentadas |

---

## 9. SLAs de Remediacao (NORM15)

| Severidade | CVSS | Prazo | Escalonamento |
|------------|------|-------|---------------|
| CRITICA | 9.0-10.0 | 72 horas | Imediato ao Comite SI |
| ALTA | 7.0-8.9 | 7 dias | Gestor de TI |
| MEDIA | 4.0-6.9 | 30 dias | Relatorio mensal |
| BAIXA | 0.1-3.9 | 90 dias | Relatorio trimestral |

---

## 10. Criterios de Bloqueio de Deploy

Baseado em PROC09:

- [ ] Vulnerabilidade critica nao tratada
- [ ] Credencial detectada no codigo
- [ ] Dependencia com CVE critica conhecida
- [ ] Falha em teste de prompt injection (se aplicavel)
- [ ] Quality gate SonarQube nao aprovado
- [ ] Code review nao realizado

---

## 11. Template de Avaliacao Rapida

```
AVALIACAO RAPIDA DE SEGURANCA DE CODIGO
========================================

Data: ___________
Arquivo(s): ___________
Linguagem: ___________
Revisor: ___________

OWASP TOP 10:
[ ] A01 - Broken Access Control
[ ] A02 - Cryptographic Failures
[ ] A03 - Injection
[ ] A04 - Insecure Design
[ ] A05 - Security Misconfiguration
[ ] A06 - Vulnerable Components
[ ] A07 - Auth Failures
[ ] A08 - Integrity Failures
[ ] A09 - Logging Failures
[ ] A10 - SSRF

NORM11 CRITICOS:
[ ] Autenticacao presente
[ ] Logging CRUD implementado
[ ] Criptografia em transito
[ ] Comunicacao segura (nao texto aberto)
[ ] Segregacao de perfis

SECRETS:
[ ] Nenhuma credencial hardcoded
[ ] Nenhum dado pessoal hardcoded
[ ] Nenhuma chave/token no codigo

PRIVACY:
[ ] Minimizacao de dados
[ ] Criptografia de PII
[ ] Logs de acesso a PII

VEREDICTO: [ ] APROVADO  [ ] RESSALVAS  [ ] REPROVADO
```
