# Auditoria de seguridad - Beauty Center

Fecha de revision: 2026-07-07.

## Estado actual

La version actual mantiene fallback local con `localStorage`, pero ya esta preparada para Vite + Supabase Auth/Postgres cuando existan variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.

Eso significa:

- El login actual sirve para probar roles y pantallas, pero no es autenticacion real de produccion.
- Las contrasenas de prueba estan en el frontend y no deben usarse cuando se conecte a Supabase.
- Los datos quedan en el navegador de la persona que usa la demo.
- No existe todavia RLS activo en esta copia local, porque RLS vive en Supabase/Postgres.
- No existe rate limit real en esta app estatica, porque el navegador no puede limitar intentos de forma confiable.

Para produccion, la seguridad real debe quedar en:

- Supabase Auth o un proveedor equivalente.
- Postgres RLS activado tabla por tabla.
- Policies que separen administrador vs profesional.
- API/Edge Function para formularios publicos cuando queramos controlar spam, CORS y rate limit.
- Headers de seguridad en Vercel.

## RLS

El proyecto original incluye `docs/schema.sql` y `docs/rls-policies.sql`. La direccion es correcta: admin ve todo, profesional ve solo su agenda, sus pacientes asignadas y ocupacion general de recursos sin datos clinicos de otras pacientes.

Puntos buenos:

- RLS esta contemplado para todas las tablas principales.
- Existe una vista `resource_occupancy` para que profesionales vean maquinas/boxes ocupados sin exponer ficha clinica.
- Pagos quedan solo para administracion.
- Pacientes y planes se filtran por relacion con citas, historial o solicitudes del profesional.

Puntos a reforzar antes de produccion:

- Aplicar `force row level security` en tablas sensibles.
- Agregar indices compuestos para las columnas usadas por las policies.
- Evitar que funciones helper de RLS queden expuestas como RPC publico si no es necesario.
- Probar con dos usuarios reales: admin y profesional. La profesional no debe poder leer pacientes ajenas aunque cambie el ID manualmente.
- No permitir inserts anonimos directos a tablas sensibles desde el formulario web. Mejor recibir solicitudes publicas por una API/Edge Function validada.

## CORS

Hoy no hay CORS configurado porque no hay backend propio ni Edge Functions activas.

Cuando conectemos el formulario web:

- Si la web llama directo a Supabase con `anon key`, RLS tiene que proteger todo.
- Si usamos una Edge Function para crear solicitudes, esa funcion debe responder `OPTIONS` y permitir solo los dominios reales de Beauty Center.
- Evitar `Access-Control-Allow-Origin: *` en endpoints con datos internos.
- El formulario publico puede permitir solo el dominio de la web publica, por ejemplo `https://clinicabeautycenter.cl`.

## Security headers

Se agrego `vercel.json` con una base de headers para deploy:

- `Content-Security-Policy`: limita scripts, conexiones, imagenes y evita que la app se incruste en otros sitios.
- `X-Content-Type-Options: nosniff`: evita interpretaciones raras de archivos.
- `Referrer-Policy`: reduce filtracion de URLs hacia sitios externos.
- `Permissions-Policy`: bloquea camara, microfono, geolocalizacion y payment si no se usan.
- `Strict-Transport-Security`: obliga HTTPS en navegadores compatibles.
- `Cross-Origin-Opener-Policy`: aisla mejor la ventana frente a otros sitios.

Nota: la CSP permite `style-src 'unsafe-inline'` porque la app actual usa algunos estilos dinamicos. Mas adelante se puede endurecer si eliminamos estilos inline.

## Frontend comprimido y sin source maps

Sirve para:

- Cargar mas rapido.
- Reducir peso de JS/CSS.
- Evitar que terceros lean el codigo tan facilmente desde DevTools.
- No publicar mapas de codigo que revelen estructura interna.

No sirve para:

- Ocultar secretos. Nunca debe existir una service role key, contrasena real o token privado en el frontend.
- Reemplazar Auth, RLS o validaciones del servidor.
- Impedir que alguien inspeccione el comportamiento de la app.

Con Vite:

- Build de produccion minificado.
- Source maps apagados para navegador publico.
- Variables publicas solo para datos publicos, como `SUPABASE_URL` y `SUPABASE_ANON_KEY`.

## Rate limit

No se puede hacer bien solo desde el frontend.

Donde si conviene aplicarlo:

- Login.
- Formulario publico de solicitudes.
- API para crear pacientes/solicitudes.
- Subida de imagenes de profesionales.
- Cualquier webhook o endpoint futuro de pagos.

Reglas sugeridas al partir:

- Login: 5 a 10 intentos por minuto por IP.
- Formulario publico: 5 solicitudes cada 10 minutos por IP.
- API interna: 60 a 100 requests por minuto por IP o sesion.
- Subida de imagenes: limite de tamano y pocos intentos por minuto.

En Vercel se puede usar Firewall Rate Limiting. En Supabase Edge Functions tambien se puede agregar validacion propia o Redis/Upstash si se necesita mas control.

## Cache / caching

Sirve para:

- Que la app cargue mas rapido.
- Reducir consumo de red.
- Evitar que cada visita vuelva a descargar logo, imagenes, CSS y JS.

Como queda recomendado:

- `index.html`: `no-store`, para que el usuario reciba siempre la version nueva.
- `app.js` y `styles.css`: cache corto mientras no tengamos archivos con hash.
- `assets/*`: cache largo, porque son imagenes estables.
- Respuestas privadas de API: `no-store`.
- Datos de pacientes, historial y agenda: no cachearlos publicamente.

## Veredicto

Como demo funcional, esta bien encaminada.

Como sistema final conectado a pacientes reales, todavia falta la capa de seguridad real:

1. Migrar login a Supabase Auth.
2. Ejecutar schema y RLS.
3. Ajustar adaptador Supabase para no cargar `select("*")` general sin filtros/policies.
4. Probar aislamiento de admin/profesional.
5. Publicar en Vercel con `vercel.json`.
6. Agregar rate limit en formularios y login.
7. Desactivar source maps en build de produccion.
