import { projectInfo } from "../data/herojaPinkija13.data";

export const ProjectFooter = () => {
  return (
    <footer className="site-footer">
      <div>
        <img src="/images/TRADE.png" alt="M & M Gradnja logo" />
        <p>
          M & M Gradnja razvija stambene projekte u Novom Sadu sa fokusom na
          jasnu komunikaciju, funkcionalne stanove i pouzdanu realizaciju.
        </p>
      </div>

      <div className="site-footer__meta">
        <span>{projectInfo.name}</span>
        <span>{projectInfo.address}, {projectInfo.city}</span>
        <a href="#kontakt">Kontakt za dostupnost</a>
      </div>
    </footer>
  );
};
