export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; message: string };

export function requiredString(value: unknown, label: string, min = 2, max = 160) {
  const text = typeof value === "string" ? value.trim() : "";

  if (text.length < min) {
    return { ok: false, message: `${label} je obavezno polje.` } as const;
  }

  if (text.length > max) {
    return { ok: false, message: `${label} je predugacko.` } as const;
  }

  return { ok: true, value: text } as const;
}

export function optionalString(value: unknown, max = 4000) {
  const text = typeof value === "string" ? value.trim() : "";

  if (text.length > max) {
    return { ok: false, message: "Tekst je predugacak." } as const;
  }

  return { ok: true, value: text || null } as const;
}

export function validEmail(value: unknown) {
  const text = typeof value === "string" ? value.trim() : "";
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!pattern.test(text) || text.length > 254) {
    return { ok: false, message: "Unesite ispravnu e-mail adresu." } as const;
  }

  return { ok: true, value: text } as const;
}

export function validPhone(value: unknown, required = false) {
  const text = typeof value === "string" ? value.trim() : "";

  if (!text && !required) {
    return { ok: true, value: null } as const;
  }

  if (text.length < 5 || text.length > 80) {
    return { ok: false, message: "Unesite ispravan telefon." } as const;
  }

  return { ok: true, value: text } as const;
}

export function validNumber(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return { ok: true, value: null } as const;
  }

  const numberValue = Number(value);

  if (!Number.isFinite(numberValue) || numberValue <= 0) {
    return { ok: false, message: "Povrsina parcele mora biti pozitivan broj." } as const;
  }

  return { ok: true, value: numberValue } as const;
}

export function isSpamHoneypot(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

export async function sha256(value: string) {
  const data = new TextEncoder().encode(value);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
