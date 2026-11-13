// scripts/raio-x/catalogo.cjs — fonte única do raio-x: o que cada métrica do quality gate significa para quem não é
// técnico, quando está verde/amarela/vermelha, onde buscar os arquivos culpados e qual tarefa nasce dela.
//
// Faixas: `direcao: 'desc'` (menor é melhor) → verde se valor <= verde, amarela se <= amarelo, senão vermelha.
//         `direcao: 'asc'`  (maior é melhor) → verde se valor >= verde, amarela se >= amarelo, senão vermelha.
// Mudar uma faixa é mudar a política de qualidade: registre o porquê no commit.
//
// ADAPTE ao projeto: `PROJETO`, as chaves (iguais às de quality-baseline.json — api_*/web_* são do monorepo
// api+web; renomeie para as do seu gate) e os textos de `pergunta`/`impacto` com os nomes reais dos sistemas.
// Métrica do catálogo ausente no baseline aparece como ⚪ sem medição e não pesa na nota.

'use strict';

/** Nome do projeto nos documentos (sem isto, o nome da pasta). */
const PROJETO = 'Site Michelle Dantas Advocacia';

/** Peso de cada tema na nota geral. */
const TEMAS = {
  seguranca:    { nome: 'Segurança e LGPD', peso: 2, icone: '🛡️' },
  estabilidade: { nome: 'Estabilidade',     peso: 2, icone: '⚡' },
  testes:       { nome: 'Testes',           peso: 1.5, icone: '🧪' },
  manutencao:   { nome: 'Manutenção',       peso: 1, icone: '🔧' },
  arquitetura:  { nome: 'Arquitetura',      peso: 1, icone: '🏛️' },
};

/** Tarefas que o raio-x mantém em tasks/backlog.md. Título é a identidade do item — não mude por estilo. */
const TAREFAS = {
  timeout: { titulo: 'Chamadas a sistemas externos sem tempo limite (timeout)', area: 'desenvolvimento', esforco: 'p', modelo: 'sonnet' },
  retry: { titulo: 'Chamadas a sistemas externos sem nova tentativa (retry) nas leituras', area: 'desenvolvimento', esforco: 'm', modelo: 'sonnet' },
  breaker: { titulo: 'Circuit breaker nas integrações críticas (pagamento, ERP)', area: 'desenvolvimento', esforco: 'm', modelo: 'opus' },
  auditoria: { titulo: 'Trilha de auditoria (NORM04) nas rotas que mudam estado', area: 'seguranca', esforco: 'g', modelo: 'sonnet' },
  lgpd: { titulo: 'Dado pessoal aparecendo em log (LGPD)', area: 'seguranca', esforco: 'p', modelo: 'opus' },
  console: { titulo: 'Trocar `console.*` pelo Logger estruturado no código de produção', area: 'desenvolvimento', esforco: 'p', modelo: 'haiku' },
  complexidade: { titulo: 'Funções complexas demais: quebrar as piores (CCN acima de 10)', area: 'desenvolvimento', esforco: 'g', modelo: 'sonnet' },
  memoria: { titulo: 'Timers, listeners e caches que podem vazar memória', area: 'desenvolvimento', esforco: 'm', modelo: 'sonnet' },
  cobertura: { titulo: 'Cobertura de testes da API abaixo de 80%', area: 'desenvolvimento', esforco: 'g', modelo: 'sonnet' },
  quebrados: { titulo: 'Testes falhando ou erros de tipo no build', area: 'desenvolvimento', esforco: 'p', modelo: 'sonnet' },
  duplicacao: { titulo: 'Código duplicado acima de 3%', area: 'desenvolvimento', esforco: 'm', modelo: 'sonnet' },
  arquitetura: { titulo: 'Violações de fronteira de arquitetura', area: 'desenvolvimento', esforco: 'm', modelo: 'sonnet' },
  medicao: { titulo: 'io-budget e pico de heap sem medição — criar os testes que alimentam as métricas', area: 'desenvolvimento', esforco: 'm', modelo: 'sonnet' },
};

const RES = '.resilience-scan-report.json';
const CX = '.complexity-report.json';
const MEM = '.memory-guard-report.json';
const OBS = '.observability-report.json';
const ARCH = '.arch-scan-report.json';

/**
 * `detalhe(relatorios)` devolve a lista de achados `{ arquivo, linha, texto }` — a mesma função alimenta os
 * gráficos de "onde dói" e os sub-bullets das tarefas. `relatorios[ARQ]` é o JSON já lido (ou undefined).
 */
const porLocal = (lista) => (lista ?? []).map((s) => {
  const m = String(s).match(/^([^:\s]+):(\d+):?\s*(.*)$/);
  return m ? { arquivo: m[1], linha: Number(m[2]), texto: m[3] } : { arquivo: String(s), linha: null, texto: '' };
});

const METRICAS = [
  // Só as métricas que o gate deste projeto mede (site Next.js sem backend, sem banco, sem TypeScript).
  // Ao instalar outro guard (/tdd, /resilience-guard, /memory-guard…), traga a métrica dele do resource da skill /raio-x.
  {
    chave: 'obs_sensitive_in_log', tema: 'seguranca', direcao: 'desc', verde: 0, amarelo: 0, tarefa: 'lgpd', fonte: OBS,
    titulo: 'Dado pessoal aparecendo em log',
    pergunta: 'E-mail, CPF ou senha ficam gravados nos logs?',
    impacto: 'Vazamento de dado pessoal é incidente LGPD: notificação à ANPD e risco de multa.',
    detalhe: (r) => porLocal(r[OBS]?.detalhes?.sensiveis),
  },
  {
    chave: 'obs_missing_audit', tema: 'seguranca', direcao: 'desc', verde: 0, amarelo: 20, tarefa: 'auditoria',
    titulo: 'Ações sem registro de quem fez',
    pergunta: 'Se uma rota do site alterar algum dado, dá para saber quem fez?',
    impacto: 'Sem trilha de auditoria não há como investigar fraude, erro de operador ou atender a NORM04.',
    detalhe: (r) => porLocal(r[OBS]?.detalhes?.semAuditoria),
  },
  {
    chave: 'obs_unstructured_logs', tema: 'seguranca', direcao: 'desc', verde: 0, amarelo: 10, tarefa: 'console',
    titulo: 'Logs fora do padrão (console)',
    pergunta: 'Todos os logs passam pela máscara de dado pessoal?',
    impacto: 'Log fora do Logger não é mascarado nem rastreável por requisição.',
    detalhe: (r) => porLocal(r[OBS]?.detalhes?.naoEstruturados),
  },
  {
    chave: 'complexity_worst', tema: 'manutencao', direcao: 'desc', verde: 15, amarelo: 30, tarefa: 'complexidade',
    titulo: 'A função mais complicada do sistema',
    pergunta: 'Existe código que ninguém tem coragem de mexer?',
    impacto: 'Quanto maior o número, mais caminhos possíveis — e mais caro e arriscado mudar.',
    detalhe: (r) => (r[CX]?.acima_do_limite ?? []).slice(0, 1).map((f) => ({ arquivo: f.arquivo, linha: f.linha_inicio, texto: `${f.funcao} (CCN ${f.ccn})` })),
  },
  {
    chave: 'complexity_over_limit', tema: 'manutencao', direcao: 'desc', verde: 10, amarelo: 50, tarefa: 'complexidade',
    titulo: 'Funções complicadas demais',
    pergunta: 'Quantos trechos são difíceis de entender e testar?',
    impacto: 'Cada um é um lugar onde mudança simples vira dia de trabalho e bug novo.',
    detalhe: (r) => (r[CX]?.acima_do_limite ?? []).map((f) => ({ arquivo: f.arquivo, linha: f.linha_inicio, texto: `${f.funcao} (CCN ${f.ccn})` })),
  },
  {
    chave: 'code_duplicates_pct', tema: 'manutencao', direcao: 'desc', verde: 3, amarelo: 5, tarefa: 'duplicacao', unidade: '%',
    titulo: 'Código copiado e colado',
    pergunta: 'Corrigir um bug exige lembrar de corrigir em vários lugares?',
    impacto: 'Cópia esquecida mantém o bug vivo depois da correção.', detalhe: () => [],
  },
];

/** Números que aparecem no raio-x sem semáforo (contexto, não meta). */
const INFORMATIVOS = [
];

const RELATORIOS = [RES, CX, MEM, OBS, ARCH];

module.exports = { PROJETO, TEMAS, TAREFAS, METRICAS, INFORMATIVOS, RELATORIOS };
