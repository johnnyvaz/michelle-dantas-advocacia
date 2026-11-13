#!/usr/bin/env node
// scripts/raio-x.cjs — traduz o quality gate em linguagem de negócio: semáforo, nota, "onde dói" e evolução.
//
//   node scripts/raio-x.cjs            → regenera docs/QUALIDADE.md, docs/qualidade/raio-x.html e o bloco do README
//   node scripts/raio-x.cjs --tasks    → idem + sincroniza tasks/backlog.md (abre/atualiza/fecha uma tarefa por tema)
//   node scripts/raio-x.cjs --check    → exit 1 se docs/QUALIDADE.md não bate com o baseline atual (CI)
//
// Lê quality-baseline.json (números) e os relatórios dos scanners (.complexity-report.json etc.) para os arquivos.
// Toda conta (semáforo, nota, ranking) acontece aqui — os documentos só mostram o resultado.

'use strict';

const fs = require('fs');
const path = require('path');
const { TEMAS, TAREFAS, METRICAS, INFORMATIVOS, RELATORIOS, PROJETO: NOME } = require('./raio-x/catalogo.cjs');

const ROOT = path.resolve(__dirname, '..');
/** Nome no título dos documentos: `PROJETO` do catálogo, ou o nome da pasta. */
const PROJETO = NOME ?? path.basename(ROOT);
const ARQ = {
  baseline: path.join(ROOT, 'quality-baseline.json'),
  historico: path.join(ROOT, 'quality-history.jsonl'),
  md: path.join(ROOT, 'docs', 'QUALIDADE.md'),
  html: path.join(ROOT, 'docs', 'qualidade', 'raio-x.html'),
  readme: path.join(ROOT, 'README.md'),
  backlog: path.join(ROOT, 'tasks', 'backlog.md'),
  concluidas: path.join(ROOT, 'tasks', 'concluidas.md'),
};

const PONTOS = { verde: 1, amarelo: 0.5, vermelho: 0 };
const ORDEM_GRAVIDADE = { vermelho: 3, amarelo: 2, sem_medicao: 1, verde: 0 };
const ROTULO = { verde: '🟢 ok', amarelo: '🟡 atenção', vermelho: '🔴 crítico', sem_medicao: '⚪ sem medição' };
const TOP_ARQUIVOS = 5;

// ─── Avaliação ───────────────────────────────────────────────────────────────

/** Semáforo de uma métrica: `null` (não medida) é cinza, nunca verde. */
function avaliar(m, valor) {
  if (valor === null || valor === undefined) return 'sem_medicao';
  if (m.direcao === 'asc') return valor >= m.verde ? 'verde' : valor >= m.amarelo ? 'amarelo' : 'vermelho';
  return valor <= m.verde ? 'verde' : valor <= m.amarelo ? 'amarelo' : 'vermelho';
}

function letra(score) {
  if (score >= 90) return 'A';
  if (score >= 75) return 'B';
  if (score >= 60) return 'C';
  if (score >= 40) return 'D';
  return 'E';
}

/** Nota 0–100 por tema e geral (média ponderada pelo peso do tema). Dado pessoal em log limita a nota a D. */
function pontuar(avaliacoes) {
  const porTema = {};
  for (const [id, t] of Object.entries(TEMAS)) {
    const medidas = avaliacoes.filter((a) => a.tema === id && a.status !== 'sem_medicao');
    porTema[id] = medidas.length
      ? Math.round((medidas.reduce((s, a) => s + PONTOS[a.status], 0) / medidas.length) * 100)
      : null;
  }
  const comNota = Object.entries(porTema).filter(([, s]) => s !== null);
  const pesoTotal = comNota.reduce((s, [id]) => s + TEMAS[id].peso, 0);
  const score = pesoTotal ? Math.round(comNota.reduce((s, [id, v]) => s + v * TEMAS[id].peso, 0) / pesoTotal) : 0;
  let nota = letra(score);
  const lgpd = avaliacoes.find((a) => a.chave === 'obs_sensitive_in_log');
  if (lgpd?.status === 'vermelho' && nota < 'D') nota = 'D';
  return { porTema, score, nota };
}

/** Conta achados por arquivo (cada `arquivo:linha` uma vez) e devolve os piores. */
function hotspots(achados, limite = TOP_ARQUIVOS) {
  const vistos = new Set();
  const porArquivo = new Map();
  for (const a of achados) {
    const id = `${a.arquivo}:${a.linha ?? a.texto}`;
    if (vistos.has(id)) continue;
    vistos.add(id);
    porArquivo.set(a.arquivo, (porArquivo.get(a.arquivo) ?? 0) + 1);
  }
  return [...porArquivo.entries()]
    .sort((x, y) => y[1] - x[1] || x[0].localeCompare(y[0]))
    .slice(0, limite)
    .map(([arquivo, total]) => ({ arquivo, total }));
}

// ─── Coleta ──────────────────────────────────────────────────────────────────

function lerJson(arquivo) {
  try { return JSON.parse(fs.readFileSync(arquivo, 'utf8')); } catch { return undefined; }
}

function carregar(root = ROOT) {
  const baseline = lerJson(path.join(root, 'quality-baseline.json')) ?? { metrics: {} };
  const relatorios = Object.fromEntries(RELATORIOS.map((f) => [f, lerJson(path.join(root, f))]));
  let historico = [];
  try {
    historico = fs.readFileSync(path.join(root, 'quality-history.jsonl'), 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
  } catch { /* primeira execução */ }
  return { baseline, relatorios, historico };
}

/** Estado completo do raio-x — tudo que os documentos e as tarefas precisam, já calculado. */
function montarEstado({ baseline, relatorios, historico }) {
  const metrics = baseline.metrics ?? {};
  const avaliacoes = METRICAS.map((m) => {
    const valor = m.fonte ? relatorios[m.fonte]?.[m.chave] ?? null : metrics[m.chave] ?? null;
    const achados = m.detalhe(relatorios);
    return { ...m, valor, status: avaliar(m, valor), achados, piores: hotspots(achados) };
  });
  const informativos = INFORMATIVOS.map((i) => ({ ...i, valor: i.ler ? i.ler(relatorios) : metrics[i.chave] ?? null }));
  const { porTema, score, nota } = pontuar(avaliacoes);

  const achadosPorTema = {};
  for (const id of Object.keys(TEMAS)) {
    achadosPorTema[id] = new Set(avaliacoes.filter((a) => a.tema === id).flatMap((a) => a.achados.map((x) => `${x.arquivo}:${x.linha ?? x.texto}`))).size;
  }
  const arquivosCriticos = hotspots(avaliacoes.filter((a) => a.status !== 'verde').flatMap((a) => a.achados), 8);
  const riscos = avaliacoes
    .filter((a) => a.status === 'vermelho')
    .sort((x, y) => TEMAS[y.tema].peso - TEMAS[x.tema].peso || y.achados.length - x.achados.length)
    .slice(0, 3);
  const evolucao = historico.map((h) => ({ data: h.data, score: pontuar(METRICAS.map((m) => ({
    ...m, status: avaliar(m, m.fonte ? h.metrics[m.chave] ?? null : h.metrics[m.chave] ?? null),
  }))).score }));

  return { data: baseline.updated ?? '—', avaliacoes, informativos, porTema, score, nota, achadosPorTema, arquivosCriticos, riscos, evolucao };
}

// ─── Saídas ──────────────────────────────────────────────────────────────────

const fmt = (a) => (a.valor === null || a.valor === undefined ? '—' : a.rotulo ? a.rotulo(a.valor) : `${a.valor}${a.unidade ?? ''}`);
const meta = (a) => a.metaTexto ?? `${a.direcao === 'asc' ? '≥' : '≤'} ${a.verde}${a.unidade ?? ''}`;
const curto = (arquivo) => arquivo.split('/').slice(-2).join('/');

function markdown(e) {
  const l = [];
  l.push(`# Raio-X de Qualidade — ${PROJETO}`, '');
  l.push(`> Gerado por \`node scripts/raio-x.cjs\` a partir do quality gate em **${e.data}**. Não edite à mão.`);
  l.push('> Versão interativa: [`docs/qualidade/raio-x.html`](./qualidade/raio-x.html).', '');
  l.push(`## Nota geral: **${e.nota}** (${e.score}/100)`, '');
  if (e.riscos.length) {
    l.push('**Os maiores riscos hoje:**', '');
    e.riscos.forEach((r, i) => l.push(`${i + 1}. ${TEMAS[r.tema].icone} **${r.titulo}** (${fmt(r)}) — ${r.impacto}`));
    l.push('');
  }
  l.push('| Tema | Nota | Situação |', '|---|---|---|');
  for (const [id, t] of Object.entries(TEMAS)) {
    const piores = e.avaliacoes.filter((a) => a.tema === id).sort((x, y) => ORDEM_GRAVIDADE[y.status] - ORDEM_GRAVIDADE[x.status]);
    const s = e.porTema[id];
    l.push(`| ${t.icone} ${t.nome} | ${s === null ? '—' : `${s}/100`} | ${ROTULO[piores[0]?.status ?? 'sem_medicao']} |`);
  }
  l.push('');

  const pizza = Object.entries(e.achadosPorTema).filter(([, n]) => n > 0);
  if (pizza.length) {
    l.push('## Onde estão os problemas', '', '```mermaid', 'pie showData title Achados por tema');
    pizza.forEach(([id, n]) => l.push(`    "${TEMAS[id].nome}" : ${n}`));
    l.push('```', '');
  }
  if (e.arquivosCriticos.length) {
    l.push('## Arquivos que mais concentram problemas', '', '```mermaid', 'xychart-beta horizontal');
    l.push(`    x-axis [${e.arquivosCriticos.map((h) => `"${curto(h.arquivo)}"`).join(', ')}]`);
    l.push('    y-axis "Achados"');
    l.push(`    bar [${e.arquivosCriticos.map((h) => h.total).join(', ')}]`, '```', '');
  }
  if (e.evolucao.length > 1) {
    l.push('## Evolução da nota', '', '```mermaid', 'xychart-beta');
    l.push(`    x-axis [${e.evolucao.map((p) => `"${p.data}"`).join(', ')}]`, '    y-axis "Nota" 0 --> 100');
    l.push(`    line [${e.evolucao.map((p) => p.score).join(', ')}]`, '```', '');
  }

  l.push('## Detalhe por tema', '');
  for (const [id, t] of Object.entries(TEMAS)) {
    l.push(`### ${t.icone} ${t.nome}`, '', '| | O que medimos | Agora | Meta | Por que importa |', '|---|---|---|---|---|');
    for (const a of e.avaliacoes.filter((x) => x.tema === id)) {
      l.push(`| ${ROTULO[a.status].split(' ')[0]} | ${a.titulo} | ${fmt(a)} | ${meta(a)} | ${a.impacto} |`);
    }
    const piores = hotspots(e.avaliacoes.filter((x) => x.tema === id && x.status !== 'verde').flatMap((x) => x.achados));
    if (piores.length) l.push('', `Onde olhar primeiro: ${piores.map((h) => `\`${h.arquivo}\` (${h.total})`).join(' · ')}`);
    l.push('');
  }
  l.push('## Contexto', '');
  e.informativos.forEach((i) => l.push(`- ${i.titulo}: **${i.valor ?? '—'}**`));
  l.push('', '## Como ler', '');
  l.push('- 🟢 dentro da meta · 🟡 atenção · 🔴 crítico · ⚪ ainda não medido (não conta na nota).');
  l.push('- A nota vai de A a E; Segurança e Estabilidade pesam o dobro. Dado pessoal em log limita a nota a D.');
  l.push('- Os números só podem melhorar: o quality gate reprova qualquer mudança que piore um deles.');
  l.push('- Cada tema em 🟡/🔴 tem uma tarefa em `tasks/backlog.md` (`node scripts/raio-x.cjs --tasks`).');
  l.push('- Faixas e textos: `scripts/raio-x/catalogo.cjs`.', '');
  return l.join('\n');
}

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function barras(itens) {
  if (!itens.length) return '<p class="vazio">Nenhum arquivo com achado.</p>';
  const max = Math.max(...itens.map((i) => i.total));
  return `<ul class="barras" aria-label="Arquivos com mais achados">${itens.map((i) =>
    `<li title="${esc(i.arquivo)}"><span class="rot">${esc(curto(i.arquivo))}</span>`
    + `<span class="trilho-b"><span style="width:${Math.max(2, Math.round((i.total / max) * 100))}%"></span></span><b>${i.total}</b></li>`).join('')}</ul>`;
}

function svgLinha(pontos) {
  if (pontos.length < 2) return '<p class="vazio">A evolução aparece a partir da segunda medição.</p>';
  const W = 640, H = 160, P = 24;
  const x = (i) => P + (i * (W - 2 * P)) / (pontos.length - 1);
  const y = (v) => H - P - (v * (H - 2 * P)) / 100;
  const d = pontos.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(p.score).toFixed(1)}`).join(' ');
  const marcas = pontos.map((p, i) => `<circle cx="${x(i).toFixed(1)}" cy="${y(p.score).toFixed(1)}" r="3.5" class="ponto"><title>${esc(p.data)}: ${p.score}</title></circle>`).join('');
  return `<svg role="img" aria-label="Evolução da nota" viewBox="0 0 ${W} ${H}" width="100%"><path d="${d}" class="linha" fill="none"></path>${marcas}`
    + `<text x="${P}" y="${H - 4}" class="rot">${esc(pontos[0].data)}</text><text x="${W - P}" y="${H - 4}" text-anchor="end" class="rot">${esc(pontos.at(-1).data)}</text></svg>`;
}

function html(e) {
  const temas = Object.entries(TEMAS).map(([id, t]) => {
    const itens = e.avaliacoes.filter((a) => a.tema === id).map((a) => {
      const lista = a.achados.slice(0, 30).map((x) => `<li><code>${esc(x.arquivo)}${x.linha ? `:${x.linha}` : ''}</code>${x.texto ? ` <span>${esc(x.texto.slice(0, 90))}</span>` : ''}</li>`).join('');
      const extra = a.achados.length > 30 ? `<li class="mais">+ ${a.achados.length - 30} outros</li>` : '';
      const corpo = a.achados.length ? `<ul>${lista}${extra}</ul>` : '<p class="vazio">Sem lista de arquivos para esta métrica.</p>';
      return `<details class="metrica s-${a.status}"><summary><span class="chip">${ROTULO[a.status]}</span><span class="tit">${esc(a.titulo)}</span>`
        + `<span class="val">${esc(fmt(a))}<small> meta ${esc(meta(a))}</small></span></summary>`
        + `<p class="perg">${esc(a.pergunta)}</p><p>${esc(a.impacto)}</p>${corpo}</details>`;
    }).join('');
    const s = e.porTema[id];
    return `<section class="tema"><header><h2>${t.icone} ${esc(t.nome)}</h2><b>${s === null ? '—' : `${s}/100`}</b></header>`
      + `<div class="trilho"><div style="width:${s ?? 0}%"></div></div>${itens}</section>`;
  }).join('');
  const riscos = e.riscos.map((r) => `<li><b>${esc(r.titulo)}</b> (${esc(fmt(r))}) — ${esc(r.impacto)}</li>`).join('');
  const info = e.informativos.map((i) => `<li>${esc(i.titulo)}: <b>${esc(i.valor ?? '—')}</b></li>`).join('');

  return `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Raio-X de Qualidade — ${esc(PROJETO)}</title>
<style>
:root{--bg:#f7f7f5;--card:#fff;--tx:#1d1d1b;--mut:#6b6b66;--borda:#e4e4df;--verde:#1f9d55;--amarelo:#c98a00;--vermelho:#d0342c;--cinza:#9a9a94;--acento:#2563eb}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#141413;--card:#1e1e1c;--tx:#f1f1ee;--mut:#a3a39d;--borda:#33332f;--acento:#7aa2ff;color-scheme:dark}}
:root[data-theme="dark"]{--bg:#141413;--card:#1e1e1c;--tx:#f1f1ee;--mut:#a3a39d;--borda:#33332f;--acento:#7aa2ff;color-scheme:dark}
body{margin:0;background:var(--bg);color:var(--tx);font:15px/1.5 system-ui,sans-serif;padding:24px 16px}
main{max-width:960px;margin:0 auto}h1{font-size:1.6rem;margin:0}h2{font-size:1.1rem;margin:0}
.topo{display:flex;gap:24px;align-items:center;flex-wrap:wrap;margin:16px 0 24px}
.nota{font-size:4rem;font-weight:800;line-height:1;width:96px;height:96px;display:grid;place-items:center;border-radius:20px;background:var(--card);border:1px solid var(--borda)}
.n-A,.n-B{color:var(--verde)}.n-C{color:var(--amarelo)}.n-D,.n-E{color:var(--vermelho)}
.riscos{flex:1;min-width:260px}.riscos ol{margin:6px 0 0;padding-left:20px}
.card,.tema{background:var(--card);border:1px solid var(--borda);border-radius:14px;padding:16px;margin-bottom:16px}
.tema header{display:flex;justify-content:space-between;align-items:center}
.trilho{height:6px;background:var(--borda);border-radius:3px;margin:10px 0 6px}.trilho div{height:100%;background:var(--acento);border-radius:3px}
.metrica{border-top:1px solid var(--borda);padding:8px 0}.metrica summary{display:flex;gap:10px;align-items:center;cursor:pointer;flex-wrap:wrap}
.chip{font-size:.8rem;white-space:nowrap}.tit{flex:1;min-width:180px}.val{font-weight:700;white-space:nowrap}.val small{font-weight:400;color:var(--mut);margin-left:6px}
.perg{color:var(--mut);margin:8px 0 2px;font-style:italic}.metrica ul{margin:6px 0;padding-left:18px;max-height:260px;overflow:auto}
.metrica li span{color:var(--mut)}code{font-size:.85em}.vazio,.mais{color:var(--mut)}
.s-vermelho .chip{color:var(--vermelho)}.s-amarelo .chip{color:var(--amarelo)}.s-verde .chip{color:var(--verde)}.s-sem_medicao .chip{color:var(--cinza)}
svg .rot{fill:var(--mut);font-size:12px}\n.barras{list-style:none;margin:10px 0 0;padding:0}.barras li{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1fr) 2.5em;gap:8px;align-items:center;margin:6px 0;font-size:.85rem}\n.barras .rot{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--mut)}.trilho-b{height:12px;background:var(--borda);border-radius:3px}.trilho-b span{display:block;height:100%;background:var(--vermelho);border-radius:3px}
svg .linha{stroke:var(--acento);stroke-width:2.5}svg .ponto{fill:var(--acento)}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr));gap:16px}
footer{color:var(--mut);font-size:.85rem;margin-top:24px}
</style></head><body>
<main>
<h1>Raio-X de Qualidade — ${esc(PROJETO)}</h1>
<p style="color:var(--mut);margin:4px 0 0">Medido pelo quality gate em ${esc(e.data)}. Clique em cada item para ver os arquivos.</p>
<div class="topo"><div class="nota n-${e.nota}" aria-label="Nota geral">${e.nota}</div>
<div class="riscos"><b>Nota ${e.score}/100.</b>${riscos ? ` Maiores riscos hoje:<ol>${riscos}</ol>` : ' Nenhum item crítico.'}</div></div>
<div class="grid"><div class="card"><h2>Arquivos que mais concentram problemas</h2>${barras(e.arquivosCriticos)}</div>
<div class="card"><h2>Evolução da nota</h2>${svgLinha(e.evolucao)}</div></div>
${temas}
<div class="card"><h2>Contexto</h2><ul>${info}</ul></div>
<footer>🟢 dentro da meta · 🟡 atenção · 🔴 crítico · ⚪ ainda não medido. Os números só podem melhorar: o quality gate reprova qualquer piora.
Gerado por <code>node scripts/raio-x.cjs</code> — faixas e textos em <code>scripts/raio-x/catalogo.cjs</code>.</footer>
</main>
</body></html>
`;
}

const README_INI = '<!-- raio-x:inicio -->';
const README_FIM = '<!-- raio-x:fim -->';

function blocoReadme(e) {
  const linhas = Object.entries(TEMAS).map(([id, t]) => {
    const pior = e.avaliacoes.filter((a) => a.tema === id).sort((x, y) => ORDEM_GRAVIDADE[y.status] - ORDEM_GRAVIDADE[x.status])[0];
    return `| ${t.icone} ${t.nome} | ${e.porTema[id] ?? '—'} | ${ROTULO[pior?.status ?? 'sem_medicao']} |`;
  });
  return [README_INI, `**Qualidade: nota ${e.nota} (${e.score}/100)** — medido em ${e.data}. Detalhe: [docs/QUALIDADE.md](docs/QUALIDADE.md).`, '',
    '| Tema | Nota | Situação |', '|---|---|---|', ...linhas, README_FIM].join('\n');
}

/** Reescreve só o que está entre os marcadores; sem marcadores, acrescenta o bloco no fim. */
function aplicarBloco(texto, bloco) {
  const i = texto.indexOf(README_INI);
  const f = texto.indexOf(README_FIM);
  if (i === -1 || f === -1) return `${texto.replace(/\s*$/, '')}\n\n${bloco}\n`;
  return texto.slice(0, i) + bloco + texto.slice(f + README_FIM.length);
}

// ─── Tarefas ─────────────────────────────────────────────────────────────────

const MARCA_RAIO = '  - **Raio-x:**';
const MARCA_ONDE = '  - **Onde (raio-x):**';

/** Situação de cada tarefa do catálogo: pior semáforo entre as métricas dela. */
function situacaoTarefas(e) {
  const out = {};
  for (const a of e.avaliacoes) {
    if (!a.tarefa) continue;
    const t = (out[a.tarefa] ??= { id: a.tarefa, ...TAREFAS[a.tarefa], status: 'verde', metricas: [] });
    t.metricas.push(a);
    if (ORDEM_GRAVIDADE[a.status] > ORDEM_GRAVIDADE[t.status]) t.status = a.status;
  }
  return Object.values(out);
}

function linhasRaio(t) {
  const abertas = t.metricas.filter((m) => m.status !== 'verde');
  const raio = abertas.map((m) => m.status === 'sem_medicao'
    ? `${m.titulo}: sem medição`
    : `${m.titulo}: ${fmt(m)} (meta ${meta(m)})`).join(' · ');
  const piores = hotspots(abertas.flatMap((m) => m.achados));
  const linhas = [`${MARCA_RAIO} ${raio} — ${abertas[0]?.impacto ?? ''} Ver \`docs/QUALIDADE.md\`.`];
  if (piores.length) linhas.push(`${MARCA_ONDE} ${piores.map((h) => `\`${h.arquivo}\` (${h.total})`).join(' · ')}`);
  return linhas;
}

/** Bloco de um item: linha `- [ ] título` + sub-bullets até o próximo item, seção ou linha em branco dupla. */
function acharItem(linhas, titulo) {
  const ini = linhas.findIndex((l) => /^- \[ \] /.test(l) && l.slice(6).startsWith(titulo));
  if (ini === -1) return null;
  let fim = ini + 1;
  while (fim < linhas.length && /^ {2,}\S/.test(linhas[fim])) fim++;
  return { ini, fim };
}

/**
 * Abre, atualiza e fecha as tarefas do raio-x. Idempotente: rodar duas vezes dá o mesmo texto.
 * Só os sub-bullets marcados (Raio-x / Onde) são do script; o resto do item (decisão, contexto) é preservado.
 */
function sincronizarTarefas(backlog, concluidas, e, hoje) {
  let linhas = backlog.split('\n');
  const fechadas = [];
  for (const t of situacaoTarefas(e)) {
    const achado = acharItem(linhas, t.titulo);
    if (t.status === 'verde') {
      if (achado) {
        const bloco = linhas.slice(achado.ini, achado.fim);
        linhas.splice(achado.ini, achado.fim - achado.ini);
        fechadas.push({ titulo: t.titulo, bloco });
      }
      continue;
    }
    const novas = linhasRaio(t);
    if (achado) {
      const sub = linhas.slice(achado.ini + 1, achado.fim).filter((l) => !l.startsWith(MARCA_RAIO) && !l.startsWith(MARCA_ONDE));
      linhas.splice(achado.ini, achado.fim - achado.ini, linhas[achado.ini], ...novas, ...sub);
    } else {
      const alta = t.status === 'vermelho';
      const secao = linhas.findIndex((l) => l.startsWith(alta ? '## Alta Prioridade' : '## Média Prioridade'));
      const cab = `- [ ] ${t.titulo} 📅 ${hoje} ${alta ? '🔺 alta' : '🔼 média'} #area/${t.area} #esforco/${t.esforco} #modelo/${t.modelo} 🤖`;
      const pos = secao === -1 ? linhas.length : secao + 1;
      linhas.splice(pos, 0, '', cab, ...novas);
    }
  }
  let saida = concluidas;
  for (const f of fechadas) {
    const [cab, ...sub] = f.bloco;
    const feito = `${cab.replace(/^- \[ \] /, '- [x] ').replace(/\s*\[prio:[^\]]*\]/, '')} ✅ ${hoje}`;
    saida = `${saida.replace(/\s*$/, '')}\n\n## backlog.md › ${f.titulo} ✅ ${hoje}\n\nFechada pelo raio-x: todas as métricas do tema ficaram verdes.\n\n${[feito, ...sub].join('\n')}\n`;
  }
  return { backlog: linhas.join('\n').replace(/\n{3,}/g, '\n\n'), concluidas: saida, fechadas: fechadas.map((f) => f.titulo) };
}

// ─── Histórico ───────────────────────────────────────────────────────────────

/** Acrescenta o baseline ao histórico quando os números mudaram desde a última linha. */
function registrarHistorico(baseline, historico, arquivo) {
  const ultimo = historico.at(-1);
  if (ultimo && JSON.stringify(ultimo.metrics) === JSON.stringify(baseline.metrics)) return historico;
  const linha = { data: baseline.updated, metrics: baseline.metrics };
  fs.appendFileSync(arquivo, `${JSON.stringify(linha)}\n`);
  return [...historico, linha];
}

// ─── Main ────────────────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);
  const dados = carregar();

  if (args.includes('--check')) {
    const atual = fs.existsSync(ARQ.md) ? fs.readFileSync(ARQ.md, 'utf8') : '';
    if (atual !== markdown(montarEstado(dados))) {
      process.stderr.write('✗ docs/QUALIDADE.md está defasado. Rode: node scripts/raio-x.cjs\n');
      process.exit(1);
    }
    console.log('✓ raio-x em dia');
    return;
  }

  dados.historico = registrarHistorico(dados.baseline, dados.historico, ARQ.historico);
  const e = montarEstado(dados);
  fs.mkdirSync(path.dirname(ARQ.html), { recursive: true });
  fs.writeFileSync(ARQ.md, markdown(e));
  fs.writeFileSync(ARQ.html, html(e));
  if (fs.existsSync(ARQ.readme)) fs.writeFileSync(ARQ.readme, aplicarBloco(fs.readFileSync(ARQ.readme, 'utf8'), blocoReadme(e)));
  console.log(`✓ Raio-x: nota ${e.nota} (${e.score}/100) → docs/QUALIDADE.md, docs/qualidade/raio-x.html`);

  if (args.includes('--tasks')) {
    const hoje = new Date().toISOString().slice(0, 10);
    const r = sincronizarTarefas(fs.readFileSync(ARQ.backlog, 'utf8'), fs.readFileSync(ARQ.concluidas, 'utf8'), e, hoje);
    fs.writeFileSync(ARQ.backlog, r.backlog);
    fs.writeFileSync(ARQ.concluidas, r.concluidas);
    const abertas = situacaoTarefas(e).filter((t) => t.status !== 'verde').length;
    console.log(`✓ tasks: ${abertas} tema(s) aberto(s)${r.fechadas.length ? `, fechadas: ${r.fechadas.join('; ')}` : ''}`);
    console.log('  Rode: python3 scripts/prioridade.py all --write');
  }
}

if (require.main === module) main();

module.exports = { avaliar, pontuar, letra, hotspots, montarEstado, markdown, html, blocoReadme, aplicarBloco, sincronizarTarefas, situacaoTarefas, README_INI, README_FIM };
