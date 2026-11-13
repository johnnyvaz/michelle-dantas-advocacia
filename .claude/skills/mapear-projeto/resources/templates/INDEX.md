---
tipo: mapa-indice
alvo: <nome do projeto>
gerado_em: AAAA-MM-DD
fonte_commit: <sha do inventário>
---

# Mapa do projeto — índice de consulta

> **Leia isto primeiro.** Porta de entrada para perguntas sobre o código ("onde/como o projeto faz X").
> Derivado do código por `/mapear-projeto` em `AAAA-MM-DD`, commit `<sha>`. Se o código mudou depois,
> rode `/mapear-projeto` de novo — o refresh é incremental. Confiança: 🟢 confirmado no código
> (`arquivo:linha`) · 🟡 inferido · 🔴 lacuna (ver `lacunas.md`).

## Números do inventário

> Saída de `inventario.py` colada como está — o bloco é a conta visível; nunca conte à mão.

```
<cole aqui o resumo impresso por: python3 inventario.py <ALVO> --out mapa/_inventario.json>
```

## Onde procurar

> Uma linha por tema. A coluna **Palavras** lista termos e sinônimos (pt/en) que alguém usaria
> para perguntar sobre o tema — é ela que faz o índice ser achado pelo sentido, não só pelo nome.

| Tema | Doc | Arquivos-fonte | Palavras | Resumo |
|---|---|---|---|---|
| Visão geral / como rodar | [visao-geral.md](visao-geral.md) | `<manifests>` | setup, instalar, rodar, run, build | `<1 linha>` |
| Arquitetura | [arquitetura.md](arquitetura.md) | — | componentes, camadas, C4 | `<1 linha>` |
| `<módulo>` | [modulos/<modulo>.md](modulos/<modulo>.md) | `<pasta/>` | `<termos e sinônimos>` | `<1 linha>` |
| Dados | [dados.md](dados.md) | `<schema/migrations>` | banco, tabela, entidade, model, ERD | `<1 linha>` |
| API | [api.md](api.md) | `<rotas>` | endpoint, rota, REST, webhook | `<1 linha>` |
| Integrações | [integracoes.md](integracoes.md) | `<clientes de SDK>` | serviço externo, SDK, env var | `<1 linha>` |
| Lacunas | [lacunas.md](lacunas.md) | — | dúvida, GAP, pergunta | `<N lacunas abertas>` |

## Glossário

| Termo | Significado no projeto | Onde |
|---|---|---|
| `<termo do domínio>` | `<definição>` | `<arquivo:linha>` |
