#!/usr/bin/env python3
"""notificar.py — manda informação do repositório para o Telegram.

Por que existe: os scripts deste projeto já produzem a informação certa (`alertas.py` avisa
limiar rompido, `quality-gate.js` reprova regressão, `briefing_diff.py` conta o que mudou,
`prioridade.py` ordena a fila). Todos escrevem no terminal — e terminal fechado não avisa
ninguém. Isto é o último metro: pega a saída e entrega no celular.

Ele NÃO interpreta a saída. Quem decide se algo é alerta é o script que rodou, pelo código de
saída; aqui só existe a regra "quais códigos contam como sucesso". Um notificador que julga o
conteúdo alheio vira uma segunda fonte de verdade sobre o estado do projeto.

Uso:
  notificar.py "texto livre"
  notificar.py --stdin --titulo "Gate"              # …  | notificar.py --stdin
  notificar.py --arquivo tasks/PRIORIDADE.md --titulo "Fila"
  notificar.py --rodar "node scripts/quality-gate.js" --titulo "Gate" --so-se-falhar
  notificar.py --rodar "python3 scripts/alertas.py" --ok 0 --titulo "Canon"   # exit 3 = alerta
  notificar.py --testar                             # valida credenciais, não manda relatório
  notificar.py --descobrir-chat                     # lista os chats que já falaram com o bot

Código de saída: o do comando de `--rodar` (para encadear em CI); 0 nos demais modos, 1 se a
entrega falhou.
"""

from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import _telegram as T  # noqa: E402

NIVEIS = {"info": "ℹ️", "ok": "✅", "alerta": "⚠️", "erro": "🚨"}


def corta(texto: str, maximo: int, cabeca: bool) -> tuple[str, int]:
    """Trunca por linhas. Devolve (texto, quantas linhas sumiram).

    Por padrão guarda o FIM: em saída de gate ou de teste, o que reprovou está embaixo, e um
    aviso que mostra só o cabeçalho obriga a abrir o terminal — exatamente o que ele evita.
    """
    linhas = texto.splitlines()
    if len(linhas) <= maximo:
        return texto, 0
    fora = len(linhas) - maximo
    mantidas = linhas[:maximo] if cabeca else linhas[-maximo:]
    return "\n".join(mantidas), fora


def monta(titulo: str | None, nivel: str, corpo: str, cortadas: int,
          rodape: str | None) -> tuple[str, str | None]:
    """(cabeçalho, corpo em bloco). O corpo vai escapado; o cabeçalho é HTML nosso."""
    cab = []
    if titulo:
        cab.append(f"{NIVEIS.get(nivel, '')} <b>{T.esc(titulo)}</b>".strip())
    if cortadas:
        cab.append(f"<i>({cortadas} linhas anteriores omitidas)</i>")
    if rodape:
        cab.append(f"<i>{T.esc(rodape)}</i>")
    return "\n".join(cab), (T.esc(corpo) if corpo.strip() else None)


def descobrir_chat() -> int:
    """Imprime os chat_id que já falaram com o bot — o passo que trava toda configuração.

    O Telegram não tem "meu id" em lugar nenhum da interface, e `getUpdates` só enxerga
    conversa que JÁ recebeu uma mensagem. Por isso a instrução de mandar /start vem antes: sem
    ela a lista volta vazia e parece que o token está errado, quando não está.
    """
    r = T.api("getUpdates", limit=100, allowed_updates=["message"])
    if not r.get("ok"):
        print(f"✗ {r.get('description')}", file=sys.stderr)
        return 1
    vistos: dict[str, str] = {}
    for upd in r.get("result", []):
        chat = ((upd.get("message") or {}).get("chat") or {})
        if chat.get("id") is None:
            continue
        nome = " ".join(x for x in (chat.get("title"), chat.get("first_name"),
                                    chat.get("username")) if x) or "?"
        vistos[str(chat["id"])] = f"{nome} ({chat.get('type', '?')})"
    if not vistos:
        print("· nenhum chat visto ainda.\n"
              "  Abra o bot no Telegram, mande /start e rode de novo.\n"
              "  (getUpdates só enxerga conversa que já recebeu mensagem, e um webhook ativo\n"
              "   ou um `servir` rodando consomem os updates antes daqui.)", file=sys.stderr)
        return 1
    print("Chats que já falaram com o bot:")
    for cid, quem in vistos.items():
        print(f"  TELEGRAM_CHAT_ID={cid}   # {quem}")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0],
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("texto", nargs="?", help="texto a enviar")
    ap.add_argument("--stdin", action="store_true", help="lê o texto da entrada padrão")
    ap.add_argument("--arquivo", metavar="PATH", help="lê o texto de um arquivo")
    ap.add_argument("--rodar", metavar="CMD", help="roda o comando e manda a saída")
    ap.add_argument("--titulo", help="cabeçalho em negrito")
    ap.add_argument("--nivel", choices=list(NIVEIS), default="info")
    ap.add_argument("--ok", default="0", metavar="N,N",
                    help="códigos de saída que contam como sucesso (padrão: 0)")
    ap.add_argument("--so-se-falhar", action="store_true",
                    help="com --rodar: só manda se o código NÃO estiver em --ok")
    ap.add_argument("--max-linhas", type=int, default=120)
    ap.add_argument("--cabeca", action="store_true", help="trunca guardando o início, não o fim")
    ap.add_argument("--silencioso", action="store_true", help="entrega sem tocar o telefone")
    ap.add_argument("--seco", action="store_true", help="imprime o que mandaria, sem mandar")
    ap.add_argument("--testar", action="store_true", help="só valida token e chat")
    ap.add_argument("--descobrir-chat", action="store_true", dest="descobrir_chat",
                    help="lista os chats que já mandaram mensagem ao bot (só precisa do token)")
    a = ap.parse_args()

    T.carrega_env()

    if a.descobrir_chat:
        return descobrir_chat()

    if a.testar:
        ok, msg = T.testar_credenciais()
        print(("✓ " if ok else "✗ ") + msg, file=sys.stdout if ok else sys.stderr)
        return 0 if ok else 1

    nivel, rodape, codigo = a.nivel, None, 0
    oks = {int(x) for x in a.ok.split(",") if x.strip().lstrip("-").isdigit()}

    if a.rodar:
        r = subprocess.run(a.rodar, shell=True, capture_output=True, text=True,
                           cwd=T.raiz_repo())
        codigo = r.returncode
        corpo = (r.stdout + ("\n" + r.stderr if r.stderr.strip() else "")).strip()
        sucesso = codigo in oks
        # A saída do comando também vai para o terminal: quem rodou à mão continua vendo, e o
        # notificador não vira um buraco onde o log some.
        print(corpo)
        if a.so_se_falhar and sucesso:
            return codigo
        if a.nivel == "info":
            nivel = "ok" if sucesso else "erro"
        rodape = f"$ {a.rodar} → saída {codigo}"
    elif a.stdin:
        corpo = sys.stdin.read().strip()
    elif a.arquivo:
        p = Path(a.arquivo)
        if not p.is_file():
            print(f"✗ {p} não existe", file=sys.stderr)
            return 1
        corpo = p.read_text(encoding="utf-8", errors="replace").strip()
        rodape = str(p)
    elif a.texto:
        corpo = a.texto
    else:
        ap.error("nada para enviar: passe texto, --stdin, --arquivo ou --rodar")

    corpo, cortadas = corta(corpo, a.max_linhas, a.cabeca)
    cab, bloco = monta(a.titulo, nivel, corpo, cortadas, rodape)

    if not cab and not bloco:
        print("· nada a enviar (saída vazia)", file=sys.stderr)
        return codigo

    if a.seco:
        print("── seria enviado ──")
        print(cab)
        print(bloco or "(sem corpo)")
        return codigo

    entregue = True
    if cab:
        entregue = T.envia(cab, silencioso=a.silencioso) is not None
    if bloco and entregue:
        entregue = bool(T.envia_longo(bloco, silencioso=a.silencioso, envolver="pre"))
    if not entregue:
        return 1
    return codigo


if __name__ == "__main__":
    sys.exit(main())
