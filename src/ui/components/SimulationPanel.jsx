// src/ui/components/SimulationPanel.jsx
import { useState } from "react";
import { triggerSmartCaneNotification } from "@/utils/NotificationManager";
import { Icon } from "@iconify/react";

const SimulationPanel = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2">
      
      {/* Toggle Button (Para matago mo yung panel) */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700"
        title="Open Simulation Tools"
      >
        <Icon icon="eos-icons:hardware-circuit" className="text-xl" />
      </button>

      {/* Control Panel */}
      {isOpen && (
        <div className="bg-white p-4 rounded-xl shadow-2xl border border-gray-200 w-64 flex flex-col gap-3 animate-fade-in-up">
          <h3 className="font-bold text-gray-700 text-sm border-b pb-2">
            Hardware Simulation
          </h3>
          
          {/* SIMULATE ARRIVAL */}
          <button
            onClick={() => triggerSmartCaneNotification("ARRIVAL", "The VIP has arrived at SM North EDSA.")}
            className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-green-200 transition"
          >
            <Icon icon="carbon:location-filled" />
            Simulate Arrival
          </button>

          {/* SIMULATE SOS / FALL DETECTION */}
          <button
            onClick={() => triggerSmartCaneNotification("SOS", "ALERT: Fall detected! Location sent to guardians.")}
            className="flex items-center gap-2 bg-red-100 text-red-700 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-red-200 transition"
          >
            <Icon icon="bx:error" />
            Simulate Fall / SOS
          </button>
          
          <p className="text-[10px] text-gray-400 text-center mt-1">
            Use these buttons to test notifications without hardware.
          </p>
        </div>
      )}
    </div>
  );
};

export default SimulationPanel;