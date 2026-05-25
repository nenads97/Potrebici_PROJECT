import type { FormEvent } from "react";
import { useState } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  FileText,
  Mail,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  Send,
} from "lucide-react";

import { contactEmail, contactPhone } from "../../features/projects/data/herojaPinkija13.data";
import { submitContactInquiry } from "../../features/inquiries/api/inquiryFunctions.api";

const contactHeroImage =
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2200&q=85";

const location = {
  address: "Heroja Pinkija 13",
  city: "21000 Novi Sad",
  country: "Srbija",
  coordinates: "45.237485, 19.822429",
  mapsEmbedUrl: "https://maps.google.com/maps?q=45.237485,19.822429&z=16&output=embed",
};

const heroHighlights = [
  { value: "Heroja Pinkija 13", label: "lokacija projekta" },
  { value: "15 stanova", label: "jasna ponuda za kupce" },
  { value: "Direktan kontakt", label: "prodaja i obilazak" },
];

const contactMethods = [
  {
    icon: Phone,
    label: "Telefon",
    title: formatPhone(contactPhone),
    text: "Pozovite prodaju za dostupnost stanova, cene, kvadrature i uslove kupovine.",
    href: `tel:${contactPhone}`,
    action: "Pozovite sada",
  },
  {
    icon: Mail,
    label: "E-mail",
    title: contactEmail,
    text: "Posaljite upit sa stanom koji vas zanima ili pitanjem o projektu.",
    href: `mailto:${contactEmail}`,
    action: "Posaljite e-mail",
  },
  {
    icon: MapPin,
    label: "Adresa",
    title: location.address,
    text: `${location.city}, ${location.country}. Lokacija je na pocetku Telepa, uz dobru vezu sa gradom.`,
    href: "#kontakt-mapa",
    action: "Pogledajte mapu",
  },
];

const visitSteps = [
  "Posaljite upit ili pozovite prodaju.",
  "Proveravamo dostupne stanove i termin koji vam odgovara.",
  "Dogovaramo obilazak i saljemo dodatne informacije o izabranom stanu.",
];

export const ContactPage = () => {
  return (
    <main>
      <section className="page-section page-section--surface contact-hero">
        <div className="page-container split-grid split-grid--end">
          <div className="fade-up">
            <p className="section-eyebrow">Kontakt</p>
            <h1 className="section-title">Brz kontakt za kupovinu i obilazak.</h1>
            <p className="section-copy section-copy--large">
              Pozovite prodaju ili posaljite upit za dostupne stanove, kvadrature,
              cenu, tlocrt i obilazak objekta Heroja Pinkija 13.
            </p>
            <div className="page-actions">
              <a className="site-button site-button--accent" href="#kontakt-forma">
                <CalendarDays />
                Zakazite obilazak
              </a>
              <a className="site-button site-button--outline" href={`tel:${contactPhone}`}>
                <Phone />
                Pozovite {contactPhone}
              </a>
            </div>
          </div>

          <div className="image-card contact-hero-card">
            <img src={contactHeroImage} alt="M & M Gradnja objekat" />
            <div>
              <p className="section-eyebrow">Direktna prodaja</p>
              <a href={`tel:${contactPhone}`}>
                <Phone className="icon-inline" />
                {formatPhone(contactPhone)}
              </a>
              <a href={`mailto:${contactEmail}`}>
                <MessageCircle className="icon-inline" />
                {contactEmail}
              </a>
              <div>
                {heroHighlights.map((item) => (
                  <span key={item.value}>
                    <strong>{item.value}</strong>
                    {item.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-section page-section--surface">
        <div className="page-container split-grid">
          <div className="sticky-copy">
            <p className="section-eyebrow">Direktan kontakt</p>
            <h2 className="section-title section-title--medium">
              Sve informacije za kupovinu na jednom mestu.
            </h2>
            <p className="section-copy">
              Za brzu proveru ponude najbolje je da navedete stan koji vas zanima,
              zeljenu kvadraturu ili termin kada biste mogli da obidjete lokaciju.
            </p>
            <blockquote>
              Ako niste sigurni koji stan odgovara vasim potrebama, posaljite osnovne
              zahteve i predlozicemo dostupne opcije.
            </blockquote>
          </div>

          <div className="contact-method-grid">
            {contactMethods.map(({ icon: Icon, label, title, text, href, action }) => (
              <article className="info-card" key={label}>
                <span className="icon-bubble">
                  <Icon />
                </span>
                <small>{label}</small>
                <h3>{title}</h3>
                <p>{text}</p>
                <a href={href}>
                  {action}
                  <ArrowUpRight className="icon-inline" />
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="kontakt-mapa" className="page-section">
        <div className="page-container split-grid">
          <div className="dark-process-card">
            <div>
              <Navigation className="icon-inline" />
              <p>Lokacija</p>
            </div>
            <h2>Heroja Pinkija 13, Novi Sad.</h2>
            <p>
              Projekat se nalazi na pocetku Telepa, u gradskom okruzenju sa dobrom
              povezanoscu i svakodnevnim sadrzajima u blizini.
            </p>
            {visitSteps.map((step, index) => (
              <div className="process-step" key={step}>
                <span>{index + 1}</span>
                <p>{step}</p>
              </div>
            ))}
          </div>

          <div className="image-card map-card">
            <iframe
              title="Google mapa lokacije Heroja Pinkija 13, Novi Sad"
              src={location.mapsEmbedUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      <section id="kontakt-forma" className="page-section page-section--surface">
        <div className="page-container split-grid">
          <div>
            <p className="section-eyebrow">Pisite nam</p>
            <h2 className="section-title section-title--medium">Posaljite upit prodaji.</h2>
            <p className="section-copy">
              Napisite sta vas zanima: konkretan stan, kvadratura, termin obilaska
              ili uslovi kupovine. Odgovor cemo usmeriti na tacno ono sto vam treba.
            </p>
            <div className="contact-links">
              <a href={`tel:${contactPhone}`}>
                <Phone className="icon-inline" />
                {formatPhone(contactPhone)}
              </a>
              <a href={`mailto:${contactEmail}`}>
                <MessageCircle className="icon-inline" />
                {contactEmail}
              </a>
            </div>
          </div>

          <ContactForm />
        </div>
      </section>
    </main>
  );
};

const ContactForm = () => {
  const [formStatus, setFormStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [formMessage, setFormMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;
    setFormStatus("sending");
    setFormMessage("");

    const formData = new FormData(form);
    const getValue = (name: string) => String(formData.get(name) ?? "").trim();

    try {
      await submitContactInquiry({
        fullName: getValue("name"),
        phone: getValue("phone"),
        email: getValue("email"),
        message: getValue("message"),
        projectSlug: "heroja-pinkija-13",
        inquiryType: "general",
        sourcePage: window.location.pathname,
        consentAccepted: formData.get("consent") === "on",
        website: getValue("website"),
      });

      form.reset();
      setFormStatus("success");
      setFormMessage("Hvala. Upit je poslat i prodajni tim ce vas kontaktirati.");
    } catch (error) {
      setFormStatus("error");
      setFormMessage(error instanceof Error ? error.message : "Slanje nije uspelo.");
    }
  };

  return (
    <form className="soft-card inquiry-form" onSubmit={handleSubmit}>
      <div className="inquiry-form__head">
        <FileText className="icon-inline" />
        <div>
          <strong>Podaci za prodajni tim</strong>
          <p>Ime i e-mail su obavezni za odgovor na upit.</p>
        </div>
      </div>

      <div className="inquiry-form__body">
        <div className="form-grid form-grid--two">
          <ContactField id="contact-name" label="Ime i prezime" name="name" required />
          <ContactField id="contact-phone" label="Telefon" name="phone" type="tel" />
          <ContactField id="contact-email" label="E-mail" name="email" type="email" required />
        </div>

        <div className="form-field inquiry-form__textarea">
          <label className="form-field form-field--hidden" htmlFor="contact-website">
            Website
            <input id="contact-website" name="website" tabIndex={-1} type="text" autoComplete="off" />
          </label>

          <label className="form-label" htmlFor="contact-message">
            Poruka
          </label>
          <textarea
            className="form-textarea"
            id="contact-message"
            name="message"
            placeholder="Napisite koji stan, kvadratura ili termin obilaska vas zanima."
            rows={7}
          />
        </div>

        <label className="form-consent">
          <input name="consent" required type="checkbox" />
          <span>Saglasan/saglasna sam da me kontaktirate povodom poslatog upita.</span>
        </label>

        {formMessage ? (
          <p className={`form-feedback form-feedback--${formStatus}`} role="status">
            {formMessage}
          </p>
        ) : null}

        <button className="site-button site-button--dark" type="submit" disabled={formStatus === "sending"}>
          <Send />
          {formStatus === "sending" ? "Slanje..." : "Posalji upit"}
          <ArrowUpRight />
        </button>
      </div>
    </form>
  );
};

type ContactFieldProps = {
  id: string;
  label: string;
  name: string;
  required?: boolean;
  type?: string;
};

const ContactField = ({ id, label, name, required = false, type = "text" }: ContactFieldProps) => {
  return (
    <div className="form-field">
      <label className="form-label" htmlFor={id}>
        {label}
        {required ? " *" : ""}
      </label>
      <input className="form-input" id={id} name={name} required={required} type={type} />
    </div>
  );
};

function formatPhone(phone: string) {
  return phone.replace("+381", "+381 ");
}
