#!/usr/bin/env python3
"""Hook PreToolUse (Edit/Write/MultiEdit): impede edição MANUAL de campos derivados.

Campos marcados `(derivado)` são regravados por `calc.py --all --write` — editar à mão
quebra a regra de ouro (a conta tem de ser visível, feita por script). O `calc.py`
escreve via Bash, não via Edit/Write, então não é afetado por este hook.

Correções em relação à versão anterior:

1. **`Write` era um buraco.** O hook lia só `old_string`/`new_string`, que são campos do
   `Edit`. Um `Write` sobre o `canon.yaml` carrega o texto em `content` e passava direto.
   Agora `content` e os `edits` do MultiEdit também são inspecionados.
2. **Caminho normalizado.** O teste `"00-CANON" in file_path` falhava com caminho
   relativo (`../00-CANON/canon.yaml`, `gemeo/./00-CANON/...`). Agora normaliza antes.
3. **Fail-closed.** Erro de leitura do payload bloqueia em vez de liberar em silêncio.

Autoteste: `python3 scripts/hooks/pretooluse_derivado.py --test`
"""
import json
import os
import sys

MARCA = "(derivado)"
MSG = ("BLOQUEADO: campos `(derivado)` do canon não são editados à mão. "
       "Atualize os campos-FONTE e rode `python3 scripts/calc.py --all --write` "
       "para regravar os derivados com a conta visível.")


def alvo_e_canon(file_path: str) -> bool:
    if not file_path:
        return False
    norm = os.path.normpath(file_path).replace("\\", "/")
    return norm.endswith("canon.yaml") and "00-CANON" in norm


def textos_da_edicao(ti: dict):
    """Todo texto que a ferramenta vai gravar, seja qual for a ferramenta."""
    yield ti.get("old_string", "") or ""
    yield ti.get("new_string", "") or ""
    yield ti.get("content", "") or ""          # Write — o buraco da versão anterior
    for ed in ti.get("edits") or []:           # MultiEdit
        if isinstance(ed, dict):
            yield ed.get("old_string", "") or ""
            yield ed.get("new_string", "") or ""


def decidir(payload: dict) -> tuple[int, str]:
    ti = payload.get("tool_input") or {}
    if not alvo_e_canon(ti.get("file_path", "")):
        return 0, ""
    if any(MARCA in t for t in textos_da_edicao(ti)):
        return 2, MSG
    return 0, ""


def main() -> None:
    if "--test" in sys.argv:
        sys.exit(run_tests())
    try:
        payload = json.load(sys.stdin)
    except Exception as e:
        print(f"BLOQUEADO: guarda de campos derivados não conseguiu ler o payload ({e}). "
              "Rode `python3 scripts/hooks/pretooluse_derivado.py --test`.", file=sys.stderr)
        sys.exit(2)
    try:
        code, msg = decidir(payload)
    except Exception as e:
        print(f"BLOQUEADO: erro no guarda de campos derivados ({e}). "
              "Isto é defeito do guarda — rode o autoteste (--test) e reporte.",
              file=sys.stderr)
        sys.exit(2)
    if code:
        print(msg, file=sys.stderr)
    sys.exit(code)


# ── autoteste ────────────────────────────────────────────────────────────────
# (tool_input, deve_bloquear, rótulo)
CASOS = [
    ({"file_path": "/r/gemeo/00-CANON/canon.yaml",
      "old_string": "arr: 120000 # (derivado)", "new_string": "arr: 999"},
     True, "Edit tocando derivado"),
    ({"file_path": "/r/gemeo/00-CANON/canon.yaml",
      "content": "snapshot:\n  arr: 999 # (derivado)\n"},
     True, "Write com derivado (era o buraco)"),
    ({"file_path": "/r/gemeo/00-CANON/canon.yaml",
      "edits": [{"old_string": "x", "new_string": "y # (derivado)"}]},
     True, "MultiEdit com derivado"),
    ({"file_path": "/r/gemeo/./00-CANON/canon.yaml",
      "content": "arr: 1 # (derivado)"},
     True, "caminho não normalizado"),
    ({"file_path": "/r/gemeo/00-CANON/canon.yaml",
      "old_string": "mrr: 10000", "new_string": "mrr: 12000"},
     False, "edita campo-FONTE, que é permitido"),
    ({"file_path": "/r/gemeo/07-PRODUTO/STATUS.md",
      "content": "texto com (derivado) no meio"},
     False, "outro arquivo, mesmo com a marca"),
    ({"file_path": "/r/docs/exemplo.md", "content": "(derivado)"},
     False, "fora do corpus"),
]


def run_tests() -> int:
    falhas = 0
    for ti, esperado, rotulo in CASOS:
        code, _ = decidir({"tool_input": ti})
        ok = (code == 2) == esperado
        falhas += not ok
        print(f"[{'ok  ' if ok else 'FALHA'}] "
              f"{'bloqueia' if esperado else 'libera  '} :: {rotulo}")
    print(f"\n{len(CASOS)}/{len(CASOS)} OK" if not falhas
          else f"\n{falhas} FALHA(S) de {len(CASOS)}")
    return 1 if falhas else 0


if __name__ == "__main__":
    main()
