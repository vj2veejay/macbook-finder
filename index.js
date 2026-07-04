require("dotenv").config();
const fs = require("fs");
const TelegramBot = require("node-telegram-bot-api");

const { searchEbay } = require("./ebay");
const { isValid } = require("./filter");

// -------------------- TELEGRAM --------------------

// robust für verschiedene node-telegram-bot-api exports
const TelegramBotClass =
  TelegramBot.default ? TelegramBot.default : TelegramBot;

const bot = new TelegramBotClass(process.env.TELEGRAM_TOKEN, {
  polling: false
});

// -------------------- MEMORY --------------------

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

// -------------------- SEND MESSAGE --------------------

function sendMessage(text) {
  if (!process.env.CHAT_ID) {
    console.error("❌ CHAT_ID fehlt!");
    return;
  }

  bot.sendMessage(process.env.CHAT_ID, text);
}

// -------------------- MAIN SCAN --------------------

async function run() {
  console.log("🔎 eBay Scan startet...");

  const items = await searchEbay();
  let seen = loadSeen();

  let newDeals = 0;

  for (const item of items) {
    const id = item.link;

    if (seen.includes(id)) continue;

    if (isValid(item)) {
      sendMessage(
`💻 MACBOOK DEAL GEFUNDEN

📌 ${item.title}
💰 ${item.price}

✔ geprüft (kein Defekt / kein Lock erkannt)

🔗 ${item.link}`
      );

      seen.push(id);
      newDeals++;
    }
  }

  saveSeen(seen);

  console.log(`✅ Scan fertig. Neue Deals: ${newDeals}`);
}

// -------------------- DAILY LOOP --------------------

async function start() {
  await run();

  console.log("⏳ Warte 24 Stunden bis zum nächsten Scan...");

  setTimeout(start, 24 * 60 * 60 * 1000);
}

start();
