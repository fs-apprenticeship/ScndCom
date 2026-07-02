"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme") === "dark";
    document.documentElement.classList.toggle("dark", stored);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <button
      className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium"
      onClick={toggle}
    >
      {dark ? "○" : "●"}
    </button>
  );
}
