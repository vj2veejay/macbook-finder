require("dotenv").config();
const fs = require("fs");

// 🔥 robust Telegram Import (fix für "not a constructor")
const TelegramBotPkg = require("node-telegram-bot-api");
const TelegramBot =
  TelegramBotPkg.default ? TelegramBotPkg.default : TelegramBotPkg;

const { searchEbay } = require("./ebay");
const { isValid } = require("./filter");

// -------------------- ENV CHECK --------------------

if (!process.env.TELEGRAM_TOKEN || !process.env.CHAT_ID) {
  console.error("❌ Missing TELEGRAM_TOKEN or CHAT_ID");
  process.exit(1);
}

// -------------------- BOT --------------------

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, {
  polling: false
});

// -------------------- FILE STORAGE --------------------

const SEEN_FILE = "./seen.json";

function loadSeen() {
  try {
    return JSON.parse(fs.readFileSync(SEEN_FILE, "utf8"));
  } catch {
    return [];
  }
}

function saveSeen(data) {
  fs.writeFileSync(SEEN_FILE, JSON.stringify(data, null, 2));
}

// -------------------- SEND --------------------

function sendMessage(text) {
  bot.sendMessage(process.env.CHAT_ID, text).catch((err) => {
    console.error("❌ Telegram error:", err.message);
  });
}

// -------------------- SCAN --------------------

async function runScan() {
  console.log("🔎 eBay Scan startet...");

  let items = [];

  try {
    items = await searchEbay();
  } catch (err) {
    console.error("❌ eBay error:", err.message);
    return;
  }

  let seen = loadSeen();
  let newDeals = 0;

  for (const item of items) {
    if (!item?.link) continue;

    if (seen.includes(item.link)) continue;

    if (isValid(item)) {
      sendMessage(
`💻 MACBOOK DEAL

📌 ${item.title}
💰 ${item.price}

🔗 ${item.link}`
      );

      seen.push(item.link);
      newDeals++;
    }
  }

  saveSeen(seen);

  console.log(`✅ Fertig. Neue Deals: ${newDeals}`);
}

// -------------------- LOOP --------------------

async function start() {
  await runScan();

  console.log("⏳ Warte 24h...");

  setTimeout(start, 24 * 60 * 60 * 1000);
}

start();