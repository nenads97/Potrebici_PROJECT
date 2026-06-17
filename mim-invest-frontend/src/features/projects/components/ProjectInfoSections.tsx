import {
  buildingLevels,
  locationAdvantages,
  projectInfo,
  projectTimeline,
} from "../data/herojaPinkija13.data";

export const ProjectStructure = () => {
  return (
    <section className="project-section project-structure" id="struktura">
      <div className="section-heading">
        <p className="eyebrow">Struktura objekta</p>
        <h2>Jasna organizacija jedinica</h2>
        <p>
          Objekat kombinuje stambene jedinice, poslovni sadrzaj i dodatne
          opcije za parking i ostave, uz ponavljanje funkcionalnih stanova na
          stambenim spratovima.
        </p>
      </div>

      <div className="project-structure__grid">
        {buildingLevels.map((level) => (
          <article className="structure-card" key={level.level}>
            <span>{level.level}</span>
            <h3>{level.title}</h3>
            <ul>
              {level.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
};

export const LocationHighlights = () => {
  return (
    <section className="project-section location-section" id="lokacija">
      <div className="location-section__content">
        <p className="eyebrow">Lokacija</p>
        <h2>{projectInfo.address}, {projectInfo.city}</h2>
        <p>
          Pocetak Telepa je praktican izbor za kupce koji zele mirniji
          stambeni ambijent, ali i brzu vezu sa centrom, skolama, trgovinom i
          rekreativnim zonama uz Dunav.
        </p>

        <div className="location-section__tags">
          {locationAdvantages.map((advantage) => (
            <span key={advantage}>{advantage}</span>
          ))}
        </div>
      </div>

      <div className="location-map" aria-label="Stilizovan prikaz lokacije">
        <div className="location-map__road location-map__road--primary" />
        <div className="location-map__road location-map__road--secondary" />
        <div className="location-map__block location-map__block--site">
          Heroja Pinkija 13
        </div>
        <div className="location-map__block location-map__block--green">Kej</div>
        <div className="location-map__block location-map__block--city">Centar</div>
      </div>
    </section>
  );
};

export const ProjectTimeline = () => {
  return (
    <section className="project-section timeline-section" id="timeline">
      <div className="section-heading section-heading--split">
        <div>
          <p className="eyebrow">Timeline</p>
          <h2>Plan razvoja gradnje</h2>
        </div>
        <p>
          Kupci dobijaju pregled kljucnih faza, od pocetka izgradnje do
          planiranog zavrsetka objekta.
        </p>
      </div>

      <div className="timeline">
        {projectTimeline.map((item) => (
          <article className={`timeline__item timeline__item--${item.state}`} key={item.id}>
            <span>{item.date}</span>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
};

export const ContactSection = () => {
  return (
    <section className="project-section contact-section" id="kontakt">
      <div className="contact-section__copy">
        <p className="eyebrow">Kontakt</p>
        <h2>Zatrazite dostupnost ili dodatne informacije</h2>
        <p>
          Forma je pripremljena za opste upite i upite za konkretan stan.
          Nakon backend integracije moze se povezati sa CRM ili Umbraco CMS
          tokovima.
        </p>
      </div>

      <form className="contact-form">
        <label>
          Ime i prezime
          <input name="fullName" placeholder="Unesite ime" type="text" />
        </label>
        <label>
          Telefon
          <input name="phone" placeholder="+381" type="tel" />
        </label>
        <label>
          Email
          <input name="email" placeholder="ime@email.com" type="email" />
        </label>
        <label>
          Interesovanje
          <select name="unit">
            <option>Opsti upit</option>
            <option>Stan</option>
            <option>Poslovni prostor</option>
            <option>Parking ili ostava</option>
          </select>
        </label>
        <label className="contact-form__wide">
          Poruka
          <textarea
            name="message"
            placeholder="Napisite koji tip prostora vas interesuje"
            rows={5}
          />
        </label>
        <button className="button button--primary contact-form__wide" type="submit">
          Posalji upit
        </button>
      </form>
    </section>
  );
};
