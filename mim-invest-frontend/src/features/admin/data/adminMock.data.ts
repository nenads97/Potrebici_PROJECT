import { apartments, projectInfo } from "../../projects/data/herojaPinkija13.data";
import type {
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
      "Interesuje me jednoiposoban stan sa terasom. Molim vas za informaciju o uslovima placanja i dostupnosti.",
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
    sourcePage: "/apartmani/1",
    message: "Da li je veci dvoiposoban stan jos slobodan i kada moze obilazak lokacije?",
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
  isPublished: true,
}));

export const adminProjectDraft: AdminProjectDraft = {
  id: "mock-project-heroja-pinkija-13",
  name: projectInfo.name,
  address: `${projectInfo.address}, ${projectInfo.city}`,
  shortDescription: projectInfo.lead,
  locationDescription:
    "Pocetak Telepa, dobra veza sa Limanom, centrom, Kejom i glavnim gradskim sadrzajima.",
  floorStructure: projectInfo.floorStructure,
  constructionStartDate: "2026-03-16",
  constructionEndDate: "2027-11-15",
  projectStatus: "active",
};

export const adminMediaItems: AdminMediaItem[] = [
  {
    id: "media-001",
    title: "Render fasade",
    mediaType: "project_image",
    filePath: "projects/heroja-pinkija-13/render-fasade.jpg",
    altText: "Render zgrade Heroja Pinkija 13",
    isPublished: true,
  },
  {
    id: "media-002",
    title: "Spratna osnova",
    mediaType: "building_floor_plan_pdf",
    filePath: "projects/heroja-pinkija-13/spratna-osnova.pdf",
    altText: "Spratna osnova objekta",
    isPublished: true,
  },
  {
    id: "media-003",
    title: "Fotografija gradilista",
    mediaType: "construction_update_image",
    filePath: "projects/heroja-pinkija-13/gradiliste-maj-2026.jpg",
    altText: "Trenutno stanje radova u maju 2026.",
    isPublished: false,
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
];
