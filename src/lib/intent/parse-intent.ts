export enum IntentType {
  Calendar = "Calendar",
  Doc = "Doc",
  Mail = "Mail",
  Unknown = "Unknown",
}

type ParseIntentResult = {
  intent: IntentType;
  summary: string;
};

export async function parseIntent(input: string): Promise<ParseIntentResult> {
  const res = await fetch("/api/intent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? res.statusText);
  return data as ParseIntentResult;
}
