---
name: briefing
description: Gera o briefing executivo de 1 página do Gêmeo Digital a partir do diff real do canon entre dois pontos no tempo - o que mudou, o que travou, 3 prioridades. Usa quando o usuário pedir briefing, resumo executivo do que mudou, daily brief, ou como passo final de rotinas agendadas. Triggers - briefing, o que mudou, resumo da semana.
gates: [canon-ancorado, conta-visivel, dado-datado]
---

# briefing — "Presidential Brief" do negócio

Narra o diff real do canon — nunca inventa. Máximo **1 página**.

## Passos

1. Colete o insumo (default: do último briefing salvo, ou HEAD):
   ```bash
   python3 scripts/briefing_diff.py --de <ref|HEAD> --json
   ```
2. Narre o JSON em 3 blocos (cada afirmação rastreável ao diff):

   **O que mudou** — campos com antes → depois e a variância narrada por driver
   (`variancia` do JSON). Números com marcador `[canon: path]`.

   **O que travou / exige atenção** — alertas ativos (métrica, baseline, magnitude,
   hipótese, ação), decisões a revisitar (`decisoes_a_revisitar`: cite o BDR pelo id),
   fontes não atualizadas, propostas paradas em `em_avaliacao`.

   **3 prioridades** — derivadas do acima, em ordem de impacto; cada uma com o número
   que a justifica e o próximo passo concreto (1 linha cada). Exatamente 3.

3. Salve em `gemeo/01-DASHBOARD/briefings/AAAA-MM-DD.md` com o cabeçalho:
   `**Período**: <ref> → <hoje> · **Gerado por**: /briefing`.

## Regras
- Diff vazio → "sem mudanças desde <ref>" + alertas/propostas pendentes; não encha linguiça.
- Não proponha melhorias novas aqui (isso é `/analisar-negocio`) — o briefing reporta.
- Em rotina agendada: commit do briefing em branch para revisão (PR = human-in-the-loop).
