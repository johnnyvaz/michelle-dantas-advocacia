# Template: Model Card PH3A

```markdown
# Model Card — [NOME DO COMPONENTE DE IA]

**Produto:** [PRODUTO]
**Versão do Model Card:** [VERSAO]
**Data de elaboração:** [DATA]
**Elaborado por:** [NOME/AREA]
**Status:** [ ] Rascunho  [ ] Em revisão  [ ] Aprovado para Produção

---

## 1. Identificação do Modelo

| Campo | Detalhe |
|---|---|
| Nome / versão do modelo | [ex: gpt-4o, claude-3-5-sonnet-20241022, modelo-interno-v2] |
| Fornecedor | [Anthropic / OpenAI / Google / Interno / Outro] |
| Tipo de acesso | [ ] API de terceiro  [ ] Modelo hospedado internamente  [ ] Fine-tuned |
| Data de início em produção | [DATA ou PREVISTA] |
| URL / endpoint (interno) | [se aplicável] |

---

## 2. Finalidade e Funcionalidade

**Finalidade principal:**
[Descrição em 1-3 frases do que este componente faz e por que existe]

**Tarefas executadas:**
- [ex: Classificação de textos como mídia negativa]
- [ex: Geração de respostas em linguagem natural para consultas de BI]

**Output e uso:**
[Como o output é usado no produto — exibido ao usuário, armazenado, usado em decisão, etc.]

**Supervisão humana:**
[ ] Sim — [descrever como]
[ ] Não — [justificar e descrever controles compensatórios]

---

## 3. Dados de Entrada

| Campo | Detalhe |
|---|---|
| Tipos de dados enviados ao modelo | [texto / estruturado / imagem / etc.] |
| Inclui dados pessoais? | [ ] Sim — quais: [TIPOS]   [ ] Não |
| Anonimização aplicada? | [ ] Sim — método: [METODO]   [ ] Não   [ ] N/A |
| Origem dos dados de entrada | [dados do cliente no produto / Big Data PH3A / dados públicos / outro] |
| Volume estimado por chamada | [ex: texto de até 2000 tokens / arquivo de até 5MB] |

---

## 4. Treinamento (preencher apenas se modelo próprio ou fine-tuned)

| Campo | Detalhe |
|---|---|
| Dados de treinamento | [origem, volume, período] |
| Dados de treinamento incluem dados pessoais? | [ ] Sim  [ ] Não |
| Base legal para uso em treinamento | [se dados pessoais] |
| Avaliação de viés (bias) realizada? | [ ] Sim — resultado: [RESULTADO]   [ ] Não |
| Data card disponível? | [ ] Sim — local: [CAMINHO]   [ ] Não |

---

## 5. Performance

| Métrica | Valor | Dataset de avaliação | Data |
|---|---|---|---|
| [Acurácia / F1 / BLEU / etc.] | [valor] | [descrição do dataset] | [data] |

**Monitoramento contínuo:**
[ ] Sim — frequência: [FREQUENCIA] / responsável: [RESPONSAVEL]
[ ] Não — justificativa: [JUSTIFICATIVA]

---

## 6. Limitações Conhecidas

| Limitação | Impacto | Mitigação |
|---|---|---|
| [ex: Pode alucinar informações factuais] | [ex: Informação incorreta ao cliente] | [ex: Revisão humana antes de exibir] |
| [ex: Performance degradada em textos muito curtos] | [ex: Classificação imprecisa] | [ex: Fallback para regra heurística] |

---

## 7. Riscos e Controles

| Risco | Probabilidade | Impacto | Controle Aplicado |
|---|---|---|---|
| Alucinação / output incorreto | [A/M/B] | [A/M/B] | [controle] |
| Prompt injection / manipulação | [A/M/B] | [A/M/B] | [controle] |
| Vazamento de dados do cliente | [A/M/B] | [A/M/B] | [controle] |
| Discriminação / viés | [A/M/B] | [A/M/B] | [controle] |
| Indisponibilidade da API | [A/M/B] | [A/M/B] | [controle / fallback] |

**Mecanismo de fallback:**
[O que acontece quando o modelo retorna erro, timeout ou output inválido]

---

## 8. Conformidade e Privacidade

| Item | Status | Detalhe |
|---|---|---|
| DPA ativo com fornecedor | [ ] Sim  [ ] Não  [ ] N/A | [contrato / vigência] |
| Cláusula de não-treinamento | [ ] Sim  [ ] Não  [ ] N/A | |
| País de processamento | — | [país/região] |
| RIPD elaborado e aprovado | [ ] Sim  [ ] Não  [ ] N/A | [link / data aprovação] |
| Base legal LGPD | — | [consentimento / contrato / legítimo interesse / etc.] |
| LIA elaborada (se legítimo interesse) | [ ] Sim  [ ] Não  [ ] N/A | |
| Titular informado sobre uso de IA | [ ] Sim  [ ] Não  [ ] N/A | [onde / como] |

---

## 9. Histórico de Versões

| Versão | Data | Mudança | Responsável |
|---|---|---|---|
| 1.0 | [DATA] | Versão inicial | [NOME] |

---

*Model Card gerado por Claude Code — Política Corporativa de IA PH3A v2.0, Seção 9.4*
*Aprovação do DPO obrigatória antes da implantação em produção quando dados pessoais envolvidos.*
```
