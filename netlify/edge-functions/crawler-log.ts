/**
 * Registro de borda: robô conhecido → `mdantas.crawler_hits`; página HTML entregue
 * → contador agregado `mdantas.page_view_counts`.
 *
 * Roda na borda (não na origem) porque resposta servida do cache nunca chega à
 * origem — logar lá perderia os acessos mais numerosos. Grava `status` porque é ele
 * que detecta o Googlebot levando 403 depois de alguém mexer na borda.
 *
 * Navegação interna da SPA não pede HTML à borda: o navegador avisa por beacon em
 * `/_pv?p=<caminho>` (hook `usePageViewBeacon`), contado com `p_source: "spa"`.
 *
 * Fail-open: a gravação vai para `waitUntil` depois de `context.next()`, nunca
 * bloqueia nem altera a resposta; erro do próprio código cai em `onError: "bypass"`.
 *
 * Contrato portado de PLATAFORMA-CURSOS (specs/040-indexacao-seo-aeo/contracts/crawler-log.md),
 * via SITE-JOHNNY-VAZ. Modelo do Sextante: templates/adaptadores/netlify (spec 003).
 */
import {
  extractAllowedUtm,
  extractReferrerHost,
  hasAutomationSignal,
  isCountablePageView,
  isEnvironmentHost,
  isPrefetchRequest,
  normalizeCrawlerToken,
  PAGE_VIEW_BEACON_PATH,
  parseBeaconPath,
  responseCameFromCache,
  sectionForPath,
} from "../../src/lib/seo/edge-telemetry.ts";
import {
  getCachedVerificationRanges,
  googleDnsReverseLookup,
  verifyCrawlerIdentity,
} from "../../src/lib/seo/crawler-verification.ts";
import { fetchComTimeout } from "../functions/_lib/fetch-timeout.js";
import { logErro } from "../functions/_lib/log.js";

declare const Deno: { env: { get(name: string): string | undefined } };

export interface EdgeContext {
  ip?: string;
  deploy?: { id?: string };
  next(): Promise<Response>;
  waitUntil(promise: Promise<unknown>): void;
}

/** As tabelas vivem no schema do site, não no `public` compartilhado do projeto Supabase. */
const SCHEMA = "mdantas";

/** Teto de cada chamada externa da borda (Supabase, DNS do Google, faixas de IP): roda em `waitUntil`, não segura a resposta. */
const ESPERA_MAX_MS = 3000;
const fetchBorda = ((input: string, init?: RequestInit) => fetchComTimeout(input, init, ESPERA_MAX_MS)) as typeof fetch;

async function supabaseWrite(path: string, body: unknown): Promise<void> {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY ausentes na borda");
  // Sem retry de propósito: RPC de incremento não é idempotente (repetir conta em dobro).
  const response = await fetchComTimeout(`${url}${path}`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "Content-Profile": SCHEMA,
      Prefer: "return=minimal",
    },
    body: JSON.stringify(body),
  }, ESPERA_MAX_MS);
  if (!response.ok) throw new Error(`Supabase respondeu ${response.status} em ${path}`);
}

async function persist(
  request: Request,
  response: Response,
  context: EdgeContext,
  bot: ReturnType<typeof normalizeCrawlerToken>,
  countPageView: boolean,
): Promise<void> {
  const url = new URL(request.url);
  const host = url.hostname.toLowerCase();
  const now = new Date();
  const writes: Promise<void>[] = [];

  if (countPageView) {
    const kind = bot || hasAutomationSignal(request.headers.get("user-agent") ?? "", request.headers) ? "bot" : "human";
    const utm = extractAllowedUtm(url.searchParams);
    // Os nomes levam o prefixo `p_` da assinatura: sem ele o PostgREST responde 404
    // e o contador fica zerado sem nada falhar visivelmente (aconteceu na referência).
    writes.push(
      supabaseWrite("/rest/v1/rpc/increment_page_view_count", {
        p_day: now.toISOString().slice(0, 10),
        p_hour: now.getUTCHours(),
        p_host: host,
        p_path: url.pathname,
        p_referrer_host: extractReferrerHost(request.headers.get("referer"), host),
        p_kind: kind,
        p_utm_source: utm.utm_source,
        p_utm_medium: utm.utm_medium,
        p_utm_campaign: utm.utm_campaign,
        p_utm_content: utm.utm_content,
      }),
    );
  }

  if (bot) {
    // Verificação só aqui, depois de next(): DNS/faixas nunca atrasam a entrega.
    const address = context.ip ?? request.headers.get("x-nf-client-connection-ip") ?? "";
    const verification = await verifyCrawlerIdentity(bot.robotsToken, address, {
      ranges: bot.operator === "OpenAI" || bot.operator === "Perplexity" ? await getCachedVerificationRanges(fetchBorda) : undefined,
      reverseLookup: (address) => googleDnsReverseLookup(address, fetchBorda),
    });
    writes.push(
      supabaseWrite("/rest/v1/crawler_hits", {
        bot: bot.robotsToken,
        category: bot.category,
        host,
        path: url.pathname,
        section: sectionForPath(url.pathname),
        status: response.status,
        from_cache: responseCameFromCache(response),
        ...verification,
        served_build_id: context.deploy?.id ?? null,
      }),
    );
  }

  await Promise.all(writes);
}

/** Resposta única do beacon, aceito ou não: o endpoint não serve de oráculo. */
const semConteudo = () => new Response(null, { status: 204, headers: { "cache-control": "no-store" } });

/** Beacon de troca de rota: conta `source = spa`, sem referrer nem UTM (a entrada já levou). */
function handleBeacon(request: Request, context: EdgeContext, url: URL): Response {
  const path = parseBeaconPath(url.searchParams.get("p"));
  // `same-origin` barra outro site inflando o contador pelo navegador do visitante.
  const sameOrigin = request.headers.get("sec-fetch-site") === "same-origin";
  if (request.method !== "POST" || !path || !sameOrigin || isEnvironmentHost(url.host)) return semConteudo();

  const userAgent = request.headers.get("user-agent") ?? "";
  const kind = normalizeCrawlerToken(userAgent) || hasAutomationSignal(userAgent, request.headers) ? "bot" : "human";
  const now = new Date();
  context.waitUntil(
    supabaseWrite("/rest/v1/rpc/increment_page_view_count", {
      p_day: now.toISOString().slice(0, 10),
      p_hour: now.getUTCHours(),
      p_host: url.hostname.toLowerCase(),
      p_path: path,
      p_kind: kind,
      p_source: "spa",
    }).catch((error) => {
      logErro("edge:crawler-log.falha_beacon", { erro: error?.message });
    }),
  );
  return semConteudo();
}

export default async function crawlerLog(request: Request, context: EdgeContext): Promise<Response | undefined> {
  const url = new URL(request.url);
  if (url.pathname === PAGE_VIEW_BEACON_PATH) return handleBeacon(request, context, url);
  if (request.method !== "GET") return undefined;
  if (isEnvironmentHost(url.host)) return undefined;

  const bot = normalizeCrawlerToken(request.headers.get("user-agent") ?? "");
  const response = await context.next();
  const countPageView = !isPrefetchRequest(request.headers) && isCountablePageView(response);
  if (!bot && !countPageView) return response;

  context.waitUntil(
    persist(request, response, context, bot, countPageView).catch((error) => {
      logErro("edge:crawler-log.falha_gravacao", { erro: error?.message });
    }),
  );
  return response;
}

export const config = {
  path: "/*",
  // Asset estático não é página nem sinal de robô útil; robots.txt, sitemap e
  // llms.txt continuam cobertos — saber que o robô os leu é parte da medição.
  excludedPath: ["/assets/*", "/images/*", "/fonts/*", "/api/*", "/.netlify/*", "/*.js", "/*.css", "/*.map", "/*.png", "/*.jpg", "/*.jpeg", "/*.webp", "/*.avif", "/*.svg", "/*.ico", "/*.gif", "/*.woff", "/*.woff2", "/*.mp4", "/*.pdf"],
  onError: "bypass",
};
