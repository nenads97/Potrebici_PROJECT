import { Building2, CalendarDays, Car, Mail, MapPin, Navigation, Phone, Trees } from "lucide-react";

import { ContactModalButton } from "../../features/inquiries/components/ContactModal";
import { contactEmail, contactPhone } from "../../features/projects/data/herojaPinkija13.data";
import { PageMeta } from "../../shared/components/PageMeta";

const location = {
  address: "Heroja Pinkija 13, Novi Sad",
  coordinates: "45.237485, 19.822429",
  mapsEmbedUrl: "https://maps.google.com/maps?q=45.237485,19.822429&z=16&output=embed",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=45.237485,19.822429",
};

const locationBenefits = [
  {
    icon: Building2,
    title: "Pocetak Telepa",
    text: "Mirna gradska lokacija sa svakodnevnim sadrzajima u blizini.",
  },
  {
    icon: Car,
    title: "Direktna veza sa centrom",
    text: "Autobuska linija 12 povezuje lokaciju sa centrom Novog Sada.",
  },
  {
    icon: Trees,
    title: "Kej, Ribarac i Sodros",
    text: "U blizini su kej, Ribarac, Sodros, parkovi, Lidl i Gimnazija Laza Kostic.",
  },
];

export const LocationPage = () => {
  return (
    <main>
      <PageMeta
        title="Lokacija Heroja Pinkija 13 | M & M Gradnja"
        description="Pogledajte lokaciju projekta Heroja Pinkija 13 na pocetku Telepa u Novom Sadu, uz vezu sa gradom i sadrzaje u blizini."
      />
      <section className="page-section page-section--surface">
        <div className="page-container split-grid split-grid--center">
          <div className="fade-up">
            <p className="section-eyebrow">Lokacija projekta</p>
            <h1 className="section-title">Heroja Pinkija 13.</h1>
            <p className="section-copy section-copy--large">
              Objekat se nalazi na pocetku Telepa, na lokaciji koja spaja mirniji
              stambeni karakter i direktnu vezu sa centrom grada linijom 12. Buduci
              most dodatno ce poboljsati vezu sa Fruskom gorom.
            </p>

            <div className="page-actions">
              <a className="site-button site-button--accent" href={location.mapsUrl} target="_blank" rel="noreferrer">
                <Navigation />
                Otvori Google Maps
              </a>
              <ContactModalButton
                className="site-button site-button--outline"
                modalOptions={{
                  eyebrow: "Lokacija projekta",
                  title: "Pitajte nas za obilazak lokacije",
                  description:
                    "Ostavite kontakt i napisite kada biste voleli da obidjete lokaciju ili dobijete dodatne informacije o projektu.",
                  inquiryType: "viewing",
                  details: [{ label: "Lokacija", value: location.address }],
                  messagePlaceholder: "Napisite pitanje o lokaciji ili predlog termina za obilazak.",
                }}
              >
                <CalendarDays />
                Pisite prodaji
              </ContactModalButton>
            </div>
          </div>

          <div className="image-card map-card map-card--large">
            <iframe
              title="Google mapa lokacije Heroja Pinkija 13, Novi Sad"
              src={location.mapsEmbedUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="page-container split-grid">
          <div className="soft-card location-info-card">
            <p className="section-eyebrow">Adresa i koordinate</p>
            <InfoRow icon={MapPin} label="Adresa" value={location.address} />
            <InfoRow icon={Navigation} label="Koordinate" value={location.coordinates} />
            <InfoRow icon={Phone} label="Telefon prodaje" value={contactPhone} href={`tel:${contactPhone}`} />
            <InfoRow icon={Mail} label="Email" value={contactEmail} href={`mailto:${contactEmail}`} />
          </div>

          <div className="location-benefits">
            {locationBenefits.map(({ icon: Icon, title, text }) => (
              <article className="info-card info-card--row" key={title}>
                <span className="icon-bubble">
                  <Icon />
                </span>
                <div>
                  <h2>{title}</h2>
                  <p>{text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

type InfoRowProps = {
  icon: typeof MapPin;
  label: string;
  value: string;
  href?: string;
};

const InfoRow = ({ icon: Icon, label, value, href }: InfoRowProps) => {
  const content = (
    <>
      <span className="icon-bubble">
        <Icon />
      </span>
      <span>
        <small>{label}</small>
        <strong>{value}</strong>
      </span>
    </>
  );

  if (href) {
    return (
      <a className="location-info-row" href={href}>
        {content}
      </a>
    );
  }

  return <div className="location-info-row">{content}</div>;
};
