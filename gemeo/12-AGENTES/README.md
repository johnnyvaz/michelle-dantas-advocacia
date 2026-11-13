# 12-AGENTES — Empresa de Agentes (Sala de Comando)

> A camada de **execução** do Gêmeo Digital. Enquanto `00-CANON`…`11` são o **cérebro** (a verdade e o contexto do negócio), esta seção é a **empresa de agentes de IA** que lê esse cérebro e **executa tarefas** por área. O fundador chama um agente (modo interativo) ou os agentes acordam em ciclos (heartbeat autônomo — ver `_FRAMEWORK/heartbeat-template.md`).

## Como funciona

```
Fundador / fila tasks/
        │
        ▼
  Orquestrador (skill .claude/skills/orquestrador-empresa) ── roteia ──►  Agente de área
        │                                                                      │ antes de agir, lê:
        │ consolida                                                            │  1. seu playbook (aqui)
        ▼                                                                      │  2. o canon + contexto da área (00–11)
   resultado                                                                   │  3. sua memória (memoria.md)
                                                                               ▼
                                                                       usa as skills da área (ferramentas)
                                                                       registra o aprendizado na memória
```

- **Invocável**: cada área tem um subagente fino em `.claude/agents/agente-<area>.md` que aponta para o conteúdo durável aqui.
- **Conteúdo durável** (portável, vira produto): `persona.md` · `playbook.md` · `heartbeat.md` · `memoria.md` em cada pasta de área.
- **Regra de ouro** (herdada do canon): nenhum agente inventa dado — sem contexto, declara a lacuna e onde o dado deveria estar.

## Áreas (organograma)

| Área | Pasta | Possui | Profundidade |
|------|-------|--------|:---:|
| **Marketing** | `marketing/` | campanhas, anúncios/tráfego pago, SEO, thumbnails, newsletter | ★★★ a fundo |
| **Copy** | `copy/` | voz da marca, headlines, copy de página, e-mail, manifesto | ★★★ a fundo |
| **Marca** | `marca/` | auditoria de peça/tela contra `14-MARCA/` (só audita, não cria peça) | ★★ molde |
| **Analytics** | `analytics/` | métricas de canais, relatório de redes, benchmark, melhores horários medidos | ★★ molde |
| **Social** | `social/` | calendário editorial, adaptação por rede, pacote pronto para postar, comunidade (não publica) | ★★ molde |
| **Ideias** | `ideias/` | pauta de conteúdo: acervo do gêmeo × sinais da web | ★★ molde |
| **Estúdio** | `estudio/` | kit de gravação de conteúdo pronto: roteiro com timecode, deck-plan, artefatos | ★★ molde |
| **Conteúdo/Cursos** | `conteudo-cursos/` | aulas, cursos, módulos, quiz, podcast, livro, recomendação por perfil | ★★★ a fundo |
| **Desenvolvimento** | `desenvolvimento/` | código, bugs, features, infra, deploy, CI, qualidade | ★ scaffold |
| **Financeiro** | `financeiro/` | orçamento, custos, preço, MRR, runway, unit economics | ★ scaffold |
| **Design** | `design/` | UI, layout, identidade visual | ★ scaffold |
| **Vendas** | `vendas/` | prospecção, qualificação, proposta, onboarding de cliente | ★ scaffold |
| **Operações** | `operacoes/` | LGPD, contratos, conformidade, atualizar gemeo | ★ scaffold |
| **Segurança (SOC)** | `seguranca/` | triagem Bayesiana de eventos, incidentes, correlação, risco | ★★ lente do motor de priorização |

> **Orquestrador** = a skill `.claude/skills/orquestrador-empresa/`. É skill (não subagente) porque roteamento exige **fan-out** para os agentes de área via `Task`, e só o **main loop** dispara subagentes.

## Matriz de roteamento (tarefa → área)

| Classe de tarefa | Área |
|---|---|
| campanha, plano de posts de lançamento, anúncio, tráfego pago, thumbnail, SEO, newsletter | marketing |
| headline, voz, copy de página, e-mail, manifesto | copy |
| auditar peça/tela contra a marca, codinome vazado, prova social autorizada | marca |
| relatório de redes, KPI de canal, tráfego social → site, benchmark de concorrentes | analytics |
| calendário editorial, adaptar por rede, pacote pronto para postar, hashtag, comunidade | social |
| pauta de conteúdo, ideias, tendência, gancho | ideias |
| kit de gravação, roteiro com timecode, deck-plan de conteúdo pronto | estudio |
| aula, curso, módulo, quiz, podcast, livro, recomendação por perfil | conteudo-cursos |
| código, bug, feature, infra, deploy, CI, qualidade, wizard, landing | desenvolvimento |
| orçamento, custo, preço, MRR, runway, unit economics | financeiro |
| layout, UI, identidade visual | design |
| prospecção, WhatsApp/DM, qualificação, proposta, negociação, onboarding/retenção de cliente | vendas |
| LGPD, contrato, conformidade, jurídico, atualizar gemeo/jira | operacoes |
| evento/incidente de segurança, SOC, brute-force, IOC, triagem de risco | seguranca |
| tarefa multi-área (ex.: lançamento) | orquestrador divide e reconcilia |

**Cadeia de conteúdo.** `ideias` gera a pauta → `copy` (ou `conteudo-cursos`) escreve → `estudio`
encena o que vai ser gravado → `social` empacota por rede → `marca` audita → `analytics` mede. Nenhuma
dessas áreas publica: o pacote pronto vai para `tasks/human.md` (Tipo 1). Animação com runtime próprio
fica fora do molde.

## Fila de trabalho

A fila operacional é **única**, em `tasks/` (`backlog.md`/`bugs.md`/`features.md`/`ideas.md`), com **tag de área** `#area/<area>`. O gêmeo guarda **histórico/contexto** (ex.: `_projetos-historico/`); a fila viva é o `tasks/`.

## Framework × Instância

- `_FRAMEWORK/` = modelos genéricos reutilizáveis (a **semente do produto** — sem dados de empresa).
- pastas de área = a **instância** do negócio (persona/playbook/heartbeat preenchidos para `{{EMPRESA}}`;
  começam como esqueleto e são preenchidos com a craft real de cada negócio).

> Um exemplo de instância preenchida (apenas referência, fora do esqueleto) fica em
> `examples/instancia-geniaria/`.

## Runtime

Empresa de agentes **nativa do Claude Code** — sem runtime externo. O ciclo OODA, o orçamento por
agente e o allowlist são reaproveitados em `_FRAMEWORK/` (`heartbeat-template.md`, `allowlist.md`,
`papeis-operacionais.md`). Os papéis operacionais (orquestrador / engenheiro / pesquisa) mapeiam-se
às áreas e à skill `orquestrador-empresa`.
