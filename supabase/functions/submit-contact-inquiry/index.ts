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

type ContactInquiryType = "general" | "unit" | "viewing" | "availability";

const inquiryTypeLabels: Record<ContactInquiryType, string> = {
  general: "Opsti upit",
  unit: "Konkretan stan",
  viewing: "Obilazak",
  availability: "Dostupnost",
};

type InquiryContextRow = {
  label: string;
  value: string;
};

type ParsedInquiryMessage = {
  context: InquiryContextRow[];
  message: string;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  let uploadedAttachment: UploadedInquiryAttachment | null = null;
  let inquiryPersisted = false;

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
      expectedAction: "contact_inquiry",
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

    const fullName = requiredString(
      getPayloadValue(payload, "fullName"),
      "Ime i prezime",
    );
    const email = validEmail(getPayloadValue(payload, "email"));
    const inquiryType = validInquiryType(
      getPayloadValue(payload, "inquiryType"),
    );
    const phone = inquiryType.ok
      ? validPhone(
          getPayloadValue(payload, "phone"),
          isSalesPhoneRequired(inquiryType.value),
        )
      : validPhone(getPayloadValue(payload, "phone"));
    const message = optionalString(getPayloadValue(payload, "message"), 4000);
    const projectSlug = optionalString(
      getPayloadValue(payload, "projectSlug"),
      120,
    );
    const unitCode = optionalString(getPayloadValue(payload, "unitCode"), 80);
    const sourcePage = validInternalSourcePage(
      getPayloadValue(payload, "sourcePage"),
    );

    const invalid = [fullName, email, inquiryType, phone, message, projectSlug, unitCode, sourcePage]
      .find((item) => !item.ok);
    if (invalid && !invalid.ok) {
      return jsonResponse({ error: invalid.message }, 400);
    }

    if (!isTruthyFormValue(getPayloadValue(payload, "consentAccepted"))) {
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

    const emailAttachment = attachment
      ? await toBrevoAttachment(attachment)
      : null;

    if (attachment) {
      uploadedAttachment = await uploadInquiryAttachment(
        supabase,
        "contact-inquiry",
        attachment,
      );
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

    inquiryPersisted = true;

    await recordFormRateLimitEvents(supabase, rateLimit.events);

    const parsedMessage = parseInquiryMessage(message.value ?? "");
    const contextDetails = unitCode.value
      ? parsedMessage.context.filter((row) => row.label.toLowerCase() !== "stan")
      : parsedMessage.context;
    const projectName = projectSlug.value === "heroja-pinkija-13"
      ? "Heroja Pinkija 13"
      : projectSlug.value ?? "Heroja Pinkija 13";
    const inquiryContext = [
      { label: "Tip upita", value: inquiryTypeLabels[inquiryType.value] },
      { label: "Stan", value: unitCode.value ?? "-" },
      { label: "Projekat", value: projectName },
      { label: "Izvor", value: sourcePage.value ?? "-" },
      ...contextDetails,
    ];
    const buyerDetails = [
      { label: "Ime i prezime", value: fullName.value },
      { label: "Telefon", value: phone.value ?? "-" },
      { label: "Email", value: email.value },
    ];
    const projectDetails = [
      { label: "Projekat", value: projectName },
      ...(unitCode.value ? [{ label: "Stan", value: unitCode.value }] : []),
    ];
    const salesTitle = unitCode.value
      ? `Novi upit za ${unitCode.value}`
      : "Novi upit za stanove";
    const attachmentDetails = uploadedAttachment
      ? [{ label: "Priloženi dokument", value: uploadedAttachment.name }]
      : [];
    const confirmationIntro =
      "Vaš upit je uspešno primljen. Na njega će naš prodajni tim odgovoriti u najkraćem mogućem roku.";

    await sendAndLog({
      relatedEntityId: inquiry.id,
      recipientEmail: email.value,
      deliveryKind: "user_confirmation",
      subject: "Primili smo vaš upit | M & M Gradnja",
      text: [
        `Poštovani/a ${fullName.value},`,
        "",
        "Hvala vam što ste nam se javili i iskazali interesovanje za M & M Gradnju.",
        confirmationIntro,
        "",
        ...(projectDetails.length > 0
          ? ["Zabeležili smo sledeće:", ...formatEmailTextRows(projectDetails), ""]
          : []),
        "Hvala vam na poverenju.",
        "",
        "Srdačan pozdrav,",
        "M & M Gradnja",
        "Prodaja",
      ].join("\n"),
      html: buildBrandedEmail({
        preheader: "Vaš upit je uspešno primljen.",
        eyebrow: "Potvrda prijema upita",
        title: "Hvala što ste nam se javili",
        intro: `Poštovani/a ${fullName.value}, hvala vam na interesovanju za M & M Gradnju. ${confirmationIntro}`,
        sections:
          projectDetails.length > 0
            ? [
                {
                  title: "Zabeleženi podaci",
                  content: renderEmailRows(projectDetails),
                },
              ]
            : [],
      }),
    });

    await sendAndLog({
      relatedEntityId: inquiry.id,
      recipientEmail: await getSalesEmail(),
      deliveryKind: "sales_notification",
      subject: `${salesTitle} | M & M Gradnja`,
      text: [
        "M & M GRADNJA",
        salesTitle,
        "",
        "PORUKA KUPCA",
        parsedMessage.message || "Poruka nije navedena.",
        "",
        "PODACI O KUPCU",
        ...formatEmailTextRows(buyerDetails),
        "",
        "KONTEKST UPITA",
        ...formatEmailTextRows(inquiryContext),
        ...(attachmentDetails.length > 0
          ? ["", "PRILOŽENI DOKUMENT", ...formatEmailTextRows(attachmentDetails)]
          : []),
      ].join("\n"),
      html: buildBrandedEmail({
        preheader: `${salesTitle}. Poruka kupca i podaci o upitu su izdvojeni u sekcije.`,
        eyebrow: "Prodaja · novi upit",
        title: salesTitle,
        intro: "Na sajtu je primljen novi upit. Najvažnija informacija nalazi se u poruci kupca.",
        sections: [
          {
            title: "Poruka kupca",
            content: renderEmailMessage(parsedMessage.message || "Poruka nije navedena."),
          },
          {
            title: "Podaci o kupcu",
            content: renderEmailRows(buyerDetails),
          },
          {
            title: "Kontekst upita",
            content: renderEmailRows(inquiryContext),
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

    return jsonResponse({ ok: true, id: inquiry.id });
  } catch (error) {
    if (uploadedAttachment && !inquiryPersisted) {
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

function parseInquiryMessage(rawMessage: string): ParsedInquiryMessage {
  const normalizedMessage = rawMessage.replace(/\r\n/g, "\n").trim();
  const contextMatch = normalizedMessage.match(
    /^Kontekst upita:\s*\n([\s\S]*?)(?:\n\s*\n|$)([\s\S]*)$/i,
  );

  if (!contextMatch) {
    return { context: [], message: normalizedMessage };
  }

  const context = contextMatch[1]
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const separatorIndex = line.indexOf(":");

      if (separatorIndex === -1) {
        return { label: "Detalj", value: line };
      }

      return {
        label: line.slice(0, separatorIndex).trim(),
        value: line.slice(separatorIndex + 1).trim(),
      };
    });

  return {
    context,
    message: contextMatch[2].trim(),
  };
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Došlo je do greške pri slanju upita.";
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
