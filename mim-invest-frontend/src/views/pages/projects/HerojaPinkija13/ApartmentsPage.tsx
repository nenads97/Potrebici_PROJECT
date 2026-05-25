import { useEffect, useState } from "react";

import { ApartmentAvailability } from "../../../../features/projects/components/ApartmentAvailability";
import { apartments } from "../../../../features/projects/data/herojaPinkija13.data";
import { fetchApartments } from "../../../../features/projects/data/projectSupabase.api";
import type { Apartment } from "../../../../features/projects/types/project.types";

export const ApartmentsPage = () => {
  const [availableApartments, setAvailableApartments] = useState<Apartment[]>(apartments);

  useEffect(() => {
    let isMounted = true;

    fetchApartments()
      .then((items) => {
        if (isMounted) {
          setAvailableApartments(items);
        }
      })
      .catch(() => {
        if (isMounted) {
          setAvailableApartments(apartments);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

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
      <ApartmentAvailability apartments={availableApartments} compactHeading />
    </main>
  );
};
