import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ClipboardList,
  RefreshCw,
  Shield,
  UserCog,
  AlertCircle,
  CheckCircle,
  Search,
  Clock,
  X,
} from "lucide-react";
import api from "../api/client";

const actionLabels = {
  admin_delete: "Admin Deletion",
  concern_delete: "Concern Deletion",
  device_delete: "Device Deletion",
  role_change: "Role Change",
};

const roleFromStorage = () => localStorage.getItem("role") || "";

const LoadingSkeleton = () => (
  <div className="p-5 space-y-3">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="flex gap-4 animate-pulse items-center">
        <div className="h-8 bg-gray-100 rounded-lg w-28" />
        <div className="h-8 bg-gray-100 rounded-lg w-24" />
        <div className="h-8 bg-gray-100 rounded-lg w-40" />
        <div className="h-8 bg-gray-100 rounded-lg flex-1" />
        <div className="h-8 bg-gray-100 rounded-lg w-36" />
      </div>
    ))}
  </div>
);

const PreviewValue = ({
  text,
  title,
  maxLength = 80,
  isDesktop,
  onHoverShow,
  onHoverHide,
  onMobileOpen,
  className = "",
}) => {
  const value = String(text || "").trim();
  const isLong = value.length > maxLength;
  const display = isLong ? `${value.slice(0, maxLength)}...` : value || "-";
  const sharedClass = `block w-full max-w-full ${className}`;

  if (!isLong) {
    return (
      <span className={`${sharedClass} ${isDesktop ? "" : "whitespace-normal break-all"}`}>
        {display}
      </span>
    );
  }

  if (isDesktop) {
    return (
      <button
        type="button"
        onMouseEnter={(e) => onHoverShow(e, title, value)}
        onMouseMove={(e) => onHoverShow(e, title, value)}
        onMouseLeave={onHoverHide}
        onFocus={(e) => onHoverShow(e, title, value)}
        onBlur={onHoverHide}
        className={`cursor-help text-left underline decoration-dotted underline-offset-2 ${sharedClass}`}
      >
        {display}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onMobileOpen(title, value)}
      className={`cursor-pointer text-left underline decoration-dotted underline-offset-2 whitespace-normal break-all ${sharedClass}`}
    >
      {display}
    </button>
  );
};

export default function ManageActionHistory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [actionType, setActionType] = useState("");
  const [isDesktopPreviewMode, setIsDesktopPreviewMode] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 1280 : true
  );
  const [hoverPreview, setHoverPreview] = useState({
    open: false,
    title: "",
    content: "",
    x: 0,
    y: 0,
  });
  const [clickPreview, setClickPreview] = useState({
    open: false,
    title: "",
    content: "",
  });

  const limit = 20;
  const role = roleFromStorage();
  const isAllowed = role === "admin" || role === "super_admin";

  const totalPages = Math.max(Math.ceil(total / limit), 1);

  useEffect(() => {
    const onResize = () => {
      const nextDesktopMode = window.innerWidth >= 1280;
      setIsDesktopPreviewMode(nextDesktopMode);
      if (!nextDesktopMode) {
        setHoverPreview({ open: false, title: "", content: "", x: 0, y: 0 });
      }
    };

    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const showHoverPreview = (event, title, content) => {
    if (!isDesktopPreviewMode) return;

    const panelWidth = 360;
    const panelHeight = 220;
    const x = Math.min(event.clientX + 14, window.innerWidth - panelWidth - 12);
    const y = Math.min(event.clientY + 14, window.innerHeight - panelHeight - 12);

    setHoverPreview({ open: true, title, content, x, y });
  };

  const hideHoverPreview = () => {
    setHoverPreview((prev) => ({ ...prev, open: false }));
  };

  const openClickPreview = (title, content) => {
    setClickPreview({ open: true, title, content });
  };

  const closeClickPreview = () => {
    setClickPreview({ open: false, title: "", content: "" });
  };

  const fetchHistory = useCallback(async () => {
    if (!isAllowed) return;

    setLoading(true);
    setError("");
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(limit));
    if (search.trim()) params.set("q", search.trim());
    if (actionType) params.set("action_type", actionType);

    const res = await api.get(`/api/admin/audit-logs?${params.toString()}`);
    if (!res || !res.ok) {
      setError(res?.data?.message || "Failed to load action history.");
      setItems([]);
      setTotal(0);
      setLoading(false);
      return;
    }

    setItems(Array.isArray(res.data?.items) ? res.data.items : []);
    setTotal(Number(res.data?.total || 0));
    setLoading(false);
  }, [actionType, isAllowed, page, search]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const stats = useMemo(() => {
    const adminDeletes = items.filter((i) => i.action_type === "admin_delete").length;
    const concernDeletes = items.filter((i) => i.action_type === "concern_delete").length;
    const deviceDeletes = items.filter((i) => i.action_type === "device_delete").length;
    const roleChanges = items.filter((i) => i.action_type === "role_change").length;
    return { adminDeletes, concernDeletes, deviceDeletes, roleChanges };
  }, [items]);

  if (!isAllowed) {
    return (
      <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-md text-center">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-800">Access Denied</h2>
          <p className="text-gray-600 mt-2">You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9fafb] px-2 sm:px-4 py-4 sm:py-6">
      {hoverPreview.open && isDesktopPreviewMode && (
        <div
          className="fixed z-[9998] max-w-[360px] rounded-xl border border-[#bfcef0] bg-white p-4 shadow-2xl pointer-events-none"
          style={{ left: hoverPreview.x, top: hoverPreview.y }}
        >
          <p className="text-[11px] uppercase tracking-wide font-semibold text-[#1565C0]">
            {hoverPreview.title}
          </p>
          <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap break-words leading-relaxed">
            {hoverPreview.content}
          </p>
        </div>
      )}

      {clickPreview.open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <button
            type="button"
            onClick={closeClickPreview}
            className="absolute inset-0 bg-black/40"
            aria-label="Close preview"
          />
          <div className="relative w-full max-w-lg rounded-2xl border border-[#bfcef0] bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-sm uppercase tracking-wide font-semibold text-[#1565C0]">
                {clickPreview.title}
              </h4>
              <button
                type="button"
                onClick={closeClickPreview}
                className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
            <p className="mt-3 max-h-[60vh] overflow-y-auto text-sm text-gray-700 whitespace-pre-wrap break-words leading-relaxed pr-1">
              {clickPreview.content}
            </p>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[#1a2e4a]">Action History</h2>
            <p className="text-gray-500 text-sm mt-0.5">
              Track sensitive admin and super admin actions with reasons.
            </p>
          </div>
          <button
            onClick={fetchHistory}
            disabled={loading}
            className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-5 flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-blue-50 rounded-xl shadow-sm">
              <UserCog size={22} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Admin Deletions</p>
              <p className="text-3xl font-bold text-[#1a2e4a] leading-tight">{stats.adminDeletes}</p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100 p-5 flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-amber-50 rounded-xl shadow-sm">
              <ClipboardList size={22} className="text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Concern Deletions</p>
              <p className="text-3xl font-bold text-[#1a2e4a] leading-tight">{stats.concernDeletes}</p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-rose-50 to-red-50 rounded-2xl border border-rose-100 p-5 flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-rose-50 rounded-xl shadow-sm">
              <ClipboardList size={22} className="text-rose-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Device Deletions</p>
              <p className="text-3xl font-bold text-[#1a2e4a] leading-tight">{stats.deviceDeletes}</p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100 p-5 flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-green-50 rounded-xl shadow-sm">
              <Shield size={22} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Role Changes</p>
              <p className="text-3xl font-bold text-[#1a2e4a] leading-tight">{stats.roleChanges}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <h3 className="font-semibold text-[#1a2e4a]">Audit Records</h3>
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <div className="relative w-full sm:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => {
                    setPage(1);
                    setSearch(e.target.value);
                  }}
                  placeholder="Search reason or action"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1565C0]"
                />
              </div>
              <select
                value={actionType}
                onChange={(e) => {
                  setPage(1);
                  setActionType(e.target.value);
                }}
                className="w-full sm:w-48 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1565C0]"
              >
                <option value="">All actions</option>
                <option value="admin_delete">Admin deletion</option>
                <option value="concern_delete">Concern deletion</option>
                <option value="device_delete">Device deletion</option>
                <option value="role_change">Role change</option>
              </select>
            </div>
          </div>

          {error && <p className="px-6 py-3 text-sm text-red-600 bg-red-50">{error}</p>}

          <div>
            {loading ? (
              <LoadingSkeleton />
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <ClipboardList size={52} className="mb-4 text-gray-200" />
                <p className="text-lg font-semibold text-gray-500">No audit history found</p>
                <p className="text-sm mt-1 text-gray-400">Actions will appear here once recorded.</p>
              </div>
            ) : (
              <>
                <div className="xl:hidden divide-y divide-gray-100">
                  {items.map((item) => (
                    <div key={item.audit_id} className="p-4 sm:p-5 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-[#1a2e4a]">
                            {actionLabels[item.action_type] || item.action_type}
                          </p>
                          <p className="text-xs text-gray-500">Record #{item.audit_id}</p>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            item.status === "success"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {item.status === "success" ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                          {item.status}
                        </span>
                      </div>

                      <div className="rounded-xl border border-gray-100 bg-[#fafcff] p-3 space-y-2">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-[#1565C0]">Actor</p>
                        <p className="text-sm text-gray-700 break-words">
                          {item.actor_name || "Unknown"} (ID: {item.actor_admin_id})
                        </p>
                      </div>

                      <div className="rounded-xl border border-gray-100 bg-[#fafcff] p-3 space-y-2">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-[#1565C0]">Reason</p>
                        <p className="text-xs text-gray-500 uppercase">{item.reason_code}</p>
                        <div className="text-sm text-gray-700 break-words">
                          <PreviewValue
                            text={item.reason_text}
                            title="Reason"
                            maxLength={90}
                            isDesktop={isDesktopPreviewMode}
                            onHoverShow={showHoverPreview}
                            onHoverHide={hideHoverPreview}
                            onMobileOpen={openClickPreview}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="rounded-xl border border-gray-100 bg-[#fafcff] p-3 space-y-2">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#1565C0]">
                            Deleted Admin
                          </p>
                          <div className="text-sm text-gray-700 break-words">
                            <PreviewValue
                              text={item.deleted_admin_name || "-"}
                              title="Deleted Admin"
                              maxLength={70}
                              isDesktop={isDesktopPreviewMode}
                              onHoverShow={showHoverPreview}
                              onHoverHide={hideHoverPreview}
                              onMobileOpen={openClickPreview}
                            />
                          </div>
                        </div>

                        <div className="rounded-xl border border-gray-100 bg-[#fafcff] p-3 space-y-2">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#1565C0]">
                              Deleted Concern / Device
                          </p>
                          <div className="text-sm text-gray-700 break-words">
                            <PreviewValue
                                text={item.deleted_concern_message || item.deleted_device_serial || "-"}
                                title="Deleted Concern / Device"
                              maxLength={90}
                              isDesktop={isDesktopPreviewMode}
                              onHoverShow={showHoverPreview}
                              onHoverHide={hideHoverPreview}
                              onMobileOpen={openClickPreview}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock size={12} />
                        {item.created_at
                          ? new Date(item.created_at).toLocaleString("en-PH", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "-"}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="hidden xl:block overflow-x-auto">
                  <table className="w-full min-w-[1300px]">
                    <thead>
                      <tr className="bg-gradient-to-r from-[#f0f6ff] to-[#e8f0fe]">
                        {[
                          "ID",
                          "Action",
                          "Actor",
                          "Reason",
                          "Deleted Admin",
                            "Deleted Concern / Device",
                          "Status",
                          "Created",
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
                      {items.map((item, i) => (
                        <tr
                          key={item.audit_id}
                          className={`border-t border-gray-50 hover:bg-blue-50/20 transition-colors ${
                            i % 2 === 0 ? "bg-white" : "bg-[#fafcff]"
                          }`}
                        >
                          <td className="px-5 py-4 text-sm text-gray-600">#{item.audit_id}</td>
                          <td className="px-5 py-4 text-sm font-medium text-[#1a2e4a]">
                            {actionLabels[item.action_type] || item.action_type}
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-700">
                            {item.actor_name || "Unknown"} (ID: {item.actor_admin_id})
                          </td>
                          <td className="px-5 py-4">
                            <p className="text-xs text-gray-500 uppercase">{item.reason_code}</p>
                            <div className="text-sm text-gray-700 mt-0.5 break-words max-w-[460px]">
                              <PreviewValue
                                text={item.reason_text}
                                title="Reason"
                                maxLength={85}
                                isDesktop={isDesktopPreviewMode}
                                onHoverShow={showHoverPreview}
                                onHoverHide={hideHoverPreview}
                                onMobileOpen={openClickPreview}
                              />
                            </div>
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-700">
                            <div className="max-w-[220px]">
                              <PreviewValue
                                text={item.deleted_admin_name || "-"}
                                title="Deleted Admin"
                                maxLength={40}
                                isDesktop={isDesktopPreviewMode}
                                onHoverShow={showHoverPreview}
                                onHoverHide={hideHoverPreview}
                                onMobileOpen={openClickPreview}
                              />
                            </div>
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-700">
                            <div className="max-w-[320px]">
                              <PreviewValue
                                text={item.deleted_concern_message || item.deleted_device_serial || "-"}
                                title="Deleted Concern / Device"
                                maxLength={70}
                                isDesktop={isDesktopPreviewMode}
                                onHoverShow={showHoverPreview}
                                onHoverHide={hideHoverPreview}
                                onMobileOpen={openClickPreview}
                              />
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                item.status === "success"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {item.status === "success" ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                              {item.status}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-500 whitespace-nowrap">
                            {item.created_at
                              ? new Date(item.created_at).toLocaleString("en-PH", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>

          <div className="px-4 sm:px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3">
            <p className="text-sm text-gray-500">
              Page {page} of {totalPages} • {total} record{total !== 1 ? "s" : ""}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || loading}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || loading}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
