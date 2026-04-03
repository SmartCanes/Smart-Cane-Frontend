import { useEffect, useState, useCallback } from "react";
import {
  Mail,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Eye,
  Check,
  Trash2,
  Clock,
  X,
  MessageSquare,
  User,
  Inbox,
  Archive,
} from "lucide-react";

//  Config & Auth Helpers
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";

const getToken = () => localStorage.getItem("access_token");

const getRole = () => {
  const token = getToken();
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split(".")[1])).role;
  } catch {
    return null;
  }
};

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

//  Toast Component
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
        <div className="h-9 bg-gray-100 rounded-xl w-16 flex-shrink-0" />
        <div className="h-9 bg-gray-100 rounded-xl w-32 flex-shrink-0" />
        <div className="h-9 bg-gray-100 rounded-xl w-48 flex-shrink-0" />
        <div className="h-9 bg-gray-100 rounded-xl flex-1" />
        <div className="h-6 bg-gray-100 rounded-full w-20" />
        <div className="h-9 bg-gray-100 rounded-xl w-36 flex-shrink-0" />
        <div className="h-6 bg-gray-100 rounded-full w-24" />
        <div className="h-8 bg-gray-100 rounded-xl w-28" />
      </div>
    ))}
  </div>
);

const extractConcernSource = (rawMessage = "") => {
  const messageText = String(rawMessage || "");
  const match = messageText.match(/^\[Source:\s*([^\]]+)\]\s*\n*\s*/i);

  if (!match) {
    return {
      sourceKey: "unknown",
      sourceLabel: "Unknown",
      cleanMessage: messageText,
    };
  }

  const sourceKey = (match[1] || "unknown").trim().toLowerCase();
  const cleanMessage = messageText.slice(match[0].length).trim();

  const sourceMap = {
    "guest-landing": "Guest Page",
    "guardian-dashboard": "Dashboard",
  };

  return {
    sourceKey,
    sourceLabel: sourceMap[sourceKey] || sourceKey.replace(/[-_]/g, " "),
    cleanMessage,
  };
};

const sourceBadge = (sourceKey, sourceLabel) => {
  const styles = {
    "guest-landing": "bg-indigo-100 text-indigo-700 border-indigo-200",
    "guardian-dashboard": "bg-teal-100 text-teal-700 border-teal-200",
    unknown: "bg-gray-100 text-gray-700 border-gray-200",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[sourceKey] || styles.unknown}`}
    >
      {sourceLabel}
    </span>
  );
};

const PreviewValue = ({
  text,
  title,
  maxLength = 60,
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
      <span
        className={`${sharedClass} ${isDesktop ? "" : "whitespace-normal break-all"}`}
      >
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

//  Main Component
export default function GuardianConcerns() {
  const [concerns, setConcerns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteReasonCode, setDeleteReasonCode] = useState("");
  const [deleteReasonText, setDeleteReasonText] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");
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
  const role = getRole();
  const isSuperAdmin = role === "super_admin";
  const isAdmin = role === "admin" || isSuperAdmin;

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

  const showToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  const fetchConcerns = useCallback(async () => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      const data = await apiFetch("/api/guardian-concerns/");
      setConcerns(data);
    } catch (err) {
      showToast(err.message || "Failed to load concerns", "error");
    } finally {
      setLoading(false);
    }
  }, [isAdmin, showToast]);

  useEffect(() => {
    if (isAdmin) fetchConcerns();
  }, [fetchConcerns, isAdmin]);

  const updateStatus = async (concernId, newStatus) => {
    try {
      await apiFetch(`/api/guardian-concerns/${concernId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      showToast(`Concern marked as ${newStatus}`);
      fetchConcerns(); // refresh list
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const openDeleteModal = (concern) => {
    setDeleteTarget(concern);
    setDeleteReasonCode("");
    setDeleteReasonText("");
    setDeleteError("");
    setShowDeleteModal(true);
  };

  const deleteConcern = async () => {
    if (!isSuperAdmin) return;
    if (!deleteTarget) return;

    setDeleteError("");
    if (!deleteReasonCode) {
      setDeleteError("Please select a reason for deletion.");
      return;
    }
    if (deleteReasonText.trim().length < 10) {
      setDeleteError("Please provide at least 10 characters explaining the deletion.");
      return;
    }

    setDeleteLoading(true);
    try {
      await apiFetch(`/api/guardian-concerns/${deleteTarget.concern_id}`, {
        method: "DELETE",
        body: JSON.stringify({
          reason_code: deleteReasonCode,
          reason_text: deleteReasonText.trim(),
        }),
      });
      showToast("Concern deleted successfully");
      setShowDeleteModal(false);
      setDeleteTarget(null);
      setDeleteReasonCode("");
      setDeleteReasonText("");
      fetchConcerns();
    } catch (err) {
      setDeleteError(err.message || "Failed to delete concern");
    } finally {
      setDeleteLoading(false);
    }
  };

  const statusBadge = (status) => {
    const styles = {
      unread: "bg-amber-100 text-amber-700 border-amber-200",
      read: "bg-blue-100 text-blue-700 border-blue-200",
      resolved: "bg-green-100 text-green-700 border-green-200",
    };
    const icons = {
      unread: <AlertCircle size={12} />,
      read: <Eye size={12} />,
      resolved: <Check size={12} />,
    };
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[status]}`}>
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

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

  const total = concerns.length;
  const unread = concerns.filter((c) => c.status === "unread").length;
  const resolved = concerns.filter((c) => c.status === "resolved").length;

  //  Render
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-md text-center">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-800">Access Denied</h2>
          <p className="text-gray-600 mt-2">You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      <Toast toasts={toasts} />

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

      <div className="min-h-screen bg-[#f9fafb] px-2 sm:px-4 py-4 sm:py-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-[#1a2e4a]">Guardian Concerns</h2>
              <p className="text-gray-500 text-sm mt-0.5">
                View and manage messages submitted by guardians.
              </p>
            </div>
            <button
              onClick={fetchConcerns}
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
                label: "Total Concerns",
                value: total,
                icon: MessageSquare,
                gradient: "from-blue-50 to-indigo-50",
                border: "border-blue-100",
                iconBg: "bg-blue-50",
                iconColor: "text-blue-600",
              },
              {
                label: "Unread",
                value: unread,
                icon: Inbox,
                gradient: "from-amber-50 to-yellow-50",
                border: "border-amber-100",
                iconBg: "bg-amber-50",
                iconColor: "text-amber-600",
              },
              {
                label: "Resolved",
                value: resolved,
                icon: Archive,
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
              <h3 className="font-semibold text-[#1a2e4a]">All Submissions</h3>
              <span className="text-sm text-gray-400">
                {total} concern{total !== 1 ? "s" : ""}
              </span>
            </div>

            <div>
              {loading ? (
                <LoadingSkeleton />
              ) : concerns.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                  <MessageSquare size={52} className="mb-4 text-gray-200" />
                  <p className="text-lg font-semibold text-gray-500">No concerns yet</p>
                  <p className="text-sm mt-1 text-gray-400">
                    Guardian messages will appear here.
                  </p>
                </div>
              ) : (
                <>
                  <div className="xl:hidden divide-y divide-gray-100">
                    {concerns.map((c) => (
                      <div key={c.concern_id} className="p-4 sm:p-5 space-y-3">
                        {(() => {
                          const { sourceKey, sourceLabel, cleanMessage } = extractConcernSource(c.message);
                          return (
                            <>
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 text-sm font-semibold text-[#1a2e4a]">
                              <User size={14} className="text-gray-400 flex-shrink-0" />
                              <span className="break-words">{c.name}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">#{c.concern_id}</p>
                          </div>
                          <div className="flex-shrink-0">{statusBadge(c.status)}</div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="rounded-xl border border-gray-100 bg-[#fafcff] p-3">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#1565C0]">Email</p>
                            <p className="mt-1.5 text-sm text-gray-600 break-all">{c.email}</p>
                          </div>

                          <div className="rounded-xl border border-gray-100 bg-[#fafcff] p-3">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#1565C0]">Source</p>
                            <div className="mt-1.5">{sourceBadge(sourceKey, sourceLabel)}</div>
                          </div>

                          <div className="rounded-xl border border-gray-100 bg-[#fafcff] p-3">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#1565C0]">Submitted</p>
                            <div className="mt-1.5 flex items-center gap-1 text-xs text-gray-500">
                              <Clock size={12} className="flex-shrink-0" />
                              <span>
                                {new Date(c.created_at).toLocaleString("en-PH", {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-xl border border-gray-100 bg-[#fafcff] p-3">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#1565C0]">Message</p>
                          <div className="mt-1.5 text-sm text-gray-700 break-words">
                            <PreviewValue
                              text={cleanMessage}
                              title="Message"
                              maxLength={90}
                              isDesktop={isDesktopPreviewMode}
                              onHoverShow={showHoverPreview}
                              onHoverHide={hideHoverPreview}
                              onMobileOpen={openClickPreview}
                            />
                          </div>
                        </div>

                        <div className="rounded-xl border border-gray-100 bg-[#fafcff] p-3">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#1565C0]">Admin Reply</p>
                          {c.admin_reply ? (
                            <div className="mt-1.5 text-sm text-gray-600 break-words">
                              <PreviewValue
                                text={c.admin_reply}
                                title="Admin Reply"
                                maxLength={90}
                                isDesktop={isDesktopPreviewMode}
                                onHoverShow={showHoverPreview}
                                onHoverHide={hideHoverPreview}
                                onMobileOpen={openClickPreview}
                              />
                            </div>
                          ) : (
                            <p className="mt-1.5 text-sm text-gray-400 italic">No reply yet</p>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                          <a
                            href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(c.email)}&su=${encodeURIComponent(`For your concern`)}&body=${encodeURIComponent(
                              `Hello ${c.name},\n\nWe're the iCane Team. We appreciate your concerns.\n\nYour concern is: ${cleanMessage}\n\nIcane Team response: \n\n\n--- Thankyou ---\n`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
                            title="Reply via Gmail"
                          >
                            <Mail size={13} />
                            Reply
                          </a>

                          {c.status === "unread" && (
                            <button
                              onClick={() => updateStatus(c.concern_id, "read")}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
                              title="Mark as read"
                            >
                              <Eye size={13} />
                              Read
                            </button>
                          )}

                          {c.status !== "resolved" && (
                            <button
                              onClick={() => updateStatus(c.concern_id, "resolved")}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-100 rounded-lg hover:bg-green-100 transition-colors cursor-pointer"
                              title="Mark as resolved"
                            >
                              <Check size={13} />
                              Resolve
                            </button>
                          )}

                          {isSuperAdmin && (
                            <button
                              onClick={() => openDeleteModal(c)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
                              title="Delete concern"
                            >
                              <Trash2 size={13} />
                              Delete
                            </button>
                          )}
                        </div>
                            </>
                          );
                        })()}
                      </div>
                    ))}
                  </div>

                  <div className="hidden xl:block overflow-x-auto">
                    <table className="w-full min-w-[980px]">
                      <thead>
                        <tr className="bg-gradient-to-r from-[#f0f6ff] to-[#e8f0fe]">
                          {[
                            "ID",
                            "Name",
                            "Email",
                            "Message",
                            "Source",
                            "Status",
                            "Admin Reply",
                            "Submitted",
                            "Actions",
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
                        {concerns.map((c, i) => (
                          <tr
                            key={c.concern_id}
                            className={`border-t border-gray-50 hover:bg-blue-50/20 transition-colors
                              ${i % 2 === 0 ? "bg-white" : "bg-[#fafcff]"}`}
                          >
                            {(() => {
                              const { sourceKey, sourceLabel, cleanMessage } = extractConcernSource(c.message);
                              return (
                                <>
                            <td className="px-5 py-4 text-sm font-mono text-gray-600">
                              #{c.concern_id}
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                <User size={14} className="text-gray-400" />
                                <span className="text-sm font-medium text-gray-800">{c.name}</span>
                              </div>
                            </td>
                            <td className="px-5 py-4 text-sm text-gray-600 break-all">{c.email}</td>
                            <td className="px-5 py-4">
                              <div className="max-w-xs text-sm text-gray-700">
                                <PreviewValue
                                  text={cleanMessage}
                                  title="Message"
                                  maxLength={60}
                                  isDesktop={isDesktopPreviewMode}
                                  onHoverShow={showHoverPreview}
                                  onHoverHide={hideHoverPreview}
                                  onMobileOpen={openClickPreview}
                                  className="max-w-xs truncate"
                                />
                              </div>
                            </td>
                            <td className="px-5 py-4">{sourceBadge(sourceKey, sourceLabel)}</td>
                            <td className="px-5 py-4">{statusBadge(c.status)}</td>
                            <td className="px-5 py-4 text-sm text-gray-500">
                              {c.admin_reply ? (
                                <div className="max-w-xs text-sm text-gray-500">
                                  <PreviewValue
                                    text={c.admin_reply}
                                    title="Admin Reply"
                                    maxLength={50}
                                    isDesktop={isDesktopPreviewMode}
                                    onHoverShow={showHoverPreview}
                                    onHoverHide={hideHoverPreview}
                                    onMobileOpen={openClickPreview}
                                    className="max-w-xs truncate"
                                  />
                                </div>
                              ) : (
                                <span className="text-gray-400 italic">No reply yet</span>
                              )}
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-1 text-xs text-gray-500 whitespace-nowrap">
                                <Clock size={12} />
                                {new Date(c.created_at).toLocaleString("en-PH", {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-1">
                                <a
                                  href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(c.email)}&su=${encodeURIComponent(`For your concern`)}&body=${encodeURIComponent(
                                    `Hello ${c.name},\n\nWe're the iCane Team. We appreciate your concerns.\n\nYour concern is: ${cleanMessage}\n\nIcane Team response: \n\n\n--- Thankyou ---\n`
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                                  title="Reply via Gmail"
                                >
                                  <Mail size={15} />
                                  <span className="text-xs hidden sm:inline">Reply</span>
                                </a>

                                {c.status === "unread" && (
                                  <button
                                    onClick={() => updateStatus(c.concern_id, "read")}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                    title="Mark as read"
                                  >
                                    <Eye size={15} />
                                  </button>
                                )}

                                {c.status !== "resolved" && (
                                  <button
                                    onClick={() => updateStatus(c.concern_id, "resolved")}
                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors cursor-pointer"
                                    title="Mark as resolved"
                                  >
                                    <Check size={15} />
                                  </button>
                                )}

                                {isSuperAdmin && (
                                  <button
                                    onClick={() => openDeleteModal(c)}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                    title="Delete concern"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                )}
                              </div>
                            </td>
                                </>
                              );
                            })()}
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

      {showDeleteModal && deleteTarget && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
          <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-md relative z-10">
            <h3 className="text-lg font-semibold text-gray-800">Delete Concern</h3>
            <p className="text-sm text-gray-600 mt-1">
              Please provide a reason before deleting this concern.
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <select
                  value={deleteReasonCode}
                  onChange={(e) => setDeleteReasonCode(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1565C0]"
                >
                  <option value="">Select reason</option>
                  <option value="spam">Spam</option>
                  <option value="abusive_content">Abusive content</option>
                  <option value="duplicate_concern">Duplicate concern</option>
                  <option value="pii_exposure">Contains sensitive info</option>
                  <option value="legal_request">Legal/compliance request</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Details</label>
                <textarea
                  value={deleteReasonText}
                  onChange={(e) => setDeleteReasonText(e.target.value)}
                  rows={3}
                  placeholder="Explain why this concern needs to be deleted..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#1565C0]"
                />
                <p className="mt-1 text-xs text-gray-500">Minimum 10 characters.</p>
              </div>
            </div>

            {deleteError && <p className="text-red-500 text-sm mt-3">{deleteError}</p>}

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteLoading}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={deleteConcern}
                disabled={deleteLoading}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleteLoading ? "Deleting..." : "Delete Concern"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}