-- Beauty Center V2 - planes clínicos, horarios flexibles y eliminación segura.
-- Corrige la recreación de resource_occupancy en bases existentes.
-- Ejecutar una sola vez en Supabase > SQL Editor, después de aprobar la vista local.

begin;

create extension if not exists btree_gist;

alter table public.treatment_plans
  add column if not exists treatment_areas text,
  add column if not exists clinical_considerations text;

alter table public.appointments
  add column if not exists appointment_end_time time;

update public.appointments
set appointment_end_time = appointment_time + interval '1 hour'
where appointment_end_time is null;

alter table public.appointments
  alter column appointment_end_time set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'appointments_time_order_check'
      and conrelid = 'public.appointments'::regclass
  ) then
    alter table public.appointments
      add constraint appointments_time_order_check
      check (appointment_end_time > appointment_time);
  end if;
end $$;

drop index if exists public.appointments_professional_slot_unique;
drop index if exists public.appointments_resource_slot_unique;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'appointments_professional_no_overlap'
      and conrelid = 'public.appointments'::regclass
  ) then
    alter table public.appointments
      add constraint appointments_professional_no_overlap
      exclude using gist (
        professional_id with =,
        tsrange(appointment_date + appointment_time, appointment_date + appointment_end_time, '[)') with &&
      ) where (status <> 'cancelled');
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'appointments_resource_no_overlap'
      and conrelid = 'public.appointments'::regclass
  ) then
    alter table public.appointments
      add constraint appointments_resource_no_overlap
      exclude using gist (
        resource_id with =,
        tsrange(appointment_date + appointment_time, appointment_date + appointment_end_time, '[)') with &&
      ) where (resource_id is not null and resource_id <> 'res-none' and status <> 'cancelled');
  end if;
end $$;

alter table public.appointments
  drop constraint if exists appointments_patient_id_fkey;

alter table public.appointments
  add constraint appointments_patient_id_fkey
  foreign key (patient_id) references public.patients(id) on delete cascade;

drop view if exists public.resource_occupancy;

create view public.resource_occupancy
with (security_invoker = false, security_barrier = true) as
select
  resource_id,
  professional_id,
  appointment_date,
  appointment_time,
  status,
  appointment_end_time
from public.appointments
where resource_id is not null
  and resource_id <> 'res-none'
  and status <> 'cancelled';

revoke all on public.resource_occupancy from public, anon;
grant select on public.resource_occupancy to authenticated, service_role;

create or replace function public.delete_patient_cascade(target_patient_id text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not (select private.is_admin()) then
    raise exception 'Solo una cuenta administradora puede eliminar pacientes.';
  end if;

  delete from public.patients
  where id = target_patient_id;

  if not found then
    raise exception 'La paciente no existe o ya fue eliminada.';
  end if;
end;
$$;

revoke all on function public.delete_patient_cascade(text) from public, anon;
grant execute on function public.delete_patient_cascade(text) to authenticated, service_role;

commit;
