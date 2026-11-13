# 07-PRODUTO — Especificação e estado real

- `STATUS.md` — **estado real do código** (CI, implementado vs. stub, última verificação) — via `/atualizar-produto`. É o antídoto contra o corpus descolar da realidade.
- `PRD.md` — o que o produto faz, para quem e o escopo por fase.
- `ARCHITECTURE.md` — visão de componentes resumida (1 diagrama + tabela; marca o componente crítico).
- `ROADMAP.md` — horizontes agora/próximo/depois, cada item ligado a uma meta do canon.
- `api/API.md` — convenções da API (auth, versionamento, recursos principais).
- `database/SCHEMA.md` — entidades e relações em alto nível; origem das métricas de uso.
- `features/FEATURES.md` — inventário de features (status, plano, evidência no código).
- `integrations/INTEGRATIONS.md` — integrações externas (papel, status, dependência crítica).
- `mapa/` — **mapa do código**, gerado por `/mapear-projeto` (não editar à mão). Comece por
  `mapa/INDEX.md` para qualquer pergunta "onde/como o projeto faz X": tema → doc → arquivos, com
  confiança 🟢 confirmado · 🟡 inferido · 🔴 lacuna. Os templates acima recebem dele os achados 🟢.

**Regra**: o corpus resume; o código no repo é a fonte. Não duplicar documentação técnica.
