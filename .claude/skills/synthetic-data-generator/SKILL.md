---
name: synthetic-data-generator
description: Gera scripts que produzem dados sinteticos realistas (CPFs validos ficticios, CNPJs, nomes, emails, enderecos, historicos de transacoes, etc.) para uso em testes, demos e prompts de IA. Complemento ao anonymize-data para casos onde mascarar nao e suficiente. Nao le dados reais — gera dados novos e comprovadamente ficticios.
allowed-tools: Write, Read
---

# Skill: Gerador de Dados Sintéticos

Referência: **Política Corporativa de Uso de IA PH3A v2.0 — Seções 6.1 e 6.3**

## Quando Usar vs. anonymize-data

| Situacao | Usar |
|---|---|
| Tenho dados reais e preciso protege-los para usar com IA | `anonymize-data` |
| Preciso de dados para testar um prompt/funcionalidade e nao quero partir de dados reais | `synthetic-data-generator` |
| Depurar bug que ocorre com um CPF especifico e formato especial | `synthetic-data-generator` |
| Criar demo de produto sem expor dados de clientes reais | `synthetic-data-generator` |
| Popular ambiente de homologacao ou dev | `synthetic-data-generator` |
| Criar exemplos para treinamento de equipe ou documentacao | `synthetic-data-generator` |

**Vantagem dos dados sinteticos sobre anonimizacao:** dados comprovadamente ficticios eliminam qualquer risco de reidentificacao e sao mais seguros para uso com qualquer ferramenta de IA, inclusive ferramentas sem DPA.

---

## Instrucoes de Execucao

### Passo 1 — Entender a Necessidade

Pergunte ao usuario:

1. **Para que servem os dados?** (testar prompt, popular banco de dev, criar demo, treinar equipe, etc.)
2. **Qual o formato de saida?** (Python que gera CSV/JSON/SQL INSERT, ou estrutura de dados inline)
3. **Qual linguagem preferida para o script?** (Python recomendado, mas pode ser SQL, TypeScript, etc.)
4. **Quantos registros precisam ser gerados?** (ex: 10 para exemplo, 1000 para teste de carga)
5. **Qual o schema/estrutura?** Pergunte campo a campo:
   - Nome do campo
   - Tipo de dado (CPF, CNPJ, nome, email, telefone, endereco, data, valor, status, texto, ID, etc.)
   - Ha restricoes? (ex: valores possiveis para um enum, faixa de valores numericos, formato especifico)
6. **Os dados precisam ser relacionados entre si?** (ex: clientes e pedidos — cada pedido deve ter um cliente_id valido)
7. **Precisa de seed fixo?** (mesmos dados toda vez que rodar, para testes deterministicos)

### Passo 2 — Gerar o Script

Gere o script com estas caracteristicas obrigatorias:

#### Regras de Geracao de Dados Ficticios

**CPF Ficticio (mas valido algoritmicamente):**
```python
import random

def gerar_cpf(seed=None) -> str:
    """
    Gera CPF com digitos verificadores corretos mas comprovadamente ficticio.
    Usa prefixos que NUNCA sao emitidos pelo governo (000, 999)
    ou sequencias claramente ficticias.
    """
    if seed: random.seed(seed)
    # Prefixo 000 nunca e emitido — comprovadamente ficticio
    n = [0, 0, 0] + [random.randint(0, 9) for _ in range(6)]

    # Calcula digito verificador 1
    s = sum((10 - i) * n[i] for i in range(9))
    d1 = 0 if (11 - s % 11) >= 10 else (11 - s % 11)
    n.append(d1)

    # Calcula digito verificador 2
    s = sum((11 - i) * n[i] for i in range(10))
    d2 = 0 if (11 - s % 11) >= 10 else (11 - s % 11)
    n.append(d2)

    return f"{n[0]}{n[1]}{n[2]}.{n[3]}{n[4]}{n[5]}.{n[6]}{n[7]}{n[8]}-{n[9]}{n[10]}"
```

**CNPJ Ficticio:**
```python
def gerar_cnpj(seed=None) -> str:
    """CNPJ com digitos validos mas prefixo 00.000.000 — comprovadamente ficticio"""
    if seed: random.seed(seed)
    n = [0, 0, 0, 0, 0, 0, 0, 0] + [random.randint(0, 9) for _ in range(4)]

    pesos1 = [5,4,3,2,9,8,7,6,5,4,3,2]
    s = sum(pesos1[i] * n[i] for i in range(12))
    d1 = 0 if (11 - s % 11) >= 10 else (11 - s % 11)
    n.append(d1)

    pesos2 = [6,5,4,3,2,9,8,7,6,5,4,3,2]
    s = sum(pesos2[i] * n[i] for i in range(13))
    d2 = 0 if (11 - s % 11) >= 10 else (11 - s % 11)
    n.append(d2)

    return f"{n[0]}{n[1]}.{n[2]}{n[3]}{n[4]}.{n[5]}{n[6]}{n[7]}/{n[8]}{n[9]}{n[10]}{n[11]}-{n[12]}{n[13]}"
```

**Nomes Ficticios (nunca usar nomes de pessoas reais conhecidas):**
```python
PRIMEIROS_NOMES = [
    "Alvaro","Beatriz","Caio","Diana","Eduardo","Fatima","Gustavo",
    "Helena","Igor","Julia","Kleber","Laura","Marcio","Natalia",
    "Osvaldo","Patricia","Quirino","Renata","Sergio","Tatiana"
]
SOBRENOMES = [
    "Ficticio","Sintetico","Anonimo","Exemplo","Teste","Demonstracao",
    "Generico","Fictiz","Sampler","Mockado"
]

def gerar_nome(seed=None) -> str:
    if seed: random.seed(seed)
    return f"{random.choice(PRIMEIROS_NOMES)} {random.choice(SOBRENOMES)}"
```

**Email Ficticio (dominio invalido — nunca chega em caixa real):**
```python
def gerar_email(nome: str, seed=None) -> str:
    """Usa dominios .invalid ou .example que nunca sao resolvidos pelo DNS"""
    if seed: random.seed(seed)
    local = nome.lower().replace(" ", ".").replace("ã","a").replace("é","e")
    dominio = random.choice(["empresa.invalid","teste.example","ficticio.example"])
    return f"{local}@{dominio}"
```

**Telefone Ficticio (DDDs ficticios: 00, 01):**
```python
def gerar_telefone(seed=None) -> str:
    """DDD 00 nao existe no Brasil — comprovadamente ficticio"""
    if seed: random.seed(seed)
    return f"(00) 9{random.randint(1000,9999)}-{random.randint(1000,9999)}"
```

**Data Ficticia:**
```python
from datetime import date, timedelta

def gerar_data_nascimento(faixa_anos=(18, 80), seed=None) -> str:
    if seed: random.seed(seed)
    hoje = date.today()
    anos = random.randint(*faixa_anos)
    delta = timedelta(days=anos*365 + random.randint(0,364))
    return (hoje - delta).strftime("%Y-%m-%d")
```

**Endereco Ficticio:**
```python
LOGRADOUROS = ["Rua Ficticia","Avenida Sintetica","Travessa Exemplo","Alameda Teste"]
BAIRROS     = ["Bairro Generico","Vila Demonstracao","Jardim Ficticio"]
CIDADES     = ["Cidade Exemplo","Municipio Teste","Localidade Ficticia"]

def gerar_endereco(seed=None) -> dict:
    if seed: random.seed(seed)
    return {
        "logradouro": f"{random.choice(LOGRADOUROS)}, {random.randint(1, 9999)}",
        "bairro": random.choice(BAIRROS),
        "cidade": random.choice(CIDADES),
        "uf": random.choice(["SP","RJ","MG","RS","BA","PR"]),
        "cep": f"00{random.randint(100,999)}-{random.randint(100,999)}"
    }
```

**Valor Financeiro:**
```python
def gerar_valor(minimo=100.0, maximo=50000.0, seed=None) -> float:
    if seed: random.seed(seed)
    return round(random.uniform(minimo, maximo), 2)
```

#### Estrutura do Script Gerado

```python
#!/usr/bin/env python3
"""
Gerador de Dados Sinteticos - PH3A
Gerado por Claude Code
Data: [DATA]

DADOS GERADOS (todos ficticios e comprovadamente nao reais):
  CPF: prefixo 000 — nunca emitido pelo governo
  CNPJ: prefixo 00.000.000 — nunca emitido
  Email: dominio .invalid / .example — nao resolvido por DNS
  Telefone: DDD 00 — inexistente no Brasil
  Nomes: compostos de primeiros nomes + sobrenomes ficticios

USO PERMITIDO:
  - Testes de software e APIs
  - Demos e prototipos
  - Treinamentos e documentacao
  - Prompts de IA
  - Populacao de ambientes de dev/homologacao

PROIBIDO:
  - Usar como dados reais em qualquer sistema
  - Apresentar como dados de pessoas reais
  - Usar em producao com dados reais de clientes

INSTRUCOES:
  pip install faker  (opcional, para dados mais variados)
  python gerar_dados_[descricao].py
  Saida: [OUTPUT_FILE]
"""

import json, csv, random
from datetime import date, timedelta

# ── CONFIGURACOES ─────────────────────────────────────────────────────────────
QUANTIDADE   = [N]           # Numero de registros a gerar
OUTPUT_FILE  = "[arquivo].csv"  # ou .json
SEED         = 42            # None para aleatorio diferente a cada execucao
# ─────────────────────────────────────────────────────────────────────────────

# [Funcoes de geracao aqui]

def gerar_registro(i: int) -> dict:
    seed_i = SEED + i if SEED else None
    return {
        # [campos conforme schema solicitado]
    }

def main():
    registros = [gerar_registro(i) for i in range(QUANTIDADE)]

    # Salvar conforme formato
    if OUTPUT_FILE.endswith(".json"):
        with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
            json.dump(registros, f, ensure_ascii=False, indent=2)
    else:
        with open(OUTPUT_FILE, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=registros[0].keys())
            writer.writeheader()
            writer.writerows(registros)

    print(f"{QUANTIDADE} registros sinteticos gerados em: {OUTPUT_FILE}")
    print("LEMBRETE: Estes dados sao ficticios — seguros para uso com IA.")

if __name__ == "__main__":
    main()
```

### Passo 3 — Salvar o Script

**Nome:** `gerar-dados-[descricao]-[YYYY-MM-DD].py`
**Local:** diretorio atual ou indicado pelo usuario

### Passo 4 — Orientar sobre Uso Seguro

Ao final, sempre informar:

```
DADOS SINTETICOS — LEMBRETE DE USO SEGURO:

✅ PODE enviar para qualquer ferramenta de IA (dados ficticios = risco zero)
✅ PODE usar para testar prompts sem restricao
✅ PODE usar em demo para clientes (os dados sao visivelmente ficticios)
✅ PODE popular banco de dev/homologacao

⚠️  ATENCAO: Se precisar que os dados "parecam reais" para um cliente,
    informe explicitamente que sao dados de demonstracao.
    Nunca apresente como dados reais de nenhuma pessoa.
```

---

## Tipos de Dados Suportados

| Tipo | Estrategia de Ficcao |
|---|---|
| CPF | Prefixo 000 (nunca emitido) |
| CNPJ | Prefixo 00.000.000 (nunca emitido) |
| Email | Dominio `.invalid` ou `.example` |
| Telefone | DDD 00 (inexistente) |
| CEP | Prefixo 00xxx-xxx (inexistente) |
| Nome | Banco de nomes + sobrenomes ficticios |
| Empresa | Sufixo "Ficticia Ltda" / "Sintetica S.A." |
| Endereco | Logradouros com sufixo ficticio |
| Data nascimento | Gerada aleatoriamente na faixa solicitada |
| Valor financeiro | Numero aleatorio na faixa solicitada |
| UUID / ID | uuid4 — nunca colide com IDs reais |
| Texto livre | Templates com placeholders |
| Status / enum | Sorteio da lista de valores validos |

## Compatibilidade com anonymize-data

Para cenarios onde voce JA tem dados reais e quer trabalhar de forma segura:
- Use primeiro `anonymize-data` para remover os dados reais
- Use `synthetic-data-generator` para criar dados de preenchimento onde a anonimizacao gerou campos em branco
- Resultado: dataset completo sem nenhum dado real
