# Image Audit Report — AutoLupa

**Date:** 2026-09-21  
**Scope:** All 572 images in `src/data/carImages.json` (616 entries, 544 null/silhouette)  
**Method:** Automated cross-reference of Wikimedia Commons source URL filenames against `src/data/brands/*.json` catalog entries  

---

## Summary

| Category | Count |
|---|---|
| Total image entries | 616 |
| Images with source URL | 572 |
| **CRITICAL: Wrong car entirely** | **21** |
| **HIGH: Same model, wrong generation/variant** | **7** |
| **LOW: Naming convention (acceptable)** | 0 (excluded) |
| Shared source URLs (same image for multiple cars) | 24 groups |

---

> **Estado: 2026-10-06 (tras Lote 18)** — relectura comparando el `source` actual de cada id con el modelo del catálogo y con las categorías de Commons. Este documento es un snapshot del 21-09-2026.
>
> - **Resueltos (29 ids)**: 67, 71, 75, 167, 217, 248, 259, 271, 277, 278, 284, 323, 349, 377, 397, 406, 418, 421, 426, 433, 434, 439, 465, 500, 505, 522, 526, 530, 531 — la foto actual corresponde al modelo: 406 apunta a un `Mercedes-Benz EQE 350+`, 433/434 usan los Roewe RX8/RX9 (equivalentes de MG), 323 es Kia Pegas = Soluto, 217/271/277/397/439/465/500/526 se repusieron en el Lote 18 y 530/531 pasaron de `.png` a `.jpg`.
> - **Repuestos en el Lote 18 (los 11 que quedaban abiertos)**: 104 (Tiggo 8 Pro Max → **Chery Tiggo 9**) · 185 (Mustang GT → **Dark Horse**) · 187 (Ranger Limited → **Ranger Raptor P703**) · 227 (Wingle 7 → **Wingle 5**) · 309 (Torres Hybrid → **Torres EVX**) · 398 (CLA Shooting Brake X174 → **A 200 W177**) · 413 (ML W166 → **GLE 450 W167**) · 414 (GL X164 → **GLS 450 X167**) · 447 (Montero 4ª gen → **Montero Sport 2.4**) · 497 (TRX → **1500 RHO**) · 512 (Mégane IV → **Mégane E-Tech**). **40/40 resueltos, 0 abiertos.**
> - Las entradas que la limpieza dejó en `null` (silueta) se cerraron en el **Lote 18**: 56 fotos nuevas, manifiesto con 626 claves / 617 fotos / 9 siluetas (ver `SUMMARY.md`).
> - Los totales de la tabla (616 entradas / 572 fotos / 24 grupos de fuente compartida) corresponden a esta snapshot original.

## 🔴 CRITICAL — Source shows a completely different vehicle

These images show a car that is **not** the same model as the catalog entry. Users will see the wrong vehicle.

### ID 67 — BYD Han EV
- **Source shows:** BYD **Sealion 05** EV (`BYD_Sealion_05_EV_004.jpg`)
- **Should show:** BYD Han EV
- **Fix:** Find a BYD Han EV image on Commons

### ID 71 — BYD Song Plus DM-i
- **Source shows:** BYD **Song L** DM-i (`BYD_Song_L_DM-i_007_(cropped).jpg`)
- **Should show:** BYD Song Plus DM-i (different model line)
- **Fix:** Find a BYD Song Plus DM-i image on Commons

### ID 75 — BYD Yuan Pro
- **Source shows:** BYD **Atto 2** (`BYD_Atto_2_IAA_2025_DSC_2247.jpg`)
- **Should show:** BYD Yuan Pro
- **Fix:** Find a BYD Yuan Pro image on Commons

### ID 104 — Chery Tiggo 9 PHEV
- **Source shows:** Chery **Tiggo 7** II (`Chery_Tiggo_7_II_IMG005.jpg`)
- **Should show:** Chery Tiggo 9 PHEV (completely different model)
- **Fix:** Find a Chery Tiggo 9 image on Commons

### ID 167 — Fiat Ducato
- **Source shows:** Fiat **Truckster** (show car concept) (`Fiat_Truckster.JPG`)
- **Should show:** Fiat Ducato (commercial van)
- **Fix:** Find a Fiat Ducato image on Commons

### ID 217 — GWM Haval Jolion
- **Source shows:** Haval Motor Manufacturing **Rus factory/logo** (`Haval_Motor_Manufacturing_Rus_10.jpg`)
- **Should show:** Haval Jolion (compact SUV)
- **Fix:** Find a Haval Jolion image on Commons

### ID 248 — Hyundai i20
- **Source shows:** WRC Central European Rallye 2023 — a **rally race car** (`WRC_Central_European_Rallye_2023_Nr._11_(4).jpg`)
- **Should show:** Hyundai i20 production car
- **Fix:** Find a Hyundai i20 production car image on Commons

### ID 259 — Hyundai Venue
- **Source shows:** Generic auto show photo from Bangalore (`4th_International_Auto_Show,_Bangalore_(2025)_07.jpg`)
- **Should show:** Hyundai Venue
- **Fix:** Find a Hyundai Venue image on Commons

### ID 271 — Jaecoo J5
- **Source shows:** Jaecoo **J6** (`2026_Jaecoo_J6_grey_front.jpg`)
- **Should show:** Jaecoo J5 (different model)
- **Fix:** Find a Jaecoo J5 image on Commons

### ID 277 — Jaguar F-Type
- **Source shows:** Generic filename `Ol_car06a.JPG` — unrecognizable, likely wrong image
- **Should show:** Jaguar F-Type
- **Fix:** Find a Jaguar F-Type image on Commons

### ID 278 — Jaguar I-Pace
- **Source shows:** Formula E **race car** (Jaguar I-Type) (`2019_Rome_ePrix_23.jpg`)
- **Should show:** Jaguar I-Pace production SUV
- **Fix:** Find a Jaguar I-Pace production car image on Commons

### ID 284 — Jeep Gladiator
- **Source shows:** **1974 Jeep J10** pickup truck (`1974_Jeep_J10_pickup_truck_all-original_...`)
- **Should show:** Modern Jeep Gladiator (JT, 2019+)
- **Fix:** Find a modern Jeep Gladiator image on Commons

### ID 323 — Kia Soluto
- **Source shows:** Kia **Pegas** (China-market sedan) (`Kia_Pegas_01_China_2018-03-20.jpg`)
- **Should show:** Kia Soluto (different sedan for other markets)
- **Fix:** Find a Kia Soluto image on Commons

### ID 349 — Land Rover Range Rover Velar
- **Source shows:** Land Rover **logo SVG** (`Land_Rover_2023.svg`) — NOT a car photo
- **Should show:** Range Rover Velar
- **Fix:** Find a Range Rover Velar image on Commons

### ID 377 — Maserati Levante
- **Source shows:** Maserati **Kubang** concept from 2011 (`Maserati_Kubang_front.jpg`)
- **Should show:** Maserati Levante production SUV
- **Fix:** Find a Maserati Levante image on Commons

### ID 397 — Mercedes-Benz AMG GT
- **Source shows:** Mercedes **SLS AMG** Roadster (`SLS_AMG_Roadster.jpg`) — different car entirely
- **Should show:** Mercedes-AMG GT
- **Fix:** Find a Mercedes-AMG GT image on Commons

### ID 421 — MG MG 4 XPOWER
- **Source shows:** **AMI SV-R** (`AMI_SV-R.jpg`) — completely different brand/car
- **Should show:** MG 4 XPOWER
- **Fix:** Find an MG 4 XPOWER image on Commons

### ID 426 — MG MG ONE
- **Source shows:** **1969 MGB** open roadster (`MG_MGB_open_roadster_1969.jpg`) — 50+ year old classic
- **Should show:** MG ONE (modern crossover SUV)
- **Fix:** Find an MG ONE image on Commons

### ID 433 — MG RX8
- **Source shows:** **Roewe** RX8 (`Roewe RX8 005.jpg`) — different brand (Roewe ≠ MG)
- **Should show:** MG RX8
- **Fix:** Find an MG RX8 image on Commons

### ID 434 — MG RX9
- **Source shows:** **Roewe** RX9 (`Roewe RX9, front.jpg`) — different brand (Roewe ≠ MG)
- **Should show:** MG RX9
- **Fix:** Find an MG RX9 image on Commons

### ID 418 — MG MG 3
- **Source shows:** MG **TC Midget** from the 1950s (`MG_TC_Midget_dutch_licence_registration_...`) — vintage classic
- **Should show:** MG 3 (modern hatchback)
- **Fix:** Find an MG 3 image on Commons

### ID 439 — MINI Cooper
- **Source shows:** Generic IAA show photo (`11-09-04-iaa-by-RalfR-216.jpg`) — unrecognizable
- **Should show:** MINI Cooper
- **Fix:** Find a MINI Cooper image on Commons

### ID 465 — Nissan Z
- **Source shows:** **1970 Fairlady Z** classic (`JapaneseFairladyZ1970.jpg`) — 55+ year old classic
- **Should show:** Modern Nissan Z (2023+)
- **Fix:** Find a modern Nissan Z image on Commons

### ID 500 — RAM Promaster Rapid
- **Source shows:** Ram **ProMaster City** (compact van) (`Ram_ProMaster_City_Montréal.jpg`)
- **Should show:** RAM Promaster Rapid (different model)
- **Fix:** Find a RAM Promaster Rapid image on Commons

### ID 505 — Renault Captur
- **Source shows:** Generic Geneva Motor Show 2013 photo (`2013-03-05_Geneva_Motor_Show_8309.JPG`)
- **Should show:** Renault Captur
- **Fix:** Find a Renault Captur image on Commons

### ID 522 — SEAT Ateca
- **Source shows:** Generic Paris Motor Show 2018 photo (`Paris_Motor_Show_2018,_Paris_(1Y7A2062).jpg`)
- **Should show:** SEAT Ateca
- **Fix:** Find a SEAT Ateca image on Commons

### ID 526 — Seres 3
- **Source shows:** **SFMotors** company logo/photo (`SFMotors.jpg`) — not a car
- **Should show:** Seres 3
- **Fix:** Find a Seres 3 image on Commons

### ID 530 / 531 — Smart #1 / Smart #3
- **Both show:** Smart **logo SVG** (`Smart_2022.svg`) — NOT car photos
- **Should show:** Smart #1 and Smart #3 respectively
- **Fix:** Find Smart #1 and Smart #3 images on Commons

---

## 🟠 HIGH — Same model family but wrong generation/variant

These show the same brand model but a **different generation, powertrain, or significantly different trim** that would mislead users.

### ID 185 — Ford Mustang Dark Horse
- **Source shows:** Ford Mustang **GT** (`2024_Ford_Mustang_GT_Las_Vegas_2025_(cropped).jpg`)
- **Should show:** Mustang Dark Horse (higher performance variant, different styling)
- **Note:** Same shared with ID 184 (Ford Mustang base) — may be acceptable for the base Mustang

### ID 187 — Ford Ranger Raptor
- **Source shows:** Ford Ranger **Limited** (`2017_Ford_Ranger_Limited.jpg`) — different trim + older model year
- **Should show:** Ranger Raptor (off-road performance variant, wider body, different front fascia)
- **Note:** Same shared with ID 186 (Ford Ranger base)

### ID 309 — KGM Torres EVX
- **Source shows:** KGM Torres **Hybrid** (`KGM_Torres_Hybrid_...`)
- **Should show:** Torres EVX (fully electric version — different powertrain/variant)
- **Note:** Same shared with ID 308 (KGM Torres base)

### ID 398 — Mercedes-Benz Clase A
- **Source shows:** Mercedes-Benz **X174 = GLA** (`Mercedes-Benz_X174_IAA_2025_DSC_2087.jpg`)
- **Should show:** Mercedes-Benz A-Class (Clase A) — X174 is the GLA, a different model
- **Fix:** The X174 chassis code is the GLA subcompact SUV, not the A-Class hatchback/sedan

### ID 406 — Mercedes-Benz EQE
- **Source shows:** Mercedes-Benz **V295 = EQV** (`Mercedes-Benz_V295_350+_Classic-Days_2022_DSC_0018.jpg`)
- **Should show:** Mercedes-Benz EQE — V295 is the EQV electric van, a completely different vehicle
- **Fix:** The V295 is the electric V-Class van, not the EQE sedan

### ID 413 — Mercedes-Benz GLE
- **Source shows:** Mercedes-Benz **ML 250** BlueTEC W166 (`Mercedes-Benz_ML_250_BlueTEC_(W_166)_...`)
- **Should show:** Current-generation GLE (W167, 2019+)
- **Note:** ML is the predecessor name; W166 ML (2011-2019) predates the current GLE

### ID 414 — Mercedes-Benz GLS
- **Source shows:** Mercedes **GL 320** CDI (`Mercedes_GL_320_CDI_4-Matic_20090611_front.JPG`)
- **Should show:** Current-generation GLS (X167, 2019+)
- **Note:** GL is the predecessor name; this is a 2009 model, very old generation

### ID 512 — Renault Megane E-Tech
- **Source shows:** 2017 Renault **Megane** IV (`2017_Renault_Megane_Dynamique_S_NAV_DC_1.5_Front.jpg`)
- **Should show:** Megane E-Tech Electric (2022+, completely different car)
- **Note:** The 2017 Megane is a combustion-engine hatchback/wagon, not the electric E-Tech

### ID 447 — Mitsubishi Montero Sport
- **Source shows:** Mitsubishi **Montero 4** (`Mitsubishi_Montero_4.jpg`)
- **Should show:** Montero Sport (different model — the Sport is a midsize SUV, Montero 4 may be the Pajero/Montero full-size)
- **Note:** Need to verify if Montero 4 = Montero Sport or Pajero

### ID 497 — RAM 1500 RHO
- **Source shows:** RAM 1500 **TRX** (`2021-22_RAM_1500_TRX.jpg`)
- **Should show:** RAM 1500 RHO (TRX replacement, slightly different styling)
- **Note:** Very similar but TRX is discontinued, RHO is the current model

---

## ⚠️ Shared Source URLs (same image for multiple catalog entries)

24 source URLs are shared across multiple car IDs. While some are acceptable (same car, different powertrain variants sharing an exterior photo), others are problematic:

| Source | IDs | Catalog Models | Issue |
|---|---|---|---|
| `Chery_Tiggo_8_Plus_018` | 101, 102 | Tiggo 8 Pro Max, Tiggo 8 Pro Max PHEV | Acceptable (same car) |
| `Colorado_Z71` | 110, 111 | Colorado, Colorado Z71 | Acceptable (trim variant) |
| `Mustang_GT` | 184, 185 | Mustang, Mustang Dark Horse | ⚠️ Dark Horse has unique styling |
| `Ranger_Limited` | 186, 187 | Ranger, Ranger Raptor | ⚠️ Raptor has unique body |
| `H6_III` | 212, 213, 214, 216 | H6, H6 Híbrido, H6 PHEV, H6 HEV | Acceptable (same exterior) |
| `Jolion` | 218, 219, 220 | Jolion, Jolion Pro, Jolion Pro Híbrido | Acceptable |
| `Wingle_7` | 227, 228 | Wingle 5, Wingle 7 | ⚠️ Different models! |
| `i10` | 245, 247 | Grand i10, i10 | Acceptable (same platform) |
| `Tucson` | 257, 258 | Tucson, Tucson Híbrido | Acceptable |
| `J7` | 272, 273 | J7, J7 SHS | Acceptable |
| `Compass` | 282, 283 | Compass, Compass 4xe | Acceptable |
| `Wrangler` | 287, 288 | Wrangler, Wrangler 4xe | Acceptable |
| `X70_Plus` | 290, 291 | X70, X70 Plus | Acceptable |
| `Torres_Hybrid` | 308, 309 | Torres, Torres EVX | ⚠️ EVX is electric, different powertrain |
| `Niro_PHEV` | 319, 320 | Niro, Niro EV | ⚠️ PHEV photo for EV |
| `Sorento` | 325, 326 | Sorento, Sorento Híbrido | Acceptable |
| `Sportage` | 327, 328 | Sportage, Sportage Híbrido | Acceptable |
| `XUV700` | 372, 373 | XUV700, XUV700 Diesel | Acceptable |
| `T60` | 380, 381 | T60, T60 MAX | Acceptable |
| `T90_EV` | 382, 383 | T90, T90 EV | ⚠️ EV photo for non-EV? |
| `Cyberster` | 416, 423 | Cyberster (duplicated) | Acceptable (duplicate entry) |
| `ZS` | 427, 428, 429 | ZS, ZS EV, ZS Hybrid | Acceptable |
| `C5` | 466, 467 | C5, C5 SHS | Acceptable |
| `Smart_2022.svg` | 530, 531 | Smart #1, Smart #3 | 🔴 Both use logo, not car photos |

---

## Additional Concerns

### ID 227 — GWM Wingle 5
- **Source shows:** Great Wall **Wingle 7** (`Great_Wall_Wingle_7.jpg`)
- **Catalog says:** GWM **Wingle 5**
- **Issue:** Wingle 5 ≠ Wingle 7 (different truck models)
- **Note:** Same source shared with ID 228 (Wingle 7)

### ID 323 — Kia Soluto
- **Source shows:** Kia **Pegas** (China-market)
- **Catalog says:** Kia Soluto
- **Issue:** While both are subcompact sedans, they are different models for different markets

### ID 447 — Mitsubishi Montero Sport
- **Source shows:** Mitsubishi **Montero 4**
- **Catalog says:** Mitsubishi Montero Sport
- **Issue:** Need to verify if the image shows a Montero Sport or a full-size Montero/Pajero

---

## Resolution Priority

1. **Fix immediately (21 critical):** Wrong car entirely — users see completely different vehicle
2. **Fix soon (7 high):** Wrong generation/variant — misleading but same model family
3. **Review (shared URLs):** Determine if shared photos are acceptable or need unique images
