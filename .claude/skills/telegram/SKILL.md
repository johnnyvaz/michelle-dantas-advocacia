---
name: telegram
description: Instala e configura um canal Telegram num projeto PH3A — cria o bot no @BotFather, descobre o chat_id, semeia o segredo em .env.local e instala os scripts de envio. Dois sentidos - informação SAI (alerta de canon, reprovação do quality gate, briefing, fila priorizada, saída de qualquer comando) e decisão VOLTA (responder tasks/human.md pelo celular, gravando **Solução:** no item). Use quando o usuário pedir para ligar o Telegram, receber aviso no celular, ser notificado quando o gate reprovar, responder a fila humana fora do editor, ou instalar a ponte em outro repositório.
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
---

# Skill: canal Telegram do projeto

Liga um repositório a um chat do Telegram. Não é um agente no Telegram — é **transporte**, nos
dois sentidos, e a distinção é o que mantém o repositório como única fonte de verdade.

## O modelo, em uma frase

**A informação sai do repositório; a decisão volta para o arquivo.** Nada é decidido no meio.

| Sentido | Script | O que atravessa | Quem decide |
|---|---|---|---|
| repo → celular | `notificar.py` | saída de qualquer comando, arquivo, texto | o script que rodou, pelo código de saída |
| celular → repo | `ponte-telegram.py` | `**Solução:**` e `**Estado:**` em `tasks/human.md` | **o dono**, digitando |

Nenhum texto gravado no repositório por esta skill é gerado por modelo. `notificar.py` não
interpreta a saída que transporta, e `ponte-telegram.py` não propõe resposta — se propusesse,
o `human.md` deixaria de ser registro de decisão humana e viraria log de agente.

## Por que existe

Os scripts do projeto já produzem a informação certa: `alertas.py` avisa limiar rompido,
`quality-gate.js` reprova regressão, `prioridade.py` ordena a fila, `briefing_diff.py` conta o
que mudou. Todos escrevem no **terminal** — e terminal fechado não avisa ninguém.

Do outro lado, `tasks/human.md` já foi desenhado para ser operado por máquina (`H-0xx` estável,
`**Solução:**` destrava sem mover nada, `**Estado:**` com vocabulário fechado). Faltava só o
último metro em cada direção.

## O que a instalação cria

```
<projeto>/
├── scripts/
│   ├── _telegram.py         # transporte: token, entrega, fatiamento em 4096
│   ├── notificar.py         # repo → celular
│   └── ponte-telegram.py    # celular → repo  (só se houver tasks/human.md)
├── .env.local               # segredo, modo 600, no .gitignore
└── tasks/.ponte-telegram.json   # offset e âncoras da ponte, no .gitignore
```

`_telegram.py` existe separado porque os dois scripts precisam do **mesmo** carregamento de
segredo e do mesmo tratamento de erro. Duas cópias divergiriam, e a primeira consequência seria
uma delas mandar conteúdo para o chat errado.

## Passos da instalação

### 1. Rodar o instalador

```bash
bash .claude/skills/telegram/resources/instalar.sh <caminho-do-projeto>
```

É idempotente: atualiza os scripts e **não** toca em `.env.local` existente. Instala
`ponte-telegram.py` só quando encontra `tasks/human.md` **e** `scripts/prioridade.py` — sem os
dois ela seria um import quebrado esperando a primeira execução.

### 2. Criar o bot — passo do usuário, não seu

Você **não** cria o bot. Peça e espere:

1. No Telegram, falar com **@BotFather** → `/newbot` → escolher nome e username
2. Colar o token em `.env.local`, campo `TELEGRAM_BOT_TOKEN=`
3. **Abrir o bot recém-criado e mandar `/start`** — sem isso o passo 3 volta vazio

### 3. Descobrir o `chat_id`

```bash
python3 scripts/notificar.py --descobrir-chat
```

Imprime `TELEGRAM_CHAT_ID=<id>   # nome (tipo)` para cada conversa que já falou com o bot.
O usuário cola o valor em `.env.local`.

Se voltar vazio: ou o `/start` não foi mandado, ou há um `servir` rodando / um webhook ativo
consumindo os updates antes. `getUpdates` entrega cada update **uma vez só**.

### 4. Verificar

```bash
python3 scripts/notificar.py --testar          # valida token E chat, não manda relatório
python3 scripts/ponte-telegram.py testar       # + conta os pendentes, sem escrever no arquivo
```

`--testar` separa as duas falhas de propósito: token inválido e chat que não aceita mensagem
têm causas diferentes, e um erro só faria o usuário refazer o passo certo por tentativa.

### 5. Ligar os avisos que importam neste projeto

Ofereça, não imponha. Cada linha abaixo só faz sentido se o script existir no alvo:

| Aviso | Comando |
|---|---|
| Gate reprovou | `python3 scripts/notificar.py --rodar "node scripts/quality-gate.js" --titulo "Quality gate" --so-se-falhar` |
| Limiar do canon rompido | `python3 scripts/notificar.py --rodar "python3 scripts/alertas.py" --ok 0 --titulo "Canon"` |
| Fila do dono, de manhã | `python3 scripts/ponte-telegram.py empurrar` |
| Briefing do que mudou | `python3 scripts/briefing_diff.py \| python3 scripts/notificar.py --stdin --titulo "Briefing" --silencioso` |
| Build do site quebrou | `python3 scripts/notificar.py --rodar "npx astro build" --titulo "Build" --so-se-falhar` |

`--ok 0` no caso do `alertas.py` é o ponto todo: ele sai com **3** quando há alerta, e é isso
que faz a mensagem chegar. Quem decide se algo é alerta é o script, nunca o notificador.

Um aviso só entra se uma pessoa precisa agir ou pode usar o resultado: resultado pronto, decisão
pendente, falha ou limiar rompido. "Passou", "comecei" e progresso parcial não saem. O silêncio é
o sinal de saúde. Aviso que chega e não gera ação é ruído: desligue a linha em vez de explicá-lo
com outra mensagem. Critério: `docs/filosofia-atencao.md`.

Em cron (`crontab -e`) — `cd` primeiro, porque `.env.local` é lido da raiz do repositório:

```cron
0 8 * * 1-5  cd /caminho/do/projeto && python3 scripts/ponte-telegram.py empurrar
0 9 * * 1    cd /caminho/do/projeto && python3 scripts/notificar.py --rodar "python3 scripts/alertas.py" --ok 0 --titulo "Canon" --so-se-falhar
```

### 6. Manter o `servir` de pé (opcional)

Só é preciso para **responder** pelo Telegram; `notificar.py` e `empurrar` não dependem dele.

```bash
mkdir -p ~/.config/systemd/user
sed 's|__RAIZ__|/caminho/do/projeto|' \
  .claude/skills/telegram/resources/ponte-telegram.service \
  > ~/.config/systemd/user/ponte-telegram.service
systemctl --user daemon-reload && systemctl --user enable --now ponte-telegram
```

**Em WSL sem systemd** — o caso desta máquina — use `nohup python3 scripts/ponte-telegram.py
servir &` e diga ao usuário que isso não sobrevive ao fim da sessão.

## O que sai do repositório — decida antes de ligar

`tasks/human.md` carrega achado de segurança e caminho de arquivo. Nesta base, H-001 é uma
credencial válida exposta. O Telegram **não** é fim-a-fim em conversa comum, e a PH3A é
certificada ISO 27001 e 27701.

Por isso o padrão da ponte é **resumo**: só saem ID, título, área e os rótulos
`Só você pode fazer`, `Eu faço depois`, `Risco de não fazer`. `Local:` fica de fora — é caminho
de arquivo, e o valor dele para *decidir* é zero. `PONTE_CORPO_COMPLETO=1` manda o bloco
inteiro, e é escolha explícita de quem liga.

`notificar.py` **não** tem esse filtro: ele manda o que você mandar. Não encane saída que possa
conter segredo (`env`, `git log -p` de arquivo com credencial, dump de configuração).

Só `TELEGRAM_CHAT_ID` pode escrever no repositório. Qualquer outro chat é ignorado e registrado
no stderr — um bot do Telegram é endereçável por quem descobrir o username, e sem essa trava
qualquer pessoa responderia a fila do dono.

Ligar o canal num projeto onde ele ainda não existe é **fluxo de dado externo novo**. Se o
usuário não tiver decidido isso explicitamente, registre em `tasks/human.md` no formato do
`allowlist.md` e **pare** — não crie o bot.

## As garantias da ponte (não afrouxe sem teste)

- **Responder não mexe em `**Estado:**`.** `✍️ respondido` é *derivado* da presença da
  `**Solução:**` — está em `tasks/README.md`. Escrever os dois criaria duas fontes para o mesmo
  fato, e elas divergiriam na primeira edição manual.
- **Recusa em vez de sobrescrever**: item já respondido, item já decidido (`✅`/`❌`/`🚀`), ID
  inexistente, rejeição sem motivo. Sobrescrever decisão registrada é o pior erro possível aqui.
- **`SOLUCAO_RE`, `SOLUCAO_VAZIA_RE` e `human_decidido` são importados de `prioridade.py`**, não
  reescritos — mesma razão pela qual `migrar-solucao.py` importa. Uma segunda cópia da regra de
  "já respondido" acabaria reabrindo decisão fechada.
- **A ordem vem de `prioridade.py human --json`.** A ponte não recalcula prioridade.
- **O commit é só de `tasks/human.md`**, nunca `git add -a`: ela roda ao lado de trabalho em
  andamento, e varrer a árvore para dentro de um commit de decisão é como se perde mudança
  alheia. `PONTE_COMMIT=0` grava sem commitar.

## Modos de falha que já custaram tempo

| Sintoma | Causa |
|---|---|
| `--descobrir-chat` volta vazio com token válido | falta o `/start`, ou um `servir`/webhook já consumiu os updates |
| A ponte não responde nada no Telegram | `servir` não está rodando — `empurrar` só manda, não escuta |
| "chat não autorizado" no log | `TELEGRAM_CHAT_ID` é de outra conversa (grupo × privado têm ids diferentes; id de grupo é negativo) |
| Mensagem longa não chega | a Bot API corta em 4096; `envia_longo` fatia em borda de linha — não troque por corte em caractere, parte entidade HTML no meio |
| Cron não manda nada | faltou `cd` para a raiz: `.env.local` é lido dali |
| Emoji ou `<` quebram a mensagem | texto de fora **tem** que passar por `T.esc()` antes de entrar em HTML |

## Levar para outro projeto

`instalar.sh` é o único caminho — a cópia canônica dos scripts vive em `resources/`, e as cópias
em `<projeto>/scripts/` são instaladas. Ao corrigir um bug, corrija em `resources/` e reinstale
nos alvos; editar só a cópia instalada é como as versões divergem.

Um bot pode servir vários projetos, mas prefira **um bot por repositório**: o `chat_id` é a
única trava de autorização, e dois projetos no mesmo chat deixam `/aprovar 3` ambíguo.
