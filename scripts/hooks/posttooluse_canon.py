#!/usr/bin/env python3
"""Hook PostToolUse (Edit/Write): valida o canon após qualquer edição.

Violação de contrato/consistência → exit 2 + conta esperada no stderr
(o Claude lê o stderr e se autocorrige). Qualquer falha do próprio hook → exit 0
(o hook nunca pode travar a sessão por bug próprio).
"""
import json
import subprocess
import sys
from pathlib import Path

try:
    payload = json.load(sys.stdin)
    fp = (payload.get("tool_input") or {}).get("file_path", "")
    if not fp.endswith("canon.yaml") or "00-CANON" not in fp:
        sys.exit(0)
    script = Path(__file__).resolve().parent.parent / "validar_canon.py"
    r = subprocess.run([sys.executable, str(script), "--canon", fp],
                       capture_output=True, text=True, timeout=30)
    if r.returncode == 1:
        print("canon.yaml com violações — corrija antes de prosseguir:\n"
              + r.stderr.strip()
              + "\n(derivados: rode `python3 scripts/calc.py --all --write`)",
              file=sys.stderr)
        sys.exit(2)
except Exception:
    pass
sys.exit(0)
