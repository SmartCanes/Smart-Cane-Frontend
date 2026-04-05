import { useEffect, useState, useCallback } from "react";
import {
  Users,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  Cpu,
  MapPin,
  Calendar,
  User,
  X,
} from "lucide-react";

//  Config & Auth Helpers
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
        {t.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
        {t.message}
      </div>
    ))}
  </div>
);

//  Loading Skeleton
const LoadingSkeleton = () => (
  <div className="p-5 space-y-3">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="flex gap-4 animate-pulse items-center">
        <div className="h-9 bg-gray-100 rounded-xl w-32 flex-shrink-0" />
        <div className="h-9 bg-gray-100 rounded-xl w-40" />
        <div className="h-6 bg-gray-100 rounded-full w-32" />
        <div className="h-6 bg-gray-100 rounded-full w-36" />
        <div className="h-5 bg-gray-100 rounded w-28" />
        <div className="h-5 bg-gray-100 rounded w-24" />
      </div>
    ))}
  </div>
);

//  Main Component
export default function ManageVip() {
  const [vips, setVips]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts]   = useState([]);
  const [isDesktopPreviewMode, setIsDesktopPreviewMode] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 1280 : true
  );
  const [guardianHoverPreview, setGuardianHoverPreview] = useState({
    open: false,
    x: 0,
    y: 0,
    title: "",
    guardians: [],
  });
  const [guardianClickPreview, setGuardianClickPreview] = useState({
    open: false,
    title: "",
    guardians: [],
  });

  const showToast = useCallback((message, type = "error") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  const fetchVips = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/api/vips/");
      setVips(data);
    } catch (err) {
      showToast(err.message || "Failed to load VIPs", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchVips();
  }, [fetchVips]);

  useEffect(() => {
    const onResize = () => {
      const nextDesktopMode = window.innerWidth >= 1280;
      setIsDesktopPreviewMode(nextDesktopMode);
      if (!nextDesktopMode) {
        setGuardianHoverPreview((prev) => ({ ...prev, open: false }));
      }
    };

    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const openGuardianHoverPreview = (event, title, guardians) => {
    if (!isDesktopPreviewMode || !guardians.length) return;

    const panelWidth = 320;
    const panelHeight = 240;
    const x = Math.min(event.clientX + 12, window.innerWidth - panelWidth - 12);
    const y = Math.min(event.clientY + 12, window.innerHeight - panelHeight - 12);

    setGuardianHoverPreview({
      open: true,
      x,
      y,
      title,
      guardians,
    });
  };

  const closeGuardianHoverPreview = () => {
    setGuardianHoverPreview((prev) => ({ ...prev, open: false }));
  };

  const openGuardianClickPreview = (title, guardians) => {
    if (!guardians.length) return;
    setGuardianClickPreview({
      open: true,
      title,
      guardians,
    });
  };

  const closeGuardianClickPreview = () => {
    setGuardianClickPreview({
      open: false,
      title: "",
      guardians: [],
    });
  };

  const totalVips       = vips.length;
  const withDevices     = vips.filter((v) => v.devices?.length > 0).length;
  const withGuardians   = vips.filter((v) => v.guardians?.length > 0).length;

  return (
    <>
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      <Toast toasts={toasts} />

      {guardianHoverPreview.open && isDesktopPreviewMode && (
        <div
          className="fixed z-[9998] w-[320px] max-w-[calc(100vw-24px)] rounded-xl border border-[#bfcef0] bg-white p-4 shadow-2xl pointer-events-none"
          style={{ left: guardianHoverPreview.x, top: guardianHoverPreview.y }}
        >
          <p className="text-[11px] uppercase tracking-wide font-semibold text-[#1565C0]">
            {guardianHoverPreview.title}
          </p>
          <div className="mt-2 max-h-[180px] overflow-y-auto space-y-1.5 pr-1">
            {guardianHoverPreview.guardians.map((g) => (
              <div
                key={`hover-vip-guardian-${g.guardian_id}`}
                className="rounded-lg border border-gray-100 bg-[#fafcff] px-2.5 py-2"
              >
                <p className="text-xs font-semibold text-[#1a2e4a] break-words">
                  {g.first_name} {g.last_name}
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5">Role: {g.role || "guardian"}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {guardianClickPreview.open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <button
            type="button"
            onClick={closeGuardianClickPreview}
            className="absolute inset-0 bg-black/40"
            aria-label="Close guardian list"
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-[#bfcef0] bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-sm uppercase tracking-wide font-semibold text-[#1565C0]">
                {guardianClickPreview.title}
              </h4>
              <button
                type="button"
                onClick={closeGuardianClickPreview}
                className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
            <div className="mt-3 max-h-[60vh] overflow-y-auto space-y-2 pr-1">
              {guardianClickPreview.guardians.map((g) => (
                <div
                  key={`click-vip-guardian-${g.guardian_id}`}
                  className="rounded-xl border border-gray-100 bg-[#fafcff] px-3 py-2.5"
                >
                  <p className="text-sm font-semibold text-[#1a2e4a] break-words">
                    {g.first_name} {g.last_name}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">Role: {g.role || "guardian"}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-[#f9fafb] px-2 sm:px-4 py-4 sm:py-6">
        <div className="space-y-6">

          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-[#1a2e4a]">Manage VIPs</h2>
              <p className="text-gray-500 text-sm mt-0.5">
                View all VIP profiles, their assigned devices, and guardian coverage.
              </p>
            </div>
            <button
              onClick={fetchVips}
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
                label: "Total VIPs",
                value: totalVips,
                icon: Users,
                gradient: "from-purple-50 to-violet-50",
                border: "border-purple-100",
                iconBg: "bg-purple-50",
                iconColor: "text-purple-600",
              },
              {
                label: "With Devices",
                value: withDevices,
                icon: Cpu,
                gradient: "from-blue-50 to-indigo-50",
                border: "border-blue-100",
                iconBg: "bg-blue-50",
                iconColor: "text-blue-600",
              },
              {
                label: "With Guardians",
                value: withGuardians,
                icon: ShieldCheck,
                gradient: "from-green-50 to-emerald-50",
                border: "border-green-100",
                iconBg: "bg-green-50",
                iconColor: "text-green-600",
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
              <h3 className="font-semibold text-[#1a2e4a]">All VIPs</h3>
              <span className="text-sm text-gray-400">
                {totalVips} VIP{totalVips !== 1 ? "s" : ""}
              </span>
            </div>

            <div>
              {loading ? (
                <LoadingSkeleton />
              ) : vips.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                  <Users size={52} className="mb-4 text-gray-200" />
                  <p className="text-lg font-semibold text-gray-500">No VIPs registered yet</p>
                  <p className="text-sm mt-1 text-gray-400">
                    VIP profiles are created through the guardian app.
                  </p>
                </div>
              ) : (
                <>
                  <div className="xl:hidden divide-y divide-gray-100">
                    {vips.map((v) => (
                      <div key={v.vip_id} className="p-4 sm:p-5 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5 min-w-0">
                            <div className="p-1.5 bg-purple-50 rounded-lg flex-shrink-0 mt-0.5">
                              <User size={14} className="text-purple-600" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-[#1a2e4a] leading-tight break-words">
                                {v.first_name}{v.middle_name ? ` ${v.middle_name}` : ""} {v.last_name}
                              </p>
                              <p className="text-xs text-gray-400">ID #{v.vip_id}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0">
                            <Calendar size={12} className="flex-shrink-0" />
                            <span>
                              {v.created_at
                                ? new Date(v.created_at).toLocaleDateString("en-PH", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })
                                : "—"}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="rounded-xl border border-gray-100 bg-[#fafcff] p-3">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#1565C0]">Location</p>
                            <div className="mt-1.5 flex items-start gap-1.5 text-sm text-gray-600">
                              <MapPin size={12} className="text-gray-400 flex-shrink-0 mt-1" />
                              <div className="min-w-0">
                                <p className="break-words">
                                  {[v.city, v.province].filter(Boolean).join(", ") || "—"}
                                </p>
                                {v.barangay && (
                                  <p className="text-xs text-gray-400 mt-0.5 break-words">{v.barangay}</p>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="rounded-xl border border-gray-100 bg-[#fafcff] p-3">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#1565C0]">Devices</p>
                            {v.devices && v.devices.length > 0 ? (
                              <div className="mt-1.5 flex flex-wrap gap-1.5">
                                {v.devices.slice(0, 3).map((d) => (
                                  <span
                                    key={d.device_id}
                                    title={d.device_serial_number}
                                    className={`inline-flex max-w-full items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border
                                      ${d.is_paired
                                        ? "bg-blue-50 text-blue-700 border-blue-100"
                                        : "bg-gray-50 text-gray-500 border-gray-200"}`}
                                  >
                                    <Cpu size={10} className="flex-shrink-0" />
                                    <span className="truncate font-mono">{d.device_serial_number}</span>
                                  </span>
                                ))}
                                {v.devices.length > 3 && (
                                  <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs font-semibold">
                                    +{v.devices.length - 3}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <p className="mt-1.5 text-xs text-gray-400 italic">No device</p>
                            )}
                          </div>
                        </div>

                        <div className="rounded-xl border border-gray-100 bg-[#fafcff] p-3">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#1565C0]">Guardians</p>
                          {v.guardians && v.guardians.length > 0 ? (
                            <div className="mt-1.5 flex flex-wrap gap-1.5">
                              {v.guardians.slice(0, 3).map((g) => (
                                <span
                                  key={g.guardian_id}
                                  title={`${g.first_name} ${g.last_name} · ${g.role}`}
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border max-w-full
                                    ${g.role === "primary"
                                      ? "bg-pink-50 text-pink-700 border-pink-200"
                                      : "bg-blue-50 text-blue-700 border-blue-100"}`}
                                >
                                  <ShieldCheck size={10} className="flex-shrink-0" />
                                  <span className="truncate">{g.first_name}</span>
                                  {g.role === "primary" && (
                                    <span className="text-pink-400 leading-none" style={{ fontSize: "10px" }}>♥</span>
                                  )}
                                </span>
                              ))}
                              {v.guardians.length > 3 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    openGuardianClickPreview(
                                      `${v.first_name} ${v.last_name} - Other Guardians`,
                                      v.guardians.slice(3)
                                    )
                                  }
                                  className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs font-semibold hover:bg-gray-200 transition-colors"
                                >
                                  +{v.guardians.length - 3}
                                </button>
                              )}
                            </div>
                          ) : (
                            <p className="mt-1.5 text-xs text-gray-400 italic">No guardians</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="hidden xl:block overflow-x-auto">
                    <table className="w-full min-w-[820px]">
                      <thead>
                        <tr className="bg-gradient-to-r from-[#f0f6ff] to-[#e8f0fe]">
                          {[
                            "VIP",
                            "Location",
                            "Devices",
                            "Guardians",
                            "Registered",
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
                        {vips.map((v, i) => (
                          <tr
                            key={v.vip_id}
                            className={`border-t border-gray-50 hover:bg-blue-50/20 transition-colors
                              ${i % 2 === 0 ? "bg-white" : "bg-[#fafcff]"}`}
                          >
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2.5">
                                <div className="p-1.5 bg-purple-50 rounded-lg flex-shrink-0">
                                  <User size={14} className="text-purple-600" />
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-[#1a2e4a] leading-tight">
                                    {v.first_name}{v.middle_name ? ` ${v.middle_name}` : ""} {v.last_name}
                                  </p>
                                  <p className="text-xs text-gray-400">ID #{v.vip_id}</p>
                                </div>
                              </div>
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                <MapPin size={12} className="text-gray-400 flex-shrink-0" />
                                <span>
                                  {[v.city, v.province].filter(Boolean).join(", ") || (
                                    <span className="text-xs text-gray-400 italic">—</span>
                                  )}
                                </span>
                              </div>
                              {v.barangay && (
                                <p className="text-xs text-gray-400 mt-0.5 ml-[18px]">{v.barangay}</p>
                              )}
                            </td>

                            <td className="px-5 py-4">
                              {v.devices && v.devices.length > 0 ? (
                                <div className="flex flex-wrap gap-1.5">
                                  {v.devices.slice(0, 2).map((d) => (
                                    <span
                                      key={d.device_id}
                                      title={d.device_serial_number}
                                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap font-mono
                                        ${d.is_paired
                                          ? "bg-blue-50 text-blue-700 border-blue-100"
                                          : "bg-gray-50 text-gray-500 border-gray-200"}`}
                                    >
                                      <Cpu size={10} />
                                      {d.device_serial_number}
                                    </span>
                                  ))}
                                  {v.devices.length > 2 && (
                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs font-semibold">
                                      +{v.devices.length - 2}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400 italic">No device</span>
                              )}
                            </td>

                            <td className="px-5 py-4">
                              {v.guardians && v.guardians.length > 0 ? (
                                <div className="flex flex-wrap gap-1.5">
                                  {v.guardians.slice(0, 2).map((g) => (
                                    <span
                                      key={g.guardian_id}
                                      title={`${g.first_name} ${g.last_name} · ${g.role}`}
                                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap
                                        ${g.role === "primary"
                                          ? "bg-pink-50 text-pink-700 border-pink-200"
                                          : "bg-blue-50 text-blue-700 border-blue-100"}`}
                                    >
                                      <ShieldCheck size={10} />
                                      {g.first_name}
                                      {g.role === "primary" && (
                                        <span className="text-pink-400 leading-none" style={{ fontSize: "10px" }}>♥</span>
                                      )}
                                    </span>
                                  ))}
                                  {v.guardians.length > 2 && (
                                    <button
                                      type="button"
                                      onMouseEnter={(event) =>
                                        openGuardianHoverPreview(
                                          event,
                                          `${v.first_name} ${v.last_name} - Other Guardians`,
                                          v.guardians.slice(2)
                                        )
                                      }
                                      onMouseMove={(event) =>
                                        openGuardianHoverPreview(
                                          event,
                                          `${v.first_name} ${v.last_name} - Other Guardians`,
                                          v.guardians.slice(2)
                                        )
                                      }
                                      onMouseLeave={closeGuardianHoverPreview}
                                      onFocus={(event) =>
                                        openGuardianHoverPreview(
                                          event,
                                          `${v.first_name} ${v.last_name} - Other Guardians`,
                                          v.guardians.slice(2)
                                        )
                                      }
                                      onBlur={closeGuardianHoverPreview}
                                      onClick={() =>
                                        openGuardianClickPreview(
                                          `${v.first_name} ${v.last_name} - Other Guardians`,
                                          v.guardians.slice(2)
                                        )
                                      }
                                      className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs font-semibold hover:bg-gray-200 transition-colors"
                                      aria-label="Show other guardians"
                                    >
                                      +{v.guardians.length - 2}
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400 italic">No guardians</span>
                              )}
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex items-center gap-1.5 text-xs text-gray-500 whitespace-nowrap">
                                <Calendar size={12} className="flex-shrink-0" />
                                {v.created_at
                                  ? new Date(v.created_at).toLocaleDateString("en-PH", {
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