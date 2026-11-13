---
name: demo-sales-meeting
description: >-
  Gera o roteiro completo de uma reunião de demonstração + pitch de vendas, a partir de estrutura validada em campo e frameworks de vendas (SPIN Selling, Challenger Sale, Cialdini). Adapta o roteiro a qualquer produto ou serviço — curso, consultoria, mentoria, diagnóstico, licença SaaS. Use para preparar uma demo com prospect, treinar um vendedor no script, adaptar o pitch a um produto novo ou analisar uma reunião gravada.
---

# Skill: Reunião de Demonstração e Pitch de Vendas

## Metadata

| Campo | Valor |
|-------|-------|
| **Nome** | demo-sales-meeting |
| **Versão** | 1.0.0 |
| **Categoria** | Vendas / Apresentação / Pitch |
| **Autor** | Plataforma Educacional |

## Descrição

Gera o roteiro completo de uma reunião de demonstração + pitch de vendas, baseado em estrutura validada em campo (gravações reais), frameworks científicos de vendas (SPIN Selling, Challenger Sale, Cialdini) e psicologia de persuasão. Adapta o roteiro para qualquer produto ou serviço: cursos, consultoria, mentoria, diagnóstico, licença SaaS.

## Quando Usar

- Preparar reunião de demo com prospect
- Treinar um vendedor no script validado
- Adaptar pitch para novo produto
- Analisar e melhorar uma reunião gravada
- Criar material de onboarding para time comercial

## Triggers

- `demo meeting`, `reunião de demo`, `reunião de vendas`
- `pitch de vendas`, `estrutura de pitch`
- `como fazer demo`, `roteiro de vendas`
- `script de vendas`, `fechamento`
- `/demo-sales-meeting`

## Input

```
/demo-sales-meeting [produto] [perfil-comprador]
```

Exemplos:
```
/demo-sales-meeting plataforma-cursos
/demo-sales-meeting consultoria perfil=empresa-rh
/demo-sales-meeting mentoria-individual perfil=executivo
/demo-sales-meeting intercambio perfil=familia-com-adolescente
```

Se chamado sem argumentos, o agente faz 3 perguntas de qualificação antes de gerar o roteiro.

## Output

```
docs/VENDAS/demo-meetings/[produto]/
├── 00-briefing.md          ← Pré-reunião: contexto, discovery, ICP
├── 01-roteiro.md           ← Roteiro completo com falas, transições e timings
├── 02-objecoes.md          ← Mapa de objeções + respostas validadas
├── 03-followup.md          ← E-mail/mensagem de follow-up pós-reunião
└── 04-analise.md           ← (opcional) Análise de reunião gravada
```

## Referências

| Arquivo | Uso |
|---------|-----|
| `resources/frameworks.md` | SPIN, Challenger, Cialdini — referência teórica |
| `resources/arco-emocional.md` | Gestão do arco emocional por fase |
| `resources/objecoes-banco.md` | Banco de objeções catalogadas com respostas |
| `resources/tipos-comprador.md` | Perfis: analítico, emocional, aspiracional, cético |
| `resources/prova-social.md` | Templates de prova social por produto |
| `resources/ancoragem-precos.md` | Técnica de ancoragem e comparativo de mercado |
