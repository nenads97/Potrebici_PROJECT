import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";

import "@fontsource-variable/figtree/index.css";
import "./shared/styles/global.scss";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
