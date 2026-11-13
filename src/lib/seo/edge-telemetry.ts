/**
 * Funções puras do registro de borda (`netlify/edge-functions/crawler-log.ts`).
 *
 * Rodam em Deno na borda e em Node nos testes: nada de alias `@/`, e import local
 * sempre com extensão `.ts`.
 *
 * Contrato de privacidade: nada daqui devolve endereço IP, user-agent bruto, URL de
 * referência completa, cookie ou query string. Headers entram só para decidir um
 * veredito e são descartados.
 *
 * Portado de PLATAFORMA-CURSOS/src/lib/seo/edge-telemetry.ts; os comentários de lá
 * guardam as medições que motivaram cada regra.
 */
import { CRAWLER_POLICIES, type CrawlerPolicy } from "./crawlers.ts";

/** Robô conhecido e observável cujo token está contido no user-agent, ou null. */
export function normalizeCrawlerToken(userAgent: string): CrawlerPolicy | null {
  const normalized = userAgent.toLowerCase();
  return (
    CRAWLER_POLICIES.find(
      ({ robotsToken, httpObservable }) =>
        httpObservable && normalized.includes(robotsToken.toLowerCase()),
    ) ?? null
  );
}

// `bot\b` sem fronteira à esquerda casa "Googlebot"/"DuckDuckBot"; `\bbot\b` não casava.
const AUTOMATION_UA =
  /bot\b|crawler|spider|scraper|headless|phantomjs|selenium|playwright|puppeteer|python|httpx|aiohttp|scrapy|curl\/|wget|libwww|okhttp|go-http-client|java\/|node-fetch|axios\/|got\/|guzzle|jsdom|urllib|restsharp|apache-httpclient|http[-_ ]?client|fetcher|monitoring|uptime|probe\/|facebookexternalhit|whatsapp|telegrambot|slackbot|discordbot|linkedinbot/i;

function declaredMajorVersion(userAgent: string, product: RegExp): number | null {
  const match = product.exec(userAgent);
  return match ? Number.parseInt(match[1], 10) : null;
}

/**
 * Navegador real manda `sec-fetch-*` (Chromium ≥ 76, Firefox ≥ 90) e
 * `accept-language`. UA de navegador sem esses headers é ferramenta com string
 * emprestada.
 */
function missingBrowserHeaders(userAgent: string, headers: Headers): boolean {
  const hasSecFetch = headers.has("sec-fetch-mode") || headers.has("sec-fetch-site");
  const chrome = declaredMajorVersion(userAgent, /Chrome\/(\d+)/i);
  const firefox = declaredMajorVersion(userAgent, /Firefox\/(\d+)/i);
  if (!hasSecFetch && ((chrome !== null && chrome >= 76) || (firefox !== null && firefox >= 90))) {
    return true;
  }
  return /Mozilla\//i.test(userAgent) && !headers.has("accept-language");
}

/** Automação que não está na lista de robôs conhecidos (scraper, preview de link, monitor). */
export function hasAutomationSignal(userAgent: string, headers?: Headers): boolean {
  const agent = userAgent.trim();
  if (!agent) return true;
  if (AUTOMATION_UA.test(agent)) return true;
  return headers ? missingBrowserHeaders(agent, headers) : false;
}

/** Busca especulativa do navegador — a requisição segue, mas não é visualização. */
export function isPrefetchRequest(headers: Headers): boolean {
  return [headers.get("sec-purpose"), headers.get("purpose"), headers.get("x-moz")].some(
    (value) =>
      (value ?? "")
        .toLowerCase()
        .split(/[;,]/)
        .some((part) => part.trim() === "prefetch"),
  );
}

/** Endpoint do beacon que o navegador dispara a cada troca de rota da SPA. */
export const PAGE_VIEW_BEACON_PATH = "/_pv";

const SAFE_PATH = /^\/[a-z0-9\-._~/]{0,199}$/i;

/**
 * Caminho informado pelo beacon (`/_pv?p=/palestras`), ou null se não parecer rota do
 * site. Só caminho: query string e fragmento nunca entram.
 */
export function parseBeaconPath(raw: string | null): string | null {
  if (!raw || !SAFE_PATH.test(raw) || raw.includes("//")) return null;
  return raw;
}

/** Deploy preview, alias `*.netlify.app` e máquina local não são audiência. */
export function isEnvironmentHost(host: string): boolean {
  const normalized = host.trim().toLowerCase().replace(/:\d+$/, "");
  if (!normalized) return false;
  if (normalized === "localhost" || normalized.endsWith(".localhost")) return true;
  if (normalized === "127.0.0.1" || normalized === "[::1]") return true;
  return normalized.endsWith(".netlify.app");
}

const semWww = (host: string) => host.toLowerCase().replace(/\.$/, "").replace(/^www\./, "");

/**
 * Só o domínio do referrer, nunca a URL completa. Referrer do próprio site (com ou sem
 * `www`) vira null: é navegação interna ou o redirect www→apex, não origem de tráfego.
 */
export function extractReferrerHost(referrer: string | null, ownHost?: string): string | null {
  if (!referrer) return null;
  try {
    const host = new URL(referrer).hostname.toLowerCase().replace(/\.$/, "");
    if (!host || (ownHost && semWww(host) === semWww(ownHost))) return null;
    return host;
  } catch {
    return null;
  }
}

export interface AllowedUtm {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
}

const SAFE_UTM_VALUE = /^[a-z0-9][a-z0-9._-]{0,119}$/;
// E-mail, telefone ou CPF colado no link: não grava (dado pessoal).
const LOOKS_PERSONAL = /@|[0-9]{8,}/;

function utmValue(raw: string | null): string | null {
  if (!raw) return null;
  const value = raw
    .replace(/\p{Cc}/gu, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .slice(0, 120);
  return SAFE_UTM_VALUE.test(value) && !LOOKS_PERSONAL.test(value) ? value : null;
}

/** Os 4 parâmetros nomeados, sanitizados. O resto da query string nunca é lido. */
export function extractAllowedUtm(searchParams: URLSearchParams): AllowedUtm {
  return {
    utm_source: utmValue(searchParams.get("utm_source")),
    utm_medium: utmValue(searchParams.get("utm_medium")),
    utm_campaign: utmValue(searchParams.get("utm_campaign")),
    utm_content: utmValue(searchParams.get("utm_content")),
  };
}

/** Seções do site com cardinalidade fechada; ajuste na instalação. Caminho fora delas conta como "other". */
const SECTIONS = ["/blog"] as const;
const DISCOVERY_FILES = /^\/(robots\.txt|sitemap[\w-]*\.xml|llms[\w-]*\.txt|\.well-known\/.*)$/i;

/** Seção de cardinalidade fechada — path livre não vira categoria. */
export function sectionForPath(pathname: string): string {
  if (pathname === "/") return "home";
  if (DISCOVERY_FILES.test(pathname)) return "descoberta";
  const section = SECTIONS.find((s) => pathname === s || pathname.startsWith(`${s}/`));
  return section ? section.slice(1) : "other";
}

export function responseCameFromCache(response: Response): boolean | null {
  const value = response.headers.get("cache-status") ?? response.headers.get("x-nf-cache-status");
  if (value) return /\b(hit|cached)\b/i.test(value);
  if (response.headers.has("age")) return true;
  return null;
}

/** Visualização é página HTML entregue com sucesso; 404 de varredura não conta. */
export function isCountablePageView(response: Response): boolean {
  const type = response.headers.get("content-type") ?? "";
  return response.status >= 200 && response.status < 400 && type.includes("text/html");
}
