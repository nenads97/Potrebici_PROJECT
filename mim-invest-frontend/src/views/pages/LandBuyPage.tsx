import type { FormEvent } from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  ClipboardCheck,
  FileText,
  Home,
  MapPin,
  MessageCircle,
  Phone,
  Ruler,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { contactEmail, contactPhone } from "../../features/projects/data/herojaPinkija13.data";

const landHeroImage =
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=2200&q=85";

const heroHighlights = [
  { value: "Novi Sad", label: "fokus lokacije" },
  { value: "Stambena namena", label: "potencijal za razvoj" },
  { value: "Jasan dogovor", label: "brza pocetna procena" },
];

const criteria = [
  {
    icon: Home,
    title: "Plac ili kuca za rusenje",
    text: "Razmatramo parcele i postojece objekte pogodne za novu stambenu izgradnju.",
  },
  {
    icon: MapPin,
    title: "Novi Sad i bliza okolina",
    text:
      "Prednost imaju gradske lokacije sa dobrom povezanoscu, infrastrukturom i jasnim urbanistickim potencijalom.",
  },
  {
    icon: Ruler,
    title: "Stambena namena",
    text: "Trazimo zemljiste koje moze da podrzi kvalitetan viseporodicni stambeni objekat.",
  },
  {
    icon: ShieldCheck,
    title: "Pravno cista situacija",
    text:
      "Najbrze mozemo da reagujemo kada su vlasnistvo, dokumentacija i osnovni uslovi za prodaju jasni.",
  },
];

const processSteps = [
  "Posaljite osnovne podatke o parceli, kuci ili lokaciji.",
  "Nas tim proverava potencijal lokacije i kontaktira vas za dodatne informacije.",
  "Dogovaramo sledeci korak, procenu i uslove saradnje.",
];

const preparationItems = [
  "Adresa ili okvirna lokacija nekretnine",
  "Povrsina parcele i pristup ulici",
  "Kratak opis postojeceg objekta, ako postoji",
  "Status dokumentacije koji vam je poznat",
];

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
};

export const LandBuyPage = () => {
  return (
    <main className="land-page">
      <section className="land-hero">
        <img src={landHeroImage} alt="Parcela pogodna za stambenu gradnju" />
        <div className="land-hero__overlay" />

        <motion.div
          className="page-container land-hero__content"
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={{ duration: 0.6 }}
        >
          <p className="section-eyebrow">Kupujemo placeve</p>
          <h1>Imate plac ili kucu za stambenu gradnju?</h1>
          <p>
            M & M Gradnja razmatra atraktivne lokacije za buduce stambene projekte.
            Posaljite nam osnovne informacije, a mi cemo vam se brzo javiti sa
            narednim koracima.
          </p>
          <div>
            <a className="site-button site-button--accent" href="#kupujemo-placeve-forma">
              <MessageCircle />
              Posaljite ponudu
            </a>
            <a className="site-button site-button--light" href={`tel:${contactPhone}`}>
              <Phone />
              Pozovite {contactPhone}
            </a>
          </div>
        </motion.div>

        <motion.div
          className="page-container land-hero__stats"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.12 }}
        >
          {heroHighlights.map((item) => (
            <div key={item.value}>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </div>
          ))}
        </motion.div>
      </section>

      <section id="kupujemo-placeve-forma" className="page-section page-section--surface">
        <div className="page-container split-grid">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            transition={{ duration: 0.55 }}
          >
            <p className="section-eyebrow">Formular za ponudu</p>
            <h2 className="section-title section-title--medium">Prvi korak je kratak upit.</h2>
            <p className="section-copy">
              Unesite osnovne podatke o sebi i nekretnini. Ime, telefon i e-mail su
              obavezni, a adresa i povrsina parcele nam pomazu da brze procenimo
              potencijal lokacije.
            </p>
            <div className="contact-links">
              <a href={`tel:${contactPhone}`}>
                <Phone className="icon-inline" />
                {contactPhone}
              </a>
              <a href={`mailto:${contactEmail}`}>
                <MessageCircle className="icon-inline" />
                {contactEmail}
              </a>
            </div>
          </motion.div>

          <PropertyOfferForm />
        </div>
      </section>

      <section className="page-section page-section--surface">
        <div className="page-container split-grid">
          <motion.div
            className="sticky-copy"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            transition={{ duration: 0.55 }}
          >
            <p className="section-eyebrow">Sta trazimo</p>
            <h2 className="section-title section-title--medium">
              Pretvorite svoj plac u vrednu investiciju.
            </h2>
            <p className="section-copy">
              Najvaznije su nam uredna dokumentacija, dobra pozicija i realna
              mogucnost razvoja stambenog projekta. Ako niste sigurni da li se vasa
              nekretnina uklapa, posaljite podatke i provericemo.
            </p>
            <blockquote>
              Dovoljno je da posaljete osnovne podatke. Prvu procenu radimo
              diskretno i bez obaveze za vlasnika.
            </blockquote>
          </motion.div>

          <div className="info-card-grid">
            {criteria.map(({ icon: Icon, title, text }, index) => (
              <motion.article
                className="info-card"
                key={title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: index * 0.06 }}
                whileHover={{ y: -4 }}
              >
                <span className="icon-bubble">
                  <Icon />
                </span>
                <h3>{title}</h3>
                <p>{text}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="page-section land-process">
        <div className="page-container split-grid split-grid--center">
          <motion.div
            className="dark-process-card"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
            variants={fadeUp}
            transition={{ duration: 0.55 }}
          >
            <div>
              <ClipboardCheck className="icon-inline" />
              <p>Proces</p>
            </div>
            {processSteps.map((step, index) => (
              <div className="process-step" key={step}>
                <span>{index + 1}</span>
                <p>{step}</p>
              </div>
            ))}
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
            variants={fadeUp}
            transition={{ duration: 0.55, delay: 0.08 }}
          >
            <p className="section-eyebrow">Sigurna saradnja</p>
            <h2 className="section-title section-title--medium">
              Brz odgovor, jasna komunikacija i korektan dogovor.
            </h2>
            <p className="section-copy">
              Fokus je na jednostavnom prvom kontaktu: lokacija, povrsina,
              dokumentacija i kratak opis. Nakon toga mozemo brzo da procenimo da li
              postoji osnova za razgovor.
            </p>

            <div className="check-list">
              {preparationItems.map((item) => (
                <p key={item}>
                  <span className="icon-bubble">
                    <Sparkles />
                  </span>
                  {item}
                </p>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
};

const PropertyOfferForm = () => {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const getValue = (name: string) => String(formData.get(name) ?? "").trim();
    const subject = encodeURIComponent("Ponuda placa za M & M Gradnja");
    const body = encodeURIComponent(
      [
        "Nova ponuda nekretnine",
        "",
        `Ime: ${getValue("name")}`,
        `Telefon: ${getValue("phone")}`,
        `E-mail: ${getValue("email")}`,
        `Adresa nekretnine: ${getValue("address") || "-"}`,
        `Povrsina parcele (m2): ${getValue("plotArea") || "-"}`,
        "",
        "Dodatne informacije:",
        getValue("details") || "-",
      ].join("\n"),
    );

    window.location.href = `mailto:${contactEmail}?subject=${subject}&body=${body}`;
  };

  return (
    <motion.form
      className="soft-card inquiry-form"
      onSubmit={handleSubmit}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      variants={fadeUp}
      transition={{ duration: 0.55, delay: 0.08 }}
    >
      <div className="inquiry-form__head">
        <FileText className="icon-inline" />
        <div>
          <strong>Podaci za pocetnu procenu</strong>
          <p>Polja oznacena zvezdicom su obavezna.</p>
        </div>
      </div>

      <div className="inquiry-form__body">
        <div className="form-grid form-grid--two">
          <FormField id="land-name" label="Ime" name="name" required />
          <FormField id="land-phone" label="Telefon" name="phone" type="tel" required />
          <FormField id="land-email" label="E-mail" name="email" type="email" required />
          <FormField id="land-address" label="Adresa nekretnine" name="address" />
          <FormField
            id="land-plot-area"
            label="Povrsina parcele (m2)"
            name="plotArea"
            type="number"
          />
        </div>

        <div className="form-field inquiry-form__textarea">
          <label className="form-label" htmlFor="land-details">
            Dodatne informacije
          </label>
          <textarea
            className="form-textarea"
            id="land-details"
            name="details"
            placeholder="Napisite sta znate o dokumentaciji, pristupu, objektu na placu ili uslovima prodaje."
            rows={6}
          />
        </div>

        <button className="site-button site-button--dark" type="submit">
          <MessageCircle />
          Posaljite podatke
          <ArrowUpRight />
        </button>
      </div>
    </motion.form>
  );
};

type FormFieldProps = {
  id: string;
  label: string;
  name: string;
  required?: boolean;
  type?: string;
};

const FormField = ({ id, label, name, required = false, type = "text" }: FormFieldProps) => {
  return (
    <div className="form-field">
      <label className="form-label" htmlFor={id}>
        {label}
        {required ? " *" : ""}
      </label>
      <input className="form-input" id={id} name={name} required={required} type={type} />
    </div>
  );
};
