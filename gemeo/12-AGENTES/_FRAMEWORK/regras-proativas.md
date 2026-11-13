# Regras proativas — o trabalho que ninguém pediu (genérico)

> Governa o que o **heartbeat** pode começar sem pedido explícito. A `allowlist.md` diz **o que** um
> agente pode fazer sozinho; este arquivo diz **quando** ele pode começar algo que ninguém pediu.
> Critério: [`docs/filosofia-atencao.md`](../../../docs/filosofia-atencao.md).

## Os dois modos

| Modo | O que o heartbeat faz quando a regra casa |
|---|---|
| `registrar` (**padrão**) | Não executa. Anota em `tasks/ideas.md` o que teria feito e por quê |
| `agir` | Cria o item em `tasks/` com `Regra: <id>` e segue a `allowlist.md` normalmente |

Toda regra nasce em `registrar`. Quem promove para `agir` é o **dono**, depois de ler os registros
e ver que o agente teria acertado. Afrouxar o modo é decisão do dono (doutrina, recusa 6). Voltar
para `registrar` qualquer um pode fazer, e deve fazer quando a regra gera ruído.

Sem regra que case, o heartbeat não cria trabalho: "fila vazia → nada a fazer" (`heartbeat-template.md`).

## Formato

```markdown
### R-001 · Campo null no canon vira tarefa de preenchimento
- **Modo:** registrar
- **Área:** #area/operacoes
- **Quando:** `scripts/completude.py` lista campo `null` em seção marcada como crítica
- **Faz:** item em `backlog.md` pedindo `/montar-gemeo` daquela seção, `#esforco/p`
- **Não faz:** inventar valor, rodar `/montar-gemeo` sozinho
- **Promovida por:** _(pendente)_
```

`R-0xx` é identidade estável. É o que vai em `Regra:` no item criado e no registro em `ideas.md`.

## Registro em `registrar`

Uma linha em `tasks/ideas.md`, sem checkbox. Registro não é trabalho e não deve entrar na fila
priorizada:

```markdown
- 👻 R-001 · teria criado: "Preencher `financeiro.caixa` via /montar-gemeo" 📅 2026-11-02 #area/operacoes
```

Antes de registrar, deduplique: se a mesma linha já existe, não repita. Dez registros iguais são
ruído, não evidência.

## Regras deste projeto

_(nenhuma — adicione abaixo, sempre em `registrar`)_
