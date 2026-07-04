require("dotenv").config();
const fs = require("fs");
const TelegramBot = require("node-telegram-bot-api");

const { searchEbay } = require("./ebay");
const { isValid } = require("./filter");

// -------------------- TELEGRAM --------------------

// stabile Initialisierung (KEIN .default!)
const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, {
  polling: false
});

// -------------------- SAFETY CHECK --------------------

if (!process.env.TELEGRAM_TOKEN || !process.env.CHAT_ID) {
  console.error("❌ Missing TELEGRAM_TOKEN or CHAT_ID in env!");
  process.exit(1);
}

// -------------------- SEEN STORAGE --------------------

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

// -------------------- TELEGRAM SENDER --------------------

function sendMessage(text) {
  bot.sendMessage(process.env.CHAT_ID, text).catch((err) => {
    console.error("❌ Telegram error:", err.message);
  });
}

// -------------------- MAIN LOGIC --------------------

async function runScan() {
  console.log("🔎 eBay Scan startet...");

  let items = [];

  try {
    items = await searchEbay();
  } catch (err) {
    console.error("❌ eBay search failed:", err.message);
    return;
  }

  let seen = loadSeen();
  let newDeals = 0;

  for (const item of items) {
    if (!item?.link) continue;

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

// -------------------- LOOP (1x täglich) --------------------

async function start() {
  await runScan();

  console.log("⏳ Warte 24 Stunden...");

  setTimeout(start, 24 * 60 * 60 * 1000);
}

// -------------------- START --------------------

start();