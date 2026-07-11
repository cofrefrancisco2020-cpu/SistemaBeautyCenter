# Plan de produccion - Beauty Center

Este documento ordena los pasos para dejar la app lista con Supabase, GitHub y Vercel.

## Estado actual

La app ya funciona como sistema local con:

- Login de prueba con rol admin/profesional.
- Agenda semanal.
- CRM de pacientes.
- Solicitudes.
- Administracion de usuarios, profesionales, recursos y tratamientos.
- Perfil con imagen comprimida.
- Persistencia local con `localStorage` como fallback.
- Base preparada para Vite + Supabase Auth/Postgres.
- Documentos base de Supabase, RLS, seguridad y deploy.

Lo que falta para produccion real es reemplazar la capa local por Auth + base de datos real.

## Orden recomendado

### 1. Congelar version de entrega

Antes de conectar servicios:

- Limpiar datos QA/demo que no correspondan.
- Definir dominio final o subdominio de prueba.
- Confirmar correos reales de administracion y profesionales.
- Confirmar tratamientos, recursos, boxes, maquinas y horarios reales.
- Confirmar si el formulario publico estara en la web actual o dentro del mismo proyecto.

### 2. Crear repositorio GitHub

- Crear repo privado.
- Subir esta carpeta como raiz del proyecto.
- Mantener `main` como rama estable.
- Usar ramas para cambios grandes, por ejemplo `supabase-auth`, `formulario-web`, `vercel-deploy`.
- Activar GitHub Actions con `.github/workflows/quality-and-health.yml`.

Segun GitHub Docs, los secrets de Actions se crean en Settings > Secrets and variables > Actions. Usarlos solo para tokens de deploy, nunca escribirlos dentro del codigo.

### 3. Crear proyecto Supabase

En Supabase:

1. Crear proyecto.
2. Guardar Project URL.
3. Guardar anon public key.
4. No usar service role key en frontend.
5. Ejecutar SQL en este orden:
   - `docs/schema.sql`
   - `docs/rls-policies.sql`
   - `docs/supabase-security-hardening.sql`
6. Crear usuarios en Supabase Auth.
7. Insertar esos usuarios en `app_users` con `auth_user_id`.
8. Probar RLS con admin y profesional.

Prueba obligatoria de RLS:

- Admin puede ver todo.
- Profesional solo ve su agenda, pacientes asignadas e historial propio.
- Profesional ve ocupacion de recursos sin ficha clinica de otras pacientes.
- Usuario anonimo no puede leer pacientes, historial, citas ni pagos.

### 4. Conectar frontend con Supabase

Cambios de codigo ya encaminados:

- Login real preparado con Supabase Auth cuando existan variables `VITE_SUPABASE_*`.
- `createSupabaseAdapter` conectado como alternativa real al fallback local.
- Build Vite preparado sin source maps publicos.

Pendientes de produccion:

- Quitar/aislar contrasenas demo cuando Supabase quede activo para el cliente.
- Guardar imagenes de profesionales en Supabase Storage.
- Mantener compresion de imagen en navegador antes de subir.
- Convertir operaciones grandes en operaciones puntuales: insertar paciente, actualizar cita, crear solicitud, registrar sesion.

Variables:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

### 5. Formulario web y CORS

Para solicitudes desde la web publica hay dos caminos:

- Opcion simple: formulario envia directo a Supabase con anon key y RLS bien configurado.
- Opcion mas segura: formulario llama una Edge Function/API que valida campos, aplica CORS y rate limit, y recien crea la solicitud.

Recomendacion para entrega real:

- Usar Edge Function/API para el formulario publico.
- Permitir solo el dominio real de la web en CORS.
- No permitir `*` si el endpoint toca datos internos.
- Crear solicitud con estado `Pendiente de pago`.
- Despues administracion valida pago por WhatsApp y agenda.

### 6. Vercel

En Vercel:

- Importar repo desde GitHub.
- Configurar variables publicas de Supabase.
- Desplegar Preview.
- Probar Preview completo.
- Configurar dominio final.
- Publicar Production.

Ya existe `vercel.json` con:

- Security headers.
- Cache para HTML, JS, CSS y assets.
- CSP preparada para Supabase.

Con Vite:

- Build minificado.
- Source maps publicos desactivados.
- Archivos con hash para cache largo.

### 7. Rate limit

Aplicar rate limit en:

- Login.
- Formulario publico.
- Endpoints de creacion de solicitud.
- Subida de imagenes.

Reglas iniciales:

- Login: 5 a 10 intentos por minuto por IP.
- Formulario publico: 5 solicitudes cada 10 minutos por IP.
- API interna: 60 a 100 requests por minuto.

En Vercel se configura desde Firewall > Rate Limiting.

### 8. Checklist QA antes de entregar

Admin:

- Login admin.
- Ver resumen.
- Crear/editar profesional.
- Crear/editar recurso.
- Crear/editar tratamiento.
- Crear paciente.
- Crear solicitud.
- Agendar hora.
- Cambiar fecha de agenda.
- Confirmar que recursos ocupados aparecen.
- Confirmar que datos persisten al recargar.

Profesional:

- Login profesional.
- Ver solo Resumen, Agenda y CRM pacientes.
- No ver Administracion ni Solicitudes.
- Ver pacientes asignadas.
- Registrar sesion.
- Editar observacion/historial permitido.
- Ver recursos ocupados sin datos clinicos ajenos.

Seguridad:

- Sin service role key en frontend.
- Sin contrasenas reales en codigo.
- RLS activo y forzado.
- Headers activos en deploy.
- CORS limitado.
- Rate limit activo.
- Source maps desactivados en build publico.

## Siguiente decision tecnica

La app ya quedo preparada para Vite. Lo siguiente es terminar la conexion operativa de Supabase:

- Variables de entorno publicas.
- Build minificado.
- Sin source maps publicos.
- Deploy mas ordenado en Vercel.
- Mantener la UI actual casi intacta.
