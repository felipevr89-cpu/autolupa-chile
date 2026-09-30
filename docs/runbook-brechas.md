# Runbook — Vulneraciones de seguridad de datos personales

Obligación: Art. 14 sexies de la Ley N° 21.719. Aplica a cualquier incidente que cause
destrucción, filtración, pérdida o alteración accidental o ilícita de datos, o acceso o
comunicación no autorizados, **cuando exista riesgo razonable para los derechos de los titulares**.

Plazo clave: reportar a la Agencia de Protección de Datos Personales **sin dilaciones indebidas**.

## 1. Detección y contención (0–2 h)

1. Detener la causa: revocar credenciales expuestas, rotar claves en Supabase y Cloudflare,
   desplegar fix con `npm run build && npx wrangler pages deploy dist`.
2. Preservar evidencia: no borrar logs, capturar la consulta o acceso, hora UTC y alcance estimado.
3. Registrar el incidente en `docs/incidentes.md` con el siguiente formato.

## 2. Evaluación de riesgo (2–12 h)

Responder por escrito:

- ¿Qué datos se vieron afectados? (identificación, contacto, avisos, fotos, reportes, firmas)
- ¿Datos sensibles, de menores de 14 años o de carácter económico-financiero? → **si sí, la
  notificación a los titulares además es obligatoria**, no basta con informar a la Agencia.
- ¿Cuántos titulares aproximadamente?
- ¿Quién tuvo acceso (anónimo autenticado, otro usuario, tercero externo)?
- ¿Riesgo razonable para derechos y libertades? (sí/no, con fundamentación)

## 3. Reporte a la Agencia (24–72 h)

Enviar indicando como mínimo:

1. Naturaleza de la vulneración.
2. Efectos previsibles.
3. Categorías de datos afectados.
4. Número aproximado de titulares afectados.
5. Medidas adoptadas para gestionar el incidente y prevenir otros.

Conservar copia del reporte y su fecha.

## 4. Comunicación a los titulares (cuando corresponda)

- Lenguaje claro y sencillo, singularizando los datos afectados, las posibles consecuencias
  y las medidas de solución o resguardo adoptadas.
- Medio: correo electrónico registrado en la cuenta.
- Si no es posible contactar a un titular: aviso en un medio de comunicación social masivo
  y de alcance nacional.

## 5. Cierre

- Documentar causas raíz y correctivos.
- Actualizar este runbook y `docs/RAT.md` si cambian las medidas de seguridad.
- Registrar lecciones aprendidas en `docs/incidentes.md`.

## Contactos

| Rol | Medio |
| --- | --- |
| Responsable del tratamiento | privacidad@autolupa.cl |
| Agencia de Protección de Datos Personales | canal oficial informado en el sitio de la Agencia |
| Encargados técnicos | Supabase, Cloudflare (soporte vía dashboard) |
