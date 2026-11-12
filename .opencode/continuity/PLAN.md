# AutoLupa — plan de mejora

## Fases

| Fase | Trabajo | Criterio de salida |
|---|---|---|
| 0. Protección | Estado Git, stack, scripts, baseline, continuidad | `STATE.md` creado y baseline verificado |
| 1. Auditoría | Evidencia de UX, SEO, accesibilidad, rendimiento y formularios | Hallazgos con severidad y evidencia |
| 2. UX/UI | Hero, navegación, CTA comprador/vendedor, móvil, estados vacíos | Recorridos claros en 360×640 y escritorio |
| 3. Catálogo | Filtros, tarjetas, ficha, contacto y sin resultados | Búsqueda usable sin datos ficticios |
| 4. Publicación | Validaciones, fotos, errores y confirmación | Flujo probado con datos de prueba |
| 5. SEO | Títulos, canonical, sitemap, robots, HTML rastreable | Rutas clave con HTML útil |
| 6. Calidad | Accesibilidad, rendimiento, seguridad, regresiones | Pruebas ejecutadas y deuda documentada |
| 7. Cierre | Diff, documentación y guía de despliegue manual | Informe final sin despliegue |

## Hallazgos priorizados

| # | Severidad | Hallazgo | Evidencia | Propuesta mínima |
|---|---|---|---|---|
| A1 | Alta | Las rutas profundas son SPA sin prerender; el HTML inicial no contiene título, H1 ni contenido de marca | `curl https://autolupa.pages.dev/marcas/toyota` devuelve 3.133 bytes y el título genérico; no hay `<h1>` de Toyota | Prerender de rutas clave o HTML estático por marca/modelo en Fase 5 |
| A2 | Media | `fetchPriority` en camelCase genera warning de React y puede no aplicar la prioridad LCP | stderr de tests: “React does not recognize the `fetchPriority` prop” | Usar el atributo HTML `fetchpriority` en minúsculas (primer cambio) |
| A3 | Media | `robots.txt` permite `/tus-datos`, ruta privada | `curl https://autolupa.pages.dev/robots.txt` solo bloquea `/mis-anuncios` y `/moderacion` | Agregar `Disallow: /tus-datos` |
| A4 | Media | Producción no refleja el lote actual; `/autos` y `/marcas/*` existen en el árbol local, no en `main` | `main` no contiene los commits del lote; preview pendiente | Revisar y mergear el PR cuando el usuario autorice |
| A5 | Baja | Los filtros de `/autos` conservan `region` aunque el catálogo nuevo no la use | Resuelto: Región solo se ofrece en usados y no se envía en autos nuevos | Mantener la regresión en `homeSearch.test.tsx` |
| A6 | Baja | Hay 20 modelos sin clave de imagen y 35 siluetas | `docs/AUDIT-ASSETS.md` | Completar assets en un lote de datos |
| A7 | Media | `/marca/*` y `/marcas/*` duplican contenido; los enlaces internos usan `/marca/*` | `CarCard.tsx`, `CarPage.tsx`, `TasarAuto.tsx` y rutas de `App.tsx` | Redirigir `/marca/:slug` a `/marcas/:slug` y unificar enlaces internos |

## Hallazgos 11-11-2026
| # | Severidad | Hallazgo | Estado |
|---|---|---|---|
| B1 | Crítica | Supabase NXDOMAIN en producción | Usuario: restaurar proyecto (degradación aplicada, ADR-022) |
| B2 | Alta | `autolupa.cl` inexistente pero usado en correos de contacto/privacidad | Usuario: dominio o correo alternativo |
| B3 | Alta | Producción atrasada desde 23-10 | Usuario: autorizar commit/PR/deploy |
| A1 | Media | SPA sin prerender / soft-404 | Resuelto (ADR-021) |
| C1 | Media | Recomendador: unidades, modelos, parrilla | Resuelto (Lote 27) |
| C2 | Media | TCO con doble conteo e híbridos cargando de la red | Resuelto (L4) |
| C3 | Baja | Filtro de año por defecto 2020–2026 con modelos 2027 | Resuelto (L4) |

## Estado actual
- Fases 0–2 cerradas. Fase 3 en progreso: ficha móvil, TCO, crédito y estado vacío verificados; falta la revisión de escritorio.
- A1 se planifica en Fase 5; A4 requiere autorización; A6 queda para un lote de datos.

## Orden de ejecución inmediato
1. Cerrar Fase 3 con la revisión de escritorio de ficha, TCO, crédito y estado vacío.
2. A1 — plan de prerender en Fase 5 (no iniciar sin decisión de arquitectura).
3. A4 — revisión humana del PR y despliegue autorizado.
4. A6 — completar imágenes en un lote de datos separado.
