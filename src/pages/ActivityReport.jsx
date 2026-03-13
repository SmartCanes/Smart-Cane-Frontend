import { useState, useEffect, useMemo } from "react";
import { Icon } from "@iconify/react";
import ActivityActions from "@/ui/components/ActivityActions";
import { getAccountHistory } from "@/api/backendService";

// UTC to Manila (UTC+8) formatter
const toManilaDate = (raw) => {
  if (!raw) return null;
  const str = typeof raw === "string" ? raw.replace(" ", "T") : String(raw);
  const withZ = !str.endsWith("Z") && !str.includes("+") ? str + "Z" : str;
  const date = new Date(withZ);
  return isNaN(date.getTime()) ? null : date;
};

const formatManila = (raw) => {
  const date = toManilaDate(raw);
  if (!date) return "—";
  return date.toLocaleString("en-PH", {
    timeZone: "Asia/Manila",
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

// Map 
const ACTION_TYPE_MAP = {
  CREATE:           "device",
  UPDATE:           "settings",
  DELETE:           "alert",
  PAIR:             "device",
  UNPAIR:           "device",
  INVITE:           "settings",
  REMOVE_GUARDIAN:  "alert",
  UPDATE_ROLE:      "settings",
  ACCEPT_INVITE:    "login",
};

// filter options 
const DATE_FILTERS = [
  { label: "All time",    value: "all"   },
  { label: "Today",       value: "today" },
  { label: "This week",   value: "week"  },
  { label: "This month",  value: "month" },
];

const isWithinRange = (dateStr, range) => {
  if (range === "all" || !dateStr) return true;
  const date = new Date(dateStr.replace("T", " ").split(".")[0]);
  if (isNaN(date)) return true;
  const now  = new Date();
  const diff = now - date;
  if (range === "today") return diff < 86_400_000 && date.getDate() === now.getDate();
  if (range === "week")  return diff < 7  * 86_400_000;
  if (range === "month") return diff < 30 * 86_400_000;
  return true;
};

const ActivityReport = () => {
  const [searchTerm,   setSearchTerm]   = useState("");
  const [currentPage,  setCurrentPage]  = useState(1);
  const [activities,   setActivities]   = useState([]);
  const [isLoading,    setIsLoading]    = useState(true);
  const [error,        setError]        = useState(null);
  const [dateFilter,   setDateFilter]   = useState("all");
  const [dateOpen,     setDateOpen]     = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getAccountHistory();
        if (response.success) {
          setActivities(response.data.history || response.data?.data?.history || []);
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

  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      const matchesSearch =
        (activity.guardianName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (activity.description  || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (activity.action       || "").toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDate = isWithinRange(activity.createdAt, dateFilter);

      return matchesSearch && matchesDate;
    });
  }, [activities, searchTerm, dateFilter]);

  const totalItems         = filteredActivities.length;
  const totalPages         = Math.ceil(totalItems / itemsPerPage);
  const paginatedActivities = filteredActivities.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleDateFilter = (value) => {
    setDateFilter(value);
    setDateOpen(false);
    setCurrentPage(1);
  };

  const getVisiblePages = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, "...", totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }
    return pages;
  };

  const activeDateLabel = DATE_FILTERS.find((f) => f.value === dateFilter)?.label || "All time";

  // Loading 
  if (isLoading) {
    return (
      <main className="bg-white md:bg-[#f9fafb] rounded-t-[32px] md:rounded-none min-h-[calc(100vh-var(--header-height)-var(--mobile-nav-height))] md:min-h-[calc(100vh-var(--header-height))] md:max-h-[calc(100vh-var(--header-height))] overflow-y-visible md:overflow-y-auto p-6 pb-[calc(var(--mobile-nav-height)+1.5rem)] md:pb-6">
        <div className="w-full font-poppins max-w-5xl mx-auto space-y-6">
          <div className="mb-4 md:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Activity Reports</h2>
            <p className="text-gray-500 text-xs md:text-sm">Monitor and track all user activities in your system</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-8 flex flex-col items-center justify-center gap-3">
            <Icon icon="ph:circle-notch-bold" className="w-8 h-8 text-[#11285A] animate-spin" />
            <p className="text-gray-500 text-sm">Loading activity history...</p>
          </div>
        </div>
      </main>
    );
  }

  //Error
  if (error) {
    return (
      <main className="bg-white md:bg-[#f9fafb] rounded-t-[32px] md:rounded-none min-h-[calc(100vh-var(--header-height)-var(--mobile-nav-height))] md:min-h-[calc(100vh-var(--header-height))] md:max-h-[calc(100vh-var(--header-height))] overflow-y-visible md:overflow-y-auto p-6 pb-[calc(var(--mobile-nav-height)+1.5rem)] md:pb-6">
        <div className="w-full font-poppins max-w-5xl mx-auto space-y-6">
          <div className="mb-4 md:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Activity Reports</h2>
            <p className="text-gray-500 text-xs md:text-sm">Monitor and track all user activities in your system</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-8 flex flex-col items-center justify-center gap-3">
            <Icon icon="ph:warning-circle-bold" className="w-10 h-10 text-red-400" />
            <p className="text-gray-700 font-medium">{error}</p>
            <button onClick={() => window.location.reload()} className="text-sm text-blue-600 hover:underline">
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
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 text-nowrap">Activity Reports</h2>
          <p className="text-gray-500 text-xs md:text-sm">Monitor and track all user activities in your system</p>
        </div>

        {/* ── filter ── */}
        <div className="bg-white rounded-t-2xl p-4 md:p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">

            {/* Search */}
            <div className="relative flex-1 max-w-xl">
              <Icon
                icon="ph:magnifying-glass"
                className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg md:text-xl"
              />
              <input
                type="text"
                placeholder="Search by name, action, or description..."
                className="w-full pl-10 md:pl-12 pr-4 py-2.5 md:py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm text-gray-600 placeholder-gray-400"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>

            {/* Date Filter Dropdown */}
            <div className="relative shrink-0">
              <button
                onClick={() => setDateOpen(!dateOpen)}
                className={`flex items-center gap-2 px-4 py-2.5 md:py-3 rounded-xl border text-sm font-medium transition-colors cursor-pointer whitespace-nowrap
                  ${dateFilter !== "all"
                    ? "border-[#11285A] bg-[#11285A]/5 text-[#11285A]"
                    : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                  }`}
              >
                <Icon icon="ph:calendar-blank" className="w-4 h-4" />
                <span className="hidden sm:inline">{activeDateLabel}</span>
                <span className="sm:hidden">
                  <Icon icon="ph:funnel" className="w-4 h-4" />
                </span>
                <Icon
                  icon="ph:caret-down"
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${dateOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Dropdown */}
              {dateOpen && (
                <>
                  {/* backdrop to close on outside click */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setDateOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-20">
                    {DATE_FILTERS.map((f) => (
                      <button
                        key={f.value}
                        onClick={() => handleDateFilter(f.value)}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors cursor-pointer
                          ${dateFilter === f.value
                            ? "bg-[#11285A] text-white font-medium"
                            : "text-gray-700 hover:bg-gray-50"
                          }`}
                      >
                        {f.label}
                        {dateFilter === f.value && (
                          <Icon icon="ph:check-bold" className="w-3.5 h-3.5" />
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

          </div>

          {/* Active filter chip */}
          {dateFilter !== "all" && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-gray-500">Filtered by:</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#11285A]/10 text-[#11285A] text-xs font-medium rounded-full">
                <Icon icon="ph:calendar-blank" className="w-3 h-3" />
                {activeDateLabel}
                <button
                  onClick={() => { setDateFilter("all"); setCurrentPage(1); }}
                  className="ml-0.5 hover:text-red-500 transition-colors cursor-pointer"
                >
                  <Icon icon="ph:x" className="w-3 h-3" />
                </button>
              </span>
            </div>
          )}
        </div>

        {/* ── Empty State ── */}
        {totalItems === 0 ? (
          <div className="bg-white rounded-b-2xl shadow-sm p-8 md:p-16 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Icon icon="ph:files" className="text-3xl text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-[#11285A] mb-1">
              {searchTerm || dateFilter !== "all" ? "Nothing to see here" : "No activity yet"}
            </h3>
            <p className="text-sm text-gray-500 max-w-xs mx-auto">
              {searchTerm
                ? `We couldn't find any activities matching "${searchTerm}".`
                : dateFilter !== "all"
                  ? `No activities found for "${activeDateLabel}".`
                  : "Actions you perform will appear here."}
            </p>
            {(searchTerm || dateFilter !== "all") && (
              <button
                onClick={() => { setSearchTerm(""); setDateFilter("all"); }}
                className="mt-6 text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* ── Desktop Table ── */}
            <div className="hidden md:block bg-white rounded-b-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[22%]">Guardian</th>
                      <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[18%]">Action</th>
                      <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[40%]">Description</th>
                      <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[20%]">Date Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {paginatedActivities.map((activity, index) => (
                      <tr key={activity.historyId ?? index} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6">
                          <p className="font-semibold text-sm text-gray-900">{activity.guardianName || "—"}</p>
                        </td>
                        <td className="py-4 px-6">
                          <div className="scale-75 origin-left">
                            <ActivityActions type={ACTION_TYPE_MAP[activity.action] || "settings"} />
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-sm text-gray-600">{activity.description || "—"}</p>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <p className="text-sm text-gray-500 font-medium">
                            {activity.createdAt ? formatManila(activity.createdAt) : "—"}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}–{Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems.toLocaleString()} activities
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
                          currentPage === page ? "bg-[#11285A] text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    ) : (
                      <span key={index} className="text-gray-400 px-1">...</span>
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

            {/* ── Mobile Card View ── */}
            <div className="md:hidden bg-white rounded-b-2xl shadow-sm overflow-hidden">
              <div className="divide-y divide-gray-100">
                {paginatedActivities.map((activity, index) => (
                  <div key={activity.historyId ?? index} className="p-4 hover:bg-gray-50 transition-colors">
                    <p className="font-semibold text-sm text-gray-900 mb-2">{activity.guardianName || "—"}</p>
                    <div className="mb-2 inline-block">
                      <ActivityActions type={ACTION_TYPE_MAP[activity.action] || "settings"} />
                    </div>
                    <p className="text-sm text-gray-600 mb-2 leading-relaxed">{activity.description || "—"}</p>
                    <p className="text-xs text-gray-400 font-medium">
                      {activity.createdAt ? formatManila(activity.createdAt) : "—"}
                    </p>
                  </div>
                ))}
              </div>

              {/* Mobile Pagination */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-4 border-t border-gray-100 bg-gray-50">
                <p className="text-xs text-gray-500">
                  Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}–{Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems.toLocaleString()}
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
                          currentPage === page ? "bg-[#11285A] text-white" : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    ) : (
                      <span key={index} className="text-gray-400 text-xs px-0.5">...</span>
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