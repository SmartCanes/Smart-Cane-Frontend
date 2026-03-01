import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import ActivityActions from "@/ui/components/ActivityActions";
import { getAccountHistory } from "@/api/backendService";

// Map backend action strings to ActivityActions types
const ACTION_TYPE_MAP = {
  CREATE: "device",
  UPDATE: "settings",
  DELETE: "alert",
  PAIR: "device",
  UNPAIR: "device",
  INVITE: "settings",
  REMOVE_GUARDIAN: "alert",
  UPDATE_ROLE: "settings",
  ACCEPT_INVITE: "login",
  LOGIN: "login"
};

const ActivityReport = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getAccountHistory();
        if (response.success) {
          setActivities(
            response.data.history || response.data?.data?.history || []
          );
        } else {
          setError("Failed to load activity history");
        }
      } catch (err) {
        setError("Failed to load activity history");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const filteredActivities = activities.filter(
    (activity) =>
      (activity.guardianName || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (activity.description || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (activity.action || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalItems = filteredActivities.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedActivities = filteredActivities.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const getVisiblePages = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
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

  // Loading state
  if (isLoading) {
    return (
      <main className="bg-white md:bg-[#f9fafb] rounded-t-[32px] md:rounded-none min-h-[calc(100vh-var(--header-height)-var(--mobile-nav-height))] md:min-h-[calc(100vh-var(--header-height))] md:max-h-[calc(100vh-var(--header-height))] overflow-y-visible md:overflow-y-auto p-6 pb-[calc(var(--mobile-nav-height)+1.5rem)] md:pb-6">
        <div className="w-full font-poppins max-w-5xl mx-auto space-y-6">
          <div className="mb-4 md:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
              Activity Reports
            </h2>
            <p className="text-gray-500 text-xs md:text-sm">
              Monitor and track all user activities in your system
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-8 flex flex-col items-center justify-center gap-3">
            <Icon
              icon="ph:circle-notch-bold"
              className="w-8 h-8 text-[#11285A] animate-spin"
            />
            <p className="text-gray-500 text-sm">Loading activity history...</p>
          </div>
        </div>
      </main>
    );
  }

  // Error state
  if (error) {
    return (
      <main className="bg-white md:bg-[#f9fafb] rounded-t-[32px] md:rounded-none min-h-[calc(100vh-var(--header-height)-var(--mobile-nav-height))] md:min-h-[calc(100vh-var(--header-height))] md:max-h-[calc(100vh-var(--header-height))] overflow-y-visible md:overflow-y-auto p-6 pb-[calc(var(--mobile-nav-height)+1.5rem)] md:pb-6">
        <div className="w-full font-poppins max-w-5xl mx-auto space-y-6">
          <div className="mb-4 md:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
              Activity Reports
            </h2>
            <p className="text-gray-500 text-xs md:text-sm">
              Monitor and track all user activities in your system
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-8 flex flex-col items-center justify-center gap-3">
            <Icon
              icon="ph:warning-circle-bold"
              className="w-10 h-10 text-red-400"
            />
            <p className="text-gray-700 font-medium">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-sm text-blue-600 hover:underline"
            >
              Try again
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-white md:bg-[#f9fafb] rounded-t-[32px] md:rounded-none min-h-[calc(100vh-var(--header-height)-var(--mobile-nav-height))] md:min-h-[calc(100vh-var(--header-height))] md:max-h-[calc(100vh-var(--header-height))] overflow-y-visible md:overflow-y-auto p-6 pb-[calc(var(--mobile-nav-height)+1.5rem)] md:pb-6">
      <div className="w-full font-poppins max-w-5xl mx-auto space-y-6 sm:space-y-8 md:max-w-none md:mx-0 md:pr-6">
        {/* Header */}
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
              placeholder="Search by name, action, or description..."
              className="w-full pl-10 md:pl-12 pr-4 py-2.5 md:py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm text-gray-600 placeholder-gray-400"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        {totalItems === 0 ? (
          <div className="bg-white rounded-b-2xl shadow-sm p-8 md:p-16 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Icon icon="ph:files" className="text-3xl text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-[#11285A] mb-1">
              {searchTerm ? "Nothing to see here" : "No activity yet"}
            </h3>
            <p className="text-sm text-gray-500 max-w-xs mx-auto">
              {searchTerm
                ? `We couldn't find any activities matching "${searchTerm}".`
                : "Actions you perform will appear here."}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="mt-6 text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-b-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[22%]">
                        Guardian
                      </th>
                      <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[18%]">
                        Action
                      </th>
                      <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[40%]">
                        Description
                      </th>
                      <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[20%]">
                        Date Created
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {paginatedActivities.map((activity, index) => (
                      <tr
                        key={activity.historyId ?? index}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <p className="font-semibold text-sm text-gray-900">
                            {activity.guardianName || "—"}
                          </p>
                        </td>
                        <td className="py-4 px-6">
                          <div className="scale-75 origin-left">
                            <ActivityActions
                              type={
                                ACTION_TYPE_MAP[activity.action] || "settings"
                              }
                            />
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-sm text-gray-600">
                            {activity.description || "—"}
                          </p>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <p className="text-sm text-gray-500 font-medium">
                            {activity.createdAt
                              ? activity.createdAt
                                  .replace("T", " ")
                                  .split(".")[0]
                              : "—"}
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
                  {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}–
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
                        className={`w-8 h-8 flex items-center justify-center rounded-lg font-medium text-sm transition-colors ${currentPage === page ? "bg-[#11285A] text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
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
                {paginatedActivities.map((activity, index) => (
                  <div
                    key={activity.historyId ?? index}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <p className="font-semibold text-sm text-gray-900 mb-2">
                      {activity.guardianName || "—"}
                    </p>
                    <div className="mb-2 inline-block">
                      <ActivityActions
                        type={ACTION_TYPE_MAP[activity.action] || "settings"}
                      />
                    </div>
                    <p className="text-sm text-gray-600 mb-2 leading-relaxed">
                      {activity.description || "—"}
                    </p>
                    <p className="text-xs text-gray-400 font-medium">
                      {activity.createdAt
                        ? activity.createdAt.replace("T", " ").split(".")[0]
                        : "—"}
                    </p>
                  </div>
                ))}
              </div>

              {/* Mobile Pagination */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-4 border-t border-gray-100 bg-gray-50">
                <p className="text-xs text-gray-500">
                  Showing{" "}
                  {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}–
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
                        className={`w-8 h-8 flex items-center justify-center rounded-lg font-medium text-xs transition-colors ${currentPage === page ? "bg-[#11285A] text-white" : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"}`}
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
