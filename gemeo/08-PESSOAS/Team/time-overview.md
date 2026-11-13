# Time — Visão geral e estrutura do time

> **Template** — preenchido via /montar-gemeo. Deriva do canon: `time[].{nome,cargo,custo,decisor,perfil_cognitivo}` · `financeiro.custos.folha`.
> **Citação parseável**: todo número preenchido usa o marcador `R$ X [canon: path.do.campo]` ou `N [calc: metrica]` — o CI compara com o canon e acusa drift (specs/001-melhorias-gemeo/contracts/formatos-arquivos.md).

**Data:** AAAA-MM · **Origem:** `time[]` e `financeiro.custos.folha` do canon.

---

## O time

[PREENCHER: 1–2 frases — quantas pessoas, modelo (remoto/presencial), estágio. Núcleo
decisor vs. execução.]

| # | Nome | Cargo | Custo mensal | Decisor? |
|---|------|-------|-------------:|:--------:|
| 1 | [Nome] | `time[].cargo` | R$ [X] | **Sim** |
| 2 | [Nome] | `time[].cargo` | R$ [X] | **Sim** |
| 3 | [Nome] | `time[].cargo` | R$ [X] | Não |
| | | **Folha total** | **R$ [X]** | |

> A folha total deve **fechar com `financeiro.custos.folha`**: a soma dos `time[].custo`
> tem que bater com o campo do canon. Se não bater, o erro está no canon — corrija lá, não aqui.

---

## Núcleo decisor (perfis cognitivos)

Só as pessoas com `time[].decisor` verdadeiro entram no cálculo de adesão do oráculo e têm
perfil cognitivo (`time[].perfil_cognitivo`). A **complementaridade** entre elas é parte da
tese de "time".

| Decisor | Arquétipo | O que traz para a mesa | Perfil |
|---------|-----------|------------------------|--------|
| [Nome] | [PREENCHER] | [PREENCHER] | [perfil-nome.md](./perfil-nome.md) |
| [Nome] | [PREENCHER] | [PREENCHER] | [perfil-nome.md](./perfil-nome.md) |

Como cada um se posiciona nas decisões está em [`matriz-decisao-adesao.md`](./matriz-decisao-adesao.md).

---

## Execução (não-decisores)

[PREENCHER: quem executa o roadmap/operação sob os decisores. **Não** participam das
decisões estratégicas — por isso não têm perfil cognitivo nem entram no cálculo de adesão.
Listar com cargo e custo placeholder.]

- **[Nome] — [cargo] (R$ [X]/mês).** [PREENCHER: o que toca.]

> **Implicação para o oráculo:** uma decisão de "contratar +[N]" trata de headcount
> **adicional** sobre o time atual — ou seja, folha **acima** de `financeiro.custos.folha`.
> Ver a decisão de contratação na [matriz](./matriz-decisao-adesao.md).
