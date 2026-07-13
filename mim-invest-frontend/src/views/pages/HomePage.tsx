import { useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import {
  ArrowUpRight,
  Building2,
  CalendarDays,
  ClipboardCheck,
  Home,
  MapPin,
  MessageCircle,
  Phone,
  Ruler,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

import { ContactModalButton } from "../../features/inquiries/components/ContactModal";
import { contactEmail, contactPhone } from "../../features/projects/data/herojaPinkija13.data";
import { PageMeta } from "../../shared/components/PageMeta";

const images = {
  hero: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2200&q=85",
  living: "/images/heroja-pinkija-13/gradilisna-tabla-slika.jpg",
  terrace: "/images/heroja-pinkija-13/radovi-u-toku.jpg",
};

const heroLines = ["Tvoj prostor.", "Tvoja pravila.", "Tvoj novi pocetak."];

const heroLeadItems = ["Heroja Pinkija 13, Novi Sad", "15 stanova", "prodaja u toku"];

const availabilityItems = [
  { icon: Home, label: "Stanovi", value: "15 stanova" },
  { icon: Building2, label: "Objekat", value: "PO + PR + 3" },
  { icon: Ruler, label: "Garaza", value: "13 mesta" },
  { icon: ClipboardCheck, label: "Ostave", value: "15 ostava" },
  { icon: Sparkles, label: "Grejanje", value: "Podno grejanje" },
  { icon: CalendarDays, label: "Rok", value: "15.11.2027." },
];

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
};

const staticFadeUp = {
  hidden: { opacity: 1, y: 0 },
  show: { opacity: 1, y: 0 },
};

const heroTextContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.18,
      delayChildren: 0.18,
    },
  },
};

const heroTextLine = {
  hidden: { opacity: 0, y: 28, filter: "blur(8px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)" },
};

const staticHeroTextLine = {
  hidden: { opacity: 1, y: 0, filter: "blur(0px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)" },
};

const instantTransition = { duration: 0 };

const lifestyleItems = [
  {
    icon: MapPin,
    title: "Pocetak Telepa / Liman 5",
    text:
      "Dinamicna gradska lokacija sa odlicnom povezanoscu i kompletnim sadrzajem u neposrednoj blizini.",
  },
  {
    icon: Building2,
    title: "Kvalitetna i moderna gradnja",
    text:
      "Gradnja po savremenim standardima, uz materijale i sisteme koji podrzavaju dugotrajnost i udobnost.",
  },
  {
    icon: Sparkles,
    title: "Komfor koji se vidi u svakom detalju",
    text:
      "Podno grejanje, lift iz garaze i optimalno organizovani stanovi, uz mogucnost odvojene kupovine garaznog mesta i ostave.",
  },
];

const projectFacts = [
  { label: "Aktuelno", value: "Heroja Pinkija 13" },
  { label: "Stambenih jedinica", value: "15 stanova" },
  { label: "Struktura", value: "PO + PR + 3" },
];

const futureProjectSlots = [
  {
    icon: Building2,
    title: "Novi projekat",
    text: "Mesto za sledecu stambenu lokaciju kada udje u aktivnu pripremu.",
  },
  {
    icon: MapPin,
    title: "Nova lokacija",
    text: "Buduci projekti bice dodati ovde, u istom preglednom formatu.",
  },
];

const landAcquisitionHighlights = [
  {
    icon: MapPin,
    title: "Novi Sad i bliza okolina",
    text: "Razmatramo lokacije sa dobrim pristupom, infrastrukturom i potencijalom za stambenu gradnju.",
  },
  {
    icon: Home,
    title: "Plac ili kuca za rusenje",
    text: "Interesuju nas parcele i postojeci objekti pogodni za razvoj novih stambenih projekata.",
  },
  {
    icon: ShieldCheck,
    title: "Jasna dokumentacija",
    text: "Najbrze reagujemo kada su vlasnistvo, osnovni podaci i uslovi prodaje spremni za proveru.",
  },
];

const landAcquisitionFacts = [
  { icon: Ruler, label: "Namena", value: "Stambena gradnja" },
  { icon: ClipboardCheck, label: "Prvi korak", value: "Kratka procena" },
  { icon: MessageCircle, label: "Kontakt", value: "Direktan razgovor" },
];

type ProjectTab = "active" | "upcoming" | "completed";

export const HomePage = () => {
  const heroRef = useRef<HTMLElement>(null);
  const [activeTab, setActiveTab] = useState<ProjectTab>("active");
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const smoothScroll = useSpring(scrollYProgress, {
    stiffness: 85,
    damping: 28,
    mass: 0.35,
  });
  const imageY = useTransform(smoothScroll, [0, 1], ["-7%", "22%"]);
  const imageScale = useTransform(smoothScroll, [0, 1], [1.12, 1.18]);
  const contentOpacity = useTransform(smoothScroll, [0, 0.28, 0.62], [1, 0.78, 0]);
  const contentY = useTransform(smoothScroll, [0, 0.68], ["0px", "-58px"]);
  const contentScale = useTransform(smoothScroll, [0, 0.68], [1, 0.96]);
  const contentBlur = useTransform(smoothScroll, [0, 0.62], ["blur(0px)", "blur(10px)"]);
  const reveal = reduceMotion ? staticFadeUp : fadeUp;
  const heroText = reduceMotion ? staticHeroTextLine : heroTextLine;
  const revealTransition = reduceMotion ? instantTransition : { duration: 0.55 };

  return (
    <main>
      <PageMeta
        title="M & M Gradnja | Stanovi Heroja Pinkija 13 Novi Sad"
        description="Premium prezentacija projekta Heroja Pinkija 13 u Novom Sadu, sa ponudom stanova, tlocrtima, lokacijom i direktnim upitom prodaji."
        structuredData={({ canonicalUrl, origin }) => ({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "M & M Gradnja",
          url: canonicalUrl,
          logo: `${origin}/images/TRADE.png`,
          email: contactEmail,
          telephone: contactPhone,
          address: {
            "@type": "PostalAddress",
            streetAddress: "Heroja Pinkija 13",
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
        })}
      />
      <section className="home-hero" ref={heroRef}>
        <motion.img
          src={images.hero}
          alt="Savremena stambena zgrada sa uredjenom fasadom"
          className="home-hero__image"
          fetchPriority="high"
          decoding="async"
          style={reduceMotion ? undefined : { y: imageY, scale: imageScale }}
        />
        <div className="home-hero__overlay" />
        <div className="home-hero__fade" />

        <motion.div
          className="home-hero__content"
          initial="hidden"
          animate="show"
          variants={heroTextContainer}
          style={
            reduceMotion
              ? undefined
              : {
                  opacity: contentOpacity,
                  y: contentY,
                  scale: contentScale,
                  filter: contentBlur,
                }
          }
        >
          <h1>
            {heroLines.map((line) => (
              <motion.span
                key={line}
                variants={heroText}
                transition={reduceMotion ? instantTransition : { duration: 0.82, ease: "easeOut" }}
              >
                {line}
              </motion.span>
            ))}
          </h1>
          <p className="home-hero__lead" aria-label={heroLeadItems.join(" / ")}>
            {heroLeadItems.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </p>
          <div className="home-hero__actions" aria-label="Glavne akcije">
            <Link className="site-button site-button--accent" to="/projekti/heroja-pinkija-13/ponuda-stanova">
              <Home />
              Pogledaj stanove
            </Link>
            <ContactModalButton className="site-button site-button--light">
              <MessageCircle />
              Pisite nam
            </ContactModalButton>
          </div>
        </motion.div>
      </section>

      <section className="home-availability" aria-label="Kljucne informacije o projektu">
        <div className="page-container">
          <div className="home-availability__grid">
            {availabilityItems.map(({ icon: Icon, label, value }) => (
              <div className="home-availability__item" key={label}>
                <span className="icon-bubble">
                  <Icon />
                </span>
                <div>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              </div>
            ))}
          </div>
          <p className="home-availability__note">
            Garazna mesta i ostave kupuju se odvojeno od stana.
          </p>
        </div>
      </section>

      <section className="page-section home-projects">
        <div className="page-container">
          <motion.div
            className="split-grid split-grid--end"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={reveal}
            transition={revealTransition}
          >
            <div>
              <p className="section-eyebrow">Projekti</p>
              <h2 className="section-title section-title--medium">
                Prostori za mirniji, udobniji ritam zivota.
              </h2>
            </div>
            <div className="home-projects__intro">
              <p>
                Svaka lokacija se bira pazljivo, sa idejom da stan bude vise od
                kvadrature: dobro povezan, funkcionalan i prijatan za svakodnevni
                zivot.
              </p>
              <p>
                Pregledajte aktuelne projekte, lokacije u pripremi i realizovane
                objekte kroz jedan jasan portfolio.
              </p>
            </div>
          </motion.div>

          <div className="portfolio-tabs" role="tablist" aria-label="Filtriranje projekata">
            <button
              className={activeTab === "active" ? "is-active" : ""}
              type="button"
              role="tab"
              aria-selected={activeTab === "active"}
              onClick={() => setActiveTab("active")}
            >
              Aktuelni
            </button>
            <button
              className={activeTab === "upcoming" ? "is-active" : ""}
              type="button"
              role="tab"
              aria-selected={activeTab === "upcoming"}
              onClick={() => setActiveTab("upcoming")}
            >
              U pripremi
            </button>
            <button
              className={activeTab === "completed" ? "is-active" : ""}
              type="button"
              role="tab"
              aria-selected={activeTab === "completed"}
              onClick={() => setActiveTab("completed")}
            >
              Realizovani
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "active" ? <ActiveProjectCard key="active" reduceMotion={Boolean(reduceMotion)} /> : null}
            {activeTab === "upcoming" ? <UpcomingProjectsCard key="upcoming" reduceMotion={Boolean(reduceMotion)} /> : null}
            {activeTab === "completed" ? (
              <CompletedProjectsCard key="completed" reduceMotion={Boolean(reduceMotion)} />
            ) : null}
          </AnimatePresence>
        </div>
      </section>

      <section className="page-section home-land-acquisition">
        <div className="page-container">
          <motion.div
            className="split-grid split-grid--end"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={reveal}
            transition={revealTransition}
          >
            <div>
              <p className="section-eyebrow">Kupujemo placeve</p>
              <h2 className="section-title section-title--medium">
                Imate lokaciju za buduci stambeni projekat?
              </h2>
            </div>
            <p className="section-copy">
              Pored aktuelne novogradnje, M & M Gradnja razmatra nove parcele i
              kuce za rusenje na kvalitetnim lokacijama. Posaljite osnovne podatke
              i dobicete jasan prvi odgovor o potencijalu saradnje.
            </p>
          </motion.div>

          <motion.article
            className="land-preview-card"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
            variants={reveal}
            transition={reduceMotion ? instantTransition : { duration: 0.55, delay: 0.08 }}
          >
            <div className="land-preview-card__copy">
              <span className="icon-bubble">
                <Building2 />
              </span>
              <h3>Trazimo parcele za plansku, kvalitetnu stambenu izgradnju.</h3>
              <p>
                Ako imate plac, stariji objekat ili lokaciju sa potencijalom,
                mozemo brzo da proverimo osnovne uslove i predlozimo sledeci
                korak bez komplikovane procedure.
              </p>

              <div className="land-preview-card__actions">
                <Link className="site-button site-button--dark" to="/kupujemo-placeve">
                  Detalji za vlasnike
                  <ArrowUpRight />
                </Link>
                <Link className="site-button site-button--outline" to="/kupujemo-placeve">
                  Posaljite ponudu
                </Link>
              </div>
            </div>

            <div className="land-preview-card__details">
              <div className="land-preview-card__facts">
                {landAcquisitionFacts.map(({ icon: Icon, label, value }) => (
                  <div key={label}>
                    <Icon className="icon-inline" />
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>

              <div className="land-preview-card__highlights">
                {landAcquisitionHighlights.map(({ icon: Icon, title, text }) => (
                  <div key={title} className="portfolio-feature">
                    <span className="icon-bubble">
                      <Icon />
                    </span>
                    <div>
                      <h4>{title}</h4>
                      <p>{text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.article>
        </div>
      </section>

      <section className="home-contact">
        <motion.div
          className="page-container home-contact__grid"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={reveal}
          transition={revealTransition}
        >
          <div>
            <p className="section-eyebrow">Prodaja i obilazak</p>
            <h2 className="section-title section-title--medium">
              Proverite dostupne stanove i uslove kupovine.
            </h2>
            <p className="section-copy">
              Pozovite prodaju za kvadrature, cenu, tlocrt i trenutni status
              izabranog stana.
            </p>
          </div>

          <div className="home-contact__actions">
            <ContactModalButton className="site-button site-button--dark">
              <MessageCircle />
              Pisite nam
            </ContactModalButton>
            <a className="site-button site-button--outline" href={`tel:${contactPhone}`}>
              <Phone />
              Pozovite {contactPhone}
            </a>
            <div className="home-contact__meta">
              <span>
                <MapPin className="icon-inline" />
                Heroja Pinkija 13
              </span>
              <span>
                <MessageCircle className="icon-inline" />
                {contactEmail}
              </span>
            </div>
          </div>
        </motion.div>
      </section>

    </main>
  );
};

type PortfolioCardProps = {
  reduceMotion: boolean;
};

const ActiveProjectCard = ({ reduceMotion }: PortfolioCardProps) => {
  return (
    <motion.article
      className="portfolio-card"
      initial="hidden"
      animate="show"
      exit={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
      variants={reduceMotion ? staticFadeUp : fadeUp}
      transition={reduceMotion ? instantTransition : { duration: 0.55 }}
    >
      <div className="portfolio-card__copy">
        <p className="section-eyebrow">U prodaji</p>
        <h3>Heroja Pinkija 13</h3>
        <p>
          Jedna od trazenijih lokacija u razvoju, povezana sa svim delovima grada
          i prilagodjena svakodnevnom zivotu.
        </p>

        <div className="portfolio-card__features">
          {lifestyleItems.map(({ icon: Icon, title, text }) => (
            <div key={title} className="portfolio-feature">
              <span className="icon-bubble">
                <Icon />
              </span>
              <div>
                <h4>{title}</h4>
                <p>{text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="portfolio-card__actions">
          <Link className="site-button site-button--dark" to="/projekti/heroja-pinkija-13/o-projektu">
            Detalji projekta
            <ArrowUpRight />
          </Link>
          <Link
            className="site-button site-button--outline"
            to="/projekti/heroja-pinkija-13/ponuda-stanova"
          >
            Ponuda stanova
          </Link>
        </div>
      </div>

      <div className="portfolio-card__media">
        <div className="portfolio-card__images">
          <img
            className="portfolio-card__image portfolio-card__image--facade"
            src={images.living}
            alt="Render fasade projekta Heroja Pinkija 13"
            width="560"
            height="676"
            loading="lazy"
            decoding="async"
          />
          <div>
            <img
              className="portfolio-card__image portfolio-card__image--works"
              src={images.terrace}
              alt="Radovi u toku na projektu Heroja Pinkija 13"
              width="1663"
              height="1247"
              loading="lazy"
              decoding="async"
            />
            <div className="portfolio-note">
              <div>
                <Sparkles className="icon-inline" />
                Realna prednost lokacije
              </div>
              <p>
                Planirani novi most dodatno ce poboljsati vezu ovog dela grada sa
                Fruskom Gorom.
              </p>
            </div>
          </div>
        </div>

        <div className="portfolio-card__facts">
          {projectFacts.map((fact) => (
            <div key={fact.label}>
              <span>{fact.label}</span>
              <strong>{fact.value}</strong>
            </div>
          ))}
        </div>
      </div>
    </motion.article>
  );
};

const UpcomingProjectsCard = ({ reduceMotion }: PortfolioCardProps) => {
  return (
    <motion.article
      className="portfolio-card portfolio-card--muted"
      initial="hidden"
      animate="show"
      exit={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
      variants={reduceMotion ? staticFadeUp : fadeUp}
      transition={reduceMotion ? instantTransition : { duration: 0.55 }}
    >
      <div className="portfolio-card__copy portfolio-card__copy--surface">
        <p className="section-eyebrow">U pripremi</p>
        <h3>Sledeci projekti ce biti prikazani ovde.</h3>
        <p>
          Kada portfolio bude prosiren, svaki projekat ce dobiti svoje mesto sa
          lokacijom, statusom, ponudom stanova i kontaktom.
        </p>
      </div>

      <div className="portfolio-card__slots">
        {futureProjectSlots.map(({ icon: Icon, title, text }) => (
          <div key={title} className="portfolio-slot">
            <div>
              <span className="icon-bubble">
                <Icon />
              </span>
              <small>U pripremi</small>
            </div>
            <h4>{title}</h4>
            <p>{text}</p>
          </div>
        ))}
      </div>
    </motion.article>
  );
};

const CompletedProjectsCard = ({ reduceMotion }: PortfolioCardProps) => {
  return (
    <motion.article
      className="portfolio-card portfolio-card--muted"
      initial="hidden"
      animate="show"
      exit={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
      variants={reduceMotion ? staticFadeUp : fadeUp}
      transition={reduceMotion ? instantTransition : { duration: 0.55 }}
    >
      <div className="portfolio-card__copy portfolio-card__copy--dark">
        <p className="section-eyebrow">Realizovani projekti</p>
        <h3>Zavrseni objekti ce biti prikazani ovde.</h3>
        <p>
          Kada projekti budu zavrseni i useljeni, ovaj tab ce sluziti kao arhiva
          realizovanih lokacija i referenci kompanije.
        </p>
      </div>

      <div className="portfolio-card__slots">
        {[
          { icon: Building2, title: "Realizovani objekat", text: "Mesto za zavrsene projekte i osnovne podatke o lokaciji." },
          { icon: MapPin, title: "Zavrsena lokacija", text: "Arhiva ce biti odvojena od aktuelne ponude." },
        ].map(({ icon: Icon, title, text }) => (
          <div key={title} className="portfolio-slot">
            <div>
              <span className="icon-bubble">
                <Icon />
              </span>
              <small>Arhiva</small>
            </div>
            <h4>{title}</h4>
            <p>{text}</p>
          </div>
        ))}
      </div>
    </motion.article>
  );
};
