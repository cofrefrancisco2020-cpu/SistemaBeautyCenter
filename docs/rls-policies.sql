-- Beauty Center ERP - políticas RLS base para Supabase/Postgres
-- Ejecutar después de docs/schema.sql y después de crear usuarios/profesionales.

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

-- La vista resource_occupancy no expone paciente, nota ni pago.
-- Se usa para que una profesional vea máquinas/boxes ocupados por el equipo
-- sin acceder a fichas clínicas de otras pacientes.
grant select on resource_occupancy to authenticated;

create or replace function current_app_user()
returns app_users
language sql
stable
security definer
set search_path = public
as $$
  select *
  from app_users
  where auth_user_id = auth.uid()
  limit 1
$$;

create or replace function is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from app_users
    where auth_user_id = auth.uid()
      and role = 'admin'
  )
$$;

create or replace function current_professional_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select professional_id
  from app_users
  where auth_user_id = auth.uid()
  limit 1
$$;

create or replace function professional_can_see_patient(target_patient_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from appointments
    where appointments.patient_id = target_patient_id
      and appointments.professional_id = current_professional_id()
  )
  or exists (
    select 1
    from clinical_history
    where clinical_history.patient_id = target_patient_id
      and clinical_history.professional_id = current_professional_id()
  )
  or exists (
    select 1
    from appointment_requests
    where appointment_requests.patient_id = target_patient_id
      and appointment_requests.professional_id = current_professional_id()
  )
$$;

-- Usuarios

create policy "users_read_own_or_admin"
on app_users for select
using (auth_user_id = auth.uid() or is_admin());

create policy "users_admin_write"
on app_users for all
using (is_admin())
with check (is_admin());

-- Catálogos visibles para usuarios logueados

create policy "professionals_read_authenticated"
on professionals for select
using (auth.role() = 'authenticated');

create policy "professionals_admin_write"
on professionals for all
using (is_admin())
with check (is_admin());

create policy "treatments_read_authenticated"
on treatments for select
using (auth.role() = 'authenticated');

create policy "treatments_admin_write"
on treatments for all
using (is_admin())
with check (is_admin());

create policy "resources_read_authenticated"
on resources for select
using (auth.role() = 'authenticated');

create policy "resources_admin_write"
on resources for all
using (is_admin())
with check (is_admin());

-- Pacientes

create policy "patients_admin_read_all"
on patients for select
using (is_admin());

create policy "patients_professional_read_assigned"
on patients for select
using (professional_can_see_patient(id));

create policy "patients_admin_write"
on patients for all
using (is_admin())
with check (is_admin());

-- Planes

create policy "plans_admin_read_all"
on treatment_plans for select
using (is_admin());

create policy "plans_professional_read_assigned"
on treatment_plans for select
using (professional_can_see_patient(patient_id));

create policy "plans_admin_write"
on treatment_plans for all
using (is_admin())
with check (is_admin());

create policy "plans_professional_update_assigned"
on treatment_plans for update
using (professional_can_see_patient(patient_id))
with check (professional_can_see_patient(patient_id));

-- Citas

create policy "appointments_admin_read_all"
on appointments for select
using (is_admin());

create policy "appointments_professional_read_own"
on appointments for select
using (professional_id = current_professional_id());

create policy "appointments_admin_write"
on appointments for all
using (is_admin())
with check (is_admin());

create policy "appointments_professional_update_own"
on appointments for update
using (professional_id = current_professional_id())
with check (professional_id = current_professional_id());

-- Historial

create policy "history_admin_read_all"
on clinical_history for select
using (is_admin());

create policy "history_professional_read_own"
on clinical_history for select
using (professional_id = current_professional_id());

create policy "history_admin_write"
on clinical_history for all
using (is_admin())
with check (is_admin());

create policy "history_professional_insert_own"
on clinical_history for insert
with check (professional_id = current_professional_id());

-- Solicitudes

create policy "requests_admin_all"
on appointment_requests for all
using (is_admin())
with check (is_admin());

create policy "requests_professional_read_own"
on appointment_requests for select
using (professional_id = current_professional_id());

-- Pagos solo administración

create policy "payments_admin_all"
on payments for all
using (is_admin())
with check (is_admin());

-- Comunicaciones

create policy "communications_admin_read_all"
on communications for select
using (is_admin());

create policy "communications_professional_read_assigned"
on communications for select
using (professional_can_see_patient(patient_id));

create policy "communications_admin_write"
on communications for all
using (is_admin())
with check (is_admin());

create policy "communications_professional_insert_assigned"
on communications for insert
with check (professional_can_see_patient(patient_id));
