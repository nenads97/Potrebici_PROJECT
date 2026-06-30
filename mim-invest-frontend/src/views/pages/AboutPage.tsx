import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
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

const aboutHeroImage = "/images/heroja-pinkija-13/gradilisna-tabla.jpg";
const projectImage = "/images/heroja-pinkija-13/radovi-u-toku.jpg";

const heroHighlights = [
  { value: "Heroja Pinkija 13", label: "prvi projekat kompanije" },
  { value: "15 stanova", label: "pregledna ponuda" },
  { value: "15.11.2027.", label: "planirani zavrsetak" },
];

const values = [
  {
    icon: BadgeCheck,
    title: "Jasne informacije",
    text: "Kupac brzo dolazi do podataka o projektu, fazi radova, stanovima i nacinu kupovine.",
  },
  {
    icon: ShieldCheck,
    title: "Odgovoran pristup",
    text: "Projekat predstavljamo realno, sa rokovima i informacijama koje mogu da se isprate izvedbom.",
  },
  {
    icon: HardHat,
    title: "Kvalitet izvedbe",
    text: "Paznju usmeravamo na funkcionalne rasporede, pouzdana resenja i svakodnevni komfor.",
  },
  {
    icon: Handshake,
    title: "Korektna saradnja",
    text: "Komunikacija sa kupcima i partnerima ostaje direktna, uredna i korisna kroz svaku fazu.",
  },
];

const workSteps = [
  {
    title: "Planiranje",
    text: "Lokacija, konstrukcija, organizacija stanova i rokovi sagledavaju se kao jedna celina.",
  },
  {
    title: "Izvedba",
    text: "Radovi se prate fazno, uz pouzdane izvodjace i resenja koja imaju prakticnu vrednost.",
  },
  {
    title: "Prodaja",
    text: "Kvadrature, strukture i statusi prikazani su jasno, uz direktan kontakt sa prodajom.",
  },
];

const projectProof = [
  "Funkcionalni rasporedi sa pet stanova po etazi.",
  "Javno prikazane kvadrature, strukture i statusi jedinica.",
  "Definisan tok radova i planirani rok zavrsetka.",
];

const projectFacts = [
  { label: "Investitor", value: "M & M Gradnja" },
  { label: "Lokacija", value: "Heroja Pinkija 13, Novi Sad" },
  { label: "Struktura", value: "PO + PR + 3" },
  { label: "Trenutna faza", value: "Iskop zavrsen, temelji u toku" },
];

const reveal = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0 },
};

const revealContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.06,
    },
  },
};

export const AboutPage = () => {
  const reduceMotion = useReducedMotion();
  const motionState = reduceMotion ? "show" : "hidden";

  return (
    <main className="about-page">
      <section className="about-hero">
        <div className="page-container about-hero__grid">
          <motion.div
            className="about-hero__copy"
            initial={motionState}
            animate="show"
            variants={revealContainer}
          >
            <motion.p className="section-eyebrow" variants={reveal}>
              O nama
            </motion.p>
            <motion.h1 className="section-title" variants={reveal}>
              Gradimo stanove sa jasnom idejom i merom.
            </motion.h1>
            <motion.p className="section-copy section-copy--large" variants={reveal}>
              M & M Gradnja razvija stambene projekte u kojima su funkcionalnost,
              kontrolisana realizacija i korektan odnos prema kupcu deo istog
              procesa.
            </motion.p>
            <motion.div className="page-actions" variants={reveal}>
              <Link
                className="site-button site-button--accent"
                to="/projekti/heroja-pinkija-13/o-projektu"
              >
                <Building2 />
                Pogledajte projekat
              </Link>
              <Link className="site-button site-button--outline" to="/kontakt">
                <MessageCircle />
                Kontaktirajte nas
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            className="about-hero__visual"
            initial={motionState}
            animate="show"
            variants={reveal}
            transition={{ duration: 0.65, delay: reduceMotion ? 0 : 0.16 }}
          >
            <div className="about-hero__frame">
              <img
                src={aboutHeroImage}
                alt="Projekat Heroja Pinkija 13 sa gradilisnom tablom"
                width="818"
                height="783"
              />
              <span className="about-hero__caption">Aktuelna realizacija</span>
            </div>

            <dl className="about-hero__stats">
              {heroHighlights.map((item) => (
                <div key={item.value}>
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>
          </motion.div>
        </div>
      </section>

      <section className="about-philosophy">
        <motion.div
          className="page-container about-philosophy__grid"
          initial={motionState}
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={revealContainer}
        >
          <motion.div variants={reveal}>
            <p className="section-eyebrow">Nacin razmisljanja</p>
            <p className="about-philosophy__statement">
              Dobar stan ne pocinje kvadraturom, vec odlukama koje svakodnevni
              zivot cine jednostavnijim.
            </p>
          </motion.div>

          <motion.div className="about-philosophy__copy" variants={reveal}>
            <p>
              Zato projekte posmatramo kroz celinu: od izbora lokacije i
              organizacije prostora do nacina na koji kupac dolazi do informacija.
            </p>
            <blockquote>
              Gradnja treba da bude razumljiva i pre useljenja — kroz uredne
              podatke, realne rokove i komunikaciju bez nepotrebne komplikacije.
            </blockquote>
          </motion.div>
        </motion.div>
      </section>

      <section className="about-values">
        <div className="page-container">
          <motion.div
            className="about-section-heading"
            initial={motionState}
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
            variants={reveal}
          >
            <div>
              <p className="section-eyebrow">Vrednosti</p>
              <h2 className="section-title section-title--medium">
                Jednostavan pristup, bez velikih reci.
              </h2>
            </div>
            <p className="section-copy">
              Principi rada treba da budu vidljivi u projektu, dokumentaciji i
              svakom razgovoru sa kupcem.
            </p>
          </motion.div>

          <motion.div
            className="about-values__grid"
            initial={motionState}
            whileInView="show"
            viewport={{ once: true, amount: 0.18 }}
            variants={revealContainer}
          >
            {values.map(({ icon: Icon, title, text }, index) => (
              <motion.article className="about-value-card" key={title} variants={reveal}>
                <div className="about-value-card__top">
                  <span className="about-value-card__icon">
                    <Icon />
                  </span>
                  <span className="about-value-card__number">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="about-process">
        <motion.div
          className="page-container about-process__panel"
          initial={motionState}
          whileInView="show"
          viewport={{ once: true, amount: 0.18 }}
          variants={revealContainer}
        >
          <motion.div className="about-process__intro" variants={reveal}>
            <div className="about-process__eyebrow">
              <FileText />
              <span>Kako radimo</span>
            </div>
            <h2>Od prve odluke do jasne ponude.</h2>
            <p>
              Svaka faza ima svoju svrhu, odgovornost i informacije koje moraju
              biti dostupne u pravom trenutku.
            </p>
          </motion.div>

          <motion.ol className="about-process__steps" variants={revealContainer}>
            {workSteps.map((step, index) => (
              <motion.li key={step.title} variants={reveal}>
                <span className="about-process__number">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              </motion.li>
            ))}
          </motion.ol>
        </motion.div>
      </section>

      <section className="about-project">
        <div className="page-container about-project__grid">
          <motion.div
            className="about-project__media"
            initial={motionState}
            whileInView="show"
            viewport={{ once: true, amount: 0.24 }}
            variants={reveal}
          >
            <img
              src={projectImage}
              alt="Radovi u toku na projektu Heroja Pinkija 13"
              width="1663"
              height="1247"
              loading="lazy"
            />
            <div className="about-project__media-label">
              <HardHat />
              <span>Temelji u toku</span>
            </div>
          </motion.div>

          <motion.div
            className="about-project__content"
            initial={motionState}
            whileInView="show"
            viewport={{ once: true, amount: 0.22 }}
            variants={revealContainer}
          >
            <motion.div variants={reveal}>
              <p className="section-eyebrow">Prvi projekat</p>
              <h2 className="section-title section-title--medium">
                Pristup koji se vidi u konkretnim odlukama.
              </h2>
              <p className="section-copy">
                Heroja Pinkija 13 je prvi projekat kroz koji M & M Gradnja
                primenjuje principe pregledne ponude, funkcionalnog stanovanja i
                kontrolisane realizacije.
              </p>
            </motion.div>

            <motion.ul className="about-project__proof" variants={reveal}>
              {projectProof.map((item) => (
                <li key={item}>
                  <BadgeCheck />
                  <span>{item}</span>
                </li>
              ))}
            </motion.ul>

            <motion.dl className="about-project__facts" variants={reveal}>
              {projectFacts.map((fact) => (
                <div key={fact.label}>
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </motion.dl>

            <motion.div className="about-project__link" variants={reveal}>
              <Link to="/projekti/heroja-pinkija-13/o-projektu">
                Detalji projekta
                <ArrowUpRight />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="about-trust">
        <motion.div
          className="page-container about-trust__inner"
          initial={motionState}
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          variants={revealContainer}
        >
          <motion.div variants={reveal}>
            <p className="section-eyebrow">Kupci u fokusu</p>
            <h2>Dobre odluke pocinju potpunim informacijama.</h2>
            <p>
              Proverite ponudu stanova ili razgovarajte direktno sa prodajom o
              dostupnosti, uslovima kupovine i obilasku projekta.
            </p>
          </motion.div>

          <motion.div className="about-trust__actions" variants={reveal}>
            <Link
              className="site-button site-button--dark"
              to="/projekti/heroja-pinkija-13/ponuda-stanova"
            >
              <Home />
              Ponuda stanova
            </Link>
            <Link className="about-trust__text-link" to="/kontakt">
              <CalendarDays />
              Zakazite razgovor
              <ArrowUpRight />
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </main>
  );
};
