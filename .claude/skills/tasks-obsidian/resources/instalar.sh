#!/usr/bin/env bash
# Instala a skill tasks-obsidian num projeto PH3A.
# Uso: instalar-tasks-obsidian.sh <caminho-do-projeto>
#
# Passos (SKILL.md): scripts -> arquivos de tasks faltantes -> instrução (rule + CLAUDE.md)
#                    -> hook (anexando) -> sync -> conferir.

set -euo pipefail

REPO="${1:?uso: $0 <caminho-do-projeto>}"
REPO="$(cd "$REPO" && pwd)"
NOME="$(basename "$REPO")"
DATA="$(date +%F)"

BOILER=/home/johnny/GIT/PH3A/PROJETOS/BOILERPLATE-IA
R="$BOILER/.claude/skills/tasks-obsidian/resources"
T="$R/templates"

echo "════════════════════════════════════════════"
echo "  Instalando tasks-obsidian — $NOME"
echo "════════════════════════════════════════════"

# ── 1. scripts ──────────────────────────────────────────────────────────────
#
# A fonte é `$BOILER/scripts/`, a MESMA que `scripts/propagar-tasks.sh` distribui — e não uma
# cópia em `resources/`. Havia as duas: em 2026-08-10 a de `resources/` estava 4 dias e ~100
# linhas atrás por arquivo, então instalar num projeto novo entregava gerador velho enquanto
# `propagar-tasks.sh` entregava o novo nos antigos. Uma fonte só, ou a divergência volta.
mkdir -p "$REPO/scripts/hooks" "$REPO/tasks"
cp "$BOILER/scripts"/{obsidian-panel.js,obsidian-index.js,obsidian-inbox-merge.js,sync-obsidian.sh} "$REPO/scripts/"
cp "$BOILER/scripts"/{prioridade.py,migrar-tasks.py,importar-spec.py} "$REPO/scripts/"
cp "$BOILER/scripts/hooks/obsidian-sync-hook.sh" "$REPO/scripts/hooks/"

# `prioridade.py` morre sem `gemeo/00-CANON/prioridade.yaml` (o sync tolera, mas sai sem matriz
# nem PRIORIDADE.md). Semeado só quando falta: quem calibrou os pesos localmente mantém os seus.
if [ ! -f "$REPO/gemeo/00-CANON/prioridade.yaml" ]; then
    mkdir -p "$REPO/gemeo/00-CANON"
    cp "$BOILER/gemeo/00-CANON/prioridade.yaml" "$REPO/gemeo/00-CANON/prioridade.yaml"
    echo "  + gemeo/00-CANON/prioridade.yaml (modelo do motor)"
fi
chmod +x "$REPO/scripts/sync-obsidian.sh" "$REPO/scripts/hooks/obsidian-sync-hook.sh"

# Projeto ESM ("type": "module") trata .js como módulo e o `require` dos geradores explode.
# Renomear para .cjs é local ao projeto — um scripts/package.json com type commonjs quebraria
# os outros scripts do projeto, que são ESM de verdade.
if [ "$(jq -r '.type // ""' "$REPO/package.json" 2>/dev/null)" = "module" ]; then
    for js in obsidian-panel obsidian-index obsidian-inbox-merge; do
        mv "$REPO/scripts/$js.js" "$REPO/scripts/$js.cjs"
        sed -i "s|scripts/$js\.js|scripts/$js.cjs|g" "$REPO/scripts/sync-obsidian.sh"
    done
    echo "✓ scripts copiados (projeto ESM → geradores como .cjs)"
else
    echo "✓ scripts copiados"
fi

# ── 2. arquivos de tasks que faltarem (nunca sobrescreve) ───────────────────
criar() {  # criar <destino> <fonte>
    local alvo="$REPO/tasks/$1" fonte="$2"
    if [ -f "$alvo" ]; then
        printf '  · %-16s já existe\n' "$1"
    else
        sed "s/{{PROJECT_NAME}}/$NOME/g; s/{{DATA}}/$DATA/g" "$fonte" > "$alvo"
        printf '  + %-16s criado\n' "$1"
    fi
}
criar inbox.md      "$T/INBOX.md"
criar concluidas.md "$T/concluidas.md"
criar backlog.md    "$T/backlog.md"
criar bugs.md       "$T/bugs.md"
# human/features/ideas não têm template na skill — vêm do boilerplate (dialeto "aprovar")
criar human.md      "$BOILER/tasks/human.md"
criar features.md   "$BOILER/tasks/features.md"
criar ideas.md      "$BOILER/tasks/ideas.md"
criar README.md     "$BOILER/tasks/README.md"

# ── 3. instrução para os agentes: rule + seção no CLAUDE.md ──────────────────
#
# Sem este passo a instalação entrega o MECANISMO (scripts, hook, arquivos) e nenhuma
# INSTRUÇÃO: medido em 2026-08-10, 10 dos 13 projetos com CLAUDE.md não mencionavam `tasks/`,
# então o agente daquele repo não sabia que a fila existe — registrava em comentário no código
# ou em nada. `tasks/README.md` é contrato de FORMATO e só é lido por quem já sabe que deve ir
# lá; o que entra no contexto sempre é o CLAUDE.md da raiz.
mkdir -p "$REPO/.claude/rules"
RULE="$REPO/.claude/rules/tasks.md"
if [ -f "$RULE" ] && ! cmp -s "$BOILER/.claude/rules/tasks.md" "$RULE"; then
    echo "  ⚠ .claude/rules/tasks.md divergia do boilerplate — sobrescrito (cópia em tasks.md.bak)"
    cp "$RULE" "$RULE.bak"
fi
cp "$BOILER/.claude/rules/tasks.md" "$RULE"
echo "  + .claude/rules/tasks.md"

C="$REPO/CLAUDE.md"
BLOCO="$T/CLAUDE-tasks.md"
if [ ! -f "$C" ]; then
    { printf '# %s\n\nContexto deste repositório para o Claude Code.\n\n' "$NOME"; cat "$BLOCO"; } > "$C"
    echo "  + CLAUDE.md criado (não existia) já com a seção de tarefas"
elif grep -q 'tasks-obsidian:inicio' "$C"; then
    echo "  · CLAUDE.md já tem o bloco de tarefas"
elif grep -qE 'tasks/human\.md' "$C"; then
    # DATA-DOSSIE é o caso: tem seção própria, mais detalhada que o template. Injetar criaria
    # duas fontes para a mesma regra, que divergem na primeira edição.
    echo "  ⚠ CLAUDE.md já documenta a fila à mão (cita tasks/human.md) — NÃO injetei."
    echo "    Confira se cobre: inbox primeiro · pedido só em human.md · não bloquear · concluída sai do arquivo"
else
    printf '\n' >> "$C"
    cat "$BLOCO" >> "$C"
    echo "  + seção de tarefas anexada ao CLAUDE.md"
fi

# ── 4. hook, anexando ao que já existe ──────────────────────────────────────
S="$REPO/.claude/settings.json"
L="$REPO/.claude/settings.local.json"
mkdir -p "$REPO/.claude"

# Já registrado em qualquer um dos dois? Então não mexe (a re-execução duplicaria).
# O comando pode vir com aspas ($CLAUDE_PROJECT_DIR) — casar por regex, não por igualdade.
ja_tem() { [ -f "$1" ] && jq -e --arg m "$2" '[.hooks//{} | .[]? | .[]?.hooks[]?.command] | any(test("obsidian-sync-hook[^ ]*[ \"]+" + $m + "$"))' "$1" >/dev/null 2>&1; }
if (ja_tem "$S" mark || ja_tem "$L" mark) && (ja_tem "$S" flush || ja_tem "$L" flush); then
    echo "✓ hook já registrado — nada a fazer"
    ALVO=""
else
    # Convenção do projeto: onde já moram os hooks dele.
    tem_hooks() { [ -f "$1" ] && jq -e '(.hooks//{}) | length > 0' "$1" >/dev/null 2>&1; }
    if   tem_hooks "$S"; then ALVO="$S"
    elif tem_hooks "$L"; then ALVO="$L"
    else ALVO="$S"; [ -f "$S" ] || echo '{}' > "$S"
    fi
    # Sempre ancorado em $CLAUDE_PROJECT_DIR: relativo ao cwd, o hook morre com
    # "No such file" assim que a sessão sai da raiz do projeto.
    MARK='bash "$CLAUDE_PROJECT_DIR/scripts/hooks/obsidian-sync-hook.sh" mark'
    FLUSH='bash "$CLAUDE_PROJECT_DIR/scripts/hooks/obsidian-sync-hook.sh" flush'

    cp "$ALVO" "$ALVO.bak-obsidian"
    jq --arg mark "$MARK" --arg flush "$FLUSH" '
      .hooks //= {}
      # PostToolUse: anexa ao PRIMEIRO bloco que casa Edit; se nenhum casar, cria um.
      | .hooks.PostToolUse = (
          (.hooks.PostToolUse // []) as $p
          | ([range(0; ($p|length))] | map(select(($p[.].matcher // "") | test("Edit"))))[0] as $i
          | if $i == null
            then $p + [{"matcher":"Write|Edit|MultiEdit","hooks":[{"type":"command","command":$mark}]}]
            else ($p | .[$i].hooks = ((.[$i].hooks // []) + [{"type":"command","command":$mark}]))
            end)
      # Stop: anexa ao primeiro bloco; se não houver, cria.
      | .hooks.Stop = (
          (.hooks.Stop // []) as $s
          | if ($s | length) > 0
            then [ $s[0] | .hooks += [{"type":"command","command":$flush,"timeout":60,"statusMessage":"Sincronizando Obsidian..."}] ] + $s[1:]
            else [{"hooks":[{"type":"command","command":$flush,"timeout":60,"statusMessage":"Sincronizando Obsidian..."}]}]
            end)
    ' "$ALVO.bak-obsidian" > "$ALVO"

    # Verificação de PRESENÇA (o que a skill omite) e de PRESERVAÇÃO.
    antes="$(jq -r '[.hooks//{} | .[]? | .[]?.hooks[]?.command] | sort | .[]' "$ALVO.bak-obsidian")"
    depois="$(jq -r '[.hooks//{} | .[]? | .[]?.hooks[]?.command] | sort | .[]' "$ALVO")"
    faltando="$(comm -23 <(printf '%s\n' "$antes") <(printf '%s\n' "$depois"))"
    [ -z "$faltando" ] || { echo "✗ comandos sumiram do settings: $faltando" >&2; mv "$ALVO.bak-obsidian" "$ALVO"; exit 1; }
    ja_tem "$ALVO" mark  || { echo "✗ hook mark NÃO foi registrado"  >&2; mv "$ALVO.bak-obsidian" "$ALVO"; exit 1; }
    ja_tem "$ALVO" flush || { echo "✗ hook flush NÃO foi registrado" >&2; mv "$ALVO.bak-obsidian" "$ALVO"; exit 1; }
    rm -f "$ALVO.bak-obsidian"
    echo "✓ hook registrado em $(basename "$ALVO")"
fi

# ── 5. sync ─────────────────────────────────────────────────────────────────
cd "$REPO"
bash scripts/sync-obsidian.sh

# ── 6. conferência independente das contagens ───────────────────────────────
echo "── conferência (grep independente)"
grep -cE '^- \[[ /x-]\]' tasks/backlog.md tasks/bugs.md 2>/dev/null || true

# O cofre é o que o SYNC usou, não "o primeiro da lista": com dois cofres na máquina
# (PH3A e GENIARIA), a ordem alfabética apontava para o errado e a conferência reprovava uma
# instalação correta. Mesma precedência do sync-obsidian.sh — conf explícita, depois evidência.
# `|| true`: com `set -o pipefail`, o grep sem match derruba o script inteiro em silêncio —
# e projeto sem `.obsidian-sync.conf` é o caso comum, não a exceção.
V="$(sed -E 's/#.*//; s/[[:space:]]//g' "$REPO/.obsidian-sync.conf" 2>/dev/null | grep -E '^vault=' | tail -1 | cut -d= -f2- || true)"
if [ -z "$V" ]; then
    for c in /mnt/c/Users/*/Documents/Obsidian/*/ "$HOME"/Documents/Obsidian/*/; do
        [ -d "$c/.obsidian" ] && [ -d "$c/$NOME" ] && { V="${c%/}"; break; }
    done
fi
EST="${V%/}/$NOME/_estado.json"
if [ -f "$EST" ]; then
    jq -r '"  _estado: abertas=\(.abertas) backlog=\(.backlog) bugs=\(.bugs) features=\(.features) humano=\(.humano_total) dialeto=\(.dialeto_human)"' "$EST"
    [ "$(jq -r '.humano_total' "$EST")" = "0" ] && echo "  ⚠ humano_total=0 — conferir dialeto de human.md" || true
else
    echo "  ✗ _estado.json não encontrado em $EST" >&2; exit 1
fi
echo "✓ $NOME concluído"
echo
