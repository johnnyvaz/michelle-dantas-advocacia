---
name: analisar-negocio
description: Roda uma rodada autônoma de análise do negócio - 5 analistas (financeiro, crescimento, clientes, operações, pessoas) varrem o Gêmeo Digital em paralelo e devolvem propostas de melhoria fundamentadas no canon com mapa de adesão, persistidas em gemeo/PROPOSTAS/. Usa quando o usuário pedir para analisar o negócio, propor melhorias, rodar os analistas, ou em rotina agendada. Triggers - analisar negocio, propostas de melhoria, o que melhorar, rodada de analise.
allowed-tools: Read, Write, Bash, Grep, Glob, Task, Agent
gates: [canon-ancorado, conta-visivel, aprovacao-humana]
---

# analisar-negocio — rodada de conselheiros autônomos

Despacha analistas em contexto isolado e consolida **propostas de melhoria** num
backlog revisável. **Regra de ferro: propor, nunca executar** — quem decide é o dono.

> **Isto é skill, não subagente — de propósito.** Só o **main loop** dispara subagentes;
> um subagente não dispara outro. Transformar esta skill num agente mataria o fan-out do
> passo 3. `Task`/`Agent` estão em `allowed-tools` por isso (o nome da ferramenta de
> despacho variou entre versões do Claude Code; as duas ficam declaradas).

## Passos

1. **Pré-cheque**:
   ```bash
   python3 scripts/completude.py --json     # nível do corpus
   python3 scripts/propostas.py indexar     # INDEX atualizado p/ dedup
   ```
   Corpus ☆ → não rode a rodada: reporte que o nível limita a análise e liste o que
   o `/montar-gemeo` destravaria. Corpus ★ → rode só as dimensões com dado.
2. **Identifique a rodada**: `R###` = próximo número (grep `gerada_por` em PROPOSTAS/)
   e o `canon_sha` atual (`git rev-parse --short HEAD`).
2b. **Gate de orçamento — antes de disparar, não depois** (gate `aprovacao-humana`):
   ```bash
   python3 scripts/custo.py checar --origem analisar-negocio --agente analista \
     --n <nº de lentes> --modo interativo
   ```
   Exit 3 = a rodada estoura o teto do mês. Mostre a conta que o script imprimiu e
   pergunte ao dono se reduz as lentes; **não dispare por conta própria**. Em execução
   headless/autônoma, registre em `tasks/human.md` e pare. Exit 0 → siga.
3. **Despache EM PARALELO** (via `Task`/`Agent`) o agente `analista` **uma vez por
   lente**, na mesma mensagem (default: todas as lentes com dado) —
   `financeiro`, `crescimento`,
   `clientes`, `operacoes`, `pessoas`. É **um** agente invocado 5×, não cinco
   agentes: as lentes são a mesma função em domínios diferentes.
   No despacho de cada um, passe: **a lente**, a rodada `R###`, o `canon_sha` e o
   nível de completude daquela lente.
4. **Consolide cada proposta devolvida**:
   a. Salve a candidata num arquivo temporário e rode
      `python3 scripts/propostas.py dedup --candidata <tmp>` —
      duplicada → descarte (registre no resumo); rejeitada sem fato novo → descarte.
   b. Aprovada no dedup → grave como `gemeo/PROPOSTAS/P####-slug.md` (id do dedup),
      `status: nova`.
   c. Verifique citações: `python3 scripts/check_citations.py --resposta <arquivo>` —
      número órfão → devolva ao analista UMA vez para corrigir; persistir só limpo.
4b. **Registre o custo da rodada** (o que não é medido não é governado):
   ```bash
   python3 scripts/custo.py registrar --agente analista --origem analisar-negocio \
     --rodada R### --unidades <nº de lentes> --desconhecido
   ```
   Troque `--desconhecido` por `--claude-json <arquivo>` quando a rodada tiver saída
   JSON do `claude -p`, ou por `--usd X --fonte manual` quando você souber o valor.
4c. **Grave o manifesto da rodada** (qual lente rendeu, qual só custou tokens), um
   `--worker` por lente, com as contagens do passo 4:
   ```bash
   python3 scripts/rodada.py gravar --rodada R### --origem analisar-negocio \
     --canon-sha <sha> --completude "<nível>" --inicio <ISO do passo 3> \
     --worker "lente=financeiro,candidatas=N,duplicadas=N,citacao_orfa=N,persistidas=N" ...
   ```
   Tokens e duração (`tokens_entrada=`, `tokens_saida=`, `duracao_s=`, `modelo=`) só
   entram se o despacho os reportou. Sem isso, ficam `null`, nunca estimados. O exportador
   OTel é opt-in e decisão do dono (ver `/otel-guard`).
5. `python3 scripts/propostas.py indexar` e apresente o **resumo priorizado**:
   tabela id · título · dimensão · impacto (resumo da conta) · esforço · adesão
   prevista — ordenada por impacto×esforço. Inclua o que foi descartado e por quê.

## Ciclo de vida (para o usuário)
```bash
python3 scripts/propostas.py status P0007 em_avaliacao
python3 scripts/propostas.py status P0007 aceita --decisao D0012   # exige BDR
python3 scripts/propostas.py status P0007 rejeitada --decisao D0013
```
Proposta aceita → registre o BDR em `gemeo/DECISOES/` (a previsão de adesão da
proposta vira a coluna "Previsto pelo perfil?" do BDR — é o que calibra os perfis).

## Regras
- Nenhuma proposta sem mapa de adesão (decisor sem perfil → declarado de fora).
- Rodada agendada/headless: persiste as propostas e o resumo em branch/PR; não
  marca status — revisão é humana.
- Duas rodadas seguidas sem mudança no canon → a 2ª deve vir vazia (dedup); se não
  vier, é sinal de proposta rasa — aperte o critério.
