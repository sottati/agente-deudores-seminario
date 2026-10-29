-- Datos de desarrollo. Se aplican con `pnpm db:reset` después de las migraciones.
--
-- Usuario demo:        demo@pacta.ai / demo1234
-- Verificación deudor: últimos 3 dígitos del DNI = 123 (todos los deudores)
-- Link de desarrollo:  /n/dev-4b  (negociación activa de la Unidad 4B)
--
-- Las fechas son relativas a now() para que el panel siempre tenga actividad reciente.

-- ---------------------------------------------------------------------------
-- Organización, usuario y política
-- ---------------------------------------------------------------------------

insert into public.organizations (id, name, kind, display_name_for_debtors)
values ('11111111-1111-4111-8111-111111111111', 'Consorcios del Sur', 'consorcio', 'Administración Consorcios del Sur');

-- Las columnas de tokens van en '' (no null): GoTrue falla al leer nulls ahí.
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
) values (
  '00000000-0000-0000-0000-000000000000', '22222222-2222-4222-8222-222222222222',
  'authenticated', 'authenticated', 'demo@pacta.ai',
  extensions.crypt('demo1234', extensions.gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}', '{"full_name":"Simon"}', now(), now(),
  '', '', '', ''
);

insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values (
  gen_random_uuid(), '22222222-2222-4222-8222-222222222222', '22222222-2222-4222-8222-222222222222',
  jsonb_build_object('sub', '22222222-2222-4222-8222-222222222222', 'email', 'demo@pacta.ai', 'email_verified', true),
  'email', now(), now(), now()
);

insert into public.memberships (user_id, organization_id)
values ('22222222-2222-4222-8222-222222222222', '11111111-1111-4111-8111-111111111111');

insert into public.negotiation_policies (organization_id, escalate_above_amount_cents)
values ('11111111-1111-4111-8111-111111111111', 100000000);

-- ---------------------------------------------------------------------------
-- Deudores y deudas
-- ---------------------------------------------------------------------------

insert into public.debtors (id, organization_id, full_name, alias, group_label, email, phone, verification_hash)
select
  d.id::uuid, '11111111-1111-4111-8111-111111111111', d.full_name, d.alias, d.group_label,
  d.email, d.phone, encode(extensions.digest(d.id || ':123', 'sha256'), 'hex')
from (values
  ('d0000000-0000-4000-8000-000000000001', 'Marina Gutiérrez',  'Unidad 4B',   'Av. Rivadavia 2840', 'marina.gutierrez@example.com', '+54 11 5555-0101'),
  ('d0000000-0000-4000-8000-000000000002', 'Jorge Benítez',     'Unidad 7A',   'Sarmiento 912',      'jorge.benitez@example.com',    '+54 11 5555-0102'),
  ('d0000000-0000-4000-8000-000000000003', 'Lucía Fernández',   'Unidad 2C',   'México 1456',        'lucia.fernandez@example.com',  '+54 11 5555-0103'),
  ('d0000000-0000-4000-8000-000000000004', 'Pablo Romero',      'Unidad 1A',   'Av. Rivadavia 2840', 'pablo.romero@example.com',     '+54 11 5555-0104'),
  ('d0000000-0000-4000-8000-000000000005', 'Carla Méndez',      'Unidad 3D',   'Av. Rivadavia 2840', 'carla.mendez@example.com',     '+54 11 5555-0105'),
  ('d0000000-0000-4000-8000-000000000006', 'Diego Sosa',        'Unidad 5C',   'Sarmiento 912',      'diego.sosa@example.com',       '+54 11 5555-0106'),
  ('d0000000-0000-4000-8000-000000000007', 'Valeria Acosta',    'Unidad 6B',   'Sarmiento 912',      'valeria.acosta@example.com',   '+54 11 5555-0107'),
  ('d0000000-0000-4000-8000-000000000008', 'Martín Herrera',    'Unidad 8A',   'México 1456',        'martin.herrera@example.com',   '+54 11 5555-0108'),
  ('d0000000-0000-4000-8000-000000000009', 'Florencia Díaz',    'Unidad PB-B', 'México 1456',        'florencia.diaz@example.com',   '+54 11 5555-0109'),
  ('d0000000-0000-4000-8000-000000000010', 'Ricardo Paz',       'Unidad 9C',   'Av. Rivadavia 2840', 'ricardo.paz@example.com',      '+54 11 5555-0110'),
  ('d0000000-0000-4000-8000-000000000011', 'Ana Torres',        'Unidad 2A',   'Sarmiento 912',      'ana.torres@example.com',       '+54 11 5555-0111'),
  ('d0000000-0000-4000-8000-000000000012', 'Gustavo Ríos',      'Unidad 10D',  'México 1456',        'gustavo.rios@example.com',     '+54 11 5555-0112')
) as d (id, full_name, alias, group_label, email, phone);

insert into public.debts (id, organization_id, debtor_id, concept, principal_cents, interest_cents, due_date)
select
  d.id::uuid, '11111111-1111-4111-8111-111111111111', d.debtor_id::uuid, d.concept,
  d.principal_cents, d.interest_cents, (now() - make_interval(days => d.days_overdue))::date
from (values
  ('de000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000001', 'Expensas ordinarias jun–ago 2026',             15800000,  2840000,  95),
  ('de000000-0000-4000-8000-000000000013', 'd0000000-0000-4000-8000-000000000001', 'Expensa extraordinaria impermeabilización',      6400000,        0,  20),
  ('de000000-0000-4000-8000-000000000002', 'd0000000-0000-4000-8000-000000000002', 'Expensas ordinarias ene–mar 2026',              8200000,  2450000, 240),
  ('de000000-0000-4000-8000-000000000003', 'd0000000-0000-4000-8000-000000000003', 'Expensas ordinarias feb–may 2026',             19800000,  3380000, 200),
  ('de000000-0000-4000-8000-000000000004', 'd0000000-0000-4000-8000-000000000004', 'Expensas ordinarias abr–jun 2026',             12000000,  1800000, 160),
  ('de000000-0000-4000-8000-000000000005', 'd0000000-0000-4000-8000-000000000005', 'Expensas ordinarias may–jun 2026',              9650000,  1230000, 130),
  ('de000000-0000-4000-8000-000000000006', 'd0000000-0000-4000-8000-000000000006', 'Expensas ordinarias jun–ago 2026',             14300000,  2160000,  90),
  ('de000000-0000-4000-8000-000000000007', 'd0000000-0000-4000-8000-000000000007', 'Expensas ordinarias may–ago 2026',             21000000,  4000000, 100),
  ('de000000-0000-4000-8000-000000000008', 'd0000000-0000-4000-8000-000000000008', 'Expensas ordinarias jul–sep 2026',             13400000,  1980000,  60),
  ('de000000-0000-4000-8000-000000000009', 'd0000000-0000-4000-8000-000000000009', 'Expensas ordinarias y extraordinarias 2025–26', 125000000, 21000000, 300),
  ('de000000-0000-4000-8000-000000000010', 'd0000000-0000-4000-8000-000000000010', 'Expensas ordinarias ago–sep 2026',              7600000,   910000,  45),
  ('de000000-0000-4000-8000-000000000011', 'd0000000-0000-4000-8000-000000000011', 'Expensas ordinarias jul–ago 2026',              5800000,   740000,  70),
  ('de000000-0000-4000-8000-000000000012', 'd0000000-0000-4000-8000-000000000012', 'Expensas ordinarias jul–sep 2026',             10200000,  1590000,  65)
) as d (id, debtor_id, concept, principal_cents, interest_cents, days_overdue);

-- ---------------------------------------------------------------------------
-- Helpers (solo viven durante el seed)
-- ---------------------------------------------------------------------------

create function pg_temp.seed_negotiation(
  p_id uuid, p_debt uuid, p_status public.negotiation_status, p_created timestamptz, p_token text default null
) returns void language plpgsql as $$
begin
  insert into public.negotiations (
    id, organization_id, debt_id, status, policy_snapshot, token_hash,
    verified_at, expires_at, created_by, created_at
  )
  select
    p_id, p.organization_id, p_debt, p_status,
    to_jsonb(p) - 'organization_id' - 'updated_at',
    encode(extensions.digest(coalesce(p_token, encode(extensions.gen_random_bytes(32), 'hex')), 'sha256'), 'hex'),
    case when p_status in ('pending', 'expired') then null else p_created + interval '20 minutes' end,
    p_created + interval '7 days',
    '22222222-2222-4222-8222-222222222222', p_created
  from public.negotiation_policies p
  where p.organization_id = '11111111-1111-4111-8111-111111111111';

  update public.debts set status = 'in_negotiation' where id = p_debt and p_status <> 'expired';
end;
$$;

create function pg_temp.msg(p_neg uuid, p_role public.message_role, p_text text, p_at timestamptz)
returns void language sql as $$
  insert into public.messages (organization_id, negotiation_id, role, parts, created_at)
  values ('11111111-1111-4111-8111-111111111111', p_neg, p_role,
          jsonb_build_array(jsonb_build_object('type', 'text', 'text', p_text)), p_at);
$$;

create function pg_temp.disclosure(p_neg uuid, p_at timestamptz) returns void language sql as $$
  select pg_temp.msg(p_neg, 'system',
    'Hola, soy el asistente virtual automatizado de pacta.ia en representación de Administración Consorcios del Sur. '
    || 'No soy una persona: si en algún momento preferís hablar con alguien de la administración, escribí "hablar con una persona". '
    || 'Antes de continuar necesito verificar tu identidad.', p_at);
$$;

-- Oferta con cronograma: pago único con quita total de intereses o hasta 3 cuotas
-- con 50 % de quita. El resto del redondeo va a la última cuota.
create function pg_temp.seed_offer(
  p_neg uuid, p_installments int, p_created timestamptz, p_status public.offer_status
) returns uuid language plpgsql as $$
declare
  v_debt public.debts;
  v_offer uuid := gen_random_uuid();
  v_waived bigint;
  v_total bigint;
  v_each bigint;
  v_schedule jsonb := '[]';
begin
  select d.* into v_debt from public.debts d join public.negotiations n on n.debt_id = d.id where n.id = p_neg;
  v_waived := case when p_installments = 1 then v_debt.interest_cents else v_debt.interest_cents / 2 end;
  v_total := v_debt.principal_cents + v_debt.interest_cents - v_waived;
  v_each := v_total / p_installments;

  for i in 1..p_installments loop
    v_schedule := v_schedule || jsonb_build_object(
      'number', i,
      'due_date', (p_created + make_interval(days => 7 + 30 * (i - 1)))::date,
      'amount_cents', case when i = p_installments then v_total - v_each * (p_installments - 1) else v_each end
    );
  end loop;

  insert into public.offers (
    id, organization_id, negotiation_id, installments, down_payment_cents, waived_interest_cents,
    total_cents, schedule, status, valid_until, engine_version, created_at
  ) values (
    v_offer, '11111111-1111-4111-8111-111111111111', p_neg, p_installments, v_each, v_waived,
    v_total, v_schedule, p_status, p_created + interval '72 hours', 'seed', p_created
  );
  return v_offer;
end;
$$;

create function pg_temp.seed_agreement(p_neg uuid, p_installments int, p_accepted timestamptz, p_paid int)
returns void language plpgsql as $$
declare
  v_offer uuid;
  v_agreement uuid := gen_random_uuid();
begin
  v_offer := pg_temp.seed_offer(p_neg, p_installments, p_accepted - interval '10 minutes', 'accepted');

  insert into public.agreements (
    id, organization_id, offer_id, accepted_at, acceptance_ip, user_agent, transcript_sha256, template_version
  ) values (
    v_agreement, '11111111-1111-4111-8111-111111111111', v_offer, p_accepted, '203.0.113.' || (10 + p_installments),
    'Mozilla/5.0 (seed)', encode(extensions.digest(p_neg::text, 'sha256'), 'hex'), 'v1'
  );

  insert into public.installments (organization_id, agreement_id, number, due_date, amount_cents, paid_at)
  select
    '11111111-1111-4111-8111-111111111111', v_agreement, (s ->> 'number')::smallint, (s ->> 'due_date')::date,
    (s ->> 'amount_cents')::bigint,
    case when (s ->> 'number')::int <= p_paid then (s ->> 'due_date')::date - 1 end
  from public.offers o, jsonb_array_elements(o.schedule) s
  where o.id = v_offer;

  update public.negotiations set status = 'agreed' where id = p_neg;
  update public.debts d set status = case when p_paid >= p_installments then 'paid' else 'agreed' end::public.debt_status
  from public.negotiations n where n.id = p_neg and d.id = n.debt_id;

  perform pg_temp.msg(p_neg, 'system', 'El deudor aceptó el plan de pago. Se generó el acta del acuerdo.', p_accepted);
end;
$$;

-- ---------------------------------------------------------------------------
-- Negociaciones
-- ---------------------------------------------------------------------------

do $$
declare
  t timestamptz;
begin
  -- Acuerdos históricos (alimentan métricas y "Acuerdos recientes").
  t := now() - interval '140 days';
  perform pg_temp.seed_negotiation('a0000000-0000-4000-8000-000000000002', 'de000000-0000-4000-8000-000000000002', 'active', t);
  perform pg_temp.disclosure('a0000000-0000-4000-8000-000000000002', t);
  perform pg_temp.seed_agreement('a0000000-0000-4000-8000-000000000002', 1, t + interval '35 minutes', 1);

  t := now() - interval '100 days';
  perform pg_temp.seed_negotiation('a0000000-0000-4000-8000-000000000003', 'de000000-0000-4000-8000-000000000003', 'active', t);
  perform pg_temp.disclosure('a0000000-0000-4000-8000-000000000003', t);
  perform pg_temp.seed_agreement('a0000000-0000-4000-8000-000000000003', 2, t + interval '50 minutes', 2);

  t := now() - interval '70 days';
  perform pg_temp.seed_negotiation('a0000000-0000-4000-8000-000000000004', 'de000000-0000-4000-8000-000000000004', 'active', t);
  perform pg_temp.disclosure('a0000000-0000-4000-8000-000000000004', t);
  perform pg_temp.seed_agreement('a0000000-0000-4000-8000-000000000004', 3, t + interval '1 hour', 3);

  t := now() - interval '40 days';
  perform pg_temp.seed_negotiation('a0000000-0000-4000-8000-000000000005', 'de000000-0000-4000-8000-000000000005', 'active', t);
  perform pg_temp.disclosure('a0000000-0000-4000-8000-000000000005', t);
  perform pg_temp.seed_agreement('a0000000-0000-4000-8000-000000000005', 1, t + interval '25 minutes', 1);

  t := now() - interval '12 days';
  perform pg_temp.seed_negotiation('a0000000-0000-4000-8000-000000000006', 'de000000-0000-4000-8000-000000000006', 'active', t);
  perform pg_temp.disclosure('a0000000-0000-4000-8000-000000000006', t);
  perform pg_temp.seed_agreement('a0000000-0000-4000-8000-000000000006', 2, t + interval '40 minutes', 0);

  t := now() - interval '3 days';
  perform pg_temp.seed_negotiation('a0000000-0000-4000-8000-000000000007', 'de000000-0000-4000-8000-000000000007', 'active', t);
  perform pg_temp.disclosure('a0000000-0000-4000-8000-000000000007', t);
  perform pg_temp.seed_agreement('a0000000-0000-4000-8000-000000000007', 3, t + interval '45 minutes', 0);

  -- Activa: link de desarrollo /n/dev-4b.
  t := now() - interval '2 hours';
  perform pg_temp.seed_negotiation('a0000000-0000-4000-8000-000000000001', 'de000000-0000-4000-8000-000000000001', 'active', t, 'dev-4b');
  perform pg_temp.disclosure('a0000000-0000-4000-8000-000000000001', t);
  perform pg_temp.msg('a0000000-0000-4000-8000-000000000001', 'debtor', 'Hola, quería ver cómo puedo regularizar lo que debo.', t + interval '25 minutes');
  perform pg_temp.msg('a0000000-0000-4000-8000-000000000001', 'agent', 'Gracias por escribir. Tenés expensas pendientes de junio a agosto. Puedo ofrecerte pagarlas en un único pago con quita total de intereses o en hasta 3 cuotas. ¿Qué opción te resulta más cómoda?', t + interval '26 minutes');

  -- Oferta pendiente de aceptación.
  t := now() - interval '20 hours';
  perform pg_temp.seed_negotiation('a0000000-0000-4000-8000-000000000008', 'de000000-0000-4000-8000-000000000008', 'offer_pending', t);
  perform pg_temp.disclosure('a0000000-0000-4000-8000-000000000008', t);
  perform pg_temp.msg('a0000000-0000-4000-8000-000000000008', 'debtor', '¿Lo puedo pagar en dos veces?', t + interval '30 minutes');
  perform pg_temp.seed_offer('a0000000-0000-4000-8000-000000000008', 2, t + interval '31 minutes', 'proposed');
  perform pg_temp.msg('a0000000-0000-4000-8000-000000000008', 'agent', 'Sí. Te dejé la propuesta de 2 cuotas con el detalle del cronograma. Si te sirve, podés aceptarla con el botón.', t + interval '31 minutes');

  -- Escalada: pidió un plan fuera de política y luego una persona.
  t := now() - interval '18 hours';
  perform pg_temp.seed_negotiation('a0000000-0000-4000-8000-000000000009', 'de000000-0000-4000-8000-000000000009', 'escalated', t);
  perform pg_temp.disclosure('a0000000-0000-4000-8000-000000000009', t);
  perform pg_temp.msg('a0000000-0000-4000-8000-000000000009', 'debtor', 'Necesito pagarlo en 12 cuotas, no llego de otra forma.', t + interval '22 minutes');
  perform pg_temp.msg('a0000000-0000-4000-8000-000000000009', 'agent', 'Entiendo tu situación. Con las condiciones vigentes puedo ofrecerte hasta 3 cuotas. Si querés, también puedo derivarte con la administración.', t + interval '23 minutes');
  perform pg_temp.msg('a0000000-0000-4000-8000-000000000009', 'debtor', 'Quiero hablar con una persona.', t + interval '25 minutes');
  perform pg_temp.msg('a0000000-0000-4000-8000-000000000009', 'system', 'Derivamos la conversación a la administración. Te van a responder por este mismo chat.', t + interval '25 minutes');

  insert into public.audit_events (organization_id, negotiation_id, type, payload, created_at) values
    ('11111111-1111-4111-8111-111111111111', 'a0000000-0000-4000-8000-000000000009', 'out_of_policy_request',
     '{"requested_installments": 12, "max_installments": 3}', t + interval '23 minutes'),
    ('11111111-1111-4111-8111-111111111111', 'a0000000-0000-4000-8000-000000000009', 'escalated',
     '{"reason": "debtor_requested_human"}', t + interval '25 minutes');

  -- Link enviado y todavía no abierto.
  t := now() - interval '1 day';
  perform pg_temp.seed_negotiation('a0000000-0000-4000-8000-000000000010', 'de000000-0000-4000-8000-000000000010', 'pending', t);

  -- Link vencido sin respuesta.
  t := now() - interval '15 days';
  perform pg_temp.seed_negotiation('a0000000-0000-4000-8000-000000000011', 'de000000-0000-4000-8000-000000000011', 'expired', t);

  insert into public.audit_events (organization_id, negotiation_id, type, payload, actor_user_id, created_at)
  select organization_id, id, 'negotiation_created', '{}', created_by, created_at from public.negotiations;
end;
$$;
