# Seed de Constituição PH3A

> Este arquivo é a **base de princípios** que a skill `/ph3a-loop` passa para `/speckit-constitution` ao definir
> a constituição de um projeto. Não é a constituição final — é o material de partida. O `/speckit-constitution`
> usa este conteúdo para preencher `.specify/memory/constitution.md`, ajustando o nome do projeto e a numeração.
>
> Os princípios derivam das normas PH3A já presentes no repositório (`docs/normas/`) e da Política Corporativa
> de Uso de IA PH3A v2.0 (`docs/politica-ia.md`). Mantenha-os alinhados quando as normas forem atualizadas.

---

## Core Principles

### I. Segurança desde o design (NÃO-NEGOCIÁVEL)
Todo código segue desenvolvimento seguro (NORM11, PROC09) e mitiga o OWASP Top 10. Sem segredos hardcoded
(credenciais, tokens, chaves) — uso de cofre/variáveis de ambiente. Dependências de terceiros passam por revisão
antes da adoção. Toda mudança relevante é submetida à skill `/review-code-ph3a` antes do merge.

### II. Privacidade e proteção de dados (LGPD)
Dados pessoais nunca são usados em testes, demos ou prompts de IA (NORM16). Quando dados reais são necessários,
são anonimizados/pseudonimizados localmente (`/anonymize-data`, NORM10) ou substituídos por dados sintéticos
(`/synthetic-data-generator`). Produtos com IA que tratam dados pessoais exigem RIPD (`/ripd-assistant`) aprovado
pelo DPO antes de produção.

### III. Qualidade com ratchet (NÃO-NEGOCIÁVEL)
O `quality-gate` é obrigatório. As métricas só podem melhorar: cobertura de testes, erros de tipo, duplicação de
código e violações de arquitetura nunca regridem em relação ao baseline. Nenhum PR é integrado, e nenhum deploy
acontece, com o quality-gate em regressão.

### IV. Fronteiras de arquitetura explícitas
As camadas e dependências permitidas entre pacotes são declaradas e impostas (`/arch-guard`). Sem ciclos de
import; dependências fluem apenas nas direções autorizadas. Débito legado entra no ratchet (`arch_violations`) e
só pode diminuir.

### V. Versionamento e histórico rastreável
Commits seguem Conventional Commits (validado por hook). O versionamento é semântico e automatizado a partir do
histórico (`scripts/release.sh`). Logs e trilhas de auditoria seguem a NORM04 onde aplicável.

### VI. Uso responsável de IA
O uso de IA segue a Política Corporativa de Uso de IA PH3A v2.0: apenas ferramentas aprovadas
(`docs/ferramentas-aprovadas.md`), prompts auditados antes do envio (`/prompt-audit`), e Model Card
(`/model-card-generator`) obrigatório antes de colocar qualquer IA embarcada em produção. Novas ferramentas/usos
passam por `/ai-tool-request` e fornecedores por `/supplier-ai-due-diligence`.

### VII. Resiliência e observabilidade
Integrações externas têm timeout, retry com backoff e circuit breaker (`/resilience-guard`). Serviços expõem
health checks e fazem graceful shutdown. O consumo de I/O (SQL/HTTP) por requisição é monitorado contra N+1 e
regressões (`/io-budget`); memória é monitorada contra leaks (`/memory-guard`).

## Restrições e padrões adicionais

- **Stack e estrutura**: organização padrão PH3A (`.claude/memory/`, `tasks/`, hooks de commit, `.devcontainer/`
  quando aplicável), instalada pela `/ph3a-loop` (Fase Organizar).
- **Conformidade**: o projeto herda a base normativa em `docs/` e a Política de IA. Incidentes de IA são
  reportados imediatamente via `/incident-report-ia` (NORM09/NORM31).

## Quality Gates

- `quality-gate` verde é condição para merge e para deploy.
- Guards aplicáveis à stack (`io-budget`, `memory-guard`, `property-race-guard`, `resilience-guard`, `arch-guard`)
  estão instalados e suas métricas no ratchet.
- Análise `/sonarqube` e revisão `/review-code-ph3a` rodam antes de releases significativas.

## Development Workflow

- Features seguem o ciclo Spec Kit: `/speckit-specify → /speckit-plan → /speckit-tasks → /speckit-implement`.
- A extension `ph3a-quality` dispara o quality-gate e a revisão de segurança nos hooks do ciclo.
- Deploy é interativo e protegido (`/deploy`): exige branch correta, quality-gate verde e confirmação por ambiente.

## Governance

Esta constituição prevalece sobre práticas ad hoc. Emendas exigem documentação, justificativa e plano de migração.
Toda revisão de PR verifica conformidade com estes princípios; complexidade adicional precisa ser justificada.
As skills do BoilerplateIA são os instrumentos operacionais destes princípios.

**Version**: 1.0.0 | **Ratified**: PREENCHER_DATA | **Last Amended**: PREENCHER_DATA
