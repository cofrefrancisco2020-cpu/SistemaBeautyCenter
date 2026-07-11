# Checklist entrega real

## Diagnostico actual

La prueba de incognito fallo porque la URL publicada estaba sirviendo la version demo con `localStorage`.
Esa version guarda cambios solo en el navegador donde se usan. Por eso un usuario, paciente,
tratamiento o agenda creados en una ventana no aparecen en incognito ni quedan en Supabase.

La version correcta del proyecto ya esta preparada para:

- iniciar sesion con Supabase Auth;
- cargar pacientes, agenda, solicitudes, tratamientos, recursos e historial desde Postgres;
- guardar cambios en Supabase;
- respetar RLS para separar administrador y profesionales;
- usar una Edge Function llamada `admin-upsert-user` para crear/editar usuarios reales desde Administracion.

## Bloqueos automaticos del 9 de julio de 2026

Codex bloqueo acciones remotas por limite de uso:

- deploy automatico de la Edge Function `admin-upsert-user`;
- build local con descarga/verificacion de dependencias;
- consultas SQL adicionales por MCP.

Por eso no se debe considerar entregado hasta completar manualmente los pasos de activacion.

## Activacion necesaria

### 1. Variables en Vercel

En Vercel > proyecto `beautycenter-system` > Settings > Environment Variables:

```env
VITE_SUPABASE_URL=https://vwsqkhfrvcfzldwfvvrg.supabase.co
VITE_SUPABASE_ANON_KEY=PEGAR_ANON_PUBLIC_KEY
```

Usar Production y Preview.

### 2. Build correcto de Vercel

El proyecto debe compilar con Vite:

```txt
Build Command: pnpm run build
Output Directory: dist
Install Command: pnpm install
```

Despues de desplegar, revisar la pagina publicada:

- correcto: `index.html` carga algo como `/assets/index-xxxxx.js`;
- incorrecto: `index.html` carga `./app.js?v=...`;
- incorrecto: `/app.js` importa solo `./adapters/localStorageAdapter.js`;
- correcto: el bundle final incluye Supabase y no depende solo de `localStorage`.

### 3. Edge Function de administracion

Subir la funcion local:

```txt
supabase/functions/admin-upsert-user/index.ts
```

Nombre de la funcion:

```txt
admin-upsert-user
```

Debe quedar con JWT requerido.

Esta funcion permite que el administrador cree correos y contrasenas reales desde:

```txt
Administracion > Crear o editar acceso
```

Sin esta funcion, el resto del sistema puede guardar datos, pero crear usuarios desde el panel no queda completo.

### 4. Usuarios iniciales

Ya existen en Supabase Auth:

```txt
admin@beautycenter.cl
javiera@beautycenter.cl
```

Y deben estar enlazados en `app_users.auth_user_id`.

El administrador inicial se crea manualmente una sola vez. Despues, nuevos accesos se crean desde el ERP.

## Prueba obligatoria de persistencia

1. Entrar como administrador en la URL productiva.
2. Crear un paciente con nombre unico, por ejemplo `Prueba Incognito 0907`.
3. Crear una solicitud o una hora para ese paciente.
4. Cerrar sesion.
5. Abrir incognito.
6. Entrar como administrador.
7. Buscar `Prueba Incognito 0907`.

Resultado esperado:

- el paciente aparece;
- la hora o solicitud aparece;
- el cambio tambien se ve en Supabase Table Editor.

Si no aparece, la app sigue usando modo demo/local.

## Prueba de roles

Administrador:

- ve Resumen, Agenda, CRM pacientes, Solicitudes y Administracion;
- puede crear paciente;
- puede crear recurso;
- puede crear tratamiento;
- puede crear hora;
- puede crear acceso si `admin-upsert-user` esta desplegada.

Profesional:

- no debe ver Administracion;
- no debe gestionar usuarios;
- debe ver su agenda;
- debe ver recursos ocupados en la agenda;
- debe ver solo pacientes/historial asignados segun RLS.

## Estado para entregar al cliente

No entregar como final si falta cualquiera de estos puntos:

- Vercel sirve el build Vite desde `dist`;
- variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` estan en Vercel;
- `admin-upsert-user` esta desplegada;
- prueba de incognito pasa;
- login admin y login profesional pasan.
