# Raio-X de Qualidade — Site Michelle Dantas Advocacia

> Gerado por `node scripts/raio-x.cjs` a partir do quality gate em **2026-11-10**. Não edite à mão.
> Versão interativa: [`docs/qualidade/raio-x.html`](./qualidade/raio-x.html).

## Nota geral: **B** (89/100)

**Os maiores riscos hoje:**

1. 🔧 **Código copiado e colado** (14.9%) — Cópia esquecida mantém o bug vivo depois da correção.

| Tema | Nota | Situação |
|---|---|---|
| 🛡️ Segurança e LGPD | 100/100 | 🟢 ok |
| ⚡ Estabilidade | — | ⚪ sem medição |
| 🧪 Testes | — | ⚪ sem medição |
| 🔧 Manutenção | 67/100 | 🔴 crítico |
| 🏛️ Arquitetura | — | ⚪ sem medição |

## Detalhe por tema

### 🛡️ Segurança e LGPD

| | O que medimos | Agora | Meta | Por que importa |
|---|---|---|---|---|
| 🟢 | Dado pessoal aparecendo em log | 0 | ≤ 0 | Vazamento de dado pessoal é incidente LGPD: notificação à ANPD e risco de multa. |
| 🟢 | Ações sem registro de quem fez | 0 | ≤ 0 | Sem trilha de auditoria não há como investigar fraude, erro de operador ou atender a NORM04. |
| 🟢 | Logs fora do padrão (console) | 0 | ≤ 0 | Log fora do Logger não é mascarado nem rastreável por requisição. |

### ⚡ Estabilidade

| | O que medimos | Agora | Meta | Por que importa |
|---|---|---|---|---|

### 🧪 Testes

| | O que medimos | Agora | Meta | Por que importa |
|---|---|---|---|---|

### 🔧 Manutenção

| | O que medimos | Agora | Meta | Por que importa |
|---|---|---|---|---|
| 🟢 | A função mais complicada do sistema | 6 | ≤ 15 | Quanto maior o número, mais caminhos possíveis — e mais caro e arriscado mudar. |
| 🟢 | Funções complicadas demais | 0 | ≤ 10 | Cada um é um lugar onde mudança simples vira dia de trabalho e bug novo. |
| 🔴 | Código copiado e colado | 14.9% | ≤ 3% | Cópia esquecida mantém o bug vivo depois da correção. |

### 🏛️ Arquitetura

| | O que medimos | Agora | Meta | Por que importa |
|---|---|---|---|---|

## Contexto


## Como ler

- 🟢 dentro da meta · 🟡 atenção · 🔴 crítico · ⚪ ainda não medido (não conta na nota).
- A nota vai de A a E; Segurança e Estabilidade pesam o dobro. Dado pessoal em log limita a nota a D.
- Os números só podem melhorar: o quality gate reprova qualquer mudança que piore um deles.
- Cada tema em 🟡/🔴 tem uma tarefa em `tasks/backlog.md` (`node scripts/raio-x.cjs --tasks`).
- Faixas e textos: `scripts/raio-x/catalogo.cjs`.
