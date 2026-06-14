import { type Collection, MongoClient } from "mongodb";
import type { AlbumDocument } from "src/lib/schemas";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

if (!uri) {
  throw new Error("MONGODB_URI environment variable is not set");
}

if (!dbName) {
  throw new Error("MONGODB_DB environment variable is not set");
}

const globalForMongo = globalThis as unknown as {
  mongoClient?: MongoClient;
};

export const client = globalForMongo.mongoClient ?? new MongoClient(uri);

if (process.env.NODE_ENV !== "production") {
  globalForMongo.mongoClient = client;
}

export async function getDb() {
  return client.db(dbName);
}

export async function getAlbumsCollection(): Promise<
  Collection<AlbumDocument>
> {
  const db = await getDb();
  return db.collection<AlbumDocument>("albums");
}
