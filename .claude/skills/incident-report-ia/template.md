# Template: Relatório de Incidente de IA

```markdown
# Relatório de Incidente — Uso de IA
**Ref:** Política Corporativa de IA PH3A v2.0 — Seção 11.3 | NORM09
**ID do incidente:** INC-IA-[YYYY-MM-DD]-[SEQ]
**Data/hora do ocorrido:** [DATA E HORA]
**Data/hora do reporte:** [DATA E HORA]
**Reportado por:** [NOME / AREA / CARGO]
**Status:** [ ] Aberto  [ ] Em investigação  [ ] Contido  [ ] Encerrado

---

## 1. Tipo de Incidente

- [ ] A — Envio acidental de dados sensíveis para IA não autorizada
- [ ] B — Envio de dados sensíveis para IA autorizada além do permitido
- [ ] C — Suspeita de retenção ou vazamento de dados pelo fornecedor de IA
- [ ] D — Uso de ferramenta de IA não aprovada com dados internos/de clientes
- [ ] E — Comportamento inesperado de sistema de IA em produto PH3A
- [ ] F — Output incorreto de IA entregue a cliente sem revisão
- [ ] G — Acesso não autorizado a sistema de IA corporativo
- [ ] H — Outro: [DESCREVER]

**Severidade classificada:** [ ] CRÍTICO  [ ] ALTO  [ ] MÉDIO  [ ] BAIXO

---

## 2. Descrição do Incidente

**O que aconteceu:**
[Descrição detalhada do incidente — o que, quando, como foi identificado]

**Ferramenta de IA envolvida:**
[Nome da ferramenta, versão/plano se conhecido]

**Objetivo do uso no momento do incidente:**
[Para que o usuário estava usando a ferramenta]

---

## 3. Dados Potencialmente Comprometidos

| Tipo de dado | Envolvido? | Detalhes |
|---|---|---|
| Dados pessoais de clientes (CPF, nome, etc.) | [ ] Sim  [ ] Não  [ ] Incerto | [detalhe] |
| Dados do Big Data PH3A | [ ] Sim  [ ] Não  [ ] Incerto | [detalhe] |
| Credenciais / tokens / chaves de API | [ ] Sim  [ ] Não  [ ] Incerto | [detalhe] |
| Código-fonte de sistemas internos | [ ] Sim  [ ] Não  [ ] Incerto | [detalhe] |
| Dados estratégicos / confidenciais | [ ] Sim  [ ] Não  [ ] Incerto | [detalhe] |
| Dados de colaboradores | [ ] Sim  [ ] Não  [ ] Incerto | [detalhe] |

**Volume estimado de titulares potencialmente afetados:** [número ou "não identificado"]

**Evidência de armazenamento/retenção pelo fornecedor:** [ ] Sim  [ ] Não  [ ] Incerto

---

## 4. Contexto do Uso

| Questão | Resposta |
|---|---|
| O uso era para atividade de trabalho legítima? | [ ] Sim  [ ] Não |
| O usuário conhecia a restrição? | [ ] Sim  [ ] Não  [ ] Parcialmente |
| Havia treinamento ou orientação prévia sobre este caso? | [ ] Sim  [ ] Não |

---

## 5. Ações Imediatas Tomadas

| Ação | Responsável | Data/Hora |
|---|---|---|
| Parou o uso da ferramenta | [NOME] | [QUANDO] |
| Notificou gestor direto | [NOME] | [QUANDO] |
| Preservou evidências (logs, capturas) | [NOME] | [QUANDO] |
| Solicitou exclusão dos dados ao fornecedor | [NOME] | [QUANDO] |
| Notificou DPO | [NOME] | [QUANDO] |
| Notificou TI / Segurança da Informação | [NOME] | [QUANDO] |

---

## 6. Avaliação de Impacto

**Impacto potencial sobre titulares:** [descrever consequências possíveis]

**Necessidade de notificação à ANPD (LGPD Art. 48):**
[ ] Sim — prazo: ___
[ ] Não — justificativa: [JUSTIFICATIVA]
[ ] Em avaliação pelo DPO

**Necessidade de notificação aos titulares:**
[ ] Sim  [ ] Não  [ ] Em avaliação

---

## 7. Causa Raiz e Plano de Ação

**Causa raiz identificada:**
[análise de por que o incidente ocorreu]

| Ação corretiva | Responsável | Prazo | Status |
|---|---|---|---|
| [ação 1] | [NOME] | [DATA] | [ ] Pendente  [ ] Concluída |
| [ação 2] | [NOME] | [DATA] | [ ] Pendente  [ ] Concluída |

**Ação preventiva (para evitar reincidência):**
[descrever mudanças de processo, treinamento, controles técnicos, etc.]

---

## 8. Registro de Comunicações

| Data/Hora | Para | Meio | Resumo |
|---|---|---|---|
| [QUANDO] | [QUEM] | [email/Teams/verbal] | [o que foi comunicado] |

---

## 9. Encerramento

**Data de encerramento:** ___
**Encerrado por:** ___
**Conclusão:**
[ ] Incidente contido sem vazamento confirmado
[ ] Incidente com vazamento — ações regulatórias iniciadas
[ ] Suspeita descartada após investigação

**Lições aprendidas:**
[o que este incidente revela sobre gaps de processo, treinamento ou controles técnicos]

---

*Relatório gerado com assistência de Claude Code — Política Corporativa de IA PH3A v2.0*
*Encaminhar para: DPO + TI/Segurança da Informação conforme severidade*
*Arquivar conforme NORM09 e NORM04 (trilha de auditoria)*
```
