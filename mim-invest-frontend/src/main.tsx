import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";

import "@fontsource-variable/dm-sans/index.css";
import "./shared/styles/global.scss";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
