import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import {
  buildBrandedEmail,
  createServiceClient,
  formatEmailTextRows,
  getSalesEmail,
  logEmailDelivery,
  renderEmailMessage,
  renderEmailRows,
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
import {
  removeInquiryAttachment,
  toBrevoAttachment,
  uploadInquiryAttachment,
  validateInquiryAttachment,
  type UploadedInquiryAttachment,
} from "../_shared/inquiry-attachments.ts";
import { verifyTurnstileToken } from "../_shared/turnstile.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  let uploadedAttachment: UploadedInquiryAttachment | null = null;
  let offerPersisted = false;

  try {
    const payload = await readRequestPayload(req);
    const attachmentResult = validateInquiryAttachment(
      getPayloadValue(payload, "attachment"),
    );

    if (!attachmentResult.ok) {
      return jsonResponse({ error: attachmentResult.message }, 400);
    }

    const attachment = attachmentResult.attachment;

    if (isSpamHoneypot(getPayloadValue(payload, "website"))) {
      return jsonResponse({ ok: true });
    }

    const turnstile = await verifyTurnstileToken({
      token: getPayloadValue(payload, "turnstileToken"),
      expectedAction: "land_offer",
    });

    if (!turnstile.ok) {
      const unavailable =
        turnstile.reason === "not-configured" ||
        turnstile.reason === "service-unavailable";

      return jsonResponse(
        {
          error: unavailable
            ? "Sigurnosna provera trenutno nije dostupna. Pokušajte ponovo kasnije."
            : "Sigurnosna provera nije uspela. Osvežite stranicu i pokušajte ponovo.",
        },
        unavailable ? 503 : 400,
      );
    }

    const fullName = requiredString(getPayloadValue(payload, "fullName"), "Ime");
    const phone = validPhone(getPayloadValue(payload, "phone"), true);
    const email = validEmail(getPayloadValue(payload, "email"));
    const propertyAddress = optionalString(
      getPayloadValue(payload, "propertyAddress"),
      260,
    );
    const plotAreaM2 = validNumber(getPayloadValue(payload, "plotAreaM2"));
    const details = optionalString(getPayloadValue(payload, "details"), 5000);
    const sourcePage = validInternalSourcePage(
      getPayloadValue(payload, "sourcePage"),
    );

    const invalid = [fullName, phone, email, propertyAddress, plotAreaM2, details, sourcePage].find(
      (item) => !item.ok,
    );
    if (invalid && !invalid.ok) {
      return jsonResponse({ error: invalid.message }, 400);
    }

    if (!isTruthyFormValue(getPayloadValue(payload, "consentAccepted"))) {
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

    const emailAttachment = attachment
      ? await toBrevoAttachment(attachment)
      : null;

    if (attachment) {
      uploadedAttachment = await uploadInquiryAttachment(
        supabase,
        "land-offer",
        attachment,
      );
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
        attachment_path: uploadedAttachment?.path ?? null,
        attachment_name: uploadedAttachment?.name ?? null,
        attachment_mime_type: uploadedAttachment?.mimeType ?? null,
        attachment_size_bytes: uploadedAttachment?.sizeBytes ?? null,
      })
      .select("id")
      .single();

    if (error) {
      if (uploadedAttachment) {
        await removeInquiryAttachment(supabase, uploadedAttachment.path);
        uploadedAttachment = null;
      }
      throw error;
    }

    offerPersisted = true;

    await recordFormRateLimitEvents(supabase, rateLimit.events);

    const propertyAddressText = propertyAddress.value ?? "Nije navedena";
    const plotAreaText = plotAreaM2.value ? `${plotAreaM2.value} m²` : "Nije navedena";
    const sellerDetails = [
      { label: "Ime i prezime", value: fullName.value },
      { label: "Telefon", value: phone.value },
      { label: "Email", value: email.value },
    ];
    const parcelDetails = [
      { label: "Adresa / lokacija", value: propertyAddressText },
      { label: "Površina placa", value: plotAreaText },
      { label: "Izvor ponude", value: sourcePage.value ?? "/kupujemo-placeve" },
    ];
    const attachmentDetails = uploadedAttachment
      ? [{ label: "Priloženi dokument", value: uploadedAttachment.name }]
      : [];
    const confirmationIntro =
      "Vaša ponuda je uspešno primljena. Naš tim će je pregledati i javiti vam se u najkraćem mogućem roku.";

    await sendAndLog({
      relatedEntityId: offer.id,
      recipientEmail: email.value,
      deliveryKind: "user_confirmation",
      subject: "Primili smo vašu ponudu placa | M & M Gradnja",
      text: [
        `Poštovani/a ${fullName.value},`,
        "",
        "Hvala vam što ste nam se obratili sa ponudom placa.",
        confirmationIntro,
        "",
        "Zabeležili smo sledeće:",
        ...formatEmailTextRows(parcelDetails.slice(0, 2)),
        "",
        "Hvala vam na poverenju.",
        "",
        "Srdačan pozdrav,",
        "M & M Gradnja",
        "Prodajni tim",
      ].join("\n"),
      html: buildBrandedEmail({
        preheader: "Vaša ponuda placa je uspešno primljena.",
        eyebrow: "Potvrda prijema ponude",
        title: "Hvala što ste nam se javili",
        intro: `Poštovani/a ${fullName.value}, hvala vam što ste nam poslali ponudu placa. ${confirmationIntro}`,
        sections: [
          {
            title: "Zabeleženi podaci",
            content: renderEmailRows(parcelDetails.slice(0, 2)),
          },
        ],
      }),
    });

    await sendAndLog({
      relatedEntityId: offer.id,
      recipientEmail: await getSalesEmail(),
      deliveryKind: "sales_notification",
      subject: "Nova ponuda placa | M & M Gradnja",
      text: [
        "M & M GRADNJA",
        "Nova ponuda placa",
        "",
        "PORUKA PONUĐAČA",
        details.value ?? "Detalji nisu navedeni.",
        "",
        "PODACI O PONUĐAČU",
        ...formatEmailTextRows(sellerDetails),
        "",
        "DETALJI PARCELE",
        ...formatEmailTextRows(parcelDetails),
        ...(attachmentDetails.length > 0
          ? ["", "PRILOŽENI DOKUMENT", ...formatEmailTextRows(attachmentDetails)]
          : []),
      ].join("\n"),
      html: buildBrandedEmail({
        preheader: "Nova ponuda placa. Poruka ponuđača i detalji parcele su izdvojeni u sekcije.",
        eyebrow: "Akvizicija · nova ponuda",
        title: "Nova ponuda placa",
        intro: "Na sajtu je primljena nova ponuda placa. Najvažnije informacije nalaze se u poruci ponuđača i detaljima parcele.",
        sections: [
          {
            title: "Poruka ponuđača",
            content: renderEmailMessage(details.value ?? "Detalji nisu navedeni."),
          },
          {
            title: "Podaci o ponuđaču",
            content: renderEmailRows(sellerDetails),
          },
          {
            title: "Detalji parcele",
            content: renderEmailRows(parcelDetails),
          },
          ...(attachmentDetails.length > 0
            ? [
                {
                  title: "Priloženi dokument",
                  content: renderEmailRows(attachmentDetails),
                },
              ]
            : []),
        ],
      }),
      attachments: emailAttachment ? [emailAttachment] : undefined,
    });

    return jsonResponse({ ok: true, id: offer.id });
  } catch (error) {
    if (uploadedAttachment && !offerPersisted) {
      try {
        const supabase = createServiceClient();
        await removeInquiryAttachment(supabase, uploadedAttachment.path);
      } catch {
        // Cleanup is best effort; preserve the original submission error.
      }
    }

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
  attachments?: Array<{ name: string; content: string }>;
}) {
  const result = await sendBrevoEmail({
    to: input.recipientEmail,
    subject: input.subject,
    text: input.text,
    html: input.html,
    attachments: input.attachments,
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

type RequestPayload = FormData | Record<string, unknown>;

async function readRequestPayload(req: Request): Promise<RequestPayload> {
  const contentType = req.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    return await req.formData();
  }

  return await req.json();
}

function getPayloadValue(payload: RequestPayload, key: string) {
  return payload instanceof FormData ? payload.get(key) : payload[key];
}

function isTruthyFormValue(value: unknown) {
  return value === true || value === "true" || value === "on";
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
