# Design — Playbook

> Conhecimento de domínio da área. Deriva das regras visuais do projeto e do contexto de produto — **não reinventa** o sistema (se algo divergir, as regras de identidade visual do projeto prevalecem).

### Objetivo da área

Manter a identidade visual e a interface da plataforma coerentes, aplicando o sistema certo (público ou administrativo) ao contexto certo.

### Princípios (como fazer bem)

- **Identificar o contexto antes de desenhar**: rota pública/marketing → sistema público; rota administrativa → sistema admin.
- Reusar tokens e classes existentes antes de criar estilo novo.
- Acessibilidade e legibilidade (WCAG, contraste, tamanho pequeno) acima de ornamento.
- Não misturar os dois sistemas nem criar paleta nova sem decisão.

### Processos / Frameworks

**Sistema público / marketing.** Editorial, contrastado, expressivo. Definir uma paleta enxuta (fundo, tinta/texto, **um** acento dominante usado em um só ponto, neutros de apoio) e uma tipografia com voz (display em caixa alta para headlines, serifada para contraste editorial, sans para apoio, mono para metadados/tags). Composição: uma palavra/ideia domina; grids simples; margens generosas; hierarquia hook → tensão → prova/CTA. Formatos por canal (thumbnail 1280×720, feed 1080×1080, stories 1080×1920, etc.) detalhados na regra visual do projeto.

**Sistema admin / produto.** Dashboard limpo, dados primeiro. Tokens com prefixo próprio (ex.: `app-*`) aplicados sob um escopo de raiz da área administrativa. Superfícies neutras, acento funcional **só para sucesso/ativo**, sans para interface, serifada para títulos/KPI, mono para IDs/valores. Usar as classes/componentes prontos (card, KPI, tabela, badge) antes de utilitário cru. Nada da expressividade do sistema público aqui.

**UI e layout.** Hierarquia clara, espaçamento consistente, estados completos (vazio, carregando, erro). Componentes do design system do projeto. A UI serve o produto descrito em `gemeo/07-PRODUTO/` (PRD, features) — desenhar para o fluxo real, não para uma tela isolada.

**White-label.** Em projetos multi-marca, cada cliente/tenant tem brand própria — respeitar cores/identidade do cliente sem quebrar o sistema base.

### Ferramentas (skills) e quando usar cada uma

| Skill | Quando usar |
|-------|-------------|
| `impeccable` | Desenhar/revisar/polir interface (telas, componentes, design system) |
| `interface-design` | Projetar dashboards, painéis, apps e ferramentas |
| geração de arte/imagem | Gerar peças de marketing (header, overlay, thumbnail) no padrão visual público — usar a skill de geração de imagem disponível no projeto |

### Fontes no cérebro

- Contexto: `gemeo/07-PRODUTO/` — PRD, `ARCHITECTURE.md`, `features/FEATURES.md` (o que a UI serve)
- Regras: `.claude/rules/` (regras de identidade visual pública e administrativa, quando existirem)

### O que NÃO fazer

- Misturar os elementos do sistema público no admin, ou vice-versa.
- Espalhar o acento de cor em vários elementos — ele é um foco único.
- Criar paleta ou token novo sem decisão do responsável.
- Ignorar a marca do cliente em projetos white-label.
