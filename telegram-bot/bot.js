/**
 * Nexsora Official Telegram Verification & Notification Bot (@NexsoraOPT_bot)
 * Runs standalone with Node.js long-polling.
 */

import fs from 'fs';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SUBSCRIBERS_FILE = path.join(__dirname, '../public/telegram-subscribers.json');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8881393508:AAGM2zhdst1GLFNfplK2NuUfgNsWgKh43Ko';
const API_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

// In-memory OTP storage mapping: phone -> { code, expiresAt, chatId }
const otpStore = new Map();
// Mapping: chatId -> phone
const userPhoneMap = new Map();
// Mapping: chatId -> role ('craftsman' | 'client')
const userRoleMap = new Map();

// Helper to read subscribers file
function getSubscribers() {
  try {
    if (fs.existsSync(SUBSCRIBERS_FILE)) {
      const data = fs.readFileSync(SUBSCRIBERS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error reading subscribers file:', e.message);
  }
  return { craftsmen: [], clients: [] };
}

// Helper to save subscribers file
function saveSubscriber(chatId, role, name, specialties = []) {
  try {
    const subs = getSubscribers();
    const strId = String(chatId).trim();
    
    if (role === 'craftsman') {
      // Remove from clients if exists
      subs.clients = (subs.clients || []).filter(c => String(c.chatId) !== strId);
      // Upsert into craftsmen
      const existingIdx = (subs.craftsmens || subs.craftsmen || []).findIndex(c => String(c.chatId) !== strId ? false : true);
      const defaultSpecs = ['Santexnik', 'Santexnika', 'Elektrik', 'Elektr', 'Pardozlash', 'Qurilish', 'Mebel', 'Konditsioner', 'Tozalash', 'Texnika', 'Barchasi'];
      const finalSpecs = specialties.length > 0 ? specialties : defaultSpecs;
      
      const craftsmanObj = {
        chatId: strId,
        name: name || 'Usta',
        role: 'craftsman',
        specialties: finalSpecs,
        updatedAt: new Date().toISOString()
      };

      if (!subs.craftsmen) subs.craftsmen = [];
      if (existingIdx >= 0) {
        subs.craftsmen[existingIdx] = craftsmanObj;
      } else {
        subs.craftsmen.push(craftsmanObj);
      }
    } else if (role === 'client') {
      // Remove from craftsmen if exists
      subs.craftsmen = (subs.craftsmen || []).filter(c => String(c.chatId) !== strId);
      // Upsert into clients
      if (!subs.clients) subs.clients = [];
      const existingIdx = subs.clients.findIndex(c => String(c.chatId) === strId);
      const clientObj = {
        chatId: strId,
        name: name || 'Mijoz',
        role: 'client',
        updatedAt: new Date().toISOString()
      };
      if (existingIdx >= 0) {
        subs.clients[existingIdx] = clientObj;
      } else {
        subs.clients.push(clientObj);
      }
    }

    fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(subs, null, 2), 'utf-8');
    console.log(`💾 Subscribed [${role}]: ${strId} (${name}) saqlandi.`);
  } catch (err) {
    console.error('Failed to save subscriber:', err.message);
  }
}

// Initialize known subscribers from file
try {
  const initialSubs = getSubscribers();
  (initialSubs.craftsmen || []).forEach(c => userRoleMap.set(String(c.chatId), 'craftsman'));
  (initialSubs.clients || []).forEach(c => userRoleMap.set(String(c.chatId), 'client'));
} catch (e) {}

console.log('🚀 Nexsora Telegram Bot ishga tushmoqda...');
console.log(`🤖 Bot Username: @NexsoraOPT_bot`);

async function callTelegram(method, body) {
  try {
    const response = await fetch(`${API_URL}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    if (!data.ok) {
      console.error(`❌ Telegram API Error (${method}):`, data.description);
    }
    return data;
  } catch (error) {
    console.error(`Telegram API (${method}) tarmoq xatoligi:`, error.message);
    return null;
  }
}

function generateOtpCode() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

function cleanPhone(rawPhone) {
  let cleaned = rawPhone.replace(/\D/g, '');
  if (!cleaned.startsWith('998') && cleaned.length === 9) {
    cleaned = '998' + cleaned;
  }
  return '+' + cleaned;
}

const MAIN_KEYBOARD = {
  keyboard: [
    [{ text: '👷 Men Ustaman' }, { text: '👤 Men Mijozman' }],
    [{ text: '📱 Telefon raqamni ulash (OTP)', request_contact: true }],
    [{ text: '🆔 Mening ID raqamim' }]
  ],
  resize_keyboard: true,
  one_time_keyboard: false
};

const CRAFTSMAN_KEYBOARD = {
  keyboard: [
    [{ text: '💼 Usta yo\'riqnomasi' }, { text: '🆔 Mening ID raqamim' }],
    [{ text: '🔄 Rolni o\'zgartirish' }, { text: '📱 Telefon ulash (OTP)', request_contact: true }]
  ],
  resize_keyboard: true,
  one_time_keyboard: false
};

const CLIENT_KEYBOARD = {
  keyboard: [
    [{ text: '📢 Mijoz yo\'riqnomasi' }, { text: '🆔 Mening ID raqamim' }],
    [{ text: '🔄 Rolni o\'zgartirish' }, { text: '📱 Telefon ulash (OTP)', request_contact: true }]
  ],
  resize_keyboard: true,
  one_time_keyboard: false
};

async function handleMessage(msg) {
  const chatId = msg.chat?.id;
  const firstName = msg.from?.first_name || 'Foydalanuvchi';
  const text = msg.text?.trim() || '';

  if (!chatId) return;

  console.log(`📩 Xabar keldi [${chatId} | ${firstName}]: ${text || (msg.contact ? '[Contact]' : '')}`);

  // 1. User shared contact (OTP Verification)
  if (msg.contact) {
    const phone = cleanPhone(msg.contact.phone_number);
    const otp = generateOtpCode();
    
    otpStore.set(phone, {
      code: otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
      chatId
    });
    userPhoneMap.set(chatId, phone);

    console.log(`✅ [OTP]: Telefon: ${phone} -> Kod: ${otp}`);

    const currentRole = userRoleMap.get(String(chatId));
    const kb = currentRole === 'craftsman' ? CRAFTSMAN_KEYBOARD : (currentRole === 'client' ? CLIENT_KEYBOARD : MAIN_KEYBOARD);

    await callTelegram('sendMessage', {
      chat_id: chatId,
      text: `🎉 <b>Telefon raqamingiz muvaffaqiyatli qabul qilindi!</b>\n\n` +
            `📱 <b>Raqam:</b> <code>${phone}</code>\n` +
            `🔐 <b>Tasdiqlash kodingiz:</b> <code>${otp}</code>\n\n` +
            `Ushbu 4 xonali kodni saytdagi maydonga kiriting (muddati: 5 daqiqa).\n\n` +
            `🌐 <a href="http://localhost:5173">Nexsora Platformasiga qaytish</a>`,
      parse_mode: 'HTML',
      reply_markup: kb
    });
    return;
  }

  // 2. /start command or '🔄 Rolni o'zgartirish'
  if (text.startsWith('/start') || text.includes('Rolni o\'zgartirish') || text.includes('bosh menyu')) {
    await callTelegram('sendMessage', {
      chat_id: chatId,
      text: `👋 <b>Assalomu alaykum, ${firstName}!</b>\n\n` +
            `🏢 <b>Nexsora</b> — ustalar va buyurtmachilar xizmat birjasining rasmiy botiga xush kelibsiz!\n\n` +
            `🆔 <b>Sizning Telegram ID:</b> <code>${chatId}</code>\n\n` +
            `📋 <b>Rolingizni tanlang:</b>\n` +
            `• <b>👷 Men Ustaman</b> — mijozlar joylagan yangi buyurtmalarni qabul qilish.\n` +
            `• <b>👤 Men Mijozman</b> — e'lonlaringizga tushgan usta takliflarini olish.`,
      parse_mode: 'HTML',
      reply_markup: MAIN_KEYBOARD
    });
    return;
  }

  // 3. Craftsman role selection
  if (text.includes('Ustaman') || text === '/usta' || text.includes('Usta yo\'riqnomasi')) {
    userRoleMap.set(String(chatId), 'craftsman');
    saveSubscriber(chatId, 'craftsman', firstName);

    await callTelegram('sendMessage', {
      chat_id: chatId,
      text: `👷 <b>USTA PROFILI FAOL QILINDI</b>\n\n` +
            `🆔 <b>Sizning Telegram ID:</b> <code>${chatId}</code>\n\n` +
            `✅ <b>Tizimga ulandingiz:</b>\n` +
            `• Mijozlar birjada yangi ish/buyurtma joylaganda, bot darhol sizga e'lon tafsilotlarini yetkazadi.\n` +
            `• Siz e'longa kirib o'z narxingiz va muddatingiz bilan taklif (offer) yuborasiz.\n\n` +
            `🔔 <i>Siz avtomatik tarzda yangi buyurtmalar qabul qiluvchilar ro'yxatiga qo'shildingiz!</i>`,
      parse_mode: 'HTML',
      reply_markup: CRAFTSMAN_KEYBOARD
    });
    return;
  }

  // 4. Client role selection
  if (text.includes('Mijozman') || text === '/mijoz' || text.includes('Mijoz yo\'riqnomasi')) {
    userRoleMap.set(String(chatId), 'client');
    saveSubscriber(chatId, 'client', firstName);

    await callTelegram('sendMessage', {
      chat_id: chatId,
      text: `👤 <b>MIJOZ (BUYURTMACHI) PROFILI FAOL QILINDI</b>\n\n` +
            `🆔 <b>Sizning Telegram ID:</b> <code>${chatId}</code>\n\n` +
            `✅ <b>Tizimga ulandingiz:</b>\n` +
            `• Saytda yangi ish/e'lon joylaganingizda faqat sizga tasdiq xabari keladi.\n` +
            `• Ustalar e'loningizga o'z narxlari bilan taklif yuborgan zahoti, narx va usta ma'lumotlari aynan sizning botingizga yetib keladi!\n\n` +
            `🔔 <i>Siz mijozlar ro'yxatiga muvaffaqiyatli saqlandingiz!</i>`,
      parse_mode: 'HTML',
      reply_markup: CLIENT_KEYBOARD
    });
    return;
  }

  // 5. /id or '🆔 Mening ID raqamim' command
  if (text.startsWith('/id') || text.startsWith('/myid') || text.includes('ID')) {
    const role = userRoleMap.get(String(chatId)) === 'craftsman' ? '👷 Usta' : (userRoleMap.get(String(chatId)) === 'client' ? '👤 Mijoz' : 'Tanlanmagan');
    const kb = userRoleMap.get(String(chatId)) === 'craftsman' ? CRAFTSMAN_KEYBOARD : (userRoleMap.get(String(chatId)) === 'client' ? CLIENT_KEYBOARD : MAIN_KEYBOARD);
    await callTelegram('sendMessage', {
      chat_id: chatId,
      text: `🆔 <b>Sizning Telegram ID raqamingiz:</b> <code>${chatId}</code>\n` +
            `🎭 <b>Joriy rolingiz:</b> ${role}\n\n` +
            `Nusxa olish uchun bosing: <code>${chatId}</code>\n` +
            `Ushbu ID ni sayt Sozlamalariga kiritishingiz mumkin.`,
      parse_mode: 'HTML',
      reply_markup: kb
    });
    return;
  }

  // 6. Default prompt
  const currentRole = userRoleMap.get(String(chatId));
  const kb = currentRole === 'craftsman' ? CRAFTSMAN_KEYBOARD : (currentRole === 'client' ? CLIENT_KEYBOARD : MAIN_KEYBOARD);
  await callTelegram('sendMessage', {
    chat_id: chatId,
    text: `👋 Salom <b>${firstName}</b>!\n\n` +
          `🆔 <b>Sizning Telegram ID:</b> <code>${chatId}</code>\n\n` +
          `Kerakli bo'limni tanlash uchun pastdagi tugmalardan foydalaning:`,
    parse_mode: 'HTML',
    reply_markup: kb
  });
}

let lastUpdateId = 0;

async function startPolling() {
  console.log('👂 Telegram yangilanishlari (Polling) tinglanmoqda...');
  
  while (true) {
    try {
      const updates = await callTelegram('getUpdates', {
        offset: lastUpdateId + 1,
        timeout: 20
      });

      if (updates && updates.ok && Array.isArray(updates.result)) {
        for (const update of updates.result) {
          lastUpdateId = update.update_id;
          if (update.message) {
            await handleMessage(update.message);
          }
        }
      }
    } catch (e) {
      console.error('Polling xatoligi:', e.message);
      await new Promise(res => setTimeout(res, 3000));
    }
  }
}

// Health-check HTTP server for cloud deployments (Render, Railway, etc.)
const PORT = process.env.PORT || 3000;
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'ok', service: 'Nexsora Telegram Bot', timestamp: new Date().toISOString() }));
});

server.listen(PORT, () => {
  console.log(`🌐 Health check server listening on port ${PORT}`);
});

// Start bot
startPolling();
