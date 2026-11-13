---
name: google-analytics
description: Consulta dados do Google Analytics 4 (GA4) via Data API — sessões, conversões, páginas, fontes de tráfego, usuários em tempo real. Usa service account para autenticação.
triggers:
  - google analytics
  - ga4
  - analytics data
  - relatório de tráfego
  - sessões
  - conversões GA
  - métricas do site
  - usuários ativos
  - pageviews
  - fontes de tráfego
  - tempo real analytics
env_required:
  - GOOGLE_SERVICE_ACCOUNT_JSON
  - GA4_PROPERTY_ID
---

# Skill: Google Analytics 4

Consulta relatórios GA4 usando a Analytics Data API.

## Setup (uma vez)

1. Google Cloud Console → criar projeto ou usar existente
2. Habilitar "Google Analytics Data API"
3. IAM → criar Service Account → baixar chave JSON
4. GA4 Admin → Property Access Management → adicionar email da service account como "Viewer"
5. Codificar: `base64 -w 0 key.json` → salvar em `GOOGLE_SERVICE_ACCOUNT_JSON`
6. Copiar Property ID (ex: `properties/123456789`) → salvar em `GA4_PROPERTY_ID`

## Capacidades

- Sessões, usuários, pageviews por período (7/30/90 dias)
- Top páginas por sessões
- Fontes de tráfego (organic, direct, social, paid, referral)
- Eventos de conversão (Lead, Purchase)
- Usuários ativos em tempo real
- Breakdown mobile vs desktop
