const fallbackSiteUrl = "https://mimgradnja.rs";

type PublicImageDimensions = {
  width: number;
  height: number;
};

const publicImageDimensions: Record<string, PublicImageDimensions> = {
  "/images/heroja-pinkija-13/hero-generated.jpg": { width: 1672, height: 941 },
  "/images/heroja-pinkija-13/gradilisna-tabla-optimized.jpg": { width: 818, height: 783 },
  "/images/heroja-pinkija-13/gradilisna-tabla-slika-optimized.jpg": { width: 1672, height: 941 },
  "/images/heroja-pinkija-13/radovi-u-toku.jpg": { width: 1663, height: 1247 },
  "/images/kupovina-placeva-hero.jpg": { width: 1672, height: 941 },
  "/images/apartment-plans/stan-1-6-11.png": { width: 2105, height: 1488 },
  "/images/apartment-plans/stan-1-6-11-comparison.png": { width: 350, height: 555 },
  "/images/apartment-plans/stan-2-7-12.png": { width: 2105, height: 1488 },
  "/images/apartment-plans/stan-3-8-13.png": { width: 2105, height: 1488 },
  "/images/apartment-plans/stan-4-9-14.png": { width: 2105, height: 1488 },
  "/images/apartment-plans/stan-5-10-15.png": { width: 2105, height: 1488 },
  "/images/apartment-plans/showcase-stan-1-6-11.png": { width: 350, height: 555 },
  "/images/apartment-plans/showcase-stan-2-7-12.png": { width: 463, height: 396 },
  "/images/apartment-plans/showcase-stan-3-8-13.png": { width: 389, height: 257 },
  "/images/apartment-plans/showcase-stan-4-9-14.png": { width: 421, height: 313 },
  "/images/apartment-plans/showcase-stan-5-10-15.png": { width: 383, height: 320 },
  "/images/TRADE.png": { width: 500, height: 500 },
};

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

export function getPublicImageDimensions(pathOrUrl: string) {
  const normalizedPath = normalizePublicAssetPath(pathOrUrl);

  return normalizedPath ? publicImageDimensions[normalizedPath] : undefined;
}

function normalizePublicAssetPath(pathOrUrl: string) {
  const pathWithoutQuery = pathOrUrl.split(/[?#]/)[0];

  if (/^https?:\/\//i.test(pathWithoutQuery)) {
    if (!pathWithoutQuery.startsWith(publicSiteUrl)) {
      return undefined;
    }

    return pathWithoutQuery.slice(publicSiteUrl.length) || "/";
  }

  return pathWithoutQuery.startsWith("/") ? pathWithoutQuery : `/${pathWithoutQuery}`;
}
