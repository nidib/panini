import type { NextRequest } from "next/server";
import { badRequest, getClientId, notFound, unauthorized } from "src/lib/api";
import { syncAlbum } from "src/lib/db/albums";
import { syncQuerySchema } from "src/lib/schemas";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const clientId = getClientId(request);
  if (!clientId) return unauthorized();

  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const since = searchParams.get("since");

  const parsed = syncQuerySchema.safeParse({ since });
  if (!parsed.success) {
    return badRequest("Parâmetro since inválido");
  }

  const result = await syncAlbum(id, clientId, parsed.data.since);

  if (result === null) return notFound();

  return Response.json(result);
}
