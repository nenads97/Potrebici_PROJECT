import type { FormEvent } from "react";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  ClipboardCheck,
  FileText,
  Home,
  MapPin,
  MessageCircle,
  Paperclip,
  Phone,
  Ruler,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import {
  contactEmail,
  contactPhone,
  contactPhoneHref,
} from "../../features/projects/data/herojaPinkija13.data";
import { submitLandOffer } from "../../features/inquiries/api/inquiryFunctions.api";
import { TurnstileWidget } from "../../features/inquiries/components/TurnstileWidget";
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
  validatePositiveNumber,
  validateRequiredText,
  type FieldErrors,
} from "../../features/inquiries/utils/formValidation";
import { PageMeta } from "../../shared/components/PageMeta";

const landHeroImage = "/images/kupovina-placeva-hero.jpg";

const heroHighlights = [
  { value: "Novi Sad", label: "fokus lokacije" },
  { value: "Stambena namena", label: "potencijal za razvoj" },
  { value: "Jasan dogovor", label: "brza početna procena" },
];

const criteria = [
  {
    icon: Home,
    title: "Plac ili kuća za rušenje",
    text: "Razmatramo parcele i postojeće objekte pogodne za novu stambenu izgradnju.",
  },
  {
    icon: MapPin,
    title: "Novi Sad i bliža okolina",
    text: "Prednost imaju gradske lokacije sa dobrom povezanošću, infrastrukturom i jasnim urbanističkim potencijalom.",
  },
  {
    icon: Ruler,
    title: "Stambena namena",
    text: "Tražimo zemljište koje može da podrži kvalitetan višeporodični stambeni objekat.",
  },
  {
    icon: ShieldCheck,
    title: "Pravno čista situacija",
    text: "Najbrže možemo da reagujemo kada su vlasništvo, dokumentacija i osnovni uslovi za prodaju jasni.",
  },
];

const processSteps = [
  "Pošaljite osnovne podatke o parceli, kući ili lokaciji.",
  "Naš tim proverava potencijal lokacije i kontaktira vas za dodatne informacije.",
  "Dogovaramo sledeći korak, procenu i uslove saradnje.",
];

const preparationItems = [
  "Adresa ili okvirna lokacija nekretnine",
  "Površina parcele i pristup ulici",
  "Kratak opis postojećeg objekta, ako postoji",
  "Status dokumentacije koji vam je poznat",
];

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
};

const staticFadeUp = {
  hidden: { opacity: 1, y: 0 },
  show: { opacity: 1, y: 0 },
};

const instantTransition = { duration: 0 };

type LandOfferFieldName =
  | "name"
  | "phone"
  | "email"
  | "address"
  | "plotArea"
  | "details"
  | "attachment"
  | "consent";

const landOfferFieldOrder: LandOfferFieldName[] = [
  "name",
  "phone",
  "email",
  "address",
  "plotArea",
  "details",
  "attachment",
  "consent",
];

export const LandBuyPage = () => {
  const reduceMotion = useReducedMotion();
  const reveal = reduceMotion ? staticFadeUp : fadeUp;
  const revealTransition = reduceMotion
    ? instantTransition
    : { duration: 0.55 };

  return (
    <main className="land-page">
      <PageMeta
        title="Kupujemo placeve | M & M Gradnja"
        description="M & M Gradnja razmatra placeve i kuće za rušenje u Novom Sadu i okolini za buduće stambene projekte."
        image={landHeroImage}
        imageAlt="Parcela pogodna za stambenu gradnju"
      />
      <section className="land-hero">
        <img
          src={landHeroImage}
          alt="Parcela pogodna za stambenu gradnju"
          width="1672"
          height="941"
          fetchPriority="high"
          decoding="async"
        />
        <div className="land-hero__overlay" />

        <motion.div
          className="page-container land-hero__content"
          initial="hidden"
          animate="show"
          variants={reveal}
          transition={reduceMotion ? instantTransition : { duration: 0.6 }}
        >
          <p className="section-eyebrow">Kupujemo placeve</p>
          <h1>Imate plac ili kuću za stambenu gradnju?</h1>
          <p>
            M & M Gradnja razmatra atraktivne lokacije za buduće stambene
            projekte. Pošaljite nam osnovne informacije, a mi ćemo vam se brzo
            javiti sa narednim koracima.
          </p>
          <div>
            <a
              className="site-button site-button--accent"
              href="#kupujemo-placeve-forma"
            >
              <MessageCircle />
              Pošaljite ponudu
            </a>
            <a
              className="site-button site-button--light"
              href={contactPhoneHref}
            >
              <Phone />
              Pozovite {contactPhone}
            </a>
          </div>
        </motion.div>

        <motion.div
          className="page-container land-hero__stats"
          initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={
            reduceMotion ? instantTransition : { duration: 0.55, delay: 0.12 }
          }
        >
          {heroHighlights.map((item) => (
            <div key={item.value}>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </div>
          ))}
        </motion.div>
      </section>

      <section
        id="kupujemo-placeve-forma"
        className="page-section page-section--surface"
      >
        <div className="page-container split-grid">
          <motion.div
            className="land-scroll-heading"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={reveal}
            transition={revealTransition}
          >
            <p className="section-eyebrow">Formular za ponudu</p>
            <h2 className="section-title section-title--medium">
              Prvi korak je kratak upit.
            </h2>
            <p className="section-copy">
              Unesite osnovne podatke o sebi i nekretnini. Ime, telefon i e-mail
              su obavezni, a adresa i površina parcele nam pomažu da brže
              procenimo potencijal lokacije.
            </p>
            <div className="contact-links">
              <a href={contactPhoneHref}>
                <Phone className="icon-inline" />
                {contactPhone}
              </a>
              <a href={`mailto:${contactEmail}`}>
                <MessageCircle className="icon-inline" />
                {contactEmail}
              </a>
            </div>
          </motion.div>

          <PropertyOfferForm />
        </div>
      </section>

      <section className="page-section page-section--surface">
        <div className="page-container split-grid">
          <motion.div
            className="land-scroll-heading"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={reveal}
            transition={revealTransition}
          >
            <p className="section-eyebrow">šta tražimo</p>
            <h2 className="section-title section-title--medium">
              Pretvorite svoj plac u vrednu investiciju.
            </h2>
            <p className="section-copy">
              Najvažnije su nam uredna dokumentacija, dobra pozicija i realna
              mogućnost razvoja stambenog projekta. Ako niste sigurni da li se
              vaša nekretnina uklapa, pošaljite podatke i proverićemo.
            </p>
            <blockquote>
              Dovoljno je da pošaljete osnovne podatke. Prvu procenu radimo
              diskretno i bez obaveze za vlasnika.
            </blockquote>
          </motion.div>

          <div className="info-card-grid">
            {criteria.map(({ icon: Icon, title, text }, index) => (
              <motion.article
                className="info-card"
                key={title}
                initial={
                  reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }
                }
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={
                  reduceMotion
                    ? instantTransition
                    : { duration: 0.45, delay: index * 0.06 }
                }
                whileHover={reduceMotion ? undefined : { y: -4 }}
              >
                <span className="icon-bubble">
                  <Icon />
                </span>
                <h3>{title}</h3>
                <p>{text}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="page-section land-process">
        <div className="page-container split-grid split-grid--center">
          <motion.div
            className="dark-process-card"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
            variants={reveal}
            transition={revealTransition}
          >
            <div>
              <ClipboardCheck className="icon-inline" />
              <p>Proces</p>
            </div>
            {processSteps.map((step, index) => (
              <div className="process-step" key={step}>
                <span>{index + 1}</span>
                <p>{step}</p>
              </div>
            ))}
          </motion.div>

          <motion.div
            className="land-scroll-heading land-scroll-heading--process"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
            variants={reveal}
            transition={
              reduceMotion ? instantTransition : { duration: 0.55, delay: 0.08 }
            }
          >
            <p className="section-eyebrow">Sigurna saradnja</p>
            <h2 className="section-title section-title--medium">
              Brz odgovor, jasna komunikacija i korektan dogovor.
            </h2>
            <p className="section-copy">
              Fokus je na jednostavnom prvom kontaktu: lokacija, površina,
              dokumentacija i kratak opis. Nakon toga možemo brzo da procenimo
              da li postoji osnova za razgovor.
            </p>

            <div className="check-list">
              {preparationItems.map((item) => (
                <p key={item}>
                  <span className="icon-bubble">
                    <Sparkles />
                  </span>
                  {item}
                </p>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
};

const PropertyOfferForm = () => {
  const [formStatus, setFormStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");
  const [formMessage, setFormMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<
    FieldErrors<LandOfferFieldName>
  >({});
  const [hasSubmitAttempted, setHasSubmitAttempted] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileResetSignal, setTurnstileResetSignal] = useState(0);
  const [captchaError, setCaptchaError] = useState("");
  const reduceMotion = useReducedMotion();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setHasSubmitAttempted(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const errors = validateLandOfferForm(formData);

    if (hasFieldErrors(errors)) {
      setFieldErrors(errors);
      setFormStatus("error");
      setFormMessage("Proverite označena polja pre slanja ponude.");
      focusFirstInvalidField(form, landOfferFieldOrder, errors);
      return;
    }

    if (!turnstileToken) {
      setCaptchaError("Potvrdite da niste robot pre slanja ponude.");
      setFormStatus("error");
      setFormMessage("Potvrdite sigurnosnu proveru pre slanja ponude.");
      return;
    }

    setFormStatus("sending");
    setFormMessage("");
    setFieldErrors({});
    setCaptchaError("");

    try {
      await submitLandOffer({
        fullName: getFormValue(formData, "name"),
        phone: getFormValue(formData, "phone"),
        email: getFormValue(formData, "email"),
        propertyAddress: getFormValue(formData, "address"),
        plotAreaM2: getFormValue(formData, "plotArea"),
        details: getFormValue(formData, "details"),
        sourcePage: window.location.pathname,
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
      setFormMessage(
        "Hvala. Ponuda je poslata i javićemo vam se nakon pocetne provere.",
      );
      setFieldErrors({});
      setHasSubmitAttempted(false);
      setCaptchaError("");
      setTurnstileToken("");
      setTurnstileResetSignal((current) => current + 1);
    } catch (error) {
      setFormStatus("error");
      setFormMessage(
        error instanceof Error ? error.message : "Slanje nije uspelo.",
      );
      setTurnstileToken("");
      setTurnstileResetSignal((current) => current + 1);
    }
  };

  const handleFieldBlur = (
    fieldName: LandOfferFieldName,
    event: { currentTarget: HTMLInputElement | HTMLTextAreaElement },
  ) => {
    if (!hasSubmitAttempted) {
      return;
    }

    const form = event.currentTarget.form;

    if (!form) {
      return;
    }

    const errors = validateLandOfferForm(new FormData(form));
    setFieldErrors((currentErrors) =>
      mergeFieldError(currentErrors, fieldName, errors[fieldName]),
    );
  };

  return (
    <motion.form
      className="soft-card inquiry-form"
      onSubmit={handleSubmit}
      aria-busy={formStatus === "sending"}
      noValidate
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      variants={reduceMotion ? staticFadeUp : fadeUp}
      transition={
        reduceMotion ? instantTransition : { duration: 0.55, delay: 0.08 }
      }
    >
      <div className="inquiry-form__head">
        <FileText className="icon-inline" />
        <div>
          <strong>Podaci za početnu procenu</strong>
          <p>Polja označena zvezdicom su obavezna.</p>
        </div>
      </div>

      <div className="inquiry-form__body">
        <div className="form-grid form-grid--two">
          <FormField
            id="land-name"
            label="Ime"
            name="name"
            autoComplete="name"
            required
            maxLength={160}
            error={fieldErrors.name}
            errorId="land-name-error"
            onBlur={(event) => handleFieldBlur("name", event)}
          />
          <FormField
            id="land-phone"
            label="Telefon"
            name="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            required
            maxLength={80}
            error={fieldErrors.phone}
            errorId="land-phone-error"
            onBlur={(event) => handleFieldBlur("phone", event)}
          />
          <FormField
            id="land-email"
            label="E-mail"
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            error={fieldErrors.email}
            errorId="land-email-error"
            onBlur={(event) => handleFieldBlur("email", event)}
          />
          <FormField
            id="land-address"
            label="Adresa nekretnine"
            name="address"
            autoComplete="street-address"
            maxLength={260}
            error={fieldErrors.address}
            errorId="land-address-error"
            onBlur={(event) => handleFieldBlur("address", event)}
          />
          <FormField
            id="land-plot-area"
            label="Površina parcele (m2)"
            name="plotArea"
            type="number"
            inputMode="numeric"
            min="0"
            error={fieldErrors.plotArea}
            errorId="land-plot-area-error"
            onBlur={(event) => handleFieldBlur("plotArea", event)}
          />
        </div>

        <div className="form-field inquiry-form__textarea">
          <label
            className="form-field form-field--hidden"
            htmlFor="land-website"
          >
            Website
            <input
              id="land-website"
              name="website"
              tabIndex={-1}
              type="text"
              autoComplete="off"
            />
          </label>

          <label className="form-label" htmlFor="land-details">
            Dodatne informacije
          </label>
          <textarea
            className="form-textarea"
            id="land-details"
            name="details"
            placeholder="Napišite sta znate o dokumentaciji, pristupu, objektu na placu ili uslovima prodaje."
            rows={6}
            maxLength={5000}
            aria-invalid={fieldErrors.details ? "true" : undefined}
            aria-describedby={
              fieldErrors.details ? "land-details-error" : undefined
            }
            onBlur={(event) => handleFieldBlur("details", event)}
          />
          {fieldErrors.details ? (
            <p className="form-field-error" id="land-details-error">
              {fieldErrors.details}
            </p>
          ) : null}
        </div>

        <div className="form-field inquiry-form__attachment-field">
          <label className="form-label" htmlFor="land-attachment">
            <Paperclip />
            Priložite dokument <span>(opciono)</span>
          </label>
          <input
            className="form-input form-input--file"
            id="land-attachment"
            name="attachment"
            type="file"
            accept={inquiryAttachmentAccept}
            aria-invalid={fieldErrors.attachment ? "true" : undefined}
            aria-describedby={
              fieldErrors.attachment
                ? "land-attachment-error"
                : "land-attachment-hint"
            }
            onChange={(event) => {
              if (!hasSubmitAttempted) {
                return;
              }

              const form = event.currentTarget.form;

              if (!form) {
                return;
              }

              const attachmentError = validateInquiryAttachment(
                new FormData(form).get("attachment"),
              );
              setFieldErrors((currentErrors) =>
                mergeFieldError(currentErrors, "attachment", attachmentError),
              );
            }}
          />
          <p className="form-field-hint" id="land-attachment-hint">
            PDF, DOC, DOCX, JPG ili PNG. Maksimalno 4 MB.
          </p>
          {fieldErrors.attachment ? (
            <p className="form-field-error" id="land-attachment-error">
              {fieldErrors.attachment}
            </p>
          ) : null}
        </div>

        <div className="inquiry-form__captcha">
          <p className="form-label" id="land-captcha-label">
            Provera sigurnosti *
          </p>
          <TurnstileWidget
            action="land_offer"
            resetSignal={turnstileResetSignal}
            onToken={(token) => {
              setTurnstileToken(token);
              setCaptchaError("");
            }}
            onError={() => {
              setTurnstileToken("");
              if (hasSubmitAttempted) {
                setCaptchaError(
                  "Sigurnosna provera nije uspela. Osvežite stranicu i pokušajte ponovo.",
                );
              }
            }}
          />
          {captchaError ? (
            <p className="form-field-error" id="land-captcha-error">
              {captchaError}
            </p>
          ) : null}
        </div>

        <label className="form-consent" htmlFor="land-consent">
          <input
            id="land-consent"
            name="consent"
            required
            type="checkbox"
            aria-invalid={fieldErrors.consent ? "true" : undefined}
            aria-describedby={
              fieldErrors.consent ? "land-consent-error" : undefined
            }
            onBlur={(event) => handleFieldBlur("consent", event)}
            onChange={(event) => handleFieldBlur("consent", event)}
          />
          <span>
            Saglasan/saglasna sam da me kontaktirate povodom poslate ponude.
          </span>
        </label>
        {fieldErrors.consent ? (
          <p className="form-field-error" id="land-consent-error">
            {fieldErrors.consent}
          </p>
        ) : null}

        {formMessage ? (
          <p
            className={`form-feedback form-feedback--${formStatus}`}
            role={formStatus === "error" ? "alert" : "status"}
            aria-live={formStatus === "error" ? "assertive" : "polite"}
          >
            {formMessage}
          </p>
        ) : null}

        <div className="inquiry-form__submit-group">
          <button
            className="site-button site-button--dark"
            type="submit"
            disabled={formStatus === "sending"}
          >
            <MessageCircle />
            {formStatus === "sending" ? "Slanje..." : "Pošaljite podatke"}
            <ArrowUpRight />
          </button>
          <p>
            Prva provera je bez obaveze. Javljamo se nakon što pogledamo osnovne
            podatke o lokaciji.
          </p>
        </div>
      </div>
    </motion.form>
  );
};

type FormFieldProps = {
  id: string;
  label: string;
  name: string;
  required?: boolean;
  type?: string;
  autoComplete?: string;
  inputMode?:
    | "none"
    | "text"
    | "decimal"
    | "numeric"
    | "tel"
    | "search"
    | "email"
    | "url";
  min?: string;
  maxLength?: number;
  error?: string;
  errorId?: string;
  onBlur?: (event: { currentTarget: HTMLInputElement }) => void;
};

const FormField = ({
  id,
  label,
  name,
  required = false,
  type = "text",
  autoComplete,
  inputMode,
  min,
  maxLength,
  error,
  errorId,
  onBlur,
}: FormFieldProps) => {
  return (
    <div className="form-field">
      <label className="form-label" htmlFor={id}>
        {label}
        {required ? " *" : ""}
      </label>
      <input
        className="form-input"
        id={id}
        name={name}
        required={required}
        type={type}
        autoComplete={autoComplete}
        inputMode={inputMode}
        min={min}
        maxLength={maxLength}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error && errorId ? errorId : undefined}
        onBlur={onBlur}
      />
      {error && errorId ? (
        <p className="form-field-error" id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  );
};

function validateLandOfferForm(
  formData: FormData,
): FieldErrors<LandOfferFieldName> {
  return {
    name: validateRequiredText(getFormValue(formData, "name"), "Ime"),
    phone: validatePhone(getFormValue(formData, "phone"), true),
    email: validateEmail(getFormValue(formData, "email")),
    address: validateOptionalText(
      getFormValue(formData, "address"),
      "Adresa nekretnine",
      260,
    ),
    plotArea: validatePositiveNumber(
      getFormValue(formData, "plotArea"),
      "Površina parcele",
    ),
    details: validateOptionalText(
      getFormValue(formData, "details"),
      "Dodatne informacije",
      5000,
    ),
    attachment: validateInquiryAttachment(formData.get("attachment")),
    consent: validateConsent(formData.get("consent")),
  };
}
