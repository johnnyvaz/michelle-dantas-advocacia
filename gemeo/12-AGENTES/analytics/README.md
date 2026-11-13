# Analytics — Área (Métricas e Inteligência de Canais)

> A área **Analytics** lê os números dos canais de `{{EMPRESA}}` (redes, site, busca) com honestidade:
> separa vaidade de aquisição, compara com a meta do canon e devolve poucas recomendações acionáveis.

## Papel

- **Relatório de redes** no formato de `gemeo/06-MARKETING/redes/modelo-relatorio.md`.
- **Série histórica** em `gemeo/06-MARKETING/redes/crescimento-semanal.md` (append-only) e a foto atual
  proposta para `marca.redes[]` do canon, via `/atualizar-analytics`.
- **Melhores horários e formatos** medidos (`melhores-horarios.md`), substituindo o seed genérico.
- **Benchmark** de concorrentes pela rubrica de `concorrentes.md`.
- **Fechar o loop**: 2 a 4 recomendações viram tarefa de `social` ou `marketing`.

> A área **não** altera campanha, não gasta verba e não publica. Mídia paga é de `marketing` (com
> aprovação humana); distribuição orgânica é de `social`.

## Conteúdo durável da área

| Arquivo | Conteúdo |
|---|---|
| `persona.md` | postura do analista e a regra de fonte + data |
| `playbook.md` | coleta, relatório, benchmark, recomendação |
| `heartbeat.md` | ciclo autônomo (OODA) + orçamento + fila `#area/analytics` |
| `memoria.md` | memória persistente (padrão PARA) |

## Ferramentas (skills)

| Skill | Quando usar |
|-------|-------------|
| `google-analytics` / `atualizar-analytics` | Tráfego social → site, conversão (GA4) |
| `meta-ads` | Insights de Instagram/Facebook (leitura) |
| `search-console` / `atualizar-ranking` | Busca orgânica e posição |
| `oraculo` | Pergunta "e se" sobre a meta (a conta roda em script) |

## Regra de ouro

Todo número tem **fonte e data**. Sem dado, "não tenho esse dado" e qual campo falta. Meta ausente no
canon é "meta não definida", não zero.
