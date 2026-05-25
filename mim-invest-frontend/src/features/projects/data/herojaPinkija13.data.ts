import type {
  Apartment,
  ApartmentImage,
  ApartmentRoomArea,
  ApartmentStatus,
  BuildingLevel,
  ConstructionUpdate,
  GalleryItem,
  ProjectInfo,
  ProjectStat,
  TimelineItem,
} from "../types/project.types";

export const contactPhone = "064 227 9117";
export const contactEmail = "prodaja@mimgradnja.rs";

export const statusLabel: Record<ApartmentStatus, string> = {
  Available: "Slobodan",
  Reserved: "Rezervisan",
  Sold: "Prodat",
};

export const statusVariant: Record<ApartmentStatus, "available" | "reserved" | "sold"> = {
  Available: "available",
  Reserved: "reserved",
  Sold: "sold",
};

export const projectInfo: ProjectInfo = {
  name: "Heroja Pinkija 13",
  address: "Heroja Pinkija 13",
  city: "Novi Sad",
  district: "Telep",
  status: "Izgradnja u toku",
  lead:
    "Moderan stambeno-poslovni objekat na pocetku Telepa, osmisljen za miran zivot uz brzu vezu sa gradom.",
  description:
    "Projekat M & M Gradnja objedinjuje stanove, poslovne apartmane, lokale, garazna i dvorisna parking mesta, uz jasan prodajni pregled dostupnih jedinica.",
  floorStructure: "PO + PR + 3",
  constructionStart: "16. mart 2026.",
  plannedCompletion: "15. novembar 2027.",
};

export const projectStats: ProjectStat[] = [
  {
    value: "15",
    label: "stanova",
    detail: "po 5 stanova na svakom stambenom spratu",
  },
  {
    value: "5",
    label: "stanova po etazi",
    detail: "ponavljajuci raspored kroz tri stambena nivoa",
  },
  {
    value: "12",
    label: "linija do centra",
    detail: "brza veza sa ostatkom Novog Sada",
  },
  {
    value: "2027",
    label: "planirani zavrsetak",
    detail: "15. novembar 2027.",
  },
];

export const constructionUpdates: ConstructionUpdate[] = [
  {
    id: "status-gradnje",
    date: "Aktuelno",
    tag: "Gradiliste",
    title: "Objekat je u fazi izgradnje",
    body:
      "Pregled projekta je pripremljen za redovno objavljivanje novih informacija, fotografija i statusa radova.",
  },
  {
    id: "prodaja-stanova",
    date: "Prodaja",
    tag: "Stanovi",
    title: "Prodaja stanova je pocela",
    body:
      "U ponudi je 15 stanova sa ponavljajucim rasporedima po etazama i jasnim kontaktom za svaki upit.",
  },
  {
    id: "rok-zavrsetka",
    date: "Rok",
    tag: "Plan",
    title: "Planirani zavrsetak je 15. novembar 2027.",
    body:
      "Timeline prikazuje najvaznije faze gradnje i daje kupcima jednostavan pregled razvoja projekta.",
  },
];

export const galleryItems: GalleryItem[] = [
  {
    id: "render-fasade",
    title: "Render fasade",
    tag: "Vizuelni identitet",
    meta: "Prikaz zgrade i ulicnog fronta",
    variant: "facade",
  },
  {
    id: "gradiliste",
    title: "Gradiliste",
    tag: "Napredak radova",
    meta: "Mesto za najnovije fotografije sa terena",
    variant: "site",
  },
  {
    id: "spratne-osnove",
    title: "Spratne osnove",
    tag: "Planovi",
    meta: "Raspored stanova po spratovima",
    variant: "plan",
  },
  {
    id: "lokacija",
    title: "Lokacija",
    tag: "Telep",
    meta: "Heroja Pinkija 13, Novi Sad",
    variant: "location",
  },
  {
    id: "enterijer",
    title: "Enterijer",
    tag: "Materijali",
    meta: "Prostor za buduce prikaze opreme",
    variant: "interior",
  },
  {
    id: "parking",
    title: "Parking i ostave",
    tag: "Dodatne jedinice",
    meta: "Garazna, dvorisna mesta i ostave",
    variant: "parking",
  },
];

const galleryImages = {
  living:
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=85",
  terrace:
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=85",
  lobby:
    "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=85",
  kitchen:
    "https://images.unsplash.com/photo-1556912173-3bb406ef7e77?auto=format&fit=crop&w=1400&q=85",
  bedroom:
    "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1400&q=85",
  bathroom:
    "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1400&q=85",
  dining:
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=85",
};

type ApartmentStack = {
  numbers: string[];
  sizes: string[];
  rooms: string;
  bathrooms: string;
  terrace: string;
  highlight: string;
  description: string;
  features: string[];
  images: ApartmentImage[];
  roomAreas: ApartmentRoomArea[];
  planVariant?: "stack-1-6-11";
};

const commonFeatures = [
  "Podno grejanje",
  "Lift od podzemne garaze do svih spratova",
  "Mogucnost kupovine garaznog mesta",
  "Ostava dostupna uz stan",
];

const apartmentStacks: ApartmentStack[] = [
  {
    numbers: ["1", "6", "11"],
    sizes: ["62.15 m2", "60.29 m2", "60.29 m2"],
    rooms: "Trosoban",
    bathrooms: "2 kupatila",
    terrace: "Terasa",
    highlight: "Veci stan sa dva kupatila, pogodan za porodicu.",
    description:
      "Dvoiposoban stan za kupce kojima je vazan dodatni komfor i funkcionalno odvajanje dnevne i spavace zone. Isti raspored se ponavlja kroz vertikalu, uz razliku u kvadraturi po etazi.",
    features: [
      "Trosobna struktura",
      "Dva kupatila",
      "Terasa",
      ...commonFeatures,
    ],
    images: [
      { src: galleryImages.living, alt: "Dnevna zona dvoiposobnog stana" },
      { src: galleryImages.bathroom, alt: "Kupatilo u stanu" },
      { src: galleryImages.terrace, alt: "Terasa stana" },
    ],
    planVariant: "stack-1-6-11",
    roomAreas: [
      { id: "entry", number: "1", label: "Ulaz", area: "7.09 m2" },
      { id: "kitchen", number: "2", label: "Kuhinja", area: "4.74 m2" },
      { id: "bathroom", number: "3", label: "Kupatilo", area: "4.39 m2" },
      { id: "living", number: "4", label: "Dnevna soba", area: "20.13 m2" },
      { id: "loggia", number: "5", label: "Terasa", area: "3.52 m2" },
      { id: "wc", number: "6", label: "WC", area: "1.67 m2" },
      { id: "bedroom-primary", number: "7", label: "Spavaca soba", area: "9.64 m2" },
      { id: "bedroom-secondary", number: "8", label: "Spavaca soba", area: "10.97 m2" },
    ],
  },
  {
    numbers: ["2", "7", "12"],
    sizes: ["58.26 m2", "56.50 m2", "56.50 m2"],
    rooms: "Dvoiposoban",
    bathrooms: "2 kupatila",
    terrace: "Terasa",
    highlight: "Dvoiposoban stan sa dobrim odnosom komfora i kvadrature.",
    description:
      "Raspored je namenjen kupcima kojima su potrebne odvojene sobe i dva kupatila, bez nepotrebno velike kvadrature. Pogodan je za porodican zivot ili rad od kuce.",
    features: [
      "Dvoiposobna struktura",
      "Dva kupatila",
      "Terasa",
      ...commonFeatures,
    ],
    images: [
      { src: galleryImages.dining, alt: "Dnevna zona sa trpezarijom" },
      { src: galleryImages.bedroom, alt: "Spavaca soba" },
      { src: galleryImages.bathroom, alt: "Kupatilo u stanu" },
    ],
    roomAreas: [
      { id: "living", label: "Dnevni boravak", area: "19.80 m2" },
      { id: "kitchen", label: "Kuhinja", area: "5.90 m2" },
      { id: "bedroom", label: "Spavaca soba", area: "12.10 m2" },
      { id: "bathroom", label: "Kupatilo", area: "4.50 m2" },
      { id: "terrace", label: "Terasa", area: "4.80 m2" },
    ],
  },
  {
    numbers: ["3", "8", "13"],
    sizes: ["28.55 m2", "27.69 m2", "27.69 m2"],
    rooms: "Garsonjera",
    bathrooms: "1 kupatilo",
    terrace: "Bez terase",
    highlight: "Kompaktan stan i jedini tip bez terase.",
    description:
      "Garsonjera je najkompaktniji tip stana u objektu. Namenjena je kupcima koji traze manji stan za zivot, izdavanje ili investicionu kupovinu.",
    features: [
      "Kompaktna kvadratura",
      "Jedini tip bez terase",
      "Jedno kupatilo",
      ...commonFeatures,
    ],
    images: [
      { src: galleryImages.kitchen, alt: "Kompaktna dnevna zona" },
      { src: galleryImages.living, alt: "Garsonjera u neutralnim tonovima" },
      { src: galleryImages.lobby, alt: "Ulazni prostor zgrade" },
    ],
    roomAreas: [
      { id: "living", label: "Dnevni boravak", area: "16.30 m2" },
      { id: "kitchen", label: "Kuhinja", area: "4.20 m2" },
      { id: "bedroom", label: "Spavaca soba", area: "U sklopu dnevne zone" },
      { id: "bathroom", label: "Kupatilo", area: "4.10 m2" },
      { id: "terrace", label: "Terasa", area: "Bez terase" },
    ],
  },
  {
    numbers: ["4", "9", "14"],
    sizes: ["46.95 m2", "45.54 m2", "45.54 m2"],
    rooms: "Jednoiposoban",
    bathrooms: "1 kupatilo",
    terrace: "Terasa",
    highlight: "Praktican jednoiposoban stan sa terasom.",
    description:
      "Jednoiposoban stan je funkcionalan izbor za prvi dom, parove ili kupce koji planiraju izdavanje. Raspored zadrzava jasnu dnevnu zonu i odvojenu spavacu sobu.",
    features: [
      "Jednoiposobna struktura",
      "Terasa",
      "Jedno kupatilo",
      ...commonFeatures,
    ],
    images: [
      { src: galleryImages.living, alt: "Dnevni boravak jednoiposobnog stana" },
      { src: galleryImages.bedroom, alt: "Spavaca soba" },
      { src: galleryImages.terrace, alt: "Terasa stana" },
    ],
    roomAreas: [
      { id: "living", label: "Dnevni boravak", area: "17.90 m2" },
      { id: "kitchen", label: "Kuhinja", area: "5.10 m2" },
      { id: "bedroom", label: "Spavaca soba", area: "10.60 m2" },
      { id: "bathroom", label: "Kupatilo", area: "4.30 m2" },
      { id: "terrace", label: "Terasa", area: "4.40 m2" },
    ],
  },
  {
    numbers: ["5", "10", "15"],
    sizes: ["42.57 m2", "41.29 m2", "41.29 m2"],
    rooms: "Jednoiposoban",
    bathrooms: "1 kupatilo",
    terrace: "Terasa",
    highlight: "Manji jednoiposoban stan sa jasnim rasporedom.",
    description:
      "Ovaj tip stana nudi kompaktnu kvadraturu uz odvojenu spavacu sobu i terasu. Dobar je izbor za kupce koji traze praktican stan na dobro povezanoj lokaciji.",
    features: [
      "Jednoiposobna struktura",
      "Terasa",
      "Jedno kupatilo",
      ...commonFeatures,
    ],
    images: [
      { src: galleryImages.dining, alt: "Dnevna zona jednoiposobnog stana" },
      { src: galleryImages.kitchen, alt: "Kuhinja u stanu" },
      { src: galleryImages.terrace, alt: "Terasa stana" },
    ],
    roomAreas: [
      { id: "living", label: "Dnevni boravak", area: "16.80 m2" },
      { id: "kitchen", label: "Kuhinja", area: "4.80 m2" },
      { id: "bedroom", label: "Spavaca soba", area: "9.90 m2" },
      { id: "bathroom", label: "Kupatilo", area: "4.00 m2" },
      { id: "terrace", label: "Terasa", area: "4.20 m2" },
    ],
  },
];

function getFloor(number: string) {
  const apartmentNumber = Number(number);

  if (apartmentNumber <= 5) {
    return "1. etaza";
  }

  if (apartmentNumber <= 10) {
    return "2. etaza";
  }

  return "3. etaza";
}

function getFloorNumber(number: string) {
  const apartmentNumber = Number(number);

  if (apartmentNumber <= 5) {
    return 1;
  }

  if (apartmentNumber <= 10) {
    return 2;
  }

  return 3;
}

export const apartments: Apartment[] = apartmentStacks.flatMap((stack) =>
  stack.numbers.map((number, index) => ({
    number,
    floor: getFloor(number),
    floorNumber: getFloorNumber(number),
    size: stack.sizes[index],
    rooms: stack.rooms,
    status: "Available",
    orientation: "Prema prodajnoj dokumentaciji",
    highlight: stack.highlight,
    description: stack.description,
    priceRange: "Na upit",
    availabilityNote:
      "Prodaja stanova je pocela. Za cenu, uslove kupovine i tacan status kontaktirajte prodaju.",
    bathrooms: stack.bathrooms,
    terrace: stack.terrace,
    parking: "Garazno mesto dostupno uz kupovinu",
    storage: "Ostava dostupna uz kupovinu",
    ceilingHeight: "Prema prodajnoj dokumentaciji",
    images: stack.images,
    plan: [
      { label: "Ukupna povrsina", value: stack.sizes[index] },
      { label: "Struktura", value: stack.rooms },
      { label: "Kupatila", value: stack.bathrooms },
      { label: "Terasa", value: stack.terrace },
    ],
    roomAreas: stack.roomAreas,
    planVariant: stack.planVariant,
    features: stack.features,
  })),
);

export const buildingLevels: BuildingLevel[] = [
  {
    level: "PO",
    title: "Podrum",
    items: ["15 ostava", "13 garaznih parking mesta"],
  },
  {
    level: "PR",
    title: "Prizemlje",
    items: ["2 poslovna prostora", "3 poslovna apartmana"],
  },
  {
    level: "1-3",
    title: "Stambeni spratovi",
    items: ["5 stanova po spratu", "garsonjere, jednoiposobni i dvoiposobni stanovi"],
  },
  {
    level: "Dv.",
    title: "Dvoriste",
    items: ["10 spoljasnjih parking mesta", "mirniji pristup objektu"],
  },
];

export const locationAdvantages = [
  "pocetak Telepa",
  "linija 12 ka centru",
  "Lidl u blizini",
  "Gimnazija Laza Kostic u blizini",
  "Kej, Ribarac, Sodros i parkovi",
  "planirana veza prema Fruskoj gori",
];

export const projectTimeline: TimelineItem[] = [
  {
    id: "start",
    date: "16.03.2026.",
    title: "Pocetak izgradnje",
    body: "Radovi su planirani i pokrenuti prema projektnoj dinamici.",
    state: "done",
  },
  {
    id: "foundation",
    date: "2026.",
    title: "Temelji i konstrukcija",
    body: "Faza namenjena formiranju osnovne konstrukcije objekta.",
    state: "active",
  },
  {
    id: "interior",
    date: "2027.",
    title: "Unutrasnji radovi",
    body: "Instalacije, zavrsni radovi i priprema prostora za kupce.",
    state: "upcoming",
  },
  {
    id: "finish",
    date: "15.11.2027.",
    title: "Planirani zavrsetak",
    body: "Predvidjen termin zavrsetka izgradnje objekta.",
    state: "upcoming",
  },
];
