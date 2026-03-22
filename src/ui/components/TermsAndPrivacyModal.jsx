import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";
import { Trans, useTranslation } from "react-i18next";

const TermsAndPrivacyModal = ({
  isOpen,
  onClose,
  onAccept,
  scrollTo,
  isChecked,
  setIsChecked
}) => {
  const { t } = useTranslation("pages");
  const termsRef = useRef(null);
  const privacyRef = useRef(null);

  const termsParagraphKeys = [
    "p1",
    "p2",
    "p3",
    "p4",
    "p5",
    "p6",
    "p7",
    "p8"
  ];

  const termsBulletKeys = ["b1", "b2", "b3"];

  const privacyParagraphKeys = ["p1", "p2", "p3", "p4", "p5", "p6"];

  const privacyBulletKeys = ["b1", "b2", "b3"];

  const scrollToSection = (section) => {
    const target = section === "privacy" ? privacyRef.current : termsRef.current;
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        const target =
          scrollTo === "privacy" ? privacyRef.current : termsRef.current;

        target?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [isOpen, scrollTo]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold">{t("termsModal.title")}</h2>
              <button
                onClick={onClose}
                aria-label={t("termsModal.actions.close")}
                title={t("termsModal.actions.close")}
              >
                <Icon icon="ph:x-bold" className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 text-sm space-y-10">
              {/* TERMS AND CONDITIONS */}
              <section ref={termsRef} id="terms">
                <h3 className="text-lg font-semibold mb-3">
                  {t("termsModal.terms.title")}
                </h3>

                <div className="space-y-3">
                  {termsParagraphKeys.map((key) => (
                    <p key={key}>
                      <Trans
                        ns="pages"
                        i18nKey={`termsModal.terms.paragraphs.${key}`}
                        components={{
                          strong: <strong className="font-semibold" />,
                          link: (
                            <a
                              href="#privacy"
                              className="text-blue-600 underline"
                              onClick={(event) => {
                                event.preventDefault();
                                scrollToSection("privacy");
                              }}
                            />
                          )
                        }}
                      />
                    </p>
                  ))}
                </div>

                <ul className="list-disc pl-5 space-y-2 mt-4">
                  {termsBulletKeys.map((key) => (
                    <li key={key}>
                      <Trans
                        ns="pages"
                        i18nKey={`termsModal.terms.bullets.${key}`}
                        components={{ strong: <strong className="font-semibold" /> }}
                      />
                    </li>
                  ))}
                </ul>
              </section>

              {/* PRIVACY POLICY */}
              <section ref={privacyRef} id="privacy">
                <h3 className="text-lg font-semibold mb-3">
                  {t("termsModal.privacy.title")}
                </h3>

                <div className="space-y-3">
                  {privacyParagraphKeys.map((key) => (
                    <p key={key}>
                      <Trans
                        ns="pages"
                        i18nKey={`termsModal.privacy.paragraphs.${key}`}
                        components={{ strong: <strong className="font-semibold" /> }}
                      />
                    </p>
                  ))}
                </div>

                <ul className="list-disc pl-5 space-y-2 mt-4">
                  {privacyBulletKeys.map((key) => (
                    <li key={key}>
                      <Trans
                        ns="pages"
                        i18nKey={`termsModal.privacy.bullets.${key}`}
                        components={{ strong: <strong className="font-semibold" /> }}
                      />
                    </li>
                  ))}
                </ul>
              </section>

              {/* CONSENT */}
              <label className="flex gap-3 p-4 border rounded-lg bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => setIsChecked(e.target.checked)}
                />
                <span>
                  <Trans
                    ns="pages"
                    i18nKey="termsModal.consentLabel"
                    components={{ strong: <strong className="font-semibold" /> }}
                  />
                </span>
              </label>
            </div>

            {/* Footer */}
            <div className="p-6 border-t flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 border px-4 py-2 rounded-lg cursor-pointer"
              >
                {t("termsModal.actions.cancel")}
              </button>
              <button
                disabled={!isChecked}
                onClick={onAccept}
                className={`flex-1 px-4 py-2 rounded-lg text-white cursor-pointer ${
                  isChecked
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                {t("termsModal.actions.accept")}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TermsAndPrivacyModal;
