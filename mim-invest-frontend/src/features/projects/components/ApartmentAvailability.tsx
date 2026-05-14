import { useMemo, useState } from "react";
import { BedDouble, Layers3, MessageCircle, Ruler, Sun } from "lucide-react";
import { Link } from "react-router-dom";

import {
  contactEmail,
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

const statusTabs: Array<{ label: string; value: StatusFilter }> = [
  { label: "Svi stanovi", value: "All" },
  { label: "Slobodni", value: "Available" },
  { label: "Rezervisani", value: "Reserved" },
  { label: "Prodati", value: "Sold" },
];

export const ApartmentAvailability = ({
  apartments,
  compactHeading = false,
}: ApartmentAvailabilityProps) => {
  const [status, setStatus] = useState<StatusFilter>("All");

  const filteredApartments = useMemo(() => {
    if (status === "All") {
      return apartments;
    }

    return apartments.filter((apartment) => apartment.status === status);
  }, [apartments, status]);

  return (
    <section className="page-section page-section--surface apartments-section" id="stanovi">
      <div className="page-container">
        <div className="split-grid split-grid--end apartments-section__heading">
          <div>
            <p className="section-eyebrow">Ponuda stanova</p>
            <h2 className="section-title section-title--medium">
              {compactHeading
                ? "15 stanova sa ponavljajucim vertikalnim rasporedom."
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

        <div className="apartments-grid">
          {filteredApartments.map((apartment) => (
            <article className="apartment-card" key={apartment.number}>
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
                  <ApartmentFact icon={Sun} label="Orijentacija" value={apartment.orientation} />
                </div>

                <p>{apartment.highlight}</p>

                <div className="apartment-card__actions">
                  <Link
                    className="site-button site-button--accent"
                    to={`/apartmani/${apartment.number}`}
                  >
                    Detalji stana
                  </Link>
                  <a
                    className="site-button site-button--outline"
                    href={`mailto:${contactEmail}?subject=${encodeURIComponent(
                      `Upit za stan ${apartment.number}`,
                    )}`}
                  >
                    <MessageCircle />
                    Pitajte
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>

        {filteredApartments.length === 0 ? (
          <div className="apartments-empty">
            <p>Trenutno nema stanova u ovom statusu.</p>
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
