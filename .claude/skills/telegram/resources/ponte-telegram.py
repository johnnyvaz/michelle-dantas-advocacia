#!/usr/bin/env python3
"""ponte-telegram.py — responder a fila humana (tasks/human.md) pelo celular.

Por que existe: o contrato do `human.md` já foi desenhado para ser operado por máquina —
`H-0xx` é identidade estável, `**Solução:**` destrava sem mover nada, `**Estado:**` tem
vocabulário fechado. O que faltava não era um agente: era um TRANSPORTE. Enquanto responder
exigia abrir o arquivo no editor, item ficava parado bloqueando trabalho de agente.

O que a ponte NÃO faz, de propósito:

- **Não decide.** Ela transporta a resposta do dono para o arquivo, que segue sendo o registro
  canônico. Nenhum texto gravado por ela é gerado por modelo.
- **Não é um segundo motor de prioridade.** A ordem vem de `prioridade.py human --json`. Duas
  fontes para a mesma ordenação divergiriam na primeira vez que alguém mexesse numa.
- **Não reimplementa a regra de "já respondido".** `SOLUCAO_RE`, `SOLUCAO_VAZIA_RE` e
  `human_decidido` são importados do motor, pelo mesmo motivo que `migrar-solucao.py` importa.
- **Não manda o corpo do item.** Por padrão só saem ID, título, área e os rótulos de decisão.
  `human.md` carrega achado de segurança e caminho de arquivo; o Telegram não é fim-a-fim em
  conversa comum. `PONTE_CORPO_COMPLETO=1` manda o bloco inteiro, e é escolha de quem liga.

Uso:
  python3 scripts/ponte-telegram.py testar      # valida token e chat, não escreve nada
  python3 scripts/ponte-telegram.py fila        # imprime a fila no terminal (sem Telegram)
  python3 scripts/ponte-telegram.py empurrar    # manda o topo da fila uma vez (cron/heartbeat)
  python3 scripts/ponte-telegram.py servir      # long polling: escuta e grava as respostas

Ambiente (ver `_telegram.py` e `.env.local`):
  TELEGRAM_BOT_TOKEN · TELEGRAM_CHAT_ID · PONTE_CORPO_COMPLETO=1 · PONTE_COMMIT=0
"""

from __future__ import annotations

import argparse
import datetime
import json
import re
import subprocess
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import _telegram as T  # noqa: E402 — token, entrega e fatiamento vêm daqui
import prioridade as P  # noqa: E402 — regexes e regra de "decidido" vêm do motor

RAIZ = T.raiz_repo()
HUMAN = RAIZ / "tasks" / "human.md"
ESTADO = RAIZ / "tasks" / ".ponte-telegram.json"
HOJE = datetime.date.today().isoformat()

# Rótulos que podem sair do repositório. `Local:` fica de fora: é caminho de arquivo, e o valor
# dele para DECIDIR é zero — quem decide já sabe onde o problema mora.
ROTULOS_SEGUROS = ("Só você pode fazer", "Eu faço depois", "Risco de não fazer")
ROTULO_RE = re.compile(r"^\s*[-*+]\s*\*\*(?P<rotulo>[^:*]+):\*\*\s*(?P<txt>.+?)\s*$")

esc = T.esc


def erro(msg: str) -> int:
    print(f"✗ {msg}", file=sys.stderr)
    return 1


# ──────────────────────────── estado da ponte ────────────────────────────

def le_estado() -> dict:
    if ESTADO.is_file():
        try:
            return json.loads(ESTADO.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            pass
    return {"offset": 0, "ancoras": {}, "empurrados": {}}


def grava_estado(st: dict) -> None:
    # As âncoras crescem para sempre se ninguém podar; 500 é muito mais que a janela útil de
    # "responder a uma mensagem antiga" no Telegram.
    if len(st.get("ancoras", {})) > 500:
        st["ancoras"] = dict(list(st["ancoras"].items())[-500:])
    ESTADO.write_text(json.dumps(st, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


# ───────────────────────────── leitura da fila ─────────────────────────────

def blocos() -> dict[str, dict]:
    """Os blocos `### H-0xx` do human.md, por ID, com índices de linha 0-based.

    Só o dialeto heading — é o único que `tasks/human.md` usa. O dialeto checkbox existe no
    contrato, mas suportar os dois aqui sem teste seria escrever código que nunca roda.
    """
    linhas = HUMAN.read_text(encoding="utf-8").splitlines()
    neutras = [v for _, v in P._linhas_uteis("\n".join(linhas))]
    out: dict[str, dict] = {}
    atual = secao = None
    for i, ln in enumerate(neutras):
        if ln.startswith("## ") and not P.HUMAN_ID_RE.match(ln):
            secao = ln[3:].strip()
        m = P.HUMAN_ID_RE.match(ln)
        if m or (atual and re.match(r"^#{2,4}\s", ln)):
            if atual:
                atual["fim"] = i - 1
            atual = None
        if m:
            atual = {"id": m.group("id"), "titulo": m.group("titulo").strip(), "ini": i,
                     "fim": len(linhas) - 1, "estado_em": None, "estado": "",
                     "corpo": [], "secao": secao or ""}
            out[atual["id"]] = atual
            continue
        if atual:
            me = P.ESTADO_RE.search(ln)
            if me and atual["estado_em"] is None:
                atual["estado"] = me.group("estado").strip()
                atual["estado_em"] = i
            atual["corpo"].append(ln)
    if atual:
        atual["fim"] = len(linhas) - 1
    for b in out.values():
        b["linhas"] = linhas
        b["solucao"] = P.solucao_do_corpo([b["estado"]] + b["corpo"])
        b["decidido"] = P.human_decidido(b["estado"], "\n".join(b["corpo"]), b["secao"])
    return out


def fila() -> list[dict]:
    """Itens pendentes, na ordem do motor. A ordem NÃO é recalculada aqui."""
    r = subprocess.run([sys.executable, str(RAIZ / "scripts" / "prioridade.py"), "human", "--json"],
                       capture_output=True, text=True, cwd=RAIZ)
    if r.returncode not in (0, 3):
        raise SystemExit(erro(f"prioridade.py falhou ({r.returncode}): {r.stderr.strip()[:300]}"))
    bs = blocos()
    out = []
    for it in json.loads(r.stdout).get("resultados", []):
        b = bs.get(it.get("id"))
        if not b or b["decidido"] or b["solucao"]:
            continue
        out.append({**it, "bloco": b})
    return out


def resolve_id(bruto: str) -> str | None:
    """Aceita `3`, `h3`, `H-3`, `H-003` — digitar zero à esquerda no celular é atrito."""
    m = re.search(r"(\d+)", bruto or "")
    if not m:
        return None
    alvo = f"H-{int(m.group(1)):03d}"
    return alvo if alvo in blocos() else None


# ───────────────────────────── formatação ─────────────────────────────

def cartao(it: dict, completo: bool = False) -> str:
    b = it["bloco"]
    linhas = [f"<b>{esc(b['id'])}</b> · {esc(b['titulo'])}",
              f"<i>{esc(it.get('area', '?'))} · {esc(it.get('banda', '?'))} · "
              f"{esc(it.get('quadrante', '?'))} · score {it.get('score', 0):.0f}</i>"]
    if completo:
        linhas += ["", esc("\n".join(x for x in b["corpo"] if x.strip())[:3000])]
    else:
        for ln in b["corpo"]:
            m = ROTULO_RE.match(ln)
            if m and m.group("rotulo").strip() in ROTULOS_SEGUROS:
                linhas.append(f"• <b>{esc(m.group('rotulo').strip())}:</b> {esc(m.group('txt'))}")
    linhas += ["", "<i>Responda a esta mensagem com a decisão — ela vira "
               "<b>Solução:</b> no item.</i>"]
    return "\n".join(linhas)


def ajuda() -> str:
    return ("<b>Fila humana</b>\n"
            "/fila — os 5 itens mais prioritários\n"
            "/h 3 — abre o H-003\n"
            "/aprovar 3 — marca ✅ aprovado\n"
            "/rejeitar 3 motivo — marca ❌ rejeitado\n\n"
            "Para responder: <b>responda</b> à mensagem do item, ou mande "
            "<code>H-003 sua decisão</code>.")


# ───────────────────────── escrita no arquivo ─────────────────────────

def _grava(linhas: list[str], msg_commit: str) -> None:
    HUMAN.write_text("\n".join(linhas) + "\n", encoding="utf-8")
    if not T.liga("PONTE_COMMIT", True):
        return
    # Só `tasks/human.md`. Nunca `-a`: a ponte roda ao lado de trabalho em andamento, e varrer a
    # árvore inteira para dentro de um commit de decisão é como se perde mudança alheia.
    rel = str(HUMAN.relative_to(RAIZ))
    subprocess.run(["git", "add", "--", rel], cwd=RAIZ, check=False, capture_output=True)
    subprocess.run(["git", "commit", "-m", msg_commit, "--", rel],
                   cwd=RAIZ, check=False, capture_output=True)


def escrever_solucao(hid: str, texto: str) -> str:
    """Grava `**Solução:**` logo abaixo de `**Estado:**` — o lugar que migrar-solucao.py usa.

    NÃO mexe em `**Estado:**`: `✍️ respondido` é DERIVADO da presença da solução (contrato em
    tasks/README.md). Escrever os dois criaria duas fontes para o mesmo fato.
    """
    b = blocos().get(hid)
    if not b:
        return f"✗ {hid} não existe em human.md."
    if b["decidido"]:
        return f"✗ {hid} já está decidido (<code>{esc(b['estado'])}</code>). Não sobrescrevo."
    linhas = list(b["linhas"])
    campo = f"**Solução:** {texto.strip()}"

    # Já existe rótulo? Se o texto for placeholder (`_(pendente)_`), substitui; se for resposta
    # de verdade, recusa — sobrescrever decisão registrada é o pior erro possível aqui.
    for i in range(b["ini"], b["fim"] + 1):
        if P.SOLUCAO_RE.match(linhas[i]):
            if b["solucao"]:
                return (f"✗ {hid} já foi respondido: <i>{esc(b['solucao'][:200])}</i>\n"
                        f"Edite no arquivo se quiser mudar.")
            linhas[i] = campo
            break
    else:
        alvo = b["estado_em"] if b["estado_em"] is not None else b["ini"]
        linhas.insert(alvo + 1, campo)

    _grava(linhas, f"decisao({hid.lower()}): resposta do dono pela ponte Telegram")
    return f"✅ <b>{hid}</b> respondido. O agente pode executar."


def mudar_estado(hid: str, novo: str, sufixo_commit: str) -> str:
    """Troca só o PRIMEIRO campo da linha `**Estado:**`, preservando 📅, 🔺 e #area."""
    b = blocos().get(hid)
    if not b:
        return f"✗ {hid} não existe em human.md."
    if b["estado_em"] is None:
        return f"✗ {hid} não tem linha <b>Estado:</b> — precisa de edição manual."
    if b["decidido"]:
        return f"✗ {hid} já está decidido (<code>{esc(b['estado'])}</code>). Não sobrescrevo."
    linhas = list(b["linhas"])
    resto = b["estado"].split("·", 1)
    linhas[b["estado_em"]] = f"**Estado:** {novo}" + (f" ·{resto[1]}" if len(resto) > 1 else "")
    _grava(linhas, f"decisao({hid.lower()}): {sufixo_commit} pela ponte Telegram")
    return f"✅ <b>{hid}</b> → {esc(novo)}"


# ───────────────────────────── comandos ─────────────────────────────

def cmd_fila(envia_tg: bool, n: int = 5) -> int:
    itens = fila()
    if not itens:
        msg = "🎉 Nada pendente na fila humana."
        T.envia(msg) if envia_tg else print(msg)
        return 0
    if not envia_tg:
        for it in itens[:n]:
            print(f"{it['id']:>6}  {it.get('banda',''):<5} score {it.get('score',0):>5.1f}  "
                  f"{it.get('area',''):<12} {it['bloco']['titulo']}")
        print(f"\n{len(itens)} pendentes.")
        return 0
    cab = f"<b>{len(itens)} decisões pendentes</b> — as {min(n, len(itens))} mais prioritárias:"
    corpo = "\n".join(f"{i}. <b>{it['id']}</b> · {esc(it['bloco']['titulo'])}"
                      f"  <i>({it.get('area','?')})</i>" for i, it in enumerate(itens[:n], 1))
    T.envia(f"{cab}\n\n{corpo}\n\n<i>/h 1 abre o primeiro.</i>")
    return 0


def cmd_empurrar() -> int:
    """Manda o item do topo — para o heartbeat/cron chamar. Não repete o item no mesmo dia."""
    itens = fila()
    if not itens:
        return 0
    st = le_estado()
    topo = itens[0]
    if st.get("empurrados", {}).get(topo["id"]) == HOJE:
        print(f"· {topo['id']} já foi empurrado hoje.")
        return 0
    mid = T.envia(cartao(topo, T.liga("PONTE_CORPO_COMPLETO", False)))
    if mid is None:
        return 1
    st.setdefault("ancoras", {})[str(mid)] = topo["id"]
    st.setdefault("empurrados", {})[topo["id"]] = HOJE
    grava_estado(st)
    print(f"✓ {topo['id']} empurrado.")
    return 0


def trata(msg: dict, st: dict) -> None:
    texto = (msg.get("text") or "").strip()
    if not texto:
        return
    resposta_a = str((msg.get("reply_to_message") or {}).get("message_id") or "")
    baixo = texto.lower()

    if baixo.startswith(("/ajuda", "/start", "/help")):
        return void(T.envia(ajuda()))

    if baixo.startswith("/fila"):
        cmd_fila(envia_tg=True)
        return

    if baixo.startswith("/h"):
        ordem = fila()
        itens = {i["id"]: i for i in ordem}
        hid = resolve_id(texto[2:])
        if not hid or hid not in itens:
            # `/h 1` também vale como POSIÇÃO na fila — é como a lista chega no celular.
            m = re.search(r"(\d+)", texto)
            if m and 1 <= int(m.group(1)) <= len(ordem):
                hid = ordem[int(m.group(1)) - 1]["id"]
        if not hid or hid not in itens:
            return void(T.envia("✗ Não achei esse item pendente. "
                                "<code>/fila</code> lista os abertos."))
        mid = T.envia(cartao(itens[hid], T.liga("PONTE_CORPO_COMPLETO", False)))
        if mid:
            st.setdefault("ancoras", {})[str(mid)] = hid
        return

    if baixo.startswith("/aprovar"):
        hid = resolve_id(texto)
        return void(T.envia(mudar_estado(hid, f"✅ aprovado {HOJE}", "aprovado") if hid
                            else "✗ Use <code>/aprovar 3</code>."))

    if baixo.startswith("/rejeitar"):
        hid = resolve_id(texto)
        motivo = re.sub(r"^/rejeitar\s+\S+\s*", "", texto, flags=re.I).strip()
        if not hid:
            return void(T.envia("✗ Use <code>/rejeitar 3 o motivo</code>."))
        if not motivo:
            return void(T.envia("✗ Rejeição sem motivo não ensina nada. Escreva o porquê."))
        return void(T.envia(mudar_estado(hid, f"❌ rejeitado {HOJE} — {motivo}", "rejeitado")))

    # Resposta livre: por reply à mensagem do item, ou com o ID no começo do texto.
    hid = st.get("ancoras", {}).get(resposta_a)
    if not hid:
        m = re.match(r"^(H-?\s?\d+)[\s:·\-–]+(.+)$", texto, re.I | re.S)
        if m:
            hid, texto = resolve_id(m.group(1)), m.group(2).strip()
    if not hid:
        return void(T.envia("Não sei a qual item isso responde. <b>Responda</b> à mensagem do "
                            "item, ou comece com <code>H-003 …</code>. "
                            "<code>/ajuda</code> tem o resto."))
    T.envia(escrever_solucao(hid, texto))


def void(_) -> None:
    """`return void(...)` mantém os ramos de `trata` com uma saída só."""
    return None


def cmd_servir(uma_volta: bool = False) -> int:
    st = le_estado()
    autorizado = T.cfg("TELEGRAM_CHAT_ID")
    print(f"▶ escutando (chat {autorizado}) — Ctrl-C para parar")
    while True:
        r = T.api("getUpdates", timeout=70, offset=st.get("offset", 0), limit=20,
                  allowed_updates=["message"])
        if not r.get("ok"):
            print(f"✗ getUpdates: {r.get('description')}", file=sys.stderr)
            if uma_volta:
                return 1
            time.sleep(10)
            continue
        for upd in r.get("result", []):
            st["offset"] = upd["update_id"] + 1
            msg = upd.get("message") or {}
            chat = str((msg.get("chat") or {}).get("id", ""))
            if chat != autorizado:
                # Bot do Telegram é endereçável por qualquer um que descubra o nome.
                print(f"⚠ mensagem de chat não autorizado ({chat}) ignorada", file=sys.stderr)
                continue
            try:
                trata(msg, st)
            except Exception as e:                     # noqa: BLE001 — um item ruim não derruba
                print(f"✗ ao tratar update {upd['update_id']}: {e}", file=sys.stderr)
                T.envia(f"✗ Erro ao processar: {esc(str(e)[:300])}")
        grava_estado(st)
        if uma_volta:
            return 0


def cmd_testar() -> int:
    ok, msg = T.testar_credenciais()
    if not ok:
        return erro(msg)
    itens = fila()
    if T.envia(f"✅ Ponte de pé.\n{len(itens)} decisões pendentes em "
               f"<code>tasks/human.md</code>.\n\n{ajuda()}") is None:
        return erro("token ok, mas não consegui escrever no chat.")
    print(f"✓ {msg} · {len(itens)} pendentes · nada foi escrito no arquivo")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("comando", choices=["testar", "fila", "empurrar", "servir"])
    ap.add_argument("-n", type=int, default=5, help="quantos itens em `fila` (padrão 5)")
    ap.add_argument("--uma-volta", action="store_true",
                    help="em `servir`, processa o lote pendente e sai (para teste/cron)")
    a = ap.parse_args()
    T.carrega_env(RAIZ)
    if not HUMAN.is_file():
        return erro(f"{HUMAN} não existe")
    return {"testar": cmd_testar,
            "fila": lambda: cmd_fila(envia_tg=False, n=a.n),
            "empurrar": cmd_empurrar,
            "servir": lambda: cmd_servir(a.uma_volta)}[a.comando]()


if __name__ == "__main__":
    sys.exit(main())
