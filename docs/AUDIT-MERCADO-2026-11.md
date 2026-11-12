# Análisis de mercado: catálogo vs. oferta vigente en Chile — 12-11-2026

Fuente de contraste: catálogo vigente de [Autocosmos Chile](https://www.autocosmos.cl/catalogo) (precios de lista informados por fabricantes e importadores), leído el 12-11-2026: **69 marcas, 693 modelos y 1.574 versiones**. Se cruzó por marca y modelo contra `src/data/brands/*.json`.

## Criterio

- Las marcas ya contrastadas con su sitio oficial (modelos con `price_source` propio) **no se tocaron**: en ellas Autocosmos conserva modelos descontinuados (por ejemplo Suzuki Grand Vitara y XL7, Mazda 6, Jaguar XE).
- En los modelos sin fuente previa se reemplazaron versiones y precios por los de lista de Autocosmos, con transmisión y tracción leídas de la ficha de cada versión. `price` pasa a ser **precio de lista** (sin bonos), con `price_source` y `price_checked_at`.
- Solo se agregaron modelos de pasajeros con precio publicado y ficha completa. Las plazas no figuran en la ficha de Autocosmos: se asignaron por conocimiento del modelo (7 en Dongfeng SX6 y T5 L, JAC JS8 y JS8 Pro; 5 en el resto) y conviene verificarlas.
- Las descripciones de los modelos nuevos se generan a partir de la ficha; no llevan foto (silueta).

## Marcas

- Catálogo AutoLupa: **98 marcas**. Autocosmos: **69**. Las 63 marcas comunes cubren todo el top 25 de ANAC.
- En Autocosmos y no en AutoLupa (6): Iveco (3), JIM (1), Karry (5), Landking (2), Nammi (2), UAZ (5). Son comerciales livianos o de nicho; no se agregaron.
- En AutoLupa y no en Autocosmos (35): marcas de lujo, de bajo volumen o recientes (Abarth, Aston Martin, Avatr, Bentley, Deepal, Ferrari, Leapmotor, Lynk & Co, Polestar, Zeekr, entre otras) y las 6 marcadas como no vendidas nuevas en Chile.

## Modelos agregados (25)

| Id | Marca | Modelo | Combustible | Plazas | Versiones | Precio de lista desde |
|---:|---|---|---|---:|---:|---:|
| 713 | Honda | CR-V Híbrido | hibrido | 5 | 1 | $49.990.000 |
| 714 | BAIC | EU5 | electrico | 5 | 1 | $23.790.000 |
| 715 | Changan | CS55 Plus iDD | hibrido_enchufable | 5 | 2 | $22.990.000 |
| 716 | DFSK | Glory 600 | gasolina | 5 | 3 | $18.490.000 |
| 717 | DFSK | Glory 600 PHEV | hibrido_enchufable | 5 | 2 | $24.990.000 |
| 718 | Dongfeng | SX6 | gasolina | 7 | 1 | $11.990.000 |
| 719 | Dongfeng | T5 L | gasolina | 7 | 2 | $15.690.000 |
| 720 | Dongfeng | T5 HCV | hibrido | 5 | 1 | $23.990.000 |
| 721 | Dongfeng | S50 EV | electrico | 5 | 1 | $26.990.000 |
| 722 | Dongfeng | MAGE EV | electrico | 5 | 1 | $21.980.000 |
| 723 | Exeed | TXL | gasolina | 5 | 2 | $32.490.000 |
| 724 | GAC | Aion ES | electrico | 5 | 1 | $25.990.000 |
| 725 | GAC | Aion Y | electrico | 5 | 1 | $30.990.000 |
| 726 | GAC | Emkoo | gasolina | 5 | 2 | $18.490.000 |
| 727 | GAC | Emkoo HEV | hibrido | 5 | 1 | $28.990.000 |
| 728 | GAC | Empow | gasolina | 5 | 1 | $20.990.000 |
| 729 | GAC | Emzoom | gasolina | 5 | 2 | $17.990.000 |
| 730 | JAC | JS8 | gasolina | 7 | 2 | $17.690.000 |
| 731 | JAC | JS8 Pro | gasolina | 7 | 2 | $20.990.000 |
| 732 | JAC | E-JS4 | electrico | 5 | 1 | $28.990.000 |
| 733 | Mahindra | XUV300 | gasolina | 5 | 3 | $10.290.000 |
| 734 | Škoda | Elroq | electrico | 5 | 1 | $44.990.000 |
| 735 | Škoda | Scala | gasolina | 5 | 2 | $23.990.000 |
| 736 | smart | #5 | electrico | 5 | 3 | $46.990.000 |
| 737 | Cupra | Terramar | gasolina | 5 | 2 | $38.990.000 |

## Precios y versiones actualizados (122 modelos)

De 137 modelos sin fuente previa con equivalente en Autocosmos se actualizaron 122; 59 cambian 15 % o más. El precio anterior no tenía fuente registrada.

| Marca | Modelo | Antes | Ahora (lista) | Cambio | Versiones |
|---|---|---:|---:|---:|---:|
| Audi | Q6 e-tron | $54.990.000 | $74.990.000 | +36 % | 3 |
| BAIC | BJ30 | $25.990.000 | $25.990.000 | +0 % | 1 |
| BAIC | BJ40 | $30.490.000 | $30.490.000 | +0 % | 1 |
| BAIC | U5 Plus | $12.990.000 | $12.990.000 | +0 % | 3 |
| BAIC | X35 | $13.090.000 | $13.090.000 | +0 % | 4 |
| BAIC | X55 | $18.490.000 | $18.490.000 | +0 % | 3 |
| BAIC | X7 | $23.990.000 | $23.990.000 | +0 % | 3 |
| BMW | M5 | $119.990.000 | $169.900.000 | +42 % | 1 |
| BMW | Serie 1 | $21.990.000 | $38.900.000 | +77 % | 3 |
| BMW | Serie 2 Gran Coupé | $31.990.000 | $40.900.000 | +28 % | 2 |
| BMW | Serie 3 | $29.990.000 | $46.900.000 | +56 % | 3 |
| BMW | Serie 5 | $42.990.000 | $69.900.000 | +63 % | 1 |
| BMW | Serie 7 | $74.990.000 | $172.900.000 | +131 % | 1 |
| BMW | X1 | $26.990.000 | $40.900.000 | +52 % | 5 |
| BMW | X2 | $42.990.000 | $48.900.000 | +14 % | 3 |
| BMW | X3 | $35.990.000 | $56.900.000 | +58 % | 3 |
| BMW | X4 | $44.990.000 | $57.900.000 | +29 % | 3 |
| BMW | X5 | $52.990.000 | $86.900.000 | +64 % | 3 |
| BMW | X6 | $64.990.000 | $113.900.000 | +75 % | 2 |
| BMW | X7 | $84.990.000 | $133.900.000 | +58 % | 3 |
| BMW | Z4 | $42.990.000 | $89.900.000 | +109 % | 1 |
| BMW | i4 | $44.990.000 | $85.900.000 | +91 % | 1 |
| BMW | i5 | $72.990.000 | $102.900.000 | +41 % | 1 |
| BMW | i7 | $110.990.000 | $199.900.000 | +80 % | 1 |
| BMW | iX | $74.990.000 | $106.900.000 | +43 % | 1 |
| BMW | iX1 | $42.990.000 | $55.900.000 | +30 % | 2 |
| BMW | iX3 | $47.990.000 | $79.900.000 | +66 % | 1 |
| BYD | Atto 8 | $43.990.000 | $44.990.000 | +2 % | 2 |
| BYD | Dolphin | $21.990.000 | $28.990.000 | +32 % | 1 |
| BYD | Dolphin Mini | $18.990.000 | $18.990.000 | +0 % | 2 |
| BYD | Han EV | $62.990.000 | $62.990.000 | +0 % | 1 |
| BYD | Sealion 7 | $36.990.000 | $37.990.000 | +3 % | 2 |
| BYD | Song Plus DM-i | $36.990.000 | $36.990.000 | +0 % | 2 |
| BYD | Tang | $44.990.000 | $70.990.000 | +58 % | 1 |
| BYD | Yuan Plus | $32.990.000 | $32.990.000 | +0 % | 1 |
| BYD | Yuan Pro | $27.990.000 | $27.990.000 | +0 % | 1 |
| Changan | Alsvin | $10.990.000 | $10.490.000 | -5 % | 3 |
| Changan | CS15 | $9.990.000 | $11.190.000 | +12 % | 4 |
| Changan | CS35 Max | $14.190.000 | $14.190.000 | +0 % | 3 |
| Changan | CS35 Plus | $16.890.000 | $16.890.000 | +0 % | 3 |
| Changan | UNI-K | $21.990.000 | $26.990.000 | +23 % | 2 |
| Changan | UNI-T | $17.990.000 | $22.690.000 | +26 % | 2 |
| Changan | X7 Plus | $18.990.000 | $17.990.000 | -5 % | 4 |
| Chery | Tiggo 2 Pro | $11.990.000 | $11.990.000 | +0 % | 2 |
| Chery | Tiggo 2 Pro Max | $12.990.000 | $12.990.000 | +0 % | 5 |
| Chery | Tiggo 3 Pro | $11.990.000 | $15.490.000 | +29 % | 2 |
| Chery | Tiggo 4 Pro Max | $15.490.000 | $15.490.000 | +0 % | 1 |
| Chery | Tiggo 7 Pro Max | $16.990.000 | $16.990.000 | +0 % | 3 |
| Chery | Tiggo 7 Pro Max PHEV | $32.990.000 | $32.990.000 | +0 % | 1 |
| Chery | Tiggo 8 Pro Max PHEV | $39.990.000 | $39.990.000 | +0 % | 1 |
| Cupra | Formentor | $24.990.000 | $34.990.000 | +40 % | 3 |
| Cupra | Leon | $26.990.000 | $29.490.000 | +9 % | 3 |
| Cupra | Tavascan | $39.990.000 | $48.990.000 | +23 % | 1 |
| DFSK | Glory 500 | $13.990.000 | $13.590.000 | -3 % | 3 |
| DFSK | Glory 580 | $16.990.000 | $16.890.000 | -1 % | 1 |
| DS | DS 7 | $32.990.000 | $38.990.000 | +18 % | 2 |
| Dongfeng | MAGE | $17.990.000 | $15.590.000 | -13 % | 3 |
| Dongfeng | Rich | $17.990.000 | $17.290.900 | -4 % | 3 |
| Dongfeng | T5 Evo | $15.990.000 | $15.990.000 | +0 % | 3 |
| Exeed | LX | $15.990.000 | $20.990.000 | +31 % | 3 |
| Exeed | RX | $23.990.000 | $34.990.000 | +46 % | 2 |
| Exeed | VX | $33.990.000 | $42.490.000 | +25 % | 1 |
| Fiat | Ducato | $28.990.000 | $36.287.900 | +25 % | 3 |
| GAC | GS3 Power | $13.490.000 | $12.990.000 | -4 % | 4 |
| GAC | GS4 Power | $16.490.000 | $15.990.000 | -3 % | 4 |
| GAC | GS8 | $27.990.000 | $27.990.000 | +0 % | 4 |
| Geely | Cityray | $17.890.000 | $17.890.000 | +0 % | 3 |
| Geely | Coolray Lite | $10.490.000 | $12.490.000 | +19 % | 4 |
| Geely | Okavango | $20.690.000 | $24.690.000 | +19 % | 2 |
| Geely | Starray | $19.990.000 | $23.990.000 | +20 % | 2 |
| Honda | CR-V | $27.990.000 | $42.990.000 | +54 % | 1 |
| Honda | Civic | $20.990.000 | $31.390.000 | +50 % | 1 |
| Honda | HR-V | $19.990.000 | $24.990.000 | +25 % | 1 |
| Honda | Pilot | $39.990.000 | $59.990.000 | +50 % | 2 |
| Honda | WR-V | $20.990.000 | $18.790.000 | -10 % | 3 |
| Honda | ZR-V | $24.990.000 | $31.990.000 | +28 % | 2 |
| JAC | JS2 | $11.890.000 | $11.890.000 | +0 % | 1 |
| JAC | JS2 Pro | $13.790.000 | $13.290.000 | -4 % | 2 |
| JAC | JS4 | $14.990.000 | $14.190.000 | -5 % | 4 |
| JAC | T8 Pro | $20.990.000 | $20.990.000 | +0 % | 2 |
| JAC | T9 | $28.800.000 | $28.786.100 | +0 % | 1 |
| JMC | Grand Avenue | $22.000.000 | $22.028.100 | +0 % | 4 |
| JMC | Vigus EV | $33.990.000 | $51.158.100 | +51 % | 1 |
| JMC | Vigus Plus | $20.800.000 | $22.598.100 | +9 % | 2 |
| JMC | Vigus Work | $13.990.000 | $20.838.100 | +49 % | 2 |
| Jaguar | E-Pace | $32.990.000 | $67.900.000 | +106 % | 1 |
| Jaguar | F-Type | $85.990.000 | $113.900.000 | +32 % | 1 |
| Jetour | Dashing | $17.990.000 | $16.490.000 | -8 % | 3 |
| Jetour | T1 | $18.490.000 | $22.990.000 | +24 % | 2 |
| Jetour | T1 PHEV | $27.990.000 | $29.990.000 | +7 % | 1 |
| Jetour | T2 | $26.990.000 | $29.990.000 | +11 % | 1 |
| Jetour | T2 PHEV | $33.490.000 | $36.990.000 | +10 % | 1 |
| Jetour | X50 | $9.490.000 | $12.490.000 | +32 % | 2 |
| Jetour | X70 | $15.990.000 | $17.490.000 | +9 % | 2 |
| Jetour | X70 Plus | $19.990.000 | $20.990.000 | +5 % | 2 |
| Jetour | X90 Plus | $23.490.000 | $27.490.000 | +17 % | 1 |
| KGM | New Musso | $31.990.000 | $29.738.100 | -7 % | 7 |
| KGM | Rexton | $29.990.000 | $36.190.000 | +21 % | 4 |
| KGM | Torres | $25.990.000 | $25.990.000 | +0 % | 2 |
| KGM | Torres EVX | $43.490.000 | $43.490.000 | +0 % | 2 |
| Kaiyi | KYE5 | $9.990.000 | $14.990.000 | +50 % | 2 |
| Kaiyi | KYX3 | $8.490.000 | $12.990.000 | +53 % | 3 |
| Kaiyi | KYX3 Pro | $11.990.000 | $12.990.000 | +8 % | 1 |
| Kaiyi | KYX7 | $14.990.000 | $19.990.000 | +33 % | 3 |
| Lexus | IS | $42.990.000 | $56.360.100 | +31 % | 1 |
| Lexus | NX | $45.990.000 | $48.021.700 | +4 % | 4 |
| Livan | X6 Pro | $16.990.000 | $20.990.000 | +24 % | 1 |
| Maxus | D60 | $22.990.000 | $24.978.100 | +9 % | 2 |
| Maxus | G90 | $34.500.000 | $34.498.100 | +0 % | 2 |
| Maxus | T60 | $20.700.000 | $22.003.100 | +6 % | 6 |
| Maxus | T60 MAX | $30.200.000 | $30.237.900 | +0 % | 2 |
| Maxus | T90 | $37.500.000 | $41.127.900 | +10 % | 1 |
| Maxus | T90 EV | $65.000.000 | $70.167.900 | +8 % | 1 |
| Riddara | RD6 | $51.600.000 | $51.597.900 | +0 % | 4 |
| SEAT | Ibiza | $14.990.000 | $19.490.000 | +30 % | 2 |
| SWM | G05 | $11.990.000 | $14.990.000 | +25 % | 2 |
| smart | #1 | $32.990.000 | $32.990.000 | +0 % | 3 |
| smart | #3 | $37.990.000 | $34.990.000 | -8 % | 3 |
| Škoda | Fabia | $14.490.000 | $24.990.000 | +72 % | 1 |
| Škoda | Kamiq | $18.990.000 | $23.490.000 | +24 % | 2 |
| Škoda | Karoq | $22.990.000 | $29.490.000 | +28 % | 2 |
| Škoda | Kodiaq | $27.990.000 | $38.490.000 | +38 % | 2 |

### No actualizados por combustible distinto (15)

La ficha de Autocosmos corresponde a otra motorización que la del catálogo; quedan para revisión manual.

- Alfa Romeo Tonale: combustible hibrido_enchufable no coincide con ['gasolina']
- Audi Q5: combustible gasolina no coincide con ['electrico']
- BAIC BJ60: combustible gasolina no coincide con ['electrico']
- BMW XM: combustible hibrido_enchufable no coincide con []
- BYD Seal: combustible electrico no coincide con []
- BYD Shark: combustible hibrido_enchufable no coincide con ['electrico']
- BYD Song Pro: combustible hibrido no coincide con ['electrico']
- DS DS 4: combustible gasolina no coincide con ['diesel']
- Jaguar F-Pace: combustible gasolina no coincide con ['diesel']
- KGM Actyon: combustible diesel no coincide con ['gasolina']
- Lexus ES: combustible hibrido no coincide con ['electrico']
- Lexus LBX: combustible hibrido no coincide con ['gasolina']
- Lexus LX: combustible diesel no coincide con ['gasolina']
- Lexus RX: combustible hibrido no coincide con ['gasolina', 'hibrido_enchufable']
- Lexus UX: combustible gasolina no coincide con ['electrico']

## Modelos de Autocosmos que siguen fuera del catálogo

Incluye variantes que AutoLupa agrupa bajo otro nombre, modelos descontinuados que Autocosmos mantiene y comerciales. `s/p` = sin precio publicado.

- **Alfa Romeo** (1): Tonale PHEV (s/p)
- **Audi** (24): A1 Sportback ($26.900.000); A3 Sedán (s/p); A3 Sportback (s/p); A5 Cabrio (s/p); A5 Coupé (s/p); A5 Sportback ($53.900.000); e-tron Sportback (s/p); Q3 Sportback (s/p); Q4 Sportback e-tron (s/p); Q5 Sportback ($66.200.000); Q8 e-tron (s/p); R8 Coupé ($5.254.010); RS 3 Sportback (s/p); RS 5 Avant ($127.990.000); RS Q3 Sportback (s/p); RS Q8 (s/p); S3 Sedán (s/p); S3 Sportback (s/p); S4 (s/p); S5 Sportback ($78.900.000); SQ5 Sportback (s/p); SQ5 ($83.700.000); SQ7 ($128.990.000); TTS Coupé (s/p)
- **BAIC** (2): BJ30 HEV ($27.990.000); BJ40 Pro ($38.990.000)
- **BMW** (16): iPerformance ($52.900.000); iX2 ($79.900.000); M2 Coupé ($102.900.000); M3 Sedán ($122.900.000); M4 Convertible ($127.900.000); M4 Coupé ($129.900.000); Serie 2 Coupé ($48.900.000); Serie 3 Gran Turismo ($54.900.000); Serie 4 Convertible ($61.900.000); Serie 4 Coupé ($59.900.000); Serie 4 Gran Coupé ($56.900.000); Serie 8 ($144.000.000); X3 M ($116.900.000); X4 M ($118.900.000); X5 M ($190.900.000); X6 M ($193.900.000)
- **Changan** (7): CS55 ($16.590.000); M201 Furgón ($8.853.600); MD201 Cargo Box ($10.043.600); MD201 Pick Up ($8.794.100); MD301 Plus Cargo Box ($13.197.100); MS201 Pick up ($9.686.600); Star Truck Plus ($13.197.100)
- **Chevrolet** (5): Blazer ($43.990.000); Bolt ($23.990.000); Captiva PHEV ($26.990.000); Onix RS ($15.790.000); Sail ($9.990.000)
- **Citroën** (1): E-Berlingo ($32.118.100)
- **DFSK** (10): 560 ($13.290.000); Cargo Box ($10.460.100); Cargo Van Eléctrico ($29.738.100); Cargo Van ($9.151.100); D1 ($19.623.100); Refri Truck ($14.268.100); Seres 3 ($31.990.000); Truck Cabina Doble ($9.389.100); Truck ($8.318.100); Z9 ($24.978.100)
- **DS** (2): 3 Crossback E-Tense ($41.490.000); 7 E-Tense ($57.490.000)
- **Dongfeng** (3): Aeolus GS Cross ($13.990.000); Aeolus Y3 ($11.490.000); T5 ($13.290.000)
- **Fiat** (1): 600e ($32.990.000)
- **Ford** (5): Escape Híbrida ($30.490.000); Explorer ST ($60.790.000); F-150 Híbrida ($82.812.100); F-150 Raptor ($99.710.100); Maverick Híbrida ($39.615.100)
- **Foton** (13): FT-Box ($27.370.000); FT-Crew ($30.333.100); G7 ($17.532.900); G9 ($25.760.900); K1 Pasajeros ($26.763.100); K1 ($24.145.100); MIDI Cargo Box ($11.845.900); MIDI Pick-Up ($9.667.900); TM3 ($11.724.900); TM5 ($13.055.900); V7 ($33.867.900); V9 ($36.287.900); Wonder ($12.692.900)
- **Geely** (1): GX3 PRO ($10.790.000)
- **Honda** (1): City Hatchback (s/p)
- **Hyundai** (1): Santa Fe Híbrida ($49.590.000)
- **JAC** (8): E-JS1 ($14.990.000); Ignite ($22.990.000); Refine Cargo EV ($40.490.000); Refine Cargo ($26.168.100); Refine Pasajeros ($28.786.100); Sunray Pasajeros ($32.356.100); T8 ($19.861.100); X200 ($20.990.100)
- **JMC** (3): Touring EV ($49.968.100); Touring ($29.738.100); Vigus Pro ($25.573.100)
- **Jaguar** (2): XE ($53.900.000); XF ($73.900.000)
- **KYC** (5): Gran Mamut Cabina Doble ($9.698.100); Gran Mamut Cabina Simple ($8.449.000); Gran Mamut Cargo Box ($10.293.100); X5 Plus ($12.673.100); X5 ($9.865.100)
- **Kia** (3): Frontier Chasis ($25.990.000); Frontier Doble Cabina ($28.990.000); Niro Híbrido ($29.990.000)
- **MG** (1): 4 ($26.990.000)
- **MINI** (8): Cooper 5 Puertas (s/p); Cooper Cabrio (s/p); Cooper Clubman (s/p); Cooper Countryman SE (s/p); Cooper Countryman (s/p); Cooper Eléctrico (s/p); Cooper SE (s/p); John Cooper Works ($48.990.000)
- **Mahindra** (2): Pik Up Cabina Doble ($16.291.100); Pik Up ($16.648.100)
- **Maxus** (12): D90 ($43.423.100); Deliver 9 Cargo ($29.381.100); Deliver 9 Chasis ($24.502.100); Deliver 9 Pasajeros ($41.043.100); eDeliver 3 (s/p); eDeliver 9 (s/p); Euniq 5 (s/p); G-10 Cargo D20 ($26.168.100); G-10 Cargo ($17.838.100); G-10 Ejecutiva ($30.214.100); G-10 Pasajeros D20 ($26.644.100); Mifa 9 (s/p)
- **Mazda** (1): CX-60 Híbrido ($40.990.000)
- **Mercedes-Benz** (25): Clase A Hatchback (s/p); Clase A Sedán (s/p); Clase B (s/p); Clase C Convertible AMG (s/p); Clase C Convertible (s/p); Clase C Coupé AMG (s/p); Clase C Coupé (s/p); Clase C Sedán (s/p); Clase E All Terrain (s/p); Clase E Convertible AMG (s/p); Clase E Coupé AMG (s/p); Clase E Coupé (s/p); Clase E Sedán AMG (s/p); Clase E Sedán (s/p); Clase GLA (s/p); Clase GLB (s/p); Clase GLC AMG (s/p); Clase GLC (s/p); Clase GLE AMG (s/p); Clase GLE (s/p); Clase GLS (s/p); Sprinter Furgón (s/p); Sprinter Minivan (s/p); Vito Furgón (s/p); Vito (s/p)
- **Mitsubishi** (1): Xpander Cross ($22.490.000)
- **Nissan** (1): Kicks Play ($18.542.617)
- **Peugeot** (7): 2008 MHEV ($24.990.000); 308 Hybrid ($28.290.000); 5008 PHEV ($35.090.000); Boxer Chasis ($32.237.100); e-2008 (s/p); e-208 (s/p); e-Partner (s/p)
- **Porsche** (58): 718 Boxster GTS (s/p); 718 Boxster S (s/p); 718 Boxster T (s/p); 718 Boxster (s/p); 718 Cayman GT4 RS (s/p); 718 Cayman GTS (s/p); 718 Cayman S (s/p); 718 Cayman T (s/p); 718 Cayman (s/p); 718 Spyder RS (s/p); 718 Spyder (s/p); 911 Carrera 4 Cabriolet (s/p); 911 Carrera 4 GTS Cabriolet (s/p); 911 Carrera 4 GTS (s/p); 911 Carrera 4 (s/p); 911 Carrera 4S Cabriolet (s/p); 911 Carrera 4S (s/p); 911 Carrera Cabriolet (s/p); 911 Carrera GTS Cabriolet (s/p); 911 Carrera GTS (s/p); 911 Carrera S Cabriolet (s/p); 911 Carrera S (s/p); 911 Carrera T (s/p); 911 Carrera (s/p); 911 Dakar (s/p); 911 GT3 RS (s/p); 911 GT3 (s/p); 911 S/T (s/p); 911 Targa 4 GTS (s/p); 911 Targa 4 (s/p); 911 Targa 4S (s/p); 911 Targa (s/p); 911 Turbo Cabriolet (s/p); 911 Turbo S Cabriolet (s/p); 911 Turbo S (s/p); 911 Turbo (s/p); Cayenne Coupé (s/p); Cayenne E-Hybrid Coupé (s/p); Cayenne E-Hybrid (s/p); Cayenne S Coupé (s/p); Cayenne S E-Hybrid (s/p); Cayenne S (s/p); Cayenne Turbo E-Hybrid (s/p); Macan GTS (s/p); Macan S (s/p); Macan Turbo (s/p); Panamera 4 E-Hybrid (s/p); Panamera 4S E-Hybrid (s/p); Panamera GTS (s/p); Panamera Turbo S E-Hybrid (s/p); Panamera Turbo S (s/p); Taycan 4 Cross Turismo (s/p); Taycan 4S Cross Turismo (s/p); Taycan 4S (s/p); Taycan GTS (s/p); Taycan Turbo Cross Turismo (s/p); Taycan Turbo S (s/p); Taycan Turbo (s/p)
- **RAM** (4): 1000 ($28.548.100); V1000 ($18.433.100); V700 City ($15.458.100); V700 Rapid ($15.458.100)
- **Renault** (2): Arkana Hybrid ($30.390.000); KWID E-TECH ($16.999.000)
- **SWM** (5): T30 ($6.533.100); T32 ($10.103.100); T50 ($9.270.100); T52 ($9.865.100); X30 ($9.151.100)
- **Subaru** (1): Impreza Sport ($22.990.000)
- **Suzuki** (6): Grand Vitara ($19.990.000); Jimny 5P ($18.890.000); S-Presso ($10.290.000); Swift Hybrid ($15.090.000); Swift Sport ($19.490.000); XL7 ($19.490.000)
- **Toyota** (5): Corolla Híbrido ($24.790.000); Fortuner GR-S ($52.890.000); Hilux GR-S ($52.990.000); Yaris GR ($54.990.000); Yaris Hatchback ($16.090.000)
- **Volkswagen** (2): Caravelle ($42.828.100); Transporter ($36.878.100)
- **Volvo** (3): EC40 (s/p); XC60 Plug-in Hybrid (s/p); XC90 Plug-in Hybrid (s/p)
- **ZNA** (1): DF6 ($17.838.100)
- **ZX Auto** (1): Grandlion ($26.002.900)
- **Škoda** (1): Octavia VRS ($36.990.000)

## Pendiente

- Verificar plazas, batería y autonomía de los modelos agregados (los EV/PHEV nuevos no traen esos datos en la ficha).
- BAIC BJ30 HEV y BJ40 Pro: la ficha mezcla combustibles; no se agregaron.
- Tesla, Mercedes-Benz, Porsche, MINI y Volvo: Autocosmos no publica precios de lista; siguen con el precio anterior.
- BYD Seal, Shark y Song Pro, KGM Actyon y Lexus: motorización distinta entre fuentes.
- Marcas con fuente oficial: repetir el contraste contra el sitio de cada marca, no contra Autocosmos.
