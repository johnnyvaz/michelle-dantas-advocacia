# Análise Competitiva — concorrentes e defensabilidade

> **Template** — preenchido via /montar-gemeo. Deriva do canon: `mercado.*`, `produto.*`. Números de mercado: só os do canon — share por player não é medido, não inventar.
> **Citação parseável**: todo número preenchido usa o marcador `R$ X [canon: path.do.campo]` ou `N [calc: metrica]` — o CI compara com o canon e acusa drift (specs/001-melhorias-gemeo/contracts/formatos-arquivos.md).

---

## 1. Contra quem competimos de verdade

Mapeie as **frentes** de competição (não só empresas: o status quo e a inércia costumam ser o concorrente nº 1). Para cada uma: quem, o que oferece, e o nível de ameaça (B/M/A).

| Frente | Quem | O que oferece | Preço | Ameaça | Fonte da informação |
|--------|------|---------------|-------|--------|---------------------|
| **Incumbente institucional** | [PREENCHER] | [PREENCHER] | R$ `[X]` | [B/M/A] — [risco R[NN]] | [PREENCHER: site, conversa, doc] |
| **Plataformas adjacentes** | [PREENCHER] | [PREENCHER] | R$ `[X]` | [B/M/A] — [risco R[NN]] | [PREENCHER] |
| **Players internacionais** | [PREENCHER] | [PREENCHER] | R$ `[X]` | [B/M/A] | [PREENCHER] |
| **Serviços / consultorias** | [PREENCHER] | [PREENCHER] | R$ `[X]` | [B/M/A] | [PREENCHER] |
| **Status quo / inércia** | [solução manual, "deixa para depois"] | [PREENCHER] | grátis | [B/M/A] — o concorrente real do plano de entrada | [PREENCHER] |

> Padrão transferível: muitas vezes o concorrente nº 1 **não é uma empresa — é a inércia**. É o que torna um gatilho de demanda (`premissas.gatilho_demanda.*`) tão importante: ele converte "seria bom ter" em "preciso agora".

## 2. Matriz de capacidades

Compare o que **cada player** entrega. A coluna do seu negócio deve ser **honesta** (espelha `produto.implementado` vs. `produto.em_construcao`), não aspiracional.

| Capacidade | [Nós] | [Conc. A] | [Conc. B] | [Conc. C] | Status quo |
|------------|:-----:|:---------:|:---------:|:---------:|:----------:|
| [capacidade central 1] | ✅ | ⚠️ | ❌ | ✅ | ❌ |
| [capacidade central 2] | ✅ | ❌ | ✅ | ✅ | ❌ |
| [integração com o ecossistema do cliente] | 🔜 roadmap | ❌ | ✅ | ❌ | ❌ |
| [preço acessível ao ICP] | ✅ | ❌ | embutido | ❌ | grátis |

*(✅ tem · ⚠️ parcial · 🔜 no roadmap · ❌ não tem. A coluna do seu negócio reflete `produto.*` — o que está implementado de fato.)*

## 3. Por que ganhamos — a defensabilidade real

Liste de 3 a 5 vantagens **sustentáveis** (não features copiáveis). Eixos comuns:

1. **Especialização com janela de tempo:** [PREENCHER — ser a oferta dedicada enquanto generalistas não priorizam].
2. **Lock-in real:** [PREENCHER — o custo de troca que cresce com o uso; ancore no ativo de `produto.*`].
3. **Dados que se acumulam:** [PREENCHER — o uso (`snapshot.uso_produto.*`) vira ativo que o concorrente não tem].
4. **Coopetição:** [PREENCHER — onde você está *dentro* do ecossistema do incumbente, não contra].
5. **Canal, não rival:** [PREENCHER — players que poderiam competir e que você transforma em distribuição].

## 4. Onde NÃO temos defesa (honestidade)

A resposta forte é a honesta. Liste as fraquezas reais:

- [PREENCHER — ex. a parte comoditizável do produto; nunca é a defesa].
- [PREENCHER — risco de um incumbente comoditizar o básico; aponte o plano (`registro-de-riscos.md`)].
- [PREENCHER — ausência de patente/exclusividade; velocidade e profundidade são a vantagem até os dados acumularem].

## 5. Leitura para o oráculo

- Pergunta "o que impede de copiarem?" → responder com os itens da §3, **admitindo** a §4.
- Comparações de preço → ancore no `mercado.ancora_de_valor` (o que o cliente já paga hoje pelo status quo), nunca num preço inventado de concorrente.
- Share de mercado por player **não existe no canon** → não estimar; usar `mercado.tam_empresas` / `mercado.sam_empresas` / `mercado.som_ano1_empresas`.

---

*Coerência: tamanho de mercado de `mercado.*`; capacidades próprias de `produto.*`. Preços de concorrentes só com fonte citada; share por player não é inventado.*
