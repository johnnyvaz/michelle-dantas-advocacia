/**
 * `fetch` com timeout que LIMPA o timer quando a resposta chega.
 * `AbortSignal.timeout(ms)` mantém um timer vivo até disparar — em execuções seguidas da mesma
 * instância isso retém memória (medido pelo memory-guard em 2026-11-02: 512 → 1280 KB em 500 chamadas).
 *
 * Retry é OPT-IN (`retries`, padrão 0): só repete em falha transitória — erro de rede, timeout, 429 ou
 * 5xx — com espera crescente. Padrão 0 porque quase toda chamada aqui é POST que grava (inscrição,
 * linha de telemetria, +1 no contador): repetir às cegas duplica dado. Só ligue onde repetir é seguro
 * (GET, ou POST idempotente, como evento da Meta com `event_id`, que ela deduplica).
 */
const TRANSITORIO = (status) => status === 429 || status >= 500;

/**
 * Repete `tentar` enquanto o resultado for transitório (ou lançar erro), até `retries` vezes, com espera
 * crescente (`backoffMs`, `2×`, `4×`…). Na última tentativa devolve o que vier, ou propaga o erro.
 */
async function comRetry(tentar, { retries, backoffMs }) {
  for (let tentativa = 0; ; tentativa += 1) {
    const ultima = tentativa >= retries;
    try {
      const resposta = await tentar();
      if (ultima || !TRANSITORIO(resposta.status)) return resposta;
    } catch (erro) {
      if (ultima) throw erro;
    }
    await new Promise((resolve) => setTimeout(resolve, backoffMs * 2 ** tentativa));
  }
}

export async function fetchComTimeout(url, init = {}, ms = 5000, { retries = 0, backoffMs = 250 } = {}) {
  return comRetry(async () => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ms);
    try {
      return await fetch(url, { ...init, signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }
  }, { retries, backoffMs });
}
