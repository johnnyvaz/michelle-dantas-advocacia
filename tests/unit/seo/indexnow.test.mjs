// Contrato do aviso ao IndexNow (netlify/functions/deploy-succeeded.mjs).
// Roda sem dependência: node --test tests/unit/seo/indexnow.test.mjs
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import handler, { INDEXNOW_KEY, avisarIndexNow, urlsDoSitemap } from "../../../netlify/functions/deploy-succeeded.mjs";

const SITEMAP = `<?xml version="1.0"?><urlset>
<url><loc>https://mdantas.adv.br</loc></url>
<url><loc>https://mdantas.adv.br/sobre</loc></url>
<url><loc>https://outro.site/x</loc></url>
</urlset>`;

describe("indexnow", () => {
  it("o arquivo da chave existe na raiz e contém só a chave", () => {
    const arquivo = new URL(`../../../public/${INDEXNOW_KEY}.txt`, import.meta.url);
    assert.ok(existsSync(arquivo));
    assert.equal(readFileSync(arquivo, "utf8"), INDEXNOW_KEY);
  });

  it("só envia URLs do próprio domínio, com host e keyLocation", async () => {
    const chamadas = [];
    const fetcher = async (url, init = {}) => {
      chamadas.push({ url, body: init.body });
      return url.endsWith("sitemap.xml") ? new Response(SITEMAP) : new Response("", { status: 200 });
    };
    await avisarIndexNow(fetcher);
    const corpo = JSON.parse(chamadas[1].body);
    assert.equal(corpo.host, "mdantas.adv.br");
    assert.equal(corpo.keyLocation, `https://mdantas.adv.br/${INDEXNOW_KEY}.txt`);
    assert.deepEqual(corpo.urlList, ["https://mdantas.adv.br", "https://mdantas.adv.br/sobre"]);
    assert.ok(!urlsDoSitemap(SITEMAP).some((u) => u.includes("outro.site")));
  });

  it("deploy que não é de produção não avisa ninguém", async () => {
    const r = await handler(new Request("https://x/", { method: "POST", body: JSON.stringify({ payload: { context: "branch-deploy" } }) }));
    assert.equal(await r.text(), "ignorado");
  });
});
