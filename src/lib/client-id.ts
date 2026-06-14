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

export function useClientId(): string | null {
  const [clientId, setClientId] = useState<string | null>(null);

  useEffect(() => {
    setClientId(getClientId());
  }, []);

  return clientId;
}
