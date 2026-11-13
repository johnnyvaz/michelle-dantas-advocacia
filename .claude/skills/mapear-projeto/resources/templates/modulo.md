---
tipo: mapa-modulo
modulo: <pasta do módulo>
gerado_em: AAAA-MM-DD
fonte_commit: <sha>
arquivos: [<caminhos lidos para escrever este doc>]
palavras: [<termos e sinônimos pt/en>]
---

# Módulo `<nome>`

## Responsabilidade

<2–3 frases: o que este módulo faz e para quem.> 🟢 `<arquivo:linha>`

## Pontos de entrada

| Símbolo | Tipo | Onde |
|---|---|---|
| `<função/classe/rota>` | `<handler, job, CLI, componente>` | `<arquivo:linha>` |

## Fluxos principais

1. `<passo>` — `<arquivo:linha>` 🟢
2. `<passo>` — 🟡 `<por que é inferência>`

## Regras de negócio

- `<regra (validação, limite, estado, permissão)>` 🟢 `<arquivo:linha>`

## Depende de / é usado por

- Depende de: `<módulos/serviços>`
- Usado por: `<módulos>`

## Lacunas

- 🔴 `<o que o código não responde>` → registrada em [../lacunas.md](../lacunas.md)
