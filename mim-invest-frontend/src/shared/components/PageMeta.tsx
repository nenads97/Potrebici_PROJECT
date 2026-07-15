import { useEffect } from "react";

import { createPublicUrl, getPublicImageDimensions, publicSiteUrl, siteName } from "../config/site";

type PageMetaProps = {
  title: string;
  description: string;
  canonicalPath?: string;
  image?: string;
  imageAlt?: string;
  robots?: string;
  structuredData?: StructuredDataInput;
  type?: "website" | "article";
};

type StructuredDataValue =
  | string
  | number
  | boolean
  | null
  | StructuredDataObject
  | StructuredDataValue[];

type StructuredDataObject = {
  [key: string]: StructuredDataValue;
};

type StructuredDataContext = {
  canonicalUrl: string;
  imageUrl: string;
  origin: string;
  siteName: string;
};

type StructuredDataInput =
  | StructuredDataObject
  | StructuredDataObject[]
  | ((context: StructuredDataContext) => StructuredDataObject | StructuredDataObject[]);

const defaultShareImage = "/images/heroja-pinkija-13/gradilisna-tabla.jpg";
const defaultShareImageAlt = "Gradilišna tabla projekta Heroja Pinkija 13";
const structuredDataScriptId = "page-structured-data";

export const PageMeta = ({
  title,
  description,
  canonicalPath,
  image = defaultShareImage,
  imageAlt = defaultShareImageAlt,
  robots = "index,follow",
  structuredData,
  type = "website",
}: PageMetaProps) => {
  useEffect(() => {
    const canonicalUrl = createPublicUrl(canonicalPath ?? window.location.pathname);
    const imageUrl = createPublicUrl(image);
    const imageDimensions = getPublicImageDimensions(image);

    document.title = title;
    setMetaTag("name", "description", description);
    setMetaTag("name", "robots", robots);
    setMetaTag("property", "og:site_name", siteName);
    setMetaTag("property", "og:locale", "sr_RS");
    setMetaTag("property", "og:type", type);
    setMetaTag("property", "og:title", title);
    setMetaTag("property", "og:description", description);
    setMetaTag("property", "og:url", canonicalUrl);
    setMetaTag("property", "og:image", imageUrl);
    setMetaTag("property", "og:image:alt", imageAlt);
    if (imageDimensions) {
      setMetaTag("property", "og:image:width", String(imageDimensions.width));
      setMetaTag("property", "og:image:height", String(imageDimensions.height));
    } else {
      removeMetaTag("property", "og:image:width");
      removeMetaTag("property", "og:image:height");
    }
    setMetaTag("name", "twitter:card", "summary_large_image");
    setMetaTag("name", "twitter:title", title);
    setMetaTag("name", "twitter:description", description);
    setMetaTag("name", "twitter:image", imageUrl);
    setMetaTag("name", "twitter:image:alt", imageAlt);
    setCanonicalLink(canonicalUrl);
    setStructuredData(
      resolveStructuredData(structuredData, {
        canonicalUrl,
        imageUrl,
        origin: publicSiteUrl,
        siteName,
      }),
    );
  }, [canonicalPath, description, image, imageAlt, robots, structuredData, title, type]);

  return null;
};

function setMetaTag(attributeName: "name" | "property", attributeValue: string, content: string) {
  const selector = `meta[${attributeName}="${attributeValue}"]`;
  const existingElement = document.querySelector<HTMLMetaElement>(selector);

  if (existingElement) {
    existingElement.setAttribute("content", content);
    return;
  }

  const metaElement = document.createElement("meta");
  metaElement.setAttribute(attributeName, attributeValue);
  metaElement.setAttribute("content", content);
  document.head.append(metaElement);
}

function removeMetaTag(attributeName: "name" | "property", attributeValue: string) {
  document.querySelector<HTMLMetaElement>(`meta[${attributeName}="${attributeValue}"]`)?.remove();
}

function setCanonicalLink(href: string) {
  const existingLink = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');

  if (existingLink) {
    existingLink.setAttribute("href", href);
    return;
  }

  const linkElement = document.createElement("link");
  linkElement.setAttribute("rel", "canonical");
  linkElement.setAttribute("href", href);
  document.head.append(linkElement);
}

function resolveStructuredData(
  structuredData: StructuredDataInput | undefined,
  context: StructuredDataContext,
) {
  if (!structuredData) {
    return undefined;
  }

  return typeof structuredData === "function" ? structuredData(context) : structuredData;
}

function setStructuredData(structuredData: StructuredDataObject | StructuredDataObject[] | undefined) {
  const existingScript = document.getElementById(structuredDataScriptId);

  if (!structuredData) {
    existingScript?.remove();
    return;
  }

  const scriptElement = existingScript ?? document.createElement("script");
  scriptElement.id = structuredDataScriptId;
  scriptElement.setAttribute("type", "application/ld+json");
  scriptElement.textContent = JSON.stringify(structuredData).replace(/</g, "\\u003c");

  if (!existingScript) {
    document.head.append(scriptElement);
  }
}
