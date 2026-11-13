# API — convenções e recursos principais

> **Template** — preenchido via /montar-gemeo. Sem campo direto no canon: descreve a *estrutura* da API; o contrato detalhado vive no repo.
> **Citação parseável**: todo número preenchido usa o marcador `R$ X [canon: path.do.campo]` ou `N [calc: metrica]` — o CI compara com o canon e acusa drift (specs/001-melhorias-gemeo/contracts/formatos-arquivos.md).

> Resumo das convenções da API para decisões de negócio (parceiros, integrações,
> contratos). **Resuma; não duplique documentação do repo** — o contrato completo
> (payloads, schemas, exemplos) é gerado pelo código (OpenAPI/README do repo).

## Convenções

| Aspecto | Convenção |
|---------|-----------|
| Base URL | `[PREENCHER: ex. https://api.exemplo.com/v1]` |
| Versionamento | `[PREENCHER: ex. prefixo de versão na URL]` |
| Autenticação | `[PREENCHER: ex. token de portador e/ou chave de API por header]` |
| Formato | `[PREENCHER: ex. JSON]` |
| Paginação | `[PREENCHER: ex. page/limit]` |
| Limites de uso | `[N]` req/min por `[PREENCHER: org / IP]` |

## Autenticação

`[PREENCHER: como o cliente autentica — portal vs. integração; onde vai o token]`

## Recursos principais

> Uma linha por endpoint relevante de negócio. Mantenha alto nível — o detalhe
> de request/response fica na doc gerada pelo repo. Marque o endpoint principal (⭐).

| Endpoint | Verbo | Descrição |
|----------|-------|-----------|
| `[PREENCHER: /recurso]` | `POST` | ⭐ `[PREENCHER: ação principal do produto]` |
| `[PREENCHER: /recurso]` | `GET` | `[PREENCHER: listar]` |
| `[PREENCHER: /recurso/:id]` | `GET` | `[PREENCHER: detalhar]` |
| `[PREENCHER: /recurso/:id]` | `PATCH` | `[PREENCHER: atualizar]` |
| `[PREENCHER: /recurso/:id]` | `DELETE` | `[PREENCHER: remover/desativar]` |

## Erros

> Padrão de erro e principais códigos. Liste só os de impacto de negócio (ex.: limite
> de plano excedido). Mensagens e campos detalhados ficam no repo.

| Código | HTTP | Descrição |
|--------|------|-----------|
| `[PREENCHER: CODIGO]` | `[N]` | `[PREENCHER: ex. limite do plano atingido]` |
| `[PREENCHER: CODIGO]` | `[N]` | `[PREENCHER: autenticação inválida]` |
