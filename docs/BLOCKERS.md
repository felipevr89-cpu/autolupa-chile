# Blockers

## Infraestructura
- **Supabase caído (11-11-2026)**: `eeqhqsteeobegaekynse.supabase.co` responde NXDOMAIN (Google y Cloudflare DNS). Login, favoritos en la nube, usados, publicación, reclamos y «Tus datos» no funcionan en producción. Revisar en el dashboard si el proyecto está pausado (plan gratuito) o eliminado; si se restaura con otra URL, actualizar `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` en GitHub Secrets y `connect-src` en `public/_headers`.
- **`autolupa.cl` no existe** (NXDOMAIN): `info@`, `soporte@`, `mod@` y `privacidad@autolupa.cl` rebotan. `privacidad@` es el canal legal de la Ley 21.719 (vigente 01-12-2026).
- **Producción atrasada**: último deploy 23-10-2026; `/autos`, `/marcas/*`, prerender y el resto del trabajo de esta rama solo existen en local hasta que el usuario autorice commit, PR y deploy.
- `SUPABASE_ACCESS_TOKEN` no configurado: las migraciones `202610300001_used_listing_leads.sql`, `202610300002_seller_verification_level.sql` y `202610300003_listing_history_fields.sql` no están aplicadas.
- `CLOUDFLARE_API_TOKEN` no está en el entorno local; el deploy se hace por GitHub Actions.
- Sin staging/preview dedicado; se valida con build local y preview de rama.

## Producto
- WhatsApp Business de soporte es placeholder (`+56 9 0000 0000`).
- Razón social, RUT y domicilio legales son `[PENDIENTE-LEGAL]`.
- No hay SMTP propio: el bucle de verificación de correo no se puede probar end-to-end.
- La integración con Registro Civil, multas y prendas no está conectada (`[PENDIENTE-INTEGRACION]`).
- KYC real, mensajería interna completa y escrow no están implementados.

## Datos
- 35 modelos sin clave de imagen y 35 con clave `null` caen a silueta; ver `docs/AUDIT-ASSETS.md`.
- Contraste oficial pendiente para BYD, Chery, Jetour, Maxus, Foton, JAC, Tesla, Honda, KGM, BAIC, Leapmotor, Avatr y parte de Changan/Geely: ver `docs/AUDIT-CATALOGO-2026-11.md`.
- 115 EV/PHEV siguen sin batería/autonomía en JSON (parte se cubre en `enrichment.ts`).
- Marcas pendientes de contraste oficial 2026: Volkswagen, Honda, Subaru, BYD, Chery (resto), Changan, Jetour, Geely, KGM, Dongfeng, Soueast, Leapmotor, JMC, Foton y premium.
- `/usados` solo tiene ejemplos locales marcados «Ejemplo»; falta inventario real y seed de producción.
- No hay integración ANAC/API de versiones; la cobertura se valida contra una lista curada en `scripts/audit-coverage.mjs`.

## Pendientes de esta pasada
- T7 (páginas `/autos/{marca}/{modelo}` con 150+ palabras) queda en `docs/ROADMAP.md`.
- Capturas base en `docs/screenshots/` (`home-mobile-360x640.png`, `home-desktop-1440x900.png`, `usados-mobile-360x640.png`); falta la pasada completa 390×844 y teclado móvil.
- P1.16 mobile audit 360×640/390×844 sigue pendiente.
