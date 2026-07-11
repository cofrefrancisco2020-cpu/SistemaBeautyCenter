# Beauty Center

Sistema interno para agenda, CRM clinico/comercial, solicitudes y administracion operativa de Beauty Center.

## Que incluye

- Agenda semanal vinculada a pacientes por `patientId`.
- CRM clinico/comercial con ficha 360, planes, historial y segmentos.
- Registro de sesiones que actualiza avance del plan e historial.
- Solicitudes vinculadas a paciente existente o paciente nueva.
- Pagos manuales ligados a citas, preparados para API futura.
- Login demo local y login real preparado con Supabase Auth.
- Administracion de usuarios, profesionales, recursos y tratamientos.
- Persistencia local con `localStorage` como fallback.
- Preparacion para Supabase Postgres con RLS.
- Guia de integracion web en `docs/formulario-web-solicitudes.md`.

## Accesos demo locales

Solo sirven cuando no hay variables Supabase configuradas:

- Administracion: `admin@beautycenter.cl` / `admin123`
- Javiera: `javiera@beautycenter.cl` / `javiera123`
- Dra. Camila: `camila@beautycenter.cl` / `camila123`
- Natalia: `natalia@beautycenter.cl` / `natalia123`

En produccion, las contrasenas se crean en Supabase Auth.

## Como probar

Instalar dependencias:

```bash
pnpm install
```

Servidor local:

```bash
pnpm run dev
```

Build de produccion:

```bash
pnpm run build
```

Si no existen `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`, la app sigue funcionando como demo local con `localStorage`.

## Flujo real esperado

1. Una paciente entra desde web, Instagram, WhatsApp o se registra manualmente.
2. El sistema busca por telefono/correo para evitar duplicados.
3. Si existe, la solicitud se vincula al paciente.
4. Si no existe, crea paciente nueva.
5. La cita se agenda con `patientId`, `professionalId`, `treatmentId` y `resourceId`.
6. Un mismo paciente puede tener uno o mas planes de tratamiento activos.
7. Al marcar una cita como atendida, se suma al historial y al avance del plan correspondiente.
8. Al registrar pago, queda ligado a la cita y paciente.

## Supabase

La conexion real usa:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

La `service_role` nunca debe ir en el frontend ni en Vercel como variable publica.

Orden de SQL:

1. `docs/schema.sql`
2. `docs/seed-demo-data.sql`
3. `docs/rls-policies.sql`
4. `docs/supabase-security-hardening.sql`
