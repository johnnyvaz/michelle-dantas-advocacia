---
name: tdd
description: Conduz a criação de testes no fluxo TDD (red-green-refactor) para projetos PH3A. Detecta o framework de teste (pytest, jest, vitest), escreve o teste que falha PRIMEIRO, roda para confirmar o vermelho, implementa o mínimo para passar (verde) e refatora. Para bugs, escreve o teste de regressão que reproduz o defeito antes da correção. É a skill que produz os testes que elevam a cobertura do ratchet. Invoque com /tdd [alvo].
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
---

# Skill: TDD — Criação de Testes Test-First (PH3A)

Conduz o ciclo **red-green-refactor** para criar testes ANTES (ou junto) da implementação, com disciplina. É o
complemento de criação para as skills de medição/enforcement (`/quality-gate`, `/quality-check`) e de testes de
propriedade (`/property-race-guard`): aqui escrevem-se os testes de exemplo (unit/integração) que sobem a
cobertura e travam o comportamento.

---

## Passo 1 — Receber o alvo

O usuário pode pedir TDD para:
- uma **função / classe / use-case** novo a implementar;
- um **módulo existente** sem cobertura (escrever testes de caracterização);
- um **bug** a corrigir (escrever teste de regressão que reproduz antes de corrigir).

Se o alvo não estiver claro, perguntar o que vai ser testado e qual o comportamento esperado.

## Passo 2 — Detectar framework e convenções

```bash
# Python
ls pytest.ini setup.cfg pyproject.toml 2>/dev/null; find . -path "*/tests/*" -name "test_*.py" 2>/dev/null | head -3
# Node/TS
cat package.json 2>/dev/null | grep -E '"(jest|vitest|mocha|test)"'
find . -name "*.test.ts" -o -name "*.spec.ts" 2>/dev/null | head -3
```

Identificar: framework (pytest / jest / vitest / mocha), diretório de testes, padrão de nome
(`test_*.py`, `*.test.ts`, `*.spec.ts`), e o runner (`pytest`, `npm test`, `vitest run`). **Seguir o padrão que já
existe no projeto** — não introduzir um framework novo sem combinar.

## Passo 3 — RED: escrever o teste que falha primeiro

Escrever o teste **antes** da implementação (ou, para bug, antes da correção). Princípios:

- **AAA**: Arrange → Act → Assert. Um conceito por teste; nome descritivo do comportamento
  (`test_deve_recusar_cpf_invalido`, `it('rejects expired token')`).
- Cobrir o **caminho feliz** + as **bordas** que importam (nulo/vazio, limites, erro esperado, idempotência).
- Para **bug**: o teste deve **reproduzir o defeito** (falhar de forma que demonstre o bug).
- **Nunca usar dados reais** — usar dados sintéticos (`/synthetic-data-generator`) ou fixtures fictícias (LGPD).

Rodar e **confirmar que falha pelo motivo certo** (vermelho):

```bash
# pytest
python3 -m pytest <arquivo_de_teste> -q
# vitest / jest
npx vitest run <arquivo> ;  npx jest <arquivo>
```

Se o teste passar de primeira, ele não está testando nada novo — revisar.

## Passo 4 — GREEN: implementar o mínimo para passar

Escrever **só o necessário** para o teste passar (YAGNI). Rodar de novo até verde. Não adiantar funcionalidade que
não tem teste.

## Passo 5 — REFACTOR: limpar com a rede de segurança

Com os testes verdes, refatorar implementação e testes (nomes, duplicação, clareza) rodando a suíte a cada passo.
Os testes garantem que o comportamento não mudou.

## Passo 6 — Fechar com o ratchet

Rodar `/quality-check` (= `node scripts/quality-gate.js`) para confirmar que:
- a suíte passa e **a cobertura subiu** (o ratchet captura a melhoria — rode `--update` para avançar o baseline
  quando a melhoria for legítima);
- não houve regressão de nenhuma métrica.

Repetir o ciclo para o próximo comportamento.

---

## Templates por framework

**pytest** (`tests/test_<modulo>.py`):
```python
import pytest
from app.<modulo> import <alvo>

def test_<comportamento_esperado>():
    # Arrange
    entrada = ...
    # Act
    resultado = <alvo>(entrada)
    # Assert
    assert resultado == ...

def test_<borda>_levanta_erro():
    with pytest.raises(ValueError):
        <alvo>(<entrada_invalida>)
```

**vitest / jest** (`<modulo>.test.ts`):
```ts
import { describe, it, expect } from 'vitest' // ou '@jest/globals'
import { alvo } from './<modulo>'

describe('alvo', () => {
  it('faz X quando Y', () => {
    expect(alvo(entrada)).toEqual(esperado)   // Arrange/Act/Assert
  })

  it('rejeita entrada inválida', () => {
    expect(() => alvo(invalido)).toThrow()
  })
})
```

---

## Notas

- **Concorrência / race conditions** → use `/property-race-guard` (property-based). Esta skill foca em testes de
  exemplo (unit/integração).
- **Medição/enforcement** é de `/quality-gate` (instala) e `/quality-check` (executa o ratchet); o `/tdd`
  **produz** os testes.
- Princípio da constituição PH3A: **Test-First** — para bug, sempre comece pelo teste de regressão.
- Aceita caminho/alvo como argumento (default: perguntar). Rode a partir da raiz do projeto.
