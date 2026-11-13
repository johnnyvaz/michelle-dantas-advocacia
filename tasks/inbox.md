# 📥 INBOX — Site Michelle Dantas Advocacia

**Escreva aqui o que você quer que o agente faça neste projeto.** Este é o único arquivo desta
pasta que o sync lê de volta para o repositório em vez de sobrescrever — todo o resto é espelho
de leitura.

Uma instrução por linha, em português normal. Não precisa de prioridade nem formato:

```markdown
- [ ] Investigar por que o login com Google está caindo em 500
- [ ] Revisar as queries do dashboard, estão lentas
- [ ] H-011 → opção B, pode aplicar o TTL de 30 dias
```

## O que acontece depois

1. No próximo sync, estas linhas chegam ao repositório como `tasks/inbox.md`
2. O agente lê no início do trabalho, executa o que consegue e registra o que não consegue
3. Cada item vira tarefa no arquivo certo (`backlog.md`, `bugs.md`) ou é resolvido direto
4. O agente apaga a linha daqui — a limpeza volta para este arquivo no sync seguinte

**Decisão sobre item da fila humana também pode vir por aqui** (`H-011 → opção B`), mas o registro
canônico continua sendo `tasks/human.md` no repositório: o agente move sua resposta para lá.

> ⚠️ Se você e o agente escreverem entre dois syncs, vence a versão mais recente. Na prática não
> colide — você escreve quando ele não está rodando.

---

## Instruções

<!-- Escreva abaixo. Apague este comentário se quiser. -->
