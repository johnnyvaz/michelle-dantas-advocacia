# Registro de Decisões — decision log institucional (ÍNDICE)

> **Template** — preenchido via /montar-gemeo. Deriva do canon: `time[].{nome,cargo,decisor}`, e qualquer campo citado no contexto de cada decisão.
> **Citação parseável**: todo número preenchido usa o marcador `R$ X [canon: path.do.campo]` ou `N [calc: metrica]` — o CI compara com o canon e acusa drift (specs/001-melhorias-gemeo/contracts/formatos-arquivos.md).
> **A partir da v0.2, cada decisão é um BDR individual em [`../DECISOES/`](../DECISOES/)**
> (template `0000-TEMPLATE.md`, com `canon_sha` e `campos_justificativa` para o
> decision-guardian do oráculo). Este arquivo vira o **índice**: uma linha por decisão
> (`| D#### | título | data | status |`). Entradas antigas no formato abaixo continuam
> válidas — migre ao revisitar.

---

**Data de referência:** AAAA-MM-DD
**Papel:** memória institucional do gêmeo — *o que* foi decidido, *por quê*, *o que foi descartado* e *o que aconteceu depois*. Complementa [`decision-framework.md`](./decision-framework.md) (que define *como* decidimos).

**Regras**
1. Números citados vêm do canon (`00-CANON/canon.yaml`) — se o número não existe lá, primeiro entra no canon.
2. Decisão registrada no **mesmo dia** em que é tomada; próximo ID na sequência D01, D02, …
3. Registre **também as posições divergentes** — é o que alimenta a camada de adesão do oráculo.
4. Decisão revertida **não é apagada**: muda o status e ganha uma linha de "Resultado".

Posições do bloco decisor seguem a notação de `08-PESSOAS/Team/matriz-decisao-adesao.md`: 🟢 apoiou · 🟡 neutro/condicionou · 🔴 resistiu.

> Use [`99-TEMPLATES/registro-decisao.md`](../99-TEMPLATES/registro-decisao.md) para criar cada nova entrada e cole abaixo.

---

## D[NN] — [Título curto da decisão] *(exemplo — substituir ao preencher)*

- **Data**: AAAA-MM · **Decisores**: [cargo] 🟢, [cargo] 🟡, [cargo] 🔴
  *(🟢 apoiou · 🟡 neutro/condicionou · 🔴 resistiu)*
- **Contexto**: [PREENCHER: que situação forçou a decisão; 1–2 linhas, com número do canon se houver]
- **Decisão**: [PREENCHER: o que foi decidido, em uma frase afirmativa]
- **Alternativas descartadas**: [PREENCHER: opção rejeitada + por quê, 1 linha cada]
- **Racional**: [PREENCHER: o critério que pesou — número e/ou adesão]
- **Resultado**: [PREENCHER: o que aconteceu depois — atualizar quando houver evidência]
- **Status**: validada · em curso · em observação · a revisar · revertida

---

## Como o oráculo deve usar este registro

1. Perguntas "**já tentaram / por que não fazem X?**" → procurar aqui antes de especular.
2. Citar a decisão pelo **ID** (D01, D02…) e o resultado registrado — não inventar desfechos.
3. Padrão observável para a camada cognitiva: as posições 🟢🟡🔴 ao longo das decisões revelam como cada perfil de `time[].perfil_cognitivo` decide (quem puxa caixa, quem condiciona a dados, quem trava por controle) — consistente com `08-PESSOAS/`.
