-- Beauty Center - refuerzo de seguridad para Supabase/Postgres
-- Ejecutar junto con schema.sql y rls-policies.sql antes de conectar datos reales.

-- 1) Forzar RLS incluso si el dueno de la tabla consulta accidentalmente.
alter table app_users force row level security;
alter table professionals force row level security;
alter table patients force row level security;
alter table treatments force row level security;
alter table resources force row level security;
alter table treatment_plans force row level security;
alter table appointments force row level security;
alter table clinical_history force row level security;
alter table appointment_requests force row level security;
alter table payments force row level security;
alter table communications force row level security;

-- 2) Indices para que las policies no se vuelvan lentas cuando crezca la base.
create index if not exists app_users_auth_user_id_role_idx
  on app_users (auth_user_id, role);

create index if not exists appointments_professional_patient_idx
  on appointments (professional_id, patient_id);

create index if not exists appointments_resource_date_time_active_idx
  on appointments (resource_id, appointment_date, appointment_time)
  where resource_id is not null and status <> 'cancelled';

create index if not exists clinical_history_professional_patient_idx
  on clinical_history (professional_id, patient_id);

create index if not exists appointment_requests_professional_patient_idx
  on appointment_requests (professional_id, patient_id);

create index if not exists communications_patient_created_at_idx
  on communications (patient_id, created_at desc);

-- 3) Reducir superficie anonima de funciones helper.
-- Mantener authenticated si las policies actuales dependen de estas funciones.
revoke execute on function current_app_user() from anon;
revoke execute on function is_admin() from anon;
revoke execute on function current_professional_id() from anon;
revoke execute on function professional_can_see_patient(uuid) from anon;

-- 4) Prueba manual esperada despues de aplicar RLS:
-- - Admin puede leer/escribir todas las tablas operativas.
-- - Profesional solo ve sus citas, historial propio y pacientes asignadas.
-- - Profesional ve resource_occupancy sin nombres, notas, pagos ni ficha clinica.
-- - Usuario anonimo no puede leer patients, appointments, clinical_history ni payments.
