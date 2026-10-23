-- Esquema inicial de pacta.ia (PLAN_BACKEND §4).
--
-- Convenciones:
--   * Montos en centavos (bigint), porcentajes enteros 0–100.
--   * Todas las tablas de negocio llevan organization_id: el RLS filtra por esa
--     columna sin joins, y las FKs compuestas (id, organization_id) impiden
--     relacionar filas de organizaciones distintas.
--   * El rol `authenticated` (admins) solo recibe los privilegios que necesita el
--     panel. Ofertas y acuerdos los crea el servidor (service role / RPC), nunca
--     el navegador.

-- ---------------------------------------------------------------------------
-- Tipos
-- ---------------------------------------------------------------------------

create type public.organization_kind as enum ('consorcio', 'colegio');
create type public.agent_tone as enum ('empatico_formal', 'empatico_cercano', 'neutral');
create type public.debt_status as enum ('open', 'in_negotiation', 'agreed', 'paid', 'written_off');
create type public.negotiation_status as enum (
  'pending', 'verifying', 'active', 'offer_pending', 'escalated', 'agreed', 'expired', 'locked'
);
create type public.negotiation_channel as enum ('web_sim');
create type public.message_role as enum ('debtor', 'agent', 'admin', 'system');
create type public.offer_status as enum ('proposed', 'superseded', 'accepted', 'expired');

-- ---------------------------------------------------------------------------
-- Tablas
-- ---------------------------------------------------------------------------

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  kind public.organization_kind not null,
  display_name_for_debtors text not null check (char_length(display_name_for_debtors) between 1 and 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.memberships (
  user_id uuid not null references auth.users (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, organization_id)
);
create index memberships_organization_id_idx on public.memberships (organization_id);

-- Una política por organización (PLAN_BACKEND D5). Cada negociación guarda un
-- snapshot al crearse, así que editarla no afecta negociaciones en curso.
create table public.negotiation_policies (
  organization_id uuid primary key references public.organizations (id) on delete cascade,
  max_installments smallint not null default 3 check (max_installments between 1 and 24),
  min_down_payment_pct smallint not null default 20 check (min_down_payment_pct between 0 and 100),
  min_installment_amount_cents bigint not null default 2000000 check (min_installment_amount_cents >= 0),
  max_interest_waiver_pct smallint not null default 50 check (max_interest_waiver_pct between 0 and 100),
  single_payment_interest_waiver_pct smallint not null default 100 check (single_payment_interest_waiver_pct between 0 and 100),
  max_principal_discount_pct smallint not null default 0 check (max_principal_discount_pct between 0 and 100),
  max_first_due_days smallint not null default 15 check (max_first_due_days between 1 and 90),
  offer_validity_hours smallint not null default 72 check (offer_validity_hours between 1 and 720),
  escalate_above_amount_cents bigint check (escalate_above_amount_cents > 0),
  tone public.agent_tone not null default 'empatico_formal',
  custom_instructions text check (char_length(custom_instructions) <= 500),
  updated_at timestamptz not null default now()
);

create table public.debtors (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  full_name text not null check (char_length(full_name) between 1 and 120),
  -- Identificador que ve el LLM en lugar del nombre (minimización de PII).
  alias text not null check (char_length(alias) between 1 and 60),
  group_label text check (char_length(group_label) <= 120),
  email text check (char_length(email) <= 254),
  phone text check (char_length(phone) <= 40),
  -- sha256("<debtor_id>:<últimos 3 dígitos del DNI>"). No se guarda el DNI.
  verification_hash text,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, organization_id)
);
create index debtors_organization_id_idx on public.debtors (organization_id);

create table public.debts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  debtor_id uuid not null,
  concept text not null check (char_length(concept) between 1 and 200),
  principal_cents bigint not null check (principal_cents > 0),
  interest_cents bigint not null default 0 check (interest_cents >= 0),
  due_date date not null,
  status public.debt_status not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, organization_id),
  foreign key (debtor_id, organization_id) references public.debtors (id, organization_id) on delete cascade
);
create index debts_organization_id_status_idx on public.debts (organization_id, status);
create index debts_debtor_id_idx on public.debts (debtor_id);

create table public.negotiations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  debt_id uuid not null,
  status public.negotiation_status not null default 'pending',
  policy_snapshot jsonb not null,
  -- sha256 del token del link. El token en claro solo se muestra al crearlo.
  token_hash text not null unique,
  verified_at timestamptz,
  verification_attempts smallint not null default 0,
  expires_at timestamptz not null,
  channel public.negotiation_channel not null default 'web_sim',
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, organization_id),
  foreign key (debt_id, organization_id) references public.debts (id, organization_id) on delete cascade
);
create index negotiations_organization_id_status_idx on public.negotiations (organization_id, status);
create index negotiations_debt_id_idx on public.negotiations (debt_id);
-- Una sola negociación abierta por deuda.
create unique index negotiations_one_open_per_debt_idx on public.negotiations (debt_id)
  where status not in ('agreed', 'expired', 'locked');

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  negotiation_id uuid not null,
  role public.message_role not null,
  -- Partes en formato UIMessage del AI SDK.
  parts jsonb not null,
  created_at timestamptz not null default now(),
  foreign key (negotiation_id, organization_id) references public.negotiations (id, organization_id) on delete cascade
);
create index messages_negotiation_id_created_at_idx on public.messages (negotiation_id, created_at);
create index messages_organization_id_idx on public.messages (organization_id);

create table public.offers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  negotiation_id uuid not null,
  installments smallint not null check (installments between 1 and 24),
  down_payment_cents bigint not null default 0 check (down_payment_cents >= 0),
  waived_interest_cents bigint not null default 0 check (waived_interest_cents >= 0),
  total_cents bigint not null check (total_cents > 0),
  -- [{ "number": 1, "due_date": "2026-11-05", "amount_cents": 6213300 }, ...]
  schedule jsonb not null,
  status public.offer_status not null default 'proposed',
  valid_until timestamptz not null,
  engine_version text not null,
  created_at timestamptz not null default now(),
  unique (id, organization_id),
  foreign key (negotiation_id, organization_id) references public.negotiations (id, organization_id) on delete cascade
);
create index offers_negotiation_id_idx on public.offers (negotiation_id);
create index offers_organization_id_idx on public.offers (organization_id);

create table public.agreements (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  offer_id uuid not null unique,
  accepted_at timestamptz not null default now(),
  acceptance_ip text,
  user_agent text,
  transcript_sha256 text not null,
  document_html text,
  template_version text not null,
  created_at timestamptz not null default now(),
  unique (id, organization_id),
  foreign key (offer_id, organization_id) references public.offers (id, organization_id) on delete cascade
);
create index agreements_organization_id_accepted_at_idx on public.agreements (organization_id, accepted_at desc);

create table public.installments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  agreement_id uuid not null,
  number smallint not null check (number >= 1),
  due_date date not null,
  amount_cents bigint not null check (amount_cents > 0),
  paid_at timestamptz,
  unique (agreement_id, number),
  foreign key (agreement_id, organization_id) references public.agreements (id, organization_id) on delete cascade
);
create index installments_organization_id_idx on public.installments (organization_id);

create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  negotiation_id uuid,
  -- out_of_policy_request, escalated, guardrail_violation, offer_proposed,
  -- admin_takeover, returned_to_agent, negotiation_created, ...
  type text not null,
  payload jsonb not null default '{}',
  actor_user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  foreign key (negotiation_id, organization_id) references public.negotiations (id, organization_id) on delete cascade
);
create index audit_events_organization_id_created_at_idx on public.audit_events (organization_id, created_at desc);
create index audit_events_negotiation_id_idx on public.audit_events (negotiation_id);

-- ---------------------------------------------------------------------------
-- updated_at
-- ---------------------------------------------------------------------------

create function public.set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger organizations_set_updated_at before update on public.organizations
  for each row execute function public.set_updated_at();
create trigger negotiation_policies_set_updated_at before update on public.negotiation_policies
  for each row execute function public.set_updated_at();
create trigger debtors_set_updated_at before update on public.debtors
  for each row execute function public.set_updated_at();
create trigger debts_set_updated_at before update on public.debts
  for each row execute function public.set_updated_at();
create trigger negotiations_set_updated_at before update on public.negotiations
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

-- security definer: consulta memberships sin pasar por su propio RLS.
create function public.is_member(org uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.memberships m
    where m.organization_id = org and m.user_id = (select auth.uid())
  );
$$;
revoke execute on function public.is_member(uuid) from public, anon;
grant execute on function public.is_member(uuid) to authenticated;

alter table public.organizations enable row level security;
alter table public.memberships enable row level security;
alter table public.negotiation_policies enable row level security;
alter table public.debtors enable row level security;
alter table public.debts enable row level security;
alter table public.negotiations enable row level security;
alter table public.messages enable row level security;
alter table public.offers enable row level security;
alter table public.agreements enable row level security;
alter table public.installments enable row level security;
alter table public.audit_events enable row level security;

-- Privilegios explícitos: anon no accede a nada; authenticated solo a lo que usa
-- el panel. service_role (servidor) conserva acceso completo y saltea RLS.
revoke all on all tables in schema public from anon, authenticated;

grant select, update on public.organizations to authenticated;
grant select on public.memberships to authenticated;
grant select, insert, update on public.negotiation_policies to authenticated;
grant select, insert, update on public.debtors to authenticated;
grant select, insert, update on public.debts to authenticated;
grant select, insert on public.negotiations to authenticated;
grant update (status, expires_at) on public.negotiations to authenticated;
grant select, insert on public.messages to authenticated;
grant select on public.offers to authenticated;
grant select on public.agreements to authenticated;
grant select on public.installments to authenticated;
grant update (paid_at) on public.installments to authenticated;
grant select, insert on public.audit_events to authenticated;

create policy organizations_select on public.organizations for select to authenticated
  using (public.is_member(id));
create policy organizations_update on public.organizations for update to authenticated
  using (public.is_member(id)) with check (public.is_member(id));

create policy memberships_select on public.memberships for select to authenticated
  using (user_id = (select auth.uid()));

create policy negotiation_policies_select on public.negotiation_policies for select to authenticated
  using (public.is_member(organization_id));
create policy negotiation_policies_insert on public.negotiation_policies for insert to authenticated
  with check (public.is_member(organization_id));
create policy negotiation_policies_update on public.negotiation_policies for update to authenticated
  using (public.is_member(organization_id)) with check (public.is_member(organization_id));

create policy debtors_select on public.debtors for select to authenticated
  using (public.is_member(organization_id));
create policy debtors_insert on public.debtors for insert to authenticated
  with check (public.is_member(organization_id));
create policy debtors_update on public.debtors for update to authenticated
  using (public.is_member(organization_id)) with check (public.is_member(organization_id));

create policy debts_select on public.debts for select to authenticated
  using (public.is_member(organization_id));
create policy debts_insert on public.debts for insert to authenticated
  with check (public.is_member(organization_id));
create policy debts_update on public.debts for update to authenticated
  using (public.is_member(organization_id)) with check (public.is_member(organization_id));

create policy negotiations_select on public.negotiations for select to authenticated
  using (public.is_member(organization_id));
create policy negotiations_insert on public.negotiations for insert to authenticated
  with check (public.is_member(organization_id) and created_by = (select auth.uid()));
create policy negotiations_update on public.negotiations for update to authenticated
  using (public.is_member(organization_id)) with check (public.is_member(organization_id));

create policy messages_select on public.messages for select to authenticated
  using (public.is_member(organization_id));
-- Desde el panel solo se insertan mensajes del administrador (handoff humano).
create policy messages_insert on public.messages for insert to authenticated
  with check (public.is_member(organization_id) and role = 'admin');

create policy offers_select on public.offers for select to authenticated
  using (public.is_member(organization_id));

create policy agreements_select on public.agreements for select to authenticated
  using (public.is_member(organization_id));

create policy installments_select on public.installments for select to authenticated
  using (public.is_member(organization_id));
create policy installments_update on public.installments for update to authenticated
  using (public.is_member(organization_id)) with check (public.is_member(organization_id));

create policy audit_events_select on public.audit_events for select to authenticated
  using (public.is_member(organization_id));
create policy audit_events_insert on public.audit_events for insert to authenticated
  with check (public.is_member(organization_id) and actor_user_id = (select auth.uid()));
