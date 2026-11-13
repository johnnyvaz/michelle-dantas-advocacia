# Red Team — Playbook

### Objetivo da área
Encontrar e **verificar** fraquezas de segurança antes que um atacante real o faça — reproduzindo o valor de um pentest dinâmico de forma **nativa e governada**, e entregando findings priorizáveis ao blue-team (`agente-soc`).

### Princípios
- **Exploitabilidade > severidade teórica.** Um finding *confirmado* (probe) vale mais que um crítico só no papel — é o que escala a prioridade.
- **Prova, não presunção.** Evidência obrigatória em todo finding; `breach`/guarda só com prova observada.
- **Governança antes de tudo.** Escopo pelo ROE; probe ativo só com aprovação; nada destrutivo; dado não sai para IA externa.
- **A conta vem do script.** CVSS por `cvss.py`; priorização por `prioridade.py`. Nada de aritmética em prosa.

### Processo / Frameworks
1. **Mapear a superfície** (análise): entradas, authn/authz, dados sensíveis (LGPD), dependências, rotas, config exposta.
2. **Gerar findings adversariais** no schema unificado (hipóteses) — cada um com vetor CVSS, CWE, PoC/evidência e `fix_before/fix_after`.
3. **Calcular CVSS** com `cvss.py --in --write`.
4. **Verificar (opcional, governado)**: para hipóteses de alto valor, propor probe ativo no ROE → aprovação → probes da whitelist → promover a `confirmado`.
5. **Fechar o loop red→blue**: `importar_findings.py` → `prioridade.py all` → escalar Alta/EXISTENCIAL a `tasks/human.md`.
6. **Aprender**: registrar desfechos em `soc-feedback.yaml` (recalibra LRs) e padrões em `memoria.md`.

### Ferramentas (skills) e quando usar
| Ferramenta | Quando |
|---|---|
| `/pentest-dinamico` (análise) | Sempre — ponto de partida seguro |
| `/pentest-dinamico` (probe) | Confirmar exploitabilidade de alvo autorizado (ROE + aprovação) |
| `scripts/cvss.py` | Derivar score/severidade do vetor |
| `scripts/importar_findings.py` + `prioridade.py all` | Priorizar findings pelo negócio (loop red→blue) |
| `incident-report-ia` | Findings confirmados de alto impacto |
| `review-code-ph3a` | Revisão estática complementar (mesmo schema de finding) |

### Fontes no cérebro
`gemeo/00-CANON/canon.yaml` (estado do negócio), `prioridade.yaml` (lente `pentest`), `escopo-autorizado.yaml` (ROE), `12-AGENTES/seguranca/` (par com o blue-team).

### O que NÃO fazer
Testar fora do ROE; rodar destrutivo/DoS/brute-force/mutação de estado; `push`/deploy; enviar o alvo a IA externa; inventar score; marcar `breach` sem prova; rodar probe ativo pelo heartbeat autônomo.
