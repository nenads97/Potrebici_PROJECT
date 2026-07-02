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

import { contactEmail, contactPhone } from "../../projects/data/herojaPinkija13.data";
import {
  submitContactInquiry,
} from "../api/inquiryFunctions.api";
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

const ContactModal = ({ isOpen, options, onClose }: ContactModalProps) => {
  const titleId = useId();
  const descriptionId = useId();
  const nameId = useId();
  const phoneId = useId();
  const emailId = useId();
  const websiteId = useId();
  const messageId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const [formStatus, setFormStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [formMessage, setFormMessage] = useState("");

  const mergedOptions = { ...defaultModalOptions, ...options };

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
    const getValue = (name: string) => String(formData.get(name) ?? "").trim();

    setFormStatus("sending");
    setFormMessage("");

    try {
      await submitContactInquiry({
        fullName: getValue("name"),
        phone: getValue("phone"),
        email: getValue("email"),
        message: buildContextualMessage(mergedOptions, getValue("message")),
        projectSlug: mergedOptions.projectSlug,
        unitCode: mergedOptions.unitCode,
        inquiryType: mergedOptions.inquiryType,
        sourcePage: mergedOptions.sourcePage ?? window.location.pathname,
        consentAccepted: formData.get("consent") === "on",
        website: getValue("website"),
      });

      form.reset();
      setFormStatus("success");
      setFormMessage(mergedOptions.successMessage);
    } catch (error) {
      setFormStatus("error");
      setFormMessage(error instanceof Error ? error.message : "Slanje nije uspelo.");
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
            <a href={`tel:${contactPhone}`}>
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

        <form className="contact-modal__form" onSubmit={handleSubmit}>
          <div className="contact-modal__form-head">
            <FileText />
            <div>
              <strong>Podaci za odgovor</strong>
              <p>Ime i e-mail su obavezni. Telefon pomaze da dogovor bude brzi.</p>
            </div>
          </div>

          <div className="form-grid form-grid--two">
            <div className="form-field">
              <label className="form-label" htmlFor={nameId}>
                Ime i prezime *
              </label>
              <input ref={firstInputRef} className="form-input" id={nameId} name="name" required type="text" />
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor={phoneId}>
                Telefon
              </label>
              <input className="form-input" id={phoneId} name="phone" type="tel" />
            </div>

            <div className="form-field contact-modal__email-field">
              <label className="form-label" htmlFor={emailId}>
                E-mail *
              </label>
              <input className="form-input" id={emailId} name="email" required type="email" />
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
              rows={5}
            />
          </div>

          <label className="form-consent">
            <input name="consent" required type="checkbox" />
            <span>Saglasan/saglasna sam da me kontaktirate povodom poslatog upita.</span>
          </label>

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
              <a className="contact-modal__success-link" href="/projekti/heroja-pinkija-13/ponuda-stanova">
                Pogledajte ponudu stanova
                <ArrowUpRight />
              </a>
            </div>
          ) : (
            <button
              className="site-button site-button--dark contact-modal__submit"
              type="submit"
              disabled={formStatus === "sending"}
            >
              <Send />
              {formStatus === "sending" ? "Slanje..." : mergedOptions.submitLabel}
              <ArrowUpRight />
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

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
  ).filter((element) => !element.hasAttribute("disabled") && element.offsetParent !== null);
}
