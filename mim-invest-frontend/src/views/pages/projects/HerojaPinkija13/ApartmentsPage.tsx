import { useEffect, useState } from "react";
import { ArrowUpRight, Building2, CalendarDays, Home, Layers3, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

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
    <main className="apartments-listing-page">
      <section className="apartments-listing-hero">
        <div className="page-container apartments-listing-hero__grid">
          <div className="apartments-listing-hero__copy fade-up">
            <p className="section-eyebrow">Heroja Pinkija 13</p>
            <h1 className="section-title">Ponuda stanova.</h1>
            <p className="section-copy section-copy--large">
              Uporedite sprat, kvadraturu, strukturu i trenutni status svih 15
              stanova u objektu na pocetku Telepa.
            </p>
            <div className="page-actions">
              <Link className="site-button site-button--accent" to="/kontakt">
                <CalendarDays />
                Zakazite obilazak
              </Link>
              <Link
                className="site-button site-button--outline"
                to="/projekti/heroja-pinkija-13/o-projektu"
              >
                <Building2 />
                Detalji projekta
              </Link>
            </div>
          </div>

          <dl className="apartments-listing-hero__facts">
            <div>
              <Home />
              <dt>Ukupna ponuda</dt>
              <dd>15 stanova</dd>
            </div>
            <div>
              <Layers3 />
              <dt>Stambene etaze</dt>
              <dd>3 etaze</dd>
            </div>
            <div>
              <Building2 />
              <dt>Raspored</dt>
              <dd>5 stanova po etazi</dd>
            </div>
            <div>
              <MapPin />
              <dt>Lokacija</dt>
              <dd>Pocetak Telepa</dd>
            </div>
          </dl>
        </div>
      </section>

      <ApartmentAvailability apartments={availableApartments} compactHeading />

      <section className="apartments-listing-cta">
        <div className="page-container apartments-listing-cta__inner">
          <div>
            <p className="section-eyebrow">Pomoc pri izboru</p>
            <h2>Niste sigurni koji stan najbolje odgovara vasim potrebama?</h2>
            <p>
              Prodajni tim moze vam pomoci da uporedite rasporede, kvadrature i
              aktuelnu dostupnost.
            </p>
          </div>
          <div className="apartments-listing-cta__actions">
            <Link className="site-button site-button--dark" to="/kontakt">
              <CalendarDays />
              Kontaktirajte prodaju
            </Link>
            <Link
              className="apartments-listing-cta__link"
              to="/projekti/heroja-pinkija-13/spisak-stanova"
            >
              Spisak stanova
              <ArrowUpRight />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};
