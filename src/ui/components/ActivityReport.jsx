import { useState } from "react";
import { Icon } from "@iconify/react";
import ActivityActions from "../ActivityActions";
import Header from "../Header";
import DashboardSide from "../DashboardSide";
import { useUserStore } from "@/stores/useStore";

// Dummy data to match the image
const activities = [
  {
    id: 1,
    user: {
      name: "John Smith",
      email: "john.smith@icane.com",
      avatar: "https://i.pravatar.cc/150?u=john",
    },
    type: "login",
    description: "Successfully logged in from desktop",
    timestamp: "Today at 2:45 PM",
  },
  {
    id: 2,
    user: {
      name: "Sarah Johnson",
      email: "sarah.j@icane.com",
      avatar: "https://i.pravatar.cc/150?u=sarah",
    },
    type: "settings",
    description: "Updated notification preferences",
    timestamp: "Today at 1:30 PM",
  },
  {
    id: 3,
    user: {
      name: "Emily Davis",
      email: "emily.d@icane.com",
      avatar: "https://i.pravatar.cc/150?u=emily",
    },
    type: "device",
    description: "Connected new iCane device (Device ID: ICN-4521)",
    timestamp: "Today at 11:20 AM",
  },
  {
    id: 4,
    user: {
      name: "Robert Wilson",
      email: "r.wilson@icane.com",
      avatar: "https://i.pravatar.cc/150?u=robert",
    },
    type: "alert",
    description: "Fall detection alert triggered - Emergency contact notified",
    timestamp: "Today at 10:05 AM",
  },
  {
    id: 5,
    user: {
      name: "John Smith",
      email: "john.smith@icane.com",
      avatar: "https://i.pravatar.cc/150?u=john",
    },
    type: "settings",
    description: "Changed password",
    timestamp: "Today at 9:30 AM",
  },
  {
    id: 6,
    user: {
      name: "Lisa Anderson",
      email: "l.anderson@icane.com",
      avatar: "https://i.pravatar.cc/150?u=lisa",
    },
    type: "login",
    description: "Successfully logged in from mobile app",
    timestamp: "Today at 8:15 AM",
  },
  {
    id: 7,
    user: {
      name: "Sarah Johnson",
      email: "sarah.j@icane.com",
      avatar: "https://i.pravatar.cc/150?u=sarah",
    },
    type: "device",
    description: "Disconnected device (Device ID: ICN-3892)",
    timestamp: "Yesterday at 3:20 PM",
  },
  {
    id: 8,
    user: {
      name: "James Taylor",
      email: "j.taylor@icane.com",
      avatar: "https://i.pravatar.cc/150?u=james",
    },
    type: "login",
    description: "Successfully logged in from desktop",
    timestamp: "Yesterday at 1:10 PM",
  },
];

const ActivityReport = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { connectionStatus } = useUserStore();

  return (
    <div className="flex h-screen bg-[#f9fafb]">
      <DashboardSide />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header
          userName="Zander"
          isOnline={connectionStatus}
          notificationCount={3}
        />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="w-full font-poppins">
            {/* Header Section */}
            <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#11285A] mb-1">Activity Reports</h2>
        <p className="text-gray-500 text-sm">
          Monitor and track all user activities in your system
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-t-2xl p-6 border-b border-gray-100">
        <div className="relative max-w-xl">
          <Icon
            icon="ph:magnifying-glass"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl"
          />
          <input
            type="text"
            placeholder="Search activities by user, action, or description..."
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm text-gray-600 placeholder-gray-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-b-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[25%]">
                  User
                </th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[20%]">
                  Activity Type
                </th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[35%]">
                  Description
                </th>
                <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[20%]">
                  Timestamp
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {activities.map((activity) => (
                <tr key={activity.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <img
                        src={activity.user.avatar}
                        alt={activity.user.name}
                        className="w-10 h-10 rounded-full object-cover bg-gray-200"
                      />
                      <div>
                        <p className="font-semibold text-sm text-gray-900">
                          {activity.user.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {activity.user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="scale-75 origin-left">
                      <ActivityActions type={activity.type} />
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-sm text-gray-600">{activity.description}</p>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <p className="text-sm text-gray-500 font-medium">
                      {activity.timestamp}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Showing 1-10 of 1,247 activities
          </p>
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50">
              <Icon icon="ph:caret-left" />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#11285A] text-white font-medium text-sm">
              1
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium text-sm">
              2
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium text-sm">
              3
            </button>
            <span className="text-gray-400 px-1">...</span>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium text-sm">
              125
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">
              <Icon icon="ph:caret-right" />
            </button>
          </div>
        </div>
      </div>
    </div>
        </main>
      </div>
    </div>
  );
};

export default ActivityReport;