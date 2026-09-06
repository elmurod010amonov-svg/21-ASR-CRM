import express, { Request, Response } from 'express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
// Vite konvensiyasiga mos: .env (umumiy) + .env.local (shaxsiy, .gitignore'da bo'lishi kerak, ustunlik beradi)
dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });

// MONGODB va Port uchun to'g'ridan-to'g'ri zaxira qiymatlar (fallback)
process.env.MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
process.env.MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || "21asrcrm";
process.env.PORT = process.env.PORT || "3000";

import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import bcrypt from 'bcryptjs';
import { connectToMongo } from './src/db/mongoClient';
import { INITIAL_CLIENTS, INITIAL_EMPLOYEES } from './src/data/initialData';

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET || '';

app.use(express.json({ limit: '10mb' }));
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));

async function sendTelegramMessage(chatId: string | number, text: string) {
  if (!TELEGRAM_BOT_TOKEN) {
    return { ok: false, error: 'TELEGRAM_BOT_TOKEN not configured' };
  }

  const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    }),
  });

  return response.json();
}

// Lazy initialize Gemini client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    aiClient = new GoogleGenAI({
      apiKey: apiKey || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Gemini vaqti-vaqti bilan 503/UNAVAILABLE ("high demand") qaytaradi — bunday holatda
// kichik kutish (backoff) bilan bir necha marta qayta urinib ko'ramiz.
async function generateContentWithRetry(
  ai: GoogleGenAI,
  params: Parameters<GoogleGenAI['models']['generateContent']>[0],
  maxRetries = 3
): ReturnType<GoogleGenAI['models']['generateContent']> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await ai.models.generateContent(params);
    } catch (error: any) {
      const message = error?.message || String(error);
      const isOverloaded = message.includes('503') || message.includes('UNAVAILABLE') || message.includes('high demand');
      if (!isOverloaded || attempt >= maxRetries) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, 1000 * 2 ** attempt));
    }
  }
}

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    appName: '21-ASR CRM',
    timestamp: new Date().toISOString(),
    aiConfigured: !!process.env.GEMINI_API_KEY,
  });
});

// DB connectivity test endpoint
app.get('/api/db-test', async (req: Request, res: Response) => {
  try {
    const db = await connectToMongo();
    const result = await (db as any).command({ ping: 1 });
    return res.json({ ok: true, db: db.databaseName, ping: result });
  } catch (error: any) {
    console.error('DB test error:', error);
    return res.status(500).json({ ok: false, error: error?.message || String(error) });
  }
});

// ---------------------------------------------------------------------------
// CRM shared data — Mijozlar / Xodimlar / Kirish (Mongo bilan sinxronlash)
// ---------------------------------------------------------------------------

// Front-end butun massivni yuboradi (mavjud optimistik-yangilash arxitekturasi
// bilan mos) — bazadagi to'plam shu massiv bilan to'liq almashtiriladi.
async function replaceCollection(collectionName: string, docs: any[]) {
  const db = await connectToMongo();
  await db.collection(collectionName).deleteMany({});
  if (docs.length > 0) {
    await db.collection(collectionName).insertMany(docs);
  }
}

app.get('/api/clients', async (req: Request, res: Response) => {
  try {
    const db = await connectToMongo();
    const clients = await db.collection('clients').find({}, { projection: { _id: 0 } }).toArray();
    return res.json(clients);
  } catch (error: any) {
    console.error('GET /api/clients error:', error);
    return res.status(503).json({ error: 'Baza vaqtincha ishlamayapti' });
  }
});

app.put('/api/clients', async (req: Request, res: Response) => {
  try {
    const clients = req.body;
    if (!Array.isArray(clients)) {
      return res.status(400).json({ error: 'Massiv (array) kutilgan' });
    }
    await replaceCollection('clients', clients);
    return res.json({ ok: true, count: clients.length });
  } catch (error: any) {
    console.error('PUT /api/clients error:', error);
    return res.status(503).json({ error: 'Baza vaqtincha ishlamayapti' });
  }
});

app.get('/api/employees', async (req: Request, res: Response) => {
  try {
    const db = await connectToMongo();
    const employees = await db.collection('employees').find({}, { projection: { _id: 0 } }).toArray();
    return res.json(employees);
  } catch (error: any) {
    console.error('GET /api/employees error:', error);
    return res.status(503).json({ error: 'Baza vaqtincha ishlamayapti' });
  }
});

app.put('/api/employees', async (req: Request, res: Response) => {
  try {
    const employees = req.body;
    if (!Array.isArray(employees)) {
      return res.status(400).json({ error: 'Massiv (array) kutilgan' });
    }
    await replaceCollection('employees', employees);
    return res.json({ ok: true, count: employees.length });
  } catch (error: any) {
    console.error('PUT /api/employees error:', error);
    return res.status(503).json({ error: 'Baza vaqtincha ishlamayapti' });
  }
});

// Login uchun mijoz kiritgan identifikator (id, email, telefon yoki ism) bo'yicha
// moslashuvchan qidiruv — frontend'dagi eski loginUser() mantig'i bilan bir xil.
function findEmployeeByIdentifier(employees: any[], identifier: string) {
  const normalizedIdentifier = identifier.trim().toLowerCase();
  const normalizedPhone = (value: string) => value.replace(/\D/g, '');
  const compactName = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');
  const adminAliases = new Set(['emp-1', 'admin', 'superadmin', 'super admin', 'super-admin']);

  return employees.find((e) => {
    if (adminAliases.has(normalizedIdentifier) && e.id === 'emp-1') return true;
    const idMatch = String(e.id || '').toLowerCase() === normalizedIdentifier;
    const emailMatch = String(e.email || '').toLowerCase() === normalizedIdentifier;
    const phoneMatch = normalizedPhone(String(e.phone || '')) === normalizedPhone(identifier.trim());
    const nameMatch = compactName(String(e.name || '')) === compactName(normalizedIdentifier);
    return idMatch || emailMatch || phoneMatch || nameMatch;
  });
}

app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { identifier, password } = req.body || {};
    if (!identifier || !password) {
      return res.status(400).json({ error: 'Login va parol kiritilishi shart' });
    }
    const db = await connectToMongo();
    const employees = await db.collection('employees').find({}, { projection: { _id: 0 } }).toArray();
    const target = findEmployeeByIdentifier(employees, String(identifier));
    if (!target) {
      return res.status(401).json({ error: 'Foydalanuvchi topilmadi' });
    }
    const cred = await db.collection('credentials').findOne({ employeeId: target.id });
    if (!cred || !(await bcrypt.compare(String(password), cred.passwordHash))) {
      return res.status(401).json({ error: "Noto'g'ri login yoki parol" });
    }
    return res.json(target);
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(503).json({ error: 'Kirish xizmati vaqtincha ishlamayapti' });
  }
});

app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { employeeId, password } = req.body || {};
    if (!employeeId || !password) {
      return res.status(400).json({ error: 'employeeId va password kiritilishi shart' });
    }
    const db = await connectToMongo();
    const passwordHash = await bcrypt.hash(String(password), 10);
    await db.collection('credentials').updateOne(
      { employeeId },
      { $set: { employeeId, passwordHash } },
      { upsert: true }
    );
    return res.json({ ok: true });
  } catch (error: any) {
    console.error('Register error:', error);
    return res.status(503).json({ error: 'Parolni saqlashda xatolik' });
  }
});

app.post('/api/telegram/send', async (req: Request, res: Response) => {
  try {
    const { chatId, text } = req.body || {};
    if (!chatId || !text) {
      return res.status(400).json({ error: 'chatId va text kerak' });
    }

    const result = await sendTelegramMessage(chatId, String(text));
    return res.json(result);
  } catch (error: any) {
    console.error('Telegram send error:', error);
    return res.status(500).json({ error: error?.message || 'Telegram xabari yuborishda xatolik' });
  }
});

app.post('/api/telegram/webhook', async (req: Request, res: Response) => {
  try {
    const secret = req.headers['x-telegram-bot-api-secret-token'];
    if (TELEGRAM_WEBHOOK_SECRET && secret !== TELEGRAM_WEBHOOK_SECRET) {
      return res.status(401).json({ ok: false, error: 'Telegram webhook secret mismatch' });
    }

    const update = req.body;
    const message = update?.message;
    const chatId = message?.chat?.id;
    const text = message?.text || '';

    if (!chatId || !text) {
      return res.json({ ok: true, received: false });
    }

    const helpText = [
      '<b>21-ASR CRM Telegram bot</b>',
      '',
      'Mavjud buyruqlar:',
      '/start - boshlash',
      '/status - CRM holati',
      '/help - yordam',
      '',
      'Bot CRM uchun ogohlantirishlar, vazifa xabarlari va AI javoblarini yuboradi.',
    ].join('\n');

    const replyText = text.toLowerCase() === '/start'
      ? helpText
      : text.toLowerCase() === '/status'
        ? 'CRM status: <b>faol</b>\nAI xizmatlari: tayyor\n1C / Didox / Telegram integratsiyasi tayyorlash bosqichi.'
        : text.toLowerCase() === '/help'
          ? helpText
          : `Qabul qilindi: ${text}\n\nCRMda bu so'rovni qayta ishlash uchun admin panelda integratsiya nuqtalarini tekshiring.`;

    await sendTelegramMessage(chatId, replyText);
    return res.json({ ok: true, processed: true });
  } catch (error: any) {
    console.error('Telegram webhook error:', error);
    return res.status(500).json({ ok: false, error: error?.message || 'Webhook xatolik' });
  }
});

app.get('/api/telegram/set-webhook', async (req: Request, res: Response) => {
  try {
    const botUrl = process.env.TELEGRAM_APP_URL || process.env.APP_URL || 'http://localhost:3000';
    const webhookUrl = `${botUrl}/api/telegram/webhook`;

    if (!TELEGRAM_BOT_TOKEN) {
      return res.status(400).json({ error: 'TELEGRAM_BOT_TOKEN missing' });
    }

    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: webhookUrl,
        secret_token: TELEGRAM_WEBHOOK_SECRET || undefined,
      }),
    });

    const data = await response.json();
    return res.json({ ok: data.ok, result: data.result, webhookUrl });
  } catch (error: any) {
    console.error('Telegram setWebhook error:', error);
    return res.status(500).json({ error: error?.message || 'Webhook o‘rnatishda xatolik' });
  }
});

// AI Assistant Chat Endpoint
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  try {
    const { prompt, systemContext, agentRole, userRole, userName } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt kiritilmadi' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json({
        text: `[21-ASR AI Maslahatchi (${agentRole || 'Umumiy'} agent)]:

Sizning so'rovingiz qabul qilindi: "${prompt}".
Tizim ma'lumotlari tahlil qilindi:
- Joriy davr: Avgust 2026
- Xodim: ${userName || 'Foydalanuvchi'} (${userRole || 'Buxgalter'})
- Taklif: CRM dagi barcha hisobot va xatlarni qulay nazorat qilish uchun tegishli modul sahifasini tekshiring.`,
        suggestedAction: null,
      });
    }

    const ai = getGeminiClient();

    const baseSystemPrompt = `Siz O'zbekistondagi buxgalteriya va soliq konsaltingi bo'yicha ixtisoslashgan "21-ASR CRM" tizimining professional AI Maslahatchisisiz.
Siz o'zbek tilida (lotin yozuvida) juda aniq, do'stona, professional va buxgalteriya terminologiyasini (STIR, QQS, Aylanma soliq, JSHDS, INPS, Oborotka, Kameral, Faktura, 1C) to'liq tushungan holda javob berasiz.

Javob berish qoidalari (MAJBURIY):
- Avval savolni diqqat bilan tahlil qiling va aynan nima so'ralganini aniqlang; faqat o'sha savolga javob bering.
- To'g'ridan-to'g'ri javob bilan boshlang. "Assalomu alaykum", "Ajoyib savol" kabi kirish gaplarisiz, zarurat bo'lmasa xayrlashuv yoki qo'shimcha taklif bilan tugatmasdan.
- Mavzudan chetga chiqmang, umumiy va mavhum ("odatda", "ehtimol", "tavsiya etiladi" kabi) gaplar bilan chalg'itmang — CRM konteksti va savolga tayangan holda aniq, dalilga asoslangan javob bering.
- Agar savolga javob berish uchun aniq ma'lumot (raqam, sana, mijoz nomi) CRM kontekstida bo'lsa, uni aniq keltiring; taxmin qilmang. Ma'lumot yetarli bo'lmasa, shuni ochiq ayting va aynan qaysi ma'lumot kerakligini so'rang — umumiy gap bilan o'ralashtirmang.
- Javobni kerak bo'lgan uzunlikda bering: qisqa savolga qisqa va lo'nda, murakkab tahlil talab qiladigan savolga esa tuzilgan (band-band) va aniq javob bering. Ortiqcha so'z, takror yoki "yopiq" umumiy xulosalardan saqlaning.

Joriy foydalanuvchi: ${userName || 'Xodim'} (Roli: ${userRole || 'BUXGALTER'})
Tanlangan ixtisoslashgan agent: ${agentRole || 'Umumiy Maslahatchi'}

CRM Baza konteksti:
${systemContext || 'CRM konteksti yuklanmagan'}`;

    const response = await generateContentWithRetry(ai, {
      model: 'gemini-flash-lite-latest',
      contents: prompt,
      config: {
        systemInstruction: baseSystemPrompt,
        temperature: 0.2,
      },
    });

    const responseText = response.text || "Kechirasiz, ma'lumotni tahlil qilishda xatolik yuz berdi.";
    return res.json({ text: responseText });
  } catch (error: any) {
    console.error('Gemini AI error:', error);
    return res.status(500).json({
      error: 'AI xizmatida xatolik yuz berdi',
      details: error?.message || String(error),
    });
  }
});

// AI Chat Analysis for Super Admin
app.post('/api/ai/analyze-chats', async (req: Request, res: Response) => {
  try {
    const { chatLogs, query } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return res.json({
        analysis: `Xodimlar chatlari tahlili:
- Kameral tekshiruvlar bo'yicha savollar mavjud.
- 1C va Fakturalar holati nazoratda.`,
      });
    }

    const ai = getGeminiClient();
    const prompt = `Super Admin uchun xodimlar chatlarini tahlil qilib xulosa ber:
So'rov: ${query || 'Bugungi muhim muammolar va kameral xabarlar'}
Chat yozishmalari:
${JSON.stringify(chatLogs || [])}`;

    const response = await generateContentWithRetry(ai, {
      model: 'gemini-flash-lite-latest',
      contents: prompt,
      config: {
        systemInstruction: "Siz 21-ASR CRM Super Admini uchun chat monitoringi va xavfsizlik tahlilchisisiz.",
        temperature: 0.2,
      },
    });

    return res.json({ analysis: response.text });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Chat tahlilida xatolik' });
  }
});

async function seedInitialDataIfEmpty() {
  const db = await connectToMongo();

  const clientsCount = await db.collection('clients').countDocuments();
  if (clientsCount === 0 && INITIAL_CLIENTS.length > 0) {
    await db.collection('clients').insertMany(INITIAL_CLIENTS as any[]);
    console.log(`🌱 ${INITIAL_CLIENTS.length} ta boshlang'ich mijoz bazaga yuklandi`);
  }

  const employeesCount = await db.collection('employees').countDocuments();
  if (employeesCount === 0) {
    await db.collection('employees').insertMany(INITIAL_EMPLOYEES as any[]);
    console.log(`🌱 ${INITIAL_EMPLOYEES.length} ta boshlang'ich xodim bazaga yuklandi`);
  }

  const credCount = await db.collection('credentials').countDocuments();
  if (credCount === 0) {
    const initialPassword = process.env.SUPER_ADMIN_INITIAL_PASSWORD || 'ChangeMe123!';
    const passwordHash = await bcrypt.hash(initialPassword, 10);
    await db.collection('credentials').insertOne({ employeeId: 'emp-1', passwordHash });
    console.log(
      `⚠️  SUPER_ADMIN (emp-1) uchun boshlang'ich parol o'rnatildi${
        process.env.SUPER_ADMIN_INITIAL_PASSWORD ? '' : " (standart: 'ChangeMe123!')"
      } — tizimga kirib, Sozlamalar orqali darhol almashtiring.`
    );
  }
}

async function startServer() {
  try {
    await connectToMongo();
    console.log('✅ MongoDB connected successfully');
    await seedInitialDataIfEmpty();
  } catch (err: any) {
    console.error('❌ MongoDB connection failed:', err?.message || err);
    console.log('⚠️  Server will start without MongoDB connection');
  }

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`21-ASR CRM Server running on port ${PORT}`);
  });
}

startServer();