# Data adapters

La app tiene una capa de datos para no amarrar la UI a un solo backend.

## LocalStorage

Archivo:

`adapters/localStorageAdapter.js`

Uso:

- Demo local.
- Pruebas rapidas.
- Fallback si no existen variables Supabase.
- Exportar respaldo JSON.

## Supabase

Archivo:

`adapters/supabaseAdapter.js`

Uso:

- Login real con Supabase Auth.
- Carga de tablas protegidas por RLS.
- Guardado de cambios contra Postgres.
- Separacion admin/profesional desde base de datos.

El frontend selecciona Supabase automaticamente cuando existen:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Si faltan, usa LocalStorage.

## Pendiente futuro

Para produccion final completa todavia conviene agregar:

- Edge Function para formulario web publico.
- Storage para imagenes definitivas de profesionales.
- Funcion segura para crear usuarios Auth desde el panel admin.
- Logs/auditoria para cambios sensibles.
