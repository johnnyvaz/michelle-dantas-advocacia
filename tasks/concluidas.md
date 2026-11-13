# Concluídas — Site Michelle Dantas Advocacia

Arquivo **histórico**: tudo que foi concluído sai de `backlog.md`, `features.md` e `bugs.md` e vem
para cá com o contexto inteiro. Aqueles arquivos respondem "o que falta"; este responde "o que já
foi feito, quando e por quê".

- **Append-only**, mais recente no topo
- Nada é retomado daqui — se voltar a ser trabalho, entra como tarefa nova no arquivo apropriado
- Formato e regras em [README.md](./README.md)

---

<!--
Formato de cada entrada — o cabeçalho diz de onde veio e quando fechou (indentado de propósito,
ver a nota no fim deste comentário):

    ## backlog.md › Título da tarefa ✅ 2026-01-15

Parágrafo curto com o que foi feito e por quê. Se houve medição, o número medido.

  * Item específico — ✅ 2026-01-15, 🔺 alta, 🤖
    Detalhe do que mudou, com arquivo:linha quando ajudar quem for ler daqui a três meses.

Entrada escrita por máquina — o rastro de `git log` que scripts/registrar-concluidas.py deixa —
usa `origem: commits` e NÃO usa checkbox:

    ## commits › fix: nova chave openai ✅ 2026-08-31

Ela não substitui o relato da entrega: trabalho fechado continua ganhando entrada própria acima.

(no arquivo real os itens usam `- [x]`; aqui não, porque scripts/prioridade.py varre tasks/*.md
sem filtrar comentário HTML e adotaria este exemplo como tarefa de verdade. Os dois cabeçalhos
acima estão indentados pelo mesmo motivo, do outro lado do pipeline: até 2026-08-31 o
obsidian-panel.js não mascarava comentário HTML e publicava "Título da tarefa" como entrega
real em 19 dos 24 projetos. O parser foi corrigido; a indentação é o cinto de segurança para
quem copiar este arquivo para um projeto com gerador antigo)
-->
