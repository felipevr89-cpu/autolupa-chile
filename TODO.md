# AutoLupa — Tareas Pendientes

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
- [ ] MG Cyberster duplicado (416, 423): diferenciar nombre
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

### Adecuación a la Ley 21.719 (vigente 01-12-2026)
- [ ] Completar información del responsable (razón social y RUT) en la política de privacidad
- [ ] Procedimiento de derechos del titular (acuse, 30 días, reclamo ante la Agencia)
- [ ] Bloqueo temporal con respuesta en 2 días hábiles
- [ ] Exportación de datos (portabilidad) y baja de cuenta (supresión)
- [ ] Registro de Actividades de Tratamiento (RAT)
- [ ] Runbook de reporte de brechas
- [ ] Sección de transferencias internacionales (Supabase, Cloudflare, Google)

---

## 🔵 Prioridad 5 — UX y rendimiento

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
- [ ] Blog / sección de guías de compra
- [ ] Landing pages por marca (ej: /marca/toyota)
- [ ] Meta tags optimizados por página
- [ ] Google Search Console setup
- [ ] Sitemap dinámico (generado desde datos)

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
