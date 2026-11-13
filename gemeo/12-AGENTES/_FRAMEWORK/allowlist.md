# Allowlist — o que um agente autônomo pode fazer sozinho (genérico)

> Governa o **modo autônomo** (heartbeat). Conservador por padrão: na dúvida, **pedir aprovação**. Aplica-se a todas as áreas.

## ✅ Autônomo (reversível / interno)
- Rascunhar copy, conteúdo, esboços (sem publicar).
- Criar, triar e priorizar tarefas em `tasks/`.
- Atualizar o gêmeo e a própria memória (`gemeo/12-AGENTES/<area>/memoria.md`).
- Escrever código **em branch** (nunca em `main`/produção).
- Analisar, pesquisar, propor — produzir artefatos internos.

## 🛑 Exige aprovação humana (irreversível / externo)
- Publicar ou agendar em canais (site, redes, blog).
- Enviar mensagem a lead/cliente (WhatsApp, e-mail, DM).
- Gastar dinheiro / subir ou alterar anúncio pago.
- `push` em `main`/produção; deploy.
- Apagar dados; rodar comandos destrutivos (ex.: reset de banco).
- **Executar pentest ativo (modo probe do `/pentest-dinamico`)** contra um alvo — Tipo 1, exige ROE (`seguranca/escopo-autorizado.yaml`) + aprovação. O heartbeat autônomo faz **só análise**; probe ativo só em sessão interativa.
- Qualquer ação com efeito externo irreversível não listada acima.

## Como sinalizar (em vez de executar)
Tudo que exige aprovação vai para **uma fila única**: [`tasks/human.md`](../../../tasks/human.md)
(a **fila humana**). Não espalhe pedidos de aprovação pelos arquivos de área. Antes de criar,
**deduplique**: se a mesma ação já está pendente em `human.md`, atualize-a em vez de duplicar.

```
- [ ] [APROVAR] <ação proposta> 📅 <data> 🔺 alta 🤖 #area/<area>
  - **Solicitante:** agente-<area>
  - **Motivo:** <contexto + número/meta do canon>
  - **Impacto:** <o que muda / o que pode quebrar>
  - **Risco:** irreversível / Tipo 1
  - **Rollback:** <como desfazer>
  - **Pronto para executar:** <artefato/branch/rascunho> — aguardando aprovação
  - **Decisão:** _(pendente)_
```

## Depois da decisão (ciclo de vida)
A aprovação **destrava**, mas **não auto-executa**: ação irreversível/externa é executada pelo dono
ou em **sessão interativa** (nunca pelo heartbeat sozinho). Estados que o agente reconhece em `human.md`:
- `[ ]` **pendente** → não re-propor, não executar, pular (já sinalizado).
- `[x] … ✅ aprovado por <…> 📅 <data>` → destravado; o agente só age se a ação virou
  reversível/interna, senão deixa para a sessão humana.
- `[-] … ❌ rejeitado por <…> 📅 <data>` → não retentar; registrar o aprendizado na memória da área.

## Decisão Tipo 1 / Tipo 2 (heurística)
- **Tipo 2** (reversível, barato de desfazer) → pode agir.
- **Tipo 1** (difícil/caro de reverter) → documentar + pedir aprovação.
