import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
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
import {
  contactEmail,
  contactPhone,
  contactPhoneHref,
} from "../../features/projects/data/herojaPinkija13.data";
import { fetchProjectMedia } from "../../features/projects/data/projectSupabase.api";
import type { ProjectMediaItem } from "../../features/projects/types/project.types";
import { PageMeta } from "../../shared/components/PageMeta";

const images = {
  hero: "/images/heroja-pinkija-13/hero-generated.jpg",
  living: "/images/heroja-pinkija-13/hero-generated.jpg",
  terrace: "/images/heroja-pinkija-13/radovi-u-toku.jpg",
};

const heroLines = ["Tvoj prostor.", "Tvoja pravila.", "Tvoj novi početak."];

const heroLeadItems = [
  "Heroja Pinkija 13, Novi Sad",
  "15 stanova",
  "prodaja u toku",
];

const availabilityItems = [
  { icon: Home, label: "stanovi", value: "15 stanova" },
  { icon: Building2, label: "Objekat", value: "PO + PR + 3" },
  { icon: Ruler, label: "Garaža", value: "13 mesta" },
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

const revealContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.06,
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
    title: "Početak Telepa / Liman 5",
    text: "Dinamična gradska lokacija sa odličnom povezanošću i kompletnim sadržajem u neposrednoj blizini.",
  },
  {
    icon: Building2,
    title: "Kvalitetna i moderna gradnja",
    text: "Gradnja po savremenim standardima, uz materijale i sisteme koji podržavaju dugotrajnost i udobnost.",
  },
  {
    icon: Sparkles,
    title: "Komfor koji se vidi u svakom detalju",
    text: "Podno grejanje, lift iz garaže i optimalno organizovani stanovi, uz mogućnost odvojene kupovine garažnog mesta i ostave.",
  },
];

const projectFacts = [
  { label: "Aktuelno", value: "Heroja Pinkija 13" },
  { label: "stambenih jedinica", value: "15 stanova" },
  { label: "Struktura", value: "PO + PR + 3" },
];

const futureProjectSlots = [
  {
    icon: Building2,
    title: "Novi projekat",
    text: "Mesto za sledeću stambenu lokaciju kada uđe u aktivnu pripremu.",
  },
  {
    icon: MapPin,
    title: "Nova lokacija",
    text: "Budući projekti biće dodati ovde, u istom preglednom formatu.",
  },
];

const landAcquisitionHighlights = [
  {
    icon: MapPin,
    title: "Novi Sad i bliža okolina",
    text: "Razmatramo lokacije sa dobrim pristupom, infrastrukturom i potencijalom za stambenu gradnju.",
  },
  {
    icon: Home,
    title: "Plac ili kuća za rušenje",
    text: "Interesuju nas parcele i postojeći objekti pogodni za razvoj novih stambenih projekata.",
  },
  {
    icon: ShieldCheck,
    title: "Jasna dokumentacija",
    text: "Najbrže reagujemo kada su vlasništvo, osnovni podaci i uslovi prodaje spremni za proveru.",
  },
];

const landAcquisitionFacts = [
  { icon: Ruler, label: "Namena", value: "Stambena gradnja" },
  { icon: ClipboardCheck, label: "Prvi korak", value: "Kratka procena" },
  { icon: MessageCircle, label: "Kontakt", value: "Direktan razgovor" },
];

type ProjectTab = "active" | "upcoming" | "completed";

export const HomePage = () => {
  const [activeTab, setActiveTab] = useState<ProjectTab>("active");
  const [projectMedia, setProjectMedia] = useState<ProjectMediaItem[]>([]);
  const reduceMotion = useReducedMotion();
  const reveal = reduceMotion ? staticFadeUp : fadeUp;
  const heroText = reduceMotion ? staticHeroTextLine : heroTextLine;
  const motionState = reduceMotion ? "show" : "hidden";
  const revealTransition = reduceMotion
    ? instantTransition
    : { duration: 0.55 };

  useEffect(() => {
    let isMounted = true;

    fetchProjectMedia()
      .then((media) => {
        if (isMounted) {
          setProjectMedia(media);
        }
      })
      .catch(() => {
        if (isMounted) {
          setProjectMedia([]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="home-page">
      <div className="home-page__ambient" aria-hidden="true" />
      <PageMeta
        title="M & M Gradnja | stanovi Heroja Pinkija 13 Novi Sad"
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
      <section className="home-hero">
        <motion.img
          src={images.hero}
          alt="Gradilišna tabla projekta Heroja Pinkija 13"
          className="home-hero__image"
          width="1672"
          height="941"
          fetchPriority="high"
          decoding="async"
        />
        <div className="home-hero__overlay" />
        <div className="home-hero__fade" />
        <div className="home-hero__kicker">M &amp; M GRADNJA / NOVI SAD</div>
        <motion.div
          className="home-hero__content"
          initial="hidden"
          animate="show"
          variants={heroTextContainer}
        >
          <span className="home-hero__anchor">AKTUELNI PROJEKAT</span>
          <h1>
            {heroLines.map((line) => (
              <motion.span
                key={line}
                variants={heroText}
                transition={
                  reduceMotion
                    ? instantTransition
                    : { duration: 0.82, ease: "easeOut" }
                }
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
            <Link
              className="site-button site-button--accent"
              to="/projekti/heroja-pinkija-13/ponuda-stanova"
            >
              <Home />
              Pogledaj stanove
            </Link>
            <ContactModalButton className="site-button site-button--light">
              <MessageCircle />
              Pišite nam
            </ContactModalButton>
          </div>
        </motion.div>
      </section>

      <motion.section
        id="home-project-facts"
        className="home-availability"
        aria-label="Kljucne informacije o projektu"
        initial={motionState}
        whileInView="show"
        viewport={{ once: true, amount: 0.28 }}
        variants={revealContainer}
      >
        <div className="page-container">
          <motion.div
            className="home-availability__grid"
            variants={revealContainer}
          >
            {availabilityItems.map(({ icon: Icon, label, value }) => (
              <motion.div
                className="home-availability__item"
                key={label}
                variants={reveal}
              >
                <span className="icon-bubble">
                  <Icon />
                </span>
                <div>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              </motion.div>
            ))}
          </motion.div>
          <motion.p className="home-availability__note" variants={reveal}>
            Garažna mesta i ostave kupuju se odvojeno od stana.
          </motion.p>
        </div>
      </motion.section>

      <section className="page-section home-projects">
        <div className="page-container">
          <motion.div
            className="split-grid split-grid--end"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={revealContainer}
          >
            <motion.div variants={reveal}>
              <p className="section-eyebrow">Projekti</p>
              <h2 className="section-title section-title--medium">
                Prostori za mirniji, udobniji ritam života.
              </h2>
            </motion.div>
            <motion.div className="home-projects__intro" variants={reveal}>
              <p>
                Svaka lokacija se bira pažljivo, sa idejom da stan bude vise od
                kvadrature: dobro povezan, funkcionalan i prijatan za
                svakodnevni život.
              </p>
              <p>
                Pregledajte aktuelne projekte, lokacije u pripremi i realizovane
                objekte.
              </p>
            </motion.div>
          </motion.div>

          <motion.div
            className="portfolio-tabs"
            role="tablist"
            aria-label="Filtriranje projekata"
            initial={motionState}
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
            variants={reveal}
            transition={revealTransition}
          >
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
          </motion.div>

          <AnimatePresence mode="wait">
            {activeTab === "active" ? (
              <ActiveProjectCard
                key="active"
                projectMedia={projectMedia}
                reduceMotion={Boolean(reduceMotion)}
              />
            ) : null}
            {activeTab === "upcoming" ? (
              <UpcomingProjectsCard
                key="upcoming"
                reduceMotion={Boolean(reduceMotion)}
              />
            ) : null}
            {activeTab === "completed" ? (
              <CompletedProjectsCard
                key="completed"
                reduceMotion={Boolean(reduceMotion)}
              />
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
            variants={revealContainer}
          >
            <motion.div variants={reveal}>
              <p className="section-eyebrow">Kupujemo placeve</p>
              <h2 className="section-title section-title--medium">
                Imate plac na prodaju?
              </h2>
            </motion.div>
            <motion.p className="section-copy" variants={reveal}>
              Pored aktuelne novogradnje, M & M Gradnja razmatra nove parcele i
              kuće za rušenje na kvalitetnim lokacijama. Pošaljite osnovne
              podatke i dobićete jasan prvi odgovor o potencijalu saradnje.
            </motion.p>
          </motion.div>

          <motion.article
            className="land-preview-card"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
            variants={revealContainer}
          >
            <motion.div className="land-preview-card__copy" variants={reveal}>
              <span className="icon-bubble">
                <Building2 />
              </span>
              <h3>Tražimo parcele za stambenu izgradnju.</h3>
              <p>
                Ako imate plac, stariji objekat ili lokaciju sa potencijalom,
                možemo brzo da proverimo osnovne uslove i predložimo sledeći
                korak bez komplikovane procedure.
              </p>

              <div className="land-preview-card__actions">
                <Link
                  className="site-button site-button--dark"
                  to="/kupujemo-placeve"
                >
                  Detalji za vlasnike
                  <ArrowUpRight />
                </Link>
                <Link
                  className="site-button site-button--outline"
                  to="/kupujemo-placeve"
                >
                  Pošaljite ponudu
                </Link>
              </div>
            </motion.div>

            <motion.div
              className="land-preview-card__details"
              variants={reveal}
            >
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
                {landAcquisitionHighlights.map(
                  ({ icon: Icon, title, text }) => (
                    <div key={title} className="portfolio-feature">
                      <span className="icon-bubble">
                        <Icon />
                      </span>
                      <div>
                        <h4>{title}</h4>
                        <p>{text}</p>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </motion.div>
          </motion.article>
        </div>
      </section>

      <section className="home-contact">
        <motion.div
          className="page-container home-contact__grid"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={revealContainer}
        >
          <motion.div variants={reveal}>
            <p className="section-eyebrow">Prodaja i obilazak</p>
            <h2 className="section-title section-title--medium">
              Proverite dostupne stanove i uslove kupovine.
            </h2>
            <p className="section-copy">
              Pozovite prodaju za kvadrature, cenu, tlocrt i trenutni status
              izabranog stana.
            </p>
          </motion.div>

          <motion.div className="home-contact__actions" variants={reveal}>
            <ContactModalButton className="site-button site-button--dark">
              <MessageCircle />
              Pišite nam
            </ContactModalButton>
            <a
              className="site-button site-button--outline"
              href={contactPhoneHref}
            >
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
          </motion.div>
        </motion.div>
      </section>
    </main>
  );
};

type PortfolioCardProps = {
  reduceMotion: boolean;
};

type ActiveProjectCardProps = PortfolioCardProps & {
  projectMedia: ProjectMediaItem[];
};

const ActiveProjectCard = ({
  projectMedia,
  reduceMotion,
}: ActiveProjectCardProps) => {
  const selectedFeature = lifestyleItems[0];
  const facadeImage =
    projectMedia.find((item) => item.mediaType === "project_image") ??
    ({
      filePath: images.living,
      altText: "Render fasade projekta Heroja Pinkija 13",
    } as Pick<ProjectMediaItem, "filePath" | "altText">);
  const worksImage =
    projectMedia.find(
      (item) => item.mediaType === "construction_update_image",
    ) ??
    ({
      filePath: images.terrace,
      altText: "Radovi u toku na projektu Heroja Pinkija 13",
    } as Pick<ProjectMediaItem, "filePath" | "altText">);

  return (
    <motion.article
      className="portfolio-card"
      initial="hidden"
      animate="show"
      exit={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
      variants={revealContainer}
    >
      <motion.div
        className="portfolio-card__copy"
        variants={reduceMotion ? staticFadeUp : fadeUp}
      >
        <p className="section-eyebrow">U prodaji</p>
        <h3>Heroja Pinkija 13</h3>
        <p>
          Jedna od traženijih lokacija u razvoju, povezana sa svim delovima
          grada i prilagođena svakodnevnom životu.
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
          <Link
            className="site-button site-button--dark"
            to="/projekti/heroja-pinkija-13/o-projektu"
          >
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
      </motion.div>

      <motion.div
        className="portfolio-card__media"
        variants={reduceMotion ? staticFadeUp : fadeUp}
      >
        <div className="portfolio-card__images">
          <img
            className="portfolio-card__image portfolio-card__image--facade"
            src={facadeImage.filePath}
            alt={
              facadeImage.altText ?? "Render fasade projekta Heroja Pinkija 13"
            }
            width="1672"
            height="941"
            loading="lazy"
            decoding="async"
          />
          <div>
            <img
              className="portfolio-card__image portfolio-card__image--works"
              src={worksImage.filePath}
              alt={
                worksImage.altText ??
                "Radovi u toku na projektu Heroja Pinkija 13"
              }
              width="1663"
              height="1247"
              loading="lazy"
              decoding="async"
            />
            <div className="portfolio-note">
              <div>
                <Sparkles className="icon-inline" />
                {selectedFeature.title}
              </div>
              <p>{selectedFeature.text}</p>
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
      </motion.div>
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
      variants={revealContainer}
    >
      <motion.div
        className="portfolio-card__copy portfolio-card__copy--surface"
        variants={reduceMotion ? staticFadeUp : fadeUp}
      >
        <p className="section-eyebrow">U pripremi</p>
        <h3>Uskoro...</h3>
        <p>
          Kada portfolio bude proširen, svaki projekat će dobiti svoje mesto sa
          lokacijom, statusom, ponudom stanova i kontaktom.
        </p>
      </motion.div>

      <motion.div
        className="portfolio-card__slots"
        variants={reduceMotion ? staticFadeUp : fadeUp}
      >
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
      </motion.div>
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
      variants={revealContainer}
    >
      <motion.div
        className="portfolio-card__copy portfolio-card__copy--dark"
        variants={reduceMotion ? staticFadeUp : fadeUp}
      >
        <p className="section-eyebrow">Realizovani projekti</p>
        <h3>Uskoro...</h3>
        <p>
          Kada projekti budu završeni i useljeni, ova sekcija će služiti kao
          arhiva realizovanih lokacija i referenci kompanije.
        </p>
      </motion.div>

      <motion.div
        className="portfolio-card__slots"
        variants={reduceMotion ? staticFadeUp : fadeUp}
      >
        {[
          {
            icon: Building2,
            title: "Realizovani objekat",
            text: "Mesto za završene projekte i osnovne podatke o lokaciji.",
          },
          {
            icon: MapPin,
            title: "Završena lokacija",
            text: "Arhiva će biti odvojena od aktuelne ponude.",
          },
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
      </motion.div>
    </motion.article>
  );
};
