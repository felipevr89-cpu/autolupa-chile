# Gaps log — búsquedas sin resultados

## Formato
Cada entrada se guarda en `localStorage` bajo `autolupa_search_gaps`:

```json
{
  "query": "Toyota Yaris Cross",
  "source": "smartask",
  "at": "2026-10-31T12:00:00.000Z"
}
```

- `source`: `smartask`, `hero` o `brand`.
- Máximo: 200 entradas (las más recientes primero).
- Evento de analítica: `brand_search_miss` con `{ query, source }` en Plausible.

## Rotación
- Revisar semanalmente las entradas y agrupar por marca/modelo.
- Si un gap se repite 5+ veces, abrir tarea de catálogo y borrar la clave local.
- No se envían datos personales: solo el texto de búsqueda.

## Dashboard
Pendiente `/admin/gaps` (ver `docs/ROADMAP.md`). Mientras tanto, exportar desde DevTools:

```js
JSON.parse(localStorage.getItem('autolupa_search_gaps') || '[]')
```
