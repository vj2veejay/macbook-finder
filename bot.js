require("dotenv").config();

const TelegramBot = require("node-telegram-bot-api");

// 🔥 WICHTIG: kein new direkt mit evtl. falschem export
const botLib = require("node-telegram-bot-api");
const Bot = botLib.default ?? botLib;

const bot = new Bot(process.env.TELEGRAM_TOKEN, {
  polling: false
});

function sendMessage(text) {
  return bot.sendMessage(process.env.CHAT_ID, text);
}

module.exports = { sendMessage };