import type { GalleryItem, ProjectInfo, ProjectStat } from "../types/project.types";

type ProjectHeroProps = {
  project: ProjectInfo;
  stats: ProjectStat[];
  galleryItems: GalleryItem[];
};

export const ProjectHero = ({ project, stats, galleryItems }: ProjectHeroProps) => {
  const featuredGallery = galleryItems.slice(0, 4);

  return (
    <section className="project-hero" id="pocetna">
      <div className="project-hero__content">
        <p className="eyebrow">{project.status}</p>
        <h1>{project.name}</h1>
        <p className="project-hero__lead">{project.lead}</p>

        <div className="project-hero__actions" aria-label="Glavne akcije">
          <a className="button button--primary" href="#stanovi">
            Pogledaj stanove
          </a>
          <a className="button button--secondary" href="#kontakt">
            Kontaktiraj investitora
          </a>
        </div>

        <dl className="project-hero__dates">
          <div>
            <dt>Pocetak gradnje</dt>
            <dd>{project.constructionStart}</dd>
          </div>
          <div>
            <dt>Planirani zavrsetak</dt>
            <dd>{project.plannedCompletion}</dd>
          </div>
          <div>
            <dt>Struktura objekta</dt>
            <dd>{project.floorStructure}</dd>
          </div>
        </dl>
      </div>

      <div className="project-hero__media" aria-label="Galerijski prikaz projekta">
        {featuredGallery.map((item) => (
          <article
            className={`project-hero__tile project-visual project-visual--${item.variant}`}
            key={item.id}
          >
            <span>{item.tag}</span>
            <strong>{item.title}</strong>
          </article>
        ))}
      </div>

      <div className="project-hero__stats" aria-label="Kljucne brojke projekta">
        {stats.map((stat) => (
          <article key={stat.label}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
            <p>{stat.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
};
