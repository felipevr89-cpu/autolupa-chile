# Registro de Actividades de Tratamiento (RAT)

Responsable del tratamiento: **AutoLupa** (razón social PENDIENTE · RUT PENDIENTE · privacidad@autolupa.cl)
Marco: Ley N° 21.719 sobre Protección de Datos Personales y su reglamento.
Última actualización: 30/09/2026.

Este registro se mantiene disponible para requerimiento de la Agencia de Protección de Datos Personales.

## 1. Cuenta de usuario

| Campo | Detalle |
| --- | --- |
| Finalidad | Autenticación, gestión de la cuenta y preferencias |
| Datos | Nombre, correo electrónico, fotografía de perfil (desde Google) |
| Base legal | Ejecución de contrato (Art. 13 letra c) |
| Categorías de titulares | Usuarios registrados |
| Destinatarios | Supabase (encargado), Google (encargado) |
| Conservación | Mientras la cuenta esté activa; eliminación a solicitud del titular |
| Transferencias | Estados Unidos (Supabase, Google) con DPA |

## 2. Favoritos y preferencias

| Campo | Detalle |
| --- | --- |
| Finalidad | Guardar vehículos de interés y filtros de búsqueda |
| Datos | Identificadores de vehículos, parámetros de filtro |
| Base legal | Ejecución de contrato |
| Categorías de titulares | Usuarios registrados |
| Destinatarios | Supabase (encargado) |
| Conservación | 2 años desde la última actividad |

## 3. Publicación de avisos de usados

| Campo | Detalle |
| --- | --- |
| Finalidad | Publicar y mostrar avisos, facilitar contacto comprador–vendedor |
| Datos | Marca, modelo, año, precio, kilometraje, combustible, transmisión, color, región, comuna, descripción, fotografías, nombre de contacto, teléfono, correo |
| Base legal | Ejecución de contrato; consentimiento para la publicación pública de contacto |
| Categorías de titulares | Vendedores particulares y comerciales |
| Destinatarios | Público general (datos visibles en el aviso), Supabase y Cloudflare (encargados) |
| Conservación | Hasta retiro, venta o eliminación del aviso |
| Observaciones | El contacto queda públicamente visible por decisión del titular; se informa en la política §5 |

## 4. Moderación y reportes

| Campo | Detalle |
| --- | --- |
| Finalidad | Prevenir fraude, revisar avisos y atender reportes |
| Datos | Estado del aviso, notas internas de moderación, motivo del reporte, identidad del reportante |
| Base legal | Interés legítimo (Art. 13 letra d) y obligación legal |
| Categorías de titulares | Vendedores, usuarios que reportan |
| Destinatarios | Equipo de moderación de AutoLupa |
| Conservación | Hasta 2 años después de resuelto |
| Observaciones | `seller_id`, `moderation_note` y datos internos nunca se exponen en la proyección pública (verificado por test) |

## 5. Evidencia de aceptación de documentos

| Campo | Detalle |
| --- | --- |
| Finalidad | Acreditar la aceptación de términos, privacidad y declaración de responsabilidad |
| Datos | Identificador de usuario, tipo de documento, versión, fecha |
| Base legal | Obligación legal (Art. 13 letra b) |
| Conservación | Mientras la cuenta esté activa y por el plazo legal aplicable |

## 6. Seguridad del tratamiento

- RLS en todas las tablas del marketplace; el rol anónimo no escribe.
- Máquina de estados validada en base de datos: un aviso solo pasa a `active` por decisión del moderador.
- Fotos no enumerables y restringidas a la carpeta del propio vendedor.
- Cabeceras de seguridad en `_headers`; sin cookies de terceros ni analítica con identificación personal.
- Verificación de la matriz de RLS con usuarios reales: `supabase/README.md`.

## 7. Derechos de los titulares

Medio: **privacidad@autolupa.cl** y sección "Tus datos" en la cuenta.
Plazos: acuse inmediato · respuesta 30 días (prorrogable una vez 30) · bloqueo temporal 2 días hábiles.
Detalle del procedimiento: política de privacidad v1.2, §6.
