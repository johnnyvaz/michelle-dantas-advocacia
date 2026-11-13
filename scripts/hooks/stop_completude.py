#!/usr/bin/env python3
"""Hook Stop: garante COMPLETUDE.md regenerado quando o canon mudou na sessão.

Se gemeo/00-CANON/canon.yaml está mais novo que gemeo/COMPLETUDE.md, pede
(exit 2, UMA vez — respeita stop_hook_active) que o Claude rode completude.py.

A raiz sai de `$CLAUDE_PROJECT_DIR` ou da própria localização do script — nunca do
cwd. Resolver por cwd faz o hook rodar em subdiretório, não achar o canon e passar
em silêncio: fail-open, que é pior que não ter o hook.
"""
import json
import os
import sys
from pathlib import Path


def repo_root() -> Path:
    """Raiz do projeto: env do Claude Code, senão sobe de scripts/hooks/ até o corpus."""
    env = os.environ.get("CLAUDE_PROJECT_DIR")
    if env and (Path(env) / "gemeo" / "00-CANON" / "canon.yaml").exists():
        return Path(env).resolve()
    aqui = Path(__file__).resolve()
    for cand in aqui.parents:
        if (cand / "gemeo" / "00-CANON" / "canon.yaml").exists():
            return cand
    return aqui.parent.parent.parent  # scripts/hooks/x.py -> raiz


try:
    payload = json.load(sys.stdin)
    if payload.get("stop_hook_active"):
        sys.exit(0)  # já bloqueamos antes neste turno — não criar loop
    root = repo_root()
    canon = root / "gemeo" / "00-CANON" / "canon.yaml"
    comp = root / "gemeo" / "COMPLETUDE.md"
    if canon.exists() and comp.exists() and canon.stat().st_mtime > comp.stat().st_mtime + 5:
        print("O canon mudou nesta sessão mas o COMPLETUDE.md não foi regenerado. "
              "Rode `python3 scripts/completude.py --write` antes de encerrar.",
              file=sys.stderr)
        sys.exit(2)
except Exception:
    pass
sys.exit(0)
