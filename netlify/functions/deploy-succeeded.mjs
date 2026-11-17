// Evento do Netlify: roda sozinho a cada deploy concluído (nome do arquivo = gatilho).
// Em produção, avisa o IndexNow (Bing, Yandex, Seznam, Naver…) das URLs do sitemap.
// O Google não usa IndexNow — para ele o sinal é o sitemap + Search Console.
//
// Reenvia o sitemap inteiro a cada deploy (~80 URLs): o protocolo aceita até 10 mil por envio,
// e cada deploy aqui é post novo ou mudança de página.
import { fetchComTimeout } from './_lib/fetch-timeout.js';
import { logErro } from './_lib/log.js';

export const INDEXNOW_KEY = 'dc82c143cc3ef07efe4f46aefa1f89e4';
const SITE = 'https://mdantas.adv.br';

export function urlsDoSitemap(xml) {
  return [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]).filter((u) => u === SITE || u.startsWith(`${SITE}/`));
}

export async function avisarIndexNow(fetcher = fetchComTimeout) {
  const sitemap = await fetcher(`${SITE}/sitemap.xml`, {}, 5000, { retries: 1 });
  if (!sitemap.ok) throw new Error(`sitemap_${sitemap.status}`);
  const urlList = urlsDoSitemap(await sitemap.text());
  if (urlList.length === 0) throw new Error('sitemap_vazio');
  const resp = await fetcher(
    'https://api.indexnow.org/indexnow',
    {
      method: 'POST',
      headers: { 'content-type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host: new URL(SITE).host, key: INDEXNOW_KEY, keyLocation: `${SITE}/${INDEXNOW_KEY}.txt`, urlList }),
    },
    8000,
  );
  // 200 = aceito; 202 = aceito, chave ainda em validação.
  if (resp.status !== 200 && resp.status !== 202) throw new Error(`indexnow_${resp.status}`);
  return { status: resp.status, urls: urlList.length };
}

export default async function handler(req) {
  let contexto;
  try {
    contexto = (await req.json())?.payload?.context;
  } catch {
    contexto = undefined;
  }
  if (contexto !== 'production') return new Response('ignorado', { status: 200 });
  try {
    const r = await avisarIndexNow();
    console.log(JSON.stringify({ nivel: 'info', evento: 'indexnow.enviado', ...r }));
  } catch (erro) {
    logErro('indexnow.falha', { motivo: erro instanceof Error ? erro.message : 'desconhecido' });
  }
  return new Response('ok', { status: 200 });
}
