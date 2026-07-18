import { useEffect, useMemo, useRef } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BedDouble,
  Building2,
  Layers3,
  Ruler,
  X,
} from "lucide-react";
import { Link, useLocation, useSearchParams } from "react-router-dom";

import { ContactModalButton } from "../../inquiries/components/ContactModal";
import {
  apartmentTypeGroups,
  getUnitDisplayName,
  getUnitLabel,
  getUnitRouteSegment,
  getUnitSortOrder,
  statusLabel,
  statusVariant,
} from "../data/herojaPinkija13.data";
import type { ApartmentTypeKey } from "../data/herojaPinkija13.data";
import type { Apartment, ApartmentStatus } from "../types/project.types";

type ApartmentAvailabilityProps = {
  apartments: Apartment[];
  compactHeading?: boolean;
};

type StatusFilter = "All" | ApartmentStatus;
type StructureFilter = "All" | "Garsonjera" | "Dvosoban" | "Trosoban";
type ApartmentTypeFilter = "All" | ApartmentTypeKey;
type UnitTypeFilter = "All" | "apartment" | "commercial_space";

const apartmentsPerPage = 6;

const statusTabs: Array<{ label: string; value: StatusFilter }> = [
  { label: "Sve jedinice", value: "All" },
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

const matchesStructureFilter = (
  apartment: Apartment,
  structure: StructureFilter,
) => {
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

const unitTypeTabs: Array<{ label: string; value: UnitTypeFilter }> = [
  { label: "Sve jedinice", value: "All" },
  { label: "Stanovi", value: "apartment" },
  { label: "Lokali", value: "commercial_space" },
];

const unitTypeQueryMap: Record<Exclude<UnitTypeFilter, "All">, string> = {
  apartment: "stanovi",
  commercial_space: "lokali",
};

const getStatusFromQuery = (value: string | null): StatusFilter => {
  const match = Object.entries(statusQueryMap).find(
    ([, queryValue]) => queryValue === value,
  );
  return (match?.[0] as StatusFilter | undefined) ?? "All";
};

const getStructureFromQuery = (value: string | null): StructureFilter => {
  const match = Object.entries(structureQueryMap).find(
    ([, queryValue]) => queryValue === value,
  );
  return (match?.[0] as StructureFilter | undefined) ?? "All";
};

const getUnitTypeFromQuery = (value: string | null): UnitTypeFilter => {
  const match = Object.entries(unitTypeQueryMap).find(
    ([, queryValue]) => queryValue === value,
  );
  return (match?.[0] as UnitTypeFilter | undefined) ?? "All";
};

const getApartmentTypeFromQuery = (
  value: string | null,
): ApartmentTypeFilter => {
  return apartmentTypeGroups.some((group) => group.key === value)
    ? (value as ApartmentTypeKey)
    : "All";
};

export const ApartmentAvailability = ({
  apartments,
  compactHeading = false,
}: ApartmentAvailabilityProps) => {
  const { hash } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const resultsHeadingRef = useRef<HTMLHeadingElement>(null);
  const status = getStatusFromQuery(searchParams.get("status"));
  const structure = getStructureFromQuery(searchParams.get("structure"));
  const apartmentType = getApartmentTypeFromQuery(searchParams.get("tip"));
  const unitType = getUnitTypeFromQuery(searchParams.get("vrsta"));

  const filteredApartments = useMemo(() => {
    return apartments
      .filter((apartment) => {
        const matchesStatus = status === "All" || apartment.status === status;
        const matchesStructure = matchesStructureFilter(apartment, structure);
        const matchesApartmentType =
          apartmentType === "All" ||
          apartmentTypeGroups.some(
            (group) =>
              group.key === apartmentType &&
              group.numbers.includes(apartment.number),
          );
        const matchesUnitType =
          unitType === "All" || (apartment.unitType ?? "apartment") === unitType;

        return (
          matchesStatus &&
          matchesStructure &&
          matchesApartmentType &&
          matchesUnitType
        );
      })
      .sort(
        (firstApartment, secondApartment) =>
          getUnitSortOrder(firstApartment) - getUnitSortOrder(secondApartment),
      );
  }, [apartments, apartmentType, status, structure, unitType]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredApartments.length / apartmentsPerPage),
  );
  const requestedPage = Number.parseInt(searchParams.get("page") ?? "1", 10);
  const currentPage = Number.isFinite(requestedPage)
    ? Math.min(Math.max(requestedPage, 1), totalPages)
    : 1;
  const firstResultIndex = (currentPage - 1) * apartmentsPerPage;
  const paginatedApartments = filteredApartments.slice(
    firstResultIndex,
    firstResultIndex + apartmentsPerPage,
  );

  useEffect(() => {
    if (hash !== "#stanovi-rezultati") {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      const target = document.getElementById("stanovi-rezultati");

      if (!target) {
        return;
      }

      const header = document.querySelector<HTMLElement>(".site-header");
      const headerOffset = header?.getBoundingClientRect().height ?? 0;
      const targetTop =
        window.scrollY + target.getBoundingClientRect().top - headerOffset - 28;

      window.scrollTo({
        top: Math.max(0, targetTop),
        left: 0,
        behavior: "auto",
      });
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [hash]);

  const firstVisibleResult =
    filteredApartments.length === 0 ? 0 : firstResultIndex + 1;
  const lastVisibleResult = Math.min(
    firstResultIndex + apartmentsPerPage,
    filteredApartments.length,
  );
  const hasActiveFilters =
    status !== "All" ||
    structure !== "All" ||
    apartmentType !== "All" ||
    unitType !== "All";

  const updateSearchParams = ({
    nextStatus = status,
    nextStructure = structure,
    nextApartmentType = apartmentType,
    nextUnitType = unitType,
    nextPage = 1,
  }: {
    nextStatus?: StatusFilter;
    nextStructure?: StructureFilter;
    nextApartmentType?: ApartmentTypeFilter;
    nextUnitType?: UnitTypeFilter;
    nextPage?: number;
  }) => {
    const nextParams = new URLSearchParams();

    if (nextStatus !== "All") {
      nextParams.set("status", statusQueryMap[nextStatus]);
    }

    if (nextStructure !== "All") {
      nextParams.set("structure", structureQueryMap[nextStructure]);
    }

    if (nextApartmentType !== "All") {
      nextParams.set("tip", nextApartmentType);
    }

    if (nextUnitType !== "All") {
      nextParams.set("vrsta", unitTypeQueryMap[nextUnitType]);
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
    <section
      className="page-section page-section--surface apartments-section"
      id="stanovi"
      data-agent-surface="apartment-offer"
      aria-labelledby="apartments-offer-title"
    >
      <div className="page-container">
        <div className="split-grid split-grid--end apartments-section__heading">
          <div>
            <p className="section-eyebrow">Ponuda stanova i lokala</p>
            <h2 className="section-title section-title--medium" id="apartments-offer-title">
              {compactHeading
                ? "Pregled jedinica po spratu i tipu."
                : "Dostupnost po spratu i tipu jedinice."}
            </h2>
          </div>
          <p className="section-copy">
            Stanovi su organizovani po pet na etaži, a lokali su u prizemlju.
            Uporedite kvadraturu, strukturu i trenutni status u istom pregledu.
          </p>
        </div>

        <div className="apartments-filters" aria-label="Filtriranje ponude" data-agent-surface="apartment-filters">
          <div className="apartments-filter-group apartments-filter-group--unit-type" role="group" aria-labelledby="filter-unit-type-label">
            <p id="filter-unit-type-label">Vrsta jedinice</p>
            <div className="apartments-filter-group__options">
              {unitTypeTabs.map((tab) => (
                <button
                  aria-pressed={unitType === tab.value}
                  aria-controls="stanovi-rezultati"
                  data-agent-filter="unit-type"
                  data-filter-value={tab.value}
                  className={unitType === tab.value ? "is-active" : ""}
                  key={tab.value}
                  onClick={() =>
                    updateSearchParams({
                      nextUnitType: tab.value,
                      nextStatus: "All",
                      nextStructure: "All",
                      nextApartmentType: "All",
                    })
                  }
                  type="button"
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="apartments-filter-group" role="group" aria-labelledby="filter-status-label">
            <p id="filter-status-label">Dostupnost</p>
            <div className="apartments-filter-group__options">
              {statusTabs.map((tab) => (
                <button
                  aria-pressed={status === tab.value}
                  aria-controls="stanovi-rezultati"
                  data-agent-filter="availability"
                  data-filter-value={tab.value}
                  className={status === tab.value ? "is-active" : ""}
                  key={tab.value}
                  onClick={() =>
                    updateSearchParams({
                      nextStatus: tab.value,
                      nextApartmentType: "All",
                    })
                  }
                  type="button"
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="apartments-filter-group" role="group" aria-labelledby="filter-structure-label">
            <p id="filter-structure-label">Struktura</p>
            <div className="apartments-filter-group__options">
              {structureTabs.map((tab) => (
                <button
                  aria-pressed={structure === tab.value}
                  aria-controls="stanovi-rezultati"
                  data-agent-filter="structure"
                  data-filter-value={tab.value}
                  className={structure === tab.value ? "is-active" : ""}
                  key={tab.value}
                  onClick={() =>
                    updateSearchParams({
                      nextStructure: tab.value,
                      nextApartmentType: "All",
                    })
                  }
                  type="button"
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="apartments-filter-group apartments-filter-group--type" role="group" aria-labelledby="filter-apartment-type-label">
            <p id="filter-apartment-type-label">Tip stana</p>
            <div className="apartments-filter-group__options">
              <button
                aria-pressed={apartmentType === "All"}
                aria-controls="stanovi-rezultati"
                data-agent-filter="apartment-type"
                data-filter-value="All"
                className={apartmentType === "All" ? "is-active" : ""}
                onClick={() => updateSearchParams({ nextApartmentType: "All" })}
                type="button"
              >
                Svi tipovi
              </button>
              {apartmentTypeGroups.map((group) => (
                <button
                  aria-pressed={apartmentType === group.key}
                  aria-controls="stanovi-rezultati"
                  data-agent-filter="apartment-type"
                  data-filter-value={group.key}
                  className={apartmentType === group.key ? "is-active" : ""}
                  key={group.key}
                  onClick={() =>
                    updateSearchParams({
                      nextApartmentType: group.key,
                      nextStatus: "All",
                      nextStructure: "All",
                      nextUnitType: "apartment",
                    })
                  }
                  type="button"
                >
                  {group.label}
                </button>
              ))}
            </div>
          </div>

          {hasActiveFilters ? (
            <button
              className="apartments-filters__reset"
              type="button"
              aria-controls="stanovi-rezultati"
              data-agent-action="reset-apartment-filters"
              onClick={resetFilters}
            >
              <X />
              Poništite filtere
            </button>
          ) : null}
        </div>

        <div className="apartments-results-bar">
          <h3 ref={resultsHeadingRef} tabIndex={-1}>
            {filteredApartments.length === 0
              ? "Nema rezultata"
              : `Prikazano ${firstVisibleResult}–${lastVisibleResult} od ${filteredApartments.length} jedinica`}
          </h3>
          <span aria-live="polite" className="sr-only">
            {filteredApartments.length === 0
              ? "Nema jedinica za izabrane filtere."
              : `Prikazane jedinice ${firstVisibleResult} do ${lastVisibleResult} od ukupno ${filteredApartments.length}.`}
          </span>
          <Link to="/projekti/heroja-pinkija-13/spisak-stanova">
            Tabelarni spisak
            <ArrowRight />
          </Link>
        </div>

        <div className="apartments-grid" id="stanovi-rezultati" data-agent-surface="apartment-results">
          {paginatedApartments.map((apartment) => (
            <Link
              aria-label={`Detalji za ${getUnitDisplayName(apartment)}`}
              className="apartment-card"
              data-agent-entity="unit"
              data-unit-number={apartment.number}
              data-unit-type={getUnitLabel(apartment)}
              key={apartment.slug ?? apartment.number}
              to={`/projekti/heroja-pinkija-13/ponuda-stanova/${getUnitRouteSegment(apartment)}`}
            >
              <div className="apartment-card__image apartment-card__image--floor-plan">
                <img
                  src={apartment.heroFloorPlan.src}
                  alt={apartment.heroFloorPlan.alt}
                  loading="lazy"
                />
                <span
                  className={`status-badge status-badge--${statusVariant[apartment.status]}`}
                >
                  {statusLabel[apartment.status]}
                </span>
              </div>

              <div className="apartment-card__body">
                <div className="apartment-card__title">
                  <div>
                    <span>
                      {getUnitLabel(apartment) === "Lokal"
                        ? "Broj lokala"
                        : "Broj stana"}
                    </span>
                    <h3>
                      {getUnitLabel(apartment) === "Lokal"
                        ? getUnitDisplayName(apartment)
                        : apartment.number}
                    </h3>
                  </div>
                </div>

                <div className="apartment-card__facts">
                  <ApartmentFact
                    icon={Layers3}
                    label="Sprat"
                    value={apartment.floor}
                  />
                  <ApartmentFact
                    icon={Ruler}
                    label="Površina"
                    value={apartment.size}
                  />
                  <ApartmentFact
                    icon={
                      getUnitLabel(apartment) === "Lokal" ? Building2 : BedDouble
                    }
                    label={
                      getUnitLabel(apartment) === "Lokal"
                        ? "Namena"
                        : "Struktura"
                    }
                    value={apartment.rooms}
                  />
                </div>

                <span className="apartment-card__cta">
                  Detalji {getUnitLabel(apartment).toLowerCase()}
                </span>
              </div>
            </Link>
          ))}
        </div>

        {filteredApartments.length === 0 ? (
          <div className="apartments-empty">
            <div>
              <h3>Nema jedinica za izabrane filtere.</h3>
              <p>
                Promenite filtere ili ih poništite da biste videli druge
                jedinice.
              </p>
            </div>
            <div className="apartments-empty__actions">
              <button
                className="site-button site-button--dark"
                type="button"
                onClick={resetFilters}
              >
                <X />
                Poništite filtere
              </button>
              <ContactModalButton
                className="site-button site-button--outline"
                modalOptions={{
                  eyebrow: "Ponuda stanova i lokala",
                  title: "Pišite nam za pomoć pri izboru",
                  description:
                    "Ako trenutni filter nema rezultata, pošaljite nam sta tražite i proverićemo koje jedinice mogu da vam odgovaraju.",
                  inquiryType: "availability",
                  details: [{ label: "Projekat", value: "Heroja Pinkija 13" }],
                  messagePlaceholder:
                    "Napišite zeljenu strukturu, kvadraturu, sprat ili budzet.",
                }}
              >
                Pišite nam
              </ContactModalButton>
            </div>
          </div>
        ) : null}

        {filteredApartments.length > apartmentsPerPage ? (
          <nav
            className="apartments-pagination"
            aria-label="Paginacija ponude"
          >
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => changePage(currentPage - 1)}
            >
              <ArrowLeft />
              <span>Prethodna</span>
            </button>

            <div className="apartments-pagination__pages">
              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (page) => (
                  <button
                    aria-current={page === currentPage ? "page" : undefined}
                    className={page === currentPage ? "is-active" : ""}
                    key={page}
                    type="button"
                    onClick={() => changePage(page)}
                  >
                    {page}
                  </button>
                ),
              )}
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
