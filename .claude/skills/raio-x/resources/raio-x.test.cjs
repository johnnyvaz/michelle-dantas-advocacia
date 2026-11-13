// node --test scripts/raio-x.test.cjs
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const rx = require('./raio-x.cjs');
const { TAREFAS } = require('./raio-x/catalogo.cjs');

const desc = { direcao: 'desc', verde: 0, amarelo: 5 };
const asc = { direcao: 'asc', verde: 80, amarelo: 60 };

test('semáforo nas bordas (desc e asc) e sem medição', () => {
  assert.equal(rx.avaliar(desc, 0), 'verde');
  assert.equal(rx.avaliar(desc, 5), 'amarelo');
  assert.equal(rx.avaliar(desc, 6), 'vermelho');
  assert.equal(rx.avaliar(asc, 80), 'verde');
  assert.equal(rx.avaliar(asc, 60), 'amarelo');
  assert.equal(rx.avaliar(asc, 59.9), 'vermelho');
  assert.equal(rx.avaliar(desc, null), 'sem_medicao');
});

test('nota: sem medição não conta; LGPD vermelho limita a D', () => {
  const tudoVerde = [{ tema: 'testes', status: 'verde' }, { tema: 'estabilidade', status: 'sem_medicao' }];
  assert.equal(rx.pontuar(tudoVerde).nota, 'A');
  const comLgpd = [
    { tema: 'testes', status: 'verde' }, { tema: 'manutencao', status: 'verde' }, { tema: 'arquitetura', status: 'verde' },
    { tema: 'estabilidade', status: 'verde' }, { chave: 'obs_sensitive_in_log', tema: 'seguranca', status: 'vermelho' },
    { tema: 'seguranca', status: 'verde' }, { tema: 'seguranca', status: 'verde' }, { tema: 'seguranca', status: 'verde' },
  ];
  assert.ok(rx.pontuar(comLgpd).score >= 75);
  assert.equal(rx.pontuar(comLgpd).nota, 'D');
});

test('hotspots: conta cada arquivo:linha uma vez e ordena pelo total', () => {
  const achados = [
    { arquivo: 'a.ts', linha: 1 }, { arquivo: 'a.ts', linha: 1 }, { arquivo: 'a.ts', linha: 2 },
    { arquivo: 'b.ts', linha: 9 }, { arquivo: 'c.ts', linha: null, texto: 'x → y' },
  ];
  assert.deepEqual(rx.hotspots(achados, 2), [{ arquivo: 'a.ts', total: 2 }, { arquivo: 'b.ts', total: 1 }]);
});

test('detalhe lê os três formatos de achado dos scanners', () => {
  const e = rx.montarEstado({
    baseline: { updated: '2026-11-02', metrics: { resilience_missing_timeouts: 2, complexity_over_limit: 1, memory_static_findings: 1 } },
    relatorios: {
      '.resilience-scan-report.json': { details: { http_without_timeout_todos: ['api/x.ts:10: fetch(url', 'api/x.ts:20: fetch(u'] } },
      '.complexity-report.json': { acima_do_limite: [{ arquivo: 'web/p.tsx', linha_inicio: 5, funcao: 'P', ccn: 40 }] },
      '.memory-guard-report.json': { findings: [{ location: 'api/t.ts:3:  setInterval(' }] },
    },
    historico: [],
  });
  const por = Object.fromEntries(e.avaliacoes.map((a) => [a.chave, a]));
  assert.deepEqual(por.resilience_missing_timeouts.piores, [{ arquivo: 'api/x.ts', total: 2 }]);
  assert.equal(por.complexity_over_limit.achados[0].texto, 'P (CCN 40)');
  assert.equal(por.memory_static_findings.achados[0].linha, 3);
});

test('bloco do README: reescreve só entre os marcadores', () => {
  const antes = `# Projeto\n\ntexto\n\n${rx.README_INI}\nvelho\n${rx.README_FIM}\n\nrodapé\n`;
  const depois = rx.aplicarBloco(antes, `${rx.README_INI}\nnovo\n${rx.README_FIM}`);
  assert.equal(depois, `# Projeto\n\ntexto\n\n${rx.README_INI}\nnovo\n${rx.README_FIM}\n\nrodapé\n`);
  assert.match(rx.aplicarBloco('# Sem bloco\n', 'X'), /# Sem bloco\n\nX\n$/);
});

function estado(timeouts) {
  return rx.montarEstado({
    baseline: { updated: '2026-11-02', metrics: { resilience_missing_timeouts: timeouts, api_coverage_pct: 90, complexity_worst: 1, complexity_over_limit: 0 } },
    relatorios: { '.resilience-scan-report.json': { details: { http_without_timeout_todos: ['api/x.ts:10: fetch('] } } },
    historico: [],
  });
}

const BACKLOG = '# Backlog\n\n## Alta Prioridade 🔺\n\n## Média Prioridade 🔼\n\n## Baixa Prioridade 🔽\n';

test('tarefas: idempotente, preserva sub-bullets manuais e fecha quando fica verde', () => {
  const titulo = TAREFAS.timeout.titulo;
  const um = rx.sincronizarTarefas(BACKLOG, '# Concluídas\n', estado(13), '2026-11-02');
  assert.match(um.backlog, new RegExp(`- \\[ \\] ${titulo.replace(/[()]/g, '\\$&')} 📅 2026-11-02 🔺 alta`));
  const dois = rx.sincronizarTarefas(um.backlog, um.concluidas, estado(13), '2026-11-02');
  assert.equal(dois.backlog, um.backlog);

  const comNota = dois.backlog.replace(/(\*\*Onde \(raio-x\):\*\*[^\n]*)/, '$1\n  - Decisão do dono: manter');
  const tres = rx.sincronizarTarefas(comNota, dois.concluidas, estado(3), '2026-11-02');
  assert.match(tres.backlog, /Decisão do dono: manter/);
  assert.match(tres.backlog, /Chamadas a sistemas de fora sem tempo limite: 3/);

  const fechado = rx.sincronizarTarefas(tres.backlog, tres.concluidas, estado(0), '2026-11-03');
  assert.doesNotMatch(fechado.backlog, new RegExp(titulo.replace(/[()]/g, '\\$&')));
  assert.match(fechado.concluidas, /- \[x\] Chamadas a sistemas externos sem tempo limite \(timeout\).*✅ 2026-11-03/);
  assert.match(fechado.concluidas, /Decisão do dono: manter/);
});
