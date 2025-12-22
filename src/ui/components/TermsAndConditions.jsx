import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";

const TermsAndConditions = ({ isOpen, onClose, onAccept }) => {
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsChecked(false);
    }
  }, [isOpen]);

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col font-poppins"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                Terms and Conditions
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition cursor-pointer"
              >
                <Icon icon="ph:x-bold" className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 text-gray-700">
              <div className="space-y-6 text-sm leading-relaxed">
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    1. Acceptance of Terms
                  </h3>
                  <p>
                    By using, testing, or participating in the IoT-Enabled Smart
                    Cane system, including the smart cane device, companion web
                    application, and related services (“the System”), the user
                    and/or their guardian or caregiver agree to be bound by
                    these Terms and Conditions. If you do not agree, you must
                    discontinue use of the System.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    2. Purpose of the System
                  </h3>
                  <p>
                    The System is a research and assistive technology prototype
                    designed to improve mobility, safety, and independence of
                    visually impaired individuals. It is intended to supplement,
                    not replace, personal judgment, mobility training, or human
                    assistance.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    3. Intended Users
                  </h3>
                  <p>
                    The System is intended for visually impaired individuals and
                    authorized guardians or caregivers. Users who cannot provide
                    informed consent may only use the System with the approval
                    and supervision of a legal guardian.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    4. System Limitations and Disclaimer
                  </h3>
                  <p>
                    The User acknowledges that obstacle detection is limited to
                    short-range sensing, AI-based visual recognition may produce
                    inaccuracies, and GPS/navigation performance depends on
                    network availability and environmental conditions. The
                    System does not guarantee complete hazard avoidance or
                    uninterrupted operation.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    5. Safety and User Responsibility
                  </h3>
                  <p>
                    Users must remain attentive while navigating and should not
                    rely solely on the System in dangerous or unfamiliar
                    environments. Guardians agree to use monitoring and
                    messaging features responsibly and only for safety-related
                    purposes.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    6. Emergency SOS Feature
                  </h3>
                  <p>
                    The SOS feature is intended to assist in emergencies by
                    sending alerts and location information to designated
                    contacts. Successful delivery depends on mobile network
                    coverage and sufficient SIM load. Immediate response is not
                    guaranteed.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    7. Data Collection and Privacy
                  </h3>
                  <p>
                    The System may collect GPS location data, system usage logs,
                    and alert-related information solely for system
                    functionality, monitoring, and research evaluation. While
                    reasonable safeguards are applied, complete data security
                    cannot be guaranteed.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    8. Research Participation
                  </h3>
                  <p>
                    Participation in system testing, surveys, and evaluations is
                    voluntary. Participants may withdraw at any time without
                    penalty. Collected data will be anonymized and used strictly
                    for academic and research purposes.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    9. Limitation of Liability
                  </h3>
                  <p>
                    To the maximum extent permitted by law, the developers and
                    affiliated institutions shall not be held liable for
                    injuries, damages, navigation errors, system failures, or
                    data loss arising from the use or misuse of the System.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    10. Intellectual Property
                  </h3>
                  <p>
                    All software, hardware designs, algorithms, and
                    documentation related to the System remain the intellectual
                    property of the project developers. Unauthorized
                    reproduction or commercial use is prohibited.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    11. Modifications and Termination
                  </h3>
                  <p>
                    These Terms may be updated as the project evolves. Continued
                    use constitutes acceptance of updated terms. Access to the
                    System may be discontinued in cases of misuse or upon
                    completion of the research study.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    12. Governing Principles
                  </h3>
                  <p>
                    These Terms are governed by ethical research standards,
                    assistive technology principles, and applicable local laws
                    and institutional guidelines.
                  </p>
                </section>

                <section>
                  <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
                    <input
                      type="checkbox"
                      className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      checked={isChecked}
                      onChange={(e) => setIsChecked(e.target.checked)}
                    />
                    <span className="text-sm text-gray-700 select-none">
                      I confirm that the Terms and Conditions have been read and
                      explained to me in a language I understand. I voluntarily
                      assume the risks associated with using this prototype
                      device.
                    </span>
                  </label>
                </section>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-6 border-t border-gray-200">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                disabled={!isChecked}
                onClick={() => {
                  if (isChecked) {
                    onAccept && onAccept();
                    onClose();
                  }
                }}
                className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors font-bold cursor-pointer ${
                  isChecked
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-gray-400 cursor-not-allowed opacity-70"
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

export default TermsAndConditions;
