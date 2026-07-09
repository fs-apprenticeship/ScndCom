"use client";

import { useState } from "react";

import type { DocResult } from "../types";

export function useDoc() {
  const [doc, setDoc] = useState<DocResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<null | string>(null);

  // Generates a structured doc via BAML and uploads it to Google Drive.
  async function createDoc(prompt: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/doc", {
        body: JSON.stringify({ prompt }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? res.statusText);
      setDoc(data as DocResult);
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

  return { createDoc, doc, error, loading, reset };
}
