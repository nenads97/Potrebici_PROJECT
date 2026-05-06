import { BrowserRouter, Route, Routes } from "react-router-dom";

import { HomePage } from "../../views/pages/HomePage";
import { HerojaPinkija13Page } from "../../views/pages/projects/HerojaPinkija13/HerojaPinkija13Page";

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route
          path="/projekti/heroja-pinkija-13"
          element={<HerojaPinkija13Page />}
        />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
