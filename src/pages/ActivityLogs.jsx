import { useState } from "react";
import { Icon } from "@iconify/react";
import ActivityActions from "@/ui/components/ActivityActions";
import DefaultProfile from "@/ui/components/DefaultProfile";
import { resolveProfileImageSrc } from "@/utils/ResolveImage";
import { useActivityReportsStore, useDevicesStore } from "@/stores/useStore";
import FilterDropdown from "@/ui/components/FilterDropdown"; // ← NEW

const toManilaDate = (raw) => {
  if (!raw) return null;
  const str = typeof raw === "string" ? raw.replace(" ", "T") : String(raw);
  const hasTz = /[+-]\d{2}:?\d{2}$/.test(str) || str.endsWith("Z");
  const iso = hasTz ? str : `${str}Z`;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatManilaDateTime = (raw) => {
  const date = toManilaDate(raw);
  if (!date) return "—";

  return date.toLocaleString("en-PH", {
    timeZone: "Asia/Manila",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });
};

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
  LOGIN: "login",
  SET_EMERGENCY: "emergency",
  UPDATE_RELATIONSHIP: "relationship"
};

// filter config van
const ACTION_OPTIONS = [
  { value: "LOGIN", label: "Login", icon: "ph:sign-in-bold" },
  { value: "CREATE", label: "Create", icon: "ph:plus-bold" },
  { value: "UPDATE", label: "Update", icon: "ph:pencil-bold" },
  { value: "DELETE", label: "Delete", icon: "ph:trash-bold" },
  { value: "PAIR", label: "Pair", icon: "ph:link-bold" },
  { value: "UNPAIR", label: "Unpair", icon: "ph:link-break-bold" },
  { value: "INVITE", label: "Invite", icon: "ph:envelope-bold" },
  {
    value: "REMOVE_GUARDIAN",
    label: "Remove Guardian",
    icon: "ph:user-minus-bold"
  },
  { value: "UPDATE_ROLE", label: "Update Role", icon: "ph:shield-bold" },
  { value: "ACCEPT_INVITE", label: "Accept Invite", icon: "ph:check-bold" },
  { value: "SET_EMERGENCY", label: "Set Emergency", icon: "ph:warning-bold" },
  { value: "UPDATE_RELATIONSHIP", label: "Relationship", icon: "ph:users-bold" }
];

const ActivityLogs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // filter to van
  const [selectedActions, setSelectedActions] = useState([]);

  const { history, isLoading, error } = useActivityReportsStore();
  const { selectedDevice } = useDevicesStore();
  const currentDeviceId = selectedDevice?.deviceId;

  // kasama to van
  const handleActionChange = (value) => {
    setSelectedActions((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
    setCurrentPage(1);
  };

  const handleClearAll = () => {
    setSelectedActions([]);
    setCurrentPage(1);
  };

  const activeFilterCount = selectedActions.length;

  // filtering van
  const scopedHistory = !currentDeviceId
    ? history
    : history.filter(
        (activity) =>
          Number(activity?.deviceId ?? activity?.device_id) ===
          Number(currentDeviceId)
      );

  const filteredActivities = scopedHistory.filter((activity) => {
    const matchesSearch =
      (activity.guardianName || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (activity.description || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (activity.action || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAction =
      selectedActions.length === 0 || selectedActions.includes(activity.action);

    return matchesSearch && matchesAction;
  });

  const totalItems = filteredActivities.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
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

  const renderGuardianAvatar = (activity, size = "w-10 h-10") => {
    const avatar =
      activity.guardianProfileImage ||
      activity.guardianAvatar ||
      activity.profileImage ||
      activity.avatar;
    const guardianName = activity.guardianName || "Guardian";
    return (
      <div
        className={`${size} rounded-full overflow-hidden shrink-0 bg-gray-100`}
      >
        {avatar ? (
          <img
            loading="lazy"
            src={resolveProfileImageSrc(avatar)}
            alt={guardianName}
            className="w-full h-full object-cover"
          />
        ) : (
          <DefaultProfile
            bgColor="bg-primary-100"
            userInitial={guardianName.charAt(0)}
          />
        )}
      </div>
    );
  };

  if (error) {
    return (
      <main className="bg-white md:bg-[#f9fafb] rounded-t-[32px] md:rounded-none min-h-[calc(100vh-var(--header-height)-var(--mobile-nav-height))] md:min-h-[calc(100vh-var(--header-height))] md:max-h-[calc(100vh-var(--header-height))] overflow-y-visible md:overflow-y-auto p-6 pb-[calc(var(--mobile-nav-height)+1.5rem)] md:pb-6">
        <div className="w-full font-poppins max-w-5xl mx-auto space-y-6">
          <div className="mb-4 md:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
              Activity Logs
            </h2>
            <p className="text-gray-500 text-xs md:text-sm">
              Monitor and track all guardian activities in your system
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
        <div data-tour="tour-activity-header" className="mb-4 md:mb-8">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 break-words">
            Activity Logs
          </h2>
          <p className="text-gray-500 text-xs md:text-sm">
            Monitor and track all guardian activities in your system
          </p>
        </div>

        {/* search and filter van */}
        <div
          data-tour="tour-activity-search"
          className="bg-white rounded-t-2xl p-4 md:p-6 border-b border-gray-100"
        >
          <div className="flex items-center gap-3">
            {/* search */}
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
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            {/* filter btn van */}
            <FilterDropdown
              actionOptions={ACTION_OPTIONS}
              selectedActions={selectedActions}
              onActionChange={handleActionChange}
              onClearAll={handleClearAll}
              activeCount={activeFilterCount}
            />
          </div>

          {/* active filter van */}
          {selectedActions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {selectedActions.map((val) => {
                const opt = ACTION_OPTIONS.find((o) => o.value === val);
                return (
                  <span
                    key={val}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#11285A]/10 text-[#11285A] text-xs font-medium"
                  >
                    {opt?.icon && <Icon icon={opt.icon} className="text-sm" />}
                    {opt?.label || val}
                    <button
                      onClick={() => handleActionChange(val)}
                      className="ml-0.5 hover:text-red-500 cursor-pointer"
                    >
                      <Icon icon="ph:x-bold" className="text-[10px]" />
                    </button>
                  </span>
                );
              })}
              <button
                onClick={handleClearAll}
                className="text-xs text-red-500 hover:underline font-medium cursor-pointer"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {!isLoading && totalItems === 0 ? (
          <div className="bg-white rounded-b-2xl shadow-sm p-8 md:p-16 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Icon icon="ph:files" className="text-3xl text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-[#11285A] mb-1">
              {searchTerm || selectedActions.length > 0
                ? "Nothing to see here"
                : "No activity yet"}
            </h3>
            <p className="text-sm text-gray-500 max-w-xs mx-auto">
              {searchTerm || selectedActions.length > 0
                ? "Try adjusting your search or filters."
                : "Actions you perform will appear here."}
            </p>
            {(searchTerm || selectedActions.length > 0) && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  handleClearAll();
                }}
                className="mt-6 text-sm font-medium text-blue-600 hover:underline"
              >
                Clear filters
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
                    {isLoading
                      ? Array.from({ length: itemsPerPage }).map((_, index) => (
                          <tr key={`sk-${index}`} className="animate-pulse">
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-200 rounded-full" />
                                <div className="h-4 w-32 bg-gray-200 rounded" />
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="h-7 w-24 bg-gray-200 rounded-full" />
                            </td>
                            <td className="py-4 px-6">
                              <div className="space-y-2">
                                <div className="h-4 w-full bg-gray-200 rounded" />
                                <div className="h-4 w-4/5 bg-gray-200 rounded" />
                              </div>
                            </td>
                            <td className="py-4 px-6 text-right">
                              <div className="h-4 w-28 bg-gray-200 rounded ml-auto" />
                            </td>
                          </tr>
                        ))
                      : paginatedActivities.map((activity, index) => (
                          <tr
                            key={activity.historyId ?? index}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                {renderGuardianAvatar(activity, "w-10 h-10")}
                                <p className="font-semibold text-sm text-gray-900">
                                  {activity.guardianName || "—"}
                                </p>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="scale-75 origin-left">
                                <ActivityActions
                                  type={
                                    ACTION_TYPE_MAP[activity.action] ||
                                    "settings"
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
                                {formatManilaDateTime(activity.createdAt)}
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
                    <div className="flex items-start gap-3 mb-3">
                      {renderGuardianAvatar(activity, "w-11 h-11")}
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm text-gray-900 truncate">
                          {activity.guardianName || "—"}
                        </p>
                        <p className="text-xs text-gray-400 font-medium mt-1">
                          {formatManilaDateTime(activity.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="mb-2 inline-block">
                      <ActivityActions
                        type={ACTION_TYPE_MAP[activity.action] || "settings"}
                      />
                    </div>
                    <p className="text-sm text-gray-600 mb-2 leading-relaxed">
                      {activity.description || "—"}
                    </p>
                  </div>
                ))}
              </div>
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

export default ActivityLogs;
