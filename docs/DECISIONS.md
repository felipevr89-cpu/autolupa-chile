# Decisiones (ADR cortas)

## ADR-001 — Stack y backend
- Contexto: el repositorio ya es React 18 + Vite + TypeScript + Tailwind + Supabase.
- Decisión: mantener el stack y Supabase Auth/Postgres/Storage; no introducir otro backend.
- Consecuencia: las migraciones nuevas se aplican con el runbook existente.

## ADR-002 — Alcance de esta pasada
- Contexto: el brief permite P0+P1 o P0–P3.
- Decisión: ejecutar P0 y P1; P2/P3 quedan en `docs/ROADMAP.md`.
- Consecuencia: blog/newsletter/alertas/escrow no se implementan ahora.

## ADR-003 — Páginas legales
- Contexto: faltan `/quienes-somos`, `/contacto`, `/como-funciona` y `/compra-segura`.
- Decisión: publicar contenido base con `[PENDIENTE-LEGAL]` en razón social, RUT y domicilio.
- Consecuencia: no se afirma personalidad jurídica ni domicilio hasta completar datos.

## ADR-004 — WhatsApp de soporte
- Contexto: no hay número Business provisto.
- Decisión: usar `+56 9 0000 0000` como placeholder en `src/config/support.ts`.
- Consecuencia: debe reemplazarse antes de difundir el canal.

## ADR-005 — Precio de campaña Subaru y VW
- Contexto: las marcas publican precio con bono directo y precio con financiamiento.
- Decisión: usar precio con bono directo (sin bono de financiamiento) como `price`.
- Consecuencia: `price_list` y `price_bonus` reflejan el descuento directo.

## ADR-006 — Chery Tiggo 8 Pro
- Contexto: la parrilla chilena 2026 publica “Tiggo 8” y “Tiggo 8 Pro Max”; no un “Tiggo 8 Pro” separado.
- Decisión: agregar “Tiggo 8” y mantener “Tiggo 8 Pro Max” con sus versiones 1.6T; no inventar un modelo Pro.
- Consecuencia: el test de cobertura acepta la familia `Tiggo 8 Pro*` como Pro Max.

## ADR-007 — Foto Ford Territory
- Contexto: el id 188 usaba una foto del Territory EV de generación anterior.
- Decisión: reemplazarla por una foto de la generación 2023+ (Commons, CC BY-SA 4.0).
- Consecuencia: la ficha 2026 muestra la carrocería correcta.

## ADR-008 — Filtros en URL
- Contexto: los filtros vivían solo en localStorage.
- Decisión: sincronizar filtros, búsqueda, orden y página con query params (`marca`, `modelo`, `tipo`, `combustible`, `precio`, `anio`, `q`, `orden`, `pagina`).
- Consecuencia: los enlaces filtrados son compartibles y SEO-friendly.

## ADR-009 — Contacto del vendedor
- Contexto: teléfono y correo estaban visibles para cualquiera.
- Decisión: mostrarlos solo con sesión iniciada; para anónimos, formulario de lead.
- Consecuencia: el lead se guarda en `used_listing_leads` o en log estructurado si la migración no está aplicada.

## ADR-010 — KYC, mensajería y escrow
- Contexto: no hay proveedor KYC ni pagos en esta fase.
- Decisión: KYC mockeado (`verification_level`), mensajería vía leads, escrow fuera de alcance.
- Consecuencia: las integraciones reales quedan marcadas `[PENDIENTE-INTEGRACION]`.

## ADR-011 — Analítica sin cookies
- Contexto: el brief pide GA4 + Consent Mode v2; el repositorio ya usa Plausible, cookieless.
- Decisión: mantener Plausible y sus eventos (`ContactSeller`, `ContactSupport`, etc.) en vez de introducir GA4.
- Consecuencia: no se requiere banner de consentimiento para analítica; si se migra a GA4, habrá que implementar Consent Mode v2.
