import type { NextRequest } from "next/server";
import { badRequest, getClientId, notFound, unauthorized } from "src/lib/api";
import { getAlbum, renameAlbum } from "src/lib/db/albums";
import { renameAlbumInputSchema } from "src/lib/schemas";

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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const clientId = getClientId(request);
  if (!clientId) return unauthorized();

  const { id } = await params;
  const body = await request.json();
  const parsed = renameAlbumInputSchema.safeParse(body);

  if (!parsed.success) {
    return badRequest("Dados inválidos");
  }

  const album = await renameAlbum(id, clientId, parsed.data);

  if (!album) return notFound();

  return Response.json(album);
}
