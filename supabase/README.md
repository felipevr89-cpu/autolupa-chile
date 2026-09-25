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

## Pendiente antes de recibir vendedores reales

1. Ejecutar esta matriz con usuarios reales y registrar los resultados.
2. Añadir Cloudflare Turnstile o rate limiting para publicaciones y reportes: hoy no hay límite de frecuencia.
3. Limpieza de fotos huérfanas al eliminar un aviso o una cuenta.
4. Revisión jurídica de los documentos (la razón social y el RUT siguen marcados como PENDIENTES).
5. Migrar a renderizado en servidor para las rutas públicas y generar el sitemap de avisos.
