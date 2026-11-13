# Workflows Operacionais — Fluxos recorrentes

> **Template** — preenchido via /montar-gemeo. Deriva do canon: `produto.{implementado,em_construcao}`, `planos[].limites`, `snapshot.uso_produto.*`. Complementa `processos-chave.md`.
> **Citação parseável**: todo número preenchido usa o marcador `R$ X [canon: path.do.campo]` ou `N [calc: metrica]` — o CI compara com o canon e acusa drift (specs/001-melhorias-gemeo/contracts/formatos-arquivos.md).

**Data de referência**: `AAAA-MM-DD` (`_meta.data_referencia`)
**Papel**: os fluxos operacionais que se repetem — para cada um, o **gatilho** que o dispara, os **passos**, e o nível de **automação atual vs. possível**. É o detalhamento executável da cadeia de valor de `processos-chave.md`.

> Como preencher cada workflow:
> - **Gatilho**: o evento que inicia o fluxo (ação do cliente, webhook, job agendado, fechamento de período).
> - **Passos**: numerados, na ordem real de execução. Cite o sistema responsável quando houver.
> - **Automação**: marque cada passo como [auto] (já automatizado) ou [manual] (feito por pessoa hoje). O delta entre os dois é o roadmap operacional.
> Inclua um workflow por evento recorrente relevante. Os 4 abaixo são esqueletos comuns em SaaS — adapte, remova ou some conforme o negócio.

---

## WF-01 — Onboarding de cliente
**Gatilho**: [PREENCHER: ex. novo cliente pagante confirma plano no checkout].

1. [PREENCHER: criar conta/organização no sistema] — [auto/manual]
2. [PREENCHER: provisionar limites conforme plano (`planos[].limites`)] — [auto/manual]
3. [PREENCHER: enviar boas-vindas + credenciais de acesso] — [auto/manual]
4. [PREENCHER: agendar touchpoint de CS em D+[N]] — [auto/manual]
5. [PREENCHER: registrar evento no pipeline de analytics] — [auto/manual]

---

## WF-02 — Processamento/entrega em lote
**Gatilho**: [PREENCHER: ex. upload de arquivo ou chamada de API de processamento em massa].

1. [PREENCHER: validar cada item da entrada] — [auto/manual]
2. [PREENCHER: gerar o artefato do core para cada item] — [auto/manual]
3. [PREENCHER: empacotar/disponibilizar o resultado] — [auto/manual]
4. [PREENCHER: notificar o usuário quando pronto] — [auto/manual]
5. [PREENCHER: decrementar quota do plano (`planos[].limites`)] — [auto/manual]

---

## WF-03 — Integração com sistema parceiro
**Gatilho**: [PREENCHER: webhook do parceiro de integração ou polling configurado pelo cliente].

1. [PREENCHER: receber evento de criação/atualização do parceiro] — [auto/manual]
2. [PREENCHER: criar/atualizar o registro correspondente no produto] — [auto/manual]
3. [PREENCHER: retornar identificadores/URLs ao parceiro] — [auto/manual]
4. [PREENCHER: registrar log de sincronização (timestamp, status, erros)] — [auto/manual]
5. [PREENCHER: em falha, retry com backoff; alertar CS se persistir] — [auto/manual]

---

## WF-04 — Job agendado / alerta recorrente
**Gatilho**: [PREENCHER: ex. job diário (cron) às HH:MM verificando condição X].

1. [PREENCHER: consultar registros que atendem a condição de alerta] — [auto/manual]
2. [PREENCHER: aplicar regra de negócio aos itens encontrados] — [auto/manual]
3. [PREENCHER: notificar o responsável (push/e-mail)] — [auto/manual]
4. [PREENCHER: registrar evento no log de rastreabilidade] — [auto/manual]
5. [PREENCHER: refletir o estado no painel do cliente] — [auto/manual]

---

## Mapa de automação (resumo)
| Workflow | Automação atual | Automação possível | Bloqueio |
|----------|-----------------|--------------------|----------|
| WF-01 | [PREENCHER] | [PREENCHER] | [PREENCHER: o que falta no produto — `produto.em_construcao`] |
| WF-0n | … | … | … |
