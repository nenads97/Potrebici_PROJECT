const fallbackSiteUrl = "https://mimgradnja.rs";

function normalizeSiteUrl(value: string | undefined) {
  const trimmedValue = value?.trim().replace(/\/+$/, "");

  if (!trimmedValue) {
    return fallbackSiteUrl;
  }

  if (!/^https?:\/\//i.test(trimmedValue)) {
    return fallbackSiteUrl;
  }

  return trimmedValue;
}

export const publicSiteUrl = normalizeSiteUrl(import.meta.env.VITE_PUBLIC_SITE_URL);
export const siteName = "M & M Gradnja";

export function createPublicUrl(pathOrUrl: string) {
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }

  const normalizedPath = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;

  return `${publicSiteUrl}${normalizedPath}`;
}
