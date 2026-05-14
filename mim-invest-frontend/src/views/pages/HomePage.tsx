import { useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight, Building2, MapPin, MessageCircle, Phone, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

import { contactEmail, contactPhone } from "../../features/projects/data/herojaPinkija13.data";

const images = {
  hero: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2200&q=85",
  living:
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=85",
  terrace:
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=85",
};

const heroLines = ["Tvoj prostor.", "Tvoja pravila.", "Tvoj novi pocetak."];

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
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
      "Podno grejanje, ostave, lift iz garaze i optimalno organizovani stanovi za svakodnevni zivot bez kompromisa.",
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

type ProjectTab = "active" | "upcoming" | "completed";

export const HomePage = () => {
  const heroRef = useRef<HTMLElement>(null);
  const [activeTab, setActiveTab] = useState<ProjectTab>("active");
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

  return (
    <main>
      <section className="home-hero" ref={heroRef}>
        <motion.img
          src={images.hero}
          alt="Savremena stambena zgrada sa uredjenom fasadom"
          className="home-hero__image"
          style={{ y: imageY, scale: imageScale }}
        />
        <div className="home-hero__overlay" />
        <div className="home-hero__fade" />

        <motion.div
          className="home-hero__content"
          initial="hidden"
          animate="show"
          variants={heroTextContainer}
          style={{
            opacity: contentOpacity,
            y: contentY,
            scale: contentScale,
            filter: contentBlur,
          }}
        >
          <h1>
            {heroLines.map((line) => (
              <motion.span
                key={line}
                variants={heroTextLine}
                transition={{ duration: 0.82, ease: "easeOut" }}
              >
                {line}
              </motion.span>
            ))}
          </h1>
        </motion.div>
      </section>

      <section className="page-section home-projects">
        <div className="page-container">
          <motion.div
            className="split-grid split-grid--end"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            transition={{ duration: 0.55 }}
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
            {activeTab === "active" ? <ActiveProjectCard key="active" /> : null}
            {activeTab === "upcoming" ? <UpcomingProjectsCard key="upcoming" /> : null}
            {activeTab === "completed" ? <CompletedProjectsCard key="completed" /> : null}
          </AnimatePresence>
        </div>
      </section>

      <section className="home-contact">
        <motion.div
          className="page-container home-contact__grid"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          transition={{ duration: 0.55 }}
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
            <Link className="site-button site-button--dark" to="/kontakt">
              <MessageCircle />
              Kontaktirajte nas
            </Link>
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

const ActiveProjectCard = () => {
  return (
    <motion.article
      className="portfolio-card"
      initial="hidden"
      animate="show"
      exit={{ opacity: 0, y: 14 }}
      variants={fadeUp}
      transition={{ duration: 0.55 }}
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
          <Link className="site-button site-button--dark" to="/projekti/heroja-pinkija-13">
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
          <img src={images.living} alt="Svetao dnevni boravak modernog stana" />
          <div>
            <img src={images.terrace} alt="Terasa stana sa otvorenim pogledom" />
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

const UpcomingProjectsCard = () => {
  return (
    <motion.article
      className="portfolio-card portfolio-card--muted"
      initial="hidden"
      animate="show"
      exit={{ opacity: 0, y: 14 }}
      variants={fadeUp}
      transition={{ duration: 0.55 }}
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

const CompletedProjectsCard = () => {
  return (
    <motion.article
      className="portfolio-card portfolio-card--muted"
      initial="hidden"
      animate="show"
      exit={{ opacity: 0, y: 14 }}
      variants={fadeUp}
      transition={{ duration: 0.55 }}
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
