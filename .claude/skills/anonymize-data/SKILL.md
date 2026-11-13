---
name: anonymize-data
description: Gera scripts de anonimizacao/pseudonimizacao de dados sensiveis para uso seguro com ferramentas de IA. Nao le dados reais - apenas gera o script com base na estrutura descrita pelo usuario. Use quando precisar preparar dados para usar com IA respeitando as politicas PH3A de protecao de dados (NORM10, NORM16, POL00).
allowed-tools: Write, Read, Glob
gates: [sem-exfiltracao]
---

# Skill: Gerador de Scripts de Anonimizacao de Dados

## Principio de Seguranca Fundamental

> **Este skill NUNCA le, processa ou visualiza dados reais.**
>
> O usuario descreve a **estrutura** dos dados (campos, tipos, exemplos fictícios).
> O skill gera um **script executavel localmente** que faz a anonimizacao.
> O usuario executa o script em sua propria maquina/servidor.
> Somente o resultado anonimizado vai para a IA.

Isso garante conformidade com:
- **PH3A POL00** - Politica de Seguranca da Informacao v9
- **PH3A NORM10** - Norma de Descaracterizacao de Dados v6
- **PH3A NORM16** - Norma de Privacidade de Dados v9
- **LGPD** - Art. 12 (Dados anonimizados) e Art. 13 (Pseudonimizacao)
- **ISO 27001:2022** - A.8.11 (Data masking) e A.8.12 (Data leakage prevention)

---

## Instrucoes de Execucao

### Passo 1 — Entender o Contexto

Pergunte ao usuario (se nao informado):

1. **Qual o objetivo?** O que vai fazer com os dados anonimizados na IA?
   - Treinar/testar prompt
   - Depurar um bug com dados reais
   - Gerar relatorio/analise
   - Outro

2. **Qual a fonte dos dados?**
   - Arquivo CSV / Excel / JSON
   - Banco de dados (SQL Server, PostgreSQL, MySQL, Oracle, SQLite)
   - API / retorno JSON
   - Outro

3. **Qual linguagem preferida para o script?**
   - Python (recomendado para arquivos e APIs)
   - SQL (para banco de dados diretamente)
   - Shell/Bash (para transformacoes rapidas em arquivos texto)

4. **Qual o schema / estrutura?** Pedir que o usuario descreva os campos:
   - Nome do campo
   - Tipo de dado (CPF, CNPJ, nome, email, telefone, endereco, data nascimento, numero cartao, IP, valor financeiro, texto livre, outro)
   - Obrigatorio anonimizar ou pode manter?

5. **A anonimizacao precisa ser reversivel?**
   - **Nao** → Anonimizacao irreversivel (mascaramento, generalizacao, supressao)
   - **Sim** → Pseudonimizacao (tokenizacao com chave secreta local)

### Passo 2 — Classificar os Campos

Com base no schema fornecido, classifique cada campo segundo a NORM10:

| Tipo de Dado | Classificacao PH3A | Tecnica Padrao | Norma |
|---|---|---|---|
| CPF | Sensivel/Regulado | Mascaramento parcial ou hash SHA-256 | NORM10 Sec 4.1 |
| CNPJ | Confidencial | Mascaramento parcial | NORM10 Sec 4.1 |
| Nome completo | Confidencial | Pseudonimo (nome falso) ou supressao | NORM16 |
| Email | Confidencial | Mascaramento de dominio ou hash | NORM10 Sec 4.2 |
| Telefone | Confidencial | Mascaramento parcial | NORM10 Sec 4.1 |
| Data de nascimento | Sensivel/Regulado | Generalizacao (apenas ano) | LGPD Art 5 II |
| Endereco | Confidencial | Generalizacao (apenas cidade/UF) | NORM16 |
| Numero cartao | Sensivel/Regulado | PAN masking (primeiros 6 + ultimos 4) | PCI-DSS / NORM10 |
| IP | Interno | Mascaramento de octeto final | NORM10 |
| Valor financeiro | Confidencial | Perturbacao numerica ou faixas | NORM10 Sec 4.3 |
| Texto livre (obs, etc) | Confidencial | NER + supressao ou marcador [REDACTED] | NORM16 |
| Senha/Token | Sensivel/Regulado | Supressao total - nunca incluir | NORM27 |
| Dado de saude | Sensivel/Regulado | Supressao ou generalizacao maxima | LGPD Art 11 |

### Passo 3 — Gerar o Script

Gere um script completo, pronto para executar, com:

#### Estrutura obrigatoria do script gerado:

```
1. Cabecalho com: data de geracao, normas aplicadas, campos anonimizados
2. Imports / dependencias necessarias
3. Constantes configuráveis (caminhos de entrada/saida, separador, encoding)
4. Funcoes de anonimizacao para cada tipo de campo
5. Funcao principal que le o arquivo/banco e aplica as funcoes
6. Instrucoes de uso em comentarios
7. Verificacao pos-execucao: contar registros, validar campos
```

#### Regras de geracao de scripts:

- **Sem dados hardcoded**: caminhos e configuracoes ficam em constantes no topo
- **Reproducível**: usar seed fixo para pseudonimos (mas documentar que seed e local)
- **Auditavel**: o script gera log de execucao indicando qtd de registros processados
- **Idempotente**: rodar o script duas vezes no mesmo arquivo produz o mesmo resultado
- **Sem dependencias desnecessarias**: preferir stdlib antes de libs externas

### Passo 4 — Entregar o Script e Instrucoes

Ao final, entregue:

1. **O script completo** - usando a ferramenta Write para salvar em arquivo
2. **Instrucoes de instalacao** de dependencias (pip install, etc.)
3. **Como executar** - linha de comando exata
4. **O que verificar** antes de enviar para IA:
   - Lista de campos que foram anonimizados
   - Lista de campos mantidos intactos (e justificativa)
   - Aviso sobre campos de texto livre (NER pode nao capturar tudo)
5. **Nivel de anonimizacao atingido** (segundo NORM10):
   - Irreversivel → pode ser tratado como dado publico para fins de IA
   - Pseudonimizado → ainda e dado pessoal, mas risco reduzido

---

## Templates de Funcoes por Tipo de Dado

### CPF (mascaramento padrao PH3A)
```python
import hashlib, re

def anonimizar_cpf(cpf: str, modo="mascara") -> str:
    """
    NORM10 Sec 4.1 - Descaracterizacao de CPF
    modo='mascara'  → '123.***.***-**'  (mantem primeiros 3 digitos, mascara resto)
    modo='hash'     → SHA-256 truncado a 12 chars (para correlacao sem reversibilidade)
    modo='suprime'  → '[CPF SUPRIMIDO]'
    """
    if not cpf:
        return cpf
    cpf_limpo = re.sub(r'\D', '', str(cpf))
    if modo == "mascara":
        return cpf_limpo[:3] + ".***.***-**" if len(cpf_limpo) >= 3 else "***.***.***-**"
    elif modo == "hash":
        return hashlib.sha256(cpf_limpo.encode()).hexdigest()[:12].upper()
    else:
        return "[CPF SUPRIMIDO]"
```

### CNPJ
```python
def anonimizar_cnpj(cnpj: str, modo="mascara") -> str:
    """NORM10 - mantém raiz (8 digitos) e mascara filial/dígitos verificadores"""
    if not cnpj:
        return cnpj
    cnpj_limpo = re.sub(r'\D', '', str(cnpj))
    if modo == "mascara":
        return cnpj_limpo[:8] + "/****-**" if len(cnpj_limpo) >= 8 else "**.***.***/****-**"
    else:
        return "[CNPJ SUPRIMIDO]"
```

### Email
```python
def anonimizar_email(email: str, modo="dominio") -> str:
    """
    modo='dominio'   → '***@dominio.com' (preserva dominio para analise)
    modo='hash'      → SHA-256[:8]@anonimo.local
    modo='suprime'   → '[EMAIL SUPRIMIDO]'
    """
    if not email or "@" not in str(email):
        return email
    local, dominio = str(email).split("@", 1)
    if modo == "dominio":
        return "***@" + dominio
    elif modo == "hash":
        return hashlib.sha256(email.lower().encode()).hexdigest()[:8] + "@anonimo.local"
    else:
        return "[EMAIL SUPRIMIDO]"
```

### Nome
```python
import random

NOMES_FALSOS = ["Carlos Ficticio", "Ana Anonima", "Pedro Pseudonimo", "Maria Mascara",
                "Joao Generico", "Lucia Limitada", "Bruno Borrado", "Carla Cifrada"]

def anonimizar_nome(nome: str, seed: int = 42) -> str:
    """Substitui por nome ficticio deterministico (mesmo input = mesmo output)"""
    if not nome:
        return nome
    random.seed(hash(str(nome).lower().strip()) % (2**32))
    return random.choice(NOMES_FALSOS)
```

### Telefone
```python
def anonimizar_telefone(tel: str) -> str:
    """Mantem DDD, mascara numero"""
    if not tel:
        return tel
    tel_limpo = re.sub(r'\D', '', str(tel))
    if len(tel_limpo) >= 4:
        return tel_limpo[:2] + " *****-" + tel_limpo[-4:]
    return "** *****-****"
```

### Data de Nascimento
```python
from datetime import datetime

def anonimizar_data_nascimento(data: str, modo="ano") -> str:
    """
    LGPD Art 5 II - generalizacao de dado sensivel
    modo='ano'   → '1985' (apenas ano, remove dia e mes)
    modo='faixa' → '35-44 anos' (faixa etaria)
    """
    if not data:
        return data
    try:
        if isinstance(data, str):
            for fmt in ["%Y-%m-%d", "%d/%m/%Y", "%d-%m-%Y", "%Y/%m/%d"]:
                try:
                    dt = datetime.strptime(data.strip(), fmt)
                    break
                except:
                    continue
            else:
                return "[DATA INVALIDA]"
        else:
            dt = data
        if modo == "ano":
            return str(dt.year)
        else:
            idade = datetime.now().year - dt.year
            faixas = [(0,17,"0-17"),(18,24,"18-24"),(25,34,"25-34"),(35,44,"35-44"),
                      (45,54,"45-54"),(55,64,"55-64"),(65,999,"65+")]
            return next((f for a,b,f in faixas if a <= idade <= b), "desconhecida") + " anos"
    except:
        return "[DATA SUPRIMIDA]"
```

### Numero de Cartao
```python
def anonimizar_cartao(numero: str) -> str:
    """PCI-DSS / NORM10 - PAN Masking: primeiros 6 + ultimos 4"""
    if not numero:
        return numero
    limpo = re.sub(r'\D', '', str(numero))
    if len(limpo) >= 10:
        return limpo[:6] + "*" * (len(limpo) - 10) + limpo[-4:]
    return "****-****-****-****"
```

### IP
```python
def anonimizar_ip(ip: str, modo="ultimo_octeto") -> str:
    """
    modo='ultimo_octeto' → '192.168.1.0'  (zera ultimo octeto)
    modo='dois_octetos'  → '192.168.0.0'  (zera dois ultimos)
    """
    if not ip:
        return ip
    partes = str(ip).split(".")
    if len(partes) == 4:
        if modo == "ultimo_octeto":
            partes[-1] = "0"
        else:
            partes[-1] = "0"
            partes[-2] = "0"
        return ".".join(partes)
    return "[IP SUPRIMIDO]"
```

### Valor Financeiro
```python
def anonimizar_valor(valor, modo="faixa") -> str:
    """
    modo='faixa'       → 'R$ 1.000 a R$ 5.000'
    modo='perturbacao' → valor +/- 15% aleatorio (para analises estatisticas)
    modo='suprime'     → '[VALOR SUPRIMIDO]'
    """
    if valor is None or valor == "":
        return valor
    try:
        v = float(str(valor).replace(",", ".").replace("R$","").strip())
    except:
        return "[VALOR INVALIDO]"
    if modo == "faixa":
        faixas = [(0,500,"Ate R$ 500"),(500,1000,"R$ 500 a R$ 1.000"),
                  (1000,5000,"R$ 1.000 a R$ 5.000"),(5000,10000,"R$ 5.000 a R$ 10.000"),
                  (10000,50000,"R$ 10.000 a R$ 50.000"),(50000,float('inf'),"Acima de R$ 50.000")]
        return next((f for a,b,f in faixas if a <= v < b), "Valor desconhecido")
    elif modo == "perturbacao":
        random.seed(int(v * 100) % (2**32))
        fator = 1 + random.uniform(-0.15, 0.15)
        return f"{v * fator:.2f}"
    else:
        return "[VALOR SUPRIMIDO]"
```

### Texto Livre (NER simples)
```python
import re

def anonimizar_texto_livre(texto: str) -> str:
    """
    NORM16 - Remove padroes comuns de dados pessoais de texto livre.
    ATENCAO: NER baseado em regex nao e 100% eficaz.
    Revisar o resultado antes de enviar para IA.
    """
    if not texto:
        return texto
    t = str(texto)
    # CPF
    t = re.sub(r'\b\d{3}[\.\-]?\d{3}[\.\-]?\d{3}[\.\-]?\d{2}\b', '[CPF]', t)
    # CNPJ
    t = re.sub(r'\b\d{2}[\.\-]?\d{3}[\.\-]?\d{3}[\/]?\d{4}[\.\-]?\d{2}\b', '[CNPJ]', t)
    # Email
    t = re.sub(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', '[EMAIL]', t)
    # Telefone (vários formatos)
    t = re.sub(r'\(?\d{2}\)?\s?[\d\s\-]{8,10}\d', '[TELEFONE]', t)
    # CEP
    t = re.sub(r'\b\d{5}[\-]?\d{3}\b', '[CEP]', t)
    # RG (padrão SP)
    t = re.sub(r'\b\d{2}[\.\-]?\d{3}[\.\-]?\d{3}[\.\-]?[0-9X]\b', '[RG]', t)
    # Cartao
    t = re.sub(r'\b(?:\d{4}[\s\-]?){3}\d{4}\b', '[CARTAO]', t)
    return t
```

---

## Formato do Script Gerado

Ao gerar o script final, use sempre este cabecalho:

```python
#!/usr/bin/env python3
"""
Script de Anonimizacao - Gerado por Claude Code (PH3A)
Data: [DATA]
Normas aplicadas: PH3A NORM10 v6, NORM16 v9, LGPD Art 12/13, ISO 27001 A.8.11

CAMPOS ANONIMIZADOS:
  [campo1] → [tecnica usada]
  [campo2] → [tecnica usada]

CAMPOS MANTIDOS:
  [campo3] → [justificativa]

INSTRUCOES:
  1. pip install [dependencias se necessario]
  2. Edite INPUT_FILE e OUTPUT_FILE abaixo
  3. Execute: python anonimizar_[nome].py
  4. Verifique o arquivo de saida ANTES de enviar para IA
  5. DELETE o arquivo de entrada apos verificar o resultado

ATENCAO: Este script nao substitui revisao humana.
         Textos livres podem conter dados nao capturados pelo NER.
         Em caso de duvida, consulte o DPO ou o time de Seguranca da Informacao.
"""
```

---

## Nome e Local do Arquivo Gerado

Salvar usando Write com a convencao:

```
anonimizar_[descricao]_[YYYY-MM-DD].py
```

Perguntar ao usuario onde salvar, ou salvar no diretorio atual se nao informado.

---

## Checklist Pos-Geracao

Apos gerar o script, exibir este checklist para o usuario:

```
✅ ANTES DE EXECUTAR:
   [ ] Verifique se INPUT_FILE aponta para o arquivo correto
   [ ] Confirme que OUTPUT_FILE é um caminho diferente do input (nao sobrescreve)
   [ ] Leia o cabecalho do script e confirme que os campos listados estao corretos

✅ APOS EXECUTAR:
   [ ] Abra o arquivo de saida e verifique manualmente 5-10 linhas
   [ ] Confirme que nenhum CPF, email ou nome real aparece
   [ ] Verifique especialmente colunas de texto livre (obs, comentarios, descricao)
   [ ] Guarde o script (é evidencia de conformidade - NORM10 Sec 6)
   [ ] Se usar pseudonimizacao: guarde a chave/seed em local seguro (cofre de senhas)

✅ AO USAR NA IA:
   [ ] Use somente o arquivo de SAIDA anonimizado
   [ ] Se a IA devolver resultados com dados para reintegrar, faca o mapeamento
       reverso LOCALMENTE, nunca envie a chave de reversao para a IA
   [ ] Registre no ticket/tarefa que dados anonimizados foram usados (trilha de auditoria)
```

---

## Quando NAO Usar Este Skill

Informe o usuario que alguns casos **nao tem solucao via anonimizacao**:

| Cenario | Por que nao anonimizar | O que fazer |
|---|---|---|
| Depurar bug que so ocorre com CPF especifico | Anonimizar pode eliminar o problema | Usar ambiente isolado sem IA externa, ou IA enterprise com DPA |
| Validar regra de negocio que depende do valor exato | Nao ha substituicao equivalente | Criar dado sintetico que reproduza o caso |
| Contrato ou documento juridico com partes nomeadas | Supressao invalida o documento | Usar IA enterprise com NDA / DPA assinado |
| Dado com criptografia ponta-a-ponta | Nao acessivel nem localmente | Processar sem IA ou com solucao on-premise |

---

## Referencias Normativas

| Norma | Secao | Relevancia |
|---|---|---|
| PH3A NORM10 v6 | Sec 4 | Tecnicas de descaracterizacao aceitas |
| PH3A NORM16 v9 | Sec 5 | Requisitos de privacidade no tratamento de dados |
| PH3A POL00 v9 | Sec 6 | Proibicao de dados Sensiveis/Regulados em IA online |
| LGPD | Art 12 | Dados anonimizados fora do escopo da lei |
| LGPD | Art 13 | Pseudonimizacao como tecnica de mitigacao |
| ISO 27001:2022 | A.8.11 | Data masking |
| ISO 27001:2022 | A.8.12 | Data leakage prevention |
| ISO 27701:2019 | 8.4.2 | Minimizacao e anonimizacao para processamento |

## Arquivos de Referencia

- [tecnicas.md](tecnicas.md) - Detalhamento das tecnicas de anonimizacao com criterios de escolha
- [templates.md](templates.md) - Templates completos de scripts por tipo de fonte (CSV, SQL, JSON)
