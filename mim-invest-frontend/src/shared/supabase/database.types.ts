export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type UnitType = "apartment" | "commercial_space" | "business_apartment";
export type UnitStatus = "available" | "reserved" | "sold";
export type PriceDisplayMode = "on_request" | "hidden";
export type ProjectPdfType =
  | "apartment_floor_plan"
  | "building_floor_plan"
  | "garage_plan"
  | "storage_plan"
  | "general_brochure";
export type TimelineState = "done" | "active" | "upcoming";
export type ContactInquiryType = "general" | "unit" | "viewing" | "availability";
export type AdminItemStatus = "new" | "contacted" | "closed";
export type EmailRelatedEntityType = "contact_inquiry" | "land_offer";
export type EmailDeliveryKind = "user_confirmation" | "sales_notification";
export type EmailDeliveryStatus = "pending" | "sent" | "failed";
export type ProjectMediaType =
  | "project_image"
  | "unit_image"
  | "apartment_floor_plan_pdf"
  | "building_floor_plan_pdf"
  | "garage_plan_pdf"
  | "storage_plan_pdf"
  | "general_brochure_pdf"
  | "construction_update_image";

type TableDefinition<Row> = {
  Row: Row;
  Insert: Partial<Row>;
  Update: Partial<Row>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      site_settings: TableDefinition<{
        id: boolean;
        site_name: string;
        default_seo_title: string | null;
        default_seo_description: string | null;
        contact_phone: string | null;
        contact_email: string | null;
        company_name: string;
        company_address: string | null;
        footer_text: string | null;
        social_links: Json;
        created_at: string;
        updated_at: string;
      }>;
      email_service_settings: TableDefinition<{
        id: boolean;
        brevo_api_key: string;
        sender_email: string;
        sender_name: string;
        sales_email: string;
        updated_at: string;
      }>;
      projects: TableDefinition<{
        id: string;
        slug: string;
        name: string;
        address: string;
        city: string;
        district: string | null;
        project_status: "planned" | "active" | "completed" | "hidden";
        status_label: string | null;
        short_description: string | null;
        full_description: string | null;
        lead: string | null;
        description: string | null;
        location_description: string | null;
        floor_structure: string | null;
        construction_start_date: string | null;
        construction_end_date: string | null;
        total_apartments: number;
        total_commercial_spaces: number;
        total_business_apartments: number;
        total_storage_units: number;
        total_garage_parking_spaces: number;
        total_yard_parking_spaces: number;
        hero_image_url: string | null;
        gallery_images: Json;
        seo_title: string | null;
        seo_description: string | null;
        sort_order: number;
        is_published: boolean;
        created_at: string;
        updated_at: string;
      }>;
      units: TableDefinition<{
        id: string;
        project_id: string;
        code: string;
        slug: string;
        unit_type: UnitType;
        floor_label: string | null;
        floor_number: number | null;
        area_m2: number | null;
        room_structure: string | null;
        status: UnitStatus;
        orientation: string | null;
        bathrooms: string | null;
        terrace: string | null;
        short_description: string | null;
        full_description: string | null;
        features: Json;
        main_image_url: string | null;
        gallery_images: Json;
        floor_plan_pdf_url: string | null;
        price_display_mode: PriceDisplayMode;
        sort_order: number;
        is_featured: boolean;
        is_published: boolean;
        seo_title: string | null;
        seo_description: string | null;
        created_at: string;
        updated_at: string;
      }>;
      project_pdfs: TableDefinition<{
        id: string;
        project_id: string;
        title: string;
        pdf_type: ProjectPdfType;
        file_url: string;
        description: string | null;
        sort_order: number;
        is_published: boolean;
        created_at: string;
        updated_at: string;
      }>;
      project_media: TableDefinition<{
        id: string;
        project_id: string | null;
        unit_id: string | null;
        title: string;
        media_type: ProjectMediaType;
        file_path: string;
        alt_text: string | null;
        description: string | null;
        sort_order: number;
        is_published: boolean;
        created_at: string;
      }>;
      construction_updates: TableDefinition<{
        id: string;
        project_id: string;
        update_date: string | null;
        tag: string | null;
        title: string;
        short_description: string | null;
        image_gallery: Json;
        status_label: string | null;
        timeline_state: TimelineState;
        sort_order: number;
        is_published: boolean;
        created_at: string;
        updated_at: string;
      }>;
      page_sections: TableDefinition<{
        id: string;
        page_key: "home" | "about" | "contact" | "land_acquisition";
        section_key: string;
        title: string | null;
        subtitle: string | null;
        body: string | null;
        image_path: string | null;
        items: Json;
        sort_order: number;
        is_published: boolean;
        created_at: string;
        updated_at: string;
      }>;
      land_acquisition_page: TableDefinition<{
        id: boolean;
        title: string;
        slug: string;
        hero_image_url: string | null;
        intro_text: string | null;
        criteria_items: Json;
        process_steps: Json;
        contact_cta_text: string | null;
        seo_title: string | null;
        seo_description: string | null;
        is_published: boolean;
        created_at: string;
        updated_at: string;
      }>;
      contact_inquiries: TableDefinition<{
        id: string;
        project_slug: string | null;
        unit_code: string | null;
        inquiry_type: ContactInquiryType;
        full_name: string;
        phone: string | null;
        email: string;
        message: string | null;
        source_page: string | null;
        consent_accepted: boolean;
        attachment_path: string | null;
        attachment_name: string | null;
        attachment_mime_type: string | null;
        attachment_size_bytes: number | null;
        admin_status: AdminItemStatus;
        admin_note: string | null;
        created_at: string;
        updated_at: string;
      }>;
      land_offers: TableDefinition<{
        id: string;
        full_name: string;
        phone: string;
        email: string;
        property_address: string | null;
        plot_area_m2: number | null;
        details: string | null;
        source_page: string | null;
        consent_accepted: boolean;
        attachment_path: string | null;
        attachment_name: string | null;
        attachment_mime_type: string | null;
        attachment_size_bytes: number | null;
        admin_status: AdminItemStatus;
        admin_note: string | null;
        created_at: string;
        updated_at: string;
      }>;
      email_delivery_log: TableDefinition<{
        id: string;
        related_entity_type: EmailRelatedEntityType;
        related_entity_id: string | null;
        delivery_kind: EmailDeliveryKind;
        recipient_email: string;
        subject: string;
        provider: string;
        provider_message_id: string | null;
        status: EmailDeliveryStatus;
        error_message: string | null;
        created_at: string;
        sent_at: string | null;
      }>;
      form_rate_limit_events: TableDefinition<{
        id: string;
        action: string;
        identifier_hash: string;
        source_page: string | null;
        created_at: string;
      }>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
