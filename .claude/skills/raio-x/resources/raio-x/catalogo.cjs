// scripts/raio-x/catalogo.cjs (RESOURCE da skill /raio-x) — fonte única do raio-x: o que cada métrica do quality gate significa para quem não é
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
const PROJETO = null;

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
  // ── Estabilidade ──────────────────────────────────────────────────────────
  {
    chave: 'resilience_missing_timeouts', tema: 'estabilidade', direcao: 'desc', verde: 0, amarelo: 5, tarefa: 'timeout',
    titulo: 'Chamadas a sistemas de fora sem tempo limite',
    pergunta: 'O que acontece se um fornecedor (ERP, pagamento, mensageria) travar?',
    impacto: 'A requisição fica presa esperando para sempre; com várias presas, a API para de responder a todos.',
    detalhe: (r) => porLocal(r[RES]?.details?.http_without_timeout_todos),
  },
  {
    chave: 'resilience_missing_retries', tema: 'estabilidade', direcao: 'desc', verde: 5, amarelo: 15, tarefa: 'retry',
    titulo: 'Chamadas a sistemas de fora sem nova tentativa',
    pergunta: 'O que acontece numa falha de rede de 1 segundo?',
    impacto: 'Um soluço da rede vira erro na tela do cliente, em vez de o sistema tentar de novo sozinho.',
    detalhe: (r) => porLocal(r[RES]?.details?.http_without_retry_todos),
  },
  {
    chave: 'resilience_missing_cb', tema: 'estabilidade', direcao: 'desc', verde: 0, amarelo: 0, tarefa: 'breaker',
    titulo: 'Sem disjuntor (circuit breaker) nas integrações',
    pergunta: 'Se o meio de pagamento cair, o resto do sistema cai junto?',
    impacto: 'A falha de um fornecedor se espalha para telas e fluxos que nem dependem dele.',
    rotulo: (v) => (v ? 'ausente' : 'presente'), metaTexto: 'presente',
    detalhe: () => [],
  },
  {
    chave: 'memory_static_findings', tema: 'estabilidade', direcao: 'desc', verde: 0, amarelo: 10, tarefa: 'memoria',
    titulo: 'Pontos que podem vazar memória',
    pergunta: 'O servidor fica mais lento com o passar dos dias?',
    impacto: 'Timers e caches que nunca limpam fazem a memória crescer até o servidor reiniciar.',
    detalhe: (r) => porLocal((r[MEM]?.findings ?? []).map((f) => f.location)),
  },
  {
    chave: 'io_sql_worst', tema: 'estabilidade', direcao: 'desc', verde: 10, amarelo: 30, tarefa: 'medicao',
    titulo: 'Consultas ao banco por requisição (pior caso)',
    pergunta: 'Alguma tela faz centenas de consultas para mostrar uma lista?',
    impacto: 'É o "N+1": a tela fica lenta conforme a base cresce.',
    detalhe: () => [],
  },
  {
    chave: 'io_http_worst', tema: 'estabilidade', direcao: 'desc', verde: 3, amarelo: 10, tarefa: 'medicao',
    titulo: 'Chamadas externas por requisição (pior caso)',
    pergunta: 'Uma ação do cliente dispara muitas chamadas a fornecedores?',
    impacto: 'Cada chamada externa soma tempo e custo, e é mais um ponto de falha.',
    detalhe: () => [],
  },
  {
    chave: 'memory_alloc_max_kb', tema: 'estabilidade', direcao: 'desc', verde: 51200, amarelo: 262144, tarefa: 'medicao',
    titulo: 'Memória retida por operação (KB)',
    pergunta: 'Uma operação pesada deixa memória presa?',
    impacto: 'Memória retida acumula entre requisições e derruba o processo.',
    detalhe: () => [],
  },
  // ── Segurança e LGPD ──────────────────────────────────────────────────────
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
    pergunta: 'Se um pedido for cancelado ou um preço mudar, dá para saber quem fez?',
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
  // ── Testes ────────────────────────────────────────────────────────────────
  {
    chave: 'api_tests_failed', tema: 'testes', direcao: 'desc', verde: 0, amarelo: 0, tarefa: 'quebrados',
    titulo: 'Testes do backend falhando', pergunta: 'Algum comportamento conhecido quebrou?',
    impacto: 'Teste vermelho é funcionalidade que deixou de funcionar como combinado.', detalhe: () => [],
  },
  {
    chave: 'web_tests_failed', tema: 'testes', direcao: 'desc', verde: 0, amarelo: 0, tarefa: 'quebrados',
    titulo: 'Testes do site falhando', pergunta: 'Alguma regra do site quebrou?',
    impacto: 'Teste vermelho é funcionalidade que deixou de funcionar como combinado.', detalhe: () => [],
  },
  {
    chave: 'api_coverage_pct', tema: 'testes', direcao: 'asc', verde: 80, amarelo: 60, tarefa: 'cobertura', unidade: '%',
    titulo: 'Quanto do código da API é testado',
    pergunta: 'Se alguém mexer no código, os testes avisam se quebrou algo?',
    impacto: 'Código sem teste quebra em silêncio: o erro só aparece com o cliente.', detalhe: () => [],
  },
  {
    chave: 'property_tests_count', tema: 'testes', direcao: 'asc', verde: 1, amarelo: 1,
    titulo: 'Testes que exploram combinações automaticamente',
    pergunta: 'As regras críticas são testadas com milhares de entradas geradas?',
    impacto: 'Pegam casos de borda que ninguém pensaria em escrever à mão.', detalhe: () => [],
  },
  // ── Manutenção ────────────────────────────────────────────────────────────
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
  {
    chave: 'api_ts_errors', tema: 'manutencao', direcao: 'desc', verde: 0, amarelo: 0, tarefa: 'quebrados',
    titulo: 'Erros de tipo na API', pergunta: 'O código compila sem erro?',
    impacto: 'Erro de tipo é bug que o compilador já encontrou.', detalhe: () => [],
  },
  {
    chave: 'web_ts_errors', tema: 'manutencao', direcao: 'desc', verde: 0, amarelo: 0, tarefa: 'quebrados',
    titulo: 'Erros de tipo no site', pergunta: 'O site compila sem erro?',
    impacto: 'Erro de tipo é bug que o compilador já encontrou.', detalhe: () => [],
  },
  // ── Arquitetura ───────────────────────────────────────────────────────────
  {
    chave: 'arch_violations', tema: 'arquitetura', direcao: 'desc', verde: 0, amarelo: 10, tarefa: 'arquitetura',
    titulo: 'Camadas do sistema se misturando',
    pergunta: 'A regra de negócio está no lugar certo?',
    impacto: 'Camada misturada faz uma mudança pequena se espalhar por muitos arquivos.',
    detalhe: (r) => (r[ARCH]?.byRule ?? []).flatMap((x) => x.samples ?? []).map((s) => ({ arquivo: String(s).split(' → ')[0], linha: null, texto: String(s) })),
  },
  {
    chave: 'arch_cycles', tema: 'arquitetura', direcao: 'desc', verde: 0, amarelo: 5, tarefa: 'arquitetura',
    titulo: 'Dependências circulares',
    pergunta: 'Tem arquivo que depende de si mesmo por um caminho indireto?',
    impacto: 'Ciclo faz o sistema subir na ordem errada e dificulta testar as partes isoladas.', detalhe: () => [],
  },
];

/** Números que aparecem no raio-x sem semáforo (contexto, não meta). */
const INFORMATIVOS = [
  { chave: 'api_tests_passed', titulo: 'Testes automáticos da API' },
  { chave: 'web_tests_passed', titulo: 'Testes automáticos do site' },
  { chave: 'frontend_http_sem_timeout', titulo: 'Chamadas do navegador sem tempo limite', fonte: RES,
    ler: (r) => r[RES]?.details?.frontend_http_ignorado ?? null },
];

const RELATORIOS = [RES, CX, MEM, OBS, ARCH];

module.exports = { PROJETO, TEMAS, TAREFAS, METRICAS, INFORMATIVOS, RELATORIOS };
