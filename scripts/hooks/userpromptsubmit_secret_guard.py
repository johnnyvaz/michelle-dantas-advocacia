#!/usr/bin/env python3
"""Hook UserPromptSubmit: barreira pré-envio contra secrets/credenciais/dados sensíveis.

Roda em TODO prompt do usuário ANTES de o Claude processá-lo. Converte a skill
`/prompt-audit` (advisory, manual) em GATE AUTOMÁTICO: achados de credenciais e de
PII validada (dígito verificador) bloqueiam o prompt; achados de severidade MÉDIA
apenas avisam. Referência: Política Corporativa de IA PH3A v2.0, §6.1–6.3.

Contrato (doc: code.claude.com/docs/en/hooks):
  - BLOQUEIO  → stdout JSON {"decision":"block","reason":...,"systemMessage":...} + exit 0.
                O prompt é apagado e não chega ao modelo; `reason` e `systemMessage`
                são mostrados ao usuário.
  - AVISO     → stdout JSON com `systemMessage` (banner ao usuário) + `additionalContext`
                (contexto ao modelo) + exit 0. O prompt segue normalmente.
  - LIMPO     → exit 0 sem saída.

Escopo (limitação deliberada): este hook só enxerga o TEXTO que o usuário digita.
NÃO vê arquivos lidos depois pelo Claude (Read) nem saída de Bash — para isso existem
os hooks PreToolUse (ver `pretooluse_bash_guard.py`). É a *primeira* barreira, não a única.

Decisão de severidade (diverge DE PROPÓSITO da tabela da skill prompt-audit): o conjunto
de BLOQUEIO é só credenciais (padrão forte `chave=valor`, Bearer/AKIA/gh_/xox/chave
privada/connection string) + CPF/CNPJ/cartão com dígito verificador VÁLIDO + listas
(≥5 e-mails, bloco .env). E-mail/telefone/CEP isolados NÃO bloqueiam — caso contrário
"manda um e-mail pro joão@x.com" apagaria o prompt e o guard seria desligado no primeiro dia.

Fail-open: qualquer erro interno → exit 0 (não trava o uso do Claude Code), mas com um
marcador em stderr — um guard que engole a própria exceção desabilita a proteção em silêncio.
"""
import json
import re
import sys

# ─── Regras de credenciais (padrão forte, baixo falso-positivo) ────────────────
# (id, severidade, descrição, regex)
CRED_RULES = [
    ("private-key", "CRITICO", "Bloco de chave privada (RSA/EC/OpenSSH/PGP)",
     re.compile(r"-----BEGIN (?:RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY-----")),
    ("aws-akia", "CRITICO", "AWS Access Key ID (AKIA…)",
     re.compile(r"\bAKIA[0-9A-Z]{16}\b")),
    ("aws-secret", "CRITICO", "AWS Secret Access Key",
     re.compile(r"(?i)aws_secret_access_key\s*[=:]\s*[\"']?[A-Za-z0-9/+]{20,}")),
    ("gcp-api", "CRITICO", "Google API key (AIza…)",
     re.compile(r"\bAIza[0-9A-Za-z_\-]{35}\b")),
    ("github-token", "CRITICO", "GitHub token (ghp_/gho_/ghs_…)",
     re.compile(r"\bgh[pousr]_[A-Za-z0-9]{36,}\b")),
    ("slack-token", "CRITICO", "Slack token (xox…)",
     re.compile(r"\bxox[baprs]-[A-Za-z0-9-]{10,}\b")),
    ("slack-webhook", "ALTO", "Slack webhook URL",
     re.compile(r"https://hooks\.slack\.com/services/[A-Za-z0-9/]+")),
    ("bearer", "CRITICO", "Bearer token",
     re.compile(r"\bBearer\s+[A-Za-z0-9\-._~+/]{20,}={0,2}")),
    ("conn-string", "CRITICO", "Connection string com credencial (usuário:senha@host)",
     re.compile(r"(?i)\b(?:jdbc:[a-z0-9]+:|mongodb(?:\+srv)?://|postgres(?:ql)?://|"
                r"mysql://|redis://|amqp://|mssql://)[^\s:@/]+:[^\s:@/]+@")),
    ("senha", "CRITICO", "Senha atribuída em texto",
     re.compile(r"(?i)\b(?:password|passwd|pwd|senha)\s*[=:]\s*[\"']?[^\s\"']{4,}")),
    ("api-key", "CRITICO", "API key / chave de acesso atribuída",
     re.compile(r"(?i)\b(?:api[_-]?key|apikey|x-api-key|access[_-]?key)\s*[=:]\s*"
                r"[\"']?[A-Za-z0-9_\-./+]{12,}")),
    ("client-secret", "CRITICO", "Token/secret/credencial nomeado e atribuído",
     re.compile(r"(?i)\b(?:access[_-]?token|auth[_-]?token|refresh[_-]?token|"
                r"secret[_-]?key|client[_-]?secret|api[_-]?secret|private[_-]?token)\s*[=:]\s*"
                r"[\"']?[A-Za-z0-9_\-./+=]{12,}")),
    ("generic-secret", "CRITICO", "Atribuição genérica secret/token/credential",
     re.compile(r"(?i)\b(?:secret|token|credential)\s*[=:]\s*[\"']?[A-Za-z0-9_\-./+=]{16,}")),
]

# ─── Padrões auxiliares ────────────────────────────────────────────────────────
EMAIL = re.compile(r"\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b")
ENV_LINE = re.compile(r"(?m)^[A-Z][A-Z0-9_]{2,}=\S+")
PRIV_IP = re.compile(r"\b(?:10\.\d{1,3}\.\d{1,3}\.\d{1,3}|"
                     r"192\.168\.\d{1,3}\.\d{1,3}|"
                     r"172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})\b")
CPF_CAND = re.compile(r"\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b")
CNPJ_CAND = re.compile(r"\b\d{2}\.?\d{3}\.?\d{3}/?\d{4}-?\d{2}\b")
CARD_CAND = re.compile(r"\b(?:\d[ \-]?){13,19}\b")

SEV_ORDER = {"CRITICO": 3, "ALTO": 2, "MEDIO": 1}


# ─── Validadores de dígito verificador (só dado real bloqueia) ─────────────────
def _digitos(s):
    return re.sub(r"\D", "", s)


def cpf_valido(s):
    cpf = _digitos(s)
    if len(cpf) != 11 or len(set(cpf)) == 1:
        return False

    def dv(n):
        soma = sum(int(cpf[i]) * (n + 1 - i) for i in range(n))
        r = (soma * 10) % 11
        return 0 if r == 10 else r

    return dv(9) == int(cpf[9]) and dv(10) == int(cpf[10])


def cnpj_valido(s):
    cnpj = _digitos(s)
    if len(cnpj) != 14 or len(set(cnpj)) == 1:
        return False
    pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    pesos2 = [6] + pesos1

    def dv(pesos, n):
        soma = sum(int(cnpj[i]) * pesos[i] for i in range(n))
        r = soma % 11
        return 0 if r < 2 else 11 - r

    return dv(pesos1, 12) == int(cnpj[12]) and dv(pesos2, 13) == int(cnpj[13])


def luhn_ok(s):
    num = _digitos(s)
    if len(num) not in (13, 15, 16, 19):  # exclui 11 (CPF) e 14 (CNPJ) para não duplicar
        return False
    total = 0
    for i, ch in enumerate(reversed(num)):
        d = int(ch)
        if i % 2 == 1:
            d *= 2
            if d > 9:
                d -= 9
        total += d
    return total % 10 == 0


# ─── Mascaramento (nunca ecoar o segredo de volta) ─────────────────────────────
def mascarar(trecho):
    s = trecho.strip()
    m = re.match(r"^([^=:]{1,30}?\s*[=:]\s*)\S.*$", s)
    if m:
        return m.group(1) + "***"
    return (s[:4] + "…***") if len(s) > 7 else "***"


# ─── Varredura ─────────────────────────────────────────────────────────────────
def scan(prompt):
    achados = []

    for _id, sev, desc, rx in CRED_RULES:
        m = rx.search(prompt)
        if m:
            achados.append({"id": _id, "sev": sev, "desc": desc, "trecho": mascarar(m.group(0))})

    # PII validada por dígito verificador → CRÍTICO (só dado real dispara)
    if any(cpf_valido(c) for c in CPF_CAND.findall(prompt)):
        achados.append({"id": "cpf", "sev": "CRITICO",
                        "desc": "CPF com dígito verificador válido", "trecho": "***.***.***-**"})
    if any(cnpj_valido(c) for c in CNPJ_CAND.findall(prompt)):
        achados.append({"id": "cnpj", "sev": "CRITICO",
                        "desc": "CNPJ com dígito verificador válido", "trecho": "**.***.***/****-**"})
    if any(luhn_ok(c) for c in CARD_CAND.findall(prompt)):
        achados.append({"id": "cartao", "sev": "CRITICO",
                        "desc": "Número de cartão (passa no Luhn)", "trecho": "**** **** **** ****"})

    # Listas / dumps → ALTO (sinal de exportação, não menção casual)
    emails = set(e.lower() for e in EMAIL.findall(prompt))
    if len(emails) >= 5:
        achados.append({"id": "lista-emails", "sev": "ALTO",
                        "desc": f"Lista de e-mails ({len(emails)} distintos) — possível exportação de contatos",
                        "trecho": f"{len(emails)} e-mails"})
    if len(ENV_LINE.findall(prompt)) >= 3:
        achados.append({"id": "env-dump", "sev": "ALTO",
                        "desc": "Bloco no formato .env (VARIÁVEL=valor)", "trecho": "VAR=***"})

    # Severidade MÉDIA → só aviso
    if PRIV_IP.search(prompt):
        achados.append({"id": "ip-interno", "sev": "MEDIO",
                        "desc": "IP de rede interna (10/172.16-31/192.168)",
                        "trecho": mascarar(PRIV_IP.search(prompt).group(0))})

    return achados


# ─── Relatório de bloqueio (visível ao usuário, via `reason`) ──────────────────
def montar_relatorio(bloqueio, medios):
    linhas = [
        "🔒 PROMPT BLOQUEADO — secret-guard (Política de IA PH3A v2.0 §6.1–6.3)",
        "",
        "Possível credencial ou dado sensível detectado no que você ia enviar à IA.",
        "O prompt foi apagado e NÃO chegou ao modelo. Reformule sem o segredo.",
        "",
        "Achados:",
    ]
    for a in bloqueio:
        linhas.append(f"  • [{a['sev']}] {a['desc']} — trecho: {a['trecho']}")
    for a in medios:
        linhas.append(f"  • [MÉDIO] {a['desc']} — trecho: {a['trecho']}")
    linhas += [
        "",
        "Como corrigir:",
        "  • Remova a credencial real; use placeholder (ex.: API_KEY=<sua-chave>).",
        "  • Para dados pessoais reais, gere versão fictícia com /anonymize-data ou",
        "    /synthetic-data-generator.",
        "  • Em dúvida sobre o que é permitido, rode /prompt-audit no rascunho.",
    ]
    return "\n".join(linhas)


# ─── Saída ─────────────────────────────────────────────────────────────────────
def decidir(achados):
    """Retorna (objeto_json_ou_None, deve_imprimir)."""
    bloqueio = [a for a in achados if a["sev"] in ("CRITICO", "ALTO")]
    medios = [a for a in achados if a["sev"] == "MEDIO"]

    if bloqueio:
        return {
            "decision": "block",
            "reason": montar_relatorio(bloqueio, medios),
            "systemMessage": ("🔒 secret-guard bloqueou o prompt: possível credencial/dado "
                              "sensível. Reformule sem o segredo (veja o detalhe acima)."),
        }
    if medios:
        descs = sorted({a["desc"] for a in medios})
        return {
            "systemMessage": ("⚠️ secret-guard: o prompt contém padrão de severidade MÉDIA ("
                              + ", ".join(descs) + "). Confirme que não é dado real de produção."),
            "hookSpecificOutput": {
                "hookEventName": "UserPromptSubmit",
                "additionalContext": ("secret-guard detectou padrão(ões) de severidade MÉDIA no "
                                      "prompt: " + "; ".join(descs) + ". Se o usuário estiver "
                                      "lidando com dado real de produção, alerte-o (Política de "
                                      "IA PH3A §6.2)."),
            },
        }
    return None


def main():
    argv = sys.argv[1:]
    if argv and argv[0] == "--test":
        sys.exit(run_tests())
    if argv and argv[0] == "--check":
        prompt = argv[1] if len(argv) > 1 else ""
    else:
        try:
            payload = json.load(sys.stdin)
            prompt = payload.get("prompt", "") or ""
        except Exception as e:  # fail-open, mas com rastro (advisor #5)
            print(f"[secret-guard] aviso: falha ao ler payload ({e}); seguindo sem checagem.",
                  file=sys.stderr)
            sys.exit(0)

    try:
        achados = scan(prompt)
        out = decidir(achados)
    except Exception as e:
        print(f"[secret-guard] aviso: erro interno na varredura ({e}); seguindo sem checagem.",
              file=sys.stderr)
        sys.exit(0)

    if out is not None:
        print(json.dumps(out, ensure_ascii=False))
    sys.exit(0)


# ─── Suíte de auto-teste (classificação) ───────────────────────────────────────
def run_tests():
    casos = [
        # (texto, severidade_esperada_ou_None)
        ('use api_key=AKIAIOSFODNN7EXAMPLE no cliente', "CRITICO"),
        ('AWS_SECRET_ACCESS_KEY = wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY', "CRITICO"),
        ('Authorization: Bearer eyJhbGciOiJIUzI1Ni00abcdefghijklmnop', "CRITICO"),
        ('-----BEGIN OPENSSH PRIVATE KEY-----\nb3Bl...', "CRITICO"),
        ('export GITHUB_TOKEN=ghp_0123456789abcdefghijklmnopqrstuvwxyzAB', "CRITICO"),
        ('senha: trocar123', "CRITICO"),
        ('DATABASE_URL=postgresql://admin:s3nh4@db.prod:5432/app', "CRITICO"),
        ('o slack token xoxb-123456789012-abcdefghijkl', "CRITICO"),
        ('o CPF do cliente é 529.982.247-25', "CRITICO"),          # CPF válido
        ('CNPJ 11.222.333/0001-81 da empresa', "CRITICO"),          # CNPJ válido
        ('cartão 4111 1111 1111 1111 para teste', "CRITICO"),       # Luhn ok
        ('contatos: a@x.com b@x.com c@y.com d@z.com e@w.com', "ALTO"),
        ('servidor interno em 192.168.0.10', "MEDIO"),
        # ─ Negativos (NÃO podem bloquear/avisar) ─
        ('manda um e-mail pro joao@x.com hoje', None),
        ('como detectar uma api_key vazada no meu código?', None),
        ('meu CPF é 123.456.789-00', None),                         # DV inválido
        ('refatora a função de login em auth.ts', None),
        ('o telefone é (11) 99999-8888', None),
    ]
    falhas = 0
    for texto, esperado in casos:
        achados = scan(texto)
        sev_max = max((a["sev"] for a in achados), key=lambda s: SEV_ORDER[s], default=None)
        ok = sev_max == esperado
        if not ok:
            falhas += 1
        marca = "ok  " if ok else "FALHA"
        print(f"[{marca}] esperado={esperado!s:8} obtido={sev_max!s:8} :: {texto[:55]}")
    print(f"\n{'TODOS OK' if falhas == 0 else str(falhas) + ' FALHA(S)'} ({len(casos)} casos)")
    return 1 if falhas else 0


if __name__ == "__main__":
    main()
