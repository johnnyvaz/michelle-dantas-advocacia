#!/usr/bin/env python3
"""completude.py — gera gemeo/COMPLETUDE.md a partir do estado REAL do corpus.

O nível (☆ → ★★★) é calculado mecanicamente: campos não-nulos do canon por
seção + ausência de placeholders [PREENCHER na prosa. Nunca estimado pelo modelo.

Uso: completude.py [--canon PATH] [--write] [--json]
"""

from __future__ import annotations

import argparse
import datetime
import os
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from _gemeo_lib import canon_path, emit, get_path, load_yaml

# seções do canon por nível (espelha COMPLETUDE.md original)
SECOES = [
    ("empresa", 1), ("snapshot", 1), ("financeiro", 1), ("metas", 1),
    ("planos", 2), ("clientes", 2), ("concentracao", 2), ("crescimento", 2),
    ("unit_economics", 2), ("time", 2), ("produto", 2),
    ("unit_economics_por_plano", 3), ("mercado", 3), ("premissas", 3),
    ("fundraising", 3), ("cap_table", 3),
]

# prosa por nível: (pasta, nível) — arquivo conta se não tiver [PREENCHER
PROSA = [
    ("01-DASHBOARD", 2), ("02-ESTRATEGIA", 3), ("03-OPERACOES", 2),
    ("04-FINANCEIRO", 2), ("05-JURIDICO", 3), ("06-MARKETING", 2),
    ("07-PRODUTO", 2), ("08-PESSOAS", 3), ("09-CLIENTES", 2),
    ("10-INVESTIDORES", 3), ("11-CONTAS-A-PAGAR", 3), ("13-CONTABILIDADE", 3),
    ("14-MARCA", 2), ("15-DADOS", 2), ("16-CONFORMIDADE", 3),
]

ESTRELAS = {0: "☆ skeleton", 1: "★ mínimo viável", 2: "★★ operacional", 3: "★★★ nível Cod2D"}


def secao_preenchida(canon: dict, nome: str) -> bool:
    v = canon.get(nome)
    if v is None:
        return False
    if isinstance(v, list):
        return len(v) > 0
    if isinstance(v, dict):
        def algum(d):
            for x in d.values():
                if isinstance(x, dict):
                    if algum(x):
                        return True
                elif isinstance(x, list):
                    if x:
                        return True
                elif x is not None:
                    return True
            return False
        return algum(v)
    return True


def varre_prosa(root: Path):
    """Por pasta: (arquivos_md_total, arquivos_sem_placeholder)."""
    out = {}
    for pasta, nivel in PROSA:
        d = root / "gemeo" / pasta
        if not d.is_dir():
            out[pasta] = (nivel, 0, 0)
            continue
        mds = [p for p in d.rglob("*.md") if p.name != "README.md"
               and "TEMPLATE" not in p.name.upper()]
        ok = [p for p in mds if "[PREENCHER" not in p.read_text(encoding="utf-8")]
        out[pasta] = (nivel, len(mds), len(ok))
    return out


LINHA_DATA = re.compile(r"(\*\*Última atualização\*\*: )(\d{4}-\d{2}-\d{2})")


def data_estavel(conteudo: str, existente: str | None, hoje: str) -> str:
    """Troca a data de `conteudo` por `hoje` — ou pela já gravada, se nada mais mudou.

    A data só avança quando o conteúdo (tudo menos a própria linha da data) muda; assim o
    arquivo versionado não envelhece sozinho e o CI não fica vermelho por passagem do tempo.
    """
    def sem_data(t: str) -> str:
        return LINHA_DATA.sub(r"\1_", t)

    data = hoje
    if existente is not None:
        m = LINHA_DATA.search(existente)
        if m and sem_data(existente).strip() == sem_data(conteudo).strip():
            data = m.group(2)
    return LINHA_DATA.sub(lambda m: m.group(1) + data, conteudo)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--canon")
    ap.add_argument("--write", action="store_true")
    ap.add_argument("--json", action="store_true")
    a = ap.parse_args()

    cpath = canon_path(override=a.canon)
    root = cpath.parent.parent.parent  # .../gemeo/00-CANON/canon.yaml → raiz
    canon = load_yaml(cpath)

    removidas = set(get_path(canon, "_meta.secoes_removidas") or [])
    sec = {n: secao_preenchida(canon, n) for n, _ in SECOES}
    prosa = varre_prosa(root)

    # nível atingido: todas as seções de canon do nível N preenchidas E
    # toda prosa de nível <= N sem placeholders.
    # Seções em _meta.secoes_removidas contam como N/A (não bloqueiam o nível).
    nivel = 0
    for alvo in (1, 2, 3):
        canon_ok = all(sec[n] for n, lv in SECOES if lv <= alvo and n not in removidas)
        prosa_ok = all(tot == 0 or ok == tot
                       for _, (lv, tot, ok) in prosa.items() if lv <= alvo)
        if canon_ok and (alvo == 1 or prosa_ok):
            nivel = alvo
        else:
            break

    hoje = os.environ.get("COMPLETUDE_HOJE") or datetime.date.today().isoformat()
    linhas = [
        "# COMPLETUDE — manifesto do Gêmeo Digital",
        "",
        "> **Gerado mecanicamente por `scripts/completude.py` — não editar à mão.**",
        f"> **Última atualização**: {hoje} · **Nível atual**: {ESTRELAS[nivel]}",
        "",
        "## Canon (00-CANON/canon.yaml) — seções",
        "",
    ]
    for n, lv in SECOES:
        if n in removidas:
            linhas.append(f"- [—] `{n}` {'★' * lv} — N/A (removida em _meta.secoes_removidas)")
        else:
            linhas.append(f"- [{'x' if sec[n] else ' '}] `{n}` {'★' * lv}")
    linhas += ["", "## Prosa — pastas (arquivo conta sem `[PREENCHER]`)", ""]
    for pasta, (lv, tot, ok) in prosa.items():
        check = "x" if tot > 0 and ok == tot else " "
        linhas.append(f"- [{check}] `{pasta}` {'★' * lv} — {ok}/{tot} arquivos preenchidos")
    linhas += [
        "",
        "## Próximo nível",
        "",
        f"Nível atual: **{ESTRELAS[nivel]}**. Rode `/montar-gemeo` para avançar — "
        "ele prioriza os campos exigidos pelas perguntas de `00-CANON/perguntas-oraculo.md`.",
        "",
    ]
    conteudo = "\n".join(linhas)
    destino = root / "gemeo" / "COMPLETUDE.md"
    existente = destino.read_text(encoding="utf-8") if destino.exists() else None
    conteudo = data_estavel(conteudo, existente, hoje)

    payload = {"nivel": nivel, "nivel_label": ESTRELAS[nivel],
               "canon": sec, "prosa": {k: {"nivel": v[0], "total": v[1], "ok": v[2]}
                                       for k, v in prosa.items()}}
    if a.write:
        destino.write_text(conteudo, encoding="utf-8")
        print(f"COMPLETUDE.md regenerado — nível: {ESTRELAS[nivel]}")
    else:
        emit(payload, a.json, conteudo)


if __name__ == "__main__":
    main()
