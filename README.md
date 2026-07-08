# Beauty Center

Esta carpeta contiene la base funcional del sistema interno de Beauty Center.

## Qué incluye

- Agenda semanal vinculada a pacientes por `patientId`.
- CRM clínico/comercial con ficha 360, planes, historial y segmentos.
- Registro de sesiones que actualiza avance del plan e historial.
- Solicitudes vinculadas a paciente existente o paciente nueva.
- Pagos manuales ligados a citas, preparados para API futura.
- Login funcional de prueba con rol de administración y portal profesional.
- Administración de usuarios, contraseñas y profesionales desde el sistema.
- Persistencia local con `localStorage` para probar flujos antes de conectar backend.
- Guía de integración web en `docs/formulario-web-solicitudes.md`.

## Accesos de prueba

- Administración: `admin@beautycenter.cl` / `admin123`
- Javiera: `javiera@beautycenter.cl` / `javiera123`
- Dra. Camila: `camila@beautycenter.cl` / `camila123`
- Natalia: `natalia@beautycenter.cl` / `natalia123`

## Cómo probar

Abrir `index.html` con servidor local. Esta versión no necesita instalación ni dependencias.

Si se usa Python:

```bash
python -m http.server 8064
```

## Flujo real esperado

1. Una paciente entra desde web, Instagram, WhatsApp o se registra manualmente.
2. El sistema busca por teléfono/correo para evitar duplicados.
3. Si existe, la solicitud se vincula al paciente.
4. Si no existe, crea paciente nueva.
5. La cita se agenda con `patientId`, `professionalId`, `treatmentId` y `resourceId`.
6. Un mismo paciente puede tener uno o más planes de tratamiento activos.
7. Al marcar una cita como atendida, se suma al historial y al avance del plan correspondiente.
8. Al registrar pago, queda ligado a la cita y paciente.

## Importante

La app actual usa `localStorage` como capa temporal. Para producción, reemplazar esa capa por Supabase, Neon + Auth, PocketBase o Appwrite usando el esquema de `docs/schema.sql`.
