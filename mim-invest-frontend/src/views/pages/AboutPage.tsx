import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  BadgeCheck,
  Handshake,
  HardHat,
  Home,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";

import { ContactModalButton } from "../../features/inquiries/components/ContactModal";
import { PageMeta } from "../../shared/components/PageMeta";

const projectImage = "/images/heroja-pinkija-13/radovi-u-toku.jpg";

const heroHighlights = [
  { value: "Marko i Milan Potrebić", label: "direktno kod investitora" },
  { value: "15 stanova", label: "pregledna ponuda" },
  { value: "15.11.2027.", label: "planirani završetak" },
];

const trustSignals = [
  {
    icon: ShieldCheck,
    title: "Jasna ponuda",
    text: "stanovi, kvadrature, tlocrti i statusi dostupni su pre prvog razgovora.",
  },
  {
    icon: BadgeCheck,
    title: "Realne informacije",
    text: "Napredak radova i rokove prikazujemo kroz konkretne podatke i fotografije.",
  },
  {
    icon: Handshake,
    title: "Direktan kontakt",
    text: "O dostupnosti i kupovini razgovarate direktno sa ljudima iza projekta.",
  },
];

const processSteps = [
  {
    icon: ShieldCheck,
    title: "Upoznajte projekat",
    text: "Pregledajte lokaciju, strukturu objekta i aktuelnu fazu gradnje.",
  },
  {
    icon: BadgeCheck,
    title: "Uporedite stanove",
    text: "Izaberite jedinicu kroz kvadraturu, tlocrt, orijentaciju i status ponude.",
  },
  {
    icon: MessageCircle,
    title: "Dogovorite sledeći korak",
    text: "Pošaljite upit i zajedno proverite dostupnost, obilazak i uslove kupovine.",
  },
];

const values = [
  {
    icon: BadgeCheck,
    title: "Realne fotografije radova",
    text: "Projekat prikazujemo kroz stvarne slike sa gradilišta, bez zamene za generičke vizuale.",
  },
  {
    icon: ShieldCheck,
    title: "stanovi, kvadrature i tlocrti",
    text: "Kupac može da uporedi rasporede, površine i strukture pre prvog razgovora.",
  },
  {
    icon: HardHat,
    title: "statusi i rokovi",
    text: "Ponuda stanova i planirani rok završetka prikazani su jasno, uz kontakt za proveru detalja.",
  },
  {
    icon: Handshake,
    title: "Direktan dogovor",
    text: "Za dostupnost, uslove kupovine, obilazak i dodatne opcije razgovarate direktno sa investitorima.",
  },
];

const projectProof = [
  "Otvoren prikaz projekta od prvog koraka.",
  "Jasna ponuda 15 stanova sa tlocrtima, kvadraturama i statusima.",
  "Direktan kontakt sa Markom i Milanom Potrebićem tokom kupovine.",
  "Parking i ostave proveravaju se direktno kroz razgovor o kupovini.",
];

const projectFacts = [
  { label: "Investitori", value: "Marko i Milan Potrebić" },
  { label: "Lokacija", value: "Heroja Pinkija 13, Novi Sad" },
  { label: "Struktura", value: "PO + PR + 3" },
  { label: "Trenutna faza", value: "Iskop završen, temelji u toku" },
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
      <PageMeta
        title="O nama | M & M Gradnja"
        description="Upoznajte M & M Gradnja, investitore projekta Heroja Pinkija 13, sa fokusom na transparentnu ponudu stanova i direktnu komunikaciju."
      />
      <section className="about-hero about-hero--company">
        <div className="page-container about-hero__grid">
          <motion.div
            className="about-hero__copy"
            initial={motionState}
            animate="show"
            variants={revealContainer}
          >
            <motion.p className="section-eyebrow" variants={reveal}>
              M & M Gradnja / Novi Sad
            </motion.p>
            <motion.h1 className="section-title" variants={reveal}>
              Gradimo prvi projekat otvoreno, jasno i direktno.
            </motion.h1>
            <motion.p className="section-copy section-copy--large" variants={reveal}>
              M & M Gradnja je porodicno vodjen investitorski projekat iza kog
              stoje Marko i Milan Potrebić. Kao prvi korak biramo otvoren odnos:
              kupac treba da zna sta se gradi, u kojoj je fazi i kome može da se
              obrati.
            </motion.p>
            <motion.div className="page-actions" variants={reveal}>
              <Link
                className="site-button site-button--accent"
                to="/projekti/heroja-pinkija-13/ponuda-stanova"
              >
                <Home />
                Pogledajte ponudu stanova
              </Link>
              <ContactModalButton className="site-button site-button--outline">
                <MessageCircle />
                Pišite nam
              </ContactModalButton>
            </motion.div>
            <motion.div className="about-hero__founders" variants={reveal}>
              <span>Marko i Milan Potrebić</span>
              <span>Investitori i direktni sagovornici</span>
            </motion.div>
          </motion.div>

          <motion.div
            className="about-hero__profile"
            initial={motionState}
            animate="show"
            variants={reveal}
            transition={{ duration: 0.65, delay: reduceMotion ? 0 : 0.16 }}
          >
            <div className="about-hero__profile-header">
              <span className="about-hero__profile-label">Naša obećanja</span>
            </div>
            <h2>Informacija pre odluke.</h2>
            <p>
              Dobar početak kupovine nije pritisak, već dovoljno informacija da
              mirno procenite da li je projekat pravi za vas.
            </p>
            <ul className="about-hero__profile-list">
              {trustSignals.map(({ icon: Icon, title, text }) => (
                <li key={title}>
                  <span className="about-hero__profile-icon">
                    <Icon />
                  </span>
                  <span>
                    <strong>{title}</strong>
                    <small>{text}</small>
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>

          <dl className="about-hero__stats">
            {heroHighlights.map((item) => (
              <div key={item.value}>
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
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
          <motion.div className="about-philosophy__heading" variants={reveal}>
            <p className="section-eyebrow">Ko stoji iza projekta</p>
            <p className="about-philosophy__statement">
              Direktno sa investitorima.
            </p>
          </motion.div>

          <motion.div className="about-philosophy__copy" variants={reveal}>
            <p>
              Heroja Pinkija 13 je prvi projekat M & M Gradnja i zato ga
              predstavljamo otvoreno: kroz realne informacije, dostupne tlocrte,
              prikaz stanova i jasan kontakt sa investitorima.
            </p>
            <blockquote>
              Kupac ne prolazi kroz nepotrebne posrednike. Pitanja o stanu,
              dostupnosti, uslovima kupovine i obilasku idu direktno ka ljudima
              koji stoje iza projekta.
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
              <p className="section-eyebrow">Zašto ovakav pristup</p>
              <h2 className="section-title section-title--medium">
                Poverenje kroz jasne informacije.
              </h2>
            </div>
            <p className="section-copy">
              Detaljna dokumentacija ostaje na stranici projekta, dok ovde
              izdvajamo ono sto kupcu odmah pomaze da razume ponudu.
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
          viewport={{ once: true, amount: 0.24 }}
          variants={revealContainer}
        >
          <motion.div className="about-process__intro" variants={reveal}>
            <p className="about-process__eyebrow">
              <Handshake />
              Kako radimo
            </p>
            <h2>Tri jasna koraka do pravog razgovora.</h2>
            <p>
              Sajt treba da vam skrati put do odluke. Zato su najvažnije
              informacije dostupne odmah, a razgovor dolazi kada ste spremni.
            </p>
          </motion.div>

          <motion.ol className="about-process__steps" variants={revealContainer}>
            {processSteps.map(({ icon: Icon, title, text }, index) => (
              <motion.li key={title} variants={reveal}>
                <span className="about-process__number">
                  <Icon />
                </span>
                <div>
                  <span className="about-process__step-index">
                    0{index + 1}
                  </span>
                  <h3>{title}</h3>
                  <p>{text}</p>
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
              decoding="async"
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
              <p className="section-eyebrow">Heroja Pinkija 13 kao prvi korak</p>
              <h2 className="section-title section-title--medium">
                Heroja Pinkija 13 kao prvi korak.
              </h2>
              <p className="section-copy">
                Ne predstavljamo se kroz dug portfolio koji ne postoji. Heroja
                Pinkija 13 je osnova našeg budućeg rada: pregledna ponuda,
                funkcionalni stanovi i komunikacija koja kupcu pomaze da donese
                mirnu odluku.
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
                Pogledajte detalje projekta
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
            <h2>Dostupni stanovi i direktan razgovor.</h2>
            <p>
              Ponuda je postavljena tako da lako uporedite stanove, proverite
              tlocrte i posaljete upit za konkretnu jedinicu. Garažna mesta i
              ostave su dodatne opcije i kupuju se odvojeno.
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
            <ContactModalButton className="about-trust__text-link">
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
