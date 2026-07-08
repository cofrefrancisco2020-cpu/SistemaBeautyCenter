# Setup Supabase

## Objetivo

Pasar de `localStorageAdapter` a `supabaseAdapter` sin rehacer la UI.

## Datos que debes conseguir

En Supabase:

- Project URL.
- Anon public key.
- Service role key solo para scripts privados, nunca en frontend.

De Beauty Center:

- Correos de administradoras.
- Correos de profesionales.
- Lista inicial de profesionales.
- Tratamientos y precios.
- Recursos: máquinas, boxes, sauna.

## Orden recomendado

1. Crear proyecto Supabase.
2. Abrir SQL editor.
3. Ejecutar `docs/schema.sql`.
4. Insertar tratamientos, recursos y profesionales.
5. Crear usuarios en Supabase Auth.
6. Insertar filas en `app_users` conectando cada usuario con su rol.
7. Ejecutar `docs/rls-policies.sql`.
8. Probar login admin.
9. Probar login profesional.
10. Probar que la vista `resource_occupancy` devuelve máquinas ocupadas sin datos clínicos.
11. Recién ahí conectar la app.

## Variables futuras

Para una app con build tool:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Para Next.js:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Migración de UI

Hoy:

```js
const dataAdapter = createLocalStorageAdapter({ storageKey, seed });
```

Después:

```js
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const dataAdapter = createSupabaseAdapter({ supabase });
```

## Nota importante

La app actual es HTML estático. Para usar Supabase de forma seria conviene mover esta entrega a Vite o Next.js:

- Vite si queremos SPA simple y rápida.
- Next.js si queremos rutas protegidas, middleware y despliegue más formal.

Mi recomendación para este proyecto:

1. Seguir probando flujos en HTML estático.
2. Cuando el flujo esté aprobado, migrar a Vite + Supabase.
3. Si después necesita portal público y panel interno más robusto, evaluar Next.js.

## Vista de recursos ocupados

La agenda profesional necesita ver recursos ocupados por todo el equipo, pero no debe exponer fichas de pacientes de otras profesionales.

Para eso `docs/schema.sql` crea la vista `resource_occupancy`, que solo entrega:

- `resource_id`
- `professional_id`
- `appointment_date`
- `appointment_time`
- `status`

En producción, el adaptador debería cargar:

- `appointments`: solo las citas visibles por RLS para el usuario.
- `resource_occupancy`: ocupación general de máquinas/boxes para pintar contexto en la agenda.

Así mantenemos la separación correcta: agenda útil para reservar, sin filtrar datos clínicos de otras pacientes.
