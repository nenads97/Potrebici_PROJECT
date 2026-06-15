import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bath,
  BedDouble,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Compass,
  Images,
  Layers3,
  Maximize2,
  MessageCircle,
  Phone,
  Ruler,
  X,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

import {
  apartments,
  contactEmail,
  contactPhone,
  statusLabel,
  statusVariant,
} from "../../../../features/projects/data/herojaPinkija13.data";
import type {
  Apartment,
  ApartmentRoomArea,
} from "../../../../features/projects/types/project.types";

export const ApartmentDetailsPage = () => {
  const { apartmentNumber } = useParams();
  const apartment = useMemo(
    () => apartments.find((item) => item.number === apartmentNumber),
    [apartmentNumber],
  );

  if (!apartment) {
    return (
      <main className="not-found-page">
        <div className="soft-card not-found-page__card">
          <p className="section-eyebrow">Detalji stana</p>
          <h1>Stan nije pronadjen</h1>
          <p>Proverite ponudu stanova i izaberite stan iz aktuelne liste.</p>
          <Link className="site-button site-button--accent" to="/projekti/heroja-pinkija-13/ponuda-stanova">
            Nazad na ponudu
          </Link>
        </div>
      </main>
    );
  }

  const subject = encodeURIComponent(`Upit za stan ${apartment.number}`);
  const viewingSubject = encodeURIComponent(`Zakazivanje obilaska za stan ${apartment.number}`);
  const relatedApartments = apartments
    .filter((item) => item.number !== apartment.number && item.status !== "Sold")
    .slice(0, 3);

  return (
    <main className="apartment-detail">
      <section className="page-section page-section--surface apartment-detail__hero">
        <div className="page-container split-grid split-grid--center">
          <div className="fade-up apartment-detail__intro">
            <span className={`status-badge status-badge--${statusVariant[apartment.status]}`}>
              {statusLabel[apartment.status]}
            </span>
            <p className="section-eyebrow apartment-detail__eyebrow">Detalji stana</p>
            <h1 className="section-title">Stan {apartment.number}</h1>
            <p className="section-copy section-copy--large">{apartment.description}</p>

            <div className="apartment-detail__actions">
              <a className="site-button site-button--accent" href={`mailto:${contactEmail}?subject=${viewingSubject}`}>
                <CalendarDays />
                Zakazite razgovor
              </a>
              <a className="site-button site-button--outline" href={`mailto:${contactEmail}?subject=${subject}`}>
                <MessageCircle />
                Pitajte za ovaj stan
              </a>
            </div>
          </div>

          <ApartmentGallery apartment={apartment} />
        </div>
      </section>

      <section className="apartment-metrics">
        <div className="page-container apartment-metrics__grid">
          <DetailMetric icon={Layers3} label="Sprat" value={apartment.floor} />
          <DetailMetric icon={Ruler} label="Povrsina" value={apartment.size} />
          <DetailMetric icon={BedDouble} label="Struktura" value={apartment.rooms} />
          <DetailMetric icon={Bath} label="Kupatila" value={apartment.bathrooms} />
          <DetailMetric icon={Compass} label="Orijentacija" value={apartment.orientation} />
        </div>
      </section>

      <section className="page-section apartment-plan-section">
        <div className="page-container split-grid">
          <div className="soft-card apartment-plan">
            <p className="section-eyebrow">Raspored prostora</p>
            <h2>Funkcionalan tlocrt bez izgubljenih kvadrata.</h2>

            <div className="apartment-plan__items">
              {apartment.plan.map((item) => (
                <div key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>

            <ApartmentPlanDrawing apartment={apartment} />
          </div>

          <div className="apartment-side">
            <div className="soft-card apartment-info-card">
              <p className="section-eyebrow">Dodatne informacije</p>
              <div>
                {apartment.features.map((feature) => (
                  <p key={feature}>
                    <CheckCircle2 className="icon-inline" />
                    {feature}
                  </p>
                ))}
              </div>
            </div>

            <div className="soft-card apartment-info-card">
              <p className="section-eyebrow">Kupovina</p>
              <PurchaseRow label="Cena" value={apartment.priceRange} />
              <PurchaseRow label="Dostupnost" value={apartment.availabilityNote} />
              <PurchaseRow label="Terasa" value={apartment.terrace} />
              <PurchaseRow label="Parking" value={apartment.parking} />
              <PurchaseRow label="Ostava" value={apartment.storage} />
            </div>
          </div>
        </div>
      </section>

      <section className="page-section page-section--surface related-apartments">
        <div className="page-container">
          <div className="split-grid split-grid--end">
            <div>
              <p className="section-eyebrow">Jos stanova u ponudi</p>
              <h2 className="section-title section-title--medium">
                Uporedite stanove iz iste ponude.
              </h2>
            </div>
            <p className="section-copy">
              U objektu je ukupno 15 stanova sa ponavljajucim rasporedima kroz
              vertikalu.
            </p>
          </div>

          <div className="related-apartments__grid">
            {relatedApartments.map((item) => (
              <Link key={item.number} className="related-card" to={`/apartmani/${item.number}`}>
                <div>
                  <strong>Stan {item.number}</strong>
                  <span className={`status-badge status-badge--${statusVariant[item.status]}`}>
                    {statusLabel[item.status]}
                  </span>
                </div>
                <dl>
                  <dt>{item.floor}</dt>
                  <dt>{item.size}</dt>
                  <dt>{item.rooms}</dt>
                  <dt>{item.orientation}</dt>
                </dl>
                <span>Detalji</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="apartment-detail__cta">
        <div className="page-container apartment-detail__cta-inner">
          <div>
            <p className="section-eyebrow">Prodaja</p>
            <h2>Proverite cenu i uslove kupovine za stan {apartment.number}.</h2>
          </div>
          <div>
            <a className="site-button site-button--light" href={`tel:${contactPhone}`}>
              <Phone />
              Pozovite
            </a>
            <a className="site-button site-button--light" href={`mailto:${contactEmail}?subject=${subject}`}>
              <MessageCircle />
              Posalji upit
            </a>
          </div>
        </div>
      </section>
    </main>
  );
};

const ApartmentPlanDrawing = ({ apartment }: { apartment: Apartment }) => {
  if (apartment.planVariant === "stack-1-6-11") {
    return <ApartmentStackPlan rooms={apartment.roomAreas} />;
  }

  return (
    <div className="apartment-plan__drawing">
      {apartment.roomAreas.map((room) => (
        <button
          key={room.id}
          className="apartment-plan__room"
          type="button"
          aria-label={`${room.label}: ${room.area}`}
        >
          <span>{room.label}</span>
          <strong>{room.area}</strong>
        </button>
      ))}
    </div>
  );
};

type PlanSpace = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

const stackPlanSpaces: PlanSpace[] = [
  {
    id: "entry",
    x: 0,
    y: 240,
    width: 160,
    height: 150,
  },
  {
    id: "living",
    x: 0,
    y: 0,
    width: 280,
    height: 240,
  },
  {
    id: "loggia",
    x: 280,
    y: 0,
    width: 140,
    height: 100,
  },
  {
    id: "kitchen",
    x: 280,
    y: 100,
    width: 140,
    height: 140,
  },
  {
    id: "bedroom-primary",
    x: 160,
    y: 240,
    width: 260,
    height: 150,
  },
  {
    id: "bedroom-secondary",
    x: 170,
    y: 390,
    width: 250,
    height: 170,
  },
  {
    id: "bathroom",
    x: 0,
    y: 390,
    width: 110,
    height: 170,
  },
  {
    id: "wc",
    x: 110,
    y: 390,
    width: 60,
    height: 170,
  },
];

const ApartmentStackPlan = ({ rooms }: { rooms: ApartmentRoomArea[] }) => {
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const roomById = new Map(rooms.map((room) => [room.id, room]));
  const visibleSpaces = activeRoomId
    ? [
        ...stackPlanSpaces.filter((space) => space.id !== activeRoomId),
        ...stackPlanSpaces.filter((space) => space.id === activeRoomId),
      ]
    : stackPlanSpaces;

  return (
    <div className="apartment-plan__scaled" aria-label="Raspored prostorija za stanove 1, 6 i 11">
      <svg viewBox="0 0 420 560" role="img" aria-labelledby="stack-plan-title">
        <title id="stack-plan-title">Raspored prostorija skaliran prema kvadraturi</title>
        {visibleSpaces.map((space) => {
          const room = roomById.get(space.id);

          if (!room) {
            return null;
          }

          return (
            <g
              key={space.id}
              className={`apartment-plan__space${activeRoomId === space.id ? " is-active" : ""}`}
              role="button"
              tabIndex={0}
              aria-label={`${room.number ? `${room.number}. ` : ""}${room.label}: ${room.area}`}
              onBlur={() => setActiveRoomId(null)}
              onClick={() => setActiveRoomId((currentId) => (currentId === space.id ? null : space.id))}
              onFocus={() => setActiveRoomId(space.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setActiveRoomId((currentId) => (currentId === space.id ? null : space.id));
                }
              }}
              onMouseEnter={() => setActiveRoomId(space.id)}
              onMouseLeave={() => setActiveRoomId(null)}
            >
              <title>{`${room.label}: ${room.area}`}</title>
              <rect x={space.x} y={space.y} width={space.width} height={space.height} rx="8" />
              <text
                className="apartment-plan__space-label"
                x={space.x + space.width / 2}
                y={space.y + space.height / 2}
              >
                {room.label}
              </text>
              <text
                className="apartment-plan__space-area"
                x={space.x + space.width / 2}
                y={space.y + space.height / 2 + 22}
              >
                {room.area}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

const ApartmentGallery = ({ apartment }: { apartment: Apartment }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const activeImage = apartment.images[activeIndex];
  const imageCount = apartment.images.length;

  const showImage = useCallback((nextIndex: number) => {
    const normalizedIndex = (nextIndex + imageCount) % imageCount;
    setActiveIndex(normalizedIndex);
  }, [imageCount]);

  useEffect(() => {
    if (!isLightboxOpen) {
      return undefined;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsLightboxOpen(false);
      }

      if (event.key === "ArrowLeft") {
        showImage(activeIndex - 1);
      }

      if (event.key === "ArrowRight") {
        showImage(activeIndex + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeIndex, imageCount, isLightboxOpen, showImage]);

  return (
    <div className="apartment-gallery">
      <div className="apartment-gallery__main">
        <button type="button" onClick={() => setIsLightboxOpen(true)} aria-label="Otvori galeriju">
          <img src={activeImage.src} alt={activeImage.alt} />
        </button>
        <span className="apartment-gallery__count">
          <Images className="icon-inline" />
          {activeIndex + 1} / {imageCount}
        </span>
        <button
          className="apartment-gallery__zoom"
          type="button"
          aria-label="Otvori uvecanu galeriju"
          onClick={() => setIsLightboxOpen(true)}
        >
          <Maximize2 className="icon-inline" />
        </button>
        <div className="apartment-gallery__controls">
          <button type="button" aria-label="Prethodna slika" onClick={() => showImage(activeIndex - 1)}>
            <ChevronLeft className="icon-inline" />
          </button>
          <button type="button" aria-label="Sledeca slika" onClick={() => showImage(activeIndex + 1)}>
            <ChevronRight className="icon-inline" />
          </button>
        </div>
      </div>

      <div className="apartment-gallery__thumbs">
        {apartment.images.map((image, index) => (
          <button
            className={activeIndex === index ? "is-active" : ""}
            key={image.alt}
            type="button"
            onClick={() => showImage(index)}
            aria-label={`Prikazi sliku ${index + 1}`}
          >
            <img src={image.src} alt="" />
          </button>
        ))}
      </div>

      {isLightboxOpen ? (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label="Uvecana galerija">
          <button
            className="lightbox__close"
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            aria-label="Zatvori galeriju"
          >
            <X className="icon-inline" />
          </button>
          <button
            className="lightbox__prev"
            type="button"
            onClick={() => showImage(activeIndex - 1)}
            aria-label="Prethodna slika"
          >
            <ChevronLeft className="icon-inline" />
          </button>
          <img src={activeImage.src} alt={activeImage.alt} />
          <button
            className="lightbox__next"
            type="button"
            onClick={() => showImage(activeIndex + 1)}
            aria-label="Sledeca slika"
          >
            <ChevronRight className="icon-inline" />
          </button>
        </div>
      ) : null}
    </div>
  );
};

type DetailMetricProps = {
  icon: typeof Ruler;
  label: string;
  value: string;
};

const DetailMetric = ({ icon: Icon, label, value }: DetailMetricProps) => {
  const displayValue = value.replace(" m2", "\u00a0m2");

  return (
    <div>
      <span className="icon-bubble">
        <Icon />
      </span>
      <div>
        <span>{label}</span>
        <strong>{displayValue}</strong>
      </div>
    </div>
  );
};

const PurchaseRow = ({ label, value }: { label: string; value: string }) => {
  return (
    <div className="purchase-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
};
