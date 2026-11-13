# Estratégia de Crescimento — motores, canais e apostas

> **Template** — preenchido via /montar-gemeo. Deriva do canon: `crescimento.*`, `unit_economics.*`, `metas.m6_meses.*`, `metas.m12_meses.*`, `mercado.*`, `premissas.gatilho_demanda.*`, `fundraising.uso_recursos_pct`.
> **Citação parseável**: todo número preenchido usa o marcador `R$ X [canon: path.do.campo]` ou `N [calc: metrica]` — o CI compara com o canon e acusa drift (specs/001-melhorias-gemeo/contracts/formatos-arquivos.md).

---

## O problema de crescimento, em uma frase

**[PREENCHER: de onde para onde, em quanto tempo, com qual restrição]** — ex.: sair de `snapshot.clientes_total` para `metas.m12_meses.*` em 12 meses, com `financeiro.runway_meses` de caixa e `unit_economics.cac` de CAC. Diga qual a **alavanca** que torna a conta possível (raramente é só venda direta).

| Marco | Hoje | 6 meses (`metas.m6_meses.*`) | 12 meses (`metas.m12_meses.*`) |
|-------|------|------------------------------|--------------------------------|
| [métrica-mãe de aquisição] | `[N]` | `[N]` | `[N]` |
| MRR | R$ `[X]` | R$ `[X]` | R$ `[X]` |
| [canais/parceiros, se aplicável] | `[N]` | `[N]` | `[N]` |

> Identifique a **restrição binding** de cada janela: nem sempre é receita. Pode ser nº de clientes, ativação de um canal, ou um marco de produto. O salto difícil costuma ser o tramo 6→12 meses.

---

## Os motores de crescimento e o papel de cada um

Liste de 2 a 3 motores **complementares** (não competem — cobrem estágios diferentes do funil). Para cada um: o que é, métricas atuais do canon, força, limite e papel.

### Motor 1 — [PREENCHER: ex. "Direto / self-service"]
**O que é:** [PREENCHER].
- **Métricas atuais (`crescimento.*`):** `[N]` novos pagantes/mês, conversão free→pago `[X]%`, ciclo de vendas `crescimento.ciclo_vendas_dias` dias.
- **Força:** [PREENCHER — ex. controle da experiência, margem cheia, aprendizado direto].
- **Limite:** CAC e ciclo **não escalam linearmente** — explique por que o runway não permite chegar à meta só por aqui.
- **Papel:** [PREENCHER — ex. motor de aprendizado e base previsível].

### Motor 2 — [PREENCHER: a alavanca de escala] ⭐
**O que é:** [PREENCHER — o canal/motor que justifica a aposta principal].

#### Por que esta alavanca derruba o CAC
[PREENCHER: o racional. Ex.: um terceiro (parceiro/canal) já fez a aquisição — traz a base, a confiança e o contexto de uso, então você entra como oferta adjacente para uma base quente.]

| Vetor de CAC | Motor 1 (direto) | Via alavanca |
|--------------|------------------|--------------|
| Quem traz o lead | [PREENCHER] | [PREENCHER] |
| Confiança inicial | construída do zero | herdada |
| Ciclo de vendas | `crescimento.ciclo_vendas_dias` | tende a ser menor |
| Custo marginal por conta | alto | baixo |

> **Honestidade — sem dado no canon:** se o canon **não** traz um CAC/ciclo específico desta alavanca, **não fabrique a cifra**. A direção pode ser clara (CAC cai), mas o oráculo responde "sem dado no canon" e mostra sensibilidade ao **driver** (ex. nº de parceiros), não a um número inventado.

### Motor 3 — [PREENCHER: canal complementar]
**O que é:** [PREENCHER]. **Papel:** prioridade menor no estágio atual; escala depois de validar o playbook do Motor 2.

---

## Gatilho de urgência (por que comprar agora)

Crescimento não depende só de produto bom — depende de um **"por que agora"**. Se houver um gatilho de demanda (`premissas.gatilho_demanda.*`):

- **`[X]%` da demanda** vem dele (`premissas.gatilho_demanda.peso_na_demanda_pct`). É o que transforma "seria bom ter" em "preciso resolver".
- **Mas é também a maior dependência:** se o gatilho não vier, a demanda cai (`premissas.gatilho_demanda.cenario_sem_gatilho.queda_demanda_pct`) e o ciclo cresce. Por isso o crescimento não pode ser monotemático — o `premissas.gatilho_demanda.cenario_sem_gatilho.demanda_residual_pct` residual é o plano B.

**Posicionamento dual:** venda *urgência* para fechar rápido, mas ancore em *valor permanente* para não morrer se o gatilho deslizar. Detalhe em [`scenario-planning.md`](./scenario-planning.md).

---

## Sequenciamento (como combinar os motores no tempo)

1. **Agora → 6 meses:** [PREENCHER — qual motor financia o aprendizado enquanto o motor de escala é construído].
2. **6 → 12 meses:** [PREENCHER — qual motor vira dominante].
3. **Uso de recursos** (`fundraising.uso_recursos_pct`): `[X]%` produto, `[X]%` growth, `[X]%` operação.

---

## Riscos do motor de crescimento

| Risco | Origem | Tratado em |
|-------|--------|-----------|
| [dependência de poucos parceiros/canais] | [PREENCHER] | [`scenario-planning.md`](./scenario-planning.md) + [`registro-de-riscos.md`](./registro-de-riscos.md) |
| [demanda colada no gatilho] | `premissas.gatilho_demanda.*` | [`scenario-planning.md`](./scenario-planning.md) |
| [concentração de receita] | `concentracao.*` | [`scenario-planning.md`](./scenario-planning.md) |

---

*Coerência: metas de `metas.m6_meses.*`/`metas.m12_meses.*`; funil de `crescimento.*`; gatilho de `premissas.gatilho_demanda.*`. Lacunas (CAC de canal) são sinalizadas, não inventadas.*
