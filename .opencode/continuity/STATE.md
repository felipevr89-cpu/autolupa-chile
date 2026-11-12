# AutoLupa — estado de continuidad
Actualizado: 2026-11-12 17:10 UTC
Fase: Cierre — L1–L5 y rediseño completos; pendiente revisión del usuario
Estado: EN_PROGRESO

## Objetivo inmediato
Revisar en escritorio la ficha, el TCO, el simulador de crédito y el estado sin resultados; confirmar que los ajustes móviles no rompen el layout amplio.

## Último punto seguro
L1–L5 + rediseño y los arreglos de rutas legales y leads están en commits locales de `feat/catalog-coverage-search`, sin push. `npm test` 282/282, `lint` 0, `tsc` 0.

## Trabajo en curso
Ninguno. Esperando que el usuario revise y autorice commit/PR/deploy, y resuelva Supabase y el dominio/correos.

## Archivos modificados
- `AGENTS.md` — instrucciones permanentes y continuidad.
- `SUMMARY.md` — conteos y lote 25.
- `docs/*` — changelog, decisiones, blockers, roadmap y auditorías.
- `src/App.tsx`, `src/pages/Home.tsx`, `src/hooks/useCars.ts`, `src/pages/Usados.tsx`, `src/pages/BrandPage.tsx` — buscador, `/autos`, marcas y usados demo.
- `src/components/Brands/BrandGrid.tsx`, `src/components/Used/DemoListings.tsx`, `src/lib/brandSlug.ts`, `src/lib/gaps.ts` — nuevos componentes/utilidades.
- `src/data/brands/chery.json`, `src/data/brands/ford.json`, `src/data/carImages.json` — alias Tiggo 8 Pro, `year_start` y silueta.
- `src/components/Wizard/SmartAsk.tsx` — fallback NLU y gaps.
- `src/components/Cars/CarImage.tsx` — `fetchpriority` en minúsculas y silueta mientras la foto carga.
- `public/robots.txt` — bloqueo de `/tus-datos`.
- `src/pages/Home.tsx` — `/autos` como catálogo dedicado, H1, buscador, sin hero/rieles y Región solo en usados.
- `src/pages/BrandPage.tsx` — redirección de `/marca/:slug` a `/marcas/:slug`.
- `src/components/Cars/CarCard.tsx`, `src/pages/CarPage.tsx`, `src/pages/TasarAuto.tsx` — enlaces canónicos a `/marcas/...`.
- `src/components/Filters/FilterPanel.tsx` — prop `hideSearch` para no duplicar el buscador del catálogo.
- `src/components/Cars/CarDetail.tsx` — precio junto al título, bloque de precio apilado en móvil y tabs estables con `aria-pressed`.
- `src/components/Layout/PublishFloat.tsx` — CTA de publicación oculto en fichas de auto y aviso.
- `src/components/TCO/TCOCalculator.tsx` — controles a ancho completo en móvil y etiquetas asociadas.
- `src/components/Calculator/CreditCalc.tsx` — etiqueta del pie asociada al input.
- `src/components/Cars/CarGrid.tsx` — CTA «Ver todos los autos» en el estado sin resultados.
- `src/test/securityHeaders.test.ts`, `src/test/homeSearch.test.tsx`, `src/test/carRoutes.test.tsx`, `src/test/publishFloat.test.tsx`, `src/test/carGrid.test.tsx` — regresiones de robots, catálogo, buscador, redirección de marca, CTA flotante, TCO/crédito y estado vacío.
- `scripts/audit-coverage.mjs`, `scripts/audit-model-assets.mjs`, `scripts/generate-sitemap.mjs` — auditorías y sitemap.
- `src/test/*` — regresiones de cobertura, assets y buscador.
- `public/sitemap.xml` — rutas `/autos` y `/marcas/*`.
- `.opencode/continuity/*` — estado, plan, worklog, decisiones y pruebas.

## Verificaciones
- `git status --short` — árbol sucio (esperado, lote anterior sin commit).
- `curl -I https://autolupa.pages.dev/` — PASÓ, HTTP 200.
- `curl https://autolupa.pages.dev/marcas/toyota` — FALLÓ SEO: 3.133 bytes, solo HTML shell, sin H1 de marca.
- `npm run lint` — PASÓ (0 errores) antes y después de los cambios.
- `npm test` — PASÓ (247/247) después de TCO, crédito y estado vacío.
- `npx vitest run src/test/carRoutes.test.tsx` — PASÓ (8/8), precio junto al título, `aria-pressed` y etiquetas del TCO/crédito.
- `npx vitest run src/test/carGrid.test.tsx` — PASÓ (1/1), CTA del estado sin resultados.
- `npx vitest run src/test/tco.test.ts src/test/credit.test.tsx` — PASÓ (27/27).
- `npx vitest run src/test/publishFloat.test.tsx` — PASÓ (5/5), incluye fichas de auto y aviso.
- `npx vitest run src/test/homeSearch.test.tsx` — PASÓ (8/8), Región solo en usados y sin `region` en nuevos.
- `npm run build` — PASÓ después de detener preview/Chrome y limpiar `dist` (FUSE dejó `.fuse_hidden` en `dist/assets`).
- `npm run audit:catalog` — PASÓ (674 modelos / 1.466 versiones).
- `npm run audit:coverage` — PASÓ (0 gaps).
- `npm run audit:assets` — PASÓ (20 sin clave / 35 siluetas / 0 faltantes).
- `npm run audit:tasar` — PASÓ (0 faltantes).

## Problemas / riesgos abiertos
- Los commits son locales: falta push, PR y deploy; producción sigue mostrando la 404 en las páginas legales.
- La producción es SPA sin prerender: las rutas profundas no exponen título/H1/contenido en el HTML inicial.
- En headless, la foto de portada puede no pintarse y se ve el gradiente; en navegador normal la imagen se muestra con la silueta de respaldo.
- Las herramientas usan botones con `aria-pressed`, no un `tablist` con navegación por flechas; queda como mejora de accesibilidad.
- Migraciones de Supabase pendientes de aplicar.
- No hay despliegue ni push en esta fase.

## Próximo paso exacto
Con autorización: push de `feat/catalog-coverage-search` y PR a `main` (ejecutar antes `npm run build`). Luego, siguiente lote de datos según `docs/AUDIT-CATALOGO-2026-11.md` (Chery, BYD, Jetour).

## Instrucción de reanudación
Leer `STATE.md`, `PLAN.md`, `WORKLOG.md`, `DECISIONS.md`, `TESTS.md`, `AGENTS.md` y el estado Git; confirmar el último punto seguro; continuar desde “Próximo paso exacto”, sin repetir trabajo terminado.
