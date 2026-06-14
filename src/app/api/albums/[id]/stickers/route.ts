import type { NextRequest } from "next/server";
import { badRequest, forbidden, getClientId, unauthorized } from "src/lib/api";
import { applyStickerOperation } from "src/lib/db/albums";
import { stickerOperationSchema } from "src/lib/schemas";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const clientId = getClientId(request);
  if (!clientId) return unauthorized();

  const { id } = await params;
  const body = await request.json();
  const parsed = stickerOperationSchema.safeParse(body);

  if (!parsed.success) {
    return badRequest("Dados inválidos");
  }

  const result = await applyStickerOperation(id, clientId, parsed.data);

  if (result === null) return forbidden();

  return Response.json(result);
}
