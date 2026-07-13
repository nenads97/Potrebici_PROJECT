import { apartments, projectInfo, projectTimeline } from "../../projects/data/herojaPinkija13.data";
import type {
  AdminConstructionUpdate,
  AdminInquiry,
  AdminLandOffer,
  AdminMediaItem,
  AdminProjectDraft,
  AdminUnit,
  AdminUnitStatus,
} from "../types/admin.types";

const unitStatusMap = {
  Available: "available",
  Reserved: "reserved",
  Sold: "sold",
} satisfies Record<string, AdminUnitStatus>;

export const adminStatusLabels = {
  new: "Novo",
  contacted: "Kontaktiran",
  closed: "Zatvoreno",
} as const;

export const adminUnitStatusLabels = {
  available: "Slobodan",
  reserved: "Rezervisan",
  sold: "Prodat",
} as const;

export const adminInquiries: AdminInquiry[] = [
  {
    id: "inq-001",
    fullName: "Jelena Savic",
    phone: "064 112 3377",
    email: "jelena.savic@example.com",
    inquiryType: "unit",
    projectSlug: "heroja-pinkija-13",
    unitCode: "Stan 4",
    sourcePage: "/projekti/heroja-pinkija-13/ponuda-stanova",
    message:
      "Interesuje me dvosoban stan sa terasom. Molim vas za informaciju o uslovima placanja i dostupnosti.",
    adminStatus: "new",
    adminNote: "Pozvati posle 16h, pita za stan na nizoj etazi.",
    createdAt: "2026-05-22T08:40:00.000Z",
  },
  {
    id: "inq-002",
    fullName: "Milan Kovacevic",
    phone: "063 770 0091",
    email: "milan.k@example.com",
    inquiryType: "availability",
    projectSlug: "heroja-pinkija-13",
    unitCode: "Stan 1",
    sourcePage: "/projekti/heroja-pinkija-13/ponuda-stanova/1",
    message: "Da li je veci trosoban stan jos slobodan i kada moze obilazak lokacije?",
    adminStatus: "contacted",
    adminNote: "Poslat mejl sa osnovnim informacijama.",
    createdAt: "2026-05-21T14:10:00.000Z",
  },
  {
    id: "inq-003",
    fullName: "Ana Petrovic",
    phone: "060 445 2210",
    email: "ana.petrovic@example.com",
    inquiryType: "general",
    projectSlug: "heroja-pinkija-13",
    sourcePage: "/kontakt",
    message: "Zanima me rok zavrsetka radova i mogucnost kupovine garaznog mesta uz stan.",
    adminStatus: "closed",
    adminNote: "Razgovor zavrsen, ceka novu ponudu.",
    createdAt: "2026-05-20T10:25:00.000Z",
  },
];

export const adminLandOffers: AdminLandOffer[] = [
  {
    id: "land-001",
    fullName: "Dragan Nikolic",
    phone: "064 901 2450",
    email: "dragan.n@example.com",
    propertyAddress: "Telep, Novi Sad",
    plotAreaM2: 640,
    details: "Plac sa starijom kucom, izlaz na mirnu ulicu, vlasnistvo 1/1.",
    sourcePage: "/kupujemo-placeve",
    adminStatus: "new",
    adminNote: "Zatraziti tacnu parcelu i urbanisticke uslove.",
    createdAt: "2026-05-22T07:15:00.000Z",
  },
  {
    id: "land-002",
    fullName: "Ivana Radovic",
    phone: "065 331 8080",
    email: "ivana.r@example.com",
    propertyAddress: "Adice, Novi Sad",
    plotAreaM2: 910,
    details: "Dve spojene parcele, moguc dogovor oko roka iseljenja.",
    sourcePage: "/kupujemo-placeve",
    adminStatus: "contacted",
    adminNote: "Poslati inicijalni spisak potrebne dokumentacije.",
    createdAt: "2026-05-19T12:05:00.000Z",
  },
];

export const adminUnits: AdminUnit[] = apartments.map((apartment) => ({
  id: `unit-${apartment.number}`,
  unitCode: `Stan ${apartment.number}`,
  unitType: "apartment",
  floorLabel: apartment.floor,
  areaM2: apartment.size,
  roomStructure: apartment.rooms,
  status: unitStatusMap[apartment.status],
  shortDescription: apartment.highlight,
  fullDescription: apartment.description,
  seoTitle: `Stan ${apartment.number} | Heroja Pinkija 13`,
  seoDescription: `Detalji stana ${apartment.number}: ${apartment.size}, ${apartment.floor}, ${apartment.rooms}.`,
  publicPath: `/projekti/heroja-pinkija-13/ponuda-stanova/${apartment.number}`,
  planVariant: apartment.planVariant,
  floorPlanPath: apartment.heroFloorPlan.src,
  isPublished: true,
}));

export const adminProjectDraft: AdminProjectDraft = {
  id: "mock-project-heroja-pinkija-13",
  name: projectInfo.name,
  address: `${projectInfo.address}, ${projectInfo.city}`,
  statusLabel: projectInfo.status,
  shortDescription: projectInfo.lead,
  fullDescription: projectInfo.description,
  locationDescription:
    projectInfo.locationDescription ??
    "Pocetak Telepa, dobra veza sa Limanom, centrom, Kejom i glavnim gradskim sadrzajima.",
  floorStructure: projectInfo.floorStructure,
  constructionStartDate: projectInfo.constructionStartDate ?? "2026-03-16",
  constructionEndDate: projectInfo.constructionEndDate ?? "2027-11-15",
  heroImageUrl: projectInfo.heroImage ?? "/images/heroja-pinkija-13/gradilisna-tabla.jpg",
  seoTitle: projectInfo.seoTitle ?? "Heroja Pinkija 13 | M & M Gradnja",
  seoDescription:
    projectInfo.seoDescription ??
    "Pregled projekta Heroja Pinkija 13 u Novom Sadu: stanovi, lokacija, rokovi, status radova i direktan upit prodaji.",
  projectStatus: "active",
};

export const adminConstructionUpdates: AdminConstructionUpdate[] = projectTimeline.map(
  (step, index) => ({
    id: `construction-${step.id}`,
    title: step.title,
    tag: index === 0 ? "Pocetak" : index === projectTimeline.length - 1 ? "Plan" : "Radovi",
    statusLabel:
      step.statusLabel ??
      (step.state === "done" ? "Zavrseno" : step.state === "active" ? "Aktuelno" : "Planirano"),
    shortDescription: step.body,
    updateDate:
      step.id === "start"
        ? "2026-03-16"
        : step.id === "finish"
          ? "2027-11-15"
          : "",
    timelineState: step.state,
    sortOrder: index + 1,
    isPublished: true,
  }),
);

export const adminMediaItems: AdminMediaItem[] = [
  {
    id: "media-001",
    projectId: adminProjectDraft.id,
    title: "Gradilisna tabla",
    mediaType: "project_image",
    filePath: "/images/heroja-pinkija-13/gradilisna-tabla.jpg",
    altText: "Gradilisna tabla projekta Heroja Pinkija 13",
    isPublished: true,
  },
  {
    id: "media-002",
    projectId: adminProjectDraft.id,
    title: "Detalj gradilisne table",
    mediaType: "project_image",
    filePath: "/images/heroja-pinkija-13/gradilisna-tabla-slika.jpg",
    altText: "Detalj gradilisne table projekta Heroja Pinkija 13",
    isPublished: false,
  },
  {
    id: "media-003",
    projectId: adminProjectDraft.id,
    title: "Radovi u toku",
    mediaType: "construction_update_image",
    filePath: "/images/heroja-pinkija-13/radovi-u-toku.jpg",
    altText: "Radovi u toku na projektu Heroja Pinkija 13",
    isPublished: true,
  },
  {
    id: "media-004",
    title: "Tlocrt stanova 1, 6 i 11",
    mediaType: "unit_image",
    filePath: "/images/apartment-plans/stan-1-6-11.png",
    altText: "Tlocrt stanova 1, 6 i 11",
    isPublished: true,
  },
  {
    id: "media-005",
    title: "Tlocrt stanova 2, 7 i 12",
    mediaType: "unit_image",
    filePath: "/images/apartment-plans/stan-2-7-12.png",
    altText: "Tlocrt stanova 2, 7 i 12",
    isPublished: true,
  },
  {
    id: "media-006",
    title: "Tlocrt stanova 3, 8 i 13",
    mediaType: "unit_image",
    filePath: "/images/apartment-plans/stan-3-8-13.png",
    altText: "Tlocrt stanova 3, 8 i 13",
    isPublished: true,
  },
  {
    id: "media-007",
    title: "Tlocrt stanova 4, 9 i 14",
    mediaType: "unit_image",
    filePath: "/images/apartment-plans/stan-4-9-14.png",
    altText: "Tlocrt stanova 4, 9 i 14",
    isPublished: true,
  },
  {
    id: "media-008",
    title: "Tlocrt stanova 5, 10 i 15",
    mediaType: "unit_image",
    filePath: "/images/apartment-plans/stan-5-10-15.png",
    altText: "Tlocrt stanova 5, 10 i 15",
    isPublished: true,
  },
  {
    id: "media-009",
    title: "Projektni tlocrt stanova 1, 6 i 11 za poredjenje",
    mediaType: "unit_image",
    filePath: "/images/apartment-plans/stan-1-6-11-comparison.png",
    altText: "Projektni tlocrt stanova 1, 6 i 11 za poredjenje sa gridom prostorija",
    isPublished: true,
  },
  {
    id: "media-010",
    title: "Showcase tlocrt stanova 1, 6 i 11",
    mediaType: "unit_image",
    filePath: "/images/apartment-plans/showcase-stan-1-6-11.png",
    altText: "Showcase tlocrt stanova 1, 6 i 11",
    isPublished: true,
  },
  {
    id: "media-011",
    title: "Showcase tlocrt stanova 2, 7 i 12",
    mediaType: "unit_image",
    filePath: "/images/apartment-plans/showcase-stan-2-7-12.png",
    altText: "Showcase tlocrt stanova 2, 7 i 12",
    isPublished: true,
  },
  {
    id: "media-012",
    title: "Showcase tlocrt stanova 3, 8 i 13",
    mediaType: "unit_image",
    filePath: "/images/apartment-plans/showcase-stan-3-8-13.png",
    altText: "Showcase tlocrt stanova 3, 8 i 13",
    isPublished: true,
  },
  {
    id: "media-013",
    title: "Showcase tlocrt stanova 4, 9 i 14",
    mediaType: "unit_image",
    filePath: "/images/apartment-plans/showcase-stan-4-9-14.png",
    altText: "Showcase tlocrt stanova 4, 9 i 14",
    isPublished: true,
  },
  {
    id: "media-014",
    title: "Showcase tlocrt stanova 5, 10 i 15",
    mediaType: "unit_image",
    filePath: "/images/apartment-plans/showcase-stan-5-10-15.png",
    altText: "Showcase tlocrt stanova 5, 10 i 15",
    isPublished: true,
  },
];
