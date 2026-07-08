import { createLocalStorageAdapter } from "./adapters/localStorageAdapter.js";

const STORAGE_KEY = "beauty-center-entrega-real-v2";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const uid = (prefix) => `${prefix}-${crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`}`;

const today = "2026-07-07";
const timeSlots = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
];

const statusLabels = {
  requested: "Solicitada",
  confirmed: "Confirmada",
  rescheduled: "Reagendada",
  paid: "Pagada",
  attended: "Atendida",
  cancelled: "Cancelada",
};

const requestStatuses = ["Pendiente de pago", "Contactada", "No respondió", "Seguimiento pendiente", "Agendada", "Perdida"];
const defaultCrmFilters = {
  treatmentId: "all",
  recency: "all",
  professionalId: "all",
  status: "all",
  sort: "recent",
};

const viewCopy = {
  dashboard: {
    eyebrow: "Panel principal",
    title: "Resumen clínico/comercial",
    copy: "Agenda, CRM, solicitudes e historial conectados por paciente.",
  },
  agenda: {
    eyebrow: "Agenda",
    title: "Agenda vinculada al CRM",
    copy: "Horas asociadas a paciente, tratamiento, profesional, recurso y estado.",
  },
  pacientes: {
    eyebrow: "CRM pacientes",
    title: "CRM clínico/comercial",
    copy: "Ficha 360, historial, planes, sesiones, fidelización y acciones manuales.",
  },
  solicitudes: {
    eyebrow: "Recepción",
    title: "Solicitudes vinculadas",
    copy: "Las solicitudes pueden conectarse a pacientes existentes o crear pacientes nuevos.",
  },
  configuracion: {
    eyebrow: "Administración",
    title: "Usuarios, recursos y tratamientos",
    copy: "Configuración de accesos, profesionales, boxes, equipos y servicios de agenda.",
  },
};

const baseAdminAccess = {
  id: "user-admin",
  name: "Administración",
  email: "admin@beautycenter.cl",
  password: "admin123",
  role: "admin",
  professionalId: "",
  image: "./assets/logo-beauty-center.jpg",
  active: true,
};

const seed = {
  currentUserId: "",
  activeView: "dashboard",
  agendaDate: today,
  selectedPatientId: "pat-marcela",
  selectedSegment: "all",
  crmFilters: { ...defaultCrmFilters },
  users: [
    baseAdminAccess,
    { id: "user-javiera", name: "Javiera", email: "javiera@beautycenter.cl", password: "javiera123", role: "professional", professionalId: "pro-javiera", active: true },
    { id: "user-camila", name: "Dra. Camila", email: "camila@beautycenter.cl", password: "camila123", role: "professional", professionalId: "pro-camila", active: true },
    { id: "user-natalia", name: "Natalia", email: "natalia@beautycenter.cl", password: "natalia123", role: "professional", professionalId: "pro-natalia", active: true },
  ],
  professionals: [
    { id: "pro-javiera", name: "Javiera", role: "Estética y evaluación", image: "./assets/e42d2a33a56741a3.jpg" },
    { id: "pro-camila", name: "Dra. Camila", role: "HIFU y tratamientos faciales", image: "./assets/606c138e37c509c1.jpg" },
    { id: "pro-natalia", name: "Natalia", role: "Bienestar, sauna y masajes", image: "./assets/76ec89dc7a4bbe69.jpg" },
  ],
  resources: [
    { id: "res-trilaser", name: "Máquina Trilaser" },
    { id: "res-hifu", name: "HIFU 12D" },
    { id: "res-facial", name: "Box facial" },
    { id: "res-corporal", name: "Box corporal" },
    { id: "res-sauna", name: "Sauna" },
    { id: "res-none", name: "Sin recurso" },
  ],
  treatments: [
    { id: "trt-trilaser", name: "Depilación Trilaser", price: 15000, defaultSessions: 6, resourceId: "res-trilaser" },
    { id: "trt-hifu", name: "HIFU 12D facial", price: 30000, defaultSessions: 3, resourceId: "res-hifu" },
    { id: "trt-crio", name: "Criolipólisis", price: 25000, defaultSessions: 4, resourceId: "res-corporal" },
    { id: "trt-peeling", name: "Hollywood Peeling", price: 20000, defaultSessions: 4, resourceId: "res-facial" },
    { id: "trt-sauna", name: "Sauna + masaje", price: 18000, defaultSessions: 1, resourceId: "res-sauna" },
    { id: "trt-limpieza", name: "Limpieza facial", price: 18000, defaultSessions: 1, resourceId: "res-facial" },
    { id: "trt-evaluacion", name: "Evaluación corporal", price: 10000, defaultSessions: 1, resourceId: "res-none" },
  ],
  patients: [
    { id: "pat-marcela", name: "Marcela Rojas", phone: "+56 9 8421 3312", email: "marcela.rojas@gmail.com", origin: "Formulario web", segments: ["VIP", "Tratamiento incompleto", "Oportunidad"], notes: "Prefiere atención AM. Buena tolerancia a Trilaser.", lastVisit: "2026-06-25" },
    { id: "pat-camila", name: "Camila Paz", phone: "+56 9 6112 9044", email: "camila.paz@gmail.com", origin: "WhatsApp", segments: ["VIP", "Control próximo"], notes: "Quiere seguimiento facial no invasivo.", lastVisit: "2026-06-10" },
    { id: "pat-fernanda", name: "Fernanda Soto", phone: "+56 9 7331 2208", email: "fernanda.soto@gmail.com", origin: "Instagram", segments: ["Inactiva", "Tratamiento incompleto", "Oportunidad"], notes: "Reactivar protocolo corporal.", lastVisit: "2026-05-03" },
    { id: "pat-rocio", name: "Rocío Gatica", phone: "+56 9 5520 1187", email: "rocio.gatica@gmail.com", origin: "Formulario web", segments: ["Nueva", "Control próximo"], notes: "Piel grasa con tendencia acneica.", lastVisit: "2026-07-01" },
    { id: "pat-antonia", name: "Antonia Vargas", phone: "+56 9 7214 9102", email: "antonia.vargas@gmail.com", origin: "Instagram", segments: ["Nueva"], notes: "Interesada en pack Trilaser.", lastVisit: "" },
    { id: "pat-josefa", name: "Josefa Lagos", phone: "+56 9 7310 8842", email: "josefa.lagos@gmail.com", origin: "Teléfono", segments: ["VIP", "Cumpleaños"], notes: "Candidata a gift card.", lastVisit: "2026-06-23" },
    { id: "pat-victoria", name: "Victoria Álvarez", phone: "+56 9 9901 2200", email: "victoria.alvarez@gmail.com", origin: "Instagram", segments: ["VIP", "Inactiva", "Cumpleaños"], notes: "Reactivar con beneficio VIP.", lastVisit: "2026-03-01" },
    { id: "pat-maite", name: "Maite Silva", phone: "+56 9 6871 3300", email: "maite.silva@gmail.com", origin: "Formulario web", segments: ["Nueva"], notes: "Enviar cuidados post limpieza.", lastVisit: "2026-07-05" },
  ],
  plans: [
    { id: "plan-marcela", patientId: "pat-marcela", treatmentId: "trt-trilaser", purchasedSessions: 6, completedSessions: 2, status: "active", nextAction: "Agendar sesión 3 de 6 en 30 días" },
    { id: "plan-camila", patientId: "pat-camila", treatmentId: "trt-hifu", purchasedSessions: 3, completedSessions: 1, status: "active", nextAction: "Control post HIFU en 45 días" },
    { id: "plan-fernanda", patientId: "pat-fernanda", treatmentId: "trt-crio", purchasedSessions: 4, completedSessions: 1, status: "paused", nextAction: "Reactivar protocolo corporal" },
    { id: "plan-rocio", patientId: "pat-rocio", treatmentId: "trt-peeling", purchasedSessions: 4, completedSessions: 1, status: "active", nextAction: "Control de luminosidad en 21 días" },
    { id: "plan-josefa", patientId: "pat-josefa", treatmentId: "trt-limpieza", purchasedSessions: 1, completedSessions: 1, status: "completed", nextAction: "Enviar gift card por fidelidad" },
  ],
  appointments: [
    { id: "apt-1", patientId: "pat-marcela", treatmentId: "trt-trilaser", planId: "plan-marcela", professionalId: "pro-javiera", resourceId: "res-trilaser", date: "2026-07-07", time: "09:00", status: "confirmed", paymentStatus: "pending", note: "Sesión 3 sugerida" },
    { id: "apt-2", patientId: "pat-camila", treatmentId: "trt-hifu", planId: "plan-camila", professionalId: "pro-camila", resourceId: "res-hifu", date: "2026-07-07", time: "10:00", status: "paid", paymentStatus: "paid", note: "Abono registrado" },
    { id: "apt-3", patientId: "pat-rocio", treatmentId: "trt-peeling", planId: "plan-rocio", professionalId: "pro-natalia", resourceId: "res-facial", date: "2026-07-09", time: "11:00", status: "confirmed", paymentStatus: "pending", note: "Control facial" },
    { id: "apt-4", patientId: "pat-josefa", treatmentId: "trt-limpieza", planId: "plan-josefa", professionalId: "pro-natalia", resourceId: "res-facial", date: "2026-07-10", time: "13:00", status: "attended", paymentStatus: "paid", note: "Atención realizada" },
  ],
  histories: [
    { id: "his-1", patientId: "pat-marcela", appointmentId: "apt-old-1", treatmentId: "trt-trilaser", professionalId: "pro-javiera", date: "2026-06-11", note: "Sesión 1 de Trilaser. Buena tolerancia." },
    { id: "his-2", patientId: "pat-marcela", appointmentId: "apt-old-2", treatmentId: "trt-trilaser", professionalId: "pro-javiera", date: "2026-06-25", note: "Sesión 2 de Trilaser. Sin reacción inmediata." },
    { id: "his-3", patientId: "pat-camila", appointmentId: "apt-old-3", treatmentId: "trt-hifu", professionalId: "pro-camila", date: "2026-06-10", note: "HIFU facial tercio inferior. Se indica fotoprotección." },
  ],
  requests: [
    { id: "req-1", patientId: "pat-antonia", treatmentId: "trt-trilaser", professionalId: "pro-javiera", date: "2026-07-08", time: "12:00", source: "Instagram", status: "Pendiente de pago", followUpDate: "2026-07-09", note: "Cotizar sesiones y reservar evaluación." },
    { id: "req-2", patientId: "pat-fernanda", treatmentId: "trt-crio", professionalId: "pro-javiera", date: "2026-07-11", time: "10:00", source: "WhatsApp", status: "Contactada", followUpDate: "2026-07-13", note: "Retomar protocolo corporal." },
  ],
  payments: [
    { id: "pay-1", appointmentId: "apt-2", patientId: "pat-camila", amount: 30000, method: "Link de pago", status: "paid", createdAt: "2026-07-05" },
    { id: "pay-2", appointmentId: "apt-4", patientId: "pat-josefa", amount: 18000, method: "Manual", status: "paid", createdAt: "2026-07-10" },
  ],
};

const dataAdapter = createLocalStorageAdapter({ storageKey: STORAGE_KEY, seed });

let state = normalizeState(loadState());
let pendingRequestId = "";
let welcomeGateOpen = false;
dataAdapter.save(state);

const loginScreen = $("[data-login-screen]");
const welcomeScreen = $("[data-welcome-screen]");
const welcomeTitle = $("[data-welcome-title]");
const welcomeCopy = $("[data-welcome-copy]");
const welcomeCoverStats = $("[data-welcome-cover-stats]");
const welcomeImage = $("[data-welcome-image]");
const appShell = $("[data-app-shell]");
const loginForm = $("[data-login-form]");
const loginError = $("[data-login-error]");
const app = $("#app");
const navButtons = $$(".side-nav button");
const viewTitle = $("[data-view-title]");
const viewEyebrow = $("[data-view-eyebrow]");
const viewCopyEl = $("[data-view-copy]");
const searchInput = $("[data-search]");
const userCard = $("[data-user-card]");
const appointmentModal = $("[data-appointment-modal]");
const appointmentForm = $("[data-appointment-form]");
const patientModal = $("[data-patient-modal]");
const patientForm = $("[data-patient-form]");
const planModal = $("[data-plan-modal]");
const planForm = $("[data-plan-form]");
const sessionModal = $("[data-session-modal]");
const sessionForm = $("[data-session-form]");
const historyModal = $("[data-history-modal]");
const historyForm = $("[data-history-form]");
const requestModal = $("[data-request-modal]");
const requestForm = $("[data-request-form]");
const toastEl = $("[data-toast]");

function loadState() {
  return dataAdapter.load();
}

function normalizeState(rawState) {
  const next = { ...seed, ...rawState };
  next.crmFilters = { ...defaultCrmFilters, ...(rawState.crmFilters ?? {}) };
  next.users = (rawState.users?.length ? rawState.users : seed.users.map((user) => ({ ...user }))).map((user) => ({
    ...user,
    image: user.image || "",
  }));
  next.professionals = rawState.professionals?.length ? rawState.professionals : seed.professionals.map((professional) => ({ ...professional }));
  next.resources = (rawState.resources?.length ? rawState.resources : seed.resources).map((resource) => ({
    ...resource,
    type: resource.type || inferResourceType(resource.name),
    active: resource.active !== false,
  }));
  next.treatments = (rawState.treatments?.length ? rawState.treatments : seed.treatments).map((treatment) => ({
    ...treatment,
    price: Number(treatment.price ?? 0),
    defaultSessions: Number(treatment.defaultSessions ?? 1),
    resourceId: treatment.resourceId || "res-none",
    active: treatment.active !== false,
  }));
  next.histories = (rawState.histories?.length ? rawState.histories : seed.histories).map((history) => {
    const migrated = { ...history };
    const looksManualSession = /sesión registrada manualmente/i.test(migrated.note ?? "");
    if (!migrated.planId && looksManualSession) {
      const plan = (rawState.plans ?? seed.plans).find((item) => item.patientId === migrated.patientId && item.treatmentId === migrated.treatmentId);
      if (plan) migrated.planId = plan.id;
    }
    if (migrated.planId && looksManualSession) migrated.sessionEntry = true;
    return migrated;
  });
  next.requests = (rawState.requests?.length ? rawState.requests : seed.requests).map((request) => ({
    ...request,
    status: request.status || "Pendiente de pago",
    followUpDate: request.followUpDate || request.follow_up_date || addDays(request.date || today, 2),
  }));
  seed.users.forEach((defaultUser) => {
    const index = next.users.findIndex((user) => user.id === defaultUser.id);
    if (index < 0) {
      next.users.push({ ...defaultUser });
      return;
    }
    if (defaultUser.id === "user-admin") {
      next.users[index] = { ...next.users[index], ...defaultUser, image: next.users[index].image || defaultUser.image };
    }
  });
  next.currentUserId = next.users.some((user) => user.id === rawState.currentUserId) ? rawState.currentUserId : "";
  next.agendaDate = rawState.agendaDate || today;
  return next;
}

function ensureBaseAdmin() {
  const index = state.users.findIndex((user) => user.id === baseAdminAccess.id || normalizeEmail(user.email) === baseAdminAccess.email);
  if (index >= 0) {
    state.users[index] = { ...state.users[index], ...baseAdminAccess, image: state.users[index].image || baseAdminAccess.image };
    return state.users[index];
  }
  state.users.push({ ...baseAdminAccess });
  return state.users[state.users.length - 1];
}

function saveState() {
  dataAdapter.save(state);
}

function normalizeEmail(value = "") {
  return value.trim().toLowerCase();
}

function normalizePassword(value = "") {
  return value.trim();
}

function formatCLP(value) {
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(value);
}

function formatDate(value) {
  if (!value) return "Sin fecha";
  const date = new Date(`${value}T12:00:00`);
  const label = new Intl.DateTimeFormat("es-CL", { weekday: "short", day: "numeric", month: "short" }).format(date);
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function toLocalDate(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day, 12);
}

function toISODate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(value, amount) {
  const date = toLocalDate(value);
  date.setDate(date.getDate() + amount);
  return toISODate(date);
}

function addMonths(value, amount) {
  const date = toLocalDate(value);
  date.setMonth(date.getMonth() + amount);
  return toISODate(date);
}

function startOfWeek(value) {
  const date = toLocalDate(value);
  date.setDate(date.getDate() - date.getDay());
  return toISODate(date);
}

function agendaWeekDays() {
  const start = startOfWeek(state.agendaDate || today);
  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(start, index);
    const localDate = toLocalDate(date);
    return {
      date,
      label: new Intl.DateTimeFormat("es-CL", { weekday: "long" }).format(localDate),
      shortDate: new Intl.DateTimeFormat("es-CL", { day: "numeric", month: "short" }).format(localDate),
    };
  });
}

function agendaWeekLabel(days) {
  const first = toLocalDate(days[0].date);
  const last = toLocalDate(days[days.length - 1].date);
  const month = new Intl.DateTimeFormat("es-CL", { month: "long" }).format(first);
  const lastMonth = new Intl.DateTimeFormat("es-CL", { month: "long" }).format(last);
  const year = last.getFullYear();
  if (first.getMonth() === last.getMonth()) return `Semana del ${first.getDate()} al ${last.getDate()} de ${month} ${year}`;
  return `Semana del ${first.getDate()} de ${month} al ${last.getDate()} de ${lastMonth} ${year}`;
}

function agendaMonthValue() {
  return (state.agendaDate || today).slice(0, 7);
}

function setAgendaDate(value) {
  state.agendaDate = value || today;
  saveState();
  render();
}

function defaultAppointmentDate() {
  return state.activeView === "agenda" ? state.agendaDate || today : today;
}

function countLabel(count, singular, plural) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function byId(collection, id) {
  return state[collection].find((item) => item.id === id);
}

function inferResourceType(name = "") {
  const value = name.toLowerCase();
  if (value.includes("sin recurso")) return "Sin recurso";
  if (value.includes("box")) return "Box";
  if (value.includes("sala") || value.includes("habitaci")) return "Sala";
  if (value.includes("sauna")) return "Sala";
  return "Equipo";
}

function activeItemsWithCurrent(collection, selectedId = "") {
  return state[collection].filter((item) => item.active !== false || item.id === selectedId);
}

function resourceTypeLabel(type = "Equipo") {
  return type || "Equipo";
}

function currentUser() {
  return state.users.find((user) => user.id === state.currentUserId && user.active !== false) ?? null;
}

function currentProfessionalId() {
  return currentUser()?.professionalId ?? "";
}

function isAdmin() {
  return currentUser()?.role === "admin";
}

function userRoleLabel(user = currentUser()) {
  if (!user) return "Sin sesión";
  if (user.role === "admin") return "Administración";
  const professional = byId("professionals", user.professionalId);
  return professional?.role ?? "Profesional";
}

function userImage(user = currentUser()) {
  if (!user) return "./assets/logo-beauty-center.jpg";
  const professional = user.professionalId ? byId("professionals", user.professionalId) : null;
  return professional?.image || user.image || "./assets/logo-beauty-center.jpg";
}

function accessImageForUser(user) {
  const professional = user.professionalId ? byId("professionals", user.professionalId) : null;
  return professional?.image || user.image || "./assets/logo-beauty-center.jpg";
}

function setAccessPreview(src = "./assets/logo-beauty-center.jpg") {
  const preview = $("[data-access-image-preview]");
  const hidden = $("[data-access-image]");
  if (preview) preview.src = src || "./assets/logo-beauty-center.jpg";
  if (hidden) hidden.value = src || "";
}

function professionalScope(items, key = "professionalId") {
  const professionalId = currentProfessionalId();
  return professionalId ? items.filter((item) => item[key] === professionalId) : items;
}

function visiblePatientIdsForProfessional() {
  const professionalId = currentProfessionalId();
  if (!professionalId) return new Set(state.patients.map((patient) => patient.id));
  const ids = new Set();
  state.appointments.forEach((appointment) => {
    if (appointment.professionalId === professionalId) ids.add(appointment.patientId);
  });
  state.histories.forEach((history) => {
    if (history.professionalId === professionalId) ids.add(history.patientId);
  });
  state.requests.forEach((request) => {
    if (request.professionalId === professionalId) ids.add(request.patientId);
  });
  return ids;
}

function visiblePatients() {
  const ids = visiblePatientIdsForProfessional();
  return state.patients.filter((patient) => ids.has(patient.id));
}

function appointmentAmount(appointment) {
  return byId("treatments", appointment.treatmentId)?.price ?? 0;
}

function patientMatchesSearch(patient) {
  const query = searchInput.value.trim().toLowerCase();
  if (!query) return true;
  const clinicalTerms = patientTreatmentEvents(patient.id)
    .map((event) => {
      const treatment = byId("treatments", event.treatmentId);
      const professional = byId("professionals", event.professionalId);
      return `${treatment?.name ?? ""} ${professional?.name ?? ""} ${event.note ?? ""}`;
    })
    .join(" ");
  return [patient.name, patient.phone, patient.email, patient.origin, patient.segments.join(" "), patient.notes, clinicalTerms]
    .join(" ")
    .toLowerCase()
    .includes(query);
}

function patientTreatmentEvents(patientId) {
  const historyEvents = state.histories
    .filter((history) => history.patientId === patientId && history.date <= today)
    .map((history) => ({
      id: history.id,
      patientId: history.patientId,
      treatmentId: history.treatmentId,
      professionalId: history.professionalId,
      date: history.date,
      note: history.note,
      source: "Historial",
    }));
  const historyAppointmentIds = new Set(state.histories.map((history) => history.appointmentId).filter(Boolean));
  const attendedAppointments = state.appointments
    .filter((appointment) => appointment.patientId === patientId && appointment.status === "attended" && appointment.date <= today && !historyAppointmentIds.has(appointment.id))
    .map((appointment) => ({
      id: appointment.id,
      patientId: appointment.patientId,
      treatmentId: appointment.treatmentId,
      professionalId: appointment.professionalId,
      date: appointment.date,
      note: appointment.note,
      source: "Cita atendida",
    }));
  return [...historyEvents, ...attendedAppointments].sort((a, b) => `${b.date}${b.id}`.localeCompare(`${a.date}${a.id}`));
}

function latestPatientEvent(patientId) {
  return patientTreatmentEvents(patientId)[0] ?? null;
}

function crmRecencyStart() {
  const days = Number(state.crmFilters?.recency);
  return Number.isFinite(days) && days > 0 ? addDays(today, -days) : "";
}

function eventMatchesCrmFilters(event) {
  const filters = { ...defaultCrmFilters, ...(state.crmFilters ?? {}) };
  const recencyStart = crmRecencyStart();
  if (filters.treatmentId !== "all" && event.treatmentId !== filters.treatmentId) return false;
  if (filters.professionalId !== "all" && event.professionalId !== filters.professionalId) return false;
  if (recencyStart && event.date < recencyStart) return false;
  return true;
}

function patientMatchesCrmFilters(patient) {
  const filters = { ...defaultCrmFilters, ...(state.crmFilters ?? {}) };
  const events = patientTreatmentEvents(patient.id);
  const matchingEvents = events.filter(eventMatchesCrmFilters);
  const plans = state.plans.filter((plan) => plan.patientId === patient.id);

  if ((filters.treatmentId !== "all" || filters.professionalId !== "all" || filters.recency !== "all") && !matchingEvents.length) return false;
  if (filters.status === "with-history" && !events.length) return false;
  if (filters.status === "no-history" && events.length) return false;
  if (filters.status === "pending-plan" && !plans.some((plan) => plan.status !== "completed" && plan.completedSessions < plan.purchasedSessions)) return false;
  if (filters.status === "control-soon" && !patient.segments.includes("Control próximo")) return false;
  if (filters.status === "inactive" && !patient.segments.includes("Inactiva")) return false;
  return true;
}

function sortPatientsForCrm(patients) {
  const filters = { ...defaultCrmFilters, ...(state.crmFilters ?? {}) };
  return patients.slice().sort((a, b) => {
    const eventA = latestPatientEvent(a.id);
    const eventB = latestPatientEvent(b.id);
    if (filters.sort === "oldest") return (eventA?.date ?? "9999-12-31").localeCompare(eventB?.date ?? "9999-12-31");
    if (filters.sort === "name") return a.name.localeCompare(b.name);
    if (filters.sort === "sessions") return patientTreatmentEvents(b.id).length - patientTreatmentEvents(a.id).length || a.name.localeCompare(b.name);
    if (filters.sort === "pending") {
      const pendingA = state.plans.filter((plan) => plan.patientId === a.id && plan.completedSessions < plan.purchasedSessions).length;
      const pendingB = state.plans.filter((plan) => plan.patientId === b.id && plan.completedSessions < plan.purchasedSessions).length;
      return pendingB - pendingA || (eventB?.date ?? "").localeCompare(eventA?.date ?? "");
    }
    return (eventB?.date ?? "").localeCompare(eventA?.date ?? "") || a.name.localeCompare(b.name);
  });
}

function recentTreatmentEventsForPatients(patients, limit = 8) {
  const patientIds = new Set(patients.map((patient) => patient.id));
  return patients
    .flatMap((patient) => patientTreatmentEvents(patient.id))
    .filter((event) => patientIds.has(event.patientId))
    .filter(eventMatchesCrmFilters)
    .sort((a, b) => `${b.date}${b.id}`.localeCompare(`${a.date}${a.id}`))
    .slice(0, limit);
}

function getPatientSegment(patient) {
  if (state.selectedSegment === "all") return true;
  return patient.segments.some((segment) => segment.toLowerCase().replaceAll(" ", "-") === state.selectedSegment);
}

function filteredPatients() {
  return sortPatientsForCrm(visiblePatients().filter((patient) => getPatientSegment(patient) && patientMatchesSearch(patient) && patientMatchesCrmFilters(patient)));
}

function getPlanForPatient(patientId, treatmentId = "") {
  return state.plans.find(
    (plan) => plan.patientId === patientId && (!treatmentId || plan.treatmentId === treatmentId) && plan.status !== "completed"
  );
}

function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add("is-visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toastEl.classList.remove("is-visible"), 2800);
}

function setActiveView(view) {
  const allowed = allowedViews();
  state.activeView = allowed.includes(view) ? view : allowed[0];
  saveState();
  render();
}

function allowedViews() {
  return isAdmin() ? ["dashboard", "agenda", "pacientes", "solicitudes", "configuracion"] : ["dashboard", "agenda", "pacientes"];
}

function syncChrome() {
  const user = currentUser();
  loginScreen.hidden = Boolean(user);
  welcomeScreen.hidden = !user || !welcomeGateOpen;
  appShell.hidden = !user || welcomeGateOpen;
  if (!user) return;

  if (welcomeGateOpen) {
    renderWelcomeCover();
    return;
  }

  const allowed = allowedViews();
  if (!allowed.includes(state.activeView)) state.activeView = allowed[0];
  navButtons.forEach((button) => {
    const visible = allowed.includes(button.dataset.view);
    button.hidden = !visible;
    button.classList.toggle("is-active", button.dataset.view === state.activeView);
  });
  const copy = viewCopy[state.activeView] ?? viewCopy.dashboard;
  viewEyebrow.textContent = isAdmin() ? copy.eyebrow : "Portal profesional";
  viewTitle.textContent = isAdmin() ? copy.title : professionalPortalTitle(copy.title);
  viewCopyEl.textContent = isAdmin() ? copy.copy : "Vista filtrada por profesional: agenda, pacientes e historial asignado.";
  userCard.innerHTML = `
    <div class="user-card-profile">
      <img class="profile-avatar" src="${userImage(user)}" alt="" />
      <span>
        <small>Sesión</small>
        <strong>${user.name}</strong>
        <p>${userRoleLabel(user)}</p>
      </span>
    </div>
  `;
}

function professionalPortalTitle(fallback) {
  const professional = byId("professionals", currentProfessionalId());
  return professional ? `${professional.name} · ${fallback}` : fallback;
}

function greetingName() {
  const user = currentUser();
  if (!user) return "Beauty Center";
  if (user.role === "admin") return "administrador";
  const professional = byId("professionals", user.professionalId);
  const name = professional?.name ?? user.name;
  return name.replace(/^Dra\.?\s+/i, "doctora ");
}

function welcomeStats() {
  const appointments = professionalScope(state.appointments).filter((appointment) => appointment.status !== "cancelled");
  const visibleIds = visiblePatientIdsForProfessional();
  const patients = state.patients.filter((patient) => visibleIds.has(patient.id));
  return {
    appointmentsCount: appointments.length,
    patientsCount: patients.length,
    pendingSessions: state.plans.filter((plan) => visibleIds.has(plan.patientId) && plan.completedSessions < plan.purchasedSessions).length,
  };
}

function renderWelcomeCover() {
  const { appointmentsCount, patientsCount, pendingSessions } = welcomeStats();
  welcomeImage.src = userImage();
  welcomeTitle.textContent = `Hola, ${greetingName()}`;
  welcomeCopy.textContent = isAdmin()
    ? "Tienes la vista completa de agenda, solicitudes, pacientes, recursos y accesos del equipo."
    : "Tu agenda profesional, pacientes asignadas e historial clínico/comercial ya están preparados.";
  welcomeCoverStats.innerHTML = `
    <span>${countLabel(appointmentsCount, "hora activa", "horas activas")}</span>
    <span>${countLabel(patientsCount, "paciente visible", "pacientes visibles")}</span>
    <span>${countLabel(pendingSessions, "plan pendiente", "planes pendientes")}</span>
  `;
}

function renderPage(content) {
  app.innerHTML = content;
}

function render() {
  syncChrome();
  if (!currentUser() || welcomeGateOpen) return;
  const views = {
    dashboard: renderDashboard,
    agenda: renderAgenda,
    pacientes: renderPatients,
    solicitudes: renderRequests,
    configuracion: renderSettings,
  };
  views[state.activeView]?.();
}

function renderDashboard() {
  const appointments = professionalScope(state.appointments).filter((appointment) => appointment.status !== "cancelled");
  const visibleIds = visiblePatientIdsForProfessional();
  const patients = state.patients.filter((patient) => visibleIds.has(patient.id));
  const pendingSessions = state.plans.filter((plan) => visibleIds.has(plan.patientId) && plan.completedSessions < plan.purchasedSessions).length;
  const openRequests = isAdmin() ? state.requests.filter((request) => !["Agendada", "Perdida"].includes(request.status)).length : "—";
  const smartTasks = buildSmartTasks({ appointments, patients, visibleIds });
  const nextAppointments = appointments
    .slice()
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
    .slice(0, 6);

  renderPage(`
    <section class="grid four">
      ${metric("Pacientes", patients.length, isAdmin() ? "Base total CRM" : "Asignados a tu atención")}
      ${metric("Horas activas", appointments.length, "Semana operativa")}
      ${metric("Planes pendientes", pendingSessions, "Sesiones por completar")}
      ${metric("Solicitudes abiertas", openRequests, isAdmin() ? "Por contactar o agendar" : "Solo administración")}
    </section>

    <section class="grid two">
      <article class="panel">
        <div class="panel-header">
          <div>
            <p class="eyebrow">Próximas horas</p>
            <h2>${isAdmin() ? "Agenda general" : "Mi agenda"}</h2>
          </div>
          <button class="primary-button" type="button" data-open-appointment>Nueva hora</button>
        </div>
        <div class="table-list">
          ${nextAppointments.map(renderAppointmentRow).join("") || empty("Sin horas activas.")}
        </div>
      </article>

      <article class="panel">
        <div class="panel-header">
          <div>
            <p class="eyebrow">CRM inteligente</p>
            <h2>Tareas priorizadas</h2>
          </div>
        </div>
        <div class="table-list">
          ${smartTasks.map(renderSmartTaskRow).join("") || empty("Sin tareas críticas por ahora.")}
        </div>
      </article>
    </section>
  `);
}

function renderAgenda() {
  const visibleAppointments = professionalScope(state.appointments).filter((appointment) => appointment.status !== "cancelled");
  const allActiveAppointments = state.appointments.filter((appointment) => appointment.status !== "cancelled");
  const days = agendaWeekDays();
  const firstDay = days[0].date;
  const lastDay = days[days.length - 1].date;
  const weekAppointments = visibleAppointments
    .filter((appointment) => appointment.date >= firstDay && appointment.date <= lastDay)
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  const rows = timeSlots
    .map((time) => {
      const cells = days
        .map((day) => {
          const daily = visibleAppointments.filter((appointment) => appointment.date === day.date && appointment.time === time);
          const resourceBookings = allActiveAppointments.filter(
            (appointment) => appointment.date === day.date && appointment.time === time && appointment.resourceId !== "res-none"
          );
          return renderAgendaCell(day.date, time, daily, resourceBookings);
        })
        .join("");
      return `<div class="schedule-row"><span class="time">${time}</span>${cells}</div>`;
    })
    .join("");

  renderPage(`
    <section class="panel">
      <div class="panel-header">
        <div>
          <p class="eyebrow">${agendaWeekLabel(days)}</p>
          <h2>${isAdmin() ? "Agenda general" : "Agenda profesional"}</h2>
        </div>
        <button class="primary-button" type="button" data-open-appointment>Nueva hora</button>
      </div>
      <div class="agenda-toolbar" aria-label="Navegación de agenda">
        <button class="ghost-button" type="button" data-agenda-month-move="-1">Mes anterior</button>
        <label class="agenda-picker">
          <span>Mes</span>
          <input type="month" data-agenda-month value="${agendaMonthValue()}" />
        </label>
        <button class="ghost-button" type="button" data-agenda-month-move="1">Mes siguiente</button>
        <button class="ghost-button" type="button" data-agenda-week-move="-7">Semana anterior</button>
        <label class="agenda-picker">
          <span>Ir a fecha</span>
          <input type="date" data-agenda-date value="${state.agendaDate || today}" />
        </label>
        <button class="ghost-button" type="button" data-agenda-today>Hoy</button>
        <button class="ghost-button" type="button" data-agenda-week-move="7">Semana siguiente</button>
      </div>
      <div class="schedule-wrap">
        <div class="schedule">
          <div class="schedule-head">
            <span>Hora</span>
            ${days.map((day) => `<span><strong>${day.label}</strong><small>${day.shortDate}</small></span>`).join("")}
          </div>
          ${rows}
        </div>
      </div>
    </section>

    <section class="panel">
      <div class="panel-header">
        <div>
          <p class="eyebrow">Control operativo</p>
          <h2>Citas y estados</h2>
        </div>
      </div>
      <div class="table-list">
        ${weekAppointments.map(renderAppointmentRow).join("") || empty("Sin citas para la semana visible.")}
      </div>
    </section>
  `);
}

function renderAgendaCell(date, time, appointments, resourceBookings) {
  return `
    <div class="slot-cell">
      ${
        appointments.length
          ? appointments.map(renderAppointmentCard).join("")
          : `<button class="empty-slot" type="button" data-new-slot data-date="${date}" data-time="${time}">+ Agendar</button>`
      }
      ${renderResourceOccupancy(resourceBookings)}
    </div>
  `;
}

function renderPatients() {
  const patients = filteredPatients();
  const recentEvents = recentTreatmentEventsForPatients(patients, 6);
  const visible = visiblePatients();
  const recent30 = visible.filter((patient) => patientTreatmentEvents(patient.id).some((event) => event.date >= addDays(today, -30))).length;
  if (patients.length && !patients.some((patient) => patient.id === state.selectedPatientId)) {
    state.selectedPatientId = patients[0].id;
  }
  const selected = byId("patients", state.selectedPatientId) ?? patients[0] ?? visiblePatients()[0];

  renderPage(`
    <section class="grid four">
      ${metric("Pacientes visibles", visible.length, isAdmin() ? "Base CRM" : "Solo tus pacientes")}
      ${metric("Filtradas", patients.length, "Resultado actual")}
      ${metric("Atendidas 30 días", recent30, "Tratamientos recientes")}
      ${metric("Planes activos", state.plans.filter((plan) => visiblePatientIdsForProfessional().has(plan.patientId) && plan.status === "active").length, "Tratamientos")}
    </section>

    <section class="grid two crm-layout">
      <article class="panel">
        <div class="panel-header">
          <div>
            <p class="eyebrow">Segmentos</p>
            <h2>Pacientes</h2>
          </div>
          ${isAdmin() ? `<button class="primary-button" type="button" data-new-patient>Nuevo paciente</button>` : ""}
        </div>
        ${renderCrmFilters()}
        <div class="segment-bar">
          ${["all", "vip", "nueva", "inactiva", "cumpleaños", "tratamiento-incompleto", "oportunidad"]
            .map((segment) => `<button class="${state.selectedSegment === segment ? "is-selected" : ""}" type="button" data-segment="${segment}">${segmentLabel(segment)}</button>`)
            .join("")}
        </div>
        <div class="crm-recent-block">
          <div class="mini-heading">
            <span>Últimas atenciones realizadas</span>
            <small>${recentEvents.length ? "Según filtros activos" : "Sin resultados para este filtro"}</small>
          </div>
          <div class="table-list compact-list">
            ${recentEvents.map(renderRecentTreatmentRow).join("") || empty("No hay tratamientos realizados con estos filtros.")}
          </div>
        </div>
        <div class="table-list">
          ${patients.map(renderPatientButton).join("") || empty("No hay pacientes con este filtro.")}
        </div>
      </article>

      <article class="panel patient-detail">
        ${selected ? renderPatientDetail(selected) : empty("No hay paciente seleccionado.")}
      </article>
    </section>
  `);
}

function renderRequests() {
  const requests = state.requests;
  const activeRequests = requests.filter((request) => !["Agendada", "Perdida"].includes(request.status));
  const dueFollowUps = activeRequests.filter((request) => request.followUpDate && request.followUpDate <= today);
  renderPage(`
    <section class="grid four">
      ${metric("Solicitudes", requests.length, "Historial de entrada")}
      ${metric("Abiertas", activeRequests.length, "Por convertir")}
      ${metric("Seguimientos", dueFollowUps.length, "Hoy o vencidos")}
      ${metric("Agendadas", requests.filter((request) => request.status === "Agendada").length, "Convertidas a hora")}
    </section>

    <section class="panel">
      <div class="panel-header">
        <div>
          <p class="eyebrow">Entrada web / manual</p>
          <h2>Solicitudes</h2>
        </div>
        <button class="primary-button" type="button" data-open-request>Nueva solicitud</button>
      </div>
      <div class="table-list">
        ${requests.map(renderRequestRow).join("") || empty("Sin solicitudes.")}
      </div>
    </section>
  `);
}

function renderSettings() {
  const accessRows = state.users.map((user) => {
    const professional = user.professionalId ? byId("professionals", user.professionalId) : null;
    return `
      <div class="table-row">
        <div class="access-person">
          <img class="profile-avatar" src="${accessImageForUser(user)}" alt="" />
          <span>
            <strong>${user.name}</strong>
            <small>${user.email} · ${user.role === "admin" ? "Administración" : professional?.role ?? "Profesional"} · ${user.active === false ? "Inactivo" : "Activo"}</small>
          </span>
        </div>
        <div class="row-actions">
          <button class="ghost-button" type="button" data-edit-access="${user.id}">Editar acceso</button>
        </div>
      </div>
    `;
  }).join("");
  const resourceRows = state.resources.map((resource) => `
    <div class="table-row">
      <div>
        <strong>${escapeHtml(resource.name)}</strong>
        <small>${escapeHtml(resourceTypeLabel(resource.type))} · ${resource.active === false ? "Inactivo" : "Activo"}</small>
      </div>
      <div class="row-actions">
        <button class="ghost-button" type="button" data-edit-resource="${resource.id}">Editar recurso</button>
      </div>
    </div>
  `).join("");
  const treatmentRows = state.treatments.map((treatment) => {
    const resource = byId("resources", treatment.resourceId);
    return `
      <div class="table-row">
        <div>
          <strong>${escapeHtml(treatment.name)}</strong>
          <small>${treatment.defaultSessions} ses. · ${resource?.name ?? "Sin recurso"} · ${treatment.active === false ? "Inactivo" : "Activo"}</small>
        </div>
        <div class="row-actions">
          <button class="ghost-button" type="button" data-edit-treatment="${treatment.id}">Editar tratamiento</button>
        </div>
      </div>
    `;
  }).join("");

  renderPage(`
    <section class="grid two">
      <article class="panel">
        <div class="panel-header">
          <div>
            <p class="eyebrow">Accesos</p>
            <h2>Usuarios del sistema</h2>
          </div>
        </div>
        <div class="table-list">
          ${accessRows}
        </div>
      </article>

      <article class="panel">
        <div class="panel-header">
          <div>
            <p class="eyebrow">Profesionales</p>
            <h2>Crear o editar acceso</h2>
          </div>
        </div>
        <form class="admin-form" data-access-form>
          <input type="hidden" name="userId" />
          <input type="hidden" name="professionalId" />
          <input type="hidden" name="image" data-access-image />
          <div class="avatar-uploader">
            <img class="profile-avatar large" src="./assets/logo-beauty-center.jpg" alt="" data-access-image-preview />
            <div>
              <strong>Foto de perfil</strong>
              <p class="form-hint">Se reduce automáticamente a una imagen liviana para el perfil del equipo.</p>
              <div class="row-actions">
                <label class="ghost-button file-button">
                  Subir foto
                  <input type="file" accept="image/png,image/jpeg,image/webp" data-access-image-input />
                </label>
                <button class="ghost-button" type="button" data-clear-access-image>Quitar foto</button>
              </div>
            </div>
          </div>
          <div class="modal-grid">
            <label>
              Nombre
              <input name="name" type="text" required />
            </label>
            <label>
              Permiso
              <select name="role">
                <option value="professional">Profesional</option>
                <option value="admin">Administración</option>
              </select>
            </label>
            <label>
              Cargo o especialidad
              <input name="professionalRole" type="text" placeholder="Estética, evaluación, HIFU…" />
            </label>
            <label>
              Correo de acceso
              <input name="email" type="email" required />
            </label>
            <label>
              Contraseña
              <input name="password" type="text" required />
            </label>
            <label>
              Estado
              <select name="active">
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </label>
          </div>
          <div class="admin-form-actions">
            <button class="primary-button" type="submit">Guardar acceso</button>
            <button class="ghost-button" type="button" data-clear-access-form>Nuevo acceso</button>
          </div>
        </form>
      </article>
    </section>

    <section class="grid two">
      <article class="panel">
        <div class="panel-header">
          <div>
            <p class="eyebrow">Recursos</p>
            <h2>Boxes, salas y equipos</h2>
          </div>
        </div>
        <div class="table-list">
          ${resourceRows}
        </div>
      </article>

      <article class="panel">
        <div class="panel-header">
          <div>
            <p class="eyebrow">Agenda</p>
            <h2>Crear o editar recurso</h2>
          </div>
        </div>
        <form class="admin-form" data-resource-form>
          <input type="hidden" name="resourceId" />
          <div class="modal-grid">
            <label>
              Nombre del recurso
              <input name="name" type="text" placeholder="Box 2, sala corporal, HIFU..." required />
            </label>
            <label>
              Tipo
              <select name="type">
                <option value="Equipo">Equipo</option>
                <option value="Box">Box</option>
                <option value="Sala">Sala</option>
                <option value="Cabina">Cabina</option>
                <option value="Sin recurso">Sin recurso</option>
                <option value="Otro">Otro</option>
              </select>
            </label>
            <label>
              Estado
              <select name="active">
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </label>
          </div>
          <p class="form-hint">Los recursos activos aparecen al crear o editar horas. Los inactivos conservan el historial, pero dejan de ofrecerse para nuevas reservas.</p>
          <div class="admin-form-actions">
            <button class="primary-button" type="submit">Guardar recurso</button>
            <button class="ghost-button" type="button" data-clear-resource-form>Nuevo recurso</button>
          </div>
        </form>
      </article>
    </section>

    <section class="grid two">
      <article class="panel">
        <div class="panel-header">
          <div>
            <p class="eyebrow">Tratamientos</p>
            <h2>Servicios disponibles</h2>
          </div>
        </div>
        <div class="table-list">
          ${treatmentRows}
        </div>
      </article>

      <article class="panel">
        <div class="panel-header">
          <div>
            <p class="eyebrow">Agenda</p>
            <h2>Crear o editar tratamiento</h2>
          </div>
        </div>
        <form class="admin-form" data-treatment-form>
          <input type="hidden" name="treatmentId" />
          <div class="modal-grid">
            <label>
              Nombre del tratamiento
              <input name="name" type="text" placeholder="Limpieza facial, HIFU, depilacion..." required />
            </label>
            <label>
              Sesiones por defecto
              <input name="defaultSessions" type="number" min="1" step="1" required />
            </label>
            <label>
              Recurso sugerido
              <select name="resourceId" data-treatment-resource-select></select>
            </label>
            <label>
              Estado
              <select name="active">
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </label>
          </div>
          <p class="form-hint">Los tratamientos activos aparecen en nuevas horas, solicitudes y planes de pacientes.</p>
          <div class="admin-form-actions">
            <button class="primary-button" type="submit">Guardar tratamiento</button>
            <button class="ghost-button" type="button" data-clear-treatment-form>Nuevo tratamiento</button>
          </div>
        </form>
      </article>
    </section>

    <section class="panel">
      <div class="panel-header">
        <div>
          <p class="eyebrow">Herramientas</p>
          <h2>Respaldo de datos</h2>
        </div>
      </div>
      <p class="form-hint">Descarga un archivo JSON con pacientes, citas, solicitudes, planes, recursos, tratamientos y accesos de esta instalación.</p>
      <div class="row-actions">
        <button class="ghost-button" type="button" data-reset-data>Reiniciar datos</button>
        <button class="ghost-button" type="button" data-export-json>Descargar respaldo JSON</button>
      </div>
    </section>
  `);
  clearResourceForm();
  clearTreatmentForm();
}

function metric(label, value, copy) {
  return `<article class="metric-card"><span>${label}</span><strong>${value}</strong><small>${copy}</small></article>`;
}

function empty(text) {
  return `<p class="form-hint">${text}</p>`;
}

function option(value, label, selectedValue) {
  return `<option value="${value}" ${value === selectedValue ? "selected" : ""}>${label}</option>`;
}

function renderCrmFilters() {
  const filters = { ...defaultCrmFilters, ...(state.crmFilters ?? {}) };
  return `
    <div class="crm-filter-grid" aria-label="Filtros clínicos de pacientes">
      <label>
        Tratamiento realizado
        <select data-crm-filter="treatmentId">
          ${option("all", "Todos", filters.treatmentId)}
          ${state.treatments.map((treatment) => option(treatment.id, treatment.name, filters.treatmentId)).join("")}
        </select>
      </label>
      <label>
        Rango
        <select data-crm-filter="recency">
          ${option("all", "Todo el historial", filters.recency)}
          ${option("7", "Últimos 7 días", filters.recency)}
          ${option("30", "Últimos 30 días", filters.recency)}
          ${option("60", "Últimos 60 días", filters.recency)}
          ${option("90", "Últimos 90 días", filters.recency)}
          ${option("180", "Últimos 180 días", filters.recency)}
        </select>
      </label>
      ${
        isAdmin()
          ? `<label>
              Profesional
              <select data-crm-filter="professionalId">
                ${option("all", "Todas", filters.professionalId)}
                ${state.professionals.map((professional) => option(professional.id, professional.name, filters.professionalId)).join("")}
              </select>
            </label>`
          : ""
      }
      <label>
        Estado CRM
        <select data-crm-filter="status">
          ${option("all", "Todos", filters.status)}
          ${option("with-history", "Con historial", filters.status)}
          ${option("no-history", "Sin historial", filters.status)}
          ${option("pending-plan", "Con sesiones pendientes", filters.status)}
          ${option("control-soon", "Control próximo", filters.status)}
          ${option("inactive", "Inactivas", filters.status)}
        </select>
      </label>
      <label>
        Orden
        <select data-crm-filter="sort">
          ${option("recent", "Más recientes primero", filters.sort)}
          ${option("oldest", "Más antiguas primero", filters.sort)}
          ${option("sessions", "Más atenciones", filters.sort)}
          ${option("pending", "Más planes pendientes", filters.sort)}
          ${option("name", "Nombre A-Z", filters.sort)}
        </select>
      </label>
      <button class="ghost-button" type="button" data-clear-crm-filters>Limpiar filtros</button>
    </div>
  `;
}

function renderRecentTreatmentRow(event) {
  const patient = byId("patients", event.patientId);
  const treatment = byId("treatments", event.treatmentId);
  const professional = byId("professionals", event.professionalId);
  return `
    <div class="table-row compact-row">
      <div>
        <strong>${patient?.name ?? "Paciente"} · ${treatment?.name ?? "Tratamiento"}</strong>
        <small>${formatDate(event.date)} · ${professional?.name ?? "Profesional"} · ${escapeHtml(event.note ?? event.source)}</small>
      </div>
      <div class="row-actions">
        <button class="ghost-button" type="button" data-select-patient="${event.patientId}">Ver ficha</button>
      </div>
    </div>
  `;
}

function buildSmartTasks({ appointments, patients, visibleIds }) {
  const tasks = [];
  const soonLimit = addDays(today, 2);
  const visiblePatientIds = visibleIds ?? new Set(patients.map((patient) => patient.id));

  if (isAdmin()) {
    state.requests
      .filter((request) => !["Agendada", "Perdida"].includes(request.status))
      .filter((request) => !request.followUpDate || request.followUpDate <= soonLimit)
      .slice()
      .sort((a, b) => (a.followUpDate || today).localeCompare(b.followUpDate || today))
      .slice(0, 3)
      .forEach((request) => {
        const patient = byId("patients", request.patientId);
        const treatment = byId("treatments", request.treatmentId);
        tasks.push({
          priority: request.followUpDate && request.followUpDate <= today ? "alta" : "media",
          label: "Solicitud",
          title: `${patient?.name ?? "Paciente"} necesita seguimiento`,
          copy: `${request.status} · ${treatment?.name ?? "Tratamiento"} · seguimiento ${formatDate(request.followUpDate)}`,
          actions: [`<button class="ghost-button" type="button" data-view="solicitudes">Ver solicitudes</button>`],
          sortDate: request.followUpDate || today,
        });
      });

  }

  state.plans
    .filter((plan) => visiblePatientIds.has(plan.patientId) && plan.status !== "completed" && plan.completedSessions < plan.purchasedSessions)
    .slice()
    .sort((a, b) => a.completedSessions - b.completedSessions)
    .slice(0, 4)
    .forEach((plan) => {
      const patient = byId("patients", plan.patientId);
      const treatment = byId("treatments", plan.treatmentId);
      const nextSession = Math.min(plan.completedSessions + 1, plan.purchasedSessions);
      tasks.push({
        priority: plan.status === "paused" ? "alta" : "media",
        label: "Plan",
        title: `${patient?.name ?? "Paciente"} tiene sesiones pendientes`,
        copy: `${treatment?.name ?? "Tratamiento"} · sesión ${nextSession} de ${plan.purchasedSessions} · ${plan.nextAction ?? "Agendar próximo control"}`,
        actions: [
          `<button class="ghost-button" type="button" data-select-patient="${plan.patientId}">Ver ficha</button>`,
          `<button class="ghost-button" type="button" data-schedule-patient="${plan.patientId}">Agendar</button>`,
        ],
        sortDate: today,
      });
    });

  patients
    .filter((patient) => patient.segments.includes("Inactiva") || patient.segments.includes("Tratamiento incompleto") || patient.segments.includes("Cumpleaños"))
    .slice(0, 4)
    .forEach((patient) => {
      const isInactive = patient.segments.includes("Inactiva");
      tasks.push({
        priority: isInactive ? "media" : "baja",
        label: isInactive ? "Reactivación" : "Fidelización",
        title: patient.name,
        copy: `${patient.segments.join(" · ")} · ${patient.notes}`,
        actions: [
          `<button class="ghost-button" type="button" data-select-patient="${patient.id}">Ver ficha</button>`,
          `<a class="ghost-button" href="${whatsappLink(patient)}" target="_blank" rel="noreferrer">WhatsApp</a>`,
        ],
        sortDate: patient.lastVisit || today,
      });
    });

  const priorityOrder = { alta: 0, media: 1, baja: 2 };
  return tasks
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority] || a.sortDate.localeCompare(b.sortDate))
    .slice(0, 8);
}

function renderSmartTaskRow(task) {
  return `
    <div class="table-row smart-task-row priority-${task.priority}">
      <div>
        <span class="task-priority ${task.priority}">${task.priority}</span>
        <strong>${escapeHtml(task.title)}</strong>
        <small>${escapeHtml(task.label)} · ${escapeHtml(task.copy)}</small>
      </div>
      <div class="row-actions">
        ${task.actions.join("")}
      </div>
    </div>
  `;
}

function renderAppointmentCard(appointment) {
  const patient = byId("patients", appointment.patientId);
  const treatment = byId("treatments", appointment.treatmentId);
  const resource = byId("resources", appointment.resourceId);
  return `
    <button class="appointment-card ${appointment.status}" type="button" data-edit-appointment="${appointment.id}">
      <strong>${patient?.name ?? "Paciente"}</strong>
      <span>${treatment?.name ?? "Tratamiento"}</span>
      <small>${statusLabels[appointment.status]} · ${resource?.name ?? ""}</small>
    </button>
  `;
}

function renderResourceOccupancy(bookings) {
  if (!bookings.length) return "";
  return `
    <div class="resource-occupancy">
      <small>Recursos ocupados</small>
      <div class="resource-pills">
        ${bookings
          .map((booking) => {
            const resource = byId("resources", booking.resourceId);
            const professional = byId("professionals", booking.professionalId);
            const ownBooking = booking.professionalId === currentProfessionalId();
            const label = ownBooking ? "Tu hora" : professional?.name ?? "Equipo";
            return `
              <span class="resource-pill ${ownBooking ? "is-own" : "is-busy"}">
                <strong>${resource?.name ?? "Recurso"}</strong>
                <em>${label}</em>
              </span>
            `;
          })
          .join("")}
      </div>
    </div>
  `;
}

function renderAppointmentRow(appointment) {
  const patient = byId("patients", appointment.patientId);
  const treatment = byId("treatments", appointment.treatmentId);
  const professional = byId("professionals", appointment.professionalId);
  return `
    <div class="table-row">
      <div>
        <strong>${formatDate(appointment.date)} ${appointment.time} · ${patient?.name ?? "Paciente"}</strong>
        <small>${treatment?.name ?? "Tratamiento"} · ${professional?.name ?? "Profesional"} · ${statusLabels[appointment.status]}</small>
      </div>
      <div class="row-actions">
        <button class="ghost-button" type="button" data-edit-appointment="${appointment.id}">Editar</button>
        <button class="ghost-button" type="button" data-mark-attended="${appointment.id}">Atendida</button>
      </div>
    </div>
  `;
}

function renderPatientActionRow(patient) {
  return `
    <div class="table-row">
      <div>
        <strong>${patient.name}</strong>
        <small>${patient.segments.join(" · ")} · ${patient.notes}</small>
      </div>
      <div class="row-actions">
        <button class="ghost-button" type="button" data-select-patient="${patient.id}">Ver ficha</button>
        <a class="ghost-button" href="${whatsappLink(patient)}" target="_blank" rel="noreferrer">WhatsApp</a>
      </div>
    </div>
  `;
}

function renderPatientButton(patient) {
  const active = patient.id === state.selectedPatientId ? "is-active" : "";
  const plans = state.plans.filter((plan) => plan.patientId === patient.id);
  const latest = latestPatientEvent(patient.id);
  const treatment = byId("treatments", latest?.treatmentId);
  const professional = byId("professionals", latest?.professionalId);
  const latestCopy = latest
    ? `${formatDate(latest.date)} · ${treatment?.name ?? "Tratamiento"} · ${professional?.name ?? "Profesional"}`
    : `${patient.origin} · ${patient.phone} · sin historial`;
  return `
    <button class="row-button ${active}" type="button" data-select-patient="${patient.id}">
      <div>
        <strong>${patient.name}</strong>
        <small>${latestCopy} · ${plans.length} plan(es)</small>
      </div>
      <span class="chip ${patient.segments.includes("Inactiva") ? "rose" : "sage"}">${patient.segments[0] ?? "CRM"}</span>
    </button>
  `;
}

function renderPatientDetail(patient) {
  const plans = state.plans.filter((plan) => plan.patientId === patient.id);
  const histories = state.histories.filter((history) => history.patientId === patient.id);
  const appointments = state.appointments.filter((appointment) => appointment.patientId === patient.id);
  return `
    <div class="panel-header">
      <div>
        <p class="eyebrow">Ficha 360</p>
        <h2>${patient.name}</h2>
      </div>
      <span class="badge">${patient.segments[0] ?? "Paciente"}</span>
    </div>

    <div class="row-actions">
      <button class="primary-button" type="button" data-schedule-patient="${patient.id}">Agendar hora</button>
      ${isAdmin() ? `<button class="ghost-button" type="button" data-edit-patient="${patient.id}">Editar ficha</button>` : ""}
      <button class="ghost-button" type="button" data-new-plan="${patient.id}">Agregar plan</button>
      <a class="ghost-button" href="${whatsappLink(patient)}" target="_blank" rel="noreferrer">WhatsApp</a>
      <a class="ghost-button" href="${emailLink(patient)}">Correo</a>
    </div>

    <div class="summary-grid">
      <div><span>WhatsApp</span><strong>${patient.phone}</strong></div>
      <div><span>Correo</span><strong>${patient.email}</strong></div>
      <div><span>Origen</span><strong>${patient.origin}</strong></div>
      <div><span>Última visita</span><strong>${patient.lastVisit ? formatDate(patient.lastVisit) : "Sin atención"}</strong></div>
    </div>

    <div class="row-actions">
      ${patient.segments.map((segment) => `<span class="chip">${segment}</span>`).join("")}
    </div>

    <div class="grid">
      ${plans.map(renderPlanCard).join("") || empty("Sin plan activo. Puedes agregar un plan de tratamiento desde esta ficha.")}
    </div>

    <div class="timeline">
      <h3>Historial clínico/comercial</h3>
      ${histories
        .slice()
        .sort((a, b) => b.date.localeCompare(a.date))
        .map(renderHistoryEntry)
        .join("") || empty("Sin historial registrado.")}
    </div>

    <div class="message-preview">
      <span>Mensaje manual preparado</span>
      <textarea data-message-text="${patient.id}" aria-label="Mensaje WhatsApp para ${patient.name}">${escapeHtml(patientMessage(patient))}</textarea>
      <div class="row-actions">
        <a class="primary-button" data-whatsapp-message-link="${patient.id}" href="${whatsappLink(patient)}" target="_blank" rel="noreferrer">Enviar WhatsApp</a>
      </div>
    </div>

    <div class="table-list">
      <h3>Citas vinculadas</h3>
      ${appointments.map(renderAppointmentRow).join("") || empty("Sin citas vinculadas.")}
    </div>
  `;
}

function renderPlanCard(plan) {
  const treatment = byId("treatments", plan.treatmentId);
  const percent = Math.min(100, Math.round((plan.completedSessions / plan.purchasedSessions) * 100));
  return `
    <article class="plan-card">
      <span>Plan de tratamiento</span>
      <strong>${treatment?.name ?? "Tratamiento"}</strong>
      <small>${plan.completedSessions} de ${plan.purchasedSessions} sesiones · ${plan.status}</small>
      <div class="progress-track"><span style="display:block;width:${percent}%"></span></div>
      <p class="muted">${plan.nextAction}</p>
      <div class="row-actions">
        <button class="ghost-button" type="button" data-register-session="${plan.id}">Registrar sesión</button>
        ${plan.completedSessions > 0 ? `<button class="ghost-button" type="button" data-delete-last-session="${plan.id}">Eliminar última sesión</button>` : ""}
        <button class="ghost-button" type="button" data-edit-plan="${plan.id}">Editar plan</button>
      </div>
    </article>
  `;
}

function canEditHistory(history) {
  return isAdmin() || history.professionalId === currentProfessionalId();
}

function renderHistoryEntry(history) {
  const treatment = byId("treatments", history.treatmentId);
  const professional = byId("professionals", history.professionalId);
  return `
    <article>
      <span>${formatDate(history.date)}</span>
      <strong>${treatment?.name ?? "Atención"}</strong>
      <small>${professional?.name ?? "Profesional"}${history.sessionEntry ? " · Sesión registrada" : ""}</small>
      <p>${escapeHtml(history.note)}</p>
      ${canEditHistory(history) ? `
        <div class="row-actions">
          <button class="ghost-button" type="button" data-edit-history="${history.id}">Editar</button>
          <button class="danger-button" type="button" data-delete-history="${history.id}">Eliminar</button>
        </div>
      ` : ""}
    </article>
  `;
}

function renderRequestRow(request) {
  const patient = byId("patients", request.patientId);
  const treatment = byId("treatments", request.treatmentId);
  const professional = byId("professionals", request.professionalId);
  return `
    <div class="table-row request-row">
      <div>
        <strong>${patient?.name ?? "Paciente"} · ${treatment?.name ?? "Tratamiento"}</strong>
        <small>${request.source} · ${formatDate(request.date)} ${request.time} · ${professional?.name ?? "Profesional"}</small>
        <small>${request.note}</small>
        <span class="chip ${requestStatusClass(request.status)}">${request.status}</span>
      </div>
      <div class="row-actions">
        <select data-request-status="${request.id}" aria-label="Estado de solicitud de ${patient?.name ?? "paciente"}">
          ${requestStatusOptions(request.status)}
        </select>
        <input type="date" data-request-follow-up="${request.id}" value="${request.followUpDate ?? ""}" aria-label="Próximo seguimiento de ${patient?.name ?? "paciente"}" />
        <button class="primary-button" type="button" data-schedule-request="${request.id}">Agendar</button>
      </div>
      <div class="request-followup">
        <label>
          Mensaje de seguimiento manual
          <textarea data-request-message="${request.id}" aria-label="Mensaje WhatsApp para solicitud de ${patient?.name ?? "paciente"}">${escapeHtml(requestMessage(request))}</textarea>
        </label>
        <div class="request-followup-meta">
          <span>${requestFollowUpLabel(request)}</span>
          <a class="ghost-button" data-request-whatsapp-link="${request.id}" href="${requestWhatsappLink(request)}" target="_blank" rel="noreferrer">Enviar WhatsApp</a>
        </div>
      </div>
    </div>
  `;
}

function segmentLabel(segment) {
  const labels = {
    all: "Todos",
    vip: "VIP",
    nueva: "Nuevas",
    inactiva: "Inactivas",
    cumpleaños: "Cumpleaños",
    "tratamiento-incompleto": "Tratamiento incompleto",
    oportunidad: "Oportunidad",
  };
  return labels[segment] ?? segment;
}

function requestStatusOptions(value = "Pendiente de pago") {
  return requestStatuses.map((status) => `<option value="${status}" ${status === value ? "selected" : ""}>${status}</option>`).join("");
}

function requestStatusClass(status = "") {
  if (status === "Agendada") return "sage";
  if (status === "Perdida" || status === "No respondió") return "rose";
  return "";
}

function requestFollowUpLabel(request) {
  if (!request.followUpDate) return "Sin seguimiento definido";
  if (request.status === "Agendada") return "Solicitud agendada";
  if (request.status === "Perdida") return "Oportunidad cerrada";
  if (request.followUpDate < today) return `Seguimiento vencido: ${formatDate(request.followUpDate)}`;
  if (request.followUpDate === today) return "Seguimiento para hoy";
  return `Próximo seguimiento: ${formatDate(request.followUpDate)}`;
}

function patientMessage(patient) {
  if (patient.segments.includes("Inactiva")) {
    return `Hola ${patient.name.split(" ")[0]}, vimos que ha pasado un tiempo desde tu última visita a Beauty Center. Podemos ayudarte a retomar tu tratamiento con una recomendación personalizada.`;
  }
  if (patient.segments.includes("Cumpleaños")) {
    return `Hola ${patient.name.split(" ")[0]}, desde Beauty Center queremos saludarte y dejarte una gift card para tu próxima atención.`;
  }
  return `Hola ${patient.name.split(" ")[0]}, te escribimos de Beauty Center para ayudarte con tu próximo control o sesión pendiente.`;
}

function requestMessage(request) {
  const patient = byId("patients", request.patientId);
  const treatment = byId("treatments", request.treatmentId);
  const firstName = patient?.name?.split(" ")[0] ?? "Hola";
  const treatmentName = treatment?.name ?? "el tratamiento que consultaste";
  if (request.status === "No respondió") {
    return `Hola ${firstName}, te escribimos de Beauty Center por tu consulta sobre ${treatmentName}. Quedamos atentas por si todavía quieres reservar o resolver dudas.`;
  }
  if (request.status === "Contactada" || request.status === "Seguimiento pendiente") {
    return `Hola ${firstName}, ¿cómo estás? Te escribimos de Beauty Center para retomar tu solicitud de ${treatmentName}. Si te acomoda, podemos ayudarte a dejar una hora reservada.`;
  }
  return `Hola ${firstName}, te escribimos de Beauty Center. Recibimos tu solicitud por ${treatmentName} y queríamos ayudarte a confirmar tu reserva.`;
}

function phoneDigits(phone = "") {
  return phone.replace(/\D/g, "");
}

function slugText(value = "") {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function fallbackEmail(name) {
  return `${slugText(name) || "paciente"}@beautycenter.local`;
}

function findPatientByPhone(phone) {
  const digits = phoneDigits(phone);
  if (!digits) return null;
  return state.patients.find((patient) => phoneDigits(patient.phone) === digits) ?? null;
}

function createPatientFromBasicData({ name, phone, origin = "Manual", notes = "Creada desde agenda o solicitud." }) {
  const existing = findPatientByPhone(phone);
  if (existing) return existing;
  const patient = {
    id: uid("pat"),
    name: name.trim(),
    phone: phone.trim(),
    email: fallbackEmail(name),
    origin,
    segments: ["Nueva"],
    notes,
    lastVisit: "",
  };
  state.patients.push(patient);
  return patient;
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function whatsappLink(patient, message = patientMessage(patient)) {
  return `https://wa.me/${phoneDigits(patient.phone)}?text=${encodeURIComponent(message)}`;
}

function requestWhatsappLink(request, message = requestMessage(request)) {
  const patient = byId("patients", request.patientId);
  return patient ? whatsappLink(patient, message) : "#";
}

function emailLink(patient) {
  return `mailto:${patient.email}?subject=${encodeURIComponent("Seguimiento Beauty Center")}&body=${encodeURIComponent(patientMessage(patient))}`;
}

function fillSelect(select, items, labelFn, value = "") {
  select.innerHTML = items.map((item) => `<option value="${item.id}">${labelFn(item)}</option>`).join("");
  if (value) select.value = value;
}

function fillAppointmentSelects(defaults = {}) {
  const professionalId = currentProfessionalId();
  fillSelect($("[data-patient-select]"), visiblePatients(), (patient) => `${patient.name} · ${patient.phone}`, defaults.patientId);
  fillSelect($("[data-treatment-select]"), activeItemsWithCurrent("treatments", defaults.treatmentId), (treatment) => treatment.name, defaults.treatmentId);
  fillSelect($("[data-professional-select]"), professionalId ? state.professionals.filter((item) => item.id === professionalId) : state.professionals, (professional) => professional.name, defaults.professionalId || professionalId);
  fillSelect($("[data-resource-select]"), activeItemsWithCurrent("resources", defaults.resourceId), (resource) => resource.name, defaults.resourceId);
  appointmentForm.elements.time.innerHTML = timeSlots.map((time) => `<option>${time}</option>`).join("");
}

function toggleAppointmentPatientMode() {
  const isNew = appointmentForm.elements.patientMode.value === "new";
  $$("[data-appointment-new-patient-field]").forEach((field) => (field.hidden = !isNew));
  $$("[data-appointment-existing-patient-field]").forEach((field) => (field.hidden = isNew));
  appointmentForm.elements.patientId.required = !isNew;
  appointmentForm.elements.newPatientName.required = isNew;
  appointmentForm.elements.newPatientPhone.required = isNew;
}

function openAppointmentModal(defaults = {}) {
  fillAppointmentSelects(defaults);
  appointmentForm.reset();
  fillAppointmentSelects(defaults);
  appointmentForm.elements.id.value = defaults.id ?? "";
  appointmentForm.elements.patientMode.value = defaults.patientMode ?? "existing";
  appointmentForm.elements.patientId.value = defaults.patientId ?? visiblePatients()[0]?.id ?? "";
  appointmentForm.elements.newPatientName.value = defaults.newPatientName ?? "";
  appointmentForm.elements.newPatientPhone.value = defaults.newPatientPhone ?? "";
  appointmentForm.elements.treatmentId.value = defaults.treatmentId ?? state.treatments[0].id;
  appointmentForm.elements.professionalId.value = defaults.professionalId ?? (currentProfessionalId() || state.professionals[0].id);
  const treatment = byId("treatments", appointmentForm.elements.treatmentId.value);
  appointmentForm.elements.resourceId.value = defaults.resourceId ?? treatment?.resourceId ?? "res-none";
  appointmentForm.elements.date.value = defaults.date ?? defaultAppointmentDate();
  appointmentForm.elements.time.value = defaults.time ?? "09:00";
  appointmentForm.elements.status.value = defaults.status ?? "confirmed";
  appointmentForm.elements.note.value = defaults.note ?? "";
  $("[data-appointment-modal-title]").textContent = defaults.id ? "Editar hora" : "Nueva hora";
  $("[data-delete-appointment]").hidden = !defaults.id || !isAdmin();
  toggleAppointmentPatientMode();
  updateSlotHint();
  appointmentModal.showModal();
}

function openPatientModal(patient = null) {
  patientForm.reset();
  patientForm.elements.id.value = patient?.id ?? "";
  patientForm.elements.name.value = patient?.name ?? "";
  patientForm.elements.phone.value = patient?.phone ?? "";
  patientForm.elements.email.value = patient?.email ?? "";
  patientForm.elements.origin.value = patient?.origin ?? "WhatsApp";
  patientForm.elements.segments.value = patient?.segments?.join(", ") ?? "Nueva";
  patientForm.elements.notes.value = patient?.notes ?? "";
  $("[data-patient-modal-title]").textContent = patient ? "Editar paciente" : "Nuevo paciente";
  patientModal.showModal();
}

function openPlanModal(plan = null, patientId = state.selectedPatientId) {
  planForm.reset();
  fillSelect($("[data-plan-treatment-select]"), activeItemsWithCurrent("treatments", plan?.treatmentId), (treatment) => treatment.name, plan?.treatmentId);
  planForm.elements.id.value = plan?.id ?? "";
  planForm.elements.patientId.value = plan?.patientId ?? patientId;
  planForm.elements.treatmentId.value = plan?.treatmentId ?? state.treatments[0].id;
  planForm.elements.purchasedSessions.value = plan?.purchasedSessions ?? 6;
  planForm.elements.completedSessions.value = plan?.completedSessions ?? 0;
  planForm.elements.status.value = plan?.status ?? "active";
  planForm.elements.nextAction.value = plan?.nextAction ?? "Agendar próxima sesión";
  planModal.showModal();
}

function openSessionModal(planId) {
  const plan = byId("plans", planId);
  if (!plan) return;
  const treatment = byId("treatments", plan.treatmentId);
  const patient = byId("patients", plan.patientId);
  const nextSession = Math.min(plan.completedSessions + 1, plan.purchasedSessions);
  const professionalId = currentProfessionalId() || state.professionals[0].id;
  sessionForm.reset();
  fillSelect($("[data-session-professional-select]"), state.professionals, (professional) => professional.name, professionalId);
  sessionForm.elements.planId.value = plan.id;
  sessionForm.elements.date.value = today;
  sessionForm.elements.professionalId.value = professionalId;
  sessionForm.elements.note.value = `Sesión ${nextSession} de ${plan.purchasedSessions}. `;
  sessionForm.elements.nextAction.value = plan.nextAction ?? "";
  $("[data-session-modal-title]").textContent = `${patient?.name ?? "Paciente"} · ${treatment?.name ?? "Tratamiento"}`;
  sessionModal.showModal();
}

function openHistoryModal(history) {
  if (!history) return;
  historyForm.reset();
  fillSelect($("[data-history-professional-select]"), state.professionals, (professional) => professional.name, history.professionalId);
  historyForm.elements.id.value = history.id;
  historyForm.elements.date.value = history.date;
  historyForm.elements.professionalId.value = history.professionalId || state.professionals[0].id;
  historyForm.elements.note.value = history.note ?? "";
  historyModal.showModal();
}

function openRequestModal() {
  requestForm.reset();
  fillSelect($("[data-request-patient-select]"), state.patients, (patient) => `${patient.name} · ${patient.phone}`);
  fillSelect($("[data-request-treatment-select]"), activeItemsWithCurrent("treatments"), (treatment) => treatment.name);
  fillSelect($("[data-request-professional-select]"), state.professionals, (professional) => professional.name);
  requestForm.elements.date.value = today;
  requestForm.elements.status.value = "Pendiente de pago";
  requestForm.elements.followUpDate.value = addDays(today, 2);
  requestForm.elements.time.innerHTML = timeSlots.map((time) => `<option>${time}</option>`).join("");
  toggleRequestMode();
  requestModal.showModal();
}

function updateSlotHint() {
  const data = Object.fromEntries(new FormData(appointmentForm));
  const conflict = hasAppointmentConflict(data);
  const resourceBookings = resourcesForSlot(data.date, data.time, data.id);
  const resourceCopy = resourceBookings.length
    ? ` Recursos ocupados: ${resourceBookings.map(formatResourceBooking).join("; ")}.`
    : " Recursos libres en este horario.";
  $("[data-slot-hint]").textContent = conflict
    ? `Atención: ese profesional o recurso ya está reservado en ese horario.${resourceCopy}`
    : `Horario disponible para guardar.${resourceCopy}`;
}

function resourcesForSlot(date, time, ignoredAppointmentId = "") {
  return state.appointments
    .filter((appointment) => {
      if (appointment.id === ignoredAppointmentId || appointment.status === "cancelled" || appointment.resourceId === "res-none") return false;
      return appointment.date === date && appointment.time === time;
    })
    .sort((a, b) => a.resourceId.localeCompare(b.resourceId));
}

function formatResourceBooking(appointment) {
  const resource = byId("resources", appointment.resourceId);
  const professional = byId("professionals", appointment.professionalId);
  return `${resource?.name ?? "Recurso"} por ${professional?.name ?? "equipo"}`;
}

function hasAppointmentConflict(candidate) {
  return state.appointments.some((appointment) => {
    if (appointment.id === candidate.id || appointment.status === "cancelled") return false;
    return (
      appointment.date === candidate.date &&
      appointment.time === candidate.time &&
      (appointment.professionalId === candidate.professionalId ||
        (candidate.resourceId !== "res-none" && appointment.resourceId === candidate.resourceId))
    );
  });
}

function saveAppointment(event) {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(appointmentForm));
  let patientId = data.patientId;
  if (data.patientMode === "new") {
    const patient = createPatientFromBasicData({
      name: data.newPatientName,
      phone: data.newPatientPhone,
      origin: "Agenda",
      notes: "Creada desde una hora agendada.",
    });
    patientId = patient.id;
  }
  data.patientId = patientId;
  if (hasAppointmentConflict(data)) {
    showToast("Ese profesional o recurso ya tiene una reserva en ese horario.");
    return;
  }
  const treatment = byId("treatments", data.treatmentId);
  const plan = getPlanForPatient(patientId, data.treatmentId);
  const appointment = {
    id: data.id || uid("apt"),
    patientId,
    treatmentId: data.treatmentId,
    planId: plan?.id ?? "",
    professionalId: data.professionalId,
    resourceId: data.resourceId || treatment?.resourceId || "res-none",
    date: data.date,
    time: data.time,
    status: data.status,
    paymentStatus: data.status === "paid" ? "paid" : (byId("appointments", data.id)?.paymentStatus ?? "pending"),
    note: data.note,
  };
  const index = state.appointments.findIndex((item) => item.id === appointment.id);
  if (index >= 0) state.appointments[index] = appointment;
  else state.appointments.push(appointment);
  if (pendingRequestId) {
    const request = byId("requests", pendingRequestId);
    if (request) request.status = "Agendada";
    pendingRequestId = "";
  }
  if (appointment.status === "attended") registerAttendance(appointment.id, false);
  saveState();
  appointmentModal.close();
  render();
  showToast("Hora guardada y vinculada al paciente.");
}

function savePatient(event) {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(patientForm));
  const patient = {
    id: data.id || uid("pat"),
    name: data.name.trim(),
    phone: data.phone.trim(),
    email: data.email.trim(),
    origin: data.origin,
    segments: data.segments.split(",").map((item) => item.trim()).filter(Boolean),
    notes: data.notes.trim(),
    lastVisit: byId("patients", data.id)?.lastVisit ?? "",
  };
  const index = state.patients.findIndex((item) => item.id === patient.id);
  if (index >= 0) state.patients[index] = patient;
  else state.patients.push(patient);
  state.selectedPatientId = patient.id;
  saveState();
  patientModal.close();
  render();
  showToast("Paciente guardada.");
}

function savePlan(event) {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(planForm));
  const previousPlan = byId("plans", data.id);
  const plan = {
    id: data.id || uid("plan"),
    patientId: data.patientId,
    treatmentId: data.treatmentId,
    purchasedSessions: Number(data.purchasedSessions),
    completedSessions: Number(data.completedSessions),
    status: data.status,
    nextAction: data.nextAction,
  };
  if (plan.completedSessions < plan.purchasedSessions && plan.status === "completed") plan.status = "active";
  const index = state.plans.findIndex((item) => item.id === plan.id);
  if (index >= 0) state.plans[index] = plan;
  else state.plans.push(plan);
  syncPlanHistoryAfterEdit(previousPlan, plan);
  saveState();
  planModal.close();
  render();
  showToast("Plan actualizado.");
}

function newestSessionHistoriesForPlan(planId) {
  return state.histories
    .filter((history) => history.planId === planId && history.sessionEntry)
    .slice()
    .sort((a, b) => `${b.date}${b.id}`.localeCompare(`${a.date}${a.id}`));
}

function syncPlanHistoryAfterEdit(previousPlan, nextPlan) {
  if (!previousPlan || nextPlan.completedSessions >= previousPlan.completedSessions) return;
  const sessionsToRemove = previousPlan.completedSessions - nextPlan.completedSessions;
  const removable = newestSessionHistoriesForPlan(nextPlan.id).slice(0, sessionsToRemove);
  const removableIds = new Set(removable.map((history) => history.id));
  state.histories = state.histories.filter((history) => !removableIds.has(history.id));
}

function saveRequest(event) {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(requestForm));
  let patientId = data.patientId;
  if (data.mode === "new") {
    const patient = createPatientFromBasicData({
      name: data.newName,
      phone: data.newPhone,
      origin: data.source,
      notes: "Creada desde solicitud manual/web.",
    });
    patientId = patient.id;
  }
  state.requests.unshift({
    id: uid("req"),
    patientId,
    treatmentId: data.treatmentId,
    professionalId: data.professionalId,
    date: data.date,
    time: data.time,
    source: data.source,
    status: data.status || "Pendiente de pago",
    followUpDate: data.followUpDate || addDays(data.date || today, 2),
    note: data.note,
  });
  state.selectedPatientId = patientId;
  saveState();
  requestModal.close();
  render();
  showToast("Solicitud guardada y vinculada al CRM.");
}

function registerAttendance(appointmentId, shouldRender = true) {
  const appointment = byId("appointments", appointmentId);
  if (!appointment) return;
  appointment.status = "attended";
  const patient = byId("patients", appointment.patientId);
  if (patient) patient.lastVisit = appointment.date;
  const plan = appointment.planId ? byId("plans", appointment.planId) : getPlanForPatient(appointment.patientId, appointment.treatmentId);
  if (plan && plan.completedSessions < plan.purchasedSessions) {
    plan.completedSessions += 1;
    if (plan.completedSessions >= plan.purchasedSessions) plan.status = "completed";
  }
  const alreadyExists = state.histories.some((history) => history.appointmentId === appointment.id);
  if (!alreadyExists) {
    state.histories.push({
      id: uid("his"),
      patientId: appointment.patientId,
      appointmentId: appointment.id,
      planId: plan?.id ?? "",
      treatmentId: appointment.treatmentId,
      professionalId: appointment.professionalId,
      date: appointment.date,
      note: appointment.note || "Atención registrada desde agenda.",
      sessionEntry: Boolean(plan),
    });
  }
  saveState();
  if (shouldRender) {
    render();
    showToast("Atención registrada: historial y sesiones actualizados.");
  }
}

function registerPlanSession(planId) {
  return openSessionModal(planId);
}

function saveSession(event) {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(sessionForm));
  const plan = byId("plans", data.planId);
  if (!plan) return;
  if (plan.completedSessions < plan.purchasedSessions) plan.completedSessions += 1;
  if (plan.completedSessions >= plan.purchasedSessions) plan.status = "completed";
  else if (plan.status === "completed") plan.status = "active";
  if (data.nextAction.trim()) plan.nextAction = data.nextAction.trim();
  const patient = byId("patients", plan.patientId);
  if (patient) patient.lastVisit = data.date;
  state.histories.push({
    id: uid("his"),
    patientId: plan.patientId,
    appointmentId: "",
    planId: plan.id,
    treatmentId: plan.treatmentId,
    professionalId: data.professionalId,
    date: data.date,
    note: data.note.trim(),
    sessionEntry: true,
  });
  saveState();
  sessionModal.close();
  render();
  showToast("Sesión registrada con nota en historial.");
}

function saveHistory(event) {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(historyForm));
  const history = byId("histories", data.id);
  if (!history) return;
  history.date = data.date;
  history.professionalId = data.professionalId;
  history.note = data.note.trim();
  const patient = byId("patients", history.patientId);
  if (patient && (!patient.lastVisit || history.date >= patient.lastVisit)) patient.lastVisit = history.date;
  saveState();
  historyModal.close();
  render();
  showToast("Historial actualizado.");
}

function deleteHistory(historyId, shouldRender = true) {
  const history = byId("histories", historyId);
  if (!history) return;
  if (history.planId && history.sessionEntry) {
    const plan = byId("plans", history.planId);
    if (plan) {
      plan.completedSessions = Math.max(0, plan.completedSessions - 1);
      if (plan.completedSessions < plan.purchasedSessions && plan.status === "completed") plan.status = "active";
    }
  }
  state.histories = state.histories.filter((item) => item.id !== historyId);
  saveState();
  if (shouldRender) {
    render();
    showToast("Registro eliminado del historial.");
  }
}

function deleteLastPlanSession(planId) {
  const lastSession = newestSessionHistoriesForPlan(planId)[0];
  const plan = byId("plans", planId);
  if (lastSession) return deleteHistory(lastSession.id);
  if (plan && plan.completedSessions > 0) {
    plan.completedSessions -= 1;
    if (plan.completedSessions < plan.purchasedSessions && plan.status === "completed") plan.status = "active";
    saveState();
    render();
    showToast("Sesión descontada del plan.");
    return;
  }
  showToast("No hay sesiones para eliminar.");
}

function registerPlanSessionLegacy(planId) {
  const plan = byId("plans", planId);
  if (!plan) return;
  const professionalId = currentProfessionalId() || state.professionals[0].id;
  if (plan.completedSessions < plan.purchasedSessions) plan.completedSessions += 1;
  if (plan.completedSessions >= plan.purchasedSessions) plan.status = "completed";
  const patient = byId("patients", plan.patientId);
  if (patient) patient.lastVisit = today;
  state.histories.push({
    id: uid("his"),
    patientId: plan.patientId,
    appointmentId: "",
    treatmentId: plan.treatmentId,
    professionalId,
    date: today,
    note: `Sesión registrada manualmente. Avance ${plan.completedSessions}/${plan.purchasedSessions}.`,
  });
  saveState();
  render();
  showToast("Sesión sumada al plan e historial.");
}

function updateRequestStatus(requestId, status) {
  const request = byId("requests", requestId);
  if (!request) return;
  request.status = status;
  if (status === "Contactada" && (!request.followUpDate || request.followUpDate <= today)) {
    request.followUpDate = addDays(today, 3);
  }
  if (status === "No respondió" && (!request.followUpDate || request.followUpDate <= today)) {
    request.followUpDate = addDays(today, 2);
  }
  if (status === "Seguimiento pendiente" && !request.followUpDate) {
    request.followUpDate = addDays(today, 1);
  }
  saveState();
  render();
  showToast("Estado de solicitud actualizado.");
}

function updateRequestFollowUp(requestId, followUpDate) {
  const request = byId("requests", requestId);
  if (!request) return;
  request.followUpDate = followUpDate;
  if (!["Agendada", "Perdida"].includes(request.status)) request.status = "Seguimiento pendiente";
  saveState();
  render();
  showToast("Seguimiento actualizado.");
}

function clearAccessForm() {
  const form = $("[data-access-form]");
  if (!form) return;
  form.reset();
  form.elements.userId.value = "";
  form.elements.professionalId.value = "";
  form.elements.role.value = "professional";
  form.elements.active.value = "true";
  setAccessPreview("");
}

function fillAccessForm(userId) {
  const user = byId("users", userId);
  const form = $("[data-access-form]");
  if (!user || !form) return;
  const professional = user.professionalId ? byId("professionals", user.professionalId) : null;
  form.elements.userId.value = user.id;
  form.elements.professionalId.value = professional?.id ?? "";
  form.elements.name.value = user.name;
  form.elements.role.value = user.role;
  form.elements.professionalRole.value = professional?.role ?? "";
  form.elements.email.value = user.email;
  form.elements.password.value = user.password;
  form.elements.active.value = String(user.active !== false);
  setAccessPreview(accessImageForUser(user));
}

function saveAccess(event) {
  event.preventDefault();
  const form = event.target;
  const data = Object.fromEntries(new FormData(form));
  let professionalId = data.professionalId;

  if (data.role === "professional") {
    if (professionalId) {
      const professional = byId("professionals", professionalId);
      if (professional) {
        professional.name = data.name.trim();
        professional.role = data.professionalRole.trim() || "Profesional";
        professional.image = data.image || professional.image || "./assets/logo-beauty-center.jpg";
      }
    } else {
      professionalId = uid(`pro-${slugText(data.name) || "profesional"}`);
      state.professionals.push({
        id: professionalId,
        name: data.name.trim(),
        role: data.professionalRole.trim() || "Profesional",
        image: data.image || "./assets/logo-beauty-center.jpg",
      });
    }
  } else {
    professionalId = "";
  }

  const user = {
    id: data.userId || uid("user"),
    name: data.name.trim(),
    email: normalizeEmail(data.email),
    password: normalizePassword(data.password),
    role: data.role,
    professionalId,
    image: data.image || (data.role === "admin" ? "./assets/logo-beauty-center.jpg" : ""),
    active: data.active === "true",
  };

  const index = state.users.findIndex((item) => item.id === user.id);
  if (index >= 0) state.users[index] = user;
  else state.users.push(user);
  saveState();
  render();
  showToast("Acceso guardado.");
}

function clearResourceForm() {
  const form = $("[data-resource-form]");
  if (!form) return;
  form.reset();
  form.elements.resourceId.value = "";
  form.elements.type.value = "Equipo";
  form.elements.active.value = "true";
}

function fillResourceForm(resourceId) {
  const resource = byId("resources", resourceId);
  const form = $("[data-resource-form]");
  if (!resource || !form) return;
  form.elements.resourceId.value = resource.id;
  form.elements.name.value = resource.name;
  form.elements.type.value = resource.type || inferResourceType(resource.name);
  form.elements.active.value = String(resource.active !== false);
}

function saveResource(event) {
  event.preventDefault();
  const form = event.target;
  const data = Object.fromEntries(new FormData(form));
  const resource = {
    id: data.resourceId || uid(`res-${slugText(data.name) || "recurso"}`),
    name: data.name.trim(),
    type: data.type || inferResourceType(data.name),
    active: data.active === "true",
  };
  const index = state.resources.findIndex((item) => item.id === resource.id);
  if (index >= 0) state.resources[index] = { ...state.resources[index], ...resource };
  else state.resources.push(resource);
  saveState();
  render();
  showToast("Recurso guardado.");
}

function clearTreatmentForm() {
  const form = $("[data-treatment-form]");
  if (!form) return;
  form.reset();
  fillSelect($("[data-treatment-resource-select]"), activeItemsWithCurrent("resources"), (resource) => resource.name);
  form.elements.treatmentId.value = "";
  form.elements.defaultSessions.value = 1;
  form.elements.resourceId.value = state.resources.find((resource) => resource.id === "res-none")?.id ?? activeItemsWithCurrent("resources")[0]?.id ?? "";
  form.elements.active.value = "true";
}

function fillTreatmentForm(treatmentId) {
  const treatment = byId("treatments", treatmentId);
  const form = $("[data-treatment-form]");
  if (!treatment || !form) return;
  fillSelect($("[data-treatment-resource-select]"), activeItemsWithCurrent("resources", treatment.resourceId), (resource) => resource.name, treatment.resourceId);
  form.elements.treatmentId.value = treatment.id;
  form.elements.name.value = treatment.name;
  form.elements.defaultSessions.value = treatment.defaultSessions ?? 1;
  form.elements.resourceId.value = treatment.resourceId || "res-none";
  form.elements.active.value = String(treatment.active !== false);
}

function saveTreatment(event) {
  event.preventDefault();
  const form = event.target;
  const data = Object.fromEntries(new FormData(form));
  const previous = byId("treatments", data.treatmentId);
  const treatment = {
    id: data.treatmentId || uid(`trt-${slugText(data.name) || "tratamiento"}`),
    name: data.name.trim(),
    price: previous?.price ?? 0,
    defaultSessions: Math.max(1, Number(data.defaultSessions || 1)),
    resourceId: data.resourceId || "res-none",
    active: data.active === "true",
  };
  const index = state.treatments.findIndex((item) => item.id === treatment.id);
  if (index >= 0) state.treatments[index] = { ...state.treatments[index], ...treatment };
  else state.treatments.push(treatment);
  saveState();
  render();
  showToast("Tratamiento guardado.");
}

function handleLogin(event) {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(loginForm));
  const email = normalizeEmail(data.email);
  const password = normalizePassword(data.password);
  let user = state.users.find(
    (item) =>
      item.active !== false &&
      normalizeEmail(item.email) === email &&
      normalizePassword(item.password) === password
  );

  if (!user && email === baseAdminAccess.email && password === baseAdminAccess.password) {
    user = ensureBaseAdmin();
    saveState();
  }

  if (!user) {
    loginError.hidden = false;
    return;
  }

  loginError.hidden = true;
  loginForm.reset();
  state.currentUserId = user.id;
  state.activeView = "dashboard";
  state.selectedSegment = "all";
  state.crmFilters = { ...defaultCrmFilters };
  if (searchInput) searchInput.value = "";
  welcomeGateOpen = true;
  const first = filteredPatients()[0] ?? visiblePatients()[0];
  if (first) state.selectedPatientId = first.id;
  saveState();
  render();
}

function logout() {
  state.currentUserId = "";
  welcomeGateOpen = false;
  saveState();
  render();
}

function resetBaseAccess() {
  ensureBaseAdmin();
  state.currentUserId = "";
  welcomeGateOpen = false;
  saveState();
  loginForm.reset();
  loginError.hidden = true;
  showToast("Acceso de administración restablecido.");
}

function deleteAppointment() {
  if (!isAdmin()) return;
  const id = appointmentForm.elements.id.value;
  state.appointments = state.appointments.filter((appointment) => appointment.id !== id);
  saveState();
  appointmentModal.close();
  render();
  showToast("Hora eliminada.");
}

function toggleRequestMode() {
  const isNew = requestForm.elements.mode.value === "new";
  $$("[data-new-patient-field]").forEach((field) => (field.hidden = !isNew));
  $$("[data-existing-patient-field]").forEach((field) => (field.hidden = isNew));
  requestForm.elements.patientId.required = !isNew;
  requestForm.elements.newName.required = isNew;
  requestForm.elements.newPhone.required = isNew;
}

function exportJson() {
  const blob = new Blob([dataAdapter.exportSnapshot(state)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "beauty-center-respaldo.json";
  link.click();
  URL.revokeObjectURL(url);
}

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("No se pudo leer la imagen."));
    };
    image.src = url;
  });
}

async function compressProfileImage(file) {
  if (!file?.type?.startsWith("image/")) throw new Error("Selecciona una imagen válida.");
  const image = await loadImageFromFile(file);
  const size = 320;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  const sourceSize = Math.min(image.naturalWidth || image.width, image.naturalHeight || image.height);
  const sourceX = ((image.naturalWidth || image.width) - sourceSize) / 2;
  const sourceY = ((image.naturalHeight || image.height) - sourceSize) / 2;
  context.drawImage(image, sourceX, sourceY, sourceSize, sourceSize, 0, 0, size, size);
  return canvas.toDataURL("image/webp", 0.76);
}

document.addEventListener("click", (event) => {
  const nav = event.target.closest("[data-view]");
  if (nav) return setActiveView(nav.dataset.view);

  if (event.target.closest("[data-open-appointment]")) return openAppointmentModal();
  if (event.target.closest("[data-new-patient]")) return openPatientModal();
  if (event.target.closest("[data-open-request]")) return openRequestModal();

  const weekMove = event.target.closest("[data-agenda-week-move]");
  if (weekMove) return setAgendaDate(addDays(state.agendaDate || today, Number(weekMove.dataset.agendaWeekMove)));

  const monthMove = event.target.closest("[data-agenda-month-move]");
  if (monthMove) return setAgendaDate(addMonths(state.agendaDate || today, Number(monthMove.dataset.agendaMonthMove)));

  if (event.target.closest("[data-agenda-today]")) return setAgendaDate(today);

  const slot = event.target.closest("[data-new-slot]");
  if (slot) return openAppointmentModal({ date: slot.dataset.date, time: slot.dataset.time, professionalId: currentProfessionalId() || state.professionals[0].id });

  const editAppointment = event.target.closest("[data-edit-appointment]");
  if (editAppointment) return openAppointmentModal(byId("appointments", editAppointment.dataset.editAppointment));

  const selectPatient = event.target.closest("[data-select-patient]");
  if (selectPatient) {
    state.selectedPatientId = selectPatient.dataset.selectPatient;
    state.activeView = "pacientes";
    saveState();
    return render();
  }

  const schedulePatient = event.target.closest("[data-schedule-patient]");
  if (schedulePatient) return openAppointmentModal({ patientId: schedulePatient.dataset.schedulePatient, professionalId: currentProfessionalId() || state.professionals[0].id });

  const editPatient = event.target.closest("[data-edit-patient]");
  if (editPatient) return openPatientModal(byId("patients", editPatient.dataset.editPatient));

  const editPlan = event.target.closest("[data-edit-plan]");
  if (editPlan) return openPlanModal(byId("plans", editPlan.dataset.editPlan));

  const newPlan = event.target.closest("[data-new-plan]");
  if (newPlan) return openPlanModal(null, newPlan.dataset.newPlan);

  const registerSession = event.target.closest("[data-register-session]");
  if (registerSession) return registerPlanSession(registerSession.dataset.registerSession);

  const deleteLastSession = event.target.closest("[data-delete-last-session]");
  if (deleteLastSession) return deleteLastPlanSession(deleteLastSession.dataset.deleteLastSession);

  const editHistory = event.target.closest("[data-edit-history]");
  if (editHistory) return openHistoryModal(byId("histories", editHistory.dataset.editHistory));

  const deleteHistoryButton = event.target.closest("[data-delete-history]");
  if (deleteHistoryButton) return deleteHistory(deleteHistoryButton.dataset.deleteHistory);

  const markAttended = event.target.closest("[data-mark-attended]");
  if (markAttended) return registerAttendance(markAttended.dataset.markAttended);

  const requestSchedule = event.target.closest("[data-schedule-request]");
  if (requestSchedule) {
    const request = byId("requests", requestSchedule.dataset.scheduleRequest);
    pendingRequestId = request.id;
    return openAppointmentModal({ patientId: request.patientId, treatmentId: request.treatmentId, professionalId: request.professionalId, date: request.date, time: request.time, status: "confirmed" });
  }

  const contactRequest = event.target.closest("[data-contact-request]");
  if (contactRequest) {
    const request = byId("requests", contactRequest.dataset.contactRequest);
    if (request) request.status = "Contactada";
    saveState();
    render();
    return showToast("Solicitud marcada como contactada.");
  }

  const segment = event.target.closest("[data-segment]");
  if (segment) {
    state.selectedSegment = segment.dataset.segment;
    const first = filteredPatients()[0];
    if (first) state.selectedPatientId = first.id;
    saveState();
    return render();
  }

  if (event.target.closest("[data-reset-data]")) {
    const confirmed = window.confirm("¿Seguro que quieres reiniciar los datos de esta instalación? Esta acción reemplaza pacientes, citas y configuración por los datos iniciales.");
    if (!confirmed) return;
    state = normalizeState(dataAdapter.reset());
    render();
    return showToast("Datos reiniciados.");
  }

  if (event.target.closest("[data-export-json]")) return exportJson();

  const editAccess = event.target.closest("[data-edit-access]");
  if (editAccess) return fillAccessForm(editAccess.dataset.editAccess);

  if (event.target.closest("[data-clear-access-form]")) return clearAccessForm();

  if (event.target.closest("[data-clear-access-image]")) {
    setAccessPreview("./assets/logo-beauty-center.jpg");
    return showToast("Foto quitada del acceso.");
  }

  const editResource = event.target.closest("[data-edit-resource]");
  if (editResource) return fillResourceForm(editResource.dataset.editResource);

  if (event.target.closest("[data-clear-resource-form]")) return clearResourceForm();

  const editTreatment = event.target.closest("[data-edit-treatment]");
  if (editTreatment) return fillTreatmentForm(editTreatment.dataset.editTreatment);

  if (event.target.closest("[data-clear-treatment-form]")) return clearTreatmentForm();

  if (event.target.closest("[data-clear-crm-filters]")) {
    state.crmFilters = { ...defaultCrmFilters };
    const first = filteredPatients()[0] ?? visiblePatients()[0];
    if (first) state.selectedPatientId = first.id;
    saveState();
    return render();
  }

  if (event.target.closest("[data-reset-access]")) return resetBaseAccess();

  if (event.target.closest("[data-logout]")) return logout();

  if (event.target.closest("[data-enter-system]")) {
    welcomeGateOpen = false;
    return render();
  }

  if (event.target.closest("[data-close-modal]")) {
    pendingRequestId = "";
    event.target.closest("dialog")?.close();
  }
});

loginForm.addEventListener("submit", handleLogin);
appointmentForm.addEventListener("submit", saveAppointment);
patientForm.addEventListener("submit", savePatient);
planForm.addEventListener("submit", savePlan);
sessionForm.addEventListener("submit", saveSession);
historyForm.addEventListener("submit", saveHistory);
requestForm.addEventListener("submit", saveRequest);

appointmentForm.addEventListener("change", (event) => {
  if (event.target.name === "patientMode") toggleAppointmentPatientMode();
  if (event.target.name === "treatmentId") {
    const treatment = byId("treatments", event.target.value);
    appointmentForm.elements.resourceId.value = treatment?.resourceId ?? "res-none";
  }
  updateSlotHint();
});

requestForm.addEventListener("change", (event) => {
  if (event.target.name === "mode") toggleRequestMode();
});

document.addEventListener("change", async (event) => {
  const imageInput = event.target.closest("[data-access-image-input]");
  if (imageInput) {
    const file = imageInput.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressProfileImage(file);
      setAccessPreview(compressed);
      showToast("Foto comprimida y lista para guardar.");
    } catch (error) {
      showToast(error.message || "No se pudo procesar la foto.");
    } finally {
      imageInput.value = "";
    }
    return;
  }

  const dateInput = event.target.closest("[data-agenda-date]");
  if (dateInput) return setAgendaDate(dateInput.value);

  const monthInput = event.target.closest("[data-agenda-month]");
  if (monthInput?.value) return setAgendaDate(`${monthInput.value}-01`);

  const crmFilter = event.target.closest("[data-crm-filter]");
  if (crmFilter) {
    state.crmFilters = { ...defaultCrmFilters, ...(state.crmFilters ?? {}), [crmFilter.dataset.crmFilter]: crmFilter.value };
    const first = filteredPatients()[0];
    if (first) state.selectedPatientId = first.id;
    saveState();
    return render();
  }

  const requestStatus = event.target.closest("[data-request-status]");
  if (requestStatus) return updateRequestStatus(requestStatus.dataset.requestStatus, requestStatus.value);

  const requestFollowUp = event.target.closest("[data-request-follow-up]");
  if (requestFollowUp) return updateRequestFollowUp(requestFollowUp.dataset.requestFollowUp, requestFollowUp.value);
});

$("[data-delete-appointment]").addEventListener("click", deleteAppointment);

searchInput.addEventListener("input", render);

document.addEventListener("submit", (event) => {
  if (event.target.matches("[data-access-form]")) saveAccess(event);
  if (event.target.matches("[data-resource-form]")) saveResource(event);
  if (event.target.matches("[data-treatment-form]")) saveTreatment(event);
});

document.addEventListener("input", (event) => {
  const textArea = event.target.closest("[data-message-text]");
  if (textArea) {
    const patient = byId("patients", textArea.dataset.messageText);
    const link = $(`[data-whatsapp-message-link="${textArea.dataset.messageText}"]`);
    if (patient && link) link.href = whatsappLink(patient, textArea.value);
  }

  const requestTextArea = event.target.closest("[data-request-message]");
  if (requestTextArea) {
    const request = byId("requests", requestTextArea.dataset.requestMessage);
    const link = $(`[data-request-whatsapp-link="${requestTextArea.dataset.requestMessage}"]`);
    if (request && link) link.href = requestWhatsappLink(request, requestTextArea.value);
  }
});

render();
