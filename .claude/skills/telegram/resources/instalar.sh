#!/usr/bin/env bash
# instalar.sh — instala a ponte Telegram num projeto.
#
# Idempotente: rodar de novo atualiza os scripts e NÃO toca no `.env.local` que já existe —
# sobrescrever o segredo de quem já configurou é o único estrago irreversível possível aqui.
#
#   bash instalar.sh [caminho-do-projeto]     # padrão: diretório atual
set -euo pipefail

ORIGEM="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ALVO="$(cd "${1:-$PWD}" && pwd)"

ok()   { printf '  ✓ %s\n' "$1"; }
pula() { printf '  · %s\n' "$1"; }
erro() { printf '  ✗ %s\n' "$1" >&2; exit 1; }

printf '\n▶ Ponte Telegram → %s\n\n' "$ALVO"

command -v python3 >/dev/null || erro "python3 não encontrado"
[ -d "$ALVO" ] || erro "$ALVO não existe"

# ── 1. scripts ────────────────────────────────────────────────────────────────
mkdir -p "$ALVO/scripts"
install -m 644 "$ORIGEM/_telegram.py"  "$ALVO/scripts/_telegram.py"
install -m 755 "$ORIGEM/notificar.py"  "$ALVO/scripts/notificar.py"
ok "scripts/_telegram.py e scripts/notificar.py"

# A ponte depende do motor de prioridade e do contrato da fila humana. Sem eles ela seria um
# import quebrado esperando a primeira execução — melhor não instalar e dizer por quê.
if [ -f "$ALVO/tasks/human.md" ] && [ -f "$ALVO/scripts/prioridade.py" ]; then
  install -m 755 "$ORIGEM/ponte-telegram.py" "$ALVO/scripts/ponte-telegram.py"
  ok "scripts/ponte-telegram.py (fila humana encontrada)"
  PONTE=1
else
  pula "ponte-telegram.py NÃO instalada: falta tasks/human.md ou scripts/prioridade.py"
  pula "  (notificar.py funciona sozinho — a ponte é que precisa da fila)"
  PONTE=0
fi

# ── 2. segredo ────────────────────────────────────────────────────────────────
if [ -f "$ALVO/.env.local" ]; then
  pula ".env.local já existe — não toquei"
else
  cat > "$ALVO/.env.local" <<'ENV'
# Ponte Telegram — NÃO versionar (está no .gitignore)
# 1. @BotFather no Telegram → /newbot → cole o token aqui
TELEGRAM_BOT_TOKEN=
# 2. mande /start para o seu bot, depois:
#    python3 scripts/notificar.py --descobrir-chat
TELEGRAM_CHAT_ID=

# Opcionais
# PONTE_CORPO_COMPLETO=1   # manda o bloco inteiro do item, não só os rótulos de decisão
# PONTE_COMMIT=0           # grava a resposta sem commitar
ENV
  chmod 600 "$ALVO/.env.local"
  ok ".env.local semeado (modo 600, vazio — preencha os dois campos)"
fi

# ── 3. gitignore ──────────────────────────────────────────────────────────────
GI="$ALVO/.gitignore"
touch "$GI"
adiciona() {
  if grep -qxF "$1" "$GI"; then pula ".gitignore já ignora $1"; else
    printf '%s\n' "$1" >> "$GI"; ok ".gitignore ← $1"; fi
}
grep -q '^# ponte Telegram' "$GI" || printf '\n# ponte Telegram (scripts/ponte-telegram.py)\n' >> "$GI"
adiciona ".env.local"
adiciona "tasks/.ponte-telegram.json"

# ── 4. verificação ────────────────────────────────────────────────────────────
printf '\n'
if grep -q '^TELEGRAM_BOT_TOKEN=.\+' "$ALVO/.env.local" 2>/dev/null; then
  if (cd "$ALVO" && python3 scripts/notificar.py --testar); then
    printf '\n✅ Instalado e verificado.\n'
  else
    printf '\n⚠ Instalado, mas as credenciais não passaram. Confira o .env.local.\n'
  fi
else
  cat <<TXT
✅ Arquivos instalados. Faltam as credenciais — 3 minutos:

  1. No Telegram, fale com @BotFather → /newbot → copie o token
  2. Cole em $ALVO/.env.local  (TELEGRAM_BOT_TOKEN=)
  3. Abra o seu bot e mande /start
  4. cd $ALVO && python3 scripts/notificar.py --descobrir-chat
  5. Cole o TELEGRAM_CHAT_ID no .env.local
  6. python3 scripts/notificar.py --testar
TXT
fi

printf '\nComandos:\n'
printf '  python3 scripts/notificar.py "oi"                       envio avulso\n'
printf '  python3 scripts/notificar.py --rodar "CMD" --so-se-falhar   avisa só quando quebra\n'
[ "$PONTE" = 1 ] && {
printf '  python3 scripts/ponte-telegram.py fila                  a fila no terminal\n'
printf '  python3 scripts/ponte-telegram.py empurrar              manda o topo (cron)\n'
printf '  python3 scripts/ponte-telegram.py servir                escuta e grava respostas\n'; }
printf '\n'
