# 99-TEMPLATES

Modelos reutilizáveis ligados aos **registros vivos** do corpus.

| Template | Uso | Alimenta |
|----------|-----|----------|
| [`ata-reuniao.md`](./ata-reuniao.md) | Registro padronizado de reuniões | decision log (via registro-decisao) |
| [`registro-decisao.md`](./registro-decisao.md) | Nova entrada do decision log (com posições 🟢🟡🔴) | `02-ESTRATEGIA/registro-de-decisoes.md` |
| [`relatorio-mensal.md`](./relatorio-mensal.md) | Relatório mensal de métricas (canon primeiro) | canon + `10-INVESTIDORES/updates/` |
| [`postmortem.md`](./postmortem.md) | Pós-incidente *blameless* | `02-ESTRATEGIA/registro-de-riscos.md` |
| [`briefing-campanha.md`](./briefing-campanha.md) | Briefing de campanha dentro do budget canônico | `06-MARKETING/funil-e-processo-vendas.md` |

## Regra comum
Todo número citado num documento gerado por template vem do canon — se não existe lá,
primeiro entra no canon.
