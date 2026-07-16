export enum IntentType {
  Calendar = "Calendar",
  GDoc = "GDoc",
  Mail = "Mail",
  Unknown = "Unknown",
}

export type ParsedIntent = {
  intent: IntentType;
  summary: string;
};

export async function parseIntent(input: string): Promise<ParsedIntent> {
  const res = await fetch("/api/intent", {
    body: JSON.stringify({ input }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? res.statusText);
  return data as ParsedIntent;
}
