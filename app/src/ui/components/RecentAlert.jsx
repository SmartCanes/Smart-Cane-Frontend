import React from 'react';
import { Icon } from '@iconify/react';

const RecentAlerts = () => {
  return (
  <div className="bg-white rounded-2xl shadow-sm p-6 w-full font-poppins">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        Recent Alerts
      </h3>
      <div className="space-y-4">
        {/* Safe Arrival Alert */}
        <div className="bg-[#E9F9EE] border border-[#D4F4E0] rounded-xl p-4 flex items-start gap-4">
          <div className="w-10 h-10 flex-shrink-0 bg-[#16A34A]/10
           rounded-full flex items-center justify-center shadow-sm">
            <Icon icon="iconamoon:check-bold" className="text-[#16A34A] text-2xl" />
          </div>
          <div>
            <p className="font-medium text-[#166534] text-sm">Safe arrival notification</p>
            <p className="text-[#16A34A] text-xs">Arrived at destination - 10:30 AM</p> 
          </div>
        </div>

        {/* Weather Alert */}
  <div className="bg-[#FEF6E6] border border-[#FCEACC] rounded-xl p-4 flex items-start gap-4">
          <div className="w-10 h-10 flex-shrink-0 bg-[#EA580C]/10 rounded-full flex items-center justify-center shadow-sm">
            <Icon icon="fa7-solid:cloud-rain" className="text-[#EA580C] text-2xl" />
          </div>
          <div>
            <p className="font-semibold text-[#9A3412] text-sm">Weather alert</p>
            <p className="text-[#EA580C] text-xs">Rain expected in 30 minutes</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentAlerts;
