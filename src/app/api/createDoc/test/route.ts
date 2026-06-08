import { b } from "@/baml_client";

export async function GET(req: Request) {
  try {
    const javaQuiz = await b.CreateDoc("Create a short note about object oriented programming in java");

    return Response.json(javaQuiz);
  } catch (err) {
    console.error(err);

    return Response.json({ error: "Failed to generate quiz" }, { status: 500 });
  }
}
