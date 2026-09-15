import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { applyDesignTokens } from "./design/tokens";
import "./styles.css";
import "./design-refinement.css";

applyDesignTokens();
createRoot(document.getElementById("app")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  navigator.serviceWorker
    .register(`${import.meta.env.BASE_URL}sw.js`)
    .then((registration) => {
      const announce = () =>
        window.dispatchEvent(
          new CustomEvent("pwa-update", { detail: registration }),
        );
      if (registration.waiting) announce();
      registration.addEventListener("updatefound", () => {
        registration.installing?.addEventListener("statechange", () => {
          if (registration.waiting && navigator.serviceWorker.controller)
            announce();
        });
      });
    })
    .catch(() => window.dispatchEvent(new Event("pwa-error")));
}
