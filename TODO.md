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
- [ ] Páginas de aterrizaje por ciudad/comuna ("Autos usados en Providencia")
- [ ] Sitemap dinámico con los avisos activos
- [ ] Guías de compra nuevas (transferencia de vehículos, revisión de usado)
- [ ] Sección "Reclamos y Sugerencias" con respuesta pública

### Mes 2 — 🟡 UX
- [ ] Home con buscador dual (pestañas Nuevos / Usados) + 6–8 últimos avisos reales
- [ ] Guía de fotos para vendedores (ángulos, luz, resolución) y recorte básico
- [ ] Botón "Publicar gratis" flotante en móvil
- [ ] Reducir carga cognitiva: 6 destacados en home + "Ver catálogo completo"
- [ ] Favoritos con aviso de baja de precio o venta

### Mes 2–3 — 🟡 Confianza (diferenciador)
- [ ] "Sello AutoLupa" en fichas: identidad verificada, kilometraje declarado
- [ ] Verificación por teléfono/WhatsApp; RUT opcional con insignia
- [ ] Reputación de vendedores (ventas y estrellas)
- [ ] Banner de seguridad en cada ficha ("nunca transfieras sin ver el auto")
- [ ] Campaña "Sin letra chica": cero comisión por venta

### Nuevo — 📚 Sección de aprendizaje (terminología)
- [x] Glosario de términos automotrices (`/glosario`): 27 términos, 5 categorías, buscador y JSON-LD ✅ (30-09)
- [x] Explicaciones contextuales: `TermTip` con tooltip en CarCard, CarDetail y CompareTable ✅ (30-09)
- [ ] Vincular desde fichas de vehículo y desde SmartAsk (cuando el usuario pregunta "qué es un PHEV")

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
