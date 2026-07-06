const axios = require("axios");

async function getAccessToken() {
  const res = await axios.post(
    "https://api.ebay.com/identity/v1/oauth2/token",
    "grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope",
    {
      auth: {
        username: process.env.EBAY_CLIENT_ID,
        password: process.env.EBAY_CLIENT_SECRET
      },
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    }
  );

  return res.data.access_token;
}

function isRealMacBook(item) {
  const title = (item.title || "").toLowerCase();
  const price = Number(item.price?.value || 0);

  // ❌ Zubehör komplett raus
  const badWords = [
    "dock", "docking", "hub", "adapter", "station",
    "case", "cover", "charger", "cable", "stand",
    "bag", "skin", "protector", "keyboard"
  ];

  if (badWords.some(w => title.includes(w))) return false;

  // ❌ alte Geräte raus
  const badYears = [
    "2013","2014","2015","2016","2017","2018"
  ];

  if (badYears.some(y => title.includes(y))) return false;

  // ❌ Intel raus
  if (title.includes("intel")) return false;

  // ❌ Preisfilter
  if (price < 150 || price > 900) return false;

  // ❌ muss echtes MacBook sein
  if (!title.includes("macbook")) return false;

  return true;
}

async function searchEbay() {
  const token = await getAccessToken();

  const res = await axios.get(
    "https://api.ebay.com/buy/browse/v1/item_summary/search",
    {
      params: {
        q: "MacBook Air M1 M2 laptop",
        limit: 20
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  const items = res.data.itemSummaries || [];

  return items
    .filter(isRealMacBook)
    .map(item => ({
      id: item.itemId,
      title: item.title,
      price: Number(item.price?.value || 0),
      url: item.itemWebUrl
    }));
}

module.exports = { searchEbay };