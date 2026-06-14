import { compare, hash } from "bcryptjs";
import type { AlbumDocument, Role } from "src/lib/schemas";

export function canEdit(album: AlbumDocument, clientId: string): boolean {
  const member = album.members.find((m) => m.clientId === clientId);
  return member?.role === "owner" || member?.role === "editor";
}

export function canManage(album: AlbumDocument, clientId: string): boolean {
  const member = album.members.find((m) => m.clientId === clientId);
  return member?.role === "owner";
}

export function getRole(album: AlbumDocument, clientId: string): Role | null {
  return album.members.find((m) => m.clientId === clientId)?.role ?? null;
}

export function isMember(album: AlbumDocument, clientId: string): boolean {
  return album.members.some((m) => m.clientId === clientId);
}

export function generateInviteToken(): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function generateInvitePassword(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${result.slice(0, 4)}-${result.slice(4)}`;
}

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return compare(password, hash);
}
