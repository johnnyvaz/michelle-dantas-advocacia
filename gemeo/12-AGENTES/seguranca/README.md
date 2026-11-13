# Área — Segurança (SOC + Red Team)

Duas frentes complementares: **blue-team** (SOC — triagem Bayesiana de eventos, spec 003) e
**red-team** (pentest dinâmico simulado, spec 005). O red-team encontra e verifica fraquezas; o
blue-team as prioriza pelo estado do negócio. Ambos escalam só o de alto risco ao humano.

| Arquivo | Papel |
|---|---|
| `persona.md` | quem é o analista de segurança |
| `playbook.md` | blue-team: como pensar (Bayes, evidências, correlação) — absorve o antigo `AGENTE-SOC.md` |
| `playbook-redteam.md` | red-team: metodologia ofensiva + fronteira de governança (spec 005) |
| `heartbeat.md` | ciclo autônomo (OODA) |
| `memoria.md` | aprendizados duráveis |
| `soc-feedback.yaml` | rótulos de desfecho (privado) → `recalibrar.py` |
| `escopo-autorizado.yaml` | ROE — alvos autorizados para probe ativo (privado, nasce vazio) |
| `findings/` | findings verificados do red-team (estado; nasce vazio) |

**Blue-team** — motor: `scripts/prioridade.py soc`; lente `soc` do `prioridade.yaml`; subagente `agente-soc`.
**Red-team** — skill `/pentest-dinamico`; engines `scripts/cvss.py` + `scripts/importar_findings.py`;
lente `pentest` do `prioridade.yaml`; subagente `agente-redteam`. Loop red→blue:
`importar_findings.py` → `prioridade.py all`. Ambos roteados por `/orquestrador-empresa`.
