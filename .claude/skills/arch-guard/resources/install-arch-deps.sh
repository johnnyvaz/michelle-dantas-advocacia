#!/usr/bin/env bash
# scripts/install-arch-deps.sh  (RESOURCE)
# Instala o ArchUnitTS. Detecta o gerenciador pelo lockfile.
# Runtime do report: bun roda TS nativo; sem bun, instale também `tsx`.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if   [ -f bun.lock ] || [ -f bun.lockb ]; then PM="bun add -d";       RUNTS="bun"
elif [ -f pnpm-lock.yaml ];               then PM="pnpm add -D";      RUNTS="npx tsx"
elif [ -f yarn.lock ];                    then PM="yarn add -D";      RUNTS="npx tsx"
else                                            PM="npm install -D";  RUNTS="npx tsx"
fi

echo "→ Instalando archunit ($PM)…"
$PM archunit

# Sem bun, o arch-report.ts roda via tsx
if [ "$RUNTS" = "npx tsx" ]; then
  echo "→ Instalando tsx (runtime do report)…"
  $PM tsx
fi

echo "✓ ArchUnitTS instalado. Runtime do report: $RUNTS"
echo "  Lembre: em monorepo, configure tsconfig.arch.json com \`paths\` dos workspaces."
