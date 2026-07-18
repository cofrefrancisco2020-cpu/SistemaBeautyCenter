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
  occupancy: "resource_occupancy",
};

const clone = (value) => JSON.parse(JSON.stringify(value));

const stripUndefined = (payload) =>
  Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined));

export const createSupabaseAdapter = ({ supabase }) => {
  if (!supabase) {
    throw new Error("Supabase client is required to create the Supabase adapter.");
  }

  let persistedState = null;
  let saveQueue = Promise.resolve();

  const collections = [
    { key: "professionals", table: supabaseTables.professionals, fromDb: fromDbProfessional, toDb: toDbProfessional },
    { key: "users", table: supabaseTables.users, fromDb: fromDbUser, toDb: toDbUser },
    { key: "resources", table: supabaseTables.resources, fromDb: fromDbResource, toDb: toDbResource },
    { key: "treatments", table: supabaseTables.treatments, fromDb: fromDbTreatment, toDb: toDbTreatment },
    { key: "patients", table: supabaseTables.patients, fromDb: fromDbPatient, toDb: toDbPatient },
    { key: "plans", table: supabaseTables.plans, fromDb: fromDbPlan, toDb: toDbPlan },
    { key: "appointments", table: supabaseTables.appointments, fromDb: fromDbAppointment, toDb: toDbAppointment },
    { key: "histories", table: supabaseTables.histories, fromDb: fromDbHistory, toDb: toDbHistory },
    { key: "requests", table: supabaseTables.requests, fromDb: fromDbRequest, toDb: toDbRequest },
    { key: "payments", table: supabaseTables.payments, fromDb: fromDbPayment, toDb: toDbPayment },
  ];

  return {
    name: "supabase",

    async signIn(email, password) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    },

    async signOut() {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },

    async load() {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      const sessionUserId = sessionData.session?.user?.id ?? "";
      if (!sessionUserId) {
        persistedState = null;
        return emptyState();
      }

      const [results, occupancyRows] = await Promise.all([
        Promise.all(collections.map((collection) => selectAll(supabase, collection.table))),
        selectOptional(supabase, supabaseTables.occupancy),
      ]);
      const loaded = Object.fromEntries(
        collections.map((collection, index) => [
          collection.key,
          results[index].map(collection.fromDb),
        ])
      );
      const currentUserId = loaded.users.find((user) => user.authUserId === sessionUserId)?.id ?? "";
      const state = {
        ...emptyState(),
        ...loaded,
        resourceOccupancy: occupancyRows.map(fromDbResourceOccupancy),
        currentUserId,
        selectedPatientId: loaded.patients[0]?.id ?? "",
      };

      persistedState = clone(state);
      return state;
    },

    save(state) {
      const snapshot = clone(state);
      const persistSnapshot = async () => {
        if (!persistedState) return;

        const previous = persistedState;
        for (const collection of collections) {
          const currentItems = snapshot[collection.key] ?? [];
          const previousItems = previous[collection.key] ?? [];
          const changedItems = currentItems.filter((item) => {
            const oldItem = previousItems.find((candidate) => candidate.id === item.id);
            return JSON.stringify(item) !== JSON.stringify(oldItem);
          });
          await upsertMany(supabase, collection.table, changedItems.map(collection.toDb));
        }

        for (const collection of [...collections].reverse()) {
          const currentIds = new Set((snapshot[collection.key] ?? []).map((item) => item.id));
          const removedIds = (previous[collection.key] ?? [])
            .filter((item) => !currentIds.has(item.id))
            .map((item) => item.id);
          await deleteMany(supabase, collection.table, removedIds);
        }

        persistedState = snapshot;
      };

      saveQueue = saveQueue.then(persistSnapshot, persistSnapshot);
      return saveQueue;
    },

    async upsertAccess(access) {
      const { data, error } = await supabase.functions.invoke("admin-upsert-user", {
        body: access,
      });
      if (error) {
        const message = await functionErrorMessage(error);
        throw new Error(message);
      }
      return data;
    },

    async deletePatient(patientId) {
      const { error } = await supabase.rpc("delete_patient_cascade", {
        target_patient_id: patientId,
      });
      if (error) throw error;
      persistedState = null;
    },

    exportSnapshot(state) {
      return JSON.stringify(state, null, 2);
    },
  };
};

const emptyState = () => ({
  currentUserId: "",
  activeView: "dashboard",
  selectedPatientId: "",
  selectedSegment: "all",
  users: [],
  professionals: [],
  patients: [],
  treatments: [],
  resources: [],
  plans: [],
  appointments: [],
  histories: [],
  requests: [],
  payments: [],
  resourceOccupancy: [],
});

const selectAll = async (supabase, table) => {
  const { data, error } = await supabase.from(table).select("*");
  if (error) throw error;
  return data ?? [];
};

const selectOptional = async (supabase, table) => {
  const { data, error } = await supabase.from(table).select("*");
  if (error) {
    console.warn(`No se pudo cargar ${table}.`, error.message);
    return [];
  }
  return data ?? [];
};

const upsertMany = async (supabase, table, payloads) => {
  const cleanPayloads = payloads.map(stripUndefined).filter((payload) => payload.id);
  if (!cleanPayloads.length) return;
  const { error } = await supabase.from(table).upsert(cleanPayloads);
  if (error) throw error;
};

const deleteMany = async (supabase, table, ids) => {
  if (!ids.length) return;
  const { error } = await supabase.from(table).delete().in("id", ids);
  if (error) throw error;
};

const functionErrorMessage = async (error) => {
  try {
    const payload = await error.context?.json?.();
    if (payload?.error) return payload.error;
  } catch {
    // The function can fail before returning JSON.
  }
  return error.message || "No se pudo ejecutar la funcion segura.";
};

const fromDbUser = (user) => ({
  id: user.id,
  authUserId: user.auth_user_id,
  name: user.name,
  email: user.email,
  password: "",
  role: user.role,
  professionalId: user.professional_id ?? "",
  image: user.image ?? "",
  active: user.active !== false,
});

const toDbUser = (user) => ({
  id: user.id,
  auth_user_id: user.authUserId || undefined,
  name: user.name,
  email: user.email,
  role: user.role,
  professional_id: user.professionalId || null,
  image: user.image || null,
  active: user.active !== false,
});

const fromDbProfessional = (professional) => ({
  id: professional.id,
  name: professional.name,
  role: professional.role,
  email: professional.email ?? "",
  phone: professional.phone ?? "",
  image: professional.image ?? "",
  active: professional.active !== false,
});

const toDbProfessional = (professional) => ({
  id: professional.id,
  name: professional.name,
  role: professional.role,
  email: professional.email || null,
  phone: professional.phone || null,
  image: professional.image || null,
  active: professional.active !== false,
});

const fromDbPatient = (patient) => ({
  id: patient.id,
  name: patient.name,
  phone: patient.phone,
  email: patient.email ?? "",
  origin: patient.origin ?? "",
  segments: patient.segments ?? [],
  notes: patient.notes ?? "",
  lastVisit: patient.last_visit ?? "",
});

const toDbPatient = (patient) => ({
  id: patient.id,
  name: patient.name,
  phone: patient.phone,
  email: patient.email || null,
  origin: patient.origin || null,
  segments: patient.segments ?? [],
  notes: patient.notes || null,
  last_visit: patient.lastVisit || null,
});

const fromDbResource = (resource) => ({
  id: resource.id,
  name: resource.name,
  type: resource.type ?? "Equipo",
  active: resource.active !== false,
});

const toDbResource = (resource) => ({
  id: resource.id,
  name: resource.name,
  type: resource.type || "Equipo",
  active: resource.active !== false,
});

const fromDbTreatment = (treatment) => ({
  id: treatment.id,
  name: treatment.name,
  price: treatment.price ?? 0,
  defaultSessions: treatment.default_sessions ?? 1,
  resourceId: treatment.resource_id ?? "res-none",
  active: treatment.active !== false,
});

const toDbTreatment = (treatment) => ({
  id: treatment.id,
  name: treatment.name,
  price: treatment.price ?? 0,
  default_sessions: treatment.defaultSessions ?? 1,
  resource_id: treatment.resourceId || null,
  active: treatment.active !== false,
});

const fromDbPlan = (plan) => ({
  id: plan.id,
  patientId: plan.patient_id,
  treatmentId: plan.treatment_id,
  purchasedSessions: plan.purchased_sessions,
  completedSessions: plan.completed_sessions,
  status: plan.status,
  nextAction: plan.next_action ?? "",
  treatmentAreas: plan.treatment_areas ?? "",
  clinicalConsiderations: plan.clinical_considerations ?? "",
});

const toDbPlan = (plan) => ({
  id: plan.id,
  patient_id: plan.patientId,
  treatment_id: plan.treatmentId,
  purchased_sessions: plan.purchasedSessions,
  completed_sessions: plan.completedSessions,
  status: plan.status,
  next_action: plan.nextAction || null,
  treatment_areas: plan.treatmentAreas || null,
  clinical_considerations: plan.clinicalConsiderations || null,
});

const fromDbAppointment = (appointment) => ({
  id: appointment.id,
  patientId: appointment.patient_id,
  treatmentId: appointment.treatment_id,
  planId: appointment.treatment_plan_id ?? "",
  professionalId: appointment.professional_id,
  resourceId: appointment.resource_id ?? "res-none",
  date: appointment.appointment_date,
  time: appointment.appointment_time?.slice(0, 5),
  endTime: appointment.appointment_end_time?.slice(0, 5) ?? "",
  status: appointment.status,
  paymentStatus: appointment.payment_status,
  note: appointment.note ?? "",
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
  appointment_end_time: appointment.endTime,
  status: appointment.status,
  payment_status: appointment.paymentStatus,
  note: appointment.note || null,
});

const fromDbResourceOccupancy = (booking) => ({
  id: "",
  professionalId: booking.professional_id,
  resourceId: booking.resource_id,
  date: booking.appointment_date,
  time: booking.appointment_time?.slice(0, 5),
  endTime: booking.appointment_end_time?.slice(0, 5) ?? "",
  status: booking.status,
});

const fromDbHistory = (history) => ({
  id: history.id,
  patientId: history.patient_id,
  appointmentId: history.appointment_id ?? "",
  planId: history.treatment_plan_id ?? "",
  treatmentId: history.treatment_id ?? "",
  professionalId: history.professional_id ?? "",
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
  patientId: request.patient_id ?? "",
  treatmentId: request.treatment_id ?? "",
  professionalId: request.professional_id ?? "",
  date: request.requested_date ?? "",
  time: request.requested_time?.slice(0, 5) ?? "",
  source: request.source ?? "",
  status: request.status,
  followUpDate: request.follow_up_date ?? "",
  note: request.note ?? "",
});

const toDbRequest = (request) => ({
  id: request.id,
  patient_id: request.patientId || null,
  treatment_id: request.treatmentId || null,
  professional_id: request.professionalId || null,
  requested_date: request.date || null,
  requested_time: request.time || null,
  source: request.source || null,
  status: request.status,
  follow_up_date: request.followUpDate || null,
  note: request.note || null,
});

const fromDbPayment = (payment) => ({
  id: payment.id,
  appointmentId: payment.appointment_id,
  patientId: payment.patient_id,
  amount: payment.amount,
  method: payment.method,
  provider: payment.provider ?? "",
  providerPaymentId: payment.provider_payment_id ?? "",
  status: payment.status,
  createdAt: payment.created_at?.slice(0, 10) ?? "",
});

const toDbPayment = (payment) => ({
  id: payment.id,
  appointment_id: payment.appointmentId,
  patient_id: payment.patientId,
  amount: payment.amount,
  method: payment.method,
  provider: payment.provider || null,
  provider_payment_id: payment.providerPaymentId || null,
  status: payment.status,
});
