const axios = require("axios");
const cheerio = require("cheerio");

async function searchEbay() {
  const url =
    "https://www.ebay.de/sch/i.html?_nkw=macbook+m1+m2+m3+m4&_sop=10";

  const res = await axios.get(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
    }
  });

  const $ = cheerio.load(res.data);

  const items = [];

  $(".s-item").each((i, el) => {
    const title = $(el).find(".s-item__title").text().trim();
    const price = $(el).find(".s-item__price").text().trim();
    const link = $(el).find("a.s-item__link").attr("href");

    // eBay Müll rausfiltern (z. B. "Shop on eBay" Cards)
    if (!title || !price || !link) return;
    if (title.toLowerCase().includes("shop on ebay")) return;

    items.push({
      title,
      price,
      link
    });
  });

  return items;
}

module.exports = { searchEbay };