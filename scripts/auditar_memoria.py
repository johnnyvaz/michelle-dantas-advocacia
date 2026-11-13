#!/usr/bin/env python3
"""auditar_memoria.py — lint da memória de área (gemeo/12-AGENTES/*/memoria.md).

Passo 7 do /auditar-gemeo. Só leitura: **aponta**, nunca corrige nem apaga — promoção a
playbook e poda são decisão humana (.claude/rules/memoria.md). Camadas 4 (procedural) e 5
(esquecimento) da memória, mecanizadas: o que dá para achar sem inferência.

  🔴 quebra  (exit 1): cronologia fora de ordem · data inválida · `tipo` fora do vocabulário ·
                       `correcao` sem `supersede` · `supersede` sem entrada-alvo
  🟡 aviso   (exit 0): contradição possível (mesmo tema, duas preferencia/correcao sem cadeia) ·
                       referência morta (caminho em crase que não existe) · candidata a playbook
                       (mesmo tema ou identificador em ≥ N entradas, ausente do playbook.md)
  ℹ️ informativo:     tamanho (linhas, bytes, entradas, mais longa) · entradas sem metadados ·
                       referência externa (extensão que não existe neste repositório)

Uso: auditar_memoria.py [--raiz PATH] [--min-cluster 3] [--json]
Exit: 0 ok/avisos · 1 quebra · 2 uso.
Formato do timeline: gemeo/12-AGENTES/_FRAMEWORK/memoria-template.md

Calibrado contra a única memória real da PH3A (DATA-DOSSIE, 63 entradas, 2026-09-16): os
filtros de `_token_caminho` existem porque `LIMIT/OFFSET`, `America/Sao_Paulo`, `/login`,
`process.env`, `csv-parse/sync` e `Controller.metodo/outro` apareceram em crase e não são
caminho — e `.playwright-cli/` é, mas perdia o ponto no strip.
"""

from __future__ import annotations

import argparse
import datetime as dt
import os
import re
import sys
import unicodedata
from collections import defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from _gemeo_lib import EXIT_DADO, EXIT_OK, die_uso, emit  # noqa: E402

HEADING_RE = re.compile(r"^## (\d{4}-\d{2}-\d{2})\s*[—–-]\s*(.+?)\s*$")
QUALQUER_H2_RE = re.compile(r"^## ")
META_PAR_RE = re.compile(r"(tipo|tema|ref|supersede)\s*:\s*([^·|;]+)")
META_LINHA_RE = re.compile(r"^\s*>?\s*(?:(?:tipo|tema|ref|supersede)\s*:\s*[^·|;]+\s*[·|;]?\s*)+$")
CRASE_RE = re.compile(r"`([^`\n]+)`")
# `- _(vazio)_` · `- _(vazio)_ — <projeto ativo> — …` · `- (vazio — preencher…)` · `- <item>`
PLACEHOLDER_RE = re.compile(r"^-\s*(?:_?\((?:vazio|nenhum|nenhuma|nada)\b.*|_\(.*\)_.*|<.*>.*)$")
TIPOS = {"aprendizado", "correcao", "preferencia", "descarte"}
EXTENSOES = (".py", ".md", ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".json", ".yaml", ".yml",
             ".sh", ".sql", ".cs", ".txt", ".toml", ".html", ".css", ".tf", ".conf", ".ini",
             ".http", ".csv", ".example")
DIRS_IGNORADOS = {".git", "node_modules", ".pnpm-store", "dist", "build", "coverage", "__pycache__",
                  ".venv", "venv", ".complexity-venv", ".tmp", ".playwright-cli", ".jscpd-report",
                  ".specify", ".terraform"}
PARA_SECOES = ("## Projects", "## Areas", "## Resources", "## Archives", "## Linha do tempo")
GENERICOS = {"web", "api", "src", "tasks", "scripts", "gemeo", "docs", "infra", "specs", "tests",
             "lib", "app", "main", "public"}
CARACTERES_NAO_CAMINHO = set(" ()=<>{}*$?\"'\t")


# ------------------------------------------------------------------ util

def _sem_acento(s: str) -> str:
    return "".join(c for c in unicodedata.normalize("NFD", s) if unicodedata.category(c) != "Mn")


def _data(s: str) -> dt.date | None:
    try:
        return dt.date.fromisoformat(s)
    except ValueError:
        return None


def _extensao(t: str) -> str | None:
    base = t.rstrip("/").rsplit("/", 1)[-1].lower()
    for ext in EXTENSOES:
        if base.endswith(ext) and base != ext:
            return ext
    return None


def _token_caminho(tok: str, raiz: Path) -> str | None:
    """Normaliza um trecho em crase para candidato a caminho do repositório; None se não parece.

    Parece caminho quando: tem extensão conhecida no último segmento, ou termina em `/`, ou o
    primeiro segmento é uma pasta que existe na raiz. Barra sozinha não basta (`LIMIT/OFFSET`).
    Absoluto (`/login`, `~/.cache`) é rota/sistema, não arquivo do repo."""
    t = tok.strip().rstrip(",.;")
    if not t or "…" in t or "..." in t or CARACTERES_NAO_CAMINHO & set(t):
        return None
    if t.startswith(("-", "@", "http", "#", "/", "~")):
        return None
    t = t.split("#", 1)[0]
    if t.startswith("./"):
        t = t[2:]
    # `arquivo.ts:47,106` · `arquivo.ts:simbolo` → fica só o arquivo
    if ":" in t and _extensao(t.split(":", 1)[0]):
        t = t.split(":", 1)[0]
    if ":" in t:
        return None
    if _extensao(t):
        return t
    if t.endswith("/") and t.count("/") >= 1:
        return t
    if "/" in t and (raiz / t.split("/", 1)[0]).is_dir():
        return t
    return None


def _especifico(t: str) -> bool:
    """Identificador específico o bastante para formar cluster: arquivo (com extensão) ou
    caminho com algum segmento não genérico. `web/src`, `api/`, `tasks/` aparecem em tudo."""
    partes = [p for p in t.strip("/").split("/") if p]
    if not partes:
        return False
    if _extensao(t):
        return partes[-1].lower() not in GENERICOS
    return any(p.lower() not in GENERICOS for p in partes)


def _indice_repo(raiz: Path) -> tuple[set[str], set[str]]:
    """(basenames de arquivos e pastas, extensões presentes) — um walk só, pulando vendor."""
    nomes: set[str] = set()
    exts: set[str] = set()
    for _dirpath, dirnames, filenames in os.walk(raiz):
        dirnames[:] = [d for d in dirnames if d not in DIRS_IGNORADOS]
        nomes.update(filenames)
        nomes.update(dirnames)
        for f in filenames:
            e = _extensao(f)
            if e:
                exts.add(e)
    return nomes, exts


# ------------------------------------------------------------------ parse

def _linha_de_conteudo(ln: str) -> bool:
    s = ln.strip()
    if not s or s.startswith(("#", ">", "---", "|")) or s.startswith("```"):
        return False
    return not PLACEHOLDER_RE.match(s)


def parse_memoria(texto: str) -> dict:
    """Separa seções PARA de entradas datadas. Entrada = heading datado até o próximo `## `."""
    linhas = texto.splitlines()
    entradas: list[dict] = []
    atual: dict | None = None
    for i, ln in enumerate(linhas, 1):
        m = HEADING_RE.match(ln)
        if m:
            atual = {"linha": i, "data_str": m.group(1), "data": _data(m.group(1)),
                     "titulo": m.group(2), "corpo": [], "meta": {}, "meta_linha": None}
            entradas.append(atual)
            continue
        if QUALQUER_H2_RE.match(ln):
            atual = None
            continue
        if atual is None:
            continue
        if atual["meta_linha"] is None and not atual["corpo"] and ln.strip():
            if META_LINHA_RE.match(ln):
                atual["meta_linha"] = i
                for k, v in META_PAR_RE.findall(ln):
                    atual["meta"][k] = v.strip()
                continue
        atual["corpo"].append(ln)
    for e in entradas:
        while e["corpo"] and not e["corpo"][-1].strip():
            e["corpo"].pop()
        e["n_linhas"] = 1 + (1 if e["meta_linha"] else 0) + len(e["corpo"])
        e["texto"] = e["titulo"] + "\n" + "\n".join(e["corpo"])
    secoes = [s for s in PARA_SECOES if any(ln.startswith(s) for ln in linhas)]
    template_intacto = not entradas and not any(_linha_de_conteudo(ln) for ln in linhas)
    return {"entradas": entradas, "secoes_para": secoes, "template_intacto": template_intacto,
            "linhas": len(linhas), "bytes": len(texto.encode("utf-8"))}


# ------------------------------------------------------------------ checks

def auditar_area(area: str, arquivo: Path, raiz: Path, basenames: set[str], exts_repo: set[str],
                 min_cluster: int) -> dict:
    texto = arquivo.read_text(encoding="utf-8", errors="ignore")
    p = parse_memoria(texto)
    ents = p["entradas"]
    quebras: list[str] = []
    avisos: list[str] = []
    info: dict = {}
    rel = str(arquivo.relative_to(raiz))

    playbook = arquivo.parent / "playbook.md"
    playbook_txt = playbook.read_text(encoding="utf-8", errors="ignore") if playbook.exists() else ""

    if p["template_intacto"]:
        return {"area": area, "arquivo": rel, "status": "template_intacto", "entradas": 0,
                "linhas": p["linhas"], "bytes": p["bytes"], "quebras": [], "avisos": [], "info": {}}

    if len(p["secoes_para"]) < len(PARA_SECOES):
        faltam = [s.lstrip("# ") for s in PARA_SECOES if s not in p["secoes_para"]]
        info["estrutura"] = f"fora do padrão PARA — sem {', '.join(faltam)}"

    if not ents:
        return {"area": area, "arquivo": rel, "status": "vazia", "entradas": 0,
                "linhas": p["linhas"], "bytes": p["bytes"], "quebras": [], "avisos": [], "info": info}

    # 1) cronologia + data válida
    anterior: dt.date | None = None
    for e in ents:
        if e["data"] is None:
            quebras.append(f"L{e['linha']}: data inválida `{e['data_str']}`")
            continue
        if anterior and e["data"] < anterior:
            quebras.append(f"L{e['linha']}: cronologia quebrada — {e['data_str']} vem depois de {anterior}")
        anterior = e["data"]

    # 2) metadados
    sem_meta = 0
    por_tipo: dict[str, int] = defaultdict(int)
    datas_vistas: set[str] = set()
    for e in ents:
        if not e["meta"]:
            sem_meta += 1
        tipo = e["meta"].get("tipo")
        if tipo is not None:
            tipo_n = _sem_acento(tipo).lower().strip()
            if tipo_n not in TIPOS:
                quebras.append(f"L{e['linha']}: `tipo: {tipo}` fora do vocabulário {sorted(TIPOS)}")
            else:
                e["meta"]["tipo"] = tipo_n
                por_tipo[tipo_n] += 1
                if tipo_n == "correcao" and "supersede" not in e["meta"]:
                    quebras.append(f"L{e['linha']}: `tipo: correcao` sem `supersede` — "
                                   "correção tem de dizer o que substitui")
        sup = e["meta"].get("supersede")
        if sup is not None and sup not in datas_vistas:
            quebras.append(f"L{e['linha']}: `supersede: {sup}` não aponta para entrada anterior")
        datas_vistas.add(e["data_str"])
    info["sem_metadados"] = sem_meta
    info["por_tipo"] = dict(por_tipo)

    # 3) contradição possível — só entre entradas com tema (sem tag não há o que comparar)
    por_tema: dict[str, list[dict]] = defaultdict(list)
    for e in ents:
        tema = e["meta"].get("tema")
        if tema:
            por_tema[tema.strip()].append(e)
    info["entradas_com_tema"] = sum(len(v) for v in por_tema.values())
    for tema, grupo in por_tema.items():
        fortes = [e for e in grupo if e["meta"].get("tipo") in ("preferencia", "correcao")]
        if len(fortes) >= 2:
            supersedidas = {e["meta"].get("supersede") for e in fortes}
            soltas = [e for e in fortes
                      if e["data_str"] not in supersedidas and "supersede" not in e["meta"]]
            if len(soltas) >= 2:
                ls = ", ".join(f"L{e['linha']}" for e in soltas)
                avisos.append(f"contradição possível em `{tema}`: {len(soltas)} entradas "
                              f"preferencia/correcao sem cadeia de supersede ({ls})")
    if not por_tema:
        info["contradicao"] = "não avaliável — 0 entradas com `tema`"

    # 4) referências mortas (agrupadas por entrada) + externas + 5) clusters por identificador
    refs_mortas: list[dict] = []
    refs_externas: list[dict] = []
    por_ident: dict[str, set[int]] = defaultdict(set)
    for e in ents:
        vistos: set[str] = set()
        mortas_aqui: list[str] = []
        for tok in CRASE_RE.findall(e["texto"]):
            t = _token_caminho(tok, raiz)
            if not t or t in vistos:
                continue
            vistos.add(t)
            if _especifico(t):
                por_ident[t].add(e["linha"])
            if (raiz / t.rstrip("/")).exists():
                continue
            if Path(t.rstrip("/")).name in basenames:
                continue  # relativo a subpasta — existe em algum lugar do repo
            ext = _extensao(t)
            if ext and ext not in exts_repo:
                refs_externas.append({"linha": e["linha"], "ref": t, "ext": ext})
                continue  # `.cs` num repo TS: fala da fonte de outro repositório, não é morta
            mortas_aqui.append(t)
        if mortas_aqui:
            refs_mortas.append({"linha": e["linha"], "data": e["data_str"], "refs": mortas_aqui})
    for r in refs_mortas:
        lista = ", ".join(f"`{x}`" for x in r["refs"])
        avisos.append(f"L{r['linha']} ({r['data']}): {len(r['refs'])} referência(s) sem arquivo "
                      f"no repositório — {lista}")
    info["refs_mortas"] = sum(len(r["refs"]) for r in refs_mortas)
    info["refs_mortas_detalhe"] = refs_mortas
    info["refs_externas"] = refs_externas

    clusters: list[dict] = []
    for tema, grupo in por_tema.items():
        if len(grupo) >= min_cluster:
            clusters.append({"chave": tema, "tipo": "tema", "entradas": len(grupo),
                             "no_playbook": tema in playbook_txt})
    for ident, linhas_ in por_ident.items():
        if len(linhas_) >= min_cluster:
            clusters.append({"chave": ident, "tipo": "identificador", "entradas": len(linhas_),
                             "no_playbook": ident in playbook_txt})
    clusters.sort(key=lambda c: (-c["entradas"], c["chave"]))
    for c in clusters:
        if not c["no_playbook"]:
            avisos.append(f"candidata a playbook: `{c['chave']}` em {c['entradas']} entradas "
                          f"({c['tipo']}) e ausente de `{playbook.name}`")
    info["clusters"] = clusters
    info["clusters_ja_no_playbook"] = sum(1 for c in clusters if c["no_playbook"])

    # 6) tamanho — insumo do orçamento de contexto (tasks/ideas.md); medição, não achado
    maior = max(ents, key=lambda e: e["n_linhas"])
    info["tamanho"] = {
        "entradas": len(ents), "linhas": p["linhas"], "bytes": p["bytes"],
        "tokens_estimados": p["bytes"] // 4, "estimativa": "bytes/4 — ordem de grandeza, não medição",
        "media_linhas_por_entrada": round(sum(e["n_linhas"] for e in ents) / len(ents), 1),
        "mais_longa": {"linha": maior["linha"], "data": maior["data_str"],
                       "linhas": maior["n_linhas"], "titulo": maior["titulo"][:80]},
        "mais_antiga": min((e["data_str"] for e in ents if e["data"]), default=None),
        "mais_recente": max((e["data_str"] for e in ents if e["data"]), default=None),
    }

    status = "quebrada" if quebras else "ok"
    return {"area": area, "arquivo": rel, "status": status, "entradas": len(ents),
            "linhas": p["linhas"], "bytes": p["bytes"], "quebras": quebras, "avisos": avisos,
            "info": info}


def run(raiz: Path, min_cluster: int = 3) -> tuple[dict, int]:
    base = raiz / "gemeo" / "12-AGENTES"
    arquivos = (sorted(p for p in base.glob("*/memoria.md") if p.parent.name != "_FRAMEWORK")
                if base.exists() else [])
    basenames, exts = _indice_repo(raiz) if arquivos else (set(), set())
    areas = [auditar_area(p.parent.name, p, raiz, basenames, exts, min_cluster) for p in arquivos]
    resumo = {
        "areas": len(areas),
        "template_intacto": sum(1 for a in areas if a["status"] == "template_intacto"),
        "com_entradas": sum(1 for a in areas if a["entradas"]),
        "entradas": sum(a["entradas"] for a in areas),
        "quebras": sum(len(a["quebras"]) for a in areas),
        "avisos": sum(len(a["avisos"]) for a in areas),
    }
    payload = {"raiz": str(raiz), "min_cluster": min_cluster, "areas": areas, "resumo": resumo}
    if not arquivos:
        payload["aviso"] = "nenhum gemeo/12-AGENTES/*/memoria.md encontrado"
    code = EXIT_DADO if resumo["quebras"] else EXIT_OK
    payload["exit"] = code
    return payload, code


# ------------------------------------------------------------------ saída humana

def humano(payload: dict) -> str:
    out = [f"# Memória de área — lint ({payload['raiz']})", ""]
    if payload.get("aviso"):
        out.append(f"🟡 {payload['aviso']}")
    for a in payload["areas"]:
        icone = {"template_intacto": "⬜", "vazia": "⬜", "ok": "✅", "quebrada": "🔴"}[a["status"]]
        out.append(f"## {icone} {a['area']} — `{a['arquivo']}`")
        if a["status"] == "template_intacto":
            out.append("template intacto — 0 entradas (a área nunca gravou aprendizado)")
            out.append("")
            continue
        if a["info"].get("estrutura"):
            out.append(f"ℹ️ estrutura {a['info']['estrutura']}")
        if a["status"] == "vazia":
            out.append("sem entradas na linha do tempo")
            out.append("")
            continue
        t = a["info"]["tamanho"]
        out.append(f"ℹ️ {t['entradas']} entradas · {t['linhas']} linhas · {t['bytes']:,} bytes "
                   f"(≈{t['tokens_estimados']:,} tokens, {t['estimativa'].split(' — ')[0]}) · "
                   f"{t['mais_antiga']} → {t['mais_recente']} · média "
                   f"{t['media_linhas_por_entrada']} linhas/entrada · mais longa "
                   f"L{t['mais_longa']['linha']} ({t['mais_longa']['linhas']} linhas)")
        out.append(f"ℹ️ sem metadados: {a['info']['sem_metadados']}/{a['entradas']} · "
                   f"com tema: {a['info']['entradas_com_tema']} · "
                   f"clusters já no playbook: {a['info']['clusters_ja_no_playbook']}/"
                   f"{len(a['info']['clusters'])} · referências externas: {len(a['info']['refs_externas'])}")
        if a["info"].get("contradicao"):
            out.append(f"ℹ️ contradição: {a['info']['contradicao']}")
        for q in a["quebras"]:
            out.append(f"🔴 {q}")
        for w in a["avisos"]:
            out.append(f"🟡 {w}")
        out.append("")
    r = payload["resumo"]
    out.append(f"**Resumo:** {r['areas']} áreas · {r['template_intacto']} template intacto · "
               f"{r['com_entradas']} com entradas ({r['entradas']} no total) · "
               f"🔴 {r['quebras']} quebras · 🟡 {r['avisos']} avisos")
    if r["quebras"]:
        out.append("→ Próximo passo: corrigir as quebras (cronologia/metadados) — "
                   "são erros de formato, não de conteúdo.")
    elif r["avisos"]:
        out.append("→ Próximo passo: levar candidatas a playbook e referências mortas ao dono da "
                   "área — promover/supersedir é decisão humana.")
    elif r["areas"] and r["com_entradas"] == 0:
        out.append("→ Próximo passo: nenhuma área gravou aprendizado ainda — ver 'fechar o loop "
                   "de escrita' em tasks/backlog.md.")
    return "\n".join(out)


def main() -> None:
    ap = argparse.ArgumentParser(description="Lint da memória de área (passo 7 do /auditar-gemeo).")
    ap.add_argument("--raiz", default=".", help="raiz do projeto (default: .)")
    ap.add_argument("--min-cluster", type=int, default=3,
                    help="nº mínimo de entradas com o mesmo tema/identificador para virar "
                         "candidata (default 3)")
    ap.add_argument("--json", action="store_true")
    a = ap.parse_args()
    raiz = Path(a.raiz).resolve()
    if not raiz.is_dir():
        die_uso(f"raiz não é diretório: {raiz}")
    payload, code = run(raiz, a.min_cluster)
    emit(payload, a.json, humano(payload))
    sys.exit(code)


if __name__ == "__main__":
    main()
