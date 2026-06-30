import { useEffect, useId, useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Bath,
  BedDouble,
  Building2,
  CalendarDays,
  CheckCircle2,
  Compass,
  Home,
  Layers3,
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

const projectBasePath = "/projekti/heroja-pinkija-13";
const apartmentsPath = `${projectBasePath}/ponuda-stanova`;

export const ApartmentDetailsPage = () => {
  const { apartmentNumber } = useParams();
  const apartment = useMemo(
    () => apartments.find((item) => item.number === apartmentNumber),
    [apartmentNumber],
  );
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [isHeroPlanOpen, setIsHeroPlanOpen] = useState(false);

  useEffect(() => {
    if (!isHeroPlanOpen) {
      return undefined;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsHeroPlanOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isHeroPlanOpen]);

  if (!apartment) {
    return (
      <main className="not-found-page">
        <div className="soft-card not-found-page__card">
          <p className="section-eyebrow">Detalji stana</p>
          <h1>Stan nije pronadjen</h1>
          <p>Proverite ponudu stanova i izaberite stan iz aktuelne liste.</p>
          <Link className="site-button site-button--accent" to={apartmentsPath}>
            Nazad na ponudu
          </Link>
        </div>
      </main>
    );
  }

  const subject = encodeURIComponent(`Upit za stan ${apartment.number}`);
  const viewingSubject = encodeURIComponent(`Zakazivanje obilaska za stan ${apartment.number}`);
  const sameTypeApartments = apartments
    .filter(
      (item) =>
        item.number !== apartment.number &&
        item.planVariant === apartment.planVariant &&
        item.status !== "Sold",
    )
    .slice(0, 3);
  const relatedApartments =
    sameTypeApartments.length >= 2
      ? sameTypeApartments
      : apartments
          .filter((item) => item.number !== apartment.number && item.status !== "Sold")
          .slice(0, 3);

  return (
    <main className="apartment-detail apartment-detail--editorial">
      <section className="apartment-detail-hero">
        <div className="page-container">
          <nav className="apartment-breadcrumb" aria-label="Putanja stranice">
            <Link to={projectBasePath}>Heroja Pinkija 13</Link>
            <span aria-hidden="true">/</span>
            <Link to={apartmentsPath}>Ponuda stanova</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Stan {apartment.number}</span>
          </nav>

          <div className="apartment-detail-hero__grid">
            <div className="apartment-detail-hero__copy">
              <span className={`status-badge status-badge--${statusVariant[apartment.status]}`}>
                {statusLabel[apartment.status]}
              </span>
              <p className="section-eyebrow">Detalji stana</p>
              <h1>Stan {apartment.number}</h1>
              <p className="section-copy section-copy--large">{apartment.description}</p>

              <div className="apartment-detail-hero__quick-facts">
                <span>{apartment.size}</span>
                <span>{apartment.floor}</span>
                <span>{apartment.rooms}</span>
              </div>

              <div className="page-actions">
                <a
                  className="site-button site-button--accent"
                  href={`mailto:${contactEmail}?subject=${viewingSubject}`}
                >
                  <CalendarDays />
                  Zakazite razgovor
                </a>
                <a
                  className="apartment-detail-hero__text-link"
                  href={`mailto:${contactEmail}?subject=${subject}`}
                >
                  <MessageCircle />
                  Posaljite upit
                  <ArrowUpRight />
                </a>
              </div>
            </div>

            <button
              type="button"
              className="apartment-detail-hero__visual"
              aria-label={`Otvori projektni tlocrt stana ${apartment.number} u punoj velicini`}
              onClick={() => setIsHeroPlanOpen(true)}
            >
              <img
                src={apartment.heroFloorPlan.src}
                alt={apartment.heroFloorPlan.alt}
                width="900"
                height="700"
              />
              <span className="apartment-detail-hero__plan-label">
                <span>Projektni tlocrt</span>
                <strong>Stan {apartment.number}</strong>
                <ArrowUpRight aria-hidden="true" />
              </span>
            </button>
          </div>
        </div>
      </section>

      {isHeroPlanOpen ? (
        <div
          className="lightbox apartment-plan-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`Projektni tlocrt stana ${apartment.number}`}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsHeroPlanOpen(false);
            }
          }}
        >
          <button
            className="lightbox__close"
            type="button"
            aria-label="Zatvori projektni tlocrt"
            onClick={() => setIsHeroPlanOpen(false)}
            autoFocus
          >
            <X />
          </button>
          <img src={apartment.heroFloorPlan.src} alt={apartment.heroFloorPlan.alt} />
        </div>
      ) : null}

      <ApartmentFacts apartment={apartment} />

      <section className="apartment-layout-section">
        <div className="page-container">
          <div className="apartment-layout-section__heading">
            <div>
              <p className="section-eyebrow">Raspored stana</p>
              <h2 className="section-title section-title--medium">
                Dva pogleda na isti prostor.
              </h2>
            </div>
            <p className="section-copy">
              Interaktivni grid olaksava razumevanje odnosa prostorija, dok
              originalni projektni tlocrt cuva precizne arhitektonske detalje.
            </p>
          </div>

          <div className="apartment-layout-comparison">
            <PlanPanel
              apartment={apartment}
              activeRoomId={activeRoomId}
              onActiveRoomChange={setActiveRoomId}
            />
            <ApartmentFloorPlanFigure apartment={apartment} />
          </div>

          <div className="apartment-layout-details">
            <RoomSchedule
              apartment={apartment}
              activeRoomId={activeRoomId}
              onActiveRoomChange={setActiveRoomId}
            />
            <PurchasePanel apartment={apartment} subject={subject} />
          </div>

          <ApartmentFeatures apartment={apartment} />
        </div>
      </section>

      <section className="related-apartments related-apartments--editorial">
        <div className="page-container">
          <div className="apartment-layout-section__heading">
            <div>
              <p className="section-eyebrow">Jos stanova u ponudi</p>
              <h2 className="section-title section-title--medium">
                Uporedite jedinice iz istog projekta.
              </h2>
            </div>
            <Link className="apartment-section-link" to={apartmentsPath}>
              Kompletna ponuda
              <ArrowRight />
            </Link>
          </div>

          <div className="related-apartments__grid">
            {relatedApartments.map((item) => (
              <Link
                key={item.number}
                className="related-card related-card--editorial"
                to={`${apartmentsPath}/${item.number}`}
              >
                <div>
                  <span>Stan</span>
                  <strong>{item.number.padStart(2, "0")}</strong>
                </div>
                <dl>
                  <div>
                    <dt>Sprat</dt>
                    <dd>{item.floor}</dd>
                  </div>
                  <div>
                    <dt>Povrsina</dt>
                    <dd>{item.size}</dd>
                  </div>
                  <div>
                    <dt>Struktura</dt>
                    <dd>{item.rooms}</dd>
                  </div>
                </dl>
                <span>
                  Detalji stana
                  <ArrowUpRight />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="apartment-detail__cta">
        <div className="page-container apartment-detail__cta-inner">
          <div>
            <p className="section-eyebrow">Sledeci korak</p>
            <h2>Proverite cenu i uslove kupovine za stan {apartment.number}.</h2>
          </div>
          <div>
            <a className="site-button site-button--light" href={`tel:${contactPhone}`}>
              <Phone />
              Pozovite
            </a>
            <a
              className="site-button site-button--light"
              href={`mailto:${contactEmail}?subject=${subject}`}
            >
              <MessageCircle />
              Posalji upit
            </a>
          </div>
        </div>
      </section>
    </main>
  );
};

const ApartmentFacts = ({ apartment }: { apartment: Apartment }) => {
  const facts = [
    { icon: Home, label: "Stan", value: apartment.number },
    { icon: Layers3, label: "Sprat", value: apartment.floor },
    { icon: Ruler, label: "Povrsina", value: apartment.size },
    { icon: BedDouble, label: "Struktura", value: apartment.rooms },
    { icon: Bath, label: "Kupatila", value: apartment.bathrooms },
    { icon: Building2, label: "Terasa", value: apartment.terrace },
    { icon: Compass, label: "Status", value: statusLabel[apartment.status] },
  ];

  return (
    <section className="apartment-facts" aria-label="Osnovni podaci o stanu">
      <dl className="page-container apartment-facts__grid">
        {facts.map(({ icon: Icon, label, value }) => (
          <div key={label}>
            <Icon aria-hidden="true" />
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
};

type ActiveRoomProps = {
  activeRoomId: string | null;
  onActiveRoomChange: (roomId: string | null) => void;
};

const PlanPanel = ({
  apartment,
  activeRoomId,
  onActiveRoomChange,
}: { apartment: Apartment } & ActiveRoomProps) => (
  <article className="apartment-layout-panel">
    <div className="apartment-layout-panel__heading">
      <div>
        <span>Interaktivni prikaz</span>
        <h3>Grid prostorija</h3>
      </div>
      <small>{apartment.rooms}</small>
    </div>
    <div className="apartment-layout-panel__stage apartment-layout-panel__stage--grid">
      <ApartmentPlanDrawing
        apartment={apartment}
        activeRoomId={activeRoomId}
        onActiveRoomChange={onActiveRoomChange}
      />
    </div>
    <p className="apartment-layout-panel__caption">
      Izaberite prostoriju za naziv i povrsinu.
    </p>
  </article>
);

const ApartmentPlanDrawing = ({
  apartment,
  activeRoomId,
  onActiveRoomChange,
}: { apartment: Apartment } & ActiveRoomProps) => {
  if (apartment.planVariant && apartment.planVariant in stackPlanSpacesByVariant) {
    return (
      <ApartmentStackPlan
        ariaLabel={`Raspored prostorija za stan ${apartment.number}`}
        rooms={apartment.roomAreas}
        plan={stackPlanSpacesByVariant[apartment.planVariant]}
        activeRoomId={activeRoomId}
        onActiveRoomChange={onActiveRoomChange}
      />
    );
  }

  return null;
};

const ApartmentStackPlan = ({
  ariaLabel,
  rooms,
  plan,
  activeRoomId,
  onActiveRoomChange,
}: {
  ariaLabel: string;
  rooms: ApartmentRoomArea[];
  plan: StackPlanConfig;
} & ActiveRoomProps) => {
  const titleId = useId();
  const roomById = new Map(rooms.map((room) => [room.id, room]));
  const visibleSpaces = activeRoomId
    ? [
        ...plan.spaces.filter((space) => space.id !== activeRoomId),
        ...plan.spaces.filter((space) => space.id === activeRoomId),
      ]
    : plan.spaces;

  return (
    <div className="apartment-plan__scaled" aria-label={ariaLabel}>
      <svg viewBox={plan.viewBox} role="img" aria-labelledby={titleId}>
        <title id={titleId}>Raspored prostorija skaliran prema kvadraturi</title>
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
              aria-pressed={activeRoomId === space.id}
              aria-label={`${room.number ? `${room.number}. ` : ""}${room.label}: ${room.area}`}
              onBlur={() => onActiveRoomChange(null)}
              onClick={() =>
                onActiveRoomChange(activeRoomId === space.id ? null : space.id)
              }
              onFocus={() => onActiveRoomChange(space.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onActiveRoomChange(activeRoomId === space.id ? null : space.id);
                }
              }}
              onMouseEnter={() => onActiveRoomChange(space.id)}
              onMouseLeave={() => onActiveRoomChange(null)}
            >
              <rect x={space.x} y={space.y} width={space.width} height={space.height} rx="7" />
              {room.number ? (
                <text className="apartment-plan__space-number" x={space.x + 18} y={space.y + 25}>
                  {room.number}
                </text>
              ) : null}
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

const ApartmentFloorPlanFigure = ({ apartment }: { apartment: Apartment }) => (
  <figure className="apartment-layout-panel apartment-floor-plan">
    <div className="apartment-layout-panel__heading">
      <div>
        <span>Originalna dokumentacija</span>
        <h3>Projektni tlocrt</h3>
      </div>
      <small>{apartment.size}</small>
    </div>
    <div
      className="apartment-layout-panel__stage apartment-floor-plan__media"
    >
      <img
        src={apartment.projectFloorPlan.src}
        alt={apartment.projectFloorPlan.alt}
        width="900"
        height="700"
        loading="lazy"
      />
    </div>
    <figcaption className="apartment-layout-panel__caption">
      <span>Stan {apartment.number} · {apartment.floor}</span>
      <span>Poredjenje sa gridom prostorija</span>
    </figcaption>
  </figure>
);

const RoomSchedule = ({
  apartment,
  activeRoomId,
  onActiveRoomChange,
}: { apartment: Apartment } & ActiveRoomProps) => (
  <section className="room-schedule" aria-labelledby="room-schedule-title">
    <div className="room-schedule__heading">
      <p className="section-eyebrow">Program prostorija</p>
      <h3 id="room-schedule-title">Povrsine, prostoriju po prostoriju.</h3>
    </div>
    <ol>
      {apartment.roomAreas.map((room) => (
        <li key={room.id}>
          <button
            type="button"
            className={activeRoomId === room.id ? "is-active" : ""}
            aria-pressed={activeRoomId === room.id}
            onBlur={() => onActiveRoomChange(null)}
            onClick={() => onActiveRoomChange(activeRoomId === room.id ? null : room.id)}
            onFocus={() => onActiveRoomChange(room.id)}
            onMouseEnter={() => onActiveRoomChange(room.id)}
            onMouseLeave={() => onActiveRoomChange(null)}
          >
            <span>{room.number?.padStart(2, "0")}</span>
            <strong>{room.label}</strong>
            <i aria-hidden="true" />
            <b>{room.area}</b>
          </button>
        </li>
      ))}
    </ol>
    <div className="room-schedule__total">
      <span>Ukupna povrsina</span>
      <strong>{apartment.size}</strong>
    </div>
  </section>
);

const PurchasePanel = ({
  apartment,
  subject,
}: {
  apartment: Apartment;
  subject: string;
}) => (
  <aside className="apartment-purchase" aria-labelledby="apartment-purchase-title">
    <div>
      <p className="section-eyebrow">Informacije o kupovini</p>
      <h3 id="apartment-purchase-title">Jasan sledeci korak.</h3>
    </div>
    <dl>
      <PurchaseRow label="Cena" value={apartment.priceRange} />
      <PurchaseRow label="Status" value={statusLabel[apartment.status]} />
      <PurchaseRow label="Garazno mesto" value="Odvojena kupovina" />
      <PurchaseRow label="Ostava" value="Odvojena kupovina" />
    </dl>
    <p>{apartment.availabilityNote}</p>
    <a
      className="site-button site-button--accent"
      href={`mailto:${contactEmail}?subject=${subject}`}
    >
      <CalendarDays />
      Zakazite razgovor
    </a>
    <a className="apartment-purchase__phone" href={`tel:${contactPhone}`}>
      <Phone />
      {contactPhone}
    </a>
  </aside>
);

const ApartmentFeatures = ({ apartment }: { apartment: Apartment }) => (
  <section className="apartment-features" aria-labelledby="apartment-features-title">
    <div>
      <p className="section-eyebrow">Dodatne karakteristike</p>
      <h3 id="apartment-features-title">Komfor koji prati svakodnevni zivot.</h3>
    </div>
    <ul>
      {apartment.features.map((feature) => (
        <li key={feature}>
          <CheckCircle2 />
          <span>{feature}</span>
        </li>
      ))}
    </ul>
  </section>
);

const PurchaseRow = ({ label, value }: { label: string; value: string }) => (
  <div>
    <dt>{label}</dt>
    <dd>{value}</dd>
  </div>
);

type PlanSpace = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

type StackPlanConfig = {
  spaces: PlanSpace[];
  viewBox: string;
};

const stackPlanSpacesByVariant: Record<string, StackPlanConfig> = {
  "stack-1-6-11": {
    viewBox: "-14 -14 448 588",
    spaces: [
      { id: "entry", x: 0, y: 240, width: 160, height: 150 },
      { id: "living", x: 0, y: 0, width: 280, height: 240 },
      { id: "loggia", x: 280, y: 0, width: 140, height: 100 },
      { id: "kitchen", x: 280, y: 100, width: 140, height: 140 },
      { id: "bedroom-primary", x: 160, y: 240, width: 260, height: 150 },
      { id: "bedroom-secondary", x: 170, y: 390, width: 250, height: 170 },
      { id: "bathroom", x: 0, y: 390, width: 110, height: 170 },
      { id: "wc", x: 110, y: 390, width: 60, height: 170 },
    ],
  },
  "stack-2-7-12": {
    viewBox: "-14 -14 548 458",
    spaces: [
      { id: "bedroom-primary", x: 0, y: 0, width: 260, height: 145 },
      { id: "bedroom-secondary", x: 0, y: 145, width: 260, height: 110 },
      { id: "hall", x: 260, y: 0, width: 55, height: 255 },
      { id: "bathroom", x: 315, y: 0, width: 160, height: 160 },
      { id: "entry", x: 315, y: 160, width: 205, height: 95 },
      { id: "living", x: 70, y: 255, width: 350, height: 175 },
      { id: "terrace", x: 0, y: 255, width: 70, height: 175 },
      { id: "kitchen", x: 420, y: 255, width: 100, height: 175 },
    ],
  },
  "stack-3-8-13": {
    viewBox: "-14 -14 498 313",
    spaces: [
      { id: "living", x: 0, y: 0, width: 360, height: 180 },
      { id: "kitchen", x: 360, y: 0, width: 110, height: 90 },
      { id: "entry", x: 360, y: 90, width: 110, height: 90 },
      { id: "bathroom", x: 300, y: 180, width: 170, height: 105 },
    ],
  },
  "stack-4-9-14": {
    viewBox: "-14 -14 548 418",
    spaces: [
      { id: "terrace", x: 0, y: 0, width: 70, height: 180 },
      { id: "living", x: 70, y: 0, width: 350, height: 180 },
      { id: "kitchen", x: 420, y: 0, width: 100, height: 180 },
      { id: "entry", x: 300, y: 180, width: 220, height: 80 },
      { id: "bedroom", x: 0, y: 180, width: 300, height: 210 },
      { id: "bathroom", x: 300, y: 260, width: 220, height: 130 },
    ],
  },
  "stack-5-10-15": {
    viewBox: "-14 -14 528 418",
    spaces: [
      { id: "kitchen", x: 0, y: 0, width: 110, height: 180 },
      { id: "living", x: 110, y: 0, width: 320, height: 180 },
      { id: "terrace", x: 430, y: 20, width: 70, height: 160 },
      { id: "entry", x: 60, y: 180, width: 190, height: 90 },
      { id: "bathroom", x: 60, y: 270, width: 190, height: 120 },
      { id: "bedroom", x: 250, y: 180, width: 250, height: 210 },
    ],
  },
};
