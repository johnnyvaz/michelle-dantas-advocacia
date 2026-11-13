#!/usr/bin/env python3
"""Relatório de situação, em Markdown, no cofre — para copiar e encaminhar.

SOB DEMANDA e local: não envia nada para ninguém, não agenda nada. Lê o que cada projeto já
publicou no cofre (`<projeto>/_estado.json`, escrito pelo sync) e escreve
`Relatórios/AAAA-MM-DD — Relatório.md`. Nenhum repositório é lido, então roda de qualquer lugar.

Agrupa por `#area/<area>` — a tag que as tarefas já usam — ou por projeto.

Uso:
  python3 scripts/relatorio.py [--vault DIR] [--por area|projeto] [--area seguranca]
                               [--asof AAAA-MM-DD] [--stdout]
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

QUADRANTES = (("q1", "🔴 Fazer agora"), ("q2", "🗓 Agendar"), ("q3", "⚡ Rápido ou delegar"))


def detecta_vault() -> Path | None:
    """Mesma regra do sync: cofre é a pasta com `.obsidian/`, preferindo a já usada."""
    cands = [p for base in (Path("/mnt/c/Users").glob("*/Documents/Obsidian/*"),
                            (Path.home() / "Documents" / "Obsidian").glob("*"))
             for p in base if (p / ".obsidian").is_dir()]
    usados = [p for p in cands if (p / "00 Painel Geral.md").exists()]
    if len(usados) == 1:
        return usados[0]
    return cands[0] if len(cands) == 1 else None


def carrega(vault: Path) -> list[dict]:
    out = []
    for f in sorted(vault.glob("*/_estado.json")):
        try:
            out.append(json.loads(f.read_text(encoding="utf-8")))
        except (OSError, json.JSONDecodeError) as e:
            print(f"aviso: {f} ilegível ({e})", file=sys.stderr)
    return out


def itens(estados: list[dict]) -> list[dict]:
    """Itens da matriz de todos os projetos, com o projeto anotado."""
    out = []
    for e in estados:
        m = (e.get("matriz") or {})
        if not m.get("calculada"):
            continue
        for chave, _ in QUADRANTES:
            for i in m.get(chave, []):
                out.append({**i, "projeto": e.get("projeto"), "quadrante": chave})
    return out


def _ev(i: dict) -> float:
    return float("inf") if i.get("ev_infinito") else (i.get("ev") or 0)


def render(estados: list[dict], todos: list[dict], por: str, asof: str,
           filtro: str | None, pessoa: str | None = None) -> str:
    if filtro:
        todos = [i for i in todos if (i.get("area") or "sem-área") == filtro]
    if pessoa:
        # Relatório de uma pessoa: só o que depende dela. É o que se encaminha para cobrar
        # ou alinhar, sem obrigar quem recebe a filtrar o backlog dos outros.
        alvo = pessoa.strip().lower()
        todos = [i for i in todos if (i.get("pessoa") or "").strip().lower() == alvo]

    def chave(i):
        return (i.get("area") or "sem-área") if por == "area" else (i.get("projeto") or "?")

    grupos: dict[str, list] = {}
    for i in todos:
        grupos.setdefault(chave(i), []).append(i)

    decisoes = [i for i in todos if i.get("tipo") == "decisao"]
    abertas = sum(e.get("abertas", 0) for e in estados)
    pendentes = sum(e.get("humano_pendentes", 0) for e in estados)
    atrasadas = sum(e.get("tarefas_atrasadas", 0) for e in estados)

    titulo = f"Relatório de situação — {asof}" if not pessoa else f"{pessoa} — o que depende de você ({asof})"
    L = ["---", f"gerado: {asof}", f"por: {por}",
         *( [f"pessoa: {pessoa}"] if pessoa else [] ), "---", "",
         f"# {titulo}", "",
         "> Gerado por `scripts/relatorio.py` a partir do que cada projeto publicou no cofre.",
         "> Espelho de leitura: para mudar algo, mexa no repositório.", ""]

    q1 = len([i for i in todos if i["quadrante"] == "q1"])
    if pessoa:
        # Escopo do relatório é a pessoa: repetir os totais do negócio aqui só confunde quem
        # recebe — ele não precisa saber o tamanho do backlog dos outros.
        L += ["## O que depende de você", "",
              f"- **{len(todos)} item(ns)** priorizado(s) aguardando você",
              f"- **{q1} em Q1** — importante e urgente",
              f"- em {len({i['projeto'] for i in todos})} frente(s) de trabalho"]
        # Prazo vencido DA PESSOA. `atrasadas` soma os 21 projetos do cofre e entrava aqui:
        # quem recebia o relatório lia atraso alheio como se fosse dele. Mesmo motivo do
        # comentário acima — o escopo deste documento é uma pessoa.
        vencidos = len([i for i in todos
                        if i.get("prazo") and str(i["prazo"]) < str(asof)])
        if vencidos:
            L.append(f"- ⚠️ **{vencidos} item(ns) com prazo vencido**")
    else:
        L += ["## Onde estamos", "",
              f"- **{abertas} tarefas abertas** em {len([e for e in estados if e.get('abertas')])} "
              f"projeto(s) com trabalho ativo, de {len(estados)} acompanhados",
              f"- **{pendentes} decisões** aguardando o dono — cada uma bloqueia trabalho",
              f"- **{q1} itens em Q1** (importante e urgente)"]
        if atrasadas:
            L.append(f"- ⚠️ **{atrasadas} item(ns) com prazo vencido**")
    L.append("")

    if decisoes:
        cab = (f"## 🙋 Decisões suas ({len(decisoes)})" if pessoa
               else f"## 🙋 Esperando decisão ({len(decisoes)})")
        L += [cab, "",
              "Priorizadas por valor esperado. Bloqueiam o trabalho listado adiante.", ""]
        for i in sorted(decisoes, key=lambda x: -_ev(x))[:12]:
            area = f" · `#area/{i['area']}`" if i.get("area") else ""
            L.append(f"- **{i['titulo']}** — {i['projeto']}{area}")
        L.append("")

    rotulo = "Área" if por == "area" else "Projeto"
    L += [f"## Por {rotulo.lower()}", ""]
    for nome in sorted(grupos, key=lambda k: (-len(grupos[k]), k)):
        g = grupos[nome]
        L += [f"### {rotulo}: {nome} — {len(g)} item(ns)", ""]
        for chave_q, titulo_q in QUADRANTES:
            do_q = sorted([i for i in g if i["quadrante"] == chave_q], key=lambda x: -_ev(x))
            if not do_q:
                continue
            L.append(f"**{titulo_q}** ({len(do_q)})")
            L.append("")
            for i in do_q[:8]:
                proj = "" if por == "projeto" else f" — {i['projeto']}"
                L.append(f"- {i['titulo']}{proj}")
            if len(do_q) > 8:
                L.append(f"- _+{len(do_q) - 8} item(ns)_")
            L.append("")

    L += ["## Método", "",
          "Importância vem do score Bayesiano de `scripts/prioridade.py`; urgência, do prazo",
          "ou da idade sem atenção. Q4 (nem importante nem urgente) fica fora deste relatório",
          "de propósito. A matriz completa está em `00 Matriz Eisenhower`.", ""]
    return "\n".join(L)


def main() -> int:
    ap = argparse.ArgumentParser(description="Relatório de situação em Markdown no cofre.")
    ap.add_argument("--vault")
    ap.add_argument("--por", choices=["area", "projeto"], default="area")
    ap.add_argument("--area", help="só uma área (ex.: seguranca)")
    ap.add_argument("--pessoa", help="só o que depende desta pessoa (ex.: Leonardo)")
    ap.add_argument("--asof", help="data do relatório (default: hoje)")
    ap.add_argument("--stdout", action="store_true", help="imprime em vez de gravar")
    a = ap.parse_args()

    vault = Path(a.vault) if a.vault else detecta_vault()
    if not vault or not (vault / ".obsidian").is_dir():
        print("✗ cofre não encontrado — use --vault <caminho>", file=sys.stderr)
        return 2

    estados = carrega(vault)
    if not estados:
        print(f"✗ nenhum _estado.json em {vault} — rode o sync antes", file=sys.stderr)
        return 1

    import datetime
    asof = a.asof or datetime.date.today().isoformat()
    texto = render(estados, itens(estados), a.por, asof, a.area, a.pessoa)

    if a.stdout:
        print(texto)
        return 0
    destino = vault / "Relatórios"
    destino.mkdir(exist_ok=True)
    sufixo = f" — {a.pessoa}" if a.pessoa else (f" — {a.area}" if a.area else "")
    alvo = destino / f"{asof} — Relatório{sufixo}.md"
    alvo.write_text(texto + "\n", encoding="utf-8")
    print(f"✓ {alvo}")
    print(f"  {len(estados)} projeto(s) · pronto para copiar e encaminhar")
    return 0


if __name__ == "__main__":
    sys.exit(main())
