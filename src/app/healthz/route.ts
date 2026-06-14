import { getDb } from "src/lib/db/client";

export async function GET() {
  try {
    const db = await getDb();
    await db.admin().ping();

    return Response.json({
      status: "ok",
      date: new Date().toISOString(),
      mongo: "connected",
    });
  } catch (error) {
    return Response.json(
      {
        status: "error",
        date: new Date().toISOString(),
        mongo: "disconnected",
        error: error instanceof Error ? error.message : "unknown",
      },
      { status: 503 },
    );
  }
}
