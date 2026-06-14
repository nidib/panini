import type { QueryClient } from "@tanstack/react-query";
import { getClientId } from "src/lib/client-id";

const API_PREFIX = "/api";

export async function apiFetchJson<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<T> {
  const clientId = getClientId();

  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "x-client-id": clientId,
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const body = await response
      .json()
      .catch(() => ({ error: "Erro desconhecido" }));
    throw new ApiError(response.status, body.error ?? "Erro desconhecido");
  }

  return response.json() as Promise<T>;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function apiPath(path: string): string {
  return `${API_PREFIX}${path}`;
}

export function ensureQueryClient(qc?: QueryClient): QueryClient {
  if (!qc) {
    throw new Error("QueryClient é obrigatório");
  }
  return qc;
}
