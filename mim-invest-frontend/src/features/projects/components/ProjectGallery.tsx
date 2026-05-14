import type { GalleryItem } from "../types/project.types";

type ProjectGalleryProps = {
  items: GalleryItem[];
};

export const ProjectGallery = ({ items }: ProjectGalleryProps) => {
  return (
    <section className="project-section project-gallery" id="galerija">
      <div className="section-heading section-heading--split">
        <div>
          <p className="eyebrow">Galerija</p>
          <h2>Vizuelni dnevnik projekta</h2>
        </div>
        <p>
          Galerija je zamisljena kao centralno mesto za rendere, fotografije
          gradilista, spratne osnove i lokacijske prikaze.
        </p>
      </div>

      <div className="project-gallery__grid">
        {items.map((item) => (
          <article className="gallery-card" key={item.id}>
            <div className={`gallery-card__media project-visual project-visual--${item.variant}`}>
              <span>{item.tag}</span>
            </div>
            <div className="gallery-card__body">
              <h3>{item.title}</h3>
              <p>{item.meta}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
