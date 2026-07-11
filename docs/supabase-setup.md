# Setup Supabase

## Objetivo

Conectar Beauty Center a Supabase usando:

- Supabase Auth para login real.
- Postgres para pacientes, agenda, solicitudes, tratamientos, recursos e historial.
- RLS para separar administracion y profesionales.
- Vercel + Vite para compilar el frontend sin exponer claves privadas.

## Claves correctas

En Supabase, copia solo:

- Project URL
- anon public key

No copies ni pegues la `service_role` en Vercel frontend. Esa clave se salta RLS y solo se usa en scripts privados o funciones backend.

## Orden recomendado

1. Crear proyecto Supabase.
2. Elegir region `South America / Sao Paulo`.
3. Mantener `Data API` activa.
4. No exponer nuevas tablas automaticamente si Supabase permite desmarcarlo.
5. Activar RLS automatico si esta disponible.
6. Abrir SQL Editor.
7. Ejecutar en este orden:
   - `docs/schema.sql`
   - `docs/seed-demo-data.sql`
   - `docs/rls-policies.sql`
   - `docs/supabase-security-hardening.sql`
8. Crear los primeros usuarios en Authentication > Users:
   - `admin@beautycenter.cl`
   - `javiera@beautycenter.cl`
9. Copiar el `User UID` de cada usuario Auth.
10. En SQL Editor, enlazar esos UID con `app_users`.

Ejemplo:

```sql
update app_users
set auth_user_id = 'PEGAR-UID-DEL-USUARIO-AUTH'
where email = 'admin@beautycenter.cl';
```

Repetir para el primer profesional.

## Crear usuarios despues de la entrega

Despues de configurar el primer administrador, los nuevos accesos se crean desde la app:

`Administracion > Crear o editar acceso`

Ese formulario llama la Edge Function `admin-upsert-user`, que:

- exige una sesion iniciada;
- revisa que el perfil interno sea `admin`;
- crea o actualiza el usuario en Supabase Auth;
- crea o actualiza el perfil en `app_users`;
- crea o actualiza el profesional asociado cuando el rol es `professional`.

La contrasena solo se usa en Supabase Auth. No se guarda en `app_users`.
Al crear un acceso nuevo es obligatoria. Al editar, se puede dejar vacia si no se quiere cambiar.

Importante: si `admin-upsert-user` no esta desplegada como Edge Function, el panel de
Administracion no puede crear usuarios reales de Supabase Auth. El formulario puede existir,
pero la creacion de correos y contrasenas no queda operativa.

## Variables en Vercel

En Vercel > Project > Settings > Environment Variables:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

Agregar las dos variables en Production y Preview si quieres probar previews.

Luego hacer redeploy.

## Pruebas obligatorias

Admin:

- Inicia sesion.
- Ve Resumen, Agenda, CRM, Solicitudes y Administracion.
- Puede crear/editar paciente.
- Puede crear/editar recurso.
- Puede crear/editar tratamiento.
- Puede agendar hora.

Profesional:

- Inicia sesion.
- No ve Administracion.
- No ve Solicitudes globales de administracion.
- Ve sus citas.
- Ve sus pacientes asignadas.
- Ve recursos ocupados sin ficha clinica ajena.
- Puede registrar historial propio.

Anonimo:

- No puede leer pacientes.
- No puede leer citas.
- No puede leer historial.
- No puede leer pagos.

## Formulario web publico

Para conectar la web actual con solicitudes:

- Opcion recomendada: usar una Edge Function/API con CORS limitado al dominio de la web.
- Esa funcion crea paciente/solicitud y devuelve exito.
- Luego el formulario abre WhatsApp con el mensaje prellenado.
- En el ERP aparece la solicitud en estado `Pendiente de pago`.

No recomiendo que la web publica escriba directo a las tablas internas con permisos amplios.

## Nota operativa

La app ya tiene fallback local. Si Vercel no tiene `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`, sigue funcionando como demo local con `localStorage`.

Para entrega real, ese fallback solo sirve como respaldo de emergencia. La prueba obligatoria
es crear un dato, abrir incognito y confirmar que el dato sigue apareciendo. Si no aparece,
la URL publicada sigue en modo demo/local.
