import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import {
  createServiceClient,
  escapeHtml,
  getSalesEmail,
  logEmailDelivery,
  sendBrevoEmail,
} from "../_shared/mail.ts";
import {
  checkFormRateLimit,
  recordFormRateLimitEvents,
} from "../_shared/rate-limit.ts";
import {
  isSpamHoneypot,
  optionalString,
  requiredString,
  validEmail,
  validNumber,
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

    const fullName = requiredString(payload.fullName, "Ime");
    const phone = validPhone(payload.phone, true);
    const email = validEmail(payload.email);
    const propertyAddress = optionalString(payload.propertyAddress, 260);
    const plotAreaM2 = validNumber(payload.plotAreaM2);
    const details = optionalString(payload.details, 5000);
    const sourcePage = validInternalSourcePage(payload.sourcePage);

    const invalid = [fullName, phone, email, propertyAddress, plotAreaM2, details, sourcePage].find(
      (item) => !item.ok,
    );
    if (invalid && !invalid.ok) {
      return jsonResponse({ error: invalid.message }, 400);
    }

    if (payload.consentAccepted !== true) {
      return jsonResponse({ error: "Potrebna je saglasnost za obradu podataka." }, 400);
    }

    const supabase = createServiceClient();
    const rateLimit = await checkFormRateLimit(supabase, {
      action: "submit-land-offer",
      email: email.value,
      request: req,
      sourcePage: sourcePage.value,
      ipLimit: 8,
    });

    if (!rateLimit.ok) {
      return jsonResponse({ error: rateLimit.message }, 429);
    }

    const { data: offer, error } = await supabase
      .from("land_offers")
      .insert({
        full_name: fullName.value,
        phone: phone.value,
        email: email.value,
        property_address: propertyAddress.value,
        plot_area_m2: plotAreaM2.value,
        details: details.value,
        source_page: sourcePage.value ?? "/kupujemo-placeve",
        consent_accepted: true,
      })
      .select("id")
      .single();

    if (error) {
      throw error;
    }

    await recordFormRateLimitEvents(supabase, rateLimit.events);

    await sendAndLog({
      relatedEntityId: offer.id,
      recipientEmail: email.value,
      deliveryKind: "user_confirmation",
      subject: "Primili smo ponudu nekretnine - M & M Gradnja",
      text: `Poštovani/a ${fullName.value},\n\nPrimili smo vašu ponudu i kontaktiraćemo vas nakon pocetne provere.\n\nM & M Gradnja`,
      html: `<p>Poštovani/a ${escapeHtml(fullName.value)},</p><p>Primili smo vašu ponudu i kontaktiraćemo vas nakon pocetne provere.</p><p>M &amp; M Gradnja</p>`,
    });

    await sendAndLog({
      relatedEntityId: offer.id,
      recipientEmail: await getSalesEmail(),
      deliveryKind: "sales_notification",
      subject: "Nova ponuda placa",
      text: `Nova ponuda placa\nIme: ${fullName.value}\nTelefon: ${phone.value}\nEmail: ${email.value}\nAdresa: ${propertyAddress.value ?? "-"}\nPovršina: ${plotAreaM2.value ?? "-"}\nDetalji: ${details.value ?? "-"}`,
      html: `<h2>Nova ponuda placa</h2><p><strong>Ime:</strong> ${escapeHtml(fullName.value)}</p><p><strong>Telefon:</strong> ${escapeHtml(phone.value)}</p><p><strong>Email:</strong> ${escapeHtml(email.value)}</p><p><strong>Adresa:</strong> ${escapeHtml(propertyAddress.value ?? "-")}</p><p><strong>Površina:</strong> ${escapeHtml(String(plotAreaM2.value ?? "-"))}</p><p><strong>Detalji:</strong><br>${escapeHtml(details.value ?? "-")}</p>`,
    });

    return jsonResponse({ ok: true, id: offer.id });
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
    relatedEntityType: "land_offer",
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
  return error instanceof Error ? error.message : "Došlo je do greške pri slanju ponude.";
}

function validInternalSourcePage(value: unknown) {
  const text = typeof value === "string" ? value.trim() : "";

  if (!text) {
    return { ok: true, value: null } as const;
  }

  if (text.length > 500 || !text.startsWith("/") || text.startsWith("//")) {
    return { ok: false, message: "Neispravan izvor ponude." } as const;
  }

  return { ok: true, value: text } as const;
}
