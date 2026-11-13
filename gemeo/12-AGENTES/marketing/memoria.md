# Marketing — Memória de Área (padrão PARA)

> Memória persistente do agente de marketing. Padrão **PARA** (Projects / Areas / Resources / Archives). O agente **lê** isto antes de agir e **grava** aprendizados ao concluir um turno. Começa vazia — preencher com o uso.

## Projects (trabalhos com começo/fim)
- _(nenhum projeto ativo registrado)_

## Areas (responsabilidades contínuas)
- _(nenhuma responsabilidade contínua registrada)_

## Resources (referências reutilizáveis)
- _(nenhuma referência registrada)_

## Archives (encerrados, p/ histórico)
- _(vazio)_ — itens concluídos com resultado e lição aprendida.

---

## Linha do tempo (append-only)

> Uma entrada por aprendizado **durável** (causa raiz, decisão, armadilha do repositório) — não
> narrativa de turno, não número que pertence ao canon. Formato **parseável** — é o que permite
> ao lint (`python3 scripts/auditar_memoria.py`, passo 7 do `/auditar-gemeo`) achar repetição,
> contradição e referência morta sem ninguém reler o arquivo:
>
> ```markdown
> ## AAAA-MM-DD — título em uma frase
> > tipo: aprendizado · tema: #tema/<slug> · ref: <origem> · supersede: AAAA-MM-DD
> Corpo: o quê + por quê, 1–10 linhas. Cite arquivo em crase (`caminho/arquivo.ext`).
> ```
>
> | Campo | Valores | Para quê |
> |---|---|---|
> | heading `## AAAA-MM-DD — título` | data ISO + travessão + título | **obrigatório** — é a âncora; a ordem é cronológica (append-only) |
> | `tipo` | `aprendizado` \| `correcao` \| `preferencia` \| `descarte` | separa fato novo de correção de fato antigo |
> | `tema` | uma tag `#tema/<slug>` | liga entradas entre si — sem ela não há detecção de repetição nem de contradição |
> | `ref` | task, commit, `H-NNN` de `human.md`, `spec NNN` | de onde veio (rastreabilidade) |
> | `supersede` | data de uma entrada anterior | esta substitui aquela; a antiga **fica** (auditável) mas sai da recuperação |
>
> A linha de metadados é **opcional** (entradas antigas sem ela continuam válidas); `tipo: correcao`
> **exige** `supersede`. Mesmo `tema` repetido ≥ 3 vezes é candidato a virar `playbook.md`/skill —
> a promoção é decisão humana, o lint só aponta. Nunca apague entrada: use `supersede`.
