#!/usr/bin/env python3
"""cvss.py — calcula o score base e a severidade CVSS 3.1 a partir do vetor.

O modelo escolhe o VETOR (métricas AV/AC/PR/UI/S/C/I/A); este script calcula o
número (Regra de Ouro — nenhuma aritmética em prosa). Implementa a fórmula base
oficial CVSS 3.1 em stdlib pura (sem lib externa). Métricas temporais/ambientais
fora de escopo.

Uso:
  cvss.py "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H" [--json]
  cvss.py --in findings.json [--write] [--json]   # recomputa score/severidade de cada finding

Exit: 0 ok · 1 erro de dado (vetor malformado) · 2 erro de uso
Contrato: specs/005-pentest-dinamico-nativo/contracts/cvss-cli.md
"""

from __future__ import annotations

import argparse
import json
import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from _gemeo_lib import die_dado, die_uso, emit  # noqa: E402

# ── Pesos das métricas base (CVSS 3.1) ──────────────────────────────────────
AV = {"N": 0.85, "A": 0.62, "L": 0.55, "P": 0.20}
AC = {"L": 0.77, "H": 0.44}
UI = {"N": 0.85, "R": 0.62}
PR_U = {"N": 0.85, "L": 0.62, "H": 0.27}   # Scope Unchanged
PR_C = {"N": 0.85, "L": 0.68, "H": 0.50}   # Scope Changed
CIA = {"H": 0.56, "L": 0.22, "N": 0.00}
METRICAS = {"AV": AV, "AC": AC, "PR": None, "UI": UI, "S": {"U", "C"},
            "C": CIA, "I": CIA, "A": CIA}


def roundup(x: float) -> float:
    """Arredonda para cima com 1 casa decimal (algoritmo oficial CVSS 3.1)."""
    i = round(x * 100000)
    if i % 10000 == 0:
        return i / 100000.0
    return (math.floor(i / 10000) + 1) / 10.0


def severidade(score: float) -> str:
    if score == 0:
        return "nenhum"
    if score < 4.0:
        return "baixo"
    if score < 7.0:
        return "medio"
    if score < 9.0:
        return "alto"
    return "critico"


def parse_vetor(vetor: str) -> dict:
    if not isinstance(vetor, str) or not vetor.startswith("CVSS:3."):
        die_dado(f"vetor CVSS 3.x malformado (esperado prefixo 'CVSS:3.'): {vetor!r}")
    campos: dict[str, str] = {}
    for parte in vetor.split("/")[1:]:
        if ":" not in parte:
            die_dado(f"métrica malformada no vetor: {parte!r}")
        k, v = parte.split(":", 1)
        campos[k] = v
    faltantes = [m for m in ("AV", "AC", "PR", "UI", "S", "C", "I", "A") if m not in campos]
    if faltantes:
        die_dado(f"vetor CVSS incompleto: {vetor!r}", faltantes=faltantes)
    return campos


def calcular(vetor: str) -> dict:
    c = parse_vetor(vetor)
    scope_c = c["S"] == "C"
    try:
        pr = (PR_C if scope_c else PR_U)[c["PR"]]
        av, ac, ui = AV[c["AV"]], AC[c["AC"]], UI[c["UI"]]
        conf, integ, avail = CIA[c["C"]], CIA[c["I"]], CIA[c["A"]]
        if c["S"] not in ("U", "C"):
            raise KeyError("S")
    except KeyError as e:
        die_dado(f"valor de métrica inválido no vetor {vetor!r}: {e}")

    iss = 1 - ((1 - conf) * (1 - integ) * (1 - avail))
    if scope_c:
        impacto = 7.52 * (iss - 0.029) - 3.25 * (iss * 0.9731 - 0.02) ** 13
    else:
        impacto = 6.42 * iss
    explorab = 8.22 * av * ac * pr * ui

    if impacto <= 0:
        score = 0.0
    elif scope_c:
        score = roundup(min(1.08 * (impacto + explorab), 10))
    else:
        score = roundup(min(impacto + explorab, 10))
    return {"vetor": vetor, "score": score, "severidade": severidade(score)}


def _conta_visivel(r: dict) -> str:
    return (f"vetor: {r['vetor']}\n"
            f"score base: {r['score']}\n"
            f"severidade: {r['severidade']}")


def main() -> None:
    ap = argparse.ArgumentParser(description="Score base e severidade CVSS 3.1.")
    ap.add_argument("vetor", nargs="?", help="vetor CVSS 3.1 (CVSS:3.1/AV:.../A:...)")
    ap.add_argument("--in", dest="in_file", help="findings.json — recomputa cada finding")
    ap.add_argument("--write", action="store_true", help="regrava o findings.json com os valores derivados")
    ap.add_argument("--json", action="store_true")
    a = ap.parse_args()

    if a.in_file:
        p = Path(a.in_file)
        if not p.exists():
            die_uso(f"arquivo não encontrado: {p}")
        try:
            data = json.loads(p.read_text(encoding="utf-8"))
        except json.JSONDecodeError as e:
            die_dado(f"JSON inválido em {p}: {e}")
        findings = data.get("findings", data if isinstance(data, list) else [])
        for f in findings:
            vetor = f.get("cvss_vetor")
            if not vetor:
                die_dado(f"finding {f.get('id', '?')} sem 'cvss_vetor'")
            r = calcular(vetor)
            f["cvss_score"] = r["score"]
            f["cvss_severidade"] = r["severidade"]
        if a.write:
            p.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        emit({"asof_write": a.write, "findings": len(findings)}, a.json,
             human=f"{len(findings)} finding(s) recomputados"
                   + (" e gravados" if a.write else ""))
        return

    if not a.vetor:
        die_uso("informe um vetor CVSS ou --in <findings.json>")
    r = calcular(a.vetor)
    emit(r, a.json, human=_conta_visivel(r))


if __name__ == "__main__":
    main()
