import { useEffect } from "react";

type PageMetaProps = {
  title: string;
  description: string;
};

export const PageMeta = ({ title, description }: PageMetaProps) => {
  useEffect(() => {
    const previousTitle = document.title;
    const descriptionElement = getOrCreateMetaDescription();
    const previousDescription = descriptionElement.getAttribute("content");

    document.title = title;
    descriptionElement.setAttribute("content", description);

    return () => {
      document.title = previousTitle;

      if (previousDescription) {
        descriptionElement.setAttribute("content", previousDescription);
      }
    };
  }, [description, title]);

  return null;
};

function getOrCreateMetaDescription() {
  const existingDescription = document.querySelector<HTMLMetaElement>('meta[name="description"]');

  if (existingDescription) {
    return existingDescription;
  }

  const descriptionElement = document.createElement("meta");
  descriptionElement.name = "description";
  document.head.append(descriptionElement);

  return descriptionElement;
}
