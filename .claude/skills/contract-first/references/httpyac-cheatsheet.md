# httpyac — cheatsheet (contratos .http)

Sintaxe usada pelo scaffold da skill `/contract-first`. Referência: <https://httpyac.github.io/>.

## Anatomia de uma request

```http
### separador de bloco (obrigatório entre requests)
# @name nomeUnico          ← nomeia a request (reuso e --name)
POST {{baseUrl}}/recurso    ← método + URL (usa variáveis {{...}})
Authorization: Bearer {{authToken}}
Content-Type: application/json

{ "campo": "valor" }        ← body (linha em branco antes)

?? status == 201            ← asserções (ver abaixo)
```

## Variáveis

- **Locais** (por arquivo): `@baseUrl = http://localhost:3001/api/v1` → usa `{{baseUrl}}`.
- **De ambiente**: `.httpyac.json` (`environments.<env>`) + `http-client.env.json`; seleciona com `--env test`.
- **De runtime** (capturadas no `{% %}`): `setEnvVar('authToken', token)` → `{{authToken}}` nas próximas.

## Asserções `??` (o que trava regressão)

```http
?? status == 200
?? status >= 200
?? duration < 1000
?? header content-type contains application/json
?? body success == true
?? body data.id exists
?? body data isArray
?? body data.nome == Fulano
```

Operadores: `== != < > <= >=`, `exists`, `contains`, `matches` (regex), `startsWith`, `endsWith`,
`isNumber`, `isString`, `isArray`, `isBoolean`, `isTrue`, `isFalse`. Sempre cobrir **happy + sad** (400/401/404).

## Scripts `{% %}` (JS) — captura de token / dados

```http
{%
  if (response.statusCode === 200 && response.parsedBody.token) {
    setEnvVar('authToken', response.parsedBody.token);   // memória, não vai pro git
    console.log('token:', response.parsedBody.token.substring(0, 12) + '…'); // nunca logar inteiro
  }
%}
```

## Login compartilhado entre arquivos: `@import` + `@ref`

```http
# @import ../setup.http          ← uma vez, no topo do arquivo

### título
# @name criar_cliente
# @ref login                     ← roda o login (nomeado `login` no setup.http) antes desta request
POST {{baseUrl}}/clientes
Authorization: Bearer {{login.token}}
```

- `{{login.token}}` lê o corpo JSON da resposta do request nomeado; request que usa o resultado de OUTRA request
  precisa do seu próprio `# @ref` (`# @ref criar_cliente` → `{{criar_cliente.id}}`).
- **Não inclua o `setup.http` no glob da suíte.** Com `httpyac "contract-first/**/*.http"` o `setup.http` roda como
  arquivo e, no mesmo processo, os `@ref login` dos arquivos seguintes falham com `login is not defined` (medido no
  fixture `examples/esqueleto-fullstack`; cada arquivo isolado passava). Use `"contract-first/*/*.http"` (só as
  subpastas) ou liste os arquivos.
- Asserção por JavaScript: `?? js response.parsedBody.itens.some(c => c.id === criar_cliente.id) isTrue` — falha de
  verdade quando a expressão é falsa (confirme com uma troca proposital antes de confiar).
- Para a suíte poder rodar de novo sem reiniciar a stack, torne únicos os campos com restrição de unicidade
  (`ana-{{$timestamp}}@exemplo.invalid`) e reaproveite o valor devolvido (`{{criar_cliente.email}}`).

## Rodando

```bash
# uma request nomeada
npx httpyac ./contract-first/setup.http --env test --name login_admin
# um arquivo inteiro (todas as requests + asserções)
npx httpyac ./contract-first/empresas/empresas.http --env test --all
# toda a suíte (loop interno)
npx httpyac "./contract-first/**/*.http" --env test --all
```

## Isolamento sem Docker (fallback)

Quando não há stack em container, garanta reprodutibilidade assim:

- **Banco**: um DB/schema de teste dedicado (nunca dev/prod), migrado + semeado no início do loop.
- **Externos no plano interno**: intercepte no `{% %}` ou aponte o SDK para um mock local
  (ex.: `EXTERNAL_API_BASE_URL=http://localhost:8089`).
- **Externos no plano externo (browser)**: `page.route()` do Playwright —
  ```ts
  await page.route('**/api/v1/pagamentos/**', r =>
    r.fulfill({ status: 200, json: { success: true, data: { status: 'CONFIRMED' } } }));
  ```

## Debug interativo quando um E2E quebra

Para inspecionar o browser passo a passo (snapshot, console, network, mocks ad-hoc) use a skill
**`playwright-cli`** — ferramenta separada, não é o runner de regressão. O loop de regressão é
sempre `@playwright/test` (headless, determinístico).
