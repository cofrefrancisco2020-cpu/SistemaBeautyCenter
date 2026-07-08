# Backend recomendado

## Recomendación corta

Para avanzar rápido con Vercel y login: **Supabase**.

Para pagar lo mínimo y aceptar administrar un servidor pequeño: **PocketBase en VPS**.

Para mantener Postgres barato y liviano, pero armar auth aparte: **Neon + Auth.js/Clerk**.

## Opciones

### Supabase

Ventajas:

- Postgres real.
- Auth integrado.
- APIs automáticas.
- Realtime si después se necesita.
- Buen calce con Vercel.
- Menos trabajo inicial.

Desventaja:

- El plan Pro puede ser más caro que una opción self-hosted si la clínica es pequeña.

Usarlo si queremos velocidad, menos configuración y una base profesional.

### PocketBase

Ventajas:

- Open source.
- Backend en un solo binario.
- SQLite, auth, archivos, realtime y panel admin.
- Puede correr en un VPS barato.

Desventajas:

- No corre naturalmente en Vercel serverless.
- Hay que preocuparse de servidor, backups y actualizaciones.
- SQLite sirve muy bien para una clínica pequeña, pero no es el mismo estándar que Postgres para crecer.

Usarlo si el objetivo es mensualidad muy baja y control total.

### Neon

Ventajas:

- Postgres serverless.
- Free tier útil para desarrollo.
- Puede salir barato si la base duerme o tiene bajo uso.
- Buen camino si queremos SQL/Postgres sin todo Supabase.

Desventajas:

- No trae todo el backend completo.
- Auth, storage y funciones se deben resolver aparte.

Usarlo si queremos Postgres barato y estamos cómodos armando más piezas.

### Firebase

Ventajas:

- Auth muy maduro.
- Infra serverless.
- Muy usado.

Desventajas:

- Firestore es NoSQL; para agenda + CRM + pagos relacionales es menos natural que Postgres.

No sería mi primera opción para este ERP.

### Appwrite

Ventajas:

- Auth, base de datos, storage y functions.
- Free plan generoso.
- Se puede usar cloud o self-host.

Desventajas:

- Menos directo que Supabase si queremos Postgres relacional.

Puede ser alternativa, pero no la elegiría primero para este caso.

## Decisión sugerida para Beauty Center

Primera entrega real:

1. Vercel para frontend.
2. Supabase Free mientras se desarrolla.
3. Subir a Supabase Pro solo si el uso real lo exige.

Si el costo mensual se vuelve tema:

1. Evaluar PocketBase en VPS.
2. Mantener backups automáticos.
3. Cobrar mantención mensual por administración técnica.

## Referencias oficiales revisadas

- Odoo Appointments: agenda, recursos, recordatorios y CRM.
- Odoo Appointments + CRM: crear oportunidades desde reservas.
- Neon pricing: free tier y cobro por compute.
- Supabase pricing: plan free y planes pagos.
- PocketBase: backend open source en un solo archivo.
- Firebase pricing: Spark y Blaze.
- Appwrite pricing: free y pro.
