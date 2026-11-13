---
name: deploy
description: >-
  Conduz o deploy interativo do projeto — verifica o estado do git, roda o quality gate, confirma cada etapa com o usuário e publica. Personalizável com os detalhes de deploy de cada projeto. Invoque com /deploy.
---

# Skill: Deploy Interativo

> Personalize esta skill com os detalhes de deploy do seu projeto.
> **Nome do projeto**: resolva em runtime — canon `gemeo/00-CANON/canon.yaml` → CLAUDE.md → nome do diretório raiz. Nunca exiba `{{PROJECT_NAME}}` cru.

## Instruções ao Claude

Quando o usuário invocar `/deploy`, execute o seguinte fluxo **interativamente**:

---

### Passo 1 — Verificação do estado do git

```bash
git status
git log --oneline -5
```

Se houver mudanças não commitadas, perguntar ao usuário o que fazer antes de prosseguir.

---

### Passo 2 — Branch correta?

```bash
git branch --show-current
```

PRD geralmente requer branch `main`. Avisar se for diferente.

---

### Passo 2.5 — Gate de qualidade (PH3A) — BLOQUEIA o deploy

Antes de qualquer coisa, rodar o quality gate com ratchet. **Se houver regressão, abortar o deploy.**

```bash
node scripts/quality-gate.js
```

- **Exit 0** → quality gate verde, pode prosseguir.
- **Exit 1** → há regressão (cobertura caiu, erros de tipo subiram, duplicação aumentou, violações de arquitetura
  ou métricas dos guards regrediram). **Não prosseguir** — mostrar a saída ao usuário e orientar a corrigir ou rodar
  `node scripts/quality-gate.js --update` apenas se a mudança for uma melhoria legítima do baseline.

Se `scripts/quality-gate.js` não existir, avisar que o projeto não tem o quality gate instalado e sugerir rodar
`/ph3a-loop qualidade` (ou `/quality-gate`) antes de habilitar deploy protegido.

Para **produção**, recomendado também rodar a análise estática e a revisão de segurança antes de seguir:

```bash
# Opcional para PRD — não bloqueante por padrão, mas recomendado:
#   /sonarqube            (bugs, vulnerabilidades, hotspots)
#   /review-code-ph3a     (OWASP Top 10, NORM11/PROC09, LGPD)
```

---

### Passo 2.6 — Versão (release semântico)

Calcular a próxima versão a partir dos Conventional Commits (se o projeto usa `scripts/release.sh`):

```bash
# Só calcula e mostra a próxima versão (não aplica):
bash scripts/release.sh

# Aplica (bump de VERSION + CHANGELOG) quando o usuário confirmar:
bash scripts/release.sh --apply
```

Mostrar a versão calculada no resumo do Passo 5.

---

### Passo 3 — Escolher ambiente

```
Qual ambiente?
  1) Staging / HML
  2) Produção (requer confirmação extra)
```

---

### Passo 4 — Verificar credenciais / autenticação

Verificar se as ferramentas necessárias estão autenticadas:

```bash
# Exemplo para Azure:
az account show

# Exemplo para AWS:
aws sts get-caller-identity

# Exemplo para GCP:
gcloud auth print-identity-token
```

---

### Passo 5 — Confirmação final

```
Resumo do deploy:
  Ambiente:  [ambiente escolhido]
  Branch:    [branch atual]
  Versão:    [versão atual]

Confirmar? (s/n)
```

**Para PRD:** exigir confirmação adicional digitando o nome do ambiente.

---

### Passo 6 — Executar deploy

```bash
# Substitua com o comando de deploy real do projeto:
bash infra/deploy.sh [ambiente]
```

---

### Passo 7 — Verificar resultado

Após conclusão:
- Verificar status dos serviços
- Confirmar migrations executadas
- Mostrar logs recentes se necessário

---

## Personalize esta skill

Substitua os comandos genéricos acima pelos comandos reais do projeto:

- Script de build: `???`
- Script de deploy: `???`
- Verificação de saúde: `???`
- Rollback: `???`
