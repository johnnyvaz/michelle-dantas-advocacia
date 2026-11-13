# Template — Heartbeat (ciclo autônomo, genérico)

> Modo autônomo de um agente de área. Disparado pelo **agendamento nativo do Claude Code** (skill `schedule`/cron). Cada disparo executa **um turno** do ciclo OODA e **para**. Sem runtime separado.

## OBSERVAR — colete antes de interpretar
1. Ler a fila `tasks/` filtrada pela tag da área: `#area/<area>` (Grep em `tasks/*.md`).
2. Ler a **fila humana** `tasks/human.md` (itens da área): o que já está **pendente** (não re-propor),
   o que foi **aprovado** (destravado) e o que foi **rejeitado** (não retentar).
3. Ler o canon + contexto da área: `gemeo/00-CANON/canon.yaml` e `gemeo/<NN>-<ÁREA>/`.
4. Ler a memória da área: `gemeo/12-AGENTES/<area>/memoria.md`.
5. Anotar quanto do **orçamento** do período já foi consumido.

## ORIENTAR — interprete
1. Priorizar por prazo (📅) + prioridade (🔺/🔼/🔽).
2. Quais tarefas cabem no orçamento restante?
3. Bloqueador é sistêmico ou local?

## DECIDIR — escolha a intervenção mínima
1. Para cada tarefa candidata, classificar via `_FRAMEWORK/allowlist.md`:
   - **reversível/interna** → pode executar autonomamente;
   - **irreversível/externa** → **sinalizar para aprovação humana** registrando em `tasks/human.md`
     (deduplicando contra o que já está lá); **não** executar.
2. Tipo 2 (reversível) → executar; Tipo 1 (difícil reverter) → documentar antes.
3. Item já **aprovado** em `human.md`: a ação está destravada, mas execução irreversível/externa é do
   dono/sessão interativa — em modo autônomo, só prossiga com a parte que tiver virado reversível/interna.
4. **Trabalho novo, que ninguém pediu**, só nasce de uma regra de `_FRAMEWORK/regras-proativas.md`.
   Regra em `registrar` → anote em `tasks/ideas.md` e **não** execute. Regra em `agir` → crie o item
   com `Regra: R-0xx` e siga os passos 1–3. Sem regra que case, não crie trabalho.

## AGIR — execute e registre
1. Executar as reversíveis que cabem no orçamento.
2. Para o que exige aprovação, criar/atualizar o item em `tasks/human.md` (formato do `allowlist.md`)
   e **parar** — não executar a ação irreversível/externa.
3. Ao atingir o limite do orçamento: **parar em ponto seguro** e registrar o que ficou pendente.
4. Atualizar o estado das tarefas em `tasks/` (`[/]` em progresso, `[x] ✅ data` concluída).
5. Gravar aprendizados duráveis em `memoria.md` (estrutura PARA).
6. **Fila vazia / sem fonte** → encerrar registrando "nada a fazer" (não inventar trabalho).

## Orçamento — fronteira honesta

O teto vive no canon (`agentes.orcamento_mensal_usd`, `agentes.teto_por_disparo_usd`) e o
consumo, em `scripts/custo.py`. O rigor do limite depende de **como** o heartbeat roda:

| Modo | Medição | Teto |
|---|---|---|
| `claude -p` local (cron/timer) | `--output-format json` devolve `total_cost_usd` | **rígido**: `--max-budget-usd` corta a execução |
| Sessão interativa | estimativa de segunda ordem, pela transcrição | consultivo |
| Rotina na nuvem (`/schedule`) | **não medível daqui** | política `agentes.politica_custo_desconhecido` |
| Ferramenta `Workflow` | por execução | o primitivo `budget` é o teto rígido |

O número é **estimativa do cliente**, não fatura; em plano de assinatura, preço-sombra.

No passo OBSERVAR, consulte o consumo; no ORIENTAR, cheque antes de gastar:

```bash
python3 scripts/custo.py saldo --area <area> --json
python3 scripts/custo.py checar --agente agente-<area> --n 1 --modo autonomo
```

`checar` com exit 3 (ou 1, quando não há teto declarado) significa **não dispare**:
sinalize em `tasks/human.md` e pare em ponto seguro. Ao terminar, registre o gasto com
`custo.py registrar` — execução não medível entra como `--desconhecido`, nunca como zero.

## Contexto headless
- Rotinas agendadas podem não ter o contexto de autenticação interativa de alguns MCPs.
- Nesse caso, favorecer ações de **filesystem/locais** e **adiar** (sinalizar) as que dependem de MCP indisponível.
