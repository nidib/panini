import { ObjectId } from "mongodb";
import { z } from "zod";

export const roleSchema = z.enum(["owner", "editor", "viewer"]);

export type Role = z.infer<typeof roleSchema>;

export const stickerDefinitionSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  team: z.string().min(1),
});

export type StickerDefinition = z.infer<typeof stickerDefinitionSchema>;

export const albumCatalogSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  stickers: z.array(stickerDefinitionSchema),
});

export type AlbumCatalog = z.infer<typeof albumCatalogSchema>;

export const memberSchema = z.object({
  clientId: z.string().uuid(),
  role: roleSchema,
});

export type Member = z.infer<typeof memberSchema>;

export const inviteSchema = z.object({
  token: z.string().min(1),
  passwordHash: z.string().min(1),
  role: z.enum(["editor", "viewer"]),
});

export type Invite = z.infer<typeof inviteSchema>;

export const albumDocumentSchema = z.object({
  _id: z.instanceof(ObjectId),
  nickname: z.string().min(1),
  albumType: z.string().min(1),
  ownerClientId: z.string().uuid(),
  members: z.array(memberSchema),
  invites: z.array(inviteSchema),
  counts: z.record(z.string(), z.number().int().min(0).default(0)),
  updatedAt: z.date(),
  createdAt: z.date(),
});

export type AlbumDocument = z.infer<typeof albumDocumentSchema>;

export const createAlbumInputSchema = z.object({
  nickname: z.string().min(1).max(100),
  albumType: z.literal("wc2026"),
});

export type CreateAlbumInput = z.infer<typeof createAlbumInputSchema>;

export const stickerOperationSchema = z.object({
  operation: z.enum(["increment", "decrement"]),
  stickerCode: z.string().min(1),
});

export type StickerOperation = z.infer<typeof stickerOperationSchema>;

export const syncQuerySchema = z.object({
  since: z.string().datetime(),
});

export type SyncQuery = z.infer<typeof syncQuerySchema>;

export const syncResponseSchema = z.object({
  updatedAt: z.string().datetime(),
  changedCounts: z.record(z.string(), z.number().int().min(0)),
});

export type SyncResponse = z.infer<typeof syncResponseSchema>;

export const joinInviteInputSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(3).max(30),
});

export type JoinInviteInput = z.infer<typeof joinInviteInputSchema>;

export const inviteOutputSchema = z.object({
  token: z.string(),
  role: z.enum(["editor", "viewer"]),
  password: z.string(),
});

export type InviteOutput = z.infer<typeof inviteOutputSchema>;

export const albumSummarySchema = z.object({
  id: z.string(),
  nickname: z.string(),
  albumType: z.string(),
  role: roleSchema,
  isOwned: z.boolean(),
  ownerClientId: z.string().uuid(),
  totalStickers: z.number().int(),
  ownedCount: z.number().int(),
  missingCount: z.number().int(),
  duplicateCount: z.number().int(),
  updatedAt: z.string().datetime(),
});

export type AlbumSummary = z.infer<typeof albumSummarySchema>;

export const albumDetailSchema = z.object({
  id: z.string(),
  nickname: z.string(),
  albumType: z.string(),
  role: roleSchema,
  isOwned: z.boolean(),
  ownerClientId: z.string().uuid(),
  members: z.array(
    z.object({
      clientId: z.string().uuid(),
      role: roleSchema,
    }),
  ),
  catalog: albumCatalogSchema,
  counts: z.record(z.string(), z.number().int().min(0)),
  updatedAt: z.string().datetime(),
});

export type AlbumDetail = z.infer<typeof albumDetailSchema>;

export const renameAlbumInputSchema = z.object({
  nickname: z.string().min(1).max(100),
});

export type RenameAlbumInput = z.infer<typeof renameAlbumInputSchema>;

export const createInviteInputSchema = z.object({
  role: z.enum(["editor", "viewer"]),
});

export type CreateInviteInput = z.infer<typeof createInviteInputSchema>;

export const clientIdSchema = z.string().uuid();
