# Papéis operacionais — governança de execução

> Modelo **genérico** dos papéis de execução de uma empresa de agentes. O runtime é o
> **Claude Code nativo** (sem runtime externo). Estes papéis se mapeiam aos agentes de área e à
> orquestração já existentes.
>
> Substitua `{{EMPRESA}}` e `{{APROVADOR}}` ao instanciar (o `init.sh` faz isso).

## Os três papéis e seus equivalentes nativos

| Papel | Função | Equivalente nativo neste repo | Orçamento de referência |
|---|---|---|---|
| **Diretor / CEO** | Orquestra objetivos, quebra em tarefas, delega, consolida | skill [`orquestrador-empresa`](../../../.claude/skills/orquestrador-empresa/) | baixo (só roteia) |
| **Engenheiro** | Implementa features, corrige bugs, escreve testes | área [`desenvolvimento/`](../desenvolvimento/) + agente `.claude/agents/agente-desenvolvimento.md` | alto (escreve código) |
| **Pesquisador / Assistente** | Pesquisa técnica, análise de requisitos, documentação | área [`operacoes/`](../operacoes/) ou um sub-agente de pesquisa | baixo |

## Regras de governança (todos os papéis)

Herdadas do [`allowlist.md`](./allowlist.md) e da skill [`protocolo-aprovacao`](../../../.claude/skills/protocolo-aprovacao/):

- **Aprovação humana obrigatória** (`{{APROVADOR}}`) para toda ação com **efeito externo, custo,
  risco técnico ou impacto em produção**: abrir PR, deploy, mudança arquitetural, atualizar
  dependências, alterar infraestrutura, gastar, publicar/enviar a cliente. Toda solicitação é
  centralizada na **fila humana** [`tasks/human.md`](../../../tasks/human.md) — o agente registra ali
  e **para**; a aprovação destrava mas não auto-executa.
- **Git seguro** ([`fluxo-git-ph3a`](../../../.claude/skills/fluxo-git-ph3a/)): nunca push/merge na
  branch principal; nunca `--force`, `reset --hard`, `branch -D`. Sempre branch de trabalho + PR.
- **Orçamento por agente é teto** — ao atingir o limite, o agente para em ponto seguro e registra o
  pendente (ver [`SCHEDULING.md`](./SCHEDULING.md), seção "fronteira honesta").
- **Nunca inventar dado** — sem contexto no canon, declara a lacuna e onde o dado deveria estar.

## Restrições por papel (`forbidden`)

**Diretor/Orquestrador** — nunca executa código diretamente (delega); nunca contrata/desativa
agentes, faz push/merge ou altera infraestrutura sem aprovação.

**Engenheiro** — nunca push/merge na principal; nunca `--force`/`reset --hard`/`branch -D`; nunca
abre PR sem aprovação; nunca altera fora do repositório do ticket; nunca toca infraestrutura.

**Pesquisador** — não executa código nem mudanças de infra/operacionais: prepara o contexto
(requisitos, exemplos, links) e roteia ao papel responsável via tarefa.

## Áreas de marca e canais — quem faz, quem confere, quem publica

Cinco áreas trabalham em cadeia sobre `gemeo/14-MARCA/` e `gemeo/06-MARKETING/redes/`. A separação é a
garantia: quem faz não confere, e **nenhuma delas publica**.

| Área | Papel na cadeia | `forbidden` |
|---|---|---|
| [`ideias/`](../ideias/) | gera a pauta (acervo × sinais da web) | escrever a peça final; publicar |
| [`estudio/`](../estudio/) | encena conteúdo pronto (kit de gravação) | escrever conteúdo novo; gravar, editar, publicar |
| [`social/`](../social/) | distribui: calendário, adaptação por rede, pacote, comunidade | **publicar, agendar de fato, responder em público** (Tipo 1 → `tasks/human.md`); gerar pauta própria |
| [`marca/`](../marca/) | audita peça/tela contra a marca | criar ou corrigir peça; editar `14-MARCA/` |
| [`analytics/`](../analytics/) | mede e recomenda | alterar campanha, gastar, publicar |

Animação com runtime próprio fica fora do molde: depende de ferramenta e máquina específicas.
