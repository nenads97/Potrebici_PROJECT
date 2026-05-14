import { useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import {
  ArrowUpRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Home,
  Layers3,
  MapPin,
  Ruler,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";

import { ApartmentAvailability } from "../../../../features/projects/components/ApartmentAvailability";
import {
  apartments,
  projectInfo,
  projectStats,
} from "../../../../features/projects/data/herojaPinkija13.data";

import "./HerojaPinkija13Page.scss";

const projectImages = {
  main: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1800&q=85",
  exteriorOne:
    "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1400&q=85",
  exteriorTwo:
    "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1400&q=85",
  exteriorThree:
    "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1400&q=85",
};

const projectQuickFacts = [
  { icon: Building2, label: "Objekat", value: "Stambena zgrada" },
  { icon: Layers3, label: "Struktura", value: projectInfo.floorStructure },
  { icon: Ruler, label: "Jedinice", value: "15 stanova" },
  { icon: Clock3, label: "Faza", value: "Temelji u toku" },
];

const buyerHighlights = [
  {
    icon: ShieldCheck,
    title: "Jasna ponuda stanova",
    text:
      "Stanovi su organizovani po pet na etazi, pa se lako uporedjuju sprat, kvadratura i struktura.",
  },
  {
    icon: CheckCircle2,
    title: "Prakticna oprema",
    text: "Podno grejanje, lift iz garaze, ostave i garazna mesta dostupni su uz kupovinu.",
  },
  {
    icon: MapPin,
    title: "Pocetak Telepa",
    text: "Lokacija je dobro povezana sa gradom i svakodnevnim sadrzajima u neposrednoj blizini.",
  },
];

const projectActions = [
  {
    icon: Home,
    title: "Ponuda stanova",
    text: "Pogledajte aktuelne stanove, kvadrature, strukture i status dostupnosti.",
    to: "/projekti/heroja-pinkija-13/ponuda-stanova",
  },
  {
    icon: FileText,
    title: "Spisak stanova",
    text: "Brz pregled svih jedinica u objektu za poredjenje po etazi i tipu stana.",
    to: "/projekti/heroja-pinkija-13/spisak-stanova",
  },
  {
    icon: MapPin,
    title: "Lokacija",
    text: "Proverite poziciju objekta Heroja Pinkija 13 i povezanost sa gradom.",
    to: "/lokacija",
  },
];

const projectTimeline = [
  { label: "Pocetak radova", value: "16.03.2026.", state: "Zavrseno" },
  { label: "Iskop", value: "Zavrsena faza", state: "Zavrseno" },
  { label: "Temelji", value: "Radovi u toku", state: "Aktuelno" },
  { label: "Planirani zavrsetak", value: "15.11.2027.", state: "Planirano" },
];

const projectDetails = [
  { label: "Investitor", value: "M & M Gradnja" },
  { label: "Lokacija", value: "Heroja Pinkija 13, Novi Sad" },
  { label: "Struktura objekta", value: projectInfo.floorStructure },
  { label: "Tip objekta", value: "Stambena zgrada" },
  { label: "Stambenih jedinica", value: "15" },
  { label: "Grejanje", value: "Podno grejanje" },
  { label: "Garazna mesta", value: "Dostupna uz kupovinu" },
  { label: "Ostave", value: "Dostupne uz kupovinu" },
  { label: "Pocetak radova", value: "16.03.2026." },
  { label: "Planirani zavrsetak", value: "15.11.2027." },
  { label: "Trenutna faza", value: "Iskop zavrsen, temelji u toku" },
];

const exteriorGallery = [
  {
    src: projectImages.exteriorOne,
    alt: "Eksterijer savremenog stambenog objekta",
    label: "Urbani kontekst",
  },
  {
    src: projectImages.exteriorTwo,
    alt: "Detalj fasade i terasa objekta",
    label: "Fasada i terase",
  },
  {
    src: projectImages.exteriorThree,
    alt: "Urbani stambeni ambijent projekta",
    label: "Stambeni ambijent",
  },
];

export const HerojaPinkija13Page = () => {
  const heroImageRef = useRef<HTMLDivElement>(null);
  const [activeTimelineIndex, setActiveTimelineIndex] = useState(2);
  const activeTimelineStep = projectTimeline[activeTimelineIndex];
  const { scrollYProgress } = useScroll({
    target: heroImageRef,
    offset: ["start end", "end start"],
  });
  const smoothHeroScroll = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 24,
    mass: 0.35,
  });
  const heroImageY = useTransform(smoothHeroScroll, [0, 1], ["-5%", "6%"]);
  const heroImageScale = useTransform(smoothHeroScroll, [0, 1], [1.05, 1.11]);

  return (
    <main className="project-page">
      <section className="page-section page-section--surface project-overview">
        <div className="page-container split-grid project-overview__grid">
          <div className="project-overview__intro fade-up">
            <p className="section-eyebrow">O projektu</p>
            <h1 className="section-title">{projectInfo.name}, Novi Sad.</h1>
            <p className="section-copy section-copy--large">
              Nova stambena zgrada na pocetku Telepa, sa 15 stanova, garazom,
              ostavama i liftom do svih spratova.
            </p>

            <div className="project-overview__actions">
              <Link
                className="site-button site-button--accent"
                to="/projekti/heroja-pinkija-13/ponuda-stanova"
              >
                <Home />
                Ponuda stanova
              </Link>
              <Link className="site-button site-button--outline" to="/kontakt">
                <CalendarDays />
                Zakazite obilazak
              </Link>
            </div>
          </div>

          <div className="project-overview__visual">
            <div className="image-card" ref={heroImageRef}>
              <div className="project-overview__image">
                <motion.img
                  src={projectImages.main}
                  alt="Heroja Pinkija 13 eksterijer projekta"
                  style={{ y: heroImageY, scale: heroImageScale }}
                />
                <span>Prodaja je pocela</span>
              </div>
              <div className="project-overview__quick">
                {projectQuickFacts.map(({ icon: Icon, label, value }) => (
                  <div key={label}>
                    <span className="icon-bubble">
                      <Icon />
                    </span>
                    <div>
                      <p>{label}</p>
                      <strong>{value}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="project-overview__stats">
              {projectStats.slice(0, 3).map((stat) => (
                <div key={stat.label}>
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>

            <section className="project-buyer">
              <div className="split-grid split-grid--end">
                <div>
                  <p className="section-eyebrow">Za kupce</p>
                  <h2 className="section-title section-title--medium">
                    Sve sto je potrebno za brzu odluku.
                  </h2>
                </div>
                <p className="section-copy">
                  Dostupni stanovi, faza radova, lokacija, tehnicki detalji i
                  kontakt za obilazak objedinjeni su na jednom mestu.
                </p>
              </div>

              <div className="project-actions-grid">
                {projectActions.map(({ icon: Icon, title, text, to }) => (
                  <Link className="project-action-card" key={title} to={to}>
                    <span className="icon-bubble">
                      <Icon />
                    </span>
                    <h3>{title}</h3>
                    <p>{text}</p>
                    <strong>
                      Otvori
                      <ArrowUpRight className="icon-inline" />
                    </strong>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </div>
      </section>

      <section className="page-section page-section--surface">
        <div className="page-container split-grid project-status">
          <div className="project-timeline-panel">
            <div className="project-timeline-panel__heading">
              <Clock3 className="icon-inline" />
              <p>Status radova</p>
            </div>

            <div className="project-timeline-list">
              {projectTimeline.map((step, index) => (
                <button
                  className={activeTimelineIndex === index ? "is-active" : ""}
                  key={step.label}
                  onClick={() => setActiveTimelineIndex(index)}
                  type="button"
                >
                  <span>{index + 1}</span>
                  <div>
                    <strong>{step.label}</strong>
                    <small>{step.state}</small>
                    <p>{step.value}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="project-active-step">
              <p>Aktivna faza</p>
              <h3>{activeTimelineStep.label}</h3>
              <span>
                {activeTimelineStep.value} - {activeTimelineStep.state}
              </span>
            </div>
          </div>

          <div className="project-status__copy">
            <p className="section-eyebrow">Prednosti projekta</p>
            <h2 className="section-title section-title--medium">
              Praktican objekat na dobro povezanoj lokaciji.
            </h2>
            <p className="section-copy">
              Heroja Pinkija 13 je projektovan za kupce kojima su vazni
              funkcionalan raspored, svakodnevna logistika i jasni uslovi kupovine.
            </p>

            <div className="project-highlight-list">
              {buyerHighlights.map(({ icon: Icon, title, text }) => (
                <div key={title}>
                  <span className="icon-bubble">
                    <Icon />
                  </span>
                  <div>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="page-section project-gallery-section">
        <div className="page-container">
          <div className="split-grid split-grid--end">
            <div>
              <p className="section-eyebrow">Eksterijer</p>
              <h2 className="section-title section-title--medium">
                Vizuelni pregled objekta i urbanog ambijenta.
              </h2>
            </div>
            <p className="section-copy">
              Galerija prikazuje karakter projekta, fasadu i stambeni ambijent. Za
              tlocrt i precizne informacije o stanu kontaktirajte prodaju.
            </p>
          </div>

          <div className="exterior-gallery">
            {exteriorGallery.map((image) => (
              <figure key={image.src}>
                <img src={image.src} alt={image.alt} />
                <figcaption>{image.label}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="page-section page-section--surface project-details-section">
        <div className="page-container split-grid">
          <div>
            <p className="section-eyebrow">Detalji projekta</p>
            <h2 className="section-title section-title--medium">
              Tehnicke i prodajne informacije.
            </h2>
            <p className="section-copy">
              Pregled kljucnih podataka za kupce koji zele da brzo provere osnovne
              cinjenice o objektu i trenutnoj fazi izgradnje.
            </p>
          </div>

          <dl className="project-details-list">
            {projectDetails.map((detail) => (
              <div key={detail.label}>
                <dt>{detail.label}</dt>
                <dd>{detail.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <ApartmentAvailability apartments={apartments} compactHeading />

      <section className="project-cta">
        <div className="page-container project-cta__inner">
          <div>
            <p className="section-eyebrow">Prodaja</p>
            <h2>Izaberite stan ili zakazite razgovor sa prodajom.</h2>
          </div>
          <div>
            <Link
              className="site-button site-button--dark"
              to="/projekti/heroja-pinkija-13/ponuda-stanova"
            >
              <Home />
              Ponuda stanova
            </Link>
            <Link className="site-button site-button--outline" to="/kontakt">
              <CalendarDays />
              Kontaktirajte nas
              <ArrowUpRight />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};
