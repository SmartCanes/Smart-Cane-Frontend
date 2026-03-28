import { useEffect, useState, useCallback, useRef } from "react";
import {
  ShieldCheck,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Users,
  Cpu,
  Heart,
  Mail,
  Phone,
  Calendar,
} from "lucide-react";

// ─────────────────────────────────────────────
//  Config & Auth Helpers
// ─────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
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

// ─────────────────────────────────────────────
//  Toast
// ─────────────────────────────────────────────
const Toast = ({ toasts }) => (
  <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none">
    {toasts.map((t) => (
      <div
        key={t.id}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-white text-sm font-medium pointer-events-auto
          ${t.type === "success" ? "bg-green-600" : t.type === "error" ? "bg-red-600" : "bg-[#11285A]"}`}
        style={{ animation: "slideIn 0.25s ease" }}
      >
        {t.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
        {t.message}
      </div>
    ))}
  </div>
);

// ─────────────────────────────────────────────
//  Loading Skeleton
// ─────────────────────────────────────────────
const LoadingSkeleton = () => (
  <div className="p-5 space-y-3">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="flex gap-4 animate-pulse items-center">
        <div className="h-9 bg-gray-100 rounded-xl w-32 flex-shrink-0" />
        <div className="h-9 bg-gray-100 rounded-xl w-40" />
        <div className="h-6 bg-gray-100 rounded-full w-44" />
        <div className="h-6 bg-gray-100 rounded-full w-24" />
        <div className="h-6 bg-gray-100 rounded-full w-32" />
        <div className="h-5 bg-gray-100 rounded w-28" />
      </div>
    ))}
  </div>
);

// ─────────────────────────────────────────────
//  Devices Cell Component (with tooltip)
// ─────────────────────────────────────────────
const DevicesCell = ({ devices }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef(null);

  if (!devices || devices.length === 0) {
    return <span className="text-xs text-gray-400 italic">No devices</span>;
  }

  const visibleDevices = devices.slice(0, 2);
  const remainingCount = devices.length - 2;

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-1.5 items-center">
        {visibleDevices.map((d) => (
          <span
            key={d.device_id}
            className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-100 whitespace-nowrap font-mono"
          >
            <Cpu size={10} />
            {d.device_serial_number}
          </span>
        ))}
        {remainingCount > 0 && (
          <div
            className="relative"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs font-semibold cursor-help">
              +{remainingCount}
            </span>
            {showTooltip && (
              <div
                ref={tooltipRef}
                className="absolute z-50 bottom-full left-0 mb-2 bg-gray-800 text-white text-xs rounded-lg py-2 px-3 shadow-lg whitespace-nowrap"
              >
                {devices.map((d) => (
                  <div key={d.device_id} className="py-0.5">
                    {d.device_serial_number}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
//  Main Component
// ─────────────────────────────────────────────
export default function ManageGuardian() {
  const [guardians, setGuardians] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [toasts, setToasts]       = useState([]);

  const showToast = useCallback((message, type = "error") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  const fetchGuardians = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/api/guardians/");
      setGuardians(data);
    } catch (err) {
      showToast(err.message || "Failed to load guardians", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchGuardians();
  }, [fetchGuardians]);

  // ── Stats ──────────────────────────────────
  const totalGuardians   = guardians.length;
  const withDevices      = guardians.filter((g) => g.devices?.length > 0).length;
  const primaryCount     = guardians.filter((g) =>
    g.devices?.some((d) => d.role === "primary")
  ).length;

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
              <h2 className="text-2xl font-bold text-[#1a2e4a]">Manage Guardians</h2>
              <p className="text-gray-500 text-sm mt-0.5">
                View all registered guardians, their linked devices, and assigned VIPs.
              </p>
            </div>
            <button
              onClick={fetchGuardians}
              disabled={loading}
              className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                label: "Total Guardians",
                value: totalGuardians,
                icon: ShieldCheck,
                gradient: "from-blue-50 to-indigo-50",
                border: "border-blue-100",
                iconBg: "bg-blue-50",
                iconColor: "text-blue-600",
              },
              {
                label: "With Devices",
                value: withDevices,
                icon: Cpu,
                gradient: "from-green-50 to-emerald-50",
                border: "border-green-100",
                iconBg: "bg-green-50",
                iconColor: "text-green-600",
              },
              {
                label: "Primary Guardians",
                value: primaryCount,
                icon: Heart,
                gradient: "from-pink-50 to-rose-50",
                border: "border-pink-100",
                iconBg: "bg-pink-50",
                iconColor: "text-pink-500",
              },
            ].map(({ label, value, icon: Icon, gradient, border, iconBg, iconColor }) => (
              <div
                key={label}
                className={`bg-gradient-to-br ${gradient} rounded-2xl border ${border} p-5 flex items-center gap-4 shadow-sm`}
              >
                <div className={`p-3 ${iconBg} rounded-xl shadow-sm`}>
                  <Icon size={22} className={iconColor} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">{label}</p>
                  <p className="text-3xl font-bold text-[#1a2e4a] leading-tight">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Table Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-[#1a2e4a]">All Guardians</h3>
              <span className="text-sm text-gray-400">
                {totalGuardians} guardian{totalGuardians !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <LoadingSkeleton />
              ) : guardians.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                  <ShieldCheck size={52} className="mb-4 text-gray-200" />
                  <p className="text-lg font-semibold text-gray-500">No guardians registered yet</p>
                  <p className="text-sm mt-1 text-gray-400">
                    Guardians register through the mobile app.
                  </p>
                </div>
              ) : (
                <table className="w-full min-w-[820px]">
                  <thead>
                    <tr className="bg-gradient-to-r from-[#f0f6ff] to-[#e8f0fe]">
                      {[
                        "Guardian",
                        "Contact",
                        "Devices",
                        "VIPs",
                        "Location",
                        "Joined",
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
                    {guardians.map((g, i) => (
                      <tr
                        key={g.guardian_id}
                        className={`border-t border-gray-50 hover:bg-blue-50/20 transition-colors
                          ${i % 2 === 0 ? "bg-white" : "bg-[#fafcff]"}`}
                      >
                        {/* Guardian name + username */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="p-1.5 bg-blue-50 rounded-lg flex-shrink-0">
                              <ShieldCheck size={14} className="text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-[#1a2e4a] leading-tight">
                                {g.first_name} {g.last_name}
                              </p>
                              <p className="text-xs text-gray-400">@{g.username}</p>
                            </div>
                          </div>
                        </td>

                        {/* Email + contact */}
                        <td className="px-5 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-xs text-gray-600">
                              <Mail size={11} className="text-gray-400 flex-shrink-0" />
                              <span className="truncate max-w-[180px]">{g.email}</span>
                            </div>
                            {g.contact_number && (
                              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                <Phone size={11} className="text-gray-400 flex-shrink-0" />
                                {g.contact_number}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Devices */}
                        <td className="px-5 py-4">
                          <DevicesCell devices={g.devices} />
                        </td>

                        {/* VIPs */}
                        <td className="px-5 py-4">
                          {g.vips && g.vips.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {g.vips.slice(0, 2).map((v) => (
                                <span
                                  key={v.vip_id}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full text-xs font-medium border border-purple-100 whitespace-nowrap"
                                >
                                  <Users size={10} />
                                  {v.first_name} {v.last_name}
                                </span>
                              ))}
                              {g.vips.length > 2 && (
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs font-semibold">
                                  +{g.vips.length - 2}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 italic">No VIPs</span>
                          )}
                        </td>

                        {/* Location */}
                        <td className="px-5 py-4">
                          <p className="text-sm text-gray-700">
                            {[g.city, g.province].filter(Boolean).join(", ") || (
                              <span className="text-xs text-gray-400 italic">—</span>
                            )}
                          </p>
                        </td>

                        {/* Joined date */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 whitespace-nowrap">
                            <Calendar size={12} className="flex-shrink-0" />
                            {g.created_at
                              ? new Date(g.created_at).toLocaleDateString("en-PH", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })
                              : "—"}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}