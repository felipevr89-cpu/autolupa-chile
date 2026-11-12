# Decisiones (ADR cortas)

## ADR-001 — Stack y backend
- Contexto: el repositorio ya es React 18 + Vite + TypeScript + Tailwind + Supabase.
- Decisión: mantener el stack y Supabase Auth/Postgres/Storage; no introducir otro backend.
- Consecuencia: las migraciones nuevas se aplican con el runbook existente.

## ADR-002 — Alcance de esta pasada
- Contexto: el brief permite P0+P1 o P0–P3.
- Decisión: ejecutar P0 y P1; P2/P3 quedan en `docs/ROADMAP.md`.
- Consecuencia: blog/newsletter/alertas/escrow no se implementan ahora.

## ADR-003 — Páginas legales
- Contexto: faltan `/quienes-somos`, `/contacto`, `/como-funciona` y `/compra-segura`.
- Decisión: publicar contenido base con `[PENDIENTE-LEGAL]` en razón social, RUT y domicilio.
- Consecuencia: no se afirma personalidad jurídica ni domicilio hasta completar datos.

## ADR-004 — WhatsApp de soporte
- Contexto: no hay número Business provisto.
- Decisión: usar `+56 9 0000 0000` como placeholder en `src/config/support.ts`.
- Consecuencia: debe reemplazarse antes de difundir el canal.

## ADR-005 — Precio de campaña Subaru y VW
- Contexto: las marcas publican precio con bono directo y precio con financiamiento.
- Decisión: usar precio con bono directo (sin bono de financiamiento) como `price`.
- Consecuencia: `price_list` y `price_bonus` reflejan el descuento directo.

## ADR-006 — Chery Tiggo 8 Pro
- Contexto: la parrilla chilena 2026 publica “Tiggo 8” y “Tiggo 8 Pro Max”; no un “Tiggo 8 Pro” separado.
- Decisión: agregar “Tiggo 8” y mantener “Tiggo 8 Pro Max” con sus versiones 1.6T; no inventar un modelo Pro.
- Consecuencia: el test de cobertura acepta la familia `Tiggo 8 Pro*` como Pro Max.

## ADR-007 — Foto Ford Territory
- Contexto: el id 188 usaba una foto del Territory EV de generación anterior.
- Decisión: reemplazarla por una foto de la generación 2023+ (Commons, CC BY-SA 4.0).
- Consecuencia: la ficha 2026 muestra la carrocería correcta.

## ADR-008 — Filtros en URL
- Contexto: los filtros vivían solo en localStorage.
- Decisión: sincronizar filtros, búsqueda, orden y página con query params (`marca`, `modelo`, `tipo`, `combustible`, `precio`, `anio`, `q`, `orden`, `pagina`).
- Consecuencia: los enlaces filtrados son compartibles y SEO-friendly.

## ADR-009 — Contacto del vendedor
- Contexto: teléfono y correo estaban visibles para cualquiera.
- Decisión: mostrarlos solo con sesión iniciada; para anónimos, formulario de lead.
- Consecuencia: el lead se guarda en `used_listing_leads` o en log estructurado si la migración no está aplicada.

## ADR-010 — KYC, mensajería y escrow
- Contexto: no hay proveedor KYC ni pagos en esta fase.
- Decisión: KYC mockeado (`verification_level`), mensajería vía leads, escrow fuera de alcance.
- Consecuencia: las integraciones reales quedan marcadas `[PENDIENTE-INTEGRACION]`.

## ADR-011 — Analítica sin cookies
- Contexto: el brief pide GA4 + Consent Mode v2; el repositorio ya usa Plausible, cookieless.
- Decisión: mantener Plausible y sus eventos (`ContactSeller`, `ContactSupport`, etc.) en vez de introducir GA4.
- Consecuencia: no se requiere banner de consentimiento para analítica; si se migra a GA4, habrá que implementar Consent Mode v2.

## ADR-012 — Tiggo 8 Pro como alias legacy
- Contexto: la parrilla 2026 no separa un “Tiggo 8 Pro”, pero los usuarios y el tasador siguen buscando ese nombre.
- Decisión: agregar el id 698 como alias legacy con `lineup_2026: false`, reutilizando las versiones oficiales del Pro Max.
- Consecuencia: aparece en búsqueda/tasación sin afirmar que sea una versión 2026 vigente; ADR-006 se mantiene para la parrilla actual.

## ADR-013 — Navegación por marca
- Contexto: la home solo mostraba las marcas de las novedades curadas.
- Decisión: grid con las 98 marcas y `/marcas/{slug}` como URL canónica; `/marca/{slug}` queda como alias.
- Consecuencia: el sitemap usa `/marcas/` y cada página incluye `Brand` + `BreadcrumbList`.

## ADR-014 — Avisos demo en `/usados`
- Contexto: no hay inventario real y el flujo de publicación existe, pero sembrar la base de producción no es seguro.
- Decisión: mostrar 24 ejemplos locales marcados «Ejemplo», sin persistirlos ni enlazarlos como avisos reales.
- Consecuencia: `/usados` no queda vacío y no se simula inventario; al primer aviso real desaparecen los ejemplos.

## ADR-015 — Cobertura y gaps
- Contexto: el catálogo ya tiene 98 marcas, pero faltaba una verificación automática del top ANAC.
- Decisión: `audit:coverage` + test de CI comparan top 24, modelos obligatorios y cobertura del tasador.
- Consecuencia: un modelo faltante o una marca sin catálogo rompe el build.

## ADR-016 — Registro de búsquedas sin resultados
- Contexto: no hay backend de analítica propio para un dashboard de gaps.
- Decisión: `brand_search_miss` se envía a Plausible y se guarda en `localStorage` (máx. 200 entradas).
- Consecuencia: el backlog se revisa con `readGaps()` o exportando la clave `autolupa_search_gaps`; no hay dashboard todavía.

## ADR-017 — Catálogo dedicado y alias de marca
- Contexto: `/autos` repetía el hero, los rieles y el grid de marcas de la home; además `/marca/:slug` duplicaba la URL canónica `/marcas/:slug`.
- Decisión: `/autos` renderiza una página de catálogo dedicada con H1, buscador y filtros, sin hero ni secciones de descubrimiento; `/marca/:slug` redirige a `/marcas/:slug`.
- Consecuencia: el buscador de la home sigue siendo la entrada principal, el catálogo prioriza resultados y se elimina la duplicación de URLs de marca (reemplaza el alias de ADR-013).

## ADR-018 — Región solo para autos usados
- Contexto: el catálogo de autos nuevos no tiene stock ni ubicación por región; el filtro Región del hero se enviaba a `/autos` y se ignoraba.
- Decisión: mostrar Región solo en la pestaña «Autos usados» y no incluir `region` en el submit de autos nuevos.
- Consecuencia: la búsqueda de nuevos no promete un filtro inexistente; los enlaces antiguos con `region` en `/autos` se ignoran sin romper la página.

## ADR-019 — Precio y CTA en fichas
- Contexto: en móvil el precio de la ficha quedaba muy abajo y el botón flotante «Publicar gratis» cubría el bloque de precio/guardado.
- Decisión: mostrar «Desde $…» junto al título, apilar los botones del bloque de precio en móvil y ocultar el CTA flotante en `/auto/:slug` y `/usados/:slug`.
- Consecuencia: la ficha prioriza precio, guardado y contacto; el CTA de publicación sigue visible en home, catálogo y listado de usados.

## ADR-020 — Controles y salida de estados vacíos
- Contexto: en 390×844 el selector «Km/mes» del TCO se truncaba, el estado sin resultados no ofrecía una salida y los tabs no anunciaban cuál estaba activo.
- Decisión: apilar los controles del TCO en móvil, asociar sus etiquetas y la del pie del crédito, usar `aria-pressed` en las herramientas y añadir «Ver todos los autos» a la grilla vacía.
- Consecuencia: los controles se leen completos, el cambio de herramienta conserva el foco y el usuario puede volver al catálogo completo sin buscar los filtros; el tablist con navegación por flechas queda como mejora posterior.

## ADR-021 — Prerender estático y 404 real
- Contexto: producción respondía 200 con el mismo HTML de 3.133 bytes en todas las rutas, incluidas las inexistentes (soft-404), y los slugs de marca eran Unicode (`citroën`, `škoda`, `lynk-&-co`).
- Decisión: `scripts/prerender.mjs` corre después de `vite build` y escribe un `.html` por ruta (home, `/autos`, 98 marcas, 688 fichas, 16 regiones, 12 guías y páginas estáticas) con título, descripción, canonical, Open Graph, JSON-LD y contenido rastreable dentro de `#root`; React lo reemplaza al montar y `main.tsx` elimina las etiquetas `data-prerender` para que Helmet no las duplique. `404.html` lleva `noindex` y el bundle, así que una URL de ficha con año antiguo devuelve 404 al rastreador pero el usuario es redirigido al canónico por la app. Se elimina el comodín `/* /index.html 200`; solo `/usados/*` se reescribe a `/spa` (plantilla sin contenido, bloqueada en `robots.txt`). Slugs de marca ASCII con 301 desde los antiguos. No se agregan dependencias.
- Consecuencia: verificado con `wrangler pages dev`: rutas válidas 200 con HTML propio, inexistentes 404 y las reglas `_redirects` tienen prioridad sobre los archivos estáticos (por eso no se reescribe `/auto/*`).

## ADR-022 — Degradación cuando Supabase no responde
- Contexto: el 11-11-2026 el host de Supabase da NXDOMAIN; `/usados` mostraba a la vez «No pudimos cargar», «0 avisos» y «Sé el primero en publicar», y `/publicar-auto` dejaba completar el formulario para fallar al final.
- Decisión: `src/lib/backendStatus.ts` consulta `/auth/v1/health` una vez (timeout 5 s); `<ServiceNotice>` muestra un único mensaje con «Reintentar» y salidas útiles. `/usados` muestra el aviso y los ejemplos (sin CTA de publicar), `/publicar-auto` no abre el formulario y la ficha de un aviso distingue «servicio caído» de «aviso retirado».
- Consecuencia: el sitio comunica la caída sin contradicciones; restaurar el proyecto Supabase sigue siendo tarea del usuario.

## ADR-023 — TCO como costo económico
- Contexto: el costo mensual sumaba la cuota completa del crédito (capital + interés) y la depreciación, contando dos veces el valor del auto; además los híbridos no enchufables pagaban «carga eléctrica».
- Decisión: costo mensual = intereses promedio + SOAP + permiso + seguro + mantención + depreciación + energía; la cuota se muestra aparte como flujo de caja. `total5Years` = intereses totales + 60 meses de costos corrientes. «CAE» se reemplaza por «tasa efectiva anual (interés)».
- Consecuencia: el TCO baja y es comparable entre plazos; un plazo largo muestra cuota menor pero más intereses.

## ADR-024 — Rediseño de navegación, portada y búsqueda
- Contexto: la barra tenía 9 enlaces + 3 acciones y se partía en 2 líneas a 1280–1440 px; «Nuevos» llevaba al Top 10 y «Eléctricos» a la portada; el grid de 98 marcas ocupaba media portada (33 filas en móvil); el buscador sugería lenguaje natural pero hacía búsqueda de texto con 0 resultados; tres botones de igual peso competían con el buscador; los avisos recientes mostraban esqueletos permanentes con el backend caído.
- Decisión: barra con 6 enlaces (Autos nuevos, Usados, Eléctricos, Comparar, Tasar, Guías) + Top 10 accesible por teclado + favoritos como icono, menú hamburguesa hasta `lg` con CTA «Publicar» visible en tablet; grid con las 16 marcas más vendidas (ANAC ene–oct 2026) y botón «Ver las 98 marcas»; el buscador de nuevos abre el recomendador si la consulta tiene intención (`isNaturalLanguageQuery`); dos tarjetas de acción (recomendador y wizard) y enlaces de texto para usados y publicación; barra fija de precio y «Cotizar» en la ficha móvil; banner antiestafas después de los próximos pasos; pie en dos columnas en móvil; modal del recomendador responsivo y filas operables con teclado.
- Consecuencia: portada de 5.066 → 3.356 px en escritorio y 11.370 → ~6.900 px en móvil; la búsqueda principal y la «IA» quedan unificadas.
