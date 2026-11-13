#!/usr/bin/env python3
"""Inventário determinístico do código de um projeto — passo 1 (Reconhecer) do /mapear-projeto.

Faz a parte contável do mapa para que nenhum número dele nasça na prosa (gate `conta-visivel`):
arquivos, linhas, linguagens, manifests, pontos de entrada, módulos e o sha256 de cada arquivo
(base do refresh incremental). Só stdlib. Nunca lê nem lista segredo (gate `sem-exfiltracao`).

Uso:
    python3 inventario.py <alvo> [--out mapa/_inventario.json]
    python3 inventario.py <alvo> --diff mapa/_inventario.json   # o que mudou desde o mapa
"""
from __future__ import annotations

import argparse
import datetime as dt
import fnmatch
import hashlib
import json
import os
import re
import subprocess
import sys
from pathlib import Path, PurePosixPath

# Pastas que não são código do produto: dependências, build, o próprio corpus e o ferramental.
DIRS_IGNORADOS = {
    ".git", "node_modules", "gemeo", ".venv", "venv", "env", "__pycache__", "dist", "build",
    ".next", ".nuxt", ".cache", "coverage", ".pytest_cache", ".mypy_cache", ".ruff_cache",
    ".tox", ".claude", ".specify", ".tmp", "target", "vendor", ".idea", ".vscode", "plugins",
}

# Segredo nunca entra no inventário — nem o nome com hash, nem a contagem de linhas.
PADROES_SEGREDO = [
    ".env", ".env.*", "*.env", "*.pem", "*.key", "*.p12", "*.pfx", "*.keystore", "*.jks",
    "id_rsa*", "id_ed25519*", "credentials*.json", "secrets.*", "*.secret", ".npmrc", ".pypirc",
    "service-account*.json", ".netrc",
]

LINGUAGENS = {
    ".py": "Python", ".js": "JavaScript", ".mjs": "JavaScript", ".cjs": "JavaScript",
    ".jsx": "JavaScript", ".ts": "TypeScript", ".tsx": "TypeScript", ".go": "Go",
    ".java": "Java", ".kt": "Kotlin", ".cs": "C#", ".rb": "Ruby", ".php": "PHP", ".rs": "Rust",
    ".swift": "Swift", ".dart": "Dart", ".vue": "Vue", ".svelte": "Svelte", ".sql": "SQL",
    ".sh": "Shell", ".html": "HTML", ".css": "CSS", ".scss": "CSS", ".md": "Markdown",
    ".yml": "YAML", ".yaml": "YAML", ".json": "JSON", ".toml": "TOML", ".prisma": "Prisma",
    ".graphql": "GraphQL", ".proto": "Protobuf", ".tf": "Terraform",
}
TEXTO = set(LINGUAGENS) | {".txt", ".ini", ".cfg", ".xml", ".gradle", ".lock"}

MANIFESTS = {
    "package.json", "pyproject.toml", "requirements.txt", "setup.py", "setup.cfg", "Pipfile",
    "go.mod", "Cargo.toml", "pom.xml", "build.gradle", "build.gradle.kts", "Gemfile",
    "composer.json", "pubspec.yaml", "Dockerfile", "docker-compose.yml", "docker-compose.yaml",
    "compose.yml", "compose.yaml", "Makefile", "schema.prisma", "supabase/config.toml",
}
CI = (".github/workflows/", ".gitlab-ci.yml", "azure-pipelines.yml", "bitbucket-pipelines.yml",
      "Jenkinsfile")

ENTRYPOINTS = {
    "main.py", "app.py", "manage.py", "__main__.py", "wsgi.py", "asgi.py", "server.py",
    "index.js", "index.ts", "server.js", "server.ts", "main.js", "main.ts", "app.js", "app.ts",
    "main.go", "Program.cs", "main.rs", "page.tsx", "layout.tsx", "App.tsx", "App.vue",
}
# Script Python executável tem nome livre (painel.py, gestor.py): o guarda `__main__` o denuncia.
GUARDA_MAIN = re.compile(r"""^if\s+__name__\s*==\s*['"]__main__['"]\s*:""", re.M)

# Pastas-contêiner: o módulo é a subpasta (src/pagamentos, apps/web, packages/core).
CONTEINERES = {"src", "app", "apps", "lib", "packages", "services", "modules", "internal", "pkg"}


def carregar_kit() -> tuple[set[str], tuple[str, ...]]:
    """O que o kit PH3A semeia no projeto (engine do gêmeo, hooks): ferramental, como `.claude/`."""
    arquivos, pastas = set(), []
    lista = Path(__file__).with_name("kit-ph3a.txt")
    if lista.is_file():
        for linha in lista.read_text(encoding="utf-8").splitlines():
            linha = linha.strip()
            if linha and not linha.startswith("#"):
                (pastas.append(linha) if linha.endswith("/") else arquivos.add(linha))
    return arquivos, tuple(pastas)


KIT_ARQUIVOS, KIT_PASTAS = carregar_kit()


def e_segredo(caminho: str) -> bool:
    nome = PurePosixPath(caminho).name
    return any(fnmatch.fnmatch(nome, p) for p in PADROES_SEGREDO)


def e_kit(caminho: str) -> bool:
    return caminho in KIT_ARQUIVOS or caminho.startswith(KIT_PASTAS)


def ignorado(caminho: str) -> bool:
    partes = PurePosixPath(caminho).parts
    return (any(p in DIRS_IGNORADOS for p in partes[:-1]) or e_segredo(caminho)
            or e_kit(caminho))


def git(alvo: Path, *args: str) -> str | None:
    try:
        r = subprocess.run(["git", "-C", str(alvo), *args], capture_output=True, text=True,
                           check=False)
    except FileNotFoundError:
        return None
    return r.stdout if r.returncode == 0 else None


def listar(alvo: Path) -> list[str]:
    """`git ls-files` quando há repositório (respeita .gitignore); senão, varre o disco."""
    saida = git(alvo, "ls-files", "-co", "--exclude-standard")
    if saida is not None:
        caminhos = [c for c in saida.splitlines() if c and (alvo / c).is_file()]
    else:
        caminhos = []
        for raiz, dirs, arquivos in os.walk(alvo):
            dirs[:] = sorted(d for d in dirs if d not in DIRS_IGNORADOS)
            for a in arquivos:
                caminhos.append((Path(raiz) / a).relative_to(alvo).as_posix())
    return sorted(c for c in caminhos if not ignorado(c))


def modulo_de(caminho: str) -> str:
    partes = PurePosixPath(caminho).parts
    if len(partes) == 1:
        return "(raiz)"
    if partes[0] in CONTEINERES and len(partes) > 2:
        return f"{partes[0]}/{partes[1]}"
    return partes[0]


def sha256(arq: Path) -> str:
    h = hashlib.sha256()
    with arq.open("rb") as f:
        for bloco in iter(lambda: f.read(65536), b""):
            h.update(bloco)
    return h.hexdigest()


def contar_linhas(arq: Path) -> int:
    try:
        with arq.open("rb") as f:
            return sum(1 for _ in f)
    except OSError:
        return 0


def tem_guarda_main(arq: Path) -> bool:
    try:
        return GUARDA_MAIN.search(arq.read_text(encoding="utf-8", errors="ignore")) is not None
    except OSError:
        return False


def entrypoints_do_package(alvo: Path, caminho: str) -> list[str]:
    try:
        pkg = json.loads((alvo / caminho).read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return []
    base = PurePosixPath(caminho).parent
    achados = []
    if isinstance(pkg.get("main"), str):
        achados.append(str(base / pkg["main"]))
    bins = pkg.get("bin")
    if isinstance(bins, str):
        achados.append(str(base / bins))
    elif isinstance(bins, dict):
        achados.extend(str(base / v) for v in bins.values() if isinstance(v, str))
    scripts = pkg.get("scripts") or {}
    for nome in ("start", "dev", "serve"):
        if isinstance(scripts.get(nome), str):
            achados.append(f"{caminho} → scripts.{nome}: {scripts[nome]}")
    return achados


def inventariar(alvo: Path, excluir: set[str] = frozenset()) -> dict:
    """`excluir`: caminhos relativos ao alvo fora da contagem (o próprio inventário gravado)."""
    alvo = alvo.resolve()
    arquivos: dict[str, dict] = {}
    linguagens: dict[str, dict] = {}
    modulos: dict[str, dict] = {}
    manifests, ci, entrypoints = [], [], []

    for c in listar(alvo):
        if c in excluir:
            continue
        arq = alvo / c
        ext = arq.suffix.lower()
        linhas = contar_linhas(arq) if ext in TEXTO or arq.name in MANIFESTS else 0
        arquivos[c] = {"sha256": sha256(arq), "linhas": linhas}

        lang = LINGUAGENS.get(ext)
        if lang:
            l = linguagens.setdefault(lang, {"arquivos": 0, "linhas": 0})
            l["arquivos"] += 1
            l["linhas"] += linhas

        m = modulos.setdefault(modulo_de(c), {"arquivos": 0, "linhas": 0})
        m["arquivos"] += 1
        m["linhas"] += linhas

        nome = arq.name
        if nome in MANIFESTS or c in MANIFESTS:
            manifests.append(c)
            if nome == "package.json":
                entrypoints.extend(entrypoints_do_package(alvo, c))
        if c.startswith(CI[0]) or nome in CI[1:]:
            ci.append(c)
        if nome in ENTRYPOINTS or (ext == ".py" and tem_guarda_main(arq)):
            entrypoints.append(c)

    commit = (git(alvo, "rev-parse", "HEAD") or "").strip() or None
    return {
        "alvo": alvo.name,
        "gerado_em": dt.date.today().isoformat(),
        "fonte_commit": commit,
        "totais": {
            "arquivos": len(arquivos),
            "linhas": sum(a["linhas"] for a in arquivos.values()),
        },
        "linguagens": dict(sorted(linguagens.items(), key=lambda kv: -kv[1]["linhas"])),
        "modulos": dict(sorted(modulos.items())),
        "manifests": sorted(manifests),
        "ci": sorted(ci),
        "entrypoints": sorted(set(entrypoints)),
        "arquivos": arquivos,
    }


def diferenca(antigo: dict, novo: dict) -> dict:
    a, n = antigo.get("arquivos", {}), novo["arquivos"]
    novos = sorted(set(n) - set(a))
    removidos = sorted(set(a) - set(n))
    alterados = sorted(c for c in set(a) & set(n) if a[c]["sha256"] != n[c]["sha256"])
    tocados = novos + removidos + alterados
    return {
        "desde": {"gerado_em": antigo.get("gerado_em"), "fonte_commit": antigo.get("fonte_commit")},
        "novos": novos,
        "removidos": removidos,
        "alterados": alterados,
        "modulos_afetados": sorted({modulo_de(c) for c in tocados}),
    }


def resumo(inv: dict) -> str:
    t = inv["totais"]
    linhas = [f"Inventário de {inv['alvo']} — {inv['gerado_em']} · commit {inv['fonte_commit'] or 'sem git'}",
              f"  {t['arquivos']} arquivos · {t['linhas']} linhas",
              "  Linguagens: " + ", ".join(f"{k} ({v['arquivos']})" for k, v in inv["linguagens"].items()),
              "  Módulos: " + ", ".join(f"{k} ({v['arquivos']})" for k, v in inv["modulos"].items()),
              "  Manifests: " + (", ".join(inv["manifests"]) or "—"),
              "  Entrypoints: " + (", ".join(inv["entrypoints"]) or "—"),
              "  CI: " + (", ".join(inv["ci"]) or "—")]
    return "\n".join(linhas)


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("alvo", type=Path)
    ap.add_argument("--out", type=Path, help="grava o inventário em JSON")
    ap.add_argument("--diff", type=Path, help="compara com um inventário anterior")
    args = ap.parse_args(argv)

    if not args.alvo.is_dir():
        print(f"✘ alvo não é diretório: {args.alvo}", file=sys.stderr)
        return 2

    alvo = args.alvo.resolve()
    proprio = set()
    for p in (args.out, args.diff):
        if p is not None and p.resolve().is_relative_to(alvo):
            proprio.add(p.resolve().relative_to(alvo).as_posix())
    inv = inventariar(alvo, proprio)

    if args.diff:
        if not args.diff.is_file():
            print(f"✘ inventário anterior não encontrado: {args.diff}", file=sys.stderr)
            return 2
        antigo = json.loads(args.diff.read_text(encoding="utf-8"))
        print(json.dumps(diferenca(antigo, inv), ensure_ascii=False, indent=2))
        return 0

    if args.out:
        args.out.parent.mkdir(parents=True, exist_ok=True)
        args.out.write_text(json.dumps(inv, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(resumo(inv))
    return 0


if __name__ == "__main__":
    sys.exit(main())
