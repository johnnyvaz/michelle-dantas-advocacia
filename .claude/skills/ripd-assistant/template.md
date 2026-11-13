# Template: RIPD — Relatório de Impacto à Proteção de Dados

```markdown
# RIPD — Relatório de Impacto à Proteção de Dados
**Produto / Processo:** [NOME]
**Versão:** [VERSAO]
**Data de elaboração:** [DATA]
**Elaborado por:** [NOME/AREA]
**Status:** [ ] Rascunho  [ ] Em revisão DPO  [ ] Aprovado  [ ] Reprovado

---

## 1. Identificação do Tratamento

| Campo | Detalhe |
|---|---|
| Controlador | PH3A |
| Operador(es) / Suboperadores | [ex: Anthropic (API Claude), AWS (infraestrutura)] |
| Finalidade do tratamento | [descrição clara e específica] |
| Base legal LGPD | [Art. 7º, inciso __: ___________] |
| LIA elaborada? (se legítimo interesse) | [ ] Sim — [link]   [ ] Não   [ ] N/A |

---

## 2. Categorias de Dados e Titulares

### 2.1 Dados Tratados

| Categoria | Exemplos | Volume estimado de titulares | Sensível (LGPD Art. 5 II)? |
|---|---|---|---|
| [ex: Dados cadastrais] | [nome, CPF, email] | [ex: 50.000] | [ ] Sim  [x] Não |
| [ex: Dados comportamentais] | [histórico de consultas] | [ex: 50.000] | [ ] Sim  [x] Não |

### 2.2 Titulares

- [ ] Clientes PH3A (pessoas físicas)
- [ ] Pessoas da base Big Data PH3A
- [ ] Colaboradores
- [ ] Outros: [especificar]

---

## 3. Necessidade e Proporcionalidade

| Questão | Resposta |
|---|---|
| Por que dados pessoais são necessários para esta finalidade? | [justificativa] |
| Seria possível atingir a finalidade com dados anonimizados? | [sim/não + justificativa] |
| Dados que poderiam ser eliminados sem prejudicar a funcionalidade | [lista ou "nenhum"] |
| Período de retenção dos dados | [ex: 90 dias após encerramento do contrato] |
| Período de retenção dos logs de interação com IA | [ex: 30 dias] |
| Mecanismo de exclusão a pedido do titular | [sim/não + como funciona] |

---

## 4. Transferências Internacionais

| Campo | Detalhe |
|---|---|
| Dados transferidos para fora do Brasil? | [ ] Sim  [ ] Não |
| Países / regiões de destino | [ex: EUA — Anthropic] |
| Mecanismo de adequação | [DPA / cláusulas contratuais / país adequado pela ANPD] |

---

## 5. Avaliação de Riscos

| # | Risco | Prob. | Impacto | Nível | Controle Aplicado | Risco Residual |
|---|---|---|---|---|---|---|
| 1 | Acesso não autorizado pelo fornecedor de IA | [A/M/B] | [A/M/B] | [C/A/M/B] | [DPA + cláusula não-treinamento] | [A/M/B] |
| 2 | Uso dos dados para treinar modelos do fornecedor | [A/M/B] | [A/M/B] | [C/A/M/B] | [cláusula contratual explícita] | [A/M/B] |
| 3 | Alucinação gerando informação falsa sobre titular | [A/M/B] | [A/M/B] | [C/A/M/B] | [revisão humana / disclaimer] | [A/M/B] |
| 4 | Discriminação por viés do modelo | [A/M/B] | [A/M/B] | [C/A/M/B] | [avaliação de fairness / auditoria] | [A/M/B] |
| 5 | Prompt injection / manipulação do agente | [A/M/B] | [A/M/B] | [C/A/M/B] | [sanitização de inputs] | [A/M/B] |
| 6 | Reidentificação por cross-referência | [A/M/B] | [A/M/B] | [C/A/M/B] | [pseudonimização / isolamento] | [A/M/B] |
| 7 | Retenção além do necessário pelo fornecedor | [A/M/B] | [A/M/B] | [C/A/M/B] | [zero data retention / DPA] | [A/M/B] |
| 8 | Falta de explicabilidade em decisão automatizada | [A/M/B] | [A/M/B] | [C/A/M/B] | [canal de contestação / revisão humana] | [A/M/B] |

**Legenda:** Prob./Impacto: A=Alto, M=Médio, B=Baixo | Nível: C=Crítico, A=Alto, M=Médio, B=Baixo

---

## 6. Medidas de Mitigação

| Medida | Tipo | Responsável | Status | Prazo |
|---|---|---|---|---|
| DPA assinado com [fornecedor] | Contratual | Jurídico / TI | [ ] Pendente  [ ] Concluído | [DATA] |
| Cláusula de não-treinamento | Contratual | Jurídico | [ ] Pendente  [ ] Concluído | [DATA] |
| Anonimização de [campos X] antes do envio à IA | Técnica | Dev | [ ] Pendente  [ ] Concluído | [DATA] |
| Logs de interação com a IA | Técnica | Dev | [ ] Pendente  [ ] Concluído | [DATA] |
| Isolamento por tenant (dados de cliente A não acessíveis para cliente B) | Técnica | Dev | [ ] Pendente  [ ] Concluído | [DATA] |
| Canal para exercício de direitos do titular | Organizacional | DPO / Produto | [ ] Pendente  [ ] Concluído | [DATA] |
| Informação ao titular sobre uso de IA | Organizacional | Produto / Jurídico | [ ] Pendente  [ ] Concluído | [DATA] |
| Model Card elaborado | Organizacional | Dev / Produto | [ ] Pendente  [ ] Concluído | [DATA] |

---

## 7. Conclusão

**Nível de risco residual geral:** [ ] Crítico  [ ] Alto  [ ] Médio  [ ] Baixo

**Recomendação do elaborador:**
[ ] Aprovado para produção — riscos residuais aceitáveis com os controles implementados
[ ] Aprovado com condições — implementar medidas X, Y, Z antes da produção
[ ] Reprovado — riscos não mitigados adequadamente; revisar arquitetura

**Observações:**
[texto livre]

---

## 8. Aprovação DPO

| Campo | Detalhe |
|---|---|
| Nome do DPO | |
| Decisão | [ ] Aprovado  [ ] Aprovado com ressalvas  [ ] Reprovado |
| Ressalvas / condicionantes | |
| Data | |
| Assinatura | |

---

## 9. Histórico de Revisões

| Versão | Data | Motivo da revisão | Responsável |
|---|---|---|---|
| 1.0 | [DATA] | Versão inicial | [NOME] |

---

*RIPD gerado com assistência de Claude Code — Política Corporativa de IA PH3A v2.0*
*A aprovação final é de responsabilidade exclusiva do DPO.*
*Revisar sempre que: mudar modelo de IA, mudar fornecedor, ampliar escopo de dados ou ocorrer incidente.*
```
