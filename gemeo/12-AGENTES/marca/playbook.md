# Marca — Playbook

> Como auditar uma peça contra a marca. Deriva de `gemeo/14-MARCA/` e do canon e **nunca os
> contradiz**. Se um número divergir, o canon prevalece.

## Objetivo da área

Dar a quem fez a peça um parecer que ele consiga aplicar sem perguntar de volta: o que viola, qual regra,
onde está a regra e qual a correção esperada.

---

## Roteiro de auditoria (nesta ordem)

1. **Identificar a superfície e o registro** (`14-MARCA/superficies.md`): brand ou product. O registro
   decide qual régua vale; auditar admin com régua de landing gera falso positivo.
2. **Naming** (`arquitetura-de-marca.md`): nome público correto, grafia canônica, **nenhum codinome**
   em superfície externa.
3. **Voz** (`voz-e-tom.md`): princípios, léxico evitado, tom da persona e da superfície.
4. **Prova social** (`prova-social.md`): todo cliente, logo, case ou depoimento citado está lá como
   autorizado? Número de clientes bate com o canon (`clientes`, `snapshot`)?
5. **Visual** (`identidade-visual.md`): tokens em vez de valor solto, tipografia, um acento dominante,
   sistemas brand e product sem mistura.
6. **Acessibilidade** (`acessibilidade.md`): contraste no nível declarado, texto alternativo, movimento
   reduzido, alvo de toque.
7. **Referências** (`referencias-e-anti-referencias.md`): a peça se parece com algo da lista do "nunca"?

Cada passo cujo arquivo-fonte está `[PREENCHER]` vira linha de **lacuna** no parecer, não de violação.

---

## Severidade

| Nível | Quando | Exemplos |
|---|---|---|
| **Crítico** | expõe a empresa ou mente para o público | codinome em peça externa; prova social não autorizada; número que contradiz o canon; contraste abaixo do piso |
| **Importante** | quebra uma regra escrita da marca | termo da lista "evitamos"; sistema brand dentro de tela product; token ignorado |
| **Menor** | desvio de acabamento com regra escrita | grafia secundária, espaçamento fora da escala |

Sem regra escrita, não há nível: é **lacuna** ou **proposta**.

---

## Formato do parecer

```markdown
# Parecer de marca — <peça> · AAAA-MM-DD
Superfície: <nome> · registro: brand | product

## Conforme
- <o que segue a marca, com a regra>

## Achados
| Nível | Trecho da peça | Regra (arquivo § seção) | Correção esperada | Área que corrige |
|---|---|---|---|---|

## Lacunas (não auditável)
- <passo> — falta `<arquivo>` § <seção>

## Proposta de ajuste da marca (opcional)
- <regra que gerou atrito> → registrada em `gemeo/PROPOSTAS/`
```

A coluna "Área que corrige" é o handoff: o achado vira tarefa da área dona (`#area/copy`,
`#area/design`, `#area/desenvolvimento`), nunca correção feita aqui.

---

## Ferramentas (skills) e quando usar cada uma

| Skill | Quando usar |
|-------|-------------|
| `impeccable` | Auditoria de interface; usar os modos de crítica/auditoria, nunca os que aplicam a mudança |
| `auditar-gemeo` | Contradição dentro do próprio `14-MARCA/` |

---

## O que NÃO fazer

- Aplicar a correção no arquivo auditado (é da área dona).
- Editar `14-MARCA/` para a peça "passar" (doutrina, recusa 9: corrige-se a causa, não o critério).
- Auditar contra gosto pessoal ou contra a marca de outra empresa.
- Juntar crítico e menor na mesma lista sem nível: o leitor precisa saber o que bloqueia.
