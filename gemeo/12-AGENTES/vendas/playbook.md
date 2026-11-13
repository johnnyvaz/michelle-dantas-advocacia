# Vendas — Playbook

> Conhecimento de domínio da área de Vendas: como conduzir bem o funil de {{EMPRESA}}, do primeiro contato à renovação. Deriva do canon e do contexto do cérebro (`06-MARKETING`, `09-CLIENTES`) e **nunca os contradiz** — se um número divergir, **o canon prevalece**.

## Objetivo da área

Transformar desconhecidos em clientes pagantes de {{EMPRESA}} e manter a carteira saudável (retenção + expansão), mantendo pipeline e métricas de conversão honestos. Confrontar sempre o estágio do negócio (canon: `snapshot`, `crescimento`) com o gargalo declarado — em fase pré-receita, o gargalo costuma ser **conversão topo→pago**, não engenharia. Ler o gargalo real no canon, não presumir.

## Princípios (como fazer bem)

- **Curiosidade antes do pitch; problema antes do produto.** Primeiro contato abre uma conversa, não vende.
- **Prova é o entregável, não o logo.** Sem case, a prova é o produto na mão do prospect (exemplo real, piloto gratuito, plano free).
- **Qualificar antes de investir tempo de fechamento.** Critério objetivo (3-de-4), não impressão.
- **Proativo na retenção.** Check-ins programados antecipam churn; renovação se propõe com 40–70% de confiança, não com 100% (regra de Powell — certeza total chega tarde demais).
- **Números limpos.** Conversão ruim não se esconde em arredondamento; falha é de processo.

## Linhas de produto (do canon — `planos[]`)

As ofertas, preços e tipo (free / avulso / assinatura) saem de `canon.yaml` (`planos[]`). Mapear cada linha ao seu papel no funil:

| Linha | Preço | Tipo | Papel no funil |
|-------|------:|------|----------------|
| `<linha free do canon>` | R$ 0 | free | Isca / topo — atrair e ativar |
| `<linha paga principal do canon>` | `<canon>` | avulso/assinatura | Produto principal — conversão para pago |
| `<lead magnet / linha B2B, se houver>` | `<canon>` | lead magnet / B2B | Diagnóstico que atrai e qualifica; preço a definir no canon |

> Não tratar o modelo como recorrência (assinatura) se o canon disser avulso — isso muda `snapshot.mrr`. Ler o tipo real de cada linha no canon antes de prometer recorrência.

## Processos / Frameworks

### 1. Estágios do pipeline

Funil único, do primeiro toque ao pós-venda.

| Estágio | Definição |
|---------|-----------|
| **Lead** | Contatado, sem resposta ainda |
| **Engajado** | Respondeu, conversa aberta |
| **Qualificado** | Atende a 3 de 4 critérios (abaixo) |
| **Descoberta** | Chamada de descoberta realizada |
| **Piloto** | Piloto/diagnóstico oferecido e aceito |
| **Proposta** | Proposta formal enviada |
| **Negociação** | Preço/termos em discussão |
| **Fechado-Ganho** | Contrato/compra confirmada → entra no onboarding |
| **Fechado-Perdido** | Recusou ou desengajou |
| **Não Agora** | Adiado — reengajar em 30–60 dias |

### 2. Qualificação (3 de 4 critérios)

O lead é **qualificado** quando atende a **3 dos 4**:

1. Engajou com o enquadramento do problema (entendeu a dor que a oferta resolve).
2. Perguntou sobre o produto ou pediu o exemplo/diagnóstico.
3. Tem um **caso de uso concreto** (uma decisão ou necessidade ativa que a oferta informaria).
4. Tem **autoridade de decisão** (assina ou influencia diretamente quem assina).

> Quem decide e a dor exata saem do ICP — fonte da verdade em `gemeo/06-MARKETING/icp-persona.md` (template a preencher via `/montar-gemeo`). Não usar personas inventadas como leads reais; o ICP canônico vem do marketing.

### 3. Cadência de follow-up (defaults de craft — ajustáveis)

| Situação | Ação | Quando |
|----------|------|--------|
| Respondeu com interesse | Enviar link/exemplo com contexto pessoal | Imediato |
| Respondeu mas não abriu o material | Reenviar com um exemplo real | +7 dias |
| Viu o material e silenciou | Novo ângulo (valor para outro stakeholder) | +5 dias |
| Discussão ativa em grupo | Entrar com "solução que construímos" | Na hora |
| Sem resposta ao follow-up | Novo ângulo ou arquivar como "Não Agora" | +14 dias |
| 14 dias sem qualquer resposta | Arquivar "Não Agora", lembrete D+30, sem nova mensagem | +14 dias |

> Regra anti-improviso: para objeção recorrente, usar script fixo. Sem script previsto, **escalar** antes de improvisar.

### 4. Tratamento de objeções (padrões transferíveis)

- **"Vocês não têm cases."** → "Somos novos nesse mercado, mas o produto não é. A melhor forma de avaliar é pela profundidade do entregável, não pelo logo de cliente. Veja o exemplo completo e me diga se esse é o nível que faria diferença na sua decisão. Se sim, fazemos um piloto antes de qualquer compromisso."
- **"Já usamos [ferramenta X]."** → "Entendo — vale comparar o que cada uma resolve. Rode os dois no piloto e veja onde o nosso entrega algo que o atual não cobre. Costumam ser complementares."
- **"É caro para testar."** → "Por isso o piloto é gratuito: você compara o que ele revela com o que já sabe. Se não surpreender, encerramos."
- **"Não temos orçamento agora."** → "Um piloto neste trimestre ajudaria a construir o caso para o orçamento do próximo?"
- **"O jurídico precisa revisar."** → "Temos DPA padrão para dados sob a LGPD; posso enviar hoje." (ver área `operacoes`)

### 5. Chamada de descoberta (4 perguntas)

1. Qual decisão específica esta oferta ajudaria a tomar melhor?
2. Qual é o processo atual e onde ele falha?
3. Quem mais participa dessa decisão?
4. Como seria o sucesso em 90 dias?

### 6. Oferta de piloto / proposta

- **Piloto**: 1 entrega gratuita condicionada a um debrief de 30 min agendado **antes** da entrega. Converte melhor que qualquer demo.
- **Proposta segue a conversa**, nunca o contrário. Nunca começar pelo preço; começar pela clareza do caso de uso.
- **Preço**: usar `planos[].preco` do canon. Para linhas com preço ajustável (ex.: pacotes B2B 1 / 5 / 10+), definir no canon antes de propor; não inventar valor.
- **Desconto**: teto de 15% sem aprovação superior; nunca descontar piloto (já é gratuito); preferir volume a desconto.

### 7. Decisão Tipo 1 vs Tipo 2 (framework de Bezos)

| Decisão | Tipo | Autoridade |
|---------|------|-----------|
| Desconto ≤ 10%, aceitar piloto gratuito | Tipo 2 — reversível | Decide agora |
| Proposta fora do padrão, desconto > 15% | Tipo 1 — difícil reverter | Escalar antes (operacoes/{{APROVADOR}}) |

Tipo 2 (porta de duas vias): decide rápido, corrige se errar. Tipo 1 (porta de uma via): consultar antes.

### 8. Onboarding e retenção de cliente

Fluxo **D+0 → D+30** após o Fechado-Ganho:

| Dia | Ação |
|-----|------|
| D+0 | Boas-vindas: confirmar contato, pacote, cronograma de entrega |
| D+3 | Logística da entrega (quem/o quê será atendido) |
| D+7 | Entregar o produto/relatório pelo canal acordado |
| D+7 | Oferecer debrief de 30 min para percorrer o entregável juntos |
| D+14 | Check-in: "O entregável se conectou a alguma decisão que você está tomando?" |
| D+30 | Revisão: experiência geral, dúvidas, próximas entregas |
| D+60 / D+90 | Revisão de saúde; D+90 é a janela de renovação |

**Score de saúde da conta** (mesma régua para toda a base):

| Cor | Critério objetivo |
|-----|-------------------|
| 🟢 Verde | Respondeu aos check-ins, participou do debrief, citou caso de uso real concretizado |
| 🟡 Amarelo | Respostas lentas (>5 dias), pulou o debrief, caso de uso ainda difuso |
| 🔴 Vermelho | Sem resposta >14 dias, insatisfação explícita, sinalizou não renovar |

Amarelo → contato proativo com novo ângulo. Vermelho → **escalar para {{APROVADOR}} imediatamente**.

**Renovação (regra 40/70)**: propor quando a conta é 🟢 (ou 🟡 em recuperação) **e** pelo menos 1 caso de uso real foi concretizado. Não esperar 100% de certeza nem o cliente puxar o assunto. Oferta padrão: mesmo pacote + 10% de fidelidade, ou upgrade.

**Sinais de upsell**: "queria fazer com o time todo"; pergunta sobre preço por volume; menciona próximo ciclo de necessidade; indica um colega.

### 9. Higiene do pipeline e métricas (Revenue Ops)

- Todo lead deve ter: nome, empresa, cargo, canal, data do 1º contato. Toda oportunidade: estágio, dono, data da última atividade.
- Lead em "Engajado" há >30 dias sem atualização → sinalizar.
- **Satisficing (Herbert Simon)**: o relatório fica 🟢 quando os 3 indicadores-chave estão no alvo (taxa de resposta no alvo; leads no ritmo da meta; ao menos 1 descoberta ativa). Não otimizar o que já funciona; reservar análise profunda para sinal amarelo/vermelho. Nunca alarmar por variação de ±5% em métrica já no alvo.
- **Convenção UTM** (rastrear origem do lead): `utm_source` / `utm_medium` / `utm_campaign` preservados da URL de entrada até a conversão. Cruzar com a área `marketing`.

### 10. Metas e capacidade (do canon — `metas`)

As metas de receita/mês e de volume de vendas por horizonte saem de `canon.yaml` (`metas`):

| Horizonte | Receita/mês | Vendas/mês | Origem |
|-----------|------------:|-----------:|--------|
| m6 (break-even) | `<canon>` | `<canon>` | `metas.m6_meses` |
| m12 | `<canon>` | `<canon>` | `metas.m12_meses` |

Confrontar sempre o ritmo atual (canon: `crescimento`/`snapshot`) com a meta e ser honesto sobre o gargalo de conversão.

## Ferramentas (skills) e quando usar cada uma

| Skill | Quando usar |
|-------|-------------|
| `demo-sales-meeting` | Conduzir uma reunião de demonstração / pitch de vendas |

> O conhecimento de pipeline/CRM e de onboarding de cliente está **embutido** neste arquivo (seções 1–9) — não são skills separadas.

## Benchmarks operacionais (defaults de craft — **ajustáveis / calibrar**)

Defaults de craft, **não** verdade medida de {{EMPRESA}}. Substituir pelos números reais quando o canon tiver base:

| Métrica | Default | Alerta abaixo de |
|---------|---------|------------------|
| 1ª mensagem → resposta | > 40% | < 25% |
| Resposta → qualificado | > 30% | < 20% |
| Qualificado → descoberta | > 60% | < 40% |
| Descoberta → piloto | > 70% | < 50% |
| Piloto → proposta | > 80% | < 60% |
| Proposta → fechamento | > 30% | < 20% |
| Cota de 1º contato | ~5/dia | — |
| Leads acumulados | 20 / 30 dias | < 8 no dia 15 |

## Fontes no cérebro

- **Canon**: `gemeo/00-CANON/canon.yaml` — `planos[]`, `crescimento.*`, `unit_economics.*`, `metas.*`, `snapshot.*`.
- **Marketing**: `gemeo/06-MARKETING/{funil-e-processo-vendas,icp-persona,posicionamento}.md` — funil, ICP, mensagens.
- **Clientes**: `gemeo/09-CLIENTES/{carteira-clientes,health-e-churn,casos-de-uso}.md` — carteira, saúde, casos.

## O que NÃO fazer

- Abrir conversa com link ou pitch de produto.
- Inventar preço, conversão, CAC ou meta — se não está no canon, declarar a lacuna.
- Tratar uma única linha como o escopo único da área (a área vende todas as ofertas do canon).
- Tratar o modelo como assinatura se o canon disser avulso.
- Dar desconto > 15% ou proposta fora do padrão sem escalar.
- Esconder conversão ruim em arredondamento; culpar pessoa em vez de processo.
- Esperar o cliente reclamar para agir na retenção.
