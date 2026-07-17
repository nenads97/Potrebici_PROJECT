import type { SupabaseClient } from "npm:@supabase/supabase-js@2";

export const inquiryAttachmentsBucket = "inquiry-attachments";
export const maxInquiryAttachmentSizeBytes = 4 * 1024 * 1024;

const attachmentDefinitions: Record<string, { mimeType: string }> = {
  pdf: { mimeType: "application/pdf" },
  doc: { mimeType: "application/msword" },
  docx: {
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  },
  jpg: { mimeType: "image/jpeg" },
  jpeg: { mimeType: "image/jpeg" },
  png: { mimeType: "image/png" },
};

export type ValidatedInquiryAttachment = {
  file: File;
  name: string;
  mimeType: string;
  sizeBytes: number;
};

export type UploadedInquiryAttachment = {
  path: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
};

export function validateInquiryAttachment(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return { ok: true, attachment: null } as const;
  }

  if (!(value instanceof File) || value.size === 0) {
    return { ok: false, message: "Priloženi dokument nije ispravan." } as const;
  }

  if (value.size > maxInquiryAttachmentSizeBytes) {
    return { ok: false, message: "Dokument može imati najviše 4 MB." } as const;
  }

  const extension = getExtension(value.name);
  const definition = attachmentDefinitions[extension];

  if (!definition) {
    return {
      ok: false,
      message: "Dozvoljeni formati su PDF, DOC, DOCX, JPG i PNG.",
    } as const;
  }

  return {
    ok: true,
    attachment: {
      file: value,
      name: normalizeFileName(value.name, extension),
      mimeType: definition.mimeType,
      sizeBytes: value.size,
    },
  } as const;
}

export async function uploadInquiryAttachment(
  supabase: SupabaseClient,
  entityType: "contact-inquiry" | "land-offer",
  attachment: ValidatedInquiryAttachment,
) {
  const path = [
    entityType,
    new Date().toISOString().slice(0, 10),
    `${crypto.randomUUID()}-${attachment.name}`,
  ].join("/");

  const { error } = await supabase.storage
    .from(inquiryAttachmentsBucket)
    .upload(path, attachment.file, {
      cacheControl: "3600",
      contentType: attachment.mimeType,
      upsert: false,
    });

  if (error) {
    throw error;
  }

  return {
    path,
    name: attachment.name,
    mimeType: attachment.mimeType,
    sizeBytes: attachment.sizeBytes,
  } satisfies UploadedInquiryAttachment;
}

export async function removeInquiryAttachment(
  supabase: SupabaseClient,
  path: string,
) {
  await supabase.storage.from(inquiryAttachmentsBucket).remove([path]);
}

export async function toBrevoAttachment(
  attachment: ValidatedInquiryAttachment,
) {
  const bytes = new Uint8Array(await attachment.file.arrayBuffer());

  return {
    name: attachment.name,
    content: bytesToBase64(bytes),
  };
}

function getExtension(fileName: string) {
  return fileName.match(/\.([a-z0-9]+)$/i)?.[1]?.toLowerCase() ?? "";
}

function normalizeFileName(fileName: string, extension: string) {
  const baseName = fileName.replace(/\.[^.]+$/, "");
  const normalizedBaseName =
    baseName
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 100) || "dokument";

  return `${normalizedBaseName}.${extension}`;
}

function bytesToBase64(bytes: Uint8Array) {
  const chunks: string[] = [];
  const chunkSize = 0x8000;

  for (let index = 0; index < bytes.length; index += chunkSize) {
    chunks.push(String.fromCharCode(...bytes.subarray(index, index + chunkSize)));
  }

  return btoa(chunks.join(""));
}
