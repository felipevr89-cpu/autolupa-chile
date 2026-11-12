# AutoLupa - Contexto del Proyecto

## Información General
- **Nombre:** AutoLupa
- **URL:** https://autolupa.pages.dev
- **Descripción:** Marketplace de autos usados y comparador de vehículos del mercado chileno
- **Tecnologías:** React 18 + Vite + TypeScript + Tailwind CSS 3 (plugin `@tailwindcss/vite` instalado pero la configuración vigente es v3) + Supabase
- **Hosting:** Cloudflare Pages
- **API Token Cloudflare:** NO almacenado en el repo. Usar GitHub Secret `CLOUDFLARE_API_TOKEN` (ver `.github/workflows/deploy.yml`).

## Comandos Útiles
```bash
# Desarrollo local
npm run dev

# Test (vitest)
npm test

# Lint
npm run lint

# Build (tsc -b + vite + prerender de 836 rutas y 404.html)
npm run build

# Deploy Cloudflare (token vía GitHub Secret, no en el repo)
npm run build && CLOUDFLARE_API_TOKEN="${{ secrets.CLOUDFLARE_API_TOKEN }}" npx wrangler pages deploy dist --project-name=autolupa --branch main
```

## Estructura del Proyecto
```
src/
├── components/
│   ├── Calculator/
│   │   └── CreditCalc.tsx       # Simulador de crédito (tasas de mercado 2026)
│   ├── Cars/
│   │   ├── CarDetail.tsx        # Modal de detalle + TCOCalculator + aviso "no en Chile"
│   │   ├── CarImage.tsx         # Imagen del carro con fallback a silueta
│   │   ├── CarGrid.tsx / CarCard.tsx / CarRail.tsx
│   │   └── carSilhouettes.tsx   # Siluetas SVG por tipo de vehículo
│   ├── Compare/                 # Barra + tabla comparativa
│   ├── EV/EVHub.tsx             # Hub de eléctricos (marca EV > 2021; 25% permiso)
│   ├── Filters/FilterPanel.tsx  # Filtros con años dinámicos
│   ├── Guides/BuyingGuide.tsx
│   ├── Layout/                 # Navbar + InstallHint (aviso de instalación PWA)
│   ├── TCO/TCOCalculator.tsx    # UI del TCO (plazo 48, km/mes 1000)
│   ├── Share/ShareButton.tsx    # Web Share API con fallback a copiar enlace
│   ├── Trust/                   # SafetyBanner, AutoLupaSeal, DocumentLinks
│   └── Wizard/AutoWizard.tsx    # 8 pasos + afinidad absoluta + fotos
│   ├── Wizard/SmartAsk.tsx      # Buscador por lenguaje natural (recomendador semántico)
│   └── Used/                    # Tarjetas, últimos avisos, DemoListings y ServiceNotice (caída del backend)
├── data/
│   ├── brands/                  # Un JSON por marca (allBrands vía import.meta.glob)
│   │   └── index.ts             # carsData, brandUrls, BRANDS_NOT_SOLD_NEW_IN_CHILE
│   ├── carImages.json           # Mapeo id → { file, source, license } o null (653 claves; ids 678–696 sin clave usan silueta)
│   ├── credit.ts                # Tasas de crédito mercado 2026 + simulateCredit + monthlyPayment
│   ├── energyCosts.ts           # HOME_KWH 150 / FAST_KWH 350 / gasolina 1300 / diesel 1150
│   ├── enrichment.ts            # Completa rango/batería/seguridad por marca|modelo
│   ├── recommender.ts           # Motor semántico local: parseQuery + scoreRecommendation + recommend
│   ├── tco.ts                   # calculateTCO + getPermisoCirculación (fórmula SII)
│   └── usedListings.ts          # Tipos, validación y filtros de usados
├── hooks/
│   └── useCars.ts               # Filtros con persistencia y favoritos en Supabase
├── pages/
│   ├── Home.tsx                 # NOVEDADES_2026 curadas, Recientes, isFiltering dinámico
│   ├── Usados.tsx               # Marketplace, filtros y CTA de publicación
│   ├── PublicarAuto.tsx         # Formulario de publicación en 4 pasos
│   ├── UsedListingDetail.tsx    # Detalle SEO de cada aviso
│   ├── MisAnuncios.tsx          # Gestión del vendedor
│   ├── ModeracionUsados.tsx     # Cola privada de revisión y reportes
│   ├── Faq.tsx                  # FAQ antiestafas /faq (FAQPage JSON-LD)
│   ├── Top10.tsx                # 7 categorías con ?cat=
│   ├── Favorites.tsx / Compare.tsx / Estadisticas.tsx / NotFound.tsx
├── lib/                         # supabase, backendStatus, brandSlug (ASCII), carSlug, usedListings, gaps…
├── test/                        # vitest: brands, tco, credit, energyCosts, CompareTable, listingSeller, trust, share, pwaAssets, moderationLoad, reclamosLoad, analytics, multiSelectDropdown
├── types/index.ts               # Car, Filters (yearRange), User
├── App.tsx                      # Rutas, PageSkeleton, useCars
└── main.tsx                     # Registro service worker PWA
```

## Funcionalidades Implementadas

### Core
- **Catálogo**: 688 vehículos y 1.488 versiones, 98 marcas en `src/data/brands/*.json`
- **Búsqueda y filtros**: Marca, modelo, tipo, combustible, precio, años (rango dinámico), tracción, asientos
- **Comparación**: Hasta 3 vehículos lado a lado (CompareTable)
- **Favoritos**: Sync con Supabase para usuarios autenticados + localStorage como respaldo
- **Detalle completo**: Modal con specs, versiones, seguridad, `?cat=` directo

### Marca y catálogo
- **Buscador primario en home**: input grande, filtros rápidos (marca, precio, año, tipo, región) y CTA «Buscar»; redirige a `/autos` con `marca`, `precio_min`, `precio_max`, `year`, `tipo`, `region` y `q`.
- **Grid de marcas**: 98 marcas ordenadas por top ANAC y luego alfabéticamente; enlazan a `/marcas/{slug}` con `Brand` + `BreadcrumbList`. `/marca/{slug}` queda como alias.
- **Cobertura**: `npm run audit:coverage` + `src/test/coverage.test.ts` validan top 24 ANAC, modelos obligatorios y paridad tasador/catálogo.
- **Usados sin inventario**: `/usados` muestra 24 ejemplos locales marcados «Ejemplo» (no persistidos) hasta que haya avisos reales.
- **Marca no vendida nueva en Chile** (`BRANDS_NOT_SOLD_NEW_IN_CHILE`): Acura, Buick, Chrysler, GMC, Infiniti, Lincoln → badge en card, aviso en detalle, sufijo en filtros. Decisión del usuario: no eliminar, marcar.
- **Novedades curadas**: `NOVEDADES_2026` (12 lanzamientos) por brand+model, priorizando año 2026.

### TCO (`src/data/tco.ts`) + `TCOCalculator`
- Crédito francés con tasa típica de mercado 2026 (1% mensual ≈ CAE ref. 12,68%), plazo 48 (default), SOAP por tramo, seguro 1,5%, mantención por combustible.
- **Permiso de circulación SII** (FAQ 001.170.5079.007): escala progresiva 1–4,5%, mín. 0,5 UTM ($34.876); UTM 2026 = $69.751; EV/PHEV año ≥2021 → 25% (Ley 21.505); tasación ≈ precio × 0,9^antiguedad.
- **Depreciación** anual según antigüedad (18/12/9/7%).
- **Carga mixta** EV/PHEV: 80% hogar ($150) + 20% rápida ($350) ≈ $190/kWh; los híbridos no enchufables pagan solo combustible; aviso UI si falta batería/autonomía.
- **Costo mensual** = intereses promedio del crédito + SOAP + permiso + seguro + mantención + depreciación + energía. La cuota completa se muestra aparte como referencia (incluye capital, que no es costo; sumarla junto a la depreciación era doble conteo). `total5Years` = intereses totales + 60 meses de costos corrientes.

### Crédito (`src/data/credit.ts`) + `CreditCalc`
- Tasas de mercado Chile 2026: **0,7% / 1,0% / 1,5% mensual** (escenarios) → CAE de sólo interés 8,7% / 12,7% / 19,6%. **Pie mínimo 10%** (bancos piden 20–25%) y plazos **12–60 meses**.
- `simulateCredit` devuelve pie, monto, cuota francesa, total pagado, costo del crédito y CAE ref.; `CreditCalc` (ficha del auto) suma la CTA **«Pide tu cotización»** por WhatsApp con la simulación. No es oferta de crédito: sin seguros ni gastos en el CAE.

### Wizard (`AutoWizard.tsx`)
- 8 pasos: presupuesto, uso, combustible, prioridad, km/mes, transmisión, asientos, tracción.
- Afinidad **absoluta**: `scoreCar` → `{score, max}`; el gate exige todas las respuestas.
- Resultados con fotos reales (CarImage), no gradientes de marca.

### Recomendador semántico local (`SmartAsk.tsx` + `data/recommender.ts`)
- **Motor 100% local/offline, sin API**: `parseQuery` interpreta lenguaje natural en español (presupuesto en CLP "millones/palos/$ con puntos", uso, combustible con sinónimos, transmisión, plazas, tracción, formato, prioridades, marca del catálogo, año) y `recommend` puntúa los 688 autos con pesos por dimensión (presupuesto 20, uso 20, combustible 15, prioridad 15, plazas 10, transmisión 8, tracción 7, formato 5).
- **Filtros duros** solo para lo explícito: marca, formato, año mínimo y ≥6 plazas; el resto es scoring suave (nunca vacía resultados sin motivo).
- **Explicaciones**: cada recomendación incluye `reasons` en español ("Precio $16.490.000 bajo tu tope de $25.000.000", "Motor híbrido", "Calificación 5 estrellas Euro NCAP"…); chips "Entendí:" muestran la intención detectada.
- UI en Home (botón "Pregunta con tus palabras"): modal con input libre, ejemplos clicables, top 10 con afinidad y motivos, comparar y ver detalle; Escape vuelve al modal tras abrir un resultado.
- Tests: `recommender.test.ts` (35 tests: parser, scoring, unidades, modelos, negaciones, parrilla y consultas reales).
- Contraste de catálogo 11-11-2026 y marcas pendientes: `docs/AUDIT-CATALOGO-2026-11.md`.

### Visual / PWA
- Dark mode real, modal y tags con contraste mejorado, skeleton loading en todas las rutas (Suspense + estados de carga por página), debounce 300 ms, PWA (manifest+sw).
- **PWA instalable en iOS**: `public/apple-touch-icon.png` (180), `icon-192.png` y `icon-512.png` (generados con `scripts/generate-pwa-icons.py`), meta `apple-mobile-web-app-*` en `index.html`, manifest con PNGs. `<InstallHint>` en el footer muestra cómo instalar en iPhone o captura `beforeinstallprompt` en Android/escritorio.
- **Web Share API**: `ShareButton` (`navigator.share` → clipboard fallback) en la ficha del aviso, la guía del blog y la ficha del auto.

## Imágenes (`src/data/carImages.json` + `public/car-images/`)
- Mapeo id → `{ file, source, license, attribution }` o `null` (silueta).
- Estado auditado (11-11-2026, `npm run audit:assets`): **688 modelos, 35 sin clave en el manifiesto, 35 claves `null`, 0 faltantes, 0 huérfanos** → 70 modelos caen a silueta. Sin clave: Chevrolet 678; Ford 679–684; Renault 685; Peugeot 686–688; Citroën 689; Opel 690; Jeep 691/692; RAM 693; Mitsubishi 694–696; Chery 697 y los nuevos 699–712 del Lote 27. El id 537 (Crosstrek Híbrido) quedó `null` al retirar la foto del XV de otra generación.
- Regla: no duplicar fuente entre modelos distintos; verificar con el escaneo de `source` compartido (las 19 fuentes compartidas son variantes de un mismo modelo).
- Pase 2026: 131 fotos añadidas desde Commons (API, ancho 1000px, metadata real). ~15 son de la misma generación de plataforma comercial (best-effort documentado en SUMMARY.md); curaduría por modelo.
- Lote 18: **67 fotos** de Commons con curaduría por modelo (56 siluetas cerradas + 11 ids de otra variante repuestos por la auditoría; ver SUMMARY.md). Scripts: `picks-lote18.cjs` (elecciones), `check-commons.cjs` (categorías/licencia/duplicados) y `download-picks.cjs` (descarga + manifiesto).

## Pendiente / Próxima Funcionalidad

### Datos del catálogo
- **Lynk & Co 09** sin consumo mixto (MHEV 2.0T, dato no verificado).
- **DFSK Glory iX5 EV** sin batería/autonomía en ficha chilena.
- **FAW**: en Chile solo comercializa camiones (FAW Trucks / Forcenter), no autos livianos → NO añadir al catálogo como marca liviana (decisión documentada).
- **Fiat**: `fiat.cl` solo publica 500e, Pulse y Fastback; Mobi, Argo, Cronos, Strada, Toro, Fiorino y Ducato siguen en planes/concesionarios y quedaron sin cambios (sin `lineup_2026:false`) hasta contrastar lista oficial de concesionario.
- **Pendientes de contraste oficial**: Volkswagen, Honda, Subaru, BYD, Chery, Changan, Jetour, Geely, KGM, Dongfeng, Soueast, Leapmotor, JMC, Foton y marcas premium.
- **Precios Stellantis/Mitsubishi**: cuando la marca solo tiene cotizador, se usa la tabla pública de Rosselot y se guarda el **Precio Contado** (sin bono de financiamiento) en `price`, con `price_list`, `price_bonus`, `price_source` y `price_checked_at`.
- Regla: no inventar specs; los EV/PHEV se completan vía `enrichment.ts` con fichas oficiales (Chile) o EV-Database.

### Marketplace de Usados
- Supabase Auth con Google para vendedores; Supabase Postgres para listings, preferencias, firmas y reportes; Supabase Storage para fotos.
- RLS: los avisos nuevos quedan `pending`; sólo moderadores pueden publicarlos o rechazarlos. No se crean listings de ejemplo.
- Rutas: `/usados`, `/usados/:slug`, `/publicar-auto`, `/mis-anuncios` y `/moderacion`.
- Publicación sin registro: sesión anónima + verificación de email (`updateUser`), trigger `require_verified_seller` en `used_listings`. Ver `supabase/README.md`.
- Filtros: búsqueda, marca, región, combustible, transmisión, año, precio, kilometraje, orden y paginación.
- Verificación de correo: chip de estado + «Reenviar enlace» en `/mis-anuncios` (`src/lib/authVerification.ts`); GoTrue limita a 2 correos/hora y el trigger exige el correo confirmado antes de publicar.
- **Confianza visible (Lote 22)**: badge «Correo del vendedor verificado» en la ficha (query degradable sobre `profiles.email_verified`), `<AutoLupaSeal>`, `<DocumentLinks>` (anotaciones vigentes, transferencia, checklist) y FAQ antiestafas en `/faq`. Las consultas de avisos NO usan embed de perfil: `attachSellers()` en `src/lib/usedListings.ts` trae los perfiles en batch (no existe FK a `profiles`).
- SEO: `Vehicle` + `Offer` + `BreadcrumbList` en detalle e `ItemList` en el listado.
- La configuración de Supabase y los pasos de despliegue están en `README.md`.

## Notas Técnicas
- Supabase es el backend de autenticación, favoritos y usados. Sin sus variables, la interfaz muestra estado de preparación y no simula usuarios ni listings.
- Las migraciones SQL están en `supabase/migrations/` (marketplace, publicación de invitados, límites de publicación y `email_verified` del vendedor) y se aplican con `node scripts/apply-migration.mjs <archivo>`; la matriz RLS con roles reales está en `supabase/README.md`.
- `npm run build`, `npm run lint` y `npm test` deben pasar (verificados al finalizar cambios). El workflow de deploy ejecuta lint, tests y build antes de publicar.
- La matriz de verificación de RLS con roles reales está en `supabase/README.md`; hay que ejecutarla antes de recibir vendedores.
- No agregar comentarios al código; documentar cambios de datos en SUMMARY.md.
- SEO: `scripts/prerender.mjs` genera un `.html` por ruta tras `vite build`. En Cloudflare Pages las reglas de `_redirects` ganan a los archivos estáticos: no agregar comodines `200` sobre rutas prerenderizadas (ver ADR-021).
- Si Supabase no responde, `src/lib/backendStatus.ts` + `ServiceNotice` degradan usados y publicación (ADR-022).
## Continuidad (OpenCode)
- Antes de trabajar, leer `.opencode/continuity/STATE.md`, `PLAN.md`, `WORKLOG.md`, `DECISIONS.md` y `TESTS.md`.
- Actualizar `STATE.md`, `WORKLOG.md` y `TESTS.md` después de cada lote pequeño; no esperar al final de la fase.
- No desplegar, hacer push ni modificar servicios externos sin autorización explícita del usuario.
- Si el árbol Git está sucio, no resetear, no hacer stash ni mezclar commits; documentar el estado y preservar el trabajo.
- Al reanudar, escribir `RETOMAR AUTOLUPA` y continuar desde el “Próximo paso exacto” de `STATE.md`.
