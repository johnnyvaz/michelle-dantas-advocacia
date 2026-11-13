#!/usr/bin/env python3
"""Leva seções novas do contrato de tarefas para o `tasks/README.md` de cada projeto.

Por que existe: `propagar-tasks.sh` copia o CÓDIGO do sistema de tarefas, mas de propósito
não toca em `tasks/*.md` — aquilo é conteúdo do projeto, e sobrescrever o README apagaria o
que cada equipe acrescentou ao contrato dela. Resultado: uma capacidade nova do parser chega
aos 21 repositórios enquanto a documentação dela fica só aqui, e ninguém usa o que não está
escrito no arquivo que a equipe lê.

Este script insere as seções **sem** reescrever o arquivo: acha a âncora, enfia o texto antes
dela e não mexe em mais nada. Idempotente pelo título de cada seção.

**A prosa não vive aqui.** Cada seção é RECORTADA do `tasks/README.md` deste boilerplate, do
título até o próximo heading de nível igual ou maior. Até 2026-08-26 o texto era uma constante
no script, e ele já havia divergido do README que documenta o mesmo parser — duas fontes para
a mesma regra. Editar o contrato no boilerplate agora basta.

Âncoras, em ordem de preferência — o acervo tem duas gerações de README e cada seção precisa
cair num lugar que faça sentido nas duas. Sem âncora reconhecida, vai para o fim do arquivo:
documentação no lugar imperfeito ainda chega a quem lê, documentação ausente não.

DRY-RUN por padrão: sem `--apply` nada é escrito.

Uso:
  python3 scripts/migrar-contrato.py                    # mostra o que faria em todos
  python3 scripts/migrar-contrato.py --apply            # escreve
  python3 scripts/migrar-contrato.py <dir> [<dir> …]    # só nesses projetos
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

# Fallback comum: primeiro `## ` depois da seção de formato.
POS_FORMATO = ("## Formato de Tarefas", "## A linha de tarefa")

# (título exato no README do boilerplate, âncoras onde inserir no README de destino)
SECOES = (
    ("### Prazo de bloco", ("### Estado\n", "### Prioridades\n")),
    # A spec ativa é um arquivo NOVO da fila: entra antes da seção do human.md, que é o
    # último "arquivo" documentado antes das seções de processo.
    ("## `spec.md` — a spec ativa (GERADO)",
     ("## 🙋 `human.md` — a fila do dono\n", "## `human.md` — a fila do dono\n",
      "## 🙋 `human.md`\n", "## `human.md`\n")),
    # A Solução é subseção do human.md: ancora no que vem DEPOIS dele.
    ("### `**Solução:**` — responder sem sair do arquivo",
     ("## `concluidas.md`\n", "## Prioridade calculada\n", "## Sync com Obsidian\n")),
)


def recorta(readme: str, titulo: str) -> str:
    """A seção `titulo` do README do boilerplate, até o próximo heading de nível <=."""
    linhas = readme.splitlines(keepends=True)
    try:
        ini = next(n for n, l in enumerate(linhas) if l.rstrip("\n") == titulo)
    except StopIteration:
        raise SystemExit(f"ERRO: seção '{titulo}' não existe no tasks/README.md do boilerplate")
    nivel = len(titulo) - len(titulo.lstrip("#"))
    fim = len(linhas)
    dentro_fence = False
    for n in range(ini + 1, len(linhas)):
        if re.match(r"^\s*(```|~~~)", linhas[n]):
            dentro_fence = not dentro_fence
            continue
        if dentro_fence:
            continue
        m = re.match(r"^(#{1,6})\s", linhas[n])
        if m and len(m.group(1)) <= nivel:
            fim = n
            break
    return "".join(linhas[ini:fim]).rstrip("\n") + "\n\n"


def insere(texto: str, secao: str, ancoras: tuple[str, ...]) -> tuple[str, str]:
    """(novo_texto, onde) — nunca falha: sem âncora, a seção vai para o fim do arquivo."""
    for ancora in ancoras:
        if ancora in texto:
            return texto.replace(ancora, secao + ancora, 1), f"antes de {ancora.strip()}"
    for marca in POS_FORMATO:
        i = texto.find(marca)
        if i == -1:
            continue
        j = texto.find("\n## ", i + len(marca))
        if j != -1:
            return texto[:j + 1] + secao + texto[j + 1:], f"antes do `##` seguinte a {marca}"
    return texto.rstrip("\n") + "\n\n" + secao, "fim do arquivo"


def main() -> int:
    aplica = "--apply" in sys.argv
    alvos = [a for a in sys.argv[1:] if not a.startswith("-")]

    boiler = Path(__file__).resolve().parent.parent
    fonte = (boiler / "tasks" / "README.md").read_text(encoding="utf-8")
    secoes = [(t, recorta(fonte, t), a) for t, a in SECOES]

    raiz = boiler.parent
    dirs = ([Path(a).resolve() for a in alvos] if alvos else
            sorted(d for d in raiz.iterdir() if (d / "tasks" / "README.md").is_file()))

    escritos = intactos = 0
    for d in dirs:
        readme = d / "tasks" / "README.md"
        if not readme.is_file():
            print(f"· {d.name} — sem tasks/README.md")
            continue
        if d.resolve() == boiler:
            continue  # a fonte não migra para si mesma
        texto = original = readme.read_text(encoding="utf-8")
        feitas = []
        for titulo, corpo, ancoras in secoes:
            if titulo in texto:
                continue
            texto, onde = insere(texto, corpo, ancoras)
            feitas.append(f"{titulo.lstrip('# ')} ({onde})")
        if texto == original:
            print(f"· {d.name} — já documentado")
            intactos += 1
            continue
        if aplica:
            readme.write_text(texto, encoding="utf-8")
        print(f"{'✓' if aplica else '→'} {d.name}")
        for f in feitas:
            print(f"      + {f}")
        escritos += 1

    print(f"\n{escritos} a escrever · {intactos} já ok")
    if not aplica and escritos:
        print("DRY-RUN — rode com --apply para escrever.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
