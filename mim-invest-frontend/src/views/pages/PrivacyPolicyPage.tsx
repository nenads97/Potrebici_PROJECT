import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowDown,
  ArrowUpRight,
  ClipboardList,
  Database,
  FileText,
  LockKeyhole,
  Mail,
  Phone,
  RefreshCw,
  Scale,
  ShieldCheck,
} from "lucide-react";

import { ContactModalButton } from "../../features/inquiries/components/ContactModal";
import {
  contactPhone,
  contactPhoneHref,
} from "../../features/projects/data/herojaPinkija13.data";
import { PageMeta } from "../../shared/components/PageMeta";

const privacyContactModal = {
  eyebrow: "Politika privatnosti",
  title: "Pitanje u vezi sa obradom podataka",
  description:
    "Napišite na koji upit ili komunikaciju se pitanje odnosi. Javićemo vam se sa odgovorom ili narednim koracima.",
  submitLabel: "Pošaljite zahtev",
  successMessage: "Hvala. Zahtev je poslat i kontaktiraćemo vas povodom obrade podataka.",
  inquiryType: "general" as const,
  details: [{ label: "Tema", value: "Politika privatnosti" }],
  messagePlaceholder: "Napišite zahtev za pristup, ispravku, brisanje ili pitanje o obradi podataka.",
};

const heroHighlights = [
  { value: "Transparentno", label: "objasnjena svrha obrade" },
  { value: "Namenski", label: "podaci se koriste za konkretan upit" },
  { value: "Kontrolisano", label: "zahtev možete poslati direktno" },
];

const privacySections = [
  {
    id: "rukovalac",
    icon: FileText,
    title: "Rukovalac podacima",
    text:
      "Rukovalac podacima je M & M Gradnja. Za pitanja u vezi sa obradom podataka možete nas kontaktirati putem prodajnog e-maila ili telefona navedenih na sajtu.",
  },
  {
    id: "podaci",
    icon: Database,
    title: "Podaci koje prikupljamo",
    text:
      "Podatke prikupljamo kada posaljete upit, zakazete obilazak, pozovete prodaju ili zatražite informacije o odredjenom stanu.",
  },
  {
    id: "svrha",
    icon: ClipboardList,
    title: "Svrha obrade",
    text:
      "Podaci se koriste za komunikaciju sa potencijalnim kupcima, slanje informacija o stanovima, organizaciju obilazaka i pripremu ponuda.",
  },
  {
    id: "bezbednost",
    icon: LockKeyhole,
    title: "Bezbednost podataka",
    text:
      "Podaci se cuvaju uz razumne organizacione i tehnicke mere zastite. Pristup imaju samo osobe kojima su informacije potrebne za prodaju ili zakonske obaveze.",
  },
  {
    id: "prava",
    icon: Scale,
    title: "Vasa prava",
    text:
      "Mozete zatražiti pristup, ispravku, brisanje ili ogranicenje obrade podataka, kao i povlacenje saglasnosti kada je obrada zasnovana na saglasnosti.",
  },
  {
    id: "izmene",
    icon: RefreshCw,
    title: "Izmene politike",
    text:
      "Politika privatnosti može biti ažurirana kada se promene procesi, pravni zahtevi ili našin komunikacije sa kupcima.",
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

const dataExamples = [
  "Ime i prezime",
  "Telefon",
  "E-mail adresa",
  "Interesovanje za projekat, stan ili termin obilaska",
];

const reveal = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const revealContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

export const PrivacyPolicyPage = () => {
  const reduceMotion = useReducedMotion();
  const motionState = reduceMotion ? "show" : "hidden";

  return (
    <main className="privacy-page">
      <PageMeta
        title="Politika privatnosti | M & M Gradnja"
        description="Saznajte kako M & M Gradnja obradjuje podatke poslate kroz upite za stanove, obilazak projekta i kontakt sa prodajom."
      />
      <section className="privacy-hero">
        <div className="page-container privacy-hero__grid">
          <motion.div
            className="privacy-hero__copy"
            initial={motionState}
            animate="show"
            variants={revealContainer}
          >
            <motion.p className="section-eyebrow" variants={reveal}>
              Politika privatnosti
            </motion.p>
            <motion.h1 className="section-title" variants={reveal}>
              Vasi podaci, jasno i odgovorno.
            </motion.h1>
            <motion.p className="section-copy section-copy--large" variants={reveal}>
              Ova stranica objasnjava kako M & M Gradnja prikuplja, koristi i
              cuva podatke koje dostavite prilikom interesovanja za stanove,
              obilazak projekta ili kontakt sa prodajnim timom.
            </motion.p>
            <motion.div className="page-actions" variants={reveal}>
              <ContactModalButton
                className="site-button site-button--accent"
                modalOptions={privacyContactModal}
              >
                <Mail />
                Pišite nam
              </ContactModalButton>
              <a className="site-button site-button--outline" href={contactPhoneHref}>
                <Phone />
                Pozovite prodaju
              </a>
            </motion.div>
          </motion.div>

          <motion.aside
            className="privacy-hero__summary"
            initial={motionState}
            animate="show"
            variants={reveal}
            transition={{ duration: 0.62, delay: reduceMotion ? 0 : 0.14 }}
            aria-label="Sazetak politike privatnosti"
          >
            <div className="privacy-hero__summary-head">
              <span className="privacy-hero__summary-icon">
                <ShieldCheck />
              </span>
              <div>
                <p>Sazetak politike</p>
                <h2>Podaci imaju jasno definisanu namenu.</h2>
              </div>
            </div>
            <p className="privacy-hero__summary-copy">
              Koristimo ih za odgovor na upit, proveru dostupnosti stanova,
              organizaciju obilazaka i ispunjavanje zakonskih obaveza.
            </p>
            <dl className="privacy-hero__facts">
              {heroHighlights.map((item) => (
                <div key={item.value}>
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>
          </motion.aside>
        </div>
      </section>

      <section className="privacy-intro">
        <motion.div
          className="page-container privacy-intro__grid"
          initial={motionState}
          whileInView="show"
          viewport={{ once: true, amount: 0.28 }}
          variants={revealContainer}
        >
          <motion.div className="privacy-intro__statement" variants={reveal}>
            <p className="section-eyebrow">Osnovni princip</p>
            <h2>Podatke tražimo samo kada su potrebni za konkretan odgovor.</h2>
            <blockquote>
              Ne koristimo podatke za nepotrebnu komunikaciju. Fokus je na
              prodajnim informacijama, organizaciji obilaska i odgovoru na vas
              zahtev.
            </blockquote>
          </motion.div>

          <motion.nav
            className="privacy-toc"
            aria-label="Sadržaj politike privatnosti"
            variants={reveal}
          >
            <p>Sadržaj stranice</p>
            <ol>
              {privacySections.map((section, index) => (
                <li key={section.id}>
                  <a href={`#${section.id}`}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    {section.title}
                    <ArrowDown />
                  </a>
                </li>
              ))}
            </ol>
          </motion.nav>
        </motion.div>
      </section>

      <section className="privacy-document" aria-labelledby="privacy-document-title">
        <div className="page-container privacy-document__grid">
          <motion.aside
            className="privacy-document__aside"
            initial={motionState}
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={reveal}
          >
            <p className="section-eyebrow">Pregled politike</p>
            <h2 id="privacy-document-title">Kako postupamo sa podacima.</h2>
            <p>
              Svaki odeljak opisuje jednu oblast obrade, od trenutka kada nam se
              obratite do našina na koji možete ostvariti svoja prava.
            </p>
          </motion.aside>

          <motion.div
            className="privacy-document__sections"
            initial={motionState}
            whileInView="show"
            viewport={{ once: true, amount: 0.08 }}
            variants={revealContainer}
          >
            {privacySections.map(({ id, icon: Icon, title, text }, index) => (
              <motion.article id={id} className="privacy-clause" key={id} variants={reveal}>
                <div className="privacy-clause__meta">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <Icon />
                </div>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="privacy-processing">
        <motion.div
          className="page-container privacy-processing__panel"
          initial={motionState}
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          variants={revealContainer}
        >
          <motion.div className="privacy-processing__intro" variants={reveal}>
            <div className="privacy-processing__eyebrow">
              <ShieldCheck />
              <span>Tok obrade</span>
            </div>
            <h2>Od vašeg upita do bezbedne komunikacije.</h2>
            <p>
              Obrada je vezana za razgovor koji ste zapoceli i informacije koje
              su potrebne da taj razgovor bude koristan.
            </p>
          </motion.div>

          <motion.ol className="privacy-processing__steps" variants={revealContainer}>
            {processingSteps.map((step, index) => (
              <motion.li key={step.title} variants={reveal}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              </motion.li>
            ))}
          </motion.ol>
        </motion.div>
      </section>

      <section className="privacy-data">
        <motion.div
          className="page-container privacy-data__grid"
          initial={motionState}
          whileInView="show"
          viewport={{ once: true, amount: 0.24 }}
          variants={revealContainer}
        >
          <motion.div variants={reveal}>
            <p className="section-eyebrow">Podaci u upitu</p>
            <h2 className="section-title section-title--medium">
              Samo ono sto je potrebno za odgovor.
            </h2>
            <p className="section-copy">
              Uobicajeno su to osnovni kontakt podaci i informacija o projektu,
              stanu ili terminu obilaska koji vas zanima.
            </p>
          </motion.div>

          <motion.ul className="privacy-data__list" variants={revealContainer}>
            {dataExamples.map((item, index) => (
              <motion.li key={item} variants={reveal}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <LockKeyhole />
                <strong>{item}</strong>
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>
      </section>

      <section className="privacy-contact">
        <motion.div
          className="page-container privacy-contact__inner"
          initial={motionState}
          whileInView="show"
          viewport={{ once: true, amount: 0.35 }}
          variants={revealContainer}
        >
          <motion.div variants={reveal}>
            <p className="section-eyebrow">Zahtevi i pitanja</p>
            <h2>Za pristup, ispravku ili brisanje podataka obratite nam se direktno.</h2>
            <p>
              Navedite na koji upit ili komunikaciju se zahtev odnosi kako bismo
              mogli precizno da proverimo potrebne informacije.
            </p>
          </motion.div>

          <motion.div className="privacy-contact__actions" variants={reveal}>
            <ContactModalButton
              className="site-button site-button--dark"
              modalOptions={privacyContactModal}
            >
              <Mail />
              Pošaljite zahtev
            </ContactModalButton>
            <a className="privacy-contact__link" href={contactPhoneHref}>
              <Phone />
              {contactPhone}
              <ArrowUpRight />
            </a>
          </motion.div>
        </motion.div>
      </section>
    </main>
  );
};
