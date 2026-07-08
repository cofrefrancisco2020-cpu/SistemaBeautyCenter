export const supabaseTables = {
  users: "app_users",
  professionals: "professionals",
  patients: "patients",
  treatments: "treatments",
  resources: "resources",
  plans: "treatment_plans",
  appointments: "appointments",
  histories: "clinical_history",
  requests: "appointment_requests",
  payments: "payments",
  communications: "communications",
};

export const createSupabaseAdapter = ({ supabase }) => {
  if (!supabase) {
    throw new Error("Supabase client is required to create the Supabase adapter.");
  }

  return {
    name: "supabase",

    async load() {
      const [
        users,
        professionals,
        patients,
        treatments,
        resources,
        plans,
        appointments,
        histories,
        requests,
        payments,
      ] = await Promise.all([
        selectAll(supabase, supabaseTables.users),
        selectAll(supabase, supabaseTables.professionals),
        selectAll(supabase, supabaseTables.patients),
        selectAll(supabase, supabaseTables.treatments),
        selectAll(supabase, supabaseTables.resources),
        selectAll(supabase, supabaseTables.plans),
        selectAll(supabase, supabaseTables.appointments),
        selectAll(supabase, supabaseTables.histories),
        selectAll(supabase, supabaseTables.requests),
        selectAll(supabase, supabaseTables.payments),
      ]);

      return {
        currentUserId: "",
        activeView: "dashboard",
        selectedPatientId: patients[0]?.id ?? "",
        selectedSegment: "all",
        users,
        professionals,
        patients,
        treatments,
        resources,
        plans: plans.map(fromDbPlan),
        appointments: appointments.map(fromDbAppointment),
        histories: histories.map(fromDbHistory),
        requests: requests.map(fromDbRequest),
        payments,
      };
    },

    async save() {
      throw new Error("Use targeted Supabase operations instead of saving the full state object.");
    },

    async upsertPatient(patient) {
      return upsertOne(supabase, supabaseTables.patients, patient);
    },

    async upsertPlan(plan) {
      return upsertOne(supabase, supabaseTables.plans, toDbPlan(plan));
    },

    async upsertAppointment(appointment) {
      return upsertOne(supabase, supabaseTables.appointments, toDbAppointment(appointment));
    },

    async insertHistory(history) {
      return insertOne(supabase, supabaseTables.histories, toDbHistory(history));
    },

    async insertRequest(request) {
      return insertOne(supabase, supabaseTables.requests, toDbRequest(request));
    },

    async insertPayment(payment) {
      return insertOne(supabase, supabaseTables.payments, payment);
    },
  };
};

const selectAll = async (supabase, table) => {
  const { data, error } = await supabase.from(table).select("*");
  if (error) throw error;
  return data ?? [];
};

const upsertOne = async (supabase, table, payload) => {
  const { data, error } = await supabase.from(table).upsert(payload).select().single();
  if (error) throw error;
  return data;
};

const insertOne = async (supabase, table, payload) => {
  const { data, error } = await supabase.from(table).insert(payload).select().single();
  if (error) throw error;
  return data;
};

const fromDbPlan = (plan) => ({
  id: plan.id,
  patientId: plan.patient_id,
  treatmentId: plan.treatment_id,
  purchasedSessions: plan.purchased_sessions,
  completedSessions: plan.completed_sessions,
  status: plan.status,
  nextAction: plan.next_action,
});

const toDbPlan = (plan) => ({
  id: plan.id,
  patient_id: plan.patientId,
  treatment_id: plan.treatmentId,
  purchased_sessions: plan.purchasedSessions,
  completed_sessions: plan.completedSessions,
  status: plan.status,
  next_action: plan.nextAction,
});

const fromDbAppointment = (appointment) => ({
  id: appointment.id,
  patientId: appointment.patient_id,
  treatmentId: appointment.treatment_id,
  planId: appointment.treatment_plan_id,
  professionalId: appointment.professional_id,
  resourceId: appointment.resource_id,
  date: appointment.appointment_date,
  time: appointment.appointment_time?.slice(0, 5),
  status: appointment.status,
  paymentStatus: appointment.payment_status,
  note: appointment.note,
});

const toDbAppointment = (appointment) => ({
  id: appointment.id,
  patient_id: appointment.patientId,
  treatment_id: appointment.treatmentId,
  treatment_plan_id: appointment.planId || null,
  professional_id: appointment.professionalId,
  resource_id: appointment.resourceId || null,
  appointment_date: appointment.date,
  appointment_time: appointment.time,
  status: appointment.status,
  payment_status: appointment.paymentStatus,
  note: appointment.note,
});

const fromDbHistory = (history) => ({
  id: history.id,
  patientId: history.patient_id,
  appointmentId: history.appointment_id,
  planId: history.treatment_plan_id,
  treatmentId: history.treatment_id,
  professionalId: history.professional_id,
  date: history.history_date,
  note: history.note,
  sessionEntry: history.is_session_entry,
});

const toDbHistory = (history) => ({
  id: history.id,
  patient_id: history.patientId,
  appointment_id: history.appointmentId || null,
  treatment_plan_id: history.planId || null,
  treatment_id: history.treatmentId || null,
  professional_id: history.professionalId || null,
  history_date: history.date,
  note: history.note,
  is_session_entry: Boolean(history.sessionEntry),
});

const fromDbRequest = (request) => ({
  id: request.id,
  patientId: request.patient_id,
  treatmentId: request.treatment_id,
  professionalId: request.professional_id,
  date: request.requested_date,
  time: request.requested_time?.slice(0, 5),
  source: request.source,
  status: request.status,
  followUpDate: request.follow_up_date,
  note: request.note,
});

const toDbRequest = (request) => ({
  id: request.id,
  patient_id: request.patientId || null,
  treatment_id: request.treatmentId || null,
  professional_id: request.professionalId || null,
  requested_date: request.date || null,
  requested_time: request.time || null,
  source: request.source,
  status: request.status,
  follow_up_date: request.followUpDate || null,
  note: request.note,
});
