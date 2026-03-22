import fs from "node:fs";
import path from "node:path";

const baseDir = path.join("Smart-Cane-Frontend", "src", "i18n", "locales");
const langs = ["tl", "ceb", "ko", "zh", "ja", "it", "es", "pt", "ru", "fr", "hi", "ar"];
const targetMap = {
  tl: "tl",
  ceb: "ceb",
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

function readJson(filePath) {
  const raw = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
  return JSON.parse(raw);
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

const placeholderRegex = /\{\{\s*[^}]+\s*\}\}/g;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function preservePlaceholders(text) {
  const placeholders = [];
  const normalized = text.replace(placeholderRegex, (match) => {
    const token = `__PH_${placeholders.length}__`;
    placeholders.push(match);
    return token;
  });
  return { normalized, placeholders };
}

function restorePlaceholders(text, placeholders) {
  let out = text;
  placeholders.forEach((placeholder, index) => {
    out = out.replace(new RegExp(`__PH_${index}__`, "g"), placeholder);
  });
  return out;
}

async function fetchTranslate(normalized, targetCode) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${encodeURIComponent(targetCode)}&dt=t&q=${encodeURIComponent(normalized)}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`status=${response.status}`);
  const data = await response.json();
  return (data?.[0] || []).map((item) => item?.[0] || "").join("");
}

async function translateText(text, lang, cache) {
  if (!text || !text.trim()) return text;

  const key = `${lang}::${text}`;
  if (cache.has(key)) return cache.get(key);

  const { normalized, placeholders } = preservePlaceholders(text);
  const targetCode = targetMap[lang] || lang;

  let translated = normalized;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      translated = await fetchTranslate(normalized, targetCode);
      break;
    } catch (error) {
      if (attempt === 4) {
        console.warn(`[${lang}] translation fallback to source: ${error.message}`);
      }
      await sleep(250 * attempt);
    }
  }

  const restored = restorePlaceholders(translated, placeholders);
  cache.set(key, restored);
  return restored;
}

async function translateNode(node, lang, cache) {
  if (typeof node === "string") {
    return translateText(node, lang, cache);
  }

  if (Array.isArray(node)) {
    const out = [];
    for (const item of node) {
      out.push(await translateNode(item, lang, cache));
    }
    return out;
  }

  if (node && typeof node === "object") {
    const out = {};
    for (const [key, value] of Object.entries(node)) {
      out[key] = await translateNode(value, lang, cache);
    }
    return out;
  }

  return node;
}

const enPagesPath = path.join(baseDir, "en", "pages.json");
const enPages = readJson(enPagesPath);
const sourceTermsModal = enPages.termsModal;

if (!sourceTermsModal) {
  throw new Error("termsModal key not found in en/pages.json");
}

const cache = new Map();
for (const lang of langs) {
  console.log(`Translating termsModal for ${lang}...`);
  const translated = await translateNode(sourceTermsModal, lang, cache);

  const targetPath = path.join(baseDir, lang, "pages.json");
  const targetJson = readJson(targetPath);
  targetJson.termsModal = translated;
  writeJson(targetPath, targetJson);
}

console.log("Done translating termsModal for all locales.");
