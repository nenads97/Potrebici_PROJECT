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
const projectMediaTypes = ["project_image", "construction_update_image"] as const;

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

export async function fetchApartments() {
  if (!isSupabaseConfigured || !supabase) {
    return fallbackApartments;
  }

  const { data, error } = await withSupabaseTimeout(
    supabase
      .from("units")
      .select("*")
      .eq("unit_type", "apartment")
      .eq("is_published", true)
      .order("sort_order", { ascending: true }),
  );

  if (error) {
    throw error;
  }

  if (!data?.length) {
    return fallbackApartments;
  }

  return (data ?? []).map<Apartment>((unit) => {
    const apartmentNumber = unit.code.replace(/\D/g, "");
    const fallback =
      fallbackApartments.find((apartment) => apartment.number === apartmentNumber) ?? fallbackApartments[0];
    const area = unit.area_m2 ? `${unit.area_m2} m2` : fallback.size;
    const rooms = getApartmentStructure(apartmentNumber) ?? unit.room_structure ?? fallback.rooms;

    return {
      ...fallback,
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
      heroFloorPlan: fallback.heroFloorPlan,
      projectFloorPlan: fallback.projectFloorPlan,
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

export async function fetchProjectInfo(): Promise<ProjectInfo> {
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
    constructionstart:
      formatProjectDateLong(data.construction_start_date) || fallbackProjectInfo.constructionstart,
    plannedCompletion:
      formatProjectDateLong(data.construction_end_date) || fallbackProjectInfo.plannedCompletion,
    constructionStartDate: data.construction_start_date ?? fallbackProjectInfo.constructionStartDate,
    constructionEndDate: data.construction_end_date ?? fallbackProjectInfo.constructionEndDate,
    heroImage: data.hero_image_url ?? fallbackProjectInfo.heroImage,
    seoTitle: data.seo_title ?? fallbackProjectInfo.seoTitle,
    seoDescription: data.seo_description ?? fallbackProjectInfo.seoDescription,
  };
}

export async function fetchProjectTimeline(): Promise<TimelineItem[]> {
  if (!isSupabaseConfigured || !supabase) {
    return fallbackProjectTimeline;
  }

  const { data: project, error: projectError } = await withSupabaseTimeout(
    supabase
      .from("projects")
      .select("id")
      .eq("slug", projectSlug)
      .eq("is_published", true)
      .maybeSingle(),
  );

  if (projectError) {
    throw projectError;
  }

  if (!project) {
    return fallbackProjectTimeline;
  }

  const { data, error } = await withSupabaseTimeout(
    supabase
      .from("construction_updates")
      .select("id,update_date,tag,title,short_description,status_label,timeline_state,sort_order")
      .eq("project_id", project.id)
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

export async function fetchProjectMedia(): Promise<ProjectMediaItem[]> {
  if (!isSupabaseConfigured || !supabase) {
    return [];
  }

  const { data: project, error: projectError } = await withSupabaseTimeout(
    supabase
      .from("projects")
      .select("id")
      .eq("slug", projectSlug)
      .eq("is_published", true)
      .maybeSingle(),
  );

  if (projectError) {
    throw projectError;
  }

  if (!project) {
    return [];
  }

  const { data, error } = await withSupabaseTimeout(
    supabase
      .from("project_media")
      .select("id,title,media_type,file_path,alt_text,description,sort_order")
      .eq("project_id", project.id)
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
      filePath: item.file_path,
      altText: item.alt_text ?? undefined,
      description: item.description ?? undefined,
      sortOrder: item.sort_order,
    }));
}

function isProjectMediaType(value: string): value is ProjectMediaItem["mediaType"] {
  return projectMediaTypes.some((mediaType) => mediaType === value);
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
