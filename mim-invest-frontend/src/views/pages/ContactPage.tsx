import {
  ArrowUpRight,
  Mail,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
} from "lucide-react";

import { ContactModalButton } from "../../features/inquiries/components/ContactModal";
import { contactEmail, contactPhone } from "../../features/projects/data/herojaPinkija13.data";
import { PageMeta } from "../../shared/components/PageMeta";

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
    label: "Brz poziv",
    title: formatPhone(contactPhone),
    text: "Pozovite prodaju za dostupnost stanova, cene, kvadrature i uslove kupovine.",
    href: `tel:${contactPhone}`,
    action: "Pozovite prodaju",
  },
  {
    icon: Mail,
    label: "Pisani upit",
    title: "Pisite nam",
    text: "Posaljite upit sa stanom koji vas zanima ili pitanjem o projektu.",
    href: `mailto:${contactEmail}`,
    action: "Pisite nam",
  },
  {
    icon: MapPin,
    label: "Obilazak lokacije",
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

const contactPageModal = {
  eyebrow: "Kontakt",
  title: "Pisite nam za stanove i obilazak",
  description:
    "Posaljite upit za konkretan stan, kvadraturu, cenu, uslove kupovine ili termin obilaska projekta Heroja Pinkija 13.",
  inquiryType: "general" as const,
  details: [
    { label: "Projekat", value: "Heroja Pinkija 13" },
    { label: "Kontakt", value: "Direktna prodaja" },
  ],
  messagePlaceholder: "Napisite koji stan, kvadratura ili termin obilaska vas zanima.",
};

export const ContactPage = () => {
  return (
    <main>
      <PageMeta
        title="Kontakt | M & M Gradnja"
        description="Kontaktirajte prodaju za stanove, dostupnost, cenu i obilazak projekta Heroja Pinkija 13 u Novom Sadu."
        structuredData={({ canonicalUrl, origin }) => ({
          "@context": "https://schema.org",
          "@type": "ContactPage",
          name: "Kontakt | M & M Gradnja",
          url: canonicalUrl,
          mainEntity: {
            "@type": "Organization",
            name: "M & M Gradnja",
            url: origin,
            email: contactEmail,
            telephone: contactPhone,
            address: {
              "@type": "PostalAddress",
              streetAddress: location.address,
              postalCode: "21000",
              addressLocality: "Novi Sad",
              addressCountry: "RS",
            },
            contactPoint: {
              "@type": "ContactPoint",
              telephone: contactPhone,
              email: contactEmail,
              contactType: "sales",
              areaServed: "RS",
              availableLanguage: ["sr-Latn"],
            },
          },
        })}
      />
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
              <ContactModalButton
                className="site-button site-button--accent"
                modalOptions={contactPageModal}
              >
                <MessageCircle />
                Pisite nam
              </ContactModalButton>
              <a className="site-button site-button--outline" href={`tel:${contactPhone}`}>
                <Phone />
                Pozovite {contactPhone}
              </a>
            </div>
          </div>

          <div className="image-card contact-hero-card">
            <img
              src={contactHeroImage}
              alt="M & M Gradnja objekat"
              fetchPriority="high"
              decoding="async"
            />
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
                {label === "Pisani upit" ? (
                  <ContactModalButton
                    className="info-card__action"
                    modalOptions={contactPageModal}
                  >
                    {action}
                    <ArrowUpRight className="icon-inline" />
                  </ContactModalButton>
                ) : (
                  <a href={href}>
                    {action}
                    <ArrowUpRight className="icon-inline" />
                  </a>
                )}
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
    </main>
  );
};

function formatPhone(phone: string) {
  return phone.replace("+381", "+381 ");
}
