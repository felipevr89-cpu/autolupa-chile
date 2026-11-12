# AutoLupa — decisiones de continuidad

## D-001 — Preservar el árbol sucio
- Contexto: hay un lote funcional sin commit de la sesión anterior.
- Decisión: no resetear, no hacer stash, no mezclar commits nuevos; documentarlo como trabajo en curso.
- Consecuencia: el usuario debe revisar y autorizar el commit/PR.

## D-002 — Sin despliegue ni push
- Contexto: el prompt maestro prohíbe publicar sin autorización explícita.
- Decisión: solo cambios locales y verificaciones.
- Consecuencia: el preview y producción quedan intactos.

## D-003 — Primer cambio: `fetchpriority` en minúsculas
- Contexto: React 18 advierte por `fetchPriority` y la prioridad LCP puede no aplicarse.
- Decisión: emitir el atributo HTML estándar `fetchpriority` mediante spread tipado.
- Consecuencia: se elimina el warning y se mantiene el comportamiento `eager`/`lazy`.

## D-004 — Prerender SPA diferido
- Contexto: las rutas profundas no tienen HTML útil para rastreadores.
- Decisión: documentar como A1 y resolverlo en Fase 5 con una solución de prerender, no con un parche de metadatos.
- Consecuencia: no se promete indexación inmediata de `/marcas/*`.

## D-005 — Mantener stack y dependencias
- Contexto: no hay necesidad demostrada de cambiar framework o agregar paquetes.
- Decisión: continuar con React/Vite/TS/Tailwind/Supabase.
- Consecuencia: cualquier dependencia nueva requiere justificación y prueba.

## D-006 — Controles TCO y salida del estado vacío
- Contexto: el selector «Km/mes» se truncaba en móvil, el estado sin resultados no tenía CTA y los tabs no anunciaban su estado.
- Decisión: apilar los controles del TCO en móvil, asociar etiquetas, usar `aria-pressed` y ofrecer «Ver todos los autos» en la grilla vacía.
- Consecuencia: se mejora la lectura móvil y la accesibilidad sin cambiar datos ni rutas; el tablist con flechas queda pendiente.
