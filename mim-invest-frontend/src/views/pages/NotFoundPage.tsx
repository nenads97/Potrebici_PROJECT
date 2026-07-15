import { ArrowUpRight, Building2, Home, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

import { ContactModalButton } from "../../features/inquiries/components/ContactModal";
import { PageMeta } from "../../shared/components/PageMeta";

const notFoundContactModal = {
  eyebrow: "Pomoć pri izboru",
  title: "Pomozite nam da vas usmerimo",
  description:
    "Ako ste tražili konkretan stan, tlocrt ili informaciju o projektu, pošaljite nam kratak upit i prodajni tim će vas usmeriti na pravi link.",
  inquiryType: "general" as const,
  details: [{ label: "Povod", value: "Nepostojeca stranica" }],
  messagePlaceholder: "Napišite sta ste tražili ili koji stan/projekat vas zanima.",
};

const quickLinks = [
  {
    to: "/projekti/heroja-pinkija-13/ponuda-stanova",
    label: "Ponuda stanova",
    text: "Najbrzi put do dostupnih stanova, kvadratura, statusa i tlocrta.",
    icon: Home,
  },
  {
    to: "/projekti/heroja-pinkija-13/o-projektu",
    label: "O projektu",
    text: "Pregled lokacije, rokova, strukture objekta i statusa radova.",
    icon: Building2,
  },
];

export const NotFoundPage = () => {
  return (
    <main className="not-found-page not-found-page--public">
      <PageMeta
        title="Stranica nije pronadjena | M & M Gradnja"
        description="Stranica koju tražite nije pronadjena. Pogledajte ponudu stanova Heroja Pinkija 13 ili pošaljite upit prodaji."
        canonicalPath="/"
        robots="noindex,follow"
      />
      <section className="soft-card not-found-page__card not-found-page__card--wide">
        <p className="section-eyebrow">404</p>
        <h1>Stranica nije pronadjena.</h1>
        <p>
          Link je mozda promenjen ili vise nije aktivan. Ako tražite stan u projektu
          Heroja Pinkija 13, najkorisnije je da krenete od aktuelne ponude.
        </p>

        <div className="not-found-page__actions" aria-label="Predlozene akcije">
          <Link className="site-button site-button--accent" to="/projekti/heroja-pinkija-13/ponuda-stanova">
            <Home />
            Pogledajte stanove
          </Link>
          <ContactModalButton
            className="site-button site-button--outline"
            modalOptions={notFoundContactModal}
          >
            <MessageCircle />
            Pišite nam
          </ContactModalButton>
        </div>

        <div className="not-found-page__links">
          {quickLinks.map(({ icon: Icon, label, text, to }) => (
            <Link key={to} to={to}>
              <Icon />
              <span>
                <strong>{label}</strong>
                <small>{text}</small>
              </span>
              <ArrowUpRight />
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
};
