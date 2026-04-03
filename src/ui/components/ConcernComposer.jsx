import { useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { AnimatePresence, motion } from "framer-motion";
import { api } from "@/api";

const getCooldownWindowMs = (sendCount) => {
  if (sendCount === 1) return 60 * 1000;
  if (sendCount === 2) return 5 * 60 * 1000;
  if (sendCount >= 3) return 60 * 60 * 1000;
  return 0;
};

const formatCooldownMessage = (remainingMs) => {
  const remainingMinutes = Math.ceil(remainingMs / (60 * 1000));
  return `Please wait ${remainingMinutes} minute(s) before sending again.`;
};

const buildDefaultName = (prefillName) => {
  if (!prefillName) return "";
  return String(prefillName).trim();
};

const buildDefaultEmail = (prefillEmail) => {
  if (!prefillEmail) return "";
  return String(prefillEmail).trim();
};

export default function ConcernComposer({
  mode = "inline",
  sourceKey = "guest-landing",
  prefillName = "",
  prefillEmail = "",
  lockEmail = false,
  title = "Send us a message",
  subtitle = "Share your concern with our team and we will respond as soon as possible.",
  className = ""
}) {
  const initialFormData = useMemo(
    () => ({
      name: buildDefaultName(prefillName),
      email: buildDefaultEmail(prefillEmail),
      message: ""
    }),
    [prefillName, prefillEmail]
  );

  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [formStatus, setFormStatus] = useState({
    submitting: false,
    success: false,
    error: "",
    cooldownMsg: ""
  });

  const storageNamespace = `contactRate:${sourceKey}`;

  const updateField = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData(initialFormData);
  };

  const clearTransientMessage = () => {
    window.setTimeout(() => {
      setFormStatus((prev) => ({
        ...prev,
        success: false,
        error: "",
        cooldownMsg: ""
      }));
    }, 4500);
  };

  const submitConcern = async (event) => {
    event.preventDefault();

    const now = Date.now();
    const emailKey = (formData.email || "anonymous").toLowerCase();
    const storageKey = `${storageNamespace}:${emailKey}`;

    const lastSendTime = Number.parseInt(
      localStorage.getItem(`${storageKey}:lastSendTime`) || "0",
      10
    );
    const sendCount = Number.parseInt(
      localStorage.getItem(`${storageKey}:sendCount`) || "0",
      10
    );

    const cooldownWindowMs = getCooldownWindowMs(sendCount);
    const elapsed = now - lastSendTime;

    if (sendCount > 0 && elapsed < cooldownWindowMs) {
      setFormStatus({
        submitting: false,
        success: false,
        error: "",
        cooldownMsg: formatCooldownMessage(cooldownWindowMs - elapsed)
      });
      clearTransientMessage();
      return;
    }

    setFormStatus({ submitting: true, success: false, error: "", cooldownMsg: "" });

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        message: formData.message.trim(),
        source: sourceKey
      };

      const response = await api.post("/contact", payload);

      if (response.status === 200 || response.status === 201) {
        localStorage.setItem(`${storageKey}:lastSendTime`, now.toString());
        localStorage.setItem(`${storageKey}:sendCount`, String(sendCount + 1));

        setFormStatus({
          submitting: false,
          success: true,
          error: "",
          cooldownMsg: ""
        });

        resetForm();
        clearTransientMessage();
        return;
      }

      throw new Error(response?.data?.error || "Submission failed");
    } catch (error) {
      const apiError = error?.response?.data?.error;
      setFormStatus({
        submitting: false,
        success: false,
        error: apiError || "Something went wrong. Please try again.",
        cooldownMsg: ""
      });
      clearTransientMessage();
    }
  };

  const formMarkup = (
    <form onSubmit={submitConcern} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`concern-name-${sourceKey}`} className="mb-1 block text-sm font-medium text-[#1C253C]">
            Name *
          </label>
          <input
            type="text"
            id={`concern-name-${sourceKey}`}
            name="name"
            value={formData.name}
            onChange={updateField}
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-[#1C253C] transition focus:border-[#11285A] focus:outline-none focus:ring-2 focus:ring-[#11285A]/20"
          />
        </div>

        <div>
          <label htmlFor={`concern-email-${sourceKey}`} className="mb-1 block text-sm font-medium text-[#1C253C]">
            Email *
          </label>
          <input
            type="email"
            id={`concern-email-${sourceKey}`}
            name="email"
            value={formData.email}
            onChange={updateField}
            readOnly={lockEmail}
            required
            className={`w-full rounded-lg border border-gray-300 px-4 py-3 text-[#1C253C] transition focus:border-[#11285A] focus:outline-none focus:ring-2 focus:ring-[#11285A]/20 ${lockEmail ? "bg-gray-50" : ""}`}
          />
        </div>
      </div>

      <div>
        <label htmlFor={`concern-message-${sourceKey}`} className="mb-1 block text-sm font-medium text-[#1C253C]">
          Message *
        </label>
        <textarea
          id={`concern-message-${sourceKey}`}
          name="message"
          rows={5}
          value={formData.message}
          onChange={updateField}
          required
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-[#1C253C] transition focus:border-[#11285A] focus:outline-none focus:ring-2 focus:ring-[#11285A]/20"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 text-sm">
          {formStatus.success && (
            <p className="font-medium text-green-600">
              Thank you! Your message has been sent.
            </p>
          )}
          {formStatus.error && (
            <p className="font-medium text-red-600">{formStatus.error}</p>
          )}
          {formStatus.cooldownMsg && (
            <p className="font-medium text-amber-600">{formStatus.cooldownMsg}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={formStatus.submitting}
          className="flex w-full items-center justify-center rounded-[10px] bg-[#1C253C] px-8 py-3 font-medium text-white transition-all hover:bg-[#0d1c3f] active:scale-95 active:bg-[#0a1630] disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto sm:min-w-[180px]"
        >
          {formStatus.submitting ? (
            <>
              <Icon icon="mdi:loading" className="mr-2 animate-spin text-xl" />
              Sending...
            </>
          ) : (
            "Send Message"
          )}
        </button>
      </div>
    </form>
  );

  if (mode === "floating") {
    return (
      <>
        {!isOpen && (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="fixed right-4 bottom-[calc(var(--mobile-nav-height)+env(safe-area-inset-bottom)+0.75rem)] md:right-6 md:bottom-6 z-[60] inline-flex items-center gap-2 rounded-full bg-[#11285A] px-4 py-3 text-white shadow-[0_16px_40px_rgba(17,40,90,0.35)] transition-transform duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#11285A] focus-visible:ring-offset-2"
            aria-label="Open concern form"
          >
            <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
              <span className="absolute inset-0 animate-ping rounded-full bg-white/25" aria-hidden="true" />
              <Icon icon="material-symbols:contact-support-rounded" className="relative text-2xl" />
            </span>
            <span className="hidden text-sm font-semibold tracking-wide sm:inline">Raise Concern</span>
          </button>
        )}

        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-4 backdrop-blur-sm sm:items-center"
              onClick={() => setIsOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/30 bg-[#FDFCF9] shadow-2xl"
                onClick={(event) => event.stopPropagation()}
                initial={{ y: 40, opacity: 0, scale: 0.96 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 40, opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <div className="flex items-center justify-between bg-gradient-to-r from-[#11285A] to-[#1C253C] px-5 py-4 text-white">
                  <div className="flex items-center gap-3">
                    <Icon icon="material-symbols:contact-support-rounded" className="text-2xl" />
                    <div>
                      <h3 className="text-base font-semibold sm:text-lg">Raise a Concern</h3>
                      <p className="text-xs text-white/80 sm:text-sm">We are here to listen and support you.</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="rounded-full p-1 text-white/80 transition hover:bg-white/15 hover:text-white"
                    aria-label="Close concern form"
                  >
                    <Icon icon="ph:x-bold" className="text-xl" />
                  </button>
                </div>

                <div className="p-4 sm:p-6">
                  {formMarkup}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <div className={`rounded-2xl border border-gray-100 bg-white p-6 shadow-lg sm:p-8 ${className}`}>
      <h3 className="mb-2 text-center text-2xl font-semibold text-[#11285A] sm:text-left">{title}</h3>
      <p className="mb-6 text-center text-sm text-[#4B5563] sm:text-left">{subtitle}</p>
      {formMarkup}
    </div>
  );
}
