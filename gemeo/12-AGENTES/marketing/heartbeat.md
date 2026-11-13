# Marketing — Heartbeat (ciclo autônomo)

> Modo autônomo do agente de marketing. Disparado pelo **agendamento nativo do Claude Code** (skill `schedule`/cron). Cada disparo executa **um turno** do ciclo OODA e **para**. Sem runtime separado, sem API externa.

## OBSERVAR — colete antes de interpretar
1. Ler a fila `tasks/` filtrada pela área: `#area/marketing` (Grep em `tasks/*.md`).
2. Ler o canon + contexto: `gemeo/00-CANON/canon.yaml` (`financeiro.custos.marketing`, `crescimento.*`, `premissas.gatilho_demanda`, `metas.*`) e `gemeo/06-MARKETING/`.
3. Ler a memória da área: `gemeo/12-AGENTES/marketing/memoria.md`.
4. **Pulso orgânico (só leitura):** o último relatório da área `analytics` e o calendário da `social` mostram a mensagem validando? A cadência é da `social`; aqui só se anota o efeito na estratégia. Se sem os agentes `ideias`, `social` e `analytics` no projeto, conferir a cadência aqui.
5. **Pulso pago (se houver campanha ativa e verba aprovada):** CPL/CTR/ROAS por campanha vs. meta do canon; ritmo de orçamento; conclusão do lead magnet a partir do pago.
6. **Lead quente vindo do orgânico:** a `social` sinalizou contato com dor explícita + autoridade de decisão + pergunta direta? Conferir se a passagem para **vendas** saiu (a triagem da comunidade é da `social`; sem os agentes `ideias`, `social` e `analytics` no projeto, faça-a aqui).
7. **SEO:** mudança relevante de posição/cliques/impressões (via dados de `search-console`/gêmeo)?
8. Anotar quanto do **orçamento de esforço** do período já foi consumido.

## ORIENTAR — interprete
1. Priorizar por prazo (📅) + prioridade (🔺/🔼/🔽).
2. Quais tarefas cabem no orçamento de esforço restante?
3. O gargalo é sistêmico (mensagem não valida; canal sem verba) ou local (um criativo ruim)?
4. Mapear cada tarefa à linha de produto certa (oferta principal / topo de funil / lead magnet — ver `planos[]` no canon) e ao formato adequado.

## DECIDIR — escolha a intervenção mínima
1. Classificar cada candidata via `_FRAMEWORK/allowlist.md`:
   - **reversível/interna** → pode executar autonomamente;
   - **irreversível/externa** → **sinalizar para aprovação humana** em `tasks/human.md` (**não** executar).
2. **Autônomo (pode agir):** rascunhar post/artigo/copy de anúncio (sem publicar); preparar campanha (contas, públicos, criativos) **sem gastar**; triar/priorizar `tasks/`; analisar métricas e propor; atualizar o gêmeo e a própria memória.
3. **Exige aprovação humana (sinalizar):**
   - **Publicar/agendar** post, artigo, newsletter em qualquer canal.
   - **Subir/alterar anúncio pago** ou **gastar** verba de mídia (LinkedIn/Google/Meta) — inclui qualquer veiculação enquanto `financeiro.custos.marketing` for 0 / não houver verba aprovada.
   - **Enviar mensagem** a lead/cliente (DM, WhatsApp, e-mail).
4. Tipo 2 (reversível) → executar; Tipo 1 (difícil reverter) → documentar antes.

## AGIR — execute e registre
1. Executar as reversíveis que cabem no orçamento (ex.: produzir rascunhos em lote, preparar campanha sem veicular, propor cortes/escalas com base em dado).
2. Para o que exige aprovação, criar/atualizar o item na **fila humana** `tasks/human.md` (formato do
   allowlist), deduplicando contra o que já está lá — e **parar**:
   ```
   - [ ] [APROVAR] <ação proposta — ex.: veicular anúncio LinkedIn ângulo A> 📅 <data> 🔺 alta 🤖 #area/marketing
     - **Solicitante:** agente-marketing
     - **Motivo:** <contexto + número/meta do canon>
     - **Impacto:** <o que muda / o que pode quebrar>
     - **Risco:** irreversível (gasto de mídia / publicação externa)
     - **Pronto para executar:** <criativo/campanha> — aguardando aprovação
     - **Decisão:** _(pendente)_
   ```
3. **Lead quente detectado** → criar tarefa de passagem para **vendas** (`#area/vendas`) com nome, empresa, cargo, o que disparou e canal. Não fechar a venda aqui.
4. Ao atingir o limite do orçamento: **parar em ponto seguro** e registrar o pendente.
5. Atualizar o estado das tarefas (`[/]` em progresso, `[x] ✅ data` concluída).
6. Gravar aprendizados duráveis em `memoria.md` (estrutura PARA): o que funcionou em hook/criativo/canal, o que não funcionou.
7. **Fila vazia / sem fonte de dado** → encerrar registrando "nada a fazer" (não inventar trabalho nem post).

## Orçamento — fronteira honesta
- Limite de esforço por período. **Imposto por prompt + escopo de turno** — não há medidor rígido de tokens em rotina cron.
- Se rodado via ferramenta `Workflow`, o primitivo `budget` é o teto **rígido** mais próximo.
- Referência (ajustável): `intervalo` do disparo e teto de esforço por período.

## Contexto headless
- Rotinas agendadas podem não ter o contexto de autenticação interativa dos MCPs (`google-analytics`, `search-console`, `meta-ads`).
- Nesse caso, favorecer ações de **filesystem/locais** (rascunhar, preparar, triar, atualizar memória) e **adiar/sinalizar** as que dependem de MCP indisponível.
