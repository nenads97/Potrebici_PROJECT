import { useMemo, useRef } from "react";
import { ArrowLeft, ArrowRight, BedDouble, Layers3, RotateCcw, Ruler } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

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

const apartmentsPerPage = 6;

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

const statusQueryMap: Record<Exclude<StatusFilter, "All">, string> = {
  Available: "available",
  Reserved: "reserved",
  Sold: "sold",
};

const structureQueryMap: Record<Exclude<StructureFilter, "All">, string> = {
  Garsonjera: "garsonjera",
  Dvosoban: "dvosoban",
  Trosoban: "trosoban",
};

const getStatusFromQuery = (value: string | null): StatusFilter => {
  const match = Object.entries(statusQueryMap).find(([, queryValue]) => queryValue === value);
  return (match?.[0] as StatusFilter | undefined) ?? "All";
};

const getStructureFromQuery = (value: string | null): StructureFilter => {
  const match = Object.entries(structureQueryMap).find(([, queryValue]) => queryValue === value);
  return (match?.[0] as StructureFilter | undefined) ?? "All";
};

export const ApartmentAvailability = ({
  apartments,
  compactHeading = false,
}: ApartmentAvailabilityProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const resultsHeadingRef = useRef<HTMLHeadingElement>(null);
  const status = getStatusFromQuery(searchParams.get("status"));
  const structure = getStructureFromQuery(searchParams.get("structure"));

  const filteredApartments = useMemo(() => {
    return apartments
      .filter((apartment) => {
        const matchesStatus = status === "All" || apartment.status === status;
        const matchesStructure = matchesStructureFilter(apartment, structure);

        return matchesStatus && matchesStructure;
      })
      .sort((firstApartment, secondApartment) => Number(firstApartment.number) - Number(secondApartment.number));
  }, [apartments, status, structure]);

  const totalPages = Math.max(1, Math.ceil(filteredApartments.length / apartmentsPerPage));
  const requestedPage = Number.parseInt(searchParams.get("page") ?? "1", 10);
  const currentPage = Number.isFinite(requestedPage)
    ? Math.min(Math.max(requestedPage, 1), totalPages)
    : 1;
  const firstResultIndex = (currentPage - 1) * apartmentsPerPage;
  const paginatedApartments = filteredApartments.slice(
    firstResultIndex,
    firstResultIndex + apartmentsPerPage,
  );
  const firstVisibleResult = filteredApartments.length === 0 ? 0 : firstResultIndex + 1;
  const lastVisibleResult = Math.min(
    firstResultIndex + apartmentsPerPage,
    filteredApartments.length,
  );
  const hasActiveFilters = status !== "All" || structure !== "All";

  const updateSearchParams = ({
    nextStatus = status,
    nextStructure = structure,
    nextPage = 1,
  }: {
    nextStatus?: StatusFilter;
    nextStructure?: StructureFilter;
    nextPage?: number;
  }) => {
    const nextParams = new URLSearchParams();

    if (nextStatus !== "All") {
      nextParams.set("status", statusQueryMap[nextStatus]);
    }

    if (nextStructure !== "All") {
      nextParams.set("structure", structureQueryMap[nextStructure]);
    }

    if (nextPage > 1) {
      nextParams.set("page", String(nextPage));
    }

    setSearchParams(nextParams);
  };

  const focusResults = () => {
    window.requestAnimationFrame(() => {
      resultsHeadingRef.current?.focus({ preventScroll: true });
      resultsHeadingRef.current?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "start",
      });
    });
  };

  const changePage = (nextPage: number) => {
    updateSearchParams({ nextPage });
    focusResults();
  };

  const resetFilters = () => {
    setSearchParams(new URLSearchParams());
    focusResults();
  };

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

        <div className="apartments-filters" aria-label="Filtriranje stanova">
          <div className="apartments-filter-group">
            <p>Dostupnost</p>
            <div className="apartments-filter-group__options">
              {statusTabs.map((tab) => (
                <button
                  aria-pressed={status === tab.value}
                  className={status === tab.value ? "is-active" : ""}
                  key={tab.value}
                  onClick={() => updateSearchParams({ nextStatus: tab.value })}
                  type="button"
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="apartments-filter-group">
            <p>Struktura</p>
            <div className="apartments-filter-group__options">
              {structureTabs.map((tab) => (
                <button
                  aria-pressed={structure === tab.value}
                  className={structure === tab.value ? "is-active" : ""}
                  key={tab.value}
                  onClick={() => updateSearchParams({ nextStructure: tab.value })}
                  type="button"
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {hasActiveFilters ? (
            <button className="apartments-filters__reset" type="button" onClick={resetFilters}>
              <RotateCcw />
              Ponistite filtere
            </button>
          ) : null}
        </div>

        <div className="apartments-results-bar">
          <h3 ref={resultsHeadingRef} tabIndex={-1}>
            {filteredApartments.length === 0
              ? "Nema rezultata"
              : `Prikazano ${firstVisibleResult}–${lastVisibleResult} od ${filteredApartments.length} stanova`}
          </h3>
          <span aria-live="polite" className="sr-only">
            {filteredApartments.length === 0
              ? "Nema stanova za izabrane filtere."
              : `Prikazani stanovi ${firstVisibleResult} do ${lastVisibleResult} od ukupno ${filteredApartments.length}.`}
          </span>
          <Link to="/projekti/heroja-pinkija-13/spisak-stanova">
            Tabelarni spisak
            <ArrowRight />
          </Link>
        </div>

        <div className="apartments-grid">
          {paginatedApartments.map((apartment) => (
            <Link
              aria-label={`Detalji stana ${apartment.number}`}
              className="apartment-card"
              key={apartment.number}
              to={`/projekti/heroja-pinkija-13/ponuda-stanova/${apartment.number}`}
            >
              <div className="apartment-card__image apartment-card__image--floor-plan">
                <img
                  src={apartment.heroFloorPlan.src}
                  alt={apartment.heroFloorPlan.alt}
                  loading="lazy"
                />
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
            <div>
              <h3>Nema stanova za izabrane filtere.</h3>
              <p>Promenite strukturu ili dostupnost da biste videli druge jedinice.</p>
            </div>
            <div className="apartments-empty__actions">
              <button className="site-button site-button--dark" type="button" onClick={resetFilters}>
                <RotateCcw />
                Ponistite filtere
              </button>
              <a className="site-button site-button--outline" href={`tel:${contactPhone}`}>
                Pozovite prodaju
              </a>
            </div>
          </div>
        ) : null}

        {filteredApartments.length > apartmentsPerPage ? (
          <nav className="apartments-pagination" aria-label="Paginacija stanova">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => changePage(currentPage - 1)}
            >
              <ArrowLeft />
              <span>Prethodna</span>
            </button>

            <div className="apartments-pagination__pages">
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                <button
                  aria-current={page === currentPage ? "page" : undefined}
                  className={page === currentPage ? "is-active" : ""}
                  key={page}
                  type="button"
                  onClick={() => changePage(page)}
                >
                  {page}
                </button>
              ))}
            </div>

            <span className="apartments-pagination__mobile-status">
              Stranica {currentPage} od {totalPages}
            </span>

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => changePage(currentPage + 1)}
            >
              <span>Sledeca</span>
              <ArrowRight />
            </button>
          </nav>
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
