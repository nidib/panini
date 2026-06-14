import type { NextRequest } from "next/server";
import { getClientId, notFound, unauthorized } from "src/lib/api";
import { getAlbum } from "src/lib/db/albums";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const clientId = getClientId(request);
  if (!clientId) return unauthorized();

  const { id } = await params;
  const album = await getAlbum(id, clientId);

  if (!album) return notFound();

  return Response.json(album);
}
