#!/usr/bin/env node
// scripts/complexity-scan.mjs
//
// Complexity Guard — mede complexidade ciclomática (CCN) por função e alimenta o
// ratchet do quality-gate. Motor: lizard (multi-linguagem: Python, TypeScript,
// TSX, JavaScript, Go, C#, Java, Kotlin, Ruby, PHP, Rust...).
//
//   node scripts/complexity-scan.mjs              tabela das piores funções
//   node scripts/complexity-scan.mjs --top 30     top N piores
//   node scripts/complexity-scan.mjs --json       grava .complexity-report.json (quality-gate)
//   node scripts/complexity-scan.mjs --check      exit 1 se alguma função passar de limite_hard
//   node scripts/complexity-scan.mjs --setup      cria .complexity-venv e instala o lizard
//   node scripts/complexity-scan.mjs --init       gera complexity-thresholds.json detectando os paths
//
// Config: complexity-thresholds.json na raiz do projeto.
// Exit: 0 ok · 1 limite_hard excedido (só com --check) · 2 erro de ambiente/config.

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT        = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONFIG_FILE = path.join(ROOT, 'complexity-thresholds.json');
const REPORT_FILE = path.join(ROOT, '.complexity-report.json');
const VENV_DIR    = path.join(ROOT, '.complexity-venv');

const argv     = process.argv.slice(2);
const AS_JSON  = argv.includes('--json');
const CHECK    = argv.includes('--check');
const SETUP    = argv.includes('--setup');
const INIT     = argv.includes('--init');
const TOP      = (() => {
  const i = argv.indexOf('--top');
  return i >= 0 && argv[i + 1] ? Math.max(1, parseInt(argv[i + 1], 10) || 15) : 15;
})();

const DEFAULT_CONFIG = {
  limite_ccn:  10,
  limite_hard: null,
  // 'auto' | 'eslint' | 'lizard' | 'misto' — ver escolherMotor().
  // 'misto': eslint mede TS/JS e o lizard mede o resto (Python, Go…). Para repositório poliglota
  // com TS, onde o 'auto' cairia no lizard e mediria o TSX errado.
  motor:       'auto',
  paths:       [],
  exclude: [
    '*/node_modules/*', '*/.venv/*', '*/venv/*', '*/dist/*', '*/build/*',
    '*/migrations/*', '*/__pycache__/*', '*/.next/*', '*/coverage/*',
    '*/tests/*', '*/test/*', '*/e2e/*', '*/__tests__/*', '*/__mocks__/*',
    '*.test.ts', '*.test.tsx', '*.test.js', '*.spec.ts', '*.spec.tsx', '*_test.go', '*_test.py',
  ],
  ignorar: [],
};

// ─── Config ──────────────────────────────────────────────────────────────────

function loadConfig() {
  if (!fs.existsSync(CONFIG_FILE)) {
    fail(`complexity-thresholds.json não encontrado em ${ROOT}.\n` +
         `Rode: node scripts/complexity-scan.mjs --init`);
  }
  try {
    return { ...DEFAULT_CONFIG, ...JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8')) };
  } catch (e) {
    fail(`complexity-thresholds.json inválido: ${e.message}`);
  }
}

// Detecta diretórios de código-fonte comuns (usado só pelo --init).
function detectPaths() {
  const candidatos = [
    'backend/src', 'backend/app', 'backend', 'src', 'app',
    'frontend/src', 'web/src', 'api/src', 'api', 'workers/src',
    'internal', 'cmd', 'lib',
  ];
  const achados = [];
  for (const c of candidatos) {
    const full = path.join(ROOT, c);
    if (!fs.existsSync(full) || !fs.statSync(full).isDirectory()) continue;
    // evita sobreposição nos dois sentidos: nem filho de um path já escolhido,
    // nem pai que engoliria um path mais específico já escolhido
    if (achados.some(a => c.startsWith(a + '/') || a.startsWith(c + '/'))) continue;
    achados.push(c);
  }
  return achados;
}

function cmdInit() {
  if (fs.existsSync(CONFIG_FILE)) {
    console.log(`complexity-thresholds.json já existe — nada a fazer.`);
    return 0;
  }
  const config = {
    updated: new Date().toISOString().slice(0, 10),
    ...DEFAULT_CONFIG,
    paths: detectPaths(),
  };
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2) + '\n');
  console.log(`✓ complexity-thresholds.json criado`);
  console.log(`  paths detectados: ${config.paths.join(', ') || '(nenhum — preencha à mão)'}`);
  return 0;
}

// ─── lizard ──────────────────────────────────────────────────────────────────

function tryBin(bin, args = ['--version']) {
  const r = spawnSync(bin, args, { encoding: 'utf8' });
  return r.status === 0;
}

// Retorna [comando, argsPrefixo] ou null.
function findLizard() {
  if (process.env.LIZARD_BIN && tryBin(process.env.LIZARD_BIN)) return [process.env.LIZARD_BIN, []];

  const candidatos = [
    path.join(VENV_DIR, 'bin', 'lizard'),
    path.join(VENV_DIR, 'Scripts', 'lizard.exe'),
    path.join(ROOT, '.venv', 'bin', 'lizard'),
    path.join(ROOT, 'venv', 'bin', 'lizard'),
    path.join(ROOT, 'backend', '.venv', 'bin', 'lizard'),
  ];
  for (const c of candidatos) if (fs.existsSync(c)) return [c, []];

  if (tryBin('lizard')) return ['lizard', []];
  for (const py of ['python3', 'python']) {
    if (tryBin(py, ['-m', 'lizard', '--version'])) return [py, ['-m', 'lizard']];
  }
  return null;
}

function cmdSetup() {
  const py = ['python3', 'python'].find(p => tryBin(p, ['--version']));
  if (!py) fail('python3 não encontrado — o lizard precisa de Python 3.');

  if (!fs.existsSync(VENV_DIR)) {
    console.log(`Criando ${path.relative(ROOT, VENV_DIR)}/ ...`);
    const venv = spawnSync(py, ['-m', 'venv', VENV_DIR], { encoding: 'utf8', stdio: 'inherit' });
    if (venv.status !== 0) fail('falha ao criar o venv.');
  }
  const pip = fs.existsSync(path.join(VENV_DIR, 'bin', 'pip'))
    ? path.join(VENV_DIR, 'bin', 'pip')
    : path.join(VENV_DIR, 'Scripts', 'pip.exe');

  console.log('Instalando lizard...');
  const r = spawnSync(pip, ['install', '-q', 'lizard'], { encoding: 'utf8', stdio: 'inherit' });
  if (r.status !== 0) fail('falha ao instalar o lizard.');

  console.log(`✓ lizard instalado em ${path.relative(ROOT, VENV_DIR)}/`);
  console.log(`  adicione ${path.relative(ROOT, VENV_DIR)}/ ao .gitignore`);
  return 0;
}

// ─── Motor ───────────────────────────────────────────────────────────────────
//
// Dois analisadores, escolhidos pelo que o projeto é:
//
//   eslint  — parser real do TypeScript (@typescript-eslint/parser). Preciso em
//             TS/TSX moderno. É o certo para projeto Node/React.
//   lizard  — multi-linguagem (Python, Go, C#, Java, Ruby...). É o certo para
//             backend Python ou monorepo poliglota.
//
// ⚠ Por que a escolha importa: o parser TS do lizard tropeça em tipo de retorno
// objeto-literal (`function f(): { a: string } {`) e passa a contar o `{` do TIPO
// como corpo de função. A partir dali ele funde tudo numa função só. Medido num
// Next.js real: o lizard viu 1 função de CCN 90 onde o ESLint viu 15 funções, a
// maior com 27 — e o nome reportado era o da PRIMEIRA função do arquivo, uma de
// 5 linhas. Número inflado e culpado errado.

const EXT_ESLINT = /\.(ts|tsx|js|jsx|mjs|cjs)$/;

/**
 * Onde mora o eslint que cobre este path.
 *
 * Em monorepo (api/ + web/) cada workspace tem o SEU node_modules — procurar só na
 * raiz faz o detector desistir do eslint e cair no lizard justamente nos projetos
 * TypeScript, que são os que mais precisam dele. Sobe do path até a raiz do repo.
 */
function workspaceDoPath(alvo) {
  let dir = fs.statSync(alvo).isDirectory() ? alvo : path.dirname(alvo);
  while (dir.startsWith(ROOT)) {
    if (fs.existsSync(path.join(dir, 'node_modules', '.bin', 'eslint'))) return dir;
    if (dir === ROOT) break;
    dir = path.dirname(dir);
  }
  return null;
}

function binLocal(nome, base = ROOT) {
  const bin = path.join(base, 'node_modules', '.bin', nome);
  return fs.existsSync(bin) ? bin : null;
}

/** Só arquivos que o ESLint entende? Um .py no meio já exige o lizard. */
function projetoSoTsJs(alvos) {
  const varrer = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
      const full = path.join(dir, e.name);
      if (e.isDirectory()) { if (!varrer(full)) return false; continue; }
      if (/\.(py|go|cs|java|kt|rb|php|rs|swift|scala|c|cpp|h)$/.test(e.name)) return false;
    }
    return true;
  };
  return alvos.every((a) => (fs.statSync(a).isDirectory() ? varrer(a) : EXT_ESLINT.test(a)));
}

function escolherMotor(config, alvos) {
  if (['eslint', 'lizard', 'misto'].includes(config.motor)) return config.motor;

  const workspaces = alvos.map(workspaceDoPath);
  const todosCobertos = workspaces.every(
    (ws) => ws && fs.existsSync(path.join(ws, 'node_modules', '@typescript-eslint', 'parser')),
  );
  return todosCobertos && projetoSoTsJs(alvos) ? 'eslint' : 'lizard';
}

const ESLINT_CONFIG = 'complexity.eslint.config.mjs';

/** Config isolado: nada aqui pode influenciar o lint normal do projeto. */
function garantirConfigEslint(config, base = ROOT) {
  const dir = fs.existsSync(path.join(base, 'scripts')) ? path.join(base, 'scripts') : base;
  const destino = path.join(dir, ESLINT_CONFIG);
  if (fs.existsSync(destino)) return destino;

  const ignores = config.exclude
    .map((e) => e.replace(/^\*\//, '**/'))
    .map((e) => JSON.stringify(e))
    .join(', ');

  fs.writeFileSync(destino, `// Gerado por scripts/complexity-scan.mjs — usado SÓ pela medição de complexidade.
// Liga a regra \`complexity\` com limite 0 para que TODA função reporte o próprio CCN
// na mensagem. Separado do eslint.config do projeto de propósito.
import tsparser from '@typescript-eslint/parser';

export default [
  { ignores: [${ignores}] },
  {
    files: ['**/*.{ts,tsx,js,jsx,mjs,cjs}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: { ecmaVersion: 2022, sourceType: 'module', ecmaFeatures: { jsx: true } },
    },
    rules: { complexity: ['error', 0] },
  },
];
`);
  return destino;
}

// "Async function 'x' has a complexity of 27." / "Arrow function has a complexity of 3."
const MSG_COMPLEXIDADE = /^(?:Async |Static |Generator )*(?:\w+ )*?(?:'([^']+)' )?has a complexity of (\d+)/;

/** Rejeita resultados parciais: erro de parser não pode parecer CCN zero. Exportada para teste. */
export function validarResultadoEslint(arquivos, ws = ROOT) {
  if (!Array.isArray(arquivos)) {
    fail(`eslint devolveu JSON inesperado em ${path.relative(ROOT, ws) || '.'}`);
  }
  const fatais = arquivos.flatMap((arquivo) =>
    (arquivo.messages ?? [])
      .filter((m) => m.fatal)
      .map((m) => `${arquivo.filePath ? path.relative(ROOT, arquivo.filePath) : '(arquivo desconhecido)'}:${m.line ?? 0} ${m.message}`),
  );
  if (fatais.length || arquivos.some((arquivo) => (arquivo.fatalErrorCount ?? 0) > 0)) {
    fail(`eslint não conseguiu analisar ${fatais.length || 'um ou mais'} arquivo(s):\n${fatais.slice(0, 5).join('\n')}`);
  }
  return arquivos;
}

function rodarEslint(config, alvos, { semTsTolerado = false } = {}) {
  // Agrupa por workspace: cada um roda com o SEU eslint e o SEU parser.
  const porWorkspace = new Map();
  for (const alvo of alvos) {
    const ws = workspaceDoPath(alvo);
    if (!ws) fail(`eslint não encontrado para ${path.relative(ROOT, alvo)} — rode o install do projeto.`);
    if (!porWorkspace.has(ws)) porWorkspace.set(ws, []);
    porWorkspace.get(ws).push(alvo);
  }

  const resultados = [];
  for (const [ws, alvosDoWs] of porWorkspace) {
    const eslint = binLocal('eslint', ws);
    const cfg = garantirConfigEslint(config, ws);
    const res = spawnSync(
      eslint,
      ['--config', cfg, '--format', 'json', '--no-warn-ignored',
       // misto: um path só de Python não tem arquivo para o eslint, e isso é esperado.
       ...(semTsTolerado ? ['--no-error-on-unmatched-pattern'] : []),
       ...alvosDoWs.map((a) => path.relative(ws, a))],
      { cwd: ws, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 },
    );

    if (res.error && res.status == null) fail(`falha ao executar o eslint: ${res.error.message}`);
    if (res.signal) fail(`eslint interrompido por ${res.signal} em ${path.relative(ROOT, ws) || '.'}`);

    const saida = (res.stdout ?? '').trim();
    let arquivos;
    try {
      arquivos = JSON.parse(saida);
    } catch {
      fail(`eslint não devolveu JSON em ${path.relative(ROOT, ws) || '.'}:\n${(res.stderr || saida).slice(0, 400)}`);
    }
    validarResultadoEslint(arquivos, ws);
    if (res.status !== 0 && res.status !== 1) {
      fail(`eslint terminou com status ${res.status} em ${path.relative(ROOT, ws) || '.'}:\n${(res.stderr ?? '').slice(0, 400)}`);
    }
    resultados.push(...arquivos);
  }

  const funcoes = [];
  for (const arquivo of resultados) {
    const rel = path.relative(ROOT, arquivo.filePath);
    for (const m of arquivo.messages ?? []) {
      const achado = MSG_COMPLEXIDADE.exec(m.message ?? '');
      if (!achado) continue;
      funcoes.push({
        nloc: 0,
        ccn: +achado[2],
        tokens: 0,
        params: 0,
        arquivo: rel,
        funcao: achado[1] ?? '(anonymous)',
        linha_inicio: m.line ?? 0,
        linha_fim: m.endLine ?? m.line ?? 0,
      });
    }
  }
  return funcoes;
}

// ─── CSV do lizard ───────────────────────────────────────────────────────────
//
// Formato (sem cabeçalho, uma linha por função):
//   nloc,ccn,token,param,length,"location","file","function","long_name",start,end
// Campos entre aspas nunca contêm aspas: o lizard troca `"` por `'` na origem.

function parseCsvLine(line) {
  const campos = [];
  let atual = '';
  let dentroDeAspas = false;

  for (const ch of line) {
    if (ch === '"') { dentroDeAspas = !dentroDeAspas; continue; }
    if (ch === ',' && !dentroDeAspas) { campos.push(atual); atual = ''; continue; }
    atual += ch;
  }
  campos.push(atual);
  return campos;
}

/** Alvos existentes; path inexistente faz o lizard TRAVAR, então filtre sempre. */
function resolverAlvos(config) {
  const alvos = config.paths
    .map(p => path.join(ROOT, p))
    .filter(p => fs.existsSync(p));

  if (alvos.length === 0) {
    fail(`nenhum dos paths de complexity-thresholds.json existe: ${config.paths.join(', ') || '(vazio)'}`);
  }
  return alvos;
}

/** Despacha para o motor escolhido e devolve a lista de funções medidas. */
function medir(config) {
  const alvos = resolverAlvos(config);
  const motor = escolherMotor(config, alvos);
  if (motor === 'misto') {
    return { motor, funcoes: [...rodarEslint(config, alvos, { semTsTolerado: true }), ...runLizard(config, alvos, EXCLUDE_TS_JS)] };
  }
  return { motor, funcoes: motor === 'eslint' ? rodarEslint(config, alvos) : runLizard(config, alvos) };
}

// No motor 'misto' o TS/JS é do eslint: o lizard não pode contá-lo de novo.
const EXCLUDE_TS_JS = ['*.ts', '*.tsx', '*.js', '*.jsx', '*.mjs', '*.cjs'];

function runLizard(config, alvos, excludeExtra = []) {
  const lizard = findLizard();
  if (!lizard) {
    fail('lizard não encontrado.\n' +
         '  Instale com: node scripts/complexity-scan.mjs --setup\n' +
         '  (ou `pip install lizard` / `pipx install lizard`)');
  }
  const [bin, prefixo] = lizard;

  const args = [...prefixo, '--csv', '-t', '4'];
  for (const ex of [...config.exclude, ...excludeExtra]) args.push('-x', ex);
  args.push(...alvos);

  const r = spawnSync(bin, args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  validarExecucaoLizard(r);

  return (r.stdout ?? '')
    .split('\n')
    .filter(Boolean)
    .map(parseCsvLine)
    .filter(c => c.length >= 11 && Number.isFinite(+c[1]))
    .map(c => ({
      nloc:    +c[0],
      ccn:     +c[1],
      tokens:  +c[2],
      params:  +c[3],
      arquivo: path.relative(ROOT, c[6]),
      funcao:  c[7],
      linha_inicio: +c[9],
      linha_fim:    +c[10],
    }));
}

/** Validação separada para cobrir por regressão sem depender de um lizard instalado. */
export function validarExecucaoLizard(r) {
  if (r.error && r.status == null) fail(`falha ao executar o lizard: ${r.error.message}`);
  if (r.signal) fail(`lizard interrompido por ${r.signal}`);
  if (r.status !== 0) {
    fail(`lizard terminou com status ${r.status}:\n${(r.stderr ?? '').slice(0, 400)}`);
  }
  return r;
}

// ─── Análise ─────────────────────────────────────────────────────────────────

function isIgnorada(fn, ignorar) {
  return ignorar.some(regra => {
    if (regra.includes('::')) {
      const [arq, nome] = regra.split('::');
      return fn.arquivo === arq && fn.funcao === nome;
    }
    return fn.funcao === regra;
  });
}

function analisar(funcoes, config) {
  const consideradas = funcoes.filter(f => !isIgnorada(f, config.ignorar));
  const ordenadas    = [...consideradas].sort((a, b) => b.ccn - a.ccn || b.nloc - a.nloc);

  const acimaDoLimite = ordenadas.filter(f => f.ccn > config.limite_ccn);
  const acimaDoHard   = config.limite_hard
    ? ordenadas.filter(f => f.ccn > config.limite_hard)
    : [];

  const soma = consideradas.reduce((s, f) => s + f.ccn, 0);

  return {
    ordenadas,
    acimaDoLimite,
    acimaDoHard,
    metricas: {
      complexity_worst:      ordenadas.length ? ordenadas[0].ccn : 0,
      complexity_over_limit: acimaDoLimite.length,
      complexity_functions:  consideradas.length,
      complexity_avg:        consideradas.length ? Math.round((soma / consideradas.length) * 10) / 10 : 0,
    },
  };
}

// ─── Saída ───────────────────────────────────────────────────────────────────

function linhaFn(f) {
  const local = `${f.arquivo}:${f.linha_inicio}`;
  return `  ${String(f.ccn).padStart(4)}  ${f.funcao.slice(0, 34).padEnd(34)} ${local}`;
}

function imprimir(analise, config, motor) {
  const { metricas, acimaDoLimite, acimaDoHard, ordenadas } = analise;

  const li = (label, valor) => console.log(`  ${(label + ' ').padEnd(34, '.')} ${valor}`);

  console.log('');
  li('Motor', motor);
  li('Funções analisadas', metricas.complexity_functions);
  li('Pior CCN', metricas.complexity_worst);
  li('CCN médio', metricas.complexity_avg);
  li(`Acima do limite (> ${config.limite_ccn})`, metricas.complexity_over_limit);
  if (config.limite_hard) li(`Acima do hard (> ${config.limite_hard})`, acimaDoHard.length);
  console.log('');

  const lista = (acimaDoLimite.length ? acimaDoLimite : ordenadas).slice(0, TOP);
  if (lista.length) {
    console.log(`  ${'CCN'.padStart(4)}  ${'Função'.padEnd(34)} Local`);
    console.log('  ' + '─'.repeat(76));
    lista.forEach(f => console.log(linhaFn(f)));
    console.log('');
  }

  if (acimaDoHard.length) {
    console.log(`✗ ${acimaDoHard.length} função(ões) acima do limite hard (CCN > ${config.limite_hard}) — refatore antes de commitar`);
  } else if (acimaDoLimite.length) {
    console.log(`⚠ ${acimaDoLimite.length} função(ões) acima de CCN ${config.limite_ccn} — débito medido pelo ratchet (só pode cair)`);
  } else {
    console.log(`✓ Complexity Guard: nenhuma função acima de CCN ${config.limite_ccn}`);
  }
}

function gravarJson(analise, config, motor) {
  const relatorio = {
    updated: new Date().toISOString().slice(0, 10),
    motor,
    limite_ccn:  config.limite_ccn,
    limite_hard: config.limite_hard,
    metricas: analise.metricas,
    acima_do_limite: analise.acimaDoLimite.map(f => ({
      ccn: f.ccn, nloc: f.nloc, params: f.params,
      arquivo: f.arquivo, funcao: f.funcao,
      linha_inicio: f.linha_inicio, linha_fim: f.linha_fim,
    })),
  };
  fs.writeFileSync(REPORT_FILE, JSON.stringify(relatorio, null, 2) + '\n');

  for (const [k, v] of Object.entries(analise.metricas)) console.log(`${k}=${v}`);
}

function fail(msg) {
  process.stderr.write(`✗ Complexity Guard: ${msg}\n`);
  process.exit(2);
}

// ─── Main ────────────────────────────────────────────────────────────────────

function main() {
  if (INIT)  process.exit(cmdInit());
  if (SETUP) process.exit(cmdSetup());

  const config  = loadConfig();
  const { motor, funcoes } = medir(config);
  const analise = analisar(funcoes, config);

  if (AS_JSON) gravarJson(analise, config, motor);
  else         imprimir(analise, config, motor);

  process.exit(CHECK && analise.acimaDoHard.length > 0 ? 1 : 0);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
