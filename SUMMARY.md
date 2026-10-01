# AutoLupa - Summary

## Objective
Marketplace chileno de autos usados con comparador integrado de vehículos nuevos. React + TypeScript + Vite + Supabase. Hosting: Cloudflare Pages (`autolupa.pages.dev`).

## Estado Actual
- **Marketplace de usados**: `/usados`, detalle por slug, filtros, CTA, publicación en 4 pasos, gestión de avisos, reportes y moderación en Supabase
- **Persistencia**: listings, fotos, favoritos, perfiles, preferencias y firmas en Supabase; RLS y moderación obligatorias antes de publicar
- **Seguridad de datos**: máquina de estados en base de datos, proyección pública de columnas, fotos no enumerables, `_headers` con cabeceras de seguridad, `_redirects` para el fallback SPA, CI con lint + tests + build
- **Core**: Home, CarDetail, Favorites, Compare, FilterPanel, CarGrid funcionando
- **Catálogo**: 98 marcas / 626 modelos con id único (IDs duplicados corregidos: 310/352/331 renumerados a 647/648/649; marca "Tank" duplicada eliminada)
- **Top 10** (`/top10`): Rankings por categoría (seguridad, espacio, consumo, potencia, económico, autonomía EV, nuevos). Sincronizado con el parámetro `?cat=` del dropdown de la Navbar
- **EV Hub** (`EVHub`): Catálogo electrificados, calculadora de carga, ranking autonomía, impacto ambiental
- **TCO Calculator**: Costo total de propiedad (permiso de circulación según fórmula SII, mantenciones, seguro, combustible/energía, cuota crédito), gráficos, comparación
- **AutoWizard**: Wizard paso a paso y simulador de crédito
- **Recomendador semántico local** (`SmartAsk`): "Pregunta con tus palabras" — interpreta lenguaje natural en español y puntúa el catálogo con explicaciones por auto, 100% local/offline sin API
- **Modo oscuro**: completo (toggle en Navbar, persistido en `localStorage['darkMode']`)
- **Páginas legales**: `/privacidad`, `/terminos`, `/responsabilidad` (LegalDocs) — enlaces funcionales en el Footer, incluidas en el sitemap
- **Dark/light**: tailwind `dark:` en todos los componentes
- **PWA**: favicon e ícono propios (`favicon.svg`), manifiesto actualizado (antes `vite.svg`)
- **Tests**: 65 tests pasando (incluye smoke test de las páginas del marketplace)
- **Lint**: 0 errores / 0 warnings
- **Build**: compila sin errores (el aviso de chunk >500 KB se debe a los datos de catálogo embebidos en el bundle principal)

## Permiso de circulación (fórmula SII)
- Implementado en `src/data/tco.ts` con la escala progresiva/acumulativa de la FAQ **001.170.5079.007**: 1% hasta 60 UTM, 2% hasta 120, 3% hasta 250, 4% hasta 400 y 4,5% sobre 400 UTM; mínimo media UTM (0,5 UTM = $34.876)
- Base = precio comercial (año en curso) depreciado ~10% anual como proxy de la tasación fiscal; UTM enero 2026 = $69.751
- Eléctricos e híbridos enchufables (año ≥ 2021) pagan **25%** del permiso (Ley 21.505, vigente para 2026)
- Ejemplo fijado en test: Corolla $18M → $420.071/año; EV/phev mismo auto → $105.018; mínimo y depreciación verificados en `tco.test.ts`

## Seguridad
- Token Cloudflare eliminado de `AGENTS.md` (usar GitHub Secret `CLOUDFLARE_API_TOKEN`). Verificado: no queda ninguna copia en el repo
- Git: `core.fileMode false` activado (se eliminó el ruido NTFS de 600+ archivos)

## Rendimiento
- Supabase se carga sólo en las páginas que usan autenticación, favoritos o marketplace; el catálogo nuevo conserva su bundle principal
- Widgets del modal CarDetail (TCO/EV/Crédito/Guía) convertidos en pestañas que se montan bajo demanda

## Ajustes recientes
- **Motor de recomendación semántica local** (`data/recommender.ts` + `Wizard/SmartAsk.tsx`): parseo de consultas libres en español (presupuesto en CLP, uso, combustible con sinónimos, transmisión, plazas, tracción, formato, prioridades, marca, año) + scoring ponderado (presupuesto 20 / uso 20 / combustible 15 / prioridad 15 / plazas 10 / transmisión 8 / tracción 7 / formato 5) con `reasons` explicativas y filtros duros solo para lo explícito (marca, formato, año, ≥6 plazas). Botón "Pregunta con tus palabras" en el hero de Home; chips "Entendí"; top 10 con afinidad; verificación con smoke test sobre el catálogo real (todos los top coherentes). 21 tests nuevos en `recommender.test.ts`
- **Años dinámicos**: filtros de año usan `new Date().getFullYear()` en vez de valores hardcodeados (2010–2026)
- **Firmas de documentos**: persistidas en Supabase para cuentas conectadas, con respaldo local si no hay backend
- **SEO**: canonical/og:url por ruta; `Vehicle` + `Offer` + `BreadcrumbList` en detalle de usados e `ItemList` en el listado; sitemap incluye publicación y usados
- **Etiquetas**: "AutoMatch IA" renombrado a "Asistente AutoLupa" (es un wizard de reglas, no IA)
- **Footer**: enlaces legales reales + conteos dinámicos (`brands.length` / `carsData.length`)
- **Novedades 2026 curado**: el rail de Home ya no es `filter(year>=2026)` (255 autos); ahora muestra 12 lanzamientos notables definidos en `NOVEDADES_2026` (`Home.tsx`)
- **Marcas no oficiales marcadas**: Acura, Buick, Chrysler, GMC, Infiniti y Lincoln no se venden como nuevas en Chile → badge "no en Chile" en tarjetas y detalle, aviso en el filtro (`BRANDS_NOT_SOLD_NEW_IN_CHILE` en `data/brands/index.ts`)
- **Wizard ampliado**: 8 preguntas (presupuesto, uso, combustible, prioridad, **km/mes, transmisión, plazas, tracción**); afinidad ahora **absoluta** (ya no fuerza 100% al primero); miniatura con foto real del auto

## Limpieza de fotos (`carImages.json`)
- Eliminados **21 huérfanos** (ids sin auto en catálogo: 174-183, 189, 289, 532-534, 559, 561, 562, 588, 590, 594)
- Nuladas **34 fotos de modelo incorrecto**: BMW Serie 3/4 (foto E21 1970s), Chery Arrizo 6 (foto Arrizo 8), Tiggo 2/4/7 (foto Tiggo 8 Plus), trio Chevrolet Blazer/Captiva/Equinox EV (misma foto genérica "Chevy"), Captiva vieja 2012, DS 3/4/7 (una foto de un DS de rally 2012), Grand Cherokee (foto Cherokee), Mazda CX-5/CX-90 (foto CX-9 2007), CX-50 (foto CX-60), Mazda 6 (foto Mazda 2), Clase V (foto Clase E), MG 5 (era un escudo de fútbol), MG ZX (foto ZS), Neta X (foto Neta U), Pathfinder (foto concept 2012), Porsche 718 (foto race car 718RSK), Tesla Model 3/Y (foto Model S), Corolla Cross (foto Corolla sedán), Yaris Cross/Sedán (foto Yaris hatch)
- **C3 Aircross reparado**: apunta ahora a la foto correcta del C3 Aircross (era un C3 Picasso 2010); el C3 quedó como silueta
- Nulados además **Ioniq 5/6** (foto del Ioniq Hybrid 2020) y **Range Rover Sport** (foto de un Range Rover largo)
- **Foto 48 (BMW Serie 2 Gran Coupé)**: se completó la licencia CC BY-SA 4.0 (Alexander Migl) — era la única con foto sin `source`/`license`
- En ese momento **441 entradas con foto** tenían `source` + `license`; **0 huérfanas**; **0 faltantes en disco**; **0 archivos huérfanos** en `public/car-images/` (59 archivos sin usar eliminados) y entradas `{file:null}` normalizadas a `null`. Ver sección "Pase de fotos 2026" para el estado actual (572)

## Ajuste de catálogo: marca "Tank" eliminada
- GWM ya representaba oficialmente los Tank 300/500 (ids 225/226, `gwm.cl`); la marca **Tank** por separado (ids 557/558, `brandUrl:"#"`) era el mismo vehículo duplicado → eliminada junto con sus claves de imagen
- **ORA** (id 473) se mantiene: es la submarca eléctrica de GWM, sí vendida en Chile

## TCO ampliado (tasa, depreciación, carga mixta)
- **Tasa crédito**: 6,5% → **11% anual** (alineada con el CAE 12% del CreditCalc); simulador muestra "Tasa interés"
- **Depreciación anual** incluida (18% año 1-2, 12% 3-4, 9% 5-7, 7% >7 años) con ítem propio "Depreciación 📉" en el desglose
- **Carga eléctrica mixta**: ~80% hogar ($150) + 20% rápida ($350) ≈ **$190/kWh** (antes solo $150); híbrido mantiene 50/50
- UI: aviso cuando un eléctrico/phev no tiene datos de batería/autonomía (carga '—'); texto de "Incluye" y nota de supuestos actualizados
- Test: `loanRate` fijado a 0,11; desglose con 7 ítems; verificación de depreciación y carga mixta

## Correciones de Datos Realizadas
- **IDs duplicados**: 310 (Kia Bongo ↔ KGM New Musso), 352 (Lexus ES ↔ Leapmotor B10), 331 (Kia K3 Cross ↔ Škoda Enyaq) renumerados
- **Tesla**: Model S/X/Cybertruck eliminados (no oficiales Chile)
- **Ford**: eliminados 11 modelos USA

## Archivos Clave
- `src/pages/` - Home, Top10, Compare, Favorites, Estadisticas, LegalDocs
- `src/components/Cars/CarDetail.tsx` - Modal de detalle (con pestañas de herramientas)
- `src/components/Filters/FilterPanel.tsx` - Panel de filtros
- `src/components/Calculator/CreditCalc.tsx` - Simulador de crédito
- `src/components/Wizard/AutoWizard.tsx` - Asistente de recomendación
- `src/hooks/useCars.ts` - Estado global (filtros, favoritos, comparador, recientes, sync Supabase)
- `src/lib/usedListings.ts` - Operations de Supabase para listings, fotos, reportes y moderación
- `src/pages/Usados.tsx` - Marketplace público y filtros
- `src/pages/PublicarAuto.tsx` - Formulario de cuatro pasos
- `src/pages/UsedListingDetail.tsx` - Detalle SEO de aviso
- `src/pages/MisAnuncios.tsx` / `src/pages/ModeracionUsados.tsx` - Gestión y moderación
- `supabase/migrations/202609250001_marketplace.sql` - Esquema, RLS, roles y Storage
- `src/data/brands/` - 98 archivos JSON de marcas
- `src/data/brands/index.ts` - Agregador de datos

## Pase de fotos 2026 (Commons, best-effort)
- Se añadieron **131 fotos reales** (API de Wikimedia Commons, ancho 1000px) para modelos que quedaban en silueta, con `source` + `license` + `attribution` extraídos de los metadatos (CC BY-SA/CC BY/CC0/licencias de dominio público)
- Catálogo final: **572 fotos / 54 siluetas**; auditoría limpia (**0 huérfanas, 0 faltantes en disco, 0 archivos huérfanos**, todas con licencia)
- Modelos sin foto que quedan como silueta: los que no tienen imagen en Commons o son demasiado raros/domésticos (Soueast S06/S08, Chery Tiggo 2/4/7 Pro Max, Kaiyi/KYC, ZNA/ZX pickups, Shineray, Wey 05, Exeed RX, Farizon SuperVAN, DFSK Glory iX5/T5 Evo/Supervan, Dongfeng Aeolus/MAGE/Rich, JMC Vigus EV/Work/Grand Avenue, Ford Territory FHEV/Maverick FHEV, Renault Logan, Livan S7, Onix Sedán/Sail HB, RAM 700, módulos PHEV Jetour T1/T2)
- Restaurados **Ioniq 5/6 y Range Rover Sport** con la foto correcta (la nueva generación L461 del Range Rover Sport)
- **Advertencia de curaduría**: por diseño best-effort, ~15 imágenes son de la misma generación/plataforma comercial (p. ej. BMW Serie 3 G28, TBZ Mazda 6 2023, Tiggo 7 Pro, Roewe para MG RX5/RX8/RX9, Fownix para Arrizo 6, Radar para Riddara RD6, Haval para GWM Dargo, Ssangyong para KGM). Fidelidad por modelo revisada caso a caso; el pase no inventa fotos (cada entrada apunta a su archivo de Commons)

## Configuración de Supabase (29-09-2026)
- **Proyecto creado**: `eeqhqsteeobegaekynse` (`.env` local con URL, anon key y site URL; el archivo está en `.gitignore`).
- **Migración ejecutada** por SQL Editor: 6 tablas + `private.user_roles`, RLS en todas, 14 políticas, bucket `listing-photos`, máquina de estados y RPC.
- **Google OAuth** configurado (consent screen externo + credencial web con redirect `https://eeqhqsteeobegaekynse.supabase.co/auth/v1/callback`; provider habilitado en Supabase).
- **GitHub Secrets completos**: `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN` (previos) + `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` (nuevos).
- **Matriz RLS ejecutada con usuarios reales**: 15/15 pruebas pasaron (anónimo, vendedor A, vendedor B, moderador). Detalle en `supabase/README.md`. Datos de prueba eliminados al terminar.
- **Gotcha GoTrue**: insertar usuarios directamente en `auth.users` deja columnas de token en `NULL` y rompe todo login con `Database error querying schema`; crearlos con la API admin.

## Renombrado AutoMatch → AutoLupa
- Carpeta local renombrada de `automatch/` a `autolupa/` (la sesión de trabajo se movió al nuevo path).
- Última referencia en código corregida: la User-Agent de `scripts/fetch-images.cjs` decía `AutoMatchChile/1.0 (https://automatchs.pages.dev...)`; ahora es `AutoLupa/1.0 (https://autolupa.pages.dev...)`.
- Quedan sólo menciones históricas en `AUDITORIA.md`, `SUMMARY.md` y `TODO.md` (documentan el propio renombrado).
- **Pendiente de decisión**: renombrar también el repositorio de GitHub `automatch-chile` → `autolupa-chile`.

## Adecuación Ley 21.719 (30-09-2026)

### A — Documentos
- **Política de privacidad v1.2** (`src/lib/documents.ts`): se reescribió para cubrir la Ley 21.719 (vigente 01-12-2026): los 6 derechos ARSOPB con sus artículos, procedimiento de ejercicio (acuse inmediato, respuesta 30 días prorrogable 30, bloqueo 2 días hábiles, gratuidad), denegaciones con derecho a reclamar ante la Agencia en 30 días hábiles, bases del Art. 13 (consentimiento, contrato, interés legítimo, obligación legal), tabla de encargados con transferencias internacionales (Supabase, Cloudflare, Google), reporte de vulneraciones, deber de confidencialidad, menores de 14 años y categorías especiales excluidas. Al subir de versión v1.1 → v1.2, los usuarios existentes vuelven a firmar automáticamente.
- **`docs/RAT.md`**: Registro de Actividades de Tratamiento con 6 actividades (cuenta, favoritos, avisos, moderación, firmas, seguridad) — exigible por la Agencia.
- **`docs/runbook-brechas.md`**: contención, evaluación de riesgo, reporte a la Agencia y comunicación a titulares.

### B — Derechos técnicos
- **`/tus-datos`** (`src/pages/TusDatos.tsx`): portabilidad (descarga JSON de cuenta, avisos, favoritos, firmas y reportes) y supresión de cuenta con doble confirmación. `noindex`, enlace en el footer.
- **`src/lib/privacy.ts`**: `exportPersonalData` (5 consultas en paralelo), `downloadJson` y `deletePersonalAccount` (borra fotos propias por prefijo y luego la cuenta).
- **Migración `202609300001_privacy_rights.sql`**: RPC `delete_my_account()` security definer, solo para `authenticated`. Ejecutada y verificada.
- **Verificación end-to-end con usuario real**: portabilidad devolvió perfil+datos → RPC devolvió 204 → cascada completa (`auth.users`, `profiles`, `identities` = 0). El anónimo recibe `permission denied for function`.
- Tests: 69 (4 nuevos en `marketplacePages.test.tsx`).


- **Configuración externa**: ~~ejecutar la migración, activar Google OAuth y cargar los secrets~~ ✅ hecho.
- **Verificación de RLS**: ~~ejecutar la matriz con usuarios reales~~ ✅ 15/15 (29-09-2026).
- **Rate limiting**: no hay límite de frecuencia para publicaciones ni reportes; integrar Cloudflare Turnstile o similar.
- **Legal**: razón social y RUT siguen marcados como PENDIENTES en la política de privacidad v1.1.
- **Fotos huérfanas**: no hay limpieza automática al eliminar un aviso o una cuenta.
- **Ciclo de vida**: falta editar y reenviar un aviso, retirarlo, renovarlo y un proceso que marque `expired`; hoy nadie asigna ese estado.
- **Sitemap dinámico**: las URLs individuales ya tienen canonical y datos estructurados; falta generar un sitemap server-side con los listings activos cuando haya backend configurado.
- **Consumo Lynk & Co 09** (MHEV 2.0T): sin cifra oficial chilena verificada; TCO muestra combustible '—'
- **DFSK Glory iX5 EV**: se confirma que existe como EV (Seres), pero sin ficha chilena con datos de batería/autonomía → carga '—'
- **Fotos restantes**: 54 siluetas (ver lista arriba) — buscar cuando salgan fotos en Commons o fichas oficiales
- **Marcas**: no añadir **FAW** como auto liviano (en Chile solo hay FAW Trucks); verificar nuevos anuncios de marcas 2026
- `SUMMARY.md` y `AGENTS.md` se actualizan manualmente

## Publicación sin registro (30-09-2026)

**Decisión del usuario:** el anónimo inserta en `pending` con email verificado (no cuenta con Google ni insert sin verificación).

### Configuración Supabase (Management API)
- `external_anonymous_users_enabled: true` (rate limit 60/h).
- `security_manual_linking_enabled: true` — obligatorio para `updateUser({ email })` en un usuario anónimo.
- `rate_limit_otp: 60`. **`rate_limit_email_sent` sigue en 2/h y NO se puede subir sin SMTP propio** → es el blocker real de esta función: hasta contratar SMTP solo salen 2 correos de confirmación por hora.
- Flujo: `signInAnonymously()` → el usuario llena los pasos → `updateUser({ email }, { emailRedirectTo: /publicar-auto })` → el JWT queda con `email` y `is_anonymous=false` **sin cambiar el uid** (verificado por API: mismas fotos y mismos avisos).

### Migración `202609300002_guest_publishing.sql`
Trigger `require_verified_seller` (BEFORE INSERT OR UPDATE, security definer) sobre `used_listings`:
1. Sin `email` en el JWT → `Debes confirmar tu correo electronico antes de publicar.`
2. Sin identidad OAuth (invitado o usuario de contraseña) → `contact_email` debe ser exactamente el correo confirmado.
3. Moderadores que editan avisos ajenos salen del trigger (`auth.uid() <> seller_id` → no-op).

### Matriz ejecutada (4/4)
| # | Caso | Resultado |
|---|---|---|
| 1 | Invitado sin email confirmado | 400 `Debes confirmar tu correo…` ✅ |
| 2 | Verificado con `contact_email` distinto | 400 `El correo de contacto debe ser…` ✅ |
| 3 | Verificado con `contact_email` coincide | 201 `pending` ✅ |
| 4 | Invitado fuerza `status: active` | 403 RLS ✅ |

El rol anónimo (sin sesión) sigue sin poder insertar: no se tocó ninguna política, solo se añadió el trigger.

### Frontend
- `useAuth.signInAnonymously()`; `PublicarAuto` ofrece **Publicar sin crear cuenta** (verde) y **Continuar con Google**.
- Verificación en el paso 4 con panel de estado, botón «Ya confirmé, comprobar» (poll cada 5 s) y «Reenviar correo».
- Borrador persistido en `localStorage` (menos las fotos) para sobrevivir la recarga al confirmar el correo; banner explicándolo.
- Navbar muestra **Invitado** cuando no hay nombre (sesión anónima).
- Tests: 78.

### Pendiente real
- **Contratar SMTP** (Resend/Postmark) para subir `rate_limit_email_sent`; sin eso el flujo de invitado no aguanta producción.
- **Probar el envío real** de `updateUser({email})`: la ventana de 2 correos/hora estaba agotada durante el desarrollo.



## Lote 9 — Reclamos y Sugerencias con respuesta pública (01-10-2026)

- **Migración `supabase/migrations/202609300003_suggestions.sql`** (aplicada en Supabase con el PAT): tabla `public.suggestions` con `kind` (`reclamo`/`sugerencia`), `title` (5–120), `body` (10–2000), `email` opcional, `status` (`open`/`answered`/`closed`), `answer` y `answered_at`, más un chequeo de consistencia `status = 'answered' ⇔ answer y answered_at no nulos`.
- **RLS**: `SELECT` público solo para filas `answered`/`closed`; `INSERT` permitido a `anon`/`authenticated` únicamente con `status = 'open'` y sin respuesta; `SELECT`/`UPDATE`/`DELETE` de moderador con `is_moderator()`; índices parciales por estado.
- **Hallazgo técnico (documentado para no repetirlo)**: en PostgreSQL, cualquier `RETURNING` —es decir `Prefer: return=representation` o `.select()` encadenado tras un `insert`— exige que la fila devuelva **también** la política de `SELECT`. Como la política pública solo deja ver `answered`/`closed` y la fila nace `open`, ese insert devuelve `42501 new row violates row-level security policy`. **Por eso `sendSuggestion()` inserta sin `.select()`** (PostgREST usa `return=minimal` → 201). Matriz verificada: insert sin representation **201**, `select` anónimo **0 filas**, insert con representation **401**, insert con títulos cortos **23514** (chequeo).
- **`src/lib/suggestions.ts`**: `validateSuggestionInput`, `sendSuggestion` (con honeypot), `getPublishedSuggestions`, `getOpenSuggestions` y `answerSuggestion` (respeta el chequeo de consistencia).
- **`/reclamos`** (`src/pages/Reclamos.tsx`, ruta lazy): breadcrumb, JSON-LD `FAQPage` con 4 preguntas, panel "Cómo tratamos tu mensaje" (sin registro, correo opcional, Ley 21.719), formulario con honeypot y validación antes de enviar, confirmación de recepción, lista pública de respuestas con bloque "Respuesta de AutoLupa" y estado vacío.
- **`/moderacion`**: sección "Reclamos y sugerencias" con los pendientes, correo del autor, campo de respuesta y botones "Publicar respuesta" / "Cerrar" (cierra sin respuesta pública).
- **Enlaces**: pie de página (columna Legal) y sitemap +1 URL → 129.
- Tests: 113 (`src/test/suggestions.test.tsx`, 10 nuevos). lint 0, build OK con códigos de salida verificados.

## Lote 8 — Blog con detalle real y dos guías nuevas (30-09-2026)

- **Problema detectado**: `Blog.tsx` mostraba 9 tarjetas con "Leer más →" sin ruta de destino (no existía `/blog/:slug`), o sea enlaces muertos.
- **`src/data/articles.ts`**: modelo `Article` con `sections` (heading, párrafos, bullets) + `getArticleBySlug`. Quedan fuera las 9 guías aún sin cuerpo.
- **`src/pages/BlogArticle.tsx` + ruta `/blog/:slug`**: breadcrumb, `Article` + `BreadcrumbList` en JSON-LD (con `datePublished` ISO), secciones renderizadas y bloque "Sigue en AutoLupa" (usados, comparador, glosario, publicar). Slug desconocido → página no encontrada con `noIndex`.
- **Listado**: las guías publicadas enlazan a su detalle; las 9 pendientes muestran un chip **"En preparación"** (sin enlace, sin indexar).
- **Guías nuevas** (datos verificados contra ChileAtiende / Registro Civil):
  1. `transferencia-vehiculo-chile` — CAV (valor $1.560 según ChileAtiende, cómo pedirlo, qué revisar), documentos, trámite en el Registro Civil con hora previa y ClaveÚnica, tasación fiscal, pasos posteriores (permiso de circulación, SOA) y 4 señales de fraude.
  2. `revision-auto-usado-checklist` — papeles, carrocería, interior, motor, prueba de conducción, kilometraje (referencia 15.000 km/año) y cierre con precio comparado.
- **Sitemap**: +2 URLs de artículos (`/blog/{slug}`) → 128 URLs.
- Tests: 103 (`blogArticles.test.tsx`, 7 nuevos).

## Lote 7 — Portada liviana y CTA flotante móvil (30-09-2026)

- **Catálogo colapsado por defecto**: la portada muestra una grilla de **6 destacados** (`DESTACADOS`: Corolla, Tucson, Sportage, Swift, CX-5, Hilux — verificados en el catálogo) y un botón **"Ver catálogo completo (N vehículos)"**. El explorador completo (filtros + grilla + paginación) se revela al hacer clic, al buscar desde el buscador dual o cuando `isFiltering` está activo (filtros guardados de una sesión anterior).
- **`PublishFloat`**: CTA fijo "📢 Publicar gratis" solo en móvil (`sm:hidden`, `z-40`, con `env(safe-area-inset-bottom)`), ausente en `/publicar-auto`, `/mis-anuncios`, `/moderacion` y `/tus-datos`; el pie recibe `pb-24 sm:pb-0` para que no tape el último bloque.
- Hallazgo importante (verificación del flujo de invitado): `PUT /user {email}` devuelve **`email_address_invalid`** con dominios sin registros DNS (`autolupa.cl` no existe todavía) y **`email_address_not_authorized`** si el SMTP por defecto intenta enviar fuera de la organización Supabase. Confirma que **el SMTP propio sigue siendo blocker de producción**.
- Tests: 96 (`publishFloat.test.tsx`, 3 nuevos; `homeSearch.test.tsx` ampliado con destacados y apertura del catálogo).

## Lote 6 — Guía de fotos y recorte básico (30-09-2026)

- **Guía de fotos en `PublicarAuto` paso 2** (`<details>` "📐 Guía rápida de fotos"): portada 3/4 delantero a la altura del capó, luz sin contraluz, interior con km legibles, motor y arañazos, tapar datos en papeles y formato horizontal (la resolución ya la resuelve `prepareListingPhoto` a 1.800 px).
- **Recorte básico**: botón "✂︎ Ajustar" en cada miniatura que abre un encuadre **4:3** con arrastre (`pointer events` + `setPointerCapture`), slider de zoom (×1 a ×3 del encuadre) y `cropListingPhoto` en `src/lib/listingImages.ts` que recorta por canvas, centrado en la región visible y reescalado a 1.800 px máximo en JPEG 0,84.
- El arrastre queda limitado para que la imagen siempre tape el encuadre (`clampCropPos`) y la ventana de recorte se inicializa centrada según `clientWidth/clientHeight` del marco.
- Sin tests: jsdom no dispone de canvas ni carga imágenes (igual que `prepareListingPhoto`, que tampoco está cubierto).

## Lote 5 — Confianza: banner de seguridad y glosario en fichas (30-09-2026)

- **`src/components/Trust/SafetyBanner.tsx`** con dos contextos:
  - `used` (5 puntos): no transferir sin ver el auto, **certificado de anotaciones vigentes**, coincidencia VIN/motor con el permiso de circulación, precios sospechosos y aclaración de que AutoLupa no cobra comisión ni gestiones.
  - `new` (3 puntos): cotización por escrito, precio final con impuestos y entrega, y no pagar reservas a terceros.
- **Colocación**: ficha de aviso usado (`UsedListingDetail`, antes de "Reportar este aviso") y ficha de catálogo (`CarDetail`, bajo la descripción).
- **Glosario vinculado**: enlace dentro del banner y en el pie de `SmartAsk` (con `onClick={onClose}` para no dejar el modal abierto sobre `/glosario`).
- Tests: 92 (`src/test/safetyBanner.test.tsx`, 3 nuevos).

## Lote 4 — Buscador dual de la portada (30-09-2026)

- **Buscador dual en el hero** con pestañas `Autos nuevos` / `Autos usados`:
  - *Nuevos*: escribe en `searchQuery` (mismo estado que el `FilterPanel`) y al enviar hace scroll al catálogo usando el `catalogRef` que ya existía sin usar.
  - *Usados*: tiene su propio estado local para no ensuciar el filtro del catálogo y navega a **`/usados?q=…`** (aprovecha los parámetros del lote 3; sin texto va a `/usados`).
  - Bajo el input cambia el texto de apoyo según la pestaña (catálogo vs. avisos con contacto directo).
- **`RecentUsedListings`** sube de 4 a **8** avisos recientes.
- Tests: 89 (`src/test/homeSearch.test.tsx`, 3 nuevos: cambio de pestaña, envío a `/usados?q=` y escritura en el catálogo).

## Lote 3 — SEO local y sitemap dinámico (30-09-2026)

- **`src/data/chileRegions.ts`**: 16 regiones con slug, nombre corto (igual a `USED_REGIONS`), nombre oficial, capital, provincias, comunas y ciudades. Cifras verificadas contra el dato oficial: **346 comunas, 16 regiones, 56 provincias** (el total se assertúa en los tests).
- **`/autos-usados-en/:regionSlug`** (`src/pages/UsadosRegion.tsx`): landing SEO por región con breadcrumb, `CollectionPage` + `BreadcrumbList` + `ItemList` (JSON-LD), tarjetas de datos (capital/comunas/provincias/avisos activos), grid de los 16 avisos, estado vacío con CTA a publicar, skeleton de carga y bloque de navegación a todas las regiones. Slug desconocido → `noindex`.
- **URLs compartibles en `/usados`**: `?region=`, `?brand=` y `?q=` se leen al montar y se escriben con `replace: true` al filtrar; "Limpiar" borra los parámetros.
- **Enlace desde `/usados`** a las 16 regiones para el rastreo interno.
- **`scripts/generate-sitemap.mjs`** corriendo en `prebuild` (antes de `tsc && vite`): rutas estáticas + `/marca/{slug}` de los 98 catálogos + 16 landings + **avisos activos** leídos por REST con `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` (lee `.env` local si existe; si falla, avisa y sigue). Resultado actual: **126 URLs**.
- Tests: 86 (`src/test/seoLocal.test.tsx`, 6 nuevos).

## Backlog estratégico — Lotes 1 y 2 (30-09-2026)

- **SEO local**: título de la home «Autos Usados y Nuevos en Chile | Publica Gratis - AutoLupa», OG/keywords alineados y `<SEO>` explícito en Home.
- **Eslogan** «El auto que buscas, sin letra chica» en hero y footer.
- **CTA de publicación omnipresente**: navbar desktop, menú móvil, botón flotante en móvil y enlace desde el hero; `Publicar auto` salió de los links normales para no duplicarlo.
- **Sección de aprendizaje** (`/glosario`): 27 términos en 5 categorías con buscador y `DefinedTermSet` en JSON-LD; enlace en footer y sitemap.
- **`TermTip`**: tooltip con posicionamiento `fixed` + portal (no se corta con el `overflow` de modales y carruseles) que explica la terminología técnica en CarCard, CarDetail y CompareTable, con enlace al glosario. **Decisión del usuario: la terminología técnica se mantiene**, no se simplifica.
- Tests: 77 (`glossary.test.tsx` con 8).

## Datos electrificados completados (fichas oficiales 2026)
- Se cerró la brecha de **21 modelos EV/PHEV** sin batería/autonomía con fichas oficiales (BYD, Changan, Chery, Chevrolet, Deepal, GAC, Geely, Jetour, JMC, Neta, Soueast). Quedan **2** sin dato fiable: Lynk & Co 09 (consumo MHEV) y DFSK Glory iX5 (batería kWh)
- **Omoda C5 SHS reclasificado** a `hibrido`: ficha chilena confirma bat. auxiliar de 1,83 kWh sin autonomía EV (no era enchufable)