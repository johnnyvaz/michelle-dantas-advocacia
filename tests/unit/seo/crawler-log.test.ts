import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import crawlerLog, { type EdgeContext } from "../../../netlify/edge-functions/crawler-log.ts";

const CHROME =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";
const HUMAN = { "user-agent": CHROME, "sec-fetch-mode": "navigate", "accept-language": "pt-BR" };
const ENV: Record<string, string> = { SUPABASE_URL: "https://sb.test", SUPABASE_SERVICE_ROLE_KEY: "service-key" };

type Call = { url: string; init: RequestInit };

function setup(origin: Response) {
  const calls: Call[] = [];
  const pending: Promise<unknown>[] = [];
  vi.stubGlobal("Deno", { env: { get: (name: string) => ENV[name] } });
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init: RequestInit = {}) => {
      if (url.startsWith("https://dns.google/")) {
        return Response.json({ Answer: [{ data: "crawl-66-249-66-1.googlebot.com." }] });
      }
      calls.push({ url, init });
      return new Response(null, { status: 201 });
    }),
  );
  const context: EdgeContext = {
    ip: "66.249.66.1",
    deploy: { id: "deploy-abc" },
    next: async () => origin,
    waitUntil: (p) => pending.push(p),
  };
  const settle = () => Promise.all(pending);
  return { calls, context, settle };
}

const html = (status = 200) => new Response("<html></html>", { status, headers: { "content-type": "text/html" } });
const body = (call: Call) => JSON.parse(call.init.body as string);

describe("crawler-log (borda)", () => {
  beforeEach(() => vi.spyOn(console, "error").mockImplementation(() => {}));
  afterEach(() => vi.unstubAllGlobals());

  it("visita humana com UTM incrementa o contador sem gravar UA, IP nem query string", async () => {
    const origin = html();
    const { calls, context, settle } = setup(origin);
    const request = new Request("https://cursos.johnnyvaz.com.br/palestras?utm_source=instagram&utm_medium=social&fbclid=xyz", {
      headers: { ...HUMAN, referer: "https://l.instagram.com/?u=abc" },
    });

    const response = await crawlerLog(request, context);
    await settle();

    expect(response).toBe(origin);
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe("https://sb.test/rest/v1/rpc/increment_page_view_count");
    expect((calls[0].init.headers as Record<string, string>)["Content-Profile"]).toBe("mdantas");
    const payload = body(calls[0]);
    expect(payload).toMatchObject({
      p_host: "cursos.johnnyvaz.com.br",
      p_path: "/palestras",
      p_kind: "human",
      p_referrer_host: "l.instagram.com",
      p_utm_source: "instagram",
      p_utm_medium: "social",
    });
    const raw = calls[0].init.body as string;
    for (const leaked of [CHROME, "66.249.66.1", "fbclid", "xyz"]) expect(raw).not.toContain(leaked);
  });

  it("Googlebot grava crawler_hits com status, seção, verificação e deploy", async () => {
    const { calls, context, settle } = setup(html());
    const request = new Request("https://cursos.johnnyvaz.com.br/blog/post", {
      headers: { "user-agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" },
    });

    await crawlerLog(request, context);
    await settle();

    const hit = calls.find((c) => c.url.endsWith("/rest/v1/crawler_hits"));
    expect(body(hit!)).toEqual({
      bot: "Googlebot",
      category: "search",
      host: "cursos.johnnyvaz.com.br",
      path: "/blog/post",
      section: "blog",
      status: 200,
      from_cache: null,
      verified: true,
      verification_method: "rdns",
      served_build_id: "deploy-abc",
    });
    expect(body(calls.find((c) => c.url.includes("increment_page_view_count"))!).p_kind).toBe("bot");
  });

  it("robô lendo robots.txt grava o acesso, mas não conta visualização", async () => {
    const { calls, context, settle } = setup(new Response("User-agent: *", { headers: { "content-type": "text/plain" } }));
    const request = new Request("https://cursos.johnnyvaz.com.br/robots.txt", { headers: { "user-agent": "ClaudeBot/1.0" } });

    await crawlerLog(request, context);
    await settle();

    expect(calls.map((c) => c.url)).toEqual(["https://sb.test/rest/v1/crawler_hits"]);
    expect(body(calls[0])).toMatchObject({ bot: "ClaudeBot", section: "descoberta", verification_method: "unavailable", verified: null });
  });

  it("404 de humano e prefetch não gravam nada", async () => {
    for (const [origin, headers] of [
      [html(404), HUMAN],
      [html(), { ...HUMAN, "sec-purpose": "prefetch" }],
    ] as const) {
      const { calls, context, settle } = setup(origin);
      await crawlerLog(new Request("https://cursos.johnnyvaz.com.br/x", { headers }), context);
      await settle();
      expect(calls).toEqual([]);
    }
  });

  it("deploy preview e método não-GET saem antes de next()", async () => {
    const { context } = setup(html());
    const next = vi.spyOn(context, "next");
    expect(await crawlerLog(new Request("https://deploy-preview-3--mdantas.netlify.app/", { headers: HUMAN }), context)).toBeUndefined();
    expect(await crawlerLog(new Request("https://cursos.johnnyvaz.com.br/", { method: "POST" }), context)).toBeUndefined();
    expect(next).not.toHaveBeenCalled();
  });

  it("falha do Supabase não altera a resposta (fail-open)", async () => {
    const origin = html();
    const { context, settle } = setup(origin);
    vi.stubGlobal("fetch", vi.fn(async () => new Response(null, { status: 500 })));

    const response = await crawlerLog(new Request("https://cursos.johnnyvaz.com.br/", { headers: HUMAN }), context);
    await settle();

    expect(response).toBe(origin);
    const linha = JSON.parse(vi.mocked(console.error).mock.calls[0][0] as string);
    expect(linha).toMatchObject({ nivel: "erro", evento: "edge:crawler-log.falha_gravacao", erro: expect.stringContaining("500") });
  });
  describe("beacon /_pv (navegação da SPA)", () => {
    const beacon = (p: string, headers: Record<string, string> = {}, init: RequestInit = { method: "POST" }) =>
      new Request(`https://cursos.johnnyvaz.com.br/_pv?p=${encodeURIComponent(p)}`, {
        ...init,
        headers: { ...HUMAN, "sec-fetch-mode": "no-cors", "sec-fetch-site": "same-origin", ...headers },
      });

    it("conta a rota com source spa, sem referrer nem UTM, e não chama next()", async () => {
      const { calls, context, settle } = setup(html());
      const next = vi.spyOn(context, "next");

      const response = await crawlerLog(beacon("/palestras", { referer: "https://cursos.johnnyvaz.com.br/" }), context);
      await settle();

      expect(response?.status).toBe(204);
      expect(next).not.toHaveBeenCalled();
      expect(calls).toHaveLength(1);
      expect(body(calls[0])).toEqual({
        p_day: expect.any(String),
        p_hour: expect.any(Number),
        p_host: "cursos.johnnyvaz.com.br",
        p_path: "/palestras",
        p_kind: "human",
        p_source: "spa",
      });
    });

    it("ignora cross-site, GET, caminho inválido e deploy preview — sempre 204", async () => {
      const casos: Request[] = [
        beacon("/palestras", { "sec-fetch-site": "cross-site" }),
        beacon("/palestras", {}, { method: "GET" }),
        beacon("https://evil.example/x"),
        beacon("//evil.example"),
        beacon("/a?b=c"),
        new Request("https://deploy-preview-3--mdantas.netlify.app/_pv?p=/", {
          method: "POST",
          headers: { ...HUMAN, "sec-fetch-site": "same-origin" },
        }),
      ];
      for (const request of casos) {
        const { calls, context, settle } = setup(html());
        expect((await crawlerLog(request, context))?.status).toBe(204);
        await settle();
        expect(calls).toEqual([]);
      }
    });
  });
});
