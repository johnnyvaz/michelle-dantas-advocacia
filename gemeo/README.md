# Gêmeo Digital — Corpus de Dados

Corpus do **Gêmeo Digital** deste negócio: a representação digital da empresa que alimenta um
**oráculo** capaz de responder perguntas estratégicas ("e se...?") simulando cenários.

> Este corpus segue o **framework Gêmeo Digital**. O motor é o próprio Claude Code: skills em
> `.claude/skills/` (`montar-gemeo`, `oraculo`, `atualizar-*`) + MCPs em `.mcp.json`. Os cálculos
> determinísticos (derivados, simulações, validação do canon) rodam em `scripts/` (Python 3.10+;
> `pip install -r scripts/requirements.txt`) — não há frontend nem servidor.

## Por onde começar

1. **Recém-clonado?** Rode `/montar-gemeo` — entrevista guiada + busca automática de dados.
2. **[`COMPLETUDE.md`](./COMPLETUDE.md)** — mede o progresso do corpus (☆ skeleton → ★★★).
3. **[`00-CANON/`](./00-CANON/)** — **fonte única da verdade**:
   - [`canon.yaml`](./00-CANON/canon.yaml) — modelo numérico computável do negócio.
   - [`perguntas-oraculo.md`](./00-CANON/perguntas-oraculo.md) — as perguntas que o oráculo deve saber responder.

## Regra de ouro

Todo número vive no **canon**; os documentos das pastas `01`–`16` derivam dele e citam a
origem. O oráculo **não inventa**: sem dado no canon, responde *"não tenho esse dado"*.
Derivados (ARR, runway, concentração…) são **recalculados com a conta visível**, nunca chutados.

## Mapa do corpus

| Pasta | Papel | Profundidade |
|-------|-------|:---:|
| `00-CANON` | Fonte da verdade: números + perguntas-alvo do oráculo | ★★★ núcleo |
| `01-DASHBOARD` | Painel executivo, KPIs atual×meta, ritual semanal | ★★ |
| `02-ESTRATEGIA` | Missão/visão, OKRs, cenários, decision framework, **registro de decisões**, riscos, análise competitiva, ecossistema e parcerias | ★★★ |
| `03-OPERACOES` | Cadeia de valor (processos-chave) + workflows operacionais | ★★ |
| `04-FINANCEIRO` | P&L, projeção 12m, métricas SaaS, break-even, unit economics por plano | ★★★ |
| `05-JURIDICO` | LGPD, privacidade, termos, propriedade intelectual, contrato-padrão | ★★ |
| `06-MARKETING` | ICP/persona, posicionamento, funil + processo de vendas, **operação de redes** (`redes/`), SEO, voz do cliente, política de ofertas | ★★ |
| `07-PRODUTO` | PRD, arquitetura, roadmap + **`STATUS.md` (estado real do código)** | ★★★ |
| `08-PESSOAS` | Time + perfis cognitivos + **matriz de adesão a decisões** | ★★★ diferencial |
| `09-CLIENTES` | Carteira, concentração, health/churn, casos de uso, atendimento/CS, base de conhecimento | ★★★ |
| `10-INVESTIDORES` | Pitch, cap table + simulações de diluição, modelo 3 anos, FAQ de objeções | ★★★ |
| `11-CONTAS-A-PAGAR` | Fornecedores recorrentes (fecha com `financeiro.custos.*`) e stack corporativo | ★ |
| `12-AGENTES` | Empresa de agentes de IA — a camada de **execução** do gêmeo (ver `12-AGENTES/README.md`) | ★★★ diferencial |
| `13-CONTABILIDADE` | Regime fiscal e obrigações | ★ |
| `14-MARCA` | Plataforma de marca, voz e tom, referências e anti-referências, identidade visual (formato DESIGN.md), arquitetura de marca, superfícies, acessibilidade, ativos, prova social. Exporta `PRODUCT.md`/`DESIGN.md` via `scripts/exportar_marca.py` | ★★ |
| `15-DADOS` | Ativos de dados: catálogo de bases, fontes e licenças (base legal), qualidade e frescor, linhagem fonte→produto | ★★ |
| `16-CONFORMIDADE` | SGSI: escopo e normas internas, controles com evidência, certificações, auditorias e não conformidades | ★★★ |
| `GLOSSARIO.md` | Termos, siglas e **codinomes ↔ nomes públicos** — o primeiro arquivo de um agente novo | ★ |
| `CENARIOS` | Análises "e se" persistidas e re-executáveis (canon_sha + script) | ★★ |
| `DECISOES` | BDRs — decisões com snapshot do canon e calibração de adesão | ★★★ |
| `PROPOSTAS` | Backlog das rodadas de `/analisar-negocio` (status + dedup) | ★★★ |
| `ARTEFATOS` | Exports de demonstração e diagramas (opcional) | ★ |
| `99-TEMPLATES` | Templates operacionais ligados aos registros vivos | ★ |

## Como o oráculo usa este corpus

```
Pergunta (ex.: "e se eu dobrar o preço do plano X?")
        │
        ▼
  Lê 00-CANON/canon.yaml        ──►  números exatos (substrato da simulação)
  Lê contexto nas pastas 01–16  ──►  narrativa, premissas, STATUS do produto
        │
        ▼
  Se a pergunta envolve DECISÃO:
   cruza com 08-PESSOAS (perfis cognitivos + matriz de adesão), se preenchida
        │
        ▼
  Resposta = número rastreável + conta visível + fontes citadas
```

A camada que distingue o gêmeo de uma planilha é a **predição de adesão**: prever se as
pessoas do bloco decisor abraçam a decisão (perfis em `08-PESSOAS/Team/`).

## MCPs e variáveis de ambiente

O `.mcp.json` na raiz declara 6 conectores; cada um ativa só se a credencial existir no ambiente:

| MCP | Variável | Onde obter |
|-----|----------|-----------|
| `github` | `GITHUB_TOKEN` | PAT fine-grained, read-only nos repos do produto |
| `stripe` | `STRIPE_API_KEY` | chave **restrita** de leitura (rk_…) |
| `supabase` | `SUPABASE_ACCESS_TOKEN` | token pessoal (já roda com `--read-only`) |
| `ga4` | `GA4_PROPERTY_ID` + `GOOGLE_APPLICATION_CREDENTIALS` | service account com acesso à property |
| `search-console` | `GOOGLE_APPLICATION_CREDENTIALS` | mesma service account, com acesso ao site |
| `atlassian` | — | OAuth interativo no 1º uso |

As skills **ignoram os não conectados** e nunca inventam os dados deles.

## Como instanciar este framework em outro negócio

1. Copie o diretório `gemeo-framework/` inteiro para o repo (privado!) do negócio.
2. Configure as credenciais dos MCPs que o negócio usa (tabela acima).
3. Abra o Claude Code **na raiz** do diretório e rode `/montar-gemeo` — ele entrevista,
   busca dados e preenche o corpus em sessões incrementais.
4. Acompanhe o progresso em `COMPLETUDE.md`; valide com 2–3 perguntas no `/oraculo`.
