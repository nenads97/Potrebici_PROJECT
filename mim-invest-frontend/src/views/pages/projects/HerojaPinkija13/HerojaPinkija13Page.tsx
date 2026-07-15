import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  Building2,
  CalendarDays,
  Car,
  Check,
  CheckCircle2,
  Clock3,
  FileText,
  Flame,
  Home,
  Layers3,
  MapPin,
  MessageCircle,
  Package,
  Ruler,
} from "lucide-react";
import { Link } from "react-router-dom";

import { ContactModalButton } from "../../../../features/inquiries/components/ContactModal";
import {
  apartments,
  contactEmail,
  contactPhone,
  projectInfo as fallbackProjectInfo,
  projectTimeline as fallbackProjectTimeline,
  statusLabel,
  statusVariant,
} from "../../../../features/projects/data/herojaPinkija13.data";
import {
  fetchProjectInfo,
  fetchProjectTimeline,
  formatProjectDateCompact,
} from "../../../../features/projects/data/projectSupabase.api";
import { PageMeta } from "../../../../shared/components/PageMeta";

const projectImages = {
  hero: "/images/heroja-pinkija-13/gradilisna-tabla.jpg",
  works: "/images/heroja-pinkija-13/radovi-u-toku.jpg",
};

const projectBenefits = [
  {
    number: "01",
    icon: Ruler,
    title: "Funkcionalni rasporedi",
    text:
      "Garsonjere, dvosobni i trosobni stanovi organizovani su kroz pet stanova na svakoj stambenoj etaži.",
  },
  {
    number: "02",
    icon: Flame,
    title: "Komfor u svakodnevici",
    text:
      "Podno grejanje i lift od podzemne garaže do svih spratova deo su potvrdene opreme objekta.",
  },
  {
    number: "03",
    icon: Building2,
    title: "Pregledan objekat",
    text:
      "Ukupno 15 stanova omogućava jasnu ponudu i jednostavno poređenje jedinica kroz vertikalu.",
  },
  {
    number: "04",
    icon: MapPin,
    title: "Početak Telepa",
    text:
      "Lokacija povezuje mirniji stambeni karakter sa linijom 12, gradskim sadržajima i centrom Novog Sada.",
  },
];

const featuredApartmentNumbers = new Set(["1", "2", "3", "4", "5"]);
const featuredApartments = apartments.filter((apartment) =>
  featuredApartmentNumbers.has(apartment.number),
);

const featuredApartmentPlans: Record<string, string> = {
  "1": "/images/apartment-plans/showcase-stan-1-6-11.png",
  "2": "/images/apartment-plans/showcase-stan-2-7-12.png",
  "3": "/images/apartment-plans/showcase-stan-3-8-13.png",
  "4": "/images/apartment-plans/showcase-stan-4-9-14.png",
  "5": "/images/apartment-plans/showcase-stan-5-10-15.png",
};

const reveal = {
  hidden: { opacity: 0, y: 22 },
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

export const HerojaPinkija13Page = () => {
  const reduceMotion = useReducedMotion();
  const motionState = reduceMotion ? "show" : "hidden";
  const [project, setProject] = useState(fallbackProjectInfo);
  const [timeline, setTimeline] = useState(fallbackProjectTimeline);
  const activeTimelineStep =
    timeline.find((step) => step.state === "active") ??
    timeline.find((step) => step.state === "upcoming") ??
    timeline[timeline.length - 1];
  const completionCompact =
    formatProjectDateCompact(project.constructionEndDate) ||
    formatProjectDateCompact(fallbackProjectInfo.constructionEndDate) ||
    "15.11.2027.";
  const startCompact =
    formatProjectDateCompact(project.constructionStartDate) ||
    formatProjectDateCompact(fallbackProjectInfo.constructionStartDate) ||
    "16.03.2026.";
  const projectHeroImage = project.heroImage || projectImages.hero;
  const projectAddress = `${project.address}, ${project.city}`;
  const heroFacts = [
    { label: "stanovi", value: "15" },
    { label: "Struktura", value: project.floorStructure },
    { label: "Grejanje", value: "Podno" },
    { label: "Planirani završetak", value: completionCompact },
  ];
  const overviewFacts = [
    { icon: Building2, label: "Tip objekta", value: "stambena zgrada" },
    { icon: MapPin, label: "Lokacija", value: projectAddress },
    { icon: Home, label: "stambene jedinice", value: "15 stanova" },
    { icon: Layers3, label: "Struktura objekta", value: project.floorStructure },
    { icon: Car, label: "Garažna mesta", value: "13 mesta, odvojena kupovina" },
    { icon: Package, label: "Ostave", value: "15 ostava, odvojena kupovina" },
    { icon: Clock3, label: "Trenutna faza", value: "Iskop završen, temelji u toku" },
    { icon: CalendarDays, label: "Planirani završetak", value: completionCompact },
  ];
  const detailGroups = [
    {
      eyebrow: "Objekat",
      title: "Osnovni podaci",
      items: [
        { label: "Investitor", value: "M & M Gradnja" },
        { label: "Tip objekta", value: "stambena zgrada" },
        { label: "Struktura", value: project.floorStructure },
        { label: "stambene jedinice", value: "15 stanova" },
      ],
    },
    {
      eyebrow: "stanovanje",
      title: "Komfor",
      items: [
        { label: "Grejanje", value: "Podno grejanje" },
        { label: "Vertikalna komunikacija", value: "Lift do svih spratova" },
        { label: "Raspored", value: "5 stanova po stambenoj etaži" },
        { label: "Strukture stanova", value: "Garsonjere, dvosobni i trosobni" },
      ],
    },
    {
      eyebrow: "Dodatne jedinice",
      title: "Parking i ostave",
      items: [
        { label: "Garažna mesta", value: "13 mesta" },
        { label: "Ostave", value: "15 ostava" },
        { label: "Dvorisni parking", value: "10 mesta" },
        { label: "Nacin kupovine", value: "Odvojeno od stana" },
      ],
    },
    {
      eyebrow: "Realizacija",
      title: "Rokovi i status",
      items: [
        { label: "Početak radova", value: startCompact },
        { label: "Završena faza", value: "Iskop" },
        { label: "Aktuelna faza", value: project.status },
        { label: "Planirani završetak", value: completionCompact },
      ],
    },
  ];
  const projectContactModal = {
    eyebrow: project.name,
    title: "Pišite nam za informacije o projektu",
    description:
      "Pošaljite upit za cenu, dostupnost stanova, uslove kupovine ili termin obilaska. Prodajni tim će vam se javiti sa konkretnim informacijama.",
    inquiryType: "availability" as const,
    details: [
      { label: "Projekat", value: project.name },
      { label: "Lokacija", value: project.district ? `${project.district}, ${project.city}` : project.city },
    ],
    messagePlaceholder: "Napišite koji stan, kvadratura ili termin obilaska vas zanima.",
  };

  useEffect(() => {
    let isMounted = true;

    void Promise.all([fetchProjectInfo(), fetchProjectTimeline()])
      .then(([projectInfo, projectTimeline]) => {
        if (isMounted) {
          setProject(projectInfo);
          setTimeline(projectTimeline);
        }
      })
      .catch(() => {
        if (isMounted) {
          setProject(fallbackProjectInfo);
          setTimeline(fallbackProjectTimeline);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="project-showcase">
      <PageMeta
        title={project.seoTitle ?? "Heroja Pinkija 13 | M & M Gradnja"}
        description={
          project.seoDescription ??
          "Pregled projekta Heroja Pinkija 13 u Novom Sadu: stanovi, lokacija, rokovi, status radova i direktan upit prodaji."
        }
        canonicalPath="/projekti/heroja-pinkija-13/o-projektu"
        image={projectHeroImage}
        imageAlt={`Eksterijer projekta ${project.name}`}
        structuredData={({ canonicalUrl, imageUrl, origin }) => ({
          "@context": "https://schema.org",
          "@type": "ApartmentComplex",
          name: project.name,
          description: project.description,
          url: canonicalUrl,
          image: imageUrl,
          telephone: contactPhone,
          email: contactEmail,
          tourBookingPage: `${origin}/kontakt`,
          address: {
            "@type": "PostalAddress",
            streetAddress: project.address,
            addressLocality: project.city,
            addressRegion: "Vojvodina",
            addressCountry: "RS",
          },
        })}
      />
      <section className="project-showcase-hero">
        <div className="page-container project-showcase-hero__grid">
          <motion.div
            className="project-showcase-hero__copy"
            initial={motionState}
            animate="show"
            variants={revealContainer}
          >
            <motion.p className="section-eyebrow" variants={reveal}>
              Aktuelni projekat
            </motion.p>
            <motion.h1 className="section-title" variants={reveal}>
              {project.name}.
            </motion.h1>
            <motion.p className="project-showcase-hero__location" variants={reveal}>
              <MapPin />
              {project.district ? `${project.district}, ${project.city}` : projectAddress}
            </motion.p>
            <motion.p className="section-copy section-copy--large" variants={reveal}>
              {project.lead}
            </motion.p>
            <motion.div className="page-actions" variants={reveal}>
              <Link
                className="site-button site-button--accent"
                to="/projekti/heroja-pinkija-13/ponuda-stanova"
              >
                <Home />
                Pogledajte stanove
              </Link>
              <ContactModalButton
                className="site-button site-button--outline"
                modalOptions={projectContactModal}
              >
                <MessageCircle />
                Pišite nam
              </ContactModalButton>
            </motion.div>
          </motion.div>

          <motion.div
            className="project-showcase-hero__visual"
            initial={motionState}
            animate="show"
            variants={reveal}
            transition={{ duration: 0.65, delay: reduceMotion ? 0 : 0.15 }}
          >
            <div className="project-showcase-hero__image">
              <img
                src={projectHeroImage}
                alt={`Eksterijer projekta ${project.name}`}
                width="818"
                height="783"
                fetchPriority="high"
                decoding="async"
              />
              <span className="project-showcase-hero__status">
                <span />
                {project.status}
              </span>
            </div>
            <dl className="project-showcase-hero__facts">
              {heroFacts.map((fact) => (
                <div key={fact.label}>
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
          </motion.div>
        </div>
      </section>

      <section className="project-showcase-overview">
        <div className="page-container">
          <motion.div
            className="project-showcase-heading"
            initial={motionState}
            whileInView="show"
            viewport={{ once: true, amount: 0.35 }}
            variants={reveal}
          >
            <div>
              <p className="section-eyebrow">Projekat ukratko</p>
              <h2 className="section-title section-title--medium">
                Najvaznije informacije na jednom mestu.
              </h2>
            </div>
            <p className="section-copy">
              Pregled cinjenica koje kupcu omogućavaju da brzo razume objekat,
              dodatne jedinice i trenutnu dinamiku realizacije.
            </p>
          </motion.div>

          <motion.dl
            className="project-showcase-overview__facts"
            initial={motionState}
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            variants={revealContainer}
          >
            {overviewFacts.map(({ icon: Icon, label, value }) => (
              <motion.div key={label} variants={reveal}>
                <Icon />
                <dt>{label}</dt>
                <dd>{value}</dd>
              </motion.div>
            ))}
          </motion.dl>
        </div>
      </section>

      <section className="project-showcase-benefits">
        <div className="page-container">
          <motion.div
            className="project-showcase-benefits__intro"
            initial={motionState}
            whileInView="show"
            viewport={{ once: true, amount: 0.35 }}
            variants={reveal}
          >
            <p className="section-eyebrow">Zašto ovaj projekat</p>
            <h2 className="section-title section-title--medium">
              Prakticne prednosti koje se osecaju svakog dana.
            </h2>
          </motion.div>

          <motion.div
            className="project-showcase-benefits__grid"
            initial={motionState}
            whileInView="show"
            viewport={{ once: true, amount: 0.16 }}
            variants={revealContainer}
          >
            {projectBenefits.map(({ number, icon: Icon, title, text }) => (
              <motion.article key={number} variants={reveal}>
                <div>
                  <span>{number}</span>
                  <Icon />
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="project-showcase-progress">
        <motion.div
          className="page-container project-showcase-progress__panel"
          initial={motionState}
          whileInView="show"
          viewport={{ once: true, amount: 0.16 }}
          variants={revealContainer}
        >
          <motion.div className="project-showcase-progress__intro" variants={reveal}>
            <div className="project-showcase-progress__eyebrow">
              <Clock3 />
              <span>status radova</span>
            </div>
            <h2>Jasan pregled završenih i narednih faza.</h2>
            <p>
              Aktuelni status je prikazan tekstualno i vizuelno, bez potrebe za
              dodatnim otvaranjem ili izborom koraka.
            </p>
            <div className="project-showcase-progress__current">
              <span>Aktuelna faza</span>
              <strong>{activeTimelineStep?.title ?? project.status}</strong>
            </div>
          </motion.div>

          <motion.ol
            className="project-showcase-progress__timeline"
            variants={revealContainer}
          >
            {timeline.map((step, index) => (
              <motion.li
                className={`project-showcase-progress__step project-showcase-progress__step--${step.state}`}
                key={step.title}
                variants={reveal}
              >
                <div className="project-showcase-progress__marker">
                  {step.state === "done" ? <Check /> : <span>{index + 1}</span>}
                </div>
                <div>
                  <div className="project-showcase-progress__step-head">
                    <span>{step.date}</span>
                    <small>{step.statusLabel}</small>
                  </div>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </div>
              </motion.li>
            ))}
          </motion.ol>
        </motion.div>
      </section>

      <section className="project-showcase-apartments" id="stanovi">
        <div className="page-container">
          <motion.div
            className="project-showcase-heading"
            initial={motionState}
            whileInView="show"
            viewport={{ once: true, amount: 0.32 }}
            variants={reveal}
          >
            <div>
              <p className="section-eyebrow">Ponuda stanova</p>
              <h2 className="section-title section-title--medium">
                Pet tipova rasporeda kroz tri etaže.
              </h2>
            </div>
            <div className="project-showcase-apartments__heading-copy">
              <p className="section-copy">
                Prikazani su reprezentativni stanovi prve etaže. Isti tipovi
                ponavljaju se kroz vertikalu uz razlike u kvadraturi.
              </p>
              <span>Svi prikazani statusi su dostupni i tekstualno.</span>
            </div>
          </motion.div>

          <motion.div
            className="project-showcase-apartments__grid"
            initial={motionState}
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
            variants={revealContainer}
          >
            {featuredApartments.map((apartment) => (
              <motion.article
                className="project-showcase-apartment"
                key={apartment.number}
                variants={reveal}
              >
                <Link
                  className="project-showcase-apartment__image"
                  to={`/projekti/heroja-pinkija-13/ponuda-stanova/${apartment.number}`}
                  aria-label={`Detalji stana ${apartment.number}`}
                >
                  <img
                    src={featuredApartmentPlans[apartment.number]}
                    alt={`Tlocrt stana ${apartment.number}`}
                    loading="lazy"
                    width="520"
                    height="430"
                  />
                  <span
                    className={`status-badge status-badge--${statusVariant[apartment.status]}`}
                  >
                    {statusLabel[apartment.status]}
                  </span>
                </Link>
                <div className="project-showcase-apartment__body">
                  <div className="project-showcase-apartment__title">
                    <span>stan</span>
                    <h3>{apartment.number}</h3>
                  </div>
                  <dl>
                    <div>
                      <dt>Sprat</dt>
                      <dd>{apartment.floor}</dd>
                    </div>
                    <div>
                      <dt>Površina</dt>
                      <dd>{apartment.size}</dd>
                    </div>
                    <div>
                      <dt>Struktura</dt>
                      <dd>{apartment.rooms}</dd>
                    </div>
                  </dl>
                  <Link
                    className="project-showcase-apartment__link"
                    to={`/projekti/heroja-pinkija-13/ponuda-stanova/${apartment.number}`}
                  >
                    Detalji stana
                    <ArrowUpRight />
                  </Link>
                </div>
              </motion.article>
            ))}
          </motion.div>

          <motion.div
            className="project-showcase-apartments__actions"
            initial={motionState}
            whileInView="show"
            viewport={{ once: true, amount: 0.5 }}
            variants={reveal}
          >
            <Link
              className="site-button site-button--dark"
              to="/projekti/heroja-pinkija-13/ponuda-stanova"
            >
              <Home />
              Kompletna ponuda
            </Link>
            <Link
              className="site-button site-button--outline"
              to="/projekti/heroja-pinkija-13/spisak-stanova"
            >
              <FileText />
              Spisak stanova
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="project-showcase-details">
        <div className="page-container">
          <motion.div
            className="project-showcase-details__intro"
            initial={motionState}
            whileInView="show"
            viewport={{ once: true, amount: 0.35 }}
            variants={reveal}
          >
            <p className="section-eyebrow">Detalji projekta</p>
            <h2 className="section-title section-title--medium">
              Tehnicke i prodajne informacije, grupisane pregledno.
            </h2>
          </motion.div>

          <motion.div
            className="project-showcase-details__grid"
            initial={motionState}
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
            variants={revealContainer}
          >
            {detailGroups.map((group) => (
              <motion.article key={group.title} variants={reveal}>
                <p>{group.eyebrow}</p>
                <h3>{group.title}</h3>
                <dl>
                  {group.items.map((item) => (
                    <div key={item.label}>
                      <dt>{item.label}</dt>
                      <dd>{item.value}</dd>
                    </div>
                  ))}
                </dl>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="project-showcase-location">
        <div className="page-container project-showcase-location__grid">
          <motion.div
            className="project-showcase-location__media"
            initial={motionState}
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
            variants={reveal}
          >
            <img
              src={projectImages.works}
              alt="Radovi na projektu Heroja Pinkija 13"
              width="1663"
              height="1247"
              loading="lazy"
              decoding="async"
            />
            <span>
              <MapPin />
              Heroja Pinkija 13
            </span>
          </motion.div>

          <motion.div
            className="project-showcase-location__copy"
            initial={motionState}
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={revealContainer}
          >
            <motion.p className="section-eyebrow" variants={reveal}>
              Lokacija
            </motion.p>
            <motion.h2
              className="section-title section-title--medium"
              variants={reveal}
            >
              Početak Telepa, povezan sa gradom.
            </motion.h2>
            <motion.p className="section-copy" variants={reveal}>
              {project.locationDescription ?? fallbackProjectInfo.locationDescription}
            </motion.p>
            <motion.ul variants={reveal}>
              <li>
                <CheckCircle2 />
                Lidl i Gimnazija Laza Kostić u blizini
              </li>
              <li>
                <CheckCircle2 />
                Kej, Ribarac, Šodroš i parkovi
              </li>
              <li>
                <CheckCircle2 />
                Direktna autobuska veza sa centrom
              </li>
            </motion.ul>
            <motion.div variants={reveal}>
              <Link className="site-button site-button--outline" to="/lokacija">
                <MapPin />
                Pogledajte lokaciju
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="project-showcase-cta">
        <motion.div
          className="page-container project-showcase-cta__inner"
          initial={motionState}
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          variants={revealContainer}
        >
          <motion.div variants={reveal}>
            <p className="section-eyebrow">Sledeći korak</p>
            <h2>Izaberite stan ili pošaljite upit prodaji.</h2>
            <p>
              Proverite kvadrature i rasporede ili nam se obratite za cenu,
              uslove kupovine i termin obilaska.
            </p>
          </motion.div>
          <motion.div className="project-showcase-cta__actions" variants={reveal}>
            <Link
              className="site-button site-button--dark"
              to="/projekti/heroja-pinkija-13/ponuda-stanova"
            >
              <Home />
              Ponuda stanova
            </Link>
            <ContactModalButton
              className="project-showcase-cta__link"
              modalOptions={projectContactModal}
            >
              <MessageCircle />
              Pišite nam
              <ArrowUpRight />
            </ContactModalButton>
          </motion.div>
        </motion.div>
      </section>
    </main>
  );
};
