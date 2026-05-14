import { ApartmentAvailability } from "../../../../features/projects/components/ApartmentAvailability";
import { apartments } from "../../../../features/projects/data/herojaPinkija13.data";

export const ApartmentsPage = () => {
  return (
    <main>
      <section className="page-section page-section--surface apartments-page-hero">
        <div className="page-container">
          <p className="section-eyebrow">Heroja Pinkija 13</p>
          <h1 className="section-title">Ponuda stanova.</h1>
          <p className="section-copy section-copy--large">
            Pregledajte aktuelne stanove, kvadrature, strukture i status
            dostupnosti u objektu na pocetku Telepa.
          </p>
        </div>
      </section>
      <ApartmentAvailability apartments={apartments} compactHeading />
    </main>
  );
};
