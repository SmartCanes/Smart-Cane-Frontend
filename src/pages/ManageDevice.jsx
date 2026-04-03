import { useEffect, useState, useCallback } from "react";
import {
  Cpu,
  Plus,
  Pencil,
  Trash2,
  X,
  RefreshCw,
  Shield,
  User,
  CheckCircle,
  AlertCircle,
  Clock,
  WifiOff,
  Wifi,
} from "lucide-react";

//  Config & Auth Helpers
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const getToken = () => localStorage.getItem("access_token");

/** Decode role directly from the JWT payload — no extra localStorage key needed. */
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

//  Modal Wrapper
const Modal = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 z-10 border border-gray-100">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-[#1a2e4a]">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

//  Confirm Delete Modal
const ConfirmModal = ({ isOpen, onClose, onConfirm, deviceSerial, submitting }) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 z-10 border border-gray-100">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
            <Trash2 size={22} className="text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Delete Device?</h3>
            <p className="text-sm text-gray-500">
              This will permanently remove{" "}
              <span className="font-semibold text-gray-700">{deviceSerial}</span> and
              all its associated data. This action cannot be undone.
            </p>
          </div>
          <div className="flex gap-3 w-full pt-1">
            <button
              onClick={onClose}
              disabled={submitting}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors cursor-pointer text-sm disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={submitting}
              className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors cursor-pointer text-sm disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

//  Device Form (shared for Add & Edit)
const SC_PREFIX = "SC-";

const DeviceForm = ({ initialSerial = "", onSubmit, onCancel, submitting, submitLabel }) => {
  // Strip the "SC-" prefix for editing — admin only types the number part
  const toSuffix = (full) =>
    full.startsWith(SC_PREFIX) ? full.slice(SC_PREFIX.length) : full;

  const [suffix, setSuffix] = useState(toSuffix(initialSerial));

  useEffect(() => {
    setSuffix(toSuffix(initialSerial));
  }, [initialSerial]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const full = `${SC_PREFIX}${suffix.trim()}`;
    onSubmit({ device_serial_number: full });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Device Serial Number <span className="text-red-500">*</span>
        </label>
        {/* Fixed SC- prefix + free-type suffix */}
        <div className="flex rounded-xl border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
          <span className="flex items-center px-3.5 bg-gray-50 border-r border-gray-300 text-sm font-bold text-[#1a2e4a] font-mono select-none">
            SC-
          </span>
          <input
            type="text"
            required
            value={suffix}
            onChange={(e) => setSuffix(e.target.value)}
            placeholder="136901"
            className="flex-1 px-3.5 py-3 text-sm outline-none font-mono bg-white"
            autoFocus
          />
        </div>
        <p className="text-xs text-gray-400 mt-1.5">
          Final serial will be saved as{" "}
          <span className="font-semibold text-gray-600 font-mono">
            SC-{suffix || "…"}
          </span>
        </p>
      </div>
      <div className="flex gap-3 mt-1">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors cursor-pointer text-sm disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting || !suffix.trim()}
          className="flex-1 px-4 py-2.5 bg-[#11285A] text-white rounded-xl font-semibold hover:bg-[#0d1b3d] transition-all hover:shadow-lg cursor-pointer text-sm disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            submitLabel
          )}
        </button>
      </div>
    </form>
  );
};

//  Loading Skeleton
const LoadingSkeleton = () => (
  <div className="p-5 space-y-3">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="flex gap-4 animate-pulse items-center">
        <div className="h-9 bg-gray-100 rounded-xl w-44 flex-shrink-0" />
        <div className="h-6 bg-gray-100 rounded-full w-20" />
        <div className="h-9 bg-gray-100 rounded-xl flex-1" />
        <div className="h-6 bg-gray-100 rounded-full w-28" />
        <div className="h-6 bg-gray-100 rounded-full w-20" />
        <div className="h-5 bg-gray-100 rounded w-32" />
        <div className="h-8 bg-gray-100 rounded-xl w-20" />
      </div>
    ))}
  </div>
);

//  Main Component
export default function ManageDevice() {
  const [devices, setDevices]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [toasts, setToasts]     = useState([]);
  const role                    = getRole();
  const isSuperAdmin            = role === "super_admin";

  const [addModal, setAddModal]     = useState(false);
  const [addSubmitting, setAddSubmitting] = useState(false);

  const [editModal, setEditModal]   = useState({ open: false, device: null });
  const [editSubmitting, setEditSubmitting] = useState(false);

  const [deleteModal, setDeleteModal] = useState({ open: false, device: null });
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const showToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  const fetchDevices = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/api/devices/");
      setDevices(data);
    } catch (err) {
      showToast(err.message || "Failed to load devices", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  const handleAdd = async (form) => {
    setAddSubmitting(true);
    try {
      await apiFetch("/api/devices/", {
        method: "POST",
        body: JSON.stringify(form),
      });
      showToast("Device registered successfully");
      setAddModal(false);
      fetchDevices();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setAddSubmitting(false);
    }
  };

  const handleEdit = async (form) => {
    setEditSubmitting(true);
    try {
      await apiFetch(`/api/devices/${editModal.device.device_id}`, {
        method: "PUT",
        body: JSON.stringify(form),
      });
      showToast("Device updated successfully");
      setEditModal({ open: false, device: null });
      fetchDevices();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setDeleteSubmitting(true);
    try {
      await apiFetch(`/api/devices/${deleteModal.device.device_id}`, {
        method: "DELETE",
      });
      showToast("Device deleted successfully");
      setDeleteModal({ open: false, device: null });
      fetchDevices();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const totalDevices  = devices.length;
  const pairedCount   = devices.filter((d) => d.is_paired).length;
  const activeCount   = devices.filter((d) => d.status === "active").length;

  //  Render
  return (
    <>
      {/* Keyframe for toast slide-in */}
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      <Toast toasts={toasts} />

      <Modal isOpen={addModal} onClose={() => setAddModal(false)} title="Register New Device">
        <DeviceForm
          initialSerial=""
          onSubmit={handleAdd}
          onCancel={() => setAddModal(false)}
          submitting={addSubmitting}
          submitLabel="Add Device"
        />
      </Modal>

      <Modal
        isOpen={editModal.open}
        onClose={() => setEditModal({ open: false, device: null })}
        title="Edit Device"
      >
        <DeviceForm
          initialSerial={editModal.device?.device_serial_number || ""}
          onSubmit={handleEdit}
          onCancel={() => setEditModal({ open: false, device: null })}
          submitting={editSubmitting}
          submitLabel="Save Changes"
        />
      </Modal>

      <ConfirmModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, device: null })}
        onConfirm={handleDelete}
        deviceSerial={deleteModal.device?.device_serial_number}
        submitting={deleteSubmitting}
      />

      <div className="min-h-screen bg-[#f9fafb] px-2 sm:px-4 py-4 sm:py-6">
        <div className="space-y-6">

          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-[#1a2e4a]">Manage Devices</h2>
              <p className="text-gray-500 text-sm mt-0.5">
                View and manage all SmartCane devices, VIP assignments, and guardians.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchDevices}
                disabled={loading}
                className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors cursor-pointer disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              </button>
              {isSuperAdmin && (
                <button
                  onClick={() => setAddModal(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#11285A] text-white rounded-xl font-semibold hover:bg-[#0d1b3d] transition-all hover:shadow-lg cursor-pointer text-sm"
                >
                  <Plus size={16} />
                  Add Device
                </button>
              )}
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                label: "Total Devices",
                value: totalDevices,
                icon: Cpu,
                gradient: "from-blue-50 to-indigo-50",
                border: "border-blue-100",
                iconBg: "bg-blue-50",
                iconColor: "text-blue-600",
              },
              {
                label: "Paired Devices",
                value: pairedCount,
                icon: Shield,
                gradient: "from-green-50 to-emerald-50",
                border: "border-green-100",
                iconBg: "bg-green-50",
                iconColor: "text-green-600",
              },
              {
                label: "Active (Last 24h)",
                value: activeCount,
                icon: Wifi,
                gradient: "from-purple-50 to-violet-50",
                border: "border-purple-100",
                iconBg: "bg-purple-50",
                iconColor: "text-purple-600",
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
            {/* Table Header Bar */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-[#1a2e4a]">All Devices</h3>
              <span className="text-sm text-gray-400">
                {totalDevices} device{totalDevices !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <LoadingSkeleton />
              ) : devices.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                  <Cpu size={52} className="mb-4 text-gray-200" />
                  <p className="text-lg font-semibold text-gray-500">No devices registered yet</p>
                  <p className="text-sm mt-1 text-gray-400">
                    {isSuperAdmin
                      ? "Click 'Add Device' to register your first SmartCane."
                      : "No devices have been added yet."}
                  </p>
                </div>
              ) : (
                <table className="w-full min-w-[800px]">
                  <thead>
                    <tr className="bg-gradient-to-r from-[#f0f6ff] to-[#e8f0fe]">
                      {[
                        "Serial Number",
                        "Paired",
                        "VIP Assigned",
                        "Guardians",
                        "Status",
                        "Last Active",
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
                    {devices.map((d, i) => (
                      <tr
                        key={d.device_id}
                        className={`border-t border-gray-50 hover:bg-blue-50/20 transition-colors
                          ${i % 2 === 0 ? "bg-white" : "bg-[#fafcff]"}`}
                      >
                        {/* Serial Number */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="p-1.5 bg-blue-50 rounded-lg flex-shrink-0">
                              <Cpu size={14} className="text-blue-600" />
                            </div>
                            <span className="font-mono text-sm font-semibold text-[#1a2e4a]">
                              {d.device_serial_number}
                            </span>
                          </div>
                        </td>

                        {/* Paired */}
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap
                              ${d.is_paired
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-500"}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full flex-shrink-0
                                ${d.is_paired ? "bg-green-500" : "bg-gray-400"}`}
                            />
                            {d.is_paired ? "Paired" : "Unpaired"}
                          </span>
                        </td>

                        {/* VIP */}
                        <td className="px-5 py-4">
                          {d.vip ? (
                            <div>
                              <p className="text-sm font-semibold text-[#1a2e4a] leading-tight">
                                {d.vip.first_name} {d.vip.last_name}
                              </p>
                              <p className="text-xs text-gray-400">ID #{d.vip.vip_id}</p>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 italic">No VIP assigned</span>
                          )}
                        </td>

                        {/* Guardians */}
                        <td className="px-5 py-4">
                          {d.guardians && d.guardians.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {d.guardians.slice(0, 2).map((g) => (
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
                              {d.guardians.length > 2 && (
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs font-semibold self-center">
                                  +{d.guardians.length - 2}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 italic">None assigned</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          {d.status === "active" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 whitespace-nowrap">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600 whitespace-nowrap">
                              <WifiOff size={11} />
                              Inactive
                            </span>
                          )}
                        </td>

                        {/* Last Active */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 whitespace-nowrap">
                            <Clock size={12} className="flex-shrink-0" />
                            {d.last_active_at
                              ? new Date(d.last_active_at).toLocaleString("en-PH", {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "Never"}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1">
                            {/* Edit: both admin & super_admin */}
                            <button
                              onClick={() => setEditModal({ open: true, device: d })}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="Edit serial number"
                            >
                              <Pencil size={15} />
                            </button>

                            {/* Delete: super_admin only */}
                            {isSuperAdmin && (
                              <button
                                onClick={() => setDeleteModal({ open: true, device: d })}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                title="Delete device"
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