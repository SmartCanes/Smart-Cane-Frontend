import fs from "fs/promises";
import path from "path";

const ROOT = path.resolve(process.cwd(), "src", "i18n", "locales");
const EN_PAGES_PATH = path.join(ROOT, "en", "pages.json");
const TOUR_CONFIG_PATH = path.resolve(process.cwd(), "src", "data", "tourConfig.js");

const TARGET_LOCALES = [
  "tl",
  "ceb",
  "ko",
  "zh",
  "ja",
  "it",
  "es",
  "pt",
  "ru",
  "fr",
  "hi",
  "ar"
];

const PLACEHOLDER_RE = /{{\s*[^}]+\s*}}/g;
const GOOGLE_URL = "https://translate.googleapis.com/translate_a/single";

const routeToKey = (routePath) => routePath.replace(/^\//, "").replace(/-/g, "_");

function extractObjectLiteral(source, constName, nextConstName) {
  const startToken = `const ${constName} =`;
  const endToken = `const ${nextConstName} =`;
  const startIdx = source.indexOf(startToken);
  if (startIdx === -1) {
    throw new Error(`Unable to find ${constName} in tourConfig.js`);
  }

  const fromStart = source.slice(startIdx + startToken.length);
  const endIdx = fromStart.indexOf(endToken);
  if (endIdx === -1) {
    throw new Error(`Unable to find ${nextConstName} marker in tourConfig.js`);
  }

  const raw = fromStart.slice(0, endIdx).trim();
  const withoutTrailingSemicolon = raw.endsWith(";") ? raw.slice(0, -1) : raw;
  return withoutTrailingSemicolon.trim();
}

function parseObjectLiteral(literal) {
  return Function(`"use strict"; return (${literal});`)();
}

function mapGoogleResponse(data) {
  if (!Array.isArray(data) || !Array.isArray(data[0])) return "";
  return data[0].map((part) => part?.[0] ?? "").join("");
}

async function translateText(text, targetLang, maxRetries = 8) {
  if (typeof text !== "string" || text.trim() === "") return text;

  const placeholders = [];
  const masked = text.replace(PLACEHOLDER_RE, (m) => {
    const token = `__PH_${placeholders.length}__`;
    placeholders.push(m);
    return token;
  });

  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      const params = new URLSearchParams({
        client: "gtx",
        sl: "en",
        tl: targetLang,
        dt: "t",
        q: masked
      });

      const res = await fetch(`${GOOGLE_URL}?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const json = await res.json();
      let translated = mapGoogleResponse(json) || text;

      placeholders.forEach((ph, idx) => {
        translated = translated.replaceAll(`__PH_${idx}__`, ph);
      });

      // Gentle pacing helps avoid free endpoint throttling bursts.
      await new Promise((r) => setTimeout(r, 60));
      return translated;
    } catch (err) {
      if (attempt === maxRetries) {
        throw err;
      }
      const jitter = Math.floor(Math.random() * 250);
      await new Promise((r) => setTimeout(r, 500 * attempt + jitter));
    }
  }

  return text;
}

async function deepTranslate(value, targetLang) {
  if (typeof value === "string") {
    return translateText(value, targetLang);
  }

  if (Array.isArray(value)) {
    const out = [];
    for (const item of value) {
      out.push(await deepTranslate(item, targetLang));
    }
    return out;
  }

  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = await deepTranslate(v, targetLang);
    }
    return out;
  }

  return value;
}

function buildEnglishTourBlock(baseSteps, baseMobileFlow, existingUi = null) {
  const ui = existingUi ?? {
    back: "Back",
    next: "Next",
    done: "Done",
    skip: "Skip"
  };

  const steps = {};
  for (const [route, items] of Object.entries(baseSteps)) {
    const routeKey = routeToKey(route);
    steps[routeKey] = {};
    for (const step of items) {
      steps[routeKey][step.key] = {
        title: step.title,
        description: step.description
      };
    }
  }

  const mobile = {};
  for (const [route, flow] of Object.entries(baseMobileFlow)) {
    const routeKey = routeToKey(route);
    mobile[routeKey] = {
      headerMenuIntro: {
        title: flow.headerMenuIntro?.title ?? "",
        description: flow.headerMenuIntro?.description ?? ""
      }
    };
  }

  return { ui, steps, mobile };
}

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw);
}

async function writeJson(filePath, data) {
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

async function main() {
  const tourConfigRaw = await fs.readFile(TOUR_CONFIG_PATH, "utf8");

  const baseStepsLiteral = extractObjectLiteral(
    tourConfigRaw,
    "BASE_TOUR_STEPS",
    "BASE_MOBILE_TOUR_FLOW"
  );
  const baseMobileLiteral = extractObjectLiteral(
    tourConfigRaw,
    "BASE_MOBILE_TOUR_FLOW",
    "routeToKey"
  );

  const baseSteps = parseObjectLiteral(baseStepsLiteral);
  const baseMobile = parseObjectLiteral(baseMobileLiteral);

  const enPages = await readJson(EN_PAGES_PATH);
  const englishTour = buildEnglishTourBlock(baseSteps, baseMobile, enPages?.tour?.ui ?? null);

  enPages.tour = englishTour;
  await writeJson(EN_PAGES_PATH, enPages);

  for (const locale of TARGET_LOCALES) {
    const localePath = path.join(ROOT, locale, "pages.json");
    const pages = await readJson(localePath);

    console.log(`Translating full tour block for ${locale}...`);
    const translatedTour = await deepTranslate(englishTour, locale);

    pages.tour = translatedTour;
    await writeJson(localePath, pages);
  }

  console.log("Tour steps + mobile translations synced for all locales.");
}

main().catch((err) => {
  console.error("Failed to sync tour translations:", err);
  process.exitCode = 1;
});
