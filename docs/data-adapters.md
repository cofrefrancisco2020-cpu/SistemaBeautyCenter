# Data adapters

La app ya no debería depender directamente de `localStorage`.

Ahora existe una carpeta:

`adapters/`

## Adapter activo

`adapters/localStorageAdapter.js`

Uso actual:

- Carga el estado demo.
- Guarda cambios en el navegador.
- Reinicia demo.
- Exporta JSON.

Sirve para probar flujos sin pagar backend.

## Adapter preparado para Supabase

`adapters/supabaseAdapter.js`

Incluye:

- Mapeo de tablas.
- Carga inicial de entidades.
- Conversión entre campos UI y campos SQL.
- Operaciones preparadas:
  - `upsertPatient`
  - `upsertPlan`
  - `upsertAppointment`
  - `insertHistory`
  - `insertRequest`
  - `insertPayment`

Pendiente:

- Crear cliente Supabase.
- Crear `.env`.
- Usar `docs/schema.sql`.
- Convertir la UI a carga async.
- Reemplazar `saveState()` por operaciones puntuales reales.

## Adapter preparado para PocketBase

`adapters/pocketBaseAdapter.js`

Sirve si se decide usar un VPS barato en vez de Supabase.

Pendiente:

- Crear colecciones en PocketBase.
- Definir reglas de acceso.
- Adaptar nombres de campos.

## Decisión recomendada

Para desarrollar rápido:

1. Mantener `localStorageAdapter` mientras diseñamos flujos.
2. Crear Supabase cuando la estructura esté aprobada.
3. Migrar primero pacientes, profesionales, tratamientos y recursos.
4. Luego migrar agenda, planes, historial y pagos.
