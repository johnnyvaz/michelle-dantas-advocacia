---
paths:
  - "gemeo/00-CANON/**"
---

# Regra: o Canon é a fonte única da verdade

Estas regras valem ao editar qualquer arquivo em `gemeo/00-CANON/`.

## Invioláveis

1. **Todo número vive aqui.** `canon.yaml` é a única fonte de verdade numérica do negócio.
   A prosa das pastas `01`–`16` **deriva** do canon e cita a origem (ver `prosa-derivada.md`).
2. **Nunca invente um número.** Campo `null` significa "não temos esse dado" — responda assim,
   nomeando qual campo do canon precisaria existir. Não preencha com estimativa sem marcá-la
   como tal (`# estimativa` / `# premissa` / `# via <fonte> em <data>`).
3. **Campos derivados não se editam à mão.** Campos marcados `(derivado)` (ARR, runway, LTV,
   concentração…) são regravados por `python3 scripts/calc.py --all --write`. O hook
   `pretooluse_derivado.py` bloqueia edição manual.
4. **Toda alteração roda o validador.** Após editar `canon.yaml`, o hook `posttooluse_canon.py`
   roda `validar_canon.py`; corrija até **0 erros**. Regenere `COMPLETUDE.md` com
   `python3 scripts/completude.py --write`.

## Arquivos do canon

| Arquivo | Papel |
|---|---|
| `canon.yaml` | dados mestres (16 seções) — campos `null` no esqueleto |
| `metricas.yaml` | catálogo de derivados (fórmula + onde regrava) |
| `drivers.yaml` | árvore de dependências causais (sensibilidade/variância/alertas) |
| `canon.schema.json` | contrato de validação (JSON Schema) |
| `perguntas-oraculo.md` | as perguntas que o oráculo deve saber responder |

## Aritmética

Nenhuma conta "de cabeça" na prosa. Derivados e simulações rodam nos scripts
(`calc.py`, `montecarlo.py`, `sensibilidade.py`…) — o stdout do script é a conta visível.
