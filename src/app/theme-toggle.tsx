"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [light, setLight] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("indolicense-theme");
    const shouldUseLight = saved === "light" || (!saved && window.matchMedia("(prefers-color-scheme: light)").matches);
    document.documentElement.dataset.theme = shouldUseLight ? "light" : "dark";
    setLight(shouldUseLight);
  }, []);

  function toggleTheme() {
    const next = !light;
    document.documentElement.dataset.theme = next ? "light" : "dark";
    window.localStorage.setItem("indolicense-theme", next ? "light" : "dark");
    setLight(next);
  }

  return <button className="theme-toggle" type="button" onClick={toggleTheme} aria-label={`Switch to ${light ? "dark" : "light"} mode`} title={`Switch to ${light ? "dark" : "light"} mode`}><span aria-hidden="true">{light ? "☾" : "☼"}</span><span className="theme-toggle-label">{light ? "Dark" : "Light"}</span></button>;
}
