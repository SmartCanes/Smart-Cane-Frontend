import { createRef, useEffect, useState, useRef } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { pairDevice } from "@/api/backendService";
import PrimaryButton from "./PrimaryButton";
import Toast from "./Toast";
import { useRegisterStore } from "@/stores/useRegisterStore";
import { useNavigate } from "react-router-dom";
import ValidationModal from "./ValidationModal";

const PREFIX = "SC-";
const SERIAL_LENGTH = 6;

const ScannerCamera = ({ onScan }) => {
  const navigate = useNavigate();
  const guardianId = useRegisterStore((state) => state.guardianId);
  const clearStore = useRegisterStore((state) => state.clearStore);
  const [paused, setPaused] = useState(false);
  const [hasCamera, setHasCamera] = useState(false);
  const [scannedCode, setScannedCode] = useState(null);
  const [serial, setSerial] = useState(Array(SERIAL_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({
    showToast: false,
    message: "",
    type: ""
  });
  const [modalConfig, setModalConfig] = useState({
    visible: false,
    type: null,
    position: "center"
  });

  const inputRefs = useRef([...Array(SERIAL_LENGTH)].map(() => createRef()));

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(() => setHasCamera(true))
      .catch(() => setHasCamera(false));
  }, []);

  const handleScan = (detectedCodes) => {
    if (detectedCodes && detectedCodes.length > 0) {
      const code = detectedCodes[0].rawValue;

      let device_serial = null;

      try {
        const url = new URL(code);
        device_serial = url.searchParams.get("device_serial");
      } catch (e) {
        console.warn("Scanned code is not a URL");
      }

      if (!device_serial) {
        console.error("No device_serial found in QR");
        return;
      }

      setScannedCode(device_serial);

      if (onScan) {
        onScan(device_serial);
      } else {
        handlePair(device_serial);
      }
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
  };

  const handlePair = async (code) => {
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
        guardian_id: guardianId
      });
      if (!res.success) return;
      clearStore();
      setModalConfig({
        visible: true,
        type: "account-created",
        position: "center",
        title: "Device Paired",
        message: "The device has been successfully paired. You can now log in."
      });
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
    setScannedCode(code);
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

        <div className="flex flex-col items-center gap-5">
          <span className="mb-2 text-gray-700 font-medium">
            Enter Serial Code
          </span>
          <div className="flex items-center space-x-2">
            <span className="text-gray-700 font-semibold">{PREFIX}</span>
            {serial.map((digit, index) => (
              <input
                key={index}
                ref={inputRefs.current[index]}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onFocus={() => setPaused(true)}
                onBlur={() => setPaused(false)}
                className="w-10 h-12 text-center border border-gray-300 rounded-md text-lg font-mono focus:border-blue-500 focus:outline-none"
              />
            ))}
          </div>
          <PrimaryButton
            variant="primary"
            text={loading ? "Pairing..." : "Pair"}
            onClick={handleManualPair}
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
          />
        </div>
      </div>

      {toast.showToast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast({ ...toast, showToast: false })}
        />
      )}

      {modalConfig.visible && (
        <ValidationModal
          type={modalConfig.type}
          position={modalConfig.position}
          onAction={() => {
            if (modalConfig.type === "account-created") navigate("/login");
            setModalConfig({ ...modalConfig, visible: false });
          }}
          email={modalConfig.email}
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
