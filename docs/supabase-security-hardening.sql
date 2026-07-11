-- Beauty Center ERP - refuerzo de seguridad Supabase/Postgres
-- Ejecutar despues de docs/schema.sql y docs/rls-policies.sql.

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

revoke all on app_users from anon;
revoke all on professionals from anon;
revoke all on patients from anon;
revoke all on treatments from anon;
revoke all on resources from anon;
revoke all on treatment_plans from anon;
revoke all on appointments from anon;
revoke all on clinical_history from anon;
revoke all on appointment_requests from anon;
revoke all on payments from anon;
revoke all on communications from anon;
revoke usage on schema private from anon;

revoke execute on function public.rls_auto_enable() from public;
revoke execute on function public.rls_auto_enable() from anon;
revoke execute on function public.rls_auto_enable() from authenticated;

-- Prueba manual esperada:
-- 1. Admin autenticado puede leer y escribir datos operativos.
-- 2. Profesional autenticada solo ve sus citas, historial y pacientes asignadas.
-- 3. Profesional puede ver resource_occupancy sin ficha clinica, notas ni pagos ajenos.
-- 4. Usuario anonimo no puede leer patients, appointments, clinical_history ni payments.
