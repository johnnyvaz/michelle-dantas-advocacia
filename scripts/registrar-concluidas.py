#!/usr/bin/env python3
"""Registra cada commit como uma entrada de `tasks/concluidas.md`.

POR QUE ISTO EXISTE
-------------------
`concluidas.md` é o que alimenta a aba "Concluídos" do painel de portfólio
(`concluidas.md` → `obsidian-panel.js` → `_estado.json` → `publicar-estado.sh` → painel).
Até 2026-08-31 nenhum script escrevia nesse arquivo: o registro dependia de o agente lembrar
de mover a tarefa ao fechá-la. Sessão que trabalha direto no código — a maioria — commitava e
não deixava rastro nenhum, então o painel mostrava um portfólio parado enquanto os repositórios
andavam. Este script fecha essa lacuna pelo lado mecânico: o que foi commitado aparece.

O QUE ELE NÃO É
---------------
Não substitui a entrada da entrega. Um commit é uma mudança; uma entrega é trabalho fechado com
contexto — causa, arquivo:linha, número medido. Quem fecha tarefa continua movendo o item
inteiro para cá com `✅ AAAA-MM-DD`, acima do registro automático.

CONTRATO DE FORMATO (imposto por dois parsers, não por gosto)
-------------------------------------------------------------
    ## commits › fix: nova chave openai ✅ 2026-08-31

    <!-- registrar-concluidas v1 commit=d6c1336aa091 -->
    `d6c1336aa091` · Marcos Bastos · 2 arquivo(s) em `apps/fusca/stage/`

* `origem = commits` (o texto antes de `›`) é o que permite ao painel separar commit de entrega.
* A data vai NO HEADING: com ela preenchida o `extraiConcluidas` ignora o corpo inteiro, então o
  sentinel e o rodapé são inertes para o painel.
* NENHUM `- [x]`: `prioridade.py:_slugs_concluidos` só lê linhas de checkbox e transformaria cada
  assunto de commit em "identidade fechada", estampando `reincidente` em item homônimo do
  `backlog.md`. `aggregate-tasks.sh` também os contaria.
* Hash de 12 caracteres FIXOS: `--short` varia com o tamanho do repositório, e se a abreviação
  crescer o dedupe deixa de casar e nascem duplicatas.

Uso:
    python3 scripts/registrar-concluidas.py [--dias 3] [--desde <ref|AAAA-MM-DD>]
                                            [--dry-run] [--qualquer-branch] [--tasks tasks]

Sai 0 SEMPRE que não for erro de uso: é chamado de dentro de um hook, e hook não é lugar de
interromper o trabalho.
"""

from __future__ import annotations

import argparse
import fcntl
import os
import re
import subprocess
import sys
import tempfile
from pathlib import Path

VERSAO = "v1"
HASH_LEN = 12

# Autores que não são pessoas nem agentes: pipeline de verdade. Ancorado em `^` e com `\b` no fim
# para casar "GitHub Actions (projetos-ia)" sem casar o nome de alguém.
#
# O filtro é por NOME e não por e-mail: no ARGOCD, `devops@ph3a.com.br` assina os bots E as
# pessoas. E ele é deliberadamente CURTO — medido no ARGOCD em 2026-08-31, sobre 224 commits de
# 120 dias:
#
#   * o filtro de ASSUNTO abaixo pega, sozinho, os 65 bumps de imagem;
#   * ZERO commits de bot de CI real têm assunto livre, ou seja, o filtro de autor não pega nada
#     que o de assunto já não pegue;
#   * `build-and-push.sh` — que parece bot e era a primeira entrada desta lista — é o `user.name`
#     LOCAL do repositório na máquina do dono: assina 0 bumps e **148 commits de trabalho real**
#     (`feat(supabase): habilita SSO Azure`, `fix(appsmith): fixar MongoDB`…). Na lista, ele
#     apagava do painel quase todo o histórico do ARGOCD.
#
# Regra que sai daí: nome de ferramenta local NÃO entra aqui. Bump de imagem se reconhece pelo
# assunto, que é o que a máquina escreve de forma previsível.
AUTOR_IGNORAR = (
    r"(?i)(\[bot\]|dependabot|renovate"
    r"|^(github actions|azure devops|gitlab ci|jenkins|circleci|argo ?cd|flux)\b)"
)

# Assunto de commit gerado por máquina. O primeiro padrão é o bump de imagem do GitOps, o
# terceiro é o formato curto que o pipeline do projetos-ia usa (`chore(projetos-ia): 12-2ae5771`).
ASSUNTO_IGNORAR = (
    r"(?i)(^chore\(.+\): (stage|production|prod|hml) ->"
    r"|\[run \d+\]|\[build \d+\]"
    r"|^chore\(.+\): \d+-[0-9a-f]{7,}$"
    r"|^(fixup|squash)!"
    r"|^Merge (branch|pull request|remote-tracking))"
)

BRANCHES_OK = ("main", "master")

# Marcadores que quebrariam o heading: `❌` publicaria a entrada como rejeitada e uma data solta
# moveria o match do parser para o lugar errado.
LIXO_HEADING = re.compile(r"[✅❌📅🎯🔺🔼🔽🤖]|\d{4}-\d{2}-\d{2}")


def combinar(*padroes: str) -> re.Pattern:
    """Une padrões num alternado, sem quebrar quando um deles traz `(?i)`.

    O Python recusa flag global fora do início da expressão (`global flags not at the start`),
    e era exatamente o que acontecia ao concatenar um padrão do `.concluidas.conf` depois do
    default: o caminho da conf nunca tinha sido exercido, e o script morria com o erro no
    primeiro projeto que ganhou um arquivo de conf. Cada padrão vira grupo próprio e a
    insensibilidade a caixa passa a ser da compilação.
    """
    validos = []
    for bruto in padroes:
        if not bruto or not bruto.strip():
            continue
        limpo = re.sub(r"^\(\?i\)", "", bruto)
        try:
            re.compile(limpo)
        except re.error as e:
            # Padrão torto no `.concluidas.conf` — arquivo escrito à mão — descarta ESSE e segue.
            # Antes, um colchete sem fechar derrubava o registro inteiro do projeto em silêncio
            # (a mensagem saía num `tail -1` de hook que ninguém lê).
            print(f"· concluidas: padrão ignorado por ser inválido — {limpo!r} ({e})")
            continue
        validos.append(limpo)
    if not validos:
        return re.compile(r"(?!x)x")  # não casa nada
    return re.compile("|".join(f"(?:{p})" for p in validos), re.IGNORECASE)


def sair(msg: str = "", code: int = 0):
    if msg:
        print(msg)
    sys.exit(code)


def git(*args, cwd: Path, check=True) -> str:
    r = subprocess.run(("git", *args), cwd=cwd, capture_output=True, text=True)
    if check and r.returncode != 0:
        return ""
    return r.stdout.strip()


# ----------------------------------------------------------------- guards e contexto

def raiz_do_repo() -> Path | None:
    r = subprocess.run(["git", "rev-parse", "--show-toplevel"], capture_output=True, text=True)
    return Path(r.stdout.strip()) if r.returncode == 0 and r.stdout.strip() else None


def operacao_em_curso(git_dir: Path) -> str | None:
    """Rebase/merge/cherry-pick/revert em andamento: escrever agora suja a árvore no meio da
    operação e o git aborta com `you have unstaged changes`."""
    for nome in ("rebase-merge", "rebase-apply", "MERGE_HEAD", "CHERRY_PICK_HEAD",
                 "REVERT_HEAD", "BISECT_LOG"):
        if (git_dir / nome).exists():
            return nome
    return None


def ler_conf(raiz: Path) -> dict:
    """`.concluidas.conf` na raiz do projeto — padrão específico de um repositório mora nele,
    nunca no fonte compartilhado. Formato: `chave = valor`, uma por linha, `#` comenta.

    Chaves: autor_ignorar, assunto_ignorar (acumulam, combinadas com `|`), dias.
    """
    conf: dict[str, list[str] | str] = {}
    p = raiz / ".concluidas.conf"
    if not p.is_file():
        return conf
    for linha in p.read_text(encoding="utf-8").splitlines():
        linha = linha.strip()
        if not linha or linha.startswith("#") or "=" not in linha:
            continue
        chave, valor = (x.strip() for x in linha.split("=", 1))
        if chave in ("autor_ignorar", "assunto_ignorar"):
            conf.setdefault(chave, []).append(valor)  # type: ignore[union-attr]
        elif chave == "dias":
            conf[chave] = valor
    return conf


# ----------------------------------------------------------------- coleta e filtro

def coletar(raiz: Path, desde: str | None, dias: int) -> list[dict]:
    """Um `git log` só, com os paths de cada commit, separado por caracteres de controle —
    assunto de commit pode conter qualquer coisa menos `\\x1e`/`\\x1f`."""
    rng = []
    if desde:
        # Referência (`v1.2.0`, `HEAD~20`) ou data. `rev-parse --verify` distingue os dois.
        if git("rev-parse", "--verify", "-q", f"{desde}^{{commit}}", cwd=raiz):
            rng = [f"{desde}..HEAD"]
        else:
            rng = [f"--since={desde}"]
    else:
        rng = [f"--since={dias}.days.ago"]

    saida = git("log", "--no-merges", *rng,
                "--date=format-local:%Y-%m-%d", "--name-only",
                "--pretty=format:%x1e%H%x1f%cd%x1f%an%x1f%s", cwd=raiz)
    commits = []
    for bruto in saida.split("\x1e"):
        if not bruto.strip():
            continue
        partes = bruto.split("\n")
        campos = partes[0].split("\x1f")
        if len(campos) < 4:
            continue
        sha, data, autor, assunto = campos[0], campos[1], campos[2], campos[3]
        paths = [l for l in partes[1:] if l.strip()]
        commits.append({"sha": sha, "hash": sha[:HASH_LEN], "data": data,
                        "autor": autor, "assunto": assunto, "paths": paths})
    return commits


def descartar(c: dict, re_autor: re.Pattern, re_assunto: re.Pattern) -> str | None:
    if re_autor.search(c["autor"]):
        return "autor de pipeline"
    if re_assunto.search(c["assunto"]):
        return "assunto gerado por máquina"
    # Anti-laço: o commit que carrega o próprio registro não vira registro. Sem isto, registrar
    # gera commit que gera registro.
    if c["paths"] and all(p.startswith("tasks/") for p in c["paths"]):
        return "só mexe em tasks/"
    return None


# ----------------------------------------------------------------- arquivo

def mascarar(linhas: list[str]) -> list[str]:
    """Visão do arquivo com fences E comentários HTML neutralizados.

    O comentário HTML é o que importa aqui: o template de `concluidas.md` traz o exemplo do
    formato (`## backlog.md › Título da tarefa ✅ 2026-01-15`) dentro de `<!-- -->`, e em
    2026-08-31 isso publicava uma entrega fantasma em 19 dos 24 projetos. Inserir "antes do
    primeiro `##`" sem mascarar colocaria o bloco novo DENTRO do comentário — invisível.
    """
    fora = []
    em_fence = False
    em_comentario = False
    for l in linhas:
        if em_comentario:
            fora.append("")
            if "-->" in l:
                em_comentario = False
            continue
        if re.match(r"^\s*(```|~~~)", l):
            em_fence = not em_fence
            fora.append("")
            continue
        if em_fence:
            fora.append("")
            continue
        if "<!--" in l and "-->" not in l:
            em_comentario = True
            fora.append("")
            continue
        fora.append("" if l.lstrip().startswith("<!--") else l)
    return fora


def hashes_registrados(texto: str) -> list[str]:
    """Hashes já citados no arquivo — do sentinel e de qualquer menção em crase.

    A segunda forma cobre o relato manual: o ARGOCD tem "Commit `dce9b97`" escrito à mão numa
    entrega de 2026-08-14. Colher esses também é de propósito — commit já narrado por uma pessoa
    não precisa do registro mecânico em cima.
    """
    achados = set(re.findall(r"commit=([0-9a-f]{7,40})", texto))
    achados |= set(re.findall(r"`([0-9a-f]{7,40})`", texto))
    return [h for h in achados if len(h) >= 7]


def ja_registrado(sha: str, registrados: list[str]) -> bool:
    return any(sha.startswith(h) for h in registrados)


def sanitizar(assunto: str, hash12: str) -> str:
    t = LIXO_HEADING.sub("", assunto)
    t = re.sub(r"[\r\n\t]+", " ", t)
    t = re.sub(r"\s{2,}", " ", t).strip(" -–—·")
    if len(t) > 90:
        t = t[:89].rstrip() + "…"
    return t or f"commit {hash12}"


def bloco(c: dict) -> list[str]:
    dirs = sorted({os.path.dirname(p) or "." for p in c["paths"]})
    onde = f" em `{dirs[0]}/`" if len(dirs) == 1 and dirs[0] != "." else ""
    n = len(c["paths"])
    return [
        f"## commits › {sanitizar(c['assunto'], c['hash'])} ✅ {c['data']}",
        "",
        f"<!-- registrar-concluidas {VERSAO} commit={c['hash']} -->",
        f"`{c['hash']}` · {c['autor']} · {n} arquivo(s){onde}",
        "",
    ]


HEADING_COMMIT = re.compile(r"^## commits › (?P<titulo>.+) ✅ (?P<data>\d{4}-\d{2}-\d{2})\s*$")
SENTINEL = re.compile(r"<!-- registrar-concluidas \S+ commit=(?P<hash>[0-9a-f]{7,40}) -->")


def reconciliar_orfaos(linhas: list[str], commits: list[dict], raiz: Path) -> set[str]:
    """Rebase/amend trocam o hash: atualiza o bloco existente em vez de duplicar a entrada.

    Descoberto em uso, não em teste: neste portfólio o pipeline commita no mesmo repositório em
    que a pessoa trabalha, então `git pull --rebase` é rotina — e cada rebase reescrevia o hash
    de todo commit local já registrado. O bloco antigo ficava apontando para um commit que não
    está mais no histórico, e o registrador criava um segundo bloco com o mesmo assunto: a mesma
    entrega duas vezes na aba Concluídos.

    Casa por (assunto sanitizado, data), que é o que sobrevive ao rebase. Devolve os SHAs já
    reconciliados, para o chamador não registrá-los de novo.
    """
    if not commits:
        return set()
    por_chave = {(sanitizar(c["assunto"], c["hash"]), c["data"]): c for c in commits}
    vivo: dict[str, bool] = {}

    def no_historico(h: str) -> bool:
        if h not in vivo:
            r = subprocess.run(("git", "merge-base", "--is-ancestor", h, "HEAD"),
                               cwd=raiz, capture_output=True, text=True)
            vivo[h] = r.returncode == 0
        return vivo[h]

    reconciliados: set[str] = set()
    for i, linha in enumerate(linhas):
        m = HEADING_COMMIT.match(linha)
        if not m:
            continue
        chave = (m.group("titulo").strip(), m.group("data"))
        novo_commit = por_chave.get(chave)
        if not novo_commit:
            continue
        # o sentinel vive nas linhas imediatamente abaixo do heading
        for j in range(i + 1, min(i + 5, len(linhas))):
            s = SENTINEL.search(linhas[j])
            if not s:
                continue
            antigo = s.group("hash")
            if antigo == novo_commit["hash"] or no_historico(antigo):
                break
            for k in range(i + 1, min(i + 6, len(linhas))):
                linhas[k] = linhas[k].replace(antigo, novo_commit["hash"])
            reconciliados.add(novo_commit["sha"])
            print(f"· concluidas: hash reconciliado após rebase — {antigo} → {novo_commit['hash']}")
            break
    return reconciliados


def ponto_de_insercao(linhas: list[str]) -> int:
    """Índice da primeira entrada real. Append-only, mais recente no topo (tasks/README.md)."""
    for i, l in enumerate(mascarar(linhas)):
        if l.startswith("## "):
            return i
    return len(linhas)


def escrever_atomico(destino: Path, texto: str):
    """Temp no mesmo diretório + replace: o passo 3 do `sync-obsidian.sh` faz rsync deste
    arquivo para o cofre e pode pegá-lo pela metade se a escrita não for atômica."""
    fd, tmp = tempfile.mkstemp(dir=str(destino.parent), prefix=".concluidas-", suffix=".tmp")
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            f.write(texto)
        os.replace(tmp, destino)
    except BaseException:
        Path(tmp).unlink(missing_ok=True)
        raise


# ----------------------------------------------------------------- principal

def main() -> int:
    ap = argparse.ArgumentParser(description="commit → entrada em tasks/concluidas.md")
    ap.add_argument("--dias", type=int, default=None, help="janela (default 3)")
    ap.add_argument("--desde", help="ref git (v1.2.0, HEAD~20) ou data AAAA-MM-DD")
    ap.add_argument("--dry-run", action="store_true", help="mostra e não escreve")
    ap.add_argument("--qualquer-branch", action="store_true",
                    help="registra fora de main/master (cuidado: hotspot de conflito)")
    ap.add_argument("--tasks", default="tasks", help="diretório da fila (default tasks)")
    a = ap.parse_args()

    if os.environ.get("CI"):
        sair()  # o runner do GitOps commita no ARGOCD de dentro do CI
    raiz = raiz_do_repo()
    if not raiz:
        sair()
    git_dir = Path(git("rev-parse", "--absolute-git-dir", cwd=raiz) or (raiz / ".git"))
    if not git("rev-parse", "--verify", "-q", "HEAD", cwd=raiz):
        sair()  # repositório sem commit (APPS-PH3A tem tasks/ e zero commits)
    op = operacao_em_curso(git_dir)
    if op:
        sair()
    branch = git("symbolic-ref", "--short", "-q", "HEAD", cwd=raiz)
    if not branch:
        sair()  # HEAD destacado
    if branch not in BRANCHES_OK and not a.qualquer_branch:
        sair()

    arquivo = raiz / a.tasks / "concluidas.md"
    if not arquivo.is_file():
        sair(f"· {arquivo.relative_to(raiz)} não existe — o instalador da skill cria o arquivo")

    # Lock não-bloqueante: duas sessões no mesmo repositório param no Stop ao mesmo tempo. O
    # segundo runner sai sem escrever; o primeiro pega os mesmos commits.
    trava = open(git_dir / ".concluidas.lock", "w")
    try:
        fcntl.flock(trava, fcntl.LOCK_EX | fcntl.LOCK_NB)
    except OSError:
        sair()

    conf = ler_conf(raiz)
    dias = a.dias if a.dias is not None else int(conf.get("dias", 3))
    re_autor = combinar(AUTOR_IGNORAR, *conf.get("autor_ignorar", []))
    re_assunto = combinar(ASSUNTO_IGNORAR, *conf.get("assunto_ignorar", []))

    texto = arquivo.read_text(encoding="utf-8")
    registrados = hashes_registrados(texto)
    linhas = texto.split("\n")

    novos, descartados, repetidos = [], 0, 0
    for c in coletar(raiz, a.desde, dias):
        if descartar(c, re_autor, re_assunto):
            descartados += 1
            continue
        if ja_registrado(c["sha"], registrados):
            repetidos += 1
            continue
        novos.append(c)

    # Antes de decidir o que é novo: bloco cujo hash saiu do histórico (rebase/amend) é
    # ATUALIZADO, não duplicado.
    reconciliados = reconciliar_orfaos(linhas, novos, raiz) if not a.dry_run else set()
    if reconciliados:
        novos = [c for c in novos if c["sha"] not in reconciliados]
        escrever_atomico(arquivo, "\n".join(linhas))

    if not novos:
        if reconciliados:
            (git_dir / ".concluidas-head").write_text(git("rev-parse", "HEAD", cwd=raiz) + "\n")
            sair(f"· concluidas: {len(reconciliados)} hash(es) reconciliado(s), nada novo")
        sair(f"· concluidas: nada novo ({descartados} de pipeline, {repetidos} já registrado(s))")

    # Mais recente no topo, como o contrato manda. Empate de data mantém a ordem do git log.
    novos.sort(key=lambda c: c["data"], reverse=True)

    if a.dry_run:
        print(f"· concluidas: {len(novos)} a registrar "
              f"({descartados} de pipeline, {repetidos} já registrado(s))")
        for c in novos:
            print(f"    + {c['data']}  {c['hash']}  {sanitizar(c['assunto'], c['hash'])}")
        return 0

    corte = ponto_de_insercao(linhas)
    montado = []
    for c in novos:
        montado += bloco(c)
    novas_linhas = linhas[:corte] + montado + linhas[corte:]
    escrever_atomico(arquivo, "\n".join(novas_linhas))

    (git_dir / ".concluidas-head").write_text(git("rev-parse", "HEAD", cwd=raiz) + "\n")
    print(f"· concluidas: +{len(novos)} commit(s) registrado(s) "
          f"({descartados} de pipeline, {repetidos} já registrado(s))")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except SystemExit:
        raise
    except Exception as e:  # hook não quebra sessão por causa de registro de changelog
        print(f"· concluidas: falhou ({e.__class__.__name__}: {e})")
        sys.exit(0)
