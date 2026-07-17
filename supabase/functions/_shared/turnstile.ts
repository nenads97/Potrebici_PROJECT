const turnstileVerifyUrl =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const maxTokenLength = 2048;
const verificationTimeoutMs = 6000;

type TurnstileVerifyInput = {
  token: unknown;
  expectedAction: string;
};

type TurnstileVerifyResponse = {
  success?: boolean;
  action?: string;
  hostname?: string;
  "error-codes"?: string[];
};

export type TurnstileVerification =
  | { ok: true }
  | {
      ok: false;
      reason:
        | "invalid-token"
        | "not-configured"
        | "service-unavailable"
        | "action-mismatch"
        | "hostname-mismatch";
    };

export async function verifyTurnstileToken({
  token,
  expectedAction,
}: TurnstileVerifyInput): Promise<TurnstileVerification> {
  const tokenValue = typeof token === "string" ? token.trim() : "";

  if (!tokenValue || tokenValue.length > maxTokenLength) {
    return { ok: false, reason: "invalid-token" };
  }

  const secretKey =
    Deno.env.get("MIM_SECRET_KEY_CAPTCHA")?.trim() ||
    Deno.env.get("TURNSTILE_SECRET_KEY")?.trim();
  const allowedHostnames = getAllowedHostnames();

  if (!secretKey || allowedHostnames.length === 0) {
    console.error(
      "Turnstile is not configured: MIM_SECRET_KEY_CAPTCHA (or TURNSTILE_SECRET_KEY) and TURNSTILE_ALLOWED_HOSTNAMES are required.",
    );
    return { ok: false, reason: "not-configured" };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), verificationTimeoutMs);
  const requestBody = new URLSearchParams({
    secret: secretKey,
    response: tokenValue,
  });

  try {
    const response = await fetch(turnstileVerifyUrl, {
      method: "POST",
      body: requestBody,
      signal: controller.signal,
    });

    if (!response.ok) {
      console.error(`Turnstile Siteverify returned HTTP ${response.status}.`);
      return { ok: false, reason: "service-unavailable" };
    }

    const result = (await response.json()) as TurnstileVerifyResponse;

    if (result.success !== true) {
      console.warn("Turnstile rejected a token.", result["error-codes"] ?? []);
      return { ok: false, reason: "invalid-token" };
    }

    if (result.action !== expectedAction) {
      console.warn("Turnstile action mismatch.");
      return { ok: false, reason: "action-mismatch" };
    }

    if (!result.hostname || !allowedHostnames.includes(result.hostname.toLowerCase())) {
      console.warn("Turnstile hostname mismatch.");
      return { ok: false, reason: "hostname-mismatch" };
    }

    return { ok: true };
  } catch (error) {
    console.error(
      "Turnstile Siteverify request failed.",
      error instanceof Error ? error.message : "Unknown error",
    );
    return { ok: false, reason: "service-unavailable" };
  } finally {
    clearTimeout(timeoutId);
  }
}

function getAllowedHostnames() {
  return (Deno.env.get("TURNSTILE_ALLOWED_HOSTNAMES") ?? "")
    .split(",")
    .map((hostname) => hostname.trim().toLowerCase())
    .filter(Boolean);
}
