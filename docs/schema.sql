-- Beauty Center ERP - esquema base Supabase/Postgres
-- Ejecutar primero, antes de docs/rls-policies.sql.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists professionals (
  id text primary key,
  name text not null,
  role text not null,
  email text,
  phone text,
  image text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists app_users (
  id text primary key,
  auth_user_id uuid unique references auth.users(id) on delete set null,
  name text not null,
  email text unique not null,
  role text not null check (role in ('admin', 'professional')),
  professional_id text references professionals(id) on delete set null,
  image text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists patients (
  id text primary key,
  name text not null,
  phone text not null,
  email text,
  origin text,
  segments text[] not null default '{}',
  notes text,
  last_visit date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists patients_phone_unique
  on patients (regexp_replace(phone, '\D', '', 'g'));

create table if not exists resources (
  id text primary key,
  name text not null,
  type text not null default 'Equipo',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists treatments (
  id text primary key,
  name text not null,
  price integer not null default 0,
  default_sessions integer not null default 1,
  resource_id text references resources(id) on delete set null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists treatment_plans (
  id text primary key,
  patient_id text not null references patients(id) on delete cascade,
  treatment_id text not null references treatments(id),
  purchased_sessions integer not null check (purchased_sessions > 0),
  completed_sessions integer not null default 0 check (completed_sessions >= 0),
  status text not null check (status in ('active', 'completed', 'paused')),
  next_action text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists appointments (
  id text primary key,
  patient_id text not null references patients(id),
  treatment_id text not null references treatments(id),
  treatment_plan_id text references treatment_plans(id) on delete set null,
  professional_id text not null references professionals(id),
  resource_id text references resources(id) on delete set null,
  appointment_date date not null,
  appointment_time time not null,
  status text not null check (status in ('requested', 'confirmed', 'rescheduled', 'paid', 'attended', 'cancelled')),
  payment_status text not null check (payment_status in ('pending', 'paid', 'refunded')) default 'pending',
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists appointments_professional_slot_unique
  on appointments (professional_id, appointment_date, appointment_time)
  where status <> 'cancelled';

create unique index if not exists appointments_resource_slot_unique
  on appointments (resource_id, appointment_date, appointment_time)
  where resource_id is not null and resource_id <> 'res-none' and status <> 'cancelled';

create table if not exists clinical_history (
  id text primary key,
  patient_id text not null references patients(id) on delete cascade,
  appointment_id text references appointments(id) on delete set null,
  treatment_plan_id text references treatment_plans(id) on delete set null,
  treatment_id text references treatments(id) on delete set null,
  professional_id text references professionals(id) on delete set null,
  history_date date not null,
  note text not null,
  is_session_entry boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists appointment_requests (
  id text primary key,
  patient_id text references patients(id) on delete set null,
  treatment_id text references treatments(id) on delete set null,
  professional_id text references professionals(id) on delete set null,
  requested_date date,
  requested_time time,
  source text,
  status text not null default 'Pendiente de pago',
  follow_up_date date,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists payments (
  id text primary key,
  appointment_id text not null references appointments(id) on delete cascade,
  patient_id text not null references patients(id) on delete cascade,
  amount integer not null check (amount >= 0),
  method text not null,
  provider text,
  provider_payment_id text,
  status text not null check (status in ('pending', 'paid', 'failed', 'refunded')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists communications (
  id text primary key,
  patient_id text not null references patients(id) on delete cascade,
  channel text not null check (channel in ('whatsapp', 'email', 'phone')),
  template text,
  message text not null,
  status text not null default 'prepared',
  created_by text references app_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists professionals_set_updated_at on professionals;
create trigger professionals_set_updated_at
before update on professionals
for each row execute function public.set_updated_at();

drop trigger if exists app_users_set_updated_at on app_users;
create trigger app_users_set_updated_at
before update on app_users
for each row execute function public.set_updated_at();

drop trigger if exists patients_set_updated_at on patients;
create trigger patients_set_updated_at
before update on patients
for each row execute function public.set_updated_at();

drop trigger if exists resources_set_updated_at on resources;
create trigger resources_set_updated_at
before update on resources
for each row execute function public.set_updated_at();

drop trigger if exists treatments_set_updated_at on treatments;
create trigger treatments_set_updated_at
before update on treatments
for each row execute function public.set_updated_at();

drop trigger if exists treatment_plans_set_updated_at on treatment_plans;
create trigger treatment_plans_set_updated_at
before update on treatment_plans
for each row execute function public.set_updated_at();

drop trigger if exists appointments_set_updated_at on appointments;
create trigger appointments_set_updated_at
before update on appointments
for each row execute function public.set_updated_at();

drop trigger if exists clinical_history_set_updated_at on clinical_history;
create trigger clinical_history_set_updated_at
before update on clinical_history
for each row execute function public.set_updated_at();

drop trigger if exists appointment_requests_set_updated_at on appointment_requests;
create trigger appointment_requests_set_updated_at
before update on appointment_requests
for each row execute function public.set_updated_at();

drop trigger if exists payments_set_updated_at on payments;
create trigger payments_set_updated_at
before update on payments
for each row execute function public.set_updated_at();

drop trigger if exists communications_set_updated_at on communications;
create trigger communications_set_updated_at
before update on communications
for each row execute function public.set_updated_at();

create index if not exists app_users_auth_user_id_role_idx
  on app_users (auth_user_id, role);

create index if not exists app_users_professional_id_idx
  on app_users (professional_id);

create index if not exists professionals_active_idx
  on professionals (active);

create index if not exists treatments_resource_id_idx
  on treatments (resource_id);

create index if not exists treatments_active_idx
  on treatments (active);

create index if not exists resources_active_idx
  on resources (active);

create index if not exists treatment_plans_patient_id_idx
  on treatment_plans (patient_id);

create index if not exists treatment_plans_treatment_id_idx
  on treatment_plans (treatment_id);

create index if not exists treatment_plans_status_idx
  on treatment_plans (status);

create index if not exists appointments_patient_id_idx
  on appointments (patient_id);

create index if not exists appointments_professional_patient_idx
  on appointments (professional_id, patient_id);

create index if not exists appointments_treatment_plan_id_idx
  on appointments (treatment_plan_id);

create index if not exists appointments_resource_date_time_active_idx
  on appointments (resource_id, appointment_date, appointment_time)
  where resource_id is not null and resource_id <> 'res-none' and status <> 'cancelled';

create index if not exists appointments_date_time_idx
  on appointments (appointment_date, appointment_time)
  where status <> 'cancelled';

create index if not exists appointments_payment_status_idx
  on appointments (payment_status)
  where payment_status <> 'paid';

create index if not exists clinical_history_patient_date_idx
  on clinical_history (patient_id, history_date desc);

create index if not exists clinical_history_professional_patient_idx
  on clinical_history (professional_id, patient_id);

create index if not exists clinical_history_appointment_id_idx
  on clinical_history (appointment_id);

create index if not exists clinical_history_plan_id_idx
  on clinical_history (treatment_plan_id);

create index if not exists appointment_requests_patient_id_idx
  on appointment_requests (patient_id);

create index if not exists appointment_requests_professional_id_idx
  on appointment_requests (professional_id);

create index if not exists appointment_requests_professional_patient_idx
  on appointment_requests (professional_id, patient_id);

create index if not exists appointment_requests_follow_up_idx
  on appointment_requests (follow_up_date, status)
  where status not in ('Agendada', 'Perdida');

create index if not exists payments_appointment_id_idx
  on payments (appointment_id);

create index if not exists payments_patient_id_idx
  on payments (patient_id);

create index if not exists payments_status_idx
  on payments (status)
  where status <> 'paid';

create index if not exists communications_patient_id_idx
  on communications (patient_id);

create index if not exists communications_created_by_idx
  on communications (created_by);

create index if not exists communications_patient_created_at_idx
  on communications (patient_id, created_at desc);

create or replace view resource_occupancy
with (security_invoker = true) as
select
  resource_id,
  professional_id,
  appointment_date,
  appointment_time,
  status
from appointments
where resource_id is not null
  and resource_id <> 'res-none'
  and status <> 'cancelled';
