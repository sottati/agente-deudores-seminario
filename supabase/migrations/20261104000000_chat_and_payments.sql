-- La versión de control también debe cambiar entre updates dentro de la misma
-- transacción. now() solo cambia al iniciar una transacción.
create function public.set_negotiation_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at = greatest(clock_timestamp(), old.updated_at + interval '1 microsecond');
  return new;
end;
$$;
drop trigger negotiations_set_updated_at on public.negotiations;
create trigger negotiations_set_updated_at before update on public.negotiations
  for each row execute function public.set_negotiation_updated_at();

alter table public.negotiations
  add column active_turn_id uuid,
  add column active_turn_expires_at timestamptz,
  add constraint negotiations_turn_lease_complete check ((active_turn_id is null) = (active_turn_expires_at is null));

-- Reserva y mensaje se confirman juntos. El lease recupera un proceso caído;
-- una solicitud explícita de humano puede interrumpir el turno del agente.
create function public.claim_negotiation_turn(
  p_organization_id uuid, p_negotiation_id uuid, p_expected_updated_at timestamptz,
  p_turn_id uuid, p_message_id uuid, p_parts jsonb, p_human_requested boolean
) returns jsonb
language plpgsql security invoker set search_path = '' as $$
declare
  v_negotiation public.negotiations;
begin
  select * into v_negotiation from public.negotiations
  where id = p_negotiation_id and organization_id = p_organization_id for update;
  if not found then return null; end if;
  if v_negotiation.updated_at <> p_expected_updated_at
    or v_negotiation.expires_at <= clock_timestamp()
    or v_negotiation.status not in ('pending','verifying','active','offer_pending')
    or (not p_human_requested and v_negotiation.active_turn_id is not null
      and v_negotiation.active_turn_expires_at > clock_timestamp()) then
    return null;
  end if;

  if exists (select 1 from public.messages where id = p_message_id) then
    if not exists (select 1 from public.messages where id = p_message_id
      and organization_id = p_organization_id and negotiation_id = p_negotiation_id
      and role = 'debtor' and parts = p_parts) then
      raise exception 'El identificador del mensaje ya está en uso.';
    end if;
  else
    insert into public.messages (id, organization_id, negotiation_id, role, parts)
    values (p_message_id, p_organization_id, p_negotiation_id, 'debtor', p_parts);
  end if;

  update public.negotiations set active_turn_id = p_turn_id,
    active_turn_expires_at = clock_timestamp() + interval '5 minutes',
    status = case when p_human_requested then 'escalated'::public.negotiation_status
      when status = 'pending' then 'active'::public.negotiation_status else status end
  where id = p_negotiation_id returning * into v_negotiation;
  return jsonb_build_object('status', v_negotiation.status, 'updated_at', v_negotiation.updated_at);
end;
$$;
revoke all on function public.claim_negotiation_turn(uuid, uuid, timestamptz, uuid, uuid, jsonb, boolean) from public, anon, authenticated;
grant execute on function public.claim_negotiation_turn(uuid, uuid, timestamptz, uuid, uuid, jsonb, boolean) to service_role;

create function public.release_negotiation_turn(
  p_organization_id uuid, p_negotiation_id uuid, p_turn_id uuid
) returns void
language sql security invoker set search_path = '' as $$
  update public.negotiations set active_turn_id = null, active_turn_expires_at = null
  where id = p_negotiation_id and organization_id = p_organization_id and active_turn_id = p_turn_id;
$$;
revoke all on function public.release_negotiation_turn(uuid, uuid, uuid) from public, anon, authenticated;
grant execute on function public.release_negotiation_turn(uuid, uuid, uuid) to service_role;

-- Una misma deuda serializa el cobro de sus cuotas. El cálculo y el pago se
-- confirman juntos; un request tardío no puede restaurar un estado viejo.
create function public.record_installment_payment(
  p_organization_id uuid, p_installment_id uuid, p_paid boolean
) returns void
language plpgsql security invoker set search_path = '' as $$
declare
  v_debt_id uuid;
  v_agreement_id uuid;
begin
  select d.id, a.id into v_debt_id, v_agreement_id
  from public.installments i
  join public.agreements a on a.id = i.agreement_id and a.organization_id = i.organization_id
  join public.offers o on o.id = a.offer_id and o.organization_id = a.organization_id
  join public.negotiations n on n.id = o.negotiation_id and n.organization_id = o.organization_id
  join public.debts d on d.id = n.debt_id and d.organization_id = n.organization_id
  where i.id = p_installment_id and i.organization_id = p_organization_id
  for update of d;
  if not found then
    raise exception 'Cuota no encontrada.' using errcode = 'P0002';
  end if;

  update public.installments set paid_at = case when p_paid then now() else null end
  where id = p_installment_id and organization_id = p_organization_id;

  update public.debts set status = case when not exists (
    select 1 from public.installments
    where agreement_id = v_agreement_id and organization_id = p_organization_id and paid_at is null
  ) then 'paid'::public.debt_status else 'agreed'::public.debt_status end
  where id = v_debt_id and organization_id = p_organization_id;
end;
$$;
revoke all on function public.record_installment_payment(uuid, uuid, boolean) from public, anon;
grant execute on function public.record_installment_payment(uuid, uuid, boolean) to authenticated;

-- El acceso del deudor llega exclusivamente desde debtor-access con service
-- role. La validación del estado, reemplazo de ofertas y transición son atómicos.
create function public.save_negotiation_offer(
  p_organization_id uuid, p_negotiation_id uuid, p_expected_updated_at timestamptz, p_offer jsonb
) returns jsonb
language plpgsql security invoker set search_path = '' as $$
declare
  v_offer_id uuid;
  v_updated_at timestamptz;
begin
  perform 1 from public.negotiations
  where id = p_negotiation_id and organization_id = p_organization_id
    and updated_at = p_expected_updated_at
    and status in ('pending', 'verifying', 'active', 'offer_pending') and expires_at > now()
  for update;
  if not found then
    raise exception 'La negociación ya no permite enviar ofertas.';
  end if;

  update public.offers set status = 'superseded'
  where negotiation_id = p_negotiation_id and organization_id = p_organization_id and status = 'proposed';

  insert into public.offers (
    organization_id, negotiation_id, installments, down_payment_cents,
    waived_interest_cents, total_cents, schedule, status, valid_until, engine_version
  ) values (
    p_organization_id, p_negotiation_id, (p_offer->>'installments')::smallint,
    (p_offer->>'downPaymentCents')::bigint, (p_offer->>'waivedInterestCents')::bigint,
    (p_offer->>'totalCents')::bigint, p_offer->'schedule', 'proposed',
    (p_offer->>'validUntil')::timestamptz, p_offer->>'engineVersion'
  ) returning id into v_offer_id;

  update public.negotiations set status = 'offer_pending' where id = p_negotiation_id returning updated_at into v_updated_at;
  return jsonb_build_object('id', v_offer_id, 'updated_at', v_updated_at);
end;
$$;
revoke all on function public.save_negotiation_offer(uuid, uuid, timestamptz, jsonb) from public, anon, authenticated;
grant execute on function public.save_negotiation_offer(uuid, uuid, timestamptz, jsonb) to service_role;

-- El agente solo guarda la respuesta si conserva el control del turno. Un
-- takeover/cancelación que gana el lock invalida tanto el texto como su metadata.
create function public.persist_negotiation_response(
  p_organization_id uuid, p_negotiation_id uuid, p_expected_updated_at timestamptz,
  p_allow_escalated boolean, p_turn_id uuid, p_message_id uuid, p_parts jsonb
) returns jsonb
language plpgsql security invoker set search_path = '' as $$
declare
  v_negotiation public.negotiations;
begin
  select * into v_negotiation from public.negotiations
  where id = p_negotiation_id and organization_id = p_organization_id for update;
  if not found then return jsonb_build_object('status', 'expired', 'persisted', false); end if;
  if v_negotiation.expires_at <= clock_timestamp() then
    return jsonb_build_object('status', 'expired', 'persisted', false);
  end if;
  if v_negotiation.updated_at <> p_expected_updated_at
    or v_negotiation.active_turn_id is distinct from p_turn_id
    or v_negotiation.active_turn_expires_at <= clock_timestamp()
    or not (v_negotiation.status in ('pending','verifying','active','offer_pending')
      or (p_allow_escalated and v_negotiation.status = 'escalated')) then
    return jsonb_build_object('status', v_negotiation.status, 'persisted', false);
  end if;
  insert into public.messages (id, organization_id, negotiation_id, role, parts)
  values (p_message_id, p_organization_id, p_negotiation_id, 'agent', p_parts);
  return jsonb_build_object('status', v_negotiation.status, 'persisted', true);
end;
$$;
revoke all on function public.persist_negotiation_response(uuid, uuid, timestamptz, boolean, uuid, uuid, jsonb) from public, anon, authenticated;
grant execute on function public.persist_negotiation_response(uuid, uuid, timestamptz, boolean, uuid, uuid, jsonb) to service_role;
