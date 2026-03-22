import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import enCommon from "./locales/en/common.json";
import enHeader from "./locales/en/header.json";
import enGuestPage from "./locales/en/guestPage.json";
import enPages from "./locales/en/pages.json";
import tlCommon from "./locales/tl/common.json";
import tlHeader from "./locales/tl/header.json";
import tlGuestPage from "./locales/tl/guestPage.json";
import tlPages from "./locales/tl/pages.json";
import cebCommon from "./locales/ceb/common.json";
import cebHeader from "./locales/ceb/header.json";
import cebGuestPage from "./locales/ceb/guestPage.json";
import cebPages from "./locales/ceb/pages.json";
import koCommon from "./locales/ko/common.json";
import koHeader from "./locales/ko/header.json";
import koGuestPage from "./locales/ko/guestPage.json";
import koPages from "./locales/ko/pages.json";
import zhCommon from "./locales/zh/common.json";
import zhHeader from "./locales/zh/header.json";
import zhGuestPage from "./locales/zh/guestPage.json";
import zhPages from "./locales/zh/pages.json";
import jaCommon from "./locales/ja/common.json";
import jaHeader from "./locales/ja/header.json";
import jaGuestPage from "./locales/ja/guestPage.json";
import jaPages from "./locales/ja/pages.json";
import itCommon from "./locales/it/common.json";
import itHeader from "./locales/it/header.json";
import itGuestPage from "./locales/it/guestPage.json";
import itPages from "./locales/it/pages.json";
import esCommon from "./locales/es/common.json";
import esHeader from "./locales/es/header.json";
import esGuestPage from "./locales/es/guestPage.json";
import esPages from "./locales/es/pages.json";
import ptCommon from "./locales/pt/common.json";
import ptHeader from "./locales/pt/header.json";
import ptGuestPage from "./locales/pt/guestPage.json";
import ptPages from "./locales/pt/pages.json";
import ruCommon from "./locales/ru/common.json";
import ruHeader from "./locales/ru/header.json";
import ruGuestPage from "./locales/ru/guestPage.json";
import ruPages from "./locales/ru/pages.json";
import frCommon from "./locales/fr/common.json";
import frHeader from "./locales/fr/header.json";
import frGuestPage from "./locales/fr/guestPage.json";
import frPages from "./locales/fr/pages.json";
import hiCommon from "./locales/hi/common.json";
import hiHeader from "./locales/hi/header.json";
import hiGuestPage from "./locales/hi/guestPage.json";
import hiPages from "./locales/hi/pages.json";
import arCommon from "./locales/ar/common.json";
import arHeader from "./locales/ar/header.json";
import arGuestPage from "./locales/ar/guestPage.json";
import arPages from "./locales/ar/pages.json";

const EN_BUNDLE = {
  common: enCommon,
  header: enHeader,
  guestPage: enGuestPage,
  pages: enPages,
};

const TL_BUNDLE = {
  common: tlCommon,
  header: tlHeader,
  guestPage: tlGuestPage,
  pages: tlPages,
};

const CEB_BUNDLE = {
  common: cebCommon,
  header: cebHeader,
  guestPage: cebGuestPage,
  pages: cebPages,
};

const KO_BUNDLE = {
  common: koCommon,
  header: koHeader,
  guestPage: koGuestPage,
  pages: koPages,
};

const ZH_BUNDLE = {
  common: zhCommon,
  header: zhHeader,
  guestPage: zhGuestPage,
  pages: zhPages,
};

const JA_BUNDLE = {
  common: jaCommon,
  header: jaHeader,
  guestPage: jaGuestPage,
  pages: jaPages,
};

const IT_BUNDLE = {
  common: itCommon,
  header: itHeader,
  guestPage: itGuestPage,
  pages: itPages,
};

const ES_BUNDLE = {
  common: esCommon,
  header: esHeader,
  guestPage: esGuestPage,
  pages: esPages,
};

const PT_BUNDLE = {
  common: ptCommon,
  header: ptHeader,
  guestPage: ptGuestPage,
  pages: ptPages,
};

const RU_BUNDLE = {
  common: ruCommon,
  header: ruHeader,
  guestPage: ruGuestPage,
  pages: ruPages,
};

const FR_BUNDLE = {
  common: frCommon,
  header: frHeader,
  guestPage: frGuestPage,
  pages: frPages,
};

const HI_BUNDLE = {
  common: hiCommon,
  header: hiHeader,
  guestPage: hiGuestPage,
  pages: hiPages,
};

const AR_BUNDLE = {
  common: arCommon,
  header: arHeader,
  guestPage: arGuestPage,
  pages: arPages,
};

const createLanguageResource = (bundle = EN_BUNDLE) => ({
  common: {
    ...bundle.common,
    header: bundle.header,
    guestPage: bundle.guestPage,
    pages: bundle.pages,
  },
  header: bundle.header,
  guestPage: bundle.guestPage,
  pages: bundle.pages,
});

const resources = {
  en: createLanguageResource(EN_BUNDLE),
  tl: createLanguageResource(TL_BUNDLE),
  ceb: createLanguageResource(CEB_BUNDLE),
  ko: createLanguageResource(KO_BUNDLE),
  zh: createLanguageResource(ZH_BUNDLE),
  ja: createLanguageResource(JA_BUNDLE),
  it: createLanguageResource(IT_BUNDLE),
  es: createLanguageResource(ES_BUNDLE),
  pt: createLanguageResource(PT_BUNDLE),
  ru: createLanguageResource(RU_BUNDLE),
  fr: createLanguageResource(FR_BUNDLE),
  hi: createLanguageResource(HI_BUNDLE),
  ar: createLanguageResource(AR_BUNDLE),
};

const supportedLngs = [
  "en",
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
  "ar",
];

const normalizeLanguageCode = (languageCode) => {
  if (!languageCode) return "en";
  const baseCode = String(languageCode).toLowerCase().split("-")[0];
  return supportedLngs.includes(baseCode) ? baseCode : "en";
};

const applyDocumentLanguage = (languageCode) => {
  const lang = normalizeLanguageCode(languageCode);
  document.documentElement.setAttribute("lang", lang);
  document.documentElement.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    defaultNS: "common",
    ns: ["common", "header", "guestPage", "pages"],
    fallbackLng: "en",
    supportedLngs,
    nonExplicitSupportedLngs: true,
    load: "languageOnly",
    cleanCode: true,
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ["localStorage", "htmlTag", "navigator"],
      lookupLocalStorage: "i18nextLng",
      caches: ["localStorage"],
      excludeCacheFor: ["cimode"]
    }
  });

applyDocumentLanguage(i18n.resolvedLanguage || i18n.language);
i18n.on("languageChanged", applyDocumentLanguage);

export default i18n;
