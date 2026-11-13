#!/usr/bin/env python3
"""importar_findings.py — converte findings.json em eventos da lente `pentest`.

Fecha o loop red→blue: os findings verificados do /pentest-dinamico viram eventos
JSONL priorizáveis por `prioridade.py all` (roteia pela lente `pentest`, prior
próprio ~0.15). NÃO calcula score — isso é do prioridade.py; aqui só traduz.

Mapeamento (M1):
  cvss_severidade critico/alto/medio/baixo -> cvss_critico/alto/medio/baixo
  status confirmado -> +exploit_confirmado ; senão -> +poc_apenas
  breach:true -> +vazamento_confirmado (guarda existencial)
  nao_conformidade_critica:true -> +nao_conformidade_critica (guarda)

Uso:
  importar_findings.py --in findings.json [--out eventos.jsonl] [--json]
  # depois: prioridade.py all --in eventos.jsonl

Exit: 0 ok · 1 erro de dado · 2 erro de uso
Contrato: specs/005-pentest-dinamico-nativo/contracts/importar-findings-cli.md
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from _gemeo_lib import die_dado, die_uso, emit  # noqa: E402

_SEV = {"critico": "cvss_critico", "alto": "cvss_alto",
        "medio": "cvss_medio", "baixo": "cvss_baixo", "nenhum": None}


def evento_de_finding(f: dict) -> dict:
    """Traduz um finding verificado em um evento da lente `pentest`."""
    for campo in ("id", "cvss_severidade", "status"):
        if f.get(campo) in (None, ""):
            die_dado(f"finding {f.get('id', '?')} sem campo obrigatório '{campo}' "
                     f"(rode cvss.py --in --write antes, para preencher a severidade)")

    sev = f["cvss_severidade"]
    if sev not in _SEV:
        die_dado(f"finding {f['id']}: severidade desconhecida {sev!r}")

    evidencias: list[str] = []
    if _SEV[sev]:
        evidencias.append(_SEV[sev])
    evidencias.append("exploit_confirmado" if f["status"] == "confirmado" else "poc_apenas")
    if f.get("breach"):
        evidencias.append("vazamento_confirmado")
    if f.get("nao_conformidade_critica"):
        evidencias.append("nao_conformidade_critica")

    ev = {"lente": "pentest", "id": f["id"], "tipo": "evento",
          "evidencias": evidencias, "aberto": bool(f.get("aberto", True))}
    entidade = f.get("endpoint") or f.get("entidade") or f.get("alvo")
    if entidade:
        ev["endpoint"] = entidade
    if f.get("primeira_vez_em"):
        ev["primeira_vez_em"] = f["primeira_vez_em"]
    return ev


def converter(findings: list[dict]) -> list[dict]:
    return [evento_de_finding(f) for f in findings]


def carregar_findings(path: Path) -> list[dict]:
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        die_dado(f"JSON inválido em {path}: {e}")
    if isinstance(data, list):
        return data
    return data.get("findings", [])


def main() -> None:
    ap = argparse.ArgumentParser(description="findings.json -> eventos da lente pentest.")
    ap.add_argument("--in", dest="in_file", required=True, help="findings.json")
    ap.add_argument("--out", dest="out_file", help="arquivo JSONL de saída (default: stdout)")
    ap.add_argument("--json", action="store_true")
    a = ap.parse_args()

    p = Path(a.in_file)
    if not p.exists():
        die_uso(f"arquivo não encontrado: {p}")
    eventos = converter(carregar_findings(p))

    linhas = "\n".join(json.dumps(e, ensure_ascii=False) for e in eventos)
    if a.out_file:
        Path(a.out_file).write_text(linhas + "\n", encoding="utf-8")
        emit({"eventos": len(eventos), "out": a.out_file}, a.json,
             human=f"{len(eventos)} evento(s) → {a.out_file}\n"
                   f"próximo: python3 scripts/prioridade.py all --in {a.out_file}")
    else:
        emit({"eventos": eventos}, a.json, human=linhas)


if __name__ == "__main__":
    main()
