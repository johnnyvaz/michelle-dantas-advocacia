#!/usr/bin/env python3
"""_telegram.py — transporte para a Bot API. Não decide nada, só entrega.

Por que existe separado: `ponte-telegram.py` (fila humana) e `notificar.py` (envio de
informação) precisam do MESMO carregamento de segredo, do MESMO tratamento de erro e do MESMO
fatiamento de mensagem. Duas cópias divergiriam, e a primeira consequência seria uma delas
mandar segredo para o chat errado — o erro mais caro possível neste arquivo.

stdlib pura de propósito: todo script Python deste repositório roda sem `pip install`.
"""

from __future__ import annotations

import json
import os
import re
import subprocess
import sys
import urllib.error
import urllib.request
from html import escape as _esc
from pathlib import Path

API = "https://api.telegram.org/bot{token}/{metodo}"

# 4096 é o teto da Bot API. 3800 deixa folga para o cabeçalho de continuação e para as tags
# `<pre>` que `notificar.py` põe em volta de cada pedaço.
LIMITE = 3800

_ENV_CARREGADO = False


def raiz_repo(inicio: Path | None = None) -> Path:
    """Raiz do repositório git; o diretório do script se não houver git."""
    base = (inicio or Path(__file__).resolve().parent)
    r = subprocess.run(["git", "rev-parse", "--show-toplevel"],
                       capture_output=True, text=True, cwd=base)
    return Path(r.stdout.strip()) if r.returncode == 0 else base.parent


def carrega_env(raiz: Path | None = None) -> None:
    """Lê `.env.local` da raiz SEM sobrescrever o ambiente de verdade.

    `setdefault` e não `[]=`: quem exporta a variável na sessão (ou no systemd) está dizendo
    qual bot quer usar agora, e um arquivo no disco não pode vencer essa escolha.
    """
    global _ENV_CARREGADO
    if _ENV_CARREGADO:
        return
    _ENV_CARREGADO = True
    env = (raiz or raiz_repo()) / ".env.local"
    if not env.is_file():
        return
    for ln in env.read_text(encoding="utf-8").splitlines():
        ln = ln.strip()
        if not ln or ln.startswith("#") or "=" not in ln:
            continue
        k, v = ln.split("=", 1)
        os.environ.setdefault(k.strip(), v.strip().strip("'\""))


def cfg(chave: str, obrigatorio: bool = True) -> str:
    carrega_env()
    v = os.environ.get(chave, "").strip()
    if not v and obrigatorio:
        print(f"✗ {chave} não está no ambiente nem em .env.local", file=sys.stderr)
        raise SystemExit(1)
    return v


def liga(chave: str, padrao: bool) -> bool:
    carrega_env()
    v = os.environ.get(chave, "").strip().lower()
    return padrao if not v else v in ("1", "true", "sim", "on", "yes")


def esc(t: str) -> str:
    return _esc(str(t), quote=False)


def api(metodo: str, timeout: int = 20, **params) -> dict:
    """Chamada crua. Nunca levanta: devolve `{'ok': False, 'description': ...}`.

    Silenciar a exceção é deliberado — notificação que derruba o processo que ela deveria
    apenas observar transforma um aviso em incidente.
    """
    req = urllib.request.Request(
        API.format(token=cfg("TELEGRAM_BOT_TOKEN"), metodo=metodo),
        data=json.dumps(params).encode("utf-8"),
        headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        corpo = e.read()[:300].decode("utf-8", errors="replace")
        return {"ok": False, "description": f"HTTP {e.code}: {corpo}"}
    except OSError as e:
        return {"ok": False, "description": str(e)}


def fatiar(texto: str, limite: int = LIMITE) -> list[str]:
    """Quebra em pedaços que cabem numa mensagem, preferindo a borda de linha.

    Corta em linha, e não em caractere, porque o texto já vem escapado para HTML: partir no
    meio de `&amp;` produziria entidade quebrada e a Bot API recusaria a mensagem inteira.
    Linha sozinha maior que o limite é partida num ponto que a regex garante estar fora de
    uma entidade.
    """
    if len(texto) <= limite:
        return [texto]
    pedacos, atual = [], ""
    for linha in texto.splitlines(keepends=True):
        while len(linha) > limite:
            corte = limite
            # Recua até sair de dentro de uma entidade HTML (`&nome;` tem no máximo ~10 chars).
            m = re.search(r"&[#a-zA-Z0-9]{0,10}$", linha[:corte])
            if m:
                corte = m.start()
            if atual:
                pedacos.append(atual)
                atual = ""
            pedacos.append(linha[:corte])
            linha = linha[corte:]
        if len(atual) + len(linha) > limite:
            pedacos.append(atual)
            atual = ""
        atual += linha
    if atual.strip():
        pedacos.append(atual)
    return [p for p in pedacos if p.strip()]


def envia(texto: str, chat: str | None = None, silencioso: bool = False,
          parse_mode: str | None = "HTML", responder_a: int | None = None) -> int | None:
    """Uma mensagem. Devolve o message_id, ou None se falhou (e explica no stderr)."""
    params = {"chat_id": chat or cfg("TELEGRAM_CHAT_ID"), "text": texto,
              "disable_web_page_preview": True, "disable_notification": silencioso}
    if parse_mode:
        params["parse_mode"] = parse_mode
    if responder_a:
        params["reply_to_message_id"] = responder_a
    r = api("sendMessage", **params)
    if not r.get("ok"):
        print(f"✗ telegram: {r.get('description')}", file=sys.stderr)
        return None
    return r["result"]["message_id"]


def envia_longo(texto: str, chat: str | None = None, silencioso: bool = False,
                envolver: str | None = None, parse_mode: str | None = "HTML") -> list[int]:
    """Fatia e manda. `envolver='pre'` põe cada pedaço em bloco monoespaçado.

    Só a PRIMEIRA parte faz o telefone tocar — 4 vibrações para um relatório de 4 páginas é o
    que faz alguém desligar a notificação, e notificação desligada não avisa nada.
    """
    ids = []
    pedacos = fatiar(texto)
    total = len(pedacos)
    for i, p in enumerate(pedacos, 1):
        corpo = f"<pre>{p}</pre>" if envolver == "pre" else p
        if total > 1:
            corpo = f"{corpo}\n<i>({i}/{total})</i>"
        mid = envia(corpo, chat=chat, silencioso=silencioso or i > 1, parse_mode=parse_mode)
        if mid is None:
            break
        ids.append(mid)
    return ids


def testar_credenciais() -> tuple[bool, str]:
    """(ok, descrição). Verifica token E se o chat aceita mensagem — são falhas diferentes."""
    r = api("getMe")
    if not r.get("ok"):
        return False, f"token inválido: {r.get('description')}"
    bot = r["result"].get("username", "?")
    chat = cfg("TELEGRAM_CHAT_ID")
    r2 = api("getChat", chat_id=chat)
    if not r2.get("ok"):
        return False, (f"token ok (@{bot}), mas o chat {chat} não responde: "
                       f"{r2.get('description')}. Mande /start para o bot primeiro.")
    return True, f"@{bot} · chat {chat} ok"
