/**
 * Log estruturado das Functions e da borda: uma linha JSON por evento, legível nos logs do Netlify
 * e filtrável por `evento`. ESM sem dependência de Node — a edge function (Deno) importa o mesmo módulo.
 *
 * Nunca passe aqui e-mail, token, IP, user-agent ou corpo de resposta de terceiro: só nomes de erro e status.
 */
export function logErro(evento, campos = {}) {
  console.error(JSON.stringify({ nivel: 'erro', evento, ...campos, em: new Date().toISOString() }));
}
