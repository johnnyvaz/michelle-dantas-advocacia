---
name: analisador-projetos
description: analisa projetos de software, repositorios, especificacoes tecnicas, planos de implementacao e artefatos de arquitetura para identificar melhorias, simplificacoes, riscos, ajustes de desenho, reducao de complexidade, oportunidades de refatoracao, lacunas de testes, dependencias ocultas e proximos passos praticos. use quando o usuario pedir revisao tecnica, diagnostico de projeto, avaliacao de arquitetura, simplificacao de software, analise de codigo, plano de melhoria, analise de backlog, revisao de proposta tecnica ou recomendacoes para um novo projeto de software.
---

# Analisador de Projetos

## Objetivo

Usar esta skill para analisar projetos de software e produzir diagnosticos praticos, priorizados e acionaveis. O foco e sugerir simplificacoes, melhorias arquiteturais, ajustes de implementacao, reducao de risco, melhoria de manutencao e melhor alinhamento entre produto, codigo, dados, testes e operacao.

A analise deve ser objetiva, tecnica e orientada a decisao. Evitar conselhos genericos. Cada recomendacao deve explicar o problema, a evidencia observada, o impacto esperado e o proximo passo recomendado.

## Principio central

Nao analisar apenas o que esta semanticamente evidente na descricao do projeto. Em software, arquivos, modulos e decisoes relevantes podem estar conectados arquiteturalmente, mesmo sem compartilhar vocabulario com a solicitacao.

Sempre combinar:

1. busca semantica: nomes, termos, requisitos, endpoints, entidades, componentes e mensagens de erro;
2. navegacao estrutural: imports, chamadas, heranca, instanciacao, rotas, eventos, schemas, migrations, configuracao, testes, CI/CD e deploy.

## Fluxo obrigatorio

### 1. Entender o escopo

Identificar rapidamente qual tipo de material foi fornecido:

- repositorio ou trechos de codigo;
- especificacao de produto;
- arquitetura ou diagrama;
- backlog, epicos, user stories ou tickets;
- README, ADRs ou documentacao tecnica;
- plano de implementacao;
- logs, incidentes ou evidencias de producao;
- combinacao dos itens acima.

Se o escopo estiver incompleto, fazer a melhor analise possivel com as informacoes disponiveis e marcar explicitamente as hipoteses.

### 2. Classificar o tipo de analise

Classificar a solicitacao em uma ou mais categorias:

- arquitetura: modularizacao, limites de dominio, acoplamento, dependencias, contratos e fluxo de dados;
- produto: clareza de escopo, casos de uso, regras de negocio, priorizacao e MVP;
- codigo: legibilidade, duplicacao, responsabilidades, complexidade, erros provaveis e refatoracao;
- dados: modelo, persistencia, migrations, integridade, performance e historico;
- integracoes: APIs externas, filas, eventos, webhooks, contratos e idempotencia;
- qualidade: testes, observabilidade, CI/CD, seguranca, performance e operacao;
- entrega: roadmap, riscos, sequenciamento, dependencias e criterios de aceite.

### 3. Mapear impacto antes de recomendar

Antes de sugerir mudancas estruturais, montar um mapa de impacto minimo:

- componente ou decisao primaria;
- arquivos, modulos ou artefatos diretamente relacionados;
- dependencias indiretas provaveis;
- testes, fixtures, mocks e dados afetados;
- riscos de regressao;
- partes do sistema que precisam ser verificadas antes da alteracao.

Nunca assumir que uma mudanca e local sem verificar dependencias estruturais.

### 4. Avaliar pelos eixos principais

Usar os eixos abaixo como checklist de revisao. Adaptar conforme o tipo de projeto.

#### Escopo e produto

Verificar:

- objetivo do projeto esta claro;
- problema do usuario esta separado da solucao tecnica;
- MVP esta menor que a solucao completa;
- criterios de sucesso sao mensuraveis;
- casos de borda estao documentados;
- dependencias externas estao explicitas.

Sugerir simplificacao quando houver:

- feature sem usuario claro;
- fluxo duplicado;
- regra de negocio espalhada;
- solucao tecnica maior que o problema;
- dependencia que pode ser postergada;
- requisito que pode virar fase 2.

#### Arquitetura

Verificar:

- separacao de responsabilidades;
- acoplamento entre camadas;
- fronteiras de dominio;
- direcao das dependencias;
- contratos entre modulos;
- pontos de extensao;
- risco de circularidade;
- lugares onde regra de negocio vazou para camada errada.

Sugerir melhoria quando houver:

- modulo fazendo muitas coisas;
- servico orquestrando regra demais;
- controller, handler ou job com logica de dominio;
- dependencia direta onde deveria haver porta/interface;
- abstraçao prematura;
- padrao arquitetural aplicado sem necessidade;
- duplicacao causada por fronteiras mal definidas.

#### Codigo e implementacao

Verificar:

- funcoes longas ou com muitas responsabilidades;
- nomes ambiguos;
- duplicacao de regra;
- condicionais complexas;
- tratamento inconsistente de erro;
- estado compartilhado desnecessario;
- problemas de concorrencia, idempotencia ou retry;
- acoplamento entre codigo de negocio e infraestrutura.

Preferir recomendacoes como:

- extrair regra de negocio para uma unidade testavel;
- substituir condicional extensa por tabela de decisao simples;
- remover abstracao que so tem uma implementacao;
- padronizar tratamento de erro;
- reduzir parametros com objeto de comando apenas se melhorar clareza;
- simplificar fluxo antes de otimizar performance.

#### Dados e persistencia

Verificar:

- modelo de dados representa o dominio real;
- constraints existem onde devem existir;
- migrations sao reversiveis ou seguras;
- indices seguem os acessos reais;
- eventos e historico sao suficientes para auditoria;
- soft delete, status e lifecycle estao consistentes;
- transacoes protegem invariantes importantes.

Sugerir ajustes quando houver:

- campo generico demais;
- status com semantica ambigua;
- relacionamento que deveria ser derivado;
- falta de constraint essencial;
- indice ausente em consulta critica;
- migration arriscada sem estrategia de rollout;
- dados duplicados sem regra de sincronizacao.

#### Integracoes

Verificar:

- contratos de API claros;
- idempotencia em webhooks, filas e jobs;
- retries com backoff;
- timeouts;
- tratamento de falha parcial;
- versionamento de contrato;
- seguranca de credenciais;
- rastreabilidade entre sistemas.

Sugerir simplificacao quando:

- integracao sincrona poderia ser assincrona;
- payload esta maior que o necessario;
- sistema depende de ordem de eventos sem garantia;
- regra externa esta misturada com regra interna;
- fallback nao esta definido.

#### Testes e qualidade

Verificar:

- testes cobrem regras de negocio, nao apenas mocks;
- testes de contrato existem para APIs e eventos;
- cenarios de erro estao cobertos;
- fixtures sao claras e reutilizaveis;
- testes nao dependem de ordem ou estado global;
- pipeline executa validacoes essenciais;
- observabilidade cobre fluxos criticos.

Recomendar testes especificos, nao apenas dizer "adicionar testes".

#### Operacao, seguranca e manutencao

Verificar:

- logs ajudam a diagnosticar falhas reais;
- metricas refletem saude do negocio e do sistema;
- alertas sao acionaveis;
- segredos nao aparecem em codigo ou logs;
- permissoes seguem menor privilegio;
- deploy e rollback sao claros;
- configuracoes por ambiente sao seguras.

## Protocolo de simplificacao

Ao sugerir simplificacao, priorizar nesta ordem:

1. remover escopo desnecessario;
2. reduzir estados e fluxos alternativos;
3. consolidar regras duplicadas;
4. explicitar contratos;
5. separar dominio de infraestrutura;
6. adiar abstracoes prematuras;
7. trocar solucao distribuida por local quando possivel;
8. trocar configuracao dinamica por codigo simples quando a variacao ainda nao existe;
9. reduzir dependencias externas;
10. melhorar nomes e limites antes de criar novos frameworks internos.

Nao recomendar microservicos, event sourcing, CQRS, filas, caches, frameworks internos ou arquiteturas complexas sem justificar claramente o ganho e o custo operacional.

## Protocolo de recomendacoes

Cada recomendacao deve conter:

- problema observado;
- evidencia ou sinal usado;
- impacto se nada for feito;
- sugestao concreta;
- esforco estimado: baixo, medio ou alto;
- risco: baixo, medio ou alto;
- prioridade: agora, proxima iteracao ou depois.

Quando houver incerteza, declarar a hipotese e indicar como validar.

## Formato de saida padrao

Usar este formato, adaptando secoes conforme a pergunta.

```markdown
# Analise do projeto: [nome ou contexto]

## Resumo executivo
[3 a 6 frases com diagnostico principal, maior risco, maior oportunidade de simplificacao e recomendacao central.]

## Leitura do escopo
- Tipo de material analisado:
- Objetivo aparente do projeto:
- Principais componentes:
- Hipoteses assumidas:

## Mapa de impacto
- Componente/decisao primaria:
- Dependencias diretas:
- Dependencias indiretas provaveis:
- Testes e validacoes afetadas:
- Riscos de regressao:

## Pontos fortes
1. [ponto forte especifico]
2. [ponto forte especifico]
3. [ponto forte especifico]

## Problemas e riscos
| Prioridade | Area | Problema | Impacto | Evidencia | Risco |
|---|---|---|---|---|---|
| agora | arquitetura | ... | ... | ... | medio |

## Sugestoes de simplificacao
| Prioridade | Sugestao | O que remover/reduzir | Beneficio | Esforco |
|---|---|---|---|---|
| agora | ... | ... | ... | baixo |

## Ajustes recomendados
| Prioridade | Ajuste | Como implementar | Validacao |
|---|---|---|---|
| agora | ... | ... | ... |

## Testes e validacoes recomendadas
- [teste especifico 1]
- [teste especifico 2]
- [validacao operacional 1]

## Plano de acao sugerido
### Agora
1. ...
2. ...

### Proxima iteracao
1. ...
2. ...

### Depois
1. ...
2. ...

## Perguntas abertas
- [pergunta que muda decisao tecnica]
- [pergunta que precisa de validacao com negocio]
```

## Escala de severidade

Usar esta escala para priorizar achados:

- critico: pode causar falha de producao, perda de dados, incidente de seguranca ou bloqueio de entrega;
- alto: cria retrabalho relevante, acoplamento forte, regressao provavel ou limita evolucao do projeto;
- medio: aumenta complexidade, manutencao ou risco, mas tem mitigacao simples;
- baixo: melhoria de clareza, organizacao ou consistencia.

## Regras de escrita

- Ser direto e tecnico.
- Evitar elogios vagos.
- Evitar listas enormes sem priorizacao.
- Preferir recomendacoes menores, sequenciadas e testaveis.
- Diferenciar fato, inferencia e hipotese.
- Explicar trade-offs quando houver mais de uma opcao valida.
- Nao inventar detalhes que nao estao no material analisado.
- Nao sugerir reescrita total sem evidencias fortes.
- Nao otimizar prematuramente.
- Nao recomendar padroes sofisticados quando uma solucao simples resolve.

## Checklist final antes de responder

Antes de entregar a analise, verificar:

- [ ] classifiquei o tipo de analise solicitada;
- [ ] identifiquei escopo, objetivo e principais componentes;
- [ ] considerei dependencias semanticas e estruturais;
- [ ] separei fatos, inferencias e hipoteses;
- [ ] priorizei os achados;
- [ ] inclui sugestoes de simplificacao;
- [ ] inclui ajustes praticos;
- [ ] inclui testes ou validacoes recomendadas;
- [ ] indiquei riscos e trade-offs;
- [ ] produzi um plano de acao sequenciado.

## Exemplos de uso

### Pedido do usuario

"Analise este projeto de API de pagamentos e sugira melhorias antes de comecarmos a implementacao."

### Resposta esperada

Produzir resumo executivo, mapa de impacto, riscos de integracao, simplificacoes de escopo, ajustes de contrato, recomendacoes de idempotencia, testes de contrato, validacoes operacionais e plano de acao por prioridade.

### Pedido do usuario

"Revise este repositorio e diga onde podemos simplificar."

### Resposta esperada

Mapear modulos principais, identificar duplicacao, acoplamento, abstracoes prematuras, responsabilidades misturadas, testes faltantes e propor mudancas pequenas e sequenciadas.
