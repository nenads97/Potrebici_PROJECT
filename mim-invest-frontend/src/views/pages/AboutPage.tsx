import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  BadgeCheck,
  CalendarDays,
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
  { value: "Marko i Milan Potrebic", label: "direktno kod investitora" },
  { value: "15 stanova", label: "pregledna ponuda" },
  { value: "15.11.2027.", label: "planirani zavrsetak" },
];

const values = [
  {
    icon: BadgeCheck,
    title: "Realne fotografije radova",
    text: "Projekat prikazujemo kroz stvarne slike sa gradilista, bez zamene za genericke vizuale.",
  },
  {
    icon: ShieldCheck,
    title: "Stanovi, kvadrature i tlocrti",
    text: "Kupac moze da uporedi rasporede, povrsine i strukture pre prvog razgovora.",
  },
  {
    icon: HardHat,
    title: "Statusi i rokovi",
    text: "Ponuda stanova i planirani rok zavrsetka prikazani su jasno, uz kontakt za proveru detalja.",
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
  "Direktan kontakt sa Markom i Milanom Potrebicem tokom kupovine.",
  "Parking i ostave proveravaju se direktno kroz razgovor o kupovini.",
];

const projectFacts = [
  { label: "Investitori", value: "Marko i Milan Potrebic" },
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
              Prvi projekat, otvoren pristup.
            </motion.h1>
            <motion.p className="section-copy section-copy--large" variants={reveal}>
              M & M Gradnja je porodicno vodjen investitorski projekat iza kog
              stoje Marko i Milan Potrebic. Heroja Pinkija 13 razvijamo kao prvi
              projekat, sa fokusom na jasnu ponudu stanova, direktnu komunikaciju
              i realno prikazane informacije.
            </motion.p>
            <motion.div className="page-actions" variants={reveal}>
              <Link
                className="site-button site-button--accent"
                to="/projekti/heroja-pinkija-13/ponuda-stanova"
              >
                <Home />
                Pogledajte ponudu stanova
              </Link>
              <Link className="site-button site-button--outline" to="/kontakt">
                <MessageCircle />
                Kontaktirajte investitore
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
              <p className="section-eyebrow">Zasto ovakav pristup</p>
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
              <p className="section-eyebrow">Heroja Pinkija 13 kao prvi korak</p>
              <h2 className="section-title section-title--medium">
                Heroja Pinkija 13 kao prvi korak.
              </h2>
              <p className="section-copy">
                Ne predstavljamo se kroz dug portfolio koji ne postoji. Heroja
                Pinkija 13 je osnova naseg buduceg rada: pregledna ponuda,
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
              tlocrte i posaljete upit za konkretnu jedinicu. Garazna mesta i
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
