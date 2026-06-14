import type { NextRequest } from "next/server";
import { clientIdSchema } from "src/lib/schemas";

export function getClientId(request: NextRequest): string | null {
  const header = request.headers.get("x-client-id");
  if (!header) return null;

  const parsed = clientIdSchema.safeParse(header);
  return parsed.success ? parsed.data : null;
}

export function unauthorized(): Response {
  return Response.json({ error: "Não autorizado" }, { status: 401 });
}

export function badRequest(message: string): Response {
  return Response.json({ error: message }, { status: 400 });
}

export function notFound(): Response {
  return Response.json({ error: "Não encontrado" }, { status: 404 });
}

export function forbidden(): Response {
  return Response.json({ error: "Sem permissão" }, { status: 403 });
}
