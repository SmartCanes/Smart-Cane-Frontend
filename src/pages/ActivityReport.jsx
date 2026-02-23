import { useState } from "react";
import { Icon } from "@iconify/react";
import ActivityActions from "@/ui/components/ActivityActions";

// Dummy data to match the image
const activities = [
  {
    id: 1,
    user: {
      name: "John Smith",
      email: "john.smith@icane.com",
      avatar: "https://i.pravatar.cc/150?u=john"
    },
    type: "login",
    description: "Successfully logged in from desktop",
    timestamp: "Today at 2:45 PM"
  },
  {
    id: 2,
    user: {
      name: "Sarah Johnson",
      email: "sarah.j@icane.com",
      avatar: "https://i.pravatar.cc/150?u=sarah"
    },
    type: "settings",
    description: "Updated notification preferences",
    timestamp: "Today at 1:30 PM"
  },
  {
    id: 3,
    user: {
      name: "Emily Davis",
      email: "emily.d@icane.com",
      avatar: "https://i.pravatar.cc/150?u=emily"
    },
    type: "device",
    description: "Connected new iCane device (Device ID: ICN-4521)",
    timestamp: "Today at 11:20 AM"
  },
  {
    id: 4,
    user: {
      name: "Robert Wilson",
      email: "r.wilson@icane.com",
      avatar: "https://i.pravatar.cc/150?u=robert"
    },
    type: "alert",
    description: "Fall detection alert triggered - Emergency contact notified",
    timestamp: "Today at 10:05 AM"
  },
  {
    id: 5,
    user: {
      name: "John Smith",
      email: "john.smith@icane.com",
      avatar: "https://i.pravatar.cc/150?u=john"
    },
    type: "settings",
    description: "Changed password",
    timestamp: "Today at 9:30 AM"
  },
  {
    id: 6,
    user: {
      name: "Lisa Anderson",
      email: "l.anderson@icane.com",
      avatar: "https://i.pravatar.cc/150?u=lisa"
    },
    type: "login",
    description: "Successfully logged in from mobile app",
    timestamp: "Today at 8:15 AM"
  },
  {
    id: 7,
    user: {
      name: "Sarah Johnson",
      email: "sarah.j@icane.com",
      avatar: "https://i.pravatar.cc/150?u=sarah"
    },
    type: "device",
    description: "Disconnected device (Device ID: ICN-3892)",
    timestamp: "Yesterday at 3:20 PM"
  },
  {
    id: 8,
    user: {
      name: "James Taylor",
      email: "j.taylor@icane.com",
      avatar: "https://i.pravatar.cc/150?u=james"
    },
    type: "login",
    description: "Successfully logged in from desktop",
    timestamp: "Yesterday at 1:10 PM"
  }
];

const ActivityReport = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredActivities = activities.filter(
    (activity) =>
      activity.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalItems = filteredActivities.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getVisiblePages = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, "...", totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(
          1,
          "...",
          totalPages - 4,
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        );
      } else {
        pages.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages
        );
      }
    }
    return pages;
  };

  return (
    <main className="bg-white md:bg-[#f9fafb] rounded-t-[32px] md:rounded-none min-h-[calc(100vh-var(--header-height)-var(--mobile-nav-height))] md:min-h-[calc(100vh-var(--header-height))] md:max-h-[calc(100vh-var(--header-height))] overflow-y-visible md:overflow-y-auto p-6 pb-[calc(var(--mobile-nav-height)+1.5rem)] md:pb-6">
      <div className="w-full font-poppins max-w-5xl mx-auto space-y-6 sm:space-y-8 md:max-w-none md:mx-0 md:pr-6">
        {/* Header Section */}
        <div className="mb-4 md:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 text-nowrap">
            Activity Reports
          </h2>
          <p className="text-gray-500 text-xs md:text-sm">
            Monitor and track all user activities in your system
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-t-2xl p-4 md:p-6 border-b border-gray-100">
          <div className="relative max-w-xl">
            <Icon
              icon="ph:magnifying-glass"
              className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg md:text-xl"
            />
            <input
              type="text"
              placeholder="Search activities..."
              className="w-full pl-10 md:pl-12 pr-4 py-2.5 md:py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm text-gray-600 placeholder-gray-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {totalItems === 0 ? (
          // EMPTY STATE / "Nothing to see here" TAB
          <div className="bg-white rounded-b-2xl shadow-sm p-8 md:p-16 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Icon icon="ph:files" className="text-3xl text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-[#11285A] mb-1">
              Nothing to see here
            </h3>
            <p className="text-sm text-gray-500 max-w-xs mx-auto">
              We couldn't find any activities matching "{searchTerm}". Try
              adjusting your search or filters.
            </p>
            <button
              onClick={() => setSearchTerm("")}
              className="mt-6 text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-b-2xl shadow-sm overflow-hidden">
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
                    {filteredActivities.map((activity) => (
                      <tr
                        key={activity.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <img
                              loading="lazy"
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
                          <p className="text-sm text-gray-600">
                            {activity.description}
                          </p>
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
                  Showing{" "}
                  {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}-
                  {Math.min(currentPage * itemsPerPage, totalItems)} of{" "}
                  {totalItems.toLocaleString()} activities
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Icon icon="ph:caret-left" />
                  </button>

                  {getVisiblePages().map((page, index) =>
                    typeof page === "number" ? (
                      <button
                        key={index}
                        onClick={() => handlePageChange(page)}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg font-medium text-sm transition-colors ${
                          currentPage === page
                            ? "bg-[#11285A] text-white"
                            : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    ) : (
                      <span key={index} className="text-gray-400 px-1">
                        ...
                      </span>
                    )
                  )}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Icon icon="ph:caret-right" />
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden bg-white rounded-b-2xl shadow-sm overflow-hidden">
              <div className="divide-y divide-gray-100">
                {filteredActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    {/* User Info */}
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        loading="lazy"
                        src={activity.user.avatar}
                        alt={activity.user.name}
                        className="w-12 h-12 rounded-full object-cover bg-gray-200 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900 truncate">
                          {activity.user.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {activity.user.email}
                        </p>
                      </div>
                    </div>

                    {/* Activity Type Badge */}
                    <div className="mb-2 inline-block">
                      <ActivityActions type={activity.type} />
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 mb-2 leading-relaxed">
                      {activity.description}
                    </p>

                    {/* Timestamp */}
                    <p className="text-xs text-gray-400 font-medium">
                      {activity.timestamp}
                    </p>
                  </div>
                ))}
              </div>

              {/* Mobile Pagination */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-4 border-t border-gray-100 bg-gray-50">
                <p className="text-xs text-gray-500">
                  Showing{" "}
                  {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}-
                  {Math.min(currentPage * itemsPerPage, totalItems)} of{" "}
                  {totalItems.toLocaleString()}
                </p>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Icon icon="ph:caret-left" />
                  </button>

                  {getVisiblePages().map((page, index) =>
                    typeof page === "number" ? (
                      <button
                        key={index}
                        onClick={() => handlePageChange(page)}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg font-medium text-xs transition-colors ${
                          currentPage === page
                            ? "bg-[#11285A] text-white"
                            : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    ) : (
                      <span
                        key={index}
                        className="text-gray-400 text-xs px-0.5"
                      >
                        ...
                      </span>
                    )
                  )}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Icon icon="ph:caret-right" />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
};

export default ActivityReport;
