# Template — Post-mortem de Incidente

> Sem culpados (*blameless*). Obrigatório para indisponibilidade do componente
> mais crítico do produto (defina qual é em `03-OPERACOES/processos-chave.md`).
> Publicar em até 5 dias úteis.

---

# Post-mortem — [título curto do incidente]

**Data do incidente**: AAAA-MM-DD hh:mm–hh:mm (duração: Xh) · **Severidade**: SEV1 (produto fora) / SEV2 (funcionalidade degradada) / SEV3 (interno)
**Autor**: [nome] · **Revisores**: [nomes]

## Impacto
- Clientes afetados: [quantos / quais planos] · Operações perdidas/falhas: [estimativa]
- Detecção: [monitoramento ou reclamação de cliente?] → tempo até detecção: [min]

## Linha do tempo (UTC-3)
| Hora | Evento |
|------|--------|
| hh:mm | [primeiro sinal] |
| hh:mm | [ação] |
| hh:mm | [resolução] |

## Causa-raiz
[técnica E de processo — "o deploy quebrou" não é causa-raiz; "não havia teste cobrindo X" é]

## O que funcionou / o que falhou
- ✅ [defesa que segurou]
- ❌ [lacuna exposta]

## Ações corretivas
| # | Ação | Tipo | Responsável | Prazo |
|---|------|------|-------------|-------|
| 1 | [ação] | prevenção / detecção / mitigação | [nome] | AAAA-MM-DD |

## Atualizações decorrentes
- `02-ESTRATEGIA/registro-de-riscos.md`: [risco novo ou re-pontuado?]
- Runbook/monitoramento: [o que mudou]
