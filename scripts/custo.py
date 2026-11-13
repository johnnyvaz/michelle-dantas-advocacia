#!/usr/bin/env python3
"""custo.py — ledger e orçamento da empresa de agentes.

O heartbeat manda anotar quanto do orçamento foi consumido e o agente-financeiro promete
o relatório do mês. Até aqui não havia campo, script nem registro: era promessa sem
mecanismo. Este script é o mecanismo.

Desenho emprestado do ledger de custo do projeto newsjack: registro append-only com
**cadeia de hash** (cada evento carrega o hash do anterior), gasto projetado pelo **p95
observado** antes de disparar, e recusa explícita quando o custo de algo é desconhecido.

Honestidade sobre a fonte do número: `claude -p --output-format json` devolve
`total_cost_usd`, que é ESTIMATIVA feita no cliente — em plano de assinatura, é
preço-sombra, não fatura. O script nunca finge precisão que não tem: evento sem custo
medível entra como `desconhecido` e é tratado pela política declarada no canon.

Uso:
  custo.py registrar --agente A --origem O [--area X] [--rodada R] [--unidades N]
                     (--claude-json F | --usd X --fonte manual | --desconhecido)
  custo.py verificar [--json]                 # integridade da cadeia
  custo.py saldo [--mes AAAA-MM] [--por agente|area|origem] [--write] [--json]
  custo.py checar (--projetado USD | --n N) --origem O [--agente A] [--area X]
                  --modo interativo|autonomo [--json]
  custo.py reconciliar --tag T --usd X --fonte console|usage-api|manual

Exit: 0 ok · 1 dado/integridade · 2 uso · 3 orçamento estourado.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import socket
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from _gemeo_lib import EXIT_DADO, canon_path, load_yaml  # noqa: E402


def msg(texto: str, err: bool = False) -> None:
    print(texto, file=sys.stderr if err else sys.stdout)

EXIT_ORCAMENTO = 3
GENESIS = "GENESIS"


def agora() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def host() -> str:
    return os.environ.get("CUSTO_HOST") or socket.gethostname() or "local"


def dir_ledger(raiz: Path | None = None) -> Path:
    base = raiz or canon_path().parent.parent      # gemeo/00-CANON/canon.yaml -> gemeo/
    return base / "12-AGENTES" / "_custo"


def arquivo_ledger(raiz: Path | None = None) -> Path:
    return dir_ledger(raiz) / f"ledger-{host()}.jsonl"


def canonico(d: dict) -> str:
    return json.dumps(d, sort_keys=True, ensure_ascii=False, separators=(",", ":"))


def hash_evento(ev: dict) -> str:
    base = {k: v for k, v in ev.items() if k != "event_hash"}
    return hashlib.sha256(canonico(base).encode("utf-8")).hexdigest()


def ler(arq: Path) -> list[dict]:
    if not arq.exists():
        return []
    out = []
    for i, linha in enumerate(arq.read_text(encoding="utf-8").splitlines(), 1):
        linha = linha.strip()
        if not linha:
            continue
        try:
            out.append(json.loads(linha))
        except json.JSONDecodeError as e:
            raise SystemExit(f"ledger corrompido na linha {i} de {arq}: {e}")
    return out


def ler_todos(raiz: Path | None = None) -> list[dict]:
    d = dir_ledger(raiz)
    eventos: list[dict] = []
    if d.exists():
        for arq in sorted(d.glob("ledger-*.jsonl")):
            eventos.extend(ler(arq))
    return eventos


def acrescentar(ev: dict, raiz: Path | None = None) -> dict:
    """Append com trava de arquivo: dois processos não forkam a cadeia."""
    arq = arquivo_ledger(raiz)
    arq.parent.mkdir(parents=True, exist_ok=True)
    try:
        import fcntl
    except ImportError:                                  # Windows
        fcntl = None
    with open(arq, "a+", encoding="utf-8") as f:
        if fcntl:
            fcntl.flock(f.fileno(), fcntl.LOCK_EX)
        try:
            anteriores = ler(arq)
            ev["prev_hash"] = anteriores[-1]["event_hash"] if anteriores else GENESIS
            ev["event_hash"] = hash_evento(ev)
            f.write(canonico(ev) + "\n")
            f.flush()
            os.fsync(f.fileno())
        finally:
            if fcntl:
                fcntl.flock(f.fileno(), fcntl.LOCK_UN)
    return ev


def verificar_cadeia(eventos: list[dict]) -> list[str]:
    """Cada arquivo é uma cadeia; erros descrevem onde ela quebrou."""
    problemas: list[str] = []
    por_host: dict[str, list[dict]] = {}
    for ev in eventos:
        por_host.setdefault(ev.get("host", "?"), []).append(ev)
    for h, evs in por_host.items():
        anterior = GENESIS
        vistas: set[str] = set()
        for i, ev in enumerate(evs, 1):
            if ev.get("prev_hash") != anterior:
                problemas.append(f"[{h}] evento {i}: prev_hash não encadeia")
            if hash_evento(ev) != ev.get("event_hash"):
                problemas.append(f"[{h}] evento {i}: conteúdo adulterado (hash não confere)")
            tag = ev.get("tag")
            if ev.get("terminal") and tag in vistas:
                problemas.append(f"[{h}] evento {i}: tag terminal repetida ({tag})")
            if ev.get("terminal"):
                vistas.add(tag)
            anterior = ev.get("event_hash")
    return problemas


def custo_de(ev: dict) -> float | None:
    v = ev.get("cost_usd")
    return None if v is None else float(v)


def consolidar(eventos: list[dict]) -> dict[str, dict]:
    """Aplica as reconciliações sobre os eventos terminais."""
    por_tag = {ev["tag"]: dict(ev) for ev in eventos if ev.get("terminal")}
    for ev in eventos:
        alvo = ev.get("reconcilia_tag")
        if alvo and alvo in por_tag:
            por_tag[alvo]["cost_usd"] = ev.get("cost_usd")
            por_tag[alvo]["cost_source"] = ev.get("cost_source", "reconciliado")
            por_tag[alvo]["status"] = por_tag[alvo].get("status", "success")
    return por_tag


def do_canon() -> dict:
    canon = load_yaml(canon_path()) or {}
    return canon.get("agentes") or {}


def p95(valores: list[float]) -> float | None:
    if not valores:
        return None
    ordenados = sorted(valores)
    idx = min(len(ordenados) - 1, int(round(0.95 * (len(ordenados) - 1))))
    return ordenados[idx]


def custo_unitario_observado(eventos: list[dict], origem: str, agente: str | None) -> float | None:
    """p95 do custo por unidade, para projetar o gasto do próximo lote."""
    amostras = []
    for ev in consolidar(eventos).values():
        if ev.get("origem") != origem:
            continue
        if agente and ev.get("agente") != agente:
            continue
        c = custo_de(ev)
        if c is None:
            continue
        unidades = max(1, int(ev.get("unidades") or 1))
        amostras.append(c / unidades)
    return p95(amostras) if len(amostras) >= 5 else None


# ── comandos ─────────────────────────────────────────────────────────────────

def cmd_registrar(a) -> int:
    if a.claude_json:
        dados = json.loads(Path(a.claude_json).read_text(encoding="utf-8"))
        usd = dados.get("total_cost_usd")
        modelos = dados.get("modelUsage") or {}
        parcial = any((m or {}).get("costBasis") == "unknown" for m in modelos.values())
        fonte = "claude_json.parcial" if parcial else "claude_json.total_cost_usd"
        sessao = dados.get("session_id")
        status = dados.get("subtype") or "success"
    elif a.desconhecido:
        usd, fonte, modelos, sessao, status = None, "desconhecido", {}, None, "desconhecido"
    else:
        usd, fonte, modelos, sessao, status = a.usd, a.fonte or "manual", {}, None, "success"
        if usd is None:
            msg("informe --usd, --claude-json ou --desconhecido", err=True)
            return 2

    ev = {
        "v": 1, "tag": f"{host()}-{uuid.uuid4().hex[:12]}", "terminal": True,
        "status": status, "origem": a.origem, "agente": a.agente, "area": a.area,
        "rodada": a.rodada, "unidades": a.unidades, "sessao": sessao,
        "cost_usd": usd, "cost_source": fonte, "estimativa": True,
        "modelos": modelos, "host": host(), "registrado_em": agora(),
    }
    ev = acrescentar(ev)
    msg(f"registrado {ev['tag']} · {'sem custo medível' if usd is None else f'US$ {usd:.4f}'}"
         f" · {fonte}")
    return 0


def cmd_verificar(a) -> int:
    eventos = ler_todos()
    problemas = verificar_cadeia(eventos)
    desconhecidos = [e["tag"] for e in consolidar(eventos).values() if custo_de(e) is None]
    if a.json:
        print(json.dumps({"eventos": len(eventos), "cadeia_ok": not problemas,
                          "problemas": problemas, "sem_custo": desconhecidos},
                         ensure_ascii=False, indent=2))
    else:
        msg(f"{len(eventos)} evento(s) · cadeia {'OK' if not problemas else 'QUEBRADA'}")
        for p in problemas:
            msg(f"  - {p}", err=True)
        if desconhecidos:
            msg(f"  {len(desconhecidos)} evento(s) sem custo medível "
                 f"(política: {do_canon().get('politica_custo_desconhecido') or 'não declarada'})")
    return EXIT_DADO if problemas else 0


def cmd_saldo(a) -> int:
    eventos = ler_todos()
    if verificar_cadeia(eventos):
        msg("cadeia do ledger quebrada — rode `custo.py verificar` antes de confiar no saldo",
             err=True)
        return EXIT_DADO
    mes = a.mes or datetime.now(timezone.utc).strftime("%Y-%m")
    total, por = 0.0, {}
    desconhecidos = 0
    for ev in consolidar(eventos).values():
        if not (ev.get("registrado_em") or "").startswith(mes):
            continue
        c = custo_de(ev)
        if c is None:
            desconhecidos += 1
            continue
        total += c
        chave = ev.get(a.por or "agente") or "(sem)"
        por[chave] = por.get(chave, 0.0) + c

    cfg = do_canon()
    teto = cfg.get("orcamento_mensal_usd")
    if a.json:
        print(json.dumps({"mes": mes, "total_usd": round(total, 4), "por": por,
                          "sem_custo": desconhecidos, "orcamento_mensal_usd": teto},
                         ensure_ascii=False, indent=2))
    else:
        msg(f"{mes}: US$ {total:.4f} consumido"
             + (f" de US$ {teto:.2f}" if teto else " (orçamento não declarado no canon)"))
        for k, v in sorted(por.items(), key=lambda kv: -kv[1]):
            msg(f"  {k:<24} US$ {v:.4f}")
        if desconhecidos:
            msg(f"  ({desconhecidos} execução(ões) sem custo medível, fora da soma)")

    if a.write:
        from ruamel.yaml import YAML
        y = YAML()
        y.preserve_quotes = True
        p = canon_path()
        doc = y.load(p.read_text(encoding="utf-8"))
        doc.setdefault("agentes", {})
        doc["agentes"]["consumido_mes_usd"] = round(total, 4)
        doc["agentes"]["consumido_mes_ref"] = mes
        evs = ler_todos()
        doc["agentes"]["ledger_head"] = evs[-1]["event_hash"] if evs else None
        with open(p, "w", encoding="utf-8") as f:
            y.dump(doc, f)
        msg(f"canon atualizado: agentes.consumido_mes_usd = {round(total, 4)}")
    return 0


def cmd_checar(a) -> int:
    """Projeta o gasto ANTES de disparar. Exit 3 = não dispare."""
    cfg = do_canon()
    teto_mes = cfg.get("orcamento_mensal_usd")
    eventos = ler_todos()
    mes = datetime.now(timezone.utc).strftime("%Y-%m")
    consumido = sum(c for ev in consolidar(eventos).values()
                    if (ev.get("registrado_em") or "").startswith(mes)
                    and (c := custo_de(ev)) is not None)

    if a.projetado is not None:
        projecao, base = a.projetado, "informado"
    else:
        unit = custo_unitario_observado(eventos, a.origem, a.agente)
        if unit is None:
            unit = cfg.get("teto_por_disparo_usd")
            base = "teto_por_disparo_usd (sem histórico suficiente)"
            if unit is None:
                aviso = ("sem histórico e sem `agentes.teto_por_disparo_usd` no canon: "
                         "não dá para projetar o gasto.")
                if a.modo == "autonomo":
                    msg(aviso + " Em modo autônomo isso para aqui.", err=True)
                    return EXIT_ORCAMENTO
                msg(aviso + " Em modo interativo, siga por sua conta.", err=True)
                return 0
        else:
            base = "p95 observado"
        projecao = unit * (a.n or 1)

    if teto_mes is None:
        if a.modo == "autonomo":
            msg("`agentes.orcamento_mensal_usd` é null: laço autônomo sem teto não roda. "
                 "Declare o orçamento no canon.", err=True)
            return EXIT_DADO
        msg(f"projeção US$ {projecao:.4f} ({base}); orçamento não declarado — gasto não limitado")
        return 0

    total = consumido + projecao
    conta = (f"consumido US$ {consumido:.4f} + projeção US$ {projecao:.4f} ({base}) "
             f"= US$ {total:.4f} contra US$ {teto_mes:.2f} "
             f"[canon: agentes.orcamento_mensal_usd]")
    if a.json:
        print(json.dumps({"consumido": round(consumido, 4), "projecao": round(projecao, 4),
                          "total": round(total, 4), "teto": teto_mes, "base": base,
                          "estoura": total > teto_mes}, ensure_ascii=False, indent=2))
    else:
        msg(conta)
    if total > teto_mes:
        msg("ORÇAMENTO: o disparo estoura o teto do mês. "
             "Reduza o lote ou peça decisão do dono.", err=True)
        return EXIT_ORCAMENTO
    return 0


def cmd_reconciliar(a) -> int:
    eventos = ler_todos()
    if a.tag not in {ev.get("tag") for ev in eventos}:
        msg(f"tag desconhecida no ledger: {a.tag}", err=True)
        return EXIT_DADO
    ev = {"v": 1, "terminal": False, "reconcilia_tag": a.tag, "cost_usd": a.usd,
          "cost_source": a.fonte, "host": host(), "registrado_em": agora()}
    acrescentar(ev)
    msg(f"reconciliado {a.tag} → US$ {a.usd:.4f} ({a.fonte})")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    sub = ap.add_subparsers(dest="cmd", required=True)

    r = sub.add_parser("registrar")
    r.add_argument("--agente", required=True)
    r.add_argument("--origem", required=True)
    r.add_argument("--area")
    r.add_argument("--rodada")
    r.add_argument("--unidades", type=int, default=1)
    r.add_argument("--claude-json")
    r.add_argument("--usd", type=float)
    r.add_argument("--fonte")
    r.add_argument("--desconhecido", action="store_true")
    r.set_defaults(fn=cmd_registrar)

    v = sub.add_parser("verificar")
    v.add_argument("--json", action="store_true")
    v.set_defaults(fn=cmd_verificar)

    s = sub.add_parser("saldo")
    s.add_argument("--mes")
    s.add_argument("--por", choices=["agente", "area", "origem"])
    s.add_argument("--write", action="store_true")
    s.add_argument("--json", action="store_true")
    s.set_defaults(fn=cmd_saldo)

    c = sub.add_parser("checar")
    c.add_argument("--projetado", type=float)
    c.add_argument("--n", type=int)
    c.add_argument("--origem", required=True)
    c.add_argument("--agente")
    c.add_argument("--area")
    c.add_argument("--modo", choices=["interativo", "autonomo"], default="interativo")
    c.add_argument("--json", action="store_true")
    c.set_defaults(fn=cmd_checar)

    rc = sub.add_parser("reconciliar")
    rc.add_argument("--tag", required=True)
    rc.add_argument("--usd", type=float, required=True)
    rc.add_argument("--fonte", choices=["console", "usage-api", "manual"], required=True)
    rc.set_defaults(fn=cmd_reconciliar)

    a = ap.parse_args()
    return a.fn(a)


if __name__ == "__main__":
    sys.exit(main())
