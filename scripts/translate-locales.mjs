import fs from "node:fs";
import path from "node:path";

const baseDir = path.join("Smart-Cane-Frontend", "src", "i18n", "locales");
const langs = ["ko", "zh", "ja", "it", "es", "pt", "ru", "fr", "hi", "ar"];
const targetMap = {
  ko: "ko",
  zh: "zh-CN",
  ja: "ja",
  it: "it",
  es: "es",
  pt: "pt",
  ru: "ru",
  fr: "fr",
  hi: "hi",
  ar: "ar"
};

const srcGuest = JSON.parse(fs.readFileSync(path.join(baseDir, "en", "guestPage.json"), "utf8"));
const srcHeader = JSON.parse(fs.readFileSync(path.join(baseDir, "en", "header.json"), "utf8"));

const placeholderRegex = /\{\{\s*[^}]+\s*\}\}/g;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function preservePlaceholders(text) {
  const placeholders = [];
  const normalized = text.replace(placeholderRegex, (m) => {
    const token = `__PH_${placeholders.length}__`;
    placeholders.push(m);
    return token;
  });
  return { normalized, placeholders };
}

function restorePlaceholders(text, placeholders) {
  let out = text;
  placeholders.forEach((ph, i) => {
    out = out.replace(new RegExp(`__PH_${i}__`, "g"), ph);
  });
  return out;
}

async function fetchTranslate(normalized, targetCode) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${encodeURIComponent(targetCode)}&dt=t&q=${encodeURIComponent(normalized)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`status=${res.status}`);
  const data = await res.json();
  return (data?.[0] || []).map((item) => item?.[0] || "").join("");
}

async function translateText(text, lang, cache) {
  if (!text || !text.trim()) return text;
  const key = `${lang}::${text}`;
  if (cache.has(key)) return cache.get(key);

  const { normalized, placeholders } = preservePlaceholders(text);
  const targetCode = targetMap[lang] || lang;

  let translated = null;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      translated = await fetchTranslate(normalized, targetCode);
      break;
    } catch (err) {
      if (attempt === 4) throw err;
      await sleep(250 * attempt);
    }
  }

  const restored = restorePlaceholders(translated || normalized, placeholders);
  cache.set(key, restored);
  return restored;
}

async function translateNode(node, lang, cache) {
  if (typeof node === "string") {
    return translateText(node, lang, cache);
  }
  if (Array.isArray(node)) {
    const out = [];
    for (const item of node) out.push(await translateNode(item, lang, cache));
    return out;
  }
  if (node && typeof node === "object") {
    const out = {};
    for (const [k, v] of Object.entries(node)) out[k] = await translateNode(v, lang, cache);
    return out;
  }
  return node;
}

const cache = new Map();
for (const lang of langs) {
  console.log(`Translating guestPage/header for ${lang}...`);
  const translatedGuest = await translateNode(srcGuest, lang, cache);
  const translatedHeader = await translateNode(srcHeader, lang, cache);
  const langDir = path.join(baseDir, lang);
  fs.writeFileSync(path.join(langDir, "guestPage.json"), JSON.stringify(translatedGuest, null, 2) + "\n", "utf8");
  fs.writeFileSync(path.join(langDir, "header.json"), JSON.stringify(translatedHeader, null, 2) + "\n", "utf8");
}

console.log("Done translating all locale guestPage/header files.");
