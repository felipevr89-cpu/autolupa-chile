# Auditoría AutoLupa — 22 de octubre de 2026

## 0. Veredicto

**El sitio no está al 100% y el problema principal no es el código: es el catálogo.**

- **Ingeniería:** `lint`, `build` y los 222 tests pasan. No hay errores de consola en las rutas probadas. La base es sólida.
- **Datos:** en las **7 marcas revisadas (116 modelos en catálogo)** contrasté 53 precios contra las webs oficiales chilenas: **43 no coinciden**. Además faltan **20 modelos de la gama oficial** y hay **más de 20 modelos del catálogo que no aparecen en la gama 2026 publicada**. El patrón es sistemático, no un caso aislado.
- **Seguridad:** **311 modelos muestran estrellas "Latin NCAP" sin fuente**. Varios son Ferrari, Lamborghini, McLaren o Rolls-Royce, que no tienen evaluación Latin NCAP. Es información falsa visible en la ficha y en el comparador.
- **Código:** hay **3 bugs P0** que rompen flujos reales (enlaces de marca que no abren el auto, compartir que lleva al home, dos CTA flotantes superpuestos en móvil) y una lista de P1 de accesibilidad/UX.

**Conclusión:** no abriría el marketplace ni haría el cambio a `.cl` todavía. Primero hay que rehacer la capa de datos 2026 (Lote 24) y cerrar los P0 de código (Lote 25). Es un trabajo de 3 a 5 semanas, no de un fin de semana.

> **Actualización (22-10-2026, cierre del día):** el **Lote 25 (P0 de código) quedó implementado**: ruta `/auto/:slug`, enlaces y share corregidos, un solo CTA móvil, modal con `role="dialog"` + focus trap, sliders con ARIA/Firefox, búsqueda que resetea página, filtros colapsados en móvil, un solo `<main>` y canonical por ruta. Gate: `LINT=0`, `BUILD=0`, `TEST=227/227`. El **Lote 24 (datos)** sigue pendiente y es el bloqueo para abrir.

---

## 1. Metodología y cobertura

### Qué se revisó

- **625 modelos / 98 marcas** de `src/data/brands/*.json`.
- **Manifiesto de fotos:** 625 claves, 616 con foto, 9 siluetas.
- **Enriquecimiento:** 161 claves; 111 con batería/autonomía; 72 con ratings de seguridad con fuente (69 coinciden con modelos del catálogo).
- **Código:** `npm run lint`, `npm test` (222/222), `npm run build`; revisión de `useCars`, `Home`, `CarDetail`, `CarCard`, `FilterPanel`, `RangeSlider`, `Navbar`, `Compare`, `TCOCalculator`, `CreditCalc`, `usedListings`, `BrandPage`, `SEO`, `sitemap`.
- **Navegador real:** Chrome headless 156, escritorio 1440×900 y móvil 390×844; modo claro/oscuro; apertura de modal, filtros, dropdown de marca, menú móvil, comparador y páginas de usados.
- **Contraste oficial:** `hyundai.cl/modelos`, `toyota.cl/modelos`, `suzuki.cl`, `mgmotors.cl`, `mazda.cl`, `nissan.cl` y `kia.cl/promociones/kia-morning.html`, consultados el 22-10-2026.

### Límite honesto

No se revisaron las 625 fichas una por una contra su marca. Se auditó la estructura completa y se contrastaron **7 marcas (116 modelos)**. El patrón encontrado (precios de generaciones anteriores, modelos descontinuados, versiones que ya no existen) es lo bastante consistente como para afirmar que el catálogo necesita una reconstrucción, no parches. Las 91 marcas restantes se deben pasar por el mismo método antes de publicar.

---

## 2. Datos: hallazgos P0

### 2.1 Precios que no coinciden con la ficha oficial

Criterio del proyecto: `price` = versión mínima ("desde", normalmente con bono). Los valores oficiales de abajo son el "desde" publicado por la marca.

| Marca | Modelo | AutoLupa | Oficial | Diferencia |
|---|---|---:|---:|---:|
| Hyundai | Grand i10 | $8.990.000 | $8.990.000 | OK |
| Hyundai | i20 | $15.990.000 | $13.490.000 | +$2.500.000 |
| Hyundai | Accent | $13.990.000 | $13.190.000 | +$800.000 |
| Hyundai | Venue | $13.490.000 | $14.290.000 | −$800.000 |
| Hyundai | Creta | $19.990.000 | $15.990.000 | +$4.000.000 |
| Hyundai | Kona | $19.990.000 | $29.990.000 | −$10.000.000 |
| Hyundai | Tucson | $24.990.000 | $20.790.000 | +$4.200.000 |
| Hyundai | Tucson Híbrido | $30.990.000 | $29.190.000 | +$1.800.000 |
| Hyundai | Santa Fe | $35.990.000 | $38.990.000 | −$3.000.000 |
| Hyundai | Inster | $19.990.000 | $16.990.000 | +$3.000.000 |
| Hyundai | Staria | $34.990.000 | $34.855.100 | +$134.900 |
| Hyundai | Porter | $23.200.000 | $23.788.100 | −$588.100 |
| Toyota | bZ4X | $41.990.000 | $41.490.000 | +$500.000 |
| Toyota | Yaris | $13.490.000 | $21.490.000 | −$8.000.000 |
| Toyota | Yaris Cross | $17.990.000 | $22.990.000 | −$5.000.000 |
| Toyota | Corolla | $24.790.000 | $21.990.000 | +$2.800.000 |
| Toyota | Corolla Cross | $20.990.000 | $25.990.000 | −$5.000.000 |
| Toyota | RAV4 | $28.990.000 | $31.490.000 | −$2.500.000 |
| Suzuki | Alto | $6.990.000 | $7.590.000 | −$600.000 |
| Suzuki | Swift | $13.990.000 | $11.990.000 | +$2.000.000 |
| Suzuki | Dzire Hybrid | $12.990.000 | $11.690.000 | +$1.300.000 |
| Suzuki | Fronx | $17.590.000 | $14.590.000 | +$3.000.000 |
| Suzuki | Jimny | $19.990.000 | $15.990.000 | +$4.000.000 |
| Suzuki | Across Hybrid | $34.990.000 | $17.190.000 | +$17.800.000 |
| MG | MG ZX | $8.490.000 | $7.990.000 | +$500.000 |
| MG | MG ZS Hybrid | $16.490.000 | $15.990.000 | +$500.000 |
| MG | MG 4 XPOWER | $32.990.000 | $31.990.000 | +$1.000.000 |
| Mazda | Mazda 3 | $18.990.000 | $18.890.000 | +$100.000 |
| Mazda | CX-30 | $19.990.000 | $20.990.000 | −$1.000.000 |
| Mazda | CX-5 | $24.990.000 | $22.290.000 | +$2.700.000 |
| Mazda | CX-60 | $32.990.000 | $39.990.000 | −$7.000.000 |
| Mazda | CX-90 | $44.990.000 | $52.990.000 | −$8.000.000 |
| Mazda | MX-5 | $24.990.000 | $30.990.000 | −$6.000.000 |
| Mazda | BT-50 | $25.990.000 | $33.790.000 | −$7.800.000 |
| Nissan | March | $12.490.000 | $6.390.000 | +$6.100.000 |
| Nissan | Versa | $13.990.000 | $9.248.000 | +$4.742.000 |
| Nissan | Kicks | $17.990.000 | $14.490.000 | +$3.500.000 |
| Nissan | Sentra | $18.990.000 | $14.990.000 | +$4.000.000 |
| Nissan | Qashqai | $22.990.000 | $26.590.000 | −$3.600.000 |
| Nissan | X-Trail | $25.990.000 | $20.390.000 | +$5.600.000 |
| Nissan | Leaf | $30.990.000 | $38.990.000 | −$8.000.000 |
| Nissan | Pathfinder | $37.990.000 | $40.145.600 | −$2.155.600 |
| Kia | Morning | $12.990.000 | $9.990.000 | +$3.000.000 |

**Total: 43 de 53 precios contrastados no coinciden.** No son diferencias de redondeo: hay casos de $6M a $18M.

Dos advertencias sobre la comparación:

- Las webs oficiales publican "desde" con **Bono Marca + Bono Financiamiento**. Suzuki lo desglosa: Across lista $19.890.000, bono marca $1.500.000 y bono financiamiento $1.200.000. Por eso el catálogo debe guardar `precio_lista` y `precio_bono` por separado, con fecha de consulta.
- El caso **Suzuki Across** es el ejemplo perfecto del problema: AutoLupa tiene la generación anterior (RAV4 rebadged, ~$35M) y la web 2026 publica un Across compacto desde $17,19M. No es un error de $17M: es un modelo distinto con el mismo nombre.

### 2.2 Modelos de la gama oficial que faltan

| Marca | Faltan en AutoLupa |
|---|---|
| Hyundai | Grand i10 Sedán, Creta Grand, Kona Híbrido, Kona Eléctrico, Palisade Híbrido, Staria Furgón, Porter Chasis |
| Toyota | Hilux BEV |
| Suzuki | e Vitara, Celerio |
| MG | MG 4 Urban EV, MGS5 EV |
| Mazda | All New CX-5, CX-3, Mazda 3 Sport |
| Nissan | Tiida, Murano, NP300, Urvan, NV350 |

### 2.3 Modelos del catálogo que no aparecen en la gama 2026 publicada

- **Hyundai:** i10, HB20, Bayon, Elantra, Ioniq 5, Ioniq 6. (Palisade y Santa Fe existen, pero solo en versión híbrida; el catálogo las tiene como bencina/híbrida con precios de otra generación).
- **MG:** MG 5, MG GT, MG 5 Wagon, MG HS bencina, RX5, RX8, RX9, S5 EV, Marvel R.
- **Mazda:** Mazda 2, CX-50, Mazda 6.
- **Nissan:** Townstar, Z, Patrol.
- **Suzuki:** Baleno, Ertiga, Vitara, S-Cross y Carry no aparecen en la portada 2026; pueden ser stock 2025 o estar descontinuados. Hay que confirmarlo marca por marca.

Esto explica por qué el filtro de marca muestra modelos que un comprador chileno no encuentra en concesionario. La lista `BRANDS_NOT_SOLD_NEW_IN_CHILE` solo cubre 6 marcas completas; el problema también existe a nivel de modelo.

### 2.4 Seguridad: 311 modelos con "Latin NCAP" sin fuente

- **338 modelos** tienen `latin_ncap_stars`.
- **69 modelos** tienen `safety_ratings` con fuente (Latin NCAP, Euro NCAP, ANCAP, etc.).
- **311 modelos** muestran estrellas sin rating de seguridad con fuente; **27** tienen ambos.
- **245 modelos** no tienen ningún dato de seguridad.
- Casos imposibles: **BMW (25/25)**, **Mercedes-Benz (19/19)**, **Audi (15/15)**, **Ferrari, Lamborghini, McLaren, Rolls-Royce, Bentley y Aston Martin** figuran con 5 estrellas "Latin NCAP". Latin NCAP no evalúa esos modelos.

Además, el comparador rotula la fila como **"Latin NCAP"** (`CompareTable.tsx:139`) y la ficha también (`CarDetail.tsx:388`). Esto no es un dato faltante: es información incorrecta sobre seguridad, con riesgo reputacional y legal.

**Acción:** eliminar `latin_ncap_stars` del catálogo o renombrarlo a un campo explícitamente referencial ("seguridad estimada") y mostrar solo `safety_ratings` con programa, año y fuente. Mientras no haya fuente, mostrar "Sin evaluación independiente".

### 2.5 Duplicados y clasificación incorrecta

- **GWM H6 / H6 Híbrido / H6 PHEV / Haval H6 HEV:** cuatro entradas que representan dos o tres autos reales; comparten la misma foto.
- **Kia Niro (HEV/PHEV/EV) + Kia Niro EV:** el EV está dos veces.
- **Hyundai Tucson** incluye una versión "Híbrido" dentro del modelo bencina y además existe "Tucson Híbrido".
- **Kia Sportage** incluye "Híbrido" dentro del bencina y además "Sportage Híbrido".
- **Toyota RAV4** incluye "HEV 2.0" dentro de un modelo marcado `gasolina`.
- **Toyota C-HR** incluye "Híbrido" dentro de un modelo `gasolina`.
- **8 superdeportivos** están tipificados como `sedan`: Aston Martin Vantage, Ferrari 812 Superfast y SF90, Jaguar F-Type, Lamborghini Huracán y Revuelto, McLaren 720S y Artura. Deberían ser `coupe`/`convertible`.
- **MG GT** está como `coupe` con 5 plazas; es un sedán.

### 2.6 Cobertura eléctrica

- 118 modelos EV/PHEV.
- Tras `enrichment.ts`, **solo falta DFSK Glory iX5** con batería/autonomía. El resto está cubierto.
- 111 modelos tienen datos eléctricos por enriquecimiento, no por el JSON de marca. Es deuda técnica: si se elimina una clave de enriquecimiento, la ficha queda sin datos.

### 2.7 Fotos

- 616/625 con foto; 9 siluetas (146, 223, 364, 528, 529, 616, 629, 630, 632).
- 19 fuentes compartidas entre variantes del mismo modelo. La mayoría son correctas, pero hay dos casos claros de generación equivocada:
  - **GWM Jolion Pro** usa la foto del Jolion 2020.
  - **Jetour X70** usa la foto del X70 Plus.
- Las 6 fotos recambiadas en el Lote 23 quedaron bien; el problema es que no hay un test automático de "foto = generación".

---

## 3. Errores de programación P0

### 3.1 Los enlaces de las páginas de marca no abren el auto

`BrandPage.tsx:56` enlaza a `/?id=${car.id}`. **Ninguna parte de la app lee `?id=`**: `Home` no usa `useSearchParams` ni `location.search`. Al hacer clic en cualquier modelo de `/marca/toyota` se llega al home y no pasa nada.

Verificado en navegador: 23 tarjetas en `/marca/toyota`; clic en la primera → URL `/?id=564`, modal `false`.

Es el bug funcional más visible y afecta a los 625 modelos.

**Fix:** crear ruta `/auto/:slug` (o `/marca/:brand/:model`) y que las tarjetas apunten ahí. Como mínimo inmediato, leer `?id=` en `Home` y abrir el modal. La ruta propia además resuelve SEO y compartir.

### 3.2 Compartir un auto comparte el home

- `CarDetail.tsx:69`: el texto de WhatsApp agrega `siteUrl` (raíz), no el auto.
- `CarDetail.tsx:125`: `ShareButton` recibe `url={`${siteUrl}/`}`.

El usuario comparte "Mira el Toyota Corolla…" y el enlace abre la portada. Con la ruta `/auto/:slug` se corrige de raíz.

### 3.3 Dos CTA flotantes superpuestos en móvil

- `Navbar.tsx:324-330`: pill fijo abajo a la derecha, visible cuando el menú está cerrado.
- `PublishFloat.tsx:11-18`: barra fija de ancho completo abajo.

Ambos son `fixed bottom`, `z-40` y se muestran a la vez. En 390×844 medí:

- pill: ancho 153 px, borde inferior 824;
- barra: ancho 358 px, borde inferior 828.

La barra tapa al pill y, en el menú móvil, tapa el botón "Iniciar Sesión". Además duplica el CTA del hero y el de la navbar: tres "Publicar gratis" en la misma pantalla.

**Fix:** dejar solo uno (la barra) y ocultarla cuando haya modal/menú abierto; agregar `padding-bottom` al contenido móvil.

---

## 4. Errores P1 (UX, accesibilidad, lógica)

1. **Modal sin semántica:** `.modal-content` no tiene `role="dialog"`, `aria-modal`, `aria-labelledby` ni focus trap; el botón de cerrar es un "×" sin `aria-label`. Escape funciona, pero el foco se queda detrás.
2. **Slider de precio inaccesible e incompleto:** los dos `<input type="range">` no tienen `aria-label`; en Firefox no hay estilos `::-moz-range-thumb` (los pulgares no se ven); cuando ambos valores se acercan, los inputs se superponen y no se puede arrastrar el mínimo.
3. **7 controles sin etiqueta** en el catálogo: buscador, orden, año mín/máx, precio mín/máx y airbags. Los `<label>` no están asociados con `htmlFor`/`id`.
4. **Búsqueda no resetea la página:** `Home.tsx:356` pasa `setSearchQuery` directo; si buscas desde la página 20, quedas en la última página de resultados. `updateFilter` sí resetea; la búsqueda no.
5. **Filtros móviles abiertos por defecto:** `FilterPanel.tsx:21` usa `useState(true)`. En 390 px el panel ocupa casi toda la primera pantalla y los resultados quedan bajo el pliegue. Debería iniciar colapsado en móvil.
6. **Botón de filtros sin `aria-expanded`/`aria-label`**; el chevron no anuncia estado.
7. **Dos `<main>`:** `App.tsx:115` y `Home.tsx:362`. Cuando se abre el catálogo hay dos landmarks principales.
8. **"Vistos recientemente" inconsistente:** las tarjetas del catálogo (`Home.tsx:376`) no llaman `addRecent`; el modal y las rieles sí. Los botones Anterior/Siguiente del modal tampoco.
9. **Menú móvil sin accesibilidad:** el hamburger no tiene `aria-label` ni `aria-expanded`; el toggle de tema dice "Toggle dark mode" en inglés; el menú es muy alto y el CTA lo tapa.
10. **Ranking del buscador de marcas:** al escribir "h" aparecen primero Changan, Chery, Chevrolet y Mitsubishi (coinciden por dentro) y Honda/Hyundai quedan abajo. Conviene ordenar primero los que empiezan con la consulta.
11. **Slugs no ASCII:** `citroën`, `škoda` y `lynk-&-co` son las URLs reales; `citroen`, `skoda` y `lynk-co` dan "Marca no encontrada". El sitemap publica URLs Unicode. Hay que crear un mapa de slugs ASCII y redirecciones 301.
12. **Comparador con datos obsoletos:** `compareList` guarda el objeto `Car` completo en localStorage. Si se actualizan precios, el comparador sigue mostrando los antiguos hasta limpiar. Guardar solo IDs y resolver contra `carsData`.
13. **TCO con doble conteo:** `calculateTCO` suma la cuota del crédito **y** la depreciación (`tco.ts:127-157`). Son dos formas de contar el mismo costo de capital; el TCO queda inflado. Además:
    - el crédito se simula por el 100% del precio (sin pie), mientras `CreditCalc` usa 10%;
    - `total5Years = totalAnnual * 5` mantiene la cuota de un crédito de 60 meses aunque el plazo elegido sea 48;
    - el seguro se calcula como 1,5% del precio nuevo todos los años, sin depreciación.
14. **"CAE" impropio:** `CreditCalc` llama CAE a `(1+tasa mensual)^12−1`, que es la tasa efectiva anual del interés, sin seguros ni gastos. El texto aclara "sin seguros ni gastos", pero el número no debería llamarse CAE. Usar "TIE" o "tasa efectiva referencial".
15. **Ficha de un aviso vencido:** `getUsedListingBySlug` filtra `status = active` pero no `published_at`/`expires_at`; un aviso expirado sigue accesible por URL directa.
16. **Soft 404:** `/marca/inexistente` responde 200 con "Marca no encontrada" y sin `noIndex`.
17. **Rutas personales en el sitemap:** `/compare` y `/favorites` están indexadas y siempre están vacías para un crawler. Sacarlas o marcarlas `noindex`.
18. **Slug del blog con el typo viejo:** `/blog/tcu-costo-vehiculo-propiedad` sigue vivo aunque el contenido ya dice TCO. Si se renombra, hace falta 301.

---

## 5. Hallazgos visuales

- **Móvil:** la barra verde "Publicar gratis" tapa contenido al final de cada página y el botón de login del menú. En el home convive con el CTA del hero y el de la navbar.
- **Móvil, catálogo:** el panel de filtros abierto deja los autos bajo el pliegue; no hay un botón "Ver resultados" que cierre el panel.
- **Modal:** las versiones muestran valores crudos: `automatica`, `4x2`, `awd`, sin tilde ni etiqueta. El badge `awd` en minúscula choca con `Automática`.
- **Botón de compartir de la tarjeta:** es solo un icono verde sin texto visible (solo `title`); en móvil no se descubre.
- **Placeholders de imagen:** cuando una foto no carga, se ve el degradado de marca con el nombre; parece un error de carga más que un fallback intencional. Las siluetas existen pero solo se usan cuando `file` es `null`, no cuando falla la carga.
- **Modo oscuro:** correcto en general; los badges amarillos y verdes mantienen contraste suficiente. No se detectaron textos invisibles.
- **Escritorio:** grilla de 4 columnas y sidebar de filtros bien; el skeleton de rutas funciona. El único problema visual relevante es el modal sin foco y los CTA móviles.
- **Consola:** sin errores; solo los avisos esperados de Plausible (`Ignoring Event: localhost`).

---

## 6. Lo que sí está bien

- `lint`, `build` y **222 tests** en verde; CI de deploy ejecuta los tres.
- **PWA** con manifest, service worker, iconos 192/512/apple-touch, meta iOS y `InstallHint`.
- **Sin errores de consola** en las rutas probadas; carga diferida por ruta con skeletons.
- **Búsqueda semántica local** (`recommender.ts`) con 21 tests y explicaciones en español.
- **Marketplace** con RLS, moderación, verificación de correo, términos y `AutoLupaSeal`; la arquitectura está bien pensada.
- **Fotos:** 616/625, con fuente y licencia en el manifiesto; 0 archivos faltantes en disco.
- **Accesibilidad base:** skip link, `lang="es"`, alt en imágenes, foco visible en la mayoría de controles.
- **Rendimiento:** las rutas pesadas están en `lazy`; el catálogo es el chunk grande (aviso de Vite >500 kB), pero no bloquea la primera pantalla.

---

## 7. Plan para llegar al 100%

### Lote 24 — Reconstruir datos 2026 (2–3 semanas)

1. Por marca, partir de la parrilla oficial y no del catálogo actual:
   - modelos y versiones vigentes;
   - precio "desde" con bono y precio lista por separado;
   - combustible real (HEV/PHEV/MHEV);
   - specs de la ficha chilena.
2. Eliminar o mover a "modelos descontinuados" los que no estén en la parrilla 2026.
3. Resolver duplicados (GWM/Haval, Niro, Tucson/Sportage, RAV4/C-HR).
4. Corregir tipos: superdeportivos a `coupe`, MG GT a `sedan`.
5. Reemplazar `latin_ncap_stars` por `safety_ratings` con fuente o quitar el campo.
6. Validar las 9 siluetas y las fotos de generación dudosa.
7. Dejar un script de auditoría (`scripts/audit-catalog.mjs`) que falle si: `price ≠ min(versions)`, hay duplicados, falta fuente de seguridad, un EV no tiene batería/autonomía o un precio no es múltiplo de 10.000.

### Lote 25 — P0 de código (2–3 días)

1. Ruta `/auto/:slug` + enlaces desde marca, comparador, favoritos y búsqueda; `?id=` como redirección.
2. Compartir con URL del auto.
3. Un solo CTA flotante móvil y `padding-bottom` global.
4. Modal con `role="dialog"`, `aria-modal`, foco inicial, focus trap y cierre accesible.
5. Slider de precio con `aria-label`, estilos Firefox y z-index correcto.
6. Reset de página al buscar; filtros colapsados en móvil.
7. `addRecent` en todas las aperturas.

### Lote 26 — SEO y dominio (3–5 días)

1. Slugs ASCII + 301 (`citroen`, `skoda`, `lynk-co`).
2. Sitemap con páginas de auto; excluir `/compare` y `/favorites`.
3. 301 del slug `tcu-...` a `tco-...`.
4. Cambiar `index.html`, `robots.txt`, `security.txt`, `sitemap.xml`, Plausible y `VITE_SITE_URL` al dominio `.cl`.
5. Search Console + verificación de 301 y canonical.

### Lote 27 — Marketplace (3–5 días)

1. Aplicar `202610070001_seller_email_verified.sql` (sigue bloqueado por el PAT 401).
2. Re-ejecutar `scripts/rls-matrix.mjs` con roles reales.
3. Probar el bucle real de correo (sin SMTP no se puede).
4. Sembrar 10–20 avisos reales y moderarlos.
5. Turnstile + límites de publicación.

**Estimación total:** 4–6 semanas de trabajo parcial. El catálogo es el 60% del esfuerzo.

---

## 8. Publicidad: sí, pero preparada y vendida directamente

### Recomendación

**Sí conviene dejar los espacios hechos, pero no llenarlos con AdSense todavía.** Con el tráfico inicial, AdSense paga poco y ensucia la experiencia; lo que sí funciona en un marketplace de autos es la venta directa a concesionarios, aseguradoras y financieras.

La idea es tener **inventario declarado, componente listo y media kit**, y activar cada espacio solo cuando esté vendido. Nada de anuncios en producción "por si acaso".

### Inventario propuesto (6 espacios, máximo 2 por página)

| ID | Ubicación | Formato | Prioridad |
|---|---|---|---|
| `home-hero` | Home, bajo el hero | 970×90 / 320×100 | Alta |
| `home-native` | Home, entre "Destacados" y "Recientes" | tarjeta nativa de marca/modelo | Alta |
| `catalog-infeed` | Catálogo, después de la 6.ª tarjeta | tarjeta nativa | Alta |
| `detail-offer` | Ficha del auto, bajo "Próximos pasos" | 300×250 o card de concesionario | Muy alta |
| `used-infeed` | Listado de usados, después del 6.º aviso | tarjeta nativa | Media |
| `brand-sponsor` | Cabecera de página de marca | banner de concesionario | Media |

Reglas de UX/SEO:

- Nunca en el primer viewport móvil.
- Altura reservada (aspect-ratio o `min-height`) para no provocar CLS.
- Etiqueta visible "Publicidad" o "Patrocinado".
- `rel="sponsored nofollow noopener"` en enlaces pagados.
- Sin pop-ups, interstitials ni anuncios dentro de la tabla comparativa o el TCO.
- Carga diferida con `IntersectionObserver` y solo si el espacio está vendido.
- Un evento `AdImpression`/`AdClick` en Plausible para reportar al anunciante.
- Consentimiento y política de privacidad actualizados si se usa publicidad personalizada (Ley 21.719).

### Implementación mínima

```
src/components/Ads/AdSlot.tsx
src/data/ads.ts
```

`AdSlot` recibe `slotId`, `format`, `minHeight`; si no hay campaña activa, no renderiza nada. `ads.ts` define campaña, imagen, enlace, alt, fechas y etiqueta. Un flag `VITE_ADS_ENABLED` permite apagar todo sin tocar código.

### Precios de referencia (Chile, 2026)

- Home banner: **UF 3–6/mes** (~$120.000–$240.000), o $100.000/mes introductorio.
- Tarjeta nativa en catálogo: **UF 2–4/mes**.
- Ficha de auto: **UF 2–3/mes**.
- In-feed usados: **UF 2–4/mes** o CPC $150–$300 por lead.
- Destacado de aviso: **$9.900–$19.900 por 15 días** (ya existe `featured_until`).

### Qué haría ahora

1. Crear `AdSlot` + `ads.ts` + documentación de inventario (1 día).
2. Armar un media kit de 1 página con capturas, tráfico y públicos (medio día).
3. Ofrecer 2 espacios de lanzamiento a 3–5 concesionarios/aseguradoras como "socio fundador" (canje o precio introductorio).
4. Medir 30 días y recién ahí decidir si vale la pena AdSense como relleno.

**No** implementaría AdSense antes de tener 10.000 visitas/mes: el ingreso sería de $20.000–$60.000 CLP y el costo en confianza es mayor.

---

## 9. Fuentes consultadas

- Hyundai Chile: https://www.hyundai.cl/modelos
- Toyota Chile: https://www.toyota.cl/modelos
- Suzuki Chile: https://www.suzuki.cl/
- MG Motor Chile: https://www.mgmotors.cl/
- Mazda Chile: https://www.mazda.cl/
- Nissan Chile: https://www.nissan.cl/
- Kia Chile (promoción Morning): https://www.kia.cl/promociones/kia-morning.html

Los precios oficiales son los publicados el 22-10-2026 y pueden incluir bonos o condiciones de financiamiento; por eso el catálogo debe separar `precio_lista` y `precio_bono`, y guardar la fecha de consulta.

---

## 10. Estado de ejecución (22-10-2026)

- **Lote 24 iniciado por Hyundai**, no por la tabla de 53 precios: se reconstruyeron las 18 fichas vigentes desde las páginas de modelo de `hyundai.cl` (versión, precio desde, precio lista, bono y fuente). Se agregaron Grand i10 Sedán, Creta Grand, Kona Híbrido, Kona Eléctrico y Staria Furgón; Bayon, Elantra, HB20, i10, Ioniq 5 e Ioniq 6 quedaron marcados `lineup_2026: false`.
- **La tabla 2.1 se usó como detección, no como valor final**: las páginas de modelo publican un precio base más bajo que el botón «Desde» de la portada en varios casos (i20, Accent, Tucson Híbrido, Santa Fe, Staria, Porter). El catálogo guarda ahora el precio de la versión mínima publicada en la ficha y el precio lista/bono asociado.
- **Seguridad**: se retiró Latin NCAP sin fuente de la ficha, el comparador, el Top 10 y el wizard. Solo se muestran `safety_ratings` con fuente. Los 338 `latin_ncap_stars` legacy quedan en los JSON como deuda de limpieza, sin efecto en la interfaz.
- **Tipos y duplicados**: 8 superdeportivos a `coupe`, MG GT a `sedan`, Niro EV fuera de las versiones del Niro HEV y Sportage híbrido fuera de las versiones bencina.
- **Gate**: `npm run audit:catalog` (630 modelos / 1.310 versiones / 0 errores), `LINT=0`, `TEST=229/229`, `BUILD=0`; CI ejecuta la auditoría antes del build.
- **Siguiente**: Toyota, Suzuki, MG, Mazda, Nissan y Kia con el mismo método; después GWM/Haval/Jolion, RAV4/C-HR y fotos dudosas.
