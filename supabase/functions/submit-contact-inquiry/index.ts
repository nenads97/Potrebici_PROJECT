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
  validPhone,
} from "../_shared/validation.ts";

type ContactInquiryType = "general" | "unit" | "viewing" | "availability";

const inquiryTypeLabels: Record<ContactInquiryType, string> = {
  general: "Opsti upit",
  unit: "Konkretan stan",
  viewing: "Obilazak",
  availability: "Dostupnost",
};

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
    const inquiryType = validInquiryType(payload.inquiryType);
    const phone = inquiryType.ok
      ? validPhone(payload.phone, isSalesPhoneRequired(inquiryType.value))
      : validPhone(payload.phone);
    const message = optionalString(payload.message, 4000);
    const projectSlug = optionalString(payload.projectSlug, 120);
    const unitCode = optionalString(payload.unitCode, 80);
    const sourcePage = validInternalSourcePage(payload.sourcePage);

    const invalid = [fullName, email, inquiryType, phone, message, projectSlug, unitCode, sourcePage]
      .find((item) => !item.ok);
    if (invalid && !invalid.ok) {
      return jsonResponse({ error: invalid.message }, 400);
    }

    if (payload.consentAccepted !== true) {
      return jsonResponse({ error: "Potrebna je saglasnost za obradu podataka." }, 400);
    }

    const supabase = createServiceClient();
    const rateLimit = await checkFormRateLimit(supabase, {
      action: "submit-contact-inquiry",
      email: email.value,
      request: req,
      sourcePage: sourcePage.value,
    });

    if (!rateLimit.ok) {
      return jsonResponse({ error: rateLimit.message }, 429);
    }

    const { data: inquiry, error } = await supabase
      .from("contact_inquiries")
      .insert({
        project_slug: projectSlug.value ?? "heroja-pinkija-13",
        unit_code: unitCode.value,
        inquiry_type: inquiryType.value,
        full_name: fullName.value,
        phone: phone.value,
        email: email.value,
        message: message.value,
        source_page: sourcePage.value,
        consent_accepted: true,
      })
      .select("id")
      .single();

    if (error) {
      throw error;
    }

    await recordFormRateLimitEvents(supabase, rateLimit.events);

    const salesContextText = [
      `Tip upita: ${inquiryTypeLabels[inquiryType.value]}`,
      `Stan: ${unitCode.value ?? "-"}`,
      `Izvor: ${sourcePage.value ?? "-"}`,
      `Projekat: ${projectSlug.value ?? "heroja-pinkija-13"}`,
    ].join("\n");
    const salesContextHtml = [
      ["Tip upita", inquiryTypeLabels[inquiryType.value]],
      ["Stan", unitCode.value ?? "-"],
      ["Izvor", sourcePage.value ?? "-"],
      ["Projekat", projectSlug.value ?? "heroja-pinkija-13"],
    ]
      .map(([label, value]) => `<p><strong>${label}:</strong> ${escapeHtml(value)}</p>`)
      .join("");

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
      subject: unitCode.value
        ? `Novi upit za ${unitCode.value}`
        : "Novi upit za stanove",
      text: `Novi upit\n${salesContextText}\nIme: ${fullName.value}\nTelefon: ${phone.value ?? "-"}\nEmail: ${email.value}\nPoruka: ${message.value ?? "-"}`,
      html: `<h2>Novi upit</h2>${salesContextHtml}<p><strong>Ime:</strong> ${escapeHtml(fullName.value)}</p><p><strong>Telefon:</strong> ${escapeHtml(phone.value ?? "-")}</p><p><strong>Email:</strong> ${escapeHtml(email.value)}</p><p><strong>Poruka:</strong><br>${escapeHtml(message.value ?? "-")}</p>`,
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

function validInquiryType(value: unknown) {
  if (value === undefined || value === null || value === "") {
    return { ok: true, value: "general" } as const;
  }

  if (
    value === "general" ||
    value === "unit" ||
    value === "viewing" ||
    value === "availability"
  ) {
    return { ok: true, value } as const;
  }

  return { ok: false, message: "Nepoznat tip upita." } as const;
}

function isSalesPhoneRequired(inquiryType: ContactInquiryType) {
  return inquiryType === "unit" || inquiryType === "viewing" || inquiryType === "availability";
}

function validInternalSourcePage(value: unknown) {
  const text = typeof value === "string" ? value.trim() : "";

  if (!text) {
    return { ok: true, value: null } as const;
  }

  if (text.length > 500 || !text.startsWith("/") || text.startsWith("//")) {
    return { ok: false, message: "Neispravan izvor upita." } as const;
  }

  return { ok: true, value: text } as const;
}
