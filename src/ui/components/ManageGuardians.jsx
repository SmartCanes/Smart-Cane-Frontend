import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import Modal from "@/ui/components/Modal";
import Toast from "@/ui/components/Toast";
import { AnimatePresence, motion } from "framer-motion";
import {
  inviteGuardianLink,
  modifyGuardianRole,
  removeGuardianFromDevice
} from "@/api/backendService";
import { useGuardiansStore, useUserStore } from "@/stores/useStore";
import { capitalizeWords } from "@/utils/Capitalize";
import { resolveProfileImageSrc } from "@/utils/ResolveImage";
import DefaultProfile from "./DefaultProfile";
import RoleBadge from "./RoleBadge";

const ManageGuardiansModal = ({
  isOpen,
  onClose,
  deviceId,
  vipName,
  vipId
}) => {
  const { guardians, removeGuardian } = useGuardiansStore();
  const { user } = useUserStore();
  const [email, setEmail] = useState("");
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedGuardian, setSelectedGuardian] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({
    show: false,
    guardianId: null,
    guardianName: ""
  });

  const [toast, setToast] = useState({
    show: false,
    type: "",
    message: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState("tiles");

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setToast({ show: false, type: "", message: "" });
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const isSelf = (guardianId) => {
    return guardianId === user.guardianId;
  };

  const handleSendInvite = async () => {
    if (!email || !email.includes("@")) {
      setToast({
        show: true,
        type: "error",
        message: "Please enter a valid email address"
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await inviteGuardianLink(deviceId, { email });

      if (!response.success) {
        throw new Error(response.message || "Invitation failed");
      }

      setToast({
        show: true,
        type: "success",
        message: "Invitation sent successfully"
      });

      setInviteModalOpen(false);
      setEmail("");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to send invitation";
      setToast({
        show: true,
        type: "error",
        message: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveGuardian = async () => {
    if (!deleteConfirm.guardianId) return;

    try {
      setIsSubmitting(true);

      const response = await removeGuardianFromDevice(
        deviceId,
        deleteConfirm.guardianId
      );

      if (!response.success) {
        throw new Error(response.message || "Failed to remove guardian");
      }

      removeGuardian(deviceId, deleteConfirm.guardianId);
      setDeleteConfirm({ show: false, guardianId: null, guardianName: "" });

      setToast({
        show: true,
        type: "success",
        message: "Guardian removed successfully"
      });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to remove guardian";
      setDeleteConfirm({ show: false, guardianId: null, guardianName: "" });
      setToast({
        show: true,
        type: "error",
        message: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditGuardianRole = async () => {
    if (!selectedGuardian?.role) return;

    try {
      setIsSubmitting(true);
      const response = await modifyGuardianRole(
        deviceId,
        selectedGuardian.guardianId,
        { role: selectedGuardian.role }
      );

      console.log(response);

      if (!response.success)
        throw new Error(response.message || "Failed to update role");

      setSelectedGuardian(null);
      setIsEditOpen(false);

      setToast({
        show: true,
        type: "success",
        message: "Guardian role updated successfully"
      });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to update guardian role";
      setToast({
        show: true,
        type: "error",
        message: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const GuardiansListView = () => (
    <div className="space-y-4">
      {guardians(deviceId).map((guardian) => (
        <motion.div
          key={guardian.guardianId}
          whileHover={{ y: -4, scale: 1.01 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="bg-white rounded-xl border border-gray-200 hover:border-blue-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
        >
          <div className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  {guardian.guardianImageUrl ? (
                    <img
                      loading="lazy"
                      src={resolveProfileImageSrc(guardian.guardianImageUrl)}
                      alt={`${guardian.fullName}'s avatar`}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <DefaultProfile
                      hover="none"
                      bgColor="bg-[#11285A]"
                      userInitial={guardian.firstName?.charAt(0).toUpperCase()}
                    />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900 text-base leading-tight truncate">
                      {capitalizeWords(
                        `${guardian.firstName} ${guardian.lastName}`
                      )}
                    </h3>

                    <span
                      className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                        guardian.status === "active"
                          ? "bg-green-100 text-green-800"
                          : guardian.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {guardian.status || "Inactive"}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-6 text-sm">
                    <div className="flex items-center gap-2 text-gray-600 min-w-0">
                      <Icon
                        icon="ph:envelope-bold"
                        className="w-4 h-4 text-gray-400 flex-shrink-0"
                      />
                      <span className="truncate">{guardian.email}</span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600">
                      <Icon
                        icon="ph:phone-bold"
                        className="w-4 h-4 text-gray-400 flex-shrink-0"
                      />
                      <span>{guardian.contactNumber || "—"}</span>
                    </div>

                    <div className="flex items-center">
                      <RoleBadge role={guardian.role} fixed />
                    </div>
                  </div>

                  {/* Relationship */}
                  <div className="mt-2 flex items-start gap-2 text-sm text-gray-600">
                    <Icon
                      icon="ph:users-three-bold"
                      className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0"
                    />
                    <span className="line-clamp-2">
                      {capitalizeWords(guardian.relationship) || "—"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              {!isSelf(guardian.guardianId) && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedGuardian(guardian);
                      setIsEditOpen(true);
                    }}
                    title="Edit guardian"
                    className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    <Icon icon="ph:pencil-bold" className="w-5 h-5" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirm({
                        show: true,
                        guardianId: guardian.guardianId,
                        guardianName: capitalizeWords(guardian.firstName)
                      });
                    }}
                    disabled={isSubmitting}
                    title="Remove guardian"
                    className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    <Icon icon="ph:trash-bold" className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const GuardiansTileView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {guardians(deviceId).map((guardian) => (
        <motion.div
          key={guardian.guardianId}
          whileHover={{ y: -6, scale: 1.015 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="
          group relative
          rounded-2xl
          bg-white/80 backdrop-blur
          shadow-sm hover:shadow-xl
          ring-1 ring-gray-200/70
          p-5 md:p-6
          transition-all
        "
        >
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="relative">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-md">
                  {guardian.guardianImageUrl ? (
                    <img
                      loading="lazy"
                      src={resolveProfileImageSrc(guardian.guardianImageUrl)}
                      alt={`${guardian.fullName}'s avatar`}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <DefaultProfile
                      hover="none"
                      bgColor="bg-[#11285A]"
                      userInitial={guardian.firstName?.charAt(0).toUpperCase()}
                    />
                  )}
                </div>

                {/* Status dot */}
                <span
                  className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ring-2 ring-white ${
                    guardian.status === "active"
                      ? "bg-green-500"
                      : guardian.status === "pending"
                        ? "bg-yellow-400"
                        : "bg-gray-400"
                  }`}
                />
              </div>

              {/* Name & email */}
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900 text-lg leading-tight">
                    {capitalizeWords(
                      `${guardian.firstName} ${guardian.lastName}`
                    )}
                  </h3>

                  {isSelf(guardian.guardianId) && (
                    <span className="text-xs font-medium text-white bg-blue-600 px-2 py-0.5 rounded-full">
                      You
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-500 mt-1 truncate">
                  {guardian.email}
                </p>

                <span
                  className={`inline-flex items-center gap-1 mt-2 px-3 py-1 text-xs rounded-full font-semibold ${
                    guardian.status === "active"
                      ? "bg-green-50 text-green-800"
                      : guardian.status === "pending"
                        ? "bg-yellow-50 text-yellow-800"
                        : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {guardian.status || "inactive"}
                </span>
              </div>
            </div>

            {/* Remove button */}
            <div className="flex gap-2">
              {!isSelf(guardian.guardianId) && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedGuardian(guardian);
                      setIsEditOpen(true);
                    }}
                    title="Edit guardian"
                    className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                  >
                    <Icon icon="ph:pencil-bold" className="w-5 h-5" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirm({
                        show: true,
                        guardianId: guardian.guardianId,
                        guardianName: capitalizeWords(guardian.firstName)
                      });
                    }}
                    disabled={isSubmitting}
                    title="Remove guardian"
                    className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 cursor-pointer"
                  >
                    <Icon icon="ph:trash-bold" className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="my-5 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

          {/* Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Phone Number
              </p>
              <p className="mt-1 text-gray-800">
                {guardian.contactNumber || "—"}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Role
              </p>

              <div className="mt-2">
                <RoleBadge role={guardian.role} />
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Email Address
              </p>
              <p className="mt-1 text-gray-800 break-all">
                {guardian.email || "—"}
              </p>
            </div>

            <div className="md:col-span-2">
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Relationship
              </p>
              <p className="mt-1 text-gray-800">
                {guardian.relationship?.charAt(0).toUpperCase() +
                  guardian.relationship?.slice(1) || "—"}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence mode="sync">
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 flex justify-center items-center"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="relative z-10 w-full max-w-6xl mx-4">
            <motion.div
              className="relative bg-white rounded-2xl shadow-2xl w-full max-h-[90vh] flex flex-col border border-gray-100 overflow-hidden"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 rounded-t-2xl z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                      Manage Guardians
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {vipName
                        ? `Guardians for ${vipName}`
                        : "Manage VIP guardians"}
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                    disabled={isSubmitting}
                  >
                    <Icon icon="ph:x-bold" className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 w-full">
                    {/* VIP Info */}
                    <div className="flex-1 w-full">
                      <h4 className="font-semibold text-gray-900">
                        VIP Information
                      </h4>
                      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-gray-500">
                            VIP ID
                          </label>
                          <div className="mt-1 font-medium truncate">
                            {vipId || "—"}
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">
                            VIP Name
                          </label>
                          <div className="mt-1 font-medium truncate">
                            {vipName || "—"}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="w-full md:w-auto mt-3 md:mt-0">
                      <button
                        onClick={() => setInviteModalOpen(true)}
                        className="bg-[#2ECC71] text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 justify-center cursor-pointer hover:bg-green-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed w-full md:w-auto whitespace-nowrap"
                        disabled={isSubmitting}
                      >
                        <Icon icon="ph:user-plus-bold" className="w-5 h-5" />
                        Invite Guardian
                      </button>
                    </div>
                  </div>
                </div>

                {/* Guardians List Header with View Toggle */}
                <div className="mb-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        Assigned Guardians ({guardians(deviceId).length})
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">
                        Guardians who can monitor this VIP
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* View Toggle */}
                      <div className="flex items-center bg-gray-100 rounded-lg p-1">
                        <button
                          onClick={() => setViewMode("tiles")}
                          className={`px-3 py-1.5 rounded-md flex items-center gap-2 transition-colors cursor-pointer ${
                            viewMode === "tiles"
                              ? "bg-white shadow-sm text-blue-600"
                              : "text-gray-600 hover:text-gray-900"
                          }`}
                        >
                          <Icon
                            icon="ph:squares-four-bold"
                            className="w-4 h-4"
                          />
                          <span className="text-sm font-medium">Tiles</span>
                        </button>
                        <button
                          onClick={() => setViewMode("list")}
                          className={`px-3 py-1.5 rounded-md flex items-center gap-2 transition-colors cursor-pointer ${
                            viewMode === "list"
                              ? "bg-white shadow-sm text-blue-600"
                              : "text-gray-600 hover:text-gray-900"
                          }`}
                        >
                          <Icon
                            icon="ph:list-bullets-bold"
                            className="w-4 h-4"
                          />
                          <span className="text-sm font-medium">List</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  {guardians(deviceId).length === 0 ? (
                    <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50">
                      <Icon
                        icon="ph:users-three-bold"
                        className="w-16 h-16 text-gray-400 mx-auto mb-4"
                      />
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">
                        No Guardians Yet
                      </h3>
                      <p className="text-gray-500 mb-6 max-w-md mx-auto">
                        You haven't added any guardians yet. Invite guardians to
                        help monitor this VIP.
                      </p>
                      <button
                        onClick={() => setInviteModalOpen(true)}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                      >
                        <Icon icon="ph:user-plus-bold" className="w-5 h-5" />
                        Invite Your First Guardian
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Guardians View */}
                      {viewMode === "list" ? (
                        <GuardiansListView />
                      ) : (
                        <GuardiansTileView />
                      )}
                    </>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <Icon
                          icon="ph:users-bold"
                          className="w-6 h-6 text-blue-600"
                        />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total Guardians</p>
                        <p className="text-2xl font-bold">
                          {guardians(deviceId).length}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <Icon
                          icon="ph:check-circle-bold"
                          className="w-6 h-6 text-green-600"
                        />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Active</p>
                        <p className="text-2xl font-bold">
                          {
                            guardians(deviceId).filter(
                              (g) => g.status === "active"
                            ).length
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-yellow-100 p-2 rounded-lg">
                        <Icon
                          icon="ph:clock-bold"
                          className="w-6 h-6 text-yellow-600"
                        />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Pending Invites</p>
                        <p className="text-2xl font-bold">
                          {
                            guardians(deviceId).filter(
                              (g) => g.status === "pending"
                            ).length
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-gray-200 rounded-b-2xl">
                <div className="flex justify-end">
                  <button
                    onClick={onClose}
                    className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300 disabled:cursor-not-allowed cursor-pointer"
                    disabled={isSubmitting}
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <Modal
        key="invite-modal"
        isOpen={inviteModalOpen}
        title="Invite Guardian"
        modalType="info"
        closeTimer={null}
        footer={null}
        onClose={() => {
          setEmail("");
          setInviteModalOpen(false);
        }}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Guardian Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isSubmitting && email) {
                  e.preventDefault();
                  handleSendInvite();
                }
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Enter email address"
              disabled={isSubmitting}
            />
            <p className="text-sm text-gray-500 mt-2">
              An invitation will be sent to this email address
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setInviteModalOpen(false)}
              className="flex-1 border py-2.5 rounded-lg font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer border-gray-300 hover:bg-gray-200 disabled:border-gray-200 disabled:text-gray-400"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={handleSendInvite}
              disabled={isSubmitting || !email}
              className="flex-1 py-2.5 rounded-lg font-bold text-white cursor-pointer bg-[#2ECC71] hover:bg-green-600 "
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Icon
                    icon="ph:circle-notch-bold"
                    className="w-5 h-5 animate-spin"
                  />
                  Sending...
                </span>
              ) : (
                "Send Invitation"
              )}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        key="edit-guardian-modal"
        isOpen={isEditOpen}
        title="Edit Guardian Role"
        modalType="info"
        closeTimer={null}
        footer={null}
        onClose={() => {
          setSelectedGuardian(null);
          setIsEditOpen(false);
        }}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <select
              value={selectedGuardian?.role || ""}
              onChange={(e) =>
                setSelectedGuardian((prev) => ({
                  ...prev,
                  role: e.target.value
                }))
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="" disabled>
                Select role
              </option>
              <option value="primary">Primary Guardian</option>
              <option value="secondary">Secondary Guardian</option>
              <option value="guardian">Guardian</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => {
                setSelectedGuardian(null);
                setIsEditOpen(false);
              }}
              className="flex-1 border py-2.5 rounded-lg font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer border-gray-300 hover:bg-gray-200"
            >
              Cancel
            </button>

            <button
              onClick={() => {
                handleEditGuardianRole();
              }}
              disabled={!selectedGuardian?.role}
              className="flex-1 py-2.5 rounded-lg font-bold text-white cursor-pointer bg-blue-600 hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              Save
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        key="delete-confirmation-modal"
        isOpen={deleteConfirm.show}
        title="Remove Guardian"
        modalType="error"
        message={`Are you sure you want to remove ${deleteConfirm.guardianName} as a guardian?`}
        handleCancel={() =>
          setDeleteConfirm({
            show: false,
            guardianId: null,
            guardianName: ""
          })
        }
        handleConfirm={handleRemoveGuardian}
        isSubmitting={isSubmitting}
        confirmText={isSubmitting ? "Removing..." : "Remove Guardian"}
        cancelText="Cancel"
        onClose={() => {
          setDeleteConfirm({ show: false, guardianId: null, guardianName: "" });
        }}
      />

      {toast.show && (
        <Toast
          key="toast-modal"
          type={toast.type}
          message={toast.message}
          position="bottom-right"
          onClose={() => setToast({ show: false, type: "", message: "" })}
        />
      )}
    </AnimatePresence>
  );
};

export default ManageGuardiansModal;
