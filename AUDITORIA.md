> **Documento histórico.** El backlog vigente está en `docs/ROADMAP.md` (mejoras) y `docs/BLOCKERS.md` (dependencias externas); el estado de trabajo en `.opencode/continuity/STATE.md`. Se conserva como registro; no se actualiza.

# Auditoría Completa AutoLupa — 21/09/2026

## 🔴 CRÍTICOS — Todos corregidos ✅

### 1. Navbar decía "AutoMatch"
- **Archivo:** `src/components/Layout/Navbar.tsx`
- **Corrección:** Logo "AM" → 🔍, texto "AutoMatch" → "AutoLupa"

### 2. Wizard: km/mes con rangos irreales
- **Archivo:** `src/components/Wizard/AutoWizard.tsx`
- **Corrección:** Cambiado a **km/año** basado en Autofact (15.000–27.000 km/año = normal)
  - <12.000 km/año → Uso esporádico
  - 12.000–20.000 km/año → Uso urbano normal (promedio Chile)
  - 20.000–30.000 km/año → Uso intenso
  - >30.000 km/año → Ruteo/transporte/trabajo

### 3. Combustible incorrecto en 3 vehículos
| Auto | ID | Antes | Después |
|------|-----|-------|---------|
| Hyundai Tucson Híbrido | 258 | `hibrido` | `hibrido_enchufable` |
| Suzuki Across Hybrid | 544 | `hibrido` | `hibrido_enchufable` |
| Changan Hunter REEV | 85 | `electrico` | `hibrido_enchufable` |

### 4. Consumo PHEV en unidades incorrectas (Chery)
| Auto | ID | Antes | Después |
|------|-----|-------|---------|
| Tiggo 7 Pro Max PHEV | 100 | 1.8 km/l (era l/100km) | 55 km/l |
| Tiggo 8 Pro Max PHEV | 102 | 2.0 km/l (era l/100km) | 50 km/l |

### 5. Consumo Hyundai Tucson PHEV irreal
- **ID 258:** `fuel_consumption_mixed_km_l=50` (km-e, no km/l real)
- **Corrección:** → 17 km/l (modo híbrido real)

### 6. Precio base menor que versión más barata
- **Chevrolet Montana (ID 116):** $17.400.000 base < $17.920.100 versión LT
- **Corrección:** Base → $17.920.100

### 7. Origen "china" sin capitalizar (100+ autos)
- **Corrección:** `origin: "china"` → `"China"` en todas las marcas chinas

---

## 🟠 MODERADOS — Documentados

### 8. Comparador: límite inconsistente
- **AGENTS.md** decía "hasta 4 vehículos" pero el código limita a 3
- **Corrección:** AGENTS.md actualizado a "hasta 3 vehículos"

### 9. Consumo faltante en PHEVs
| Auto | ID | Problema |
|------|----|----------|
| Deepal G318 | 140 | Sin `fuel_consumption_mixed_km_l` |
| Deepal S07 | 142 | Sin `fuel_consumption_mixed_km_l` |
| Jaecoo J7 SHS | 273 | Sin `fuel_consumption_mixed_km_l` |

→ Pendiente de verificar con ficha oficial.

### 10. Versiones híbridas bajo tipo base
Toyota C-HR (566), Corolla (568), RAV4 (579), Kia Sportage (327) tienen versiones híbridas en el array `versions` pero `fuel=gasolina`. Patrón inconsistente (algunos ya tienen entradas separadas).

### 11. Kia Niro (319): 3 tipos de combustible en una entrada
`fuel=hibrido` pero versions incluye "EV" y "PHEV". Considerar separar.

### 12. Hyundai Porter (254): ¿gasolina o diésel?
En Chile el Porter típicamente es diésel. Verificar 2026.

### 13. MG Cyberster duplicado (416, 423)
Dos entradas para el mismo modelo (2025 y 2026). Podría diferenciarse en el nombre.

---

## 🟡 MENORES — Observaciones

### 14. Redundancia origin/origin_country
Todos los 626 autos tienen `origin` y `origin_country` con el mismo valor. Podría unificarse.

### 15. Favicon genérico
El favicon SVG no es el logo de AutoLupa. Debería ser un 🔍 estilizado.

### 16. trunk_liters=0 en SUVs de pasajeros
Algunos SUVs (Fortuner, Land Cruiser, Montero Sport) tienen `trunk_liters: 0` que parece dato faltante, no 0 real.

### 17. Documentos legales con RUT placeholder
"XX.XXX.XXX-X" en documentos de privacidad y términos.

### 18. Chunk index >950 KB
Datos de catálogo embebidos. Considerar code-splitting dinámico.

---

## ✅ PASSED CHECKS

- Sin IDs duplicados en 626 autos
- Sin autos con precio $0 o asientos 0
- Años 2024-2026 (correcto)
- Precios de marcas de lujo realistas
- EVs correctamente sin consumo de combustible
- Todos los campos requeridos poblados
- Tests: 52/52 ✅
- Lint: 0 errores ✅
- Build: OK ✅

---

## 📊 Resumen de correcciones aplicadas

| # | Corrección | Archivos |
|---|-----------|----------|
| 1 | Navbar AutoMatch → AutoLupa | Navbar.tsx |
| 2 | Wizard km/mes → km/año (Autofact) | AutoWizard.tsx |
| 3 | Fuel types: 3 vehículos corregidos | hyundai.json, suzuki.json, changan.json |
| 4 | Consumo PHEV: unidades corregidas | chery.json |
| 5 | Consumo Tucson: 50 → 17 km/l | hyundai.json |
| 6 | Precio Montana: base = versión mín. | chevrolet.json |
| 7 | Origen: "china" → "China" | 100+ archivos de marcas |
| 8 | Comparador: docs dicen 4, código dice 3 | AGENTS.md |
