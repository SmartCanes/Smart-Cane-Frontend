import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { resolveProfileImageSrc } from "@/utils/ResolveImage";
import DefaultProfile from "@/ui/components/DefaultProfile";
import FilterDropdown from "@/ui/components/FilterDropdown"; // ← NEW
import { useDeviceLogsStore, useDevicesStore } from "@/stores/useStore";

// filter config to van
const STATUS_OPTIONS = [
  { value: "Completed", label: "Completed", dotColor: "bg-green-500" },
  { value: "Ongoing", label: "Ongoing", dotColor: "bg-blue-500" },
  { value: "Emergency", label: "Emergency", dotColor: "bg-red-500" },
  { value: "Fall Detected", label: "Fall Detected", dotColor: "bg-orange-500" },
  { value: "Cancelled", label: "Cancelled", dotColor: "bg-gray-400" }
];

const DeviceLogs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { selectedDevice } = useDevicesStore();
  const {
    getDeviceLogs,
    isLoadingDeviceLogs,
    getDeviceLogsError,
    fetchDeviceLogs
  } = useDeviceLogsStore();
  const navigate = useNavigate();

  //filter state to van
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const deviceId = selectedDevice?.deviceId;
  const deviceLogs = getDeviceLogs(deviceId);
  const isLoading = isLoadingDeviceLogs(deviceId);
  const error = getDeviceLogsError(deviceId);

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
  const filteredLogs = deviceLogs.filter((log) => {
    const matchesSearch =
      log.vipName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.activity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.device || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.guardianName || "").toLowerCase().includes(searchTerm.toLowerCase());

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
  const totalPages = Math.max(Math.ceil(totalItems / itemsPerPage), 1);

  useEffect(() => {
    // Clamp the current page when filters shrink the result set
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  useEffect(() => {
    if (!deviceId) return;

    // Initial fetch + light polling to keep device logs fresh
    fetchDeviceLogs(deviceId, { silent: true, selectedDevice });
    const interval = setInterval(() => {
      fetchDeviceLogs(deviceId, { silent: true, selectedDevice });
    }, 15000);

    return () => clearInterval(interval);
  }, [deviceId, fetchDeviceLogs, selectedDevice]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLogs = filteredLogs.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleViewOnMap = (log) => {
    if (!log?.isClickable) return;

    if (log.mapMode === "destination-only") {
      const coords = log.destinationCoords || log.coordinates;
      if (!Array.isArray(coords) || coords.length !== 2) return;

      navigate("/dashboard", {
        state: {
          historyLocation: {
            mode: "destination-only",
            coords,
            destinationCoords: coords,
            label: log.destination || "Selected destination",
            timestamp: log.dateTime,
            status: log.status,
            id: log.id,
            activity: log.activity,
            action: log.action || log.activityType,
            color: log.color,
            icon: log.icon
          }
        }
      });
      return;
    }

    if (log.mapMode === "route-history") {
      if (!Array.isArray(log.routeCoords) || log.routeCoords.length < 2) return;

      navigate("/dashboard", {
        state: {
          historyLocation: {
            mode: "route-history",
            coords: log.originCoords || log.coordinates,
            originCoords: log.originCoords,
            destinationCoords: log.destinationCoords,
            routeCoords: log.routeCoords,
            routeGeoJson: log.routeGeoJson,
            label:
              log.location && log.destination
                ? `${log.location} → ${log.destination}`
                : log.destination || log.location || "Route history",
            timestamp: log.dateTime,
            status: log.status,
            id: log.id,
            activity: log.activity,
            action: log.action || log.activityType,
            color: log.color,
            icon: log.icon
          }
        }
      });
      return;
    }

    if (!Array.isArray(log.coordinates) || log.coordinates.length !== 2) return;

    const label =
      log.isRoute && log.destination
        ? `${log.location} → ${log.destination}`
        : log.lastLocation || log.location;

    navigate("/dashboard", {
      state: {
        historyLocation: {
          mode: "point",
          coords: log.coordinates,
          label,
          timestamp: log.dateTime,
          status: log.status,
          id: log.id,
          activity: log.activity,
          action: log.action || log.activityType,
          color: log.color,
          icon: log.icon
        }
      }
    });
  };

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
            Device Logs
          </h2>
          <p className="text-gray-500 text-xs md:text-sm">
            Monitor and track detailed VIP movement and activity history.
          </p>
        </div>

        {error && !deviceLogs.length && (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

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
                placeholder="Search by guardian, VIP, activity, or device..."
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
              statusOptions={STATUS_OPTIONS}
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
                const opt = STATUS_OPTIONS.find((o) => o.value === val);
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
                Clear all
              </button>
            </div>
          )}
        </div>

        {isLoading && !deviceLogs.length ? (
          <div className="bg-white rounded-b-2xl shadow-sm p-8 md:p-16 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Icon
                icon="eos-icons:loading"
                className="text-3xl text-gray-400 animate-spin"
              />
            </div>
            <h3 className="text-lg font-semibold text-[#11285A] mb-1">
              Loading device logs
            </h3>
            <p className="text-sm text-gray-500 max-w-xs mx-auto">
              Pulling the latest fall, emergency, and route updates for this
              device.
            </p>
          </div>
        ) : totalItems === 0 ? (
          <div className="bg-white rounded-b-2xl shadow-sm p-8 md:p-16 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Icon icon="ph:files" className="text-3xl text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-[#11285A] mb-1">
              Nothing to see here
            </h3>
            <p className="text-sm text-gray-500 max-w-xs mx-auto">
              {searchTerm || activeFilterCount > 0
                ? "Try adjusting your search or filters."
                : `We couldn't find any activities matching "${searchTerm}".`}
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                handleClearAll();
              }}
              className="mt-6 text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table*/}
            <div className="hidden lg:block bg-white rounded-b-2xl shadow-sm overflow-x-auto">
              <table className="w-full min-w-[1100px]">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      VIP
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      VIP Name
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Activity
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Locations
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginatedLogs.map((log) => (
                    <tr
                      key={log.id}
                      className={`transition-colors ${
                        log.isClickable
                          ? "hover:bg-gray-50 cursor-pointer"
                          : "bg-gray-50/40 cursor-default opacity-80"
                      }`}
                      onClick={() => {
                        if (log.isClickable) handleViewOnMap(log);
                      }}
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
                        {log.isRoute ? (
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
                        ) : (
                          <div className="flex items-center gap-1.5 text-xs text-gray-600 truncate max-w-[200px]">
                            <Icon
                              icon="ph:map-pin-line"
                              className="text-blue-500 shrink-0"
                            />
                            <span className="truncate" title={log.lastLocation}>
                              {log.lastLocation || "Location unavailable"}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <p className="text-sm text-gray-800 whitespace-nowrap">
                            {log.dateTime}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile / Tablet Card View  */}
            <div className="lg:hidden bg-white rounded-b-2xl shadow-sm overflow-hidden">
              <div className="divide-y divide-gray-100">
                {paginatedLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleViewOnMap(log)}
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
                            {log.device || "No Device"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 mb-4">
                      <div className="flex items-center gap-2 mb-2 text-[#11285A] font-semibold text-sm">
                        <Icon icon="ph:activity-light" className="text-lg" />
                        {log.activity}
                      </div>
                      {log.isRoute ? (
                        <div className="flex flex-col gap-2 relative pl-2">
                          <div className="absolute left-[13px] top-[14px] bottom-[14px] w-px bg-gray-300"></div>
                          <div className="flex items-start gap-2 text-xs">
                            <div className="shrink-0 mt-0.5 relative z-10 w-4 h-4 rounded-full bg-blue-100 border border-blue-300 flex items-center justify-center">
                              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-gray-500 block text-[10px] uppercase font-semibold">
                                Origin
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
                                Destination
                              </span>
                              <span className="text-gray-700 truncate block">
                                {log.destination}
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-xs">
                          <div className="shrink-0 mt-0.5 w-4 h-4 rounded-full bg-blue-100 border border-blue-300 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-gray-500 block text-[10px] uppercase font-semibold">
                              Last location
                            </span>
                            <span className="text-gray-700 truncate block">
                              {log.lastLocation || "Location unavailable"}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-800 font-medium">
                        {log.dateTime}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination */}
            <div className="bg-white px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-100 rounded-b-2xl">
              <p className="text-xs sm:text-sm text-gray-500">
                Showing{" "}
                {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}-
                {Math.min(currentPage * itemsPerPage, totalItems)} of{" "}
                {totalItems.toLocaleString()}
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
