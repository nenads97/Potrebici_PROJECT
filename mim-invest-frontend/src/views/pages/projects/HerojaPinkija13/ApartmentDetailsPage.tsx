import type { CSSProperties, PointerEvent, WheelEvent } from "react";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Bath,
  BedDouble,
  Building2,
  CheckCircle2,
  Compass,
  Home,
  Layers3,
  Minus,
  MessageCircle,
  Phone,
  Plus,
  RotateCcw,
  Ruler,
  X,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { ContactModalButton } from "../../../../features/inquiries/components/ContactModal";
import type { ContactModalOptions } from "../../../../features/inquiries/components/ContactModalContext";
import {
  apartments as fallbackApartments,
  contactPhone,
  contactPhoneHref,
  getUnitDisplayName,
  getUnitLabel,
  getUnitRouteSegment,
  getUnitSortOrder,
  locationAdvantages,
  statusLabel,
  statusVariant,
} from "../../../../features/projects/data/herojaPinkija13.data";
import { fetchApartments } from "../../../../features/projects/data/projectSupabase.api";
import type {
  Apartment,
  ApartmentRoomArea,
  ApartmentStatus,
} from "../../../../features/projects/types/project.types";
import { PageMeta } from "../../../../shared/components/PageMeta";
import { getPublicImageDimensions } from "../../../../shared/config/site";

const projectBasePath = "/projekti/heroja-pinkija-13";
const apartmentsPath = `${projectBasePath}/ponuda-stanova`;
const heroPlanZoomMin = 1;
const heroPlanZoomMax = 1.1;
const heroPlanZoomStep = 0.05;

const clampHeroPlanZoom = (value: number) =>
  Math.min(
    heroPlanZoomMax,
    Math.max(heroPlanZoomMin, Number(value.toFixed(2))),
  );

type ApartmentCtaCopy = {
  buttonLabel: string;
  modalTitle: string;
  modalDescription: string;
  submitLabel: string;
  messagePlaceholder: string;
  purchaseTitle: string;
  purchaseLead: string;
  purchaseSteps: [string, string, string];
};

function getApartmentCtaCopy(
  status: ApartmentStatus,
  unitName: string,
  availabilityNote: string,
  unitLabel: string,
): ApartmentCtaCopy {
  const unitNoun = unitLabel.toLowerCase();

  if (status === "Reserved") {
    return {
      buttonLabel: "Pitajte za status",
      modalTitle: `Proverite status ${unitNoun} ${unitName}`,
      modalDescription:
        `${unitNoun} je trenutno označen kao rezervisan. Ostavite podatke i prodajni tim će proveriti da li je rezervacija aktivna ili predložiti slične rasporede.`,
      submitLabel: "Pošaljite upit za status",
      messagePlaceholder:
        `Napišite da vas zanima status rezervacije ili sličan ${unitNoun} po rasporedu, spratu ili kvadraturi.`,
      purchaseTitle: "Proverite status rezervacije.",
      purchaseLead:
        "Status rezervacije se može promeniti u dogovoru sa kupcem. Pošaljite upit i proverićemo najaktuelnije informacije ili slične opcije.",
      purchaseSteps: [
        `Pošaljete upit za proveru statusa ${unitNoun}.`,
        "Proveravamo da li je rezervacija i dalje aktivna.",
        "Šaljemo vam status ili predlog sličnih dostupnih jedinica.",
      ],
    };
  }

  if (status === "Sold") {
    return {
      buttonLabel: "Pitajte za slične jedinice",
      modalTitle: `Pitajte za slične jedinice kao ${unitName}`,
      modalDescription:
        `Ovaj ${unitNoun} je označen kao prodat. Ostavite podatke i prodajni tim će vam predložiti dostupne jedinice slične kvadrature, strukture ili rasporeda.`,
      submitLabel: "Pošaljite upit za slične jedinice",
      messagePlaceholder:
        `Napišite šta vam se dopada kod ovog ${unitNoun} i koju kvadraturu, strukturu ili sprat biste razmatrali.`,
      purchaseTitle: `Ovaj ${unitNoun} je prodat, ali upit i dalje ima smisla.`,
      purchaseLead:
        `Ako vam odgovara raspored ili kvadratura ovog ${unitNoun}, prodaja može da proveri slične dostupne opcije u projektu.`,
      purchaseSteps: [
        "Pošaljete upit za slične jedinice.",
        "Uporedjujemo dostupne jedinice po kvadraturi i rasporedu.",
        "Šaljemo vam najblize opcije i sledeći korak.",
      ],
    };
  }

  return {
    buttonLabel: "Pišite nam",
    modalTitle: `Pišite nam za ${unitName}`,
    modalDescription:
      "Ostavite podatke i prodajni tim će vam poslati informacije o dostupnosti, ceni, uslovima kupovine ili terminu obilaska.",
    submitLabel: "Pošaljite upit",
    messagePlaceholder:
      `Napišite da li vas zanima cena, dostupnost, obilazak ili dodatne informacije o ovom ${unitNoun}.`,
    purchaseTitle: "Direktan sledeći korak.",
    purchaseLead: availabilityNote,
    purchaseSteps: [
      `Pošaljete upit za ovaj ${unitNoun}.`,
      "Dobijate cenu, dostupnost i uslove kupovine.",
      "Dogovaramo razgovor ili obilazak lokacije.",
    ],
  };
}

export const ApartmentDetailsPage = () => {
  const { apartmentNumber } = useParams();
  const [availableApartments, setAvailableApartments] =
    useState<Apartment[]>(fallbackApartments);
  const [allowLocalFallback, setAllowLocalFallback] = useState(true);
  const apartment = useMemo(
    () =>
      availableApartments.find(
        (item) => item.slug === apartmentNumber || item.number === apartmentNumber,
      ) ??
      (allowLocalFallback
        ? fallbackApartments.find(
            (item) =>
              item.slug === apartmentNumber || item.number === apartmentNumber,
          )
        : undefined),
    [allowLocalFallback, apartmentNumber, availableApartments],
  );
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [isHeroPlanOpen, setIsHeroPlanOpen] = useState(false);
  const [heroPlanZoom, setHeroPlanZoom] = useState(heroPlanZoomMin);
  const heroPlanViewportRef = useRef<HTMLDivElement>(null);
  const heroPlanDragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    scrollLeft: number;
    scrollTop: number;
  } | null>(null);

  const updateHeroPlanZoom = useCallback(
    (
      getNextZoom: (currentZoom: number) => number,
      focalPoint?: { clientX: number; clientY: number },
    ) => {
      setHeroPlanZoom((currentZoom) => {
        const nextZoom = clampHeroPlanZoom(getNextZoom(currentZoom));
        const viewport = heroPlanViewportRef.current;

        if (viewport && focalPoint && nextZoom !== currentZoom) {
          const bounds = viewport.getBoundingClientRect();
          const focalX = focalPoint.clientX - bounds.left;
          const focalY = focalPoint.clientY - bounds.top;
          const contentX = viewport.scrollLeft + focalX;
          const contentY = viewport.scrollTop + focalY;
          const zoomRatio = nextZoom / currentZoom;

          window.requestAnimationFrame(() => {
            viewport.scrollLeft = contentX * zoomRatio - focalX;
            viewport.scrollTop = contentY * zoomRatio - focalY;
          });
        }

        return nextZoom;
      });
    },
    [],
  );

  const changeHeroPlanZoom = useCallback(
    (change: number, focalPoint?: { clientX: number; clientY: number }) => {
      updateHeroPlanZoom((currentZoom) => currentZoom + change, focalPoint);
    },
    [updateHeroPlanZoom],
  );

  const resetHeroPlanZoom = useCallback(() => {
    updateHeroPlanZoom(() => heroPlanZoomMin);
  }, [updateHeroPlanZoom]);

  const openHeroPlan = () => {
    setHeroPlanZoom(heroPlanZoomMin);
    setIsHeroPlanOpen(true);
  };

  const closeHeroPlan = useCallback(() => {
    heroPlanDragRef.current = null;
    setIsHeroPlanOpen(false);
  }, []);

  const handleHeroPlanWheel = (event: WheelEvent<HTMLDivElement>) => {
    event.preventDefault();

    changeHeroPlanZoom(
      event.deltaY < 0 ? heroPlanZoomStep : -heroPlanZoomStep,
      {
        clientX: event.clientX,
        clientY: event.clientY,
      },
    );
  };

  const handleHeroPlanPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || heroPlanZoom <= heroPlanZoomMin) {
      return;
    }

    event.preventDefault();
    heroPlanDragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      scrollLeft: event.currentTarget.scrollLeft,
      scrollTop: event.currentTarget.scrollTop,
    };
    event.currentTarget.dataset.dragging = "true";
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleHeroPlanPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const dragState = heroPlanDragRef.current;

    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    event.preventDefault();
    event.currentTarget.scrollLeft =
      dragState.scrollLeft - (event.clientX - dragState.startX);
    event.currentTarget.scrollTop =
      dragState.scrollTop - (event.clientY - dragState.startY);
  };

  const endHeroPlanDrag = (event: PointerEvent<HTMLDivElement>) => {
    const dragState = heroPlanDragRef.current;

    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    delete event.currentTarget.dataset.dragging;
    heroPlanDragRef.current = null;
  };

  useEffect(() => {
    let isMounted = true;

    fetchApartments()
      .then((items) => {
        if (isMounted) {
          setAvailableApartments(items);
          setAllowLocalFallback(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setAvailableApartments(fallbackApartments);
          setAllowLocalFallback(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isHeroPlanOpen) {
      return undefined;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.classList.add("is-apartment-plan-lightbox-open");

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeHeroPlan();
        return;
      }

      if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        changeHeroPlanZoom(heroPlanZoomStep);
        return;
      }

      if (event.key === "-" || event.key === "_") {
        event.preventDefault();
        changeHeroPlanZoom(-heroPlanZoomStep);
        return;
      }

      if (event.key === "0") {
        event.preventDefault();
        resetHeroPlanZoom();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.classList.remove("is-apartment-plan-lightbox-open");
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [changeHeroPlanZoom, closeHeroPlan, isHeroPlanOpen, resetHeroPlanZoom]);

  if (!apartment) {
    return (
      <main className="not-found-page">
        <PageMeta
          title="Jedinica nije pronađena | Heroja Pinkija 13"
          description="Izabrana jedinica nije pronađena. Pogledajte aktuelnu ponudu stanova i lokala u projektu Heroja Pinkija 13."
          canonicalPath={apartmentsPath}
          robots="noindex,follow"
        />
        <div className="soft-card not-found-page__card">
          <p className="section-eyebrow">Detalji jedinice</p>
          <h1>Jedinica nije pronađena</h1>
          <p>Proverite ponudu stanova i lokala i izaberite jedinicu iz aktuelne liste.</p>
          <Link className="site-button site-button--accent" to={apartmentsPath}>
            Nazad na ponudu
          </Link>
        </div>
      </main>
    );
  }

  const sameTypeApartments = availableApartments
    .filter(
      (item) =>
        item.number !== apartment.number &&
        item.unitType === apartment.unitType &&
        item.planVariant === apartment.planVariant &&
        item.status !== "Sold",
    )
    .sort((first, second) => getUnitSortOrder(first) - getUnitSortOrder(second))
    .slice(0, 3);
  const sameUnitType = availableApartments
    .filter(
      (item) =>
        item.number !== apartment.number &&
        item.unitType === apartment.unitType &&
        item.status !== "Sold",
    )
    .sort((first, second) => getUnitSortOrder(first) - getUnitSortOrder(second));
  const relatedApartments =
    sameTypeApartments.length > 0
      ? sameTypeApartments
      : (sameUnitType.length > 0 ? sameUnitType : availableApartments)
          .filter(
            (item) =>
              item.number !== apartment.number && item.status !== "Sold",
          )
          .sort((first, second) => getUnitSortOrder(first) - getUnitSortOrder(second))
          .slice(0, 3);
  const apartmentCtaCopy = getApartmentCtaCopy(
    apartment.status,
    getUnitDisplayName(apartment),
    apartment.availabilityNote,
    getUnitLabel(apartment),
  );
  const unitName = getUnitDisplayName(apartment);
  const unitLabel = getUnitLabel(apartment);
  const unitIsCommercial = apartment.unitType === "commercial_space";
  const apartmentContactModal = {
    eyebrow: unitName,
    title: apartmentCtaCopy.modalTitle,
    description: apartmentCtaCopy.modalDescription,
    submitLabel: apartmentCtaCopy.submitLabel,
    inquiryType: "unit" as const,
    projectSlug: "heroja-pinkija-13",
    unitCode: unitName,
    details: [
      { label: unitLabel, value: unitName },
      { label: "Sprat", value: apartment.floor },
      { label: "Površina", value: apartment.size },
      { label: "Struktura", value: apartment.rooms },
    ],
    messagePlaceholder: apartmentCtaCopy.messagePlaceholder,
  };
  const heroPlanDimensions = getPublicImageDimensions(
    apartment.heroFloorPlan.src,
  );
  const heroPlanZoomBaseWidth = Math.min(
    heroPlanDimensions?.width ?? 1400,
    1400,
  );
  const heroPlanZoomPercent = Math.round(heroPlanZoom * 100);

  return (
    <main className="apartment-detail apartment-detail--editorial">
      <PageMeta
        title={
          apartment.seoTitle ?? `${unitName} | Heroja Pinkija 13`
        }
        description={
          apartment.seoDescription ??
          `Detalji za ${unitName}: ${apartment.size}, ${apartment.floor}, ${apartment.rooms}. Pogledajte tlocrt i pošaljite upit prodaji.`
        }
        image={apartment.heroFloorPlan.src}
        imageAlt={apartment.heroFloorPlan.alt}
      />
      <section className="apartment-detail-hero">
        <div className="page-container">
          <nav className="apartment-breadcrumb" aria-label="Putanja stranice">
            <Link to={projectBasePath}>Heroja Pinkija 13</Link>
            <span aria-hidden="true">/</span>
            <Link to={apartmentsPath}>Ponuda stanova i lokala</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{unitName}</span>
          </nav>

          <div className="apartment-detail-hero__grid">
            <div className="apartment-detail-hero__copy">
              <span
                className={`status-badge status-badge--${statusVariant[apartment.status]}`}
              >
                {statusLabel[apartment.status]}
              </span>
              <p className="section-eyebrow">Detalji jedinice</p>
              <h1>{unitName}</h1>
              <p className="section-copy section-copy--large">
                {apartment.description}
              </p>

              <div className="apartment-detail-hero__quick-facts">
                <span>{apartment.size}</span>
                <span>{apartment.floor}</span>
                <span>{apartment.rooms}</span>
              </div>

              <div className="page-actions">
                <ContactModalButton
                  className="site-button site-button--accent"
                  modalOptions={apartmentContactModal}
                >
                  <MessageCircle />
                  {apartmentCtaCopy.buttonLabel}
                </ContactModalButton>
                <a
                  className="apartment-detail-hero__text-link"
                  href={contactPhoneHref}
                >
                  <Phone />
                  Pozovite prodaju
                </a>
              </div>
            </div>

            <button
              type="button"
              className="apartment-detail-hero__visual"
              aria-label={`Otvori projektni tlocrt za ${unitName} u punoj velicini`}
              onClick={openHeroPlan}
            >
              <img
                src={apartment.heroFloorPlan.src}
                alt={apartment.heroFloorPlan.alt}
                width="900"
                height="700"
              />
              <span className="apartment-detail-hero__plan-label">
                <span>Projektni tlocrt</span>
                <strong>{unitName}</strong>
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
          aria-label={`Projektni tlocrt za ${unitName}`}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeHeroPlan();
            }
          }}
        >
          <button
            className="lightbox__close"
            type="button"
            aria-label="Zatvori projektni tlocrt"
            onClick={closeHeroPlan}
            autoFocus
          >
            <X />
          </button>
          <div
            className="apartment-plan-lightbox__toolbar"
            role="group"
            aria-label="Kontrole za uvećanje tlocrta"
          >
            <button
              type="button"
              aria-label="Umanji tlocrt"
              disabled={heroPlanZoom <= heroPlanZoomMin}
              onClick={() => changeHeroPlanZoom(-heroPlanZoomStep)}
            >
              <Minus />
            </button>
            <span aria-live="polite">{heroPlanZoomPercent}%</span>
            <button
              type="button"
              aria-label="Vrati osnovnu velicinu"
              disabled={heroPlanZoom === heroPlanZoomMin}
              onClick={resetHeroPlanZoom}
            >
              <RotateCcw />
            </button>
            <button
              type="button"
              aria-label="Uvećaj tlocrt"
              disabled={heroPlanZoom >= heroPlanZoomMax}
              onClick={() => changeHeroPlanZoom(heroPlanZoomStep)}
            >
              <Plus />
            </button>
          </div>
          <div
            ref={heroPlanViewportRef}
            className={`apartment-plan-lightbox__viewport${
              heroPlanZoom > heroPlanZoomMin ? " is-zoomed" : ""
            }`}
            onWheel={handleHeroPlanWheel}
            onPointerDown={handleHeroPlanPointerDown}
            onPointerMove={handleHeroPlanPointerMove}
            onPointerUp={endHeroPlanDrag}
            onPointerCancel={endHeroPlanDrag}
          >
            <img
              alt={apartment.heroFloorPlan.alt}
              className={
                heroPlanZoom > heroPlanZoomMin ? "is-zoomed" : undefined
              }
              src={apartment.heroFloorPlan.src}
              draggable={false}
              style={
                heroPlanZoom > heroPlanZoomMin
                  ? ({
                      width: `${Math.round(heroPlanZoomBaseWidth * heroPlanZoom)}px`,
                    } as CSSProperties)
                  : undefined
              }
            />
          </div>
        </div>
      ) : null}

      <ApartmentFacts apartment={apartment} />

      <section className="apartment-layout-section">
        <div className="page-container">
          <div className="apartment-layout-section__heading">
            <div>
              <p className="section-eyebrow">
                Raspored {unitIsCommercial ? "lokala" : "stana"}
              </p>
              <h2 className="section-title section-title--medium">
                Dva pogleda na isti prostor.
              </h2>
            </div>
            <p className="section-copy">
              Interaktivni grid olakšava razumevanje odnosa prostorija, dok
              originalni projektni tlocrt čuva precizne arhitektonske detalje.
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

          <ApartmentPurchaseGuide
            apartment={apartment}
            ctaCopy={apartmentCtaCopy}
            modalOptions={apartmentContactModal}
          />
        </div>
      </section>

      <section className="related-apartments related-apartments--editorial">
        <div className="page-container">
          <div className="apartment-layout-section__heading">
            <div>
              <p className="section-eyebrow">Još jedinica u ponudi</p>
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
                to={`${apartmentsPath}/${getUnitRouteSegment(item)}`}
              >
                <div>
                  <span>{getUnitLabel(item)}</span>
                  <strong>{getUnitDisplayName(item).replace(/^Stan\s/i, "")}</strong>
                </div>
                <dl>
                  <div>
                    <dt>Sprat</dt>
                    <dd>{item.floor}</dd>
                  </div>
                  <div>
                    <dt>Površina</dt>
                    <dd>{item.size}</dd>
                  </div>
                  <div>
                    <dt>Struktura</dt>
                    <dd>{item.rooms}</dd>
                  </div>
                </dl>
                <span>
                  Detalji {getUnitLabel(item).toLowerCase()}
                  <ArrowUpRight />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

const ApartmentFacts = ({ apartment }: { apartment: Apartment }) => {
  const unitLabel = getUnitLabel(apartment);
  const unitIsCommercial = apartment.unitType === "commercial_space";
  const facts = [
    {
      icon: unitIsCommercial ? Building2 : Home,
      label: unitLabel,
      value: getUnitDisplayName(apartment),
    },
    { icon: Layers3, label: "Sprat", value: apartment.floor },
    { icon: Ruler, label: "Površina", value: apartment.size },
    { icon: BedDouble, label: "Struktura", value: apartment.rooms },
    { icon: Bath, label: "Kupatila", value: apartment.bathrooms },
    { icon: Building2, label: "Terasa", value: apartment.terrace },
    { icon: Compass, label: "status", value: statusLabel[apartment.status] },
  ];

  return (
    <section className="apartment-facts" aria-label="Osnovni podaci o jedinici">
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

const floorPlanZoomScale = 1.35;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const updateFloorPlanZoom = (event: PointerEvent<HTMLDivElement>) => {
  const stage = event.currentTarget;
  const image = stage.querySelector<HTMLImageElement>("img");

  if (!image) {
    return;
  }

  const stageBounds = stage.getBoundingClientRect();
  const imageBounds = image.getBoundingClientRect();
  const naturalWidth =
    image.naturalWidth || Number(image.getAttribute("width")) || 1;
  const naturalHeight =
    image.naturalHeight || Number(image.getAttribute("height")) || 1;
  const imageRatio = naturalWidth / naturalHeight;
  const frameRatio = imageBounds.width / imageBounds.height;

  let renderedWidth = imageBounds.width;
  let renderedHeight = imageBounds.height;
  let renderedLeft = imageBounds.left;
  let renderedTop = imageBounds.top;

  if (imageRatio > frameRatio) {
    renderedHeight = renderedWidth / imageRatio;
    renderedTop += (imageBounds.height - renderedHeight) / 2;
  } else {
    renderedWidth = renderedHeight * imageRatio;
    renderedLeft += (imageBounds.width - renderedWidth) / 2;
  }

  const lensWidth =
    parseFloat(getComputedStyle(stage, "::before").width) || 230;
  const lensRadius = lensWidth / 2;
  const cursorX = event.clientX - stageBounds.left;
  const cursorY = event.clientY - stageBounds.top;
  const imageX = clamp(event.clientX - renderedLeft, 0, renderedWidth);
  const imageY = clamp(event.clientY - renderedTop, 0, renderedHeight);

  stage.dataset.zoomActive = "true";
  stage.style.setProperty("--zoom-x", `${cursorX}px`);
  stage.style.setProperty("--zoom-y", `${cursorY}px`);
  stage.style.setProperty(
    "--zoom-bg-width",
    `${renderedWidth * floorPlanZoomScale}px`,
  );
  stage.style.setProperty(
    "--zoom-bg-height",
    `${renderedHeight * floorPlanZoomScale}px`,
  );
  stage.style.setProperty(
    "--zoom-bg-x",
    `${lensRadius - imageX * floorPlanZoomScale}px`,
  );
  stage.style.setProperty(
    "--zoom-bg-y",
    `${lensRadius - imageY * floorPlanZoomScale}px`,
  );
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
      Izaberite prostoriju za naziv i površinu.
    </p>
  </article>
);

const ApartmentPlanDrawing = ({
  apartment,
  activeRoomId,
  onActiveRoomChange,
}: { apartment: Apartment } & ActiveRoomProps) => {
  if (
    apartment.planVariant &&
    apartment.planVariant in stackPlanSpacesByVariant
  ) {
    return (
      <ApartmentStackPlan
        ariaLabel={`Raspored prostorija za ${getUnitDisplayName(apartment)}`}
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
        <title id={titleId}>
          Raspored prostorija skaliran prema kvadraturi
        </title>
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
                  onActiveRoomChange(
                    activeRoomId === space.id ? null : space.id,
                  );
                }
              }}
              onMouseEnter={() => onActiveRoomChange(space.id)}
              onMouseLeave={() => onActiveRoomChange(null)}
            >
              <rect
                x={space.x}
                y={space.y}
                width={space.width}
                height={space.height}
                rx="7"
              />
              {room.number ? (
                <text
                  className="apartment-plan__space-number"
                  x={space.x + 18}
                  y={space.y + 25}
                >
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
      onPointerEnter={(event: PointerEvent<HTMLDivElement>) => {
        updateFloorPlanZoom(event);
      }}
      onPointerMove={updateFloorPlanZoom}
      onPointerLeave={(event: PointerEvent<HTMLDivElement>) => {
        delete event.currentTarget.dataset.zoomActive;
      }}
      style={
        {
          "--zoom-image": `url("${apartment.projectFloorPlan.src}")`,
        } as CSSProperties
      }
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
      <span>
        {getUnitDisplayName(apartment)} · {apartment.floor}
      </span>
      <span>Poredjenje sa gridom prostorija</span>
      {apartment.floorPlanPdfUrl ? (
        <a href={apartment.floorPlanPdfUrl} download>
          Preuzmite dokumentaciju
        </a>
      ) : null}
    </figcaption>
  </figure>
);

const ApartmentPurchaseGuide = ({
  apartment,
  ctaCopy,
  modalOptions,
}: {
  apartment: Apartment;
  ctaCopy: ApartmentCtaCopy;
  modalOptions: ContactModalOptions;
}) => {
  const unitLabel = getUnitLabel(apartment);
  const unitIsCommercial = apartment.unitType === "commercial_space";

  return (
    <section
    className="apartment-purchase-guide"
    aria-labelledby="apartment-purchase-guide-title"
  >
    <div className="apartment-purchase-guide__advantages">
      <div className="apartment-purchase-guide__intro">
        <div>
          <p className="section-eyebrow">Prednosti {unitLabel.toLowerCase()}</p>
          <h3 id="apartment-purchase-guide-title">
            {unitIsCommercial
              ? "Lokacija i funkcionalnost na jednom mestu."
              : "Lokacija i komfor na jednom mestu."}
          </h3>
        </div>
        <p>
          {unitIsCommercial
            ? "Lokal se posmatra kroz poziciju, raspored prostora i praktične karakteristike važne za poslovanje."
            : "Stan se posmatra kroz svakodnevni ritam: gde se nalazi, koliko je lako uporediti raspored i koje praktične karakteristike prate kupovinu."}
        </p>
      </div>

      <div className="apartment-advantage-groups">
        <article className="apartment-advantage-group">
          <div>
            <span>Lokacija</span>
            <h4>Okruženje za svakodnevni život</h4>
          </div>
          <ul className="apartment-location-list">
            {locationAdvantages.map((advantage) => (
              <li key={advantage}>
                <CheckCircle2 />
                <span>{advantage}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="apartment-advantage-group">
          <div>
            <span>{unitLabel}</span>
            <h4>Karakteristike koje olakšavaju izbor</h4>
          </div>
          <ul className="apartment-feature-list">
            {apartment.features.map((feature) => (
              <li key={feature}>
                <CheckCircle2 />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </article>
      </div>

      <dl className="apartment-context-facts">
        <div>
          <dt>Lokacija</dt>
          <dd>Heroja Pinkija 13</dd>
        </div>
        <div>
          <dt>Izgradnja</dt>
          <dd>u toku od 2026.</dd>
        </div>
        <div>
          <dt>Planirano</dt>
          <dd>15.11.2027.</dd>
        </div>
        <div>
          <dt>Opcije</dt>
          <dd>
            {unitIsCommercial
              ? "Poslovni prostor u prizemlju"
              : "Garažna mesta i ostave"}
          </dd>
        </div>
      </dl>
    </div>

    <PurchasePanel
      apartment={apartment}
      ctaCopy={ctaCopy}
      modalOptions={modalOptions}
    />
  </section>
  );
};

const PurchasePanel = ({
  apartment,
  ctaCopy,
  modalOptions,
}: {
  apartment: Apartment;
  ctaCopy: ApartmentCtaCopy;
  modalOptions: ContactModalOptions;
}) => (
  <aside
    className="apartment-purchase"
    aria-labelledby="apartment-purchase-title"
  >
    <div className="apartment-purchase__copy">
      <p className="section-eyebrow">Informacije o kupovini</p>
      <h3 id="apartment-purchase-title">{ctaCopy.purchaseTitle}</h3>
      <p>{ctaCopy.purchaseLead}</p>
    </div>
    <dl>
      <PurchaseRow label="Cena" value={apartment.priceRange} />
      <PurchaseRow label="status" value={statusLabel[apartment.status]} />
      {apartment.unitType === "commercial_space" ? (
        <PurchaseRow label="Pozicija" value="Prizemlje" />
      ) : (
        <>
          <PurchaseRow label="Garažno mesto" value="Odvojena kupovina" />
          <PurchaseRow label="Ostava" value="Odvojena kupovina" />
        </>
      )}
    </dl>
    <ol
      className="apartment-purchase__steps"
      aria-label="Kako izgleda sledeći korak"
    >
      {ctaCopy.purchaseSteps.map((step, index) => (
        <li key={step}>
          <span>{String(index + 1).padStart(2, "0")}</span>
          <strong>{step}</strong>
        </li>
      ))}
    </ol>
    <div className="apartment-purchase__actions">
      <ContactModalButton
        className="site-button site-button--accent"
        modalOptions={modalOptions}
      >
        <MessageCircle />
        {ctaCopy.buttonLabel}
      </ContactModalButton>
      <a className="apartment-purchase__phone" href={contactPhoneHref}>
        <Phone />
        {contactPhone}
      </a>
    </div>
  </aside>
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
  "commercial-lokal-1": {
    viewBox: "-14 -14 780 360",
    spaces: [
      { id: "business-space", x: 0, y: 0, width: 780, height: 270 },
      { id: "toilet", x: 540, y: 270, width: 140, height: 70 },
    ],
  },
  "commercial-lokal-2": {
    viewBox: "-14 -14 780 360",
    spaces: [
      { id: "business-space", x: 0, y: 0, width: 780, height: 270 },
      { id: "toilet", x: 390, y: 270, width: 140, height: 70 },
    ],
  },
};
