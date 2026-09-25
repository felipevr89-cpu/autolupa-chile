# AutoLupa

Marketplace de autos usados y comparador de vehículos para Chile.

## Stack

- React 18, Vite y TypeScript
- Tailwind CSS
- Supabase Auth, Postgres, Storage y RLS
- Cloudflare Pages

## Desarrollo local

1. Crear un archivo `.env.local` a partir de `.env.example`.
2. Completar `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` con las credenciales públicas del proyecto Supabase.
3. Instalar y ejecutar:

```bash
npm install
npm run dev
```

La aplicación puede abrir el catálogo aunque Supabase no esté configurado, pero el marketplace muestra el estado de preparación y no crea usuarios ni avisos ficticios.

## Configurar Supabase

1. Crear un proyecto en Supabase.
2. Abrir el SQL Editor y ejecutar `supabase/migrations/202609250001_marketplace.sql`.
3. En Authentication → Providers, activar Google y configurar el cliente OAuth.
4. En Authentication → URL Configuration, usar como Site URL `https://autolupa.pages.dev` y agregar como redirect permitted:
   - `https://autolupa.pages.dev`
   - `https://autolupa.pages.dev/publicar-auto`
   - `http://localhost:5173/**` para desarrollo local, si corresponde.
5. La migración crea el bucket público `listing-photos` y las políticas de Storage. No se debe usar la `service_role` key en el frontend.

Para crear el primer moderador, iniciar sesión una vez en AutoLupa y ejecutar en el SQL Editor:

```sql
insert into private.user_roles (user_id, role)
select id, 'admin'
from auth.users
where email = 'CUENTRO_MODERADOR@EXAMPLE.COM'
on conflict (user_id) do update set role = 'admin';
```

No publicar la `service_role` key ni las credenciales OAuth en el repositorio.

## GitHub y despliegue

Configurar en GitHub Actions los secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

`VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` son claves públicas destinadas al navegador; aun así, deben entregarse mediante secrets durante el build. El workflow actual compila con ellas y despliega en Cloudflare Pages.

El token de Cloudflare se mantiene únicamente en `CLOUDFLARE_API_TOKEN`.

## Flujo de usados

- `/usados`: búsqueda y filtros públicos.
- `/publicar-auto`: formulario gratuito de cuatro pasos.
- `/usados/:slug`: detalle indexable de un aviso.
- `/mis-anuncios`: estado, notas de revisión y marcado como vendido.
- `/moderacion`: cola privada para aprobar, rechazar y resolver reportes.

Todo aviso nuevo nace en estado `pending`. No se insertan listings de ejemplo para ocultar el inventario vacío.

## Seguridad del marketplace

- RLS activa en todas las tablas: el anónimo sólo lee avisos activos publicados y no expirados.
- Máquina de estados `pending → active | rejected`, `rejected → pending | active`, `active → sold | expired | pending`; cualquier otra transición se rechaza en base de datos.
- Editar precio, fotos o descripción de un aviso publicado lo devuelve a revisión.
- Las consultas públicas piden columnas explícitas: el anónimo nunca recibe `seller_id`, notas de moderación ni datos internos.
- Las fotos se guardan en carpetas por vendedor con UUID y no se pueden enumerar.
- Cabeceras de seguridad y `no-store` para `/mis-anuncios` y `/moderacion` en `public/_headers`.
- Fallback SPA explícito en `public/_redirects` para que `/usados/:slug` funcione al entrar directo por URL.

La matriz de verificación con roles reales (`anon`, vendedor A, vendedor B, moderador) está en `supabase/README.md` y debe ejecutarse antes de recibir vendedores reales.

## Verificación

```bash
npm test
npm run lint
npm run build
```
