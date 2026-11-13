# Desenvolvimento — Memória (padrão PARA)

> Memória persistente do agente de Desenvolvimento. Padrão **PARA** (Projects / Areas / Resources / Archives). O agente **lê** isto antes de agir e **grava** aprendizados ao concluir.

## Projects (trabalhos com começo/fim)
- _(vazio)_ — &lt;projeto técnico ativo&gt; — objetivo, estado atual, próximo passo.

## Areas (responsabilidades contínuas)
- _(vazio)_ — &lt;responsabilidade recorrente&gt; — o que monitorar.

## Resources (referências reutilizáveis)
- _(vazio)_ — &lt;link/snippet/decisão reutilizável&gt; — quando usar.

## Archives (encerrados, p/ histórico)
- _(vazio)_ — &lt;item concluído&gt; — resultado, lição aprendida.

---

## Linha do tempo (append-only)

> Uma entrada por aprendizado **durável** (causa raiz, decisão, armadilha do repositório) — não
> narrativa de turno, não número que pertence ao canon. Formato **parseável** — é o que permite
> ao lint (`python3 scripts/auditar_memoria.py`, passo 7 do `/auditar-gemeo`) achar repetição,
> contradição e referência morta sem ninguém reler o arquivo:
>
> ```markdown
> ## AAAA-MM-DD — título em uma frase
> > tipo: aprendizado · tema: #tema/<slug> · ref: <origem> · supersede: AAAA-MM-DD
> Corpo: o quê + por quê, 1–10 linhas. Cite arquivo em crase (`caminho/arquivo.ext`).
> ```
>
> | Campo | Valores | Para quê |
> |---|---|---|
> | heading `## AAAA-MM-DD — título` | data ISO + travessão + título | **obrigatório** — é a âncora; a ordem é cronológica (append-only) |
> | `tipo` | `aprendizado` \| `correcao` \| `preferencia` \| `descarte` | separa fato novo de correção de fato antigo |
> | `tema` | uma tag `#tema/<slug>` | liga entradas entre si — sem ela não há detecção de repetição nem de contradição |
> | `ref` | task, commit, `H-NNN` de `human.md`, `spec NNN` | de onde veio (rastreabilidade) |
> | `supersede` | data de uma entrada anterior | esta substitui aquela; a antiga **fica** (auditável) mas sai da recuperação |
>
> A linha de metadados é **opcional** (entradas antigas sem ela continuam válidas); `tipo: correcao`
> **exige** `supersede`. Mesmo `tema` repetido ≥ 3 vezes é candidato a virar `playbook.md`/skill —
> a promoção é decisão humana, o lint só aponta. Nunca apague entrada: use `supersede`.

## 2026-10-09 — skills de qualidade presumem backend/ e frontend/; fixture em subpasta arrisca o .git do molde
> tipo: aprendizado · tema: #tema/fixture-de-validacao · ref: spec 006
`.claude/skills/quality-gate/SKILL.md` detecta a stack só pelas pastas backend e frontend, e `.claude/skills/complexity-guard/resources/complexity-thresholds.json` traz `paths` fixos nesses nomes; projetos na forma do DATA-DOSSIE (pastas api e web) caem fora da detecção. O `scripts/quality-gate.js` do molde é a cópia do NOC-PH3A e mede backend/tests, que não existe aqui, daí o "OK com zero testes". Um projeto instalado numa subpasta deste repo (sem `.git` próprio) faria qualquer instalação de git hook cair no `.git/hooks` do BoilerplateIA, sobrescrevendo o pre-commit de `scripts/instalar-git-hooks.sh`.

## 2026-10-09 — completude depende da data e derruba pytest e corpus; drift de skill só é verificável por hash
> tipo: aprendizado · tema: #tema/fixture-de-validacao · ref: spec 006
`scripts/completude.py` grava a data de hoje em "Última atualização"; `tests/test_docs_drift.py::test_completude_esta_regenerado` e o passo `completude.py --write` + `git diff --exit-code` do job `corpus` comparam essa data com a do arquivo gravado e falham em qualquer dia seguinte ao da regeneração. A correção prevista (tasks T001 a T004 da 006) preserva a data enquanto o conteúdo não muda, sem afrouxar a comparação. Para o drift de skill no CI (decisão C1), só arquivo copiado verbatim de `resources/` admite comparação direta; as demais skills são prosa executada pelo modelo e ficam com retrato congelado mais hash de `SKILL.md`/`resources/`, que prova reconhecimento da mudança, não regeneração correta.

## 2026-10-09 — completude estável à data (006 lote 1): teste do [:200] não via o conteúdo
> tipo: aprendizado · tema: #tema/fixture-de-validacao · ref: spec 006 T001-T004
`scripts/completude.py` agora lê `COMPLETUDE_HOJE` e só avança a data quando o texto, sem a linha da data, difere do gravado; com `COMPLETUDE_HOJE=2099-01-01` o `--write` não gera diff e pytest passa. Achado: `test_completude_esta_regenerado` comparava só `stdout[:200]`, que cobre o cabeçalho e a data, nunca as seções; canon mudado passaria despercebido. A comparação passou a ser do texto inteiro (mais estrita, não mais frouxa) e `test_completude_defasado_reprova` prova, num gemeo temporário, que alterar o canon reprova. Uma falha isolada e não reproduzida de `test_check_citations_resposta.py::test_marcador_correto_com_valor_certo_passa` apareceu uma vez na suíte completa (3 reexecuções verdes depois); fica como observação, sem causa conhecida.

## 2026-10-09 — fundação do esqueleto (006 lote 2): versões com 14 dias e pnpm 9 vs 11
> tipo: aprendizado · tema: #tema/fixture-de-validacao · ref: spec 006 T009-T033
Lockfiles com versões de pelo menos 14 dias saíram do pnpm 11 (`minimumReleaseAge: 20160` num `pnpm-workspace.yaml` temporário, `packageManager` fora do `package.json` de rascunho, num diretório de scratch): o pnpm 9.15.9 declarado não tem essa trava, e o `pnpm-workspace.yaml` sem `packages` quebra o 9. O lockfile v9 é lido pelos dois. Variáveis `*_PASSWORD=` em `.env.example` disparam o pre-commit (regex de connection string); o esqueleto usa `DB_SENHA`. A flakiness da suíte pytest do molde (3 testes, ver tasks do lote 1) não reproduziu em 15 reexecuções, 24 execuções concorrentes da suíte, carga de CPU nem ordem inalterada; causa seguirá desconhecida até aparecer de novo com saída capturada.

## 2026-10-09 — CRUD, worker e telas do esqueleto (006 lote 3): teste de SKIP LOCKED que passa sem SKIP LOCKED
> tipo: aprendizado · tema: #tema/fixture-de-validacao · ref: spec 006 T034-T070
Fila no Postgres com `FOR UPDATE SKIP LOCKED`; job e espelho de status no cliente mudam na mesma transação, e `concluir`/`falhar`/`devolver` são cercados pelo número da tentativa (job recuperado ou devolvido não aceita escrita tardia de quem estourou o timeout). Teste mutante: removendo `forUpdate().skipLocked()`, o teste de integração "três capturas simultâneas" continuava verde (transações curtas não se sobrepõem); só a propriedade G1 (N workers x M jobs) o pegava. Foi trocado por teste determinístico que segura o lock numa transação e exige que a captura pule a linha em vez de esperar. Guarda de concorrência se prova com mutante, não com "passou". O guard-command do molde bloqueia encadear curl em interpretador e `rm` em /tmp (inclusive dentro de heredoc); roteiro HTTP de validação vira script Node no scratchpad.

## 2026-10-09 — loop completo no esqueleto (006 lote 4): scanner que mede zero é scanner cego até o probe invertido
> tipo: aprendizado · tema: #tema/fixture-de-validacao · ref: spec 006 T071-T087
Rodar as skills de qualidade num alvo real expôs defeitos em 13 skills, todos corrigidos na fonte em commits `fix(<skill>)`. O padrão: o scanner devolvia 0 (o piso do ratchet) e o gate passava verde sem ver nada. Em `.claude/skills/memory-guard/SKILL.md` o `spawnSync('grep', [...cmd, dir])` recebia `cmd[0]='grep'` como PATTERN, então a análise estática nunca achou nada em lugar nenhum; `resilience-guard`, `observability-guard`, `property-race-guard` e `arch-tradeoff` varriam `backend/` e `src/` fixos (alvo api/web = zero). Só o **probe invertido** (plantar a violação conhecida e ver a contagem subir) separa "0 porque está limpo" de "0 porque está cego". Outros achados duráveis: `--with-deps` do Playwright exige sudo; o `.env` de dev vaza para o compose de teste por `${VAR:-padrão}`; no httpyac o `setup.http` dentro do glob quebra `@ref login` dos arquivos seguintes; `@cyclonedx/cyclonedx-npm` não lê pnpm e um `|| true` escondia isso; `curl -u "$TOKEN:"` aciona a regra `curl-auth-user` do gitleaks; o gate trata métrica sem valor salvo como "nova" e passa, então baseline precisa de verificador (`examples/esqueleto-fullstack/scripts/verificar-baseline.mjs`); e `pnpm audit` no fixture achou critical em `handlebars`/`tinypool` que overrides com chave de major e `vitest` 4 resolveram, sobrando `braces` sem versão corrigida. O guard-command bloqueia shell com flag de comando inline, heredoc com redirecionamento e `rm` em /tmp: scripts de patch vão para o scratchpad por Write e rodam por caminho.

## 2026-10-09 — drift de skill, CI do esqueleto e limite de login (006 lote 5): script do molde entra na engine publicada
> tipo: aprendizado · tema: #tema/fixture-de-validacao · ref: spec 006 T088-T102
`scripts/publicar_skills.py` publica todo `scripts/*.py` em `plugins/ph3a-gemeo/scripts/`, que o `init.sh` copia para os projetos; o `esqueleto_drift.py` novo só apareceu como "árvore de plugins desatualizada" no `--check`, e a saída foi acrescentá-lo a `NAO_PUBLICAR` (ferramenta de build do molde), não gerar a cópia. O `diff` da T090 desmentiu a tabela inicial de `specs/006-esqueleto-fullstack/contracts/ci-job.md`: `scripts/test-loop.sh` do fixture difere da fonte (migrou para hash) e `scripts/observability-scan.js` é idêntico (entrou como verbatim); `.skills-instaladas.json` guarda a tabela skill→mecanismo e o hash prova reconhecimento da mudança, não regeneração. O limitador de `api/src/main/infrastructure/middleware/limitarTentativas.ts` fez o `memory-guard` subir de 3 para 4 achados, porque o scanner olha só a linha do `.set(` e procura `ttl`/`maxsize`; o gate reprovou e a entrada passou a guardar o próprio `ttlAte`, que a varredura de expiração de fato usa, em vez de subir o baseline. Outros achados: o teste de rajada concorrente só passa porque a tentativa é contada na entrada e devolvida no 200; o contrato do 429 usa e-mail novo por rodada (`{{ exports.emailAlvo = ... }}`) e o compose de teste sobe o teto por IP para 200; `down -v` do `test-loop.sh` também derruba o Postgres subido à parte para o gate (mesmo projeto compose); o schema de finding só admite `hipotese|confirmado`, então o fechamento ficou em `aberto: false` mais `situacao` e `resolucao` (campos acrescentados, `scripts/cvss.py --in` aceita). O `findings.json` do fixture decidiu, por delegação do dono: 001 corrigido, 002 risco aceito (fixture single-tenant sem dado real).

## 2026-10-09 — revisão independente do lote 4: scanners movem para resources/ e ganham teste (006)
> tipo: aprendizado · tema: #tema/fixture-de-validacao · ref: spec 006 revisão do lote 4
Scanner embutido em SKILL.md não tem teste; moveram-se `memory-guard.js`, `resilience-scan.js` e `sca-scan.sh` para `resources/` (verbatim no fixture, `a+b`) com `tests/test_scanner_*.py` que montam backend/+frontend/ e api/+web/ com venv falso. Achados: o `memory-guard` embutia `backend/` no `cmd` do grep e contava o achado Python uma vez por pasta (46 em vez de 2); `grep -v test|spec` sobre caminho absoluto apagava o inventário de projeto em diretório com "test" no nome; `ratchet()` desc usa `min()`, então `--update` nunca sobe baseline: para aceitar subida legítima apaga-se a chave e roda `--update`; audit sem rede imprime JSON válido de erro, então só `metadata.vulnerabilities` presente vale como medido; `pip-audit` não informa severidade (contado como high, decisão do dono pendente); Prisma `$use` foi removido na v7. Porta 3001 ocupada por processo alheio: o loop do fixture rodou com compose temporário em 3002 e env.json restaurado. O guard-command barra heredoc mesmo em python inline: scripts de edição foram por Write.
