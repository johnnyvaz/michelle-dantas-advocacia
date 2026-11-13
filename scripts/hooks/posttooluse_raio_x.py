#!/usr/bin/env python3
"""Hook PostToolUse (Skill): roda o raio-x de qualidade quando uma ferramenta do gêmeo é invocada.

Ferramenta do gêmeo = skill com `categoria: gemeo` no catalog.yml do ph3a-loop (lista viva: skill nova da
categoria entra sozinha). O raio-x só lê arquivos (quality-baseline.json + relatórios dos scanners) e regrava
docs/QUALIDADE.md, docs/qualidade/raio-x.html e o bloco do README; a nota volta como contexto para a skill.

Projeto sem scripts/raio-x.cjs, skill de outra categoria ou qualquer falha do próprio hook → exit 0 sem saída
(o hook nunca trava a sessão por bug próprio). Não mexe na fila: `--tasks` só a pedido.
"""
import json
import os
import re
import subprocess
import sys
from pathlib import Path

# Usada quando nenhum catalog.yml é encontrado (projeto instalado só por plugin, sem o ph3a-loop copiado).
GEMEO_PADRAO = {
    "montar-gemeo", "oraculo", "atualizar-gemeo", "atualizar-produto", "atualizar-financeiro",
    "atualizar-analytics", "atualizar-ranking", "atualizar-jira", "briefing", "analisar-negocio",
    "auditar-gemeo", "demo-sales-meeting", "priorizar", "datar", "google-analytics", "meta-ads",
    "search-console", "sentry",
}
ENTRADA = re.compile(r"-\s*skill:\s*([\w-]+)\s*\n\s*categoria:\s*([\w-]+)")


def skills_gemeo(projeto: Path) -> set[str]:
    candidatos = [projeto / ".claude/skills/ph3a-loop/catalog.yml"]
    if os.environ.get("CLAUDE_PLUGIN_ROOT"):
        candidatos.append(Path(os.environ["CLAUDE_PLUGIN_ROOT"]).parent / "ph3a-core/skills/ph3a-loop/catalog.yml")
    candidatos.append(Path(__file__).resolve().parents[2] / ".claude/skills/ph3a-loop/catalog.yml")
    for c in candidatos:
        if c.is_file():
            achadas = {s for s, cat in ENTRADA.findall(c.read_text(encoding="utf-8")) if cat == "gemeo"}
            if achadas:
                return achadas
    return GEMEO_PADRAO


def main() -> None:
    payload = json.load(sys.stdin)
    if payload.get("tool_name", "Skill") != "Skill":
        return
    nome = str((payload.get("tool_input") or {}).get("skill", "")).split(":")[-1].strip().lstrip("/")
    projeto = Path(os.environ.get("CLAUDE_PROJECT_DIR") or payload.get("cwd") or ".")
    script = projeto / "scripts" / "raio-x.cjs"
    if not nome or not script.is_file() or nome not in skills_gemeo(projeto):
        return
    r = subprocess.run(["node", str(script)], cwd=projeto, capture_output=True, text=True, timeout=60)
    nota = re.search(r"nota (\w) \((\d+)/100\)", r.stdout or "")
    if r.returncode != 0 or not nota:
        return
    contexto = (f"Raio-x de qualidade atualizado: nota {nota.group(1)} ({nota.group(2)}/100). "
                "Detalhe por tema, riscos e arquivos em docs/QUALIDADE.md — use como evidência da saúde "
                "técnica do produto, citando o arquivo.")
    print(json.dumps({"hookSpecificOutput": {"hookEventName": "PostToolUse", "additionalContext": contexto}}))


if __name__ == "__main__":
    try:
        main()
    except Exception:
        pass
    sys.exit(0)
