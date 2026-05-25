import { isSupabaseConfigured, supabase } from "../../../shared/supabase/client";
import type {
  AdminInquiry,
  AdminLandOffer,
  AdminMediaItem,
  AdminProjectDraft,
  AdminUnit,
  AdminWorkflowStatus,
} from "../types/admin.types";

const projectSlug = "heroja-pinkija-13";

export type AdminSupabaseState = {
  inquiries: AdminInquiry[];
  landOffers: AdminLandOffer[];
  units: AdminUnit[];
  projectDraft: AdminProjectDraft | null;
  mediaItems: AdminMediaItem[];
};

export async function fetchAdminState(): Promise<AdminSupabaseState | null> {
  if (!isSupabaseConfigured || !supabase) {
    return null;
  }

  const [inquiries, landOffers, units, project, mediaItems] = await Promise.all([
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
      .from("project_media")
      .select("*")
      .order("sort_order", { ascending: true }),
  ]);

  const error =
    inquiries.error ?? landOffers.error ?? units.error ?? project.error ?? mediaItems.error;

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
    units: (units.data ?? []).map((unit) => ({
      id: unit.id,
      unitCode: unit.code.startsWith("Stan") ? unit.code : `Stan ${unit.code}`,
      unitType: unit.unit_type,
      floorLabel: unit.floor_label ?? "",
      areaM2: unit.area_m2 ? `${unit.area_m2} m2` : "",
      roomStructure: unit.room_structure ?? "",
      status: unit.status,
      shortDescription: unit.short_description ?? "",
      isPublished: unit.is_published,
    })),
    projectDraft: project.data
      ? {
          id: project.data.id,
          name: project.data.name,
          address: `${project.data.address}, ${project.data.city}`,
          shortDescription: project.data.short_description ?? project.data.lead ?? "",
          locationDescription: project.data.location_description ?? "",
          floorStructure: project.data.floor_structure ?? "",
          constructionStartDate: project.data.construction_start_date ?? "",
          constructionEndDate: project.data.construction_end_date ?? "",
          projectStatus: project.data.project_status,
        }
      : null,
    mediaItems: (mediaItems.data ?? []).map((item) => ({
      id: item.id,
      title: item.title,
      mediaType: item.media_type,
      filePath: item.file_path,
      altText: item.alt_text ?? "",
      isPublished: item.is_published,
    })),
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
  changes: Pick<Partial<AdminUnit>, "status" | "isPublished">,
) {
  if (!supabase) return;
  const { error } = await supabase
    .from("units")
    .update({
      status: changes.status,
      is_published: changes.isPublished,
    })
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
      short_description: project.shortDescription,
      location_description: project.locationDescription,
      floor_structure: project.floorStructure,
      construction_start_date: project.constructionStartDate || null,
      construction_end_date: project.constructionEndDate || null,
      project_status: project.projectStatus,
    })
    .eq("id", project.id);
  if (error) throw error;
}

export async function updateMediaItem(
  id: string,
  changes: Pick<Partial<AdminMediaItem>, "title" | "filePath" | "altText" | "isPublished">,
) {
  if (!supabase) return;
  const { error } = await supabase
    .from("project_media")
    .update({
      title: changes.title,
      file_path: changes.filePath,
      alt_text: changes.altText,
      is_published: changes.isPublished,
    })
    .eq("id", id);
  if (error) throw error;
}
