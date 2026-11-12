# Roadmap

## P1 — Siguiente
- Contraste oficial de las marcas pendientes (`docs/AUDIT-CATALOGO-2026-11.md`) en lotes por marca, priorizando Chery, BYD y Jetour por volumen.
- Fotos para los 70 modelos con silueta (ids 678–712 sin clave y claves `null`).
- Recomendador: opción LLM (Claude vía Cloudflare Pages Function) solo para consultas que el motor local marca como `unclear`, devolviendo una intención estructurada; requiere aviso de privacidad y presupuesto por consulta.
- Página `/admin/gaps` con las búsquedas sin resultado.

## P2 — Media prioridad
- Ampliar el contenido prerenderizado de `/auto/:slug` (ya tiene ficha, versiones y JSON-LD) con 150+ palabras de contexto y modelos relacionados.
- Integración ANAC/API de versiones y precios, con actualización mensual.
- Dashboard `/admin/gaps` para revisar `brand_search_miss` (hoy en localStorage + Plausible).
- Blog/centro de contenidos con 3 artículos seed y enlazado interno.
- Newsletter (Resend) con doble opt-in y consentimiento.
- Alertas personalizadas de búsquedas guardadas por correo.
- Auditoría WCAG 2.1 AA completa (contraste, foco, aria, skip-link).

## P3 — Largo plazo
- Escrow o pago protegido con partner.
- Repuestos y servicios posventa.
- Expansión regional (Perú/Colombia).
- Partnerships con bancos y seguros.
- Subastas de vehículos.
- i18n (es-CL / en) y app móvil.

## Integraciones pendientes
- KYC real (Truora/MetaMap) detrás de `KYC_ENABLED`.
- Registro Civil / multas / prendas.
- Mensajería interna completa con notificaciones.
- SMTP transaccional y verificación de correo end-to-end.
