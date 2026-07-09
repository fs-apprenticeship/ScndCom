import { auth, clerkClient } from "@clerk/nextjs/server";

import { b } from "@/baml_client";

/**
 * This is the Drive (not Docs) upload endpoint. "upload/" + uploadType=multipart
 * is the variant of the API that lets us send file content instead of just
 * metadata.
 * */
const DRIVE_UPLOAD_URL = "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return Response.json({ error: "unauthorized" }, { status: 401 });

    const client = await clerkClient();
    const { data } = await client.users.getUserOauthAccessToken(userId, "google");
    const googleAccessToken = data[0]?.token;
    if (!googleAccessToken) return Response.json({ error: "no google token found" }, { status: 401 });

    const { prompt } = await req.json();

    if (typeof prompt !== "string" || !prompt.trim()) {
      return Response.json({ error: "Prompt is required" }, { status: 400 });
    }

    const structuredRes = await b.CreateDoc(prompt);

    /**
     * The boundary is just a divider string invented to separate the two
     * parts" of the multipart body below. 
     * */ 
    
    const boundary = `wubalubadubdub`;

    /**
     * This is metadata telling Drive what to create. 
     * Setting mimeType to the Google Docs type is what tells
     * Drive "convert this into a real Doc," don't "store it as a plain file."
     * */
    const metadata = {
      mimeType: "application/vnd.google-apps.document",
      name: structuredRes.title,
    };

    /**
     * The body is separated by the boundary marker:
     *   --boundary
     *   Content-Type: <type of this part>
     *   <blank line - separates this part's header from its content>
     *   <the actual content>
     * ...repeated for each part, and closed with --boundary--
     * */
    const multipartBody =
      `--${boundary}\r\n` +
      `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
      `${JSON.stringify(metadata)}\r\n` +
      `--${boundary}\r\n` +
      /**
       * Labeling this part text/markdown is what makes Drive run its
       * markdown importer on the content, turning ## headings, **bold**,
       * and bullets into Google Docs formatting automatically.
       * */
      `Content-Type: text/markdown\r\n\r\n` +
      `${structuredRes.content}\r\n` +
      `--${boundary}--`;

    /**
     * One request to create the file and convert+insert the markdown content,
     * instead of the two-step create-then-batchUpdate flow required by the docs API.
     * */
    const createRes = await fetch(DRIVE_UPLOAD_URL, {
      body: multipartBody,
      headers: {
        Authorization: `Bearer ${googleAccessToken}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      method: "POST",
    });

    if (!createRes.ok) {
      const err = await createRes.json();
      return Response.json({ details: err, error: "Drive upload/convert failed" }, { status: 500 });
    }

    const { id: documentId } = await createRes.json();

    return Response.json({
      content: structuredRes,
      documentId,
      url: `https://docs.google.com/document/d/${documentId}/edit`,
    });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Failed to generate doc" }, { status: 500 });
  }
}
