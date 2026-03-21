import { useState } from "react";
import { Icon } from "@iconify/react";
import { resolveProfileImageSrc } from "@/utils/ResolveImage";
import DefaultProfile from "@/ui/components/DefaultProfile";
import FilterDropdown from "@/ui/components/FilterDropdown"; // ← NEW
import { useTranslation } from "react-i18next";

const activityLogs = [
  {
    id: 1,
    vipName: "Althea De Vera",
    activity: "Walk to Park",
    location: "Home (123 Main St)",
    destination: "Central Park",
    duration: "45 mins",
    dateTime: "Today at 2:45 PM",
    date: new Date(),
    status: "Completed"
  },
  {
    id: 2,
    vipName: "Sarah Chua",
    activity: "Grocery Shopping",
    location: "Home",
    destination: "Whole Foods",
    duration: "1 hr 15 mins",
    dateTime: "Today at 10:30 AM",
    date: new Date(),
    status: "Completed"
  },
  {
    id: 3,
    vipName: "Isabel Garcia",
    activity: "Daily Walk",
    location: "Home",
    destination: "Neighborhood Loop",
    duration: "20 mins",
    dateTime: "Yesterday at 4:00 PM",
    date: (() => {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      return d;
    })(),
    status: "Completed"
  },
  {
    id: 4,
    vipName: "Daniel Flores",
    activity: "Doctor Appointment",
    location: "Clinic",
    destination: "Home",
    duration: "30 mins",
    dateTime: "Yesterday at 1:15 PM",
    date: (() => {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      return d;
    })(),
    status: "Completed"
  },
  {
    id: 5,
    vipName: "Jose Reyes",
    activity: "Morning Walk",
    location: "Home",
    destination: "Local Cafe",
    duration: "15 mins",
    dateTime: "Oct 24, 2023 at 8:00 AM",
    date: new Date("2023-10-24"),
    status: "Ongoing"
  },
  {
    id: 6,
    vipName: "Rafael Mendoza",
    activity: "Emergency Assistance Request",
    location: "5th Avenue Crossing",
    destination: "Nearest Safe Point",
    duration: "2 mins",
    dateTime: "Today at 3:12 PM",
    date: new Date(),
    status: "Emergency"
  },
  {
    id: 7,
    vipName: "Gabriel Reyes",
    activity: "Fall Detected",
    location: "Near Pharmacy Entrance",
    destination: "Awaiting Assistance",
    duration: "1 min",
    dateTime: "Today at 11:08 AM",
    date: new Date(),
    status: "Fall Detected"
  }
];

const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case "completed":
      return "bg-green-100 text-green-700";
    case "ongoing":
      return "bg-blue-100 text-blue-700";
    case "cancelled":
      return "bg-red-100 text-red-700";
    case "emergency":
      return "bg-red-100 text-red-700";
    case "fall detected":
      return "bg-orange-100 text-orange-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const DeviceLogs = () => {
  const { t } = useTranslation("pages");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  //filter state to van
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const statusOptions = [
    { value: "Completed", label: t("deviceLogs.status.completed"), dotColor: "bg-green-500" },
    { value: "Ongoing", label: t("deviceLogs.status.ongoing"), dotColor: "bg-blue-500" },
    { value: "Emergency", label: t("deviceLogs.status.emergency"), dotColor: "bg-red-500" },
    {
      value: "Fall Detected",
      label: t("deviceLogs.status.fallDetected"),
      dotColor: "bg-orange-500"
    },
    { value: "Cancelled", label: t("deviceLogs.status.cancelled"), dotColor: "bg-gray-400" }
  ];

  const translateStatus = (status) => {
    const map = {
      Completed: t("deviceLogs.status.completed"),
      Ongoing: t("deviceLogs.status.ongoing"),
      Emergency: t("deviceLogs.status.emergency"),
      "Fall Detected": t("deviceLogs.status.fallDetected"),
      Cancelled: t("deviceLogs.status.cancelled")
    };
    return map[status] || status;
  };

  const handleStatusChange = (value) => {
    setSelectedStatuses((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
    setCurrentPage(1);
  };

  const handleDateChange = ({ startDate: s, endDate: e }) => {
    setStartDate(s);
    setEndDate(e);
    setCurrentPage(1);
  };

  const handleClearAll = () => {
    setSelectedStatuses([]);
    setStartDate(null);
    setEndDate(null);
    setCurrentPage(1);
  };

  const activeFilterCount =
    selectedStatuses.length + (startDate || endDate ? 1 : 0);

  // filtering to van
  const filteredLogs = activityLogs.filter((log) => {
    const matchesSearch =
      log.vipName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.activity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.device || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.guardian?.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatuses.length === 0 || selectedStatuses.includes(log.status);

    const matchesDate = (() => {
      if (!startDate) return true;
      const logDate = log.date instanceof Date ? log.date : new Date(log.date);
      const end = endDate || startDate;
      const dayStart = new Date(startDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(end);
      dayEnd.setHours(23, 59, 59, 999);
      return logDate >= dayStart && logDate <= dayEnd;
    })();

    return matchesSearch && matchesStatus && matchesDate;
  });

  const totalItems = filteredLogs.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

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

  const fmt = (d) =>
    d?.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });

  return (
    <main className="bg-white md:bg-[#f9fafb] rounded-t-[32px] md:rounded-none min-h-[calc(100vh-var(--header-height)-var(--mobile-nav-height))] md:min-h-[calc(100vh-var(--header-height))] md:max-h-[calc(100vh-var(--header-height))] overflow-y-visible md:overflow-y-auto p-6 pb-[calc(var(--mobile-nav-height)+1.5rem)] md:pb-6">
      <div className="w-full font-poppins max-w-5xl mx-auto space-y-6 sm:space-y-8 md:max-w-none md:mx-0 md:pr-6">
        <div className="mb-4 md:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 text-nowrap">
            {t("deviceLogs.title")}
          </h2>
          <p className="text-gray-500 text-xs md:text-sm">
            {t("deviceLogs.subtitle")}
          </p>
        </div>

        {/* search and filter to van */}
        <div className="bg-white rounded-t-2xl p-4 md:p-6 border-b border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            {/* search */}
            <div className="relative flex-1 max-w-xl">
              <Icon
                icon="ph:magnifying-glass"
                className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg md:text-xl"
              />
              <input
                type="text"
                placeholder={t("deviceLogs.searchPlaceholder")}
                className="w-full pl-10 md:pl-12 pr-4 py-2.5 md:py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm text-gray-600 placeholder-gray-400"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            {/* Filter button to van*/}
            <FilterDropdown
              statusOptions={statusOptions}
              selectedStatuses={selectedStatuses}
              onStatusChange={handleStatusChange}
              showDateFilter
              startDate={startDate}
              endDate={endDate}
              onDateChange={handleDateChange}
              onClearAll={handleClearAll}
              activeCount={activeFilterCount}
            />
          </div>

          {/* Active filter to van */}
          {(selectedStatuses.length > 0 || startDate) && (
            <div className="flex flex-wrap gap-2 mt-3">
              {selectedStatuses.map((val) => {
                const opt = statusOptions.find((o) => o.value === val);
                return (
                  <span
                    key={val}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#11285A]/10 text-[#11285A] text-xs font-medium"
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${opt?.dotColor}`}
                    />
                    {opt?.label || val}
                    <button
                      onClick={() => handleStatusChange(val)}
                      className="ml-0.5 hover:text-red-500 cursor-pointer"
                    >
                      <Icon icon="ph:x-bold" className="text-[10px]" />
                    </button>
                  </span>
                );
              })}
              {startDate && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#11285A]/10 text-[#11285A] text-xs font-medium">
                  <Icon icon="ph:calendar" className="text-sm" />
                  {fmt(startDate)}
                  {endDate &&
                  endDate.toDateString() !== startDate.toDateString()
                    ? ` → ${fmt(endDate)}`
                    : ""}
                  <button
                    onClick={() =>
                      handleDateChange({ startDate: null, endDate: null })
                    }
                    className="ml-0.5 hover:text-red-500 cursor-pointer"
                  >
                    <Icon icon="ph:x-bold" className="text-[10px]" />
                  </button>
                </span>
              )}
              <button
                onClick={handleClearAll}
                className="text-xs text-red-500 hover:underline font-medium cursor-pointer"
              >
                {t("deviceLogs.clearAll")}
              </button>
            </div>
          )}
        </div>

        {totalItems === 0 ? (
          <div className="bg-white rounded-b-2xl shadow-sm p-8 md:p-16 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Icon icon="ph:files" className="text-3xl text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-[#11285A] mb-1">
              {t("deviceLogs.empty.nothingToSee")}
            </h3>
            <p className="text-sm text-gray-500 max-w-xs mx-auto">
              {searchTerm || activeFilterCount > 0
                ? t("deviceLogs.empty.adjustFilters")
                : t("deviceLogs.empty.noActivities", { searchTerm })}
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                handleClearAll();
              }}
              className="mt-6 text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
            >
              {t("deviceLogs.clearFilters")}
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table*/}
            <div className="hidden lg:block bg-white rounded-b-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px]">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {t("deviceLogs.table.vip")}
                      </th>
                      <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {t("deviceLogs.table.vipName")}
                      </th>
                      <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {t("deviceLogs.table.activity")}
                      </th>
                      <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {t("deviceLogs.table.locations")}
                      </th>
                      <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {t("deviceLogs.table.dateTime")}
                      </th>
                      <th className="text-center py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {t("deviceLogs.table.status")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredLogs.map((log) => (
                      <tr
                        key={log.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
                            {log.avatar ? (
                              <img
                                loading="lazy"
                                src={resolveProfileImageSrc(log.avatar)}
                                alt={log.vipName}
                                className="w-full h-full object-cover bg-gray-200"
                              />
                            ) : (
                              <DefaultProfile
                                bgColor="bg-primary-100"
                                userInitial={log.vipName?.charAt(0)}
                              />
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-sm font-medium text-gray-800 whitespace-nowrap">
                            {log.vipName}
                          </p>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-sm text-gray-700 font-medium">
                            {log.activity}
                          </p>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex flex-col gap-1 text-xs">
                            <div className="flex items-center gap-1.5 text-gray-600 truncate max-w-[200px]">
                              <Icon
                                icon="ph:map-pin-line"
                                className="text-blue-500 shrink-0"
                              />
                              <span className="truncate" title={log.location}>
                                {log.location}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-gray-600 truncate max-w-[200px]">
                              <Icon
                                icon="ph:flag-checkered"
                                className="text-green-500 shrink-0"
                              />
                              <span
                                className="truncate"
                                title={log.destination}
                              >
                                {log.destination}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex flex-col">
                            <p className="text-sm text-gray-800 whitespace-nowrap">
                              {log.dateTime}
                            </p>
                            <p className="text-xs text-gray-500 font-medium">
                              {log.duration}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}
                          >
                            {translateStatus(log.status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile / Tablet Card View  */}
            <div className="lg:hidden bg-white rounded-b-2xl shadow-sm overflow-hidden">
              <div className="divide-y divide-gray-100">
                {filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                          {log?.avatar ? (
                            <img
                              loading="lazy"
                              src={resolveProfileImageSrc(log.avatar)}
                              alt={log.vipName}
                              className="w-full h-full object-cover bg-gray-200"
                            />
                          ) : (
                            <DefaultProfile
                              bgColor="bg-primary-100"
                              userInitial={log.vipName?.charAt(0)}
                            />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 truncate">
                            {log.vipName}
                          </p>
                          <span className="inline-block mt-0.5 px-2 py-0.5 text-[10px] font-medium text-purple-700 bg-purple-100 rounded-lg">
                            {log.device || t("deviceLogs.noDevice")}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${getStatusColor(log.status)}`}
                      >
                        {translateStatus(log.status)}
                      </span>
                    </div>
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 mb-4">
                      <div className="flex items-center gap-2 mb-2 text-[#11285A] font-semibold text-sm">
                        <Icon icon="ph:activity-light" className="text-lg" />
                        {log.activity}
                      </div>
                      <div className="flex flex-col gap-2 relative pl-2">
                        <div className="absolute left-[13px] top-[14px] bottom-[14px] w-px bg-gray-300"></div>
                        <div className="flex items-start gap-2 text-xs">
                          <div className="shrink-0 mt-0.5 relative z-10 w-4 h-4 rounded-full bg-blue-100 border border-blue-300 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-gray-500 block text-[10px] uppercase font-semibold">
                              {t("deviceLogs.origin")}
                            </span>
                            <span className="text-gray-700 truncate block">
                              {log.location}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 text-xs">
                          <div className="shrink-0 mt-0.5 relative z-10 w-4 h-4 rounded-full bg-green-100 border border-green-300 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-gray-500 block text-[10px] uppercase font-semibold">
                              {t("deviceLogs.destination")}
                            </span>
                            <span className="text-gray-700 truncate block">
                              {log.destination}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-800 font-medium">
                        {log.dateTime}
                      </p>
                      <p className="text-[10px] text-gray-500 inline-flex items-center gap-1">
                        <Icon icon="ph:clock" /> {log.duration}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination */}
            <div className="bg-white px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-100 rounded-b-2xl">
              <p className="text-xs sm:text-sm text-gray-500">
                {t("deviceLogs.pagination.showing", {
                  from: Math.min((currentPage - 1) * itemsPerPage + 1, totalItems),
                  to: Math.min(currentPage * itemsPerPage, totalItems),
                  total: totalItems.toLocaleString()
                })}
              </p>
              <div className="flex items-center gap-1.5 sm:gap-2">
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
                      className={`w-8 h-8 flex items-center justify-center rounded-lg font-medium text-xs sm:text-sm transition-colors ${currentPage === page ? "bg-[#11285A] text-white" : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"}`}
                    >
                      {page}
                    </button>
                  ) : (
                    <span
                      key={index}
                      className="text-gray-400 text-xs sm:text-sm px-0.5 sm:px-1"
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
          </>
        )}
      </div>
    </main>
  );
};

export default DeviceLogs;
