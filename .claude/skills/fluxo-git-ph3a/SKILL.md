---
name: fluxo-git-ph3a
description: >
  Use esta skill sempre que precisar interagir com git nos projetos da PH3A.
  Aplicar quando: criar branch, fazer commit, fazer push, abrir PR.
  Não usar quando: apenas lendo código sem intenção de alterar.
---

# Fluxo Git PH3A

## Regra fundamental

NUNCA commite ou faça push diretamente na branch principal do repositório.
SEMPRE crie uma branch de trabalho antes de qualquer alteração.
A branch principal de cada projeto está definida na skill de contexto do projeto.

## Criando uma branch de trabalho

```bash
git checkout <branch-principal>   # consulte a skill de contexto do projeto
git pull origin <branch-principal>
git checkout -b <tipo>/<descricao-curta>
```

Tipos de branch:
- `feat/` — nova funcionalidade
- `fix/` — correção de bug
- `chore/` — manutenção, dependências, configuração
- `refactor/` — refatoração sem mudança de comportamento
- `docs/` — documentação

Exemplos: `feat/login-oauth`, `fix/erro-chatwoot-api`, `chore/atualizar-dependencias`

## Formato de commit (Conventional Commits em português)

```
<tipo>(<escopo>): <descrição curta em português>

[corpo opcional explicando o porquê, não o quê]
```

Exemplos:
```
feat(chat): adicionar suporte a parâmetro accountid na URL
fix(api): corrigir erro 500 no endpoint chatwoot/messages
chore(deps): atualizar next.js para versão 15.2
```

## Push e Pull Request

```bash
git add <arquivos específicos>
git commit -m "tipo(escopo): descrição"
git push origin <nome-da-branch>
```

Após o push, abrir um Pull Request com:
- Título: mesmo formato do commit principal
- Descrição: o que foi feito, por que, como testar
- Aguardar aprovação de Johnny — NUNCA fazer merge sem aprovação

## Operações terminantemente proibidas

- `git push origin main` — NUNCA
- `git push --force` — NUNCA
- `git merge main` diretamente — NUNCA
- `git reset --hard` — NUNCA
- `git branch -D` — NUNCA
