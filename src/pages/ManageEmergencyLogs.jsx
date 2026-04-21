import { useEffect, useState, useCallback, useMemo } from "react";
import {
  AlertTriangle,
  RefreshCw,
  Cpu,
  User,
  Shield,
  WifiOff,
  Clock,
  CheckCircle,
  AlertCircle,
  MapPin,
  Siren,
  PersonStanding,
  Activity,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

//  Config & Auth
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";
const getToken = () => localStorage.getItem("access_token");

const apiFetch = async (path, options = {}) => {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
};

const parseServerTimestamp = (value) => {
  if (!value) return null;
  if (value instanceof Date)
    return Number.isNaN(value.getTime()) ? null : value;

  const text = String(value).trim();
  if (!text) return null;

  const isPlainDateTime =
    /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}(\.\d{1,6})?$/.test(text);
  const normalized = isPlainDateTime ? `${text.replace(" ", "T")}Z` : text;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
};

const matchesTriggeredDate = (createdAt, dateFilter) => {
  if (dateFilter === "all") return true;
  if (!createdAt) return false;

  const triggeredDate = parseServerTimestamp(createdAt);
  if (!triggeredDate) return false;

  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );

  if (dateFilter === "today") {
    return triggeredDate >= startOfToday;
  }

  if (dateFilter === "last7") {
    const cutoff = new Date(startOfToday);
    cutoff.setDate(cutoff.getDate() - 6);
    return triggeredDate >= cutoff;
  }

  if (dateFilter === "last30") {
    const cutoff = new Date(startOfToday);
    cutoff.setDate(cutoff.getDate() - 29);
    return triggeredDate >= cutoff;
  }

  if (dateFilter === "this_month") {
    return (
      triggeredDate.getFullYear() === now.getFullYear() &&
      triggeredDate.getMonth() === now.getMonth()
    );
  }

  if (dateFilter === "this_year") {
    return triggeredDate.getFullYear() === now.getFullYear();
  }

  return true;
};

const formatPHDateTime = (createdAt) => {
  if (!createdAt) return "—";
  const date = parseServerTimestamp(createdAt);
  if (!date) return "—";
  const formatted = date.toLocaleString("en-PH", {
    timeZone: "Asia/Manila",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${formatted} (UTC+8)`;
};

//  Toast
const Toast = ({ toasts }) => (
  <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none">
    {toasts.map((t) => (
      <div
        key={t.id}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-white text-sm font-medium pointer-events-auto
          ${t.type === "success" ? "bg-green-600" : t.type === "error" ? "bg-red-600" : "bg-[#11285A]"}`}
        style={{ animation: "slideIn 0.25s ease" }}
      >
        {t.type === "success" ? (
          <CheckCircle size={16} />
        ) : (
          <AlertCircle size={16} />
        )}
        {t.message}
      </div>
    ))}
  </div>
);

//  Loading Skeleton
const LoadingSkeleton = () => (
  <div className="p-5 space-y-3">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex gap-4 animate-pulse items-center">
        <div className="h-9 bg-gray-100 rounded-xl w-44 flex-shrink-0" />
        <div className="h-9 bg-gray-100 rounded-xl w-40" />
        <div className="h-6 bg-gray-100 rounded-full w-44" />
        <div className="h-6 bg-gray-100 rounded-full w-32" />
        <div className="h-6 bg-gray-100 rounded-full w-48" />
        <div className="h-6 bg-gray-100 rounded-full w-36" />
      </div>
    ))}
  </div>
);

//  Stat Card
function StatCard({ label, value, icon, loading, sub }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 shadow-sm">
      <div className="p-3 bg-red-50 rounded-xl shadow-sm">{icon}</div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        {loading ? (
          <div className="h-8 w-16 bg-gray-100 rounded animate-pulse" />
        ) : (
          <p className="text-3xl font-bold text-[#1a2e4a] leading-tight">
            {value}
          </p>
        )}
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

//  Emergency Type Badge
function EmergencyBadge({ type }) {
  const isFall = type === "FALL";
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border whitespace-nowrap
        ${
          isFall
            ? "bg-orange-50 text-orange-700 border-orange-200"
            : "bg-red-50 text-red-700 border-red-200"
        }`}
    >
      {isFall ? <PersonStanding size={12} /> : <Siren size={12} />}
      {isFall ? "Fall Detected" : "SOS / Emergency"}
    </span>
  );
}

//  Main Component
export default function ManageEmergencyLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [triggeredDateFilter, setTriggeredDateFilter] = useState("all");

  const showToast = useCallback((message, type = "error") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      3500,
    );
  }, []);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/api/emergency-logs/");
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast(err.message || "Failed to load emergency logs", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const filteredLogs = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    return logs.filter((log) => {
      if (typeFilter !== "all" && log.emergency_type !== typeFilter) {
        return false;
      }

      const hasLocation = Boolean(log.last_location);
      if (locationFilter === "with_location" && !hasLocation) return false;
      if (locationFilter === "without_location" && hasLocation) return false;

      if (!matchesTriggeredDate(log.created_at, triggeredDateFilter)) {
        return false;
      }

      if (!q) return true;

      const guardianText = (log.guardians || [])
        .map((g) =>
          `${g.first_name || ""} ${g.last_name || ""} ${g.role || ""}`.trim(),
        )
        .join(" ");

      const haystack = [
        log.device_serial_number || "",
        log.emergency_type || "",
        log.log_message || "",
        log.last_location || "",
        log.vip
          ? `${log.vip.first_name || ""} ${log.vip.last_name || ""}`.trim()
          : "",
        guardianText,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [logs, searchTerm, typeFilter, locationFilter, triggeredDateFilter]);

  const totalEmergencies = filteredLogs.length;
  const totalSOS = filteredLogs.filter(
    (l) => l.emergency_type === "EMERGENCY",
  ).length;
  const totalFalls = filteredLogs.filter(
    (l) => l.emergency_type === "FALL",
  ).length;
  const uniqueDevices = new Set(filteredLogs.map((l) => l.device_serial_number))
    .size;
  const hasActiveFilters =
    searchTerm.trim().length > 0 ||
    typeFilter !== "all" ||
    locationFilter !== "all" ||
    triggeredDateFilter !== "all";

  return (
    <>
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      <Toast toasts={toasts} />

      <div className="min-h-screen bg-[#f9fafb] px-2 sm:px-4 py-4 sm:py-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-[#1a2e4a]">
                Emergency Logs
              </h2>
              <p className="text-gray-500 text-sm mt-0.5">
                All SOS alerts and fall detection events from paired canes.
              </p>
            </div>
            <button
              onClick={fetchLogs}
              disabled={loading}
              className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Events"
              value={totalEmergencies}
              loading={loading}
              icon={<Activity size={22} className="text-red-600" />}
              sub="All time"
            />
            <StatCard
              label="SOS / Emergency"
              value={totalSOS}
              loading={loading}
              icon={<Siren size={22} className="text-red-600" />}
              sub="Button triggered"
            />
            <StatCard
              label="Fall Detected"
              value={totalFalls}
              loading={loading}
              icon={<PersonStanding size={22} className="text-orange-500" />}
              sub="Auto-detected"
            />
            <StatCard
              label="Affected Devices"
              value={uniqueDevices}
              loading={loading}
              icon={<Cpu size={22} className="text-red-600" />}
              sub="Unique canes"
            />
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-[#1a2e4a]">Emergency Events</h3>
              <span className="text-sm text-gray-400">
                {totalEmergencies} event{totalEmergencies !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
              <div className="w-full lg:max-w-md">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search device, VIP, guardian, message, or location"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1565C0]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2 w-full lg:w-auto">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1565C0]"
                >
                  <option value="all">All Types</option>
                  <option value="EMERGENCY">SOS / Emergency</option>
                  <option value="FALL">Fall Detected</option>
                </select>

                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1565C0]"
                >
                  <option value="all">All Location States</option>
                  <option value="with_location">With Location</option>
                  <option value="without_location">No Location</option>
                </select>

                <select
                  value={triggeredDateFilter}
                  onChange={(e) => setTriggeredDateFilter(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1565C0]"
                >
                  <option value="all">All Trigger Dates</option>
                  <option value="today">Triggered Today</option>
                  <option value="last7">Last 7 Days</option>
                  <option value="last30">Last 30 Days</option>
                  <option value="this_month">This Month</option>
                  <option value="this_year">This Year</option>
                </select>

                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setTypeFilter("all");
                    setLocationFilter("all");
                    setTriggeredDateFilter("all");
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>

            <div>
              {loading ? (
                <LoadingSkeleton />
              ) : filteredLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                  <AlertTriangle size={52} className="mb-4 text-gray-200" />
                  <p className="text-lg font-semibold text-gray-500">
                    {hasActiveFilters
                      ? "No emergency logs match your filters"
                      : "No emergency logs found"}
                  </p>
                  <p className="text-sm mt-1 text-gray-400">
                    {hasActiveFilters
                      ? "Try adjusting your search or filter options."
                      : "SOS or fall detection events will appear here."}
                  </p>
                </div>
              ) : (
                <>
                  <div className="xl:hidden divide-y divide-gray-100">
                    {filteredLogs.map((log, idx) => (
                      <div key={log.id || idx} className="p-4 sm:p-5 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5 min-w-0">
                            <div className="p-1.5 bg-blue-50 rounded-lg flex-shrink-0 mt-0.5">
                              <Cpu size={14} className="text-blue-600" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-mono text-sm font-semibold text-[#1a2e4a] break-all">
                                {log.device_serial_number}
                              </p>
                              {log.vip ? (
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {log.vip.first_name} {log.vip.last_name} · ID
                                  #{log.vip.vip_id}
                                </p>
                              ) : (
                                <p className="text-xs text-gray-400 italic mt-0.5">
                                  No VIP assigned
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="flex items-center justify-end gap-1.5 text-xs text-gray-500 whitespace-nowrap">
                              <Clock size={12} className="flex-shrink-0" />
                              {(() => {
                                const createdAt = parseServerTimestamp(
                                  log.created_at,
                                );
                                return createdAt
                                  ? formatDistanceToNow(createdAt, {
                                      addSuffix: true,
                                    })
                                  : "—";
                              })()}
                            </div>
                            {log.created_at && (
                              <p className="text-[10px] text-gray-400 mt-0.5">
                                {formatPHDateTime(log.created_at)}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="rounded-xl border border-gray-100 bg-[#fafcff] p-3">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#1565C0]">
                            Emergency
                          </p>
                          <div className="mt-1.5 flex flex-col gap-1.5">
                            <EmergencyBadge type={log.emergency_type} />
                            {log.log_message && (
                              <p className="text-xs text-gray-500 break-words">
                                {log.log_message}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="rounded-xl border border-gray-100 bg-[#fafcff] p-3">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#1565C0]">
                              Guardians
                            </p>
                            {log.guardians && log.guardians.length > 0 ? (
                              <div className="mt-1.5 flex flex-wrap gap-1.5">
                                {log.guardians.slice(0, 3).map((g) => (
                                  <span
                                    key={g.guardian_id}
                                    title={`${g.first_name} ${g.last_name} · ${g.role}`}
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border max-w-full
                                      ${
                                        g.role === "primary"
                                          ? "bg-pink-50 text-pink-700 border-pink-200"
                                          : "bg-blue-50 text-blue-700 border-blue-100"
                                      }`}
                                  >
                                    <User size={10} className="flex-shrink-0" />
                                    <span className="truncate">
                                      {g.first_name}
                                    </span>
                                    {g.role === "primary" && (
                                      <span
                                        className="text-pink-400 leading-none"
                                        style={{ fontSize: "10px" }}
                                      >
                                        ♥
                                      </span>
                                    )}
                                  </span>
                                ))}
                                {log.guardians.length > 3 && (
                                  <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs font-semibold self-center">
                                    +{log.guardians.length - 3}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <p className="mt-1.5 text-xs text-gray-400 italic">
                                None assigned
                              </p>
                            )}
                          </div>

                          <div className="rounded-xl border border-gray-100 bg-[#fafcff] p-3">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#1565C0]">
                              Last Location
                            </p>
                            {log.last_location ? (
                              <div className="mt-1.5 flex items-start gap-1.5">
                                <MapPin
                                  size={13}
                                  className="text-gray-400 mt-0.5 flex-shrink-0"
                                />
                                <span className="text-sm text-gray-700 leading-snug break-words">
                                  {log.last_location}
                                </span>
                              </div>
                            ) : (
                              <div className="mt-1.5 flex items-center gap-1.5">
                                <WifiOff size={13} className="text-gray-300" />
                                <span className="text-xs text-gray-400 italic">
                                  No location data
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="hidden xl:block overflow-x-auto">
                    <table className="w-full min-w-[960px]">
                      <thead>
                        <tr className="bg-gradient-to-r from-[#f0f6ff] to-[#e8f0fe]">
                          {[
                            "Device (Serial)",
                            "Assigned VIP",
                            "Guardians",
                            "Emergency",
                            "Last Location",
                            "Date",
                          ].map((h) => (
                            <th
                              key={h}
                              className="px-5 py-3.5 text-left text-xs font-semibold text-[#1565C0] uppercase tracking-wider whitespace-nowrap"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredLogs.map((log, idx) => (
                          <tr
                            key={log.id || idx}
                            className={`border-t border-gray-50 hover:bg-red-50/20 transition-colors
                              ${idx % 2 === 0 ? "bg-white" : "bg-[#fafcff]"}`}
                          >
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2.5">
                                <div className="p-1.5 bg-blue-50 rounded-lg flex-shrink-0">
                                  <Cpu size={14} className="text-blue-600" />
                                </div>
                                <span className="font-mono text-sm font-semibold text-[#1a2e4a]">
                                  {log.device_serial_number}
                                </span>
                              </div>
                            </td>

                            <td className="px-5 py-4">
                              {log.vip ? (
                                <div>
                                  <p className="text-sm font-semibold text-[#1a2e4a] leading-tight">
                                    {log.vip.first_name} {log.vip.last_name}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    ID #{log.vip.vip_id}
                                  </p>
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400 italic">
                                  No VIP assigned
                                </span>
                              )}
                            </td>

                            <td className="px-5 py-4">
                              {log.guardians && log.guardians.length > 0 ? (
                                <div className="flex flex-wrap gap-1.5">
                                  {log.guardians.slice(0, 2).map((g) => (
                                    <span
                                      key={g.guardian_id}
                                      title={`${g.first_name} ${g.last_name} · ${g.role}`}
                                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap
                                        ${
                                          g.role === "primary"
                                            ? "bg-pink-50 text-pink-700 border-pink-200"
                                            : "bg-blue-50 text-blue-700 border-blue-100"
                                        }`}
                                    >
                                      <User size={10} />
                                      {g.first_name}
                                      {g.role === "primary" && (
                                        <span
                                          className="text-pink-400 leading-none"
                                          style={{ fontSize: "10px" }}
                                        >
                                          ♥
                                        </span>
                                      )}
                                    </span>
                                  ))}
                                  {log.guardians.length > 2 && (
                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs font-semibold self-center">
                                      +{log.guardians.length - 2}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400 italic">
                                  None assigned
                                </span>
                              )}
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex flex-col gap-1.5">
                                <EmergencyBadge type={log.emergency_type} />
                                {log.log_message && (
                                  <p className="text-xs text-gray-500 max-w-[200px] line-clamp-2">
                                    {log.log_message}
                                  </p>
                                )}
                              </div>
                            </td>

                            <td className="px-5 py-4">
                              {log.last_location ? (
                                <div className="flex items-start gap-1.5 max-w-[200px]">
                                  <MapPin
                                    size={13}
                                    className="text-gray-400 mt-0.5 flex-shrink-0"
                                  />
                                  <span className="text-sm text-gray-700 leading-snug">
                                    {log.last_location}
                                  </span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5">
                                  <WifiOff
                                    size={13}
                                    className="text-gray-300"
                                  />
                                  <span className="text-xs text-gray-400 italic">
                                    No location data
                                  </span>
                                </div>
                              )}
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex items-center gap-1.5 text-xs text-gray-500 whitespace-nowrap">
                                <Clock size={12} className="flex-shrink-0" />
                                {(() => {
                                  const createdAt = parseServerTimestamp(
                                    log.created_at,
                                  );
                                  return createdAt
                                    ? formatDistanceToNow(createdAt, {
                                        addSuffix: true,
                                      })
                                    : "—";
                                })()}
                              </div>
                              {log.created_at && (
                                <p className="text-[10px] text-gray-400 mt-0.5 pl-4">
                                  {formatPHDateTime(log.created_at)}
                                </p>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
