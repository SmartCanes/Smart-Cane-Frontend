import { useEffect, useState, useCallback } from "react";
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
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

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
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex gap-4 animate-pulse items-center">
        <div className="h-9 bg-gray-100 rounded-xl w-44 flex-shrink-0" />
        <div className="h-9 bg-gray-100 rounded-xl w-40" />
        <div className="h-6 bg-gray-100 rounded-full w-44" />
        <div className="h-6 bg-gray-100 rounded-full w-56" />
      </div>
    ))}
  </div>
);

// ─────────────────────────────────────────────
//  Stat Card (reused)
// ─────────────────────────────────────────────
function StatCard({ label, value, icon, loading, sub }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 shadow-sm">
      <div className="p-3 bg-red-50 rounded-xl shadow-sm">
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        {loading ? (
          <div className="h-8 w-16 bg-gray-100 rounded animate-pulse" />
        ) : (
          <p className="text-3xl font-bold text-[#1a2e4a] leading-tight">{value}</p>
        )}
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  Main Component
// ─────────────────────────────────────────────
export default function ManageEmergencyLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "error") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      // Replace with your actual endpoint that returns emergency logs with full details
      const data = await apiFetch("/api/emergency-logs/");
      setLogs(data);
    } catch (err) {
      showToast(err.message || "Failed to load emergency logs", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Stats
  const totalEmergencies = logs.length;
  const uniqueDevices = new Set(logs.map(l => l.device_serial_number)).size;

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
              <h2 className="text-2xl font-bold text-[#1a2e4a]">Emergency Logs</h2>
              <p className="text-gray-500 text-sm mt-0.5">
                View all SOS alerts and device‑down events.
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatCard
              label="Total Emergencies"
              value={totalEmergencies}
              loading={loading}
              icon={<AlertTriangle size={22} className="text-red-600" />}
              sub="All time"
            />
            <StatCard
              label="Affected Devices"
              value={uniqueDevices}
              loading={loading}
              icon={<Cpu size={22} className="text-red-600" />}
              sub="Unique devices"
            />
          </div>

          {/* Table Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-[#1a2e4a]">Emergency Events</h3>
              <span className="text-sm text-gray-400">
                {totalEmergencies} event{totalEmergencies !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <LoadingSkeleton />
              ) : logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                  <AlertTriangle size={52} className="mb-4 text-gray-200" />
                  <p className="text-lg font-semibold text-gray-500">No emergency logs found</p>
                  <p className="text-sm mt-1 text-gray-400">
                    SOS or device‑down events will appear here.
                  </p>
                </div>
              ) : (
                <table className="w-full min-w-[800px]">
                  <thead>
                    <tr className="bg-gradient-to-r from-[#f0f6ff] to-[#e8f0fe]">
                      {["Cane Serial Number", "Assigned VIP", "Guardians", "Emergency Logs", "Timestamp"].map((h) => (
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
                    {logs.map((log, idx) => (
                      <tr
                        key={log.id || idx}
                        className={`border-t border-gray-50 hover:bg-red-50/10 transition-colors
                          ${idx % 2 === 0 ? "bg-white" : "bg-[#fafcff]"}`}
                      >
                        {/* Serial Number */}
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

                        {/* VIP */}
                        <td className="px-5 py-4">
                          {log.vip ? (
                            <div>
                              <p className="text-sm font-semibold text-[#1a2e4a] leading-tight">
                                {log.vip.first_name} {log.vip.last_name}
                              </p>
                              <p className="text-xs text-gray-400">ID #{log.vip.vip_id}</p>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 italic">No VIP assigned</span>
                          )}
                        </td>

                        {/* Guardians */}
                        <td className="px-5 py-4">
                          {log.guardians && log.guardians.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {log.guardians.slice(0, 2).map((g) => (
                                <span
                                  key={g.guardian_id}
                                  title={`${g.first_name} ${g.last_name} · ${g.role}`}
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap
                                    ${g.role === "primary"
                                      ? "bg-pink-50 text-pink-700 border-pink-200"
                                      : "bg-blue-50 text-blue-700 border-blue-100"}`}
                                >
                                  <User size={10} />
                                  {g.first_name}
                                  {g.role === "primary" && (
                                    <span className="text-pink-400 leading-none" style={{ fontSize: "10px" }}>♥</span>
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
                            <span className="text-xs text-gray-400 italic">None assigned</span>
                          )}
                        </td>

                        {/* Log Message */}
                        <td className="px-5 py-4">
                          <div className="flex items-start gap-2">
                            <AlertTriangle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{log.log_message}</span>
                          </div>
                        </td>

                        {/* Timestamp */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 whitespace-nowrap">
                            <Clock size={12} className="flex-shrink-0" />
                            {log.created_at
                              ? formatDistanceToNow(new Date(log.created_at), { addSuffix: true })
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