import {
  BadgeCheck,
  Building2,
  CalendarDays,
  FileText,
  Handshake,
  HardHat,
  Home,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";

const aboutHeroImage =
  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=2200&q=85";

const heroHighlights = [
  { value: "Heroja Pinkija 13", label: "prvi projekat kompanije" },
  { value: "15 stanova", label: "jasna i pregledna ponuda" },
  { value: "15.11.2027.", label: "planirani zavrsetak radova" },
];

const values = [
  {
    icon: BadgeCheck,
    title: "Jasne informacije",
    text: "Kupac treba brzo da razume sta se gradi, gde je objekat, koja je faza radova i koje su opcije kupovine.",
  },
  {
    icon: ShieldCheck,
    title: "Odgovoran pristup",
    text: "Projekat predstavljamo realno, bez nepotrebnog ulepsavanja i bez obecanja koja ne mogu da se isprate izvedbom.",
  },
  {
    icon: HardHat,
    title: "Kvalitet izvedbe",
    text: "Fokus je na stvarima koje se svakodnevno osecaju: podno grejanje, lift, garaza, ostave i funkcionalni rasporedi.",
  },
  {
    icon: Handshake,
    title: "Korektna saradnja",
    text: "Komunikacija sa kupcima i partnerima mora da bude direktna, uredna i korisna od prvog poziva do zavrsetka projekta.",
  },
];

const workSteps = [
  {
    title: "Planiranje",
    text: "Projekat se vodi kroz jasne faze, sa paznjom na lokaciju, konstrukciju, organizaciju stanova i realne rokove.",
  },
  {
    title: "Izvedba",
    text: "Radovi se prate fazno, uz fokus na pouzdane izvodjace i resenja koja imaju smisla u svakodnevnom zivotu.",
  },
  {
    title: "Prodaja",
    text: "Ponuda stanova, statusi, kvadrature i kontakt sa prodajom prikazani su tako da kupac moze brzo da donese odluku.",
  },
];

const projectFacts = [
  { label: "Investitor", value: "M & M Gradnja" },
  { label: "Lokacija", value: "Heroja Pinkija 13, Novi Sad" },
  { label: "Struktura", value: "PO + PR + 3" },
  { label: "Trenutna faza", value: "Iskop zavrsen, temelji u toku" },
];

export const AboutPage = () => {
  return (
    <main>
      <section className="page-section page-section--surface">
        <div className="page-container split-grid split-grid--end">
          <div className="fade-up">
            <p className="section-eyebrow">O nama</p>
            <h1 className="section-title">Gradimo stanove sa jasnom idejom i merom.</h1>
            <p className="section-copy section-copy--large">
              M & M Gradnja razvija projekat Heroja Pinkija 13 sa fokusom na
              funkcionalne stanove, korektnu komunikaciju i kontrolisanu realizaciju
              od prve faze radova.
            </p>
            <div className="page-actions">
              <Link className="site-button site-button--accent" to="/projekti/heroja-pinkija-13">
                <Building2 />
                Pogledajte projekat
              </Link>
              <Link className="site-button site-button--outline" to="/kontakt">
                <MessageCircle />
                Kontaktirajte nas
              </Link>
            </div>
          </div>

          <div className="image-card about-hero-card">
            <img src={aboutHeroImage} alt="Moderan stambeni enterijer u toplom neutralnom tonu" />
            <div>
              {heroHighlights.map((item) => (
                <div key={item.value}>
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="page-section page-section--surface">
        <div className="page-container split-grid">
          <div className="sticky-copy">
            <p className="section-eyebrow">Vrednosti</p>
            <h2 className="section-title section-title--medium">
              Jednostavan pristup, bez velikih reci.
            </h2>
            <p className="section-copy">
              Projekat mora da bude razumljiv kupcu: od osnovnih tehnickih podataka
              i statusa stanova, do ocekivanog roka i nacina kupovine.
            </p>
            <blockquote>
              Cilj je dugorocan rad kroz projekte koji imaju urednu organizaciju,
              funkcionalne stanove i odgovoran odnos prema kupcima.
            </blockquote>
          </div>

          <div className="info-card-grid">
            {values.map(({ icon: Icon, title, text }) => (
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
              <FileText className="icon-inline" />
              <p>Kako radimo</p>
            </div>
            {workSteps.map((step, index) => (
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
            <p className="section-eyebrow">Prvi projekat</p>
            <h2 className="section-title section-title--medium">
              Heroja Pinkija 13 je osnova za dugorocan rad.
            </h2>
            <p className="section-copy">
              Mali broj stanova, pregledna ponuda i prakticna resenja cine projekat
              dobrom pocetnom tackom za kompaniju koja zeli da raste kroz pouzdanu
              gradnju.
            </p>
            <dl className="fact-list">
              {projectFacts.map((fact) => (
                <div key={fact.label}>
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="page-section page-section--surface">
        <div className="page-container split-grid split-grid--center">
          <div className="image-card tall-image-card">
            <img
              src="https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1400&q=85"
              alt="Detalj savremenog stambenog objekta"
            />
          </div>

          <div>
            <p className="section-eyebrow">Kupci u fokusu</p>
            <h2 className="section-title section-title--medium">
              Dobar stan pocinje dobrim informacijama.
            </h2>
            <p className="section-copy">
              Zato su ponuda stanova, detalji projekta, lokacija i kontakt
              postavljeni tako da kupac brzo proveri ono sto je vazno: sprat,
              kvadraturu, strukturu, status i nacin da zakaze razgovor.
            </p>
            <div className="page-actions">
              <Link className="site-button site-button--dark" to="/projekti/heroja-pinkija-13/ponuda-stanova">
                <Home />
                Ponuda stanova
              </Link>
              <Link className="site-button site-button--outline" to="/kontakt">
                <CalendarDays />
                Zakazite obilazak
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};
