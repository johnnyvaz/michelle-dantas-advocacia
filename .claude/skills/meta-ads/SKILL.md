---
name: meta-ads
description: Consulta Meta Ads (Facebook/Instagram) via Marketing API — campanhas, ad sets, métricas de performance, ROAS, CPC, CPM, eventos Pixel, qualidade CAPI.
triggers:
  - meta ads
  - facebook ads
  - campanhas meta
  - pixel meta
  - capi
  - conversions api
  - ROAS
  - CPC
  - CPM
  - orçamento campanha
  - performance anúncio
  - eventos pixel
  - qualidade correspondência
  - meta marketing api
env_required:
  - META_ADS_ACCESS_TOKEN
  - META_AD_ACCOUNT_ID
notes: Token com permissões ads_read. Ad Account ID no formato act_XXXXXXXXXXXXXXXXX.
---

# Skill: Meta Ads

Consulta campanha e performance via Meta Marketing API v21.0.

## Setup (uma vez)

1. Meta Business Suite → Settings → System Users → criar System User
2. Adicionar ao Ad Account com permissão "Analyst"
3. Generate Token → selecionar permissões: `ads_read`, `ads_management` (read only)
4. Salvar em `META_ADS_ACCESS_TOKEN`
5. Ad Account ID: business.facebook.com/adsmanager → URL contém `act_XXXXXX` → salvar em `META_AD_ACCOUNT_ID`

## Capacidades

- Campanhas com status, budget, spend, ROAS
- Ad sets com reach, impressões, cliques, CPM, CPC
- Criativo com performance
- Eventos Pixel recentes (via Events Manager)
- Event Match Quality (EMQ) do CAPI
- Attribution window comparison
