import type { AlbumSummary } from "src/lib/schemas";

export type AlbumsListResponse = {
  owned: AlbumSummary[];
  shared: AlbumSummary[];
};
