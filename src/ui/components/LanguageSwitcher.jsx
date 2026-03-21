import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

const SUPPORTED_LANGUAGES = [
  { code: "en", labelKey: "languages.en" },
  { code: "tl", labelKey: "languages.tl" },
  { code: "ceb", labelKey: "languages.ceb" }
];

const variantMap = {
  light: {
    label: "text-[var(--color-primary-100)]",
    trigger:
      "bg-white text-[var(--color-primary-100)] border-[color:color-mix(in_srgb,var(--color-primary-100)_28%,white)] hover:bg-[color:color-mix(in_srgb,var(--color-primary-100)_6%,white)] focus-visible:ring-[var(--color-primary-100)] focus-visible:ring-offset-white",
    menu: "bg-white text-[var(--color-primary-100)] border-[color:color-mix(in_srgb,var(--color-primary-100)_22%,#d1d5db)]"
  },
  dark: {
    label: "text-white",
    trigger:
      "bg-white text-[var(--color-primary-100)] border-[color:color-mix(in_srgb,var(--color-primary-100)_28%,white)] hover:bg-[color:color-mix(in_srgb,var(--color-primary-100)_6%,white)] focus-visible:ring-[var(--color-primary-100)] focus-visible:ring-offset-[var(--color-primary-100)]",
    menu: "bg-white text-[var(--color-primary-100)] border-[color:color-mix(in_srgb,var(--color-primary-100)_22%,#d1d5db)]"
  }
};

const LanguageSwitcher = ({ className = "", variant = "dark" }) => {
  const { i18n, t } = useTranslation();
  const selectId = useId();
  const statusId = useId();
  const labelId = useId();
  const containerRef = useRef(null);
  const [announcement, setAnnouncement] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = SUPPORTED_LANGUAGES.some(
    (language) => language.code === i18n.resolvedLanguage
  )
    ? i18n.resolvedLanguage
    : "en";

  useEffect(() => {
    setAnnouncement(
      t("languageSwitcher.changed", {
        language: t(
          SUPPORTED_LANGUAGES.find(
            (language) => language.code === currentLanguage
          )?.labelKey || "languages.en"
        )
      })
    );
  }, [currentLanguage, t]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLanguageChange = async (nextLanguage) => {
    if (nextLanguage !== i18n.language) {
      await i18n.changeLanguage(nextLanguage);
    }
    setIsOpen(false);
  };

  const currentLanguageLabel = useMemo(() => {
    const labelKey =
      SUPPORTED_LANGUAGES.find((language) => language.code === currentLanguage)
        ?.labelKey || "languages.en";
    return t(labelKey);
  }, [currentLanguage, t]);

  const styles = variantMap[variant] || variantMap.dark;

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex items-center gap-2 whitespace-nowrap font-poppins ${className}`}
    >
      <label
        id={labelId}
        htmlFor={selectId}
        className={`text-xs font-medium ${styles.label}`}
      >
        {t("languageSwitcher.label")}
      </label>

      <div className="relative">
        <button
          type="button"
          id={selectId}
          aria-label={t("languageSwitcher.ariaLabel")}
          aria-labelledby={`${labelId} ${selectId}`}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-describedby={statusId}
          onClick={() => setIsOpen((prev) => !prev)}
          onKeyDown={(event) => {
            if (event.key === "Escape") setIsOpen(false);
          }}
          className={`inline-flex items-center gap-2 rounded-[10px] border px-3 py-1.5 text-sm font-medium whitespace-nowrap outline-none transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 ${styles.trigger}`}
        >
          <span>{currentLanguageLabel}</span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
            className={`transition-transform duration-200 ${
              isOpen ? "rotate-180" : "rotate-0"
            }`}
          >
            <path
              d="M5 7.5L10 12.5L15 7.5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div
          className={`absolute right-0 z-30 mt-1 w-full min-w-[110px] origin-top-right rounded-[12px] border shadow-md overflow-hidden transition-all duration-200 ${styles.menu} ${
            isOpen
              ? "translate-y-0 scale-100 opacity-100"
              : "pointer-events-none -translate-y-1 scale-95 opacity-0"
          }`}
        >
          <ul role="listbox" aria-label={t("languageSwitcher.ariaLabel")}>
            {SUPPORTED_LANGUAGES.map((language) => {
              return (
                <li key={language.code} role="presentation">
                  <button
                    type="button"
                    role="option"
                    aria-selected={language.code === currentLanguage}
                    onClick={() => handleLanguageChange(language.code)}
                    className="flex w-full items-center px-3 py-2 text-left text-sm whitespace-nowrap bg-white text-[var(--color-primary-100)] transition-colors hover:bg-[var(--color-primary-100)] hover:text-white focus-visible:bg-[var(--color-primary-100)] focus-visible:text-white"
                  >
                    {t(language.labelKey)}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <span id={statusId} className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </span>
    </div>
  );
};

export default LanguageSwitcher;
