# 15-DADOS — Ativos de dados

Para uma empresa cujo produto é dado, a base **é** o produto: o que se tem, de onde veio, com que direito
se usa, quão fresco está e em que produto entra. Esta pasta é esse mapa. O código que processa os dados
está mapeado em `07-PRODUTO/mapa/`; aqui fica o **ativo**, não a implementação.

| Arquivo | Responde |
|---|---|
| `catalogo-de-bases.md` | Que bases existem, o que contêm, quem é o dono, em que produto entram |
| `fontes-e-licencas.md` | De onde vem cada dado, base legal (LGPD), contrato/licença e restrições de uso |
| `qualidade-e-frescor.md` | Frequência de atualização prometida × real, critérios de qualidade, incidentes |
| `linhagem.md` | Fonte → processamento → base → produto, para responder "se a fonte X cair, o que para?" |

> **Número no canon.** Volume de registros, data da última carga e frequência prometida de cada base
> vivem em `dados.bases[]` de `canon.yaml`; a prosa cita `[canon: dados.bases]`.
>
> **Sem dado pessoal aqui.** Esta pasta descreve as bases; nenhum registro, amostra ou CPF entra nela.
> Classificação de sensibilidade e base legal ficam junto de `05-JURIDICO/lgpd.md`.
