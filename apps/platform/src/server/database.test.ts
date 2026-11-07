import { readFile } from "node:fs/promises"
import { PGlite } from "@electric-sql/pglite"
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "vitest"

const org = "11111111-1111-4111-8111-111111111111"
const otherOrg = "11111111-1111-4111-8111-111111111112"
const user = "22222222-2222-4222-8222-222222222222"
const otherUser = "22222222-2222-4222-8222-222222222223"
const debt = "de000000-0000-4000-8000-000000000001"
const negotiation = "a0000000-0000-4000-8000-000000000001"
const installment1 = "b0000000-0000-4000-8000-000000000001"
const installment2 = "b0000000-0000-4000-8000-000000000002"
let db: PGlite

async function actor(id: string, role = "authenticated") {
  await db.exec(`set local role ${role}`)
  await db.query("select set_config('request.jwt.claim.sub', $1, true)", [id])
}
async function version() {
  const result = await db.query<{ version: string }>(
    "select updated_at::text as version from public.negotiations where id=$1",
    [negotiation]
  )
  return result.rows[0].version
}
const turnId = "50000000-0000-4000-8000-000000000001"
const debtorMessageId = "60000000-0000-4000-8000-000000000001"
async function claimTurn(
  expected?: string,
  owner = turnId,
  messageId = debtorMessageId,
  human = false
) {
  const result = await db.query<{
    result: { status: string; updated_at: string } | null
  }>("select public.claim_negotiation_turn($1,$2,$3,$4,$5,$6,$7) as result", [
    org,
    negotiation,
    expected ?? (await version()),
    owner,
    messageId,
    [{ type: "text", text: "Hola" }],
    human,
  ])
  return result.rows[0].result
}
async function saveOffer(offer: typeof validOffer) {
  return db.query("select public.save_negotiation_offer($1,$2,$3,$4)", [
    org,
    negotiation,
    await version(),
    offer,
  ])
}
async function debtStatus() {
  const result = await db.query<{ status: string }>(
    "select status from public.debts where id = $1",
    [debt]
  )
  return result.rows[0]?.status
}
const validOffer = {
  installments: 2,
  downPaymentCents: 5000,
  waivedInterestCents: 0,
  totalCents: 10000,
  schedule: [
    { number: 1, due_date: "2027-01-01", amount_cents: 5000 },
    { number: 2, due_date: "2027-02-01", amount_cents: 5000 },
  ],
  validUntil: "2030-01-01T00:00:00Z",
  engineVersion: "test",
}

describe("migraciones y RPCs con PostgreSQL embebido", () => {
  beforeAll(async () => {
    db = new PGlite()
    await db.exec(`
      create role anon; create role authenticated; create role service_role bypassrls;
      create schema auth; create table auth.users (id uuid primary key);
      create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
      grant usage on schema auth, public to authenticated, anon, service_role;
      alter default privileges in schema public grant all on tables to service_role;
    `)
    await db.exec(
      await readFile(
        new URL(
          "../../../../supabase/migrations/20261022000929_init_schema.sql",
          import.meta.url
        ),
        "utf8"
      )
    )
    await db.exec(
      await readFile(
        new URL(
          "../../../../supabase/migrations/20261104000000_chat_and_payments.sql",
          import.meta.url
        ),
        "utf8"
      )
    )
    await db.exec(`
      insert into auth.users values ('${user}'), ('${otherUser}');
      insert into public.organizations (id,name,kind,display_name_for_debtors) values ('${org}','A','consorcio','A'), ('${otherOrg}','B','consorcio','B');
      insert into public.memberships (user_id,organization_id) values ('${user}','${org}'), ('${otherUser}','${otherOrg}');
      insert into public.debtors (id,organization_id,full_name,alias) values ('d0000000-0000-4000-8000-000000000001','${org}','Persona','Unidad');
      insert into public.debts (id,organization_id,debtor_id,concept,principal_cents,due_date,status) values ('${debt}','${org}','d0000000-0000-4000-8000-000000000001','Expensas',10000,'2026-01-01','agreed');
      insert into public.negotiations (id,organization_id,debt_id,status,policy_snapshot,token_hash,expires_at,created_by) values ('${negotiation}','${org}','${debt}','agreed','{}','token','2030-01-01','${user}');
      insert into public.offers (id,organization_id,negotiation_id,installments,total_cents,schedule,status,valid_until,engine_version) values ('f0000000-0000-4000-8000-000000000001','${org}','${negotiation}',2,10000,'[]','accepted','2030-01-01','test');
      insert into public.agreements (id,organization_id,offer_id,transcript_sha256,template_version) values ('c0000000-0000-4000-8000-000000000001','${org}','f0000000-0000-4000-8000-000000000001','test','test');
      insert into public.installments (id,organization_id,agreement_id,number,due_date,amount_cents) values ('${installment1}','${org}','c0000000-0000-4000-8000-000000000001',1,'2027-01-01',5000), ('${installment2}','${org}','c0000000-0000-4000-8000-000000000001',2,'2027-02-01',5000);
    `)
  }, 30_000)
  beforeEach(async () => {
    await db.exec("begin")
  })
  afterEach(async () => {
    await db.exec("rollback")
  })
  afterAll(async () => {
    await db.close()
  })

  it("registra pagos y desmarcaciones conservando el estado real de la deuda", async () => {
    await actor(user)
    await db.query("select public.record_installment_payment($1,$2,true)", [
      org,
      installment1,
    ])
    expect(await debtStatus()).toBe("agreed")
    await db.query("select public.record_installment_payment($1,$2,true)", [
      org,
      installment2,
    ])
    expect(await debtStatus()).toBe("paid")
    await db.query("select public.record_installment_payment($1,$2,false)", [
      org,
      installment1,
    ])
    expect(await debtStatus()).toBe("agreed")
  })

  it("RLS impide cobrar cuotas de otra organización", async () => {
    await actor(otherUser)
    await expect(
      db.query("select public.record_installment_payment($1,$2,true)", [
        org,
        installment1,
      ])
    ).rejects.toThrow("Cuota no encontrada")
  })

  it("authenticated no puede invocar el guardado de ofertas con service role", async () => {
    await actor(user)
    await expect(saveOffer(validOffer)).rejects.toThrow("permission denied")
  })

  it("guarda ofertas desde pending y reemplaza la anterior en una sola operación", async () => {
    await db.exec(
      `update public.negotiations set status='pending' where id='${negotiation}'`
    )
    await actor(user, "service_role")
    await saveOffer(validOffer)
    await saveOffer(validOffer)
    const offers = await db.query<{ status: string }>(
      "select status from public.offers where status in ('proposed','superseded') order by status"
    )
    expect(offers.rows.map((row) => row.status)).toEqual([
      "proposed",
      "superseded",
    ])
    const state = await db.query<{ status: string }>(
      "select status from public.negotiations where id=$1",
      [negotiation]
    )
    expect(state.rows[0]?.status).toBe("offer_pending")
  })

  it.each(["escalated", "expired", "locked", "agreed"])(
    "no crea ofertas en %s",
    async (status) => {
      await db.query("update public.negotiations set status=$1 where id=$2", [
        status,
        negotiation,
      ])
      await actor(user, "service_role")
      await expect(saveOffer(validOffer)).rejects.toThrow("ya no permite")
    }
  )

  it("revierte el reemplazo de la propuesta si la nueva oferta falla", async () => {
    await db.exec(
      `update public.negotiations set status='pending' where id='${negotiation}'`
    )
    await actor(user, "service_role")
    await saveOffer(validOffer)
    await db.exec("savepoint invalid_offer")
    await expect(saveOffer({ ...validOffer, totalCents: 0 })).rejects.toThrow()
    await db.exec("rollback to invalid_offer")
    const offers = await db.query<{ status: string }>(
      "select status from public.offers where status='proposed'"
    )
    expect(offers.rows).toHaveLength(1)
  })

  it("un takeover invalida la versión del turno y no permite guardar la respuesta vieja", async () => {
    await db.exec(
      `update public.negotiations set status='pending' where id='${negotiation}'`
    )
    await claimTurn()
    const previous = await version()
    await db.exec(
      `update public.negotiations set status='escalated' where id='${negotiation}'`
    )
    await actor(user, "service_role")
    const result = await db.query<{
      result: { status: string; persisted: boolean }
    }>(
      "select public.persist_negotiation_response($1,$2,$3,true,$4,$5,$6) as result",
      [
        org,
        negotiation,
        previous,
        turnId,
        "30000000-0000-4000-8000-000000000001",
        [{ type: "text", text: "Respuesta vieja" }],
      ]
    )
    expect(result.rows[0]?.result).toEqual({
      status: "escalated",
      persisted: false,
    })
    expect(
      (await db.query("select * from public.messages where role='agent'")).rows
    ).toHaveLength(0)
  })

  it("dos requests con la misma versión reservan un solo turno y un solo mensaje", async () => {
    await db.exec(
      `update public.negotiations set status='pending' where id='${negotiation}'`
    )
    await actor(user, "service_role")
    const previous = await version()
    const claims = await Promise.all([
      claimTurn(previous),
      claimTurn(
        previous,
        "50000000-0000-4000-8000-000000000002",
        "60000000-0000-4000-8000-000000000002"
      ),
    ])
    expect(claims.filter(Boolean)).toHaveLength(1)
    expect(
      (await db.query("select * from public.messages where role='debtor'")).rows
    ).toHaveLength(1)
    expect(
      await claimTurn(
        undefined,
        "50000000-0000-4000-8000-000000000003",
        "60000000-0000-4000-8000-000000000003"
      )
    ).toBeNull()
  })

  it("un reintento con el mismo ID no duplica la fila y un release viejo no libera un turno nuevo", async () => {
    await db.exec(
      `update public.negotiations set status='pending' where id='${negotiation}'`
    )
    await actor(user, "service_role")
    await claimTurn()
    await db.query("select public.release_negotiation_turn($1,$2,$3)", [
      org,
      negotiation,
      turnId,
    ])
    const newTurn = "50000000-0000-4000-8000-000000000002"
    expect(await claimTurn(undefined, newTurn)).not.toBeNull()
    await db.query("select public.release_negotiation_turn($1,$2,$3)", [
      org,
      negotiation,
      turnId,
    ])
    expect(
      (await db.query("select * from public.messages where role='debtor'")).rows
    ).toHaveLength(1)
    expect(await claimTurn()).toBeNull()
  })

  it("el pedido de humano interrumpe el turno reservado y cambia el estado en la misma transacción", async () => {
    await db.exec(
      `update public.negotiations set status='pending' where id='${negotiation}'`
    )
    await actor(user, "service_role")
    await claimTurn()
    const result = await claimTurn(
      undefined,
      "50000000-0000-4000-8000-000000000002",
      "60000000-0000-4000-8000-000000000002",
      true
    )
    expect(result?.status).toBe("escalated")
  })

  it("conserva la confirmación de una derivación propia con la versión correcta", async () => {
    await db.exec(
      `update public.negotiations set status='pending' where id='${negotiation}'`
    )
    await claimTurn()
    await db.exec(
      `update public.negotiations set status='escalated' where id='${negotiation}'`
    )
    await actor(user, "service_role")
    const result = await db.query<{
      result: { status: string; persisted: boolean }
    }>(
      "select public.persist_negotiation_response($1,$2,$3,true,$4,$5,$6) as result",
      [
        org,
        negotiation,
        await version(),
        turnId,
        "30000000-0000-4000-8000-000000000001",
        [{ type: "text", text: "Derivado" }],
      ]
    )
    expect(result.rows[0]?.result).toEqual({
      status: "escalated",
      persisted: true,
    })
    expect(
      (await db.query("select * from public.messages where role='agent'")).rows
    ).toHaveLength(1)
  })
})
