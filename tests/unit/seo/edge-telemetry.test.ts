import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { CRAWLER_POLICIES } from "../../../src/lib/seo/crawlers.ts";
import {
  extractAllowedUtm,
  extractReferrerHost,
  hasAutomationSignal,
  isCountablePageView,
  isEnvironmentHost,
  isPrefetchRequest,
  normalizeCrawlerToken,
  sectionForPath,
} from "../../../src/lib/seo/edge-telemetry.ts";

const CHROME =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";
const browserHeaders = () =>
  new Headers({ "user-agent": CHROME, "sec-fetch-mode": "navigate", "accept-language": "pt-BR" });

describe("crawlers.ts × public/robots.txt", () => {
  const robots = readFileSync(path.resolve(__dirname, "../../../public/robots.txt"), "utf8");
  const robotsTokens = [...robots.matchAll(/^User-agent:\s*(\S+)/gim)].map((m) => m[1]).filter((t) => t !== "*");

  it("todo robô nomeado no robots.txt é conhecido pelo registro de borda", () => {
    const known = new Set(CRAWLER_POLICIES.map((p) => p.robotsToken));
    expect(robotsTokens.filter((t) => !known.has(t))).toEqual([]);
  });

  it("nenhum robô da política está bloqueado no robots.txt", () => {
    expect(robots).not.toMatch(/^Disallow:\s*\/\s*$/m);
  });

  it("tokens só de controle não são observáveis por HTTP", () => {
    const controle = CRAWLER_POLICIES.filter((p) => !p.httpObservable).map((p) => p.robotsToken);
    expect(controle.sort()).toEqual(["Applebot-Extended", "Google-Extended"]);
  });
});

describe("normalizeCrawlerToken", () => {
  it.each([
    ["Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)", "Googlebot"],
    ["Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +claudebot@anthropic.com)", "ClaudeBot"],
    ["Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ChatGPT-User/1.0; +https://openai.com/bot", "ChatGPT-User"],
    ["Mozilla/5.0 (compatible; Claude-SearchBot/1.0)", "Claude-SearchBot"],
    ["Mozilla/5.0 (compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)", "PerplexityBot"],
    ["Mozilla/5.0 (Macintosh) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1 Safari/605.1.15 (Applebot/0.1)", "Applebot"],
  ])("%s → %s", (ua, token) => {
    expect(normalizeCrawlerToken(ua)?.robotsToken).toBe(token);
  });

  it("navegador comum não é robô conhecido", () => {
    expect(normalizeCrawlerToken(CHROME)).toBeNull();
  });
});

describe("hasAutomationSignal", () => {
  it("navegador com headers reais é humano", () => {
    expect(hasAutomationSignal(CHROME, browserHeaders())).toBe(false);
  });
  it("UA de Chrome sem sec-fetch é ferramenta", () => {
    expect(hasAutomationSignal(CHROME, new Headers({ "accept-language": "pt-BR" }))).toBe(true);
  });
  it.each(["", "curl/8.5.0", "python-requests/2.31", "facebookexternalhit/1.1", "WhatsApp/2.23"])("%j é automação", (ua) => {
    expect(hasAutomationSignal(ua)).toBe(true);
  });
});

describe("extractAllowedUtm", () => {
  it("normaliza os 4 campos e ignora o resto da query string", () => {
    const utm = extractAllowedUtm(new URLSearchParams("utm_source=Instagram&utm_medium=social&utm_campaign=Palestra IA&token=abc"));
    expect(utm).toEqual({ utm_source: "instagram", utm_medium: "social", utm_campaign: "palestra-ia", utm_content: null });
  });
  it("descarta valor que parece dado pessoal", () => {
    const utm = extractAllowedUtm(new URLSearchParams("utm_source=fulano@x.com&utm_content=11987654321"));
    expect(utm.utm_source).toBeNull();
    expect(utm.utm_content).toBeNull();
  });
  it("descarta valor com caractere fora da lista segura", () => {
    expect(extractAllowedUtm(new URLSearchParams("utm_campaign=<script>")).utm_campaign).toBeNull();
  });
});

describe("helpers de borda", () => {
  it("referrer vira só o domínio", () => {
    expect(extractReferrerHost("https://chatgpt.com/c/123?x=1")).toBe("chatgpt.com");
    expect(extractReferrerHost("não é url")).toBeNull();
  });
  it("referrer do próprio site (com ou sem www) não é origem", () => {
    expect(extractReferrerHost("https://mdantas.adv.br/about", "mdantas.adv.br")).toBeNull();
    expect(extractReferrerHost("https://www.mdantas.adv.br/", "mdantas.adv.br")).toBeNull();
    expect(extractReferrerHost("https://outro-site.example/", "mdantas.adv.br")).toBe("outro-site.example");
  });
  it("preview, alias netlify e localhost não são audiência", () => {
    expect(isEnvironmentHost("deploy-preview-12--mdantas.netlify.app")).toBe(true);
    expect(isEnvironmentHost("localhost:8888")).toBe(true);
    expect(isEnvironmentHost("mdantas.adv.br")).toBe(false);
  });
  it("prefetch é reconhecido pelos três headers", () => {
    expect(isPrefetchRequest(new Headers({ "sec-purpose": "prefetch;prerender" }))).toBe(true);
    expect(isPrefetchRequest(new Headers({ "x-moz": "prefetch" }))).toBe(true);
    expect(isPrefetchRequest(browserHeaders())).toBe(false);
  });
  it("seção tem cardinalidade fechada", () => {
    expect(sectionForPath("/")).toBe("home");
    expect(sectionForPath("/blog/algum-post")).toBe("blog");
    expect(sectionForPath("/robots.txt")).toBe("descoberta");
    expect(sectionForPath("/llms-en-US.txt")).toBe("descoberta");
    expect(sectionForPath("/wp-admin/install.php")).toBe("other");
  });
  it("só HTML entregue com sucesso conta como visualização", () => {
    const html = { "content-type": "text/html; charset=utf-8" };
    expect(isCountablePageView(new Response("", { status: 200, headers: html }))).toBe(true);
    expect(isCountablePageView(new Response("", { status: 404, headers: html }))).toBe(false);
    expect(isCountablePageView(new Response("", { status: 200, headers: { "content-type": "text/plain" } }))).toBe(false);
  });
});
