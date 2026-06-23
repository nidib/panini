import type { StickerDefinition } from "src/lib/schemas";

export function computeTeamCompletion(
  stickers: StickerDefinition[],
  counts: Record<string, number>,
): Record<string, boolean> {
  const result: Record<string, boolean> = {};
  const byTeam = new Map<string, StickerDefinition[]>();

  for (const sticker of stickers) {
    if (!byTeam.has(sticker.team)) {
      byTeam.set(sticker.team, []);
    }
    byTeam.get(sticker.team)?.push(sticker);
  }

  for (const [team, list] of byTeam) {
    result[team] = list.every((s) => (counts[s.code] ?? 0) >= 1);
  }

  return result;
}
