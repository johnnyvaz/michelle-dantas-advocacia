#!/usr/bin/env python3
"""check_citations.py — todo número precisa de origem verificável.

Modos:
  --resposta FILE [--outputs DIR]  → audita uma resposta do oráculo:
      número com marcador [canon: path] / [calc: metrica] → valor conferido;
      número sem marcador → precisa existir no canon ou nos outputs de script;
      órfão → exit 1. Resposta sem números → exit 0 (qualitativa não bloqueia).
  --prosa DIR                      → anti-drift: varre .md, confere cada marcador
      [canon:]/[calc:] contra o valor atual; divergência → exit 1.

Fecha a brecha da citação pós-racionalizada: a citação é VALIDADA, não confiada.
"""

from __future__ import annotations

import argparse
import re
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from _gemeo_lib import (EXIT_DADO, canon_path, die_uso, emit, get_path,
                        load_yaml, point_value)

# número com marcador logo após: "9600 [canon: snapshot.mrr]" / "6.12 meses [calc: runway_meses]"
MARCADO_RE = re.compile(
    r"(-?\d[\d.,]*)\s*%?\s*(?:[a-zA-Záéíóúçõ%/]+\s*){0,2}\[(canon|calc):\s*([a-z0-9_.]+)\]")
NUM_RE = re.compile(r"-?\d[\d.,]*\d|-?\d")
DATA_RE = re.compile(r"\d{4}-\d{2}(-\d{2})?")
TOL = 0.01  # tolerância relativa 1%


def parse_num(s: str) -> float | None:
    """Aceita 9600, 9.600, 9,600.50, 6,12 (pt-BR) e 6.12."""
    s = s.strip()
    try:
        if "," in s and "." in s:
            if s.rfind(",") > s.rfind("."):       # 9.600,50 (pt-BR)
                s = s.replace(".", "").replace(",", ".")
            else:                                  # 9,600.50 (en)
                s = s.replace(",", "")
        elif "," in s:
            inteiro, _, frac = s.rpartition(",")
            s = (inteiro.replace(".", "") + "." + frac) if len(frac) <= 2 and inteiro else s.replace(",", "")
        return float(s)
    except ValueError:
        return None


def bate(a: float, b: float) -> bool:
    if b == 0:
        return abs(a) < 1e-9
    return abs(a - b) / max(abs(b), 1e-9) <= TOL


def interpretacoes(bruto: str) -> set[float]:
    """Leituras possíveis de um literal numérico (ambiguidade pt-BR/en)."""
    out = set()
    v = parse_num(bruto)
    if v is not None:
        out.add(round(v, 2))
    if re.fullmatch(r"\d{1,3}(\.\d{3})+", bruto):     # 29.400 = milhar pt-BR
        out.add(float(bruto.replace(".", "")))
    if re.fullmatch(r"\d{1,3}(,\d{3})+", bruto):      # 29,400 = milhar en
        out.add(float(bruto.replace(",", "")))
    return out


def bate_algum(bruto: str, alvo: float) -> bool:
    return any(bate(c, float(alvo)) for c in interpretacoes(bruto))


def valor_calc(metrica: str, canon_file: Path) -> float | None:
    import json
    script = Path(__file__).parent / "calc.py"
    r = subprocess.run([sys.executable, str(script), metrica,
                        "--canon", str(canon_file), "--json"],
                       capture_output=True, text=True, timeout=60)
    if r.returncode != 0:
        return None
    d = json.loads(r.stdout)
    return d.get("valor") if isinstance(d.get("valor"), (int, float)) else None


def numeros_do_canon(canon) -> set[float]:
    out: set[float] = set()
    def walk(n):
        if isinstance(n, dict):
            for v in n.values():
                walk(v)
        elif isinstance(n, list):
            for v in n:
                walk(v)
        elif isinstance(n, (int, float)) and not isinstance(n, bool):
            out.add(round(float(n), 2))
    walk(canon)
    return out


def checa_texto(texto: str, canon, canon_file: Path, extras: set[float],
                problemas: list, contexto: str) -> None:
    texto_sem_datas = DATA_RE.sub(" ", texto)

    # 1) números com marcador: validar o marcador
    cobertos: set[str] = set()
    for m in MARCADO_RE.finditer(texto_sem_datas):
        bruto, tipo, alvo = m.group(1), m.group(2), m.group(3)
        num = parse_num(bruto)
        cobertos.add(bruto)
        if num is None:
            continue
        if tipo == "canon":
            v = point_value(get_path(canon, alvo))
            if v is None:
                problemas.append(f"{contexto}: [canon: {alvo}] não existe no canon (número {bruto})")
            elif isinstance(v, (int, float)) and not isinstance(v, bool):
                if not bate_algum(bruto, v):
                    problemas.append(f"{contexto}: {bruto} ≠ canon.{alvo} = {v} (drift)")
            elif isinstance(v, str):
                if bruto not in v:
                    problemas.append(f"{contexto}: [canon: {alvo}] é texto e não contém '{bruto}'")
            # listas/dicts citados como contexto: aceito sem comparação numérica
        else:
            v = valor_calc(alvo, canon_file)
            if v is None:
                problemas.append(f"{contexto}: [calc: {alvo}] não computável (número {bruto})")
            elif not bate_algum(bruto, v):
                problemas.append(f"{contexto}: {bruto} ≠ calc:{alvo} = {v} (drift)")

    # 2) números sem marcador: precisam existir no canon ou nos outputs.
    # Convenção: bloco cercado (```) é output de script colado — a "conta visível" —
    # então seus números contam como conhecidos e não disparam órfão.
    dentro_de_blocos = " ".join(re.findall(r"```.*?```", texto_sem_datas, re.S))
    for m in NUM_RE.finditer(dentro_de_blocos):
        v = parse_num(m.group(0))
        if v is not None:
            extras.add(round(v, 2))
    fora_de_blocos = re.sub(r"```.*?```", " ", texto_sem_datas, flags=re.S)
    # linha com " = " é conta visível inline (ex.: "9.600 + (8 × 400) = R$ 12.800"):
    # seus números são computados à vista, contam como conhecidos
    linhas_eq = [l for l in fora_de_blocos.splitlines() if " = " in l]
    for m in re.finditer(r"-?\d[\d.,]*\d|-?\d", " ".join(linhas_eq)):
        v = parse_num(m.group(0))
        if v is not None:
            extras.add(round(v, 2))
            if re.fullmatch(r"\d{1,3}(\.\d{3})+", m.group(0)):
                extras.add(float(m.group(0).replace(".", "")))
    fora_de_blocos = "\n".join(l for l in fora_de_blocos.splitlines() if " = " not in l)
    conhecidos = numeros_do_canon(canon) | extras
    # número não pode estar embutido em token alfanumérico (sha f143c48, ids C001)
    for m in re.finditer(r"(?<![A-Za-z0-9_])(-?\d[\d.,]*\d|-?\d)(?![\d.,]*[A-Za-z0-9_])",
                         fora_de_blocos):
        bruto = m.group(1)
        sufixo_k = None  # sufixo k tratado pela exclusão de token; "25k" vira embutido
        if bruto.endswith((".", ",")):
            bruto = bruto[:-1]
        if bruto in cobertos:
            continue
        num = parse_num(bruto)
        if num is None:
            continue
        candidatos = interpretacoes(bruto) | {abs(c) for c in interpretacoes(bruto)}
        if any(1900 <= c <= 2100 and c == int(c) for c in candidatos):
            continue  # ano
        if all(c == int(c) and abs(c) <= 90 for c in candidatos):
            continue  # contagens/durações em prosa ("3 entrevistas", "45 dias", "60 min")
        if any(bate(c, k) or bate(c, abs(k)) for c in candidatos for k in conhecidos):
            continue
        problemas.append(f"{contexto}: número órfão {bruto} — sem [canon:]/[calc:] e "
                         f"ausente do canon/outputs")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--resposta")
    ap.add_argument("--outputs")
    ap.add_argument("--prosa")
    ap.add_argument("--canon")
    ap.add_argument("--json", action="store_true")
    a = ap.parse_args()

    cfile = canon_path(override=a.canon)
    canon = load_yaml(cfile)
    problemas: list[str] = []

    if a.resposta:
        extras: set[float] = set()
        if a.outputs:
            for f in Path(a.outputs).glob("*"):
                if f.is_file():
                    for m in NUM_RE.finditer(f.read_text(encoding="utf-8", errors="ignore")):
                        v = parse_num(m.group(0))
                        if v is not None:
                            extras.add(round(v, 2))
        texto = Path(a.resposta).read_text(encoding="utf-8")
        checa_texto(texto, canon, cfile, extras, problemas, Path(a.resposta).name)
    elif a.prosa:
        for md in sorted(Path(a.prosa).rglob("*.md")):
            txt = md.read_text(encoding="utf-8", errors="ignore")
            if "[canon:" not in txt and "[calc:" not in txt:
                continue
            # anti-drift: só os marcadores (números sem marcador em prosa = aviso futuro)
            for m in MARCADO_RE.finditer(DATA_RE.sub(" ", txt)):
                bruto, tipo, alvo = m.group(1), m.group(2), m.group(3)
                num = parse_num(bruto)
                if num is None:
                    continue
                if tipo == "canon":
                    v = point_value(get_path(canon, alvo))
                    if v is None:
                        problemas.append(f"{md}: [canon: {alvo}] não existe (número {bruto})")
                    elif isinstance(v, (int, float)) and not isinstance(v, bool):
                        if not bate_algum(bruto, v):
                            problemas.append(f"{md}: {bruto} ≠ canon.{alvo} = {v} (DRIFT)")
                    elif isinstance(v, str) and bruto not in v:
                        problemas.append(f"{md}: [canon: {alvo}] é texto e não contém '{bruto}'")
                else:
                    v = valor_calc(alvo, cfile)
                    if v is None:
                        problemas.append(f"{md}: [calc: {alvo}] não computável")
                    elif not bate_algum(bruto, v):
                        problemas.append(f"{md}: {bruto} ≠ calc:{alvo} = {v} (DRIFT)")
    else:
        die_uso("use --resposta FILE ou --prosa DIR")

    payload = {"aprovada": not problemas, "problemas": problemas}
    emit(payload, a.json,
         "citações: OK — todos os números têm origem verificável" if not problemas
         else "citações: REPROVADA\n" + "\n".join(f"  - {p}" for p in problemas))
    if problemas:
        sys.exit(EXIT_DADO)


if __name__ == "__main__":
    main()
