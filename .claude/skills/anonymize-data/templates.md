# Templates de Scripts por Tipo de Fonte

## Template 1 — CSV / Excel (Python + pandas)

Use este template quando a fonte e um arquivo CSV ou Excel com colunas conhecidas.

```python
#!/usr/bin/env python3
"""
Script de Anonimizacao - CSV/Excel
Gerado por Claude Code (PH3A)
Normas: NORM10 v6, NORM16 v9, LGPD Art 12/13

CAMPOS ANONIMIZADOS:
  cpf          → mascaramento parcial (NORM10 4.1)
  nome         → pseudonimo deterministico (NORM16)
  email        → mascaramento de dominio (NORM10 4.2)
  data_nasc    → generalizacao para ano (LGPD Art 5)
  telefone     → mascaramento parcial (NORM10 4.1)
  obs          → NER + supressao (NORM16)

CAMPOS MANTIDOS:
  id           → identificador interno (sem PII)
  status       → dado operacional sem PII
  produto_cod  → codigo interno sem PII

INSTRUCOES:
  pip install pandas openpyxl
  python anonimizar_clientes.py
  Verifique o arquivo de saida antes de enviar para IA.
"""

import pandas as pd
import hashlib, re, random
from datetime import datetime
from pathlib import Path

# ── CONFIGURACOES (edite aqui) ────────────────────────────────────────────────
INPUT_FILE  = "clientes.csv"          # Arquivo de entrada
OUTPUT_FILE = "clientes_anon.csv"     # Arquivo de saida (DIFERENTE do input!)
SEPARATOR   = ","                      # Separador do CSV
ENCODING    = "utf-8-sig"             # Encoding (utf-8-sig para arquivos com BOM)
SALT_LOCAL  = "ph3a-salt-2026"        # Salt local — NUNCA enviar para IA

# Mapeamento: nome_coluna → tecnica
# Edite conforme as colunas reais do seu arquivo
COLUNAS_ANONIMIZAR = {
    "cpf":       "cpf_mascara",
    "nome":      "pseudonimo",
    "email":     "email_dominio",
    "data_nasc": "data_ano",
    "telefone":  "tel_mascara",
    "obs":       "texto_livre",
    # Adicione mais colunas conforme necessario:
    # "cnpj":    "cnpj_mascara",
    # "cartao":  "cartao_pan",
    # "ip":      "ip_mascara",
    # "salario": "valor_faixa",
}
# ─────────────────────────────────────────────────────────────────────────────

NOMES_FALSOS = [
    "Carlos Ficticio","Ana Anonima","Pedro Pseudonimo","Maria Mascara",
    "Joao Generico","Lucia Limitada","Bruno Borrado","Carla Cifrada",
    "Roberto Rascunho","Sandra Suprimida","Marcos Mascarado","Paula Protegida"
]

# ── FUNCOES DE ANONIMIZACAO ───────────────────────────────────────────────────

def cpf_mascara(v):
    if pd.isna(v) or v == "": return v
    c = re.sub(r'\D', '', str(v))
    return c[:3] + ".***.***-**" if len(c) >= 3 else "***.***.***-**"

def cnpj_mascara(v):
    if pd.isna(v) or v == "": return v
    c = re.sub(r'\D', '', str(v))
    return c[:8] + "/****-**" if len(c) >= 8 else "**.***.***/****-**"

def pseudonimo(v):
    if pd.isna(v) or v == "": return v
    random.seed(hash(str(v).lower().strip()) % (2**32))
    return random.choice(NOMES_FALSOS)

def email_dominio(v):
    if pd.isna(v) or "@" not in str(v): return v
    _, dominio = str(v).split("@", 1)
    return "***@" + dominio

def email_hash(v):
    if pd.isna(v) or v == "": return v
    return hashlib.sha256((str(v).lower() + SALT_LOCAL).encode()).hexdigest()[:8] + "@anonimo.local"

def data_ano(v):
    if pd.isna(v) or v == "": return v
    for fmt in ["%Y-%m-%d","%d/%m/%Y","%d-%m-%Y","%Y/%m/%d","%d/%m/%y"]:
        try:
            return str(datetime.strptime(str(v).strip(), fmt).year)
        except: pass
    return "[DATA SUPRIMIDA]"

def tel_mascara(v):
    if pd.isna(v) or v == "": return v
    t = re.sub(r'\D', '', str(v))
    if len(t) >= 6:
        return t[:2] + " *****-" + t[-4:]
    return "** *****-****"

def cartao_pan(v):
    if pd.isna(v) or v == "": return v
    c = re.sub(r'\D', '', str(v))
    if len(c) >= 10:
        return c[:6] + "*" * (len(c) - 10) + c[-4:]
    return "****-****-****-****"

def ip_mascara(v):
    if pd.isna(v) or v == "": return v
    partes = str(v).split(".")
    if len(partes) == 4:
        partes[-1] = "0"
        return ".".join(partes)
    return "[IP SUPRIMIDO]"

def valor_faixa(v):
    if pd.isna(v) or v == "": return v
    try:
        n = float(str(v).replace(",",".").replace("R$","").strip())
        faixas = [(0,500,"Ate R$500"),(500,1000,"R$500-1k"),(1000,5000,"R$1k-5k"),
                  (5000,10000,"R$5k-10k"),(10000,50000,"R$10k-50k"),(50000,1e9,"Acima R$50k")]
        return next((f for a,b,f in faixas if a <= n < b), "Desconhecido")
    except: return "[VALOR SUPRIMIDO]"

def hash_campo(v):
    if pd.isna(v) or v == "": return v
    return "TKN_" + hashlib.sha256((str(v).strip() + SALT_LOCAL).encode()).hexdigest()[:16].upper()

def texto_livre(v):
    if pd.isna(v) or v == "": return v
    t = str(v)
    t = re.sub(r'\b\d{3}[\.\-]?\d{3}[\.\-]?\d{3}[\.\-]?\d{2}\b', '[CPF]', t)
    t = re.sub(r'\b\d{2}[\.\-]?\d{3}[\.\-]?\d{3}[\/]?\d{4}[\.\-]?\d{2}\b', '[CNPJ]', t)
    t = re.sub(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b', '[EMAIL]', t)
    t = re.sub(r'\(?\d{2}\)?\s?[\d\s\-]{8,10}\d', '[TELEFONE]', t)
    t = re.sub(r'\b\d{5}[\-]?\d{3}\b', '[CEP]', t)
    t = re.sub(r'\b(?:\d{4}[\s\-]?){3}\d{4}\b', '[CARTAO]', t)
    return t

FUNCOES = {
    "cpf_mascara":   cpf_mascara,
    "cnpj_mascara":  cnpj_mascara,
    "pseudonimo":    pseudonimo,
    "email_dominio": email_dominio,
    "email_hash":    email_hash,
    "data_ano":      data_ano,
    "tel_mascara":   tel_mascara,
    "cartao_pan":    cartao_pan,
    "ip_mascara":    ip_mascara,
    "valor_faixa":   valor_faixa,
    "hash_campo":    hash_campo,
    "texto_livre":   texto_livre,
}

# ── EXECUCAO PRINCIPAL ────────────────────────────────────────────────────────

def main():
    inicio = datetime.now()
    print(f"[{inicio}] Iniciando anonimizacao de {INPUT_FILE}")

    # Detectar extensao
    ext = Path(INPUT_FILE).suffix.lower()
    if ext in [".xlsx", ".xls"]:
        df = pd.read_excel(INPUT_FILE)
    else:
        df = pd.read_csv(INPUT_FILE, sep=SEPARATOR, encoding=ENCODING, dtype=str)

    total = len(df)
    print(f"  Registros lidos: {total}")

    # Verificar colunas configuradas vs colunas reais
    colunas_ausentes = [c for c in COLUNAS_ANONIMIZAR if c not in df.columns]
    if colunas_ausentes:
        print(f"  AVISO: colunas nao encontradas no arquivo: {colunas_ausentes}")
        print(f"  Colunas disponíveis: {list(df.columns)}")

    # Aplicar anonimizacao
    for coluna, tecnica in COLUNAS_ANONIMIZAR.items():
        if coluna in df.columns and tecnica in FUNCOES:
            df[coluna] = df[coluna].apply(FUNCOES[tecnica])
            print(f"  OK  {coluna:20s} → {tecnica}")
        elif coluna not in df.columns:
            print(f"  --  {coluna:20s} → coluna nao encontrada (ignorada)")

    # Salvar resultado
    if ext in [".xlsx", ".xls"]:
        df.to_excel(OUTPUT_FILE, index=False)
    else:
        df.to_csv(OUTPUT_FILE, sep=SEPARATOR, encoding=ENCODING, index=False)

    fim = datetime.now()
    print(f"\n  Registros processados: {total}")
    print(f"  Arquivo de saida:      {OUTPUT_FILE}")
    print(f"  Duracao:               {(fim - inicio).total_seconds():.2f}s")
    print(f"\n  ATENCAO: Verifique o arquivo de saida antes de enviar para IA!")
    print(f"  ATENCAO: Textos livres (NER) podem conter PII nao capturada.")

if __name__ == "__main__":
    main()
```

---

## Template 2 — SQL (PostgreSQL / SQL Server)

Use este template quando quiser anonimizar diretamente em banco de dados ou gerar uma view anonimizada.

```sql
-- Script de Anonimizacao - SQL
-- Gerado por Claude Code (PH3A)
-- Normas: NORM10 v6, NORM16 v9, LGPD Art 12/13
--
-- INSTRUCOES:
--   1. Revise os nomes de tabela e colunas abaixo
--   2. Execute em ambiente de HOMOLOGACAO antes de producao
--   3. A view criada pode ser usada com seguranca em ferramentas de IA

-- ── POSTGRES: View anonimizada ──────────────────────────────────────────────

CREATE OR REPLACE VIEW vw_clientes_anonimizados AS
SELECT
    id,                                          -- mantido (sem PII)
    status,                                      -- mantido (sem PII)
    produto_cod,                                 -- mantido (sem PII)

    -- CPF: mascaramento parcial (NORM10 4.1)
    LEFT(cpf, 3) || '.***.***-**'               AS cpf,

    -- Nome: supressao (substituir por role/categoria se disponivel)
    '[NOME SUPRIMIDO]'                           AS nome,

    -- Email: mascaramento de dominio (NORM10 4.2)
    '***@' || SPLIT_PART(email, '@', 2)         AS email,

    -- Telefone: mascaramento parcial
    LEFT(telefone, 2) || ' *****-' || RIGHT(telefone, 4) AS telefone,

    -- Data nascimento: apenas ano (LGPD Art 5)
    EXTRACT(YEAR FROM data_nasc::date)::varchar  AS data_nasc,

    -- Endereco: apenas cidade e UF
    cidade || ' - ' || uf                        AS endereco,

    -- Valor: faixa (nao valor exato)
    CASE
        WHEN valor < 500    THEN 'Ate R$500'
        WHEN valor < 1000   THEN 'R$500-1k'
        WHEN valor < 5000   THEN 'R$1k-5k'
        WHEN valor < 10000  THEN 'R$5k-10k'
        WHEN valor < 50000  THEN 'R$10k-50k'
        ELSE 'Acima R$50k'
    END                                          AS valor_faixa,

    -- IP: zera ultimo octeto
    REGEXP_REPLACE(ip_address, '\.\d+$', '.0')  AS ip_address,

    -- Texto livre: regex basico (revisar manualmente apos exportar)
    REGEXP_REPLACE(
        REGEXP_REPLACE(
            REGEXP_REPLACE(obs,
                '\d{3}[.\-]?\d{3}[.\-]?\d{3}[.\-]?\d{2}', '[CPF]', 'g'),
            '[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}', '[EMAIL]', 'g'),
        '\(?\d{2}\)?\s?[\d\s\-]{8,10}\d', '[TELEFONE]', 'g')  AS obs

FROM clientes;

-- Para SQL Server, substituir SPLIT_PART por SUBSTRING/CHARINDEX
-- Para MySQL,     substituir REGEXP_REPLACE por REGEXP_REPLACE (MySQL 8+)
```

---

## Template 3 — JSON / API (Python)

Use este template quando a fonte e um arquivo JSON ou retorno de API.

```python
#!/usr/bin/env python3
"""
Script de Anonimizacao - JSON / API
Gerado por Claude Code (PH3A)
Normas: NORM10 v6, NORM16 v9, LGPD Art 12/13

INSTRUCOES:
  python anonimizar_json.py
"""

import json, re, hashlib, random
from datetime import datetime
from pathlib import Path

INPUT_FILE  = "dados.json"
OUTPUT_FILE = "dados_anon.json"
SALT_LOCAL  = "ph3a-salt-2026"  # NUNCA enviar para IA

# Mapeamento de campos no JSON (suporta notacao com ponto para campos aninhados)
# Exemplo: "cliente.cpf" anonimiza o campo cpf dentro do objeto cliente
CAMPOS_ANONIMIZAR = {
    "cpf":             "cpf_mascara",
    "nome":            "pseudonimo",
    "email":           "email_dominio",
    "dataNascimento":  "data_ano",
    "telefone":        "tel_mascara",
    "observacoes":     "texto_livre",
    "enderecoCompleto": "supressao",
    # Campos aninhados:
    # "endereco.cep":  "supressao",
    # "pagamento.cartao": "cartao_pan",
}

NOMES_FALSOS = [
    "Carlos Ficticio","Ana Anonima","Pedro Pseudonimo","Maria Mascara",
    "Joao Generico","Lucia Limitada","Bruno Borrado","Carla Cifrada"
]

def aplicar_tecnica(valor, tecnica):
    if valor is None: return valor
    v = str(valor)

    if tecnica == "cpf_mascara":
        c = re.sub(r'\D', '', v)
        return c[:3] + ".***.***-**" if len(c) >= 3 else "***.***.***-**"

    if tecnica == "pseudonimo":
        random.seed(hash(v.lower().strip()) % (2**32))
        return random.choice(NOMES_FALSOS)

    if tecnica == "email_dominio":
        if "@" in v:
            return "***@" + v.split("@", 1)[1]
        return v

    if tecnica == "data_ano":
        for fmt in ["%Y-%m-%d","%d/%m/%Y","%Y-%m-%dT%H:%M:%S"]:
            try: return str(datetime.strptime(v[:10], fmt[:8]).year)
            except: pass
        return "[DATA SUPRIMIDA]"

    if tecnica == "tel_mascara":
        t = re.sub(r'\D', '', v)
        return t[:2] + " *****-" + t[-4:] if len(t) >= 6 else "** *****-****"

    if tecnica == "texto_livre":
        t = v
        t = re.sub(r'\b\d{3}[\.\-]?\d{3}[\.\-]?\d{3}[\.\-]?\d{2}\b', '[CPF]', t)
        t = re.sub(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b', '[EMAIL]', t)
        t = re.sub(r'\(?\d{2}\)?\s?[\d\s\-]{8,10}\d', '[TELEFONE]', t)
        t = re.sub(r'\b\d{5}[\-]?\d{3}\b', '[CEP]', t)
        return t

    if tecnica == "supressao":
        return "[SUPRIMIDO]"

    if tecnica == "hash_campo":
        return "TKN_" + hashlib.sha256((v + SALT_LOCAL).encode()).hexdigest()[:16].upper()

    return valor

def anonimizar_objeto(obj, campos):
    """Percorre recursivamente um objeto JSON aplicando anonimizacao"""
    if isinstance(obj, list):
        return [anonimizar_objeto(item, campos) for item in obj]
    if isinstance(obj, dict):
        novo = {}
        for chave, valor in obj.items():
            if chave in campos:
                novo[chave] = aplicar_tecnica(valor, campos[chave])
            elif isinstance(valor, (dict, list)):
                novo[chave] = anonimizar_objeto(valor, campos)
            else:
                novo[chave] = valor
        return novo
    return obj

def main():
    print(f"Lendo {INPUT_FILE}...")
    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        dados = json.load(f)

    # Contar registros
    total = len(dados) if isinstance(dados, list) else 1
    print(f"Registros: {total}")

    dados_anon = anonimizar_objeto(dados, CAMPOS_ANONIMIZAR)

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(dados_anon, f, ensure_ascii=False, indent=2)

    print(f"Arquivo anonimizado salvo em: {OUTPUT_FILE}")
    print("ATENCAO: Verifique o arquivo antes de enviar para IA!")

if __name__ == "__main__":
    main()
```

---

## Template 4 — Shell / awk (transformacao rapida em texto)

Use para anonimizacao rapida de arquivos CSV simples sem Python disponivel.

```bash
#!/bin/bash
# Script de Anonimizacao - Shell/awk
# Gerado por Claude Code (PH3A)
# Normas: NORM10 v6 - Uso para casos simples, preferir Python para robustez

INPUT="clientes.csv"
OUTPUT="clientes_anon.csv"

# ATENCAO: ajuste os numeros de coluna ($N) conforme o seu CSV
# Coluna 1=id, 2=cpf, 3=nome, 4=email, 5=telefone, 6=data_nasc
# O awk usa separador "," — ajuste se necessario

awk -F',' 'BEGIN{OFS=","}
NR==1 { print; next }   # cabecalho: manter sem alteracao
{
    # CPF (coluna 2): mascara parcial
    if (length($2) >= 3) {
        cpf_prefix = substr($2, 1, 3)
        $2 = cpf_prefix ".***.***-**"
    }

    # Nome (coluna 3): supressao
    $3 = "[NOME SUPRIMIDO]"

    # Email (coluna 4): mascara de dominio
    n = split($4, email_partes, "@")
    if (n == 2) {
        $4 = "***@" email_partes[2]
    }

    # Telefone (coluna 5): mascara
    gsub(/[^0-9]/, "", $5)
    if (length($5) >= 6) {
        $5 = substr($5, 1, 2) " *****-" substr($5, length($5)-3)
    }

    # Data nascimento (coluna 6): apenas ano
    if (match($6, /[0-9]{4}/)) {
        $6 = substr($6, RSTART, 4)
    }

    print
}' "$INPUT" > "$OUTPUT"

echo "Anonimizacao concluida: $OUTPUT"
echo "ATENCAO: Verifique o arquivo antes de enviar para IA!"
```
