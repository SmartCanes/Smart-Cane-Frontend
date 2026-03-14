import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState
} from "react";
import Toast from "@/ui/components/Toast";

const ToastContext = createContext({
  showToast: () => {},
  clearToast: () => {}
});

ToastContext.displayName = "ToastContext";

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);

  const showToast = useCallback(
    ({
      message,
      type = "info",
      position = "bottom-right",
      duration = 3000
    }) => {
      if (!message) return;

      setToast({
        key: Date.now(),
        message,
        type,
        position,
        duration
      });
    },
    []
  );

  const clearToast = useCallback(() => {
    setToast(null);
  }, []);

  const handleClose = useCallback(() => setToast(null), []);

  const value = useMemo(
    () => ({ showToast, clearToast }),
    [showToast, clearToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast && (
        <Toast
          key={toast.key}
          message={toast.message}
          type={toast.type}
          position={toast.position}
          duration={toast.duration}
          onClose={handleClose}
        />
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
