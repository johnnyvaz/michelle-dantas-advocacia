# Conteúdo / Cursos — Playbook

> O **conhecimento de domínio** da área: como produzir cursos e aulas bem. Deriva do canon, de `gemeo/07-PRODUTO/` (o que a plataforma entrega) e de `gemeo/06-MARKETING/` (a voz da marca) — **nunca os contradiz**. Se um número divergir, o canon prevalece; se o canon for omisso, declarar a lacuna.

## Objetivo da área

Fabricar o produto educacional de {{EMPRESA}}: os cursos da trilha (estrutura, módulos e aulas), em qualidade pedagógica alta, prontos para entrar na plataforma de aprendizagem.

## Princípios (como fazer bem)

- **Gap antes de conteúdo.** Todo curso começa por uma incapacidade concreta da pessoa, não por um tema. "Procrastinação" é gap; "produtividade" é tema vago.
- **Transformação antes de informação.** A aula existe para o aluno *ser capaz* de algo depois, não para "cobrir o assunto".
- **Camadas pedagógicas integradas.** Os níveis de profundidade da trilha (definidos na metodologia do negócio) são camadas pedagógicas — não parágrafos colados.
- **Aprendizagem ativa embutida.** Active recall, spaced repetition e técnica de Feynman fazem parte da estrutura da aula, não são um apêndice.
- **Lidere pelo benefício humano**, não pela tecnologia ou pela ferramenta usada nos bastidores.
- **Idempotência e validação nos dados.** O seed/conteúdo enviado à plataforma é sempre re-executável e validado antes de chegar ao banco/produção.

## Processo / Pipeline — curso → módulo → aula → plataforma

```
1. ESPECIFICAR   → especificação do curso: SPEC · módulos · objetivos · artefatos
2. ESTRUTURAR    → hierarquia Course → Module → Lesson (ordem, progresso, briefings)
3. SEMEAR        → converter a especificação no formato de dados da plataforma (cria os registros vazios das aulas)
4. ESCREVER      → escrever as aulas em Markdown (a partir do material do curso)
5. ENRIQUECER    → preencher os registros das aulas com o conteúdo escrito
6. DERIVAR       → formatos extras a partir do .md: visual, HTML, música, podcast, livro
7. VALIDAR       → rodar o validador da plataforma (OBRIGATÓRIO, zero erros) antes de qualquer envio
```

**Regra de ordem:** o passo de semeadura cria os **registros** das aulas; os passos de escrita/enriquecimento os **preenchem**. Nunca pular a semeadura antes de enriquecer.

> O contrato exato de dados (tabelas, tipos de campo, regras de escape, idempotência) é definido pela plataforma de {{EMPRESA}} — ver `gemeo/07-PRODUTO/`. Respeitar o schema real; não inventar nomes de tabela ou tipos de campo.

## Tipos de aula (o que o player suporta)

| Tipo | Quando usar | Capacidade que produz |
|------|-------------|-----------------------|
| `text` | Aula narrativa padrão — gancho, conceito, prática, fundamento, recall | Escrever aula em texto |
| `visual` | Conceito que se explica melhor com blocos animados | Gerar aula visual |
| `quiz` | Avaliação / verificação — quiz com opções por questão | Avaliação final do curso |
| `video` | Aula em vídeo — formato principal de muitas aulas | Player + integração de vídeo |

> Os tipos suportados e seus contratos dependem da plataforma — confirmar em `gemeo/07-PRODUTO/`. Formatos **derivados** da mesma aula (não são tipos próprios, mas peças extras): HTML inline, música de fixação, podcast, livro, folha de estudo.

## Anatomia de uma aula

1. **Frontmatter** (curso/módulo/aula/duração/tipo) · 2. **Gancho** (tensão, 200–400 palavras) · 3. **O Conceito** (claro e envolvente) · 4. **Conceitos-Chave** (tabela) · 5. **Na Prática** (exercício com template) · 6. **Fundamento** (a base real do conceito, com contexto) · 7. **Pausa para Reflexão** · 8. **Mapa de Conexões** · 9. **Verificação de Recall** (3–5 perguntas) · 10. **Próximo Passo**.

Mínimo 1.200 palavras; **sem teto** — denso o quanto o conteúdo exigir, nunca truncado.

## Recomendação por perfil — diagnóstico → cursos

Quando o negócio tem um **diagnóstico de perfil**, o relatório revela padrões da pessoa. A recomendação **parte sempre de algo específico do relatório**, nunca de oferta genérica, e é uma **camada de valor pós-relatório** — não produto separado no primeiro contato.

Estrutura genérica do mapeamento (preencher com a metodologia real do negócio):

| Padrão no relatório | Curso recomendado | Artefato-chave |
|---------------------|-------------------|----------------|
| `<padrão diagnosticado>` | `<curso da trilha que o trabalha>` | `<framework/modelo mental que o curso ensina>` |

> Não inventar curso nem artefato. Onde o mapeamento não existir no canon/produto, deixar em branco e sinalizar a lacuna. O mapeamento real é parte da metodologia do negócio (canon / `gemeo/07-PRODUTO/`).

## Padrões de qualidade (checklist de encerramento)

- [ ] O curso/aula ataca um **gap específico**?
- [ ] **Fundamento real**, não só entusiasmo?
- [ ] **Active recall** presente (auto-teste antes de seguir)?
- [ ] Conexões com aulas anteriores (spaced repetition) + mapa de conexões?
- [ ] **pt-BR** com acentuação impecável, sem jargão motivacional vazio?
- [ ] Camadas pedagógicas da trilha visíveis e integradas?
- [ ] Tipo de aula válido e conteúdo no formato que a plataforma exige?
- [ ] **Validador da plataforma** executado com **zero erros**?

## Capacidades (ferramentas) e quando usar cada uma

As skills concretas dependem da plataforma de {{EMPRESA}}; registre-as aqui quando existirem. Capacidades a cobrir:

| Capacidade | Quando usar |
|------------|-------------|
| Especificar curso | Início de um curso da trilha (definir estrutura e níveis) |
| Modelar hierarquia | Estruturar/ajustar a hierarquia Course → Module → Lesson e o progresso |
| Converter para a plataforma | Transformar a especificação em dados/seed (cria os registros das aulas) |
| Escrever aula em texto | Escrever as aulas em Markdown |
| Enriquecer dados da aula | Preencher os registros das aulas com o conteúdo escrito |
| Gerar formato HTML | Exportar a aula como HTML inline (ex.: editores que removem `<style>`) |
| Gerar aula visual | Produzir aula visual (blocos animados) |
| Gerar música educativa | Gerar música de fixação a partir da aula |
| Gerar podcast | Gerar podcast (áudio/vídeo) do conteúdo |
| Converter em livro | Converter o curso inteiro em livro |
| Amarrar gamificação | Ligar o conteúdo a streaks, conquistas e revisão espaçada |
| Recomendar por perfil | Mapear o diagnóstico de perfil → cursos na recomendação |

## Fontes no cérebro

- **Canon:** `gemeo/00-CANON/canon.yaml` — `planos[]` (SKUs reais), `metas`, `produto`, estágio.
- **Produto:** `gemeo/07-PRODUTO/` — PRD, FEATURES, STATUS, schema/contrato da plataforma (o que a plataforma entrega de fato).
- **Marketing:** `gemeo/06-MARKETING/` — voz da marca, posicionamento.
- **Enumeração dos cursos + metodologia:** canon / `gemeo/07-PRODUTO/` (lacuna se ainda não preenchido).

## O que NÃO fazer

- Inventar título, número ou artefato de curso fora da fonte canônica.
- Usar fundamento/referência como enfeite (sem contexto).
- Liderar a aula pela tecnologia/ferramenta em vez do benefício humano.
- Prometer mudança rápida ("7 dias") ou usar motivação vazia.
- Enriquecer os registros das aulas (passo 5) antes de semear (passo 3).
- Finalizar os dados sem rodar o validador, ou com erros pendentes.
- Fazer copy de campanha/landing aqui — é da área `copy`/`marketing`.
