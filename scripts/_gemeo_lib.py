"""Biblioteca comum dos scripts do Gêmeo Digital.

Convenções (specs/001-melhorias-gemeo/contracts/scripts-cli.md):
  exit 0 = ok · 1 = erro de dado · 2 = erro de uso · 3 = alertas presentes
  stdout = resultado + conta visível · stderr = erros acionáveis
"""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path

import yaml

EXIT_OK = 0
EXIT_DADO = 1
EXIT_USO = 2
EXIT_ALERTA = 3

RANGE_KEYS = {"min", "max", "provavel"}


# ---------------------------------------------------------------- localização

def repo_root(start: Path | None = None) -> Path:
    """Sobe a partir de `start` (ou cwd) até achar o corpus (gemeo/00-CANON)."""
    p = (start or Path.cwd()).resolve()
    for cand in [p, *p.parents]:
        if (cand / "gemeo" / "00-CANON" / "canon.yaml").exists():
            return cand
    die_uso("não encontrei gemeo/00-CANON/canon.yaml — rode a partir da raiz do repo "
            "ou passe --canon PATH")


def canon_path(root: Path | None = None, override: str | None = None) -> Path:
    if override:
        p = Path(override)
        if not p.exists():
            die_uso(f"canon não encontrado: {p}")
        return p
    return repo_root(root) / "gemeo" / "00-CANON" / "canon.yaml"


# ----------------------------------------------------------------------- I/O

def load_yaml(path: Path):
    try:
        with open(path, encoding="utf-8") as f:
            return yaml.safe_load(f) or {}
    except yaml.YAMLError as e:
        die_dado(f"YAML inválido em {path}: {e}")


# Versão de schema do canon que este engine entende (compatibilidade por MAJOR).
# A engine é semeada no projeto (init/migrate) e pode estar à frente do canon de um
# projeto antigo — daí a guarda abaixo (spec 004 R9 / FR-018).
ENGINE_CANON_SCHEMA = "1"


def check_schema_version(canon: dict) -> None:
    """Avisa de forma clara e degrada se o schema_version do canon do projeto for de
    um MAJOR diferente do que este engine entende — em vez de calcular sobre um schema
    incompatível em silêncio."""
    raw = canon.get("schema_version") or (canon.get("_meta") or {}).get("schema_version")
    if raw is None:
        return  # canon antigo sem versão declarada — segue best-effort
    proj_major = str(raw).split(".")[0]
    if proj_major != ENGINE_CANON_SCHEMA:
        print(
            f"[gemeo] aviso: schema_version do canon = {raw} (major {proj_major}); esta engine "
            f"entende major {ENGINE_CANON_SCHEMA}. Resultados podem estar incorretos — "
            f"atualize o canon do projeto ou a engine (migrate.sh).",
            file=sys.stderr,
        )


def load_canon(override: str | None = None) -> dict:
    canon = load_yaml(canon_path(override=override))
    check_schema_version(canon)
    return canon


def save_canon_field(path: Path, dotted: str, value, origem: str | None = None) -> None:
    """Grava um campo no canon preservando comentários (round-trip ruamel).

    A escrita é validada ANTES de tocar o arquivo: o round-trip do ruamel tem
    bugs que produzem YAML inválido (ex.: coleção vazia `[]` em linha própria
    corrompe a seção seguinte) — se o dump não re-parsear, aborta sem alterar
    o canon.
    """
    import io  # import tardio: só quem grava precisa
    from ruamel.yaml import YAML

    ry = YAML()
    ry.preserve_quotes = True
    ry.width = 100
    with open(path, encoding="utf-8") as f:
        data = ry.load(f)
    parts = dotted.split(".")
    node = data
    for key in parts[:-1]:
        if key not in node or node[key] is None:
            node[key] = {}
        node = node[key]
    node[parts[-1]] = value
    if origem:
        # Na última chave do mapa, o token de comentário carrega também as linhas que vêm
        # depois dela (o bloco da seção seguinte). yaml_add_eol_comment troca o token
        # inteiro, então o resto é guardado antes e reanexado depois.
        resto = ""
        try:
            antigo = node.ca.items.get(parts[-1], [None] * 4)[2]
            if antigo is not None and "\n" in antigo.value:
                resto = antigo.value.split("\n", 1)[1]
        except Exception:
            resto = ""
        try:
            node.yaml_add_eol_comment(origem, key=parts[-1])
            if resto:
                novo = node.ca.items[parts[-1]][2]
                novo.value = novo.value.rstrip("\n") + "\n" + resto
        except Exception:
            pass  # comentário é melhor-esforço; o valor é o que importa
    buf = io.StringIO()
    ry.dump(data, buf)
    out = buf.getvalue()
    try:
        yaml.safe_load(out)
    except yaml.YAMLError as e:
        die_dado(f"escrita de '{dotted}' abortada: o round-trip do ruamel produziria "
                 f"YAML inválido ({str(e).splitlines()[0]}); canon preservado. "
                 f"Procure coleções vazias ([]) em linha própria e mova para a chave.")
    with open(path, "w", encoding="utf-8") as f:
        f.write(out)


# ------------------------------------------------------------- paths e faixas

def get_path(data: dict, dotted: str):
    """Resolve 'a.b.c' em dicts aninhados; retorna None se ausente.

    Em listas, aceita índice numérico ('planos.0.preco') ou casamento pelo
    campo 'id' ('planos.pro.preco' → item cujo id == 'pro'). Permite citar
    itens de listas do canon (planos[], clientes[]) por id na prosa."""
    node = data
    for key in dotted.split("."):
        if isinstance(node, dict):
            if key not in node:
                return None
            node = node[key]
        elif isinstance(node, list):
            if key.lstrip("-").isdigit() and int(key) < len(node):
                node = node[int(key)]
            else:
                node = next((it for it in node
                             if isinstance(it, dict) and str(it.get("id")) == key), None)
                if node is None:
                    return None
        else:
            return None
    return node


def is_range(v) -> bool:
    return isinstance(v, dict) and RANGE_KEYS.issubset(v.keys())


def point_value(v):
    """Valor pontual de um campo: o próprio número, ou `provavel` se for faixa."""
    if is_range(v):
        return v["provavel"]
    return v


def numeric(v) -> bool:
    return isinstance(v, (int, float)) and not isinstance(v, bool)


# ----------------------------------------------------------------- saída/erro

def emit(payload: dict, json_mode: bool, human: str | None = None) -> None:
    """Imprime resultado: JSON estruturado ou texto humano (conta visível)."""
    if json_mode:
        print(json.dumps(payload, ensure_ascii=False, indent=2, default=str))
    else:
        print(human if human is not None else
              json.dumps(payload, ensure_ascii=False, indent=2, default=str))


def die_dado(msg: str, faltantes: list[str] | None = None) -> None:
    print(f"ERRO de dado: {msg}", file=sys.stderr)
    for campo in faltantes or []:
        print(f"  - campo faltante: {campo}", file=sys.stderr)
    sys.exit(EXIT_DADO)


def die_uso(msg: str) -> None:
    print(f"ERRO de uso: {msg}", file=sys.stderr)
    sys.exit(EXIT_USO)


# ------------------------------------------------------------------ git utils

def git(root: Path, *args: str) -> str:
    import subprocess

    r = subprocess.run(["git", "-C", str(root), *args],
                       capture_output=True, text=True)
    if r.returncode != 0:
        die_uso(f"git {' '.join(args)} falhou: {r.stderr.strip()}")
    return r.stdout


def canon_at_ref(root: Path, ref: str, canon_file: Path | None = None) -> dict:
    """Canon como estava num ref git (para diffs/série temporal).

    `canon_file` permite apontar um canon fora do default (ex.: fixture de evals).
    """
    toplevel = Path(git(root, "rev-parse", "--show-toplevel").strip())
    if canon_file is not None:
        rel = Path(canon_file).resolve().relative_to(toplevel).as_posix()
    else:
        rel = "gemeo/00-CANON/canon.yaml"
    out = git(toplevel, "show", f"{ref}:{rel}")
    return yaml.safe_load(out) or {}
