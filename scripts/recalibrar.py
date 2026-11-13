#!/usr/bin/env python3
"""recalibrar.py — recalibra os LR do modelo a partir do feedback humano.

Decaimento temporal (FR-010/D7a): cada rótulo pesa 0.5^(Δt/τ) — rótulo recente
domina o antigo. NÃO toca a urgência de itens em aberto (isso é o anti-decaimento
do prioridade.py, FR-016/D7b).

  LR_j = P(e_j|ameaça) / P(e_j|benigno)   (contagem ponderada + suavização de Laplace)

Uso:
  recalibrar.py [--feedback FILE] [--lente soc] [--meia-vida-dias N] [--asof YYYY-MM-DD]
                [--json] [--write]
Exit: 0 ok · 1 dado insuficiente (mantém semente) · 2 uso.
Contrato: specs/003-motor-priorizacao/contracts/cli.md
"""

from __future__ import annotations

import argparse
import datetime
import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from _gemeo_lib import die_dado, die_uso, emit, get_path, load_yaml, repo_root
from prioridade import asof_date, model_path, parse_date

POSITIVOS = {"ataque_confirmado", "critico"}
NEGATIVOS = {"falso_positivo", "legitimo"}


def peso_idade(data, asof: datetime.date, meia_vida: float) -> float:
    d = parse_date(data)
    if not d:
        return 1.0
    dt = max(0, (asof - d).days)
    return 0.5 ** (dt / meia_vida)


def recalibrar(model: dict, feedback: list, lente_nome: str, asof: datetime.date,
               meia_vida: float, laplace: float) -> dict:
    lente = (model.get("lentes") or {}).get(lente_nome) or {}
    ev_defs = lente.get("evidencias") or {}
    # acumuladores ponderados por evidência e por classe
    acc = {c: {"pos": 0.0, "neg": 0.0} for c in ev_defs}
    tot_pos = tot_neg = 0.0
    for fb in feedback:
        w = peso_idade(fb.get("data"), asof, meia_vida)
        cls = "pos" if fb.get("rotulo") in POSITIVOS else \
              "neg" if fb.get("rotulo") in NEGATIVOS else None
        if cls is None:
            continue
        tot_pos += w if cls == "pos" else 0
        tot_neg += w if cls == "neg" else 0
        for c in fb.get("evidencias", []):
            if c in acc:
                acc[c][cls] += w
    if tot_pos <= 0 or tot_neg <= 0:
        return {"_insuficiente": True}
    novos = {}
    for c, d in ev_defs.items():
        p_e_dado_a = (acc[c]["pos"] + laplace) / (tot_pos + 2 * laplace)
        p_e_dado_b = (acc[c]["neg"] + laplace) / (tot_neg + 2 * laplace)
        lr = p_e_dado_a / p_e_dado_b
        novos[c] = {"lr_antigo": d.get("lr"), "lr_novo": round(lr, 3),
                    "pos": round(acc[c]["pos"], 2), "neg": round(acc[c]["neg"], 2)}
    return novos


def gravar(path: Path, lente_nome: str, novos: dict, asof: datetime.date):
    from ruamel.yaml import YAML
    ry = YAML()
    ry.preserve_quotes = True
    with open(path, encoding="utf-8") as f:
        data = ry.load(f)
    evs = data["lentes"][lente_nome]["evidencias"]
    for c, info in novos.items():
        evs[c]["lr"] = info["lr_novo"]
        try:
            evs[c].yaml_add_eol_comment(f"via recalibrar.py em {asof.isoformat()}", key="lr")
        except Exception:
            pass
    with open(path, "w", encoding="utf-8") as f:
        ry.dump(data, f)


def main():
    ap = argparse.ArgumentParser(description="Recalibra LR por feedback (decaimento temporal).")
    ap.add_argument("--feedback")
    ap.add_argument("--lente", default="soc")
    ap.add_argument("--meia-vida-dias", type=float)
    ap.add_argument("--asof")
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--write", action="store_true")
    a = ap.parse_args()

    root = repo_root()
    mp = model_path(root)
    model = load_yaml(mp)
    canon = load_yaml(root / "gemeo" / "00-CANON" / "canon.yaml")
    asof = asof_date(canon, a.asof)
    fb_path = Path(a.feedback) if a.feedback else \
        root / "gemeo" / "12-AGENTES" / "seguranca" / "soc-feedback.yaml"
    if not fb_path.exists():
        die_uso(f"feedback não encontrado: {fb_path}")
    feedback = load_yaml(fb_path) or []
    if isinstance(feedback, dict):
        feedback = feedback.get("rotulos", [])
    mv = a.meia_vida_dias or float((model.get("decaimento") or {}).get("meia_vida_dias", 90))
    lap = float((model.get("decaimento") or {}).get("laplace", 1))

    novos = recalibrar(model, feedback, a.lente, asof, mv, lap)
    if novos.get("_insuficiente"):
        die_dado("feedback insuficiente (faltam rótulos positivos e/ou negativos) — "
                 "mantendo os LR semente")
    if a.write:
        gravar(mp, a.lente, novos, asof)
        print(f"LR recalibrados gravados em {mp.name} (lente {a.lente})", file=sys.stderr)
    emit({"lente": a.lente, "asof": asof.isoformat(), "meia_vida_dias": mv, "lr": novos},
         a.json, human="\n".join(
             f"{c}: LR {v['lr_antigo']} → {v['lr_novo']}  (pos={v['pos']} neg={v['neg']})"
             for c, v in novos.items()))


if __name__ == "__main__":
    main()
