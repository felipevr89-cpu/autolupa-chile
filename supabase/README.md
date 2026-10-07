# Seguridad del marketplace

Resumen de las reglas aplicadas en `supabase/migrations/202609250001_marketplace.sql` y de cómo verificarlas manualmente.

## Modelo de datos

| Tabla | Rol anónimo | Rol vendedor | Rol moderador |
| --- | --- | --- | --- |
| `used_listings` (select) | sólo avisos `active` publicados y no expirados | sus propios avisos (cualquier estado) | todos |
| `used_listings` (insert) | denegado | sólo con `status = 'pending'`, sin fechas de publicación | denegado por la política |
| `used_listings` (update) | denegado | sólo los suyos y sólo por transiciones válidas | cualquiera por transición válida |
| `used_listings` (delete) | denegado | denegado | permitido |
| `listing_reports` | denegado | insertar y leer los propios | leer y resolver todos |
| `user_preferences` | denegado | sólo los suyos | sólo los suyos |
| `document_signatures` | denegado | insertar y leer los suyos | los suyos |
| `profiles` | lectura | lectura | lectura |

## Máquina de estados

```
pending  -> active | rejected
rejected -> pending | active
active   -> sold | expired | pending
```

- La función `used_listing_status_transition_is_valid` rechaza cualquier otra transición, incluso para moderadores.
- Un vendedor sólo puede pasar su aviso de `active` a `sold`, mediante el RPC `mark_used_listing_sold`.
- Si un vendedor modifica precio, fotos, descripción u otros datos materiales de un aviso `active`, el trigger lo devuelve a `pending` y limpia `published_at` y `expires_at`: los cambios importantes vuelven a moderación.
- El trigger también bloquea la modificación de `id`, `seller_id`, `slug`, `created_at`, `moderation_note`, `featured_until`, `published_at` y `expires_at` por parte de los vendedores.

## Columnas

- Las consultas públicas piden una lista explícita de columnas. `seller_id`, `moderation_note`, `featured_until` y `terms_accepted_version` nunca se solicitan en el listado ni en el detalle público.
- Esa proyección está protegida por el test `usedListings.test.ts` → "keeps internal columns out of the public projection".

## Fotos

- El bucket `listing-photos` es público para poder servir las imágenes con `<img>`, pero **no** se permite listar sus objetos: la política de `select` sobre `storage.objects` es sólo para el dueño de la carpeta. Sin ella, cualquiera con la clave anónima podría enumerar todas las fotos.
- Las rutas son `{userId}/{listingId}/{uuid}.jpg`: identificadores aleatorios y carpeta por vendedor.
- Un `CHECK` (`used_listings_photos_belong_to_seller`) obliga a que todas las rutas de `photo_paths` pertenezcan al `seller_id` del aviso, por lo que un vendedor no puede enlazar fotos de otro.
- Límites: entre 1 y 8 fotos, 5 MB por archivo y sólo JPEG, PNG o WebP.

## Verificación manual en Supabase

Después de aplicar la migración, reemplazar `USER_A_ID` y `USER_B_ID` por UUID reales y ejecutar:

```sql
-- 1. El anónimo sólo ve avisos activos publicados y no expirados
set local role anon;
select count(*) from public.used_listings;
reset role;

-- 2. El anónimo no puede escribir
set local role anon;
insert into public.used_listings (seller_id, slug, brand, model, year, price_clp, mileage_km, fuel, transmission, region, description, contact_name, contact_phone, terms_accepted_version, photo_paths)
values (auth.uid(), 'test-slug', 'Test', 'Test', 2020, 1000000, 1000, 'gasolina', 'manual', 'Metropolitana', 'Descripcion de prueba del aviso.', 'Vendedor', '+56912345678', '1.1', array['x/y.jpg']);
-- esperado: permission denied for table used_listings
reset role;

-- 3. Un vendedor no publica activo directamente
set local role authenticated;
set local request.jwt.claims = '{"sub":"USER_A_ID","role":"authenticated"}';
insert into public.used_listings (seller_id, slug, brand, model, year, price_clp, mileage_km, fuel, transmission, region, description, contact_name, contact_phone, terms_accepted_version, photo_paths)
values ('USER_A_ID', 'slug-a', 'Test', 'Test', 2020, 1000000, 1000, 'gasolina', 'manual', 'Metropolitana', 'Descripcion de prueba del aviso.', 'Vendedor', '+56912345678', '1.1', array['USER_A_ID/listing/x.jpg'])
returning id, status;
-- esperado: status = pending
reset role;

-- 4. Un vendedor no lee ni modifica avisos ajenos
set local role authenticated;
set local request.jwt.claims = '{"sub":"USER_B_ID","role":"authenticated"}';
update public.used_listings set price_clp = 1 where slug = 'slug-a';
-- esperado: 0 rows
reset role;

-- 5. Las transiciones inválidas fallan
set local role authenticated;
set local request.jwt.claims = '{"sub":"USER_A_ID","role":"authenticated"}';
update public.used_listings set status = 'sold' where slug = 'slug-a';
-- esperado: Transicion de estado no permitida: pending -> sold
reset role;

-- 6. Sólo el moderador aprueba
set local role authenticated;
set local request.jwt.claims = '{"sub":"MODERATOR_ID","role":"authenticated"}';
update public.used_listings
set status = 'active', published_at = now(), expires_at = now() + interval '60 days'
where slug = 'slug-a';
reset role;
```

`MODERATOR_ID` debe tener rol en `private.user_roles` (`moderator` o `admin`).

## Matriz re-ejecutada (06-10-2026) — 22/22

`node scripts/rls-matrix.mjs` reproduce toda la verificación contra producción con usuarios reales creados por la API admin (`POST /auth/v1/admin/users`) y borrados al terminar. Corre en 4 bloques:

| Bloque | Pruebas | Resultado |
| --- | --- | --- |
| Matriz RLS | 15 | ✅ 15/15 (igual que el 29-09) |
| Trigger de invitados | 4 | ✅ 4/4 (igual que el 30-09) |
| Límites de publicación | 2 | ✅ 2/2 (nuevos, `202610020001_publish_limits.sql`) |
| Ciclo end-to-end | 1 | ✅ publicar → aprobar → ver → editar → vender |

- **Límites**: 6ª creación en 24 h rechazada por el trigger, 21ª activa rechazada, y al borrar una activa vuelve a dejar pasar.
- **Hallazgo**: `anon` y `authenticated` tienen **todos** los privilegios sobre `public.used_listings` (Supabase otorga `all` en el esquema `public`); por eso el anónimo no recibe `permission denied` sino que **RLS devuelve 0 filas**. El GRANT no es la defensa, la política lo es.
- La matriz se ejecuta con `set local role` + `request.jwt.claims` por la Management API (`POST /v1/projects/{ref}/database/query`).
- Al final verifica `0` filas en `auth.users`, `auth.identities`, `profiles`, `private.user_roles` y `used_listings`, y `0` avisos con slug `test-%`; sale con código 1 si algo queda sucio.

## Límites de publicación (06-10-2026)

Trigger `enforce_publish_limits` (BEFORE INSERT, `202610020001_publish_limits.sql`):

- **máx 20 avisos `active`** por vendedor → `Este vendedor ya tiene 20 avisos activos.`
- **máx 5 creaciones cada 24 h** por vendedor (`created_at`) → `Alcanzaste el limite de 5 publicaciones cada 24 horas.`
- Se salta si `auth.uid()` es `null` (service_role / postgres), para no romper backups ni siembra.
- Del lado del cliente hay una copia de cortesía en `src/lib/antiAbuse.ts`: honeypot `website` en el paso 4, trampa de tiempo ≥ 2 s y cupo de 5/24 h en `localStorage` (errores genéricos para bots). **El trigger es el que vale.**

## Backup y restore

- `node scripts/backup-supabase.mjs` vuelca las 7 tablas de negocio (`used_listings`, `listing_reports`, `profiles`, `user_preferences`, `document_signatures`, `suggestions`, `private.user_roles`) a `supabase/backups/backup-AAAA-MM-DD.json` vía Management API. Usa `SUPABASE_ACCESS_TOKEN` de `.env`.
- `supabase/backups/` está en `.gitignore`: contiene datos de negocio, no va al repo.
- **Restore**: con la Management API, `POST /v1/projects/{ref}/database/query` con `truncate ... cascade` de las tablas destino y `insert` fila por fila desde el JSON (los `id` se conservan, así que hay que borrar antes por las FK a `auth.users`). Las fotos no están en el JSON: se respaldan aparte desde Storage si crece el volumen.

## Resultados de la matriz (29-09-2026)

Ejecutada con la Management API sobre el proyecto `eeqhqsteeobegaekynse`, con tres usuarios reales creados por GoTrue (vendedor A, vendedor B y moderador con rol en `private.user_roles`). 15/15 pruebas pasaron:

| Prueba | Resultado |
| --- | --- |
| Anónimo sólo ve avisos activos | 0 filas sin avisos activos |
| Anónimo inserta | bloqueado por RLS |
| Vendedor crea aviso | `status = pending` |
| Vendedor fuerza `status = active` | bloqueado por RLS |
| Vendedor B no ve el `pending` de A | 0 filas |
| Vendedor B edita aviso de A | 0 filas |
| Transición `pending -> sold` | rechazada por trigger |
| Moderador aprueba | 1 fila, pasa a `active` |
| Anónimo ve el aviso activo | 1 fila |
| Vendedor edita precio de aviso activo | vuelve a `pending` |
| Fotos de otro vendedor | rechazadas por `used_listings_photos_belong_to_seller` |
| RPC `mark_used_listing_sold` (dueño) | `status = sold` |
| RPC `mark_used_listing_sold` (vendedor B sobre aviso de A) | rechazada |
| Anónimo borra aviso | 0 filas borradas |
| Moderador borra aviso | 1 fila borrada |

Los usuarios y avisos de prueba fueron eliminados al terminar: `auth.users`, `profiles`, `private.user_roles`, `auth.identities` y `used_listings` quedaron en 0.

## Publicación sin registro (30-09-2026)

Flujo de invitado: `signInAnonymously()` → el usuario llena el formulario → `updateUser({ email })` → confirmación por correo → insert con `status = 'pending'`.

**Configuración que lo habilita** (Management API `PATCH /v1/projects/{ref}/config/auth`):
- `external_anonymous_users_enabled: true`
- `security_manual_linking_enabled: true` (sin esto `updateUser({ email })` sobre un anónimo falla)
- `rate_limit_anonymous_users: 60`, `rate_limit_otp: 60`
- `rate_limit_email_sent: 2` y **no se puede subir sin SMTP propio**

**Trigger `require_verified_seller`** (`202609300002_guest_publishing.sql`, BEFORE INSERT OR UPDATE, security definer):
1. Exige `email` en el JWT: sin confirmar → `Debes confirmar tu correo electronico antes de publicar.`
2. Si el vendedor no tiene identidad OAuth (invitado o contraseña), `contact_email` debe ser exactamente el correo confirmado.
3. Si `auth.uid() <> seller_id` (moderador editando) el trigger no hace nada.

Las políticas RLS no se tocaron: el rol anónimo **sin sesión** sigue sin poder insertar, porque una sesión anónima autenticada usa el rol `authenticated`.

### Matriz del trigger (30-09-2026) — 4/4

| # | Caso | Esperado | Resultado |
|---|---|---|---|
| 1 | Invitado sin email confirmado | 400 | ✅ `Debes confirmar tu correo…` |
| 2 | Verificado, `contact_email` distinto | 400 | ✅ `El correo de contacto debe ser…` |
| 3 | Verificado, `contact_email` coincide | 201 `pending` | ✅ |
| 4 | Invitado fuerza `status: 'active'` | 403 | ✅ RLS |

Los usuarios y avisos de prueba se borraron al terminar (0 users, 0 listings).

## Aplicar migraciones

`node scripts/apply-migration.mjs supabase/migrations/ARCHIVO.sql` envía el archivo completo por la Management API (`POST /v1/projects/eeqhqsteeobegaekynse/database/query`) con `SUPABASE_ACCESS_TOKEN` de `.env` (se renueva en el dashboard: Account → Tokens). Alternativa: pegar el SQL en el SQL Editor del dashboard.

- `202609250001_marketplace.sql` · `202609300002_guest_publishing.sql` · `202610020001_publish_limits.sql` → aplicadas.
- `202610070001_seller_email_verified.sql` → **pendiente de aplicar**: agrega `profiles.email_verified` + trigger `sync_profile_email_verified` (`AFTER INSERT OR UPDATE OF email_confirmed_at` sobre `auth.users`, `security definer`) + backfill + `notify pgrst, 'reload schema'`. El frontend la tolera: mientras no exista, el badge «Correo del vendedor verificado» de la ficha se oculta (reintenta sin la columna) y nada se rompe; al aplicarla se enciende sin nuevo push. Después de aplicarla, re-ejecutar `node scripts/rls-matrix.mjs`.

## Crear usuarios de prueba

Usar la API admin (`POST /auth/v1/admin/users` con la `service_role` key). **No insertar directamente en `auth.users`**: GoTrue guarda `''` (texto vacío) en `confirmation_token`, `recovery_token`, `email_change_token_new`, `email_change_token_current` y `email_change`; si quedan en `NULL`, todo login sobre ese usuario falla con `Database error querying schema`.

## Pendiente antes de recibir vendedores reales

1. ~~Ejecutar esta matriz con usuarios reales y registrar los resultados.~~ ✅ 29-09-2026 (15/15) y re-ejecutada ✅ 06-10-2026 (22/22 con `scripts/rls-matrix.mjs`).
2. ~~Añadir límite de frecuencia para publicaciones.~~ ✅ 06-10-2026 (trigger `enforce_publish_limits`: 5/24 h y 20 activos + antiAbuse en el cliente). **Cloudflare Turnstile sigue pendiente: es Fase 0.6 y requiere el API token del usuario.**
3. Limpieza de fotos huérfanas al eliminar un aviso o una cuenta.
4. Revisión jurídica de los documentos (la razón social y el RUT siguen marcados como PENDIENTES).
5. Migrar a renderizado en servidor para las rutas públicas y generar el sitemap de avisos.
6. **Contratar SMTP propio** (Resend, Postmark o SendGrid) y subir `rate_limit_email_sent`. Mientras siga en 2 correos/hora no funciona ni la publicación de invitados ni el restablecimiento de contraseña.
7. **Aplicar `202610070001_seller_email_verified.sql`** (ver «Aplicar migraciones»): el PAT de `.env` respondió 401 el 07-10-2026 y hay que renovarlo. Con la migración aplicada, re-ejecutar `scripts/rls-matrix.mjs` y comprobar el badge de correo verificado en una ficha.
