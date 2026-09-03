import express, { Request, Response } from 'express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

// MONGODB va Port uchun to'g'ridan-to'g'ri zaxira qiymatlar (fallback)
process.env.MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
process.env.MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || "21asrcrm";
process.env.PORT = process.env.PORT || "3000";

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

Joriy foydalanuvchi: ${userName || 'Xodim'} (Roli: ${userRole || 'BUXGALTER'})
Tanlangan ixtisoslashgan agent: ${agentRole || 'Umumiy Maslahatchi'}

CRM Baza konteksti:
${systemContext || 'CRM konteksti yuklanmagan'}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: baseSystemPrompt,
        temperature: 0.4,
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

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
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

async function startServer() {
  try {
    await connectToMongo();
    console.log('✅ MongoDB connected successfully');
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