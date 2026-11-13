---
name: protocolo-aprovacao
description: >
  Use esta skill antes de executar qualquer ação com efeito externo, custo, risco técnico
  ou impacto em produção. Aplicar quando: criar PR, propor mudança arquitetural, atualizar
  dependências, fazer deploy, contratar agente, alterar configurações de infraestrutura.
  Não usar quando: lendo código, escrevendo comentários internos, atualizando status de ticket.
---

# Protocolo de Aprovação PH3A

## Aprovador responsável: Johnny

## Regra fundamental

Toda ação com efeito externo, custo, risco técnico ou impacto em produção DEVE ter
aprovação explícita de Johnny antes de ser executada. Nunca presuma aprovação por silêncio.

## Fila central de aprovações: `tasks/human.md`

Toda solicitação de aprovação é centralizada na **fila humana** `tasks/human.md`
— a fronteira entre o que é dos agentes (fila de trabalho reversível em `tasks/`) e o que é do humano
(decisão irreversível/externa). O agente registra ali e **para**; o aprovador decide ali. A aprovação
**destrava** mas **não auto-executa**: a ação é executada pelo aprovador ou em sessão interativa.

## O que requer aprovação obrigatória

| Ação | Exemplo |
|------|---------|
| Abrir Pull Request | Qualquer PR em qualquer projeto |
| Mudança arquitetural | Trocar banco de dados, adicionar serviço externo |
| Atualização de dependências | Upgrade de framework, nova lib |
| Deploy em produção | Qualquer ambiente além de desenvolvimento local |
| Contratação de novo agente | Hire request para agente subordinado |
| Alteração de infraestrutura | Mudanças em Kubernetes, Docker, CI/CD |
| Acesso a dados sensíveis | Credenciais, tokens, dados de clientes |

## Como solicitar aprovação

1. Descreva claramente a ação proposta — registrando o item em `tasks/human.md`
2. Liste os impactos esperados (o que muda, o que pode quebrar)
3. Proponha um plano de rollback caso algo dê errado
4. Deixe o item em **⏳ Aguardando decisão** e aguarde resposta de Johnny
5. Só execute após aprovação explícita (`[x] ✅ aprovado por Johnny 📅 <data>`)

## Formato da solicitação

```
SOLICITAÇÃO DE APROVAÇÃO

Ação proposta: [descreva em uma frase]
Motivo: [por que é necessário]
Impacto: [o que muda]
Risco: [o que pode dar errado]
Rollback: [como desfazer se necessário]
```

## O que NÃO requer aprovação

- Leitura de código e arquivos
- Criação de branches locais
- Commits locais ainda não publicados
- Atualização de comentários e status de tickets
- Criação de subtarefas para organização interna
