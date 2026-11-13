#!/usr/bin/env bash
# ai-jail-doctor — diagnóstico do ambiente para rodar agentes de IA sandboxados.
#
# Uso:  bash ai-jail-doctor.sh
#
# Exit:  0 = pronto · 2 = degradado (funciona, com camadas a menos) · 1 = bloqueado
#
# Sem dependências além de coreutils e do próprio bwrap. Só lê o ambiente — não
# altera nada, não instala nada, não escreve arquivo.

set -u

OK=0
DEGRADED=0
BLOCKED=0

ok()   { printf '  \033[32m✓\033[0m %s\n' "$1"; OK=$((OK + 1)); }
warn() { printf '  \033[33m⚠\033[0m %s\n' "$1"; DEGRADED=$((DEGRADED + 1)); }
bad()  { printf '  \033[31m✗\033[0m %s\n' "$1"; BLOCKED=$((BLOCKED + 1)); }
fix()  { printf '      → %s\n' "$1"; }
head_() { printf '\n\033[1m%s\033[0m\n' "$1"; }

# ── 1. O CLI ────────────────────────────────────────────────────────────────
head_ "ai-jail"
if AI_JAIL_BIN="$(command -v ai-jail 2>/dev/null)"; then
  ok "$AI_JAIL_BIN — $("$AI_JAIL_BIN" --version 2>/dev/null || echo 'versão indisponível')"
else
  bad "ai-jail não encontrado no PATH"
  fix "cargo install ai-jail   (ou brew/yay/mise — veja o Passo 2 da skill)"
  fix "do source: cargo build --release && cp target/release/ai-jail ~/.local/bin/"
fi

# ── 2. bwrap nos caminhos confiáveis ────────────────────────────────────────
head_ "bubblewrap (bwrap)"
BWRAP=""
if [ -n "${BWRAP_BIN:-}" ]; then
  case "$BWRAP_BIN" in
    /*) if [ -f "$BWRAP_BIN" ]; then BWRAP="$BWRAP_BIN"; ok "BWRAP_BIN=$BWRAP_BIN"
        else bad "BWRAP_BIN=$BWRAP_BIN não é um arquivo existente"
             fix "aponte para um caminho absoluto de arquivo, ou remova a variável"; fi ;;
    *)  bad "BWRAP_BIN=$BWRAP_BIN não é absoluto"
        fix "o ai-jail exige caminho absoluto em BWRAP_BIN" ;;
  esac
fi
if [ -z "$BWRAP" ]; then
  # O ai-jail NÃO usa $PATH — só estes três caminhos.
  for c in /usr/bin/bwrap /bin/bwrap /usr/local/bin/bwrap; do
    if [ -f "$c" ]; then BWRAP="$c"; ok "$c"; break; fi
  done
fi
if [ -z "$BWRAP" ]; then
  bad "bwrap ausente nos caminhos confiáveis (/usr/bin, /bin, /usr/local/bin)"
  fix "Debian/Ubuntu: sudo apt install bubblewrap"
  fix "Arch: sudo pacman -S bubblewrap   ·   Fedora: sudo dnf install bubblewrap"
  fix "instalado em outro lugar (Nix/Homebrew)? export BWRAP_BIN=/caminho/absoluto/bwrap"
  if command -v bwrap >/dev/null 2>&1; then
    fix "encontrado no PATH em $(command -v bwrap) — o ai-jail não olha o PATH, use BWRAP_BIN"
  fi
fi

# ── 3. User namespaces: teste de fumaça real ────────────────────────────────
head_ "user namespaces (o teste que importa)"
if [ -n "$BWRAP" ]; then
  # --ro-bind-try em /lib* cobre distros com e sem usrmerge; sem elas o loader
  # não é encontrado e o exec falha por um motivo que não é o namespace.
  SMOKE="$("$BWRAP" --ro-bind /usr /usr \
           --ro-bind-try /lib /lib --ro-bind-try /lib64 /lib64 \
           --ro-bind-try /lib32 /lib32 \
           --dev /dev --proc /proc --unshare-all -- /usr/bin/true 2>&1)"
  if [ -z "$SMOKE" ]; then
    ok "bwrap cria user namespace sem privilégio"
  elif printf '%s' "$SMOKE" | grep -q 'uid map'; then
    bad "bwrap: $SMOKE"
    fix "policy AppArmor do Ubuntu 24.04+/Debian 13+ negando userns não-privilegiado"
    fix "echo 'kernel.apparmor_restrict_unprivileged_userns=0' | sudo tee /etc/sysctl.d/60-userns.conf"
    fix "sudo sysctl --system"
    fix "alternativa: perfil AppArmor 'unconfined' apenas para /usr/bin/bwrap"
  else
    warn "bwrap retornou: $SMOKE"
    fix "não é a falha clássica de uid map — investigue a mensagem acima"
  fi
else
  warn "sem bwrap, o teste de namespace não pode rodar"
fi

# ── 4. Kernel e camadas de defesa ───────────────────────────────────────────
head_ "kernel e camadas de defesa"
KREL="$(uname -r)"
KMAJ="${KREL%%.*}"
KREST="${KREL#*.}"
KMIN="${KREST%%.*}"
case "$KMAJ$KMIN" in ''|*[!0-9]*) KMAJ=0; KMIN=0 ;; esac
kver_ge() { [ "$KMAJ" -gt "$1" ] || { [ "$KMAJ" -eq "$1" ] && [ "$KMIN" -ge "$2" ]; }; }

printf '  kernel %s\n' "$KREL"
if kver_ge 6 5;  then ok "Landlock network V4 disponível (--allow-tcp-port)"
elif kver_ge 6 2; then warn "Landlock fs V3 ok, mas V4 (rede) exige ≥ 6.5 — --allow-tcp-port falha"
elif kver_ge 5 13; then warn "só Landlock V1 (fs) — ABI V3 exige ≥ 6.2"
else bad "kernel < 5.13: Landlock é no-op (bwrap+seccomp seguem valendo)"; fi
kver_ge 5 11 && ok "OverlayFS não-privilegiado disponível (--overlay-map)" \
             || warn "--overlay-map exige kernel ≥ 5.11"

if [ -r /proc/config.gz ] && command -v zcat >/dev/null 2>&1; then
  CFG="$(zcat /proc/config.gz 2>/dev/null)"
  printf '%s' "$CFG" | grep -q '^CONFIG_SECURITY_LANDLOCK=y' \
    && ok "CONFIG_SECURITY_LANDLOCK=y" \
    || warn "Landlock não compilado neste kernel"
  printf '%s' "$CFG" | grep -q '^CONFIG_SECCOMP_FILTER=y' \
    && ok "CONFIG_SECCOMP_FILTER=y" \
    || warn "seccomp-bpf não compilado neste kernel"
else
  warn "sem /proc/config.gz — não foi possível confirmar Landlock/seccomp pelo config"
fi

# ── 5. Plataforma ───────────────────────────────────────────────────────────
head_ "plataforma"
if grep -qi microsoft /proc/version 2>/dev/null; then
  ok "WSL2 — suportado (Windows nativo não é)"
  case "$PWD" in
    /mnt/[a-z]/*) warn "cwd em $PWD (drive Windows) — I/O bem mais lento"
                  fix "para projetos grandes, clone em ~/Projects/ dentro do WSL" ;;
  esac
else
  ok "Linux nativo"
fi

# ── 6. Riscos abertos por padrão ────────────────────────────────────────────
head_ "riscos abertos por padrão"
if [ -S /var/run/docker.sock ]; then
  warn "/var/run/docker.sock existe — será montado read-write (= root no host)"
  fix "use --no-docker se o agente não precisar do Docker"
else
  ok "sem socket do Docker para expor"
fi
[ -f /etc/machine-id ] && warn "/etc/machine-id não é mascarado por default (fingerprint do host)" \
                          && fix "opt-in: --mask /etc/machine-id --mask /var/lib/dbus/machine-id"
printf '  \033[33m⚠\033[0m %s\n' "fora de --lockdown a rede fica totalmente aberta"
DEGRADED=$((DEGRADED + 1))

# ── 7. Config presente ──────────────────────────────────────────────────────
head_ "configuração"
[ -f ./.ai-jail ] && ok "./.ai-jail presente (config inválida é fatal — fail-closed)" \
                  || printf '    ./.ai-jail ainda não existe — gere com: ai-jail --init <comando>\n'
[ -f "$HOME/.ai-jail" ] && ok "~/.ai-jail global presente" \
                        || printf '    ~/.ai-jail global ausente (opcional)\n'

# ── Veredito ────────────────────────────────────────────────────────────────
head_ "veredito"
if [ "$BLOCKED" -gt 0 ]; then
  printf '  \033[31mBLOQUEADO\033[0m — %d impedimento(s), %d aviso(s). Corrija os ✗ acima.\n' \
    "$BLOCKED" "$DEGRADED"
  exit 1
elif [ "$DEGRADED" -gt 0 ]; then
  printf '  \033[33mDEGRADADO\033[0m — funciona, com %d camada(s)/risco(s) a declarar ao usuário.\n' \
    "$DEGRADED"
  exit 2
else
  printf '  \033[32mPRONTO\033[0m — %d checagens ok.\n' "$OK"
  exit 0
fi
