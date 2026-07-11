import { createClient } from "https://esm.sh/@supabase/supabase-js@2.110.1";

const defaultAllowedOrigins = [
  "https://systembeautycenter.vercel.app",
  "https://sistembeautycenter.vercel.app",
  "https://beautycenter-system-cofrefrancisco2020-cpus-projects.vercel.app",
  "http://127.0.0.1:5173",
  "http://localhost:5173",
];

const allowedOrigins = new Set(
  (Deno.env.get("ALLOWED_ORIGINS") || defaultAllowedOrigins.join(","))
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
);

const corsHeaders = (origin = "") => ({
  "Access-Control-Allow-Origin": allowedOrigins.has(origin) ? origin : defaultAllowedOrigins[0],
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
});

const json = (body: unknown, status = 200, origin = "") =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  const origin = req.headers.get("Origin") || "";
  if (origin && !allowedOrigins.has(origin)) return json({ error: "Origen no permitido." }, 403, origin);
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(origin) });
  if (req.method !== "POST") return json({ error: "Metodo no permitido." }, 405, origin);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = serviceRoleKey();
  if (!supabaseUrl || !serviceKey) {
    return json({ error: "Faltan variables seguras de Supabase en la funcion." }, 500, origin);
  }

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { apikey: serviceKey } },
  });

  const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return json({ error: "Sesion requerida." }, 401, origin);

  const { data: caller, error: callerError } = await admin.auth.getUser(token);
  if (callerError || !caller.user) return json({ error: "Sesion invalida." }, 401, origin);

  const { data: callerProfile, error: callerProfileError } = await admin
    .from("app_users")
    .select("id, role, active")
    .eq("auth_user_id", caller.user.id)
    .maybeSingle();

  if (callerProfileError) return json({ error: callerProfileError.message }, 500, origin);
  if (!callerProfile || callerProfile.role !== "admin" || callerProfile.active === false) {
    return json({ error: "Solo administracion puede crear o editar accesos." }, 403, origin);
  }

  let payload: AccessPayload;
  try {
    payload = await req.json();
  } catch {
    return json({ error: "Datos invalidos." }, 400, origin);
  }

  const normalized = normalizePayload(payload);
  const validationError = validatePayload(normalized);
  if (validationError) return json({ error: validationError }, 400, origin);

  const { data: existingUser, error: existingError } = await admin
    .from("app_users")
    .select("id, auth_user_id, professional_id")
    .eq("id", normalized.userId)
    .maybeSingle();

  if (existingError) return json({ error: existingError.message }, 500, origin);
  if (!existingUser && !normalized.password) {
    return json({ error: "La contrasena es obligatoria para crear un acceso nuevo." }, 400, origin);
  }

  let authUserId = existingUser?.auth_user_id as string | null;
  let createdAuthUser = false;

  try {
    if (authUserId) {
      const { error } = await admin.auth.admin.updateUserById(authUserId, {
        email: normalized.email,
        password: normalized.password || undefined,
        email_confirm: true,
        user_metadata: {
          name: normalized.name,
          role: normalized.role,
          professional_id: normalized.professionalId || null,
        },
      });
      if (error) throw error;
    } else {
      const { data: created, error } = await admin.auth.admin.createUser({
        email: normalized.email,
        password: normalized.password,
        email_confirm: true,
        user_metadata: {
          name: normalized.name,
          role: normalized.role,
          professional_id: normalized.professionalId || null,
        },
      });
      if (error) throw error;
      authUserId = created.user?.id ?? "";
      createdAuthUser = Boolean(authUserId);
    }

    if (normalized.role === "professional") {
      const { error } = await admin.from("professionals").upsert({
        id: normalized.professionalId,
        name: normalized.name,
        role: normalized.professionalRole || "Profesional",
        email: normalized.email,
        image: normalized.image || null,
        active: normalized.active,
      });
      if (error) throw error;
    }

    const { data: savedUser, error: saveUserError } = await admin
      .from("app_users")
      .upsert({
        id: normalized.userId,
        auth_user_id: authUserId,
        name: normalized.name,
        email: normalized.email,
        role: normalized.role,
        professional_id: normalized.role === "professional" ? normalized.professionalId : null,
        image: normalized.image || (normalized.role === "admin" ? "./assets/logo-beauty-center.jpg" : null),
        active: normalized.active,
      })
      .select("id, auth_user_id, name, email, role, professional_id, image, active")
      .single();

    if (saveUserError) throw saveUserError;

    return json({ user: savedUser, professionalId: normalized.professionalId || null }, 200, origin);
  } catch (error) {
    if (createdAuthUser && authUserId) {
      await admin.auth.admin.deleteUser(authUserId);
    }
    return json({ error: error instanceof Error ? error.message : "No se pudo guardar el acceso." }, 400, origin);
  }
});

type AccessPayload = {
  userId?: string;
  professionalId?: string;
  name?: string;
  email?: string;
  password?: string;
  role?: string;
  professionalRole?: string;
  image?: string;
  active?: boolean | string;
};

type NormalizedPayload = {
  userId: string;
  professionalId: string;
  name: string;
  email: string;
  password: string;
  role: "admin" | "professional";
  professionalRole: string;
  image: string;
  active: boolean;
};

function normalizePayload(payload: AccessPayload): NormalizedPayload {
  const name = String(payload.name ?? "").trim();
  const role = payload.role === "admin" ? "admin" : "professional";
  const userId = String(payload.userId || makeId("user", name)).trim();
  const professionalId =
    role === "professional" ? String(payload.professionalId || makeId("pro", name)).trim() : "";

  return {
    userId,
    professionalId,
    name,
    email: String(payload.email ?? "").trim().toLowerCase(),
    password: String(payload.password ?? "").trim(),
    role,
    professionalRole: String(payload.professionalRole ?? "").trim(),
    image: String(payload.image ?? "").trim(),
    active: payload.active === true || payload.active === "true",
  };
}

function validatePayload(payload: NormalizedPayload) {
  if (!payload.name) return "El nombre es obligatorio.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) return "El correo no es valido.";
  if (payload.password && payload.password.length < 8) return "La contrasena debe tener al menos 8 caracteres.";
  if (payload.role === "professional" && !payload.professionalId) return "Falta el perfil profesional asociado.";
  return "";
}

function serviceRoleKey() {
  const legacy = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (legacy) return legacy;
  const secretKeys = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (!secretKeys) return "";
  try {
    const parsed = JSON.parse(secretKeys);
    return parsed.default ?? Object.values(parsed)[0] ?? "";
  } catch {
    return "";
  }
}

function makeId(prefix: string, value: string) {
  const slug = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 28);
  return `${prefix}-${slug || "nuevo"}-${crypto.randomUUID().slice(0, 8)}`;
}
