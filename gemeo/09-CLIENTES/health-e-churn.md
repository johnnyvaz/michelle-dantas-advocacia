# Health e Churn — saúde de contas e churn

> **Template** — preenchido via /montar-gemeo. Deriva do canon: `clientes[].{id,nome,plano,mrr,health,obs}` · `crescimento.{churn_logo_mensal_pct,churn_receita_mensal_pct,lifetime_meses_estimado}` · `snapshot.mrr` · `unit_economics.{ltv,arpa}`.
> **Citação parseável**: todo número preenchido usa o marcador `R$ X [canon: path.do.campo]` ou `N [calc: metrica]` — o CI compara com o canon e acusa drift (specs/001-melhorias-gemeo/contracts/formatos-arquivos.md).

**Data:** AAAA-MM · **Fonte:** `clientes[]` e `crescimento` do canon.

---

## 1. Critérios objetivos de health

Health é atribuído por **sinal observável**, não por impressão. Mesma régua para toda a base.

| Health | Critério objetivo |
|--------|-------------------|
| 🟢 **Bom** | Uso ativo e recorrente; sem reclamação aberta; renovação encaminhada. |
| 🟡 **Atenção** | Uso abaixo do esperado para o plano **ou** sinal isolado de insatisfação **ou** conta nova ainda sem adoção comprovada. |
| 🔴 **Risco** | Insatisfação explícita (preço/valor) **ou** churn sinalizado **ou** queda forte de uso. |

> Ajuste os gatilhos ao seu produto, mas mantenha-os **mensuráveis** — health subjetivo
> não antecipa churn.

## 2. Distribuição de health da carteira

| Health | Contas | IDs | MRR total | % do MRR |
|--------|-------:|-----|----------:|---------:|
| 🟢 Bom | [N] | [ids] | R$ [X] | [X]% |
| 🟡 Atenção | [N] | [ids] | R$ [X] | [X]% |
| 🔴 Risco | [N] | [ids] | R$ [X] | [X]% |
| **Total** | **[N]** | — | **R$ [X]** | **100%** |

---

## 3. Indicadores de churn (do canon)

| Métrica | Valor | Campo |
|---------|------:|-------|
| Churn logo mensal | [X]% | `crescimento.churn_logo_mensal_pct` |
| Churn de receita mensal | [X]% | `crescimento.churn_receita_mensal_pct` |
| Lifetime estimado | [N] meses | `crescimento.lifetime_meses_estimado` |
| LTV / ARPA | R$ [X] / R$ [X] | `unit_economics.{ltv,arpa}` |

[PREENCHER: leitura — churn logo acima do de receita indica que quem cancela são tickets
menores (ou o contrário). Comparar com benchmark do estágio.]

---

## 4. Sinais de churn (detectar cedo)

- [PREENCHER: queda de uso mês a mês abaixo de um patamar]
- [PREENCHER: reclamação de preço/valor — sensibilidade no segmento]
- [PREENCHER: contato comercial sumiu / não responde QBR]
- [PREENCHER: conta nova sem adoção nos primeiros [N] dias]

## 5. Playbook de resgate

> Uma rotina por conta prioritária (Atenção/Risco). Modelo:

### [ID] — [Nome] | [plano] | R$ [X]/mês | Health: [Atenção/Risco]

- **Situação:** [PREENCHER: o sinal — de `clientes[].obs`.]
- **Ações:**
  - [PREENCHER: diagnóstico de adoção / QBR / entrevista de valor]
  - [PREENCHER: demonstração de ROI vs. alternativa manual]
  - [PREENCHER: critério de sucesso acordado em [N] dias]
  - [PREENCHER: quando aceitar o churn e documentar o aprendizado (fit de ICP)]

---

## 6. Impacto financeiro do churn

| Métrica | Cálculo | Resultado |
|---------|---------|----------:|
| Perda mensal de MRR | `snapshot.mrr` × `churn_receita_mensal_pct` | R$ [X]/mês |
| LTV perdido por cancelamento | `unit_economics.ltv` (ou `arpa` × `lifetime_meses_estimado`) | R$ [X] |

> Sem crescimento, o churn de receita zera o MRR em ~[N] meses. **A expansão da base é o
> principal antídoto** — cruzar com a meta de crescimento da estratégia.
