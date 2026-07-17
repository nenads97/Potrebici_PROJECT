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
  attachments?: Array<{
    name: string;
    content: string;
  }>;
};

export type EmailDetailRow = {
  label: string;
  value: string;
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
      ...(input.attachments?.length
        ? { attachment: input.attachments }
        : {}),
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

export function formatEmailTextRows(rows: EmailDetailRow[]) {
  return rows.map(({ label, value }) => `${label}: ${value}`);
}

export function renderEmailRows(rows: EmailDetailRow[]) {
  const rowsHtml = rows
    .map(
      ({ label, value }) => `
        <tr>
          <td style="width:38%;padding:11px 12px;border-bottom:1px solid #e7e0d8;color:#756e66;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;vertical-align:top;">
            ${escapeHtml(label)}
          </td>
          <td style="padding:11px 12px;border-bottom:1px solid #e7e0d8;color:#343a43;font-size:15px;line-height:1.45;vertical-align:top;">
            ${escapeHtml(value)}
          </td>
        </tr>`,
    )
    .join("");

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">${rowsHtml}</table>`;
}

export function renderEmailMessage(message: string) {
  return `<div style="padding:16px 18px;border-left:4px solid #c9b59c;border-radius:4px;background:#f3efe9;color:#343a43;font-size:16px;line-height:1.65;white-space:normal;">${escapeHtml(message).replace(/\r?\n/g, "<br />")}</div>`;
}

export function buildBrandedEmail(input: {
  preheader: string;
  eyebrow: string;
  title: string;
  intro: string;
  sections: Array<{ title: string; content: string }>;
}) {
  const sectionsHtml = input.sections
    .map(
      ({ title, content }) => `
        <div style="margin-top:24px;">
          <p style="margin:0 0 10px;color:#7a6c5e;font-size:12px;font-weight:700;letter-spacing:.12em;line-height:1.4;text-transform:uppercase;">
            ${escapeHtml(title)}
          </p>
          ${content}
        </div>`,
    )
    .join("");

  return `<!doctype html>
<html lang="sr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(input.title)}</title>
  </head>
  <body style="margin:0;padding:0;background:#f3efe9;color:#343a43;font-family:Arial,Helvetica,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
      ${escapeHtml(input.preheader)}
    </div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3efe9;">
      <tr>
        <td align="center" style="padding:24px 12px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:680px;background:#ffffff;border:1px solid #e2dcd4;border-radius:8px;">
            <tr>
              <td style="padding:32px 34px;">
                <p style="margin:0 0 28px;color:#343a43;font-size:13px;font-weight:700;letter-spacing:.18em;line-height:1.4;text-transform:uppercase;">
                  M &amp; M Gradnja
                </p>
                <p style="margin:0 0 10px;color:#a08464;font-size:12px;font-weight:700;letter-spacing:.14em;line-height:1.4;text-transform:uppercase;">
                  ${escapeHtml(input.eyebrow)}
                </p>
                <h1 style="margin:0;color:#343a43;font-size:30px;font-weight:700;line-height:1.18;">
                  ${escapeHtml(input.title)}
                </h1>
                <p style="margin:18px 0 0;color:#716960;font-size:16px;line-height:1.65;">
                  ${escapeHtml(input.intro)}
                </p>
                ${sectionsHtml}
                <div style="margin-top:30px;padding-top:18px;border-top:1px solid #e2dcd4;color:#716960;font-size:13px;line-height:1.6;">
                  Srdačan pozdrav,<br />
                  <strong style="color:#343a43;">M &amp; M Gradnja</strong><br />
                  Prodajni tim
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
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
