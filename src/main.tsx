import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./router";
import "./styles.css";

// A new release landed while this tab was open, so its old code files are gone.
// Reload once (the hive saves on pagehide) instead of showing a broken screen.
window.addEventListener("vite:preloadError", (event) => {
  try {
    const last = Number(sessionStorage.getItem("nidus.reloadedAt") ?? 0);
    if (Date.now() - last < 60_000) return;
    sessionStorage.setItem("nidus.reloadedAt", String(Date.now()));
  } catch {
    return;
  }
  event.preventDefault();
  window.location.reload();
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
