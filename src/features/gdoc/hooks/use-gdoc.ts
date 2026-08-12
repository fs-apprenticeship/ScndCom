"use client";

import { useState } from "react";

import type { GDocResult } from "../types";

export function useGDoc() {
  const [doc, setDoc] = useState<GDocResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<null | string>(null);

  // Generates a structured doc via BAML and uploads it to Google Drive.
  async function createGDoc(prompt: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/gdoc", {
        body: JSON.stringify({ prompt }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? res.statusText);
      setDoc(data as GDocResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  // Clears all doc state.
  function reset() {
    setDoc(null);
    setLoading(false);
    setError(null);
  }

  return { createGDoc, doc, error, loading, reset };
}
