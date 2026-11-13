-- page_view_counts passa a separar ENTRADA (documento HTML servido pela borda) de
-- NAVEGAÇÃO interna da SPA (beacon `/_pv` disparado a cada troca de rota no React Router).
-- Sem isso a tabela só via a primeira página de cada visita humana.
--
-- Linhas existentes viram 'entry' (era o único caso possível até aqui).
-- Ordem segura: aplicar ANTES do deploy que manda `p_source`; a borda só envia o
-- parâmetro no beacon, então entrada continua contando mesmo se a ordem inverter.
--
-- Rollback: delete from mdantas.page_view_counts where source = 'spa';
--           e recriar constraint/função como em 20261113113721_create-edge-telemetry.sql.

alter table mdantas.page_view_counts
  add column if not exists source text not null default 'entry'
    check (source in ('entry', 'spa'));

alter table mdantas.page_view_counts drop constraint if exists page_view_counts_key;
alter table mdantas.page_view_counts add constraint page_view_counts_key unique nulls not distinct (
  day, hour, host, path, referrer_host, kind, source,
  utm_source, utm_medium, utm_campaign, utm_content
);

-- Drop + create (não `create or replace`): uma sobrecarga nova com o parâmetro a mais
-- deixaria o PostgREST com duas candidatas para a mesma chamada nomeada.
drop function if exists mdantas.increment_page_view_count(
  date, smallint, text, text, text, text, text, text, text, text
);

create function mdantas.increment_page_view_count(
  p_day date,
  p_hour smallint,
  p_host text,
  p_path text,
  p_referrer_host text default null,
  p_kind text default 'human',
  p_utm_source text default null,
  p_utm_medium text default null,
  p_utm_campaign text default null,
  p_utm_content text default null,
  p_source text default 'entry'
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
    day, hour, host, path, referrer_host, kind, source,
    utm_source, utm_medium, utm_campaign, utm_content
  )
  values (
    p_day, p_hour, p_host, p_path, p_referrer_host, p_kind, p_source,
    p_utm_source, p_utm_medium, p_utm_campaign, p_utm_content
  )
  on conflict on constraint page_view_counts_key
  do update set views = mdantas.page_view_counts.views + 1
  returning id into v_id;
  return v_id;
end;
$$;

revoke all on function mdantas.increment_page_view_count(
  date, smallint, text, text, text, text, text, text, text, text, text
) from public, anon, authenticated;
grant execute on function mdantas.increment_page_view_count(
  date, smallint, text, text, text, text, text, text, text, text, text
) to service_role;

comment on column mdantas.page_view_counts.source is
  'entry = documento HTML servido pela borda (página de entrada ou recarga); spa = troca de rota no navegador (beacon /_pv).';

notify pgrst, 'reload schema';
