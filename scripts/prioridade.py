#!/usr/bin/env python3
"""prioridade.py — motor de priorização Bayesiana orientado ao gêmeo.

Ordena uma fila de trabalho (tarefas, bugs, eventos de segurança, propostas) pela
CONTRIBUIÇÃO ESPERADA AO RETORNO DO NEGÓCIO, condicionada ao estado do canon.

Núcleo Naive Bayes em log-odds:   logit(post) = logit(prior) + Σ ln(LR_j)
Decisão (ordena a fila):          EV = posterior × impacto_objetivos × urgência / esforço
O stdout é a "conta visível" citável — nenhuma aritmética em prosa.

Uso:
  prioridade.py <corpus> [--in FILE] [--asof YYYY-MM-DD] [--top N] [--json] [--write]
  corpus: soc | backlog | human | propostas | all

`backlog` e `all` incluem a fila humana (tasks/human.md) — cada decisão pendente do dono
trava trabalho do agente, então concorre na mesma fila, com prior próprio (lente `human`).
Nenhum marcador `[prio:]` é escrito nela: ver TASKS_SEM_MARCADOR_EXTRA.

Exit: 0 ok · 1 erro de dado (evidência sem LR; canon sem objetivo) · 2 uso · 3 há EXISTENCIAL.
Contrato: specs/003-motor-priorizacao/contracts/cli.md
"""

from __future__ import annotations

import argparse
import datetime
import json
import math
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from _gemeo_lib import (EXIT_ALERTA, die_dado, die_uso, emit, get_path,
                        load_yaml, point_value, repo_root)

BANDA_RANK = {"BAIXA": 0, "MEDIA": 1, "ALTA": 2, "EXISTENCIAL": 3}
# `-?` porque score negativo é possível quando as âncoras mudam: sem ele o marcador
# antigo sobrevive à substituição, acumula na linha e o slug (identidade do item)
# muda a cada rodada.
MARKER_RE = re.compile(r"\s*\[prio:\s*-?[0-9.]+\s+calc:prioridade\]")
TASK_LINE_RE = re.compile(r"^(\s*-\s*\[(?P<state>[ xX/\-])\]\s*)(?P<body>.*)$")
DATE_RE = re.compile(r"📅\s*(\d{4}-\d{2}-\d{2})")     # registrada em (ver tasks/README.md)
PRAZO_RE = re.compile(r"🎯\s*(\d{4}-\d{2}-\d{2})")    # prazo real, opcional
ESFORCO_RE = re.compile(r"#esforco/([pmg])\b")
EIS_RE = re.compile(r"#eis/(q[1-4])\b", re.IGNORECASE)

# Prazo de BLOCO: uma entrega raramente é uma tarefa só, e repetir `🎯` em cada linha de uma
# frente de dez itens garante que uma delas fique para trás quando a data muda. O prazo do
# bloco vale para todo item dele que não declare o seu — item vence bloco, sempre.
#
# Só nível zero: um `🎯` em sub-bullet (`  - Contexto: entregar até 🎯 …`) é prosa do item, e
# promovê-lo a prazo do bloco datava a frente inteira por engano.
BLOCO_RE = re.compile(r"^(#{2,4})\s")
PRAZO_BLOCO_RE = re.compile(r"^\*\*(?:Prazo|Entrega)\:?\*\*\s*:?\s*(?:🎯\s*)?(\d{4}-\d{2}-\d{2})")

# A fila é uma ALLOWLIST, não uma denylist.
#
# Denylist não antecipa o próximo arquivo que alguém solta em tasks/: medido em DATA-DOSSIE,
# `validacao-2026-07-28.md` (um relatório de validação com checkboxes) entrou na fila com 34
# itens e recebeu `[prio:]`. Eles competiam por Q1 com trabalho real e faziam o total do painel
# divergir do total da matriz.
#
# `human.md` é fila também, mas tem parser próprio (parse_human) — está fora desta tupla.
#
# `spec.md` é GERADO por `scripts/importar-spec.py` a partir da spec ativa
# (`.specify/feature.json`): uma linha por User Story aberta. Entra na fila como qualquer
# outro arquivo — recebe `[prio:]` e concorre na matriz —, e o gerador roda ANTES do motor no
# sync, então o marcador escrito aqui vale para o espelho que vai ao cofre.
TASKS_FILA = ("backlog.md", "bugs.md", "features.md", "spec.md")

# Lidos mas NUNCA alterados — priorizar não autoriza escrever:
#   filas humanas  a pessoa responde na própria linha do item (`→ opção B`), e o dialeto de
#                  heading não tem checkbox onde pendurar marcador.
#   inbox.md       escrever aqui altera a linha que obsidian-inbox-merge.js compara por string
#                  exata contra a base; a instrução consumida ressuscitaria ou duplicaria.
TASKS_SEM_MARCADOR_EXTRA = ("human.md", "inbox.md")

# Filas humanas: arquivo → nome da pessoa. Um projeto pode ter várias — a plataforma-cursos
# tem `johnny.md` e `leonardo.md` em vez de um `human.md` único, e cada uma é a fila de uma
# pessoa de verdade. Declarado em `tasks/.filas.yaml` para não depender de renomear arquivo
# (há 68 referências cruzadas a esses nomes) nem de heurística sobre nome de arquivo:
#
#   # tasks/.filas.yaml
#   johnny.md: Johnny
#   leonardo.md: Leonardo
#
# Sem o arquivo, o default é o padrão de projeto único: `human.md` → "dono".
FILAS_DEFAULT = {"human.md": "dono"}
FILAS_CONFIG = ".filas.yaml"


def ignorados(tdir: Path) -> set[str]:
    """Arquivos em tasks/ que sabidamente NÃO são fila (`_ignorar:` no .filas.yaml).

    Sem isso o aviso de "fora da fila" repete os mesmos nomes em todo sync — e aviso que
    nunca muda deixa de ser lido, justo quando um arquivo novo aparece.
    """
    cfg = tdir / FILAS_CONFIG
    if not cfg.exists():
        return set()
    val = (load_yaml(cfg) or {}).get("_ignorar") or []
    if isinstance(val, str):
        val = [val]
    return {str(v) for v in val}


def filas_humanas(tdir: Path) -> dict[str, str]:
    """{arquivo: pessoa} das filas humanas deste diretório de tarefas."""
    cfg = tdir / FILAS_CONFIG
    if cfg.exists():
        dados = load_yaml(cfg) or {}
        mapa = {str(k): str(v) for k, v in dados.items()
                if not str(k).startswith("_") and (tdir / str(k)).exists()}
        if mapa:
            return mapa
    return {k: v for k, v in FILAS_DEFAULT.items() if (tdir / k).exists()}


# ----------------------------------------------------------------- utilidades

def model_path(root: Path) -> Path:
    return root / "gemeo" / "00-CANON" / "prioridade.yaml"


def raiz_do_projeto(canon_externo: bool) -> Path:
    """Raiz do repositório.

    Com `--canon` externo o marcador é `tasks/`, não `gemeo/00-CANON/canon.yaml`: um
    projeto que prioriza pelo canon operacional compartilhado do cofre não precisa ter
    corpus próprio (metade dos projetos PH3A não tem, incluindo os de maior volume).
    """
    if not canon_externo:
        return repo_root()
    p = Path.cwd().resolve()
    for cand in [p, *p.parents]:
        if (cand / "tasks").is_dir():
            return cand
    die_uso("não encontrei tasks/ — rode a partir da raiz do repositório")


def logit(p: float) -> float:
    p = min(max(p, 1e-9), 1 - 1e-9)
    return math.log(p / (1 - p))


def sigmoid(x: float) -> float:
    return 1.0 / (1.0 + math.exp(-x))


def parse_date(s) -> datetime.date | None:
    if not s:
        return None
    if isinstance(s, datetime.date):
        return s
    try:
        return datetime.date.fromisoformat(str(s)[:10])
    except ValueError:
        return None


def asof_date(canon: dict, override: str | None) -> datetime.date:
    d = parse_date(override) or parse_date(get_path(canon, "_meta.data_referencia"))
    if d is None:
        die_uso("sem --asof e canon._meta.data_referencia ausente; não dá pra medir idades "
                "de forma determinística")
    return d


# ------------------------------------------------------ função-objetivo (canon)

def objetivos_ativos(canon: dict, model: dict) -> tuple[dict, int]:
    """Retorna ({objetivo: peso g_o}, n_fontes_resolvidas).

    n_fontes_resolvidas == 0 ⇒ canon sem sinal de negócio ⇒ o chamador recusa."""
    ativos: dict[str, float] = {}
    resolvidas = 0
    for nome, cfg in (model.get("objetivos") or {}).items():
        at = cfg.get("ativacao") or {}
        tipo = at.get("tipo")
        peso = float(at.get("peso", 1.0))
        peso_ok = float(at.get("peso_ok", peso))
        fonte = cfg.get("fonte")
        if tipo == "sempre" or fonte is None:
            ativos[nome] = peso if tipo == "sempre" else peso_ok
            continue
        val = point_value(get_path(canon, fonte))
        if val is None:
            continue  # objetivo de negócio sem dado no canon → não ativa
        resolvidas += 1
        limiar = at.get("limiar")
        disparou = _compara(val, tipo, limiar)
        ativos[nome] = peso if disparou else peso_ok
    return ativos, resolvidas


def _compara(val, tipo, limiar) -> bool:
    if limiar is None:
        return False
    if tipo == "menor_que":
        return val < limiar
    if tipo == "menor_igual":
        return val <= limiar
    if tipo == "maior_que":
        return val > limiar
    if tipo == "maior_igual":
        return val >= limiar
    return False


# -------------------------------------------------------------- Bayes log-odds

def escala_magnitude(count, mag_cfg, model) -> float:
    if not mag_cfg or count in (None, 0):
        return 1.0
    k = float((model.get("magnitude") or {}).get("k", 0.5))
    m_ref = float(mag_cfg.get("m_ref", 1))
    return 1.0 + k * math.log(1.0 + float(count) / m_ref)


def evidencias_presentes(item: dict, ev_defs: dict) -> dict:
    """Normaliza evidências do item em {chave: count|None}, removendo as fundidas."""
    raw = item.get("evidencias", {})
    if isinstance(raw, list):
        pres = {c: None for c in raw}
    else:
        pres = {c: (v.get("count") if isinstance(v, dict) else None) for c, v in raw.items()}
    # contagem por campo nomeado (ex.: forca_bruta usa item['tentativas'])
    for chave, d in ev_defs.items():
        mag = d.get("magnitude") if isinstance(d, dict) else None
        if chave in pres and mag and pres[chave] is None:
            pres[chave] = item.get(mag["campo"])
    suprimidas = set()
    for chave in list(pres):
        d = ev_defs.get(chave)
        for outra in (d or {}).get("funde_com", []) if isinstance(d, dict) else []:
            if outra in pres:
                suprimidas.add(outra)
    return {c: n for c, n in pres.items() if c not in suprimidas}


def posterior(item: dict, lente: dict, model: dict) -> dict:
    prior_ref = lente.get("prior_ref")
    prior = (model.get("priors") or {}).get(prior_ref)
    if prior is None:
        die_dado(f"prior '{prior_ref}' ausente/null em prioridade.yaml")
    ev_defs = lente.get("evidencias") or {}
    w_max = float((model.get("magnitude") or {}).get("w_max", 4.0))
    l = logit(prior)
    contribs = []
    for chave, count in evidencias_presentes(item, ev_defs).items():
        d = ev_defs.get(chave)
        if d is None:
            continue  # evidência desconhecida pela lente (pode ser flag de guarda)
        if "lr" not in d:
            die_dado(f"evidência '{chave}' sem LR na lente — lacuna de dado em prioridade.yaml")
        w = math.log(d["lr"]) * escala_magnitude(count, d.get("magnitude"), model)
        if w > 0:
            w = min(w, w_max)
        l += w
        contribs.append({"evidencia": chave, "ln_lr": round(w, 3),
                         "count": count, "efeito": "agrava" if w >= 0 else "reduz"})
    return {"logit": l, "posterior": sigmoid(l), "prior": prior, "contribs": contribs}


def score_de_logit(l: float, prior: float, anc: dict) -> float:
    """Piecewise-linear afim no logit: (logit(prior)→score_prior), (0→score_meio),
    (logit_forte_valor→score_forte). Clamp [0,100]."""
    l0, s0 = logit(prior), float(anc["score_prior"])
    l1, s1 = 0.0, float(anc["score_meio"])
    l2, s2 = float(anc["logit_forte_valor"]), float(anc["score_forte"])
    if l <= l1:
        sc = _interp(l, l0, s0, l1, s1)
    else:
        sc = _interp(l, l1, s1, l2, s2)
    return max(0.0, min(100.0, sc))


def _interp(x, x0, y0, x1, y1):
    if x1 == x0:
        return y1
    return y0 + (y1 - y0) * (x - x0) / (x1 - x0)


def banda_de_score(score: float, model: dict) -> str:
    b = model.get("bandas") or {}
    if score >= b.get("alta", [71, 100])[0]:
        return "ALTA"
    if score >= b.get("media", [31, 70])[0]:
        return "MEDIA"
    return "BAIXA"


# --------------------------------------------------------- guarda existencial

def guarda_existencial(item: dict, canon: dict, model: dict) -> list[str]:
    disparadas = []
    raw_ev = item.get("evidencias", {})
    evset = set(raw_ev if isinstance(raw_ev, list) else raw_ev.keys())
    for nome, g in (model.get("guardas") or {}).items():
        if "evidencia" in g and g["evidencia"] in evset:
            disparadas.append(nome)
        elif "fonte" in g:
            val = point_value(get_path(canon, g["fonte"]))
            if val is not None and _compara(val, g.get("tipo"), g.get("limiar")):
                disparadas.append(nome)
    return disparadas


# ----------------------------------------------------------- urgência/esforço

def _fator_prazo(prazo: datetime.date, asof: datetime.date,
                 model: dict) -> tuple[float, str]:
    """Urgência derivada de um prazo real (`🎯`). Vencido cresce sem teto."""
    cfg = model.get("prazo") or {}
    no_prazo = float(cfg.get("fator_no_prazo", 3.0))
    horizonte = float(cfg.get("horizonte_dias", 14))
    no_horizonte = float(cfg.get("fator_no_horizonte", 1.2))
    dias = (prazo - asof).days
    if dias < 0:
        alpha = float(cfg.get("alpha_atraso_por_dia", 0.1))
        return no_prazo + alpha * (-dias), f"prazo vencido há {-dias}d"
    if dias <= horizonte and horizonte > 0:
        f = _interp(dias, 0, no_prazo, horizonte, no_horizonte)
        return f, f"prazo em {dias}d"
    return 1.0, "base"


def urgencia(item: dict, banda: str, model: dict, asof: datetime.date,
             lente: dict | None = None) -> tuple[float, str]:
    """Urgência = o maior entre piso da lente, prazo explícito (`🎯`) e idade.

    Anti-decaimento (FR-016): item grave ABERTO e SEM atenção tem urgência
    monotônica não-decrescente na idade — o que foi esquecido sobe. As bandas
    elegíveis vêm do modelo: com o acervo real nenhuma tarefa alcança ALTA, então
    limitar a ALTA/EXISTENCIAL deixaria a urgência constante em 1.0 para todas.

    O piso por lente existe porque idade não captura tudo: uma decisão na fila humana
    bloqueia trabalho do agente desde o instante em que é registrada — é urgente por
    natureza. E como human.md é editado toda vez que um agente registra algo, o
    `git blame` da linha vive sendo renovado e a idade nunca cresce.
    """
    fator, motivo = 1.0, "base"
    piso = float((lente or {}).get("piso_urgencia", 0) or 0)
    if piso > fator:
        fator, motivo = piso, "piso da lente (bloqueia trabalho)"
    prazo = parse_date(item.get("prazo"))
    if prazo is not None:
        f, m = _fator_prazo(prazo, asof, model)
        if f > fator:
            fator, motivo = f, m
    ad = model.get("anti_decaimento") or {}
    bandas_ok = tuple(ad.get("bandas") or ("ALTA", "EXISTENCIAL"))
    if item.get("aberto", True) and not item.get("atencao_em") and banda in bandas_ok:
        nasc = parse_date(item.get("primeira_vez_em"))
        idade = max(0, (asof - nasc).days) if nasc else 0
        f = 1.0 + float(ad.get("alpha_por_dia", 0.05)) * idade
        if f > fator:
            fator, motivo = f, f"anti-decaimento (aberto há {idade}d sem atenção)"
    # Teto: sem ele a idade domina tudo (o acervo tem itens de 130+ dias → fator 7,5) e o
    # score deixa de diferenciar. Saturar preserva "o esquecido sobe" sem apagar a
    # importância. Monotonicidade fica não-decrescente, como o FR-016 exige.
    teto = float((model.get("urgencia") or {}).get("fator_max", 0)) or None
    if teto and fator > teto:
        fator, motivo = teto, f"{motivo} · saturado em {teto}"
    return fator, motivo


def esforco(item: dict, model: dict | None = None) -> float:
    """Divisor do EV. Aceita número ou a tag `#esforco/p|m|g` já extraída."""
    escala = ((model or {}).get("esforco_escala")
              or {"p": 0.5, "m": 1.0, "g": 3.0})
    v = item.get("esforco", 1.0)
    if isinstance(v, str):
        v = escala.get(v.strip().lower(), 1.0)
    try:
        f = float(v)
    except (TypeError, ValueError):
        f = 1.0
    return f if f > 0 else 1.0


# ----------------------------------------------------------- matriz Eisenhower

def quadrante(score: float, urg: float, banda: str, model: dict,
              override: str | None = None) -> tuple[str, str]:
    """Q1 fazer agora · Q2 agendar · Q3 delegar/rápido · Q4 descartar.

    Importância vem do score (posterior × objetivos), urgência do fator de
    `urgencia()`. Override manual (`#eis/q1..q4`) vence o cálculo.
    """
    if override:
        return override.upper(), "override"
    if banda == "EXISTENCIAL":
        return "Q1", "existencial"
    eis = model.get("eisenhower") or {}
    importante = score >= float(eis.get("limiar_importancia_score", 60))
    urgente = urg >= float(eis.get("limiar_urgencia_fator", 2.0))
    if importante:
        return ("Q1" if urgente else "Q2"), "calculado"
    return ("Q3" if urgente else "Q4"), "calculado"


# --------------------------------------------------------------- agregação SOC

def agregar_entidades(itens: list[dict], lente: dict) -> list[dict]:
    chaves = lente.get("chave_entidade")
    if not chaves:
        return itens
    grupos: dict[tuple, dict] = {}
    for it in itens:
        kid = tuple(str(it.get(k)) for k in chaves if it.get(k) is not None)
        if not kid:
            kid = (it.get("id", "?"),)
        g = grupos.get(kid)
        if g is None:
            g = {"id": ":".join(kid), "evidencias": {}, "aberto": it.get("aberto", True),
                 "tipo": it.get("tipo", "evento"), "area": it.get("area"),
                 "atencao_em": it.get("atencao_em"), "primeira_vez_em": it.get("primeira_vez_em")}
            for k in chaves:
                if it.get(k) is not None:
                    g[k] = it[k]
            grupos[kid] = g
        _merge_ev(g, it)
        # mais antigo prevalece; atenção se qualquer evento teve
        d_new, d_old = parse_date(it.get("primeira_vez_em")), parse_date(g.get("primeira_vez_em"))
        if d_new and (not d_old or d_new < d_old):
            g["primeira_vez_em"] = it["primeira_vez_em"]
        if it.get("atencao_em"):
            g["atencao_em"] = it["atencao_em"]
    return list(grupos.values())


def _merge_ev(g: dict, it: dict):
    raw = it.get("evidencias", {})
    items = ((c, None) for c in raw) if isinstance(raw, list) else raw.items()
    for c, v in items:
        cnt = v.get("count") if isinstance(v, dict) else None
        prev = g["evidencias"].get(c) or {}
        soma = prev.get("count", 0) + (cnt or 0)
        g["evidencias"][c] = {"count": soma} if soma else {}
    # contagens por campo nomeado (ex.: tentativas) somam
    for campo in ("tentativas",):
        if it.get(campo) is not None:
            g[campo] = g.get(campo, 0) + it[campo]


# ------------------------------------------------------------------- pontuação

def pontuar(item: dict, lente: dict, canon: dict, model: dict, objs: dict,
            asof: datetime.date) -> dict:
    post = posterior(item, lente, model)
    score = score_de_logit(post["logit"], post["prior"], model["score_ancoras"])
    guardas = guarda_existencial(item, canon, model)
    banda = "EXISTENCIAL" if guardas else banda_de_score(score, model)
    contribui = lente.get("contribui_para") or {}
    impacto = sum(objs.get(o, 0.0) * c for o, c in contribui.items())
    urg, urg_motivo = urgencia(item, banda, model, asof, lente)
    esf = esforco(item, model)
    ev = post["posterior"] * impacto * urg / esf
    quad, quad_origem = quadrante(score, urg, banda, model, item.get("eisenhower"))
    return {
        "id": item.get("id", "?"), "tipo": item.get("tipo"), "area": item.get("area"),
        "posterior": round(post["posterior"], 4), "score": round(score, 1),
        "banda": banda, "guardas": guardas, "impacto": round(impacto, 3),
        "urgencia": round(urg, 3), "urgencia_motivo": urg_motivo, "esforco": esf,
        "ev": ev if not guardas else float("inf"), "ev_num": round(ev, 4),
        "prior": post["prior"], "logit": round(post["logit"], 3),
        "contribs": post["contribs"], "objetivos_ativos": objs,
        "quadrante": quad, "quadrante_origem": quad_origem,
        # contexto que o cofre precisa para renderizar a matriz sem reparsear tasks/
        "aberto": item.get("aberto", True), "em_progresso": bool(item.get("em_progresso")),
        "pessoa": item.get("pessoa"),
        "sem_data": bool(item.get("sem_data")), "idade_dias": item.get("idade_dias"),
        "prazo": item.get("prazo"), "origem_data": item.get("origem_data"),
        "origem_prazo": item.get("origem_prazo"),
        "arquivo": item.get("_arquivo"), "body": item.get("_body"),
    }


def sort_key(r: dict):
    # Empate de EV é comum e legítimo (itens com as mesmas evidências e a mesma idade):
    # o mais antigo vem primeiro, e o id fecha o determinismo.
    return (-BANDA_RANK.get(r["banda"], 0),
            -(1e18 if r["ev"] == float("inf") else r["ev"]),
            -(r.get("idade_dias") or 0), str(r["id"]))


# -------------------------------------------------------- carregamento de itens

def carregar_itens(corpus: str, in_file: str | None, root: Path,
                   asof: datetime.date | None = None,
                   model: dict | None = None, tdir: Path | None = None) -> list[dict]:
    if in_file:
        p = Path(in_file)
        if not p.exists():
            die_uso(f"--in não encontrado: {p}")
        if p.suffix == ".jsonl":
            itens = [json.loads(l) for l in p.read_text(encoding="utf-8").splitlines() if l.strip()]
        else:
            data = load_yaml(p)
            itens = data.get("itens", data) if isinstance(data, dict) else data
        for it in itens:
            it.setdefault("lente", corpus if corpus != "all" else it.get("lente", "backlog"))
        return itens
    tdir = tdir or (root / "tasks")
    if corpus in ("backlog", "all"):
        return parse_tasks(root, asof, model, tdir) + parse_humanas(tdir, asof, model)
    if corpus == "human":
        return parse_humanas(tdir, asof, model)
    return []


def _linhas_uteis(texto: str):
    """Itera (nº da linha, conteúdo) neutralizando o interior de blocos de código.

    Os arquivos de tasks/ documentam o próprio formato com exemplos em fence — `- [ ] Tarefa
    📅 …`. Sem isto o motor adota o exemplo como tarefa: medido em HELPDESK-CHAT, 3 itens
    fantasma (um por arquivo), fazendo a matriz somar 24 contra as 21 do painel, que já
    neutralizava fences. Duas contagens diferentes para o mesmo acervo destroem a confiança
    nas duas.
    """
    dentro = False
    for n, ln in enumerate(texto.splitlines(), 1):
        if ln.lstrip().startswith(("```", "~~~")):
            dentro = not dentro
            yield n, ""
            continue
        yield n, ("" if dentro else ln)


FRASES_TEMPLATE = (
    "descreva", "exemplo —", "exemplo -", "nome da feature", "nome da frente",
    "ação proposta em uma frase", "acao proposta em uma frase",
    "ação que precisa de decisão", "acao que precisa de decisao",
    "primeira tarefa do negócio", "primeira tarefa do negocio",
)
ENCAPSULADO_RE = re.compile(r"^[\[<]([^\]>]{3,})[\]>]")


def _placeholder(body: str) -> bool:
    """Linha de exemplo do template, não trabalho real.

    Detecção por TEXTO CONHECIDO, não por forma. "Título começa com `[`" era um falso
    positivo destrutivo: este acervo usa tag entre colchetes em títulos reais —
    `- [ ] [TENANT-008] …`, `- [ ] [SQ-API] …`, `- [ ] [RH] …`. Medido: **109 tarefas na
    plataforma-cursos e 12 no DATA-DOSSIE** eram descartadas em silêncio, o pior modo de
    falha possível numa fila de trabalho.

    Código inline sai antes do teste de `{{`: há bug registrado no acervo cujo título
    CITA `` `{{DATA}}` `` — sem isso o motor descartaria o próprio bug que descreve o
    problema dos placeholders.
    """
    b = body.strip()
    if not b:
        return True
    if re.search(r"#area/x\b", b):
        return True  # `#area/x` é a área-exemplo do template, não uma área real
    sem_codigo = re.sub(r"`[^`]*`", "", b)
    if "{{" in sem_codigo or "}}" in sem_codigo:
        return True
    m = ENCAPSULADO_RE.match(b)
    return bool(m and any(f in m.group(1).strip().lower() for f in FRASES_TEMPLATE))


def _blame_datas(root: Path, md: Path) -> dict[int, datetime.date]:
    """author-time de cada linha do arquivo, 1-indexed. `{}` quando não dá.

    UMA passada de `git blame` por arquivo (não por linha) — o custo é linear no
    arquivo. É o que dá idade às tarefas sem `📅`, que são a maioria do acervo.
    Nunca levanta: projeto fora do git, git ausente ou arquivo novo → `{}` e a
    cascata cai no mtime.
    """
    import subprocess
    try:
        r = subprocess.run(["git", "-C", str(root), "blame", "--line-porcelain",
                            "--", str(md)],
                           capture_output=True, text=True, timeout=30)
    except (OSError, subprocess.SubprocessError):
        return {}
    if r.returncode != 0:
        return {}
    datas, n = {}, 0
    for ln in r.stdout.splitlines():
        if ln.startswith("author-time "):
            n += 1
            try:
                datas[n] = datetime.date.fromtimestamp(int(ln.split()[1]))
            except (ValueError, IndexError, OSError):
                pass
    return datas


def _slugs_concluidos(tdir: Path) -> set[str]:
    """Identidades já fechadas em concluidas.md — base da evidência `reincidente`."""
    p = tdir / "concluidas.md"
    if not p.exists():
        return set()
    out = set()
    for _n, ln in _linhas_uteis(p.read_text(encoding="utf-8")):
        m = TASK_LINE_RE.match(ln)
        if m:
            out.add(_id_from_body(MARKER_RE.sub("", m.group("body")).strip(), "concluidas"))
    out.discard("")
    return out


# O separador aceita — (EM DASH, U+2014): os projetos escrevem `## H-0NN — Título`, e a classe
# não o tinha. Pedido nesse formato era descartado — 23 dos 66 do DATA-DOSSIE estavam invisíveis,
# e não caíam nem no fallback HUMAN_HEAD_RE (que exige #{3,4}, e os headings de pedido são ##):
# desapareciam de PRIORIDADE.md, do _estado.json do cofre e da ponte Telegram. O dono os via;
# nenhuma automação via.
# Ordem da classe: – é EN DASH (U+2013), — é EM DASH (U+2014), ― é HORIZONTAL BAR (U+2015). São
# três caracteres distintos e parecidos; manter os três, não "limpar duplicata".
#
# ⚠️ ESTA CORREÇÃO NASCEU NUM PROJETO E FOI APAGADA DUAS VEZES POR CÓPIA DESTE MOLDE. No
# DATA-DOSSIE, c20a156 (2026-08-27) corrigiu (fantasmas 15 → 0) e c00531c (2026-08-31) reverteu
# ao copiar este arquivo daqui. Portada ao molde em 2026-09-29 para a próxima cópia levá-la em vez
# de apagá-la. Travada em `tests/test_prioridade.py` (`test_heading_h_aceita_todos_os_tracos`).
HUMAN_ID_RE = re.compile(r"^(?P<nivel>#{2,4})\s+(?P<id>H-\d+)\s*[·:•\-–—―]\s*(?P<titulo>.+?)\s*$")
HUMAN_HEAD_RE = re.compile(r"^(?P<nivel>#{3,4})\s+(?P<titulo>.+?)\s*$")
ESTADO_RE = re.compile(r"\*\*Estado:\*\*\s*(?P<estado>.*)$")
APROVAR_RE = re.compile(r"\[APROVAR\]")
DECIDIDO_RE = re.compile(r"✅\s*aprovad|❌\s*rejeitad|^\s*→\s*\S", re.MULTILINE)
# `**Solução:**` — o dono escreve NO PRÓPRIO bloco como resolver, e isso destrava o item.
# Existe porque responder obrigava a ir para outro arquivo (o `INBOX.md` do cofre): `→ opção B`
# diz o veredito, não o COMO. Aliases porque o template do boilerplate já distribuiu
# `- **Decisão:**` a 12 repositórios — exigir um rótulo novo deixaria essa base sem efeito.
# Casa nos dois dialetos: linha de bloco (`heading`) e sub-bullet (`aprovar`).
SOLUCAO_RE = re.compile(
    r"^\s*(?:[-*+]\s*)?\*\*(?:Solução|Solucao|Decisão|Decisao|Resposta):?\*\*:?\s*(?P<txt>.*)$",
    re.MULTILINE)
# `_(pendente)_` é o valor que o TEMPLATE traz preenchido. Sem esta guarda, todo item dos 20
# `human.md` que ainda tem o rótulo do template viria como respondido no primeiro sync — a
# fila humana inteira esvaziaria de uma vez, em silêncio. Medido no acervo: 48 das 54
# ocorrências são exatamente o placeholder.
#
# Casa por PREFIXO, não pela linha inteira: uma das ocorrências reais é
# `_(pendente — recomendação: → A)_`, que continua sendo ausência de resposta e escaparia de
# um padrão ancorado no fim.
SOLUCAO_VAZIA_RE = re.compile(
    r"^_?\(?\s*(?:pendente|pending|aguardando|a\s+definir|a\s+decidir|tbd|todo|n/?a|"
    r"nenhuma?|—+|-+|\?+)\b", re.IGNORECASE)
SECAO_DECIDIDA_RE = re.compile(r"decidid|resolvid|conclu", re.IGNORECASE)
ESTADO_DECIDIDO_RE = re.compile(r"✅|❌|🚀|aprovad|rejeitad|cancelad|executad", re.IGNORECASE)
# Heading SEM `H-\d+` só é item se o corpo trouxer algum sinal de item — estado, resposta
# do dono ou metadado de tarefa. Prosa estruturada dentro de uma fila (`### O que fica parado
# enquanto não há resposta`) casa em HUMAN_HEAD_RE e virava pedido fantasma, competindo por Q1
# com trabalho real. O dialeto heading legítimo sempre traz pelo menos o
# `**Solução:** _(pendente)_` que o template do boilerplate distribui.
#
# Mesma origem e mesmo histórico do separador de HUMAN_ID_RE (DATA-DOSSIE, apagada por cópia
# deste molde; portada em 2026-09-29). Só vale para o dialeto HEADING — o checkbox (`- [ ] …`
# em nível zero) não passa por `_fechar_human` e continua entrando sem id.
ITEM_SINAL_RE = re.compile(
    r"\*\*(?:Estado|Solução|Solucao|Decisão|Decisao|Resposta):?\*\*"
    r"|📅|🎯|🔺|🔼|🔽|#area/|#esforco/")
RISCO_ATIVO_RE = re.compile(r"🚨|risco ativo", re.IGNORECASE)
IRREVERSIVEL_RE = re.compile(r"irrevers|Tipo 1|rotacionar|apagar|excluir|deletar", re.IGNORECASE)


def sem_campo_resposta(tdir: Path) -> list[str]:
    """Pedidos das filas humanas SEM a linha `**Solução:**` — o dono não tem onde responder.

    Falha silenciosa medida no DATA-DOSSIE em 2026-08-27: 9 dos 54 itens de `human.md` não
    tinham o campo. O pedido era lido, a pessoa não tinha onde escrever, e nada acusava. Aqui só
    se verifica, porque regra que ninguém mede é regra que envelhece.

    Nasceu lá e foi apagada por cópia deste molde (c00531c, 2026-08-31); portada em 2026-09-29.
    """
    faltando: list[str] = []
    for arquivo in filas_humanas(tdir):
        p = tdir / arquivo
        if not p.exists():
            continue
        linhas = p.read_text(encoding="utf-8").split("\n")
        cabecas = [n for n, l in enumerate(linhas) if HUMAN_ID_RE.match(l)]
        for k, n in enumerate(cabecas):
            fim = cabecas[k + 1] if k + 1 < len(cabecas) else len(linhas)
            if not SOLUCAO_RE.search("\n".join(linhas[n:fim])):
                faltando.append(f"{arquivo}:{HUMAN_ID_RE.match(linhas[n]).group('id')}")
    return faltando


def fora_da_fila(tdir: Path) -> list[tuple[str, int]]:
    """Arquivos em tasks/ com linhas de tarefa que a fila NÃO lê.

    A allowlist protege a fila de relatório ad-hoc, mas silêncio aqui reproduziria o modo de
    falha que o tasks/README.md alerta ("some da contagem sem erro"). Então o que ficou fora é
    reportado, com a contagem, para quem olha decidir se aquilo é fila ou documento.
    """
    conhecidos = (set(TASKS_FILA) | set(TASKS_SEM_MARCADOR_EXTRA) | set(filas_humanas(tdir))
                  | ignorados(tdir)
                  | {"README.md", "PRIORIDADE.md", "ALLOWLIST.md", "concluidas.md"})
    out = []
    if not tdir.is_dir():
        return out
    for md in sorted(tdir.glob("*.md")):
        if md.name in conhecidos:
            continue
        n = sum(1 for _n, ln in _linhas_uteis(md.read_text(encoding="utf-8", errors="replace"))
                if (m := TASK_LINE_RE.match(ln)) and m.group("state") in (" ", "/")
                and not _placeholder(MARKER_RE.sub("", m.group("body")).strip()))
        if n:
            out.append((md.name, n))
    return out


def human_decidido(estado: str, corpo: str, secao: str) -> bool:
    """Um item da fila humana já foi decidido? (estado, corpo ou seção dizem que sim)

    Pública porque `scripts/migrar-solucao.py` precisa da MESMA resposta para não semear
    `**Solução:**` em item já resolvido — duas cópias desta regra divergiriam, e a primeira
    consequência seria o migrador reabrir decisão fechada.
    """
    return bool(ESTADO_DECIDIDO_RE.search(estado or "")
                or DECIDIDO_RE.search(corpo or "")
                or SECAO_DECIDIDA_RE.search(secao or ""))


def solucao_do_corpo(linhas) -> str | None:
    """O texto de `**Solução:**` (ou alias) num bloco da fila humana, se houver um de verdade.

    Aceita o texto na mesma linha do rótulo ou na linha seguinte — `**Solução:**` sozinha e a
    resposta embaixo é prosa normal em Markdown, e recusar essa forma faria a resposta do dono
    ser ignorada sem aviso, que é o modo de falha mais caro deste arquivo.
    """
    linhas = list(linhas)
    for i, ln in enumerate(linhas):
        m = SOLUCAO_RE.match(ln or "")
        if not m:
            continue
        txt = m.group("txt").strip()
        if not txt:
            prox = next((x.strip() for x in linhas[i + 1:] if x.strip()), "")
            # Outro rótulo, heading ou item logo abaixo significa rótulo sem resposta.
            if prox and not re.match(r"^(\*\*|#|[-*+]\s*\[|>)", prox):
                txt = prox
        txt = txt.strip("*_` .").strip()
        if txt and not SOLUCAO_VAZIA_RE.match(txt):
            return txt
    return None


def parse_humanas(tdir: Path, asof: datetime.date | None = None,
                  model: dict | None = None) -> list[dict]:
    """Todas as filas humanas do diretório, cada item anotado com a pessoa."""
    out = []
    for arquivo, pessoa in filas_humanas(tdir).items():
        for item in parse_human(tdir / arquivo, asof, model):
            item["pessoa"] = pessoa
            out.append(item)
    return out


def parse_human(p: Path, asof: datetime.date | None = None,
                model: dict | None = None) -> list[dict]:
    """Extrai uma fila humana — o que só uma pessoa pode fazer ou decidir.

    É a fila mais importante do sistema: cada item aqui trava trabalho do agente,
    então entra na priorização com prior próprio (lente `human`). Nunca recebe
    marcador `[prio:]` — a pessoa responde na própria linha do item.

    Três dialetos são aceitos, porque o acervo tem dois legados em uso:
      canônico  `### H-001 · título` + `**Estado:** ⏳ pendente · 📅 … · 🔺 …`
      heading   `### H-001 · título` com a decisão escrita no corpo (`→ opção B`)
      checkbox  `- [ ] [APROVAR] título 📅 … 🔺 …` (estado no próprio checkbox)
    """
    if not p.exists():
        return []
    model = model or {}
    meia_vida = float((model.get("decaimento") or {}).get("meia_vida_dias", 90))
    linhas = [v for _n, v in _linhas_uteis(p.read_text(encoding="utf-8"))]
    # A raiz do git é o repo, não o diretório de tarefas — `tasks/` e `tasks-cursos/` são
    # ambos filhos dela.
    blame = _blame_datas(p.parent.parent, p)
    try:
        mtime = datetime.date.fromtimestamp(p.stat().st_mtime)
    except OSError:
        mtime = None

    itens: list[dict] = []

    def registrar(hid, titulo, corpo, nlinha, aberto, secao, estado_txt="",
                  respondido=False, solucao=None):
        texto = f"{secao}\n{titulo}\n{estado_txt}\n" + "\n".join(corpo)
        if _placeholder(titulo) or "{{" in texto:        # item de exemplo do template
            return
        area = (re.search(r"#area/(\S+)", texto) or [None, None])[1]
        dm = DATE_RE.search(texto)
        pm = PRAZO_RE.search(texto)
        em = ESFORCO_RE.search(texto)
        qm = EIS_RE.search(texto)
        registrada, origem = (dm.group(1), "📅") if dm else (None, None)
        if registrada is None:
            d = blame.get(nlinha) or mtime
            if d:
                registrada, origem = d.isoformat(), "git blame" if blame.get(nlinha) else "mtime"
        nasc = parse_date(registrada)
        idade = max(0, (asof - nasc).days) if (asof and nasc) else None
        prazo = parse_date(pm.group(1)) if pm else None

        # Respondido não está esperando ninguém — está esperando o AGENTE. Troca a evidência
        # em vez de somar: "aguardando decisão" e "o dono já respondeu" são estados
        # excludentes, e somar as duas contaria a mesma coisa duas vezes no posterior.
        ev = ([] if not aberto else
              ["respondido_executar"] if respondido else ["aguardando_decisao"])
        if "🔺" in texto:
            ev.append("severidade_p1")
        elif "🔼" in texto:
            ev.append("severidade_p2")
        if area == "seguranca":
            ev.append("area_sensivel")
        if RISCO_ATIVO_RE.search(secao) or RISCO_ATIVO_RE.search(titulo):
            ev.append("risco_ativo")
        if IRREVERSIVEL_RE.search(texto):
            ev.append("irreversivel")
        if idade is not None and idade > meia_vida:
            ev.append("stale")
        if prazo and asof and prazo < asof:
            ev.append("prazo_vencido")

        itens.append({
            "id": hid or _id_from_body(titulo, "human") or titulo[:40],
            "tipo": "decisao", "area": area, "lente": "human",
            "aberto": aberto, "atencao_em": None, "em_progresso": False,
            # O dono escreveu como resolver: destravado, é trabalho do agente (não do dono).
            # O painel usa isto para separar "aguardando você" de "o agente executa".
            "respondido": bool(respondido), "solucao": solucao,
            "evidencias": ev, "esforco": em.group(1) if em else "m",
            "primeira_vez_em": registrada, "origem_data": origem,
            "idade_dias": idade, "sem_data": registrada is None,
            "prazo": prazo.isoformat() if prazo else None,
            "eisenhower": qm.group(1).upper() if qm else None,
            "_arquivo": p.name, "_data": registrada, "_body": titulo,
        })

    secao = ""
    bloco = None  # {hid, titulo, nlinha, corpo[], estado}
    # No dialeto checkbox/aprovar a `**Solução:**` vive num SUB-BULLET, abaixo da linha do
    # item. Registrar o checkbox no instante em que ele aparece (como era) descarta o corpo e
    # tornaria a resposta do dono invisível justamente no dialeto que o boilerplate distribui.
    # Por isso o item fica pendurado aqui até a linha que o encerra.
    pend = None  # {titulo, nlinha, aberto, secao, corpo[]}

    def fechar_pend():
        nonlocal pend
        if pend is None:
            return
        p, pend = pend, None
        solucao = solucao_do_corpo(p["corpo"]) if p["aberto"] else None
        # `corpo=[]` no registrar: as evidências deste dialeto sempre saíram só do título, e
        # passar o corpo agora mudaria o score de item que ninguém tocou.
        registrar(None, p["titulo"], [], p["nlinha"], p["aberto"], p["secao"],
                  respondido=bool(solucao), solucao=solucao)

    for n, ln in enumerate(linhas, 1):
        # Dialeto checkbox: item completo numa linha.
        #
        # O `[APROVAR]` é OPCIONAL. Num arquivo que já é a fila de uma pessoa, todo `- [ ]` em
        # nível zero é item dela — é assim que a plataforma-cursos escreve `johnny.md` e
        # `leonardo.md` (41 itens, nenhum com `[APROVAR]`). Exigir o marcador faria as duas
        # filas serem lidas como vazias.
        #
        # Só vale FORA de um bloco `###`: dentro dele o checkbox é sub-item do pedido, não um
        # pedido novo.
        mc = TASK_LINE_RE.match(ln)
        if mc and bloco is None and not ln.startswith((" ", "\t")):
            fechar_pend()
            body = APROVAR_RE.sub("", MARKER_RE.sub("", mc.group("body"))).strip()
            pend = {"titulo": body, "nlinha": n, "aberto": mc.group("state") in (" ", "/"),
                    "secao": secao, "corpo": []}
            continue
        if mc and APROVAR_RE.search(mc.group("body")):
            # `[APROVAR]` DENTRO de um bloco `###`: as linhas seguintes são corpo do bloco,
            # não deste item, então não há corpo para pendurar — registra na hora, como sempre.
            body = APROVAR_RE.sub("", MARKER_RE.sub("", mc.group("body"))).strip()
            registrar(None, body, [], n, mc.group("state") in (" ", "/"), secao)
            continue
        mid = HUMAN_ID_RE.match(ln)
        mh = mid or HUMAN_HEAD_RE.match(ln)
        if ln.startswith("## ") and not mid:
            fechar_pend()
            if bloco:
                _fechar_human(bloco, secao, registrar)
                bloco = None
            secao = ln[3:].strip()
            continue
        # Sub-heading do item aberto é CORPO dele, não pedido novo. Sem esta guarda, um
        # `## H-048` com sete `###` de estrutura interna ("O que o dado mostra", "As quatro
        # decisões") produzia oito itens: o real desaparecia e sete fantasmas o substituíam na
        # fila. Medido em DATA-DOSSIE: 13 dos 58 itens das filas humanas eram isso. Heading com
        # `H-\d+` sempre abre item, em qualquer nível — o id é declaração explícita.
        if mh and bloco is not None and not mid and len(mh.group("nivel")) > bloco["nivel"]:
            bloco["corpo"].append(ln)
            continue
        if mh:
            fechar_pend()
            if bloco:
                _fechar_human(bloco, secao, registrar)
            bloco = {"hid": mid.group("id") if mid else None, "nivel": len(mh.group("nivel")),
                     "titulo": mh.group("titulo"), "nlinha": n, "corpo": [], "estado": None}
            continue
        if bloco is not None:
            me = ESTADO_RE.search(ln)
            if me:
                bloco["estado"] = me.group("estado").strip()
            bloco["corpo"].append(ln)
        elif pend is not None:
            pend["corpo"].append(ln)
    fechar_pend()
    if bloco:
        _fechar_human(bloco, secao, registrar)
    return itens


def _fechar_human(bloco: dict, secao: str, registrar) -> None:
    """Pendente, a menos que o estado, o corpo ou a seção digam que foi decidido.

    Três estados possíveis, e o decidido tem PRECEDÊNCIA sobre a solução de propósito: o
    acervo tem itens já `✅ aprovado` cuja linha `**Decisão:**` conta o que foi feito, e
    deixar a solução vencer os traria todos de volta à fila como trabalho a fazer. Quem fecha
    um item respondido é o agente, escrevendo `🚀 executado` — não o dono aprovando.
    """
    estado = bloco.get("estado") or ""
    corpo = "\n".join(bloco["corpo"])
    # Heading sem id e sem sinal de item é prosa da fila, não pedido — ver ITEM_SINAL_RE.
    if not bloco.get("hid") and not ITEM_SINAL_RE.search(f"{estado}\n{corpo}"):
        return
    decidido = human_decidido(estado, corpo, secao)
    # A linha `**Estado:**` entra na busca: no dialeto heading o dono às vezes escreve estado
    # e resposta juntos, e ela não faz parte de `corpo` (o parser a consome antes).
    solucao = None if decidido else solucao_do_corpo([estado] + bloco["corpo"])
    registrar(bloco["hid"], bloco["titulo"], bloco["corpo"], bloco["nlinha"],
              not decidido, secao, estado, respondido=bool(solucao), solucao=solucao)


def parse_tasks(root: Path, asof: datetime.date | None = None,
                model: dict | None = None, tdir: Path | None = None) -> list[dict]:
    """Extrai itens das linhas de tasks/*.md (formato Obsidian Tasks).

    O metadado das tarefas é inline (não há frontmatter no acervo): `📅` data de
    registro, `🎯` prazo, `🔺/🔼/🔽` severidade, `#area/`, `#esforco/`, `#eis/`, `🤖`.
    Convenção documentada em tasks/README.md.
    """
    itens = []
    tdir = tdir or (root / "tasks")
    if not tdir.is_dir():
        return itens
    model = model or {}
    meia_vida = float((model.get("decaimento") or {}).get("meia_vida_dias", 90))
    concluidos = _slugs_concluidos(tdir)
    for nome in TASKS_FILA:
        md = tdir / nome
        if not md.exists():
            continue
        blame = None  # lazy: só paga o git blame se o arquivo tiver tarefa sem 📅
        try:
            mtime = datetime.date.fromtimestamp(md.stat().st_mtime)
        except OSError:
            mtime = None
        # Prazo por NÍVEL de heading, não um valor só: `backlog.md` agrupa por `##` e
        # subdivide em `###`, e zerar o prazo em qualquer heading fazia a subseção apagar o
        # prazo da seção-mãe — medido em DATA-DOSSIE, onde `## Acesso / Segurança` datado
        # perdeu os 4 itens porque o primeiro `###` limpou a herança. Nível mais profundo
        # vence; irmão de mesmo nível não herda do anterior.
        prazos_nivel: dict[int, str] = {}
        nivel_atual = 1
        for nlinha, ln in _linhas_uteis(md.read_text(encoding="utf-8")):
            mh = BLOCO_RE.match(ln)
            if mh:
                nivel_atual = len(mh.group(1))
                for n in [k for k in prazos_nivel if k >= nivel_atual]:
                    del prazos_nivel[n]
                # Um `🎯` no próprio heading também conta: prazo que não casa não dá erro,
                # desaparece da contagem — e este formato já custou itens fantasma o
                # suficiente para valer a tolerância. O lugar recomendado segue sendo a linha
                # `**Prazo:**`, que não muda a âncora do wikilink quando a data é replanejada.
                pb = PRAZO_RE.search(ln)
                if pb:
                    prazos_nivel[nivel_atual] = pb.group(1)
                continue
            pb = PRAZO_BLOCO_RE.match(ln)
            if pb:
                prazos_nivel[nivel_atual] = pb.group(1)
                continue
            prazo_bloco = prazos_nivel[max(prazos_nivel)] if prazos_nivel else None
            m = TASK_LINE_RE.match(ln)
            if not m:
                continue
            state = m.group("state")
            if state not in (" ", "/"):
                continue  # `[x]`/`[-]`: fechado não é fila (o README manda mover para
                          # concluidas.md, mas na prática sobra `[x]` nos arquivos de trabalho)
            body = MARKER_RE.sub("", m.group("body")).strip()
            if _placeholder(body):
                continue
            area = (re.search(r"#area/(\S+)", body) or [None, None])[1]
            dm = DATE_RE.search(body)
            pm = PRAZO_RE.search(body)
            em = ESFORCO_RE.search(body)
            qm = EIS_RE.search(body)
            esf_tag = em.group(1) if em else None

            # ── idade: 📅 → git blame da linha → mtime do arquivo → sem data
            registrada = dm.group(1) if dm else None
            origem_data = "📅" if registrada else None
            if registrada is None:
                if blame is None:
                    blame = _blame_datas(root, md)
                d = blame.get(nlinha)
                if d:
                    registrada, origem_data = d.isoformat(), "git blame"
                elif mtime:
                    registrada, origem_data = mtime.isoformat(), "mtime"
            nasc = parse_date(registrada)
            idade = max(0, (asof - nasc).days) if (asof and nasc) else None

            ev = []
            if "🔺" in body:
                ev.append("severidade_p1")
            elif "🔼" in body:
                ev.append("severidade_p2")
            elif "🔽" in body:
                ev.append("severidade_p3")
            if area == "seguranca":
                ev.append("area_sensivel")
            if md.stem == "bugs":
                ev.append("tipo_bug")
            if esf_tag == "p":
                ev.append("quick_win")
            prazo = parse_date(pm.group(1)) if pm else parse_date(prazo_bloco)
            origem_prazo = "🎯" if pm else ("bloco" if prazo_bloco else None)
            if prazo and asof and prazo < asof:
                ev.append("prazo_vencido")
            if idade is not None and idade > meia_vida:
                ev.append("stale")
            slug = _id_from_body(body, md.stem)
            if slug in concluidos:
                ev.append("reincidente")

            itens.append({
                "id": slug or body[:40],
                "tipo": "bug" if md.stem == "bugs" else "task",
                "area": area, "lente": "backlog",
                "aberto": state in (" ", "/"), "atencao_em": "x" if state == "/" else None,
                "em_progresso": state == "/",
                "evidencias": ev, "esforco": esf_tag or "m",
                "primeira_vez_em": registrada, "origem_data": origem_data,
                "idade_dias": idade, "sem_data": registrada is None,
                "prazo": prazo.isoformat() if prazo else None,
                "origem_prazo": origem_prazo,
                "eisenhower": qm.group(1).upper() if qm else None,
                "_arquivo": md.name, "_data": registrada, "_body": body,
            })
    return itens


# ----------------------------------------------------------------------- render

def _json_safe(r: dict) -> dict:
    """`ev` infinito (guarda existencial) não é representável em JSON estrito."""
    out = dict(r)
    if out.get("ev") == float("inf"):
        out["ev"] = None
        out["ev_infinito"] = True
    return out


def render_prioridade_md(resultados: list[dict], asof: datetime.date) -> str:
    out = ["# Fila priorizada — gerado por scripts/prioridade.py",
           f"> asof {asof.isoformat()} · ordenado por banda + valor esperado (EV). NÃO editar à mão.\n"]
    for i, r in enumerate(resultados, 1):
        marca = "🔴 EXISTENCIAL" if r["banda"] == "EXISTENCIAL" else r["banda"]
        evs = ", ".join(f"{c['evidencia']}({c['ln_lr']:+})" for c in r["contribs"]) or "—"
        ev = "∞" if r["ev"] == float("inf") else r["ev_num"]
        out.append(f"{i}. **[{marca}] {r.get('quadrante', '—')} · score {r['score']}** · "
                   f"EV {ev} · `{r['id']}`"
                   + (f" `#area/{r['area']}`" if r.get("area") else ""))
        out.append(f"   - posterior {r['posterior']} · impacto {r['impacto']} · "
                   f"urgência {r['urgencia']} ({r['urgencia_motivo']}) · esforço {r['esforco']}")
        out.append(f"   - evidências: {evs}")
    return "\n".join(out) + "\n"


def aplicar_marcadores(root: Path, resultados: list[dict], tdir: Path | None = None) -> int:
    by_id = {r["id"]: r for r in resultados}
    tocados = 0
    for nome in TASKS_FILA:
        md = (tdir or (root / "tasks")) / nome
        if not md.exists():
            continue
        linhas, mudou = [], False
        cru = md.read_text(encoding="utf-8").splitlines()
        uteis = {n: v for n, v in _linhas_uteis("\n".join(cru))}
        for nlinha, ln in enumerate(cru, 1):
            m = TASK_LINE_RE.match(ln) if uteis.get(nlinha) else None
            if m:
                body = MARKER_RE.sub("", m.group("body")).rstrip()
                rid = _id_from_body(body, md.stem)
                r = by_id.get(rid)
                if r:
                    ln = f"{m.group(1)}{body} [prio: {r['score']} calc:prioridade]"
                    mudou = True
                    tocados += 1
            linhas.append(ln)
        if mudou:
            md.write_text("\n".join(linhas) + "\n", encoding="utf-8")
    return tocados


TAG_RE = re.compile(r"#(?:area|esforco|eis|modelo)/\S+")
META_EMOJI_RE = re.compile(r"[📅🎯🔺🔼🔽🤖✅❌⏳🚨]")


def _id_from_body(body: str, stem: str) -> str:
    """Identidade do item: só o TEXTO da tarefa, sem nenhum metadado.

    Toda tag e todo marcador saem antes do slug — senão marcar `#esforco/g`, trocar
    `#area/`, fixar `#eis/q2` ou registrar um prazo mudaria a identidade do item, e o
    motor trataria a mesma tarefa como nova a cada rodada (o marcador `[prio:]` antigo
    ficaria órfão e acumularia).
    """
    t = MARKER_RE.sub("", body)
    t = TAG_RE.sub("", t)
    t = re.sub(r"\d{4}-\d{2}-\d{2}", "", t)
    t = META_EMOJI_RE.sub("", t)
    t = re.sub(r"\s(alta|média|media|baixa)\b", "", t, flags=re.IGNORECASE)
    t = re.sub(r"[\[\]#/]", "", t)
    return re.sub(r"\s+", "-", t.strip()).strip("-")[:60].lower() or body[:40]


# -------------------------------------------------------------------- conta visível

def conta_visivel(r: dict) -> str:
    L = [f"item: {r['id']}  (lente/tipo={r['tipo']}, banda={r['banda']})",
         f"  prior            P={r['prior']:.4f}   logit={logit(r['prior']):+.2f}"]
    for c in r["contribs"]:
        cnt = f" (count={c['count']})" if c["count"] else ""
        L.append(f"  + {c['evidencia']}{cnt:<14} ln(LR)·escala = {c['ln_lr']:+.3f}")
    L.append("  " + "─" * 45)
    ev = "∞ (EXISTENCIAL domina)" if r["ev"] == float("inf") else r["ev_num"]
    L.append(f"  Σ logit = {r['logit']:+.3f}   posterior P={r['posterior']:.4f}   score={r['score']}   banda={r['banda']}")
    if r["guardas"]:
        L.append(f"  ⚠ guarda existencial: {', '.join(r['guardas'])}")
    L.append(f"  impacto(objetivos ativos)={r['impacto']}  urgência={r['urgencia']} ({r['urgencia_motivo']})  esforço={r['esforco']}")
    L.append(f"  EV = {ev}")
    return "\n".join(L)


# ----------------------------------------------------------------------- main

def priorizar(corpus, in_file=None, asof=None, root=None, top=None, canon=None, model=None,
              itens=None, tdir=None):
    root = root or repo_root()
    model = model if model is not None else load_yaml(model_path(root))
    if not model:
        die_dado("prioridade.yaml ausente/vazio")
    canon = canon if canon is not None else load_yaml(root / "gemeo" / "00-CANON" / "canon.yaml")
    objs, n_fontes = objetivos_ativos(canon, model)
    if n_fontes == 0:
        die_dado("sem objetivo de negócio no canon (campos null) → rode /montar-gemeo "
                 "antes de priorizar; sem retorno modelado, não há o que priorizar")
    asof = asof_date(canon, asof)
    itens = itens if itens is not None else carregar_itens(corpus, in_file, root, asof, model, tdir)
    lentes = model.get("lentes") or {}
    resultados = []
    # agrega por lente quando há chave_entidade (SOC)
    por_lente: dict[str, list] = {}
    for it in itens:
        por_lente.setdefault(it.get("lente", corpus), []).append(it)
    for nome, grupo in por_lente.items():
        lente = lentes.get(nome)
        if lente is None:
            die_dado(f"lente '{nome}' não definida em prioridade.yaml")
        for it in agregar_entidades(grupo, lente):
            resultados.append(pontuar(it, lente, canon, model, objs, asof))
    resultados.sort(key=sort_key)
    if top:
        resultados = resultados[:top]
    return resultados, model, asof


def main():
    ap = argparse.ArgumentParser(description="Motor de priorização Bayesiana (gêmeo).")
    ap.add_argument("corpus", choices=["soc", "backlog", "human", "propostas", "all"])
    ap.add_argument("--in", dest="in_file")
    ap.add_argument("--canon")
    ap.add_argument("--model", metavar="FILE",
                    help="prioridade.yaml alternativo. Permite calibrar os pesos num lugar só "
                         "para os 16 projetos, em vez de manter 16 cópias divergentes.")
    ap.add_argument("--asof")
    ap.add_argument("--top", type=int)
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--write", action="store_true")
    ap.add_argument("--tasks", metavar="DIR",
                    help="diretório de tarefas (default: tasks/). Um repo pode ter mais de uma "
                         "fila — a plataforma-cursos tem tasks/ e tasks-cursos/.")
    ap.add_argument("--emit-json", dest="emit_json", metavar="FILE",
                    help="grava a fila completa em JSON no caminho dado (para o gerador do "
                         "cofre). Fora de tasks/ de propósito: tasks/ é espelhado no Obsidian.")
    a = ap.parse_args()

    root = raiz_do_projeto(bool(a.canon))
    canon = load_yaml(Path(a.canon)) if a.canon else None
    model = load_yaml(Path(a.model)) if a.model else None
    if a.model and not model:
        die_dado(f"--model vazio ou ilegível: {a.model}")
    tdir = Path(a.tasks).resolve() if a.tasks else (root / "tasks")
    if not tdir.is_dir():
        die_uso(f"diretório de tarefas não encontrado: {tdir}")
    resultados, _model, asof = priorizar(a.corpus, a.in_file, a.asof, root, a.top,
                                         canon=canon, model=model, tdir=tdir)

    if a.write:
        (tdir / "PRIORIDADE.md").write_text(
            render_prioridade_md(resultados, asof), encoding="utf-8")
        n = aplicar_marcadores(root, resultados, tdir)
        print(f"PRIORIDADE.md gerado · {n} marcadores [prio:] aplicados", file=sys.stderr)

    if (extras := fora_da_fila(tdir)):
        detalhe = ", ".join(f"{nome} ({n})" for nome, n in extras)
        print(f"AVISO: fora da fila (não são {'/'.join(TASKS_FILA)}): {detalhe}", file=sys.stderr)

    if (mudos := sem_campo_resposta(tdir)):
        print(f"AVISO: {len(mudos)} pedido(s) sem `**Solução:** _(pendente)_` — o dono não tem "
              f"onde responder: {', '.join(mudos[:8])}"
              f"{' …' if len(mudos) > 8 else ''}", file=sys.stderr)

    if a.emit_json:
        p = Path(a.emit_json)
        p.parent.mkdir(parents=True, exist_ok=True)
        payload = {"asof": asof.isoformat(), "resultados": [_json_safe(r) for r in resultados]}
        # allow_nan=False: `Infinity` é JSON inválido e o JSON.parse do Node rejeita —
        # melhor falhar aqui do que gerar um arquivo que o gerador do cofre não lê.
        p.write_text(json.dumps(payload, ensure_ascii=False, default=str, allow_nan=False),
                     encoding="utf-8")

    if a.json:
        emit({"asof": asof.isoformat(), "resultados": resultados}, True)
    else:
        print("\n\n".join(conta_visivel(r) for r in resultados) or "(fila vazia)")

    if any(r["banda"] == "EXISTENCIAL" for r in resultados):
        sys.exit(EXIT_ALERTA)


if __name__ == "__main__":
    main()
