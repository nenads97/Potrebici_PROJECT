import type { FormEvent, KeyboardEvent } from "react";
import { useEffect, useId, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  FileText,
  Mail,
  Paperclip,
  Phone,
  Send,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";

import {
  contactEmail,
  contactPhone,
  contactPhoneHref,
} from "../../projects/data/herojaPinkija13.data";
import { submitContactInquiry } from "../api/inquiryFunctions.api";
import { TurnstileWidget } from "./TurnstileWidget";
import {
  focusFirstInvalidField,
  getFormValue,
  hasFieldErrors,
  inquiryAttachmentAccept,
  mergeFieldError,
  validateConsent,
  validateEmail,
  validateInquiryAttachment,
  validateOptionalText,
  validatePhone,
  validateRequiredText,
  type FieldErrors,
} from "../utils/formValidation";
import {
  defaultModalOptions,
  type ContactModalOptions,
} from "./ContactModalContext";

type ContactModalProps = {
  isOpen: boolean;
  options: ContactModalOptions;
  onClose: () => void;
};

type ContactModalFieldName =
  | "name"
  | "phone"
  | "email"
  | "message"
  | "attachment"
  | "consent";

const contactModalFieldOrder: ContactModalFieldName[] = [
  "name",
  "phone",
  "email",
  "message",
  "attachment",
  "consent",
];

const ContactModalDialog = ({ isOpen, options, onClose }: ContactModalProps) => {
  const titleId = useId();
  const descriptionId = useId();
  const nameId = useId();
  const nameErrorId = useId();
  const phoneId = useId();
  const phoneErrorId = useId();
  const emailId = useId();
  const emailErrorId = useId();
  const websiteId = useId();
  const messageId = useId();
  const messageErrorId = useId();
  const attachmentId = useId();
  const attachmentHintId = useId();
  const attachmentErrorId = useId();
  const consentId = useId();
  const consentErrorId = useId();
  const captchaLabelId = useId();
  const captchaErrorId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const [formStatus, setFormStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [formMessage, setFormMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<ContactModalFieldName>>({});
  const [hasSubmitAttempted, setHasSubmitAttempted] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileResetSignal, setTurnstileResetSignal] = useState(0);
  const [captchaError, setCaptchaError] = useState("");

  const mergedOptions = { ...defaultModalOptions, ...options };
  const isPhoneRequired = isSalesPhoneRequired(mergedOptions.inquiryType);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.requestAnimationFrame(() => firstInputRef.current?.focus());

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setHasSubmitAttempted(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const errors = validateContactModalForm(formData, isPhoneRequired);

    if (hasFieldErrors(errors)) {
      setFieldErrors(errors);
      setFormStatus("error");
      setFormMessage("Proverite označena polja pre slanja upita.");
      focusFirstInvalidField(form, contactModalFieldOrder, errors);
      return;
    }

    if (!turnstileToken) {
      setCaptchaError("Potvrdite da niste robot pre slanja upita.");
      setFormStatus("error");
      setFormMessage("Potvrdite sigurnosnu proveru pre slanja upita.");
      return;
    }

    setFormStatus("sending");
    setFormMessage("");
    setFieldErrors({});
    setCaptchaError("");

    try {
      await submitContactInquiry({
        fullName: getFormValue(formData, "name"),
        phone: getFormValue(formData, "phone"),
        email: getFormValue(formData, "email"),
        message: buildContextualMessage(mergedOptions, getFormValue(formData, "message")),
        projectSlug: mergedOptions.projectSlug,
        unitCode: mergedOptions.unitCode,
        inquiryType: mergedOptions.inquiryType,
        sourcePage: mergedOptions.sourcePage ?? window.location.pathname,
        consentAccepted: formData.get("consent") === "on",
        website: getFormValue(formData, "website"),
        turnstileToken,
        attachment:
          formData.get("attachment") instanceof File
            ? (formData.get("attachment") as File)
            : null,
      });

      form.reset();
      setFormStatus("success");
      setFormMessage(mergedOptions.successMessage);
      setFieldErrors({});
      setHasSubmitAttempted(false);
      setCaptchaError("");
      setTurnstileToken("");
      setTurnstileResetSignal((current) => current + 1);
    } catch (error) {
      setFormStatus("error");
      setFormMessage(error instanceof Error ? error.message : "Slanje nije uspelo.");
      setTurnstileToken("");
      setTurnstileResetSignal((current) => current + 1);
    }
  };

  const handleFieldBlur = (
    fieldName: ContactModalFieldName,
    event: {
      currentTarget: HTMLInputElement | HTMLTextAreaElement;
      relatedTarget?: EventTarget | null;
    },
  ) => {
    if (!hasSubmitAttempted) {
      return;
    }

    if (
      event.relatedTarget instanceof HTMLElement &&
      event.relatedTarget.closest("[data-contact-modal-close]")
    ) {
      return;
    }

    const form = event.currentTarget.form;
    if (!form) {
      return;
    }

    const errors = validateContactModalForm(new FormData(form), isPhoneRequired);
    setFieldErrors((currentErrors) =>
      mergeFieldError(currentErrors, fieldName, errors[fieldName]),
    );
  };

  const handleConsentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (hasSubmitAttempted) {
      handleFieldBlur("consent", event);
    }
  };

  const handleDialogKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab") {
      return;
    }

    const focusableElements = getFocusableElements(dialogRef.current);
    if (focusableElements.length === 0) {
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    }

    if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  };

  return (
    <div
      className="contact-modal"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        className="contact-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        onKeyDown={handleDialogKeyDown}
      >
        <button
          className="contact-modal__close"
          type="button"
          data-contact-modal-close
          aria-label="Zatvori kontakt formu"
          onPointerDown={(event) => {
            event.preventDefault();
            onClose();
          }}
          onClick={onClose}
        >
          <X />
        </button>

        <aside className="contact-modal__summary">
          <p className="section-eyebrow">{mergedOptions.eyebrow}</p>
          <h2 id={titleId}>{mergedOptions.title}</h2>
          <p id={descriptionId}>{mergedOptions.description}</p>

          {mergedOptions.details && mergedOptions.details.length > 0 ? (
            <dl className="contact-modal__details">
              {mergedOptions.details.map((detail) => (
                <div key={`${detail.label}-${detail.value}`}>
                  <dt>{detail.label}</dt>
                  <dd>{detail.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          <div className="contact-modal__direct">
            <a href={contactPhoneHref}>
              <Phone />
              <span>
                <small>Telefon prodaje</small>
                <strong>{contactPhone}</strong>
              </span>
            </a>
            <a href={`mailto:${contactEmail}`}>
              <Mail />
              <span>
                <small>Email</small>
                <strong>{contactEmail}</strong>
              </span>
            </a>
          </div>
        </aside>

        <form
          className="contact-modal__form"
          onSubmit={handleSubmit}
          aria-busy={formStatus === "sending"}
          noValidate
        >
          <div className="contact-modal__form-head">
            <FileText />
            <div>
              <strong>Podaci za odgovor</strong>
              <p>
                {isPhoneRequired
                  ? "Za ovaj tip upita telefon je obavezan, kako bismo mogli brzo da proverimo detalje i termin."
                  : "Ime i e-mail su obavezni. Telefon pomaže da dogovor bude brži."}
              </p>
            </div>
          </div>

          <div className="form-grid form-grid--two">
            <div className="form-field">
              <label className="form-label" htmlFor={nameId}>Ime i prezime *</label>
              <input
                ref={firstInputRef}
                className="form-input"
                id={nameId}
                name="name"
                required
                type="text"
                autoComplete="name"
                maxLength={160}
                aria-invalid={fieldErrors.name ? "true" : undefined}
                aria-describedby={fieldErrors.name ? nameErrorId : undefined}
                onBlur={(event) => handleFieldBlur("name", event)}
              />
              {fieldErrors.name ? <p className="form-field-error" id={nameErrorId}>{fieldErrors.name}</p> : null}
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor={phoneId}>Telefon{isPhoneRequired ? " *" : ""}</label>
              <input
                className="form-input"
                id={phoneId}
                name="phone"
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                required={isPhoneRequired}
                maxLength={80}
                aria-invalid={fieldErrors.phone ? "true" : undefined}
                aria-describedby={fieldErrors.phone ? phoneErrorId : undefined}
                onBlur={(event) => handleFieldBlur("phone", event)}
              />
              {fieldErrors.phone ? <p className="form-field-error" id={phoneErrorId}>{fieldErrors.phone}</p> : null}
            </div>

            <div className="form-field contact-modal__email-field">
              <label className="form-label" htmlFor={emailId}>E-mail *</label>
              <input
                className="form-input"
                id={emailId}
                name="email"
                required
                type="email"
                autoComplete="email"
                maxLength={254}
                aria-invalid={fieldErrors.email ? "true" : undefined}
                aria-describedby={fieldErrors.email ? emailErrorId : undefined}
                onBlur={(event) => handleFieldBlur("email", event)}
              />
              {fieldErrors.email ? <p className="form-field-error" id={emailErrorId}>{fieldErrors.email}</p> : null}
            </div>
          </div>

          <label className="form-field form-field--hidden" htmlFor={websiteId}>
            Website
            <input id={websiteId} name="website" tabIndex={-1} type="text" autoComplete="off" />
          </label>

          <div className="form-field">
            <label className="form-label" htmlFor={messageId}>Poruka</label>
            <textarea
              className="form-textarea"
              id={messageId}
              name="message"
              placeholder={mergedOptions.messagePlaceholder}
              rows={4}
              maxLength={4000}
              aria-invalid={fieldErrors.message ? "true" : undefined}
              aria-describedby={fieldErrors.message ? messageErrorId : undefined}
              onBlur={(event) => handleFieldBlur("message", event)}
            />
            {fieldErrors.message ? <p className="form-field-error" id={messageErrorId}>{fieldErrors.message}</p> : null}
          </div>

          <div className="form-field contact-modal__attachment-field">
            <label className="form-label" htmlFor={attachmentId}>
              <Paperclip />
              Priložite dokument <span>(opciono)</span>
            </label>
            <input
              className="form-input form-input--file"
              id={attachmentId}
              name="attachment"
              type="file"
              accept={inquiryAttachmentAccept}
              aria-invalid={fieldErrors.attachment ? "true" : undefined}
              aria-describedby={fieldErrors.attachment ? attachmentErrorId : attachmentHintId}
              onChange={(event) => {
                if (!hasSubmitAttempted) {
                  return;
                }
                const form = event.currentTarget.form;
                if (!form) {
                  return;
                }
                const attachmentError = validateInquiryAttachment(new FormData(form).get("attachment"));
                setFieldErrors((currentErrors) => mergeFieldError(currentErrors, "attachment", attachmentError));
              }}
            />
            <p className="form-field-hint" id={attachmentHintId}>PDF, DOC, DOCX, JPG ili PNG. Maksimalno 4 MB.</p>
            {fieldErrors.attachment ? <p className="form-field-error" id={attachmentErrorId}>{fieldErrors.attachment}</p> : null}
          </div>

          <label className="form-consent" htmlFor={consentId}>
            <input
              id={consentId}
              name="consent"
              required
              type="checkbox"
              aria-invalid={fieldErrors.consent ? "true" : undefined}
              aria-describedby={fieldErrors.consent ? consentErrorId : undefined}
              onBlur={(event) => handleFieldBlur("consent", event)}
              onChange={handleConsentChange}
            />
            <span>Saglasan/saglasna sam da me kontaktirate povodom poslatog upita.</span>
          </label>
          {fieldErrors.consent ? <p className="form-field-error" id={consentErrorId}>{fieldErrors.consent}</p> : null}

          <div className="contact-modal__captcha">
            <p className="form-label" id={captchaLabelId}>Provera sigurnosti *</p>
            <TurnstileWidget
              action="contact_inquiry"
              resetSignal={turnstileResetSignal}
              onToken={(token) => {
                setTurnstileToken(token);
                setCaptchaError("");
              }}
              onError={() => {
                setTurnstileToken("");
                if (hasSubmitAttempted) {
                  setCaptchaError("Sigurnosna provera nije uspela. Osvežite stranicu i pokušajte ponovo.");
                }
              }}
            />
            {captchaError ? <p className="form-field-error" id={captchaErrorId}>{captchaError}</p> : null}
          </div>

          {formMessage ? (
            <p
              className={`form-feedback form-feedback--${formStatus}`}
              aria-live={formStatus === "error" ? "assertive" : "polite"}
              role={formStatus === "error" ? "alert" : "status"}
            >
              {formStatus === "success" ? <CheckCircle2 /> : null}
              {formStatus === "error" ? <AlertCircle /> : null}
              <span>{formMessage}</span>
            </p>
          ) : null}

          {formStatus === "success" ? (
            <div className="contact-modal__success-actions">
              <button className="site-button site-button--outline" type="button" onClick={onClose}>Zatvori</button>
              <Link
                className="contact-modal__success-link"
                to="/projekti/heroja-pinkija-13/ponuda-stanova"
                onClick={onClose}
              >
                Pogledajte ponudu stanova
                <ArrowUpRight />
              </Link>
            </div>
          ) : (
            <div className="contact-modal__submit-group">
              <button
                className="site-button site-button--dark contact-modal__submit"
                type="submit"
                disabled={formStatus === "sending"}
              >
                <Send />
                {formStatus === "sending" ? "Slanje..." : mergedOptions.submitLabel}
                <ArrowUpRight />
              </button>
              <p>{mergedOptions.reassuranceText}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

function isSalesPhoneRequired(inquiryType: ContactModalOptions["inquiryType"]) {
  return inquiryType === "unit" || inquiryType === "viewing" || inquiryType === "availability";
}

function validateContactModalForm(
  formData: FormData,
  isPhoneRequired: boolean,
): FieldErrors<ContactModalFieldName> {
  return {
    name: validateRequiredText(getFormValue(formData, "name"), "Ime i prezime"),
    phone: validatePhone(getFormValue(formData, "phone"), isPhoneRequired),
    email: validateEmail(getFormValue(formData, "email")),
    message: validateOptionalText(getFormValue(formData, "message"), "Poruka", 4000),
    attachment: validateInquiryAttachment(formData.get("attachment")),
    consent: validateConsent(formData.get("consent")),
  };
}

function buildContextualMessage(options: ContactModalOptions, message: string) {
  const contextLines = [
    options.unitCode ? `stan: ${options.unitCode}` : null,
    ...(options.details ?? []).map((detail) => `${detail.label}: ${detail.value}`),
  ].filter(Boolean);

  if (contextLines.length === 0) {
    return message;
  }

  return [`Kontekst upita:\n${contextLines.join("\n")}`, message]
    .filter(Boolean)
    .join("\n\n");
}

function getFocusableElements(container: HTMLElement | null) {
  if (!container) {
    return [];
  }

  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((element) => {
    if (element.hasAttribute("disabled") || element.tabIndex < 0) {
      return false;
    }

    return element.offsetParent !== null;
  });
}

export default ContactModalDialog;
