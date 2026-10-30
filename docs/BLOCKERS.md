# Blockers

## Infraestructura
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
- 20 modelos sin clave de imagen y 34 con clave `null` caen a silueta; ver `docs/AUDIT-ASSETS.md`.
- 115 EV/PHEV siguen sin batería/autonomía en JSON (parte se cubre en `enrichment.ts`).
- Marcas pendientes de contraste oficial 2026: Volkswagen, Honda, Subaru, BYD, Chery (resto), Changan, Jetour, Geely, KGM, Dongfeng, Soueast, Leapmotor, JMC, Foton y premium.
