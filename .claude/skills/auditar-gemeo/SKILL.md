---
name: auditar-gemeo
description: Lint completo do Gêmeo Digital - contrato do canon, drift prosa×canon, consistência de referências, completude e staleness, num relatório único. Usa quando o usuário pedir para auditar o gêmeo, verificar consistência, checar se está tudo certo, ou como rotina semanal agendada. Triggers - auditar, lint, consistência, saúde do corpus.
gates: [canon-ancorado, dado-datado]
---

# auditar-gemeo — lint do corpus

Compõe os verificadores num relatório único. **Só leitura** — reporta, não corrige
(exceto se o usuário pedir as correções na sequência).

## Execute (nesta ordem)

```bash
python3 scripts/validar_canon.py --adequacao --json     # 1. contrato + consistências
python3 scripts/calc.py --all --json                    # 2. derivados recomputáveis?
python3 scripts/check_citations.py --prosa gemeo --json # 3. drift prosa × canon
python3 scripts/consistencia_interna.py --json          # 4. links/refs/ids
python3 scripts/completude.py --json                    # 5. nível + pendências
python3 scripts/alertas.py --json                       # 6. limiares violados
python3 scripts/auditar_memoria.py --json               # 7. memória de área (12-AGENTES/*/memoria.md)
```

E cheque **staleness**: `_meta.data_referencia` > 30 dias → sinalize e sugira
`/atualizar-gemeo`; propostas em `em_avaliacao` há > 14 dias (frontmatter) → sinalize;
cenários `ativo` com `canon_sha` ≠ HEAD → sugerir re-execução.

O passo 7 é o lint da **memória de área** (camadas procedural e esquecimento — `.claude/rules/memoria.md`):
🔴 cronologia/metadados quebrados (exit 1) · 🟡 candidata a playbook (mesmo tema/identificador em
≥ 3 entradas e ausente do `playbook.md`), referência morta, contradição possível · ℹ️ tamanho.
Template intacto é **constatação**, não erro. Promover a playbook ou supersedir entrada é decisão do
dono da área — o relatório lista, não executa.

## Relatório (1 página)

| Bloco | Conteúdo |
|-------|----------|
| 🩺 Saúde geral | nível de completude, data de referência, nº de erros/avisos |
| 🔴 Erros | consistências quebradas, drift, links — com a conta/arquivo exato |
| 🟡 Atenções | avisos de origem, staleness, propostas paradas, cenários a revalidar |
| ✅ Verde | o que está íntegro (1 linha) |
| → Próximo passo | a ação nº 1 (geralmente: corrigir erros → `/atualizar-gemeo`) |

## Regras
- Corpus legado (1ª auditoria): tudo em modo adequação — relatório, não bloqueio.
- Não "conserte de passagem": correção é passo separado, confirmado com o usuário
  (em rotina agendada: relatório em branch/PR, sem correções).
