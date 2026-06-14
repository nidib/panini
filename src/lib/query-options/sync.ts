import { queryOptions } from "@tanstack/react-query";
import { apiFetchJson, apiPath } from "src/lib/api-client";
import { albumKeys } from "src/lib/query-options/keys";
import type { SyncResponse } from "src/lib/schemas";

export function syncOptions(id: string, since: string) {
  return queryOptions({
    queryKey: [...albumKeys.sync(id), { since }],
    queryFn: async () =>
      apiFetchJson<SyncResponse>(
        apiPath(`/albums/${id}/sync?since=${encodeURIComponent(since)}`),
      ),
    enabled: Boolean(id) && Boolean(since),
    refetchInterval: 5000,
  });
}
