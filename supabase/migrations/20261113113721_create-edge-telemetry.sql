-- Telemetria de borda do mdantas.adv.br (netlify/edge-functions/crawler-log.ts).
-- Modelo do Sextante (templates/adaptadores/netlify), portado do SITE-JOHNNY-VAZ em 2026-11-13,
-- que por sua vez veio da PLATAFORMA-CURSOS sem multi-tenant, painel de releases nem IndexNow.
--
-- Privacidade pela estrutura: nenhuma coluna guarda IP, user-agent bruto, URL de
-- referência completa, cookie ou query string. Acesso humano não gera linha — só
-- incrementa um contador por hora.
--
-- Rollback: drop function mdantas.increment_page_view_count(...);
--           drop table mdantas.page_view_counts; drop table mdantas.crawler_hits;
--
-- Autossuficiente: o schema mdantas guarda só esta telemetria e não depende de outra migration.
-- O schema também precisa estar exposto no Data API do projeto (a borda grava via PostgREST);
-- expor o schema e aplicar esta migration no banco remoto são ações Tipo 1 do dono (spec 002, FR-016).

create schema if not exists mdantas;
grant usage on schema mdantas to service_role;

create table if not exists mdantas.crawler_hits (
  id bigint generated always as identity primary key,
  occurred_at timestamptz not null default now(),
  bot text not null,
  category text not null
    check (category in ('search', 'ai-citation', 'ai-grounding', 'ai-training')),
  host text not null,
  path text not null,
  section text not null,
  status smallint check (status is null or status between 100 and 599),
  from_cache boolean,
  verified boolean,
  verification_method text not null
    check (verification_method in ('rdns', 'ip-range', 'unavailable')),
  served_build_id text,
  constraint crawler_hits_verification_state_check check (
    (verification_method = 'unavailable' and verified is null)
    or (verification_method in ('rdns', 'ip-range') and verified is not null)
  )
);

create index if not exists crawler_hits_bot_time_idx on mdantas.crawler_hits (bot, occurred_at desc);
create index if not exists crawler_hits_time_idx on mdantas.crawler_hits (occurred_at desc);

create table if not exists mdantas.page_view_counts (
  id bigint generated always as identity primary key,
  day date not null,
  hour smallint not null check (hour between 0 and 23),
  host text not null,
  path text not null,
  referrer_host text,
  kind text not null check (kind in ('human', 'bot')),
  utm_source text check (utm_source is null or length(utm_source) <= 120),
  utm_medium text check (utm_medium is null or length(utm_medium) <= 120),
  utm_campaign text check (utm_campaign is null or length(utm_campaign) <= 120),
  utm_content text check (utm_content is null or length(utm_content) <= 120),
  views integer not null default 1 check (views > 0),
  -- Sem NULLS NOT DISTINCT, cada visita direta (referrer nulo) criaria linha nova
  -- e o contador degeneraria em log por evento.
  constraint page_view_counts_key unique nulls not distinct (
    day, hour, host, path, referrer_host, kind,
    utm_source, utm_medium, utm_campaign, utm_content
  )
);

create index if not exists page_view_counts_day_idx on mdantas.page_view_counts (day desc);
create index if not exists page_view_counts_referrer_idx
  on mdantas.page_view_counts (referrer_host, day desc) where referrer_host is not null;

create or replace function mdantas.increment_page_view_count(
  p_day date,
  p_hour smallint,
  p_host text,
  p_path text,
  p_referrer_host text default null,
  p_kind text default 'human',
  p_utm_source text default null,
  p_utm_medium text default null,
  p_utm_campaign text default null,
  p_utm_content text default null
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id bigint;
begin
  insert into mdantas.page_view_counts (
    day, hour, host, path, referrer_host, kind,
    utm_source, utm_medium, utm_campaign, utm_content
  )
  values (
    p_day, p_hour, p_host, p_path, p_referrer_host, p_kind,
    p_utm_source, p_utm_medium, p_utm_campaign, p_utm_content
  )
  on conflict on constraint page_view_counts_key
  do update set views = mdantas.page_view_counts.views + 1
  returning id into v_id;
  return v_id;
end;
$$;

-- Só a borda (service_role) escreve e lê. Se o schema tiver default privileges que dão
-- SELECT a anon ou escrita a authenticated, eles são revogados aqui, e RLS sem policy fecha o resto.
alter table mdantas.crawler_hits enable row level security;
alter table mdantas.page_view_counts enable row level security;
revoke all on mdantas.crawler_hits, mdantas.page_view_counts from anon, authenticated;
grant all on mdantas.crawler_hits, mdantas.page_view_counts to service_role;

revoke all on function mdantas.increment_page_view_count(
  date, smallint, text, text, text, text, text, text, text, text
) from public, anon, authenticated;
grant execute on function mdantas.increment_page_view_count(
  date, smallint, text, text, text, text, text, text, text, text
) to service_role;

comment on table mdantas.crawler_hits is
  'Acessos de robôs conhecidos, gravados na borda. Sem IP, user-agent bruto nem query string.';
comment on table mdantas.page_view_counts is
  'Contagem agregada por hora; não existe registro individual de acesso humano.';
