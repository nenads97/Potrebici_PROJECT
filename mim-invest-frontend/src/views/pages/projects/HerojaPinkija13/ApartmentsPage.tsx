import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Building2,
  Download,
  Home,
  Layers3,
  MapPin,
  MessageCircle,
  Printer,
} from "lucide-react";
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
import { createPublicUrl } from "../../../../shared/config/site";

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
  const listingContactModal = useMemo(
    () => ({
      ...availabilityContactModal,
      details: [
        { label: "Projekat", value: "Heroja Pinkija 13" },
        { label: "Ponuda", value: `${availableApartments.length} stanova` },
      ],
    }),
    [availableApartments.length],
  );

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
        canonicalPath={
          isTableView
            ? "/projekti/heroja-pinkija-13/spisak-stanova"
            : "/projekti/heroja-pinkija-13/ponuda-stanova"
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
                modalOptions={listingContactModal}
              >
                <MessageCircle />
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
              <dd>{availableApartments.length} stanova</dd>
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
              modalOptions={listingContactModal}
            >
              <MessageCircle />
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
  const [floorFilter, setFloorFilter] = useState("all");
  const [roomFilter, setRoomFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | Apartment["status"]>("all");

  const floorOptions = useMemo(
    () =>
      Array.from(new Set(apartments.map((apartment) => apartment.floor))).sort(
        (firstFloor, secondFloor) => getSortNumber(firstFloor) - getSortNumber(secondFloor),
      ),
    [apartments],
  );
  const roomOptions = useMemo(
    () => Array.from(new Set(apartments.map((apartment) => apartment.rooms))).sort(),
    [apartments],
  );
  const statusOptions = useMemo(
    () => Array.from(new Set(apartments.map((apartment) => apartment.status))),
    [apartments],
  );
  const filteredApartments = useMemo(
    () =>
      apartments
        .filter((apartment) => floorFilter === "all" || apartment.floor === floorFilter)
        .filter((apartment) => roomFilter === "all" || apartment.rooms === roomFilter)
        .filter((apartment) => statusFilter === "all" || apartment.status === statusFilter)
        .sort(
          (firstApartment, secondApartment) =>
            Number(firstApartment.number) - Number(secondApartment.number),
        ),
    [apartments, floorFilter, roomFilter, statusFilter],
  );
  const hasActiveFilters =
    floorFilter !== "all" || roomFilter !== "all" || statusFilter !== "all";

  const clearFilters = () => {
    setFloorFilter("all");
    setRoomFilter("all");
    setStatusFilter("all");
  };

  const printFilteredList = () => {
    window.print();
  };

  const downloadFilteredList = () => {
    downloadApartmentsCsv(filteredApartments);
  };

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

        <div className="apartments-table-filters" aria-label="Filteri tabelarnog spiska stanova">
          <label>
            <span>Sprat</span>
            <select value={floorFilter} onChange={(event) => setFloorFilter(event.target.value)}>
              <option value="all">Svi spratovi</option>
              {floorOptions.map((floor) => (
                <option key={floor} value={floor}>
                  {floor}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Struktura</span>
            <select value={roomFilter} onChange={(event) => setRoomFilter(event.target.value)}>
              <option value="all">Sve strukture</option>
              {roomOptions.map((rooms) => (
                <option key={rooms} value={rooms}>
                  {rooms}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Status</span>
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as "all" | Apartment["status"])
              }
            >
              <option value="all">Svi statusi</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {statusLabel[status]}
                </option>
              ))}
            </select>
          </label>

          <div className="apartments-table-filters__summary">
            <span>
              {filteredApartments.length} od {apartments.length} stanova
            </span>
            <button type="button" onClick={clearFilters} disabled={!hasActiveFilters}>
              Ponisti filtere
            </button>
          </div>
        </div>

        <div className="apartments-table-actions" aria-label="Akcije za tabelarni spisak stanova">
          <p>Akcije koriste trenutno izabrane filtere.</p>
          <div>
            <button type="button" onClick={printFilteredList} disabled={filteredApartments.length === 0}>
              <Printer />
              Stampaj spisak
            </button>
            <button type="button" onClick={downloadFilteredList} disabled={filteredApartments.length === 0}>
              <Download />
              Preuzmi CSV
            </button>
          </div>
        </div>

        <div className="apartments-table-wrap" role="region" aria-label="Tabelarni spisak stanova">
          {filteredApartments.length > 0 ? (
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
                {filteredApartments.map((apartment) => (
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
          ) : (
            <div className="apartments-table-empty" role="status">
              <strong>Nema stanova za izabrane filtere.</strong>
              <p>Promenite kriterijume ili ponistite filtere za kompletan spisak.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

function getSortNumber(value: string) {
  return Number(value.match(/\d+/)?.[0] ?? 0);
}

function downloadApartmentsCsv(items: Apartment[]) {
  const headers = ["Stan", "Sprat", "Povrsina", "Struktura", "Status", "Detalji"];
  const rows = items.map((apartment) => [
    `Stan ${apartment.number}`,
    apartment.floor,
    apartment.size,
    apartment.rooms,
    statusLabel[apartment.status],
    createPublicUrl(`/projekti/heroja-pinkija-13/ponuda-stanova/${apartment.number}`),
  ]);
  const csv = [headers, ...rows]
    .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))
    .join("\r\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `heroja-pinkija-13-spisak-stanova-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
