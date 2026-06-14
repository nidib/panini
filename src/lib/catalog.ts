import fs from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import {
  type AlbumCatalog,
  albumCatalogSchema,
  type StickerDefinition,
} from "src/lib/schemas";

export const loadAlbumCatalog = cache(
  async (albumType: string): Promise<AlbumCatalog> => {
    const filePath = path.join(
      process.cwd(),
      "albums",
      albumType,
      "album.json",
    );
    const raw = await fs.readFile(filePath, "utf-8");
    const parsed = JSON.parse(raw);
    const catalog = albumCatalogSchema.parse(parsed);

    return {
      ...catalog,
      stickers: catalog.stickers.filter(
        (sticker) => !sticker.code.endsWith("s"),
      ),
    };
  },
);

export type TeamSection = {
  team: string;
  stickers: StickerDefinition[];
};

export function groupStickersByTeam(
  stickers: StickerDefinition[],
): TeamSection[] {
  const sections: TeamSection[] = [];
  const seenTeams = new Set<string>();

  for (const sticker of stickers) {
    if (!seenTeams.has(sticker.team)) {
      seenTeams.add(sticker.team);
      sections.push({ team: sticker.team, stickers: [] });
    }
    const section = sections.find((s) => s.team === sticker.team);
    section?.stickers.push(sticker);
  }

  return sections;
}
