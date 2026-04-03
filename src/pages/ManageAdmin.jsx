import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { Plus, Pencil, Trash2, ShieldCheck, UserCog } from "lucide-react";
import TextField from "../ui/components/TextField";
import SelectField from "../ui/components/SelectField";
import PasswordField from "../ui/components/PasswordField";
import Toast from "../ui/components/Toast";
import api from "../api/client";

const emptyForm = {
  first_name: "", middle_name: "", last_name: "",
  email: "", username: "", password: "",
  contact_number: "", province: "", city: "",
  barangay: "", street_address: "", role: "admin",
};

// Loading skeleton
const LoadingSkeleton = () => (
  <div className="p-5 space-y-3">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex gap-4 animate-pulse items-center">
        <div className="h-6 bg-gray-100 rounded w-12" />
        <div className="h-6 bg-gray-100 rounded w-40" />
        <div className="h-6 bg-gray-100 rounded w-32" />
        <div className="h-6 bg-gray-100 rounded w-48" />
        <div className="h-6 bg-gray-100 rounded w-24" />
        <div className="h-6 bg-gray-100 rounded w-20" />
        <div className="h-6 bg-gray-100 rounded w-20" />
      </div>
    ))}
  </div>
);

export default function ManageAdmin() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: "", type: "", visible: false });

  const showToast = (message, type = "info") => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast({ message: "", type: "", visible: false }), 3000);
  };

  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState(emptyForm);
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [addError, setAddError] = useState("");

  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState(emptyForm);
  const [editTarget, setEditTarget] = useState(null);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const [showAuthGuard, setShowAuthGuard] = useState(false);

  const role = localStorage.getItem("role") || "";
  const isSuperAdmin = role === "super_admin";

  useEffect(() => {
    fetchAdmins();
  }, []);

  async function fetchAdmins() {
    setLoading(true);
    const res = await api.get("/api/admin/");
    if (res && res.ok) setAdmins(res.data);
    setLoading(false);
  }

  const handleAddChange = (e) => {
    setAddForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setAddError("");
    setAddSubmitting(true);
    try {
      const res = await api.post("/api/admin/create", addForm);
      if (!res || !res.ok) {
        setAddError(res?.data?.message || "Failed to create admin.");
        return;
      }
      showToast("Admin created successfully!", "success");
      setAddForm(emptyForm);
      fetchAdmins();
      setShowAddModal(false);
    } catch (err) {
      setAddError("Cannot reach the server.");
    } finally {
      setAddSubmitting(false);
    }
  };

  const handleAddClick = () => {
    if (!isSuperAdmin) {
      setShowAuthGuard(true);
      return;
    }
    setAddForm(emptyForm);
    setAddError("");
    setShowAddModal(true);
  };

  const handleEditChange = (e) => {
    setEditForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const openEditModal = (admin) => {
    if (!isSuperAdmin) {
      setShowAuthGuard(true);
      return;
    }
    setEditTarget(admin);
    setEditForm({
      first_name: admin.first_name || "",
      middle_name: admin.middle_name || "",
      last_name: admin.last_name || "",
      email: admin.email || "",
      username: admin.username || "",
      password: "",
      contact_number: admin.contact_number || "",
      province: admin.province || "",
      city: admin.city || "",
      barangay: admin.barangay || "",
      street_address: admin.street_address || "",
      role: admin.role || "admin",
    });
    setEditError("");
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError("");
    setEditSubmitting(true);
    try {
      const payload = { ...editForm };
      if (!payload.password.trim()) delete payload.password;
      const res = await api.put(`/api/admin/${editTarget.admin_id}/update`, payload);
      if (!res || !res.ok) {
        setEditError(res?.data?.message || "Failed to update admin.");
        return;
      }
      showToast("Admin updated successfully!", "success");
      fetchAdmins();
      setShowEditModal(false);
    } catch (err) {
      setEditError("Cannot reach the server.");
    } finally {
      setEditSubmitting(false);
    }
  };

  const openDeleteModal = (admin) => {
    if (!isSuperAdmin) {
      setShowAuthGuard(true);
      return;
    }
    setDeleteTarget(admin);
    setDeleteError("");
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteError("");
    setDeleteLoading(true);
    try {
      const res = await api.delete(`/api/admin/${deleteTarget.admin_id}/delete`);
      if (!res || !res.ok) {
        setDeleteError(res?.data?.message || "Failed to delete admin.");
        return;
      }
      showToast("Admin deleted successfully!", "success");
      fetchAdmins();
      setShowDeleteModal(false);
      setDeleteTarget(null);
    } catch (err) {
      setDeleteError("Cannot reach the server.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const totalAdmins = admins.length;
  const superAdmins = admins.filter(a => a.role === "super_admin").length;
  const pendingSetup = admins.filter(a => a.is_first_login).length;

  return (
    <>
      {toast.visible && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={3000}
          position="top-right"
          onClose={() => setToast({ ...toast, visible: false })}
        />
      )}

      <div className="min-h-screen bg-[#f9fafb] px-2 sm:px-4 py-4 sm:py-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-[#1a2e4a]">Manage Admins</h2>
              <p className="text-gray-500 text-sm mt-0.5">
                View and manage administrator accounts. Only Super Admins can add, edit, or delete.
              </p>
            </div>
            <button
              onClick={handleAddClick}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-100 text-white text-sm font-semibold hover:bg-primary-200 transition-colors cursor-pointer"
            >
              <Plus size={16} />
              Add Admin
            </button>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-5 flex items-center gap-4 shadow-sm">
              <div className="p-3 bg-blue-50 rounded-xl shadow-sm">
                <UserCog size={22} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Admins</p>
                <p className="text-3xl font-bold text-[#1a2e4a] leading-tight">{totalAdmins}</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100 p-5 flex items-center gap-4 shadow-sm">
              <div className="p-3 bg-amber-50 rounded-xl shadow-sm">
                <ShieldCheck size={22} className="text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Super Admins</p>
                <p className="text-3xl font-bold text-[#1a2e4a] leading-tight">{superAdmins}</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl border border-yellow-100 p-5 flex items-center gap-4 shadow-sm">
              <div className="p-3 bg-yellow-50 rounded-xl shadow-sm">
                <Icon icon="ph:clock-duotone" className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Pending Setup</p>
                <p className="text-3xl font-bold text-[#1a2e4a] leading-tight">{pendingSetup}</p>
              </div>
            </div>
          </div>

          {/* Table Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-[#1a2e4a]">All Administrators</h3>
              <span className="text-sm text-gray-400">
                {totalAdmins} admin{totalAdmins !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <LoadingSkeleton />
              ) : admins.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                  <UserCog size={52} className="mb-4 text-gray-200" />
                  <p className="text-lg font-semibold text-gray-500">No admins found</p>
                  <p className="text-sm mt-1 text-gray-400">
                    Click "Add Admin" to create one.
                  </p>
                </div>
              ) : (
                <table className="w-full min-w-[800px]">
                  <thead>
                    <tr className="bg-gradient-to-r from-[#f0f6ff] to-[#e8f0fe]">
                      {["#", "Name", "Username", "Email", "Role", "Status", "Actions"].map(h => (
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
                    {admins.map((a, i) => (
                      <tr
                        key={a.admin_id}
                        className={`border-t border-gray-50 hover:bg-blue-50/20 transition-colors ${
                          i % 2 === 0 ? "bg-white" : "bg-[#fafcff]"
                        }`}
                      >
                        <td className="px-5 py-4 text-sm text-gray-500">{i + 1}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="p-1.5 bg-blue-50 rounded-lg flex-shrink-0">
                              <UserCog size={14} className="text-blue-600" />
                            </div>
                            <span className="text-sm font-medium text-[#1a2e4a]">
                              {[a.first_name, a.middle_name, a.last_name].filter(Boolean).join(" ")}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-700">@{a.username}</td>
                        <td className="px-5 py-4 text-sm text-gray-700">{a.email}</td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              a.role === "super_admin"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {a.role === "super_admin" ? "Super Admin" : "Admin"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              a.is_first_login
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {a.is_first_login ? "Pending setup" : "Active"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEditModal(a)}
                              className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                              title="Edit"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => openDeleteModal(a)}
                              className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
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

{showAddModal && (
  <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
    <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-4xl relative z-10 max-h-[90vh] overflow-y-auto">
      <div className="flex flex-col space-y-1 mb-6">
        <h3 className="text-xl font-semibold text-gray-800">Add New Admin</h3>
        <p className="text-sm text-gray-500">Fill in the details to create a new admin account.</p>
      </div>

      <form onSubmit={handleAddSubmit} className="space-y-6">
        {/* Row 1: First Name + Middle Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <TextField
            label="First Name"
            name="first_name"
            value={addForm.first_name}
            onChange={handleAddChange}
            placeholder="Juan"
            required
          />
          <TextField
            label="Middle Name"
            name="middle_name"
            value={addForm.middle_name}
            onChange={handleAddChange}
            placeholder="Optional"
          />
        </div>

        {/* Row 2: Last Name + Role */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <TextField
            label="Last Name"
            name="last_name"
            value={addForm.last_name}
            onChange={handleAddChange}
            placeholder="Dela Cruz"
            required
          />
          <SelectField
            label="Role"
            name="role"
            value={addForm.role}
            onChange={handleAddChange}
            options={[
              { value: "admin", label: "Admin" },
              { value: "super_admin", label: "Super Admin" },
            ]}
          />
        </div>

        {/* Row 3: Username + Password */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <TextField
            label="Username"
            name="username"
            value={addForm.username}
            onChange={handleAddChange}
            placeholder="juandelacruz"
            required
          />
          <PasswordField
            label="Password"
            name="password"
            value={addForm.password}
            onChange={handleAddChange}
            placeholder="Temporary password"
            required
          />
        </div>

        {/* Row 4: Email + Contact Number */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <TextField
            label="Email Address"
            name="email"
            type="email"
            value={addForm.email}
            onChange={handleAddChange}
            placeholder="admin@example.com"
            required
          />
          <TextField
            label="Contact Number"
            name="contact_number"
            value={addForm.contact_number}
            onChange={handleAddChange}
            placeholder="09123456789"
          />
        </div>

        {/* Row 5: Street Address + Barangay */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <TextField
            label="Street Address"
            name="street_address"
            value={addForm.street_address}
            onChange={handleAddChange}
            placeholder="123 Main St."
          />
          <TextField
            label="Barangay"
            name="barangay"
            value={addForm.barangay}
            onChange={handleAddChange}
            placeholder="Barangay"
          />
        </div>

        {/* Row 6: Province + City */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <TextField
            label="Province"
            name="province"
            value={addForm.province}
            onChange={handleAddChange}
            placeholder="Province"
          />
          <TextField
            label="City"
            name="city"
            value={addForm.city}
            onChange={handleAddChange}
            placeholder="City"
          />
        </div>

        {addError && <p className="text-red-500 text-sm text-center">{addError}</p>}

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-4">
          <button
            type="button"
            onClick={() => setShowAddModal(false)}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={addSubmitting}
            className="px-4 py-2 rounded-lg bg-primary-100 text-white hover:bg-primary-200 disabled:opacity-50 transition-colors cursor-pointer flex items-center gap-2"
          >
            {addSubmitting ? (
              <>
                <Icon icon="ph:circle-notch-bold" className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Admin"
            )}
          </button>
        </div>
      </form>
    </div>
  </div>
)}

{showEditModal && editTarget && (
  <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
    <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-4xl relative z-10 max-h-[90vh] overflow-y-auto">
      <div className="flex flex-col space-y-1 mb-6">
        <h3 className="text-xl font-semibold text-gray-800">
          Edit Admin — <span className="text-primary-100">{editTarget.username}</span>
        </h3>
        <p className="text-sm text-gray-500">Update the admin's information below.</p>
      </div>

      <form onSubmit={handleEditSubmit} className="space-y-6">
        {/* Row 1: First Name + Middle Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <TextField
            label="First Name"
            name="first_name"
            value={editForm.first_name}
            onChange={handleEditChange}
            placeholder="Juan"
            required
          />
          <TextField
            label="Middle Name"
            name="middle_name"
            value={editForm.middle_name}
            onChange={handleEditChange}
            placeholder="Optional"
          />
        </div>

        {/* Row 2: Last Name + Role */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <TextField
            label="Last Name"
            name="last_name"
            value={editForm.last_name}
            onChange={handleEditChange}
            placeholder="Dela Cruz"
            required
          />
          <SelectField
            label="Role"
            name="role"
            value={editForm.role}
            onChange={handleEditChange}
            options={[
              { value: "admin", label: "Admin" },
              { value: "super_admin", label: "Super Admin" },
            ]}
          />
        </div>

        {/* Row 3: Username + Password */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <TextField
            label="Username"
            name="username"
            value={editForm.username}
            onChange={handleEditChange}
            placeholder="juandelacruz"
            required
          />
          <TextField
            label="New Password"
            name="password"
            type="password"
            value={editForm.password}
            onChange={handleEditChange}
            placeholder="Leave blank to keep current"
            helperText="Only fill this to change the password."
          />
        </div>

        {/* Row 4: Email + Contact Number */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <TextField
            label="Email Address"
            name="email"
            type="email"
            value={editForm.email}
            onChange={handleEditChange}
            placeholder="admin@example.com"
            required
          />
          <TextField
            label="Contact Number"
            name="contact_number"
            value={editForm.contact_number}
            onChange={handleEditChange}
            placeholder="09123456789"
          />
        </div>

        {/* Row 5: Street Address + Barangay */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <TextField
            label="Street Address"
            name="street_address"
            value={editForm.street_address}
            onChange={handleEditChange}
            placeholder="123 Main St."
          />
          <TextField
            label="Barangay"
            name="barangay"
            value={editForm.barangay}
            onChange={handleEditChange}
            placeholder="Barangay"
          />
        </div>

        {/* Row 6: Province + City */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <TextField
            label="Province"
            name="province"
            value={editForm.province}
            onChange={handleEditChange}
            placeholder="Province"
          />
          <TextField
            label="City"
            name="city"
            value={editForm.city}
            onChange={handleEditChange}
            placeholder="City"
          />
        </div>

        {editError && <p className="text-red-500 text-sm text-center">{editError}</p>}

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-4">
          <button
            type="button"
            onClick={() => setShowEditModal(false)}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={editSubmitting}
            className="px-4 py-2 rounded-lg bg-primary-100 text-white hover:bg-primary-200 disabled:opacity-50 transition-colors cursor-pointer flex items-center gap-2"
          >
            {editSubmitting ? (
              <>
                <Icon icon="ph:circle-notch-bold" className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </form>
    </div>
  </div>
)}

      {showDeleteModal && deleteTarget && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
          <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-md relative z-10 text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <Trash2 size={28} className="text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Delete Admin?</h3>
            <p className="text-gray-600 mb-1">
              You are about to permanently delete:
            </p>
            <p className="font-semibold text-gray-800 mb-1">
              {[deleteTarget.first_name, deleteTarget.middle_name, deleteTarget.last_name].filter(Boolean).join(" ")}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              @{deleteTarget.username} · {deleteTarget.email}
            </p>
            <p className="text-sm text-red-600 bg-red-50 rounded-lg p-2 mb-4">
              This action cannot be undone. The record will be moved to the archive.
            </p>
            {deleteError && <p className="text-red-500 text-sm mb-4">{deleteError}</p>}
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteLoading}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleteLoading}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {deleteLoading ? (
                  <>
                    <Icon icon="ph:circle-notch-bold" className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Yes, Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAuthGuard && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
          <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-md relative z-10 text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mb-4">
              <ShieldCheck size={28} className="text-amber-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Access Restricted</h3>
            <p className="text-gray-600 mb-4">
              You are not authorized to perform this action. Only <strong>Super Admins</strong> can add, edit, or delete admin accounts.
            </p>
            <button
              onClick={() => setShowAuthGuard(false)}
              className="px-4 py-2 rounded-lg bg-primary-100 text-white hover:bg-primary-200 transition-colors cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}