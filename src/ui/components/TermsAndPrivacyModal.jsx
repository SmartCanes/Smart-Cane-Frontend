import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";

const TermsAndPrivacyModal = ({
  isOpen,
  onClose,
  onAccept,
  scrollTo,
  isChecked,
  setIsChecked
}) => {
  const termsRef = useRef(null);
  const privacyRef = useRef(null);

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
              <h2 className="text-2xl font-bold">Terms and Privacy Policy</h2>
              <button onClick={onClose}>
                <Icon icon="ph:x-bold" className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 text-sm space-y-10">
              {/* TERMS AND CONDITIONS */}
              <section ref={termsRef} id="terms">
                <h3 className="text-lg font-semibold mb-3">
                  Terms and Conditions
                </h3>

                <p className="mb-3">
                  By using, testing, or participating in the IoT-Enabled Smart
                  Cane with AI-Based Visual Recognition and Route Navigation
                  (“the System”), the user and/or their authorized guardian
                  agrees to be bound by these Terms and Conditions.
                </p>

                <p className="mb-3">
                  The System is a research prototype designed to enhance the
                  mobility, safety, and independence of visually impaired
                  individuals. It is intended to assist navigation and hazard
                  awareness but does not replace personal judgment, mobility
                  training, or human assistance.
                </p>

                <p className="mb-3">
                  The System utilizes short-range sensors, AI-based visual
                  recognition, GPS tracking, route navigation, haptic feedback,
                  and one-way voice alerts. Due to technical and environmental
                  factors, the System may experience delays, inaccuracies, or
                  service interruptions.
                </p>

                <p className="mb-3">
                  Users acknowledge that obstacle detection is limited to sensor
                  range, AI recognition may not be fully accurate, and GPS and
                  navigation features depend on network availability and signal
                  conditions. The System does not guarantee complete avoidance
                  of hazards.
                </p>

                <p className="mb-3">
                  Users must remain attentive at all times and are responsible
                  for their own safety during navigation. Guardians or
                  caregivers agree to use monitoring, messaging, and location
                  features solely for safety and support purposes.
                </p>

                <p className="mb-3">
                  The emergency SOS feature is intended to assist in emergency
                  situations by sending alerts and location data to designated
                  contacts. Successful delivery depends on mobile network
                  coverage and sufficient SIM load. Immediate response is not
                  guaranteed.
                </p>

                <p className="mb-3">
                  Participation in system testing, surveys, and evaluations is
                  voluntary. Participants may withdraw at any time without
                  penalty. The system is not intended for commercial use.
                </p>

                <p>
                  To the maximum extent permitted by law, the developers,
                  researchers, and affiliated institutions shall not be held
                  liable for injuries, losses, navigation errors, system
                  failures, or damages arising from the use or misuse of the
                  System.
                </p>
              </section>

              {/* PRIVACY POLICY */}
              <section ref={privacyRef} id="privacy">
                <h3 className="text-lg font-semibold mb-3">Privacy Policy</h3>

                <p className="mb-3">
                  The System collects and processes personal data necessary for
                  system functionality, safety monitoring, emergency response,
                  and academic research purposes. Collected data may include GPS
                  location, system usage logs, device identifiers, and guardian
                  contact information.
                </p>

                <p className="mb-3">
                  All personal data is processed in compliance with the Data
                  Privacy Act of 2012 (Republic Act No. 10173). Reasonable
                  organizational, physical, and technical security measures are
                  implemented to protect collected data against unauthorized
                  access, loss, or misuse.
                </p>

                <p className="mb-3">
                  Location data is used to support route navigation, guardian
                  monitoring, and emergency SOS alerts. Real-time tracking
                  features require an active internet connection and may be
                  limited in areas with weak or no network coverage.
                </p>

                <p className="mb-3">
                  Collected data shall be retained only for the duration
                  necessary to fulfill research objectives and system
                  evaluation. Data used for analysis will be anonymized and
                  aggregated to protect participant identity.
                </p>

                <p className="mb-3">
                  Data subjects have the right to be informed, access, correct,
                  object to processing, and withdraw consent regarding their
                  personal data at any time by coordinating with the project
                  researchers or system administrators.
                </p>

                <p>
                  While reasonable safeguards are applied, no system can
                  guarantee absolute data security. By using the System, users
                  acknowledge and accept these inherent risks.
                </p>
              </section>

              {/* CONSENT */}
              <label className="flex gap-3 p-4 border rounded-lg bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => setIsChecked(e.target.checked)}
                />
                <span>
                  I confirm that the Terms and Conditions and Privacy Policy
                  have been read and explained to me. I voluntarily consent to
                  the collection and processing of my personal data and assume
                  the risks associated with using this research prototype.
                </span>
              </label>
            </div>

            {/* Footer */}
            <div className="p-6 border-t flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 border px-4 py-2 rounded-lg cursor-pointer"
              >
                Cancel
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
                Accept
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TermsAndPrivacyModal;
