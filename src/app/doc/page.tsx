"use client";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";

export default function CreateDocPage() {
  const [prompt, setPrompt] = useState("");
  const [doc, setDoc] = useState<null | { url: string }>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<null | string>(null);

  function handleCreate() {
    setLoading(true);
    setError(null);
    fetch("/api/doc", {
      body: JSON.stringify({ prompt }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    })
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        if (data.error) {
          setError(JSON.stringify(data, null, 2));
        } else {
          setDoc(data);
        }
      })
      .catch((err) => {
        setLoading(false);
        setError(String(err));
      });
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="grid w-full gap-2">
        <Textarea
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="What do you want to document..."
          rows={6}
          value={prompt}
        />
        <Button disabled={loading || !prompt.trim()} onClick={handleCreate}>
          {loading ? (
            <>
              <Spinner data-icon="inline-start" />
              Creating…
            </>
          ) : (
            "Create Doc"
          )}
        </Button>
      </div>

      {error && <pre className="mt-4">{error}</pre>}

      {doc && (
        <div className="mt-4">
          <a href={doc.url} rel="noreferrer" target="_blank">
            Open in Google Docs
          </a>
          <pre>{JSON.stringify(doc, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
