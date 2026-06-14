import type { NextRequest } from "next/server";
import { badRequest, getClientId, notFound, unauthorized } from "src/lib/api";
import { createOrRegenerateInvite } from "src/lib/db/albums";
import { createInviteInputSchema } from "src/lib/schemas";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const clientId = getClientId(request);
  if (!clientId) return unauthorized();

  const { id } = await params;
  const body = await request.json();
  const parsed = createInviteInputSchema.safeParse(body);

  if (!parsed.success) {
    return badRequest("Dados inválidos");
  }

  const result = await createOrRegenerateInvite(id, clientId, parsed.data);

  if (result === null) return notFound();

  return Response.json(result);
}
