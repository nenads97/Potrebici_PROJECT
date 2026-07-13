import { isSupabaseConfigured, supabase } from "../../../shared/supabase/client";
import { apartments, projectInfo } from "../../projects/data/herojaPinkija13.data";
import type {
  AdminConstructionUpdate,
  AdminInquiry,
  AdminLandOffer,
  AdminMediaItem,
  AdminProjectDraft,
  AdminUnit,
  AdminWorkflowStatus,
} from "../types/admin.types";

const projectSlug = "heroja-pinkija-13";
const publicAssetsBucket = "public-assets";
const adminFetchTimeoutMs = 1500;
const apartmentLookup = new Map(apartments.map((apartment) => [apartment.number, apartment]));

export type AdminSupabaseState = {
  inquiries: AdminInquiry[];
  landOffers: AdminLandOffer[];
  units: AdminUnit[];
  projectDraft: AdminProjectDraft | null;
  constructionUpdates: AdminConstructionUpdate[];
  mediaItems: AdminMediaItem[];
};

export type AdminMediaUploadResult = {
  publicUrl: string;
  storagePath: string;
  fileName: string;
};

export type AdminMediaCreateInput = {
  projectId?: string | null;
  unitId?: string | null;
  title: string;
  mediaType: AdminMediaItem["mediaType"];
  filePath: string;
  altText: string;
  isPublished: boolean;
  sortOrder?: number;
};

export async function fetchAdminState(): Promise<AdminSupabaseState | null> {
  if (!isSupabaseConfigured || !supabase) {
    return null;
  }

  const [inquiries, landOffers, units, project, constructionUpdates, mediaItems] = await withAdminFetchTimeout(
    Promise.all([
      supabase
        .from("contact_inquiries")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("land_offers")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("units")
        .select("*")
        .order("sort_order", { ascending: true }),
      supabase
        .from("projects")
        .select("*")
        .eq("slug", projectSlug)
        .single(),
      supabase
        .from("construction_updates")
        .select("*")
        .order("sort_order", { ascending: true }),
      supabase
        .from("project_media")
        .select("*")
        .order("sort_order", { ascending: true }),
    ]),
  );

  const error =
    inquiries.error ??
    landOffers.error ??
    units.error ??
    project.error ??
    constructionUpdates.error ??
    mediaItems.error;

  if (error) {
    throw error;
  }

  return {
    inquiries: (inquiries.data ?? []).map((item) => ({
      id: item.id,
      fullName: item.full_name,
      phone: item.phone ?? "",
      email: item.email,
      message: item.message ?? "",
      inquiryType: item.inquiry_type,
      projectSlug: item.project_slug ?? projectSlug,
      unitCode: item.unit_code ?? undefined,
      sourcePage: item.source_page ?? "",
      adminStatus: item.admin_status,
      adminNote: item.admin_note ?? "",
      createdAt: item.created_at,
    })),
    landOffers: (landOffers.data ?? []).map((item) => ({
      id: item.id,
      fullName: item.full_name,
      phone: item.phone,
      email: item.email,
      propertyAddress: item.property_address ?? "",
      plotAreaM2: item.plot_area_m2 ?? 0,
      details: item.details ?? "",
      sourcePage: item.source_page ?? "",
      adminStatus: item.admin_status,
      adminNote: item.admin_note ?? "",
      createdAt: item.created_at,
    })),
    units: (units.data ?? []).map((unit) => {
      const apartmentNumber = unit.code.match(/\d+/)?.[0] ?? unit.code;
      const apartment = apartmentLookup.get(apartmentNumber);

      return {
        id: unit.id,
        unitCode: unit.code.startsWith("Stan") ? unit.code : `Stan ${unit.code}`,
        unitType: unit.unit_type,
        floorLabel: unit.floor_label ?? "",
        areaM2: unit.area_m2 ? `${unit.area_m2} m2` : "",
        roomStructure: unit.room_structure ?? "",
        status: unit.status,
        shortDescription: unit.short_description ?? apartment?.highlight ?? "",
        fullDescription: unit.full_description ?? apartment?.description ?? "",
        seoTitle: unit.seo_title ?? "",
        seoDescription: unit.seo_description ?? "",
        publicPath: `/projekti/${projectSlug}/ponuda-stanova/${apartmentNumber}`,
        planVariant: apartment?.planVariant,
        floorPlanPath: unit.main_image_url ?? apartment?.heroFloorPlan.src,
        isPublished: unit.is_published,
      };
    }),
    projectDraft: project.data
      ? {
          id: project.data.id,
          name: project.data.name,
          address: `${project.data.address}, ${project.data.city}`,
          statusLabel: project.data.status_label ?? projectInfo.status,
          shortDescription: project.data.short_description ?? project.data.lead ?? "",
          fullDescription:
            project.data.full_description ?? project.data.description ?? projectInfo.description,
          locationDescription: project.data.location_description ?? "",
          floorStructure: project.data.floor_structure ?? "",
          constructionStartDate: project.data.construction_start_date ?? "",
          constructionEndDate: project.data.construction_end_date ?? "",
          heroImageUrl: project.data.hero_image_url ?? projectInfo.heroImage ?? "",
          seoTitle: project.data.seo_title ?? "",
          seoDescription: project.data.seo_description ?? "",
          projectStatus: project.data.project_status,
        }
      : null,
    constructionUpdates: (constructionUpdates.data ?? []).map((item) => ({
      id: item.id,
      title: item.title,
      tag: item.tag ?? "",
      statusLabel: item.status_label ?? "",
      shortDescription: item.short_description ?? "",
      updateDate: item.update_date ?? "",
      timelineState: item.timeline_state,
      sortOrder: item.sort_order,
      isPublished: item.is_published,
    })),
    mediaItems: (mediaItems.data ?? []).map(mapMediaItem),
  };
}

export async function updateInquiry(id: string, changes: {
  admin_status?: AdminWorkflowStatus;
  admin_note?: string;
}) {
  if (!supabase) return;
  const { error } = await supabase.from("contact_inquiries").update(changes).eq("id", id);
  if (error) throw error;
}

export async function updateLandOffer(id: string, changes: {
  admin_status?: AdminWorkflowStatus;
  admin_note?: string;
}) {
  if (!supabase) return;
  const { error } = await supabase.from("land_offers").update(changes).eq("id", id);
  if (error) throw error;
}

export async function updateUnit(
  id: string,
  changes: Pick<
    Partial<AdminUnit>,
    "status" | "isPublished" | "shortDescription" | "fullDescription" | "seoTitle" | "seoDescription"
  >,
) {
  if (!supabase) return;
  const payload: {
    status?: AdminUnit["status"];
    is_published?: boolean;
    short_description?: string;
    full_description?: string;
    seo_title?: string | null;
    seo_description?: string | null;
  } = {};

  if ("status" in changes) {
    payload.status = changes.status;
  }

  if ("isPublished" in changes) {
    payload.is_published = changes.isPublished;
  }

  if ("shortDescription" in changes) {
    payload.short_description = changes.shortDescription;
  }

  if ("fullDescription" in changes) {
    payload.full_description = changes.fullDescription;
  }

  if ("seoTitle" in changes) {
    payload.seo_title = changes.seoTitle?.trim() || null;
  }

  if ("seoDescription" in changes) {
    payload.seo_description = changes.seoDescription?.trim() || null;
  }

  const { error } = await supabase
    .from("units")
    .update(payload)
    .eq("id", id);
  if (error) throw error;
}

export async function updateProject(project: AdminProjectDraft) {
  if (!supabase) return;
  const [address, ...cityParts] = project.address.split(",");
  const city = cityParts.join(",").trim() || "Novi Sad";
  const { error } = await supabase
    .from("projects")
    .update({
      name: project.name,
      address: address.trim(),
      city,
      status_label: project.statusLabel.trim() || null,
      short_description: project.shortDescription,
      lead: project.shortDescription,
      full_description: project.fullDescription,
      description: project.fullDescription,
      location_description: project.locationDescription,
      floor_structure: project.floorStructure,
      construction_start_date: project.constructionStartDate || null,
      construction_end_date: project.constructionEndDate || null,
      hero_image_url: project.heroImageUrl.trim() || null,
      seo_title: project.seoTitle.trim() || null,
      seo_description: project.seoDescription.trim() || null,
      project_status: project.projectStatus,
    })
    .eq("id", project.id);
  if (error) throw error;
}

export async function updateConstructionUpdate(
  id: string,
  changes: Pick<
    Partial<AdminConstructionUpdate>,
    "title" | "tag" | "statusLabel" | "shortDescription" | "updateDate" | "timelineState" | "sortOrder" | "isPublished"
  >,
) {
  if (!supabase) return;
  const payload: {
    title?: string;
    tag?: string | null;
    status_label?: string | null;
    short_description?: string | null;
    update_date?: string | null;
    timeline_state?: AdminConstructionUpdate["timelineState"];
    sort_order?: number;
    is_published?: boolean;
  } = {};

  if ("title" in changes) {
    payload.title = changes.title;
  }

  if ("tag" in changes) {
    payload.tag = changes.tag?.trim() || null;
  }

  if ("statusLabel" in changes) {
    payload.status_label = changes.statusLabel?.trim() || null;
  }

  if ("shortDescription" in changes) {
    payload.short_description = changes.shortDescription?.trim() || null;
  }

  if ("updateDate" in changes) {
    payload.update_date = changes.updateDate || null;
  }

  if ("timelineState" in changes) {
    payload.timeline_state = changes.timelineState;
  }

  if ("sortOrder" in changes) {
    payload.sort_order = changes.sortOrder;
  }

  if ("isPublished" in changes) {
    payload.is_published = changes.isPublished;
  }

  const { error } = await supabase
    .from("construction_updates")
    .update(payload)
    .eq("id", id);

  if (error) throw error;
}

export async function updateMediaItem(
  id: string,
  changes: Pick<Partial<AdminMediaItem>, "title" | "filePath" | "altText" | "isPublished">,
) {
  if (!supabase) return;
  const payload: {
    title?: string;
    file_path?: string;
    alt_text?: string;
    is_published?: boolean;
  } = {};

  if ("title" in changes) {
    payload.title = changes.title;
  }

  if ("filePath" in changes) {
    payload.file_path = changes.filePath;
  }

  if ("altText" in changes) {
    payload.alt_text = changes.altText;
  }

  if ("isPublished" in changes) {
    payload.is_published = changes.isPublished;
  }

  const { error } = await supabase
    .from("project_media")
    .update(payload)
    .eq("id", id);
  if (error) throw error;
}

export async function createMediaItem(input: AdminMediaCreateInput): Promise<AdminMediaItem> {
  if (!supabase) {
    throw new Error("Supabase nije konfigurisan. Nova media kartica nije sacuvana.");
  }

  const { data, error } = await supabase
    .from("project_media")
    .insert({
      project_id: input.projectId ?? null,
      unit_id: input.unitId ?? null,
      title: input.title,
      media_type: input.mediaType,
      file_path: input.filePath,
      alt_text: input.altText || null,
      is_published: input.isPublished,
      sort_order: input.sortOrder ?? 0,
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return mapMediaItem(data);
}

export async function deleteMediaItem(id: string) {
  if (!supabase) return;

  const { error } = await supabase.from("project_media").delete().eq("id", id);

  if (error) {
    throw error;
  }
}

export async function uploadMediaFile(
  item: Pick<AdminMediaItem, "id" | "mediaType">,
  file: File,
): Promise<AdminMediaUploadResult> {
  if (!supabase) {
    throw new Error("Supabase nije konfigurisan. Upload fajla nije moguc lokalno.");
  }

  const fileName = normalizeFileName(file.name);
  const storagePath = [
    "projects",
    projectSlug,
    getMediaStorageFolder(item.mediaType),
    `${item.id}-${Date.now()}-${fileName}`,
  ].join("/");

  const { data, error } = await supabase.storage
    .from(publicAssetsBucket)
    .upload(storagePath, file, {
      cacheControl: "31536000",
      contentType: file.type || undefined,
      upsert: false,
    });

  if (error) {
    throw error;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(publicAssetsBucket).getPublicUrl(data.path);

  return {
    publicUrl,
    storagePath: data.path,
    fileName,
  };
}

function getMediaStorageFolder(mediaType: AdminMediaItem["mediaType"]) {
  switch (mediaType) {
    case "project_image":
      return "project-images";
    case "unit_image":
      return "unit-plans";
    case "construction_update_image":
      return "construction-updates";
    case "apartment_floor_plan_pdf":
      return "apartment-floor-plan-pdfs";
    case "building_floor_plan_pdf":
      return "building-floor-plan-pdfs";
    case "garage_plan_pdf":
      return "garage-plan-pdfs";
    case "storage_plan_pdf":
      return "storage-plan-pdfs";
    case "general_brochure_pdf":
      return "brochures";
    default:
      return "misc";
  }
}

function normalizeFileName(fileName: string) {
  const fallback = "media-file";
  const [name = fallback, ...extensionParts] = fileName.split(".");
  const extension = extensionParts.pop();
  const normalizedName =
    name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || fallback;

  if (!extension) {
    return normalizedName;
  }

  const normalizedExtension = extension.toLowerCase().replace(/[^a-z0-9]/g, "");

  return normalizedExtension ? `${normalizedName}.${normalizedExtension}` : normalizedName;
}

function mapMediaItem(item: {
  id: string;
  project_id?: string | null;
  unit_id?: string | null;
  title: string;
  media_type: AdminMediaItem["mediaType"];
  file_path: string;
  alt_text: string | null;
  is_published: boolean;
}): AdminMediaItem {
  return {
    id: item.id,
    projectId: item.project_id ?? undefined,
    unitId: item.unit_id ?? undefined,
    title: item.title,
    mediaType: item.media_type,
    filePath: item.file_path,
    altText: item.alt_text ?? "",
    isPublished: item.is_published,
  };
}

function withAdminFetchTimeout<T>(query: PromiseLike<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      reject(new Error("Supabase admin podaci nisu stigli dovoljno brzo. Prikazani su lokalni fallback podaci."));
    }, adminFetchTimeoutMs);

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
