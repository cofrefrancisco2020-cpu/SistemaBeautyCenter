-- Beauty Center ERP - datos iniciales de prueba
-- Ejecutar despues de schema.sql, antes o despues de RLS.
-- Los auth_user_id quedan null hasta crear usuarios en Supabase Auth.

insert into professionals (id, name, role, image, active) values
  ('pro-javiera', 'Javiera', 'Estetica y evaluacion', './assets/e42d2a33a56741a3.jpg', true),
  ('pro-camila', 'Dra. Camila', 'HIFU y tratamientos faciales', './assets/606c138e37c509c1.jpg', true),
  ('pro-natalia', 'Natalia', 'Bienestar, sauna y masajes', './assets/76ec89dc7a4bbe69.jpg', true)
on conflict (id) do update set
  name = excluded.name,
  role = excluded.role,
  image = excluded.image,
  active = excluded.active;

insert into app_users (id, name, email, role, professional_id, image, active) values
  ('user-admin', 'Administracion', 'admin@beautycenter.cl', 'admin', null, './assets/logo-beauty-center.jpg', true),
  ('user-javiera', 'Javiera', 'javiera@beautycenter.cl', 'professional', 'pro-javiera', './assets/e42d2a33a56741a3.jpg', true),
  ('user-camila', 'Dra. Camila', 'camila@beautycenter.cl', 'professional', 'pro-camila', './assets/606c138e37c509c1.jpg', true),
  ('user-natalia', 'Natalia', 'natalia@beautycenter.cl', 'professional', 'pro-natalia', './assets/76ec89dc7a4bbe69.jpg', true)
on conflict (id) do update set
  name = excluded.name,
  email = excluded.email,
  role = excluded.role,
  professional_id = excluded.professional_id,
  image = excluded.image,
  active = excluded.active;

insert into resources (id, name, type, active) values
  ('res-trilaser', 'Maquina Trilaser', 'Equipo', true),
  ('res-hifu', 'HIFU 12D', 'Equipo', true),
  ('res-facial', 'Box facial', 'Box', true),
  ('res-corporal', 'Box corporal', 'Box', true),
  ('res-sauna', 'Sauna', 'Sala', true),
  ('res-none', 'Sin recurso', 'Sin recurso', true)
on conflict (id) do update set
  name = excluded.name,
  type = excluded.type,
  active = excluded.active;

insert into treatments (id, name, price, default_sessions, resource_id, active) values
  ('trt-trilaser', 'Depilacion Trilaser', 15000, 6, 'res-trilaser', true),
  ('trt-hifu', 'HIFU 12D facial', 30000, 3, 'res-hifu', true),
  ('trt-crio', 'Criolipolisis', 25000, 4, 'res-corporal', true),
  ('trt-peeling', 'Hollywood Peeling', 20000, 4, 'res-facial', true),
  ('trt-sauna', 'Sauna + masaje', 18000, 1, 'res-sauna', true),
  ('trt-limpieza', 'Limpieza facial', 18000, 1, 'res-facial', true),
  ('trt-evaluacion', 'Evaluacion corporal', 10000, 1, 'res-none', true)
on conflict (id) do update set
  name = excluded.name,
  price = excluded.price,
  default_sessions = excluded.default_sessions,
  resource_id = excluded.resource_id,
  active = excluded.active;

insert into patients (id, name, phone, email, origin, segments, notes, last_visit) values
  ('pat-marcela', 'Marcela Rojas', '+56 9 8421 3312', 'marcela.rojas@gmail.com', 'Formulario web', array['VIP', 'Tratamiento incompleto', 'Oportunidad'], 'Prefiere atencion AM. Buena tolerancia a Trilaser.', '2026-06-25'),
  ('pat-camila', 'Camila Paz', '+56 9 6112 9044', 'camila.paz@gmail.com', 'WhatsApp', array['VIP', 'Control proximo'], 'Quiere seguimiento facial no invasivo.', '2026-06-10'),
  ('pat-fernanda', 'Fernanda Soto', '+56 9 7331 2208', 'fernanda.soto@gmail.com', 'Instagram', array['Inactiva', 'Tratamiento incompleto', 'Oportunidad'], 'Reactivar protocolo corporal.', '2026-05-03'),
  ('pat-rocio', 'Rocio Gatica', '+56 9 5520 1187', 'rocio.gatica@gmail.com', 'Formulario web', array['Nueva', 'Control proximo'], 'Piel grasa con tendencia acneica.', '2026-07-01'),
  ('pat-antonia', 'Antonia Vargas', '+56 9 7214 9102', 'antonia.vargas@gmail.com', 'Instagram', array['Nueva'], 'Interesada en pack Trilaser.', null),
  ('pat-josefa', 'Josefa Lagos', '+56 9 7310 8842', 'josefa.lagos@gmail.com', 'Telefono', array['VIP', 'Cumpleanos'], 'Candidata a gift card.', '2026-06-23'),
  ('pat-victoria', 'Victoria Alvarez', '+56 9 9901 2200', 'victoria.alvarez@gmail.com', 'Instagram', array['VIP', 'Inactiva', 'Cumpleanos'], 'Reactivar con beneficio VIP.', '2026-03-01'),
  ('pat-maite', 'Maite Silva', '+56 9 6871 3300', 'maite.silva@gmail.com', 'Formulario web', array['Nueva'], 'Enviar cuidados post limpieza.', '2026-07-05')
on conflict (id) do update set
  name = excluded.name,
  phone = excluded.phone,
  email = excluded.email,
  origin = excluded.origin,
  segments = excluded.segments,
  notes = excluded.notes,
  last_visit = excluded.last_visit;

insert into treatment_plans (id, patient_id, treatment_id, purchased_sessions, completed_sessions, status, next_action) values
  ('plan-marcela', 'pat-marcela', 'trt-trilaser', 6, 2, 'active', 'Agendar sesion 3 de 6 en 30 dias'),
  ('plan-camila', 'pat-camila', 'trt-hifu', 3, 1, 'active', 'Control post HIFU en 45 dias'),
  ('plan-fernanda', 'pat-fernanda', 'trt-crio', 4, 1, 'paused', 'Reactivar protocolo corporal'),
  ('plan-rocio', 'pat-rocio', 'trt-peeling', 4, 1, 'active', 'Control de luminosidad en 21 dias'),
  ('plan-josefa', 'pat-josefa', 'trt-limpieza', 1, 1, 'completed', 'Enviar gift card por fidelidad')
on conflict (id) do update set
  patient_id = excluded.patient_id,
  treatment_id = excluded.treatment_id,
  purchased_sessions = excluded.purchased_sessions,
  completed_sessions = excluded.completed_sessions,
  status = excluded.status,
  next_action = excluded.next_action;

insert into appointments (id, patient_id, treatment_id, treatment_plan_id, professional_id, resource_id, appointment_date, appointment_time, status, payment_status, note) values
  ('apt-1', 'pat-marcela', 'trt-trilaser', 'plan-marcela', 'pro-javiera', 'res-trilaser', '2026-07-07', '09:00', 'confirmed', 'pending', 'Sesion 3 sugerida'),
  ('apt-2', 'pat-camila', 'trt-hifu', 'plan-camila', 'pro-camila', 'res-hifu', '2026-07-07', '10:00', 'paid', 'paid', 'Abono registrado'),
  ('apt-3', 'pat-rocio', 'trt-peeling', 'plan-rocio', 'pro-natalia', 'res-facial', '2026-07-09', '11:00', 'confirmed', 'pending', 'Control facial'),
  ('apt-4', 'pat-josefa', 'trt-limpieza', 'plan-josefa', 'pro-natalia', 'res-facial', '2026-07-10', '13:00', 'attended', 'paid', 'Atencion realizada')
on conflict (id) do update set
  patient_id = excluded.patient_id,
  treatment_id = excluded.treatment_id,
  treatment_plan_id = excluded.treatment_plan_id,
  professional_id = excluded.professional_id,
  resource_id = excluded.resource_id,
  appointment_date = excluded.appointment_date,
  appointment_time = excluded.appointment_time,
  status = excluded.status,
  payment_status = excluded.payment_status,
  note = excluded.note;

insert into clinical_history (id, patient_id, appointment_id, treatment_plan_id, treatment_id, professional_id, history_date, note, is_session_entry) values
  ('his-1', 'pat-marcela', null, 'plan-marcela', 'trt-trilaser', 'pro-javiera', '2026-06-11', 'Sesion 1 de Trilaser. Buena tolerancia.', true),
  ('his-2', 'pat-marcela', null, 'plan-marcela', 'trt-trilaser', 'pro-javiera', '2026-06-25', 'Sesion 2 de Trilaser. Sin reaccion inmediata.', true),
  ('his-3', 'pat-camila', null, 'plan-camila', 'trt-hifu', 'pro-camila', '2026-06-10', 'HIFU facial tercio inferior. Se indica fotoproteccion.', true)
on conflict (id) do update set
  patient_id = excluded.patient_id,
  appointment_id = excluded.appointment_id,
  treatment_plan_id = excluded.treatment_plan_id,
  treatment_id = excluded.treatment_id,
  professional_id = excluded.professional_id,
  history_date = excluded.history_date,
  note = excluded.note,
  is_session_entry = excluded.is_session_entry;

insert into appointment_requests (id, patient_id, treatment_id, professional_id, requested_date, requested_time, source, status, follow_up_date, note) values
  ('req-1', 'pat-antonia', 'trt-trilaser', 'pro-javiera', '2026-07-08', '12:00', 'Instagram', 'Pendiente de pago', '2026-07-09', 'Cotizar sesiones y reservar evaluacion.'),
  ('req-2', 'pat-fernanda', 'trt-crio', 'pro-javiera', '2026-07-11', '10:00', 'WhatsApp', 'Contactada', '2026-07-13', 'Retomar protocolo corporal.')
on conflict (id) do update set
  patient_id = excluded.patient_id,
  treatment_id = excluded.treatment_id,
  professional_id = excluded.professional_id,
  requested_date = excluded.requested_date,
  requested_time = excluded.requested_time,
  source = excluded.source,
  status = excluded.status,
  follow_up_date = excluded.follow_up_date,
  note = excluded.note;

insert into payments (id, appointment_id, patient_id, amount, method, status, created_at) values
  ('pay-1', 'apt-2', 'pat-camila', 30000, 'Link de pago', 'paid', '2026-07-05'),
  ('pay-2', 'apt-4', 'pat-josefa', 18000, 'Manual', 'paid', '2026-07-10')
on conflict (id) do update set
  appointment_id = excluded.appointment_id,
  patient_id = excluded.patient_id,
  amount = excluded.amount,
  method = excluded.method,
  status = excluded.status;
