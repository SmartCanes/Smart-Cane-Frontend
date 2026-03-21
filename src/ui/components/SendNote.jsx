import { useState } from "react";
import { Icon } from "@iconify/react";
import Toast from "./Toast";
import { validateField } from "@/utils/ValidationHelper";
import { wsApi } from "@/api/ws-api";
import { useDevicesStore, useRealtimeStore } from "@/stores/useStore";
import { useTranslation } from "react-i18next";

const SendNote = () => {
  const { t } = useTranslation("pages");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { selectedDevice } = useDevicesStore();
  const { componentHealth } = useRealtimeStore();
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    variant: "default"
  });
  const [errors, setErrors] = useState({
    message: ""
  });

  const maxLength = 500;

  const hasErrors = () => {
    return Object.values(errors).some((error) => error);
  };

  const handleSend = async () => {
    const error = validateField("message", message);
    setErrors((prev) => ({ ...prev, message: error || "" }));

    if (error && error.trim() !== "") {
      setModalConfig({
        isOpen: true,
        title: t("sendNote.toast.errorTitle"),
        message: error,
        variant: "error"
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await wsApi.sendNotes(message);

      console.log(response);

      if (!response.success) {
        throw new Error("Failed to send message");
      }

      setModalConfig({
        isOpen: true,
        title: t("sendNote.toast.sentTitle"),
        message: t("sendNote.toast.sentMessage"),
        variant: "success"
      });
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      setModalConfig({
        isOpen: true,
        title: t("sendNote.toast.errorTitle"),
        message: t("sendNote.toast.errorMessage"),
        variant: "error"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm p-6 w-full font-poppins">
        <h3 className="text-xl font-semibold text-gray-900 mb-1">{t("sendNote.title")}</h3>
        <p className="text-sm text-gray-500 mb-6">
          {t("sendNote.description", {
            name: selectedDevice?.vip?.firstName || t("sendNote.defaultRecipient")
          })}
        </p>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("sendNote.messageLabel")}
          </label>
          <textarea
            className="w-full h-48 p-4 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-transparent text-sm text-gray-700 placeholder-gray-400"
            placeholder={t("sendNote.placeholder")}
            value={message}
            onChange={(e) => {
              const value = e.target.value;
              setMessage(value);

              const error = validateField("message", value);
              setErrors({ message: error || "" });
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            maxLength={maxLength}
          ></textarea>
        </div>

        <div className="flex justify-between items-center mb-6">
          <span className="text-xs text-gray-400">
            {t("sendNote.charactersCount", { count: message.length, max: maxLength })}
          </span>
        </div>

        <div className="flex gap-3">
          <button
            disabled={isSubmitting}
            onClick={() => setMessage("")}
            className={`flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-sm sm:text-base text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {t("sendNote.cancel")}
          </button>
          <button
            disabled={
              !componentHealth.raspberryPiStatus || isSubmitting || hasErrors()
            }
            onClick={handleSend}
            className="flex items-center justify-center gap-2 flex-1 px-6 py-3 rounded-xl text-sm font-medium text-white bg-primary-100 hover:bg-primary-200 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon icon="solar:plain-bold" className="text-lg rotate-45" />
            {isSubmitting ? (
              t("sendNote.sending")
            ) : (
              <>
                <span className="sm:hidden">{t("sendNote.send")}</span>
                <span className="hidden sm:inline">{t("sendNote.sendNote")}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {modalConfig.isOpen && (
        <Toast
          type={modalConfig.variant}
          message={modalConfig.message}
          position="bottom-right"
          onClose={() =>
            setModalConfig({
              isOpen: false,
              title: "",
              message: "",
              variant: "default"
            })
          }
        />
      )}
    </>
  );
};

export default SendNote;
