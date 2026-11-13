# 14-MARCA — Identidade, voz e sistema visual

A marca é **transversal**: alimenta copy, design, marketing, vendas e produto. Até aqui ela vivia
espalhada (um parágrafo em `06-MARKETING/posicionamento.md` e placeholders dentro da persona do
`agente-copy`), ou seja, na cabeça do agente e não no cérebro da empresa. Esta pasta é a fonte única.

> **Qualitativo aqui, número no canon.** Seguidores, alcance e metas por rede são números e vivem em
> `canon.yaml` (`marca.redes[]`, `metas.social`). A prosa desta pasta cita `[canon: ...]` quando precisar.

| Arquivo | Responde | Quem lê |
|---|---|---|
| `plataforma-de-marca.md` | Por que existimos, contra o quê, arquétipo, personalidade | todos os agentes |
| `voz-e-tom.md` | Como falamos: princípios, léxico, tom por persona e superfície | `agente-copy`, `agente-marketing`, `agente-vendas` |
| `referencias-e-anti-referencias.md` | Com o que queremos parecer e com o que nunca | `agente-design`, `agente-copy` |
| `identidade-visual.md` | Cores, tipografia, elevação, componentes (formato DESIGN.md) | `agente-design`, `agente-desenvolvimento` |
| `arquitetura-de-marca.md` | Marca-mãe, produtos, codinomes, regras de naming | todos |
| `superficies.md` | Cada superfície, o registro (brand/product) e o dono | `agente-design` |
| `acessibilidade.md` | WCAG, movimento reduzido, necessidades conhecidas | `agente-design`, `agente-desenvolvimento` |
| `ativos.md` | Logos, fontes, selos, templates: onde estão e a licença | `agente-design`, `agente-marketing` |
| `prova-social.md` | Cases, depoimentos e logos autorizados, certificações | `agente-copy`, `agente-vendas` |

O `agente-marca` lê a pasta inteira: é a régua da auditoria. O `agente-estudio` lê `identidade-visual`,
`superficies`, `acessibilidade` e `arquitetura-de-marca` para o kit de gravação; `agente-ideias` e
`agente-social` leem `plataforma-de-marca` e `voz-e-tom`.

## Como se preenche

- **`/montar-gemeo`, Fase 1b (Marca):** entrevista em rodadas de 2 ou 3 perguntas (registro →
  usuários e propósito → personalidade e referências → anti-referências → acessibilidade). Nenhum
  arquivo é escrito antes de o dono responder pelo menos uma rodada.
- **Fase 2 (busca automática):** varre o código do projeto (tokens CSS, `tailwind.config`, logos,
  fontes) e o site público, e propõe `identidade-visual.md` e `ativos.md` como rascunho a validar.
- **Ponte com `PRODUCT.md`/`DESIGN.md`:** `python3 scripts/exportar_marca.py` gera os dois arquivos
  na raiz do projeto (que a skill `/impeccable` lê); `--importar` faz o caminho inverso para quem já os
  tem. A fonte é esta pasta: editou `PRODUCT.md` na mão, importe de volta antes de exportar de novo.

## Regra

Não invente posicionamento, referência ou cor. Campo vazio fica `[PREENCHER]` e o agente declara a
lacuna em vez de chutar. Marca é decisão do dono: agente **propõe** ajuste em `gemeo/PROPOSTAS/`.
