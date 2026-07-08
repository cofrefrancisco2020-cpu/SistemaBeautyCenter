-- Beauty Center ERP - esquema base Postgres/Supabase

create table if not exists app_users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  name text not null,
  email text unique,
  role text not null check (role in ('admin', 'professional')),
  professional_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists professionals (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null,
  email text,
  phone text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table app_users
  add constraint app_users_professional_fk
  foreign key (professional_id) references professionals(id);

create table if not exists patients (
  id uuid primary key default gen_random_uuid(),
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

create table if not exists treatments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price integer not null default 0,
  default_sessions integer not null default 1,
  active boolean not null default true
);

create table if not exists resources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  active boolean not null default true
);

create table if not exists treatment_plans (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id) on delete cascade,
  treatment_id uuid not null references treatments(id),
  purchased_sessions integer not null,
  completed_sessions integer not null default 0,
  status text not null check (status in ('active', 'completed', 'paused')),
  next_action text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id),
  treatment_id uuid not null references treatments(id),
  treatment_plan_id uuid references treatment_plans(id),
  professional_id uuid not null references professionals(id),
  resource_id uuid references resources(id),
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
  where resource_id is not null and status <> 'cancelled';

create table if not exists clinical_history (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id) on delete cascade,
  appointment_id uuid references appointments(id),
  treatment_plan_id uuid references treatment_plans(id),
  treatment_id uuid references treatments(id),
  professional_id uuid references professionals(id),
  history_date date not null,
  note text not null,
  is_session_entry boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists appointment_requests (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references patients(id),
  treatment_id uuid references treatments(id),
  professional_id uuid references professionals(id),
  requested_date date,
  requested_time time,
  source text,
  status text not null default 'Pendiente',
  follow_up_date date,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references appointments(id),
  patient_id uuid not null references patients(id),
  amount integer not null,
  method text not null,
  provider text,
  provider_payment_id text,
  status text not null check (status in ('pending', 'paid', 'failed', 'refunded')),
  created_at timestamptz not null default now()
);

create table if not exists communications (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id),
  channel text not null check (channel in ('whatsapp', 'email', 'phone')),
  template text,
  message text not null,
  status text not null default 'prepared',
  created_by uuid references app_users(id),
  created_at timestamptz not null default now()
);

-- Índices operativos recomendados para Supabase/Postgres.
-- Postgres no indexa automáticamente todas las claves foráneas; estos índices
-- mantienen rápidos los JOIN, filtros por paciente/profesional y cascadas.

create index if not exists app_users_professional_id_idx
  on app_users (professional_id);

create index if not exists treatment_plans_patient_id_idx
  on treatment_plans (patient_id);

create index if not exists treatment_plans_treatment_id_idx
  on treatment_plans (treatment_id);

create index if not exists treatment_plans_status_idx
  on treatment_plans (status);

create index if not exists appointments_patient_id_idx
  on appointments (patient_id);

create index if not exists appointments_treatment_plan_id_idx
  on appointments (treatment_plan_id);

create index if not exists appointments_date_time_idx
  on appointments (appointment_date, appointment_time)
  where status <> 'cancelled';

create index if not exists appointments_payment_status_idx
  on appointments (payment_status)
  where payment_status <> 'paid';

create index if not exists clinical_history_patient_date_idx
  on clinical_history (patient_id, history_date desc);

create index if not exists clinical_history_appointment_id_idx
  on clinical_history (appointment_id);

create index if not exists clinical_history_plan_id_idx
  on clinical_history (treatment_plan_id);

create index if not exists appointment_requests_patient_id_idx
  on appointment_requests (patient_id);

create index if not exists appointment_requests_professional_id_idx
  on appointment_requests (professional_id);

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

-- Vista segura para agenda profesional:
-- permite mostrar máquinas/boxes ocupados sin exponer ficha, notas ni pago.
-- En producción el frontend profesional debería leer sus citas desde
-- appointments y el contexto de recursos desde esta vista.

create or replace view resource_occupancy as
select
  resource_id,
  professional_id,
  appointment_date,
  appointment_time,
  status
from appointments
where resource_id is not null
  and status <> 'cancelled';

grant select on resource_occupancy to authenticated;

-- RLS sugerido:
-- 1. Admin puede leer/escribir todo.
-- 2. Profesional solo puede leer pacientes con citas/historial asignado a su professional_id.
-- 3. Profesional puede crear historial de sus propias atenciones.
-- 4. Pagos solo administración.
