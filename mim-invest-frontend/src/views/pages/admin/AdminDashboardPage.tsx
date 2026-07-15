import { Fragment, type FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  AlertTriangle,
  Building2,
  CheckCircle2,
  Clock3,
  Eye,
  FileText,
  FileUp,
  Filter,
  Home,
  Image as ImageIcon,
  Images,
  Inbox,
  Mail,
  MapPinned,
  Phone,
  Save,
  Search,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";

import {
  adminConstructionUpdates,
  adminInquiries,
  adminLandOffers,
  adminMediaItems,
  adminProjectDraft,
  adminStatusLabels,
  adminUnitStatusLabels,
  adminUnits,
} from "../../../features/admin/data/adminMock.data";
import {
  createMediaItem as persistNewMediaItem,
  deleteMediaItem as persistDeleteMediaItem,
  fetchAdminState,
  updateConstructionUpdate as persistConstructionUpdate,
  updateInquiry as persistInquiry,
  updateLandOffer as persistLandOffer,
  updateMediaItem as persistMediaItem,
  updateProject as persistProject,
  updateUnit as persistUnit,
  uploadMediaFile as persistMediaFile,
} from "../../../features/admin/data/adminSupabase.api";
import type {
  AdminConstructionUpdate,
  AdminInquiry,
  AdminLandOffer,
  AdminMediaItem,
  AdminProjectDraft,
  AdminUnit,
  AdminUnitStatus,
  AdminWorkflowStatus,
} from "../../../features/admin/types/admin.types";
import { PageMeta } from "../../../shared/components/PageMeta";
import { isSupabaseConfigured } from "../../../shared/supabase/client";

type AdminSection = "overview" | "inquiries" | "land" | "units" | "project" | "media";

type AdminDashboardPageProps = {
  section: AdminSection;
};

type AdminPersistResult = {
  status: "saved" | "local" | "failed";
  message: string;
};

type AdminCardFeedback = {
  tone: "pending" | "success" | "error";
  message: string;
};

type AdminMediaUploadPersistResult = AdminPersistResult & {
  filePath?: string;
  title?: string;
};

type AdminMediaCreateDraft = {
  title: string;
  mediaType: AdminMediaItem["mediaType"];
  ownerType: "project" | "unit";
  unitId: string;
  filePath: string;
  altText: string;
  isPublished: boolean;
};

type AdminMediaCreatePersistResult = AdminPersistResult & {
  item?: AdminMediaItem;
};

type AdminMediaDeletePersistResult = AdminPersistResult & {
  deletedId?: string;
};

type AdminUnitContentDraft = {
  fullDescription: string;
  seoTitle: string;
  seoDescription: string;
};

const workflowStatuses: AdminWorkflowStatus[] = ["new", "contacted", "closed"];
const unitStatuses: AdminUnitStatus[] = ["available", "reserved", "sold"];

const inquiryTypeLabels: Record<AdminInquiry["inquiryType"], string> = {
  general: "Opsti upit",
  unit: "Konkretan stan",
  viewing: "Obilazak",
  availability: "Dostupnost",
};

const mediaTypeLabels: Record<AdminMediaItem["mediaType"], string> = {
  project_image: "Slika projekta",
  unit_image: "Slika/tlocrt stana",
  apartment_floor_plan_pdf: "PDF tlocrt stana",
  building_floor_plan_pdf: "PDF osnova objekta",
  garage_plan_pdf: "PDF garaza",
  storage_plan_pdf: "PDF ostave",
  general_brochure_pdf: "Opsta brosura",
  construction_update_image: "Slika radova",
};

const sectionCopy: Record<AdminSection, { eyebrow: string; title: string; body: string }> = {
  overview: {
    eyebrow: "Admin",
    title: "Pregled prodaje i sadrzaja",
    body: "Jedno mesto za nove upite, status stanova, upozorenja za sadrzaj i najbrze akcije prodajnog tima.",
  },
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
    body: "Brza promena dostupnosti stanova koja se direktno odrazava na javnu ponudu.",
  },
  project: {
    eyebrow: "Sadrzaj",
    title: "Projekat",
    body: "Osnovni tekstovi, lokacija i rokovi koji hrane javnu prezentaciju projekta.",
  },
  media: {
    eyebrow: "Fajlovi",
    title: "Slike i PDF fajlovi",
    body: "Metadata za slike, planove i prodajne PDF fajlove u Supabase Storage-u.",
  },
};

const sectionCanonicalPaths: Record<AdminSection, string> = {
  overview: "/admin",
  inquiries: "/admin/upiti-stanovi",
  land: "/admin/upiti-placevi",
  units: "/admin/stanovi",
  project: "/admin/projekat",
  media: "/admin/fajlovi",
};

export const AdminDashboardPage = ({ section }: AdminDashboardPageProps) => {
  const [inquiries, setInquiries] = useState(adminInquiries);
  const [landOffers, setLandOffers] = useState(adminLandOffers);
  const [units, setUnits] = useState(adminUnits);
  const [projectDraft, setProjectDraft] = useState(adminProjectDraft);
  const [constructionUpdates, setConstructionUpdates] = useState(adminConstructionUpdates);
  const [mediaItems, setMediaItems] = useState(adminMediaItems);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | AdminWorkflowStatus>("all");
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured);
  const [feedback, setFeedback] = useState(
    isSupabaseConfigured
      ? "Povezivanje sa Supabase bazom..."
      : "Lokalni rezim: prikazuju se fallback podaci dok Supabase env nije podesen.",
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
        setConstructionUpdates(data.constructionUpdates);
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

  const persist = async (
    action: () => Promise<void>,
    successMessage = "Izmena je sacuvana.",
  ): Promise<AdminPersistResult> => {
    if (!isSupabaseConfigured) {
      const message = "Izmena je sacuvana samo u lokalnom fallback prikazu jer Supabase env nije podesen.";
      setFeedback(message);
      return { status: "local", message };
    }

    try {
      await action();
      setFeedback(successMessage);
      return { status: "saved", message: successMessage };
    } catch (error) {
      const message = getErrorMessage(error);
      setFeedback(message);
      return { status: "failed", message };
    }
  };

  const metrics = useMemo(() => {
    if (section === "overview") {
      return [
        {
          label: "Novi upiti za stanove",
          value: inquiries.filter((item) => item.adminStatus === "new").length,
        },
        {
          label: "Nove ponude placeva",
          value: landOffers.filter((item) => item.adminStatus === "new").length,
        },
        {
          label: "Slobodnih stanova",
          value: units.filter((unit) => unit.status === "available" && unit.isPublished).length,
        },
        {
          label: "Stavki za proveru",
          value:
            units.filter((unit) => !unit.isPublished).length +
            mediaItems.filter((item) => item.isPublished && hasMissingImageAltText(item)).length,
        },
      ];
    }

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

    if (section === "media") {
      return [
        {
          label: "Objavljenih fajlova",
          value: mediaItems.filter((item) => item.isPublished).length,
        },
        {
          label: "Sakrivenih fajlova",
          value: mediaItems.filter((item) => !item.isPublished).length,
        },
        {
          label: "Slike",
          value: mediaItems.filter((item) => isImageMediaDraft(item)).length,
        },
        {
          label: "PDF fajlovi",
          value: mediaItems.filter((item) => isPdfMediaType(item.mediaType)).length,
        },
      ];
    }

    if (section === "units") {
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
          label: "Sakriveno",
          value: units.filter((unit) => !unit.isPublished).length,
        },
      ];
    }

    return [
      {
        label: "Slobodnih stanova",
        value: units.filter((unit) => unit.status === "available").length,
      },
      {
        label: "Objavljenih stanova",
        value: units.filter((unit) => unit.isPublished).length,
      },
      {
        label: "Objavljenih fajlova",
        value: mediaItems.filter((item) => item.isPublished).length,
      },
      {
        label: "Novi upiti",
        value: inquiries.filter((item) => item.adminStatus === "new").length,
      },
    ];
  }, [inquiries, landOffers, mediaItems, section, units]);

  return (
    <>
      <PageMeta
        title={`${currentCopy.title} | Admin | M & M Gradnja`}
        description={currentCopy.body}
        canonicalPath={sectionCanonicalPaths[section]}
        robots="noindex,nofollow"
      />

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

      {section === "overview" ? (
        <OverviewPanel
          inquiries={inquiries}
          landOffers={landOffers}
          units={units}
          mediaItems={mediaItems}
        />
      ) : null}

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
          constructionUpdates={constructionUpdates}
          units={units}
          mediaItems={mediaItems}
          onUpdate={setProjectDraft}
          onConstructionUpdatesUpdate={setConstructionUpdates}
          onPersist={(project) => persist(() => persistProject(project), "Projekat je sacuvan.")}
          onConstructionUpdatePersist={(id, changes) =>
            persist(
              () => persistConstructionUpdate(id, changes),
              "Status radova je sacuvan.",
            )
          }
        />
      ) : null}

      {section === "media" ? (
        <MediaPanel
          mediaItems={mediaItems}
          projectDraft={projectDraft}
          units={units}
          onUpdate={setMediaItems}
          onPersist={(id, changes) =>
            persist(() => persistMediaItem(id, changes), "Metadata fajla je sacuvan.")
          }
          onUpload={async (item, file) => {
            if (!isSupabaseConfigured) {
              const message = "Upload nije moguc u lokalnom fallback rezimu jer Supabase env nije podesen.";
              setFeedback(message);
              return { status: "failed", message };
            }

            try {
              const uploadedFile = await persistMediaFile(item, file);
              const title = item.title.trim() || getUploadTitle(uploadedFile.fileName);

              await persistMediaItem(item.id, {
                filePath: uploadedFile.publicUrl,
                title,
              });

              const message = "Fajl je uploadovan i povezan sa media karticom.";
              setFeedback(message);

              return {
                status: "saved",
                message,
                filePath: uploadedFile.publicUrl,
                title,
              };
            } catch (error) {
              const message = getErrorMessage(error);
              setFeedback(message);
              return { status: "failed", message };
            }
          }}
          onCreate={async (draft, file) => {
            if (!isSupabaseConfigured) {
              if (file) {
                const message = "Upload nove kartice nije moguc u lokalnom fallback rezimu jer Supabase env nije podesen.";
                setFeedback(message);
                return { status: "failed", message };
              }

              const item: AdminMediaItem = {
                id: `local-media-${Date.now()}`,
                title: draft.title.trim(),
                mediaType: draft.mediaType,
                filePath: draft.filePath.trim(),
                altText: draft.altText.trim(),
                isPublished: draft.isPublished,
              };
              const message = "Nova media kartica je dodata samo u lokalni fallback prikaz jer Supabase env nije podesen.";
              setFeedback(message);

              return { status: "local", message, item };
            }

            if (!projectDraft) {
              const message = "Projekat nije ucitan, pa nova media kartica ne moze biti povezana.";
              setFeedback(message);
              return { status: "failed", message };
            }

            try {
              let filePath = draft.filePath.trim();

              if (file) {
                const uploadedFile = await persistMediaFile(
                  { id: `new-media-${Date.now()}`, mediaType: draft.mediaType },
                  file,
                );
                filePath = uploadedFile.publicUrl;
              }

              const createdItem = await persistNewMediaItem({
                projectId: draft.ownerType === "project" ? projectDraft.id : null,
                unitId: draft.ownerType === "unit" ? draft.unitId : null,
                title: draft.title.trim(),
                mediaType: draft.mediaType,
                filePath,
                altText: draft.altText.trim(),
                isPublished: draft.isPublished,
                sortOrder: mediaItems.length + 1,
              });
              const message = "Nova media kartica je dodata.";
              setFeedback(message);

              return { status: "saved", message, item: createdItem };
            } catch (error) {
              const message = getErrorMessage(error);
              setFeedback(message);
              return { status: "failed", message };
            }
          }}
          onDelete={async (item) => {
            if (!isSupabaseConfigured) {
              const message = "Media kartica je uklonjena samo iz lokalnog fallback prikaza jer Supabase env nije podesen.";
              setFeedback(message);
              return { status: "local", message, deletedId: item.id };
            }

            try {
              await persistDeleteMediaItem(item.id);
              const message = "Media kartica je uklonjena. Fajl u Storage-u nije obrisan.";
              setFeedback(message);
              return { status: "saved", message, deletedId: item.id };
            } catch (error) {
              const message = getErrorMessage(error);
              setFeedback(message);
              return { status: "failed", message };
            }
          }}
        />
      ) : null}
      </main>
    </>
  );
};

type OverviewPanelProps = {
  inquiries: AdminInquiry[];
  landOffers: AdminLandOffer[];
  units: AdminUnit[];
  mediaItems: AdminMediaItem[];
};

const OverviewPanel = ({ inquiries, landOffers, units, mediaItems }: OverviewPanelProps) => {
  const newInquiries = inquiries.filter((item) => item.adminStatus === "new");
  const newLandOffers = landOffers.filter((item) => item.adminStatus === "new");
  const availableUnits = units.filter((unit) => unit.status === "available" && unit.isPublished);
  const reservedUnits = units.filter((unit) => unit.status === "reserved");
  const soldUnits = units.filter((unit) => unit.status === "sold");
  const hiddenUnits = units.filter((unit) => !unit.isPublished);
  const publishedMedia = mediaItems.filter((item) => item.isPublished);
  const mediaAltWarnings = mediaItems.filter(
    (item) => item.isPublished && hasMissingImageAltText(item),
  );

  const recentLeads = [
    ...inquiries.map((item) => ({
      id: `inquiry-${item.id}`,
      kind: "Stan",
      fullName: item.fullName,
      context: item.unitCode ?? "Opsti upit za stan",
      status: item.adminStatus,
      createdAt: item.createdAt,
      href: "/admin/upiti-stanovi",
    })),
    ...landOffers.map((item) => ({
      id: `land-${item.id}`,
      kind: "Plac",
      fullName: item.fullName,
      context: `${item.propertyAddress} · ${item.plotAreaM2} m2`,
      status: item.adminStatus,
      createdAt: item.createdAt,
      href: "/admin/upiti-placevi",
    })),
  ]
    .sort((first, second) => Date.parse(second.createdAt) - Date.parse(first.createdAt))
    .slice(0, 5);

  const priorityItems = [
    {
      label: "Novi upiti za stanove",
      value: newInquiries.length,
      text: "Kupci koji ocekuju brz odgovor ili termin obilaska.",
      href: "/admin/upiti-stanovi",
      icon: Inbox,
    },
    {
      label: "Nove ponude placeva",
      value: newLandOffers.length,
      text: "Leadovi za buduce lokacije i akviziciju.",
      href: "/admin/upiti-placevi",
      icon: MapPinned,
    },
    {
      label: "Slobodni stanovi",
      value: availableUnits.length,
      text: "Javno objavljene jedinice koje se mogu odmah ponuditi.",
      href: "/admin/stanovi",
      icon: Home,
    },
    {
      label: "Za proveru",
      value: hiddenUnits.length + mediaAltWarnings.length,
      text:
        hiddenUnits.length > 0 || mediaAltWarnings.length > 0
          ? "Sakriveni stanovi ili objavljene slike bez alt teksta."
          : "Nema kriticnih upozorenja za objavu.",
      href: hiddenUnits.length > 0 ? "/admin/stanovi" : "/admin/fajlovi",
      icon: AlertTriangle,
      tone: hiddenUnits.length > 0 || mediaAltWarnings.length > 0 ? "warning" : "calm",
    },
  ];

  const quickActions = [
    {
      label: "Promeni status stana",
      text: "Azurirajte slobodno, rezervisano ili prodato odmah posle razgovora.",
      href: "/admin/stanovi",
      icon: Home,
    },
    {
      label: "Pregledaj nove upite",
      text: "Otvorite inbox kupaca i sacuvajte belesku posle kontakta.",
      href: "/admin/upiti-stanovi",
      icon: Inbox,
    },
    {
      label: "Dodaj sliku ili tlocrt",
      text: "Povezite novi asset sa projektom ili konkretnim stanom.",
      href: "/admin/fajlovi",
      icon: Images,
    },
    {
      label: "Uredi projekat",
      text: "Osvezite opis, lokaciju, rokove i status radova.",
      href: "/admin/projekat",
      icon: Building2,
    },
  ];

  return (
    <section className="admin-section admin-overview" aria-labelledby="admin-overview-title">
      <div className="admin-overview-grid">
        <article className="admin-overview-card admin-overview-card--wide">
          <div className="admin-overview-card__head">
            <div>
              <p className="section-eyebrow">Prioriteti danas</p>
              <h2 id="admin-overview-title">Sta prvo trazi reakciju</h2>
            </div>
            <Inbox aria-hidden="true" />
          </div>

          <div className="admin-overview-priority-grid">
            {priorityItems.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  className={`admin-overview-priority${
                    item.tone === "warning" ? " admin-overview-priority--warning" : ""
                  }`}
                  to={item.href}
                  key={item.label}
                >
                  <span className="admin-overview-priority__icon">
                    <Icon aria-hidden="true" />
                  </span>
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                  <p>{item.text}</p>
                </Link>
              );
            })}
          </div>
        </article>

        <article className="admin-overview-card">
          <div className="admin-overview-card__head">
            <div>
              <p className="section-eyebrow">Inventar</p>
              <h2>Stanovi u prodaji</h2>
            </div>
            <Home aria-hidden="true" />
          </div>

          <div className="admin-overview-inventory" aria-label="Statusi stanova">
            <div>
              <strong>{availableUnits.length}</strong>
              <span>Slobodno</span>
            </div>
            <div>
              <strong>{reservedUnits.length}</strong>
              <span>Rezervisano</span>
            </div>
            <div>
              <strong>{soldUnits.length}</strong>
              <span>Prodato</span>
            </div>
          </div>

          <p className="admin-overview-note">
            {hiddenUnits.length > 0
              ? `${hiddenUnits.length} stanova je sakriveno sa javne ponude.`
              : "Svi ucitani stanovi su objavljeni u admin inventaru."}
          </p>
        </article>
      </div>

      <div className="admin-overview-grid admin-overview-grid--bottom">
        <article className="admin-overview-card">
          <div className="admin-overview-card__head">
            <div>
              <p className="section-eyebrow">Brze akcije</p>
              <h2>Najcesci sledeci koraci</h2>
            </div>
            <ArrowUpRight aria-hidden="true" />
          </div>

          <div className="admin-overview-action-grid">
            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <Link className="admin-overview-action" to={action.href} key={action.label}>
                  <Icon aria-hidden="true" />
                  <strong>{action.label}</strong>
                  <span>{action.text}</span>
                </Link>
              );
            })}
          </div>
        </article>

        <article className="admin-overview-card">
          <div className="admin-overview-card__head">
            <div>
              <p className="section-eyebrow">Poslednji leadovi</p>
              <h2>Najnoviji kontakti</h2>
            </div>
            <FileText aria-hidden="true" />
          </div>

          {recentLeads.length > 0 ? (
            <ul className="admin-overview-leads">
              {recentLeads.map((lead) => (
                <li key={lead.id}>
                  <div>
                    <div className="admin-card__badges">
                      <span className="admin-type">{lead.kind}</span>
                      <span className={`admin-status admin-status--${lead.status}`}>
                        {adminStatusLabels[lead.status]}
                      </span>
                    </div>
                    <strong>{lead.fullName}</strong>
                    <p>
                      {lead.context} · {formatDate(lead.createdAt)}
                    </p>
                  </div>
                  <Link to={lead.href} aria-label={`Otvori sekciju za ${lead.fullName}`}>
                    Otvori
                    <ArrowUpRight aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyAdminList
              title="Jos nema leadova."
              text="Kada stigne prvi upit iz modala ili stranice za placeve, pojavice se ovde."
            />
          )}
        </article>
      </div>

      <article className="admin-overview-card admin-overview-health">
        <div>
          <p className="section-eyebrow">Sadrzaj i fajlovi</p>
          <h2>Stanje objavljenih asseta</h2>
          <p>
            Objavljeno je {publishedMedia.length} fajlova.{" "}
            {mediaAltWarnings.length > 0
              ? `${mediaAltWarnings.length} objavljenih slika nema alt tekst i treba ih srediti pre sledeceg SEO kruga.`
              : "Objavljene slike nemaju kriticno alt upozorenje."}
          </p>
        </div>
        <Link className="site-button site-button--outline" to="/admin/fajlovi">
          Otvori fajlove
          <ArrowUpRight aria-hidden="true" />
        </Link>
      </article>
    </section>
  );
};

type InquiryPanelProps = {
  inquiries: AdminInquiry[];
  query: string;
  statusFilter: "all" | AdminWorkflowStatus;
  onQueryChange: (query: string) => void;
  onStatusFilterChange: (status: "all" | AdminWorkflowStatus) => void;
  onUpdate: (items: AdminInquiry[]) => void;
  onPersist: (id: string, changes: Partial<AdminInquiry>) => Promise<AdminPersistResult>;
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
  const [cardFeedback, setCardFeedback] = useState<Record<string, AdminCardFeedback>>({});
  const filtered = filterWorkflowItems(inquiries, query, statusFilter);

  const patchInquiry = (id: string, changes: Partial<AdminInquiry>) => {
    onUpdate(inquiries.map((item) => (item.id === id ? { ...item, ...changes } : item)));
  };

  const showCardFeedback = (id: string, feedback: AdminCardFeedback) => {
    setCardFeedback((current) => ({ ...current, [id]: feedback }));
  };

  const persistInquiryChanges = async (
    id: string,
    changes: Partial<AdminInquiry>,
    successMessage = "Upit je sacuvan.",
  ) => {
    patchInquiry(id, changes);
    showCardFeedback(id, { tone: "pending", message: "Cuvanje izmene..." });

    const result = await onPersist(id, changes);

    showCardFeedback(id, createCardPersistFeedback(result, successMessage));
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

        {filtered.map((inquiry) => {
          const sourceHref = getSafeAdminSourceHref(inquiry.sourcePage);

          return (
            <article className="admin-card" key={inquiry.id}>
            <div className="admin-card__head">
              <div>
                <div className="admin-card__badges">
                  <span className={`admin-status admin-status--${inquiry.adminStatus}`}>
                    {adminStatusLabels[inquiry.adminStatus]}
                  </span>
                  <span className={`admin-type admin-type--${inquiry.inquiryType}`}>
                    {inquiryTypeLabels[inquiry.inquiryType]}
                  </span>
                </div>
                <h2>{inquiry.fullName}</h2>
                <p>
                  {inquiry.unitCode ?? "Opsti upit"} · {formatDate(inquiry.createdAt)}
                </p>
              </div>
              <WorkflowSelect
                value={inquiry.adminStatus}
                onChange={(adminStatus) =>
                  void persistInquiryChanges(inquiry.id, { adminStatus }, "Status upita je sacuvan.")
                }
              />
            </div>

            <div className="admin-contact-grid">
              {inquiry.phone ? (
                <a href={`tel:${inquiry.phone}`}>
                  <Phone />
                  {inquiry.phone}
                </a>
              ) : (
                <span className="admin-contact-grid__empty">
                  <Phone />
                  Telefon nije ostavljen
                </span>
              )}
              <a href={`mailto:${inquiry.email}`}>
                <Mail />
                {inquiry.email}
              </a>
            </div>

            <div className="admin-card__links" aria-label="Kontekst upita">
              {inquiry.unitCode ? (
                <a href={getApartmentPublicPath(inquiry.unitCode)} target="_blank" rel="noopener noreferrer">
                  Otvori stan
                  <ArrowUpRight />
                </a>
              ) : null}
              {sourceHref ? (
                <a href={sourceHref} target="_blank" rel="noopener noreferrer">
                  Izvor upita
                  <ArrowUpRight />
                </a>
              ) : null}
            </div>

            <p className="admin-card__message">{inquiry.message}</p>

            <label className="form-field">
              <span className="form-label">Interna beleska</span>
              <textarea
                className="form-textarea admin-note"
                value={inquiry.adminNote}
                onChange={(event) => patchInquiry(inquiry.id, { adminNote: event.target.value })}
              />
            </label>
            <div className="admin-note-actions">
              <button
                className="site-button site-button--outline admin-note-save"
                type="button"
                onClick={() =>
                  void persistInquiryChanges(
                    inquiry.id,
                    { adminNote: inquiry.adminNote },
                    "Beleska je sacuvana.",
                  )
                }
              >
                <Save />
                Sacuvaj belesku
              </button>
            </div>
            <AdminCardFeedbackMessage feedback={cardFeedback[inquiry.id]} />
            </article>
          );
        })}
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
  onPersist: (id: string, changes: Partial<AdminLandOffer>) => Promise<AdminPersistResult>;
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
  const [cardFeedback, setCardFeedback] = useState<Record<string, AdminCardFeedback>>({});
  const filtered = filterWorkflowItems(offers, query, statusFilter);

  const patchOffer = (id: string, changes: Partial<AdminLandOffer>) => {
    onUpdate(offers.map((item) => (item.id === id ? { ...item, ...changes } : item)));
  };

  const showCardFeedback = (id: string, feedback: AdminCardFeedback) => {
    setCardFeedback((current) => ({ ...current, [id]: feedback }));
  };

  const persistOfferChanges = async (
    id: string,
    changes: Partial<AdminLandOffer>,
    successMessage = "Ponuda placa je sacuvana.",
  ) => {
    patchOffer(id, changes);
    showCardFeedback(id, { tone: "pending", message: "Cuvanje izmene..." });

    const result = await onPersist(id, changes);

    showCardFeedback(id, createCardPersistFeedback(result, successMessage));
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

        {filtered.map((offer) => {
          const sourceHref = getSafeAdminSourceHref(offer.sourcePage);

          return (
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
                onChange={(adminStatus) =>
                  void persistOfferChanges(offer.id, { adminStatus }, "Status ponude je sacuvan.")
                }
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

            {sourceHref ? (
              <div className="admin-card__links" aria-label="Kontekst ponude">
                <a href={sourceHref} target="_blank" rel="noopener noreferrer">
                  Izvor ponude
                  <ArrowUpRight />
                </a>
              </div>
            ) : null}

            <p className="admin-card__message">{offer.details}</p>

            <label className="form-field">
              <span className="form-label">Interna beleska</span>
              <textarea
                className="form-textarea admin-note"
                value={offer.adminNote}
                onChange={(event) => patchOffer(offer.id, { adminNote: event.target.value })}
              />
            </label>
            <div className="admin-note-actions">
              <button
                className="site-button site-button--outline admin-note-save"
                type="button"
                onClick={() =>
                  void persistOfferChanges(
                    offer.id,
                    { adminNote: offer.adminNote },
                    "Beleska je sacuvana.",
                  )
                }
              >
                <Save />
                Sacuvaj belesku
              </button>
            </div>
            <AdminCardFeedbackMessage feedback={cardFeedback[offer.id]} />
            </article>
          );
        })}
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
  onPersist: (id: string, changes: Partial<AdminUnit>) => Promise<AdminPersistResult>;
};

const UnitPanel = ({ units, onUpdate, onPersist }: UnitPanelProps) => {
  const [unitQuery, setUnitQuery] = useState("");
  const [unitStatusFilter, setUnitStatusFilter] = useState<"all" | AdminUnitStatus>("all");
  const [floorFilter, setFloorFilter] = useState("all");
  const [publishFilter, setPublishFilter] = useState<"all" | "published" | "hidden">("all");
  const [descriptionDrafts, setDescriptionDrafts] = useState<Record<string, string>>({});
  const [contentDrafts, setContentDrafts] = useState<Record<string, AdminUnitContentDraft>>({});
  const [activeContentUnitId, setActiveContentUnitId] = useState<string | null>(null);
  const [unitFeedback, setUnitFeedback] = useState<Record<string, AdminCardFeedback>>({});

  const floorOptions = useMemo(
    () =>
      Array.from(new Set(units.map((unit) => unit.floorLabel).filter(Boolean))).sort(
        (firstFloor, secondFloor) => getSortNumber(firstFloor) - getSortNumber(secondFloor),
      ),
    [units],
  );

  const filteredUnits = useMemo(
    () =>
      units.filter((unit) => {
        const normalizedQuery = unitQuery.trim().toLowerCase();
        const searchable = [
          unit.unitCode,
          unit.floorLabel,
          unit.areaM2,
          unit.roomStructure,
          unit.shortDescription,
          unit.fullDescription,
          unit.seoTitle,
          unit.seoDescription,
          unit.planVariant,
        ]
          .join(" ")
          .toLowerCase();
        const matchesQuery = !normalizedQuery || searchable.includes(normalizedQuery);
        const matchesStatus = unitStatusFilter === "all" || unit.status === unitStatusFilter;
        const matchesFloor = floorFilter === "all" || unit.floorLabel === floorFilter;
        const matchesPublish =
          publishFilter === "all" ||
          (publishFilter === "published" ? unit.isPublished : !unit.isPublished);

        return matchesQuery && matchesStatus && matchesFloor && matchesPublish;
      }),
    [floorFilter, publishFilter, unitQuery, unitStatusFilter, units],
  );

  const persistUnitChange = async (
    unit: AdminUnit,
    changes: Partial<AdminUnit>,
    successMessage: string,
  ) => {
    const previousUnit = unit;

    setUnitFeedback((current) => ({
      ...current,
      [unit.id]: { tone: "pending", message: "Cuvanje izmene..." },
    }));
    onUpdate(units.map((item) => (item.id === unit.id ? { ...item, ...changes } : item)));

    const result = await onPersist(unit.id, changes);

    if (result.status === "failed") {
      onUpdate(units.map((item) => (item.id === unit.id ? previousUnit : item)));
    }

    setUnitFeedback((current) => ({
      ...current,
      [unit.id]: createCardPersistFeedback(result, successMessage),
    }));
  };

  const saveDescription = async (unit: AdminUnit) => {
    const draft = (descriptionDrafts[unit.id] ?? "").trim();

    if (!draft) {
      setUnitFeedback((current) => ({
        ...current,
        [unit.id]: {
          tone: "error",
          message: "Kratak opis ne sme biti prazan jer se prikazuje na javnoj ponudi.",
        },
      }));
      return;
    }

    if (draft === unit.shortDescription) {
      setUnitFeedback((current) => ({
        ...current,
        [unit.id]: { tone: "success", message: "Nema novih izmena za cuvanje." },
      }));
      return;
    }

    await persistUnitChange(unit, { shortDescription: draft }, "Kratak opis stana je sacuvan.");
  };

  const updateContentDraft = (unit: AdminUnit, changes: Partial<AdminUnitContentDraft>) => {
    setContentDrafts((current) => ({
      ...current,
      [unit.id]: {
        ...createUnitContentDraft(unit),
        ...current[unit.id],
        ...changes,
      },
    }));
  };

  const saveContent = async (unit: AdminUnit) => {
    const draft = contentDrafts[unit.id] ?? createUnitContentDraft(unit);
    const fullDescription = draft.fullDescription.trim();
    const seoTitle = draft.seoTitle.trim();
    const seoDescription = draft.seoDescription.trim();

    if (!fullDescription) {
      setUnitFeedback((current) => ({
        ...current,
        [unit.id]: {
          tone: "error",
          message: "Opis detalja ne sme biti prazan jer se prikazuje na stranici stana.",
        },
      }));
      return;
    }

    if (
      fullDescription === unit.fullDescription &&
      seoTitle === unit.seoTitle &&
      seoDescription === unit.seoDescription
    ) {
      setUnitFeedback((current) => ({
        ...current,
        [unit.id]: { tone: "success", message: "Nema novih content/SEO izmena za cuvanje." },
      }));
      return;
    }

    await persistUnitChange(
      unit,
      { fullDescription, seoTitle, seoDescription },
      "Opis detalja i SEO polja su sacuvani.",
    );
  };

  return (
    <section className="admin-section">
      <div className="admin-toolbar">
        <label className="admin-search">
          <Search />
          <span className="sr-only">Pretraga stanova</span>
          <input
            type="search"
            placeholder="Pretrazite stan, etazu, strukturu ili opis..."
            value={unitQuery}
            onChange={(event) => setUnitQuery(event.target.value)}
          />
        </label>

        <label className="admin-filter">
          <Filter />
          <span>Status</span>
          <select
            value={unitStatusFilter}
            onChange={(event) => setUnitStatusFilter(event.target.value as "all" | AdminUnitStatus)}
          >
            <option value="all">Svi statusi</option>
            {unitStatuses.map((status) => (
              <option key={status} value={status}>
                {adminUnitStatusLabels[status]}
              </option>
            ))}
          </select>
        </label>

        <label className="admin-filter">
          <span>Etaza</span>
          <select value={floorFilter} onChange={(event) => setFloorFilter(event.target.value)}>
            <option value="all">Sve etaze</option>
            {floorOptions.map((floor) => (
              <option key={floor} value={floor}>
                {floor}
              </option>
            ))}
          </select>
        </label>

        <label className="admin-filter">
          <span>Objava</span>
          <select
            value={publishFilter}
            onChange={(event) =>
              setPublishFilter(event.target.value as "all" | "published" | "hidden")
            }
          >
            <option value="all">Svi stanovi</option>
            <option value="published">Objavljeni</option>
            <option value="hidden">Sakriveni</option>
          </select>
        </label>
      </div>

      <div className="admin-unit-summary" role="status">
        Prikazano {filteredUnits.length} od {units.length} stanova. Status i objava se cuvaju odmah;
        kratak opis cuvajte dugmetom po stanu.
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Jedinica</th>
              <th>Detalji</th>
              <th>Status</th>
              <th>Kratak opis za javnu ponudu</th>
              <th>Tlocrt i javni prikaz</th>
              <th>Objava</th>
            </tr>
          </thead>
          <tbody>
            {filteredUnits.map((unit) => {
              const descriptionDraft = descriptionDrafts[unit.id] ?? unit.shortDescription;
              const hasDescriptionChange = descriptionDraft.trim() !== unit.shortDescription;
              const contentDraft = contentDrafts[unit.id] ?? createUnitContentDraft(unit);
              const hasContentChange =
                contentDraft.fullDescription.trim() !== unit.fullDescription ||
                contentDraft.seoTitle.trim() !== unit.seoTitle ||
                contentDraft.seoDescription.trim() !== unit.seoDescription;
              const isContentOpen = activeContentUnitId === unit.id;

              return (
              <Fragment key={unit.id}>
              <tr>
                <td>
                  <strong>{unit.unitCode}</strong>
                  <span>{formatUnitType(unit.unitType)}</span>
                  <a
                    className="admin-table-link"
                    href={unit.publicPath ?? getApartmentPublicPath(unit.unitCode)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Javni detalj
                    <ArrowUpRight />
                  </a>
                </td>
                <td>
                  <dl className="admin-unit-facts">
                    <div>
                      <dt>Etaza</dt>
                      <dd>{unit.floorLabel}</dd>
                    </div>
                    <div>
                      <dt>Povrsina</dt>
                      <dd>{unit.areaM2}</dd>
                    </div>
                    <div>
                      <dt>Struktura</dt>
                      <dd>{unit.roomStructure}</dd>
                    </div>
                  </dl>
                </td>
                <td>
                  <span className={`admin-unit-status admin-unit-status--${unit.status}`}>
                    {adminUnitStatusLabels[unit.status]}
                  </span>
                  <select
                    className="admin-table-select"
                    aria-label={`Promeni status za ${unit.unitCode}`}
                    value={unit.status}
                    onChange={(event) =>
                      void persistUnitChange(
                        unit,
                        { status: event.target.value as AdminUnitStatus },
                        "Status stana je sacuvan.",
                      )
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
                  <label className="admin-unit-description">
                    <span>Opis na kartici/detalju</span>
                    <textarea
                      value={descriptionDraft}
                      rows={3}
                      maxLength={220}
                      onChange={(event) =>
                        setDescriptionDrafts((current) => ({
                          ...current,
                          [unit.id]: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <div className="admin-unit-description__actions">
                    <small>{descriptionDraft.trim().length}/220</small>
                    <button
                      className="site-button site-button--outline admin-note-save"
                      type="button"
                      disabled={!hasDescriptionChange}
                      onClick={() => void saveDescription(unit)}
                    >
                      <Save />
                      Sacuvaj opis
                    </button>
                  </div>
                  <AdminCardFeedbackMessage feedback={unitFeedback[unit.id]} />
                </td>
                <td>
                  <div className="admin-unit-assets">
                    {unit.floorPlanPath ? (
                      <a href={unit.floorPlanPath} target="_blank" rel="noopener noreferrer">
                        Tlocrt spreman
                        <ArrowUpRight />
                      </a>
                    ) : (
                      <span className="admin-unit-warning">
                        <AlertTriangle />
                        Nedostaje tlocrt
                      </span>
                    )}
                    <small>{unit.planVariant ? formatPlanVariant(unit.planVariant) : "Plan nije oznacen"}</small>
                    <button
                      className="admin-table-secondary-action"
                      type="button"
                      onClick={() => setActiveContentUnitId(isContentOpen ? null : unit.id)}
                    >
                      <FileText />
                      {isContentOpen ? "Sakrij opis/SEO" : "Opis i SEO"}
                    </button>
                  </div>
                </td>
                <td>
                  <label className="admin-toggle">
                    <input
                      type="checkbox"
                      checked={unit.isPublished}
                      onChange={(event) =>
                        void persistUnitChange(
                          unit,
                          { isPublished: event.target.checked },
                          event.target.checked ? "Stan je objavljen." : "Stan je sakriven.",
                        )
                      }
                    />
                    <span>{unit.isPublished ? "Objavljeno" : "Sakriveno"}</span>
                  </label>
                </td>
              </tr>
              {isContentOpen ? (
                <tr className="admin-unit-content-row">
                  <td colSpan={6}>
                    <div className="admin-unit-content-editor">
                      <div className="admin-unit-content-editor__head">
                        <div>
                          <strong>Opis detalja i SEO za {unit.unitCode}</strong>
                          <p>
                            Ova polja hrane stranicu detalja stana kada su podaci
                            ucitani iz Supabase baze.
                          </p>
                        </div>
                        <a
                          className="admin-table-link"
                          href={unit.publicPath ?? getApartmentPublicPath(unit.unitCode)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Pogledaj javno
                          <ArrowUpRight />
                        </a>
                      </div>

                      <div className="admin-unit-content-editor__grid">
                        <label className="form-field">
                          <span className="form-label">Opis na detalju stana *</span>
                          <textarea
                            className="form-textarea"
                            rows={5}
                            value={contentDraft.fullDescription}
                            onChange={(event) =>
                              updateContentDraft(unit, { fullDescription: event.target.value })
                            }
                          />
                        </label>

                        <div className="admin-unit-seo-fields">
                          <label className="form-field">
                            <span className="form-label">SEO title</span>
                            <input
                              className="form-input"
                              maxLength={70}
                              value={contentDraft.seoTitle}
                              placeholder={`Stan ${unit.unitCode.replace(/\D/g, "")} | Heroja Pinkija 13`}
                              onChange={(event) =>
                                updateContentDraft(unit, { seoTitle: event.target.value })
                              }
                            />
                            <small>{contentDraft.seoTitle.trim().length}/70</small>
                          </label>

                          <label className="form-field">
                            <span className="form-label">SEO description</span>
                            <textarea
                              className="form-textarea"
                              rows={3}
                              maxLength={170}
                              value={contentDraft.seoDescription}
                              placeholder="Kratak opis stana za search/social preview."
                              onChange={(event) =>
                                updateContentDraft(unit, { seoDescription: event.target.value })
                              }
                            />
                            <small>{contentDraft.seoDescription.trim().length}/170</small>
                          </label>
                        </div>
                      </div>

                      <div className="admin-unit-content-editor__actions">
                        <p>
                          Preporuka: title do 60-70 karaktera, description do 150-170.
                        </p>
                        <button
                          className="site-button site-button--dark"
                          type="button"
                          disabled={!hasContentChange}
                          onClick={() => void saveContent(unit)}
                        >
                          <Save />
                          Sacuvaj opis i SEO
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : null}
              </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredUnits.length === 0 ? (
        <div className="admin-empty-state">
          <strong>Nema stanova za izabrane filtere.</strong>
          <p>Promenite pretragu, status, etazu ili filter objave.</p>
        </div>
      ) : null}
    </section>
  );
};

type ProjectPanelProps = {
  projectDraft: AdminProjectDraft;
  constructionUpdates: AdminConstructionUpdate[];
  units: AdminUnit[];
  mediaItems: AdminMediaItem[];
  onUpdate: (project: AdminProjectDraft) => void;
  onConstructionUpdatesUpdate: (updates: AdminConstructionUpdate[]) => void;
  onPersist: (project: AdminProjectDraft) => void;
  onConstructionUpdatePersist: (
    id: string,
    changes: Partial<AdminConstructionUpdate>,
  ) => Promise<AdminPersistResult>;
};

type ProjectCoverageStatus = "connected" | "attention" | "static";

const projectStatusLabels: Record<AdminProjectDraft["projectStatus"], string> = {
  planned: "Planirano",
  active: "Aktivno",
  completed: "Zavrseno",
  hidden: "Sakriveno",
};

const timelineStateLabels: Record<AdminConstructionUpdate["timelineState"], string> = {
  done: "Zavrseno",
  active: "Aktuelno",
  upcoming: "Planirano",
};

const ProjectPanel = ({
  projectDraft,
  constructionUpdates,
  units,
  mediaItems,
  onUpdate,
  onConstructionUpdatesUpdate,
  onPersist,
  onConstructionUpdatePersist,
}: ProjectPanelProps) => {
  const [constructionFeedback, setConstructionFeedback] = useState<
    Record<string, AdminCardFeedback | undefined>
  >({});
  const updateProject = (changes: Partial<AdminProjectDraft>) => {
    onUpdate({ ...projectDraft, ...changes });
  };

  const handleProjectSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onPersist(projectDraft);
  };

  const updateConstructionStep = (
    id: string,
    changes: Partial<AdminConstructionUpdate>,
  ) => {
    onConstructionUpdatesUpdate(
      constructionUpdates.map((step) => (step.id === id ? { ...step, ...changes } : step)),
    );
    setConstructionFeedback((current) => ({
      ...current,
      [id]: { tone: "pending", message: "Lokalna izmena nije sacuvana." },
    }));
  };
  const saveConstructionStep = async (step: AdminConstructionUpdate) => {
    setConstructionFeedback((current) => ({
      ...current,
      [step.id]: { tone: "pending", message: "Cuvanje statusa radova..." },
    }));
    const result = await onConstructionUpdatePersist(step.id, step);
    setConstructionFeedback((current) => ({
      ...current,
      [step.id]: {
        tone: result.status === "failed" ? "error" : "success",
        message: result.message,
      },
    }));
  };
  const publishedUnits = units.filter((unit) => unit.isPublished);
  const availableUnits = publishedUnits.filter((unit) => unit.status === "available");
  const publishedProjectImages = mediaItems.filter(
    (item) =>
      item.isPublished &&
      (item.projectId === projectDraft.id ||
        item.mediaType === "project_image" ||
        item.mediaType === "construction_update_image"),
  );
  const projectSeoReady = Boolean(
    projectDraft.seoTitle.trim() && projectDraft.seoDescription.trim(),
  );
  const projectDatesReady = Boolean(
    projectDraft.constructionStartDate && projectDraft.constructionEndDate,
  );
  const projectCoverage: Array<{
    title: string;
    detail: string;
    meta: string;
    status: ProjectCoverageStatus;
  }> = [
    {
      title: "Hero i osnovni opis",
      detail: projectDraft.shortDescription.trim()
        ? "Javna strana moze da koristi naziv, status i kratak opis projekta."
        : "Dodajte kratak opis koji odmah objasnjava lokaciju i tip ponude.",
      meta: "projects.name, status_label, short_description",
      status: projectDraft.shortDescription.trim() ? "connected" : "attention",
    },
    {
      title: "Detaljan opis projekta",
      detail: projectDraft.fullDescription.trim()
        ? "Dugi opis je spreman za SEO, structured data i buduce javne sekcije."
        : "Unesite opis koji jasno razdvaja stanove, poslovni deo, garaze i ostave.",
      meta: "projects.full_description",
      status: projectDraft.fullDescription.trim() ? "connected" : "attention",
    },
    {
      title: "Lokacija",
      detail: projectDraft.locationDescription.trim()
        ? "Lokacijski tekst postoji i moze da hrani javnu sekciju lokacije."
        : "Dodajte tekst o mikro-lokaciji, saobracaju i sadrzajima u blizini.",
      meta: "projects.location_description",
      status: projectDraft.locationDescription.trim() ? "connected" : "attention",
    },
    {
      title: "Rokovi i status radova",
      detail: projectDatesReady
        ? "Pocetak i planirani zavrsetak su popunjeni za prikaz rokova."
        : "Unesite pocetak i planirani zavrsetak da kupci dobiju jasan okvir.",
      meta: "projects.construction_* + status_label",
      status: projectDatesReady ? "connected" : "attention",
    },
    {
      title: "Ponuda stanova",
      detail: `${publishedUnits.length} objavljenih stanova, od toga ${availableUnits.length} slobodnih.`,
      meta: "units.is_published + units.status",
      status: publishedUnits.length > 0 ? "connected" : "attention",
    },
    {
      title: "Slike projekta",
      detail: `${publishedProjectImages.length} objavljenih slika projekta/statusa radova u media biblioteci.`,
      meta: "project_media",
      status: publishedProjectImages.length > 0 ? "connected" : "attention",
    },
    {
      title: "SEO naslov i opis",
      detail: projectSeoReady
        ? "SEO polja su popunjena i spremna za javni meta sloj."
        : "Popunite naslov i opis da svaka izmena projekta ima dobar share/search preview.",
      meta: "projects.seo_*",
      status: projectSeoReady ? "connected" : "attention",
    },
    {
      title: "Parking, ostave i prednosti",
      detail:
        "Ove prodajne sekcije su trenutno kvalitetno postavljene u kodu; za pun CMS treba zaseban model sekcija ili page_sections.",
      meta: "staticki v1 sadrzaj",
      status: "static",
    },
  ];
  const connectedCoverage = projectCoverage.filter((item) => item.status === "connected").length;
  const actionableCoverage = projectCoverage.filter((item) => item.status !== "static").length;
  const coveragePercent = Math.round((connectedCoverage / actionableCoverage) * 100);

  return (
    <section className="admin-section admin-project-panel">
      <div className="admin-project-hero">
        <div>
          <p className="section-eyebrow">Upravljanje projektom</p>
          <h2>{projectDraft.name}</h2>
          <p>
            Ovaj panel prati javnu stranu “O projektu”: osnovni hero, lokaciju,
            rokove, ponudu stanova, media biblioteku i SEO spremnost.
          </p>
        </div>
        <div className="admin-project-hero__actions">
          <Link
            className="site-button site-button--outline"
            to="/projekti/heroja-pinkija-13/o-projektu"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Eye />
            Otvori javnu stranu
          </Link>
          <Link
            className="site-button site-button--dark"
            to="/admin/stanovi"
          >
            <Home />
            Statusi stanova
          </Link>
        </div>
      </div>

      <div className="admin-project-metrics">
        <article>
          <span>Spremnost sadrzaja</span>
          <strong>{coveragePercent}%</strong>
          <p>{connectedCoverage}/{actionableCoverage} povezanih oblasti je popunjeno.</p>
        </article>
        <article>
          <span>Objavljeni stanovi</span>
          <strong>{publishedUnits.length}</strong>
          <p>{availableUnits.length} slobodnih stanova u javnoj ponudi.</p>
        </article>
        <article>
          <span>Slike projekta</span>
          <strong>{publishedProjectImages.length}</strong>
          <p>Objavljeni hero/status vizuali u media biblioteci.</p>
        </article>
        <article>
          <span>Status</span>
          <strong>{projectStatusLabels[projectDraft.projectStatus]}</strong>
          <p>{projectDraft.statusLabel || "Dodajte javnu oznaku statusa."}</p>
        </article>
      </div>

      <div className="admin-project-layout">
        <div className="admin-project-checklist" aria-label="Pregled javnih sekcija projekta">
          {projectCoverage.map((item) => (
            <article
              className={`admin-project-check admin-project-check--${item.status}`}
              key={item.title}
            >
              <div>
                {item.status === "connected" ? <CheckCircle2 /> : null}
                {item.status === "attention" ? <AlertTriangle /> : null}
                {item.status === "static" ? <Clock3 /> : null}
              </div>
              <div>
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
                <span>{item.meta}</span>
              </div>
            </article>
          ))}
        </div>

        <aside className="admin-project-preview" aria-label="Brzi pregled javnog projekta">
          <p className="section-eyebrow">Brzi preview</p>
          <h3>{projectDraft.name}</h3>
          <dl>
            <div>
              <dt>Adresa</dt>
              <dd>{projectDraft.address}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{projectDraft.statusLabel || projectStatusLabels[projectDraft.projectStatus]}</dd>
            </div>
            <div>
              <dt>Spratnost</dt>
              <dd>{projectDraft.floorStructure || "Nije uneto"}</dd>
            </div>
            <div>
              <dt>Planirani zavrsetak</dt>
              <dd>{projectDraft.constructionEndDate || "Nije uneto"}</dd>
            </div>
          </dl>
          <p>
            Za punu CMS kontrolu naredni korak je da parking/ostave, benefiti i
            timeline dobiju posebne uredjive sekcije, a ne samo osnovna polja projekta.
          </p>
        </aside>
      </div>

      <div className="admin-construction-editor" aria-label="Uredjivanje statusa radova">
        <div className="admin-construction-editor__head">
          <div>
            <p className="section-eyebrow">Status radova</p>
            <h3>Timeline koji se prikazuje na javnoj strani.</h3>
            <p>
              Koraci su povezani sa `construction_updates` tabelom. Objavljeni
              koraci hrane javni timeline, a sakriveni ostaju samo u adminu.
            </p>
          </div>
        </div>

        <div className="admin-construction-grid">
          {constructionUpdates.map((step) => {
            const feedback = constructionFeedback[step.id];

            return (
              <article className="admin-construction-card" key={step.id}>
                <div className="admin-construction-card__top">
                  <span>{timelineStateLabels[step.timelineState]}</span>
                  <label className="admin-toggle">
                    <input
                      type="checkbox"
                      checked={step.isPublished}
                      onChange={(event) =>
                        updateConstructionStep(step.id, { isPublished: event.target.checked })
                      }
                    />
                    Objavljeno
                  </label>
                </div>

                <label className="form-field">
                  <span className="form-label">Naslov koraka</span>
                  <input
                    className="form-input"
                    value={step.title}
                    onChange={(event) =>
                      updateConstructionStep(step.id, { title: event.target.value })
                    }
                  />
                </label>

                <div className="admin-construction-card__fields">
                  <label className="form-field">
                    <span className="form-label">Datum</span>
                    <input
                      className="form-input"
                      type="date"
                      value={step.updateDate}
                      onChange={(event) =>
                        updateConstructionStep(step.id, { updateDate: event.target.value })
                      }
                    />
                  </label>
                  <label className="form-field">
                    <span className="form-label">Redosled</span>
                    <input
                      className="form-input"
                      type="number"
                      min="0"
                      value={step.sortOrder}
                      onChange={(event) =>
                        updateConstructionStep(step.id, {
                          sortOrder: Number(event.target.value) || 0,
                        })
                      }
                    />
                  </label>
                </div>

                <div className="admin-construction-card__fields">
                  <label className="form-field">
                    <span className="form-label">Oznaka</span>
                    <input
                      className="form-input"
                      value={step.tag}
                      onChange={(event) =>
                        updateConstructionStep(step.id, { tag: event.target.value })
                      }
                    />
                  </label>
                  <label className="form-field">
                    <span className="form-label">Stanje</span>
                    <select
                      className="form-select"
                      value={step.timelineState}
                      onChange={(event) =>
                        updateConstructionStep(step.id, {
                          timelineState: event.target.value as AdminConstructionUpdate["timelineState"],
                        })
                      }
                    >
                      {Object.entries(timelineStateLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="form-field">
                  <span className="form-label">Javni status label</span>
                  <input
                    className="form-input"
                    value={step.statusLabel}
                    onChange={(event) =>
                      updateConstructionStep(step.id, { statusLabel: event.target.value })
                    }
                    placeholder={timelineStateLabels[step.timelineState]}
                  />
                </label>

                <label className="form-field">
                  <span className="form-label">Opis za javni timeline</span>
                  <textarea
                    className="form-textarea"
                    value={step.shortDescription}
                    onChange={(event) =>
                      updateConstructionStep(step.id, { shortDescription: event.target.value })
                    }
                  />
                </label>

                <AdminCardFeedbackMessage feedback={feedback} />

                <button
                  className="site-button site-button--dark"
                  type="button"
                  onClick={() => void saveConstructionStep(step)}
                >
                  <Save />
                  Sacuvaj korak
                </button>
              </article>
            );
          })}
        </div>
      </div>

      <form className="admin-editor" onSubmit={handleProjectSubmit}>
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

        <label className="form-field">
          <span className="form-label">Javna oznaka statusa</span>
          <input
            className="form-input"
            value={projectDraft.statusLabel}
            onChange={(event) => updateProject({ statusLabel: event.target.value })}
            placeholder="Izgradnja u toku"
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

        <label className="form-field admin-editor__wide">
          <span className="form-label">Hero / kratak opis</span>
          <textarea
            className="form-textarea"
            value={projectDraft.shortDescription}
            onChange={(event) => updateProject({ shortDescription: event.target.value })}
          />
        </label>

        <label className="form-field admin-editor__wide">
          <span className="form-label">Dugi opis projekta</span>
          <textarea
            className="form-textarea"
            value={projectDraft.fullDescription}
            onChange={(event) => updateProject({ fullDescription: event.target.value })}
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

        <label className="form-field admin-editor__wide">
          <span className="form-label">Hero slika / javni URL</span>
          <input
            className="form-input"
            value={projectDraft.heroImageUrl}
            onChange={(event) => updateProject({ heroImageUrl: event.target.value })}
            placeholder="/images/heroja-pinkija-13/gradilisna-tabla.jpg"
          />
        </label>

        <label className="form-field">
          <span className="form-label">SEO naslov</span>
          <input
            className="form-input"
            value={projectDraft.seoTitle}
            onChange={(event) => updateProject({ seoTitle: event.target.value })}
          />
        </label>

        <label className="form-field">
          <span className="form-label">SEO opis</span>
          <textarea
            className="form-textarea"
            value={projectDraft.seoDescription}
            onChange={(event) => updateProject({ seoDescription: event.target.value })}
          />
        </label>

        <button
          className="site-button site-button--dark admin-editor__wide"
          type="submit"
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
  projectDraft: AdminProjectDraft | null;
  units: AdminUnit[];
  onUpdate: (items: AdminMediaItem[]) => void;
  onPersist: (id: string, changes: Partial<AdminMediaItem>) => Promise<AdminPersistResult>;
  onUpload: (item: AdminMediaItem, file: File) => Promise<AdminMediaUploadPersistResult>;
  onCreate: (
    draft: AdminMediaCreateDraft,
    file?: File,
  ) => Promise<AdminMediaCreatePersistResult>;
  onDelete: (item: AdminMediaItem) => Promise<AdminMediaDeletePersistResult>;
};

const createDefaultMediaDraft = (units: AdminUnit[]): AdminMediaCreateDraft => ({
  title: "",
  mediaType: "project_image",
  ownerType: "project",
  unitId: units[0]?.id ?? "",
  filePath: "",
  altText: "",
  isPublished: false,
});

const MediaPanel = ({
  mediaItems,
  projectDraft,
  units,
  onUpdate,
  onPersist,
  onUpload,
  onCreate,
  onDelete,
}: MediaPanelProps) => {
  const [mediaTypeFilter, setMediaTypeFilter] = useState<"all" | AdminMediaItem["mediaType"]>("all");
  const [cardFeedback, setCardFeedback] = useState<Record<string, AdminCardFeedback>>({});
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [uploadingMediaId, setUploadingMediaId] = useState<string | null>(null);
  const [createDraft, setCreateDraft] = useState<AdminMediaCreateDraft>(() =>
    createDefaultMediaDraft(units),
  );
  const [createFile, setCreateFile] = useState<File | null>(null);
  const [createFeedback, setCreateFeedback] = useState<AdminCardFeedback | null>(null);
  const [isCreatingMedia, setIsCreatingMedia] = useState(false);
  const [createFileInputKey, setCreateFileInputKey] = useState(0);
  const availableMediaTypes = useMemo(
    () =>
      Array.from(new Set(mediaItems.map((item) => item.mediaType))).sort((firstType, secondType) =>
        mediaTypeLabels[firstType].localeCompare(mediaTypeLabels[secondType], "sr"),
      ),
    [mediaItems],
  );
  const filteredMediaItems = useMemo(
    () =>
      mediaItems.filter((item) => mediaTypeFilter === "all" || item.mediaType === mediaTypeFilter),
    [mediaItems, mediaTypeFilter],
  );
  const publishedImageWarnings = filteredMediaItems.filter(
    (item) => item.isPublished && isImageMedia(item) && !item.altText.trim(),
  ).length;
  const createDraftNeedsAltText = isImageMediaDraft(createDraft) && !createDraft.altText.trim();

  const patchMedia = (id: string, changes: Partial<AdminMediaItem>) => {
    onUpdate(mediaItems.map((item) => (item.id === id ? { ...item, ...changes } : item)));
  };

  const showCardFeedback = (id: string, feedback: AdminCardFeedback) => {
    setCardFeedback((current) => ({ ...current, [id]: feedback }));
  };

  const removeCardFeedback = (id: string) => {
    setCardFeedback((current) => {
      const next = { ...current };

      delete next[id];

      return next;
    });
  };

  const publishMedia = async (id: string, isPublished: boolean) => {
    const item = mediaItems.find((mediaItem) => mediaItem.id === id);

    if (!item) {
      return;
    }

    if (isPublished && hasMissingImageAltText(item)) {
      showCardFeedback(id, {
        tone: "error",
        message: "Dodajte alt tekst pre objave slike.",
      });
      return;
    }

    const previousItem = item;

    patchMedia(id, { isPublished });
    showCardFeedback(id, { tone: "pending", message: "Cuvanje izmene..." });

    const result = await onPersist(id, { isPublished });

    if (result.status === "failed") {
      onUpdate(mediaItems.map((mediaItem) => (mediaItem.id === id ? previousItem : mediaItem)));
    }

    showCardFeedback(
      id,
      createCardPersistFeedback(
        result,
        isPublished ? "Fajl je objavljen." : "Fajl je sakriven.",
      ),
    );
  };

  const saveMediaMetadata = async (item: AdminMediaItem) => {
    if (item.isPublished && hasMissingImageAltText(item)) {
      showCardFeedback(item.id, {
        tone: "error",
        message: "Objavljena slika mora imati alt tekst pre cuvanja metadata.",
      });
      return;
    }

    showCardFeedback(item.id, { tone: "pending", message: "Cuvanje metadata..." });

    const result = await onPersist(item.id, {
      title: item.title,
      filePath: item.filePath,
      altText: item.altText,
    });

    showCardFeedback(item.id, createCardPersistFeedback(result, "Metadata fajla je sacuvan."));
  };

  const uploadReplacementFile = async (item: AdminMediaItem, file: File) => {
    if (item.isPublished && hasMissingImageAltText(item)) {
      showCardFeedback(item.id, {
        tone: "error",
        message: "Dodajte alt tekst pre zamene objavljene slike.",
      });
      return;
    }

    if (!isAllowedMediaFile(item, file)) {
      showCardFeedback(item.id, {
        tone: "error",
        message: getMediaFileTypeError(item),
      });
      return;
    }

    if (file.size > maxStandardUploadSizeBytes) {
      showCardFeedback(item.id, {
        tone: "error",
        message:
          "Fajl je veci od 6 MB. Za sada uploadujte optimizovan fajl ili uvedite resumable upload za velike fajlove.",
      });
      return;
    }

    setUploadingMediaId(item.id);
    showCardFeedback(item.id, { tone: "pending", message: "Upload fajla je u toku..." });

    try {
      const result = await onUpload(item, file);

      if (result.status !== "failed" && result.filePath) {
        patchMedia(item.id, {
          filePath: result.filePath,
          title: result.title ?? item.title,
        });
      }

      showCardFeedback(
        item.id,
        createCardPersistFeedback(result, "Fajl je uploadovan i povezan."),
      );
    } catch (error) {
      showCardFeedback(item.id, { tone: "error", message: getErrorMessage(error) });
    } finally {
      setUploadingMediaId(null);
    }
  };

  const updateCreateDraft = (changes: Partial<AdminMediaCreateDraft>) => {
    setCreateDraft((current) => ({ ...current, ...changes }));
    setCreateFeedback(null);
  };

  const handleCreateMedia = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedDraft = {
      ...createDraft,
      title: createDraft.title.trim(),
      filePath: createDraft.filePath.trim(),
      altText: createDraft.altText.trim(),
      unitId: createDraft.unitId || units[0]?.id || "",
    };

    if (!normalizedDraft.title) {
      setCreateFeedback({ tone: "error", message: "Unesite naziv media kartice." });
      return;
    }

    if (normalizedDraft.ownerType === "project" && !projectDraft) {
      setCreateFeedback({ tone: "error", message: "Projekat nije ucitan." });
      return;
    }

    if (normalizedDraft.ownerType === "unit" && !normalizedDraft.unitId) {
      setCreateFeedback({ tone: "error", message: "Izaberite stan za ovu media karticu." });
      return;
    }

    if (!normalizedDraft.filePath && !createFile) {
      setCreateFeedback({
        tone: "error",
        message: "Izaberite fajl za upload ili unesite postojecu putanju.",
      });
      return;
    }

    if (normalizedDraft.isPublished && isImageMediaDraft(normalizedDraft) && !normalizedDraft.altText) {
      setCreateFeedback({
        tone: "error",
        message: "Alt tekst je obavezan ako odmah objavljujete sliku.",
      });
      return;
    }

    if (createFile && !isAllowedMediaFile(normalizedDraft, createFile)) {
      setCreateFeedback({ tone: "error", message: getMediaFileTypeError(normalizedDraft) });
      return;
    }

    if (createFile && createFile.size > maxStandardUploadSizeBytes) {
      setCreateFeedback({
        tone: "error",
        message:
          "Fajl je veci od 6 MB. Uploadujte optimizovan fajl ili kasnije uvedite resumable upload.",
      });
      return;
    }

    setIsCreatingMedia(true);
    setCreateFeedback({ tone: "pending", message: "Kreiranje media kartice..." });

    try {
      const result = await onCreate(normalizedDraft, createFile ?? undefined);

      if (result.item) {
        onUpdate([result.item, ...mediaItems]);
        setMediaTypeFilter(result.item.mediaType);
        setCreateDraft(createDefaultMediaDraft(units));
        setCreateFile(null);
        setCreateFileInputKey((current) => current + 1);
      }

      setCreateFeedback(createCardPersistFeedback(result, "Nova media kartica je dodata."));
    } catch (error) {
      setCreateFeedback({ tone: "error", message: getErrorMessage(error) });
    } finally {
      setIsCreatingMedia(false);
    }
  };

  const deleteMediaCard = async (item: AdminMediaItem) => {
    if (deleteConfirmId !== item.id) {
      setDeleteConfirmId(item.id);
      showCardFeedback(item.id, {
        tone: "error",
        message:
          "Kliknite jos jednom na 'Potvrdite uklanjanje' ako zelite da uklonite karticu. Storage fajl nece biti obrisan.",
      });
      return;
    }

    showCardFeedback(item.id, { tone: "pending", message: "Uklanjanje media kartice..." });

    const result = await onDelete(item);

    if (result.status !== "failed") {
      onUpdate(mediaItems.filter((mediaItem) => mediaItem.id !== item.id));
      removeCardFeedback(item.id);
      setDeleteConfirmId(null);
      return;
    }

    showCardFeedback(item.id, createCardPersistFeedback(result, ""));
  };

  return (
    <section className="admin-section">
      <div className="admin-upload-panel">
        <div>
          <FileUp />
          <div>
            <h2>Dodavanje fajla</h2>
            <p>
              Upload ide po media kartici, kako bi se fajl odmah povezao sa tacnim tlocrtom,
              slikom projekta ili PDF dokumentom.
            </p>
          </div>
        </div>
        <span className="admin-upload-panel__badge">Storage: public-assets</span>
      </div>

      <form className="admin-create-media" onSubmit={handleCreateMedia}>
        <div className="admin-create-media__intro">
          <div>
            <p className="section-eyebrow">Nova kartica</p>
            <h2>Dodajte novi fajl u media biblioteku.</h2>
          </div>
          <p>
            Kreirajte zapis za projekat ili konkretan stan. Ako izaberete fajl, upload se radi
            odmah; ako unesete putanju, kartica koristi vec postojeci asset.
          </p>
        </div>

        <label className="form-field">
          <span className="form-label">Naziv</span>
          <input
            className="form-input"
            value={createDraft.title}
            onChange={(event) => updateCreateDraft({ title: event.target.value })}
            aria-invalid={createFeedback?.tone === "error" && !createDraft.title.trim() ? true : undefined}
          />
        </label>

        <label className="form-field">
          <span className="form-label">Tip fajla</span>
          <select
            className="form-select"
            value={createDraft.mediaType}
            onChange={(event) =>
              updateCreateDraft({
                mediaType: event.target.value as AdminMediaItem["mediaType"],
              })
            }
          >
            {Object.entries(mediaTypeLabels).map(([mediaType, label]) => (
              <option key={mediaType} value={mediaType}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label className="form-field">
          <span className="form-label">Povezivanje</span>
          <select
            className="form-select"
            value={createDraft.ownerType}
            onChange={(event) => {
              const ownerType = event.target.value as AdminMediaCreateDraft["ownerType"];
              updateCreateDraft({
                ownerType,
                unitId: ownerType === "unit" ? createDraft.unitId || units[0]?.id || "" : createDraft.unitId,
              });
            }}
          >
            <option value="project">Projekat Heroja Pinkija 13</option>
            <option value="unit">Konkretan stan</option>
          </select>
        </label>

        {createDraft.ownerType === "unit" ? (
          <label className="form-field">
            <span className="form-label">Stan</span>
            <select
              className="form-select"
              value={createDraft.unitId || units[0]?.id || ""}
              onChange={(event) => updateCreateDraft({ unitId: event.target.value })}
            >
              {units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.unitCode} · {unit.floorLabel} · {unit.areaM2}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <label className="form-field">
          <span className="form-label">Fajl za upload</span>
          <input
            key={createFileInputKey}
            className="form-input"
            type="file"
            accept={getMediaFileAccept(createDraft)}
            onChange={(event) => {
              setCreateFile(event.target.files?.[0] ?? null);
              setCreateFeedback(null);
            }}
          />
        </label>

        <label className="form-field">
          <span className="form-label">Postojeca putanja ili URL</span>
          <input
            className="form-input"
            value={createDraft.filePath}
            placeholder="/images/... ili https://..."
            onChange={(event) => updateCreateDraft({ filePath: event.target.value })}
          />
        </label>

        <label className="form-field">
          <span className="form-label">
            {isImageMediaDraft(createDraft) ? "Alt tekst (obavezan za objavu)" : "Alt tekst"}
          </span>
          <input
            className="form-input"
            value={createDraft.altText}
            aria-invalid={createDraft.isPublished && createDraftNeedsAltText ? true : undefined}
            onChange={(event) => updateCreateDraft({ altText: event.target.value })}
          />
        </label>

        <div className="admin-create-media__actions">
          <label className="admin-toggle">
            <input
              type="checkbox"
              checked={createDraft.isPublished}
              onChange={(event) => updateCreateDraft({ isPublished: event.target.checked })}
            />
            <span>Odmah objavi</span>
          </label>
          <button className="site-button site-button--dark" type="submit" disabled={isCreatingMedia}>
            <FileUp />
            {isCreatingMedia ? "Dodavanje..." : "Dodaj media karticu"}
          </button>
        </div>

        {createFeedback ? <AdminCardFeedbackMessage feedback={createFeedback} /> : null}
      </form>

      <div className="admin-media-toolbar">
        <label className="admin-filter admin-filter--media">
          <Filter />
          <span>Tip fajla</span>
          <select
            value={mediaTypeFilter}
            onChange={(event) =>
              setMediaTypeFilter(event.target.value as "all" | AdminMediaItem["mediaType"])
            }
          >
            <option value="all">Svi tipovi</option>
            {availableMediaTypes.map((mediaType) => (
              <option key={mediaType} value={mediaType}>
                {mediaTypeLabels[mediaType]}
              </option>
            ))}
          </select>
        </label>
        <div className="admin-media-toolbar__summary" role="status">
          <strong>
            {filteredMediaItems.length} od {mediaItems.length} fajlova
          </strong>
          <span>
            {publishedImageWarnings > 0
              ? `${publishedImageWarnings} objavljenih slika bez alt teksta`
              : "Objavljene slike imaju alt tekst"}
          </span>
        </div>
      </div>

      <div className="admin-media-grid">
        {filteredMediaItems.length === 0 ? (
          <EmptyAdminList
            title="Nema fajlova za izabrani tip."
            text="Promenite filter ili dodajte novi fajl kada Storage upload bude povezan."
          />
        ) : null}

        {filteredMediaItems.map((item) => {
          const imageMedia = isImageMedia(item);
          const missingImageAltText = hasMissingImageAltText(item);
          const altFieldHintId = `media-alt-hint-${item.id}`;
          const uploadInputId = `media-upload-${item.id}`;
          const isUploading = uploadingMediaId === item.id;

          return (
            <article className="admin-media-card" key={item.id}>
              <div className="admin-media-card__preview">
                {isImagePath(item.filePath) ? (
                  <img src={item.filePath} alt={item.altText || item.title} loading="lazy" />
                ) : (
                  <div>
                    <FileText />
                    <span>{getFileExtension(item.filePath)}</span>
                  </div>
                )}
              </div>

              <div className="admin-media-card__head">
                <div className="admin-card__badges">
                  <span
                    className={`admin-publish-status admin-publish-status--${
                      item.isPublished ? "published" : "hidden"
                    }`}
                  >
                    {item.isPublished ? "Objavljeno" : "Sakriveno"}
                  </span>
                  <span className="admin-type">{mediaTypeLabels[item.mediaType]}</span>
                </div>
                <div className="admin-media-card__icon">
                  {imageMedia ? <ImageIcon /> : <FileText />}
                </div>
              </div>

              <div className="admin-media-card__meta">
                <span>
                  <Eye />
                  {getMediaUsageLabel(item)}
                </span>
                <span>{getMediaKindLabel(item)}</span>
              </div>

              {item.isPublished && missingImageAltText ? (
                <p className="admin-media-card__warning" role="note">
                  <AlertTriangle />
                  Objavljena slika nema alt tekst.
                </p>
              ) : null}

              <label className="form-field">
                <span className="form-label">Naziv</span>
                <input
                  className="form-input"
                  value={item.title}
                  onChange={(event) => patchMedia(item.id, { title: event.target.value })}
                />
              </label>
              <label className="form-field">
                <span className="form-label">Putanja</span>
                <input
                  className="form-input"
                  value={item.filePath}
                  onChange={(event) => patchMedia(item.id, { filePath: event.target.value })}
                />
              </label>
              <label className="form-field">
                <span className="form-label">
                  {imageMedia ? "Alt tekst (obavezan za objavu)" : "Alt tekst"}
                </span>
                <input
                  className="form-input"
                  value={item.altText}
                  aria-describedby={imageMedia ? altFieldHintId : undefined}
                  aria-invalid={item.isPublished && missingImageAltText ? true : undefined}
                  onChange={(event) => patchMedia(item.id, { altText: event.target.value })}
                />
                {imageMedia ? (
                  <small className="admin-media-card__hint" id={altFieldHintId}>
                    Kratak opis slike koji pomaze SEO-u i pristupacnosti.
                  </small>
                ) : null}
              </label>
              <div className="admin-media-card__actions">
                <button
                  className="site-button site-button--outline admin-note-save"
                  type="button"
                  onClick={() => void saveMediaMetadata(item)}
                >
                  <Save />
                  Sacuvaj metadata
                </button>
                <label
                  className={`site-button site-button--outline admin-media-upload-button${
                    isUploading ? " is-disabled" : ""
                  }`}
                  htmlFor={uploadInputId}
                  aria-disabled={isUploading}
                >
                  <FileUp />
                  {isUploading ? "Upload..." : "Zameni fajl"}
                  <input
                    id={uploadInputId}
                    type="file"
                    accept={getMediaFileAccept(item)}
                    disabled={isUploading}
                    onChange={(event) => {
                      const file = event.target.files?.[0];

                      if (file) {
                        void uploadReplacementFile(item, file);
                      }

                      event.target.value = "";
                    }}
                  />
                </label>
                <label className="admin-toggle">
                  <input
                    type="checkbox"
                    checked={item.isPublished}
                    onChange={(event) => void publishMedia(item.id, event.target.checked)}
                  />
                  <span>{item.isPublished ? "Objavljeno" : "Sakriveno"}</span>
                </label>
                <button
                  className={`admin-card-danger-action${
                    deleteConfirmId === item.id ? " is-confirming" : ""
                  }`}
                  type="button"
                  onClick={() => void deleteMediaCard(item)}
                >
                  <Trash2 />
                  {deleteConfirmId === item.id ? "Potvrdite uklanjanje" : "Ukloni karticu"}
                </button>
              </div>
              <AdminCardFeedbackMessage feedback={cardFeedback[item.id]} />
            </article>
          );
        })}
      </div>
    </section>
  );
};

const AdminCardFeedbackMessage = ({ feedback }: { feedback?: AdminCardFeedback }) => {
  if (!feedback) {
    return null;
  }

  return (
    <p
      className={`admin-card-feedback admin-card-feedback--${feedback.tone}`}
      role={feedback.tone === "error" ? "alert" : "status"}
      aria-live={feedback.tone === "error" ? "assertive" : "polite"}
    >
      {feedback.message}
    </p>
  );
};

function createCardPersistFeedback(
  result: AdminPersistResult,
  savedMessage: string,
): AdminCardFeedback {
  if (result.status === "failed") {
    return { tone: "error", message: result.message };
  }

  if (result.status === "local") {
    return { tone: "success", message: result.message };
  }

  return { tone: "success", message: savedMessage };
}

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

function getApartmentPublicPath(unitCode: string) {
  const apartmentNumber = unitCode.match(/\d+/)?.[0];

  return apartmentNumber
    ? `/projekti/heroja-pinkija-13/ponuda-stanova/${apartmentNumber}`
    : "/projekti/heroja-pinkija-13/ponuda-stanova";
}

function getSafeAdminSourceHref(sourcePage: string) {
  const trimmedSource = sourcePage.trim();

  if (!trimmedSource || !trimmedSource.startsWith("/") || trimmedSource.startsWith("//")) {
    return null;
  }

  return trimmedSource;
}

function getSortNumber(value: string) {
  const match = value.match(/\d+/);
  return match ? Number(match[0]) : 0;
}

function formatUnitType(unitType: AdminUnit["unitType"]) {
  switch (unitType) {
    case "apartment":
      return "Stan";
    case "business_apartment":
      return "Apartman za poslovanje";
    case "commercial_space":
      return "Lokal";
    default:
      return "Jedinica";
  }
}

function createUnitContentDraft(unit: AdminUnit): AdminUnitContentDraft {
  return {
    fullDescription: unit.fullDescription,
    seoTitle: unit.seoTitle,
    seoDescription: unit.seoDescription,
  };
}

function formatPlanVariant(planVariant: string) {
  return planVariant
    .replace("stack-", "Vertikala ")
    .replace(/-/g, " / ");
}

function isImagePath(filePath: string) {
  return /\.(png|jpe?g|webp|avif|gif|svg)(\?.*)?$/i.test(filePath);
}

function isImageMedia(item: AdminMediaItem) {
  return (
    item.mediaType === "project_image" ||
    item.mediaType === "unit_image" ||
    item.mediaType === "construction_update_image" ||
    isImagePath(item.filePath)
  );
}

function hasMissingImageAltText(item: AdminMediaItem) {
  return isImageMedia(item) && !item.altText.trim();
}

const maxStandardUploadSizeBytes = 6 * 1024 * 1024;

function getMediaFileAccept(item: Pick<AdminMediaItem, "mediaType">) {
  if (isPdfMediaType(item.mediaType)) {
    return "application/pdf,.pdf";
  }

  return "image/png,image/jpeg,image/webp,image/avif,.png,.jpg,.jpeg,.webp,.avif";
}

function isAllowedMediaFile(item: Pick<AdminMediaItem, "mediaType">, file: File) {
  const fileName = file.name.toLowerCase();

  if (isPdfMediaType(item.mediaType)) {
    return file.type === "application/pdf" || fileName.endsWith(".pdf");
  }

  return (
    file.type.startsWith("image/") ||
    /\.(png|jpe?g|webp|avif)$/i.test(fileName)
  );
}

function isPdfMediaType(mediaType: AdminMediaItem["mediaType"]) {
  return mediaType.endsWith("_pdf");
}

function getMediaFileTypeError(item: Pick<AdminMediaItem, "mediaType">) {
  return isPdfMediaType(item.mediaType)
    ? "Za ovaj tip medija uploadujte PDF fajl."
    : "Za ovaj tip medija uploadujte sliku: PNG, JPG, WebP ili AVIF.";
}

function isImageMediaDraft(item: Pick<AdminMediaItem, "mediaType">) {
  return (
    item.mediaType === "project_image" ||
    item.mediaType === "unit_image" ||
    item.mediaType === "construction_update_image"
  );
}

function getFileExtension(filePath: string) {
  const fileName = filePath.split("?")[0] ?? "";
  const extension = fileName.match(/\.([a-z0-9]+)$/i)?.[1];

  return extension ? extension.toUpperCase() : "FAJL";
}

function getMediaKindLabel(item: AdminMediaItem) {
  if (isImageMedia(item)) {
    return "Slika";
  }

  if (/\.pdf(\?.*)?$/i.test(item.filePath) || item.mediaType.includes("_pdf")) {
    return "PDF dokument";
  }

  return "Fajl";
}

function getMediaUsageLabel(item: AdminMediaItem) {
  switch (item.mediaType) {
    case "project_image":
      return "Javna stranica projekta";
    case "unit_image":
      return "Tlocrt/prikaz stana";
    case "apartment_floor_plan_pdf":
      return "PDF tlocrt stana";
    case "building_floor_plan_pdf":
      return "PDF osnova objekta";
    case "garage_plan_pdf":
      return "PDF garaznih mesta";
    case "storage_plan_pdf":
      return "PDF ostava";
    case "general_brochure_pdf":
      return "Opsta prodajna brosura";
    case "construction_update_image":
      return "Status radova";
    default:
      return "Javni media fajl";
  }
}

function getUploadTitle(fileName: string) {
  const cleanName = fileName.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();

  return cleanName || "Uploadovan fajl";
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
