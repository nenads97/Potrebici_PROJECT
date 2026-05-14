import type { ConstructionUpdate } from "../types/project.types";

type ProjectUpdatesProps = {
  updates: ConstructionUpdate[];
};

export const ProjectUpdates = ({ updates }: ProjectUpdatesProps) => {
  return (
    <section className="project-section project-updates" id="informacije">
      <div className="section-heading">
        <p className="eyebrow">Najnovije informacije</p>
        <h2>Gradnja i prodaja na jednom mestu</h2>
        <p>
          Sekcija je spremna za redovno dodavanje vesti, fotografija sa
          gradilista i promena u dostupnosti jedinica.
        </p>
      </div>

      <div className="project-updates__grid">
        {updates.map((update) => (
          <article className="update-card" key={update.id}>
            <div>
              <span>{update.date}</span>
              <small>{update.tag}</small>
            </div>
            <h3>{update.title}</h3>
            <p>{update.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
};
