#!/usr/bin/env python3
"""rodada.py — manifesto de rodada de fan-out e seu mapeamento para OpenTelemetry GenAI.

Uma rodada (ex.: `/analisar-negocio`) despacha N workers em paralelo. Sem registro, não se sabe
qual worker produziu valor e qual só custou tokens (`docs/grafo/04-plano.md`, S-09). Este
script grava esse registro em `gemeo/PROPOSTAS/RUNS/R###.yaml`, valida o formato e, só com
consentimento explícito, exporta a rodada como spans das GenAI semantic conventions (spec 007).

Regras que o script impõe:
- Valor desconhecido fica `null`. O script não estima tokens, duração nem custo (recusa 1).
- Manifesto gravado não é sobrescrito: é registro, não rascunho.
- Nada sai do repositório por padrão (gate `sem-exfiltracao`). O exportador exige
  `OTEL_EXPORTER_OTLP_ENDPOINT` **e** `PH3A_OTEL_EXPORTAR=1`, e a biblioteca `opentelemetry`
  é opcional: ausente, o YAML é gravado e o resto vira aviso.

Uso:
  rodada.py gravar --rodada R### --origem O --canon-sha SHA --completude ★
                   --worker "lente=L,candidatas=N,duplicadas=N,citacao_orfa=N,persistidas=N[,...]"
                   [--worker ...] [--inicio ISO] [--fim ISO] [--custo-usd X]
  rodada.py validar ARQ [ARQ ...]
  rodada.py spans ARQ [--json]          # mapeamento OTel, sem rede
  rodada.py exportar ARQ                # só com opt-in duplo

Exit: 0 ok · 1 dado inválido ou manifesto existente · 2 uso.
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

import yaml

sys.path.insert(0, str(Path(__file__).parent))
from _gemeo_lib import EXIT_DADO, EXIT_USO, repo_root  # noqa: E402

VERSAO = 1
ESTRELAS = {"☆", "★", "★★", "★★★"}
STATUS = {"ok", "falha"}
RE_RODADA = re.compile(r"^R\d{3,}$")
RE_SHA = re.compile(r"^[0-9a-f]{7,40}$")

CAMPOS_RODADA = ("versao", "rodada", "origem", "canon_sha", "completude", "inicio", "fim",
                 "custo_usd", "workers")
CONTAGENS = ("candidatas", "duplicadas", "citacao_orfa", "persistidas")
OPCIONAIS_INT = ("tokens_entrada", "tokens_saida")
CAMPOS_WORKER = ("lente", "agente", "status", *CONTAGENS, *OPCIONAIS_INT, "duracao_s", "modelo")
AGENTE_PADRAO = "analista"


def msg(texto: str, err: bool = False) -> None:
    print(texto, file=sys.stderr if err else sys.stdout)


def agora() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def ler_iso(valor: str) -> datetime:
    return datetime.fromisoformat(valor.replace("Z", "+00:00"))


def pasta_runs(raiz: Path | None = None) -> Path:
    return (raiz or repo_root(Path.cwd())) / "gemeo" / "PROPOSTAS" / "RUNS"


# ── esquema ──────────────────────────────────────────────────────────────────

def _inteiro(v) -> bool:
    return isinstance(v, int) and not isinstance(v, bool)


def _numero(v) -> bool:
    return isinstance(v, (int, float)) and not isinstance(v, bool)


def _data_ok(v) -> bool:
    if not isinstance(v, str):
        return False
    try:
        ler_iso(v)
    except ValueError:
        return False
    return True


def validar_worker(w, i: int) -> list[str]:
    if not isinstance(w, dict):
        return [f"workers[{i}]: deve ser um mapa"]
    erros = [f"workers[{i}]: campo desconhecido '{k}'" for k in w if k not in CAMPOS_WORKER]
    erros += [f"workers[{i}]: falta '{k}'" for k in CAMPOS_WORKER if k not in w]
    if not isinstance(w.get("lente"), str) or not w.get("lente"):
        erros.append(f"workers[{i}]: lente deve ser texto não vazio")
    if not isinstance(w.get("agente"), str) or not w.get("agente"):
        erros.append(f"workers[{i}]: agente deve ser texto não vazio")
    if w.get("status") not in STATUS:
        erros.append(f"workers[{i}]: status deve ser um de {sorted(STATUS)}")
    for c in CONTAGENS:
        if c in w and not (_inteiro(w[c]) and w[c] >= 0):
            erros.append(f"workers[{i}]: {c} deve ser inteiro >= 0")
    for c in OPCIONAIS_INT:
        if w.get(c) is not None and not (_inteiro(w[c]) and w[c] >= 0):
            erros.append(f"workers[{i}]: {c} deve ser null ou inteiro >= 0")
    if w.get("duracao_s") is not None and not (_numero(w["duracao_s"]) and w["duracao_s"] >= 0):
        erros.append(f"workers[{i}]: duracao_s deve ser null ou número >= 0")
    if w.get("modelo") is not None and not isinstance(w["modelo"], str):
        erros.append(f"workers[{i}]: modelo deve ser null ou texto")
    if all(_inteiro(w.get(c)) for c in CONTAGENS):
        if w["persistidas"] > w["candidatas"]:
            erros.append(f"workers[{i}]: persistidas ({w['persistidas']}) > candidatas "
                         f"({w['candidatas']})")
        if w["duplicadas"] + w["persistidas"] > w["candidatas"]:
            erros.append(f"workers[{i}]: duplicadas + persistidas passa de candidatas "
                         f"({w['candidatas']})")
    return erros


def validar_manifesto(m) -> list[str]:
    """Lista de erros; vazia = manifesto válido."""
    if not isinstance(m, dict):
        return ["manifesto deve ser um mapa"]
    erros = [f"campo desconhecido '{k}'" for k in m if k not in CAMPOS_RODADA]
    erros += [f"falta '{k}'" for k in CAMPOS_RODADA if k not in m]
    if m.get("versao") != VERSAO:
        erros.append(f"versao deve ser {VERSAO}")
    if not (isinstance(m.get("rodada"), str) and RE_RODADA.match(m["rodada"])):
        erros.append("rodada deve ter a forma R### (ex.: R001)")
    if not isinstance(m.get("origem"), str) or not m.get("origem"):
        erros.append("origem deve ser texto não vazio (a skill que disparou a rodada)")
    if not (isinstance(m.get("canon_sha"), str) and RE_SHA.match(m["canon_sha"])):
        erros.append("canon_sha deve ser hex de 7 a 40 caracteres")
    comp = m.get("completude")
    if not (isinstance(comp, str) and comp.split() and comp.split()[0] in ESTRELAS):
        erros.append(f"completude deve começar por um de {sorted(ESTRELAS)}")
    for c in ("inicio", "fim"):
        if m.get(c) is not None and not _data_ok(m[c]):
            erros.append(f"{c} deve ser null ou data ISO-8601")
    if not _data_ok(m.get("fim")):
        erros.append("fim é obrigatório (dado-datado)")
    if m.get("custo_usd") is not None and not (_numero(m["custo_usd"]) and m["custo_usd"] >= 0):
        erros.append("custo_usd deve ser null ou número >= 0")
    workers = m.get("workers")
    if not isinstance(workers, list) or not workers:
        erros.append("workers deve ser uma lista com ao menos um worker")
        return erros
    vistas: set[str] = set()
    for i, w in enumerate(workers):
        erros += validar_worker(w, i)
        lente = w.get("lente") if isinstance(w, dict) else None
        if lente in vistas:
            erros.append(f"workers[{i}]: lente repetida '{lente}'")
        vistas.add(lente)
    return erros


# ── montagem ─────────────────────────────────────────────────────────────────

def _converter(chave: str, bruto: str):
    if chave in CONTAGENS or chave in OPCIONAIS_INT:
        return int(bruto)
    if chave == "duracao_s":
        return float(bruto)
    return bruto


def parse_worker(spec: str) -> dict:
    """`lente=x,candidatas=3,...` → dict completo, com `null` no que não foi informado."""
    w: dict = {c: None for c in CAMPOS_WORKER}
    w["agente"], w["status"] = AGENTE_PADRAO, "ok"
    for par in filter(None, (p.strip() for p in spec.split(","))):
        if "=" not in par:
            raise ValueError(f"par sem '=' no worker: '{par}'")
        k, v = (s.strip() for s in par.split("=", 1))
        if k not in CAMPOS_WORKER:
            raise ValueError(f"chave desconhecida no worker: '{k}' "
                             f"(aceitas: {', '.join(CAMPOS_WORKER)})")
        try:
            w[k] = _converter(k, v)
        except ValueError:
            raise ValueError(f"valor inválido para '{k}': '{v}'") from None
    return w


def montar_manifesto(rodada: str, origem: str, canon_sha: str, completude: str,
                     workers: list[dict], inicio: str | None = None, fim: str | None = None,
                     custo_usd: float | None = None) -> dict:
    return {"versao": VERSAO, "rodada": rodada, "origem": origem, "canon_sha": canon_sha,
            "completude": completude, "inicio": inicio, "fim": fim or agora(),
            "custo_usd": custo_usd, "workers": workers}


# ── comandos ─────────────────────────────────────────────────────────────────

def cmd_gravar(a) -> int:
    try:
        workers = [parse_worker(s) for s in a.worker]
    except ValueError as e:
        msg(f"ERRO de uso: {e}", err=True)
        return EXIT_USO
    m = montar_manifesto(a.rodada, a.origem, a.canon_sha, a.completude, workers,
                         a.inicio, a.fim, a.custo_usd)
    erros = validar_manifesto(m)
    if erros:
        msg("manifesto inválido, nada gravado:", err=True)
        for e in erros:
            msg(f"  - {e}", err=True)
        return EXIT_DADO
    destino = pasta_runs() / f"{a.rodada}.yaml"
    if destino.exists():
        msg(f"{destino} já existe: manifesto é registro, não se sobrescreve. "
            "Use o próximo número de rodada.", err=True)
        return EXIT_DADO
    destino.parent.mkdir(parents=True, exist_ok=True)
    destino.write_text(yaml.safe_dump(m, allow_unicode=True, sort_keys=False), encoding="utf-8")
    msg(f"manifesto gravado: {destino} ({len(workers)} worker(s))")
    exportar_se_ligado(m)
    return 0


def carregar(arq: str) -> dict:
    try:
        return yaml.safe_load(Path(arq).read_text(encoding="utf-8"))
    except (OSError, yaml.YAMLError) as e:
        raise SystemExit(f"não consegui ler {arq}: {e}")


def cmd_validar(a) -> int:
    falhou = False
    for arq in a.arquivos:
        erros = validar_manifesto(carregar(arq))
        if erros:
            falhou = True
            msg(f"✘ {arq}", err=True)
            for e in erros:
                msg(f"  - {e}", err=True)
        else:
            msg(f"✓ {arq}")
    return EXIT_DADO if falhou else 0


# ── OpenTelemetry GenAI semconv (fase 2) ─────────────────────────────────────
# Fonte dos nomes: open-telemetry/semantic-conventions-genai, docs/gen-ai/gen-ai-agent-spans.md,
# lida em 2026-11-03 (status Development, os nomes podem mudar). Tudo que é nome da convenção
# está aqui, para uma mudança dela ser uma edição só.
OP_WORKFLOW = "invoke_workflow"          # span gen_ai.invoke_workflow.internal
OP_AGENTE = "invoke_agent"               # span gen_ai.invoke_agent.internal
KIND = "INTERNAL"
GENAI = {
    "operacao": "gen_ai.operation.name",
    "workflow": "gen_ai.workflow.name",
    "conversa": "gen_ai.conversation.id",
    "agente": "gen_ai.agent.name",
    "modelo": "gen_ai.request.model",
    "tokens_entrada": "gen_ai.usage.input_tokens",
    "tokens_saida": "gen_ai.usage.output_tokens",
    "erro": "error.type",
}
ERRO_GENERICO = "_OTHER"

# Lista FECHADA do que pode sair num span (gate sem-exfiltracao). Contagens, ids e nomes de
# lente, nada de conteúdo: os atributos opt-in de conteúdo da convenção (gen_ai.input.messages,
# gen_ai.output.messages, gen_ai.system_instructions, gen_ai.tool.definitions) nunca são emitidos.
ATRIBUTOS_PERMITIDOS = frozenset({
    *GENAI.values(),
    "ph3a.rodada", "ph3a.origem", "ph3a.canon_sha", "ph3a.completude", "ph3a.custo_usd",
    "ph3a.lente", *(f"ph3a.{c}" for c in CONTAGENS),
})

ENV_ENDPOINT = "OTEL_EXPORTER_OTLP_ENDPOINT"
ENV_CONSENTIMENTO = "PH3A_OTEL_EXPORTAR"


def _ns(iso: str) -> int:
    return int(ler_iso(iso).timestamp() * 1_000_000_000)


def _sem_null(atributos: dict) -> dict:
    """Atributo desconhecido não é emitido: zero no lugar de "não sei" seria número inventado."""
    out = {k: v for k, v in atributos.items() if v is not None}
    fora = set(out) - ATRIBUTOS_PERMITIDOS
    if fora:                                  # defesa: só muda se alguém mexer no mapeamento
        raise ValueError(f"atributo fora da lista fechada: {sorted(fora)}")
    return out


def spans_de(m: dict) -> list[dict]:
    """Manifesto → spans (função pura, sem rede). O primeiro é a raiz."""
    fim = _ns(m["fim"])
    inicio = _ns(m["inicio"]) if m.get("inicio") else fim
    raiz = {
        "id": "rodada", "pai": None, "nome": f"{OP_WORKFLOW} {m['origem']}", "kind": KIND,
        "inicio_ns": inicio, "fim_ns": fim, "status": "OK",
        "atributos": _sem_null({
            GENAI["operacao"]: OP_WORKFLOW, GENAI["workflow"]: m["origem"],
            GENAI["conversa"]: m["rodada"],
            "ph3a.rodada": m["rodada"], "ph3a.origem": m["origem"],
            "ph3a.canon_sha": m["canon_sha"], "ph3a.completude": m["completude"],
            "ph3a.custo_usd": m.get("custo_usd"),
        }),
    }
    spans = [raiz]
    for w in m["workers"]:
        dur = w.get("duracao_s")
        falhou = w.get("status") == "falha"
        spans.append({
            "id": f"worker:{w['lente']}", "pai": raiz["id"],
            "nome": f"{OP_AGENTE} {w['agente']}", "kind": KIND,
            "inicio_ns": inicio,
            "fim_ns": inicio + int(dur * 1_000_000_000) if dur is not None else fim,
            "status": "ERROR" if falhou else "OK",
            "atributos": _sem_null({
                GENAI["operacao"]: OP_AGENTE, GENAI["agente"]: w["agente"],
                GENAI["conversa"]: m["rodada"], GENAI["modelo"]: w.get("modelo"),
                GENAI["tokens_entrada"]: w.get("tokens_entrada"),
                GENAI["tokens_saida"]: w.get("tokens_saida"),
                GENAI["erro"]: ERRO_GENERICO if falhou else None,
                "ph3a.lente": w["lente"], **{f"ph3a.{c}": w[c] for c in CONTAGENS},
            }),
        })
    return spans


def exportador_ligado(env=None) -> tuple[bool, str]:
    """Opt-in DUPLO. O endpoint OTLP é variável genérica (qualquer processo instrumentado da
    máquina pode tê-la); o consentimento PH3A_OTEL_EXPORTAR=1 é o que diz que ESTE projeto
    decidiu mandar a telemetria do gêmeo para fora. Ligar é Tipo 1: decisão do dono."""
    env = os.environ if env is None else env
    if not env.get(ENV_ENDPOINT):
        return False, f"{ENV_ENDPOINT} ausente: exportador desligado, só o YAML foi gravado"
    if env.get(ENV_CONSENTIMENTO) != "1":
        return False, (f"{ENV_ENDPOINT} está definido, mas {ENV_CONSENTIMENTO}=1 não: exportador "
                       "desligado. Ligar é decisão do dono (Tipo 1), ver /otel-guard")
    return True, "exportador ligado"


def _exportador_otlp():
    """Exportador OTLP real, se o pacote existir (http primeiro, gRPC depois)."""
    try:
        from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
    except ImportError:
        try:
            from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
        except ImportError:
            return None
    return OTLPSpanExporter()


def exportar(m: dict, exportador=None) -> tuple[bool, str]:
    """Envia os spans. Nunca levanta: falha vira (False, motivo). Não checa o opt-in, quem
    chama checa (o teste injeta um exportador em memória)."""
    try:
        from opentelemetry import trace
        from opentelemetry.sdk.resources import Resource
        from opentelemetry.sdk.trace import TracerProvider
        from opentelemetry.sdk.trace.export import SimpleSpanProcessor, SpanExportResult
        from opentelemetry.sdk.trace.export.in_memory_span_exporter import InMemorySpanExporter
        from opentelemetry.trace import SpanKind, Status, StatusCode
    except ImportError as e:
        return False, (f"biblioteca opentelemetry não instalada ({e}); o YAML foi gravado. "
                       "Instale opentelemetry-sdk e opentelemetry-exporter-otlp no projeto")
    try:
        exportador = exportador or _exportador_otlp()
        if exportador is None:
            return False, ("exportador OTLP não instalado (opentelemetry-exporter-otlp); "
                           "o YAML foi gravado")
        # Os spans são montados em memória e enviados num lote só, com o resultado conferido.
        # Um processor ligado direto ao exportador engoliria a falha do coletor (e tentaria de
        # novo a cada span): o script diria "exportado" com o coletor fora do ar.
        memoria = InMemorySpanExporter()
        provedor = TracerProvider(resource=Resource.create(
            {"service.name": os.environ.get("OTEL_SERVICE_NAME", "ph3a-gemeo")}))
        provedor.add_span_processor(SimpleSpanProcessor(memoria))
        tracer = provedor.get_tracer("ph3a.rodada", str(VERSAO))
        raiz_d, *filhos_d = spans_de(m)
        raiz = tracer.start_span(raiz_d["nome"], kind=SpanKind.INTERNAL,
                                 start_time=raiz_d["inicio_ns"], attributes=raiz_d["atributos"])
        ctx = trace.set_span_in_context(raiz)
        for d in filhos_d:
            s = tracer.start_span(d["nome"], context=ctx, kind=SpanKind.INTERNAL,
                                  start_time=d["inicio_ns"], attributes=d["atributos"])
            if d["status"] == "ERROR":
                s.set_status(Status(StatusCode.ERROR))
            s.end(end_time=d["fim_ns"])
        raiz.end(end_time=raiz_d["fim_ns"])
        provedor.shutdown()
        resultado = exportador.export(memoria.get_finished_spans())
        exportador.shutdown()
    except Exception as e:                      # rede, coletor fora do ar: o YAML já está salvo
        return False, f"exportação falhou ({type(e).__name__}: {e}); o YAML foi gravado"
    if resultado != SpanExportResult.SUCCESS:
        return False, f"exportação falhou (coletor respondeu {resultado.name}); o YAML foi gravado"
    return True, f"{1 + len(filhos_d)} span(s) exportado(s)"


def exportar_se_ligado(m: dict) -> None:
    """Chamado por `gravar` depois do YAML salvo. Falha nunca muda o exit."""
    ligado, motivo = exportador_ligado()
    if not ligado:
        if os.environ.get(ENV_ENDPOINT):       # só fala quando há algo a explicar
            msg(f"aviso: {motivo}", err=True)
        return
    ok, motivo = exportar(m)
    msg(f"{'otel' if ok else 'aviso'}: {motivo}", err=not ok)


def cmd_spans(a) -> int:
    m = carregar(a.arquivo)
    erros = validar_manifesto(m)
    if erros:
        msg(f"manifesto inválido: {'; '.join(erros)}", err=True)
        return EXIT_DADO
    spans = spans_de(m)
    if a.json:
        print(json.dumps(spans, ensure_ascii=False, indent=2))
    else:
        for s in spans:
            recuo = "  " if s["pai"] else ""
            dur = (s["fim_ns"] - s["inicio_ns"]) / 1_000_000_000
            msg(f"{recuo}{s['nome']} [{s['status']}] {dur:.1f}s {s['atributos']}")
    return 0


def cmd_exportar(a) -> int:
    m = carregar(a.arquivo)
    erros = validar_manifesto(m)
    if erros:
        msg(f"manifesto inválido: {'; '.join(erros)}", err=True)
        return EXIT_DADO
    ligado, motivo = exportador_ligado()
    if not ligado:
        msg(motivo)
        return 0
    ok, motivo = exportar(m)
    msg(motivo, err=not ok)
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    sub = ap.add_subparsers(dest="cmd", required=True)

    g = sub.add_parser("gravar")
    g.add_argument("--rodada", required=True)
    g.add_argument("--origem", required=True)
    g.add_argument("--canon-sha", required=True)
    g.add_argument("--completude", required=True)
    g.add_argument("--worker", action="append", default=[], required=True)
    g.add_argument("--inicio")
    g.add_argument("--fim")
    g.add_argument("--custo-usd", type=float)
    g.set_defaults(fn=cmd_gravar)

    v = sub.add_parser("validar")
    v.add_argument("arquivos", nargs="+")
    v.set_defaults(fn=cmd_validar)

    s = sub.add_parser("spans")
    s.add_argument("arquivo")
    s.add_argument("--json", action="store_true")
    s.set_defaults(fn=cmd_spans)

    e = sub.add_parser("exportar")
    e.add_argument("arquivo")
    e.set_defaults(fn=cmd_exportar)

    a = ap.parse_args()
    return a.fn(a)


if __name__ == "__main__":
    sys.exit(main())
