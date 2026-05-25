import { createClient } from "npm:@supabase/supabase-js@2";

type EmailLogInput = {
  relatedEntityType: "contact_inquiry" | "land_offer";
  relatedEntityId: string;
  deliveryKind: "user_confirmation" | "sales_notification";
  recipientEmail: string;
  subject: string;
  status: "sent" | "failed";
  providerMessageId?: string | null;
  errorMessage?: string | null;
};

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export function createServiceClient() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = getServiceKey();

  if (!supabaseUrl || !serviceKey) {
    throw new Error("Missing Supabase service credentials.");
  }

  return createClient(supabaseUrl, serviceKey, {
    auth: {
      persistSession: false,
    },
  });
}

export async function sendBrevoEmail(input: SendEmailInput) {
  const emailSettings = await getEmailSettings();
  const apiKey = emailSettings.brevoApiKey;
  const senderEmail = emailSettings.senderEmail;
  const senderName = emailSettings.senderName;

  if (!apiKey) {
    return {
      ok: false,
      providerMessageId: null,
      errorMessage: "BREVO_API_KEY is not configured.",
    };
  }

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      sender: {
        email: senderEmail,
        name: senderName,
      },
      to: [{ email: input.to }],
      subject: input.subject,
      htmlContent: input.html,
      textContent: input.text,
    }),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    return {
      ok: false,
      providerMessageId: null,
      errorMessage:
        payload?.message ?? `Brevo request failed with status ${response.status}.`,
    };
  }

  return {
    ok: true,
    providerMessageId: payload?.messageId ?? null,
    errorMessage: null,
  };
}

export async function logEmailDelivery(input: EmailLogInput) {
  const supabase = createServiceClient();

  await supabase.from("email_delivery_log").insert({
    related_entity_type: input.relatedEntityType,
    related_entity_id: input.relatedEntityId,
    delivery_kind: input.deliveryKind,
    recipient_email: input.recipientEmail,
    subject: input.subject,
    provider: "brevo",
    provider_message_id: input.providerMessageId ?? null,
    status: input.status,
    error_message: input.errorMessage ?? null,
    sent_at: input.status === "sent" ? new Date().toISOString() : null,
  });
}

export async function getSalesEmail() {
  const emailSettings = await getEmailSettings();
  return emailSettings.salesEmail;
}

export function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getServiceKey() {
  const legacyKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (legacyKey) {
    return legacyKey;
  }

  const secretKeys = Deno.env.get("SUPABASE_SECRET_KEYS");

  if (!secretKeys) {
    return null;
  }

  try {
    const parsed = JSON.parse(secretKeys) as Record<string, string>;
    return parsed.default ?? Object.values(parsed)[0] ?? null;
  } catch {
    return null;
  }
}

async function getEmailSettings() {
  const envApiKey = Deno.env.get("BREVO_API_KEY");

  if (envApiKey) {
    return {
      brevoApiKey: envApiKey,
      senderEmail: Deno.env.get("BREVO_SENDER_EMAIL") ?? "prodaja@mimgradnja.rs",
      senderName: Deno.env.get("BREVO_SENDER_NAME") ?? "M & M Gradnja",
      salesEmail: Deno.env.get("SALES_EMAIL") ?? "prodaja@mimgradnja.rs",
    };
  }

  const supabase = createServiceClient();
  const { data } = await supabase
    .from("email_service_settings")
    .select("brevo_api_key, sender_email, sender_name, sales_email")
    .eq("id", true)
    .maybeSingle();

  return {
    brevoApiKey: data?.brevo_api_key ?? null,
    senderEmail: data?.sender_email ?? "prodaja@mimgradnja.rs",
    senderName: data?.sender_name ?? "M & M Gradnja",
    salesEmail: data?.sales_email ?? "prodaja@mimgradnja.rs",
  };
}
