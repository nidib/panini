export function extractStickerNumber(code: string): string {
  const withoutTrailingS = code.endsWith("s") ? code.slice(0, -1) : code;
  const match = withoutTrailingS.match(/(\d+)$/);
  return match ? match[1] : code;
}

export function getQuantity(
  counts: Record<string, number>,
  stickerCode: string,
): number {
  return counts[stickerCode] ?? 0;
}

export function isMissing(quantity: number): boolean {
  return quantity === 0;
}

export function isOwned(quantity: number): boolean {
  return quantity === 1;
}

export function isDuplicate(quantity: number): boolean {
  return quantity > 1;
}
