import type {
  ButtonHTMLAttributes,
  FormEvent,
  KeyboardEvent,
  PropsWithChildren,
  ReactNode,
} from "react";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  FileText,
  Mail,
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
import {
  submitContactInquiry,
} from "../api/inquiryFunctions.api";
import {
  focusFirstInvalidField,
  getFormValue,
  hasFieldErrors,
  mergeFieldError,
  validateConsent,
  validateEmail,
  validateOptionalText,
  validatePhone,
  validateRequiredText,
  type FieldErrors,
} from "../utils/formValidation";
import {
  ContactModalContext,
  defaultModalOptions,
  useContactModal,
  type ContactModalOptions,
} from "./ContactModalContext";

export const ContactModalProvider = ({ children }: PropsWithChildren) => {
  const [modalOptions, setModalOptions] = useState<ContactModalOptions>(defaultModalOptions);
  const [modalRenderKey, setModalRenderKey] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);

  const openContactModal = useCallback((options: ContactModalOptions = {}) => {
    lastFocusedElementRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setModalOptions({ ...defaultModalOptions, ...options });
    setModalRenderKey((currentKey) => currentKey + 1);
    setIsOpen(true);
  }, []);

  const closeContactModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      return undefined;
    }

    lastFocusedElementRef.current?.focus({ preventScroll: true });
    lastFocusedElementRef.current = null;

    return undefined;
  }, [isOpen]);

  const contextValue = useMemo(
    () => ({ openContactModal, closeContactModal }),
    [closeContactModal, openContactModal],
  );

  return (
    <ContactModalContext.Provider value={contextValue}>
      {children}
      <ContactModal
        key={modalRenderKey}
        isOpen={isOpen}
        onClose={closeContactModal}
        options={modalOptions}
      />
    </ContactModalContext.Provider>
  );
};

type ContactModalButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  modalOptions?: ContactModalOptions;
  children: ReactNode;
};

export const ContactModalButton = ({
  children,
  className,
  modalOptions,
  onClick,
  type = "button",
  ...buttonProps
}: ContactModalButtonProps) => {
  const { openContactModal } = useContactModal();
  const buttonClassName = ["contact-modal-button", className].filter(Boolean).join(" ");

  return (
    <button
      {...buttonProps}
      className={buttonClassName}
      type={type}
      onClick={(event) => {
        onClick?.(event);

        if (!event.defaultPrevented) {
          openContactModal(modalOptions);
        }
      }}
    >
      {children}
    </button>
  );
};

type ContactModalProps = {
  isOpen: boolean;
  options: ContactModalOptions;
  onClose: () => void;
};

type ContactModalFieldName = "name" | "phone" | "email" | "message" | "consent";

const contactModalFieldOrder: ContactModalFieldName[] = [
  "name",
  "phone",
  "email",
  "message",
  "consent",
];

const ContactModal = ({ isOpen, options, onClose }: ContactModalProps) => {
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
  const consentId = useId();
  const consentErrorId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const [formStatus, setFormStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [formMessage, setFormMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<ContactModalFieldName>>({});

  const mergedOptions = { ...defaultModalOptions, ...options };
  const isPhoneRequired = isSalesPhoneRequired(mergedOptions.inquiryType);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    window.requestAnimationFrame(() => {
      firstInputRef.current?.focus();
    });

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
  }, [isOpen, onClose, options]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const errors = validateContactModalForm(formData, isPhoneRequired);

    if (hasFieldErrors(errors)) {
      setFieldErrors(errors);
      setFormStatus("error");
      setFormMessage("Proverite oznacena polja pre slanja upita.");
      focusFirstInvalidField(form, contactModalFieldOrder, errors);
      return;
    }

    setFormStatus("sending");
    setFormMessage("");
    setFieldErrors({});

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
      });

      form.reset();
      setFormStatus("success");
      setFormMessage(mergedOptions.successMessage);
      setFieldErrors({});
    } catch (error) {
      setFormStatus("error");
      setFormMessage(error instanceof Error ? error.message : "Slanje nije uspelo.");
    }
  };

  const handleFieldBlur = (
    fieldName: ContactModalFieldName,
    event: { currentTarget: HTMLInputElement | HTMLTextAreaElement },
  ) => {
    const form = event.currentTarget.form;

    if (!form) {
      return;
    }

    const errors = validateContactModalForm(new FormData(form), isPhoneRequired);
    setFieldErrors((currentErrors) => mergeFieldError(currentErrors, fieldName, errors[fieldName]));
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
          aria-label="Zatvori kontakt formu"
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
                  : "Ime i e-mail su obavezni. Telefon pomaze da dogovor bude brzi."}
              </p>
            </div>
          </div>

          <div className="form-grid form-grid--two">
            <div className="form-field">
              <label className="form-label" htmlFor={nameId}>
                Ime i prezime *
              </label>
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
              {fieldErrors.name ? (
                <p className="form-field-error" id={nameErrorId}>
                  {fieldErrors.name}
                </p>
              ) : null}
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor={phoneId}>
                Telefon{isPhoneRequired ? " *" : ""}
              </label>
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
              {fieldErrors.phone ? (
                <p className="form-field-error" id={phoneErrorId}>
                  {fieldErrors.phone}
                </p>
              ) : null}
            </div>

            <div className="form-field contact-modal__email-field">
              <label className="form-label" htmlFor={emailId}>
                E-mail *
              </label>
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
              {fieldErrors.email ? (
                <p className="form-field-error" id={emailErrorId}>
                  {fieldErrors.email}
                </p>
              ) : null}
            </div>
          </div>

          <label className="form-field form-field--hidden" htmlFor={websiteId}>
            Website
            <input id={websiteId} name="website" tabIndex={-1} type="text" autoComplete="off" />
          </label>

          <div className="form-field">
            <label className="form-label" htmlFor={messageId}>
              Poruka
            </label>
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
            {fieldErrors.message ? (
              <p className="form-field-error" id={messageErrorId}>
                {fieldErrors.message}
              </p>
            ) : null}
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
              onChange={(event) => handleFieldBlur("consent", event)}
            />
            <span>Saglasan/saglasna sam da me kontaktirate povodom poslatog upita.</span>
          </label>
          {fieldErrors.consent ? (
            <p className="form-field-error" id={consentErrorId}>
              {fieldErrors.consent}
            </p>
          ) : null}

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
              <button className="site-button site-button--outline" type="button" onClick={onClose}>
                Zatvori
              </button>
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
    consent: validateConsent(formData.get("consent")),
  };
}

function buildContextualMessage(options: ContactModalOptions, message: string) {
  const contextLines = [
    options.unitCode ? `Stan: ${options.unitCode}` : null,
    ...(options.details ?? []).map((detail) => `${detail.label}: ${detail.value}`),
  ].filter(Boolean);

  if (contextLines.length === 0) {
    return message;
  }

  return [`Kontekst upita:\n${contextLines.join("\n")}`, message].filter(Boolean).join("\n\n");
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
