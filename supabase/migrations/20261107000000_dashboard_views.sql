-- Vistas de métricas para el dashboard (PLAN_BACKEND §4, §5, D10, SEM-49).
--
-- Todas las vistas declaran `security_invoker = true` para que las consultas
-- desde el panel respeten las políticas RLS de `authenticated` (aislamiento
-- multi-tenant por `organization_id`).

-- ---------------------------------------------------------------------------
-- 1. KPIs principales del dashboard (1 fila por organización)
-- ---------------------------------------------------------------------------
create view public.v_dashboard_kpis
with (security_invoker = true) as
with month_bounds as (
  select
    (date_trunc('month', now() at time zone 'America/Argentina/Buenos_Aires') at time zone 'America/Argentina/Buenos_Aires') as curr_month_start,
    ((date_trunc('month', now() at time zone 'America/Argentina/Buenos_Aires') - interval '1 month') at time zone 'America/Argentina/Buenos_Aires') as prev_month_start,
    (date_trunc('week', now() at time zone 'America/Argentina/Buenos_Aires') at time zone 'America/Argentina/Buenos_Aires') as curr_week_start
),
installment_stats as (
  select
    i.organization_id,
    coalesce(sum(i.amount_cents) filter (where i.paid_at is not null), 0)::bigint as recovered_cents,
    coalesce(sum(i.amount_cents) filter (where i.paid_at >= mb.curr_month_start), 0)::bigint as recovered_curr_month_cents,
    coalesce(sum(i.amount_cents) filter (where i.paid_at >= mb.prev_month_start and i.paid_at < mb.curr_month_start), 0)::bigint as recovered_prev_month_cents
  from public.installments i
  cross join month_bounds mb
  group by i.organization_id
),
agreement_stats as (
  select
    a.organization_id,
    coalesce(sum(o.total_cents), 0)::bigint as agreed_cents,
    coalesce(sum(o.total_cents) filter (where a.accepted_at >= mb.curr_month_start), 0)::bigint as agreed_curr_month_cents,
    coalesce(sum(o.total_cents) filter (where a.accepted_at >= mb.prev_month_start and a.accepted_at < mb.curr_month_start), 0)::bigint as agreed_prev_month_cents,
    count(a.id)::int as agreements_count,
    count(a.id) filter (where a.accepted_at >= mb.curr_week_start)::int as agreements_this_week
  from public.agreements a
  join public.offers o on o.id = a.offer_id and o.organization_id = a.organization_id
  cross join month_bounds mb
  group by a.organization_id
),
negotiation_stats as (
  select
    n.organization_id,
    count(n.id) filter (
      where n.status in ('pending', 'verifying', 'active', 'offer_pending', 'escalated')
    )::int as active_conversations,
    count(n.id) filter (
      where n.status = 'escalated'
         or (
           n.status in ('pending', 'verifying', 'active', 'offer_pending')
           and last_msg.role in ('agent', 'admin', 'system')
         )
    )::int as awaiting_reply
  from public.negotiations n
  left join lateral (
    select m.role
    from public.messages m
    where m.negotiation_id = n.id
      and m.organization_id = n.organization_id
    order by m.created_at desc
    limit 1
  ) last_msg on true
  group by n.organization_id
)
select
  org.id as organization_id,
  coalesce(ist.recovered_cents, 0)::bigint as recovered_cents,
  coalesce(ast.agreed_cents, 0)::bigint as agreed_cents,
  case
    when coalesce(ist.recovered_prev_month_cents, 0) > 0 then
      round(
        ((coalesce(ist.recovered_curr_month_cents, 0) - ist.recovered_prev_month_cents)::numeric
          / ist.recovered_prev_month_cents::numeric) * 100,
        1
      )
    when coalesce(ist.recovered_cents, 0) = 0 and coalesce(ast.agreed_prev_month_cents, 0) > 0 then
      round(
        ((coalesce(ast.agreed_curr_month_cents, 0) - ast.agreed_prev_month_cents)::numeric
          / ast.agreed_prev_month_cents::numeric) * 100,
        1
      )
    else null
  end as delta_vs_prev_month_pct,
  coalesce(ast.agreements_count, 0)::int as agreements_count,
  coalesce(ast.agreements_this_week, 0)::int as agreements_this_week,
  coalesce(nst.active_conversations, 0)::int as active_conversations,
  coalesce(nst.awaiting_reply, 0)::int as awaiting_reply
from public.organizations org
left join installment_stats ist on ist.organization_id = org.id
left join agreement_stats ast on ast.organization_id = org.id
left join negotiation_stats nst on nst.organization_id = org.id;

-- ---------------------------------------------------------------------------
-- 2. Evolución mensual del recupero (últimos 12 meses calendario por org)
-- ---------------------------------------------------------------------------
create view public.v_monthly_recovery
with (security_invoker = true) as
with months as (
  select
    org.id as organization_id,
    gs.month_start::date as month_start,
    to_char(gs.month_start, 'YYYY-MM') as period
  from public.organizations org
  cross join generate_series(
    date_trunc('month', now() at time zone 'America/Argentina/Buenos_Aires') - interval '11 months',
    date_trunc('month', now() at time zone 'America/Argentina/Buenos_Aires'),
    interval '1 month'
  ) as gs(month_start)
),
paid_by_month as (
  select
    i.organization_id,
    date_trunc('month', i.paid_at at time zone 'America/Argentina/Buenos_Aires')::date as month_start,
    sum(i.amount_cents)::bigint as recovered_cents
  from public.installments i
  where i.paid_at is not null
  group by i.organization_id, date_trunc('month', i.paid_at at time zone 'America/Argentina/Buenos_Aires')::date
),
agreed_by_month as (
  select
    a.organization_id,
    date_trunc('month', a.accepted_at at time zone 'America/Argentina/Buenos_Aires')::date as month_start,
    sum(o.total_cents)::bigint as agreed_cents
  from public.agreements a
  join public.offers o on o.id = a.offer_id and o.organization_id = a.organization_id
  group by a.organization_id, date_trunc('month', a.accepted_at at time zone 'America/Argentina/Buenos_Aires')::date
)
select
  m.organization_id,
  m.month_start,
  m.period,
  coalesce(p.recovered_cents, 0)::bigint as recovered_cents,
  coalesce(ag.agreed_cents, 0)::bigint as agreed_cents,
  coalesce(p.recovered_cents, 0)::bigint as amount_cents
from months m
left join paid_by_month p on p.organization_id = m.organization_id and p.month_start = m.month_start
left join agreed_by_month ag on ag.organization_id = m.organization_id and ag.month_start = m.month_start;

-- ---------------------------------------------------------------------------
-- 3. Distribución de acuerdos por plan (cantidad de cuotas y período YYYY-MM)
-- ---------------------------------------------------------------------------
create view public.v_agreements_by_plan
with (security_invoker = true) as
select
  a.organization_id,
  to_char(date_trunc('month', a.accepted_at at time zone 'America/Argentina/Buenos_Aires'), 'YYYY-MM') as period,
  o.installments::int as installments,
  count(a.id)::int as count,
  coalesce(sum(o.total_cents), 0)::bigint as total_cents
from public.agreements a
join public.offers o on o.id = a.offer_id and o.organization_id = a.organization_id
group by
  a.organization_id,
  to_char(date_trunc('month', a.accepted_at at time zone 'America/Argentina/Buenos_Aires'), 'YYYY-MM'),
  o.installments;

-- ---------------------------------------------------------------------------
-- 4. Acuerdos y propuestas recientes para la tabla del dashboard
-- ---------------------------------------------------------------------------
create view public.v_recent_agreements
with (security_invoker = true) as
select
  a.id as agreement_id,
  n.id as negotiation_id,
  a.organization_id,
  dtr.id as debtor_id,
  dtr.alias as debtor_alias,
  dtr.full_name as debtor_full_name,
  dtr.group_label,
  d.concept,
  o.total_cents as amount_cents,
  o.installments::int as installments,
  'agreed'::text as status,
  a.accepted_at as activity_at
from public.agreements a
join public.offers o on o.id = a.offer_id and o.organization_id = a.organization_id
join public.negotiations n on n.id = o.negotiation_id and n.organization_id = a.organization_id
join public.debts d on d.id = n.debt_id and d.organization_id = a.organization_id
join public.debtors dtr on dtr.id = d.debtor_id and dtr.organization_id = a.organization_id
union all
select
  null::uuid as agreement_id,
  n.id as negotiation_id,
  o.organization_id,
  dtr.id as debtor_id,
  dtr.alias as debtor_alias,
  dtr.full_name as debtor_full_name,
  dtr.group_label,
  d.concept,
  o.total_cents as amount_cents,
  o.installments::int as installments,
  'offer_pending'::text as status,
  o.created_at as activity_at
from public.offers o
join public.negotiations n on n.id = o.negotiation_id and n.organization_id = o.organization_id
join public.debts d on d.id = n.debt_id and d.organization_id = o.organization_id
join public.debtors dtr on dtr.id = d.debtor_id and dtr.organization_id = o.organization_id
where o.status = 'proposed'
  and n.status = 'offer_pending';

-- ---------------------------------------------------------------------------
-- 5. Casos que requieren atención (escaladas, ofertas sin respuesta, fuera de política)
-- ---------------------------------------------------------------------------
create view public.v_attention_items
with (security_invoker = true) as
select
  n.organization_id,
  n.id as negotiation_id,
  'escalated'::text as kind,
  dtr.alias as debtor_alias,
  dtr.group_label,
  d.concept,
  coalesce(esc.created_at, n.updated_at) as occurred_at,
  coalesce(esc.payload, '{}'::jsonb) as detail
from public.negotiations n
join public.debts d on d.id = n.debt_id and d.organization_id = n.organization_id
join public.debtors dtr on dtr.id = d.debtor_id and dtr.organization_id = n.organization_id
left join lateral (
  select ae.created_at, ae.payload
  from public.audit_events ae
  where ae.negotiation_id = n.id
    and ae.organization_id = n.organization_id
    and ae.type in ('escalated', 'admin_takeover')
  order by ae.created_at desc
  limit 1
) esc on true
where n.status = 'escalated'
union all
select
  n.organization_id,
  n.id as negotiation_id,
  'unanswered_offer'::text as kind,
  dtr.alias as debtor_alias,
  dtr.group_label,
  d.concept,
  o.created_at as occurred_at,
  jsonb_build_object(
    'offer_id', o.id,
    'installments', o.installments,
    'total_cents', o.total_cents
  ) as detail
from public.negotiations n
join public.offers o on o.negotiation_id = n.id and o.organization_id = n.organization_id and o.status = 'proposed'
join public.debts d on d.id = n.debt_id and d.organization_id = n.organization_id
join public.debtors dtr on dtr.id = d.debtor_id and dtr.organization_id = n.organization_id
where n.status = 'offer_pending'
  and o.created_at <= now() - interval '12 hours'
union all
select
  ae.organization_id,
  n.id as negotiation_id,
  'out_of_policy_request'::text as kind,
  dtr.alias as debtor_alias,
  dtr.group_label,
  d.concept,
  ae.created_at as occurred_at,
  ae.payload as detail
from public.audit_events ae
join public.negotiations n on n.id = ae.negotiation_id and n.organization_id = ae.organization_id
join public.debts d on d.id = n.debt_id and d.organization_id = ae.organization_id
join public.debtors dtr on dtr.id = d.debtor_id and dtr.organization_id = ae.organization_id
where ae.type = 'out_of_policy_request'
  and n.status in ('active', 'offer_pending', 'escalated');

revoke all on public.v_dashboard_kpis from public, anon;
revoke all on public.v_monthly_recovery from public, anon;
revoke all on public.v_agreements_by_plan from public, anon;
revoke all on public.v_recent_agreements from public, anon;
revoke all on public.v_attention_items from public, anon;

grant select on public.v_dashboard_kpis to authenticated, service_role;
grant select on public.v_monthly_recovery to authenticated, service_role;
grant select on public.v_agreements_by_plan to authenticated, service_role;
grant select on public.v_recent_agreements to authenticated, service_role;
grant select on public.v_attention_items to authenticated, service_role;
