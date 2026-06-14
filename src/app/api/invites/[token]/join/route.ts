import type { NextRequest } from "next/server";
import { badRequest, forbidden, getClientId, unauthorized } from "src/lib/api";
import { joinInvite } from "src/lib/db/albums";
import { joinInviteInputSchema } from "src/lib/schemas";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const clientId = getClientId(request);
  if (!clientId) return unauthorized();

  const { token } = await params;
  const body = await request.json();
  const parsed = joinInviteInputSchema.safeParse({ ...body, token });

  if (!parsed.success) {
    return badRequest("Dados inválidos");
  }

  const result = await joinInvite(token, parsed.data.password, clientId);

  if (result === null) return forbidden();

  return Response.json(result);
}
