# AutoLupa — pruebas

## Baseline (antes del primer cambio)
- `npm run lint` — PASÓ — 0 errores.
- `npm test -- --run` — PASÓ — 237/237.
- `npm run build` — PASÓ — `tsc -b && vite build`.
- `npm run audit:catalog` — PASÓ — 674 modelos / 1.466 versiones.
- `npm run audit:coverage` — PASÓ — 0 marcas top sin catálogo, 0 con <3 modelos, 0 modelos obligatorios faltantes.
- `npm run audit:assets` — PASÓ — 20 sin clave / 35 siluetas / 0 faltantes / 0 huérfanos.
- `npm run audit:tasar` — PASÓ — 0 faltantes / 0 sobrantes.

## Evidencia externa
- `curl -I https://autolupa.pages.dev/` — HTTP 200.
- `curl https://autolupa.pages.dev/robots.txt` — sin `Disallow: /tus-datos`.
- `curl https://autolupa.pages.dev/marcas/toyota` — 3.133 bytes, sin H1 de marca.

## Primer cambio (`fetchpriority`)
- `npm run lint` — PASÓ — 0 errores.
- `npx vitest run src/test/assets.test.ts src/test/carRoutes.test.tsx src/test/favoritesAlerts.test.tsx` — PASÓ — 15/15.
- `npm run build` — PASÓ — `tsc -b && vite build`.

## A3 + Fase 2 (`robots.txt` y `/autos`)
- `npx vitest run src/test/homeSearch.test.tsx src/test/securityHeaders.test.ts` — PASÓ — 10/10.
- `npm run lint` — PASÓ — 0 errores.
- `npm run build` — PASÓ.
- Evidencia: `public/robots.txt` contiene `Disallow: /tus-datos`; `/autos` abre con H1 «Catálogo de autos nuevos» y buscador.

## A7 + catálogo dedicado
- `npx vitest run src/test/carRoutes.test.tsx` — PASÓ — 6/6, incluida la redirección `/marca/toyota` → `/marcas/toyota`.
- `npx vitest run src/test/homeSearch.test.tsx src/test/carRoutes.test.tsx src/test/securityHeaders.test.ts` — PASÓ — 16/16.
- `npm test` — PASÓ — 239/239.
- `npm run lint` — PASÓ — 0 errores.
- `npm run build` — PASÓ.
- Evidencia visual: `/autos` a 390×844 y 1440×1000 muestra H1, buscador, filtros y resultados; la home conserva el hero.

## A5 (`region` solo en usados)
- `npx vitest run src/test/homeSearch.test.tsx` — PASÓ — 8/8.
- `npm test` — PASÓ — 242/242.
- `npm run lint` — PASÓ — 0 errores.
- `npm run build` — PASÓ.
- Evidencia DOM: la home en la pestaña de nuevos no contiene `aria-label="Región"`; la pestaña de usados sí lo muestra y lo envía a `/usados`.

## Ficha de auto (`/auto/:slug`)
- `npx vitest run src/test/carRoutes.test.tsx` — PASÓ — 7/7; precio junto al título.
- `npx vitest run src/test/publishFloat.test.tsx` — PASÓ — 5/5; CTA oculto en fichas.
- `npm test` — PASÓ — 245/245.
- `npm run lint` — PASÓ — 0 errores.
- `npm run build` — PASÓ.
- Evidencia visual: 390×844 muestra «Desde $7.590.000» antes de los tags; el bloque de precio apila «Sitio oficial» y «Guardar» sin desbordarse; no aparece el CTA flotante «Publicar gratis».

## TCO, crédito y estado sin resultados
- `npx vitest run src/test/carRoutes.test.tsx` — PASÓ — 8/8; `aria-pressed` de tabs y etiquetas del TCO/crédito.
- `npx vitest run src/test/carGrid.test.tsx` — PASÓ — 1/1; CTA «Ver todos los autos».
- `npx vitest run src/test/tco.test.ts src/test/credit.test.tsx` — PASÓ — 27/27.
- `npm test` — PASÓ — 247/247.
- `npm run lint` — PASÓ — 0 errores.
- `npm run build` — PASÓ.
- Evidencia visual: en 390×844 los controles «Plazo crédito» y «Km/mes» ocupan todo el ancho y muestran la opción completa; el simulador de crédito no desborda; `/autos?q=zzzz` muestra «No se encontraron resultados» con CTA «Ver todos los autos».
- Nota de entorno: si el build falla con `ENOTEMPTY` en `dist/assets`, detener preview y Chrome headless antes de limpiar `dist`; el montaje FUSE deja archivos `.fuse_hidden` mientras están abiertos.

## Próxima prueba
- Ficha, TCO, crédito y estado vacío a 1440×1000.
- `npm run lint && npm test && npm run build` tras el siguiente ajuste.

## L1 — Recomendador y catálogo (11-11-2026)
- `npx vitest run src/test/recommender.test.ts` — PASÓ — 35/35 (14 consultas reales nuevas).
- `npm test` — PASÓ — 261/261.
- `npm run lint` y `npx tsc -b` — PASÓ.
- `npm run audit:catalog` — PASÓ — 688 modelos / 1.488 versiones / 0 errores.
- `npm run audit:assets` — PASÓ — 35 sin clave / 35 null / 0 faltantes / 0 huérfanos.
- `npm run audit:coverage` y `audit:tasar` — PASÓ — 0 gaps / 0 faltantes.

## L2–L3 — SEO y degradación (11-11-2026)
- `npx vitest run src/test/seoPrerender.test.ts src/test/backendStatus.test.tsx` — PASÓ — 8/8.
- `npm test` — PASÓ — 269/269; `npm run lint` — 0; `npm run build` — PASÓ (836 páginas prerenderizadas).
- `wrangler pages dev dist`: `/`, `/autos`, `/marcas/toyota`, `/auto/545-…-2026`, `/usados` → 200; `/noexiste`, `/marcas/zzz`, `/auto/545-…-2025` → 404 (la app redirige al canónico); `/marca/toyota` y `/marcas/citro%C3%ABn` → 301; `/usados/algo` → 200 vía `/spa`.
- Chrome headless: 1 canonical, 1 descripción y 1 JSON-LD tras montar React; 404 con `noindex`.

## L4–L5 (11-11-2026)
- `npx vitest run src/test/tco.test.ts` — PASÓ — 16/16 (doble conteo, HEV, plazos).
- `npx vitest run src/test/yearRange.test.ts` — PASÓ — 3/3.
- `npm test` — PASÓ — 274/274; `npm run lint` — 0.
- Evidencia visual 1440×1000: ficha con TCO/crédito en dos columnas; `/autos?q=zzzz` con estado vacío centrado.

## Rediseño (11-11-2026)
- `npx vitest run src/test/smartAskInitial.test.tsx` — PASÓ — 2/2 (consulta inicial, teclado).
- `npm test` — PASÓ — 277/277; `npm run lint` — 0; `npm run build` — PASÓ.
- Capturas CDP 1440×900 / 390×844 (claro y oscuro): `scrollWidth == clientWidth` en todas las rutas revisadas.

## Rutas legales y leads (12-11-2026)
- `npx vitest run src/test/legalRoutes.test.tsx src/test/leadForm.test.tsx` — PASÓ — 5/5.
- `npm test` — PASÓ — 282/282; `npm run lint` — 0; `npx tsc -p tsconfig.app.json --noEmit` — 0. `npm run build` no ejecutado en este lote.
