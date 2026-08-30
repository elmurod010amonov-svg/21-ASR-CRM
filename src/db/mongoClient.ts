import { MongoClient, Db } from 'mongodb';

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectToMongo(uri?: string, dbName?: string): Promise<Db> {
  if (db) return db;
  const mongoUri = uri || process.env.MONGODB_URI;
  const name = dbName || process.env.MONGODB_DB_NAME || '21asrcrm';
  if (!mongoUri) {
    throw new Error('MONGODB_URI not configured');
  }

  client = new MongoClient(mongoUri);
  await client.connect();
  db = client.db(name);
  console.log(`MongoDB connected to ${name}`);
  return db;
}

export function getDb(): Db {
  if (!db) throw new Error('MongoDB not connected');
  return db;
}

export async function closeMongo() {
  if (!client) return;
  await client.close();
  client = null;
  db = null;
}
