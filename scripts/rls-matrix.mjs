import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const PROJECT_REF = 'eeqhqsteeobegaekynse';
const SUITE = 'test-rls';
const LISTING_COLUMNS =
  '(seller_id, status, slug, brand, model, year, price_clp, mileage_km, fuel, transmission, color, region, commune, description, contact_name, contact_phone, contact_email, terms_accepted_version, photo_paths, created_at)';

function loadLocalEnv() {
  try {
    const content = readFileSync(join(root, '.env'), 'utf8');
    for (const line of content.split('\n')) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (!match || process.env[match[1]] !== undefined) continue;
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, '');
    }
  } catch {
    return;
  }
}

class ExpectationError extends Error {}

function assert(condition, message) {
  if (!condition) throw new ExpectationError(message);
}

function extractError(text) {
  try {
    const parsed = JSON.parse(text);
    return String(parsed.message || text).replace('Failed to run sql query: ', '').replace(/\s+/g, ' ').trim();
  } catch {
    return String(text).replace(/\s+/g, ' ').trim();
  }
}

async function managementQuery(sql) {
  const response = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.SUPABASE_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  });
  const text = await response.text();
  if (!response.ok) throw new Error(extractError(text));
  return text ? JSON.parse(text) : [];
}

async function managementGet(path) {
  const response = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}${path}`, {
    headers: { Authorization: `Bearer ${process.env.SUPABASE_ACCESS_TOKEN}` },
  });
  const text = await response.text();
  if (!response.ok) throw new Error(extractError(text));
  return text ? JSON.parse(text) : null;
}

let serviceKey = '';

async function gotrue(method, path, body) {
  const response = await fetch(`https://${PROJECT_REF}.supabase.co/auth/v1${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${serviceKey}`,
      apikey: serviceKey,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`${method} ${path} -> ${extractError(text)}`);
  return text ? JSON.parse(text) : null;
}

async function expectRejected(sql, pattern) {
  try {
    await managementQuery(sql);
  } catch (error) {
    if (pattern && !pattern.test(error.message)) {
      throw new ExpectationError(`rechazado, pero con otro mensaje: ${error.message}`);
    }
    return error.message.slice(0, 120);
  }
  throw new ExpectationError('la operación no fue rechazada');
}

const results = [];

async function check(section, name, fn) {
  try {
    const detail = await fn();
    results.push({ section, name, ok: true, detail: detail || 'OK' });
  } catch (error) {
    results.push({ section, name, ok: false, detail: String(error.message).slice(0, 140) });
  }
}

const createdUsers = [];

async function createUser(label) {
  const email = `${SUITE}-${label}-${randomUUID().slice(0, 8)}@example.com`;
  const user = await gotrue('POST', '/admin/users', {
    email,
    email_confirm: true,
    password: randomUUID(),
  });
  const entry = { id: user.id, email, label };
  createdUsers.push(entry);
  return entry;
}

function claimsFor(user, withEmail = true) {
  const claims = { sub: user.id, role: 'authenticated' };
  if (withEmail) claims.email = user.email;
  return claims;
}

function asRole(role, claims, body) {
  return `set local role ${role}; set local request.jwt.claims = '${JSON.stringify(claims)}'; ${body}`;
}

function listingTuple({ sellerId, slug, status = 'pending', contactEmail, photoOwner, createdAgo = null }) {
  const photos = `array['${photoOwner || sellerId}/foto.jpg']`;
  const createdAt = createdAgo ? `now() - interval '${createdAgo}'` : 'now()';
  return `('${sellerId}', '${status}', '${slug}', 'Toyota', 'Corolla', 2020, 8500000, 65000,
    'gasolina', 'automatica', 'Blanco', 'Metropolitana', 'Santiago',
    'Descripcion de prueba con mas de veinte caracteres para el aviso.',
    'Vendedor Test', '+56912345678', '${contactEmail}', '1.1', ${photos}, ${createdAt})`;
}

function insertListing({ seller, claims, tuple, returning = 'status::text as status', extra = '' }) {
  const suffix = returning ? ` returning ${returning}` : '';
  return asRole('authenticated', claims, `insert into public.used_listings ${LISTING_COLUMNS} values ${tuple}${suffix}; ${extra}`);
}

function selectAs(role, claims, body) {
  return asRole(role, claims, body);
}

function approveSql(mod, slug) {
  return asRole(
    'authenticated',
    claimsFor(mod),
    `update public.used_listings set status = 'active', published_at = now(), expires_at = now() + interval '60 days'
     where slug = '${slug}' returning status::text as status;`,
  );
}

function statusOf(slug) {
  return `select status::text as status from public.used_listings where slug = '${slug}';`;
}

const slugSuffix = randomUUID().slice(0, 8);
const slugs = {
  listingA: `test-rls-a-${slugSuffix}`,
  guest: `test-rls-g-${slugSuffix}`,
  daily: Array.from({ length: 6 }, (_, index) => `test-rls-dia-${index + 1}-${slugSuffix}`),
  active: `test-rls-act-${slugSuffix}`,
  e2e: `test-rls-e2e-${slugSuffix}`,
  photo: `test-rls-foto-${slugSuffix}`,
  forceActive: `test-rls-force-${slugSuffix}`,
  guestForced: `test-rls-gforce-${slugSuffix}`,
};

async function cleanup() {
  const notes = [];
  const ids = createdUsers.map((user) => `'${user.id}'`).join(', ');
  if (ids) {
    const deleted = await managementQuery(
      `delete from public.used_listings where seller_id in (${ids}); delete from public.listing_reports where reporter_id in (${ids});`,
    );
    notes.push(`avisos y reportes de prueba borrados${JSON.stringify(deleted)}`);
  }

  const existing = await gotrue('GET', '/admin/users?page=1&per_page=200').catch(() => null);
  if (existing && Array.isArray(existing.users)) {
    const orphans = existing.users.filter(
      (user) =>
        typeof user.email === 'string' &&
        (user.email.startsWith(`${SUITE}-`) || user.email.startsWith('test-limite-')) &&
        !createdUsers.some((entry) => entry.id === user.id),
    );
    for (const orphan of orphans) await gotrue('DELETE', `/admin/users/${orphan.id}`);
    if (orphans.length) notes.push(`${orphans.length} usuarios huérfanos de corridas anteriores borrados`);
  }

  for (const user of createdUsers) await gotrue('DELETE', `/admin/users/${user.id}`);
  notes.push(`${createdUsers.length} usuarios de prueba borrados`);

  if (ids) {
    const verify = await managementQuery(`
      select
        (select count(*) from auth.users where id in (${ids}))::int as users,
        (select count(*) from auth.identities where user_id in (${ids}))::int as identities,
        (select count(*) from public.profiles where id in (${ids}))::int as profiles,
        (select count(*) from private.user_roles where user_id in (${ids}))::int as roles,
        (select count(*) from public.used_listings where seller_id in (${ids}))::int as listings;`);
    const row = verify[0];
    const total = row.users + row.identities + row.profiles + row.roles + row.listings;
    assert(total === 0, `quedaron filas tras la limpieza: ${JSON.stringify(row)}`);
    notes.push(`0 filas en auth.users, auth.identities, profiles, private.user_roles y used_listings`);
  }

  const leftover = await managementQuery(
    `select count(*)::int as leftover from public.used_listings where slug like 'test-%';`,
  );
  assert(leftover[0].leftover === 0, `quedaron ${leftover[0].leftover} avisos de prueba`);
  notes.push('0 avisos de prueba en used_listings');
  return notes.join(' · ');
}

function printResults(cleanupDetail, cleanupError) {
  console.log('');
  let lastSection = '';
  for (const result of results) {
    if (result.section !== lastSection) {
      console.log(`\n${result.section}`);
      lastSection = result.section;
    }
    console.log(`  ${result.ok ? 'PASS' : 'FAIL'}  ${result.name}`);
    console.log(`        ${result.detail}`);
  }
  const passed = results.filter((result) => result.ok).length;
  console.log(`\nResultado: ${passed}/${results.length} pruebas pasaron.`);
  console.log(`Limpieza: ${cleanupDetail}`);
  if (cleanupError) console.log(`Limpieza con errores: ${cleanupError}`);
}

async function main() {
  loadLocalEnv();
  if (!process.env.SUPABASE_ACCESS_TOKEN) {
    console.error('Falta SUPABASE_ACCESS_TOKEN (ponlo en .env).');
    process.exit(1);
  }

  const keys = await managementGet('/api-keys');
  serviceKey = keys.find((key) => key.name === 'service_role').api_key;

  const sellerA = await createUser('a');
  const sellerB = await createUser('b');
  const moderator = await createUser('mod');
  const guest = await createUser('guest');
  const dailySeller = await createUser('daily');
  const activeSeller = await createUser('active');

  await managementQuery(
    `insert into private.user_roles (user_id, role) values ('${moderator.id}', 'moderator')
     on conflict (user_id) do update set role = excluded.role;`,
  );

  const anonClaims = { role: 'anon' };
  const claimsA = claimsFor(sellerA);
  const claimsB = claimsFor(sellerB);
  const claimsMod = claimsFor(moderator);
  const claimsGuest = claimsFor(guest);
  const claimsGuestNoEmail = claimsFor(guest, false);
  const claimsDaily = claimsFor(dailySeller);
  const claimsActive = claimsFor(activeSeller);
  const baseListing = { sellerId: sellerA.id, slug: slugs.listingA, contactEmail: sellerA.email };

  await check('Matriz RLS (15 pruebas)', 'Anónimo inserta un aviso', async () => {
    const detail = await expectRejected(
      selectAs('anon', anonClaims, `insert into public.used_listings ${LISTING_COLUMNS} values ${listingTuple({ sellerId: sellerA.id, slug: `test-rls-anon-${slugSuffix}`, contactEmail: sellerA.email })};`),
      /permission denied|row-level security/i,
    );
    return detail;
  });

  let listingACreated = false;
  await check('Matriz RLS (15 pruebas)', 'Vendedor crea un aviso y queda pending', async () => {
    const rows = await managementQuery(insertListing({ seller: sellerA, claims: claimsA, tuple: listingTuple(baseListing) }));
    listingACreated = true;
    assert(rows[0]?.status === 'pending', `status = ${rows[0]?.status}`);
    return 'status = pending';
  });

  await check('Matriz RLS (15 pruebas)', 'Anónimo sólo ve avisos activos', async () => {
    const rows = await managementQuery(
      selectAs('anon', anonClaims, `select count(*)::int as n from public.used_listings where slug = '${slugs.listingA}';`),
    );
    assert(rows[0].n === 0, `vio ${rows[0].n} filas`);
    return '0 filas con el aviso en pending';
  });

  await check('Matriz RLS (15 pruebas)', 'Vendedor fuerza status = active al insertar', async () => {
    return expectRejected(
      insertListing({
        seller: sellerA,
        claims: claimsA,
        tuple: listingTuple({ sellerId: sellerA.id, slug: slugs.forceActive, status: 'active', contactEmail: sellerA.email }),
      }),
      /row-level security|permission denied/i,
    );
  });

  await check('Matriz RLS (15 pruebas)', 'Vendedor B no ve el pending de A', async () => {
    const rows = await managementQuery(
      selectAs('authenticated', claimsB, `select count(*)::int as n from public.used_listings where slug = '${slugs.listingA}';`),
    );
    assert(rows[0].n === 0, `vio ${rows[0].n} filas`);
    return '0 filas';
  });

  await check('Matriz RLS (15 pruebas)', 'Vendedor B edita el aviso de A', async () => {
    const rows = await managementQuery(
      selectAs(
        'authenticated',
        claimsB,
        `with upd as (update public.used_listings set price_clp = 7777000 where slug = '${slugs.listingA}' returning 1)
         select count(*)::int as n from upd;`,
      ),
    );
    assert(rows[0].n === 0, `actualizó ${rows[0].n} filas`);
    return '0 filas actualizadas';
  });

  await check('Matriz RLS (15 pruebas)', 'Transición pending -> sold rechazada', async () => {
    return expectRejected(
      selectAs('authenticated', claimsA, `update public.used_listings set status = 'sold' where slug = '${slugs.listingA}';`),
      /Transicion de estado no permitida/,
    );
  });

  await check('Matriz RLS (15 pruebas)', 'Moderador aprueba el aviso', async () => {
    const rows = await managementQuery(approveSql(moderator, slugs.listingA));
    assert(rows[0]?.status === 'active', `status = ${rows[0]?.status}`);
    return 'pending -> active';
  });

  await check('Matriz RLS (15 pruebas)', 'Anónimo ve el aviso activo', async () => {
    const rows = await managementQuery(
      selectAs('anon', anonClaims, `select count(*)::int as n from public.used_listings where slug = '${slugs.listingA}';`),
    );
    assert(rows[0].n === 1, `vio ${rows[0].n} filas`);
    return '1 fila visible';
  });

  await check('Matriz RLS (15 pruebas)', 'Editar precio de un aviso activo lo devuelve a pending', async () => {
    const rows = await managementQuery(
      selectAs(
        'authenticated',
        claimsA,
        `update public.used_listings set price_clp = 7777000 where slug = '${slugs.listingA}'
         returning status::text as status, (published_at is null) as published_cleared;`,
      ),
    );
    assert(rows[0]?.status === 'pending', `status = ${rows[0]?.status}`);
    assert(rows[0].published_cleared === true, 'published_at no se limpió');
    return 'status = pending y published_at = null';
  });

  await check('Matriz RLS (15 pruebas)', 'Fotos de otro vendedor rechazadas', async () => {
    return expectRejected(
      insertListing({
        seller: sellerA,
        claims: claimsA,
        tuple: listingTuple({
          sellerId: sellerA.id,
          slug: slugs.photo,
          contactEmail: sellerA.email,
          photoOwner: sellerB.id,
        }),
      }),
      /used_listings_photos_belong_to_seller/,
    );
  });

  await check('Matriz RLS (15 pruebas)', 'RPC mark_used_listing_sold del dueño', async () => {
    await managementQuery(approveSql(moderator, slugs.listingA));
    const rows = await managementQuery(
      selectAs(
        'authenticated',
        claimsA,
        `select public.mark_used_listing_sold((select id from public.used_listings where slug = '${slugs.listingA}'));
         ${statusOf(slugs.listingA)}`,
      ),
    );
    assert(rows[0]?.status === 'sold', `status = ${rows[0]?.status}`);
    return 'active -> sold (con re-aprobación previa)';
  });

  await check('Matriz RLS (15 pruebas)', 'RPC mark_used_listing_sold de otro vendedor', async () => {
    return expectRejected(
      selectAs(
        'authenticated',
        claimsB,
        `select public.mark_used_listing_sold((select id from public.used_listings where slug = '${slugs.listingA}'));`,
      ),
      /No se pudo marcar el aviso como vendido/,
    );
  });

  await check('Matriz RLS (15 pruebas)', 'Anónimo borra un aviso', async () => {
    const rows = await managementQuery(
      selectAs(
        'anon',
        anonClaims,
        `with del as (delete from public.used_listings where slug = '${slugs.listingA}' returning 1)
         select count(*)::int as n from del;`,
      ),
    );
    assert(rows[0].n === 0, `borró ${rows[0].n} filas`);
    const rowsAfter = await managementQuery(
      `select count(*)::int as n from public.used_listings where slug = '${slugs.listingA}';`,
    );
    assert(rowsAfter[0].n === 1, 'el aviso desapareció');
    return '0 filas borradas (bloquea RLS, el anónimo tiene el GRANT)';
  });

  await check('Matriz RLS (15 pruebas)', 'Moderador borra un aviso', async () => {
    const rows = await managementQuery(
      selectAs('authenticated', claimsMod, `delete from public.used_listings where slug = '${slugs.listingA}' returning id;`),
    );
    assert(rows.length === 1, `borró ${rows.length} filas`);
    listingACreated = false;
    return '1 fila borrada';
  });

  await check('Matriz del trigger de invitados (4 pruebas)', 'Sin email confirmado en el JWT', async () => {
    return expectRejected(
      insertListing({
        seller: guest,
        claims: claimsGuestNoEmail,
        tuple: listingTuple({ sellerId: guest.id, slug: slugs.guest, contactEmail: guest.email }),
      }),
      /Debes confirmar tu correo electronico/,
    );
  });

  await check('Matriz del trigger de invitados (4 pruebas)', 'contact_email distinto del confirmado', async () => {
    return expectRejected(
      insertListing({
        seller: guest,
        claims: claimsGuest,
        tuple: listingTuple({ sellerId: guest.id, slug: slugs.guest, contactEmail: 'otro@example.com' }),
      }),
      /El correo de contacto debe ser/,
    );
  });

  await check('Matriz del trigger de invitados (4 pruebas)', 'contact_email coincide con el confirmado', async () => {
    const rows = await managementQuery(
      insertListing({
        seller: guest,
        claims: claimsGuest,
        tuple: listingTuple({ sellerId: guest.id, slug: slugs.guest, contactEmail: guest.email }),
      }),
    );
    assert(rows[0]?.status === 'pending', `status = ${rows[0]?.status}`);
    return '201 status = pending';
  });

  await check('Matriz del trigger de invitados (4 pruebas)', 'Invitado fuerza status = active', async () => {
    return expectRejected(
      insertListing({
        seller: guest,
        claims: claimsGuest,
        tuple: listingTuple({
          sellerId: guest.id,
          slug: slugs.guestForced,
          status: 'active',
          contactEmail: guest.email,
        }),
      }),
      /row-level security|permission denied/i,
    );
  });

  await check('Límites de publicación (2 pruebas)', 'Máximo 5 creaciones cada 24 horas', async () => {
    const inserts = slugs.daily
      .slice(0, 5)
      .map(
        (slug) =>
          `insert into public.used_listings ${LISTING_COLUMNS} values ${listingTuple({
            sellerId: dailySeller.id,
            slug,
            contactEmail: dailySeller.email,
          })};`,
      )
      .join('\n');
    const rows = await managementQuery(
      selectAs('authenticated', claimsDaily, `${inserts} select count(*)::int as n from public.used_listings where seller_id = '${dailySeller.id}';`),
    );
    assert(rows[0].n === 5, `creó ${rows[0].n}`);
    await expectRejected(
      insertListing({
        seller: dailySeller,
        claims: claimsDaily,
        tuple: listingTuple({ sellerId: dailySeller.id, slug: slugs.daily[5], contactEmail: dailySeller.email }),
      }),
      /limite de 5 publicaciones cada 24 horas/,
    );
    return '5 creadas y la 6ª rechazada por el trigger';
  });

  await check('Límites de publicación (2 pruebas)', 'Máximo 20 avisos activos por vendedor', async () => {
    const rows = await managementQuery(
      selectAs(
        'authenticated',
        claimsActive,
        `insert into public.used_listings ${LISTING_COLUMNS}
         select '${activeSeller.id}', 'pending', 'test-rls-act-' || g || '-${slugSuffix}', 'Toyota', 'Corolla', 2020,
                8500000, 65000, 'gasolina', 'automatica', 'Blanco', 'Metropolitana', 'Santiago',
                'Descripcion de prueba con mas de veinte caracteres para el aviso.',
                'Vendedor Test', '+56912345678', '${activeSeller.email}', '1.1',
                array['${activeSeller.id}/foto.jpg'], now() - interval '10 days'
         from generate_series(1, 20) as g;
         select count(*)::int as n from public.used_listings where seller_id = '${activeSeller.id}';`,
      ),
    );
    assert(rows[0].n === 20, `creó ${rows[0].n} avisos`);

    const approved = await managementQuery(
      selectAs(
        'authenticated',
        claimsMod,
        `update public.used_listings set status = 'active', published_at = now(), expires_at = now() + interval '60 days'
         where seller_id = '${activeSeller.id}' and status = 'pending' returning id;`,
      ),
    );
    assert(approved.length === 20, `el moderador aprobó ${approved.length}`);

    await expectRejected(
      insertListing({
        seller: activeSeller,
        claims: claimsActive,
        tuple: listingTuple({
          sellerId: activeSeller.id,
          slug: slugs.active,
          contactEmail: activeSeller.email,
          createdAgo: '10 days',
        }),
      }),
      /20 avisos activos/,
    );

    await managementQuery(
      selectAs(
        'authenticated',
        claimsMod,
        `delete from public.used_listings
         where id = (select id from public.used_listings where seller_id = '${activeSeller.id}' and status = 'active' limit 1)
         returning id;`,
      ),
    );
    const retry = await managementQuery(
      insertListing({
        seller: activeSeller,
        claims: claimsActive,
        tuple: listingTuple({
          sellerId: activeSeller.id,
          slug: slugs.active,
          contactEmail: activeSeller.email,
          createdAgo: '10 days',
        }),
      }),
    );
    assert(retry[0]?.status === 'pending', `status = ${retry[0]?.status}`);
    return '20 activas bloquean la 21ª y al borrar una vuelve a dejar pasar';
  });

  await check('Ciclo end-to-end (1 prueba)', 'publicar -> aprobar -> ver -> editar -> vender', async () => {
    const steps = [];
    const created = await managementQuery(
      insertListing({
        seller: sellerB,
        claims: claimsB,
        tuple: listingTuple({ sellerId: sellerB.id, slug: slugs.e2e, contactEmail: sellerB.email }),
      }),
    );
    assert(created[0]?.status === 'pending', `1: status = ${created[0]?.status}`);
    steps.push('1 publica en pending');

    const approved = await managementQuery(approveSql(moderator, slugs.e2e));
    assert(approved[0]?.status === 'active', `2: status = ${approved[0]?.status}`);
    steps.push('2 moderador aprueba');

    const anonView = await managementQuery(
      selectAs('anon', anonClaims, `select count(*)::int as n from public.used_listings where slug = '${slugs.e2e}';`),
    );
    assert(anonView[0].n === 1, `3: el anónimo vio ${anonView[0].n}`);
    steps.push('3 anónimo lo ve');

    const edited = await managementQuery(
      selectAs(
        'authenticated',
        claimsB,
        `update public.used_listings set price_clp = 6999000 where slug = '${slugs.e2e}'
         returning status::text as status;`,
      ),
    );
    assert(edited[0]?.status === 'pending', `4: status = ${edited[0]?.status}`);
    steps.push('4 editar precio devuelve a pending');

    const reapproved = await managementQuery(approveSql(moderator, slugs.e2e));
    assert(reapproved[0]?.status === 'active', `5: status = ${reapproved[0]?.status}`);
    steps.push('5 moderador reaprueba');

    const sold = await managementQuery(
      selectAs(
        'authenticated',
        claimsB,
        `select public.mark_used_listing_sold((select id from public.used_listings where slug = '${slugs.e2e}'));
         ${statusOf(slugs.e2e)}`,
      ),
    );
    assert(sold[0]?.status === 'sold', `6: status = ${sold[0]?.status}`);
    steps.push('6 vendedor lo marca vendido');

    return steps.join(' · ');
  });

  let cleanupDetail = 'no ejecutada';
  let cleanupError = '';
  try {
    cleanupDetail = await cleanup();
  } catch (error) {
    cleanupError = String(error.message).slice(0, 200);
  } finally {
    printResults(cleanupDetail, cleanupError);
  }

  const failed = results.filter((result) => !result.ok).length;
  if (listingACreated) console.log('Aviso de prueba de A sin cerrar: revisar manualmente.');
  process.exit(failed === 0 && !cleanupError ? 0 : 1);
}

main().catch((error) => {
  console.error(`Error fatal: ${error.message}`);
  process.exit(1);
});
