import { ObjectId } from "mongodb";
import { loadAlbumCatalog } from "src/lib/catalog";
import { getAlbumsCollection } from "src/lib/db/client";
import {
  canEdit,
  canManage,
  generateInvitePassword,
  generateInviteToken,
  getRole,
  hashPassword,
  isMember,
  verifyPassword,
} from "src/lib/permissions";
import {
  type AlbumDetail,
  type AlbumDocument,
  type AlbumSummary,
  albumDetailSchema,
  albumSummarySchema,
  type CreateAlbumInput,
  type CreateInviteInput,
  type InviteOutput,
  type RenameAlbumInput,
  type StickerOperation,
  type SyncResponse,
} from "src/lib/schemas";

function serializeId(id: ObjectId): string {
  return id.toHexString();
}

function toISODate(date: Date): string {
  return date.toISOString();
}

function computeCountsSummary(
  counts: Record<string, number>,
  totalStickers: number,
) {
  let ownedCount = 0;
  let missingCount = 0;
  let duplicateCount = 0;

  for (const code in counts) {
    const quantity = counts[code] ?? 0;
    if (quantity === 0) missingCount++;
    else if (quantity === 1) ownedCount++;
    else {
      ownedCount++;
      duplicateCount += quantity - 1;
    }
  }

  missingCount += totalStickers - Object.keys(counts).length;

  return { ownedCount, missingCount, duplicateCount };
}

export async function createAlbum(
  input: CreateAlbumInput,
  ownerClientId: string,
): Promise<AlbumSummary> {
  const catalog = await loadAlbumCatalog(input.albumType);
  const now = new Date();

  const doc: Omit<AlbumDocument, "_id"> = {
    nickname: input.nickname,
    albumType: input.albumType,
    ownerClientId,
    members: [{ clientId: ownerClientId, role: "owner" }],
    invites: [],
    counts: {},
    updatedAt: now,
    createdAt: now,
  };

  const collection = await getAlbumsCollection();
  const result = await collection.insertOne(doc as AlbumDocument);

  return albumSummarySchema.parse({
    id: serializeId(result.insertedId),
    nickname: doc.nickname,
    albumType: doc.albumType,
    role: "owner",
    isOwned: true,
    ownerClientId,
    totalStickers: catalog.stickers.length,
    ownedCount: 0,
    missingCount: catalog.stickers.length,
    duplicateCount: 0,
    updatedAt: toISODate(now),
  });
}

export async function listAlbumsForClient(clientId: string): Promise<{
  owned: AlbumSummary[];
  shared: AlbumSummary[];
}> {
  const collection = await getAlbumsCollection();
  const docs = await collection
    .find({
      $or: [{ ownerClientId: clientId }, { "members.clientId": clientId }],
    })
    .sort({ updatedAt: -1 })
    .toArray();

  const owned: AlbumSummary[] = [];
  const shared: AlbumSummary[] = [];

  for (const doc of docs) {
    const catalog = await loadAlbumCatalog(doc.albumType);
    const role = getRole(doc, clientId) ?? "viewer";
    const isOwned = doc.ownerClientId === clientId;
    const summary = albumSummarySchema.parse({
      id: serializeId(doc._id),
      nickname: doc.nickname,
      albumType: doc.albumType,
      role,
      isOwned,
      ownerClientId: doc.ownerClientId,
      totalStickers: catalog.stickers.length,
      ...computeCountsSummary(doc.counts, catalog.stickers.length),
      updatedAt: toISODate(doc.updatedAt),
    });

    if (isOwned) {
      owned.push(summary);
    } else {
      shared.push(summary);
    }
  }

  return { owned, shared };
}

export async function getAlbum(
  id: string,
  clientId: string,
): Promise<AlbumDetail | null> {
  if (!ObjectId.isValid(id)) return null;

  const collection = await getAlbumsCollection();
  const doc = await collection.findOne({ _id: new ObjectId(id) });

  if (!doc || !isMember(doc, clientId)) return null;

  const catalog = await loadAlbumCatalog(doc.albumType);
  const role = getRole(doc, clientId) ?? "viewer";

  return albumDetailSchema.parse({
    id: serializeId(doc._id),
    nickname: doc.nickname,
    albumType: doc.albumType,
    role,
    isOwned: doc.ownerClientId === clientId,
    ownerClientId: doc.ownerClientId,
    members: doc.members.map((m) => ({
      clientId: m.clientId,
      role: m.role,
    })),
    catalog,
    counts: doc.counts,
    updatedAt: toISODate(doc.updatedAt),
  });
}

export async function applyStickerOperation(
  id: string,
  clientId: string,
  operation: StickerOperation,
): Promise<{ quantity: number } | null> {
  if (!ObjectId.isValid(id)) return null;

  const collection = await getAlbumsCollection();
  const doc = await collection.findOne({ _id: new ObjectId(id) });

  if (!doc || !canEdit(doc, clientId)) return null;

  const field = `counts.${operation.stickerCode}`;
  const delta = operation.operation === "increment" ? 1 : -1;
  const now = new Date();

  const update =
    delta > 0
      ? { $inc: { [field]: delta }, $set: { updatedAt: now } }
      : {
          $inc: { [field]: delta },
          $set: { updatedAt: now },
          $max: { [field]: 0 },
        };

  const updated = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    update,
    { returnDocument: "after" },
  );

  if (!updated) return null;

  return { quantity: updated.counts[operation.stickerCode] ?? 0 };
}

export async function syncAlbum(
  id: string,
  clientId: string,
  since: string,
): Promise<SyncResponse | null> {
  if (!ObjectId.isValid(id)) return null;

  const sinceDate = new Date(since);
  const collection = await getAlbumsCollection();
  const doc = await collection.findOne({ _id: new ObjectId(id) });

  if (!doc || !isMember(doc, clientId)) return null;

  const changedCounts: Record<string, number> = {};

  if (doc.updatedAt > sinceDate) {
    for (const [code, quantity] of Object.entries(doc.counts)) {
      if (quantity > 0) {
        changedCounts[code] = quantity;
      }
    }
  }

  return {
    updatedAt: toISODate(doc.updatedAt),
    changedCounts,
  };
}

export async function createOrRegenerateInvite(
  id: string,
  clientId: string,
  input: CreateInviteInput,
): Promise<InviteOutput | null> {
  if (!ObjectId.isValid(id)) return null;

  const collection = await getAlbumsCollection();
  const doc = await collection.findOne({ _id: new ObjectId(id) });

  if (!doc || !canManage(doc, clientId)) return null;

  const password = generateInvitePassword();
  const passwordHash = await hashPassword(password);
  const token = generateInviteToken();
  const now = new Date();

  await collection.updateOne(
    { _id: new ObjectId(id) },
    {
      $pull: { invites: { role: input.role } },
    },
  );

  await collection.updateOne(
    { _id: new ObjectId(id) },
    {
      $push: {
        invites: {
          token,
          passwordHash,
          role: input.role,
        },
      },
      $set: { updatedAt: now },
    },
  );

  return {
    token,
    role: input.role,
    password,
  };
}

export async function joinInvite(
  token: string,
  password: string,
  clientId: string,
): Promise<{ id: string } | null> {
  const collection = await getAlbumsCollection();
  const doc = await collection.findOne({
    "invites.token": token,
  });

  if (!doc) return null;

  const invite = doc.invites.find((i) => i.token === token);
  if (!invite) return null;

  const valid = await verifyPassword(password, invite.passwordHash);
  if (!valid) return null;

  if (isMember(doc, clientId)) {
    return { id: serializeId(doc._id) };
  }

  const now = new Date();
  await collection.updateOne(
    { _id: doc._id },
    {
      $push: {
        members: {
          clientId,
          role: invite.role,
        },
      },
      $set: { updatedAt: now },
    },
  );

  return { id: serializeId(doc._id) };
}

export async function renameAlbum(
  id: string,
  clientId: string,
  input: RenameAlbumInput,
): Promise<AlbumSummary | null> {
  if (!ObjectId.isValid(id)) return null;

  const collection = await getAlbumsCollection();
  const doc = await collection.findOne({ _id: new ObjectId(id) });

  if (!doc || !canManage(doc, clientId)) return null;

  const now = new Date();
  const updated = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { nickname: input.nickname, updatedAt: now } },
    { returnDocument: "after" },
  );

  if (!updated) return null;

  const catalog = await loadAlbumCatalog(updated.albumType);
  return albumSummarySchema.parse({
    id: serializeId(updated._id),
    nickname: updated.nickname,
    albumType: updated.albumType,
    role: "owner",
    isOwned: true,
    ownerClientId: updated.ownerClientId,
    totalStickers: catalog.stickers.length,
    ...computeCountsSummary(updated.counts, catalog.stickers.length),
    updatedAt: toISODate(updated.updatedAt),
  });
}

export async function deleteAlbum(
  id: string,
  clientId: string,
): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;

  const collection = await getAlbumsCollection();
  const doc = await collection.findOne({ _id: new ObjectId(id) });

  if (!doc || !canManage(doc, clientId)) return false;

  await collection.deleteOne({ _id: new ObjectId(id) });
  return true;
}
