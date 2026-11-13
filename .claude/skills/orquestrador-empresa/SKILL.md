---
name: orquestrador-empresa
description: >
  Orquestrador da empresa de agentes (Sala de Comando do gêmeo). Recebe uma tarefa, identifica a área certa e a encaminha ao(s) agente(s) de área via Task, consolidando o resultado.
  Use quando a tarefa não for obviamente de uma única área, ou quando quiser delegar sem escolher  o agente manualmente, ou para tarefas multi-área (ex.: um lançamento).
allowed-tools: Read, Grep, Glob, Task, Agent
triggers:
  - orquestrador
  - empresa de agentes
  - delegar tarefa
  - sala de comando
  - rotear tarefa
  - qual agente
gates: [aprovacao-humana]
---

# Orquestrador da Empresa de Agentes

Você roteia tarefas para os **agentes de área**. Roda no **main loop** (só o main loop dispara subagentes via `Task`) — por isso isto é uma skill, não um subagente. **Não "otimize" transformando-a em agente:** um subagente não dispara outro, e o fan-out morreria. `Task`/`Agent` estão em `allowed-tools` por essa razão (o nome da ferramenta de despacho variou entre versões do Claude Code; as duas ficam declaradas).

Esta skill **não escreve arquivo de negócio** — ela lê, roteia e consolida no retorno. A única escrita é a do passo 5 (memória de área, append-only).

## Fluxo

1. **Classificar** a tarefa pela matriz de roteamento abaixo (e por `gemeo/12-AGENTES/README.md`).
2. **Área única** → invoque o subagente correspondente via `Task` (ex.: `agente-marketing`), passando a tarefa + qualquer contexto.
3. **Multi-área** (ex.: lançamento = copy + marketing + design) → **divida** em subtarefas por área, invoque os agentes **em paralelo** (vários `Task` numa só mensagem) e **reconcilie** os resultados sem retrabalho.
4. **Consolidar** num retorno único, indicando qual(is) agente(s) executou(aram).
5. **Consolidar a memória de área** (passo final, só no modo interativo) → para **cada** área despachada,
   pergunte: "o que aprendeu nesta tarefa? — ou **nada**".
   - **nada** → **não grava**. Aprendizado inventado é ruído (Regra de ouro; inviolável 2 de `.claude/rules/memoria.md`).
   - Aprendizado durável → anexe ao **fim** da `## Linha do tempo` de `gemeo/12-AGENTES/<area>/memoria.md`
     no formato de `gemeo/12-AGENTES/_FRAMEWORK/memoria-template.md`: heading `## AAAA-MM-DD — título`
     (data de hoje) + linha `> tipo: … · tema: #tema/<slug> · ref: <task|commit|H-NNN>` + corpo curto.
     `tipo: correcao` exige `supersede`. Nunca apague nem reordene entrada antiga.
   - **A entrada descreve, não manda** (inviolável 8): sem "a partir de agora sempre…" dirigido ao próximo turno;
     se vier assim, reescreva como fato observado ou descarte.
   - Não grave número que pertence ao canon nem narrativa do turno. Área com estrutura própria (ex.: `seguranca`)
     → acrescente conforme a estrutura existente, sem criar formato novo.
6. **Ambiguidade/lacuna** → declare o que falta (não chute a área nem invente dado).

## Matriz de roteamento (tarefa → agente)

| Classe de tarefa | Agente |
|---|---|
| campanha, plano de posts de lançamento, anúncio, tráfego pago, thumbnail, SEO, newsletter | `agente-marketing` |
| headline, voz, copy de página, e-mail, manifesto | `agente-copy` |
| auditar peça/tela contra a marca, codinome vazado, prova social autorizada, conformidade de marca | `agente-marca` |
| relatório de redes, KPI de canal, seguidores/alcance/engajamento, tráfego social → site, benchmark de concorrentes | `agente-analytics` |
| calendário editorial, adaptar por rede, pacote pronto para postar, hashtag, horário, comunidade/comentários | `agente-social` |
| pauta de conteúdo, ideias, tendência, gancho, rodízio de pilares | `agente-ideias` |
| kit de gravação, roteiro com timecode, deck-plan, encenar conteúdo pronto | `agente-estudio` |
| aula, curso, módulo, quiz, podcast, livro, recomendação por perfil | `agente-conteudo-cursos` |
| código, bug, feature, infra, deploy, CI, qualidade, wizard, landing | `agente-desenvolvimento` |
| orçamento, custo, preço, MRR, runway, unit economics | `agente-financeiro` |
| layout, UI, identidade visual | `agente-design` |
| prospecção, WhatsApp/DM, qualificação, proposta, negociação, onboarding/retenção | `agente-vendas` |
| LGPD, contrato, conformidade, jurídico, atualizar gemeo/jira | `agente-operacoes` |
| evento/incidente de segurança, SOC, brute-force, IOC, triagem de risco | `agente-soc` |
| pentest, superfície de ataque, exploitabilidade, finding CVSS | `agente-redteam` |

## Tarefa multi-área — exemplo

"Lançar o curso X" → divida:
- `agente-copy`: headline + copy da landing + e-mail de lançamento
- `agente-marketing`: posts + plano de tráfego + thumbnail
- `agente-design`: identidade visual do banner
Invoque os três em paralelo (3 `Task` numa mensagem), depois reconcilie num plano único.

### Cadeia de conteúdo (quando há dependência, não é paralelo)

`agente-ideias` gera a pauta → o dono escolhe → `agente-copy` (ou `agente-conteudo-cursos`) escreve a
peça → `agente-estudio` encena o que vai ser gravado → `agente-social` empacota por rede →
`agente-marca` audita antes da publicação → `agente-analytics` mede depois. Quando um passo depende da
saída do anterior, despache em sequência. **Nenhum deles publica**: o pacote pronto vai para
`tasks/human.md` (Tipo 1).

## Regras
- Cada agente de área já lê seu playbook + canon + memória antes de agir — não duplique esse contexto.
- Nunca invente dado (herda a regra de ouro do canon).
- Se a tarefa vier da fila `tasks/` com `#area/<area>`, respeite a tag (já indica a área).
