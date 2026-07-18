import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Building2,
  Download,
  FileText,
  Home,
  Layers3,
  Maximize2,
  MapPin,
  MessageCircle,
  Minimize2,
  Printer,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";

import { ContactModalButton } from "../../../../features/inquiries/components/ContactModal";
import { ApartmentAvailability } from "../../../../features/projects/components/ApartmentAvailability";
import {
  apartments,
  getUnitDisplayName,
  getUnitLabel,
  getUnitRouteSegment,
  getUnitSortOrder,
  projectInfo,
  statusLabel,
  statusVariant,
} from "../../../../features/projects/data/herojaPinkija13.data";
import { fetchApartments } from "../../../../features/projects/data/projectSupabase.api";
import type { Apartment } from "../../../../features/projects/types/project.types";
import { PageMeta } from "../../../../shared/components/PageMeta";
import { createPublicUrl } from "../../../../shared/config/site";

const availabilityContactModal = {
  eyebrow: "Ponuda stanova i lokala",
  title: "Pitajte nas za dostupne jedinice",
  description:
    "Ako niste sigurni koja jedinica vam odgovara, pošaljite nam osnovne zahteve. Pomoći ćemo vam da uporedite dostupne opcije.",
  inquiryType: "availability" as const,
  details: [
    { label: "Projekat", value: "Heroja Pinkija 13" },
        { label: "Ponuda", value: "15 stanova i 2 lokala" },
  ],
  messagePlaceholder:
    "Napišite zeljenu kvadraturu, strukturu, sprat ili termin za obilazak.",
};

type ProjectDocument = {
  id: string;
  title: string;
  description: string;
  pageCount: number;
  filePath: string;
};

const projectDocuments: ProjectDocument[] = [
  {
    id: "basic-project-documentation",
    title: "Osnovna dokumentacija projekta",
    description:
      "Sažet pregled objekta sa osnovnim podacima, lokalima, stanovima, garažnim mestima i ostavama.",
    pageCount: 2,
    filePath: "/documents/project/basic-project-documentation.pdf",
  },
  {
    id: "building-floor-plans",
    title: "Skica svih objekata po spratovima",
    description:
      "Kompletan tehnički pregled temelja, podruma, prizemlja, galerije, spratova, krova i izgleda objekta.",
    pageCount: 13,
    filePath: "/documents/project/building-floor-plans.pdf",
  },
  {
    id: "basement-storage-plan",
    title: "Osnova podruma sa ostavama",
    description:
      "Pregled rasporeda garažnih mesta, ostava, komunikacija i prostora u podrumu objekta.",
    pageCount: 1,
    filePath: "/documents/project/basement-storage-plan.pdf",
  },
];

export const ApartmentsPage = () => {
  return <ApartmentsListingContent viewMode="cards" />;
};

export const ApartmentsTablePage = () => {
  return <ApartmentsListingContent viewMode="table" />;
};

type ApartmentsListingContentProps = {
  viewMode: "cards" | "table";
};

const ApartmentsListingContent = ({
  viewMode,
}: ApartmentsListingContentProps) => {
  const [availableApartments, setAvailableApartments] =
    useState<Apartment[]>(apartments);
  const isTableView = viewMode === "table";
  const listingContactModal = useMemo(
    () => ({
      ...availabilityContactModal,
      details: [
        { label: "Projekat", value: "Heroja Pinkija 13" },
        { label: "Ponuda", value: `${availableApartments.length} jedinica` },
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
            ? "Tabelarni spisak stanova i lokala | Heroja Pinkija 13"
            : "Ponuda stanova i lokala | Heroja Pinkija 13"
        }
        description={
          isTableView
            ? "Brz tabelarni spisak stanova i lokala u projektu Heroja Pinkija 13 sa spratom, kvadraturom, namenom i statusom."
            : "Uporedite dostupne stanove i lokale u projektu Heroja Pinkija 13 po spratu, kvadraturi, nameni i statusu."
        }
        canonicalPath={
          isTableView
            ? "/projekti/heroja-pinkija-13/spisak-stanova"
            : "/projekti/heroja-pinkija-13/ponuda-stanova"
        }
        structuredData={({ canonicalUrl, origin }) => ({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: isTableView
            ? "Tabelarni spisak stanova i lokala | Heroja Pinkija 13"
            : "Ponuda stanova i lokala | Heroja Pinkija 13",
          url: canonicalUrl,
          about: {
            "@type": "ApartmentComplex",
            name: projectInfo.name,
            address: `${projectInfo.address}, ${projectInfo.city}`,
          },
          breadcrumb: {
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Početna",
                item: `${origin}/`,
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Heroja Pinkija 13",
                item: `${origin}/projekti/heroja-pinkija-13/o-projektu`,
              },
              {
                "@type": "ListItem",
                position: 3,
                name: isTableView ? "Spisak stanova i lokala" : "Ponuda stanova i lokala",
                item: canonicalUrl,
              },
            ],
          },
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: availableApartments.length,
            itemListElement: availableApartments.map((apartment, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: getUnitDisplayName(apartment),
              url: `${origin}${"/projekti/heroja-pinkija-13/ponuda-stanova"}/${getUnitRouteSegment(apartment)}`,
              item: {
                "@type": "Product",
                name: getUnitDisplayName(apartment),
                category: getUnitLabel(apartment),
                description: apartment.description,
                additionalProperty: [
                  { "@type": "PropertyValue", name: "Sprat", value: apartment.floor },
                  { "@type": "PropertyValue", name: "Površina", value: apartment.size },
                  { "@type": "PropertyValue", name: "Struktura / namena", value: apartment.rooms },
                ],
                offers: {
                  "@type": "Offer",
                  availability: getSchemaAvailability(apartment.status),
                  url: `${origin}${"/projekti/heroja-pinkija-13/ponuda-stanova"}/${getUnitRouteSegment(apartment)}`,
                },
              },
            })),
          },
        })}
      />
      <section className="apartments-listing-hero">
        <div className="page-container apartments-listing-hero__grid">
          <div className="apartments-listing-hero__copy fade-up">
            <p className="section-eyebrow">Heroja Pinkija 13</p>
            <h1 className="section-title">
              {isTableView
                ? "Tabelarni spisak stanova i lokala."
                : "Ponuda stanova i lokala."}
            </h1>
            <p className="section-copy section-copy--large">
              {isTableView
                ? "Pregledajte sve jedinice u jednom kompaktnom spisku za najbrže poređenje sprata, kvadrature i statusa."
                : "Uporedite sprat, kvadraturu, namenu i trenutni status stanova i lokala u objektu na početku Telepa."}
            </p>
            <div className="page-actions">
              <ContactModalButton
                className="site-button site-button--accent"
                modalOptions={listingContactModal}
              >
                <MessageCircle />
                Pišite nam
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
              <dd>{availableApartments.length} jedinica</dd>
            </div>
            <div>
              <Layers3 />
              <dt>stambene etaže</dt>
              <dd>3 etaže</dd>
            </div>
            <div>
              <Building2 />
              <dt>Raspored</dt>
              <dd>15 stanova i 2 lokala</dd>
            </div>
            <div>
              <MapPin />
              <dt>Lokacija</dt>
              <dd>Početak Telepa</dd>
            </div>
          </dl>
        </div>
      </section>

      {isTableView ? (
        <>
          <ProjectDocumentsSection />
          <ApartmentTableSection apartments={availableApartments} />
        </>
      ) : (
        <ApartmentAvailability
          apartments={availableApartments}
          compactHeading
        />
      )}

      <section className="apartments-listing-cta">
        <div className="page-container apartments-listing-cta__inner">
          <div>
            <p className="section-eyebrow">Pomoć pri izboru</p>
            <h2>Niste sigurni koja jedinica najbolje odgovara vašim potrebama?</h2>
            <p>
              Prodajni tim može vam pomoći da uporedite rasporede, kvadrature i
              aktuelnu dostupnost.
            </p>
          </div>
          <div className="apartments-listing-cta__actions">
            <ContactModalButton
              className="site-button site-button--dark"
              modalOptions={listingContactModal}
            >
              <MessageCircle />
              Pišite nam
            </ContactModalButton>
            <Link
              className="apartments-listing-cta__link"
              to={
                isTableView
                  ? "/projekti/heroja-pinkija-13/ponuda-stanova"
                  : "/projekti/heroja-pinkija-13/spisak-stanova"
              }
            >
              {isTableView ? "Karticni pregled" : "Spisak stanova i lokala"}
              <ArrowUpRight />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

const ProjectDocumentsSection = () => {
  const [activeDocument, setActiveDocument] =
    useState<ProjectDocument | null>(null);
  const [isDocumentFullscreen, setIsDocumentFullscreen] = useState(false);

  useEffect(() => {
    if (!activeDocument) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveDocument(null);
        setIsDocumentFullscreen(false);
      }
    };

    document.body.style.overflow = "hidden";
    document.body.classList.add("is-project-document-viewer-open");
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.classList.remove("is-project-document-viewer-open");
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [activeDocument]);

  return (
    <>
      <section
        className="page-section page-section--surface project-documents-section"
        aria-labelledby="project-documents-title"
      >
        <div className="page-container">
          <div className="split-grid split-grid--end project-documents-section__heading">
            <div>
              <p className="section-eyebrow">Dokumentacija projekta</p>
              <h2
                className="section-title section-title--medium"
                id="project-documents-title"
              >
                Sve važne informacije na jednom mestu.
              </h2>
            </div>
            <p className="section-copy">
              Pregledajte originalnu dokumentaciju projekta pre nego što otvorite
              detalje konkretne jedinice.
            </p>
          </div>

          <div className="project-documents-grid" data-agent-surface="project-documents">
            {projectDocuments.map((projectDocument) => (
              <article className="project-document-card" key={projectDocument.id}>
                <div className="project-document-card__icon" aria-hidden="true">
                  <FileText />
                </div>
                <div className="project-document-card__content">
                  <p className="project-document-card__meta">
                    {projectDocument.pageCount} {projectDocument.pageCount === 1 ? "strana" : "strane"}
                  </p>
                  <h3>{projectDocument.title}</h3>
                  <p>{projectDocument.description}</p>
                </div>
                <div className="project-document-card__actions">
                  <button
                    type="button"
                    className="project-document-card__preview"
                    data-agent-action="open-project-document"
                    aria-label={`Pregledaj dokument: ${projectDocument.title}`}
                    onClick={() => {
                      setIsDocumentFullscreen(false);
                      setActiveDocument(projectDocument);
                    }}
                  >
                    Pregledaj dokument
                    <ArrowUpRight aria-hidden="true" />
                  </button>
                  <a
                    className="project-document-card__download"
                    href={projectDocument.filePath}
                    download
                    data-agent-action="download-project-document"
                    aria-label={`Preuzmi PDF: ${projectDocument.title}`}
                  >
                    <Download aria-hidden="true" />
                    Preuzmi PDF
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {activeDocument ? (
        <div
          className={`project-document-viewer${
            isDocumentFullscreen ? " project-document-viewer--fullscreen" : ""
          }`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="project-document-viewer-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setActiveDocument(null);
              setIsDocumentFullscreen(false);
            }
          }}
        >
          <div className="project-document-viewer__dialog">
            <header className="project-document-viewer__header">
              <div>
                <p className="section-eyebrow">Dokumentacija projekta</p>
                <h2 id="project-document-viewer-title">
                  {activeDocument.title}
                </h2>
              </div>
              <div className="project-document-viewer__actions">
                <a
                  className="project-document-viewer__download"
                  href={activeDocument.filePath}
                  download
                >
                  <Download aria-hidden="true" />
                  Preuzmi PDF
                </a>
                <button
                  type="button"
                  className="project-document-viewer__fullscreen"
                  aria-label={
                    isDocumentFullscreen
                      ? "Vrati veličinu pregleda dokumenta"
                      : "Prikaži dokument preko celog ekrana"
                  }
                  aria-pressed={isDocumentFullscreen}
                  onClick={() =>
                    setIsDocumentFullscreen((isFullscreen) => !isFullscreen)
                  }
                >
                  {isDocumentFullscreen ? (
                    <Minimize2 aria-hidden="true" />
                  ) : (
                    <Maximize2 aria-hidden="true" />
                  )}
                  <span>
                    {isDocumentFullscreen ? "Vrati veličinu" : "Ceo ekran"}
                  </span>
                </button>
                <button
                  type="button"
                  className="project-document-viewer__close"
                  aria-label="Zatvori pregled dokumenta"
                  onClick={() => {
                    setActiveDocument(null);
                    setIsDocumentFullscreen(false);
                  }}
                  autoFocus
                >
                  <X aria-hidden="true" />
                </button>
              </div>
            </header>
            <ProjectDocumentPreview
              key={activeDocument.id}
              document={activeDocument}
            />
          </div>
        </div>
      ) : null}
    </>
  );
};

type ProjectDocumentPreviewProps = {
  document: ProjectDocument;
};

const ProjectDocumentPreview = ({ document }: ProjectDocumentPreviewProps) => {
  return (
    <div className="project-document-viewer__frame">
      <iframe
        title={`Pregled PDF dokumenta: ${document.title}`}
        src={`${document.filePath}#toolbar=1&navpanes=0&view=FitH`}
      />
    </div>
  );
};

const ApartmentTableSection = ({ apartments }: { apartments: Apartment[] }) => {
  const [floorFilter, setFloorFilter] = useState("all");
  const [roomFilter, setRoomFilter] = useState("all");
  const [unitTypeFilter, setUnitTypeFilter] = useState<
    "all" | NonNullable<Apartment["unitType"]>
  >("all");
  const [statusFilter, setStatusFilter] = useState<"all" | Apartment["status"]>(
    "all",
  );

  const floorOptions = useMemo(
    () =>
      Array.from(new Set(apartments.map((apartment) => apartment.floor))).sort(
        (firstFloor, secondFloor) =>
          getSortNumber(firstFloor) - getSortNumber(secondFloor),
      ),
    [apartments],
  );
  const roomOptions = useMemo(
    () =>
      Array.from(
        new Set(apartments.map((apartment) => apartment.rooms)),
      ).sort(),
    [apartments],
  );
  const statusOptions = useMemo(
    () => Array.from(new Set(apartments.map((apartment) => apartment.status))),
    [apartments],
  );
  const filteredApartments = useMemo(
    () =>
      apartments
        .filter(
          (apartment) =>
            floorFilter === "all" || apartment.floor === floorFilter,
        )
        .filter(
          (apartment) => roomFilter === "all" || apartment.rooms === roomFilter,
        )
        .filter(
          (apartment) =>
            unitTypeFilter === "all" || apartment.unitType === unitTypeFilter,
        )
        .filter(
          (apartment) =>
            statusFilter === "all" || apartment.status === statusFilter,
        )
        .sort(
          (firstApartment, secondApartment) =>
            getUnitSortOrder(firstApartment) - getUnitSortOrder(secondApartment),
        ),
    [apartments, floorFilter, roomFilter, statusFilter, unitTypeFilter],
  );
  const hasActiveFilters =
    floorFilter !== "all" ||
    roomFilter !== "all" ||
    statusFilter !== "all" ||
    unitTypeFilter !== "all";

  const clearFilters = () => {
    setFloorFilter("all");
    setRoomFilter("all");
    setUnitTypeFilter("all");
    setStatusFilter("all");
  };

  const printFilteredList = () => {
    window.print();
  };

  const downloadFilteredList = () => {
    downloadApartmentsCsv(filteredApartments);
  };

  return (
    <section
      className="page-section page-section--surface apartments-table-section"
      aria-labelledby="apartments-table-title"
      data-agent-surface="apartment-table"
    >
      <div className="page-container">
        <div className="split-grid split-grid--end apartments-table-section__heading">
          <div>
            <p className="section-eyebrow">Tabelarni pregled</p>
            <h2 className="section-title section-title--medium" id="apartments-table-title">
              Stanovi i lokali u jednom spisku.
            </h2>
          </div>
          <p className="section-copy">
            Tabela je namenjena brzom poređenju. Za tlocrt, opis i slanje upita
            otvorite detalje konkretne jedinice.
          </p>
        </div>

        <div
          className="apartments-table-filters"
          aria-label="Filteri tabelarnog spiska stanova i lokala"
          data-agent-surface="apartment-table-filters"
        >
          <label>
            <span>Vrsta jedinice</span>
            <select
              name="unitType"
              aria-controls="apartments-table-results"
              data-agent-filter="unit-type"
              value={unitTypeFilter}
              onChange={(event) =>
                setUnitTypeFilter(
                  event.target.value as "all" | NonNullable<Apartment["unitType"]>,
                )
              }
            >
              <option value="all">Sve jedinice</option>
              <option value="apartment">Stanovi</option>
              <option value="commercial_space">Lokali</option>
            </select>
          </label>

          <label>
            <span>Sprat</span>
            <select
              name="floor"
              aria-controls="apartments-table-results"
              data-agent-filter="floor"
              value={floorFilter}
              onChange={(event) => setFloorFilter(event.target.value)}
            >
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
            <select
              name="structure"
              aria-controls="apartments-table-results"
              data-agent-filter="structure"
              value={roomFilter}
              onChange={(event) => setRoomFilter(event.target.value)}
            >
              <option value="all">Sve strukture</option>
              {roomOptions.map((rooms) => (
                <option key={rooms} value={rooms}>
                  {rooms}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>status</span>
            <select
              name="status"
              aria-controls="apartments-table-results"
              data-agent-filter="availability"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as "all" | Apartment["status"],
                )
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
            <span aria-live="polite">
              {filteredApartments.length} od {apartments.length} jedinica
            </span>
            <button
              type="button"
              data-agent-action="reset-apartment-table-filters"
              aria-controls="apartments-table-results"
              onClick={clearFilters}
              disabled={!hasActiveFilters}
            >
              Poništi filtere
            </button>
          </div>
        </div>

        <div
          className="apartments-table-actions"
          aria-label="Akcije za tabelarni spisak stanova i lokala"
        >
          <p>Akcije koriste trenutno izabrane filtere.</p>
          <div>
            <button
              type="button"
              data-agent-action="print-apartment-table"
              onClick={printFilteredList}
              disabled={filteredApartments.length === 0}
            >
              <Printer />
              Štampaj spisak
            </button>
            <button
              type="button"
              data-agent-action="download-apartment-csv"
              onClick={downloadFilteredList}
              disabled={filteredApartments.length === 0}
            >
              <Download />
              Preuzmi CSV
            </button>
          </div>
        </div>

        <div
          className="apartments-table-wrap"
          id="apartments-table-results"
          role="region"
          aria-label="Tabelarni spisak stanova i lokala"
          data-agent-surface="apartment-table-results"
        >
          {filteredApartments.length > 0 ? (
            <table className="apartments-table">
              <caption className="sr-only">
                Stanovi i lokali u projektu Heroja Pinkija 13 sa spratom,
                površinom, strukturom i statusom.
              </caption>
              <thead>
                <tr>
                  <th>Jedinica</th>
                  <th>Sprat</th>
                  <th>Površina</th>
                  <th>Namena / struktura</th>
                  <th>status</th>
                  <th>Detalji</th>
                </tr>
              </thead>
              <tbody>
                {filteredApartments.map((apartment) => (
                  <tr
                    key={apartment.slug ?? apartment.number}
                    data-agent-entity="unit"
                    data-unit-number={apartment.number}
                    data-unit-type={getUnitLabel(apartment)}
                  >
                    <td data-label="Jedinica">
                      <strong>{getUnitDisplayName(apartment)}</strong>
                    </td>
                    <td data-label="Sprat">{apartment.floor}</td>
                    <td data-label="Površina">{apartment.size}</td>
                    <td data-label="Namena / struktura">{apartment.rooms}</td>
                    <td data-label="status">
                      <span
                        className={`status-badge status-badge--${statusVariant[apartment.status]}`}
                      >
                        {statusLabel[apartment.status]}
                      </span>
                    </td>
                    <td data-label="Detalji">
                      <Link
                        className="apartments-table__link"
                        data-agent-action="open-unit-details"
                        to={`/projekti/heroja-pinkija-13/ponuda-stanova/${getUnitRouteSegment(apartment)}`}
                      >
                        Otvori {getUnitLabel(apartment).toLowerCase()}
                        <ArrowUpRight />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="apartments-table-empty" role="status">
              <strong>Nema jedinica za izabrane filtere.</strong>
              <p>
                Promenite kriterijume ili ponistite filtere za kompletan spisak.
              </p>
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

function getSchemaAvailability(status: Apartment["status"]) {
  const availabilityByStatus: Record<Apartment["status"], string> = {
    Available: "https://schema.org/InStock",
    Reserved: "https://schema.org/LimitedAvailability",
    Sold: "https://schema.org/SoldOut",
  };

  return availabilityByStatus[status];
}

function downloadApartmentsCsv(items: Apartment[]) {
  const headers = [
    "Jedinica",
    "Sprat",
    "Površina",
    "Struktura",
    "status",
    "Detalji",
  ];
  const rows = items.map((apartment) => [
    getUnitDisplayName(apartment),
    apartment.floor,
    apartment.size,
    apartment.rooms,
    statusLabel[apartment.status],
    createPublicUrl(
      `/projekti/heroja-pinkija-13/ponuda-stanova/${getUnitRouteSegment(apartment)}`,
    ),
  ]);
  const csv = [headers, ...rows]
    .map((row) =>
      row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","),
    )
    .join("\r\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `heroja-pinkija-13-spisak-jedinica-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
