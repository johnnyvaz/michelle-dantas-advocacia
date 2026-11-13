---
id: C0000
titulo: "[título curto da análise e-se]"
criado: AAAA-MM-DD
canon_sha: "[git rev-parse --short HEAD no momento da análise]"
premissas:
  - campo: "[path do canon ou premissas.*]"
    valor: "[valor assumido]"
    origem: "[premissa do founder | elasticidade canônica | faixa do canon]"
script: |
  # o comando exato executado — reproduzível
  python3 scripts/montecarlo.py --projecao --meses 12 --limiar "caixa>=0@12" --seed 42
conclusao_resumo: "[1–2 frases: o veredito numérico]"
status: ativo            # ativo | revalidado | invalidado
ultima_reexecucao: AAAA-MM-DD
---

# C0000 — [Título]

## Pergunta
[a pergunta "e se..." original]

## Conta executada
[cole o output do script — é a conta visível]

## Conclusão
[veredito + condições de contorno]

## Re-execução (preencher a cada canon novo)
| Data | canon_sha | Resultado | Status |
|------|-----------|-----------|--------|
| AAAA-MM-DD | [sha] | [P50/limiar novo] | revalidado / invalidado — [o que mudou] |
