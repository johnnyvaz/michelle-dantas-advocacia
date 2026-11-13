#!/usr/bin/env bash
# scripts/sca-scan.sh — SCA: audit das dependências de TODOS os pacotes (Node: raiz e subpastas com lockfile;
# Python: requirements*.txt / uv.lock / poetry.lock) e UM relatório agregado.
#
# Grava .sca-report.json (lido pelo quality-gate: o gate NÃO roda o audit ao vivo — o advisory DB muda sozinho) e
# imprime o resumo por pacote.
#
# Exit:  0 sem vulnerabilidade acima do baseline
#        1 high/critical SOBEM em relação ao baseline (`sca_high`/`sca_critical` de quality-baseline.json; sem
#          baseline ainda, reprova em qualquer high/critical)
#        2 audit NÃO MEDIU algum pacote (sem rede, JSON de erro, ferramenta ausente). O pacote vira `null` e os
#          totais também: o gate marca skip/regressão — nunca "0 vulnerabilidades".
#
# Todos os audits rodam primeiro, para arquivos brutos; UM agregador (node) lê tudo, escreve o relatório e sai uma
# vez. Sem `set -e`: o audit Python roda mesmo quando o npm reprova (e vice-versa).
set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
RAW="$ROOT/.sca-raw"
rm -rf "$RAW" && mkdir -p "$RAW"
echo "→ SCA: audit de dependências"

EXCL=( -not -path "*/node_modules/*" -not -path "*/venv/*" -not -path "*/.venv/*" -not -path "*/vendor/*" \
       -not -path "*/site-packages/*" -not -path "*/examples/*" -not -path "*/.git/*" )

nome_do() { if [ "$1" = "." ]; then echo "raiz"; else basename "$1"; fi; }

# ── Node: um audit por pacote com lockfile (bun/pnpm/npm), JSON bruto. ───────────────────────────────────────
# bun.lock/bun.lockb vence: num projeto bun, package-lock/pnpm-lock que sobraram costumam estar defasados.
for PKG in . $(find . -mindepth 2 -maxdepth 2 \( -name pnpm-lock.yaml -o -name package-lock.json -o -name bun.lock -o -name bun.lockb \) "${EXCL[@]}" \
                 -exec dirname {} \; | sed 's#^\./##' | sort -u); do
  if [ -f "$PKG/bun.lock" ] || [ -f "$PKG/bun.lockb" ]; then CMD=(bun audit --json); TIPO=bun
  elif [ -f "$PKG/pnpm-lock.yaml" ]; then CMD=(pnpm audit --json)
  elif [ -f "$PKG/package-lock.json" ]; then CMD=(npm audit --json)
  else continue; fi
  # `audit` sai ≠ 0 quando há achados (o JSON é o que interessa) e também quando falha (sem rede). Quem decide se
  # mediu é o agregador: JSON sem metadata.vulnerabilities ⇒ pacote não medido.
  ( cd "$PKG" && "${CMD[@]}" 2>/dev/null ) > "$RAW/${TIPO:-node}.$(nome_do "$PKG").json" || true
  TIPO=
done

# ── Python: pip-audit sobre requirements*.txt; uv.lock/poetry.lock exportam para requirements antes. ──────────
for D in . $(find . -mindepth 2 -maxdepth 2 \( -name 'requirements*.txt' -o -name uv.lock -o -name poetry.lock \) \
               "${EXCL[@]}" -exec dirname {} \; | sed 's#^\./##' | sort -u); do
  NOME="$(nome_do "$D")"; SAIDA="$RAW/py.$NOME.json"; REQ=""
  if   [ -f "$D/requirements.txt" ]; then REQ="$D/requirements.txt"
  elif [ -f "$D/uv.lock" ] && command -v uv >/dev/null 2>&1; then
    REQ="$RAW/py.$NOME.txt"; ( cd "$D" && uv export --no-hashes --no-emit-project 2>/dev/null ) > "$REQ" || REQ=""
  elif [ -f "$D/poetry.lock" ] && command -v poetry >/dev/null 2>&1; then
    REQ="$RAW/py.$NOME.txt"; ( cd "$D" && poetry export -f requirements.txt --without-hashes 2>/dev/null ) > "$REQ" || REQ=""
  elif [ -f "$D/uv.lock" ] || [ -f "$D/poetry.lock" ]; then
    : > "$SAIDA"; echo "  ⚠ $NOME: lockfile Python sem uv/poetry instalado — pacote não medido" >&2; continue
  else continue; fi
  if [ -z "$REQ" ]; then : > "$SAIDA"; continue; fi
  if command -v pip-audit >/dev/null 2>&1; then
    # Manifesto todo fixado (==): audita a lista exata sem instalar nada (pacote com extensão C não
    # precisa compilar). Senão, o modo padrão, que resolve as dependências num venv temporário.
    pip-audit -r "$REQ" --disable-pip --no-deps -f json 2>/dev/null > "$SAIDA" \
      || pip-audit -r "$REQ" -f json 2>/dev/null > "$SAIDA" || true
  else
    : > "$SAIDA"; echo "  ⚠ pip-audit não instalado — pacote Python $NOME não medido" >&2
  fi
done

# ── Agregador: um relatório, um veredito, uma saída. ─────────────────────────────────────────────────────────
node - "$RAW" <<'JS'
const fs = require('fs'), path = require('path');
const raw = process.argv[2];
const raiz = process.cwd();
const lerJson = (f) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return null; } };

const porPacote = {};
let high = 0, critical = 0, incompleto = false;
for (const arq of fs.readdirSync(raw).filter((f) => f.endsWith('.json')).sort()) {
  const [tipo, ...resto] = arq.slice(0, -5).split('.');
  const nome = resto.join('.');
  const chave = tipo === 'py' ? `${nome}-python` : nome;
  const j = lerJson(path.join(raw, arq));
  if (tipo === 'bun') {
    // bun audit --json: { pacote: [{ severity, ... }] }, {} sem achados. Falha (sem rede) não é objeto JSON.
    if (!j || typeof j !== 'object' || Array.isArray(j)) { porPacote[chave] = null; incompleto = true; continue; }
    const conta = { high: 0, critical: 0, moderate: 0 };
    for (const avisos of Object.values(j)) for (const a of Array.isArray(avisos) ? avisos : []) {
      if (a.severity in conta) conta[a.severity]++;
    }
    porPacote[chave] = conta;
  } else if (tipo === 'node') {
    // Audit que falhou costuma imprimir JSON VÁLIDO ({"error":{...}}) ou nada: só vale com metadata.vulnerabilities.
    const v = j?.metadata?.vulnerabilities;
    if (!v || typeof v !== 'object') { porPacote[chave] = null; incompleto = true; continue; }
    porPacote[chave] = { high: v.high ?? 0, critical: v.critical ?? 0, moderate: v.moderate ?? 0 };
  } else {
    // pip-audit NÃO informa severidade (só id/aliases/fix_versions): cada vulnerabilidade conta como `high`
    // (fail-closed). Se o dono preferir severidade real, usar osv-scanner (ver SKILL.md, Passo 2).
    if (!j || !Array.isArray(j.dependencies)) { porPacote[chave] = null; incompleto = true; continue; }
    const n = j.dependencies.reduce((s, d) => s + (d.vulns?.length ?? 0), 0);
    porPacote[chave] = { high: n, critical: 0, moderate: 0, severidade: 'desconhecida (pip-audit): contada como high' };
  }
  high += porPacote[chave].high;
  critical += porPacote[chave].critical;
}

const relatorio = {
  // Qualquer pacote não medido torna o total desconhecido: somar só os medidos daria um verde falso.
  sca_high: incompleto ? null : high,
  sca_critical: incompleto ? null : critical,
  ...(incompleto ? { sca_high_parcial: high, sca_critical_parcial: critical,
    erro: 'pacote(s) não medido(s) (sem rede, JSON de erro ou ferramenta ausente)' } : {}),
  por_pacote: porPacote,
  date: new Date().toISOString().slice(0, 10),
};
fs.writeFileSync(path.join(raiz, '.sca-report.json'), JSON.stringify(relatorio, null, 2) + '\n');
fs.rmSync(raw, { recursive: true, force: true });

console.log(JSON.stringify(porPacote));
console.log(`sca_high=${relatorio.sca_high} sca_critical=${relatorio.sca_critical}`);

const base = lerJson(path.join(raiz, 'quality-baseline.json'))?.metrics ?? {};
const limiteHigh = base.sca_high ?? 0, limiteCritical = base.sca_critical ?? 0;
if (high > limiteHigh || critical > limiteCritical) {
  console.error(`✗ SCA: high ${high} (baseline ${limiteHigh}), critical ${critical} (baseline ${limiteCritical})${incompleto ? ' [parcial]' : ''}`);
  process.exit(1);
}
if (incompleto) {
  console.error(`✗ SCA: ${relatorio.erro} — nada a afirmar sobre os totais (relatório com null)`);
  process.exit(2);
}
console.log('✓ SCA: sem vulnerabilidade nova acima do baseline');
JS
exit $?
