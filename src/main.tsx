import React, {lazy, Suspense} from "react";
import { createRoot } from "react-dom/client";
import FinalApp from "./FinalApp";
const LegacyApp=lazy(()=>import('./App').then(m=>({default:m.App})));
import { applyDesignTokens } from "./design/tokens";
import "./styles.css";
import "./design-refinement.css";

applyDesignTokens();
createRoot(document.getElementById("app")!).render(
  <React.StrictMode>
    <Suspense fallback={<p role="status">Loading Achilles Return…</p>}>
      {new URLSearchParams(location.search).get('legacy')==='1'?<LegacyApp/>:<FinalApp/>}
    </Suspense>
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
