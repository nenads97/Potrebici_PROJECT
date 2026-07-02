import { useEffect, useState } from "react";
import { ArrowUpRight, Building2, CalendarDays, Home, Layers3, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

import { ContactModalButton } from "../../../../features/inquiries/components/ContactModal";
import { ApartmentAvailability } from "../../../../features/projects/components/ApartmentAvailability";
import {
  apartments,
  statusLabel,
  statusVariant,
} from "../../../../features/projects/data/herojaPinkija13.data";
import { fetchApartments } from "../../../../features/projects/data/projectSupabase.api";
import type { Apartment } from "../../../../features/projects/types/project.types";
import { PageMeta } from "../../../../shared/components/PageMeta";

const availabilityContactModal = {
  eyebrow: "Ponuda stanova",
  title: "Pitajte nas za dostupne stanove",
  description:
    "Ako niste sigurni koji stan vam odgovara, posaljite nam osnovne zahteve. Pomoci cemo vam da uporedite dostupne opcije.",
  inquiryType: "availability" as const,
  details: [
    { label: "Projekat", value: "Heroja Pinkija 13" },
    { label: "Ponuda", value: "15 stanova" },
  ],
  messagePlaceholder: "Napisite zeljenu kvadraturu, strukturu, sprat ili termin za obilazak.",
};

export const ApartmentsPage = () => {
  return <ApartmentsListingContent viewMode="cards" />;
};

export const ApartmentsTablePage = () => {
  return <ApartmentsListingContent viewMode="table" />;
};

type ApartmentsListingContentProps = {
  viewMode: "cards" | "table";
};

const ApartmentsListingContent = ({ viewMode }: ApartmentsListingContentProps) => {
  const [availableApartments, setAvailableApartments] = useState<Apartment[]>(apartments);
  const isTableView = viewMode === "table";

  useEffect(() => {
    let isMounted = true;

    fetchApartments()
      .then((items) => {
        if (isMounted) {
          setAvailableApartments(items);
        }
      })
      .catch(() => {
        if (isMounted) {
          setAvailableApartments(apartments);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="apartments-listing-page">
      <PageMeta
        title={
          isTableView
            ? "Tabelarni spisak stanova | Heroja Pinkija 13"
            : "Ponuda stanova | Heroja Pinkija 13"
        }
        description={
          isTableView
            ? "Brz tabelarni spisak svih stanova u projektu Heroja Pinkija 13 sa spratom, kvadraturom, strukturom i statusom."
            : "Uporedite dostupne stanove u projektu Heroja Pinkija 13 po spratu, kvadraturi, strukturi i statusu."
        }
      />
      <section className="apartments-listing-hero">
        <div className="page-container apartments-listing-hero__grid">
          <div className="apartments-listing-hero__copy fade-up">
            <p className="section-eyebrow">Heroja Pinkija 13</p>
            <h1 className="section-title">
              {isTableView ? "Tabelarni spisak stanova." : "Ponuda stanova."}
            </h1>
            <p className="section-copy section-copy--large">
              {isTableView
                ? "Pregledajte sve stanove u jednom kompaktnom spisku za najbrze poredjenje sprata, kvadrature i statusa."
                : "Uporedite sprat, kvadraturu, strukturu i trenutni status svih 15 stanova u objektu na pocetku Telepa."}
            </p>
            <div className="page-actions">
              <ContactModalButton
                className="site-button site-button--accent"
                modalOptions={availabilityContactModal}
              >
                <CalendarDays />
                Pisite nam
              </ContactModalButton>
              <Link
                className="site-button site-button--outline"
                to={
                  isTableView
                    ? "/projekti/heroja-pinkija-13/ponuda-stanova"
                    : "/projekti/heroja-pinkija-13/o-projektu"
                }
              >
                {isTableView ? <Home /> : <Building2 />}
                {isTableView ? "Karticni pregled" : "Detalji projekta"}
              </Link>
            </div>
          </div>

          <dl className="apartments-listing-hero__facts">
            <div>
              <Home />
              <dt>Ukupna ponuda</dt>
              <dd>15 stanova</dd>
            </div>
            <div>
              <Layers3 />
              <dt>Stambene etaze</dt>
              <dd>3 etaze</dd>
            </div>
            <div>
              <Building2 />
              <dt>Raspored</dt>
              <dd>5 stanova po etazi</dd>
            </div>
            <div>
              <MapPin />
              <dt>Lokacija</dt>
              <dd>Pocetak Telepa</dd>
            </div>
          </dl>
        </div>
      </section>

      {isTableView ? (
        <ApartmentTableSection apartments={availableApartments} />
      ) : (
        <ApartmentAvailability apartments={availableApartments} compactHeading />
      )}

      <section className="apartments-listing-cta">
        <div className="page-container apartments-listing-cta__inner">
          <div>
            <p className="section-eyebrow">Pomoc pri izboru</p>
            <h2>Niste sigurni koji stan najbolje odgovara vasim potrebama?</h2>
            <p>
              Prodajni tim moze vam pomoci da uporedite rasporede, kvadrature i
              aktuelnu dostupnost.
            </p>
          </div>
          <div className="apartments-listing-cta__actions">
            <ContactModalButton
              className="site-button site-button--dark"
              modalOptions={availabilityContactModal}
            >
              <CalendarDays />
              Pisite nam
            </ContactModalButton>
            <Link
              className="apartments-listing-cta__link"
              to={
                isTableView
                  ? "/projekti/heroja-pinkija-13/ponuda-stanova"
                  : "/projekti/heroja-pinkija-13/spisak-stanova"
              }
            >
              {isTableView ? "Karticni pregled" : "Spisak stanova"}
              <ArrowUpRight />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

const ApartmentTableSection = ({ apartments }: { apartments: Apartment[] }) => {
  const sortedApartments = [...apartments].sort(
    (firstApartment, secondApartment) =>
      Number(firstApartment.number) - Number(secondApartment.number),
  );

  return (
    <section className="page-section page-section--surface apartments-table-section">
      <div className="page-container">
        <div className="split-grid split-grid--end apartments-table-section__heading">
          <div>
            <p className="section-eyebrow">Tabelarni pregled</p>
            <h2 className="section-title section-title--medium">
              Svi stanovi u jednom spisku.
            </h2>
          </div>
          <p className="section-copy">
            Tabela je namenjena brzom poredjenju. Za tlocrt, opis i slanje upita
            otvorite detalje konkretnog stana.
          </p>
        </div>

        <div className="apartments-table-wrap" role="region" aria-label="Tabelarni spisak stanova">
          <table className="apartments-table">
            <thead>
              <tr>
                <th>Stan</th>
                <th>Sprat</th>
                <th>Povrsina</th>
                <th>Struktura</th>
                <th>Status</th>
                <th>Detalji</th>
              </tr>
            </thead>
            <tbody>
              {sortedApartments.map((apartment) => (
                <tr key={apartment.number}>
                  <td data-label="Stan">
                    <strong>Stan {apartment.number}</strong>
                  </td>
                  <td data-label="Sprat">{apartment.floor}</td>
                  <td data-label="Povrsina">{apartment.size}</td>
                  <td data-label="Struktura">{apartment.rooms}</td>
                  <td data-label="Status">
                    <span className={`status-badge status-badge--${statusVariant[apartment.status]}`}>
                      {statusLabel[apartment.status]}
                    </span>
                  </td>
                  <td data-label="Detalji">
                    <Link
                      className="apartments-table__link"
                      to={`/projekti/heroja-pinkija-13/ponuda-stanova/${apartment.number}`}
                    >
                      Otvori stan
                      <ArrowUpRight />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
