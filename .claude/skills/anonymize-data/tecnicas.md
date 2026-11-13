# Tecnicas de Anonimizacao - Referencia PH3A

## Criterios de Escolha da Tecnica

```
Precisa correlacionar registros depois? ──→ SIM ──→ Pseudonimizacao (token ou hash)
          │
          NÃO
          │
Precisa manter distribuicao estatistica? → SIM ──→ Perturbacao ou Generalizacao
          │
          NÃO
          │
Campo aparece em texto livre? ──────────→ SIM ──→ NER + Supressao
          │
          NÃO
          │
          └──→ Mascaramento parcial ou Supressao total
```

---

## Tecnicas Aceitas pela NORM10

### 1. Mascaramento Parcial
**Quando usar:** Campo com valor estruturado (CPF, CNPJ, cartao, telefone, email)
**Como funciona:** Substitui parte dos caracteres por `*`
**Reversivel:** Nao
**Preserva:** Formato e parte da informacao para contexto

| Campo | Exemplo entrada | Exemplo saida |
|---|---|---|
| CPF | 123.456.789-00 | 123.***.***-** |
| CNPJ | 12.345.678/0001-99 | 12.345.678/****-** |
| Cartao | 4111 1111 1111 1111 | 411111******1111 |
| Telefone | (11) 99876-5432 | (11) *****-5432 |
| Email | joao@empresa.com | ***@empresa.com |

---

### 2. Hash Deterministico (Pseudonimizacao)
**Quando usar:** Precisa correlacionar registros entre arquivos/sistemas sem revelar o valor real
**Como funciona:** SHA-256(valor + salt_local) → token fixo e unico
**Reversivel:** Nao (sem o salt) / Sim (com o salt — guarde o salt localmente)
**Preserva:** Unicidade (mesmo input = mesmo token)

```python
import hashlib

SALT_LOCAL = "ph3a-anonimizacao-2026"  # NUNCA enviar para IA

def hash_campo(valor: str) -> str:
    entrada = (str(valor).strip().lower() + SALT_LOCAL).encode()
    return "TKN_" + hashlib.sha256(entrada).hexdigest()[:16].upper()

# CPF "123.456.789-00" → "TKN_A4F2C8D1E9B7F3A6"
```

---

### 3. Generalizacao
**Quando usar:** Dados numericos ou temporais onde a precisao exata nao e necessaria para a analise
**Como funciona:** Substitui valor exato por intervalo ou categoria
**Reversivel:** Nao
**Preserva:** Distribuicao estatistica e utilidade analitica

| Campo | Valor exato | Generalizado |
|---|---|---|
| Data nascimento | 1985-04-15 | 1985 ou "35-44 anos" |
| Salario | R$ 4.732,00 | "R$ 3.000 a R$ 5.000" |
| CEP | 01310-100 | SP - Centro |
| Endereco | Rua Augusta, 1234 | Sao Paulo - SP |
| Hora do evento | 14:32:07 | Tarde (12h-18h) |

---

### 4. Perturbacao Numerica
**Quando usar:** Valores financeiros ou metricas onde a analise precisa de valores proximos ao real, mas nao o exato
**Como funciona:** Adiciona ruido aleatorio controlado (+/- X%)
**Reversivel:** Nao
**Preserva:** Distribuicao estatistica (media, desvio padrao aproximados)

```python
import random

def perturbar_valor(valor: float, variacao_pct: float = 0.15, seed: int = None) -> float:
    """Adiciona ruido de até ±15% ao valor"""
    if seed:
        random.seed(seed)
    fator = 1 + random.uniform(-variacao_pct, variacao_pct)
    return round(valor * fator, 2)
```

---

### 5. Pseudonimo (Substituicao por Dado Sintetico)
**Quando usar:** Nomes de pessoas onde o contexto precisa fazer sentido (ex: teste de UI, prompt engineering)
**Como funciona:** Mapeia nome real para nome ficticio de forma deterministica
**Reversivel:** Sim (com a tabela de mapeamento — guardar localmente)
**Preserva:** Formato e naturalidade do texto

```python
# Lista de nomes ficticios pre-definidos (nunca use nomes de pessoas reais)
BANCO_NOMES = {
    "masculino": ["Carlos Ficticio","Pedro Pseudonimo","Bruno Borrado","Andre Anonimo"],
    "feminino":  ["Ana Anonima","Maria Mascara","Lucia Limitada","Carla Cifrada"],
    "empresa":   ["Empresa Alpha Ltda","Comercio Beta S.A.","Servicos Gamma ME"]
}
```

---

### 6. Supressao
**Quando usar:** Campo nao e necessario para a analise ou e impossivel de anonimizar com seguranca (senhas, tokens, chaves privadas)
**Como funciona:** Remove o campo completamente ou substitui por marcador
**Reversivel:** Nao
**Preserva:** Nada — usar apenas quando o campo e dispensavel

Marcadores padrao PH3A:
- `[SUPRIMIDO]`
- `[SENHA REMOVIDA]`
- `[DADO SENSIVEL]`
- `[REDACTED]`

---

### 7. NER — Reconhecimento de Entidades em Texto Livre
**Quando usar:** Campos de texto livre (observacoes, comentarios, descricoes, historico)
**Como funciona:** Regex + padroes estruturados detectam e substituem PII no texto
**Reversivel:** Nao
**Limitacao:** Nao captura 100% dos casos — nomes proprios escritos de forma incomum podem passar

```
"O cliente Joao Silva (CPF 123.456.789-00) ligou sobre o pedido
 e pediu para contatar em (11) 99876-5432 ou joao@email.com"

→ "O cliente [NOME] ([CPF]) ligou sobre o pedido
    e pediu para contatar em [TELEFONE] ou [EMAIL]"
```

**Padroes cobertos pelo script NER basico:**
- CPF (com e sem formatacao)
- CNPJ (com e sem formatacao)
- Email
- Telefone (fixo e celular, com e sem DDD)
- CEP
- RG (padrao SP)
- Numero de cartao
- Data de nascimento em formatos comuns

**Padroes NAO cobertos (revisao humana obrigatoria):**
- Nomes proprios em texto corrido
- Enderecos escritos por extenso sem padrao
- Dados contextuais ("meu pai tem 67 anos")
- Numeros de conta bancaria sem formato padrao

---

## Tabela de Decisao por Caso de Uso

| Caso de uso na IA | Tecnica recomendada | Nivel de risco residual |
|---|---|---|
| Testar prompt com estrutura de dados | Mascaramento parcial | Baixo |
| Depurar logica de negocio | Pseudonimo + mascaramento | Medio |
| Treinar modelo com historico real | Hash + generalizacao + NER | Medio-Alto (revisar) |
| Analise estatistica de base | Perturbacao + generalizacao | Baixo |
| Demonstracao de produto para cliente | Supressao + dado sintetico | Muito Baixo |
| Relatorio executivo com metricas | Generalizacao | Baixo |

## Niveis de Anonimizacao (NORM10 Sec 3)

| Nivel | Descricao | Tratamento pela LGPD |
|---|---|---|
| **Nivel 1 - Pseudonimizado** | Dado substituido por token reversivel (com chave) | Ainda e dado pessoal — requer cuidado |
| **Nivel 2 - Mascarado** | Dado parcialmente ocultado, sem chave de reversao | Dado pessoal com risco reduzido |
| **Nivel 3 - Anonimizado** | Impossivel reidentificar individualmente e por cruzamento | Fora do escopo da LGPD (Art. 12) |

Para uso em ferramentas de IA externas (mesmo enterprise), recomendar **Nivel 2 ou 3**.
