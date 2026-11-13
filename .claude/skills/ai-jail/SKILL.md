---
name: ai-jail
description: Isola a execução de agentes de IA (Claude Code, Codex, OpenCode, Crush) num sandbox de kernel com bubblewrap + Landlock + seccomp, usando o CLI ai-jail. Diagnostica o ambiente (bwrap, AppArmor userns do Ubuntu 24.04, ABI do Landlock), monta a linha de comando correta e gera/revisa o arquivo .ai-jail do projeto com máscaras de segredos (--mask/--deny-path) e mounts extras (--map/--rw-map/--overlay-map). Complementa o guard-command (que bloqueia comandos, não acessos) e o .devcontainer (que não restringe filesystem nem rede). Use quando o usuário quiser rodar um agente sandboxado, isolar o agente do resto da máquina, esconder segredos do agente, entender o modo lockdown/private-home, ou diagnosticar por que o bwrap falha. Invoque com /ai-jail [caminho].
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
---

# Skill: AI Jail — sandbox de kernel para agentes de IA (PH3A)

Referência: **`ai-jail` v1.14.0** (`https://github.com/akitaonrails/ai-jail`) · NORM11
(desenvolvimento seguro) · NORM04 (trilhas) · PROC09

Esta skill adiciona a camada que ainda **não existe** no esqueleto PH3A: isolamento a nível de
kernel (namespaces + bind mounts + Landlock LSM + seccomp-bpf) em volta do processo do agente. Ela
**não substitui** nada do que já está no repo — compõe:

| Camada existente | O que faz | O que **não** faz |
|---|---|---|
| `scripts/hooks/guard-command/index.js` + `pretooluse_bash_guard.py` | Barra **comandos** por denylist antes do `Bash` | Não restringe acesso a arquivo/rede. É **fail-open** se o guard quebrar |
| `.devcontainer/` | Container + usuário não-root | Sem firewall, sem `--cap-drop`, sem `--read-only` |
| **`ai-jail`** (esta skill) | `$HOME` em tmpfs, projeto como único diretório persistente, Landlock, seccomp, rlimits | Não lê intenção — a política é o que você escreveu no `.ai-jail` |

`docs/seguranca-agentes/README.md` já reconhece o limite da camada de hooks: *"Hooks e regex são
guardrails úteis, **não** fronteira de segurança perfeita."* O ai-jail é a fronteira que faltava.

---

## Regra de ouro (limites inegociáveis)

- **Esta skill nunca executa o agente.** Ela diagnostica, escreve/revisa o `.ai-jail` e **imprime**
  o comando para o usuário colar no terminal dele. Lançar um agente interativo de dentro desta
  sessão é ação **Tipo 1** (irreversível/externa) — segue a allowlist
  (`gemeo/12-AGENTES/_FRAMEWORK/allowlist.md`): **propõe em `tasks/human.md` e para**.
- **`--dry-run` antes de todo run novo.** É a única forma de ver a lista de mounts resolvida sem
  executar nada. Combine com `--verbose`.
- **Nunca afrouxar a política sem declarar o custo.** Cada exceção tem uma frase obrigatória:
  `--mask-except`/`--deny-path-except` reexpõem o que foi protegido · `--no-hide-config` deixa o
  agente ler a própria política e contorná-la · `--systemd-user` permite iniciar serviços **fora**
  do sandbox · `--ssh` entrega `~/.ssh` e o `SSH_AUTH_SOCK`.
- **Nunca inventar flag.** O que não estiver em [resources/referencia-ai-jail.md](resources/referencia-ai-jail.md)
  se confere com `ai-jail --help`. Grafia errada de flag falha silenciosamente (ver Passo 3).

---

## Passo 1 — Diagnosticar o ambiente

```bash
bash scripts/ai-jail-doctor.sh
```

Exit `0` pronto · `2` degradado (funciona, com camadas a menos) · `1` bloqueado.

| Sintoma | Causa | Correção |
|---|---|---|
| `bwrap: setting up uid map: Permission denied` | AppArmor do **Ubuntu 24.04+/Debian 13+** nega user namespace não-privilegiado | `echo 'kernel.apparmor_restrict_unprivileged_userns=0' \| sudo tee /etc/sysctl.d/60-userns.conf && sudo sysctl --system` — ou um perfil `unconfined` só para `/usr/bin/bwrap` |
| `bwrap (bubblewrap) not found in trusted locations` | O ai-jail **não** procura no `$PATH` | Instalar (`apt install bubblewrap`) ou exportar `BWRAP_BIN=/caminho/absoluto/bwrap` |
| `Landlock V4 required for ...` | `--allow-tcp-port` exige kernel ≥ 6.5 | Remover as portas ou atualizar o kernel |
| Aviso de Landlock ausente | Kernel < 5.13 | Segue funcionando por bwrap+seccomp; declare a camada perdida |
| `Failed to parse .ai-jail` | Config inválida — **fail-closed** desde a v1.14.0 | Revisar o arquivo; em último caso `ai-jail --clean --init` |

Afeta qualquer ferramenta com userns rootless (Podman rootless, Distrobox, Flatpak) — não só o ai-jail.

---

## Passo 2 — Instalar se faltar

Sempre `command -v ai-jail` primeiro. **Não assumir caminho** — cada método instala em lugar
diferente (`/usr/bin`, `/usr/local/bin`, `~/.local/bin`, shims do mise, prefix do brew).

```bash
cargo install ai-jail                                     # crates.io
brew tap akitaonrails/tap && brew install ai-jail         # Homebrew
yay -S ai-jail-bin                                        # AUR (binário)
mise use -g github:akitaonrails/ai-jail                   # mise
```

Do source, ou quando o usuário já tem o repo clonado:

```bash
cargo build --release && cp target/release/ai-jail ~/.local/bin/
ai-jail --version    # deve imprimir: ai-jail 1.14.0
```

Em Nix e Homebrew o `bwrap` pode cair fora dos três caminhos confiáveis
(`/usr/bin/bwrap`, `/bin/bwrap`, `/usr/local/bin/bwrap`) — nesse caso exporte `BWRAP_BIN` com
caminho **absoluto de arquivo existente**.

---

## Passo 3 — Montar a invocação

> ⚠️ **Toda flag do ai-jail vem ANTES do comando.** O primeiro argumento posicional faz o parser
> consumir *todo* o resto do argv como argumentos do comando. Não há erro, não há aviso.

```bash
ai-jail --no-gpu --lockdown claude          # CORRETO
ai-jail claude --no-gpu                     # ERRADO E SILENCIOSO — --no-gpu vai para o claude
ai-jail --dry-run -- claude --model opus    # flags do agente depois de --
```

Antes de rodar:

1. **`cd` na raiz do projeto.** O `.ai-jail` é resolvido **relativo ao cwd**, e o cwd é o diretório
   read-write persistente. Rodar de um subdiretório lê outro `.ai-jail` e monta outro projeto.
2. `ai-jail status` — mostra a política efetiva (global + `[commands.*]` + projeto).
3. `ai-jail --dry-run --verbose <comando>` — confere os mounts resolvidos.

---

## Passo 4 — Escolher o perfil

| Perfil | Projeto | `$HOME` | Rede | Quando usar |
|---|---|---|---|---|
| **default** (nenhuma flag) | read-write | tmpfs + dotdirs de ferramenta reaplicados por cima | aberta | **É o modo correto para agentes de IA.** O agente mantém login e config |
| `--private-home` | read-write | tmpfs **sem** layering de dotdirs | aberta | Comandos que não precisam de credencial |
| `--lockdown` | **read-only** | tmpfs puro | `--unshare-net` | Código hostil, auditoria, análise de terceiros |
| `--browser[=hard\|soft]` | read-only | privado | aberta | Navegador isolado, não agente |

Pontos que sempre pegam:

- **`--private-home` inicia o agente sem credenciais** — ele aparece deslogado. É o modo funcionando
  como documentado, não bug. Para deixá-lo usável, conceda o state pelo global:

  ```toml
  # ~/.ai-jail
  [commands.claude]
  private_home = true
  rw_maps = ["~/.claude", "~/.claude.json"]
  ```

- **`--lockdown` ignora `--map` e `--rw-map`** e desliga GPU, Docker, display e mise. E **não
  persiste sozinho** no `.ai-jail` — use `ai-jail --init --lockdown` se quiser gravá-lo.
- **O perfil de browser força `lockdown = false`.** `ai-jail --lockdown chromium` **perde** o
  lockdown, silenciosamente. Também zera Docker, SSH, worktree, mise e status bar.

---

## Passo 5 — Gerar/revisar o `.ai-jail`

> ⚠️ **Só o diretório do projeto persiste.** `$HOME`, `/tmp`, diretórios pai e irmãos são tmpfs e
> são apagados na saída. O agente **não percebe** — de dentro, o filesystem parece gravável. Se ele
> criar um scaffold irmão, clonar no home ou escrever em `~/.cache`, aquilo desaparece. Exponha o
> caminho com `--rw-map ~/caminho` ou traga o resultado para dentro do projeto.

`ai-jail --init [flags]` grava o arquivo e sai. Por default o ai-jail também salva a config
automaticamente ao rodar (`--no-save-config` desliga).

**Esconder segredos** — dois verbos distintos:

| Flag | Efeito dentro do sandbox |
|---|---|
| `--mask <PATH\|GLOB>` | O path existe, mas vazio (arquivo vazio; tmpfs vazio se diretório) |
| `--deny-path <PATH\|GLOB>` | Ler, listar e escrever falham com permission denied (placeholder modo 000) |

```bash
ai-jail --init --mask '.env' --mask '**/*.env' --deny-path 'secrets/*.json' claude
```

- **Quote os globs** — senão o shell os expande antes. Suporta `*`, `?`, `[a-z]` e `**`.
- Globs casam **apenas o que já existe**; padrão sem match gera aviso e é ignorado.
- Paths relativos resolvem contra o diretório do projeto.
- `--mask-except` / `--deny-path-except` são aplicadas depois da expansão. **Não existe sintaxe `!`**
  — `!segredo.key` é lido como um path literal chamado `!segredo.key`.

**Mounts extras:**

- `--map <PATH>` (ro) e `--rw-map <PATH>` (rw) aceitam `SOURCE:DEST` — o **primeiro** `:` separa;
  os demais pertencem ao destino. Ambos os lados expandem `~`.
- `--map .git` funciona: mounts cujo destino cai **dentro** do projeto são emitidos depois do bind do
  projeto, e o bwrap dá precedência ao mount posterior.
- `--overlay-map <PATH>` é copy-on-write: as escritas vão para
  `<projeto>/.ai-jail-overlays/<path>/upper/`, e esse `upper/` é o diff exato para promover
  seletivamente. Só Linux/bwrap (OverlayFS não-privilegiado, kernel ≥ 5.11); **não aceita
  `SOURCE:DEST`**; desabilitado em lockdown e browser. O diretório de storage é mascarado dentro do
  sandbox, e um `.gitignore` com `*` é criado nele.

**Claude Code com config separada:**

`--claude-dir <PATH>` define `CLAUDE_CONFIG_DIR` dentro do sandbox — o análogo do
`CLAUDE_CONFIG_DIR=/home/node/.claude` que o `.devcontainer/` deste repo já usa. Serve para separar
a config sandboxada da do host:

```bash
ai-jail --claude-dir ~/.claude-jail claude
```

**O `.ai-jail` é escondido do agente de propósito.** `hide_config` é on por default: quem está
dentro do sandbox não vê a política que o governa, justamente para não contorná-la. Esta skill
escreve o arquivo **de fora**, o que é o fluxo correto. Não "conserte" isso com `--no-hide-config`.
O `~/.ai-jail` global nunca é montado dentro do sandbox.

Formato do arquivo, campos, defaults e exemplos completos:
[resources/referencia-ai-jail.md](resources/referencia-ai-jail.md).

---

## Riscos abertos por padrão (declarar sempre ao usuário)

- **Socket do Docker é passthrough read-write** quando `/var/run/docker.sock` existe — acesso ao
  daemon do host é, na prática, **root no host**. Desligue com `--no-docker` a menos que o agente
  precise.
- **Fora de lockdown a rede é totalmente aberta.** Não existe restrição de rede no modo default —
  não venda isolamento de rede que não está lá.
- **Variáveis de ambiente são herdadas.** Tokens exportados no seu shell ficam visíveis dentro do
  jail.
- **`/etc/machine-id` e `/var/lib/dbus/machine-id` não são mascarados** — são fingerprint estável do
  host. Opt-in: `--mask /etc/machine-id --mask /var/lib/dbus/machine-id`.
- **Passthrough de display** monta o `XDG_RUNTIME_DIR` no Linux, o que pode expor sockets IPC do
  host. `--no-display` fecha.
- **`--systemd-user`** deixa o agente pedir ao user manager do host para iniciar serviços **fora**
  do sandbox. Off por default; mantenha assim.

---

## Saída ao usuário

```
✓ ai-jail 1.14.0 · bwrap /usr/bin/bwrap · Landlock V4 · seccomp
✓ Perfil: default (projeto rw, $HOME em tmpfs, rede aberta)
✓ .ai-jail gravado: mask=[.env, **/*.env] deny=[secrets/*.json] docker=off

  Rode no seu terminal:
      cd /caminho/do/projeto && ai-jail claude

  Próximos passos:
  • ai-jail --dry-run --verbose claude   → conferir os mounts antes
  • ai-jail status                       → ver a política efetiva
  • Só o diretório do projeto persiste — o resto é tmpfs
```

Quando alguma camada estiver ausente, troque `✓` por `⚠` e diga o que se perdeu.

---

## Notas

- **Standalone** — não requer `quality-gate` nem nenhum outro artefato.
- Pareia com `/review-code-ph3a` (código próprio), `/sca-guard` (dependências e segredos) e
  `/prompt-audit` (o que sai no prompt). O ai-jail cobre o que o **processo** alcança.
- Aceita `[caminho]` como argumento; default `.`.
- **Linux e WSL2**: suporte pleno. Windows nativo não é suportado e não será — use WSL2. No WSL2,
  `/mnt/c/` é bem mais lento que o filesystem nativo; para projetos grandes, clone em `~/Projects/`.
- **macOS**: backend `sandbox-exec`/seatbelt. Sem tmpfs (`--private-home` usa deny-rules),
  `--overlay-map` degrada para read-only, sem Landlock e sem seccomp, e `SOURCE:DEST` é **erro
  fatal**.
- O ai-jail segue "avisa e continua" para paths ausentes, mas é **fail-closed** para `.ai-jail`
  ilegível ou inválido — descartar política silenciosamente seria fail-open.

## Arquivos de referência

- [resources/referencia-ai-jail.md](resources/referencia-ai-jail.md) — todas as flags, todos os
  campos do TOML, erros fatais, requisitos de kernel e a lista do que **não** afirmar.
- [scripts/ai-jail-doctor.sh](scripts/ai-jail-doctor.sh) — diagnóstico determinístico do ambiente.
