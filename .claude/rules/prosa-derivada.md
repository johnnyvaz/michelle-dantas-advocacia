---
paths:
  - "gemeo/01-*/**"
  - "gemeo/02-*/**"
  - "gemeo/03-*/**"
  - "gemeo/04-*/**"
  - "gemeo/05-*/**"
  - "gemeo/06-*/**"
  - "gemeo/07-*/**"
  - "gemeo/08-*/**"
  - "gemeo/09-*/**"
  - "gemeo/10-*/**"
  - "gemeo/11-*/**"
  - "gemeo/13-*/**"
  - "gemeo/14-*/**"
  - "gemeo/15-*/**"
  - "gemeo/16-*/**"
  - "gemeo/GLOSSARIO.md"
---

# Regra: prosa derivada cita a origem

Estas regras valem ao editar a prosa de negócio (pastas `01`–`16` e `GLOSSARIO.md`, exceto `12-AGENTES`).

## Marcadores parseáveis (obrigatórios)

Todo número na prosa carrega um marcador que liga ao canon — o CI compara e acusa **drift**:

- `R$ X [canon: caminho.do.campo]` — valor direto do `canon.yaml`
  (ex.: `R$ 1500 [canon: snapshot.mrr]`)
- `N [calc: metrica]` — derivado de `metricas.yaml`
  (ex.: `R$ 18000 [calc: arr]`, porque `arr = mrr × 12`)

## Princípios

1. **A prosa não tem números próprios.** Se um número aparece sem marcador, ele é órfão —
   `scripts/check_citations.py` reprova.
2. **Sem aritmética em prosa.** Não calcule "à mão"; use `[calc: metrica]` e deixe o
   `calc.py` produzir a conta.
3. **Campo `null` no canon → declare a lacuna**, não invente. Diga "não temos esse dado" e
   aponte o campo que faltaria.
4. **Reconciliação com a realidade.** Em `07-PRODUTO/STATUS.md`, descreva o estado **real** do
   código (o que existe × o que se promete) — é o antídoto contra o corpus descolar da verdade.

> `12-AGENTES/` (empresa de agentes) tem regra própria: memórias `append-only`, personas/playbooks.
> Não se aplica o marcador `[canon:]` lá — ver `gemeo/12-AGENTES/README.md`.
