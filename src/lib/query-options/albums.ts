import { queryOptions } from "@tanstack/react-query";
import { apiFetchJson, apiPath } from "src/lib/api-client";
import { albumKeys } from "src/lib/query-options/keys";
import type { AlbumsListResponse } from "src/lib/query-options/types";

export function albumsOptions() {
  return queryOptions({
    queryKey: albumKeys.list(),
    queryFn: async () => apiFetchJson<AlbumsListResponse>(apiPath("/albums")),
  });
}
