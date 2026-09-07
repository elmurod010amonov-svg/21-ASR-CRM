import { MongoClient, Db, MongoClientOptions } from 'mongodb';

let client: MongoClient | null = null;
let db: Db | null = null;
let connectingPromise: Promise<Db> | null = null;

// Aniq timeout'lar bo'lmasa, ulanish "qotib qolganda" (masalan Render bepul
// tarifi uzoq vaqt harakatsizlikdan keyin tarmoq ulanishini sezdirmasdan
// uzib qo'ysa) so'rovlar ABADIY osilib qolishi mumkin edi — endi belgilangan
// vaqtdan keyin xato qaytaradi, shu orqali "baza qotib qoldi" holatidan
// chiqib, keyingi urinishda qayta ulanadi.
const CLIENT_OPTIONS: MongoClientOptions = {
  serverSelectionTimeoutMS: 8000,
  socketTimeoutMS: 20000,
  connectTimeoutMS: 8000,
  maxIdleTimeMS: 60000,
};

async function createConnection(mongoUri: string, name: string): Promise<Db> {
  const newClient = new MongoClient(mongoUri, CLIENT_OPTIONS);
  await newClient.connect();
  client = newClient;
  db = newClient.db(name);
  console.log(`MongoDB connected to ${name}`);
  return db;
}

export async function connectToMongo(uri?: string, dbName?: string): Promise<Db> {
  if (db) return db;
  if (connectingPromise) return connectingPromise;

  const mongoUri = uri || process.env.MONGODB_URI;
  const name = dbName || process.env.MONGODB_DB_NAME || '21asrcrm';
  if (!mongoUri) {
    throw new Error('MONGODB_URI not configured');
  }

  connectingPromise = createConnection(mongoUri, name).finally(() => {
    connectingPromise = null;
  });
  return connectingPromise;
}

// Biror so'rov Mongo bilan ishlashda xato bersa (masalan ulanish qotib
// qolgani sababli), chaqiruvchi shuni chaqirib eskirgan ulanishni tashlab
// yuboradi — shu orqali keyingi so'rov yangi ulanish yaratadi, server
// qayta ishga tushirilishini kutish shart bo'lmaydi.
export function resetMongoConnection() {
  const oldClient = client;
  client = null;
  db = null;
  connectingPromise = null;
  if (oldClient) {
    oldClient.close().catch(() => {});
  }
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
