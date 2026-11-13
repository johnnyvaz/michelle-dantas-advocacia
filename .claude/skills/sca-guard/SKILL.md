---
name: sca-guard
description: Segurança da cadeia de suprimentos (SCA) para projetos PH3A. Instala scan de vulnerabilidades de dependências (npm/pnpm audit, pip-audit/osv-scanner), secret scanning (gitleaks) no pre-commit e geração de SBOM (CycloneDX). Complementa o /review-code-ph3a (que vê só código próprio) cobrindo dependências de terceiros e segredos vazados. Cobre NORM15 (vulnerabilidades) e PROC03. Integra opcionalmente o ratchet do quality-gate (sca_high/sca_critical). Invoque com /sca-guard [caminho].
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
---

# Skill: SCA Guard — Segurança da Cadeia de Suprimentos (PH3A)

`/review-code-ph3a` audita o **código próprio**; esta skill cobre o resto da superfície de ataque: **dependências
de terceiros**, **segredos vazados** e **inventário (SBOM)**. Mapeia NORM15 (Gestão de Vulnerabilidade e Ameaças)
e PROC03 (Pen Test), e o princípio da constituição "dependências passam por revisão antes da adoção".

Três frentes: **(A) audit de dependências**, **(B) secret scanning**, **(C) SBOM**.

---

## Passo 1 — Detectar gerenciadores de pacote

```bash
find . -maxdepth 2 \( -name package-lock.json -o -name pnpm-lock.yaml -o -name yarn.lock \) -not -path "*/node_modules/*"   # Node (qualquer pacote)
ls requirements.txt poetry.lock pyproject.toml uv.lock 2>/dev/null # Python
ls scripts/quality-gate.js 2>/dev/null                            # ratchet presente?
```

## Passo 2 — (A) Audit de dependências

Copie `resources/sca-scan.sh` para `scripts/sca-scan.sh` (verbatim — ele descobre os pacotes, não tem lista fixa).
Ele audita **cada pacote com lockfile** (a raiz e as subpastas `api/`, `web/`, `backend/`... — nunca só a raiz; lockfile
dentro de `node_modules`/`venv`/`vendor` não conta) e o Python (`requirements.txt` na raiz ou numa subpasta; `uv.lock`/
`poetry.lock` via `uv export`/`poetry export`), e **grava `.sca-report.json`**, que é o que o `quality-gate` lê (ver
Passo 5: o gate não roda o audit ao vivo). Todos os audits rodam primeiro, para arquivos brutos, e **um agregador**
escreve o relatório e sai uma vez: o audit Python roda mesmo quando o npm reprova (sem `set -e` com saída precoce).

Contrato de saída:

| exit | significado |
|---|---|
| 0 | sem vulnerabilidade acima do baseline |
| 1 | high/critical **sobem** em relação a `sca_high`/`sca_critical` do `quality-baseline.json` (sem baseline ainda, reprova em qualquer high/critical) |
| 2 | **algum pacote não foi medido** (sem rede, JSON de erro, ferramenta ausente) |

**Audit que falha não é "0 vulnerabilidades".** `npm|pnpm audit --json` sem rede costuma imprimir JSON *válido*
(`{"error":{...}}`) ou nada; só vale a saída com `metadata.vulnerabilities`. Pacote não medido vira `null` em
`por_pacote`, e **os totais `sca_high`/`sca_critical` viram `null`** (somar só os medidos daria verde falso; a soma
parcial fica em `sca_high_parcial`). O gate lê `null` como `skip` (ou regressão, se você marcar a métrica como essencial).

**pip-audit e severidade.** O `pip-audit` não informa severidade (só id, aliases e versões corrigidas). O script conta
**cada vulnerabilidade Python como `high`** (fail-closed) e marca isso em `por_pacote[...].severidade`. Se o dono quiser
severidade real, a alternativa é o `osv-scanner` (traz CVSS) ou uma métrica separada `sca_python_vulns`; é decisão dele,
não do scanner. A baseline de `sca_high` passa a incluir as vulnerabilidades Python — **mudança de padrão**: quem já
tinha `sca_high` gravado só com npm vê o número subir; apague a chave `sca_high` do `quality-baseline.json` (o ratchet
`desc` nunca sobe um valor salvo) e rode `--update` depois de conferir os achados.

Vulnerabilidade sem versão corrigida publicada não pode travar o projeto para sempre: fica medida no baseline e só pode
diminuir.

> Prova offline (sem rede): `tests/test_sca_scan.py` coloca stubs de `pnpm`, `npm` e `pip-audit` no `PATH` e mostra JSON
> de erro → `null` + exit 2, pacote parcial → total `null`, `backend/requirements.txt` auditado.

> Alternativa unificada multi-linguagem: **osv-scanner** (`osv-scanner --lockfile=...`) — recomendar quando o
> projeto tem várias stacks.

### Corrigir dívida transitiva: duas armadilhas medidas em campo

Vulnerabilidade em dependência **transitiva** não se corrige subindo a dependência direta — corrige-se
com `pnpm.overrides` (pnpm) / `overrides` (npm) / `resolutions` (yarn). Duas coisas quebram nesse caminho,
ambas observadas na campanha do DATA-DOSSIE que levou `sca_high` de 134 a 0:

1. **Chave com major, sempre: `pacote@major`, nunca `pacote`.** O mesmo pacote coexiste em majors
   diferentes na mesma árvore — ali `minimatch` estava em 3.1.2, 5.1.6 e 9.0.5 ao mesmo tempo. Um override
   único (`"minimatch": "^10"`) arrasta o consumidor de v3 para a v10 e quebra em runtime por API removida,
   sem erro de instalação. O correto é `"minimatch@3": "^3.1.2"`, `"minimatch@5": "^5.1.6"` e por aí.
2. **Re-scan depois de CADA install, não só no fim.** O install resolve a árvore de novo e pode puxar um
   **major novo** que o override não cobre: `langsmith` atualizado passou a trazer `protobufjs@8`, enquanto
   o override pinava `protobufjs@7` — cinco advisories high reapareceram depois de o número já ter chegado
   perto de zero. O número medido antes do install não vale depois dele.

> Consequência para o ratchet: `sca_high`/`sca_critical` medem um alvo que se move sozinho. Ver a nota
> sobre rebaseline no Passo 5 antes de gravar 0 no baseline.

## Passo 3 — (B) Secret scanning (gitleaks)

Impedir que credenciais/tokens entrem no histórico. Gerar `.gitleaks.toml` (ou usar default) e plugar no
pre-commit:

```bash
# scripts/hooks/pre-commit  (acrescentar, não substituir o quality gate)
echo "→ Secret scan (gitleaks)..."
if command -v gitleaks >/dev/null 2>&1; then
  gitleaks protect --staged --redact --no-banner
else
  echo "  ⚠ gitleaks não instalado — pulei o secret scan (instale: https://github.com/gitleaks/gitleaks)"
fi
```

- Para repositório inteiro (CI/auditoria): `gitleaks detect --redact --no-banner`.
- Alternativa Python pura: `detect-secrets scan --baseline .secrets.baseline`.
- **Achou segredo?** Tratar como incidente: rotacionar a credencial e reportar via `/incident-report-ia` se
  houver dado sensível envolvido. Remover do histórico (git filter-repo) — não basta apagar no último commit.

## Passo 4 — (C) SBOM (CycloneDX)

Inventário de dependências para rastreabilidade (NORM15). Gerar `scripts/sbom.sh`.

> **`@cyclonedx/cyclonedx-npm` não lê lockfile do pnpm**: ele sai sem gerar nada, e com `2>/dev/null || true` o script
> "passava" sem SBOM algum (medido em projeto pnpm). Para pnpm use o **cdxgen**, que lê o `pnpm-lock.yaml`; e **não
> engula o erro**: SBOM não gerado é falha.

```bash
#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# Node: um SBOM por pacote com lockfile do pnpm (cdxgen) ou do npm (cyclonedx-npm)
for PKG in $(find "$ROOT" -maxdepth 2 \( -name pnpm-lock.yaml -o -name package-lock.json \) -not -path "*/node_modules/*" -exec dirname {} \;); do
  NOME="$(basename "$PKG")"
  if [ -f "$PKG/pnpm-lock.yaml" ]; then
    (cd "$PKG" && npx --yes @cyclonedx/cdxgen -t js -o "$ROOT/sbom-$NOME.json" . >/dev/null 2>&1) || { echo "✗ SBOM de $NOME não gerado" >&2; exit 1; }
  else
    (cd "$PKG" && npx --yes @cyclonedx/cyclonedx-npm --output-file "$ROOT/sbom-$NOME.json") || { echo "✗ SBOM de $NOME não gerado" >&2; exit 1; }
  fi
done
# Python
if command -v cyclonedx-py >/dev/null 2>&1 && [ -f requirements.txt ]; then cyclonedx-py requirements -o sbom-python.json; fi
echo "SBOM gerado (sbom*.json)."
```

Adicionar `sbom*.json` ao versionamento (ou publicar como artefato no CI via `/ci-pipeline`).

## Passo 5 — (Opcional) Integração com o ratchet

Se `scripts/quality-gate.js` existir, oferecer adicionar as métricas **`sca_high`** e **`sca_critical`**
(contagem de vulnerabilidades, `dir: 'desc'` — só podem diminuir). Padrão dos guards: acrescentar uma função
`measureSca()` que lê o `.sca-report.json` (high/critical; `null` = não medido ⇒ `skip`) e somar ao array de `results` e ao bloco de
`--update`. Como é categoria segurança, essa integração é **opcional** (a skill funciona standalone).

Duas regras que só aparecem depois que a dívida chega perto de zero:

- **`measureSca()` lê relatório, não roda audit.** Medir ao vivo amarra o gate ao advisory DB do npm: uma
  CVE publicada de madrugada eleva `sca_high` sem ninguém tocar em código, e todo commit passa a reprovar.
  Rode o audit em step próprio (`sca-scan.sh`) e deixe o gate ler `.sca-report.json`; sem relatório, `skip`.
- **Antes de gravar 0, combine o caminho de volta.** O ratchet usa `min()` para `dir: 'desc'`, então
  `--update` nunca rebaseline **para cima**: com `sca_high: 0`, o primeiro advisory novo reprova toda a
  esteira e a única saída é editar o JSON à mão. Ofereça as três opções ao dono e registre a escolha:
  (a) manter 0 e documentar o procedimento manual; (b) folga em `sca_high` mantendo `sca_critical: 0`;
  (c) uma flag explícita de rebaseline no script. Decidir isso depois do build vermelho é pior.

## Passo 6 — `.gitignore` e verificação

- Garantir que relatórios temporários de audit não sejam commitados; `sbom*.json` é decisão do time.
- Rodar `bash scripts/sca-scan.sh` como dry-run e reportar o resultado.

---

## Saída ao usuário

```
✓ SCA Guard instalado
  scripts/sca-scan.sh   — audit de dependências (high/critical reprova)
  scripts/sbom.sh       — geração de SBOM (CycloneDX)
  secret scan (gitleaks) plugado no pre-commit
Próximos passos:
  • Rodar o primeiro scan:  bash scripts/sca-scan.sh
  • Wire no CI:             /ci-pipeline   (adiciona o job de SCA ao pipeline)
```

## Schema unificado de finding (spec 005)

Ao reportar uma vulnerabilidade de dependência (CVE) de forma acionável, **emita-a também no schema unificado de finding verificado** — o mesmo do `/pentest-dinamico` e do `review-code-ph3a` (gabarito: o `finding-template.md` da skill `/pentest-dinamico`):

- `origem: "sca-guard"`, `status: "hipotese"` (SCA é estático), `cwe` da CVE, `cvss_vetor` quando o aviso fornecer (senão a severidade do advisory).
- **CVSS pelo script**: `python3 scripts/cvss.py --in <findings.json> --write` (nunca à mão).
- Findings em `gemeo/12-AGENTES/seguranca/findings/findings.json` → loop red→blue via `importar_findings.py` + `prioridade.py all`, priorizando as CVEs pelo estado do negócio junto dos demais achados.
- **Alvo sob `examples/` (fixture) ou fora do repositório do corpus**: os findings do alvo **não** vão para o `gemeo/`
  do hospedeiro — gravam-se dentro do alvo (`<ALVO>/reviews/findings.json`, `cvss.py --in` nesse arquivo) e o
  `importar_findings.py`/`prioridade.py all` **não rodam**: eles mexem no corpus e na fila de prioridade de outro
  projeto com dado que não é dele. Teste concreto: se `git -C <ALVO> rev-parse --show-toplevel` é a raiz do repositório
  onde a skill roda **e** o alvo não está sob `examples/`, o alvo é código do próprio negócio (`/sca-guard api/` num
  projeto instalado): use o fluxo normal — `findings.json` em `gemeo/12-AGENTES/seguranca/findings/` e o loop
  `importar_findings.py` + `prioridade.py all`. Subpasta do próprio repositório **não** corta o loop red→blue.

## Notas

- **Standalone** (`requires: []`) — roda em projeto sem quality-gate; a integração com o ratchet é opcional.
- Não enviar conteúdo de dependências/segredos para ferramentas externas — o scan roda **localmente**.
- Pareia com `/ci-pipeline` (rodar o SCA no PR) e `/review-code-ph3a` (código próprio).
- Aceita caminho como argumento (default: diretório atual).
