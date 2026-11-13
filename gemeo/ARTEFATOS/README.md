# ARTEFATOS — Saídas de demonstração (opcional)

Pasta **opcional** para guardar saídas concretas geradas pela plataforma ou pelo
processo de desenvolvimento: exports de dados de exemplo, diagramas do negócio e
da arquitetura, screenshots e o deck de pitch. Servem a demos e documentação —
não substituem o canon.

> **Regra de ouro:** nenhum número aqui contradiz o `00-CANON/canon.yaml`. Os exports
> são **fatias ilustrativas** dos agregados canônicos (`snapshot.*`), nunca a fonte.

---

## Índice de artefatos

Liste o que existe nesta pasta. Tipos comuns:

| Arquivo | Tipo | Conteúdo |
|---------|------|----------|
| [PREENCHER: export de dados de exemplo] | Export CSV/JSON | amostra ilustrativa de registros do produto |
| [PREENCHER: diagramas] | Diagramas | arquitetura, modelo de dados e fluxos do negócio |
| [PREENCHER: screenshots] | Imagens | telas da plataforma para demo |
| [PREENCHER: deck de pitch] | PDF | exportado de `10-INVESTIDORES/` |

## Consistência com o canon

| Agregado | Canon (`snapshot.*`) | Neste diretório |
|----------|----------------------|-----------------|
| [PREENCHER: KPI de uso nº1] | [N] | amostra de [N] |
| [PREENCHER: KPI de uso nº2] | [N] | amostra de [N] |

As amostras ilustram os totais — não os substituem. Mantenha-as coerentes com
`snapshot.uso_produto.*` e com os clientes de `clientes[]`.

## Convenção de nomenclatura

```
[tipo]-[descricao]-[data].ext
Exemplo: export-dados-demo-AAAA-MM-DD.csv
         diagramas-AAAA-MM-DD.md
```

## Status

[PREENCHER: ex. populado em AAAA-MM-DD com exports e diagramas; screenshots e deck pendentes.]
