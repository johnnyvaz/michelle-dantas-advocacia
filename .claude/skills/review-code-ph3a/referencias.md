# Referencias Legais e Normativas para Revisao de Codigo

Este documento contem as citacoes oficiais das normas e legislacoes utilizadas na revisao de seguranca de codigo.

---

## 1. PH3A NORM11 - Seguranca para Desenvolvimento e Aquisicao de Software v6

**Data:** Setembro/2024 (revisao IA Janeiro/2026)
**Aprovacao:** Comite de Seguranca da Informacao e Privacidade

### Secao 3 - Requerimentos Minimos de Seguranca em Desenvolvimento

> "Todos os projetos de sistemas deverao evidenciar a implementacao dos seguintes controles:
> - Todos os sistemas devem possuir um Gestor responsavel e qualquer manutencao ou alteracao deve ser aprovada por ele.
> - Devem ser implementadas funcionalidades de registros e analise de log em todos os sistemas e contemplem no minimo operacoes de inclusao, alteracao, consulta e exclusao.
> - Os sistemas devem possuir mecanismos para validacao e identificacao dos usuarios que os utilizam.
> - Testes de funcionalidade de seguranca devem ser realizados durante o desenvolvimento de sistemas.
> - Deve ser adotado metodologia de codificacao segura, para desenvolvimento de sistemas obedecendo recomendacoes de seguranca que garantam a confidencialidade, integridade, disponibilidade e auditabilidade dos dados e operacoes.
> - Os sistemas devem ser desenvolvidos observando-se o principio de segregacao e poderes.
> - Os sistemas devem prioritariamente realizar autenticacao via AD, casos de excecao deverao ser aprovados pelo gestor de TI Desenvolvimento.
> - Todos os dados sensiveis devem ser criptografados no ato da conexao do usuario com o servidor.
> - E obrigatorio que seja implementado o gerenciamento de sessao, fazendo com que o sistema/aplicativo seja executado somente depois do login independente da pagina, e que a sessao seja a mesma de uma pagina para a outra.
> - Possuir um usuario sistemico exclusivo para a realizacao de interface com o banco de dados e outros repositorios.
> - Devera ser segregado os perfis de usuarios comuns dos usuarios com poderes privilegiados de administracao.
> - Qualquer interface de comunicacao entre sistemas devera ser via base de dados ou conexao segura, e nao via arquivos de texto aberto, e sem intervencao manual."

### Secao 3.1 - Requisitos para Uso de IA no Desenvolvimento

> "O uso de ferramentas de IA para assistencia ao desenvolvimento deve observar:
> Ferramentas Permitidas: GitHub Copilot (versao enterprise com DPA), Ferramentas locais de code completion.
> Restricoes: Nao inserir codigo proprietario em ferramentas de IA publicas; Nao inserir credenciais, API keys ou secrets em prompts; Revisar codigo gerado por IA antes de commit; Nao usar IA para gerar codigo que processa dados pessoais sem revisao.
> Validacao de Codigo Gerado por IA: Scan de vulnerabilidades obrigatorio (SonarQube); Code review por desenvolvedor humano; Teste de seguranca antes de producao."

### Secao 5.1 - Responsabilidade da Area de Projetos

> "Todos os projetos deverao ser inseridos na ferramenta https://sonarqube.ph3a.com.br para analise do codigo fonte durante a fase de desenvolvimento."

---

## 2. PH3A PROC09 - Procedimento de Seguranca em Desenvolvimento de Software v6

**Data:** Dezembro/2024
**Aprovacao:** Comite de Privacidade e Seguranca da Informacao

### Secao 4.1 - Injecao

> "As falhas de Injecao, tais como injecao de SQL, de SO (Sistema Operacional) e de LDAP, ocorrem quando dados nao confiaveis sao enviados para um interpretador como parte de um comando ou consulta. Para se evitar este tipo de ataque use parametrizacao ao inves de concatenacao."

### Secao 4.2 - Quebra de Autenticacao e Gerenciamento de Sessao

> "As funcoes da aplicacao relacionadas com autenticacao e gerenciamento de sessao geralmente sao implementadas de forma incorreta, permitindo que os atacantes comprometam senhas, chaves e tokens de sessao. Para se evitar este tipo de vulnerabilidade os desenvolvedores devem ter um conjunto de controles fortes para autenticacao."

### Secao 4.3 - Cross-Site Scripting (XSS)

> "Para se evitar este tipo de vulnerabilidade e necessario implementar os Headers no IIS ou Apache como X-XSS Protection, HTTP Strict Transport Security, X-Frame-Options, X-Content-Type-Options e Content Security Policy."

### Secao 4.5 - Configuracao Incorreta de Seguranca

> "Uma boa seguranca exige a definicao de uma configuracao segura e implementada na aplicacao, frameworks, servidor de aplicacao, servidor web, banco de dados e plataforma. Todas essas configuracoes devem ser definidas, implementadas e mantidas, ja que geralmente a configuracao padrao e insegura como senhas default de webservices."

### Secao 4.6 - Exposicao de Dados Sigilosos e Confidenciais

> "Uma solucao para evitar esta exposicao e desabilitar o autocomplete em formularios e o cache em paginas que contenham dados sensiveis."

### Secao 4.7 - CSRF

> "Para se evitar este tipo de ataque, a aplicacao deve implementar maneiras corretas de usar o POST e GET, usar valores aleatorios incluidos em formularios como um campo escondido."

### Secao 5 - Controle de Qualidade (SonarQube)

> "As aplicacoes Web devem passar por analise da ferramenta SonarQube quando transportadas para os ambientes de qualidade e producao. As vulnerabilidades identificadas deverao ser analisadas e tratadas o mais breve possivel."

**Prazos de correcao (PROC09):**
| Criticidade | Prazo Maximo |
|-------------|-------------|
| Alta | 30 Dias |
| Media | 60 Dias |
| Baixa | 90 Dias |

### Secao 6 - Privacy by Design e Privacy by Default

> "Todo desenvolvimento realizado pela PH3A que implique em novos sistemas, substituicao de aplicativos, novos modulos, integracoes ou mudancas em sistemas deve contemplar, desde sua concepcao, as normas e principios de privacidade (Privacy by Design) e torna-lo padrao para garantir a protecao dos dados dos usuarios (Privacy by Default)."

### Ferramentas de IA Permitidas (PROC09)

| Ferramenta | Status | Condicoes |
|------------|--------|-----------|
| GitHub Copilot Business | Permitido | Telemetria desabilitada |
| ChatGPT Enterprise | Condicionado | Sem codigo sensivel |
| Claude Enterprise | Condicionado | Sem codigo sensivel |
| Copilot Individual | PROIBIDO | Dados de treinamento nao controlados |
| ChatGPT Free | PROIBIDO | Sem garantias de privacidade |

### Testes de Seguranca Automatizados (PROC09)

**SAST:**
| Ferramenta | Momento | Bloqueante |
|------------|---------|------------|
| SonarQube | A cada commit | Critico/Alto |
| Semgrep | Pull Request | Critico |
| Secrets Scanner | Pre-commit | Qualquer match |
| Dependency Check | Build | CVE critica |

**DAST:**
| Ferramenta | Frequencia | Escopo |
|------------|------------|--------|
| OWASP ZAP | Semanal | APIs expostas |
| Nuclei | Diario | Vulnerabilidades conhecidas |
| Pentest manual | Anual | Aplicacoes criticas |

### Criterios de Bloqueio de Deploy (PROC09)

> "Vulnerabilidade critica nao tratada; Credencial detectada no codigo; Dependencia com CVE critica conhecida; Falha em teste de prompt injection."

---

## 3. PH3A PROC20 - Procedimento de Projeto e Desenvolvimento v2

**Data:** Dezembro/2024

### Secao 3.1 - Planejamento

> "Os requisitos de seguranca da informacao sao incorporados em todos os produtos da PH3A, existentes e os novos. A metodologia de desenvolvimento utilizada e uma aplicacao direta do SCRUM."

### Secao 3.3 - Saidas de Projeto

> "Quando uma versao e finalizada e aprovada, sua implementacao e feita via Azure DevOps no ambiente de Homologacao. O time de qualidade e testes faz as validacoes e liberada a versao pode ser implementada em producao."

### Analise Estatica de Codigo (PROC20)

**Quality Gates SonarQube:**
| Metrica | Threshold | Bloqueante |
|---------|-----------|------------|
| Bugs criticos | 0 | Sim |
| Vulnerabilidades criticas | 0 | Sim |
| Code smells | Rating A | Nao |
| Cobertura de testes | > 60% | Nao |
| Duplicacao | < 3% | Nao |

---

## 4. PH3A NORM15 - Gestao de Vulnerabilidades e Ameacas v6

**Data:** Dezembro/2024

### SLAs de Remediacao

| Severidade (CVSS) | Prazo de Remediacao | Escalonamento |
|-------------------|---------------------|---------------|
| Critica (9.0-10.0) | 72 horas | Imediato ao Comite SI |
| Alta (7.0-8.9) | 7 dias | Gestor de TI |
| Media (4.0-6.9) | 30 dias | Relatorio mensal |
| Baixa (0.1-3.9) | 90 dias | Relatorio trimestral |

### Vulnerabilidades de Sistemas de IA (NORM15)

| Tipo | Descricao | Controle |
|------|-----------|----------|
| Adversarial Attacks | Inputs manipulados para enganar modelo | Validacao de inputs, deteccao de anomalias |
| Model Extraction | Roubo de modelo via queries | Rate limiting, monitoramento de queries |
| Data Poisoning | Contaminacao de dados de treinamento | Validacao de dados, provenance |
| Membership Inference | Descobrir se dados foram usados | Privacidade diferencial |
| Model Inversion | Reconstruir dados de treinamento | Anonimizacao, limitar outputs |
| Prompt Injection | Manipular comportamento via prompts | Sanitizacao de inputs |

---

## 5. LGPD - Lei 13.709/2018

### Art. 6o - Principios (Aplicacao em Codigo)

> "III - necessidade: limitacao do tratamento ao minimo necessario para a realizacao de suas finalidades, com abrangencia dos dados pertinentes, proporcionais e nao excessivos em relacao as finalidades do tratamento de dados."

**Aplicacao:** Codigo nao deve coletar ou processar dados pessoais alem do necessario.

### Art. 12 - Anonimizacao

> "Os dados anonimizados nao serao considerados dados pessoais para os fins desta Lei, salvo quando o processo de anonimizacao ao qual foram submetidos for revertido."

**Aplicacao:** Implementar anonimizacao efetiva (irreversivel) quando possivel.

### Art. 18 - Direitos do Titular

> "O titular dos dados pessoais tem direito a obter do controlador, em relacao aos dados do titular por ele tratados, a qualquer momento e mediante requisicao:
> I - confirmacao da existencia de tratamento;
> II - acesso aos dados;
> III - correcao de dados incompletos, inexatos ou desatualizados;
> IV - anonimizacao, bloqueio ou eliminacao de dados;
> V - portabilidade dos dados a outro fornecedor."

**Aplicacao:** Codigo deve implementar APIs/funcoes para atender esses direitos.

### Art. 46 - Seguranca desde a Concepcao

> "Os agentes de tratamento devem adotar medidas de seguranca, tecnicas e administrativas aptas a proteger os dados pessoais de acessos nao autorizados e de situacoes acidentais ou ilicitas de destruicao, perda, alteracao, comunicacao ou qualquer forma de tratamento inadequado ou ilicito."

**Aplicacao:** Todo codigo que processa dados pessoais deve ter medidas de seguranca implementadas.

### Art. 49 - Sistemas Estruturados

> "Os sistemas utilizados para o tratamento de dados pessoais devem ser estruturados de forma a atender aos requisitos de seguranca, aos padroes de boas praticas e de governanca e aos principios gerais previstos nesta Lei."

**Aplicacao:** Arquitetura e design devem considerar seguranca de dados pessoais.

---

## 6. ISO/IEC 27001:2022 - Controles de Desenvolvimento

### A.8.25 - Ciclo de Vida de Desenvolvimento Seguro

> "Regras para o desenvolvimento seguro de software e sistemas devem ser estabelecidas e aplicadas."

### A.8.26 - Requisitos de Seguranca de Aplicacoes

> "Requisitos de seguranca da informacao devem ser identificados, especificados e aprovados ao desenvolver ou adquirir aplicacoes."

### A.8.27 - Arquitetura de Sistemas Seguros e Principios de Engenharia

> "Principios para a engenharia de sistemas seguros devem ser estabelecidos, documentados, mantidos e aplicados a qualquer atividade de desenvolvimento de sistemas de informacao."

### A.8.28 - Codificacao Segura

> "Principios de codificacao segura devem ser aplicados ao desenvolvimento de software."

**Requisitos:**
- Validacao de input
- Autenticacao e controle de acesso
- Protecao contra injecao
- Gerenciamento de erros e logging
- Criptografia adequada

### A.8.29 - Testes de Seguranca em Desenvolvimento e Aceitacao

> "Processos de teste de seguranca devem ser definidos e implementados no ciclo de vida do desenvolvimento."

### A.8.31 - Separacao de Ambientes

> "Ambientes de desenvolvimento, teste e producao devem ser separados e protegidos."

---

## 7. Resolucao CMN 4.893/2021

### Art. 3o, I - Autenticacao e Criptografia

> "Implementar controles que busquem assegurar: I - a autenticacao, a criptografia, a prevencao e a deteccao de intrusao, a prevencao de vazamento de informacoes."

**Aplicacao:** Codigo deve implementar autenticacao robusta e criptografia.

### Art. 3o, III - Prevencao de Intrusao

> "III - as rotinas, os procedimentos, os controles e as tecnologias a serem utilizados na prevencao e na resposta a incidentes."

**Aplicacao:** Validacao de inputs, sanitizacao, rate limiting.

### Art. 5o - Desenvolvimento Seguro

> "As instituicoes devem adotar procedimentos e controles para prevenir e responder a incidentes, incluindo procedimentos para o desenvolvimento de sistemas de informacao seguros."

---

## 8. OWASP References

### OWASP Top 10:2021
- A01: Broken Access Control
- A02: Cryptographic Failures
- A03: Injection
- A04: Insecure Design
- A05: Security Misconfiguration
- A06: Vulnerable and Outdated Components
- A07: Identification and Authentication Failures
- A08: Software and Data Integrity Failures
- A09: Security Logging and Monitoring Failures
- A10: Server-Side Request Forgery (SSRF)

### OWASP Top 10 for LLM Applications (2025)
- LLM01: Prompt Injection
- LLM02: Insecure Output Handling
- LLM03: Training Data Poisoning
- LLM04: Model Denial of Service
- LLM05: Supply Chain Vulnerabilities
- LLM06: Sensitive Information Disclosure
- LLM07: Insecure Plugin Design
- LLM08: Excessive Agency
- LLM09: Overreliance
- LLM10: Model Theft

### OWASP ASVS (Application Security Verification Standard)
Niveis de verificacao:
- Level 1: Oportunistico (minimo)
- Level 2: Padrao (recomendado)
- Level 3: Avancado (critico)

---

## 9. Tabela de Mapeamento Cruzado

| Achado | NORM11 | PROC09 | NORM15 | LGPD | ISO 27001 | CMN | OWASP |
|--------|--------|--------|--------|------|-----------|-----|-------|
| SQL Injection | Sec. 3 | 4.1 | - | Art. 46 | A.8.28 | Art. 3o | A03 |
| XSS | Sec. 3 | 4.3 | - | Art. 46 | A.8.28 | Art. 3o | A03 |
| Credencial hardcoded | Sec. 3 | 4.2 | SLA 72h | Art. 46 | A.8.28 | Art. 3o,I | A07 |
| Falta criptografia | Sec. 3 | 4.6 | - | Art. 46 | A.8.24 | Art. 3o,I | A02 |
| Falta autenticacao | Sec. 3 | 4.2 | - | Art. 46 | A.8.28 | Art. 3o,I | A07 |
| IDOR | Sec. 3 | 4.4 | - | Art. 46 | A.8.28 | - | A01 |
| CSRF | - | 4.7 | - | - | A.8.28 | - | A01 |
| Config insegura | - | 4.5 | - | - | A.8.28 | - | A05 |
| PII sem protecao | - | 6 | - | Art. 46 | A.8.11 | Art. 3o | A02 |
| Falta de log | Sec. 3 | - | - | Art. 50 | A.8.15 | Art. 6o | A09 |
| Componente vulneravel | - | 4.8 | SLA | Art. 46 | A.8.28 | Art. 5o | A06 |
| Prompt injection | 3.1 | IA | - | Art. 46 | A.8.28 | - | LLM01 |

---

## 10. Links Uteis

- **LGPD Texto Completo:** [planalto.gov.br](http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/L13709.htm)
- **CMN 4.893/2021:** [bcb.gov.br](https://www.bcb.gov.br/estabilidadefinanceira/exibenormativo?tipo=Resolu%C3%A7%C3%A3o%20CMN&numero=4893)
- **ISO 27001:2022:** [iso.org](https://www.iso.org/standard/27001)
- **OWASP Top 10:** [owasp.org/Top10](https://owasp.org/www-project-top-ten/)
- **OWASP Top 10 LLM:** [owasp.org/llm-top-10](https://owasp.org/www-project-top-10-for-large-language-model-applications/)
- **OWASP ASVS:** [owasp.org/asvs](https://owasp.org/www-project-application-security-verification-standard/)
- **SonarQube PH3A:** [sonarqube.ph3a.com.br](https://sonarqube.ph3a.com.br)
- **NORM11 PH3A:** DOCS_PH3A/PoliticasNormasProcedimentos/corrigido-ia/PH3A_NORM11_*.md
- **PROC09 PH3A:** DOCS_PH3A/PoliticasNormasProcedimentos/corrigido-ia/PROC09_*.md
- **NORM15 PH3A:** DOCS_PH3A/PoliticasNormasProcedimentos/corrigido-ia/PH3A_NORM15_*.md
