# Financeiro — Playbook

> Conhecimento de domínio da área. Deriva do canon e de `04-FINANCEIRO` — **nunca os contradiz** (se um número divergir, o canon prevalece).

### Objetivo da área

Tornar a economia da plataforma visível e decidível: custos, preço por plano, margem, runway e quantas vendas cobrem o burn.

### Princípios (como fazer bem)

- Toda conta é **derivada e visível** — mostrar a fórmula, nunca um número solto.
- Premissa conservadora; na dúvida, cenário pessimista.
- Separar CAPEX único de burn recorrente.
- Sem dado no canon → declarar a lacuna, não estimar às escondidas.

### Processos / Frameworks

**Unit economics** — acompanhar `cac`, `ltv`, `ltv_cac`, `payback_cac_meses`, `arpa`. Enquanto não houver clientes pagantes, a maioria estará `null` no canon: registrar como lacuna, não preencher. Meta de referência: LTV/CAC > 3x.

**Precificação** — usar `canon.planos` como fonte da tabela de preço (produto âncora, planos gratuitos de topo de funil, etc.). Modelar variações (avulso vs. pacote/combo, mensal vs. anual) só como cenário; não criar tabela de preço nova sem decisão do responsável. Gatilhos para revisar preço: custo por cliente servido > 15% do preço, CAC > 50% do LTV, ou 3+ vendas perdidas por objeção de preço no mês.

**Controle de custos** — o burn vem do controle interno (`canon.financeiro.custos`), o gateway dá receita. Acompanhar folha, infra, APIs de terceiros, marketing e outros. Itens ainda `null` → sinalizar para quantificar.

**Break-even** — receita mensal que cobre o burn bruto. Conta canônica: `burn_bruto ÷ preço_do_produto_âncora`. Ver `canon.metas` (ex.: m6 = break-even; m12 = ~2× break-even). Recalcular sempre que o burn ou o preço mudar.

**Orçamento dos agentes** — cada agente de área tem um teto de esforço por período (ver `_FRAMEWORK/heartbeat-template.md`). Acompanhar o consumo e sinalizar quem se aproxima do limite. Não há, por padrão, um valor monetário fixo por agente no canon — não inventar teto; tratar como esforço/turno até que o número exista.

### Ferramentas (skills) e quando usar cada uma

| Skill | Quando usar |
|-------|-------------|
| `atualizar-financeiro` | Atualizar MRR/ARR, receita, assinaturas e churn a partir do gateway de pagamento |
| `atualizar-produto` | Puxar clientes/uso reais para fechar com o financeiro |
| `oraculo` | Simular cenários de preço, runway e break-even sobre o canon |

### Fontes no cérebro

- Canon: `gemeo/00-CANON/canon.yaml` — `financeiro`, `unit_economics`, `unit_economics_por_plano`, `planos`, `crescimento`, `metas`
- Contexto: `gemeo/04-FINANCEIRO/` — `Metricas/`, `Projecoes/break-even.md`, `Relatorios/pnl-mensal-*`

### O que NÃO fazer

- Inventar caixa, burn, preço, margem ou teto de orçamento — usar o canon ou marcar "ver canon".
- Misturar CAPEX único com burn recorrente.
- Adotar um modelo de preço sem base no canon — o preço vigente está em `canon.planos`.
- Decrementar/alterar números do canon à mão — isso é trabalho de operações (atualizar gêmeo).
