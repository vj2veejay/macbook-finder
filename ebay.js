const axios = require("axios");
const cheerio = require("cheerio");

async function searchEbay() {
  try {
    const url =
      "https://www.ebay.de/sch/i.html?_nkw=macbook+m1+m2+m3+m4&_sop=10";

    const res = await axios.get(url, {
      timeout: 15000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36",
        "Accept-Language": "de-DE,de;q=0.9,en;q=0.8",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        Connection: "keep-alive"
      }
    });

    const $ = cheerio.load(res.data);

    const items = [];

    $(".s-item").each((i, el) => {
      const title = $(el).find(".s-item__title").text().trim();
      const price = $(el).find(".s-item__price").text().trim();
      const link = $(el).find("a.s-item__link").attr("href");

      if (!title || !link) return;

      // Filter eBay noise (z.B. "Shop on eBay")
      if (title.includes("Shop on eBay")) return;

      items.push({
        title,
        price,
        link
      });
    });

    console.log(`📦 eBay Items gefunden: ${items.length}`);

    return items;
  } catch (err) {
    console.error("❌ eBay Fehler:", err.message);
    return [];
  }
}

module.exports = { searchEbay };