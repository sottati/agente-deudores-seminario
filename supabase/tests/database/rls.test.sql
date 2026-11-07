-- Aislamiento multi-tenant (PLAN_BACKEND §4, Sprint 3.3). Corre con `pnpm db:test`
-- sobre la base local con el seed aplicado. Todo ocurre en una transacción que se
-- descarta al final.
begin;
create extension if not exists pgtap with schema extensions;
select plan(16);

-- Organización B con su propio usuario y un deudor.
insert into auth.users (instance_id, id, aud, role, email)
values ('00000000-0000-0000-0000-000000000000', '33333333-3333-4333-8333-333333333333', 'authenticated', 'authenticated', 'tesoreria@colegio.test');
insert into public.organizations (id, name, kind, display_name_for_debtors)
values ('44444444-4444-4444-8444-444444444444', 'Colegio Norte', 'colegio', 'Tesorería Colegio Norte');
insert into public.memberships (user_id, organization_id)
values ('33333333-3333-4333-8333-333333333333', '44444444-4444-4444-8444-444444444444');
insert into public.debtors (organization_id, full_name, alias)
values ('44444444-4444-4444-8444-444444444444', 'Familia Pérez', 'Alumno 3°B');

-- ---------------------------------------------------------------------------
-- Usuario de la organización B
-- ---------------------------------------------------------------------------
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"33333333-3333-4333-8333-333333333333","role":"authenticated"}', true);

select is((select count(*)::int from public.organizations), 1, 'B solo ve su organización');
select is((select count(*)::int from public.debtors), 1, 'B solo ve sus deudores');
select is((select count(*)::int from public.debts), 0, 'B no ve deudas de A');
select is((select count(*)::int from public.negotiations), 0, 'B no ve negociaciones de A');
select is((select count(*)::int from public.messages), 0, 'B no ve mensajes de A');
select is((select count(*)::int from public.agreements), 0, 'B no ve acuerdos de A');
select is((select count(*)::int from public.negotiation_policies), 0, 'B no ve la política de A');

select is_empty(
  $$ update public.debtors set full_name = 'x' where organization_id = '11111111-1111-4111-8111-111111111111' returning id $$,
  'B no puede modificar deudores de A'
);
select throws_ok(
  $$ insert into public.debtors (organization_id, full_name, alias) values ('11111111-1111-4111-8111-111111111111', 'x', 'y') $$,
  '42501', null, 'B no puede crear deudores en A'
);
select throws_ok(
  $$ insert into public.debts (organization_id, debtor_id, concept, principal_cents, due_date)
     values ('44444444-4444-4444-8444-444444444444', 'd0000000-0000-4000-8000-000000000001', 'x', 100, current_date) $$,
  '23503', null, 'B no puede colgar una deuda propia de un deudor de A (FK compuesta)'
);

-- ---------------------------------------------------------------------------
-- Usuario de la organización A (demo)
-- ---------------------------------------------------------------------------
select set_config('request.jwt.claims', '{"sub":"22222222-2222-4222-8222-222222222222","role":"authenticated"}', true);

select is((select count(*)::int from public.debtors), 12, 'A ve sus 12 deudores');
select throws_ok(
  $$ insert into public.offers (organization_id, negotiation_id, installments, total_cents, schedule, valid_until, engine_version)
     values ('11111111-1111-4111-8111-111111111111', 'a0000000-0000-4000-8000-000000000001', 1, 100, '[]', now(), 'x') $$,
  '42501', null, 'El panel no puede crear ofertas (solo el servidor)'
);
select throws_ok(
  $$ insert into public.messages (organization_id, negotiation_id, role, parts)
     values ('11111111-1111-4111-8111-111111111111', 'a0000000-0000-4000-8000-000000000001', 'agent', '[]') $$,
  '42501', null, 'El panel no puede insertar mensajes como agente'
);
select throws_ok(
  $$ update public.negotiations set token_hash = 'x' where id = 'a0000000-0000-4000-8000-000000000001' $$,
  '42501', null, 'El panel no puede cambiar el token de una negociación'
);

-- ---------------------------------------------------------------------------
-- Anónimo
-- ---------------------------------------------------------------------------
reset role;
set local role anon;
select throws_ok($$ select * from public.debtors $$, '42501', null, 'anon no puede leer deudores');
select throws_ok($$ select * from public.negotiations $$, '42501', null, 'anon no puede leer negociaciones');

select * from finish();
rollback;
