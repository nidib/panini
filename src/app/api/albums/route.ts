import type { NextRequest } from "next/server";
import { badRequest, getClientId, unauthorized } from "src/lib/api";
import { createAlbum, listAlbumsForClient } from "src/lib/db/albums";
import { createAlbumInputSchema } from "src/lib/schemas";

export async function GET(request: NextRequest) {
  const clientId = getClientId(request);
  if (!clientId) return unauthorized();

  const albums = await listAlbumsForClient(clientId);
  return Response.json(albums);
}

export async function POST(request: NextRequest) {
  const clientId = getClientId(request);
  if (!clientId) return unauthorized();

  const body = await request.json();
  const parsed = createAlbumInputSchema.safeParse(body);

  if (!parsed.success) {
    return badRequest("Dados inválidos");
  }

  const album = await createAlbum(parsed.data, clientId);
  return Response.json(album, { status: 201 });
}
