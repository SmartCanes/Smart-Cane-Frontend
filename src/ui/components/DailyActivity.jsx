import { useState } from "react";
import { Icon } from "@iconify/react";

const DailyActivity = () => {
  const [activeTab, setActiveTab] = useState("Today");

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 w-full font-poppins">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-800">Daily Activity</h3>
        <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
          {["Today", "Week", "Month"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-lg transition-colors ${
                activeTab === tab
                  ? "bg-gray-100 text-gray-800"
                  : "hover:bg-gray-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Cards */}
      <div className="space-y-4">
        {/* Distance Card */}
        <div className="bg-gray-50/70 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 flex-shrink-0 bg-[#16A34A]/20 rounded-lg flex items-center justify-center">
              <Icon
                icon="fa7-solid:route"
                className="text-[#16A34A] text-2xl"
              />
            </div>
            <div>
              <p className="font-medium text-gray-800">Distance</p>
              <p className="text-gray-500 text-sm">Total walked today</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-800">1.8</p>
            <p className="text-gray-500 text-sm">kilometers</p>
          </div>
        </div>

        {/* Active Time Card */}
        <div className="bg-gray-50/70 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 flex-shrink-0 bg-[#EA580C]/20 rounded-lg flex items-center justify-center">
              <Icon
                icon="tabler:clock-filled"
                className="text-[#EA580C] text-2xl"
              />
            </div>
            <div>
              <p className="font-medium text-gray-800">Active Time</p>
              <p className="text-gray-500 text-sm">Movement duration</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-800">45</p>
            <p className="text-gray-500 text-sm">minutes</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyActivity;
