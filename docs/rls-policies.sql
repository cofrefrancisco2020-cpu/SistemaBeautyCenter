-- Beauty Center ERP - politicas RLS base para Supabase/Postgres
-- Ejecutar despues de docs/schema.sql.

create schema if not exists private;

alter table app_users enable row level security;
alter table professionals enable row level security;
alter table patients enable row level security;
alter table treatments enable row level security;
alter table resources enable row level security;
alter table treatment_plans enable row level security;
alter table appointments enable row level security;
alter table clinical_history enable row level security;
alter table appointment_requests enable row level security;
alter table payments enable row level security;
alter table communications enable row level security;

grant usage on schema public to authenticated;
grant usage on schema private to authenticated;

grant select, insert, update, delete on app_users to authenticated;
grant select, insert, update, delete on professionals to authenticated;
grant select, insert, update, delete on patients to authenticated;
grant select, insert, update, delete on treatments to authenticated;
grant select, insert, update, delete on resources to authenticated;
grant select, insert, update, delete on treatment_plans to authenticated;
grant select, insert, update, delete on appointments to authenticated;
grant select, insert, update, delete on clinical_history to authenticated;
grant select, insert, update, delete on appointment_requests to authenticated;
grant select, insert, update, delete on payments to authenticated;
grant select, insert, update, delete on communications to authenticated;
grant select on resource_occupancy to authenticated;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from app_users
    where auth_user_id = (select auth.uid())
      and role = 'admin'
      and active is true
  )
$$;

create or replace function private.current_professional_id()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select professional_id
  from app_users
  where auth_user_id = (select auth.uid())
    and active is true
  limit 1
$$;

create or replace function private.professional_can_see_patient(target_patient_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select (select private.is_admin())
  or exists (
    select 1
    from appointments
    where appointments.patient_id = target_patient_id
      and appointments.professional_id = (select private.current_professional_id())
  )
  or exists (
    select 1
    from clinical_history
    where clinical_history.patient_id = target_patient_id
      and clinical_history.professional_id = (select private.current_professional_id())
  )
  or exists (
    select 1
    from appointment_requests
    where appointment_requests.patient_id = target_patient_id
      and appointment_requests.professional_id = (select private.current_professional_id())
  )
$$;

grant execute on function private.is_admin() to authenticated;
grant execute on function private.current_professional_id() to authenticated;
grant execute on function private.professional_can_see_patient(text) to authenticated;

-- Usuarios internos

create policy "users_read_own_or_admin"
on app_users for select
using (auth_user_id = (select auth.uid()) or (select private.is_admin()));

create policy "users_admin_insert"
on app_users for insert
with check ((select private.is_admin()));

create policy "users_admin_update"
on app_users for update
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "users_admin_delete"
on app_users for delete
using ((select private.is_admin()));

-- Catalogos operativos

create policy "professionals_read_authenticated"
on professionals for select
using (auth.role() = 'authenticated');

create policy "professionals_admin_insert"
on professionals for insert
with check ((select private.is_admin()));

create policy "professionals_admin_update"
on professionals for update
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "professionals_admin_delete"
on professionals for delete
using ((select private.is_admin()));

create policy "treatments_read_authenticated"
on treatments for select
using (auth.role() = 'authenticated');

create policy "treatments_admin_insert"
on treatments for insert
with check ((select private.is_admin()));

create policy "treatments_admin_update"
on treatments for update
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "treatments_admin_delete"
on treatments for delete
using ((select private.is_admin()));

create policy "resources_read_authenticated"
on resources for select
using (auth.role() = 'authenticated');

create policy "resources_admin_insert"
on resources for insert
with check ((select private.is_admin()));

create policy "resources_admin_update"
on resources for update
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "resources_admin_delete"
on resources for delete
using ((select private.is_admin()));

-- Pacientes

create policy "patients_admin_read_all"
on patients for select
using ((select private.is_admin()));

create policy "patients_professional_read_assigned"
on patients for select
using ((select private.professional_can_see_patient(id)));

create policy "patients_admin_insert"
on patients for insert
with check ((select private.is_admin()));

create policy "patients_admin_update"
on patients for update
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "patients_professional_update_assigned"
on patients for update
using ((select private.professional_can_see_patient(id)))
with check ((select private.professional_can_see_patient(id)));

create policy "patients_admin_delete"
on patients for delete
using ((select private.is_admin()));

-- Planes de tratamiento

create policy "plans_admin_read_all"
on treatment_plans for select
using ((select private.is_admin()));

create policy "plans_professional_read_assigned"
on treatment_plans for select
using ((select private.professional_can_see_patient(patient_id)));

create policy "plans_admin_insert"
on treatment_plans for insert
with check ((select private.is_admin()));

create policy "plans_professional_insert_assigned"
on treatment_plans for insert
with check ((select private.professional_can_see_patient(patient_id)));

create policy "plans_admin_update"
on treatment_plans for update
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "plans_professional_update_assigned"
on treatment_plans for update
using ((select private.professional_can_see_patient(patient_id)))
with check ((select private.professional_can_see_patient(patient_id)));

create policy "plans_admin_delete"
on treatment_plans for delete
using ((select private.is_admin()));

-- Citas

create policy "appointments_admin_read_all"
on appointments for select
using ((select private.is_admin()));

create policy "appointments_professional_read_own"
on appointments for select
using (professional_id = (select private.current_professional_id()));

create policy "appointments_admin_insert"
on appointments for insert
with check ((select private.is_admin()));

create policy "appointments_professional_insert_own"
on appointments for insert
with check (professional_id = (select private.current_professional_id()));

create policy "appointments_admin_update"
on appointments for update
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "appointments_professional_update_own"
on appointments for update
using (professional_id = (select private.current_professional_id()))
with check (professional_id = (select private.current_professional_id()));

create policy "appointments_admin_delete"
on appointments for delete
using ((select private.is_admin()));

create policy "appointments_professional_delete_own"
on appointments for delete
using (professional_id = (select private.current_professional_id()));

-- Historial clinico

create policy "history_admin_read_all"
on clinical_history for select
using ((select private.is_admin()));

create policy "history_professional_read_own"
on clinical_history for select
using (professional_id = (select private.current_professional_id()));

create policy "history_admin_insert"
on clinical_history for insert
with check ((select private.is_admin()));

create policy "history_professional_insert_own"
on clinical_history for insert
with check (professional_id = (select private.current_professional_id()));

create policy "history_admin_update"
on clinical_history for update
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "history_professional_update_own"
on clinical_history for update
using (professional_id = (select private.current_professional_id()))
with check (professional_id = (select private.current_professional_id()));

create policy "history_admin_delete"
on clinical_history for delete
using ((select private.is_admin()));

create policy "history_professional_delete_own"
on clinical_history for delete
using (professional_id = (select private.current_professional_id()));

-- Solicitudes comerciales

create policy "requests_admin_read_all"
on appointment_requests for select
using ((select private.is_admin()));

create policy "requests_professional_read_own"
on appointment_requests for select
using (professional_id = (select private.current_professional_id()));

create policy "requests_admin_insert"
on appointment_requests for insert
with check ((select private.is_admin()));

create policy "requests_admin_update"
on appointment_requests for update
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "requests_professional_update_own"
on appointment_requests for update
using (professional_id = (select private.current_professional_id()))
with check (professional_id = (select private.current_professional_id()));

create policy "requests_admin_delete"
on appointment_requests for delete
using ((select private.is_admin()));

-- Pagos solo administracion

create policy "payments_admin_read_all"
on payments for select
using ((select private.is_admin()));

create policy "payments_admin_insert"
on payments for insert
with check ((select private.is_admin()));

create policy "payments_admin_update"
on payments for update
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "payments_admin_delete"
on payments for delete
using ((select private.is_admin()));

-- Comunicaciones manuales

create policy "communications_admin_read_all"
on communications for select
using ((select private.is_admin()));

create policy "communications_professional_read_assigned"
on communications for select
using ((select private.professional_can_see_patient(patient_id)));

create policy "communications_admin_insert"
on communications for insert
with check ((select private.is_admin()));

create policy "communications_professional_insert_assigned"
on communications for insert
with check ((select private.professional_can_see_patient(patient_id)));

create policy "communications_admin_update"
on communications for update
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "communications_admin_delete"
on communications for delete
using ((select private.is_admin()));
