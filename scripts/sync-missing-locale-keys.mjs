import fs from "node:fs";
import path from "node:path";

const baseDir = path.join("Smart-Cane-Frontend", "src", "i18n", "locales");
const targetLangs = ["ko", "zh", "ja", "it", "es", "pt", "ru", "fr", "hi", "ar"];
const referenceLangs = ["en", "tl", "ceb"];
const files = ["common.json", "header.json", "guestPage.json", "pages.json"];

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

const placeholderRegex = /\{\{\s*[^}]+\s*\}\}/g;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readJson(filePath) {
  const raw = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
  return JSON.parse(raw);
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function unionMerge(base, incoming) {
  if (incoming === null || incoming === undefined) return base;

  if (Array.isArray(base) || Array.isArray(incoming)) {
    return base !== undefined ? base : deepClone(incoming);
  }

  if (
    typeof base === "object" &&
    base !== null &&
    typeof incoming === "object" &&
    incoming !== null
  ) {
    const out = { ...base };
    for (const [key, value] of Object.entries(incoming)) {
      if (!(key in out)) {
        out[key] = deepClone(value);
      } else {
        out[key] = unionMerge(out[key], value);
      }
    }
    return out;
  }

  return base !== undefined ? base : incoming;
}

function hasOwn(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

function collectMissing(referenceNode, targetNode) {
  if (referenceNode === null || referenceNode === undefined) return undefined;

  if (Array.isArray(referenceNode)) {
    if (targetNode === undefined) return deepClone(referenceNode);
    return undefined;
  }

  if (typeof referenceNode === "object") {
    const out = {};
    const currentTarget =
      targetNode && typeof targetNode === "object" && !Array.isArray(targetNode)
        ? targetNode
        : {};

    for (const [key, refValue] of Object.entries(referenceNode)) {
      const nextMissing = hasOwn(currentTarget, key)
        ? collectMissing(refValue, currentTarget[key])
        : deepClone(refValue);
      if (nextMissing !== undefined) out[key] = nextMissing;
    }

    return Object.keys(out).length > 0 ? out : undefined;
  }

  return targetNode === undefined ? referenceNode : undefined;
}

function deepMerge(target, source) {
  if (!source || typeof source !== "object") return target;

  for (const [key, value] of Object.entries(source)) {
    if (Array.isArray(value)) {
      if (!hasOwn(target, key)) target[key] = value;
      continue;
    }

    if (value && typeof value === "object") {
      if (!target[key] || typeof target[key] !== "object" || Array.isArray(target[key])) {
        target[key] = {};
      }
      deepMerge(target[key], value);
      continue;
    }

    if (!hasOwn(target, key)) {
      target[key] = value;
    }
  }

  return target;
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
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(targetCode)}&dt=t&q=${encodeURIComponent(normalized)}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`status=${response.status}`);
  }
  const data = await response.json();
  return (data?.[0] || []).map((item) => item?.[0] || "").join("");
}

async function translateText(text, lang, cache) {
  if (typeof text !== "string" || !text.trim()) return text;

  const cacheKey = `${lang}::${text}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  const { normalized, placeholders } = preservePlaceholders(text);
  const targetCode = targetMap[lang] || lang;

  let translated = normalized;
  let translatedSuccessfully = false;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      translated = await fetchTranslate(normalized, targetCode);
      translatedSuccessfully = true;
      break;
    } catch (error) {
      if (attempt === 4) {
        console.warn(
          `[${lang}] translation failed after retries, keeping source text: ${error.message}`
        );
      }
      await sleep(250 * attempt);
    }
  }

  const finalText = translatedSuccessfully ? translated : normalized;
  const restored = restorePlaceholders(finalText, placeholders);
  cache.set(cacheKey, restored);
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
    for (const [key, value] of Object.entries(node)) {
      out[key] = await translateNode(value, lang, cache);
    }
    return out;
  }

  return node;
}

function buildReference(fileName) {
  let reference = {};
  for (const lang of referenceLangs) {
    const filePath = path.join(baseDir, lang, fileName);
    const json = readJson(filePath);
    reference = unionMerge(reference, json);
  }
  return reference;
}

const translationCache = new Map();

for (const fileName of files) {
  const reference = buildReference(fileName);

  for (const lang of targetLangs) {
    const filePath = path.join(baseDir, lang, fileName);
    const current = readJson(filePath);
    const missing = collectMissing(reference, current);

    if (!missing) {
      console.log(`[${lang}] ${fileName}: no missing keys`);
      continue;
    }

    console.log(`[${lang}] ${fileName}: translating missing keys`);
    const translatedMissing = await translateNode(missing, lang, translationCache);
    const merged = deepMerge(current, translatedMissing);

    fs.writeFileSync(filePath, `${JSON.stringify(merged, null, 2)}\n`, "utf8");
  }
}

console.log("Done syncing missing locale keys for all target languages.");
