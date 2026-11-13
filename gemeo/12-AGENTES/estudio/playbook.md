# Estúdio — Playbook

> Como transformar conteúdo pronto em kit de gravação. Deriva do arquivo de origem, de
> `gemeo/14-MARCA/` e do canon e **nunca os contradiz**. Se um número divergir, o canon prevalece.

## Objetivo da área

Quem vai gravar abre o kit, liga a câmera e grava, sem precisar reler a origem nem perguntar o que
vem a seguir.

---

## 1. Pipeline (origem → kit)

1. **Ler a origem inteira.** Listar seções, conceitos, exemplos, citações, exercícios e CTA.
2. **Inventário de fidelidade.** Uma linha por elemento da origem; cada uma precisa aparecer no
   roteiro longo. Elemento fraco ou ausente → lacuna.
3. **Roteiro longo** com timecodes.
4. **Roteiro curto**: corte do longo, mantendo abertura, a tensão central e o CTA.
5. **Plano de slides** a partir do roteiro longo.
6. **Artefatos de tela** e **checklist**.

Saída numa pasta ao lado da origem (ex.: `<pasta-da-origem>/producao/<slug>/`): `roteiro-longo.md`,
`roteiro-curto.md`, `deck-plan.md`, `artefatos.md`, `README.md`.

---

## 2. Anatomia do roteiro

```markdown
## [00:00–00:45] Abertura · travado
<texto exato>

## [00:45–04:00] <seção da origem> · livre
- ponto de fala 1 (origem: § <seção>)
- ponto de fala 2
> Direção: <ritmo, pausa, ênfase>
> Slide: S03

## [..] CTA · travado
<texto exato; preço só com `planos` do canon>
```

Critério de tempo: declarar no `README.md` do kit a taxa de fala usada para estimar os timecodes.

---

## 3. Mapeamento seção → slide

| Elemento da origem | Tipo de slide |
|---|---|
| tese ou frase central | frase única, tipografia grande |
| conceito com partes | lista curta (no máximo 3 itens por slide) |
| comparação | duas colunas |
| processo | passos numerados |
| citação | citação com autoria (só se está na origem) |
| exercício | instrução + tempo |
| CTA | oferta + próximo passo |

Tokens, fontes e cores de `14-MARCA/identidade-visual.md`; acessibilidade de `14-MARCA/acessibilidade.md`.
Token em `[PREENCHER]` → o `deck-plan` diz "tokens não definidos" em vez de escolher cor.

---

## 4. Checklist de qualidade

- [ ] Todo elemento do inventário de fidelidade aparece no roteiro longo.
- [ ] Nenhum conceito, exemplo, dado ou citação que a origem não tenha.
- [ ] Abertura, números e CTA travados; corpo em pontos de fala.
- [ ] Todo slide do `deck-plan` é citado no roteiro.
- [ ] Nome público certo na tela; nenhum codinome.
- [ ] Preço ou oferta conferidos no canon.
- [ ] Lacunas listadas no `README.md` do kit, com tarefa aberta para a área dona.

---

## O que NÃO fazer

- Escrever conteúdo novo para "fechar" o roteiro.
- Cortar no roteiro curto o que muda o sentido da origem.
- Gravar, editar ou publicar (humano / Tipo 1).
- Compor deck animado com runtime próprio: fica fora deste molde.
