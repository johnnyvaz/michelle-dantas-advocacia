# PROPOSTAS/ — backlog de propostas de melhoria do negócio

Saída das rodadas autônomas de análise (`/analisar-negocio`): cada proposta é um
arquivo `P####-slug.md` (template: `0000-TEMPLATE.md`) com diagnóstico ancorado no
canon, impacto quantificado com conta visível, esforço/risco e **mapa de adesão**
dos decisores (quem abraça, quem resiste, qual argumento move cada um).

Ciclo de status: `nova → em_avaliacao → aceita | rejeitada`
(gerenciado por `scripts/propostas.py status` — aceita/rejeitada exige BDR associado;
rejeitada só reabre com fato novo).

`RUNS/R###.yaml` é o manifesto de cada rodada (uma linha por lente: candidatas, duplicadas,
citações órfãs, persistidas, tokens, duração), gravado por `scripts/rodada.py gravar` no passo 4c
e nunca editado à mão. Formato e exemplo sintético: `examples/rodada/R001.yaml`; leitura e
exportação OpenTelemetry: `/otel-guard`.

**Regra inviolável: agentes propõem, nunca executam.** Toda mudança passa pelo dono
do negócio. `INDEX.md` é gerado por `scripts/propostas.py indexar`.
