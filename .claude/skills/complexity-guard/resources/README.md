# Resources — complexity-guard

Arquivos-modelo da skill. A skill **copia** estes arquivos para o projeto-alvo
(em vez de transcrevê-los), reduzindo risco de erro. Validados empiricamente contra
`lizard 1.23.0` rodando em código real:

| Projeto | Stack | Escala | Resultado |
|---------|-------|--------|-----------|
| NOC-PH3A | FastAPI/Python + React 19/TSX | 562 funções | pior CCN 31 · 0,4 s |
| DATA-DOSSIE | monorepo TS (`api/` Node + `web/` React) | 4.297 funções | pior CCN 213 · 2,0 s |
| INTEGRADOR-WHATSAPP | Go | 370 funções | pior CCN 17 |

| Arquivo | Tipo | Destino no alvo | Adaptação |
|---------|------|-----------------|-----------|
| `complexity-scan.mjs` | **verbatim** (invariante) | `scripts/complexity-scan.mjs` | nenhuma |
| `complexity-thresholds.json` | template | `complexity-thresholds.json` (RAIZ) | `paths`, `limite_ccn`, `exclude` — ou gere com `--init` |

**Verbatim** = copie sem alterar. **Template** = ponto de partida, sempre ajustado.

## Fatos verificados (lizard 1.23.0)

1. **CSV não tem cabeçalho** (só com `-V/--verbose`). Colunas, nesta ordem:
   `nloc, ccn, token, param, length, "location", "file", "function", "long_name", start, end`.
2. O lizard **troca `"` por `'`** dentro dos campos na origem (`csvoutput.py`), então
   campo entre aspas nunca contém aspas — o parser CSV do scanner explora isso.
   Já vírgulas **existem** dentro dos campos (assinaturas como
   `f( x : A | None = Depends ( y )`) — parse posicional por `split(',')` quebra.
3. **Path inexistente faz o lizard pendurar** (não retorna erro). O scanner filtra
   `paths` por `fs.existsSync` antes de chamar — nunca remova esse filtro.
4. Sem `-l`, o lizard varre **todas** as linguagens que conhece — inclusive `tsx` e
   `typescript`. Não é preciso listar linguagem por projeto.
5. `-x`/`--exclude` aceita glob e é cumulativo (um `-x` por padrão). Funciona:
   562 funções com os excludes padrão vs. 909 sem eles, no mesmo alvo.
6. Rápido: ~0,4 s para 57 arquivos Python + 130 arquivos TSX com `-t 4`.
7. Componentes React aparecem como função (o `Dashboard.tsx` do NOC deu CCN 31);
   arrow functions anônimas aparecem como `(anonymous)` — por isso o relatório
   sempre mostra `arquivo:linha`, não só o nome.

## Ratchet

O scanner grava `.complexity-report.json`; o `quality-gate.js` lê dali:

| Métrica | Direção | Significado |
|---------|---------|-------------|
| `complexity_worst` | `desc` | maior CCN do projeto — impede que alguém crie função pior que a pior atual |
| `complexity_over_limit` | `desc` | nº de funções acima de `limite_ccn` — o débito agregado |

Se o lizard não estiver instalado, ou se o motor terminar sem conseguir analisar a entrada
(exit não zero, sinal ou erro fatal de parser), o scanner sai com **exit 2**. Assim ele nunca
publica um relatório vazio como se fosse uma melhora real. O `measureComplexity` devolve
`null` → o gate marca `skip` em vez de quebrar o build de quem ainda não instalou.

⚠ Consequência disso no `--update`: as duas chaves precisam de **fallback ao baseline
salvo** (`: (b.complexity_worst != null ? { complexity_worst: b.complexity_worst } : {})`).
Sem o fallback, um `--update` rodado numa máquina sem lizard apaga as métricas do
`quality-baseline.json` versionado e zera a catraca em silêncio — o mesmo cuidado que o
`measureSca` do DATA-DOSSIE já documentava.
