import { createRef, useEffect, useState, useRef } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { pairDevice } from "@/api/backendService";
import PrimaryButton from "./PrimaryButton";
import Toast from "./Toast";

const PREFIX = "SC-";
const SERIAL_LENGTH = 6;

const ScannerCamera = ({ onSuccess, showOnSuccessToast, guardianId }) => {
  const [paused, setPaused] = useState(false);
  const [hasCamera, setHasCamera] = useState(false);
  const [serial, setSerial] = useState(Array(SERIAL_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({
    showToast: false,
    message: "",
    type: ""
  });

  const inputRefs = useRef([...Array(SERIAL_LENGTH)].map(() => createRef()));
  const [lastError, setLastError] = useState(null);
  const lastScannedCodeRef = useRef(null);
  const scanCooldownRef = useRef(false);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(() => setHasCamera(true))
      .catch(() => setHasCamera(false));
  }, []);

  const handleScan = (detectedCodes) => {
    if (scanCooldownRef.current || paused) return;

    if (detectedCodes && detectedCodes.length > 0) {
      const code = detectedCodes[0].rawValue;

      if (lastError?.code !== code) {
        setLastError(null);
      }

      if (lastError?.code === code) {
        console.log("Skipping previously failed code:", code);
        return;
      }

      scanCooldownRef.current = true;
      lastScannedCodeRef.current = code;

      setPaused(true);

      let device_serial = null;

      try {
        const url = new URL(code);
        device_serial = url.searchParams.get("device_serial");
        console.log("Scanned device serial:", device_serial);
      } catch (e) {
        console.error("Error parsing QR code as URL:", e);
        setToast({
          showToast: true,
          message: "Invalid QR code format",
          type: "error"
        });
        setLastError({ code, message: "Invalid QR code format" });
        setTimeout(() => {
          scanCooldownRef.current = false;
          setPaused(false);
          setLastError(null);
        }, 2000);
        return;
      }

      if (!device_serial) {
        setToast({
          showToast: true,
          message: "No device serial found in QR code",
          type: "error"
        });
        setLastError({ code, message: "No device serial found" });
        setTimeout(() => {
          scanCooldownRef.current = false;
          setPaused(false);
          setLastError(null);
        }, 2000);
        return;
      }

      handlePair(device_serial);

      setTimeout(() => {
        scanCooldownRef.current = false;
      }, 5000);
    }
  };

  const handleError = (error) => {
    console.error("QR Scanner Error:", error?.message);
  };

  const highlightCodeOnCanvas = (detectedCodes, ctx) => {
    detectedCodes.forEach((detectedCode) => {
      const { boundingBox, cornerPoints } = detectedCode;

      ctx.strokeStyle = "#00FF00";
      ctx.lineWidth = 4;
      ctx.strokeRect(
        boundingBox.x,
        boundingBox.y,
        boundingBox.width,
        boundingBox.height
      );

      ctx.fillStyle = "#FF0000";
      cornerPoints.forEach((point) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
        ctx.fill();
      });
    });
  };

  const handleChange = (index, value) => {
    if (/^\d?$/.test(value)) {
      const newSerial = [...serial];
      newSerial[index] = value;
      setSerial(newSerial);

      if (value && index < SERIAL_LENGTH - 1) {
        inputRefs.current[index + 1].current.focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !serial[index] && index > 0) {
      inputRefs.current[index - 1].current.focus();
    }

    if (e.key === "Enter") {
      e.preventDefault();

      if (!serial.includes("") && !loading && !toast.showToast) {
        handleManualPair();
      }
    }
  };

  const handlePair = async (code) => {
    const isDev = (import.meta.env.VITE_ENV || "development") === "development";
    if (isDev && code === "SC-000000") {
      onSuccess();
      return;
    }

    if (!guardianId) {
      setToast({
        showToast: true,
        message: "Registration is not complete. Cannot pair device.",
        type: "error"
      });
      return;
    }

    try {
      setLoading(true);
      setPaused(true);
      const res = await pairDevice({
        device_serial_number: code,
        guardian_id: guardianId || 0
      });

      if (!res.success) return;

      if (showOnSuccessToast) {
        setToast({
          showToast: true,
          message: "Device paired successfully!",
          type: "success"
        });
      }
      onSuccess();
    } catch (err) {
      setToast({
        showToast: true,
        message: err.response?.data?.message || "Failed to pair device",
        type: "error"
      });
    } finally {
      setLoading(false);
      setPaused(false);
    }
  };

  const handleManualPair = () => {
    const code = PREFIX + serial.join("");
    handlePair(code);
  };

  return (
    <>
      <div className="w-full max-w-xl h-full gap-5 flex flex-col">
        {hasCamera ? (
          <Scanner
            paused={paused}
            onScan={handleScan}
            onError={handleError}
            scanDelay={200}
            components={{
              tracker: highlightCodeOnCanvas,
              audio: true,
              torch: true,
              zoom: true,
              finder: true
            }}
            videoConstraints={{ facingMode: "environment" }}
          />
        ) : (
          <div className="text-gray-500 text-center h-full flex items-center justify-center">
            No camera detected. Please use a device with a camera.
          </div>
        )}

        <div className="flex items-center">
          <div className="flex-grow h-px bg-gray-300"></div>
          <span className="mx-3 text-gray-500 font-medium">or</span>
          <div className="flex-grow h-px bg-gray-300"></div>
        </div>

        <div className="w-full max-w-sm mx-auto flex flex-col items-center gap-5">
          <span className="mb-2 text-gray-700 font-medium">
            Enter Serial Code
          </span>
          <div className="grid grid-cols-7 gap-2 sm:gap-3 w-full items-center">
            <span className="text-gray-700 font-semibold sm:text-xl md:text-2xl w-full">
              {PREFIX}
            </span>
            {serial.map((digit, index) => (
              <input
                key={index}
                ref={inputRefs.current[index]}
                type="text"
                maxLength={1}
                value={digit}
                inputMode="numeric"
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onFocus={() => setPaused(true)}
                onBlur={() => setPaused(false)}
                className="h-12 w-full text-center border border-gray-300 rounded-md text-lg font-mono focus:border-blue-500 focus:outline-none"
              />
            ))}
          </div>
          <PrimaryButton
            variant="primary"
            text={loading ? "Pairing..." : "Pair"}
            onClick={handleManualPair}
            disabled={loading || toast.showToast || serial.includes("")}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
          />
        </div>
      </div>

      {toast.showToast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast((prev) => ({ ...prev, showToast: false }))}
        />
      )}

      <style>
        {`
          @keyframes scan {
            0% { top: 0%; }
            50% { top: 100%; }
            100% { top: 0%; }
          }
          .animate-scan {
            animation: scan 2s linear infinite;
          }
        `}
      </style>
    </>
  );
};

export default ScannerCamera;
