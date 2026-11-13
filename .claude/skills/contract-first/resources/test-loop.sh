#!/usr/bin/env bash
# =============================================================================
# scripts/test-loop.sh — uma rodada completa do loop de desenvolvimento:
#   up (stack ISOLADA) → seed → INTERNO (.http/httpyac) → EXTERNO (@playwright/test) → down
#
# Uso:
#   bash scripts/test-loop.sh                 # rodada completa (Docker se disponível)
#   bash scripts/test-loop.sh --no-docker     # fallback: usa stack já rodando + DB de teste local
#   bash scripts/test-loop.sh --internal      # só a perna interna (contratos .http)
#   bash scripts/test-loop.sh --external      # só a perna externa (E2E browser)
#   bash scripts/test-loop.sh --keep-up       # não derruba a stack no fim (debug)
#
# Loop contínuo: use o primitivo /loop  →  /loop 2m bash scripts/test-loop.sh
# Ajuste os comandos de seed/migrate e o PM (pnpm/npm/yarn) à sua stack.
# Pode ser chamado de qualquer diretório (entra na raiz do projeto, onde fica o COMPOSE_FILE relativo).
# Sem Docker o script NÃO tenta a stack local às cegas: termina vermelho (exit 3) dizendo que contrato e e2e
# "não foram executados por falta de ambiente" — silêncio ou um timeout de health check enganariam. Use
# --no-docker só com a stack de teste já de pé.
# =============================================================================
set -euo pipefail

cd "$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# --- config (ajuste ao Passo 1 da skill) -------------------------------------
PM="${PM:-pnpm}"                                  # gerenciador de pacotes
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.test.yml}"
API_HEALTH_URL="${API_HEALTH_URL:-http://localhost:3001/health}"
HEALTH_TIMEOUT="${HEALTH_TIMEOUT:-60}"            # segundos esperando a API subir
# Seed: se a api migra e semeia ao subir (comando do serviço no compose), deixe vazio. Senão, informe o comando
# (ex.: "$PM run migrate:latest"); ele roda também no modo --no-docker, contra o banco de teste já de pé.
SEED_CMD="${SEED_CMD:-}"
CONTRACT_DIR="${CONTRACT_DIR:-contract-first}"   # onde ficam os .http (ex.: api/contract-first)
CONTRACT_CMD="${CONTRACT_CMD:-$PM run test:contract}"
E2E_CMD="${E2E_CMD:-$PM run test:e2e}"

# --- flags -------------------------------------------------------------------
USE_DOCKER=1; RUN_INTERNAL=1; RUN_EXTERNAL=1; KEEP_UP=0; NO_DOCKER_PEDIDO=0
for arg in "$@"; do
  case "$arg" in
    --no-docker) USE_DOCKER=0; NO_DOCKER_PEDIDO=1 ;;
    --internal)  RUN_EXTERNAL=0 ;;
    --external)  RUN_INTERNAL=0 ;;
    --keep-up)   KEEP_UP=1 ;;
    *) echo "flag desconhecida: $arg" >&2; exit 2 ;;
  esac
done
DOCKER_AUSENTE=0
command -v docker >/dev/null 2>&1 || { DOCKER_AUSENTE=1; USE_DOCKER=0; }

log() { printf '\n\033[1;36m▶ %s\033[0m\n' "$*"; }
ok()  { printf '\033[1;32m✔ %s\033[0m\n' "$*"; }
err() { printf '\033[1;31m✘ %s\033[0m\n' "$*" >&2; }

# --- sem Docker e sem --no-docker: não há ambiente, e o script diz isso em vez de falhar no health check ---
if [[ "$DOCKER_AUSENTE" -eq 1 && "$NO_DOCKER_PEDIDO" -eq 0 ]]; then
  err "não executado por falta de ambiente: 'docker' não está no PATH."
  err "  contrato (httpyac) e e2e (Playwright) NÃO rodaram — isto não é um resultado verde."
  err "  Instale o Docker ou, com a stack de teste já de pé, use --no-docker."
  exit 3
fi

# --- teardown garantido (trap) ----------------------------------------------
teardown() {
  local code=$?
  if [[ "$USE_DOCKER" -eq 1 && "$KEEP_UP" -eq 0 ]]; then
    log "down — derrubando a stack isolada"
    docker compose -f "$COMPOSE_FILE" down -v --remove-orphans >/dev/null 2>&1 || true
  fi
  [[ $code -eq 0 ]] && ok "LOOP VERDE" || err "LOOP VERMELHO (exit $code)"
  exit $code
}
trap teardown EXIT INT TERM

wait_for_health() {
  log "aguardando API em $API_HEALTH_URL (até ${HEALTH_TIMEOUT}s)"
  local i=0
  until curl -fsS "$API_HEALTH_URL" >/dev/null 2>&1; do
    i=$((i+1)); [[ $i -ge $HEALTH_TIMEOUT ]] && { err "API não respondeu ao health check"; return 1; }
    sleep 1
  done
  ok "API saudável"
}

# --- 1. up + 2. seed ---------------------------------------------------------
if [[ "$USE_DOCKER" -eq 1 ]]; then
  log "up — stack de teste ISOLADA ($COMPOSE_FILE)"
  docker compose -f "$COMPOSE_FILE" up -d --build --wait
else
  log "modo --no-docker: usando stack já em execução (DB de teste local + mocks)"
fi

wait_for_health

if [[ -n "$SEED_CMD" ]]; then
  log "seed — estado reproduzível (migrate + seed sintético)"
  eval "$SEED_CMD"
else
  log "seed — SEED_CMD vazio: assumindo que a API migra e semeia ao subir (defina SEED_CMD se não for o caso)"
fi

# O http-client.env.json real fica no .gitignore; sem ele, usa o modelo versionado (credenciais FICTÍCIAS).
if [[ -f "$CONTRACT_DIR/http-client.env.example.json" && ! -f "$CONTRACT_DIR/http-client.env.json" ]]; then
  cp "$CONTRACT_DIR/http-client.env.example.json" "$CONTRACT_DIR/http-client.env.json"
fi

# --- 3. INTERNO: contratos .http (httpyac) ----------------------------------
if [[ "$RUN_INTERNAL" -eq 1 ]]; then
  log "INTERNO — contratos .http (httpyac)"
  eval "$CONTRACT_CMD"
  ok "contratos internos OK"
fi

# --- 4. EXTERNO: E2E browser (@playwright/test) ------------------------------
if [[ "$RUN_EXTERNAL" -eq 1 ]]; then
  log "EXTERNO — E2E browser (@playwright/test)"
  eval "$E2E_CMD"
  ok "E2E externo OK"
fi

# teardown roda no trap EXIT
