---
name: raio-x
description: >-
  Traduz o quality gate em linguagem de negócio para quem não é técnico: nota A–E, semáforo por tema
  (Segurança e LGPD, Estabilidade, Testes, Manutenção, Arquitetura), os arquivos que mais concentram problema e
  a evolução no tempo — em docs/QUALIDADE.md (gráficos Mermaid), docs/qualidade/raio-x.html (interativo) e um
  bloco no README. Mantém uma tarefa por tema vermelho/amarelo em tasks/backlog.md, que fecha sozinha quando o
  tema fica verde. Roda sozinho após `quality-gate.js --update` e a cada ferramenta do gêmeo (hook). Requer
  quality-gate instalado. Use quando pedirem raio-x, "como está o projeto", relatório de qualidade para o
  cliente/gestor, ou para transformar o débito medido em tarefas. Invoque com /raio-x [caminho].
allowed-tools: Read, Bash, Write, Edit, Glob
gates: [conta-visivel, dado-datado]
---

# Skill: Raio-X de Qualidade

O quality gate mede bem e comunica mal: `resilience_missing_timeouts: 13` não diz nada a quem decide. O raio-x
lê o mesmo `quality-baseline.json` e os relatórios dos scanners e responde **o que é, por que importa e onde
está** — sem medir nada de novo.

**Gates:** `conta-visivel` (semáforo, nota e ranking saem do script, nunca da prosa) e `dado-datado` (todo
documento carrega a data do baseline). Os demais não se aplicam: não lê o corpus do gêmeo (`canon-ancorado`,
`sem-exfiltracao`) e não faz ação externa (`aprovacao-humana`).

## Arquivos (`resources/` → projeto)

| Resource | Vira | Observação |
|---|---|---|
| `raio-x.cjs` | `scripts/raio-x.cjs` | **verbatim** — gerador, sem dependência |
| `raio-x/catalogo.cjs` | `scripts/raio-x/catalogo.cjs` | **adaptar**: `PROJETO`, chaves do baseline, textos com os sistemas reais |
| `raio-x.test.cjs` | `scripts/raio-x.test.cjs` | verbatim — `node --test scripts/raio-x.test.cjs` |

## Etapas

1. **Pré-requisito:** `scripts/quality-gate.js` e `quality-baseline.json` existem. Sem eles, pare e rode
   `/quality-gate` — o raio-x não inventa número (métrica ausente aparece ⚪ e não pesa na nota).
2. **Copiar** os três resources para `scripts/` mantendo `scripts/raio-x/catalogo.cjs`.
3. **Adaptar o catálogo:** cada `chave` igual à do `quality-baseline.json` do projeto (o gate monorepo usa
   `api_*`/`web_*`; projeto de um pacote renomeia). Troque "fornecedor", "ERP", "pagamento" pelos nomes reais
   — o texto é lido por leigo. Faixas `verde`/`amarelo` são política: mudar exige motivo no commit.
4. **Calibrar os scanners antes de confiar no número.** O raio-x expõe o que eles contam:
   - `resilience-scan.js` precisa exportar `details.http_without_timeout_todos`/`_retry_todos` (lista completa);
   - app Next com `output: 'export'` é frontend (o `fetch` roda no navegador);
   - pastas que não são código (`gemeo/`, `specs/`, `tasks/`, rascunhos) ficam fora da varredura;
   - o Logger do projeto não conta como `console.*` solto.
   Número que caiu muito ao calibrar é bom sinal: era ruído. Rode `node scripts/quality-gate.js --update`.
5. **Ligar ao gate:** em `scripts/quality-gate.js`, no fim do bloco `if (UPDATE)` depois de `saveBaseline`:
   ```js
   if (instalado('scripts', 'raio-x.cjs')) {
     const rx = spawnSync(process.execPath, ['scripts/raio-x.cjs'], { cwd: ROOT, encoding: 'utf8' });
     process.stdout.write(rx.stdout ?? '');
   }
   ```
6. **README:** garanta um bloco `<!-- raio-x:inicio -->` … `<!-- raio-x:fim -->` (o script reescreve só ali;
   sem os marcadores, acrescenta no fim). Crie o README se não existir.
7. **Gerar e conferir:** `node scripts/raio-x.cjs` e `node --test scripts/raio-x.test.cjs`. Abra
   `docs/qualidade/raio-x.html` no navegador (claro, escuro e 400px de largura).
8. **Tarefas (a pedido):** `node scripts/raio-x.cjs --tasks` e depois `python3 scripts/prioridade.py all --write`.
   Uma tarefa por tema em 🔴/🟡; título fixo do catálogo (identidade do item); só os sub-bullets
   `**Raio-x:**` e `**Onde (raio-x):**` são do script — notas e decisões escritas à mão são preservadas. Tema
   verde → item inteiro vai para `tasks/concluidas.md` com `✅ data`. Rodar duas vezes não muda nada.

## Comandos

```bash
node scripts/raio-x.cjs            # regenera docs/QUALIDADE.md, docs/qualidade/raio-x.html e o bloco do README
node scripts/raio-x.cjs --tasks    # idem + sincroniza tasks/backlog.md
node scripts/raio-x.cjs --check    # exit 1 se docs/QUALIDADE.md está defasado (CI)
```

`quality-history.jsonl` (versionado) ganha uma linha a cada baseline novo — é a fonte do gráfico de evolução.

## Automático

- **Depois de `quality-gate.js --update`** (passo 5): documentos nunca ficam velhos.
- **A cada ferramenta do gêmeo:** o hook `scripts/hooks/posttooluse_raio_x.py` (plugin `ph3a-gemeo`) roda o
  raio-x quando uma skill de `categoria: gemeo` do `catalog.yml` é invocada, e entrega a nota como contexto —
  `/briefing`, `/oraculo` e `/atualizar-gemeo` passam a enxergar a saúde técnica do produto. Projeto sem
  `scripts/raio-x.cjs`: o hook não faz nada.
- A fila (`--tasks`) **nunca** muda sozinha: só a pedido.
