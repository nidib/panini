import type { QueryClient } from "@tanstack/react-query";
import { getClientId } from "src/lib/client-id";

const API_PREFIX = "/api";

function getBaseUrl(): string {
  if (typeof window !== "undefined") {
    return "";
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export async function apiFetchJson<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<T> {
  const clientId = getClientId();

  const url = typeof input === "string" ? `${getBaseUrl()}${input}` : input;

  const response = await fetch(url, {
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
