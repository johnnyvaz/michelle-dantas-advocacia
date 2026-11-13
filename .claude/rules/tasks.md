---
paths:
  - "tasks/**"
  - "tasks-*/**"
---

# Regra: a fila de trabalho vive em `tasks/`

Valem ao criar, mover ou fechar qualquer item em `tasks/`. O **formato** está em
`tasks/README.md` (contrato lido por três programas); esta regra é o **comportamento**.

## Invioláveis

1. **Resolva agora; não acumule.** Bug ou débito encontrado no caminho é **corrigido na mesma
   sessão** (commit próprio, `fix(...)`), mesmo fora do escopo da tarefa — anotar para depois
   só aumenta a fila que o dono não volta para ver. Registrar em `bugs.md`/`backlog.md` é
   exceção, e só quando: (a) **não há humano presente** (heartbeat/modo autônomo), ou (b) o
   **dono decidiu adiar** quando perguntado. O registro leva `🤖`, o local (`arquivo:linha`)
   e o motivo do adiamento. Nunca em comentário no código, nunca só na conversa.
2. **Precisa do dono? Pergunte na hora.** Em sessão interativa, decisão que é do humano vira
   **pergunta direta** (`AskUserQuestion`), com as opções, o custo de cada uma e a
   recomendação — respondível em uma linha. `tasks/human.md` é para quando ninguém está
   presente para responder (modo autônomo) ou para registrar **ação Tipo 1** aprovada/pendente
   (doutrina, recusas 6 e 7); nesse caso, é o único arquivo que o responsável acompanha.
3. **Nunca bloquear em cima de um pedido.** Enquanto a resposta não vem, siga com o que não
   depende dela e diga explicitamente o que ficou parado.
4. **Nunca decidir o que é da pessoa**, mesmo com a resposta parecendo óbvia (tabela abaixo).
5. **Concluída sai do arquivo de trabalho.** O item **inteiro** (linha + sub-bullets) move para
   `concluidas.md` com `✅ AAAA-MM-DD` e a seção de origem. Nada de `- [x]` sobrevivendo em
   `backlog.md`, `bugs.md` ou `features.md`: quem abre esses arquivos quer o que falta.
   O bloco `## commits › …` do mesmo arquivo é **de máquina** (`scripts/registrar-concluidas.py`,
   rastro do `git log`): não editar por dentro, não acrescentar checkbox nele, e **não tratá-lo
   como o relato da entrega** — commit registrado não dispensa mover a tarefa fechada para cá.
6. **`[prio: N calc:prioridade]` nunca é escrito à mão** e `PRIORIDADE.md` nunca é editado —
   os dois são saída de `scripts/prioridade.py`. Estimar prioridade em prosa contradiz o motor.
   `spec.md` também é **gerado** (`scripts/importar-spec.py`, da spec ativa): trabalho de spec
   é fechado marcando `[X]` em `specs/<feature>/tasks.md`, nunca no espelho.
7. **Toda tarefa nova nasce com `#modelo/opus|sonnet|haiku`.** Ao criar item em `backlog.md`,
   `bugs.md` ou `features.md`, aponte o modelo preferencial seguindo `docs/escolha-de-modelo.md`
   (tabela de decisão em `tasks/README.md`). Ao **executar** um item, use o modelo da tag; se
   precisar subir de modelo, registre o motivo no `Contexto:`. É instrução de execução: não muda
   identidade nem prioridade, e nunca autoriza descer de modelo sem eval.
8. **Item `🤖` diz de onde veio.** Leva `Pedido por:` e `Escopo:` (formato em `tasks/README.md`,
   seção Mandate). Há dois casos, e só o segundo exige regra:
   - **Achado no caminho** de uma tarefa autorizada (o caso do inviolável 1): herda o `Pedido por:`
     do item que estava em execução e entra na fila normalmente. Bug real nunca vai para `ideas.md`.
   - **Trabalho iniciado do zero**, sem tarefa nem pedido (heartbeat procurando o que fazer): precisa
     de `Regra: R-0xx` em `modo: agir` (`gemeo/12-AGENTES/_FRAMEWORK/regras-proativas.md`). Sem
     regra, ou sem esse arquivo no projeto, não nasce na fila: vira registro em `ideas.md`.
9. **O cofre Obsidian é espelho de leitura.** Editar lá se perde no próximo sync. A exceção é
   o `INBOX.md`, reconciliado nas duas direções.

## O que depende de humano, portanto vai para `human.md`

| Situação | Exemplo |
|---|---|
| Decisão de produto ou de negócio | renomear indicador que o cliente já vê, definir preço, escolher entre transparência e conveniência |
| Credencial, segredo ou acesso | credencial de homologação, `.env.test`, escrita em banco de outro time, VPN |
| Ação fora do repositório | rotacionar chave vazada, provisionar pacote, pedir endpoint a outro time, alterar `role` no banco |
| Postura de segurança e conformidade | enfraquecer whitelist de IP, definir TTL de retenção, declarar exceção de confidencialidade |
| Mudança destrutiva ou irreversível | `DROP` em produção, recriar fila descartando mensagem, reescrever histórico do git |
| Aprovação de escopo | assumir trabalho grande não pedido, mudar contrato público da API, reescrever fluxo de auth |

Formato de cada pedido: **o que decidir ou fazer**, **por que está bloqueado sem isso**, **as
opções com o custo de cada uma** e **a recomendação** — escrito para ser respondido em uma linha
(`→ opção B`). Nunca deixar a pessoa reconstruir o contexto.

## `**Solução:**` — a resposta do dono no próprio bloco

O dono responde **dentro** do `human.md`, numa linha `**Solução:**` (ou `**Decisão:**` /
`**Resposta:**`) do bloco. Texto ali significa: **destravado, e é seu trabalho agora**.

1. **Leia no início do trabalho**, com a mesma precedência do `inbox.md` — é instrução direta
   do dono, e mais fresca que qualquer item de backlog. O painel e o Foco de Hoje as listam em
   `✍️ Respondidas — o agente executa`.
2. **Execute e registre**: `**Estado:** 🚀 executado AAAA-MM-DD` no bloco. **Nunca apague a
   Solução** — ela é o registro de quem decidiu o quê, e some do arquivo é como se a decisão
   nunca tivesse existido.
3. **Não basta, ou continua sendo Tipo 1?** Responda no próprio bloco (o que falta, ou por que
   a ação segue exigindo o humano) e devolva a `⏳ pendente`. Não decida pelo dono nem execute
   ação irreversível/externa por conta da Solução — o inviolável nº 4 continua valendo.
4. **Nunca escreva `**Solução:**` você mesmo.** O campo é do humano; a sua proposta vai nos
   sub-bullets do pedido (`Motivo`/`Impacto`/`Risco`/`Rollback`). Escrever ali seria o agente
   respondendo a si próprio e destravando o próprio pedido.

## `inbox.md` — o canal de volta

É o único arquivo que o cofre devolve ao repositório. **Leia no início do trabalho**: tem
precedência sobre o backlog. Execute, mova o item para o arquivo certo e **apague a linha** —
apagar é o que sinaliza "consumido" e limpa o Obsidian no sync seguinte. Decisão de item da fila
humana pode chegar por aqui (`H-011 → opção B`); transcreva para `human.md`, que é o registro
canônico.

## Armadilhas medidas

- **Identidade do item é só o texto.** Reescrever o título cria item novo para o motor e zera a
  idade acumulada — corrija o texto só quando ele estiver errado, não por estilo.
- **`📅` é data de registro, não prazo.** Prazo é `🎯`, e só existe quando há compromisso real.
  Sem `📅`, a idade vem do `git blame` da linha.
- **`#eis/q1..q4` fixa o quadrante Eisenhower e vence o cálculo.** É como a posição definida
  pelo responsável entra no sistema; não use para inflar a sua própria fila.
- **Formato que não casa com `tasks/README.md` não dá erro**: o item desaparece da contagem em
  silêncio. Padronize com `python3 scripts/migrar-tasks.py --apply`.
