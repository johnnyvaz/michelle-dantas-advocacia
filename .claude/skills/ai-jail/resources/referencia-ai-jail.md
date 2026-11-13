# Referência — `ai-jail` v1.14.0

Conferida contra o **código-fonte** (`src/cli.rs`, `src/config.rs`, `src/main.rs`,
`src/sandbox/`), não contra a prosa do README — o README tem drift confirmado em três pontos
(anotados adiante). Ao usar em outra versão, reconfira com `ai-jail --help`.

---

## 1. Uso e positionals

```
ai-jail [OPTIONS] [--] [COMMAND [ARGS...]]
```

- Comandos conhecidos citados pelo help: `gemini`, `claude`, `codex`, `opencode`, `crush`,
  `soulforge`, `grok`, `pi`, `bash`. Qualquer outra string é repassada como comando.
- `status` é o **único** positional com tratamento especial: mostra a config efetiva e sai.
- Sem comando e sem `.ai-jail`, cai em `bash`.
- **Toda flag do ai-jail precisa vir antes do comando** — o primeiro posicional consome o resto do
  argv. Use `--` para separar as flags do agente.

## 2. Opções com valor (repetíveis)

| Flag | Valor | Efeito |
|---|---|---|
| `--rw-map <PATH\|SOURCE:DEST>` | path | Mount read-write, opcionalmente em DEST |
| `--map <PATH\|SOURCE:DEST>` | path | Mount read-only, opcionalmente em DEST |
| `--overlay-map <PATH>` | path | Copy-on-write. **Não aceita `SOURCE:DEST`.** Linux/bwrap only |
| `--hide-dotdir <NAME>` | não-vazio | Nunca montar o dotdir NAME. Ponto inicial opcional |
| `--mask <PATH\|GLOB>` | não-vazio | Substitui por arquivo vazio / tmpfs vazio |
| `--deny-path <PATH\|GLOB>` | não-vazio | Nega acesso com permission denied |
| `--mask-except <PATH\|GLOB>` | não-vazio | Não mascarar os matches. **Sem sintaxe `!`** |
| `--deny-path-except <PATH\|GLOB>` | não-vazio | Não negar os matches. **Sem sintaxe `!`** |
| `--allow-tcp-port <PORT>` | `u16` | Libera TCP outbound em lockdown. Exige kernel ≥ 6.5 |
| `--claude-dir <PATH>` | path | Config dir do Claude (define `CLAUDE_CONFIG_DIR`) |

## 3. Pares booleanos (sem valor, **last-wins**)

```
--private-home / --no-private-home      --gpu / --no-gpu
--lockdown / --no-lockdown              --docker / --no-docker
--landlock / --no-landlock              --tailscale / --no-tailscale
--seccomp / --no-seccomp                --display / --no-display
--rlimits / --no-rlimits                --worktree / --no-worktree
--systemd-user / --no-systemd-user      --mise / --no-mise
--save-config / --no-save-config        --ssh / --no-ssh
--hide-config / --no-hide-config        --pictures / --no-pictures
```

Defaults declarados no help: landlock **on**, seccomp **on**, rlimits **on**, hide-config **on**,
systemd-user **off**, tailscale **off**, ssh **off**, pictures **off**. GPU, Docker, display,
worktree e mise são **auto-detectados**.

## 4. Valor opcional — o `=` é obrigatório

| Flag | Valores | Default sem valor |
|---|---|---|
| `--browser[=PROFILE]` | `hard`, `soft` | `hard` |
| `-s`, `--status-bar[=STYLE]` | `dark`, `light`, `pastel` | `pastel` |
| `--no-browser` | — | desliga a auto-detecção |
| `--no-status-bar` | — | desliga a barra |

`--browser soft` **não** funciona: seria lido como `--browser` (hard) + comando `soft`. Valor
inválido é erro fatal (`invalid browser profile: maybe (expected 'hard' or 'soft')`).

No **arquivo** de config, `browser_profile` aceita mais apelidos: `hard|isolated|ephemeral`,
`soft|persistent|survivable`, `off|none|disabled`. A CLI só aceita `hard`/`soft`.

## 5. Flags simples

| Flag | Efeito |
|---|---|
| `--exec` | Execução direta: sem PTY proxy, sem status bar, modo quiet |
| `--clean` | Ignora o `.ai-jail` **do projeto**. **Não** ignora o `~/.ai-jail` global |
| `--dry-run` | Imprime o comando do sandbox sem executar |
| `--init` | Cria/atualiza o `.ai-jail` e sai |
| `--bootstrap` | Gera configs de permissão para as ferramentas de IA e sai |
| `-v`, `--verbose` | Detalha os mounts |
| `-h`, `--help` / `-V`, `--version` | Help / versão (`ai-jail 1.14.0`) |

---

## 6. Arquivo `.ai-jail` (TOML)

| Escopo | Caminho | Observação |
|---|---|---|
| Projeto | `./.ai-jail` | **Relativo ao cwd**, não à raiz do repo git |
| Global | `$HOME/.ai-jail` | Nunca montado dentro do sandbox |

Ordem de merge: **global base → `[commands.<nome>]` correspondente → config do projeto → flags da
CLI**. Vetores fazem append com dedup; escalares do projeto sobrescrevem os do global. Valores
herdados do global são usados em runtime mas **não** copiados para o `.ai-jail` do projeto.

Todos os campos usam `#[serde(default)]`; campos desconhecidos são ignorados em silêncio
(invariante de compatibilidade retroativa). **Não existe nenhum `serde(alias)` hoje.**

| Campo | Tipo | Default | Flag |
|---|---|---|---|
| `command` | `Vec<String>` | `[]` (fallback runtime `bash`) | positional |
| `rw_maps` | `Vec<PathBuf>` | `[]` | `--rw-map` |
| `ro_maps` | `Vec<PathBuf>` | `[]` | `--map` |
| `overlay_maps` | `Vec<PathBuf>` | `[]` | `--overlay-map` |
| `hide_dotdirs` | `Vec<String>` | `[]` | `--hide-dotdir` |
| `mask` | `Vec<PathBuf>` | `[]` | `--mask` |
| `deny_paths` | `Vec<PathBuf>` | `[]` | `--deny-path` |
| `mask_exceptions` | `Vec<PathBuf>` | `[]` | `--mask-except` |
| `deny_path_exceptions` | `Vec<PathBuf>` | `[]` | `--deny-path-except` |
| `no_gpu` | `Option<bool>` | auto | `--no-gpu` / `--gpu` |
| `no_docker` | `Option<bool>` | auto | `--no-docker` / `--docker` |
| `tailscale` | `Option<bool>` | off | `--tailscale` |
| `no_display` | `Option<bool>` | auto | `--no-display` |
| `no_worktree` | `Option<bool>` | auto | `--no-worktree` |
| `no_mise` | `Option<bool>` | auto | `--no-mise` |
| `no_save_config` | `Option<bool>` | salvar ativo | `--no-save-config` |
| `no_hide_config` | `Option<bool>` | esconder ativo | `--no-hide-config` |
| `ssh` | `Option<bool>` | off | `--ssh` |
| `pictures` | `Option<bool>` | off | `--pictures` |
| `browser_profile` | `Option<String>` | auto | `--browser[=…]` / `--no-browser` |
| `private_home` | `Option<bool>` | off | `--private-home` |
| `lockdown` | `Option<bool>` | off | `--lockdown` |
| `no_landlock` | `Option<bool>` | on | `--no-landlock` |
| `no_seccomp` | `Option<bool>` | on | `--no-seccomp` |
| `no_rlimits` | `Option<bool>` | on | `--no-rlimits` |
| `systemd_user` | `Option<bool>` | off | `--systemd-user` |
| `allow_tcp_ports` | `Vec<u16>` | `[]` | `--allow-tcp-port` |
| `claude_dir` | `Option<PathBuf>` | — | `--claude-dir` |
| `no_status_bar` | `Option<bool>` | barra ativa | `--no-status-bar` — **só global** |
| `status_bar_style` | `Option<String>` | `pastel` | `-s=…` — **só global** |
| `resize_redraw_key` | `Option<String>` | `codex` → `ctrl-shift-l` | (sem flag) — **só global** |

Semântica tri-state: para os `no_*`, ausente significa **ativo** (`no_x != Some(true)`); para os
opt-in (`ssh`, `pictures`, `tailscale`, `systemd_user`, `private_home`, `lockdown`), ausente
significa **desligado** (`x == Some(true)`).

Os três campos "só global" são **removidos** ao gravar o `.ai-jail` do projeto. O `.ai-jail` de
projeto é sempre flat — `[commands.*]` só existe no global.

Ao salvar, paths sob `$HOME` são recolapsados para `~/...`. A escrita é atômica e recusa gravar se o
destino não for arquivo regular (proteção contra symlink). Header gravado:

```
# ai-jail sandbox configuration
# https://github.com/akitaonrails/ai-jail
# Edit freely. Regenerate with: ai-jail --clean --init
```

### `.ai-jail` de projeto — exemplo

```toml
command = ["claude"]

rw_maps = ["~/Projects/shared-lib", "data:vendor/data"]
ro_maps = ["/opt/datasets", ".git"]
overlay_maps = ["~/.claude"]

mask = [".env", ".env.local", "**/*.env", "/etc/machine-id"]
deny_paths = ["secrets/*.json", "**/*.key"]
mask_exceptions = ["**/target/**"]

hide_dotdirs = [".my_secrets"]

no_docker = true
no_gpu = true
ssh = false
pictures = false

private_home = false
lockdown = false
allow_tcp_ports = [8080]

claude_dir = "~/.claude-jail"
```

### `~/.ai-jail` global — exemplo

```toml
no_status_bar = false
status_bar_style = "pastel"      # dark | light | pastel
resize_redraw_key = "ctrl-l"     # ctrl-l | ctrl-shift-l | disabled

rw_maps = ["~/common"]

[commands.claude]
private_home = true
rw_maps = ["~/.claude", "~/.claude.json"]

[commands.pi]
rw_maps = ["~/.pi", "~/.pi-lens"]
tailscale = true
```

---

## 7. Dotdirs no modo default

**Nunca montados** (7):

```
.gnupg  .aws  .ssh  .mozilla  .thunderbird  .basilisk-dev  .sparrow
```

**Montados read-write** (31 — o README do ai-jail lista só 16; **o código é autoritativo**):

```
.gemini .claude .crush .codex .aider .kiro .soulforge .grok .agents .omp .pi .pi-lens
.config .cargo .cache .docker
.bundle .gem .rustup .npm .bun .deno .yarn .pnpm .m2 .gradle .dotnet .nuget .pub-cache .mix .hex
```

Todo o resto do `$HOME` fica read-only. Escondidos atrás de tmpfs:
`~/.config/{BraveSoftware,Bitwarden}` e
`~/.cache/{BraveSoftware,chromium,spotify,nvidia,mesa_shader_cache,basilisk-dev}`.
Arquivos explícitos: `~/.gitconfig` e `~/.gitignore` (ro), `~/.claude.json` (rw).

`--hide-dotdir` num dotdir da lista rw é **recusado** com aviso
(`Cannot hide {x}: it is required for sandboxed tool operation`) — ele continua visível.

---

## 8. Camadas de defesa (Linux)

| Camada | Detalhe | Desligar |
|---|---|---|
| Landlock LSM | ABI V3 (≥ 6.2) para filesystem, degrada para V1 (≥ 5.13), no-op abaixo. V4 (≥ 6.5) para rede | `--no-landlock` (**erro fatal** em lockdown) |
| seccomp-bpf | Bloqueia ~30 syscalls (module loading, `ptrace`, `bpf`, escape de namespace) | `--no-seccomp` |
| rlimits | `NPROC` 4096 (1024 em lockdown), `NOFILE` 65536 (4096), `CORE` 0 | `--no-rlimits` |
| Masks de `/sys` | tmpfs sobre `/sys/firmware`, `/sys/kernel/security`, `/sys/kernel/debug`, `/sys/fs/fuse` (+ `/sys/module`, dmi e `/sys/class/net` em lockdown) | — |
| Namespaces | PID, UTS, IPC, mount. Hostname interno `ai-sandbox`, `--die-with-parent` | — |

Requisitos mínimos de kernel:

| Recurso | Kernel | Se faltar |
|---|---|---|
| Landlock filesystem V1 | 5.13 | no-op, com aviso |
| Landlock filesystem V3 | 6.2 | degrada para V1 |
| OverlayFS não-privilegiado (`--overlay-map`) | 5.11 | o mount falha |
| Landlock network V4 (`--allow-tcp-port`) | 6.5 | **fatal** se houver portas configuradas |

`--allow-tcp-port` **pula o `--unshare-net`** e usa regras Landlock V4 para negar todo o resto.
Cobre **apenas TCP**.

---

## 9. Erros fatais (saem, não avisam)

```
--init conflicts with --no-save-config
Landlock cannot be disabled in lockdown mode
Landlock V4 required for ...
alternate map destinations are not supported on macOS: {p}; use Linux/bubblewrap or map the path at its host location
Failed to parse {path}: {erro}          # .ai-jail inválido — fail-closed (v1.14.0, issue #87)
Failed to read {path}: {erro}
Cannot determine current directory: {e}
unknown option: --x
invalid port number: 65536
invalid browser profile: maybe (expected 'hard' or 'soft')
invalid status bar style: neon (expected 'dark', 'light', or 'pastel')
```

`bwrap` ausente:

```
bwrap (bubblewrap) not found in trusted locations. Install it:
  Arch: pacman -S bubblewrap
  Debian/Ubuntu: apt install bubblewrap
  Fedora: dnf install bubblewrap
Or set BWRAP_BIN=/absolute/path/to/bwrap
```

A descoberta **não usa `$PATH`** — só `/usr/bin/bwrap`, `/bin/bwrap`, `/usr/local/bin/bwrap`, ou
`BWRAP_BIN` apontando para um arquivo absoluto existente.

Ubuntu 24.04+ / Debian 13+: `bwrap: setting up uid map: Permission denied` é a policy AppArmor que
nega user namespace não-privilegiado. Correção com `kernel.apparmor_restrict_unprivileged_userns=0`
ou perfil `unconfined` para o bwrap.

---

## 10. O que **não** afirmar

- Não existe `ai-jail init` — é a flag `--init`. `--bootstrap` e `--clean` também são flags.
  `ai-jail init` tentaria executar um binário chamado `init` dentro do sandbox.
- Os "presets" de comando **não** têm tabela de mounts própria. O único comportamento por nome é:
  `codex` recebe `resize_redraw_key = ctrl-shift-l`; `crush` e `opencode` bypassam o PTY proxy;
  8 nomes de navegador auto-ativam o perfil `hard`; os dotdirs desses agentes já estão na lista rw.
- `--browser soft` (sem `=`) não funciona. Idem `--status-bar light`.
- `ai-jail claude --no-gpu` **não** desliga a GPU — a flag vai para o `claude`.
- `ai-jail --lockdown chromium` **não** roda em lockdown: o perfil de browser força
  `lockdown = false`.
- Status bar **não** funciona com `crush` nem `opencode`, em nenhuma config. Em tmux/zellij ela é
  auto-desligada, salvo `-s` explícito.
- Não há `serde(alias)` em nenhum campo de config.
- `bwrap` **não** é procurado no `$PATH`.
- `--overlay-map` **não** aceita `SOURCE:DEST`.
- `--dry-run` não cria nem atualiza o `.ai-jail`, **mas cria** `.ai-jail-overlays/` quando há overlay
  maps configurados (as layers precisam existir antes do mount).
- `--lockdown` sozinho **não** persiste no `.ai-jail`; use `ai-jail --init --lockdown`.
- `--clean` **não** ignora o `~/.ai-jail` global.
- **Só use flags que apareçam em `ai-jail --help`.** O parser aceita algumas flags internas, omitidas
  do help de propósito: são o wrapper com que o ai-jail se re-invoca dentro do bwrap para aplicar
  Landlock depois que os mounts existem. Não são interface pública, não têm garantia de estabilidade
  e nunca devem entrar numa linha de comando escrita à mão. As flags públicas de Landlock são
  `--landlock` e `--no-landlock`.

## 11. Drift do README do ai-jail (o código vence)

1. `DOTDIR_RW` tem **31** entradas no código; o README lista 16.
2. A tabela "Commands" do README omite `soulforge` e `grok`, que o help lista.
3. O default de `command` é `[]` no serde; o README diz `["bash"]` — o `bash` é fallback de runtime.
