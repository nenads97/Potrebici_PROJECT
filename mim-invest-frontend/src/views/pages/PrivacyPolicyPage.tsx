import {
  ArrowUpRight,
  ClipboardList,
  Database,
  FileText,
  LockKeyhole,
  Mail,
  MessageCircle,
  Phone,
  RefreshCw,
  Scale,
  ShieldCheck,
} from "lucide-react";

import { contactEmail, contactPhone } from "../../features/projects/data/herojaPinkija13.data";

const heroHighlights = [
  { value: "Transparentno", label: "jasno objasnjena obrada" },
  { value: "Namenski", label: "podaci se koriste za upite kupaca" },
  { value: "Kontrolisano", label: "prava mozete zatraziti direktno" },
];

const privacySections = [
  {
    icon: FileText,
    title: "Rukovalac podacima",
    text:
      "Rukovalac podacima je M & M Gradnja. Za pitanja u vezi sa obradom podataka mozete nas kontaktirati putem prodajnog e-maila ili telefona navedenih na sajtu.",
  },
  {
    icon: Database,
    title: "Podaci koje prikupljamo",
    text:
      "Podatke prikupljamo kada posaljete upit, zakazete obilazak, pozovete prodaju ili zatrazite informacije o odredjenom stanu.",
  },
  {
    icon: ClipboardList,
    title: "Svrha obrade",
    text:
      "Podaci se koriste za komunikaciju sa potencijalnim kupcima, slanje informacija o stanovima, organizaciju obilazaka i pripremu ponuda.",
  },
  {
    icon: LockKeyhole,
    title: "Bezbednost podataka",
    text:
      "Podaci se cuvaju uz razumne organizacione i tehnicke mere zastite. Pristup imaju samo osobe kojima su informacije potrebne za prodaju ili zakonske obaveze.",
  },
  {
    icon: Scale,
    title: "Vasa prava",
    text:
      "Mozete zatraziti pristup, ispravku, brisanje ili ogranicenje obrade podataka, kao i povlacenje saglasnosti kada je obrada zasnovana na saglasnosti.",
  },
  {
    icon: RefreshCw,
    title: "Izmene politike",
    text:
      "Politika privatnosti moze biti azurirana kada se promene procesi, pravni zahtevi ili nacin komunikacije sa kupcima.",
  },
];

const processingSteps = [
  {
    title: "Kontakt",
    text:
      "Podatke nam najcesce dostavljate kroz kontakt formu, e-mail, telefonski razgovor ili upit za konkretan stan.",
  },
  {
    title: "Komunikacija",
    text:
      "Koristimo ih da odgovorimo na zahtev, proverimo dostupnost stanova i dogovorimo dalje korake sa prodajnim timom.",
  },
  {
    title: "Zastita",
    text:
      "Podaci ostaju ograniceni na osobe i procese kojima su potrebni za komunikaciju, prodaju ili zakonske obaveze.",
  },
];

const dataExamples = ["Ime i prezime", "Telefon", "E-mail adresa", "Interesovanje za projekat ili stan"];

export const PrivacyPolicyPage = () => {
  return (
    <main>
      <section className="page-section page-section--surface">
        <div className="page-container split-grid split-grid--end">
          <div className="fade-up">
            <p className="section-eyebrow">Politika privatnosti</p>
            <h1 className="section-title">Vasi podaci, jasno i odgovorno.</h1>
            <p className="section-copy section-copy--large">
              Ova stranica objasnjava kako M & M Gradnja prikuplja, koristi i cuva
              podatke koje dostavite prilikom interesovanja za stanove, obilazak
              projekta ili kontakt sa prodajnim timom.
            </p>
            <div className="page-actions">
              <a className="site-button site-button--accent" href={`mailto:${contactEmail}`}>
                <Mail />
                Pisite nam
              </a>
              <a className="site-button site-button--outline" href={`tel:${contactPhone}`}>
                <Phone />
                Pozovite prodaju
              </a>
            </div>
          </div>

          <div className="soft-card privacy-summary">
            <div>
              <ShieldCheck className="icon-inline" />
              <p>Sazetak politike</p>
              <span>
                Podaci se koriste samo za komunikaciju sa kupcima, proveru
                dostupnosti stanova, organizaciju obilazaka i zakonske obaveze.
              </span>
            </div>
            <div className="privacy-summary__stats">
              {heroHighlights.map((item) => (
                <span key={item.value}>
                  <strong>{item.value}</strong>
                  {item.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="page-section page-section--surface">
        <div className="page-container split-grid">
          <div className="sticky-copy">
            <p className="section-eyebrow">Pregled</p>
            <h2 className="section-title section-title--medium">
              Privatnost kao deo korektne komunikacije.
            </h2>
            <p className="section-copy">
              Podatke trazimo samo kada su potrebni da odgovorimo na upit, zakazemo
              obilazak ili posaljemo informacije o stanovima.
            </p>
            <blockquote>
              Ne koristimo podatke za nepotrebnu komunikaciju. Fokus je na jasnom
              odgovoru, prodajnim informacijama i organizaciji obilaska.
            </blockquote>
          </div>

          <div className="info-card-grid">
            {privacySections.map(({ icon: Icon, title, text }) => (
              <article className="info-card" key={title}>
                <span className="icon-bubble">
                  <Icon />
                </span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="page-container split-grid split-grid--center">
          <div className="dark-process-card">
            <div>
              <ShieldCheck className="icon-inline" />
              <p>Tok obrade</p>
            </div>
            {processingSteps.map((step, index) => (
              <div className="process-step" key={step.title}>
                <span>{index + 1}</span>
                <p>
                  <strong>{step.title}</strong>
                  {step.text}
                </p>
              </div>
            ))}
          </div>

          <div>
            <p className="section-eyebrow">Koje podatke mozemo traziti</p>
            <h2 className="section-title section-title--medium">
              Samo ono sto je potrebno za odgovor na vas upit.
            </h2>
            <p className="section-copy">
              Uobicajeno su to osnovni kontakt podaci i informacija o tome koji
              projekat, stan ili termin obilaska vas zanima.
            </p>
            <div className="check-list">
              {dataExamples.map((item) => (
                <p key={item}>
                  <span className="icon-bubble">
                    <LockKeyhole />
                  </span>
                  {item}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="page-section page-section--surface">
        <div className="page-container split-grid split-grid--center">
          <div className="image-card tall-image-card">
            <img
              src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=85"
              alt="Mirna terasa savremenog stana"
            />
          </div>

          <div>
            <p className="section-eyebrow">Pitanja o privatnosti</p>
            <h2 className="section-title section-title--medium">
              Za svaki zahtev mozete nam se obratiti direktno.
            </h2>
            <p className="section-copy">
              Ako zelite pristup podacima, ispravku, brisanje ili dodatno
              objasnjenje obrade, kontaktirajte nas putem zvanicnog e-maila ili
              telefona.
            </p>
            <div className="contact-links">
              <a href={`mailto:${contactEmail}`}>
                <MessageCircle className="icon-inline" />
                {contactEmail}
              </a>
              <a href={`tel:${contactPhone}`}>
                <Phone className="icon-inline" />
                {contactPhone}
              </a>
            </div>
            <a className="site-button site-button--dark" href={`mailto:${contactEmail}`}>
              Posaljite zahtev
              <ArrowUpRight />
            </a>
          </div>
        </div>
      </section>
    </main>
  );
};
