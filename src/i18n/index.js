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

const resources = {
  en: {
    common: {
      ...enCommon,
      header: enHeader,
      guestPage: enGuestPage,
      pages: enPages
    },
    header: enHeader,
    guestPage: enGuestPage,
    pages: enPages
  },
  tl: {
    common: {
      ...tlCommon,
      header: tlHeader,
      guestPage: tlGuestPage,
      pages: tlPages
    },
    header: tlHeader,
    guestPage: tlGuestPage,
    pages: tlPages
  },
  ceb: {
    common: {
      ...cebCommon,
      header: cebHeader,
      guestPage: cebGuestPage,
      pages: cebPages
    },
    header: cebHeader,
    guestPage: cebGuestPage,
    pages: cebPages
  }
};

const supportedLngs = ["en", "tl", "ceb"];

const applyDocumentLanguage = (languageCode) => {
  const lang = supportedLngs.includes(languageCode) ? languageCode : "en";
  document.documentElement.setAttribute("lang", lang);
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
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"]
    }
  });

applyDocumentLanguage(i18n.resolvedLanguage || i18n.language);
i18n.on("languageChanged", applyDocumentLanguage);

export default i18n;
