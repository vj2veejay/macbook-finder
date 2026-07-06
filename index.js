require("dotenv").config();
const fs = require("fs");

const TelegramBotPkg = require("node-telegram-bot-api");
const TelegramBot = TelegramBotPkg.default || TelegramBotPkg;

const { searchEbay } = require("./ebay");

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, {
  polling: false
});

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

function sendMessage(text) {
  bot.sendMessage(process.env.CHAT_ID, text).catch(console.error);
}

async function runScan() {
  console.log("🔎 Scan startet...");

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
    if (!item?.url) continue;
    if (seen.includes(item.url)) continue;

    sendMessage(
`💻 MACBOOK DEAL

📌 ${item.title}
💰 ${item.price}€
🔗 ${item.url}`
    );

    seen.push(item.url);
    newDeals++;
  }

  saveSeen(seen);

  console.log(`✅ Fertig. Neue Deals: ${newDeals}`);
}

async function start() {
  await runScan();

  console.log("⏳ Warte 1 Stunde...");

  setTimeout(start, 60 * 60 * 1000);
}

start();