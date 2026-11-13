#!/usr/bin/env python3
"""Traz a spec ATIVA do Spec Kit para a fila de trabalho, em `tasks/spec.md`.

Por que existe: um projeto tem N specs em `specs/`, cada uma com um `tasks.md` de dezenas de
tarefas `T0xx`, e nada disso chegava ao motor de prioridade, ao painel do projeto ou à matriz
Eisenhower do cofre — o trabalho de maior compromisso do projeto era o único invisível na fila.
Importar todas inundaria: medido em DATA-DOSSIE, 74 tarefas só na spec 012 contra 129 itens
abertos no resto da fila. A spec ativa já é declarada em `.specify/feature.json`, e é o único
recorte que interessa.

**Granularidade: uma linha por User Story/fase aberta, não por `T0xx`.** As 17 tarefas abertas
da spec 012 têm a MESMA data, a mesma área e a mesma severidade — o motor não as diferencia e
elas empatam em bloco na matriz, afogando o resto da fila. Agregadas por fase são 4 itens, com
severidade vinda do `(Priority: P1)` do heading. O detalhe fica na spec, que é onde a ordem
(dependências, TDD) já está resolvida.

**`tasks/spec.md` é GERADO e é espelho de leitura**: a verdade é `specs/<ativa>/tasks.md`, e
quem fecha tarefa é o `/speckit-implement` marcando `[X]` lá. O que o humano escreve NESTE
arquivo e o merge preserva: `🎯` (prazo), `#eis/qN`, `#area/` e `📅`.

Stdlib pura de propósito (nem `_gemeo_lib`, nem PyYAML): o script é propagado a 21 repositórios
que não compartilham dependências, e ele só lê JSON e Markdown.

DRY-RUN por padrão: sem `--apply` nada é escrito.

Uso:
  python3 scripts/importar-spec.py                       # mostra o que faria
  python3 scripts/importar-spec.py --apply
  python3 scripts/importar-spec.py --tasks tasks-x --area seguranca --apply
"""

from __future__ import annotations

import argparse
import datetime
import json
import re
import subprocess
import sys
from pathlib import Path

ARQUIVO = "spec.md"

# `## Phase 3: User Story 1 - Skill /pentest (Priority: P1) 🎯 MVP`
# `Fase` além de `Phase`: o `/speckit-tasks` escreve o heading no idioma da spec, e um
# tasks.md em português zerava a fila inteira — DATA-DOSSIE 014 dava "nenhuma fase com tarefa
# aberta" com 39 tarefas abertas, porque nenhum heading casava e toda tarefa ficava órfã.
FASE_RE = re.compile(
    r"^##\s+(?P<rotulo>Phase|Fase)\s+(?P<n>\d+)\s*[:.\-–—]\s*(?P<resto>.+?)\s*$",
    re.IGNORECASE)
# O separador entre "User Story 3" e o título varia no acervo: `-` no boilerplate, `—` no
# DATA-DOSSIE. Aceitar os dois evita a fase inteira virar título sem US.
US_RE = re.compile(r"^User\s+Story\s+(?P<n>\d+)\s*[:.\-–—·]?\s*(?P<titulo>.*)$", re.IGNORECASE)
# Forma curta `US1 — título`. Separador OBRIGATÓRIO aqui: sem ele, `US1 + US3 — Criação…`
# (fase que cobre duas stories) viraria US1 com título `+ US3 — Criação…`.
US_CURTA_RE = re.compile(r"^US\s*(?P<n>\d+)\s*[:.\-–—·]\s*(?P<titulo>.+)$", re.IGNORECASE)
# Tolerante ao que acompanha a prioridade dentro dos parênteses: `(Priority: P1)`,
# `(US1, Priority: P0)`, `(Priority: P1) - FOUNDATIONAL`.
PRIORITY_RE = re.compile(r"\(\s*[^()]*?Priority\s*:\s*(?P<p>P\d)[^()]*\)", re.IGNORECASE)
# `(P1)` sem a palavra `Priority`: forma dos tasks.md em português e de parte do acervo em
# inglês. Sem isto, toda user story dessas specs cai no default `média`.
PRIORITY_CURTA_RE = re.compile(r"\(\s*(?P<p>P\d)\s*\)", re.IGNORECASE)
TAREFA_RE = re.compile(r"^\s*-\s*\[(?P<state>[ xX/\-])\]\s*(?P<body>.*)$")
# `T002a` (tarefa inserida entre duas já numeradas) é comum nas regerações — sem o sufixo
# ela conta como aberta mas fica fora do ponteiro `Local:`.
TID_RE = re.compile(r"\bT(?P<n>\d{3,}[a-z]?)\b")
MARKER_RE = re.compile(r"\s*\[prio:\s*-?[0-9.]+\s+calc:prioridade\]")
SPEC_DECLARADA_RE = re.compile(r"\*\*Spec:\*\*\s*`([^`]+)`")

# Marcadores que o humano escreve NESTE arquivo e o merge preserva (ver docstring).
PRAZO_RE = re.compile(r"🎯\s*\d{4}-\d{2}-\d{2}")
DATA_RE = re.compile(r"📅\s*(\d{4}-\d{2}-\d{2})")
EIS_RE = re.compile(r"#eis/q[1-4]\b", re.IGNORECASE)
AREA_RE = re.compile(r"#area/\S+")

# P0 aparece no acervo como "mais urgente que P1" (`(US1, Priority: P0)`); P4+ não aparece
# e cai no default.
SEVERIDADE = {"P0": "🔺 alta", "P1": "🔺 alta", "P2": "🔼 média", "P3": "🔽 baixa"}
# Fases sem `(Priority: …)`. Setup e Foundational bloqueiam TODAS as user stories — o próprio
# tasks.md as marca "⚠️ CRITICAL" — então herdam alta. Polish é o oposto.
SEVERIDADE_FASE = (
    (re.compile(r"foundational|setup", re.IGNORECASE), "🔺 alta"),
    (re.compile(r"polish|cross-cutting", re.IGNORECASE), "🔽 baixa"),
)


def linhas_uteis(texto: str):
    """Linhas fora de bloco de código. O `tasks.md` do Spec Kit tem seções
    "Parallel Example" com `- [ ]` dentro de fence — sem isto elas entram na contagem."""
    dentro = False
    for ln in texto.splitlines():
        if re.match(r"^\s*(```|~~~)", ln):
            dentro = not dentro
            continue
        yield "" if dentro else ln


def slug(txt: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", txt.lower()).strip("-")[:50]


def severidade_de(resto: str) -> str:
    m = PRIORITY_RE.search(resto) or PRIORITY_CURTA_RE.search(resto)
    if m:
        return SEVERIDADE.get(m.group("p").upper(), "🔼 média")
    for padrao, sev in SEVERIDADE_FASE:
        if padrao.search(resto):
            return sev
    return "🔼 média"


def titulo_de(resto: str) -> tuple[str | None, str]:
    """(`US3` ou None, título limpo) a partir do texto depois de `## Phase N:`."""
    limpo = PRIORITY_CURTA_RE.sub("", PRIORITY_RE.sub("", resto))
    limpo = re.sub(r"🎯\s*MVP", "", limpo)
    limpo = re.sub(r"\s*\(\s*\)\s*", " ", limpo).strip()
    limpo = limpo.strip(" -–—·:")
    m = US_RE.match(limpo) or US_CURTA_RE.match(limpo)
    if m and m.group("titulo").strip():
        return f"US{m.group('n')}", m.group("titulo").strip()
    return None, limpo


def parse_spec(texto: str) -> tuple[list[dict], int, int]:
    """(fases com item aberto, total de tarefas, total fechadas) do tasks.md da spec."""
    fases: list[dict] = []
    atual = None
    total = fechadas = 0
    for ln in linhas_uteis(texto):
        mf = FASE_RE.match(ln)
        if mf:
            us, titulo = titulo_de(mf.group("resto"))
            atual = {"us": us, "titulo": titulo, "severidade": severidade_de(mf.group("resto")),
                     "fase": int(mf.group("n")), "rotulo": mf.group("rotulo").capitalize(),
                     "abertas": 0, "feitas": 0, "ids": []}
            fases.append(atual)
            continue
        # Outro `##` encerra a fase: "Dependencies", "Parallel Example" e "Implementation
        # Strategy" também citam tarefas, e sem isto elas contariam na última fase vista.
        if ln.startswith("## "):
            atual = None
            continue
        mt = TAREFA_RE.match(ln)
        if not mt:
            continue
        total += 1
        aberta = mt.group("state") in (" ", "/")
        if not aberta:
            fechadas += 1
        if atual is None:
            continue
        atual["abertas" if aberta else "feitas"] += 1
        mid = TID_RE.search(mt.group("body"))
        if aberta and mid:
            atual["ids"].append(f"T{mid.group('n')}")
    return [f for f in fases if f["abertas"]], total, fechadas


def chave(body: str) -> str:
    """Identidade da linha, estável entre regenerações: a US, ou o slug do título.

    O progresso `(4/12)` sai fora de propósito — ele muda a cada tarefa fechada, e se
    entrasse na identidade o item seria novo a cada sync (prazo preservado perdido, idade
    zerada). Mesmo cuidado de `prioridade.py:_id_from_body`.
    """
    limpo = MARKER_RE.sub("", body).strip()
    m = re.match(r"^(US\d+)\b", limpo)
    if m:
        return m.group(1).lower()
    return slug(re.sub(r"\s*\(\d+/\d+\).*$", "", limpo))


def marcadores_humanos(alvo: Path) -> dict[str, dict[str, str]]:
    """O que o humano escreveu no espelho e o merge preserva, por chave de item."""
    if not alvo.exists():
        return {}
    out: dict[str, dict[str, str]] = {}
    for ln in linhas_uteis(alvo.read_text(encoding="utf-8")):
        mt = TAREFA_RE.match(ln)
        if not mt:
            continue
        body = MARKER_RE.sub("", mt.group("body"))
        guardado = {}
        for nome, padrao in (("prazo", PRAZO_RE), ("eis", EIS_RE), ("area", AREA_RE)):
            m = padrao.search(body)
            if m:
                guardado[nome] = m.group(0)
        m = DATA_RE.search(body)
        if m:
            guardado["data"] = m.group(1)
        if guardado:
            out[chave(body)] = guardado
    return out


def abertas_em(texto: str) -> int:
    n = 0
    for ln in linhas_uteis(texto):
        mt = TAREFA_RE.match(ln)
        if mt and mt.group("state") in (" ", "/"):
            n += 1
    return n


def data_criacao(root: Path, arquivo: Path) -> str:
    """Quando a spec entrou no repositório — é a data de REGISTRO (`📅`) dos itens dela.
    Mesma cascata de `prioridade.py:parse_tasks`: git primeiro, mtime como último recurso."""
    try:
        saida = subprocess.run(
            ["git", "-C", str(root), "log", "--diff-filter=A", "--format=%ad",
             "--date=short", "--", str(arquivo)],
            capture_output=True, text=True, timeout=10, check=False).stdout.strip()
        if saida:
            return saida.splitlines()[-1].strip()
    except (OSError, subprocess.SubprocessError):
        pass
    try:
        return datetime.date.fromtimestamp(arquivo.stat().st_mtime).isoformat()
    except OSError:
        return datetime.date.today().isoformat()


def referencia(fase: dict) -> str:
    """Onde estão as tarefas abertas da fase, dentro do tasks.md da spec.

    Lista os IDs enquanto couber; só acima de 6 vira faixa. `T053…T061` numa fase cujos
    abertos são T053, T055, T058, T059, T061 leria como um intervalo contíguo e mandaria
    quem for executar abrir 9 tarefas em vez de 5.
    """
    ids = fase["ids"]
    if not ids:
        return f"{fase.get('rotulo', 'Phase')} {fase['fase']}"
    if len(ids) <= 6:
        return ", ".join(ids)
    return f"{ids[0]}…{ids[-1]} ({len(ids)} tarefas)"


def render(feature: Path, fases: list[dict], total: int, fechadas: int,
           data: str, area: str, guardados: dict) -> str:
    nome = feature.name
    rotulo = re.sub(r"^\d+-", "", nome).replace("-", " ").title()
    numero = (re.match(r"^(\d+)-", nome) or [None, None])[1]
    pct = round(100 * fechadas / total) if total else 0
    cabeca = f"{numero} — {rotulo}" if numero else rotulo

    L = [f"# Spec ativa — {numero + ' ' if numero else ''}{rotulo}", "",
         "<!-- GERADO por scripts/importar-spec.py a partir de .specify/feature.json.",
         f"     A verdade é {feature.as_posix()}/tasks.md — o que você editar aqui se perde no",
         "     próximo sync, EXCETO 🎯 (prazo), #eis/qN, #area/ e 📅, que são preservados. -->",
         "",
         f"**Spec:** `{feature.as_posix()}/`",
         f"**Progresso:** {fechadas}/{total} tarefas ({pct}%)", "",
         f"## {cabeca}", ""]

    if not fases:
        L += ["_Nenhuma fase com tarefa aberta: a spec ativa está concluída (ou ainda não tem",
              "`tasks.md` gerado). Nada entra na fila._", ""]
        return "\n".join(L) + "\n"

    for f in fases:
        prefixo = f"{f['us']} — " if f["us"] else ""
        feitas, abertas = f["feitas"], f["abertas"]
        g = guardados.get(chave(f"{prefixo}{f['titulo']}"), {})
        # `[/]` quando a fase já tem tarefa fechada: o motor tira `[/]` dos quadrantes por
        # "já recebeu atenção", que é exatamente o estado de uma fase em andamento.
        estado = "/" if feitas else " "
        marcas = [f"📅 {g.get('data', data)}"]
        if g.get("prazo"):
            marcas.append(g["prazo"])
        marcas.append(f["severidade"])
        marcas.append(g.get("area") or f"#area/{area}")
        if g.get("eis"):
            marcas.append(g["eis"])
        marcas.append("🤖")
        L.append(f"- [{estado}] {prefixo}{f['titulo']} ({feitas}/{feitas + abertas}) "
                 + " ".join(marcas))
        L.append(f"  - Local: `{feature.as_posix()}/tasks.md` — {referencia(f)}")
        L.append(f"  - Ação: `/speckit-implement` na {f.get('rotulo', 'Phase')} "
                 f"{f['fase']} "
                 f"({abertas} tarefa(s) aberta(s))")
    L.append("")
    return "\n".join(L) + "\n"


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--tasks", help="diretório da fila (default: <repo>/tasks)")
    ap.add_argument("--area", default="desenvolvimento",
                    help="área de roteamento dos itens (default: desenvolvimento)")
    ap.add_argument("--apply", action="store_true", help="escreve (sem isto, dry-run)")
    args = ap.parse_args()

    root = Path(__file__).resolve().parent.parent
    tdir = Path(args.tasks).resolve() if args.tasks else root / "tasks"
    if not tdir.is_dir():
        return 0  # projeto sem sistema de tarefas: nada a fazer, e não é erro
    alvo = tdir / ARQUIVO
    antigo = alvo.read_text(encoding="utf-8") if alvo.exists() else ""

    def remover(motivo: str) -> int:
        """Fila órfã é pior que fila sem spec: um `spec.md` de uma spec que saiu de foco
        seguiria priorizado e no cofre, sem nada que o atualizasse."""
        if not alvo.exists():
            return 0
        print(f"  {ARQUIVO}: {'removido' if args.apply else 'removeria'} — {motivo}")
        if args.apply:
            alvo.unlink()
        return 0

    fjson = root / ".specify" / "feature.json"
    if not fjson.exists():
        return remover("projeto sem .specify/feature.json")
    try:
        feature_txt = (json.loads(fjson.read_text(encoding="utf-8")) or {}).get(
            "feature_directory")
    except (OSError, ValueError) as e:
        print(f"  aviso: {fjson} ilegível ({e}) — {ARQUIVO} intocado", file=sys.stderr)
        return 0
    if not feature_txt:
        return remover("feature.json sem feature_directory")

    feature = Path(feature_txt)
    spec_tasks = root / feature / "tasks.md"
    if not spec_tasks.exists():
        return remover(f"{feature.as_posix()}/tasks.md não existe (rode /speckit-tasks)")

    # Spec ativa trocada com trabalho aberto para trás: o conteúdo sai da fila e ninguém
    # avisaria. Não é erro — é informação para quem lê a saída do sync.
    ma = SPEC_DECLARADA_RE.search(antigo)
    if ma and ma.group(1).rstrip("/") != feature.as_posix():
        print(f"  aviso: spec ativa mudou de {ma.group(1).rstrip('/')} para "
              f"{feature.as_posix()} — {abertas_em(antigo)} item(ns) da anterior saem da fila",
              file=sys.stderr)

    fases, total, fechadas = parse_spec(spec_tasks.read_text(encoding="utf-8"))
    novo = render(feature, fases, total, fechadas, data_criacao(root, spec_tasks),
                  args.area, marcadores_humanos(alvo))
    abertas = sum(f["abertas"] for f in fases)
    resumo = (f"{ARQUIVO}: {len(fases)} item(ns) de {feature.name} — "
              f"{abertas} tarefa(s) aberta(s) de {total}")
    if novo == antigo:
        print(f"  {resumo} (já em dia)")
        return 0
    print(f"  {resumo}" + ("" if args.apply else " [DRY-RUN — rode com --apply]"))
    if args.apply:
        alvo.write_text(novo, encoding="utf-8")
    return 0


if __name__ == "__main__":
    sys.exit(main())
