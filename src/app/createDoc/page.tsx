"use client";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export default function CreateDocPage() {
  const [prompt, setPrompt] = useState("");
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleCreate() {
    setLoading(true);
    setError(null);
    fetch("/api/createDoc", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
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
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="What do you want to document..."
          rows={6}
        />
        <Button onClick={handleCreate} disabled={loading || !prompt.trim()}>
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
          <a href={(doc as any).url} target="_blank" rel="noreferrer">
            Open in Google Docs
          </a>
          <pre>{JSON.stringify(doc, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
