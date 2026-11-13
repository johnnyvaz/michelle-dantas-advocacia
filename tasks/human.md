# 🙋 Fila humana — Site Michelle Dantas Advocacia

O que **só você pode fazer ou decidir**: publicar, gastar, enviar a cliente, contratar, apagar
dados, rotacionar credencial, assinar. O agente registra aqui e **para**.

> **Este é o arquivo que você acompanha.** Ele entra na priorização com o peso mais alto do
> sistema — cada item aqui bloqueia trabalho do agente, então é urgente por natureza, não por
> idade. Aparece no `00 Foco de Hoje` do cofre.
>
> **Para responder, sem sair daqui:** escreva **como resolver** numa linha `**Solução:**` do
> bloco. Isso já destrava — o item sai de "aguardando você" e entra em `✍️ Respondidas — o
> agente executa`. Também vale a decisão na própria linha (`→ opção B`, `→ feito`,
> `→ não fazer`) ou o `INBOX.md` da pasta do projeto no cofre (`H-001 → opção B`).
>
> O motor de priorização **lê** este arquivo e **nunca escreve** nele — nenhum `[prio:]` aqui.

---

## Formato

`H-0xx` é identidade estável: é o que permite responder pelo INBOX e faz o link com âncora
funcionar. O estado fica na linha `**Estado:**`, que é o que o painel conta.

```markdown
### H-001 · Ação proposta, em uma frase
**Estado:** ⏳ pendente · 📅 2026-08-06 · 🔺 alta · #area/seguranca
**Solução:** _(pendente)_

Um parágrafo com o contexto e por que isto não pode ser feito pelo agente.

- **Só você pode fazer:** o passo que exige seu acesso ou sua decisão
- **Eu faço depois:** o que o agente executa quando estiver destravado
- **Risco de não fazer:** o que piora enquanto está parado
- **Rollback:** como desfazer, se for possível
```

| Estado | Significado |
|---|---|
| `⏳ pendente` | aguardando você — o agente não re-propõe e não executa |
| `✍️ respondido` | **derivado**: você preencheu `**Solução:**` — é trabalho do agente agora |
| `✅ aprovado AAAA-MM-DD` | destravado (o agente só executa se virou reversível/interno) |
| `❌ rejeitado AAAA-MM-DD — motivo` | não retentar; o motivo é o aprendizado |
| `🚀 executado AAAA-MM-DD` | aprovado e já feito |

**A linha `**Solução:**`** é onde você escreve o *como*: `**Decisão:**` e `**Resposta:**` valem
como sinônimos, e `_(pendente)_` conta como vazio. Quem fecha um item respondido é o agente,
com `🚀 executado` — não marque `✅ aprovado` ao responder, porque item decidido sai da fila e
a sua instrução não seria executada. O texto fica no arquivo como registro.

**Respondido não fica parado.** Decisão respondida é trabalho: na próxima sessão o agente
propõe o destino (hook `sessionstart_fila_humana.py`) — vira tarefa na fila certa (`backlog`/
`bugs`/`features` com `#area` e `#exec`, ou a fila humana da pessoa quando a próxima ação é
dela) e sai daqui, registrada em `concluidas.md`; ou é executada na hora, se for pequena e
reversível.

Decisão tomada em algo irreversível vira registro em `gemeo/DECISOES/`.

---

## 🚨 Risco ativo — quanto mais tempo, pior

_Nada aqui._

## ⏳ Aguardando decisão

_Nada aqui._

## ✅ Decididos

_Nada ainda._
