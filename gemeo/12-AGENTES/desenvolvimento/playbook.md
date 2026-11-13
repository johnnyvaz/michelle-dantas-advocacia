# Desenvolvimento — Playbook

> Conhecimento de domínio da área de Desenvolvimento: como construir, testar, fazer deploy e operar a plataforma de `{{EMPRESA}}` com qualidade. Deriva do canon e do contexto do cérebro (`07-PRODUTO`) e do `CLAUDE.md` do repositório — e **nunca os contradiz**. Se um número divergir, **o canon / o código real prevalece**.

## Objetivo da área

Manter e evoluir a plataforma de `{{EMPRESA}}` com disponibilidade, qualidade e segurança, entregando features que avançam as metas do negócio. Quando o gargalo do negócio for go-to-market (e não engenharia), a regra é **nenhuma dívida técnica para feature não validada**; construir o mínimo e iterar.

## Stack (real — `CLAUDE.md` / canon `produto`)

A stack concreta vive no canon (`produto.*`) e no `gemeo/07-PRODUTO/ARCHITECTURE.md`. Ler de lá antes de afirmar tecnologias. Em termos de papel (preencher com a stack real do projeto):

| Camada | Papel |
|--------|-------|
| Framework | framework web (SSR / roteamento por app ou equivalente) |
| Linguagem | linguagem tipada, modo estrito |
| UI | biblioteca de componentes + sistema de estilo |
| Backend | BaaS / banco com Auth, Storage e tempo real |
| Pagamentos | gateway de pagamento (cartão + meios locais) |
| Mídia / IA | provedor de mídia · provedor(es) de LLM via cliente próprio |
| Deploy | hospedagem de frontend + backend gerenciado |

Um produto ou workstream específico (`{{PRODUTO}}`) é **uma parte** dessa plataforma — não o produto inteiro.

## Princípios (como fazer bem)

- **Viés para a simplicidade.** Solução complexa para problema simples = dívida.
- **Renderização no servidor por padrão**; componente de cliente só quando necessário.
- **Controle de acesso por linha (RLS ou equivalente) obrigatório** em toda tabela com dado pessoal; validar **ownership** em toda API (previne IDOR).
- **Tipagem estrita, sem tipos soltos.** Gerar tipos a partir do schema, não escrever à mão.
- **Operações sensíveis de forma atômica** (ex.: dedução de créditos via procedimento transacional — nunca `UPDATE` manual sujeito a corrida).
- **Para tarefas longas/assíncronas, preferir o padrão `202 Accepted` + push via canal de tempo real** a manter uma conexão síncrona bloqueada.
- **QA antes de deploy, sempre.** O autor não se autocertifica.
- **pt-BR correto** em todo texto visível e comentário.

## Processos / Frameworks

### 1. Ciclo de uma feature (Definition of Done)

1. Projetar a mudança; classificar dado novo quanto à LGPD.
2. Escrever migration (se houver schema); testar no ambiente local primeiro; o controle de acesso por linha entra na **mesma** migration que cria a tabela.
3. Implementar — tipagem estrita, ownership validado, padrões do `CLAUDE.md` e `.claude/rules/`.
4. Auto-revisão + rodar o quality gate local (ver §5).
5. Submeter para QA com critérios de aceitação explícitos. **QA aprova; o autor não.**
6. Deploy só após o ✅ APROVADO do QA.

> **DoD**: feature implementada · casos de teste do QA passando · quality gate sem regressão · (frontend) Lighthouse ≥ 90 na página afetada · PR revisado e mesclado.

### 2. Runbook de deploy

Ambientes: **Local** → **Preview** (ambiente por PR, onde o QA valida) → **Produção**.

**Checklist pré-deploy** (todo deploy):
- [ ] ✅ APROVADO do QA registrado na tarefa.
- [ ] Caminhos críticos testados no preview.
- [ ] Novas variáveis de ambiente adicionadas ao destino? (segredos **nunca** no git.)
- [ ] Migration necessária? Plano de rollback identificado.
- [ ] É sexta à tarde? Adiar, salvo correção P1 com autorização explícita.

**Deploy padrão (frontend)**: a hospedagem normalmente auto-deploya no merge para a branch principal. Após: checar logs de build, smoke test (`curl -I .../rota` → 200; caminho crítico carrega), comentar "deployado [hash] às [hora]".

**Deploy de migration** (separado do código, sempre nesta ordem):
1. validar o diff do schema;
2. aplicar em ambiente local primeiro (reset destrutivo **só** no local — **nunca** em produção);
3. aplicar em produção;
4. regenerar tipos a partir do schema (sem erro de tipo).

**Migration zero-downtime** (tabela usada por fluxo ativo): (1) migration retrocompatível primeiro (adiciona coluna, não remove a antiga); (2) deploy do código que usa a coluna nova; (3) remover a antiga numa migration separada, semanas depois.

**Rollback**:
- *Frontend* — alvo < 2 min: republicar o último deploy bom → verificar 200.
- *Banco* — quando **não há rollback automático**: escrever SQL reverso, aplicar, verificar integridade. Prevenção (testar local antes) é a única proteção. Reset destrutivo em produção: **nunca**.

> A skill `deploy` cobre release/deploy dos serviços do projeto.

### 3. Runbook de QA

Testar em desktop **e** mobile (mín. um navegador moderno). Suítes típicas, conforme o workstream:
- **Fluxo de wizard / formulário**: cada passo carrega e avança; validação de campos (vazio, e-mail inválido, telefone com/sem DDI); dado persistido no banco.
- **Preservação de UTM**: parâmetros da URL de entrada chegam íntegros até a conversão.
- **Fluxo do agente IA**: mensagem → **HTTP 202** imediato → resposta via canal de **tempo real** dentro do SLA; erro de saldo insuficiente quando crédito zerado; o canal de tempo real conecta sem erro.
- **Landing**: 200 OK, CTA primário redireciona, Lighthouse ≥ 90.

**Critério de bloqueio**: falha em caminho crítico (wizard não avança, validação/persistência quebrada, UTM perdida, fluxo assíncrono quebrado, CTA primário quebrado) → **deploy BLOQUEADO**. Itens de UX/secundários podem seguir com pendência aberta.

**Sign-off** (binário):
```
✅ QA APROVADO — [feature]: caminhos críticos PASS, mobile PASS. Pronto p/ produção.
❌ QA BLOQUEADO — Bug [id]: [descrição]. Severidade P1. Reproduz: [passos]. Re-teste após correção.
```
Smoke test pós-deploy em produção; se falhar, alertar para decisão de rollback.

### 4. Runbook de monitoramento e incidentes

Métricas-alvo e severidade (defaults — calibrar contra o real do canon/SRE):

| Métrica | Alvo | Alerta |
|---------|------|--------|
| HTTP status | 200 | não-200 por > 2 checagens |
| Tempo de resposta (páginas) | < 2s P95 | > 5s sustentado 15 min |
| Tempo de resposta (API IA) | < 30s P95 | > 60s sustentado 10 min |
| Taxa de erro 5xx | < 1% | > 5% em 1h |
| Sucesso de envio de formulário | > 95% | < 80% em 1h |
| Conexão de tempo real | conectada | desconectada > 2 min |

| Severidade | Condição | Resposta |
|-----------|----------|----------|
| **P1** | Página crítica fora > 5 min · API IA fora > 5 min · vazamento de dados | Imediata — acionar deploy/backend + responsável |
| **P2** | Taxa de erro > 5% em 1h · P95 > 10s por 30 min | < 30 min |
| **P3** | Latência > 5s por < 30 min · erro não crítico | Próximo dia útil |

**Post-mortem (obrigatório em P1, em 24h)**: o que aconteceu · quando detectado vs. quando começou · causa raiz (específica) · resolução · impacto · prevenção (ações). Sem culpado — falha de processo.

### 5. Quality gate e padrões (o coração da craft)

Antes de qualquer deploy, rodar o **quality gate com ratchet** (`node scripts/quality-gate.js` via `quality-check`): métricas só podem **melhorar ou manter** — nunca regredir. Cobre cobertura, duplicação e as métricas dos guards (arquitetura, resiliência, observabilidade, memória, I/O, SCA, race conditions).

- **Convenções do repo**: `.claude/rules/` (pt-BR, framework/UI, banco/RLS, padrão de auth).
- **TDD**: escrever o teste que falha primeiro (red→green→refactor); para bug, teste de regressão antes da correção. Confirmar o runner de teste do projeto antes de marcar RED→GREEN.
- **Revisão**: `review-code-ph3a` (OWASP/LGPD/ISO) + `sonarqube` (bugs, smells, duplicação).
- **Tarefas** (`.claude/rules/tasks.md`): bug achado no caminho é **corrigido na hora**, em commit próprio, mesmo fora do escopo — nunca deixar passar em silêncio, e nunca empilhar em `tasks/` o que dá para resolver agora. Decisão do dono vira pergunta direta na sessão. `bugs.md`/`backlog.md` só no modo autônomo ou quando o dono escolheu adiar.

### 6. LGPD / dado sensível

- Áudio/transcrição/perfil/dado pessoal: storage **privado**, URLs assinadas, retenção definida e limitada.
- Endpoints de direitos do titular: apagar tudo do usuário e exportar os dados do usuário.
- Sem `DROP` sem aprovação explícita. Validar que o controle de acesso por linha não pode ser burlado (testar tentativa de bypass).

## Ferramentas (skills) e quando usar cada uma

| Skill | Quando usar |
|-------|-------------|
| `tdd` | Criar testes no fluxo red-green-refactor (feature nova, bug, refactor) |
| `quality-check` | Rodar o quality gate e reprovar regressão (antes de deploy / no after_implement) |
| `quality-gate` | **Instalar/configurar** o gate com ratchet num projeto |
| `review-code-ph3a` | Auditar código contra OWASP/LGPD/ISO antes do merge |
| `sca-guard` | SCA de dependências, secret scanning, SBOM (cobre o que o review próprio não vê) |
| `arch-guard` | Travar fronteiras de arquitetura, detectar ciclos de import |
| `resilience-guard` | Verificar/instalar timeout, retry, circuit breaker, health check em integração externa |
| `observability-guard` | Logging estruturado, correlation ID, trilha de auditoria (LGPD) |
| `memory-guard` | Detectar memory leak, cache sem TTL |
| `io-budget` | Contar queries SQL + HTTP por request; detectar N+1 e regressão de I/O |
| `property-race-guard` | Property-based testing focado em race condition em código async |
| `ci-pipeline` | Gerar pipeline de CI (testes + quality gate + Sonar) como gate de merge |
| `ph3a-loop` | Orquestrar o ciclo de padronização → qualidade → segurança → deploy |
| `sonarqube` | Análise estilo SonarQube (bugs, smells, hotspots, duplicação) |
| `deploy` | Release/deploy dos serviços do projeto |

## Metas de SLA (defaults herdados — **ajustáveis / calibrar**)

Defaults de craft, **não** verdade medida — substituir pelos números reais do canon/SRE:

| Ativo | Uptime | Resposta |
|-------|-------:|---------:|
| Landing / página crítica | 99,5% | < 2s |
| Wizard / fluxo de captura | 99,5% | < 3s |
| API do agente de IA | 99,0% | < 30s |

Lighthouse ≥ 90 (frontend) também é default a calibrar.

## Fontes no cérebro

- **Canon**: `gemeo/00-CANON/canon.yaml` — `produto.{repos,implementado,em_construcao,testes,leitura}`, `metas`.
- **Produto**: `gemeo/07-PRODUTO/{STATUS,PRD,ARCHITECTURE,ROADMAP}.md` + `api/`, `database/`, `features/`, `integrations/`. **STATUS é o estado real do código** (via `/atualizar-produto`).
- **Repo**: `CLAUDE.md` + `.claude/rules/` (convenções), migrations (schema).

## O que NÃO fazer

- Deployar sem aprovação de QA; autocertificar o próprio código.
- Criar tabela com dado pessoal sem controle de acesso por linha na mesma migration; API sem validar ownership.
- Converter um fluxo assíncrono de 202/tempo real para síncrono bloqueante sem motivo.
- Decrementar créditos/saldo com `UPDATE` manual (usar procedimento transacional atômico).
- Reset destrutivo de banco ou `DROP` em produção.
- Tratar um único produto/workstream como se fosse a plataforma inteira.
- Inventar uptime, cobertura ou contagem de testes — vir do canon/STATUS ou declarar a lacuna.
