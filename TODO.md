# AutoLupa — Tareas Pendientes

---

## 🗺️ Plan de mejoras hasta el 100% — Fases 0 / A / B / C (02-10-2026)

> **Premisa del usuario:** el marketplace se abre al público (gente publicando sus autos) **recién cuando el sitio esté al 100%**.
> Todo lo de la Fase A se construye con la página cerrada al público. Análisis comparativo contra Chileautos, Yapo, auto.cl, Autocosmos y AutosYa en `SUMMARY.md`.

### Fase 0 — Decisiones del usuario (paralelas, no consumen lotes)

- [ ] **0.1 Dominio `autolupa.cl`** + DNS (CNAME → Cloudflare) + 301 desde `.pages.dev` + correo `hola@autolupa.cl` → *contra 2 (tráfico/marca)*
- [ ] **0.2 Contratar SMTP** (Resend o Postmark) + SPF/DKIM/DMARC del dominio → sube `rate_limit_email_sent` (hoy 2 correos/hora) → *contra 8 (retención, reset de contraseñas, alertas)*
- [ ] **0.3 Razón social + RUT** en la política de privacidad (Ley 21.719 vigente 01-12-2026) → *contra 12*
- [ ] **0.4 Definir monetización** (gratis eterno vs planes desde el día 1) → *contra 3*
- [ ] **0.5 Definir el inventario de siembra** (avisos propios/de conocidos o alianza con 2-3 automotoras) → *contra 1 (liquidez)*
- [ ] **0.6 Cloudflare Turnstile** (antibot) → requiere crear el widget con el API token de Cloudflare que está en GitHub Secret `CLOUDFLARE_API_TOKEN` → *contra 9*
- [ ] **0.7 Google Search Console** → requiere la cuenta Google del usuario (propiedad + meta tag) → *contra 2/11*

### Fase A — Llegar al 100% (Lotes 15 → 23)

| Lote | Alcance | Contra | Estado |
|------|---------|--------|--------|
| **15** | **E-E-A-T y fuentes**: autor + fecha de revisión en los 11 artículos (`author`/`dateModified` en JSON-LD), fuentes citadas (CAVEM, ANAC, SII) y etiqueta "precios de referencia: catálogo AutoLupa, actualizado el…" | 11, 14 | ✅ hecho 02-10-2026 |
| **19** | **Rendimiento y SEO técnico**: code-splitting del `chunk index` (950 KB), lazy-load de imágenes, breadcrumb visible, meta tags por página, eventos de Plausible + Google Search Console | 2, 11 | ✅ hecho 02-10-2026 (index 1196→324 KB; GSC queda para Fase B por la cuenta Google) |
| **16** | **Tasador "¿cuánto vale tu auto?"**: `/tasar-auto` con depreciación (18/12/9/7%) + comparables del catálogo + CTA "publica a este precio" | 4 | ✅ hecho 02-10-2026 |
| **17** | **Búsquedas guardadas + alertas de nuevos avisos**: guardar la búsqueda en `/usados`, contador en navbar, avisos nuevos en `/favorites` (paridad con Chileautos) | 7 | ✅ hecho 02-10-2026 |
| **21** | **Robustez operativa**: anti-abuse en publicación (honeypot + cupo), límites/costos Supabase-Cloudflare con 1.000 fotos, backup+restore probado, matriz RLS re-ejecutada con roles reales, prueba end-to-end del ciclo completo de publicación | riesgo | ✅ hecho 06-10-2026 (ver "Lote 21" abajo y en `SUMMARY.md`) |
| **18** | **Cerrar las siluetas de foto** del catálogo (Commons + licencia, curaduría por modelo) + repuesto de los 11 ids abiertos de la auditoría de fotos: 65 modelos sin foto → **56 fotos nuevas** y **11 repuestas**, quedan 9 siluetas | 10 | ✅ hecho 06-10-2026 (ver "Lote 18" en `SUMMARY.md`) |
| **20** | **Crédito creíble**: simulador con tasas/CAE de mercado 2026 (no 11% fijo), pie mínimo, total pagado, CTA "pide cotización" | 5 | ✅ hecho 07-10-2026 (ver "Lote 20" en `SUMMARY.md`) |
| **22** | **Confianza visible**: badge público "vendedor con correo verificado" (migración + trigger sobre `auth.users`), "Sello AutoLupa", enlace a informe de historial y guía de transferencia, FAQ antiestafas | 6, 12 | ✅ hecho 07-10-2026 (ver "Lote 22" en `SUMMARY.md`; la migración queda pendiente de aplicar por el PAT 401) |
| **23** | **PWA y compartir**: instalable correcto en iOS, `Web Share API`, skeleton en todas las rutas | 13 | ✅ hecho 07-10-2026 (ver "Lote 23" en `SUMMARY.md`) |

- [ ] Pendientes heredados que entran en la Fase A: subir **vite/vitest** (rompe mayor, sólo afecta al dev server) y **revisar la CSP en navegador real** cuando esté conectado el de escritorio
- [x] ~~**Fotos de otra variante/generación** (11 ids de `IMAGE_AUDIT_REPORT.md`)~~ → repuestas en el **Lote 18** (104, 185, 187, 227, 309, 398, 413, 414, 447, 497, 512); auditoría 40/40

#### 📍 Lote 23 completado (07-10-2026) — qué quedó hecho

1. ✅ **PWA instalable en iOS**: `public/apple-touch-icon.png` (180), `icon-192.png` y `icon-512.png` generados desde el favicon con `scripts/generate-pwa-icons.py` (iOS no acepta iconos SVG); `index.html` suma `apple-touch-icon`, `apple-mobile-web-app-capable`, `mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style` y `apple-mobile-web-app-title`; `public/manifest.json` declara además los PNG 192/512 (el SVG se mantiene para navegadores de escritorio).
2. ✅ **`<InstallHint>` en el pie** (`src/components/Layout/InstallHint.tsx`): en iPhone, Safari no dispara `beforeinstallprompt`, así que muestra los pasos «Compartir → Añadir a pantalla de inicio»; en Chrome/Android captura el evento y ofrece «Instalar». Se oculta en modo standalone (app ya instalada) y el descarte queda en `localStorage`.
3. ✅ **Web Share API**: `src/components/Share/ShareButton.tsx` usa `navigator.share` y, si no existe o falla, copia el enlace («¡Enlace copiado!»; «No se pudo copiar» si tampoco hay `clipboard`), sin castigo si el usuario cancela (`AbortError`). Colocado en la ficha del aviso (`/usados/:slug`), la guía del blog (`/blog/:slug`) y la ficha del auto (junto al compartir por WhatsApp).
4. ✅ **Skeleton sin estados vacíos falsos**: `ModeracionUsados` dejó de mostrar «No hay avisos pendientes» mientras carga (`queueLoading` + 3 skeletons y contadores en «…»), y `Reclamos` ya no muestra «Todavía no hay respuestas publicadas» ni «0 respuestas» antes de que responda el servicio. El resto de las rutas ya tenía skeleton (Suspense por ruta + `Usados`, `UsadosRegion`, `UsedListingDetail`, `MisAnuncios`, `Favorites`).
5. ✅ Tests 198 → **214**; lint/test/build en 0.

Tests nuevos: `src/test/share.test.tsx` (7: compartir nativo, copia de enlace, cancelación, fallo del navegador y las 3 caras del aviso de instalación), `src/test/pwaAssets.test.ts` (5: manifest, dimensiones reales de los PNG desde su cabecera IHDR, meta de iOS y registro del SW), `src/test/moderationLoad.test.tsx` (2) y `src/test/reclamosLoad.test.tsx` (2).

#### 📍 Lote 22 completado (07-10-2026) — qué quedó hecho

1. ✅ **Bug crítico de producción resuelto**: las consultas de avisos usaban el embed `seller:profiles(...)`, que **no existe como FK** → PostgREST devolvía `400 PGRST200` y `/usados` y la ficha mostraban «No pudimos cargar los avisos». Se quitó el embed y los perfiles se traen con `attachSellers()` en un batch tolerante a fallo (`src/lib/usedListings.ts`).
2. ✅ Badge **«Correo del vendedor verificado»** en la ficha del detalle, cargado con query degradable: si falta la columna `profiles.email_verified` se oculta sin romper nada.
3. ✅ Migración `supabase/migrations/202610070001_seller_email_verified.sql` (columna + trigger `sync_profile_email_verified` sobre `auth.users` + backfill + `notify pgrst`) y `scripts/apply-migration.mjs` para aplicarla por la Management API.
4. ✅ `<AutoLupaSeal>` (sello de moderación, contacto directo, datos del vendedor), `<DocumentLinks>` (anotaciones vigentes, guía de transferencia, checklist) y **FAQ antiestafas `/faq`** con `FAQPage` JSON-LD, enlazada desde el pie y el sitemap.
5. ✅ Tests 189 → **198**; lint/test/build en 0.

**Pendiente de este lote**: aplicar la migración — el PAT `SUPABASE_ACCESS_TOKEN` de `.env` responde **401** en `api.supabase.com` → renovarlo en <https://supabase.com/dashboard/account/tokens> y ejecutar `node scripts/apply-migration.mjs supabase/migrations/202610070001_seller_email_verified.sql` (o pegar el SQL en el dashboard). Con ella aplicada: re-ejecutar `scripts/rls-matrix.mjs` y confirmar el badge en producción (ya se enciende sin nuevo push).

#### 📍 Lote 21 completado (06-10-2026) — qué quedó hecho

**Alcance aprobado y ejecutado completo** (Turnstile y Google Search Console quedan en Fase 0.6 / 0.7, dependen de credenciales del usuario):

1. ✅ `src/lib/antiAbuse.ts` + hook en `submit()` de `PublicarAuto.tsx`: honeypot `website` en el paso 4, trampa de tiempo ≥2 s desde el montaje y cupo cliente de 5 publicaciones/24 h en `localStorage`; errores genéricos idénticos para bots.
2. ✅ `supabase/migrations/202610020001_publish_limits.sql` **aplicada a producción**: trigger `enforce_publish_limits` (20 activos + 5 creaciones/24 h, se salta con `auth.uid()` nulo) y verificado con usuarios reales.
3. ✅ `scripts/backup-supabase.mjs` ejecutado (7 tablas → `supabase/backups/`, en `.gitignore`) y restore documentado en `supabase/README.md`.
4. ✅ `scripts/rls-matrix.mjs`: matriz 15/15 + 4/4 + 2 límites + 1 E2E = **22/22 PASS**, con limpieza verificada (0 filas).
5. ✅ Resultados en `supabase/README.md` y `SUMMARY.md`, lint/tests/build en 0.

**Pendiente heredado de este lote** (queda para Fase 0.6/0.7 o más adelante): límite de frecuencia para **reportes** (hoy sólo throttle de 30 s en el cliente), Cloudflare Turnstile y costos de 1.000 fotos en Supabase/Cloudflare.

**Definición de "100%" para abrir la publicación:** Fase 0 (0.1-0.3) completa + Lotes 15-23 ejecutados + Fase B verde.

### Fase B — Apertura controlada

> **Estado 07-10-2026:** la parte de ingeniería quedó preparada (métricas completas, smoke de producción en verde, URLs del sitio centralizadas en `VITE_SITE_URL`). Los 7 puntos dependen de credenciales o decisiones del usuario, salvo los indicados.

| # | Requisito | Estado | Falta / quién |
|---|-----------|--------|----------------|
| 1 | `autolupa.cl` en línea con 301 desde `.pages.dev` | ⛔ | **Fase 0.1** (comprar dominio + DNS). Al cambiarlo: `VITE_SITE_URL` en `.github/workflows/deploy.yml`, `index.html` (canonical, `og:url`, `og:image`, `twitter:image` y el `data-domain` de Plausible), `public/robots.txt` (línea `Sitemap`), `public/.well-known/security.txt` y `scripts/generate-sitemap.mjs`; el JS ya lee `VITE_SITE_URL` |
| 2 | SMTP activo y **bucle real verificado**: `updateUser({email}) → clic → publicar` | ⛔ | **Fase 0.2** (contratar Resend/Postmark + SPF/DKIM/DMARC); el clic real y la verificación final del trigger quedan para esa ventana |
| 3 | Matriz de RLS 15/15 + 4/4 de moderación re-ejecutada | ⛔ | Renovar el PAT (`SUPABASE_ACCESS_TOKEN`, hoy 401) → `node scripts/apply-migration.mjs supabase/migrations/202610070001_seller_email_verified.sql` y luego `node scripts/rls-matrix.mjs`. Última corrida: **22/22 el 06-10-2026** |
| 4 | **Siembra de 10-20 avisos reales** con fotos reales | ⛔ | **Fase 0.5** (inventario del usuario) |
| 5 | Google Search Console + sitemap con los primeros avisos activos | ⛔ | **Fase 0.7** (cuenta Google). El sitemap ya está listo: 140 URLs, incluye `/faq`, suma los avisos activos al regenerarse en cada build (hoy 0, coherente con la siembra pendiente) |
| 6 | Primera semana con moderación estricta (todo `pending`) y métricas en Plausible | 🟡 | Moderación estricta ✅ (RLS + `require_verified_seller` + `enforce_publish_limits`: todo entra `pending`); métricas ✅ (11 eventos); falta **vivir** la primera semana tras abrir |
| 7 | Campaña "Publica gratis, sin comisión" | ⛔ | El bloque ya existe en el home; falta lanzar la campaña |

#### ✅ Avances de Fase B hechos el 07-10-2026

1. **Métricas completas del embudo en Plausible** (`window.plausible` con `data-domain="autolupa.pages.dev"`): existían 7 eventos (`Search`, `Compare`, `Favorite`, `Publish`, `Valuation`, `Wizard`, `ContactSeller`); se suman **`ContactSeller {origen:'auto'}`** (WhatsApp desde la ficha del auto), **`Share {origen, accion}`** (nativo / copiado / error) en el `ShareButton`, **`Report`** al enviar un reporte, **`SavedSearch {accion}`** (guardar/quitar) y **`Install {accion}`** (instalar/descartar). Además `ContactSeller` del aviso ahora envía `origen: 'aviso'` junto a `region`.
2. **Smoke de producción en verde**: 20 rutas (`/`, `/usados`, `/faq`, `/blog`, `/glosario`, `/top10`, `/tasar-auto`, `/reclamos`, `/compare`, `/favorites`, `/publicar-auto`, `/mis-anuncios`, `/moderacion`, `/autos-usados-en/:region`, `/marca/:brand`, 404 incluida) → **200**; `/sitemap.xml` (140 URLs), `/robots.txt`, `/manifest.json` y `/sw.js` → **200**.
3. **URL del sitio sin hardcodear en el JS**: el JSON-LD del glosario y las URLs de compartir por WhatsApp (tarjeta y ficha) ahora usan `import.meta.env.VITE_SITE_URL || 'https://autolupa.pages.dev'`, igual que el resto; el cambio de dominio queda reducido a la lista de archivos de la fila 1.
4. Gate: `LINT=0 · TEST=217/217 · BUILD=0`.

### Fase C — Post-lanzamiento (no hacer antes: requiere tráfico, dinero o socios)

Chat en tiempo real · reputación/estrellas de vendedores · integración Autofact (historial) y transferencia · financiamiento real con bancos · plan de pagos/destacados · app nativa · motos/camiones/arriendo · páginas por comuna (346) · ads/afiliados · verificación WhatsApp Business · newsletter con SMTP.

### Contra → fase

| # | Contra detectado en el análisis | Dónde se ataca |
|---|--------------------------------|----------------|
| 1 | Inventario = 0 | Fase B (siembra) + 0.5 |
| 2 | Tráfico, marca y dominio | 0.1 + Lote 19 |
| 3 | Sin modelo de ingresos ni socios | 0.4 + Fase C |
| 4 | Sin tasador/"¿cuánto vale mi auto?" | Lote 16 |
| 5 | Sin financiamiento real | Lote 20 ✅ (simulador con tasas de mercado) → Fase C (socios financieros) |
| 6 | Sin historial de informe ni transferencia | Lote 22 (parcial) → Fase C |
| 7 | Sin alertas de nuevos avisos por búsqueda | Lote 17 |
| 8 | Email capado a 2 correos/hora | 0.2 |
| 9 | Sólo autos livianos | decisión: se mantiene al abrir → Fase C |
| 10 | Modelos sin foto: 65 → **9** (Lote 18 ✅; los restantes no tienen equivalencia en Commons) | Lote 18 ✅ |
| 11 | E-E-A-T del contenido débil | Lote 15 + 19 |
| 12 | Sin soporte humano | Lote 22 (FAQ) → Fase C |
| 13 | Sin app nativa | Lote 23 ✅ (PWA instalable + Web Share) → Fase C (app nativa) |
| 14 | Precios de catálogo sin fuente ni fecha | Lote 15 |

**Orden de ejecución acordado:** `15 → 19 → 16 → 17 → 21 → 18 → 20 → 22 → 23 → Fase B`

---

## 🔴 Prioridad 1 — Renombrar: AutoLupa ✅ COMPLETADO

- [x] Elegir nombre: **AutoLupa** 🔍
- [x] Cambiar `name` en `package.json`
- [x] Cambiar `title` y `og:title` en `index.html`
- [x] Actualizar `manifest.json` (name, short_name)
- [x] Actualizar `Navbar.tsx` (logo 🔍 + texto AutoLupa)
- [x] Actualizar `Footer.tsx` (copyright, email)
- [x] Actualizar `SEO.tsx` (title, description, canonical)
- [x] Actualizar `sitemap.xml`
- [x] Actualizar `wrangler.toml`
- [x] Crear proyecto `autolupa` en Cloudflare Pages
- [x] Actualizar workflow deploy → `autolupa`
- [x] Actualizar `AGENTS.md` y `SUMMARY.md`
- [x] Reemplazar todas las menciones a "AutoMatch" en código
- [x] Verificar: 0 referencias a "AutoMatch" en código

### Pendiente
- [ ] Comprar dominio `autolupa.cl` (opcional, el `.pages.dev` funciona)

---

## 🟠 Prioridad 2 — Deploy y estabilidad ✅ COMPLETADO

- [x] Commit de pase de fotos 2026 + funcionalidades
- [x] Push a GitHub
- [x] Deploy automático a Cloudflare Pages (`autolupa.pages.dev`)
- [x] Verificar deploy (workflow ejecutado)

### Pendiente
- [ ] Confirmar que las 131 fotos nuevas cargan en producción (visitar `autolupa.pages.dev`)
- [ ] Verificar Performance (Lighthouse) — chunk index >950 KB

---

## 🔵 Iteraciones 10-2026 — Seguridad, publicación y verificación

- [x] **Seguridad**: dependencias parchadas (`npm audit --omit=dev` → 0), CSP + `nosniff` + HSTS + `frame-ancestors` en `_headers`, `no-store` para `/tus-datos`, `.well-known/security.txt`, throttle de 30 s en reclamos y escaneo de secretos ✅ (01-10)
- [ ] Seguridad: subir vite/vitest a las versiones parchadas (rompe mayor; hoy solo afecta al dev server local)
- [ ] Seguridad: abrir autolupa.pages.dev con el navegador de escritorio conectado y revisar la consola por violaciones de CSP (hoy solo se verificó por curl + HTML servido)
- [ ] Seguridad: decidir si se endurece `script-src` (quitar `'unsafe-inline'`) usando hashes en lugar de JSON-LD inline
- [x] **Publicación**: edición de mis avisos (precio, km, color, región, comuna, descripción y contacto) con validación propia y aviso de que el cambio vuelve el aviso a revisión ✅ (01-10)
- [x] **Verificación**: estado real del correo en `/mis-anuncios` (chip verificado / verificando / sin correo), botón «Reenviar enlace» y traducción del límite de 2 correos por hora a español ✅ (01-10)
- [ ] Verificación: badge público «vendedor con correo verificado» en el detalle del aviso (exige migración con columna + trigger sobre `auth.users` y volver a correr la matriz de RLS con roles reales)
- [ ] Verificación: clic real en el enlace de correo para cerrar el bucle `updateUser({email}) → confirmar → publicar` (pendiente del SMTP por hora)

---

## 🟡 Prioridad 3 — Auditoría y limpieza de datos ✅ COMPLETADO

- [x] Navbar decía "AutoMatch" → corregido
- [x] Wizard km/mes irreales → km/año basado en Autofact (15k-27k normal)
- [x] Hyundai Tucson: fuel → `hibrido` (HEV convencional)
- [x] Suzuki Across: fuel → `hibrido` (MHEV, mild hybrid)
- [x] Changan Hunter: fuel → `electrico` (EREV/REEV)
- [x] Descripciones actualizadas con nomenclatura real
- [x] Chery PHEV: consumo unidades corregidas (l/100km → km/l)
- [x] Hyundai Tucson: consumo 50 → 17 km/l
- [x] Chevrolet Montana: precio base corregido
- [x] Origen "china" → "China" (100+ autos)
- [x] Comparador: docs actualizados (límite = 3)
- [x] Documento AUDITORIA.md creado

### Pendiente (verificado en auditoría)
- [ ] Deepal G318 (140), S07 (142), Jaecoo J7 SHS (273): sin consumo PHEV → verificar ficha oficial
- [ ] Toyota C-HR/Corolla/RAV4, Kia Sportage: versiones híbridas bajo tipo base (inconsistente)
- [ ] Kia Niro (319): 3 tipos en una entrada → considerar separar
- [ ] Hyundai Porter (254): ¿gasolina o diésel en Chile 2026?
- [x] MG Cyberster duplicado (416, 423) → **resuelto 09-10-2026**: eran 2 versiones del mismo modelo (77kWh 2WD $59,99M / AWD $67,99M, fuentes mgmotor.cl + Pompeyo/Difor); entrada única id 423 con batería 77 kWh, id 416 eliminado con su foto duplicada (bytes idénticos)
- [ ] Redundancia `origin`/`origin_country` → unificar a uno solo
- [ ] Favicon: crear logo 🔍 de AutoLupa

---

## 🟢 Prioridad 4 — Marketplace de Usados

- [x] Backend Supabase (Postgres, Auth y Storage)
- [x] Formulario de publicación de vehículos en 4 pasos
- [x] Upload y optimización de fotos en Storage
- [x] Moderación / aprobación de publicaciones
- [x] Filtros por marca, región, combustible, transmisión, año, precio y kilometraje
- [x] Paginación, detalle por slug, contacto WhatsApp y reportes
- [x] Gestión de avisos del vendedor
- [ ] Chat en tiempo real entre comprador y vendedor
- [ ] Geolocalización fina y mapa de avisos
- [ ] Sitemap server-side de listings activos
- [ ] Migrar listings antiguo de `localStorage` (no son datos públicos)

### Configuración externa ✅ (29-09-2026)
- [x] Proyecto Supabase creado y migración ejecutada
- [x] Google OAuth (consent screen + provider)
- [x] Secrets de GitHub Actions (URL y anon key)
- [x] Matriz de RLS verificada con usuarios reales (15/15)

### Adecuación a la Ley 21.719 (vigente 01-12-2026) ✅ (30-09-2026)
- [x] Completar información del responsable (razón social y RUT) en la política de privacidad → **sigue PENDIENTE, depende del usuario**
- [x] Procedimiento de derechos del titular (acuse, 30 días, reclamo ante la Agencia)
- [x] Bloqueo temporal con respuesta en 2 días hábiles
- [x] Exportación de datos (portabilidad) y baja de cuenta (supresión) — `/tus-datos`
- [x] Registro de Actividades de Tratamiento (RAT) — `docs/RAT.md`
- [x] Runbook de reporte de brechas — `docs/runbook-brechas.md`
- [x] Sección de transferencias internacionales (Supabase, Cloudflare, Google)

---

## 🟠 Backlog estratégico (posicionar como portal #1 de Chile)

Regla del usuario: **mantener la terminología técnica** ("Híbrido Enchufable", "Transmisión CVT") —
el detalle es útil al comprar y además educa al usuario. Se agrega en su lugar una sección de aprendizaje.

### Semana 1 — 🔴 Urgente
- [ ] Dominio `autolupa.cl` (decisión y compra del usuario) + redirección desde `autolupa.pages.dev`
- [x] Eslogan de marca y bloque "Publica gratis, sin comisión" en header, hero y botón flotante móvil ✅ (30-09)
- [x] Título SEO de la home: "Autos Usados y Nuevos en Chile | Publica Gratis - AutoLupa" ✅ (30-09)

### Semanas 1–3 — 🔴 Formulario en 3 pasos
- [x] Paso 1 Datos del auto (marca, modelo, año, color, combustible, transmisión) ✅ (30-09)
- [ ] Autocompletado de marca/modelo/año desde el catálogo de 626 vehículos
- [x] Paso 2 Fotos múltiples con optimización en el navegador (1 a 8) ✅ (30-09)
- [ ] Drag & drop real en el paso de fotos (hoy es input de archivos)
- [x] Paso 3 Contacto con verificación de email **sin crear cuenta**: sesión anónima + `updateUser({email})` ✅ (30-09)
- [ ] Verificación por WhatsApp (requiere proveedor SMS/WhatsApp Business)
- [x] La moderación `pending` no se salta: trigger + RLS verificados 4/4 ✅ (30-09)
- [ ] **🔴 Contratar SMTP**: `rate_limit_email_sent` está en **2 correos/hora** y no se puede subir sin SMTP propio. Sin esto el flujo de invitado no aguanta producción (tampoco los restablecimientos de contraseña).
- [ ] Probar el envío real de `updateUser({email})` cuando la ventana de 2 correos/hora se reinicie

### Mes 1 — 🟠 Contenido y SEO
- [x] Páginas de aterrizaje por región: `/autos-usados-en/:slug` (16 landing SEO con breadcrumbs, JSON-LD y contadores) ✅ (30-09)
- [x] Filtros compartibles: `/usados?region=`, `?brand=` y `?q=` se leen y escriben en la URL ✅ (30-09)
- [x] Sitemap dinámico en `prebuild` (`scripts/generate-sitemap.mjs`): 12 estáticas + 98 marcas + 16 regiones + avisos activos ✅ (30-09)
- [ ] Páginas por comuna (346) cuando haya masa de avisos por región
- [x] Guías de compra nuevas: **transferencia de vehículo en Chile** (CAV $1.560, documentos, Registro Civil, permiso de circulación y SOA) y **checklist de revisión de usado** ✅ (30-09)
- [x] Ruta `/blog/:slug` con detalle real (SEO + JSON-LD Article/Breadcrumb): antes las 9 tarjetas del blog eran enlaces muertos ✅ (30-09)
- [x] Escribir el cuerpo de las 9 guías anteriores ✅ (01-10) — las 9 con `sections` reales, 11 artículos enlazados y chip "En preparación" eliminado
- [x] Sección "Reclamos y Sugerencias" con respuesta pública: tabla `suggestions` + RLS, `/reclamos` con FAQ y lista de respuestas, y respuesta desde `/moderacion` ✅ (01-10)

### Mes 2 — 🟡 UX
- [x] Home con buscador dual (pestañas Autos nuevos / Autos usados) + 8 últimos avisos reales ✅ (30-09)
- [x] Guía de fotos para vendedores (ángulos, luz, papeles y formato) + **recorte básico** con arrastre y zoom en encuadre 4:3 ✅ (30-09)
- [x] Botón "Publicar gratis" flotante en móvil (`PublishFloat`, oculto en /publicar-auto, /mis-anuncios, /moderacion y /tus-datos) ✅ (30-09)
- [x] Reducir carga cognitiva: la portada muestra **6 destacados** (Corolla, Tucson, Sportage, Swift, CX-5, Hilux) y el catálogo completo (filtros + paginación) se abre con "Ver catálogo completo", al buscar o si ya hay filtros guardados ✅ (30-09)
- [x] Favoritos con aviso de baja de precio o venta ✅ (01-10) — panel de bajas en `/favorites` + "Guardar avisos" con precio en vivo y detección de aviso retirado

### Mes 2–3 — 🟡 Confianza (diferenciador)
- [ ] "Sello AutoLupa" en fichas: identidad verificada, kilometraje declarado
- [ ] Verificación por teléfono/WhatsApp; RUT opcional con insignia
- [ ] Reputación de vendedores (ventas y estrellas)
- [x] Banner de seguridad en cada ficha (`SafetyBanner`: anotaciones vigentes, VIN, transferencia y comisión cero) ✅ (30-09)
- [ ] Campaña "Sin letra chica": cero comisión por venta

### Nuevo — 📚 Sección de aprendizaje (terminología)
- [x] Glosario de términos automotrices (`/glosario`): 27 términos, 5 categorías, buscador y JSON-LD ✅ (30-09)
- [x] Explicaciones contextuales: `TermTip` con tooltip en CarCard, CarDetail y CompareTable ✅ (30-09)
- [x] Vinculo al glosario desde las fichas (dentro del banner de seguridad) y desde el pie del recomendador SmartAsk ✅ (30-09)

### Mes 4–6 — 🟢 Monetización
- [ ] Freemium: estándar gratis (10 fotos, 60 días) / destacado $3.990 / premium $7.999
- [ ] Panel de vendedor con estadísticas (visitas, contactos WhatsApp)
- [ ] Publicidad no invasiva y leads para concesionarias
- [ ] Cuadro comparativo "gratis vs. pagado" antes de publicar

### No hacer (decisión del usuario)
- ~~Eliminar el término técnico y usar solo lenguaje simple~~ → **se mantiene la terminología técnica**
- ~~Eliminar "Comparador" como etiqueta~~ → pendiente de evaluar, no descartado



- [ ] Code-splitting del chunk index (950 KB) → lazy load por ruta
- [ ] Lazy load de imágenes del catálogo (IntersectionObserver)
- [ ] Skeleton loading mejorado en todas las páginas
- [ ] Breadcrumb visible en todas las rutas internas
- [ ] Share buttons (WhatsApp, copiar link)
- [ ] PWA: notificaciones push para nuevos lanzamientos
- [ ] Analytics (Plausible/Umami, sin cookies)

---

## 🟣 Prioridad 6 — SEO y marketing

- [ ] Structured data (JSON-LD) para autos
- [x] Blog / sección de guías de compra ✅ (01-10) — 11 artículos con detalle en `/blog/:slug`, JSON-LD Article y en el sitemap
- [x] Landing pages por marca (`/marca/:brandSlug`, 98 catálogos) ✅ (09-2026)
- [ ] Meta tags optimizados por página
- [ ] Google Search Console setup
- [x] Sitemap dinámico (`scripts/generate-sitemap.mjs` en `prebuild`, 138 URLs) ✅ (30-09)

---

## ⚪ Prioridad 7 — Monetización (futuro)

- [ ] Google AdSense / ads contextuales
- [ ] Afiliados (seguros, créditos, accesorios)
- [ ] Featured listings (pago por destacar)
- [ ] API pública del catálogo (B2B)

---

## 📊 Resumen de lo hecho hoy

| Área | Estado |
|------|--------|
| Rename AutoMatch → AutoLupa | ✅ |
| Deploy a Cloudflare Pages | ✅ |
| Wizard km → km/año (Autofact) | ✅ |
| Navbar logo/texto | ✅ |
| Combustibles: Tucson/Across/Hunter | ✅ |
| Consumo PHEV Chery | ✅ |
| Consumo Tucson | ✅ |
| Precio Montana | ✅ |
| Orígenes capitalizados | ✅ |
| Docs comparador | ✅ |
| 65/65 tests, lint 0, build OK | ✅ |
| Marketplace Supabase, formulario, filtros, SEO y moderación | ✅ |
| RLS, máquina de estados, proyección pública y fotos no enumerables | ✅ matriz 15/15 verificada con usuarios reales (29-09-2026) |
| Configuración externa (migración, OAuth, GitHub Secrets) | ✅ |
| Renombrado AutoMatch → AutoLupa (carpeta y código) | ✅ |
