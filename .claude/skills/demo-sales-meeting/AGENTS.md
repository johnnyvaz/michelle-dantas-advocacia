# Agente: Demo Sales Meeting — Roteiro de Reunião com Pitch Infalível

> Pipeline de 9 fases para gerar o roteiro completo de uma reunião de demonstração + venda,
> baseado em estrutura validada em campo, SPIN Selling, Challenger Sale e princípios de Cialdini.

---

## PRINCÍPIO FUNDAMENTAL

Uma reunião de vendas de alto desempenho não convence — ela revela.

O prospect já tem o problema. Já sente a dor. Já quer a solução. Sua função é criar as condições para que ele mesmo articule o problema com clareza suficiente para tomar a decisão. Cada fase deste roteiro serve a esse objetivo.

**Medida de qualidade:** O prospect fecha não porque você vendeu bem — mas porque ele entendeu que não fechar seria um erro maior do que fechar.

**Regra de ouro:** Nunca apresente uma solução antes de confirmar que o problema foi articulado pelo próprio prospect. Apresentar cedo = vender caro sem valor percebido.

---

## Variáveis

```
PRODUTO = extraído de $ARGUMENTS (ex: "plataforma-cursos", "consultoria")
PERFIL = extraído de perfil= em $ARGUMENTS (default: "generico")
BASE = docs/VENDAS/demo-meetings/$PRODUTO/
FRAMEWORKS = .claude/skills/demo-sales-meeting/resources/frameworks.md
ARCO = .claude/skills/demo-sales-meeting/resources/arco-emocional.md
OBJECOES_BANCO = .claude/skills/demo-sales-meeting/resources/objecoes-banco.md
TIPOS_COMPRADOR = .claude/skills/demo-sales-meeting/resources/tipos-comprador.md
PROVA_SOCIAL = .claude/skills/demo-sales-meeting/resources/prova-social.md
ANCORAGEM = .claude/skills/demo-sales-meeting/resources/ancoragem-precos.md
```

---

## INICIALIZAÇÃO

**Se chamado sem argumentos:**
Fazer exatamente 3 perguntas antes de gerar o roteiro:

1. "Qual produto está sendo demonstrado? (ex: plataforma de cursos, consultoria, mentoria, diagnóstico)"
2. "Quem é o comprador? (ex: família com adolescente, RH de empresa, executivo individual, empreendedor)"
3. "Qual a principal dor que esse comprador costuma trazer para a reunião?"

Com as respostas, preencher as variáveis e prosseguir.

**Se chamado com argumentos:**
Resolver variáveis diretamente e confirmar:
```
Gerando roteiro para: [PRODUTO]
Perfil do comprador: [PERFIL]
Criando em: [BASE]
```

---

## FASE 0 — BRIEFING PRÉ-REUNIÃO

**Objetivo:** Preparar o vendedor para a reunião com contexto, ICP e discovery.

**Ler:** `$FRAMEWORKS` (seção SPIN — fase de Situation)

**Gerar `$BASE/00-briefing.md` com:**

```markdown
# Briefing Pré-Reunião — [PRODUTO]

## ICP (Ideal Customer Profile)
- **Quem é:** [perfil demográfico e situacional do prospect ideal]
- **Dor principal:** [o problema que os traz para a reunião]
- **Dor secundária:** [o problema que eles não sabem que têm]
- **Objeção mais provável:** [o que vai travar o fechamento]
- **Motivador emocional:** [o que os faz dizer sim de verdade]

## Discovery: Perguntas de Situação (SPIN — S)
Fazer ANTES da demo, nos primeiros 5 minutos:
1. [pergunta que revela situação atual]
2. [pergunta que revela nível de urgência]
3. [pergunta que qualifica orçamento indiretamente]
4. [pergunta que identifica quem decide]

## Configuração Técnica
- [ ] Link da demo pronto e testado
- [ ] Casos de sucesso selecionados para este perfil
- [ ] Preços e condições atualizados
- [ ] Objeções previsíveis preparadas

## Mindset do Vendedor
[1 parágrafo com o enquadramento mental correto para este perfil específico]
```

---

## FASE 1 — ABERTURA (0–5 min)

**Objetivo:** Criar rapport, estabelecer autoridade e plantar curiosidade.

**Princípio Cialdini:** Simpatia + Autoridade

**Gerar seção no roteiro com:**

### 1.1 — Rapport inicial (60 segundos)
- Pergunta pessoal leve (não sobre o produto)
- Validar a presença: "Fico feliz que vocês puderam estar aqui"
- Ancorar a duração: "Vou usar [X] minutos. No final você decide — sem pressão."

### 1.2 — Prova social de entrada (2 minutos)
**Regra:** Casos de sucesso ANTES de apresentar o produto.
Mostrar 2-3 resultados reais, com:
- Nome real ou inicial + cidade (personaliza)
- Resultado específico (não "transformou a vida" — qual resultado mensurável)
- Timeline realista (em quanto tempo)

**Template de prova social:**
```
"Deixa eu te mostrar a [NOME], de [CIDADE]. Ela começou [situação inicial].
Em [TEMPO], ela [resultado específico]. Hoje ela [situação atual]."
```

### 1.3 — Pergunta de conexão (1 minuto)
Após cada caso, perguntar:
```
"[NOME do prospect], você já tinha pensado em algo assim?"
"O que mais chamou atenção pra você?"
```
**Por que funciona:** Cria comprometimento inicial. A primeira concordância facilita as seguintes (Cialdini — Comprometimento).

---

## FASE 2 — DISCOVERY + PROBLEMA (5–15 min)

**Objetivo:** Fazer o prospect articular o problema com as próprias palavras.

**Framework:** SPIN Selling — Problem + Implication

**Regra crítica:** NUNCA pular esta fase. Vendedor que vai direto para a demo perde 60% das vendas.

### 2.1 — Perguntas de Problema (SPIN — P)
```
"Como vocês estão lidando com [área do problema] hoje?"
"O que já tentaram antes?"
"O que funcionou? O que não funcionou?"
```

### 2.2 — Perguntas de Implicação (SPIN — I)
Aprofundar as consequências do problema não resolvido:
```
"Se isso continuar assim por mais [6 meses / 1 ano], o que acontece?"
"Qual o custo de não resolver isso agora?"
"Como isso afeta [outras áreas da vida / negócio]?"
```

### 2.3 — Pergunta de Need-Payoff (SPIN — N)
Fazer o prospect declarar o valor da solução:
```
"Se você tivesse [resultado específico], o que mudaria?"
"Quanto valeria pra você resolver isso de forma definitiva?"
```

**Anotar mentalmente:** As palavras exatas que o prospect usa para descrever o problema. Usá-las na apresentação.

---

## FASE 3 — EDUCAÇÃO / REFRAMING (15–25 min)

**Objetivo:** Ensinar algo que muda como o prospect vê o problema.

**Framework:** Challenger Sale — Teach

**Regra:** Não apresente o produto ainda. Ensine primeiro. Quem ensina tem autoridade. Quem tem autoridade não precisa convencer.

### 3.1 — O Insight inesperado
Apresentar uma perspectiva que o prospect não tinha:
```
"A maioria das pessoas tenta resolver [problema] fazendo [solução comum].
O que os dados mostram é que [insight contraintuitivo]."
```

### 3.2 — Os 3 Pilares / Dimensões
Estruturar o problema em 3 dimensões (número mágico — cérebro categoriza bem em 3):
```
"Existem 3 coisas que separam quem resolve isso de quem não resolve:
1. [Pilar 1 — o mais óbvio]
2. [Pilar 2 — o que eles não sabem]
3. [Pilar 3 — o diferenciador do produto]"
```

**Perguntar após cada pilar:**
```
"Até aqui fez sentido? Alguma dúvida?"
```
(Confirma engajamento + cria micro-comprometimentos)

---

## FASE 4 — DEMONSTRAÇÃO (25–40 min)

**Objetivo:** Mostrar o produto no contexto específico do prospect.

**Regra:** Demo não é tour — é narrativa. Cada funcionalidade existe para resolver algo que o prospect já disse que é problema.

**Estrutura de cada funcionalidade:**
```
1. SITUAÇÃO: "Você disse que tem dificuldade com [X]..."
2. PROBLEMA: "Sem isso, o que acontece é [consequência que eles descreveram]..."
3. SOLUÇÃO: "Por isso a gente criou [funcionalidade]..."
4. RESULTADO: "O que os alunos / clientes relatam é [resultado específico]..."
5. PERGUNTA: "Isso resolveria o que você está enfrentando?"
```

### Sequência de demo recomendada:
1. **Visão geral** (30 seg) — "deixa eu mostrar como funciona"
2. **Quick win** (2 min) — a funcionalidade mais impressionante primeiro
3. **Dor principal** (5 min) — o problema que eles trouxeram, resolvido
4. **Dor secundária** (3 min) — o que eles não sabiam que precisavam
5. **Organização / Plano** (2 min) — como eles usariam no dia a dia

---

## FASE 5 — COMUNIDADE E SUPORTE (40–45 min)

**Objetivo:** Eliminar o medo do fracasso e o sentimento de solidão.

**Motivador emocional:** "Nunca mais sozinho" — um dos gatilhos mais fortes para conversão.

### 5.1 — O problema do isolamento
```
"Sabe o que a maioria das pessoas sente quando tenta [resolver sozinho]?
Elas sentem que são as únicas com esse problema.
Que tá tudo errado com elas. Que são lentas demais."
```

### 5.2 — A comunidade como solução
```
"Com a gente, você entra em uma comunidade de [N] pessoas
que estão exatamente no mesmo ponto que você.
Do dia pra noite, você nunca mais vai estar sozinho nisso."
```

### 5.3 — Suporte como diferencial (listar os pilares)
Apresentar os pilares de suporte de forma numerada.
**Regra:** Números criam percepção de estrutura. "10 pilares" parece mais sólido que "bastante suporte".

**Após os pilares, perguntar:**
```
"Qual desses pontos você achou mais importante para o seu caso?"
```
(Prospect nomeia o que mais valorizou — usa isso na hora do preço)

---

## FASE 6 — CHECKLIST DE APROVAÇÃO (45–50 min)

**Objetivo:** Confirmar fit e criar comprometimento antes de apresentar preço.

**Framework:** Técnica de Comprometimento (Cialdini) + Sandler Pain

**Regra crítica:** NUNCA apresentar preço antes desta fase.
Quem apresenta preço sem comprometimento está pedindo para negociar.

### Perguntas do checklist (fazer em sequência):

```
1. "Você acredita que [produto] é exatamente o que você precisa?"
   → Precisa de "sim" antes de avançar

2. "Como seria sua [situação / resultado] sem essa ajuda profissional?"
   → Prospect articula a dor de não resolver

3. "Você prefere começar agora ou esperar mais [3 meses / 1 ano]?"
   → Cria urgência por comparação

4. "Se o financeiro se encaixar, você está pronto para começar?"
   → Qualifica a objeção real (é só financeiro?)
```

### Aprovação — o momento mais importante da reunião:
```
"Perfeito. Com base em tudo que conversamos,
eu adoraria ter você aqui com a gente.
Você foi aprovado(a). Parabéns."
```

**Por que funciona:** "Aprovação" cria identidade de pertencimento antes do preço.
Prospect que se sente "aceito" tem resistência muito menor à objeção financeira.
(Cialdini — Comprometimento + Pertencimento)

---

## FASE 7 — ANCORAGEM E APRESENTAÇÃO DE PREÇO (50–58 min)

**Objetivo:** Fazer o preço real parecer pequeno em relação ao valor e às alternativas.

**Framework:** Ancoragem de preços (Ariely — Predictably Irrational)

### 7.1 — Âncora por alternativas (2 min)
Apresentar o que o mercado cobra para resolver o mesmo problema:
```
"Para você ter uma ideia do que existe no mercado pra resolver isso:
[Opção 1 — mais cara]: [preço]
[Opção 2 — conhecida]: [preço]
[Opção 3 — simples]: [preço]
E isso é cada coisa separada — sem o suporte que você acabou de ver."
```

**Regra:** Começar pela mais cara. A âncora alta faz o preço real parecer razoável.

### 7.2 — Missão e acessibilidade (30 seg)
```
"Nossa missão sempre foi tornar [resultado] acessível para quem realmente quer.
Não dá pra cobrar [preço absurdo] e dizer que acredita na missão."
```

### 7.3 — Apresentação do preço (com bundling)
Antes do número, recapitular tudo incluído:
```
"Então, para tudo que você acabou de ver:
[lista rápida de 5-7 itens incluídos],
o investimento é de [PREÇO]."
```

**Regra:** O preço nunca é o primeiro número que o prospect ouve. A âncora já foi plantada.

### 7.4 — Pergunta imediata após o preço
```
"Para tudo isso que entrega, vocês acham que vale?"
```
(Força concordância sobre o valor antes da objeção de preço)

---

## FASE 8 — OBJEÇÕES E FECHAMENTO (58–70 min)

**Objetivo:** Tratar objeções sem defensividade e fechar com risco zero.

**Framework:** Feel-Felt-Found + Inversão de risco

### 8.1 — Mapa de objeções principais

| Objeção | Diagnóstico | Resposta |
|---------|-------------|----------|
| "Tá caro" | Valor não foi percebido | Voltar ao que o prospect disse que valeria resolver o problema |
| "Vou pensar" | Não identificou urgência | "O que falta para você tomar a decisão hoje?" |
| "Não tenho o valor agora" | Objeção real de liquidez | Opção de parcelamento + bolsa/desconto condicional |
| "Preciso falar com [cônjuge/sócio]" | Não é o decisor | "Quer que eu faça outra reunião com eles?" |
| "Deixa eu pesquisar mais" | Falta de confiança / urgência | Reforçar escassez + prova social específica |
| "Tentei algo parecido e não funcionou" | Trauma de produto anterior | "O que aconteceu? O que seria diferente?" |

### 8.2 — Objeção financeira — protocolo completo

```
1. Validar: "Entendo perfeitamente — essa é uma decisão importante."
2. Diagnosticar: "O que mais pesou — o valor da parcela ou o total?"
3. Isolar: "Se não fosse pelo financeiro, você estaria pronto?"
4. Oferecer: Bolsa parcial / condição especial (apenas se sim na pergunta 3)
5. Condicionar: "Essa condição especial é para perfis que [critério] — e vejo que você se encaixa."
```

**Regra da bolsa parcial / desconto condicional:**
- Nunca oferecer desconto antes de ouvir a objeção
- Sempre condicionar a um critério ("perfil de alta dedicação", "início imediato", "indicação")
- Nunca reduzir mais de uma vez — cria precedente de barganha

### 8.3 — Técnica de escassez real
```
"Para você ter ideia, só consigo garantir [N] vagas por mês
para dar o suporte que você acabou de ver. 
Essa semana tenho [N-x] disponíveis."
```

**Regra:** Escassez só funciona se for real ou verossímil. Escassez falsa = perda de confiança.

### 8.4 — Fechamento com inversão de risco
```
"Uma coisa importante: existe garantia de reembolso por [prazo].
Não é nossa política — é direito do consumidor.
Você pode começar, ver na prática, e se não for o que esperava, basta pedir."
```

**Por que funciona:** Remove o risco percebido. Decisão de compra se torna decisão de "tentar" — muito mais fácil.

---

## FASE 9 — PÓS-REUNIÃO (follow-up)

**Objetivo:** Manter o momentum emocional e facilitar o fechamento assíncrono.

**Gerar `$BASE/03-followup.md`:**

### 9.1 — Mensagem de follow-up (dentro de 2h após a reunião)
```
Assunto: [Nome], você foi aprovado(a) ✓

[Nome],

Foi um prazer conversar. Vi que você [mencionar algo específico que eles disseram].

Para facilitar:
→ [Link de checkout / próximo passo]
→ [Condição especial se houver]
→ [Prazo de validade da condição]

Qualquer dúvida, estou aqui.

[Nome do vendedor]
```

### 9.2 — Sequência de follow-up se não responder

| Dia | Canal | Mensagem |
|-----|-------|----------|
| D+1 | WhatsApp | "Oi [Nome], tudo bem? Vi que você ainda não finalizou — tem alguma dúvida?" |
| D+3 | E-mail | Caso de sucesso relacionado ao perfil deles |
| D+7 | WhatsApp | "Condição especial expira em [data]. Quero garantir sua vaga antes disso." |
| D+14 | E-mail | "Atualização sobre [produto] — resultado novo de aluno similar ao seu perfil" |

**Regra:** Depois de 3 tentativas sem resposta, uma mensagem de fechamento:
```
"[Nome], não quero incomodar. Entendo que o momento pode não ser agora.
Se mudar de ideia, [produto] vai estar aqui. Boa sorte com [objetivo que eles mencionaram]."
```
(Paradoxo da reatividade — às vezes essa mensagem gera o sim que as anteriores não geraram)

---

## FASE OPCIONAL — ANÁLISE DE REUNIÃO GRAVADA

**Trigger:** Quando o usuário passa uma transcrição ou arquivo de áudio de reunião real.

**Gerar `$BASE/04-analise.md` com:**

```markdown
## Análise de Reunião — [DATA]

### Arco Emocional
[Mapeamento por fase: emoção dominante do prospect em cada segmento]

### Técnicas Usadas (✓ = bem executada / ✗ = oportunidade perdida)
| Técnica | Fase | Status | Observação |
|---------|------|--------|------------|

### Momentos Críticos
- **Pico positivo:** [momento, o que causou]
- **Pico de tensão:** [momento, o que causou]
- **Objeção principal:** [texto exato + como foi tratada]

### O que funcionou
[lista específica]

### O que pode melhorar
[lista específica com alternativa sugerida]

### Score de execução
| Fase | Score (0-10) | Observação |
|------|-------------|------------|
| Abertura + Prova Social | | |
| Discovery SPIN | | |
| Educação / Reframing | | |
| Demo | | |
| Comunidade + Suporte | | |
| Checklist + Aprovação | | |
| Ancoragem + Preço | | |
| Objeções + Fechamento | | |
| **Total** | | |
```

---

## Regras Gerais do Pipeline

- **Adaptar ao produto:** Cada produto tem prova social diferente, objeções diferentes, ancoragem diferente. Não usar template genérico.
- **Adaptar ao perfil do comprador:** Analítico quer dados. Emocional quer história. Aspiracional quer visão. Cético quer provas.
- **Nunca pular discovery:** A pressão para ir logo para a demo mata vendas. A demo sem contexto é um catálogo, não uma solução.
- **Nunca apresentar preço antes do comprometimento:** A aprovação antes do preço não é manipulação — é respeito pela decisão do prospect.
- **Linguagem pt-BR** com acentuação correta em todos os arquivos gerados.
- **Citar evidências reais** nos casos de sucesso — nunca inventar resultados.
- **Datas:** formato `DD/MM/YYYY` nos cabeçalhos.

---

## Checklist de Conclusão

```
Roteiro gerado para: [PRODUTO] | Perfil: [PERFIL]

Arquivos criados em [BASE]:
- [x] 00-briefing.md       → ICP + perguntas de discovery + configuração
- [x] 01-roteiro.md        → Roteiro completo 9 fases com falas e timings
- [x] 02-objecoes.md       → Banco de objeções + protocolo de fechamento
- [x] 03-followup.md       → Sequência de follow-up D+0 a D+14

Duração estimada da reunião: [X] minutos
Fase mais crítica para este perfil: [fase]
Objeção mais provável: [objeção]
```
