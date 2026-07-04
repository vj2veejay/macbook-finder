
// ❌ harte Defekte / Ausschlussbegriffe
const BLOCKED_GENERAL = [
  "defekt",
  "beschädigt",
  "kaputt",
  "wasserschaden",
  "flüssigkeitsschaden",
  "logicboard",
  "mainboard",
  "für bastler",
  "ersatzteil",
  "ohne funktion",
  "geht nicht an",
  "displaybruch",
  "display beschädigt",
  "display defekt",
  "gesperrt",
  "blacklist"
];

// 🔒 iCloud / MDM Speziallogik (mit Kontext!)
function hasBadIcloud(text) {
  text = text.toLowerCase();

  // ❗ sichere Formulierungen (NICHT blocken)
  const safePhrases = [
    "nicht icloud",
    "no icloud",
    "icloud frei",
    "icloud removed",
    "find my off",
    "apple id entfernt",
    "ohne icloud sperre"
  ];

  if (safePhrases.some(p => text.includes(p))) {
    return false;
  }

  // ❗ echte Problemfälle
  const badPatterns = [
    "icloud",
    "activation lock",
    "aktivierungssperre",
    "find my",
    "apple id",
    "mdm",
    "remote management"
  ];

  return badPatterns.some(p => text.includes(p));
}

// 💰 Preis sauber extrahieren
function getPrice(priceText) {
  if (!priceText) return null;

  const cleaned = priceText
    .replace(/\./g, "")       // Tausenderpunkte raus
    .replace(",", ".")        // Komma zu Punkt
    .replace(/[^\d.]/g, "");  // nur Zahlen + Punkt

  const price = parseFloat(cleaned);
  return isNaN(price) ? null : price;
}

// 🧠 Hauptfilter
function isValid(item) {
  const text = (item.title + " " + item.price).toLowerCase();

  // ❌ harte Defekte raus
  if (BLOCKED_GENERAL.some(word => text.includes(word))) {
    return false;
  }

  // 🔒 iCloud / MDM Check
  if (hasBadIcloud(text)) {
    return false;
  }

  // 💻 nur Apple Silicon Macs
  const hasChip = /m1|m2|m3|m4|m5/i.test(text);
  if (!hasChip) return false;

  // 💰 Preislimit
  const price = getPrice(item.price);
  if (!price) return false;
  if (price > 250) return false;

  return true;
}

module.exports = { isValid };