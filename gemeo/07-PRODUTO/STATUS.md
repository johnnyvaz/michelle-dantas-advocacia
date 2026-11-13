# Status do Produto — estado real do código

> **Template** — preenchido via /montar-gemeo. Deriva do canon: `produto.{repos,implementado,em_construcao,testes_em,testes,leitura}`.
> **Citação parseável**: todo número preenchido usa o marcador `R$ X [canon: path.do.campo]` ou `N [calc: metrica]` — o CI compara com o canon e acusa drift (specs/001-melhorias-gemeo/contracts/formatos-arquivos.md).

> Reconcilia a *especificação* (os demais `.md` desta pasta) com o *código real* nos
> repos. É o antídoto contra o corpus descolar da realidade — sustenta perguntas de
> **execução** ("vocês entregam de verdade?"). Atualizado via `/atualizar-produto`.
>
> **Resuma; não duplique documentação do repo.** O detalhe técnico vive no código;
> aqui fica só o suficiente para uma decisão de negócio. Última verificação: `AAAA-MM-DD`.

## Onde está o código (fontes)

> Espelha `produto.repos`. Uma linha por repositório que compõe o produto.

| Repositório | Papel | Caminho |
|-------------|-------|---------|
| `[PREENCHER: nome do repo]` | `[PREENCHER: produto / site / etc.]` | `[PREENCHER: caminho ou URL]` |

## Implementado vs. em construção

> Espelha `produto.implementado` (✅) e `produto.em_construcao` (🚧). Seja honesto:
> stub é stub. Marque o que builda e o que é só esqueleto.

| Componente | Estado | Detalhe (1 linha) |
|------------|--------|-------------------|
| `[PREENCHER: módulo/pacote]` | ✅ Implementado + testado | `[PREENCHER: o que faz]` |
| `[PREENCHER: módulo/pacote]` | ✅ Implementado | `[PREENCHER: o que faz]` |
| `[PREENCHER: módulo/pacote]` | 🚧 Stub / parcial | `[PREENCHER: o que falta]` |

## Resultado dos testes — `AAAA-MM-DD`

> Espelha `produto.testes` e `produto.testes_em`. Cole o resultado real dos comandos,
> não a intenção. Falha de ambiente não é bug — anote a causa.

| Comando | Resultado |
|---------|-----------|
| `[PREENCHER: comando de teste unitário]` | ✅ `[N]/[N]` passam |
| `[PREENCHER: comando de build]` | ✅ build completo |
| `[PREENCHER: comando e2e/integração]` | ⚠️ `[N]/[N]` — `[PREENCHER: causa das falhas]` |

## Leitura para o oráculo

> Espelha `produto.leitura`. 1–2 frases honestas: o que já está de pé e testado vs.
> o que ainda é promessa. Esta é a resposta direta a "isso é vaporware?".

`[PREENCHER: 1–2 frases — o core está implementado e coberto por testes? O que falta?]`
