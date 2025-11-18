import { createRef, useEffect, useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import SidebarContent from "@/ui/components/SidebarContent";
import { Link } from "react-router-dom";

const ScanQR = () => {
  const [paused, setPaused] = useState(false);
  const [hasCamera, setHasCamera] = useState(false);
  const [scannedCode, setScannedCode] = useState(null);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(() => setHasCamera(true))
      .catch(() => setHasCamera(false));
  }, []);

  const handleScan = (result) => {
    if (result) {
      setScannedCode(result);
    }
  };

  const handleError = (error) => {
    console.error("QR Scanner Error:", error?.message);
  };

  const highlightCodeOnCanvas = (detectedCodes, ctx) => {
    detectedCodes.forEach((detectedCode) => {
      const { boundingBox, cornerPoints } = detectedCode;

      // Draw bounding box
      ctx.strokeStyle = "#00FF00";
      ctx.lineWidth = 4;
      ctx.strokeRect(
        boundingBox.x,
        boundingBox.y,
        boundingBox.width,
        boundingBox.height
      );

      // Draw corner points
      ctx.fillStyle = "#FF0000";
      cornerPoints.forEach((point) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
        ctx.fill();
      });
    });
  };

  const PREFIX = "SC-";
  const SERIAL_LENGTH = 6;
  const [serial, setSerial] = useState(Array(SERIAL_LENGTH).fill(""));

  const inputRefs = Array(SERIAL_LENGTH)
    .fill(0)
    .map(() => createRef());

  const handleChange = (index, value) => {
    if (/^\d?$/.test(value)) {
      const newSerial = [...serial];
      newSerial[index] = value;
      setSerial(newSerial);

      // Auto-focus next input
      if (value && index < SERIAL_LENGTH - 1) {
        inputRefs[index + 1].current.focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !serial[index] && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col sm:flex-row">
      <SidebarContent />
      <div className="relative flex flex-col w-full flex-1">
        <Link to="/">
          <div className="sm:hidden py-4 flex gap-2 absolute top-0 left-4">
            <img
              src="src/assets/images/smartcane-logo-blue.png"
              alt="Smart Cane Logo"
              className="object-contain w-[45px]"
            />
          </div>
        </Link>

        {hasCamera ? (
          <div className="w-full h-1/2 sm:h-2/3 mt-24 sm:mt-0 relative bg-white border border-gray-300 overflow-hidden">
            <h1 className="text-3xl font-semibold text-gray-800 text-center">
              Scan To Continue
            </h1>
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
            />
          </div>
        ) : (
          <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <p className="text-gray-500 text-center">
              No camera detected. Please use a device with a camera.
            </p>
          </div>
        )}

        <div className="flex items-center my-4">
          <div className="flex-grow h-px bg-gray-300"></div>
          <span className="mx-3 text-gray-500 font-medium">or</span>
          <div className="flex-grow h-px bg-gray-300"></div>
        </div>

        <div className="flex flex-col items-center mt-4">
          <span className="mb-2 text-gray-700 font-medium">
            Enter Serial Code
          </span>
          <div className="flex items-center space-x-2">
            <span className="text-gray-700 font-semibold">{PREFIX}</span>
            {serial.map((digit, index) => (
              <input
                key={index}
                ref={inputRefs[index]}
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
        </div>

        {scannedCode && (
          <div className="mt-6 w-full max-w-md bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-gray-500 font-medium">Scanned QR Code:</p>
            <p className="mt-2 text-lg font-semibold text-blue-600 break-words">
              {scannedCode}
            </p>
          </div>
        )}
      </div>

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
    </div>
  );
};

export default ScanQR;
