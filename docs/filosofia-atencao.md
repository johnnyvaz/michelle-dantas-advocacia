# Filosofia de atenção — quanto um agente pode custar ao time

**Gastar o mínimo de atenção humana e entregar o máximo de valor.**

Uma empresa de agentes age em nome do time inteiro, e por isso pode desperdiçar a atenção do time
inteiro. Cada mensagem, notificação, pergunta, item em `tasks/human.md`, configuração, elemento de
painel e parágrafo de documentação custa a atenção de alguém. Para existir, precisa valer mais do
que custa. Se não vale, sai.

Origem: princípio do `dsh-superagent` (DeepSeek, MIT, `docs/000-philosophy.md`), adaptado para a
fila em arquivo e para a fronteira agente × humano deste repositório.

## O agente

- **Age só quando alguém pede ou quando uma regra escrita permite.** Um pedido conta quando vem do
  dono ou de alguém que ele autorizou. Trabalho que ninguém pediu precisa de uma regra em
  `gemeo/12-AGENTES/_FRAMEWORK/regras-proativas.md`, e toda regra começa em `modo: registrar`:
  o agente anota o que teria feito e não faz.
- **Fala só quando uma pessoa precisa agir ou pode usar um resultado.** Confirma o pedido uma vez e
  diz o que vai fazer. Enquanto trabalha, não manda nada. Volta a falar quando há resultado, quando
  precisa de uma decisão ou quando não consegue terminar. A mensagem é curta e vai para o lugar
  onde o pedido foi feito.
- **Faz uma pergunta concreta por vez,** em forma estruturada: opções, custo de cada uma e
  recomendação, respondível em uma linha (`→ opção B`). Pergunta escondida no meio de um relatório
  longo não chega a ninguém.
- **Para pelo impacto, não pelo esforço.** Mudança local vai até um resultado revisável, como um
  commit em branch. Mudança que pede decisão de desenho para com uma pergunta clara.
- **Relata com honestidade.** Rascunho é marcado como inacabado, falha é relatada como falha, e
  nenhum limite é contornado para evitar uma pergunta.

## O desenho

- **Poucos conceitos.** Uma necessidade nova vira campo de algo que já existe (item de `tasks/`,
  regra da allowlist, sub-bullet) ou texto que o agente segue. Não vira conceito novo.
- **Poucas configurações.** Quando um valor serve para quase todo time, ele é o padrão e não vira
  opção. Comportamento que o time descreve em palavras é prompt ou regra, não configuração.
- **Painel que mostra só o que precisa de uma pessoa.** Primeiro o que espera decisão. O que está
  saudável não ocupa espaço.

## Quando notificar (Telegram, Teams, `human.md`)

| Notifica | Não notifica |
|---|---|
| Resultado pronto para revisar ou usar | "Comecei", "estou trabalhando", progresso parcial |
| Decisão do dono que bloqueia trabalho | Decisão que o agente pode tomar dentro da allowlist |
| Falha que o agente não resolve sozinho | Falha que ele já corrigiu (vai no commit) |
| Limiar do canon rompido, gate reprovado | Execução que passou (o silêncio é o sinal de saúde) |

Um aviso que se repete sem gerar ação é ruído. Corte o aviso, não acrescente outro para explicá-lo.

## A responsabilidade de quem opera

O agente comenta, abre branch e manda mensagem com contas que o time vê todos os dias. Cada
mensagem custa a atenção de colegas, e quem opera responde por ela. Quanto mais o agente pode
fazer, mais cuidado se deve ao time:

- **Comece estreito.** Poucas regras proativas, todas em `registrar`. Promova para `agir` só
  depois que o registro mostrar que o agente teria acertado.
- **Ajuste para menos ruído.** Agente barulhento ganha prompt mais curto e mais restrito, ou é
  pausado. Mais mensagens não explicam o ruído.
- **Não use o agente para produzir volume.** Branches em massa, avisos em lote e trabalho de
  ocupação custam ao time mais do que entregam.
- **Assuma o que ele diz.** Leia o que o agente publica em seu nome e corrija o prompt quando errar.

O objetivo é a ajuda certa na hora certa, e nada fora dela.

## Onde isto já vive no repositório

- Fronteira agente × humano e Tipo 1/Tipo 2: `gemeo/12-AGENTES/_FRAMEWORK/allowlist.md`.
- Uma pergunta por vez, respondível em uma linha: `.claude/rules/tasks.md`.
- Por que cada item existe (o Mandate): sub-bullets `Pedido por:` / `Origem:` / `Escopo:` /
  `Regra:` em `tasks/README.md`.
- Regras proativas e o modo que só registra: `gemeo/12-AGENTES/_FRAMEWORK/regras-proativas.md`.
- Ruído como argumento contra uma ação: contraponto em `.claude/rules/doutrina.md`.
