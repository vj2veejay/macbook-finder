function isValid(item) {
  if (!item) return false;

  const title = (item.title || "").toLowerCase();
  const price = Number(item.price || 999999);

  // ❌ zu teuer
  if (price > 250) return false;

  // ❌ kaputte Geräte ausschließen
  const badWords = [
    "defekt",
    "kaputt",
    "ersatzteile",
    "displaybruch",
    "water damage",
    "icloud locked",
    "icloud sperre"
  ];

  if (badWords.some(w => title.includes(w))) {
    return false;
  }

  // ✅ must-have MacBooks
  const goodWords = ["macbook"];

  if (!goodWords.some(w => title.includes(w))) {
    return false;
  }

  // optional: bevorzugte Chips
  const goodChips = ["m1", "m2", "m3", "m4"];

  const hasChip = goodChips.some(c => title.includes(c));

  return hasChip;
}

module.exports = { isValid };