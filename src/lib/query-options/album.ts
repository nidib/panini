import { queryOptions } from "@tanstack/react-query";
import { apiFetchJson, apiPath } from "src/lib/api-client";
import { albumKeys } from "src/lib/query-options/keys";
import type { AlbumDetail } from "src/lib/schemas";

export function albumOptions(id: string) {
  return queryOptions({
    queryKey: albumKeys.detail(id),
    queryFn: async () => apiFetchJson<AlbumDetail>(apiPath(`/albums/${id}`)),
    enabled: Boolean(id),
  });
}
