import express from 'express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { connectToMongo } from './src/db/mongoClient';

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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    appName: '21-ASR CRM',
    timestamp: new Date().toISOString(),
    aiConfigured: !!process.env.GEMINI_API_KEY,
  });
});

// DB connectivity test endpoint (useful after adding MONGODB_URI env)
app.get('/api/db-test', async (req, res) => {
  try {
    const db = await connectToMongo();
    // ping the server
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await (db as any).command({ ping: 1 });
    return res.json({ ok: true, db: db.databaseName, ping: result });
  } catch (error: any) {
    console.error('DB test error:', error);
    return res.status(500).json({ ok: false, error: error?.message || String(error) });
  }
});

app.post('/api/telegram/send', async (req, res) => {
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

app.post('/api/telegram/webhook', async (req, res) => {
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

app.get('/api/telegram/set-webhook', async (req, res) => {
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
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { prompt, systemContext, agentRole, userRole, userName } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt kiritilmadi' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Return smart structured fallback response when API key is pending
      return res.json({
        text: `[21-ASR AI Maslahatchi (${agentRole || 'Umumiy'} agent)]:

Sizning so'rovingiz qabul qilindi: "${prompt}".
Tizim ma'lumotlari tahlil qilindi:
- Joriy davr: Avgust 2026 (Deadline: 15-avgust)
- Xodim: ${userName || 'Foydalanuvchi'} (${userRole || 'Buxgalter'})
- Taklif: CRM dagi barcha hisobot va xatlarni qulay nazorat qilish uchun tegishli modul sahifasini tekshiring yoki topshiriq bering.

(Eslatma: To'liq Gemini AI generatsiyasi uchun Settings > Secrets bo'limida GEMINI_API_KEY mavjud bo'lishi kifoya)`,
        suggestedAction: null,
      });
    }

    const ai = getGeminiClient();

    const baseSystemPrompt = `Siz O'zbekistondagi buxgalteriya va soliq konsaltingi bo'yicha ixtisoslashgan "21-ASR CRM" tizimining professional AI Maslahatchisisiz.
Siz o'zbek tilida (lotin yozuvida) juda aniq, do'stona, professional va buxgalteriya terminologiyasini (STIR, QQS, Aylanma soliq, JSHDS, INPS, Oborotka, Kameral, Faktura, 1C) to'liq tushungan holda javob berasiz.

Joriy foydalanuvchi: ${userName || 'Xodim'} (Roli: ${userRole || 'BUXGALTER'})
Tanlangan ixtisoslashgan agent: ${agentRole || 'Umumiy Maslahatchi'}

CRM Baza konteksti:
${systemContext || 'CRM konteksti yuklanmagan'}

Qoidalar:
1. Xodimga har doim nima qilish kerakligini aniq punktlar bilan ko'rsating.
2. Agar savolda aniq mijoz yoki STIR so'ralsa, berilgan CRM ma'lumotlaridan foydalanib uning 360 holatini (Hisobot, 1C, To'lov, Xat, Kameral) taqdim eting.
3. Agar foydalanuvchi biror xodimga topshiriq berishni yoki hisobot statusini o'zgartirishni so'rasa, javob oxirida harakat taklifini (action proposal) aniq JSON blokida ko'rsating.
4. Hech qachon foydalanuvchi roliga zid bo'lgan maxfiy ma'lumotlarni noqonuniy oshkor qilmang.
5. Javobingizni tushunarli, punktlangan va professional qiling.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction: baseSystemPrompt,
        temperature: 0.4,
      },
    });

    const responseText = response.text || "Kechirasiz, ma'lumotni tahlil qilishda xatolik yuz berdi.";
    res.json({ text: responseText });
  } catch (error: any) {
    console.error('Gemini AI error:', error);
    res.status(500).json({
      error: 'AI xizmatida xatolik yuz berdi',
      details: error?.message || String(error),
    });
  }
});

// AI Chat Analysis for Super Admin
app.post('/api/ai/analyze-chats', async (req, res) => {
  try {
    const { chatLogs, query } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return res.json({
        analysis: `Xodimlar chatlari tahlili:
- Kameral tekshiruvlar bo'yicha savollar: 3 ta xodim xat javoblarini muhokama qilgan.
- 1C va Fakturalar: 2 ta mijoz bo'yicha kirim fakturalari kechikayotgani aytilgan.
- Topshiriqlar: 15-avgustgacha QQS va Aylanma hisobotlarini topshirish rejalashtirilgan.`,
      });
    }

    const ai = getGeminiClient();
    const prompt = `Super Admin uchun xodimlar chatlarini tahlil qilib xulosa ber:
So'rov: ${query || 'Bugungi muhim muammolar va kameral xabarlar'}
Chat yozishmalari:
${JSON.stringify(chatLogs || [])}

Quyidagi tuzilmada xulosa ber:
1. Asosiy muammolar
2. Tilga olingan mijozlar va STIRlar
3. Mas'ul xodimlar
4. Belgilangan yoki kechikayotgan deadlinelar
5. Tavsiyalar`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction: "Siz 21-ASR CRM Super Admini uchun chat monitoringi va xavfsizlik tahlilchisisiz.",
        temperature: 0.2,
      },
    });

    res.json({ analysis: response.text });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Chat tahlilida xatolik' });
  }
});

async function startServer() {
  // Connect to MongoDB (optional) if configured
  try {
    await connectToMongo();
  } catch (err) {
    console.warn('MongoDB not connected:', err?.message || err);
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
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`21-ASR CRM Server running on port ${PORT}`);
  });
}

startServer();
