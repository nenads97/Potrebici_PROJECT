import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import {
  createServiceClient,
  escapeHtml,
  getSalesEmail,
  logEmailDelivery,
  sendBrevoEmail,
} from "../_shared/mail.ts";
import {
  isSpamHoneypot,
  optionalString,
  requiredString,
  sha256,
  validEmail,
  validPhone,
} from "../_shared/validation.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  try {
    const payload = await req.json();

    if (isSpamHoneypot(payload.website)) {
      return jsonResponse({ ok: true });
    }

    const fullName = requiredString(payload.fullName, "Ime i prezime");
    const email = validEmail(payload.email);
    const phone = validPhone(payload.phone);
    const message = optionalString(payload.message, 4000);

    const invalid = [fullName, email, phone, message].find((item) => !item.ok);
    if (invalid && !invalid.ok) {
      return jsonResponse({ error: invalid.message }, 400);
    }

    if (payload.consentAccepted !== true) {
      return jsonResponse({ error: "Potrebna je saglasnost za obradu podataka." }, 400);
    }

    const supabase = createServiceClient();
    const identifierHash = await sha256(email.value.toLowerCase());
    const rateLimitWindow = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const { count: recentSubmissions } = await supabase
      .from("form_rate_limit_events")
      .select("id", { count: "exact", head: true })
      .eq("action", "submit-contact-inquiry")
      .eq("identifier_hash", identifierHash)
      .gte("created_at", rateLimitWindow);

    if ((recentSubmissions ?? 0) >= 5) {
      return jsonResponse({ error: "Previse pokusaja. Pokusajte ponovo kasnije." }, 429);
    }

    const { data: inquiry, error } = await supabase
      .from("contact_inquiries")
      .insert({
        project_slug: payload.projectSlug ?? "heroja-pinkija-13",
        unit_code: payload.unitCode ?? null,
        inquiry_type: payload.inquiryType ?? "general",
        full_name: fullName.value,
        phone: phone.value,
        email: email.value,
        message: message.value,
        source_page: payload.sourcePage ?? null,
        consent_accepted: true,
      })
      .select("id")
      .single();

    if (error) {
      throw error;
    }

    await supabase.from("form_rate_limit_events").insert({
      action: "submit-contact-inquiry",
      identifier_hash: identifierHash,
      source_page: payload.sourcePage ?? null,
    });

    await sendAndLog({
      relatedEntityId: inquiry.id,
      recipientEmail: email.value,
      deliveryKind: "user_confirmation",
      subject: "Primili smo vas upit - M & M Gradnja",
      text: `Postovani/a ${fullName.value},\n\nPrimili smo vas upit i prodajni tim ce vas kontaktirati.\n\nM & M Gradnja`,
      html: `<p>Postovani/a ${escapeHtml(fullName.value)},</p><p>Primili smo vas upit i prodajni tim ce vas kontaktirati.</p><p>M &amp; M Gradnja</p>`,
    });

    await sendAndLog({
      relatedEntityId: inquiry.id,
      recipientEmail: await getSalesEmail(),
      deliveryKind: "sales_notification",
      subject: "Novi upit za stanove",
      text: `Novi upit\nIme: ${fullName.value}\nTelefon: ${phone.value ?? "-"}\nEmail: ${email.value}\nPoruka: ${message.value ?? "-"}`,
      html: `<h2>Novi upit</h2><p><strong>Ime:</strong> ${escapeHtml(fullName.value)}</p><p><strong>Telefon:</strong> ${escapeHtml(phone.value ?? "-")}</p><p><strong>Email:</strong> ${escapeHtml(email.value)}</p><p><strong>Poruka:</strong><br>${escapeHtml(message.value ?? "-")}</p>`,
    });

    return jsonResponse({ ok: true, id: inquiry.id });
  } catch (error) {
    return jsonResponse({ error: getErrorMessage(error) }, 500);
  }
});

async function sendAndLog(input: {
  relatedEntityId: string;
  recipientEmail: string;
  deliveryKind: "user_confirmation" | "sales_notification";
  subject: string;
  text: string;
  html: string;
}) {
  const result = await sendBrevoEmail({
    to: input.recipientEmail,
    subject: input.subject,
    text: input.text,
    html: input.html,
  });

  await logEmailDelivery({
    relatedEntityType: "contact_inquiry",
    relatedEntityId: input.relatedEntityId,
    deliveryKind: input.deliveryKind,
    recipientEmail: input.recipientEmail,
    subject: input.subject,
    status: result.ok ? "sent" : "failed",
    providerMessageId: result.providerMessageId,
    errorMessage: result.errorMessage,
  });
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Doslo je do greske pri slanju upita.";
}
