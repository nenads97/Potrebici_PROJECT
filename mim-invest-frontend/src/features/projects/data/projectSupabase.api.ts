import { isSupabaseConfigured, supabase } from "../../../shared/supabase/client";
import type {
  Apartment,
  ApartmentStatus,
  ProjectInfo,
  ProjectMediaItem,
  TimelineItem,
} from "../types/project.types";
import {
  apartments as fallbackApartments,
  projectInfo as fallbackProjectInfo,
  projectTimeline as fallbackProjectTimeline,
} from "./herojaPinkija13.data";

const projectSlug = "heroja-pinkija-13";
const publicFetchTimeoutMs = 800;
const publicCacheTtlMs = 30_000;
const projectMediaTypes = ["project_image", "construction_update_image"] as const;
const comparisonPlanSortOrder = 200;

const publicCache = new Map<
  string,
  { expiresAt: number; value: unknown }
>();
const publicRequests = new Map<string, Promise<unknown>>();

const statusMap: Record<string, ApartmentStatus> = {
  available: "Available",
  reserved: "Reserved",
  sold: "Sold",
};

const projectStatusMap: Record<string, string> = {
  planned: "Planirano",
  active: "Izgradnja u toku",
  completed: "Završeno",
  hidden: "Sakriveno",
};

const monthNames = [
  "januar",
  "februar",
  "mart",
  "april",
  "maj",
  "jun",
  "jul",
  "avgust",
  "septembar",
  "oktobar",
  "novembar",
  "decembar",
];

export function formatProjectDateLong(dateValue?: string | null) {
  if (!dateValue) {
    return "";
  }

  const date = new Date(`${dateValue}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return `${date.getDate()}. ${monthNames[date.getMonth()]} ${date.getFullYear()}.`;
}

export function formatProjectDateCompact(dateValue?: string | null) {
  if (!dateValue) {
    return "";
  }

  const date = new Date(`${dateValue}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");

  return `${day}.${month}.${date.getFullYear()}.`;
}

function getApartmentStructure(apartmentNumber: string) {
  const normalizedNumber = Number(apartmentNumber);
  const stackPosition = ((normalizedNumber - 1) % 5) + 1;

  if (stackPosition === 1 || stackPosition === 2) {
    return "Trosoban";
  }

  if (stackPosition === 3) {
    return "Garsonjera";
  }

  if (stackPosition === 4 || stackPosition === 5) {
    return "Dvosoban";
  }

  return null;
}

export function fetchApartments() {
  return getCachedPublic("apartments", fetchApartmentsUncached);
}

async function fetchApartmentsUncached() {
  if (!isSupabaseConfigured || !supabase) {
    return fallbackApartments;
  }

  const [unitsResponse, comparisonMediaResponse] = await withSupabaseTimeout(
    Promise.all([
      supabase
        .from("units")
        .select(
          "id,slug,code,unit_type,floor_label,floor_number,area_m2,room_structure,status,orientation,short_description,full_description,seo_title,seo_description,bathrooms,terrace,features,main_image_url,floor_plan_pdf_url,sort_order,is_published",
        )
        .in("unit_type", ["apartment", "commercial_space"])
        .eq("is_published", true)
        .order("sort_order", { ascending: true }),
      supabase
        .from("project_media")
        .select("unit_id,file_path,alt_text,sort_order")
        .eq("media_type", "unit_image")
        .eq("is_published", true)
        .gte("sort_order", comparisonPlanSortOrder)
        .order("sort_order", { ascending: true }),
    ]),
  );

  if (unitsResponse.error) {
    throw unitsResponse.error;
  }

  if (!unitsResponse.data?.length) {
    return fallbackApartments;
  }

  const comparisonPlanByUnitId = new Map<string, { src: string; alt?: string }>();

  if (!comparisonMediaResponse.error) {
    for (const media of comparisonMediaResponse.data ?? []) {
      if (
        typeof media.unit_id === "string" &&
        typeof media.file_path === "string" &&
        !comparisonPlanByUnitId.has(media.unit_id)
      ) {
        comparisonPlanByUnitId.set(media.unit_id, {
          src: media.file_path,
          alt: typeof media.alt_text === "string" ? media.alt_text : undefined,
        });
      }
    }
  }

  return (unitsResponse.data ?? []).map<Apartment>((unit) => {
    const apartmentNumber = unit.code.replace(/\D/g, "");
    const fallback =
      fallbackApartments.find(
        (apartment) =>
          apartment.slug === unit.slug ||
          apartment.number.toLowerCase() === unit.code.toLowerCase(),
      ) ??
      fallbackApartments.find(
        (apartment) => apartment.unitType === unit.unit_type,
      ) ??
      fallbackApartments[0];
    const area = unit.area_m2 ? `${unit.area_m2} m2` : fallback.size;
    const rooms =
      unit.unit_type === "apartment"
        ? getApartmentStructure(apartmentNumber) ??
          unit.room_structure ??
          fallback.rooms
        : unit.room_structure ?? fallback.rooms;
    const comparisonPlan = comparisonPlanByUnitId.get(unit.id);

    return {
      ...fallback,
      unitType: unit.unit_type,
      slug: unit.slug,
      sortOrder: unit.sort_order,
      number: unit.code.replace(/^stan\s*/i, "") || unit.code,
      floor: unit.floor_label ?? fallback.floor,
      floorNumber: unit.floor_number ?? fallback.floorNumber,
      size: area,
      rooms,
      status: statusMap[unit.status] ?? fallback.status,
      orientation: unit.orientation ?? fallback.orientation,
      highlight: unit.short_description ?? fallback.highlight,
      description: unit.full_description ?? fallback.description,
      seoTitle: unit.seo_title ?? undefined,
      seoDescription: unit.seo_description ?? undefined,
      bathrooms: unit.bathrooms ?? fallback.bathrooms,
      terrace: unit.terrace ?? fallback.terrace,
      heroFloorPlan: unit.main_image_url
        ? {
            src: unit.main_image_url,
            alt: fallback.heroFloorPlan.alt,
          }
        : fallback.heroFloorPlan,
      projectFloorPlan: unit.unit_type === "commercial_space"
        ? fallback.projectFloorPlan
        : comparisonPlan
        ? {
            src: comparisonPlan.src,
            alt: comparisonPlan.alt ?? fallback.projectFloorPlan.alt,
          }
        : fallback.projectFloorPlan,
      floorPlanPdfUrl: unit.floor_plan_pdf_url ?? fallback.floorPlanPdfUrl,
      plan: [
        { label: "Ukupna površina", value: area },
        { label: "Struktura", value: rooms },
        { label: "Kupatila", value: unit.bathrooms ?? fallback.bathrooms },
        { label: "Terasa", value: unit.terrace ?? fallback.terrace },
      ],
      features: Array.isArray(unit.features)
        ? unit.features.filter((item: unknown): item is string => typeof item === "string")
        : fallback.features,
    };
  });
}

export function fetchProjectInfo() {
  return getCachedPublic<ProjectInfo>("project-info", fetchProjectInfoUncached);
}

async function fetchProjectInfoUncached(): Promise<ProjectInfo> {
  if (!isSupabaseConfigured || !supabase) {
    return fallbackProjectInfo;
  }

  const { data, error } = await withSupabaseTimeout(
    supabase
      .from("projects")
      .select(
        "name,address,city,district,project_status,status_label,short_description,full_description,lead,description,location_description,floor_structure,construction_start_date,construction_end_date,hero_image_url,seo_title,seo_description",
      )
      .eq("slug", projectSlug)
      .eq("is_published", true)
      .maybeSingle(),
  );

  if (error) {
    throw error;
  }

  if (!data) {
    return fallbackProjectInfo;
  }

  return {
    name: data.name,
    address: data.address,
    city: data.city,
    district: data.district ?? fallbackProjectInfo.district,
    status: data.status_label ?? projectStatusMap[data.project_status] ?? fallbackProjectInfo.status,
    lead: data.short_description ?? data.lead ?? fallbackProjectInfo.lead,
    description: data.full_description ?? data.description ?? fallbackProjectInfo.description,
    locationDescription: data.location_description ?? fallbackProjectInfo.locationDescription,
    floorStructure: data.floor_structure ?? fallbackProjectInfo.floorStructure,
    plannedCompletion:
      formatProjectDateLong(data.construction_end_date) || fallbackProjectInfo.plannedCompletion,
    constructionStartDate: data.construction_start_date ?? fallbackProjectInfo.constructionStartDate,
    constructionEndDate: data.construction_end_date ?? fallbackProjectInfo.constructionEndDate,
    heroImage: data.hero_image_url ?? fallbackProjectInfo.heroImage,
    seoTitle: data.seo_title ?? fallbackProjectInfo.seoTitle,
    seoDescription: data.seo_description ?? fallbackProjectInfo.seoDescription,
  };
}

export function fetchProjectTimeline() {
  return getCachedPublic<TimelineItem[]>(
    "project-timeline",
    fetchProjectTimelineUncached,
  );
}

async function fetchProjectTimelineUncached(): Promise<TimelineItem[]> {
  if (!isSupabaseConfigured || !supabase) {
    return fallbackProjectTimeline;
  }

  const projectId = await fetchProjectId();

  if (!projectId) {
    return fallbackProjectTimeline;
  }

  const { data, error } = await withSupabaseTimeout(
    supabase
      .from("construction_updates")
      .select("id,update_date,tag,title,short_description,status_label,timeline_state,sort_order")
      .eq("project_id", projectId)
      .eq("is_published", true)
      .order("sort_order", { ascending: true })
      .order("update_date", { ascending: true }),
  );

  if (error) {
    throw error;
  }

  if (!data?.length) {
    return fallbackProjectTimeline;
  }

  return data.map((item) => ({
    id: item.id,
    date:
      formatProjectDateCompact(item.update_date) ||
      item.tag ||
      timelineStateLabels[item.timeline_state],
    title: item.title,
    body: item.short_description ?? "",
    statusLabel: item.status_label ?? timelineStateLabels[item.timeline_state],
    state: item.timeline_state,
  }));
}

export function fetchProjectMedia() {
  return getCachedPublic<ProjectMediaItem[]>(
    "project-media",
    fetchProjectMediaUncached,
  );
}

async function fetchProjectMediaUncached(): Promise<ProjectMediaItem[]> {
  if (!isSupabaseConfigured || !supabase) {
    return [];
  }

  const projectId = await fetchProjectId();

  if (!projectId) {
    return [];
  }

  const { data, error } = await withSupabaseTimeout(
    supabase
      .from("project_media")
      .select("id,title,media_type,file_path,alt_text,description,sort_order")
      .eq("project_id", projectId)
      .is("unit_id", null)
      .in("media_type", [...projectMediaTypes])
      .eq("is_published", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true }),
  );

  if (error) {
    throw error;
  }

  return (data ?? [])
    .filter((item): item is typeof item & { media_type: ProjectMediaItem["mediaType"] } =>
      isProjectMediaType(item.media_type),
    )
    .map<ProjectMediaItem>((item) => ({
      id: item.id,
      title: item.title,
      mediaType: item.media_type,
      filePath: optimizePublicImagePath(item.file_path),
      altText: item.alt_text ?? undefined,
      description: item.description ?? undefined,
      sortOrder: item.sort_order,
    }));
}

function isProjectMediaType(value: string): value is ProjectMediaItem["mediaType"] {
  return projectMediaTypes.some((mediaType) => mediaType === value);
}

function optimizePublicImagePath(filePath: string) {
  return filePath.replace(
    "/images/heroja-pinkija-13/hero-generated.png",
    "/images/heroja-pinkija-13/hero-generated.jpg",
  );
}

function fetchProjectId(): Promise<string | null> {
  const client = supabase;

  if (!isSupabaseConfigured || !client) {
    return Promise.resolve(null);
  }

  return getCachedPublic("project-id", async () => {
    const { data, error } = await withSupabaseTimeout(
      client
        .from("projects")
        .select("id")
        .eq("slug", projectSlug)
        .eq("is_published", true)
        .maybeSingle(),
    );

    if (error) {
      throw error;
    }

    return data?.id ?? null;
  });
}

const timelineStateLabels: Record<TimelineItem["state"], string> = {
  done: "Završeno",
  active: "Aktuelno",
  upcoming: "Planirano",
};

function withSupabaseTimeout<T>(query: PromiseLike<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      reject(new Error("Supabase javni upit je istekao."));
    }, publicFetchTimeoutMs);

    Promise.resolve(query).then(
      (value) => {
        window.clearTimeout(timeoutId);
        resolve(value);
      },
      (error: unknown) => {
        window.clearTimeout(timeoutId);
        reject(error);
      },
    );
  });
}

function getCachedPublic<T>(
  key: string,
  loader: () => Promise<T>,
  ttlMs = publicCacheTtlMs,
): Promise<T> {
  const cached = publicCache.get(key);

  if (cached && cached.expiresAt > Date.now()) {
    return Promise.resolve(cached.value as T);
  }

  const existingRequest = publicRequests.get(key);

  if (existingRequest) {
    return existingRequest as Promise<T>;
  }

  const request = loader()
    .then((value) => {
      publicCache.set(key, {
        value,
        expiresAt: Date.now() + ttlMs,
      });
      return value;
    })
    .finally(() => {
      publicRequests.delete(key);
    });

  publicRequests.set(key, request);
  return request;
}
