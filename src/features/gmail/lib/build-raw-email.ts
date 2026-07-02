type BuildRawEmailInput = {
  body: string;
  subject: string;
  to: string;
};

export default function buildRawEmail({
  body,
  subject,
  to,
}: BuildRawEmailInput): string {
  const message = [
    `To: ${to}`,
    `Subject: ${subject}`,
    "Content-Type: text/plain; charset=utf-8",
    "",
    body,
  ].join("\r\n");

  return Buffer.from(message)
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");
}
