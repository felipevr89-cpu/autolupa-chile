# Contraste del catálogo con la oferta chilena — 11-11-2026

Criterio: `price` = precio lista − bono directo (sin bono de financiamiento, ADR-005). Si la marca solo publica bonos condicionados a crédito (Omoda/Jaecoo, Geely), `price` = precio lista. Pickups y vans comerciales conservan el precio publicado **+ IVA**.

## Marcas del top 25 ANAC (ene–oct 2026)

Las 25 marcas más vendidas (Toyota, Suzuki, Hyundai, Kia, Chevrolet, Ford, GWM, Changan, Peugeot, MG, Mitsubishi, Mazda, Chery, Jetour, Maxus, Foton, Volkswagen, Subaru, JAC, Omoda & Jaecoo, Geely, Citroën, RAM, Tesla, BYD) están en el catálogo. Fuente: ANAC vía [Autocosmos](https://noticias.autocosmos.cl/2026/11/09/venta-de-autos-en-chile-octubre-da-un-respiro-a-la-industria).

## Aplicado (fuente oficial de la marca)

| Marca | Cambios | Fuente |
|---|---|---|
| Subaru | Impreza, Crosstrek, Forester y Outback con versiones y precios oficiales; XV e-Boxer pasa a **Crosstrek Híbrido** (foto anterior retirada por ser de otra generación); nuevos **Forester Híbrido (699)**, **WRX (700)**, **Evoltis (701)** y **Trailseeker EV (702)**; XV, BRZ, Legacy y Solterra fuera de parrilla | subaru.cl/vehiculos/* |
| Volkswagen | Amarok V6 (+IVA), Polo, Nivus, T-Cross, Taos, Tiguan e ID.4 con precios válidos 1–30 nov 2026; nuevos **Polo Track (703)**, **Tera (704)**, **Tiguan MHEV (705)**, **Atlas (706)**, **Jetta GLI (707)**, **Golf GTI (708)**, **Saveiro (709, +IVA)**; Jetta, Virtus y Touareg fuera de parrilla | volkswagen.cl |
| Changan | CS55 Plus, Hunter, Hunter REEV (reclasificado a `hibrido_enchufable`, 131 km eléctricos) y Lumin (28 kWh / 301 km) | changan.cl/vehiculo/* |
| Deepal | S05 pasa a **S05 REEV** (antes `gasolina`) y se agrega **S05 EV (710)** 56,12 kWh / 470 km | changan.cl/vehiculo/deepal/s05 |
| Omoda / Jaecoo | C5, C5 SHS, C7, E5, J5, J7, J7 SHS y J8 con versiones oficiales; nuevo **J6 EV (711)** | omodajaecoo.cl/modelos/* |
| Geely | New Coolray, EX2 y EX5 EM-i con versiones oficiales; nuevo **EX5 EV (712)**; Azkarra, Geometry C y Monjaro fuera de parrilla (no figuran en geely.cl) | geely.cl/modelos/* |

Resultado: **688 modelos / 1.488 versiones / 0 errores** (`npm run audit:catalog`).

## Pendiente — fuente oficial no disponible o sin desglose

| Marca | Hallazgo | Motivo de no aplicar |
|---|---|---|
| BYD | Autocosmos (lista): Dolphin $28.990.000 (catálogo $21.990.000), Tang $70.990.000 (catálogo $44.990.000), Sealion 7 $37.990.000, Song Pro GS $30.990.000, Atto 8 DM-p GS $49.990.000 | bydauto.cl redirige a un concesionario que bloquea la lectura; precios de lista sin bono ni fecha |
| Chery | Tiggo 8 Pro Max lista $23.990.000–$33.990.000 (catálogo $18.990.000); Tiggo 3 Pro lista $15.490.000; Himla renombrada (Force/Adventure/Everest) | chery.cl no expone precios; catálogo digital excede el tamaño de lectura |
| Jetour | Autocosmos: X50 $12.490.000, Dashing $16.490.000–$18.490.000, T1 $22.990.000, T2 $29.990.000, T2 PHEV $36.990.000 | jetour.cl sin DNS; solo precios de lista |
| Changan | CS35 Plus, CS75 Plus, UNI-K, UNI-T, X7 Plus, Alsvin, CS15 solo con «desde» de portada; existen **CS55 Plus iDD** y **Eado Plus iDD** (PHEV) y la línea comercial (MD201, Star Truck) | sin desglose de versión, combustible ni transmisión |
| Changan Hunter | La página oficial titula «4x4 Diésel»; el catálogo lo tiene como bencina | combustible no indicado por versión |
| Avatr | Portada: **AVATR 07** REEV AWD desde $46.990.000 y AVATR 11 EV desde $59.990.000 (catálogo $49.990.000) | solo leyenda de portada |
| Maxus | Autocosmos agrega D90, Deliver 9, eDeliver 3/9, Euniq 5, G-10 y Mifa 9 | maxus.cl bloqueado (403) |
| Foton | Autocosmos no lista Tunland G ni Gratour; lista G7, G9, V7, V9, TM3, TM5, Wonder, K1, FT-Box | foton.cl bloqueado (403) |
| JAC | Oficial: JS8, JS8 Pro, X200, Refine, IGNITE30X EV y T9 EV no están en el catálogo | portada sin versiones; Autocosmos difiere |
| Tesla | Model 3 y Model Y con versiones RWD / Long Range / Performance; **Model Y L** (6 plazas) $47.900.000 | tesla.com bloqueado (403) |
| Honda | Autocosmos: Civic $31.390.000, CR-V $42.990.000, **CR-V Hybrid** $49.990.000, Pilot $59.990.000; Accord y Ridgeline no figuran | honda.cl/autos 404 |
| KGM | **Tivoli** vuelve (oct 2026); Actyon HEV y Torres híbrido anunciados | kgm.cl sirve contenido ajeno |
| BAIC | baic.cl lista **BJ40 Pro** y **EU5** (EV, 401 km NEDC) | sin precios oficiales |
| Geely | GX3 Pro (Autocosmos $10.790.000) y Coolray GL/GK/GF; Cityray, Coolray Lite, Okavango y Starray sin precio oficial | solo Autocosmos |
| Leapmotor | Sin fuente legible (leapmotor.cl sin DNS, Autocosmos 404) | — |

## Marcas nuevas sin datos para catalogar

- **Arcfox** (BAIC), **Denza** (BYD) y **Lepas** (Chery: L4 EV, L6 EV, L8 PHEV) anunciadas en abril 2026 ([CNN Chile](https://www.cnnchile.com/negocios/salon-auto-beijing-2026-tres-fabricantes-chinas-vehiculos-electricos-aterrizaran-en-chile/)); sin precios ni fichas chilenas publicadas a la fecha.
- **iCaur** (Chery) confirma llegada en 2027; Changan **Nevo Q05** también desde 2027.

## Próximo paso

Repetir el contraste de las marcas pendientes con el catálogo digital de cada marca o la lista de un concesionario oficial (como se hizo con Rosselot para Stellantis) y aplicar en lotes por marca.
