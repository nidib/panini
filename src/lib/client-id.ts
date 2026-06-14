"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "panini:clientId";

export function getClientId(): string {
  if (typeof window === "undefined") {
    return "";
  }

  let clientId = window.localStorage.getItem(STORAGE_KEY);

  if (!clientId) {
    clientId = crypto.randomUUID();
    window.localStorage.setItem(STORAGE_KEY, clientId);
  }

  return clientId;
}

export function setClientId(clientId: string): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, clientId);
}

export function clearClientId(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(STORAGE_KEY);
}

export function useClientId(): string | null {
  const [clientId, setClientIdState] = useState<string | null>(null);

  useEffect(() => {
    setClientIdState(getClientId());
  }, []);

  return clientId;
}
