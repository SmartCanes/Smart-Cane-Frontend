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
  MessageSquare,
  User,
  Inbox,
  Archive,
} from "lucide-react";

//  Config & Auth Helpers
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

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

//  Main Component
export default function GuardianConcerns() {
  const [concerns, setConcerns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);
  const role = getRole();
  const isSuperAdmin = role === "super_admin";
  const isAdmin = role === "admin" || isSuperAdmin;

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

  const deleteConcern = async (concernId) => {
    if (!isSuperAdmin) return;
    try {
      await apiFetch(`/api/guardian-concerns/${concernId}`, {
        method: "DELETE",
      });
      showToast("Concern deleted successfully");
      fetchConcerns();
    } catch (err) {
      showToast(err.message, "error");
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

            <div className="overflow-x-auto">
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
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="bg-gradient-to-r from-[#f0f6ff] to-[#e8f0fe]">
                      {[
                        "ID",
                        "Name",
                        "Email",
                        "Message",
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
                          <div className="max-w-xs truncate" title={c.message}>
                            {c.message.length > 60 ? `${c.message.slice(0, 60)}…` : c.message}
                          </div>
                        </td>
                        <td className="px-5 py-4">{statusBadge(c.status)}</td>
                        <td className="px-5 py-4 text-sm text-gray-500">
                          {c.admin_reply ? (
                            <div className="max-w-xs truncate" title={c.admin_reply}>
                              {c.admin_reply.length > 50 ? `${c.admin_reply.slice(0, 50)}…` : c.admin_reply}
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
                            {/* Reply Button – opens mail client */}
                            <a
                            href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(c.email)}&su=${encodeURIComponent(`For your concern`)}&body=${encodeURIComponent(
                                `Hello ${c.name},\n\nWe're the iCane Team. We appreciate your concerns.\n\nYour concern is: ${c.message}\n\nIcane Team response: \n\n\n--- Thankyou ---\n`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                            title="Reply via Gmail"
                            >
                            <Mail size={15} />
                            <span className="text-xs hidden sm:inline">Reply</span>
                            </a>

                            {/* Mark as Read (if not already read/resolved) */}
                            {c.status === "unread" && (
                              <button
                                onClick={() => updateStatus(c.concern_id, "read")}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                title="Mark as read"
                              >
                                <Eye size={15} />
                              </button>
                            )}

                            {/* Mark as Resolved (if not resolved) */}
                            {c.status !== "resolved" && (
                              <button
                                onClick={() => updateStatus(c.concern_id, "resolved")}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors cursor-pointer"
                                title="Mark as resolved"
                              >
                                <Check size={15} />
                              </button>
                            )}

                            {/* Delete – super_admin only */}
                            {isSuperAdmin && (
                              <button
                                onClick={() => deleteConcern(c.concern_id)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                title="Delete concern"
                              >
                                <Trash2 size={15} />
                              </button>
                            )}
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