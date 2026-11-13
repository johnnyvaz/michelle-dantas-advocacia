/**
 * Fonte única da política de robôs do cursos.johnnyvaz.com.br.
 *
 * Duas coisas leem daqui: o registro de borda (`netlify/edge-functions/crawler-log.ts`),
 * que só reconhece robô listado, e o teste de contrato que confere `public/robots.txt`
 * contra esta lista — liberar um agente no robots sem o log saber que ele existe
 * reprova no CI.
 *
 * Política padrão do modelo do Sextante: busca, citação e treino liberados (site vitrine).
 * Site com acervo pago a proteger revê a categoria `ai-training` antes de publicar.
 *
 * Portado do SITE-JOHNNY-VAZ (2026-11-13), que veio de PLATAFORMA-CURSOS (spec 040)
 * sem multi-tenant.
 */

export type CrawlerCategory = "search" | "ai-citation" | "ai-grounding" | "ai-training";

export interface CrawlerPolicy {
  robotsToken: string;
  category: CrawlerCategory;
  operator: string;
  /**
   * `false` para tokens que são só controle no robots.txt e nunca fazem requisição
   * (Google-Extended, Applebot-Extended). Esperar vê-los no registro é erro de
   * expectativa — o teste trava essa regressão.
   */
  httpObservable: boolean;
  allowed: boolean;
}

const policy = (
  robotsToken: string,
  category: CrawlerCategory,
  operator: string,
  httpObservable = true,
): CrawlerPolicy => ({ robotsToken, category, operator, httpObservable, allowed: true });

/**
 * A ordem importa: `normalizeCrawlerToken` devolve o PRIMEIRO token contido no
 * user-agent. Token que é prefixo de outro (Applebot × Applebot-Extended) só é
 * seguro porque o mais longo não é observável por HTTP.
 */
export const CRAWLER_POLICIES: readonly CrawlerPolicy[] = [
  policy("Googlebot", "search", "Google"),
  policy("Bingbot", "search", "Microsoft"),
  policy("Applebot", "search", "Apple"),
  policy("DuckDuckBot", "search", "DuckDuckGo"),
  policy("YandexBot", "search", "Yandex"),

  policy("OAI-SearchBot", "ai-citation", "OpenAI"),
  policy("ChatGPT-User", "ai-citation", "OpenAI"),
  policy("Claude-SearchBot", "ai-citation", "Anthropic"),
  policy("Claude-User", "ai-citation", "Anthropic"),
  policy("PerplexityBot", "ai-citation", "Perplexity"),
  policy("Perplexity-User", "ai-citation", "Perplexity"),

  // Treino E fundamentação do Gemini no mesmo token; não faz requisição própria.
  policy("Google-Extended", "ai-grounding", "Google", false),

  policy("GPTBot", "ai-training", "OpenAI"),
  policy("ClaudeBot", "ai-training", "Anthropic"),
  policy("Claude-Web", "ai-training", "Anthropic"),
  policy("anthropic-ai", "ai-training", "Anthropic"),
  policy("Applebot-Extended", "ai-training", "Apple", false),
  policy("CCBot", "ai-training", "Common Crawl"),
  policy("Bytespider", "ai-training", "ByteDance"),
  policy("meta-externalagent", "ai-training", "Meta"),
  policy("FacebookBot", "ai-training", "Meta"),
  policy("Amazonbot", "ai-training", "Amazon"),
  policy("cohere-training-data-crawler", "ai-training", "Cohere"),
  policy("cohere-ai", "ai-training", "Cohere"),
  policy("AI2Bot", "ai-training", "Allen Institute"),
  policy("Diffbot", "ai-training", "Diffbot"),
  policy("PanguBot", "ai-training", "Huawei"),
  policy("Timpibot", "ai-training", "Timpi"),
];
