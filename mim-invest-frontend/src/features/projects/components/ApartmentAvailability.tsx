import { useMemo, useState } from "react";
import { BedDouble, Layers3, Ruler } from "lucide-react";
import { Link } from "react-router-dom";

import {
  contactPhone,
  statusLabel,
  statusVariant,
} from "../data/herojaPinkija13.data";
import type { Apartment, ApartmentStatus } from "../types/project.types";

type ApartmentAvailabilityProps = {
  apartments: Apartment[];
  compactHeading?: boolean;
};

type StatusFilter = "All" | ApartmentStatus;
type StructureFilter = "All" | "Garsonjera" | "Dvosoban" | "Trosoban";

const statusTabs: Array<{ label: string; value: StatusFilter }> = [
  { label: "Svi stanovi", value: "All" },
  { label: "Slobodni", value: "Available" },
  { label: "Rezervisani", value: "Reserved" },
  { label: "Prodati", value: "Sold" },
];

const structureTabs: Array<{ label: string; value: StructureFilter }> = [
  { label: "Sve strukture", value: "All" },
  { label: "Garsonjera", value: "Garsonjera" },
  { label: "Dvosoban", value: "Dvosoban" },
  { label: "Trosoban", value: "Trosoban" },
];

const matchesStructureFilter = (apartment: Apartment, structure: StructureFilter) => {
  if (structure === "All") {
    return true;
  }

  return apartment.rooms === structure;
};

export const ApartmentAvailability = ({
  apartments,
  compactHeading = false,
}: ApartmentAvailabilityProps) => {
  const [status, setStatus] = useState<StatusFilter>("All");
  const [structure, setStructure] = useState<StructureFilter>("All");

  const filteredApartments = useMemo(() => {
    return apartments
      .filter((apartment) => {
        const matchesStatus = status === "All" || apartment.status === status;
        const matchesStructure = matchesStructureFilter(apartment, structure);

        return matchesStatus && matchesStructure;
      })
      .sort((firstApartment, secondApartment) => Number(firstApartment.number) - Number(secondApartment.number));
  }, [apartments, status, structure]);

  return (
    <section className="page-section page-section--surface apartments-section" id="stanovi">
      <div className="page-container">
        <div className="split-grid split-grid--end apartments-section__heading">
          <div>
            <p className="section-eyebrow">Ponuda stanova</p>
            <h2 className="section-title section-title--medium">
              {compactHeading
                ? "Pregled stanova po spratu i strukturi."
                : "Dostupnost po spratu i strukturi."}
            </h2>
          </div>
          <p className="section-copy">
            Stanovi su organizovani po pet na etazi. Isti tipovi se ponavljaju kroz
            vertikalu, pa je lako uporediti sprat, kvadraturu i strukturu.
          </p>
        </div>

        <div className="portfolio-tabs apartments-section__tabs" role="tablist">
          {statusTabs.map((tab) => (
            <button
              aria-selected={status === tab.value}
              className={status === tab.value ? "is-active" : ""}
              key={tab.value}
              onClick={() => setStatus(tab.value)}
              role="tab"
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div
          className="portfolio-tabs apartments-section__tabs"
          role="tablist"
        >
          {structureTabs.map((tab) => (
            <button
              aria-selected={structure === tab.value}
              className={structure === tab.value ? "is-active" : ""}
              key={tab.value}
              onClick={() => setStructure(tab.value)}
              role="tab"
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="apartments-grid">
          {filteredApartments.map((apartment) => (
            <Link
              aria-label={`Detalji stana ${apartment.number}`}
              className="apartment-card"
              key={apartment.number}
              to={`/apartmani/${apartment.number}`}
            >
              <div className="apartment-card__image">
                <img src={apartment.images[0].src} alt={apartment.images[0].alt} />
                <span className={`status-badge status-badge--${statusVariant[apartment.status]}`}>
                  {statusLabel[apartment.status]}
                </span>
              </div>

              <div className="apartment-card__body">
                <div className="apartment-card__title">
                  <div>
                    <span>Broj stana</span>
                    <h3>{apartment.number}</h3>
                  </div>
                </div>

                <div className="apartment-card__facts">
                  <ApartmentFact icon={Layers3} label="Sprat" value={apartment.floor} />
                  <ApartmentFact icon={Ruler} label="Povrsina" value={apartment.size} />
                  <ApartmentFact icon={BedDouble} label="Struktura" value={apartment.rooms} />
                </div>

                <span className="apartment-card__cta">Detalji stana</span>
              </div>
            </Link>
          ))}
        </div>

        {filteredApartments.length === 0 ? (
          <div className="apartments-empty">
            <p>Trenutno nema stanova za izabrane filtere.</p>
            <a className="site-button site-button--dark" href={`tel:${contactPhone}`}>
              Pozovite prodaju
            </a>
          </div>
        ) : null}
      </div>
    </section>
  );
};

type ApartmentFactProps = {
  icon: typeof Ruler;
  label: string;
  value: string;
};

const ApartmentFact = ({ icon: Icon, label, value }: ApartmentFactProps) => {
  return (
    <div>
      <span>
        <Icon className="icon-inline" />
        {label}
      </span>
      <strong>{value}</strong>
    </div>
  );
};
