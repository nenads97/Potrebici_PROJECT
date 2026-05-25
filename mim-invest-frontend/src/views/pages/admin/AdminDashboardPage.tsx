import { useEffect, useMemo, useState } from "react";
import {
  FileUp,
  Filter,
  Mail,
  Phone,
  Save,
  Search,
  SquarePen,
} from "lucide-react";

import {
  adminInquiries,
  adminLandOffers,
  adminMediaItems,
  adminProjectDraft,
  adminStatusLabels,
  adminUnitStatusLabels,
  adminUnits,
} from "../../../features/admin/data/adminMock.data";
import {
  fetchAdminState,
  updateInquiry as persistInquiry,
  updateLandOffer as persistLandOffer,
  updateMediaItem as persistMediaItem,
  updateProject as persistProject,
  updateUnit as persistUnit,
} from "../../../features/admin/data/adminSupabase.api";
import type {
  AdminInquiry,
  AdminLandOffer,
  AdminMediaItem,
  AdminProjectDraft,
  AdminUnit,
  AdminUnitStatus,
  AdminWorkflowStatus,
} from "../../../features/admin/types/admin.types";
import { isSupabaseConfigured } from "../../../shared/supabase/client";

type AdminSection = "inquiries" | "land" | "units" | "project" | "media";

type AdminDashboardPageProps = {
  section: AdminSection;
};

const workflowStatuses: AdminWorkflowStatus[] = ["new", "contacted", "closed"];
const unitStatuses: AdminUnitStatus[] = ["available", "reserved", "sold"];

const sectionCopy: Record<AdminSection, { eyebrow: string; title: string; body: string }> = {
  inquiries: {
    eyebrow: "Prodaja",
    title: "Upiti za stanove",
    body: "Brz pregled kontakata, statusa i internih beleski za kupce.",
  },
  land: {
    eyebrow: "Akvizicija",
    title: "Upiti za placeve",
    body: "Ponude vlasnika zemljista i starih kuca za buduce projekte.",
  },
  units: {
    eyebrow: "Ponuda",
    title: "Stanovi i statusi",
    body: "Operativna promena statusa stanova pre povezivanja sa Supabase bazom.",
  },
  project: {
    eyebrow: "Sadrzaj",
    title: "Projekat",
    body: "Osnovni tekstovi i rokovi koji ce kasnije ici u tabelu projects.",
  },
  media: {
    eyebrow: "Fajlovi",
    title: "Slike i PDF fajlovi",
    body: "Metadata za slike, planove i prodajne PDF fajlove u Supabase Storage-u.",
  },
};

export const AdminDashboardPage = ({ section }: AdminDashboardPageProps) => {
  const [inquiries, setInquiries] = useState(adminInquiries);
  const [landOffers, setLandOffers] = useState(adminLandOffers);
  const [units, setUnits] = useState(adminUnits);
  const [projectDraft, setProjectDraft] = useState(adminProjectDraft);
  const [mediaItems, setMediaItems] = useState(adminMediaItems);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | AdminWorkflowStatus>("all");
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured);
  const [feedback, setFeedback] = useState(
    isSupabaseConfigured
      ? "Povezivanje sa Supabase bazom..."
      : "Supabase env nije podesen lokalno, prikazuju se demo podaci.",
  );
  const currentCopy = sectionCopy[section];

  useEffect(() => {
    let isMounted = true;

    async function loadAdminData() {
      try {
        const data = await fetchAdminState();

        if (!isMounted || !data) {
          return;
        }

        setInquiries(data.inquiries);
        setLandOffers(data.landOffers);
        setUnits(data.units);
        if (data.projectDraft) {
          setProjectDraft(data.projectDraft);
        }
        setMediaItems(data.mediaItems);
        setFeedback("Podaci su ucitani iz Supabase baze.");
      } catch (error) {
        setFeedback(getErrorMessage(error));
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadAdminData();

    return () => {
      isMounted = false;
    };
  }, []);

  const persist = async (action: () => Promise<void>, successMessage = "Izmena je sacuvana.") => {
    if (!isSupabaseConfigured) {
      setFeedback("Izmena je lokalna jer Supabase env nije podesen.");
      return;
    }

    try {
      await action();
      setFeedback(successMessage);
    } catch (error) {
      setFeedback(getErrorMessage(error));
    }
  };

  const metrics = useMemo(() => {
    if (section === "land") {
      return [
        {
          label: "Nove ponude",
          value: landOffers.filter((item) => item.adminStatus === "new").length,
        },
        {
          label: "Ukupno ponuda",
          value: landOffers.length,
        },
        {
          label: "Kontaktirano",
          value: landOffers.filter((item) => item.adminStatus === "contacted").length,
        },
        {
          label: "Zatvoreno",
          value: landOffers.filter((item) => item.adminStatus === "closed").length,
        },
      ];
    }

    if (section === "inquiries") {
      return [
        {
          label: "Novi upiti",
          value: inquiries.filter((item) => item.adminStatus === "new").length,
        },
        {
          label: "Ukupno upita",
          value: inquiries.length,
        },
        {
          label: "Kontaktirano",
          value: inquiries.filter((item) => item.adminStatus === "contacted").length,
        },
        {
          label: "Zatvoreno",
          value: inquiries.filter((item) => item.adminStatus === "closed").length,
        },
      ];
    }

    return [
      {
        label: "Slobodnih stanova",
        value: units.filter((unit) => unit.status === "available").length,
      },
      {
        label: "Rezervisano",
        value: units.filter((unit) => unit.status === "reserved").length,
      },
      {
        label: "Prodato",
        value: units.filter((unit) => unit.status === "sold").length,
      },
      {
        label: "Objavljenih fajlova",
        value: mediaItems.filter((item) => item.isPublished).length,
      },
    ];
  }, [inquiries, landOffers, mediaItems, section, units]);

  return (
    <main className="admin-page">
      <section className="admin-page__hero">
        <div>
          <p className="section-eyebrow">{currentCopy.eyebrow}</p>
          <h1>{currentCopy.title}</h1>
          <p>{currentCopy.body}</p>
        </div>

        <div className="admin-metrics" aria-label="Admin metrike">
          {metrics.map((metric) => (
            <div key={metric.label}>
              <strong>{metric.value}</strong>
              <span>{metric.label}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="admin-sync-status" role="status">
        {isLoading ? "Ucitavanje..." : feedback}
      </div>

      {section === "inquiries" ? (
        <InquiryPanel
          inquiries={inquiries}
          query={query}
          statusFilter={statusFilter}
          onQueryChange={setQuery}
          onStatusFilterChange={setStatusFilter}
          onUpdate={setInquiries}
          onPersist={(id, changes) =>
            persist(
              () =>
                persistInquiry(id, {
                  admin_status: changes.adminStatus,
                  admin_note: changes.adminNote,
                }),
              "Upit je sacuvan.",
            )
          }
        />
      ) : null}

      {section === "land" ? (
        <LandOfferPanel
          offers={landOffers}
          query={query}
          statusFilter={statusFilter}
          onQueryChange={setQuery}
          onStatusFilterChange={setStatusFilter}
          onUpdate={setLandOffers}
          onPersist={(id, changes) =>
            persist(
              () =>
                persistLandOffer(id, {
                  admin_status: changes.adminStatus,
                  admin_note: changes.adminNote,
                }),
              "Ponuda placa je sacuvana.",
            )
          }
        />
      ) : null}

      {section === "units" ? (
        <UnitPanel
          units={units}
          onUpdate={setUnits}
          onPersist={(id, changes) => persist(() => persistUnit(id, changes), "Status stana je sacuvan.")}
        />
      ) : null}

      {section === "project" ? (
        <ProjectPanel
          projectDraft={projectDraft}
          onUpdate={setProjectDraft}
          onPersist={(project) => persist(() => persistProject(project), "Projekat je sacuvan.")}
        />
      ) : null}

      {section === "media" ? (
        <MediaPanel
          mediaItems={mediaItems}
          onUpdate={setMediaItems}
          onPersist={(id, changes) =>
            persist(() => persistMediaItem(id, changes), "Metadata fajla je sacuvan.")
          }
        />
      ) : null}
    </main>
  );
};

type InquiryPanelProps = {
  inquiries: AdminInquiry[];
  query: string;
  statusFilter: "all" | AdminWorkflowStatus;
  onQueryChange: (query: string) => void;
  onStatusFilterChange: (status: "all" | AdminWorkflowStatus) => void;
  onUpdate: (items: AdminInquiry[]) => void;
  onPersist: (id: string, changes: Partial<AdminInquiry>) => void;
};

const InquiryPanel = ({
  inquiries,
  query,
  statusFilter,
  onQueryChange,
  onStatusFilterChange,
  onUpdate,
  onPersist,
}: InquiryPanelProps) => {
  const filtered = filterWorkflowItems(inquiries, query, statusFilter);

  const updateInquiry = (id: string, changes: Partial<AdminInquiry>) => {
    onUpdate(inquiries.map((item) => (item.id === id ? { ...item, ...changes } : item)));
    onPersist(id, changes);
  };

  return (
    <section className="admin-section">
      <AdminToolbar
        query={query}
        statusFilter={statusFilter}
        onQueryChange={onQueryChange}
        onStatusFilterChange={onStatusFilterChange}
      />

      <div className="admin-list">
        {filtered.length === 0 ? (
          <EmptyAdminList
            title="Nema upita za prikaz."
            text="Promenite filter ili sacekajte novi upit sa kontakt forme."
          />
        ) : null}

        {filtered.map((inquiry) => (
          <article className="admin-card" key={inquiry.id}>
            <div className="admin-card__head">
              <div>
                <span className={`admin-status admin-status--${inquiry.adminStatus}`}>
                  {adminStatusLabels[inquiry.adminStatus]}
                </span>
                <h2>{inquiry.fullName}</h2>
                <p>
                  {inquiry.unitCode ?? "Opsti upit"} · {formatDate(inquiry.createdAt)}
                </p>
              </div>
              <WorkflowSelect
                value={inquiry.adminStatus}
                onChange={(adminStatus) => updateInquiry(inquiry.id, { adminStatus })}
              />
            </div>

            <div className="admin-contact-grid">
              <a href={`tel:${inquiry.phone}`}>
                <Phone />
                {inquiry.phone}
              </a>
              <a href={`mailto:${inquiry.email}`}>
                <Mail />
                {inquiry.email}
              </a>
            </div>

            <p className="admin-card__message">{inquiry.message}</p>

            <label className="form-field">
              <span className="form-label">Interna beleska</span>
              <textarea
                className="form-textarea admin-note"
                value={inquiry.adminNote}
                onChange={(event) => updateInquiry(inquiry.id, { adminNote: event.target.value })}
              />
            </label>
          </article>
        ))}
      </div>
    </section>
  );
};

type LandOfferPanelProps = {
  offers: AdminLandOffer[];
  query: string;
  statusFilter: "all" | AdminWorkflowStatus;
  onQueryChange: (query: string) => void;
  onStatusFilterChange: (status: "all" | AdminWorkflowStatus) => void;
  onUpdate: (items: AdminLandOffer[]) => void;
  onPersist: (id: string, changes: Partial<AdminLandOffer>) => void;
};

const LandOfferPanel = ({
  offers,
  query,
  statusFilter,
  onQueryChange,
  onStatusFilterChange,
  onUpdate,
  onPersist,
}: LandOfferPanelProps) => {
  const filtered = filterWorkflowItems(offers, query, statusFilter);

  const updateOffer = (id: string, changes: Partial<AdminLandOffer>) => {
    onUpdate(offers.map((item) => (item.id === id ? { ...item, ...changes } : item)));
    onPersist(id, changes);
  };

  return (
    <section className="admin-section">
      <AdminToolbar
        query={query}
        statusFilter={statusFilter}
        onQueryChange={onQueryChange}
        onStatusFilterChange={onStatusFilterChange}
      />

      <div className="admin-list">
        {filtered.length === 0 ? (
          <EmptyAdminList
            title="Nema ponuda placeva za prikaz."
            text="Broj novih upita iznad se sada odnosi samo na ponude placeva u ovoj sekciji."
          />
        ) : null}

        {filtered.map((offer) => (
          <article className="admin-card" key={offer.id}>
            <div className="admin-card__head">
              <div>
                <span className={`admin-status admin-status--${offer.adminStatus}`}>
                  {adminStatusLabels[offer.adminStatus]}
                </span>
                <h2>{offer.fullName}</h2>
                <p>
                  {offer.propertyAddress} · {offer.plotAreaM2} m2 · {formatDate(offer.createdAt)}
                </p>
              </div>
              <WorkflowSelect
                value={offer.adminStatus}
                onChange={(adminStatus) => updateOffer(offer.id, { adminStatus })}
              />
            </div>

            <div className="admin-contact-grid">
              <a href={`tel:${offer.phone}`}>
                <Phone />
                {offer.phone}
              </a>
              <a href={`mailto:${offer.email}`}>
                <Mail />
                {offer.email}
              </a>
            </div>

            <p className="admin-card__message">{offer.details}</p>

            <label className="form-field">
              <span className="form-label">Interna beleska</span>
              <textarea
                className="form-textarea admin-note"
                value={offer.adminNote}
                onChange={(event) => updateOffer(offer.id, { adminNote: event.target.value })}
              />
            </label>
          </article>
        ))}
      </div>
    </section>
  );
};

type EmptyAdminListProps = {
  title: string;
  text: string;
};

const EmptyAdminList = ({ title, text }: EmptyAdminListProps) => {
  return (
    <div className="admin-empty-state">
      <strong>{title}</strong>
      <p>{text}</p>
    </div>
  );
};

type AdminToolbarProps = {
  query: string;
  statusFilter: "all" | AdminWorkflowStatus;
  onQueryChange: (query: string) => void;
  onStatusFilterChange: (status: "all" | AdminWorkflowStatus) => void;
};

const AdminToolbar = ({
  query,
  statusFilter,
  onQueryChange,
  onStatusFilterChange,
}: AdminToolbarProps) => {
  return (
    <div className="admin-toolbar">
      <label className="admin-search">
        <Search />
        <span className="sr-only">Pretraga</span>
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Pretraga po imenu, telefonu, emailu ili poruci"
        />
      </label>

      <label className="admin-filter">
        <Filter />
        <span>Status</span>
        <select
          value={statusFilter}
          onChange={(event) =>
            onStatusFilterChange(event.target.value as "all" | AdminWorkflowStatus)
          }
        >
          <option value="all">Svi statusi</option>
          {workflowStatuses.map((status) => (
            <option key={status} value={status}>
              {adminStatusLabels[status]}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
};

type WorkflowSelectProps = {
  value: AdminWorkflowStatus;
  onChange: (status: AdminWorkflowStatus) => void;
};

const WorkflowSelect = ({ value, onChange }: WorkflowSelectProps) => {
  return (
    <label className="admin-inline-select">
      <span>Status</span>
      <select value={value} onChange={(event) => onChange(event.target.value as AdminWorkflowStatus)}>
        {workflowStatuses.map((status) => (
          <option key={status} value={status}>
            {adminStatusLabels[status]}
          </option>
        ))}
      </select>
    </label>
  );
};

type UnitPanelProps = {
  units: AdminUnit[];
  onUpdate: (items: AdminUnit[]) => void;
  onPersist: (id: string, changes: Partial<AdminUnit>) => void;
};

const UnitPanel = ({ units, onUpdate, onPersist }: UnitPanelProps) => {
  const updateUnit = (id: string, changes: Partial<AdminUnit>) => {
    onUpdate(units.map((unit) => (unit.id === id ? { ...unit, ...changes } : unit)));
    onPersist(id, changes);
  };

  return (
    <section className="admin-section">
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Jedinica</th>
              <th>Etaza</th>
              <th>Kvadratura</th>
              <th>Struktura</th>
              <th>Status</th>
              <th>Objava</th>
            </tr>
          </thead>
          <tbody>
            {units.map((unit) => (
              <tr key={unit.id}>
                <td>
                  <strong>{unit.unitCode}</strong>
                  <span>{unit.shortDescription}</span>
                </td>
                <td>{unit.floorLabel}</td>
                <td>{unit.areaM2}</td>
                <td>{unit.roomStructure}</td>
                <td>
                  <select
                    className="admin-table-select"
                    value={unit.status}
                    onChange={(event) =>
                      updateUnit(unit.id, { status: event.target.value as AdminUnitStatus })
                    }
                  >
                    {unitStatuses.map((status) => (
                      <option key={status} value={status}>
                        {adminUnitStatusLabels[status]}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <label className="admin-toggle">
                    <input
                      type="checkbox"
                      checked={unit.isPublished}
                      onChange={(event) => updateUnit(unit.id, { isPublished: event.target.checked })}
                    />
                    <span>{unit.isPublished ? "Objavljeno" : "Sakriveno"}</span>
                  </label>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

type ProjectPanelProps = {
  projectDraft: AdminProjectDraft;
  onUpdate: (project: AdminProjectDraft) => void;
  onPersist: (project: AdminProjectDraft) => void;
};

const ProjectPanel = ({ projectDraft, onUpdate, onPersist }: ProjectPanelProps) => {
  const updateProject = (changes: Partial<AdminProjectDraft>) => {
    onUpdate({ ...projectDraft, ...changes });
  };

  return (
    <section className="admin-section">
      <form className="admin-editor">
        <label className="form-field">
          <span className="form-label">Naziv projekta</span>
          <input
            className="form-input"
            value={projectDraft.name}
            onChange={(event) => updateProject({ name: event.target.value })}
          />
        </label>

        <label className="form-field">
          <span className="form-label">Adresa</span>
          <input
            className="form-input"
            value={projectDraft.address}
            onChange={(event) => updateProject({ address: event.target.value })}
          />
        </label>

        <label className="form-field admin-editor__wide">
          <span className="form-label">Kratak opis</span>
          <textarea
            className="form-textarea"
            value={projectDraft.shortDescription}
            onChange={(event) => updateProject({ shortDescription: event.target.value })}
          />
        </label>

        <label className="form-field admin-editor__wide">
          <span className="form-label">Opis lokacije</span>
          <textarea
            className="form-textarea"
            value={projectDraft.locationDescription}
            onChange={(event) => updateProject({ locationDescription: event.target.value })}
          />
        </label>

        <label className="form-field">
          <span className="form-label">Spratnost</span>
          <input
            className="form-input"
            value={projectDraft.floorStructure}
            onChange={(event) => updateProject({ floorStructure: event.target.value })}
          />
        </label>

        <label className="form-field">
          <span className="form-label">Status projekta</span>
          <select
            className="form-select"
            value={projectDraft.projectStatus}
            onChange={(event) =>
              updateProject({
                projectStatus: event.target.value as AdminProjectDraft["projectStatus"],
              })
            }
          >
            <option value="planned">Planirano</option>
            <option value="active">Aktivno</option>
            <option value="completed">Zavrseno</option>
            <option value="hidden">Sakriveno</option>
          </select>
        </label>

        <label className="form-field">
          <span className="form-label">Pocetak izgradnje</span>
          <input
            className="form-input"
            type="date"
            value={projectDraft.constructionStartDate}
            onChange={(event) => updateProject({ constructionStartDate: event.target.value })}
          />
        </label>

        <label className="form-field">
          <span className="form-label">Planirani zavrsetak</span>
          <input
            className="form-input"
            type="date"
            value={projectDraft.constructionEndDate}
            onChange={(event) => updateProject({ constructionEndDate: event.target.value })}
          />
        </label>

        <button
          className="site-button site-button--dark admin-editor__wide"
          type="button"
          onClick={() => onPersist(projectDraft)}
        >
          <Save />
          Sacuvaj izmene
        </button>
      </form>
    </section>
  );
};

type MediaPanelProps = {
  mediaItems: AdminMediaItem[];
  onUpdate: (items: AdminMediaItem[]) => void;
  onPersist: (id: string, changes: Partial<AdminMediaItem>) => void;
};

const MediaPanel = ({ mediaItems, onUpdate, onPersist }: MediaPanelProps) => {
  const updateMedia = (id: string, changes: Partial<AdminMediaItem>) => {
    onUpdate(mediaItems.map((item) => (item.id === id ? { ...item, ...changes } : item)));
    onPersist(id, changes);
  };

  return (
    <section className="admin-section">
      <div className="admin-upload-panel">
        <div>
          <FileUp />
          <div>
            <h2>Dodavanje fajla</h2>
            <p>Upload ce se povezati sa Supabase Storage-om. Za sada se uredjuje metadata.</p>
          </div>
        </div>
        <button className="site-button site-button--outline" type="button">
          Izaberi fajl
        </button>
      </div>

      <div className="admin-media-grid">
        {mediaItems.map((item) => (
          <article className="admin-media-card" key={item.id}>
            <div className="admin-media-card__icon">
              <SquarePen />
            </div>
            <label className="form-field">
              <span className="form-label">Naziv</span>
              <input
                className="form-input"
                value={item.title}
                onChange={(event) => updateMedia(item.id, { title: event.target.value })}
              />
            </label>
            <label className="form-field">
              <span className="form-label">Putanja</span>
              <input
                className="form-input"
                value={item.filePath}
                onChange={(event) => updateMedia(item.id, { filePath: event.target.value })}
              />
            </label>
            <label className="form-field">
              <span className="form-label">Alt tekst</span>
              <input
                className="form-input"
                value={item.altText}
                onChange={(event) => updateMedia(item.id, { altText: event.target.value })}
              />
            </label>
            <label className="admin-toggle">
              <input
                type="checkbox"
                checked={item.isPublished}
                onChange={(event) => updateMedia(item.id, { isPublished: event.target.checked })}
              />
              <span>{item.isPublished ? "Objavljeno" : "Sakriveno"}</span>
            </label>
          </article>
        ))}
      </div>
    </section>
  );
};

function filterWorkflowItems<T extends { fullName: string; phone: string; email: string; adminStatus: AdminWorkflowStatus }>(
  items: T[],
  query: string,
  statusFilter: "all" | AdminWorkflowStatus,
) {
  const normalizedQuery = query.trim().toLowerCase();

  return items.filter((item) => {
    const matchesStatus = statusFilter === "all" || item.adminStatus === statusFilter;
    const searchable = Object.values(item).join(" ").toLowerCase();
    const matchesQuery = !normalizedQuery || searchable.includes(normalizedQuery);

    return matchesStatus && matchesQuery;
  });
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("sr-RS", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error && "message" in error) {
    return String(error.message);
  }

  return "Doslo je do greske pri komunikaciji sa Supabase bazom.";
}
