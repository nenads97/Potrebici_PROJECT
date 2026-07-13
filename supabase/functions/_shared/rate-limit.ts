import { sha256 } from "./validation.ts";

type SupabaseFormRateLimitClient = {
  // deno-lint-ignore no-explicit-any
  from: (table: "form_rate_limit_events") => any;
};

type FormRateLimitEventInsert = {
  action: string;
  identifier_hash: string;
  source_page?: string | null;
};

type FormRateLimitInput = {
  action: string;
  email: string;
  request: Request;
  sourcePage?: string | null;
  emailLimit?: number;
  ipLimit?: number;
  windowMinutes?: number;
};

type FormRateLimitResult =
  | { ok: true; events: FormRateLimitEventInsert[] }
  | { ok: false; message: string };

const defaultEmailLimit = 5;
const defaultIpLimit = 12;
const defaultWindowMinutes = 15;

export async function checkFormRateLimit(
  supabase: SupabaseFormRateLimitClient,
  {
    action,
    email,
    request,
    sourcePage,
    emailLimit = defaultEmailLimit,
    ipLimit = defaultIpLimit,
    windowMinutes = defaultWindowMinutes,
  }: FormRateLimitInput,
): Promise<FormRateLimitResult> {
  const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString();
  const checks = [
    {
      action: `${action}:email`,
      identifierHash: await sha256(`email:${email.toLowerCase()}`),
      limit: emailLimit,
      message: "Previse pokusaja sa ovom e-mail adresom. Pokusajte ponovo kasnije.",
    },
  ];
  const clientIp = getClientIp(request);

  if (clientIp) {
    checks.push({
      action: `${action}:ip`,
      identifierHash: await sha256(`ip:${clientIp}`),
      limit: ipLimit,
      message: "Previse pokusaja sa ove mreze. Pokusajte ponovo kasnije.",
    });
  }

  for (const check of checks) {
    const { count, error } = await supabase
      .from("form_rate_limit_events")
      .select("id", { count: "exact", head: true })
      .eq("action", check.action)
      .eq("identifier_hash", check.identifierHash)
      .gte("created_at", windowStart);

    if (error) {
      throw error;
    }

    if ((count ?? 0) >= check.limit) {
      return { ok: false, message: check.message };
    }
  }

  return {
    ok: true,
    events: checks.map((check) => ({
      action: check.action,
      identifier_hash: check.identifierHash,
      source_page: sourcePage ?? null,
    })),
  };
}

export async function recordFormRateLimitEvents(
  supabase: SupabaseFormRateLimitClient,
  events: FormRateLimitEventInsert[],
) {
  if (events.length === 0) {
    return;
  }

  const { error } = await supabase.from("form_rate_limit_events").insert(events);

  if (error) {
    throw error;
  }
}

function getClientIp(request: Request) {
  const candidates = [
    request.headers.get("cf-connecting-ip"),
    request.headers.get("x-real-ip"),
    request.headers.get("x-forwarded-for")?.split(",")[0],
    request.headers.get("forwarded")?.match(/for="?([^;,"]+)/i)?.[1],
  ];
  const ip = candidates
    .map((value) => value?.trim())
    .find((value): value is string => Boolean(value));

  return ip ? ip.slice(0, 128) : null;
}
