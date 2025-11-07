import React from 'react';
import { Icon } from '@iconify/react';

const QuickActions = () => {
  return (
  <div className="bg-white rounded-2xl shadow-sm p-6 w-full font-poppins">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        Quick Actions
      </h3>
      <div className="space-y-3">
        {/* Emergency SOS Button */}
        <button className="w-full bg-[#EF4444] text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors hover:bg-red-600">
          <Icon icon="ph:warning-fill" className="text-xl" />
          <span>Emergency SOS</span>
        </button>

        {/* Find My Cane Button */}
        <button className="w-full bg-[#3B82F6] text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors hover:bg-blue-600">
          <Icon icon="ph:magnifying-glass-bold" className="text-xl" />
          <span>Find My Cane</span>
        </button>

        {/* Send Voice Note Button */}
        <button className="w-full bg-[#22C55E] text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors hover:bg-green-600">
          <Icon icon="ph:microphone-fill" className="text-xl" />
          <span>Send Voice Note</span>
        </button>
      </div>
    </div>
  );
};

export default QuickActions;
