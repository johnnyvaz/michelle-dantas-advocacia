---
name: quality-check
description: Roda o quality gate com ratchet (node scripts/quality-gate.js) e reprova se houver regressão de métricas. É o primitivo de ENFORCEMENT (diferente de /quality-gate, que INSTALA o gate). Usado pelo hook after_implement da extension ph3a-quality e antes do deploy. Invoque com /quality-check [caminho].
allowed-tools: Read, Bash
---

# Skill: Quality Check (enforcement do ratchet)

Verifica se o projeto passa no quality gate **sem regressões**. Não instala nada — apenas executa o ratchet já
instalado pela skill `/quality-gate`.

> Distinção importante:
> - `/quality-gate` → **instala** o gate (gera `scripts/quality-gate.js`, baseline, configs). Não sobrescreve
>   baseline existente.
> - `/quality-check` → **executa** o gate (`node scripts/quality-gate.js`) e **reprova** em regressão.

---

## Passos

### 1. Localizar o gate

```bash
ls scripts/quality-gate.js 2>/dev/null
```

- Se **não existir**: o projeto ainda não tem o quality gate instalado. Informar e orientar:
  ```
  Quality gate não instalado neste projeto.
  Rode primeiro:  /quality-gate        (ou /ph3a-loop qualidade)
  ```
  Encerrar sem reprovar (não há baseline a violar ainda).

### 2. Executar o ratchet

```bash
node scripts/quality-gate.js
```

Interpretar o **exit code** (este é o veredicto):

- **exit 0** → ✅ quality gate verde. Reportar o resumo de métricas mostrado e concluir como **aprovado**.
- **exit 1** → ❌ houve **regressão**. Mostrar a saída (quais métricas regrediram: cobertura caiu, erros de tipo
  subiram, duplicação aumentou, violações de arquitetura ou métricas dos guards pioraram) e concluir como
  **reprovado**. NÃO prosseguir com o que dependia do gate (merge/deploy).

### 3. Em caso de regressão — orientar, não mascarar

- A correção padrão é **ajustar o código** até as métricas voltarem ao baseline.
- Só rode `node scripts/quality-gate.js --update` se a mudança for uma **melhoria legítima** do baseline
  (ex: cobertura subiu de verdade). Nunca use `--update` para "esconder" uma regressão — isso quebra o ratchet.

---

## Saída ao usuário

```
Quality check — <ALVO>
  Resultado: APROVADO ✅ | REPROVADO ❌
  (em caso de reprovação, listar as métricas que regrediram e o baseline esperado)
```

## Notas

- Aceita caminho como argumento (default: diretório atual). Rode a partir da raiz do projeto onde está
  `scripts/quality-gate.js`.
- Requer Node.js e as dependências de teste do projeto instaladas (pytest/jest/vitest, jscpd) — se faltarem, o
  `quality-gate.js` reporta as métricas como `n/a` (skip), não como regressão.
- É o comando que a extension `ph3a-quality` dispara em `after_implement` para fechar o ciclo contínuo de
  qualidade.
