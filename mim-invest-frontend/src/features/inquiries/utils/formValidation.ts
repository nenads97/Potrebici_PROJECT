export type FieldErrors<TField extends string> = Partial<Record<TField, string>>;

export const maxInquiryAttachmentSizeBytes = 4 * 1024 * 1024;
export const inquiryAttachmentAccept =
  ".pdf,.doc,.docx,.jpg,.jpeg,.png,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png";

export const hasFieldErrors = <TField extends string>(errors: FieldErrors<TField>) =>
  Object.values(errors).some(Boolean);

export const getFormValue = (formData: FormData, name: string) =>
  String(formData.get(name) ?? "").trim();

export const mergeFieldError = <TField extends string>(
  currentErrors: FieldErrors<TField>,
  fieldName: TField,
  error?: string,
) => {
  const nextErrors = { ...currentErrors };

  if (error) {
    nextErrors[fieldName] = error;
  } else {
    delete nextErrors[fieldName];
  }

  return nextErrors;
};

export const focusFirstInvalidField = <TField extends string>(
  form: HTMLFormElement,
  fieldOrder: TField[],
  errors: FieldErrors<TField>,
) => {
  const firstInvalidName = fieldOrder.find((fieldName) => Boolean(errors[fieldName]));

  if (!firstInvalidName) {
    return;
  }

  const field = form.elements.namedItem(firstInvalidName);

  if (field instanceof HTMLElement) {
    field.focus();
  }
};

export function validateRequiredText(
  value: string,
  label: string,
  minLength = 2,
  maxLength = 160,
) {
  const text = value.trim();

  if (text.length < minLength) {
    return `${label} je obavezno polje.`;
  }

  if (text.length > maxLength) {
    return `${label} je predugacko.`;
  }

  return "";
}

export function validateOptionalText(value: string, label: string, maxLength: number) {
  const text = value.trim();

  if (text.length > maxLength) {
    return `${label} je predugacko.`;
  }

  return "";
}

export function validateEmail(value: string) {
  const text = value.trim();
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!pattern.test(text) || text.length > 254) {
    return "Unesite ispravnu e-mail adresu.";
  }

  return "";
}

export function validatePhone(value: string, required = false) {
  const text = value.trim();

  if (!text && !required) {
    return "";
  }

  if (text.length < 5 || text.length > 80) {
    return "Unesite ispravan telefon.";
  }

  return "";
}

export function validatePositiveNumber(value: string, label: string) {
  const text = value.trim();

  if (!text) {
    return "";
  }

  const numberValue = Number(text);

  if (!Number.isFinite(numberValue) || numberValue <= 0) {
    return `${label} mora biti pozitivan broj.`;
  }

  return "";
}

export function validateConsent(value: FormDataEntryValue | null) {
  return value === "on" ? "" : "Potrebna je saglasnost za obradu podataka.";
}

export function validateInquiryAttachment(value: FormDataEntryValue | null) {
  if (!(value instanceof File) || value.size === 0) {
    return "";
  }

  if (value.size > maxInquiryAttachmentSizeBytes) {
    return "Dokument može imati najviše 4 MB.";
  }

  const fileName = value.name.toLowerCase();

  if (!/\.(pdf|doc|docx|jpe?g|png)$/i.test(fileName)) {
    return "Dozvoljeni formati su PDF, DOC, DOCX, JPG i PNG.";
  }

  return "";
}
