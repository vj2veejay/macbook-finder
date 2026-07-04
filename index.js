require("dotenv").config();
const fs = require("fs");
const TelegramBot = require("node-telegram-bot-api");
const { searchEbay } = require("./ebay");
const { isValid } = require("./filter");

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, {
  polling: false
});

const SEEN_FILE = "./seen.json";

// -------------------- MEMORY --------------------

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

// -------------------- TELEGRAM --------------------

function sendMessage(text) {
  bot.sendMessage(process.env.CHAT_ID, text);
}

// -------------------- MAIN LOGIC --------------------

async function run() {
  console.log("🔎 eBay Scan startet...");

  const items = await searchEbay();
  let seen = loadSeen();

  let newDeals = 0;

  for (const item of items) {
    const id = item.link;

    // schon gesehen → skip
    if (seen.includes(id)) continue;

    if (isValid(item)) {
      sendMessage(
        `💻 MacBook Deal gefunden!\n\n${item.title}\n${item.price}\n\n${item.link}`
      );

      seen.push(id);
      newDeals++;
    }
  }

  saveSeen(seen);

  console.log(`✅ Scan fertig. Neue Deals: ${newDeals}`);
}

// -------------------- DAILY RUN --------------------

async function start() {
  await run();

  console.log("⏳ Warte 24 Stunden bis zum nächsten Scan...");
  setTimeout(start, 24 * 60 * 60 * 1000);
}

start();