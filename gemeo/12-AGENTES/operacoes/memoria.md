# Operações — Memória (padrão PARA)

> Memória persistente da área. Padrão **PARA** (Projects / Areas / Resources / Archives). O agente **lê** isto antes de agir e **grava** aprendizados ao concluir.

## Projects (trabalhos com começo/fim)
- _(vazio)_ — &lt;projeto ativo&gt; — objetivo, estado atual, próximo passo.

## Areas (responsabilidades contínuas)
- _(vazio)_ — &lt;responsabilidade recorrente&gt; — o que monitorar.

## Resources (referências reutilizáveis)
- _(vazio)_ — &lt;prazo legal/decisão reutilizável&gt; — quando usar.

## Archives (encerrados, p/ histórico)
- _(vazio)_ — &lt;item concluído&gt; — resultado, lição aprendida.

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
