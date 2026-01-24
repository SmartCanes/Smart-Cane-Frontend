import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import Modal from "@/ui/components/Modal";
import Toast from "@/ui/components/Toast";
import { AnimatePresence, motion } from "framer-motion";
import {
  inviteGuardianLink,
  modifyGuardianRelationship,
  modifyGuardianRole,
  removeGuardianFromDevice,
  toggleEmergencyContact
} from "@/api/backendService";
import { useGuardiansStore, useUserStore } from "@/stores/useStore";
import { capitalizeWords } from "@/utils/Capitalize";
import { resolveProfileImageSrc } from "@/utils/ResolveImage";
import DefaultProfile from "./DefaultProfile";
import RoleBadge from "./RoleBadge";
import { SelectRole } from "./SelectRole";

const roleHierarchy = {
  primary: 3,
  secondary: 2,
  guardian: 1
};

const relationshipOptions = [
  { value: "spouse", label: "Spouse" },
  { value: "parent", label: "Parent" },
  { value: "child", label: "Child" },
  { value: "sibling", label: "Sibling" },
  { value: "friend", label: "Friend" },
  { value: "caregiver", label: "Caregiver" },
  { value: "neighbor", label: "Neighbor" },
  { value: "other", label: "Other" }
];

const EmergencyContactBadge = ({
  isEmergencyContact,
  onToggle,
  disabled = false
}) => {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={`
        inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-105 active:scale-95"}
        ${
          isEmergencyContact
            ? "bg-red-100 text-red-700 border border-red-200 hover:bg-red-200"
            : "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200"
        }
      `}
      title={
        isEmergencyContact
          ? "Remove as emergency contact"
          : "Set as emergency contact"
      }
    >
      <Icon
        icon={isEmergencyContact ? "ph:heart-bold" : "ph:heart"}
        className={`w-4 h-4 ${isEmergencyContact ? "text-red-500" : "text-gray-400"}`}
      />
      <span>
        {isEmergencyContact ? "Emergency Contact" : "Set as Emergency"}
      </span>
    </button>
  );
};

const EditRelationshipModal = ({
  isOpen,
  onClose,
  guardian,
  onSave,
  isSubmitting
}) => {
  const [relationship, setRelationship] = useState(
    guardian?.relationship || ""
  );
  const [customRelationship, setCustomRelationship] = useState("");

  useEffect(() => {
    if (guardian) {
      setRelationship(guardian.relationship || "");
      const isCustom = !relationshipOptions.some(
        (option) => option.value === guardian.relationship
      );
      if (isCustom && guardian.relationship) {
        setCustomRelationship(guardian.relationship);
        setRelationship("custom");
      }
    }
  }, [guardian]);

  const handleSave = async () => {
    const finalRelationship =
      relationship === "custom" ? customRelationship.trim() : relationship;

    if (!finalRelationship) {
      return;
    }

    await onSave(guardian.guardianId, finalRelationship);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 flex justify-center items-center"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="relative z-10 w-full max-w-3xl mx-4">
          <motion.div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-h-[90vh] flex flex-col border border-gray-100 overflow-hidden"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Edit Relationship
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Update relationship for {guardian?.firstName}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  <Icon icon="ph:x-bold" className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Guardian Preview */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center overflow-hidden">
                  {guardian?.guardianImageUrl ? (
                    <img
                      loading="lazy"
                      src={resolveProfileImageSrc(guardian.guardianImageUrl)}
                      alt={guardian.firstName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-bold">
                      {guardian?.firstName?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {capitalizeWords(
                      `${guardian?.firstName} ${guardian?.lastName}`
                    )}
                  </h4>
                  <p className="text-sm text-gray-500">{guardian?.email}</p>
                </div>
              </div>

              {/* Relationship Selection */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  Select Relationship Type
                </label>

                <div className="grid grid-cols-2 gap-3">
                  {relationshipOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setRelationship(option.value);
                        setCustomRelationship("");
                      }}
                      className={`
                    p-4 rounded-xl border-2 text-left transition-all
                    ${
                      relationship === option.value
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }
                  `}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">
                          {option.label}
                        </span>
                        {relationship === option.value && (
                          <Icon
                            icon="ph:check-circle"
                            className="w-5 h-5 text-blue-500"
                          />
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Custom Relationship Option */}
                <div
                  className={`
              p-4 rounded-xl border-2 transition-all
              ${
                relationship === "custom"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }
            `}
                >
                  <button
                    onClick={() => setRelationship("custom")}
                    className="w-full text-left"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">Custom</span>
                      {relationship === "custom" && (
                        <Icon
                          icon="ph:check-circle"
                          className="w-5 h-5 text-blue-500"
                        />
                      )}
                    </div>
                  </button>

                  {relationship === "custom" && (
                    <div className="mt-3">
                      <input
                        type="text"
                        value={customRelationship}
                        onChange={(e) => setCustomRelationship(e.target.value)}
                        placeholder="Enter custom relationship"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        autoFocus
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Enter a custom relationship description
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Current Relationship Display */}
              {guardian?.relationship && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Current relationship:{" "}
                    <span className="font-semibold text-blue-700">
                      {capitalizeWords(guardian.relationship)}
                    </span>
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200">
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={
                    isSubmitting || (!relationship && !customRelationship)
                  }
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Icon
                        icon="ph:circle-notch"
                        className="w-5 h-5 animate-spin"
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Icon icon="ph:check" className="w-5 h-5" />
                      Save Relationship
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

const GuardianTile = ({
  guardian,
  isSelf,
  currentRole,
  canManageGuardian,
  onEditRelationship,
  onEditRole,
  onRemove,
  onToggleEmergency,
  isSubmitting
}) => {
  const isCurrentUserSelf = isSelf(guardian.guardianId);
  const canManage = canManageGuardian(currentRole, guardian.role);
  const canEditRelationship =
    currentRole === "primary" || currentRole === "secondary";

  return (
    <motion.div
      layout
      whileHover={{ y: -6, scale: 1.015 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className={`
        group relative
        rounded-2xl
        bg-white/80 backdrop-blur
        shadow-sm hover:shadow-xl
        ring-1 ring-gray-200/70
        p-5 md:p-6
        transition-all
        ${guardian.isEmergencyContact ? "ring-2 ring-red-200" : ""}
      `}
    >
      {/* Emergency Contact Ribbon */}
      {guardian.isEmergencyContact && (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1 z-10">
          <Icon icon="ph:heart-bold" className="w-3 h-3" />
          EMERGENCY
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start gap-3">
        {/* Left side */}
        <div className="flex items-start gap-4 min-w-0 flex-1">
          {/* Avatar with Emergency Badge */}
          <div className="relative shrink-0">
            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-md overflow-hidden">
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

          {/* Name / Email / Status */}
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-gray-900 text-base sm:text-lg leading-tight break-words">
                {capitalizeWords(`${guardian.firstName} ${guardian.lastName}`)}
              </h3>

              {isCurrentUserSelf && (
                <span className="text-xs font-medium text-white bg-blue-600 px-2 py-0.5 rounded-full shrink-0">
                  You
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-gray-500 mt-1 break-words">
              {guardian.email}
            </p>

            <div className="flex items-center gap-2 mt-2">
              {/* Status */}
              <span
                className={`inline-flex px-3 py-1 text-xs rounded-full font-semibold ${
                  guardian.status === "active"
                    ? "bg-green-50 text-green-800"
                    : guardian.status === "pending"
                      ? "bg-yellow-50 text-yellow-800"
                      : "bg-gray-100 text-gray-600"
                }`}
              >
                {guardian.status || "inactive"}
              </span>

              {/* Role Badge */}
              <RoleBadge role={guardian.role} />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 shrink-0">
          {canEditRelationship && (
            <button
              onClick={() => onEditRelationship(guardian)}
              title="Edit relationship"
              className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
            >
              <Icon icon="ph:pencil-simple-bold" className="w-5 h-5" />
            </button>
          )}
          {canManage && (
            <>
              <button
                onClick={() => onEditRole(guardian)}
                title="Edit role"
                className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
              >
                <Icon icon="ph:shield-check-bold" className="w-5 h-5" />
              </button>

              <button
                onClick={() => onRemove(guardian)}
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
        {/* Phone Number with Emergency Indicator */}
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-400 mb-2">
            Phone Number
            {guardian.isEmergencyContact && (
              <span className="ml-2 text-red-500">
                <Icon icon="ph:heart-bold" className="inline w-3 h-3" />
              </span>
            )}
          </p>
          <div className="flex items-center gap-2">
            <p className="text-gray-800 font-medium">
              {guardian.contactNumber || "—"}
            </p>
            {!guardian.contactNumber && (
              <span className="text-xs text-gray-400">No number provided</span>
            )}
          </div>
        </div>

        {/* Relationship with Edit */}
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-400 mb-2">
            Relationship
          </p>
          <div className="flex items-center gap-2">
            <p className="text-gray-800 font-medium">
              {capitalizeWords(guardian.relationship) || "Not specified"}
            </p>
            {canManage && (
              <button
                onClick={() => onEditRelationship(guardian)}
                className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                title="Edit relationship"
              >
                <Icon icon="ph:pencil-simple-bold" className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Street Address */}
        <div className="md:col-span-2">
          <p className="text-xs uppercase tracking-wide text-gray-400 mb-2">
            Street Address
          </p>
          <p className="text-gray-800">{guardian.streetAddress || "—"}</p>
        </div>
      </div>

      {/* Emergency Contact Button */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <EmergencyContactBadge
          isEmergencyContact={guardian.isEmergencyContact}
          onToggle={() =>
            onToggleEmergency(guardian.guardianId, guardian.isEmergencyContact)
          }
          disabled={isSubmitting}
        />
      </div>
    </motion.div>
  );
};

const GuardianListItem = ({
  guardian,
  isSelf,
  currentRole,
  canManageGuardian,
  onEditRelationship,
  onEditRole,
  onRemove,
  onToggleEmergency,
  isSubmitting
}) => {
  const isCurrentUserSelf = isSelf(guardian.guardianId);
  const canManage = canManageGuardian(currentRole, guardian.role);

  return (
    <motion.div
      layout
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="bg-white rounded-xl border border-gray-200 hover:border-blue-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 min-w-0 flex-1">
            <div className="relative">
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center overflow-hidden flex-shrink-0">
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
              {guardian.isEmergencyContact && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 shadow-lg">
                  <Icon icon="ph:heart-bold" className="w-3 h-3" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <h3 className="font-semibold text-gray-900 text-base leading-tight break-words">
                  {capitalizeWords(
                    `${guardian.firstName} ${guardian.lastName}`
                  )}
                </h3>

                {guardian.isEmergencyContact && (
                  <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full font-medium flex items-center gap-1">
                    <Icon icon="ph:heart-bold" className="w-3 h-3" />
                    Emergency Contact
                  </span>
                )}

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
                  <span className="break-words w-full">{guardian.email}</span>
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

              {/* Relationship with Edit Button */}
              <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                <Icon
                  icon="ph:users-three-bold"
                  className="w-4 h-4 text-gray-400 flex-shrink-0"
                />
                <span className="line-clamp-2">
                  {capitalizeWords(guardian.relationship) || "Not specified"}
                </span>
                {canManage && (
                  <button
                    onClick={() => onEditRelationship(guardian)}
                    className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                    title="Edit relationship"
                  >
                    <Icon icon="ph:pencil-simple-bold" className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Emergency Contact Toggle */}
              <div className="mt-3">
                <EmergencyContactBadge
                  isEmergencyContact={guardian.isEmergencyContact}
                  onToggle={() =>
                    onToggleEmergency(
                      guardian.guardianId,
                      guardian.isEmergencyContact
                    )
                  }
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          {canManage && (
            <div className="flex items-center gap-1">
              {/* Role Edit Icon */}
              <button
                onClick={() => onEditRole(guardian)}
                title="Edit role"
                className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                <Icon icon="ph:shield-check-bold" className="w-5 h-5" />
              </button>

              <button
                onClick={() => onRemove(guardian)}
                disabled={isSubmitting}
                title="Remove guardian"
                className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                <Icon icon="ph:trash-bold" className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const GuardiansTileView = ({
  guardians,
  currentRole,
  isSelf,
  canManageGuardian,
  onEditRelationship,
  onEditRole,
  onRemove,
  onToggleEmergency,
  isSubmitting
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {guardians.map((guardian) => (
        <GuardianTile
          key={guardian.guardianId}
          guardian={guardian}
          isSelf={isSelf}
          currentRole={currentRole}
          canManageGuardian={canManageGuardian}
          onEditRelationship={onEditRelationship}
          onEditRole={onEditRole}
          onRemove={onRemove}
          onToggleEmergency={onToggleEmergency}
          isSubmitting={isSubmitting}
        />
      ))}
    </div>
  );
};

const GuardiansListView = ({
  guardians,
  currentRole,
  isSelf,
  canManageGuardian,
  onEditRelationship,
  onEditRole,
  onRemove,
  onToggleEmergency,
  isSubmitting
}) => {
  return (
    <div className="space-y-4">
      {guardians.map((guardian) => (
        <GuardianListItem
          key={guardian.guardianId}
          guardian={guardian}
          isSelf={isSelf}
          currentRole={currentRole}
          canManageGuardian={canManageGuardian}
          onEditRelationship={onEditRelationship}
          onEditRole={onEditRole}
          onRemove={onRemove}
          onToggleEmergency={onToggleEmergency}
          isSubmitting={isSubmitting}
        />
      ))}
    </div>
  );
};

const ManageGuardiansModal = ({
  isOpen,
  onClose,
  deviceId,
  vipName,
  vipId
}) => {
  const { guardians, removeGuardian, upsertGuardian, currentGuardianRole } =
    useGuardiansStore();
  const { user } = useUserStore();
  const [email, setEmail] = useState("");
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedGuardian, setSelectedGuardian] = useState(null);
  const [isSetRoleOpen, setIsSetRoleOpen] = useState(false);
  const [isEditRelationshipOpen, setIsEditRelationshipOpen] = useState(false);
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

  // Get current guardians
  const currentGuardians = guardians(deviceId);

  // Get current role
  const currentRole = currentGuardianRole(user.guardianId);

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

  const canManageGuardian = (currentRole, targetRole) => {
    if (!currentRole || !targetRole) return false;
    return roleHierarchy[currentRole] > roleHierarchy[targetRole];
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

  const handleEditGuardianRole = async (selectedRoleValue) => {
    if (
      !selectedGuardian?.role ||
      !selectedRoleValue ||
      selectedRoleValue === "primary"
    )
      return;

    try {
      setIsSubmitting(true);
      const response = await modifyGuardianRole(
        deviceId,
        selectedGuardian.guardianId,
        { role: selectedRoleValue }
      );

      if (!response.success)
        throw new Error(response.message || "Failed to update role");

      upsertGuardian(deviceId, {
        ...selectedGuardian,
        role: selectedRoleValue
      });

      setSelectedGuardian(null);
      setIsSetRoleOpen(false);

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

  const handleEditRelationship = async (guardianId, newRelationship) => {
    try {
      setIsSubmitting(true);

      const response = await modifyGuardianRelationship(deviceId, guardianId, {
        relationship: newRelationship
      });

      if (!response.success)
        throw new Error(response.message || "Failed to update relationship");

      upsertGuardian(deviceId, {
        ...selectedGuardian,
        relationship: newRelationship
      });

      setToast({
        show: true,
        type: "success",
        message: "Relationship updated successfully"
      });

      setIsEditRelationshipOpen(false);
      setSelectedGuardian(null);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to update relationship";
      setToast({
        show: true,
        type: "error",
        message: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleEmergencyContact = async (guardianId) => {
    try {
      setIsSubmitting(true);

      const response = await toggleEmergencyContact(deviceId, guardianId);

      const isEmergencyContact = response.data.isEmergencyContact;

      if (!response.success)
        throw new Error(
          response.message || "Failed to update emergency contact"
        );

      if (isEmergencyContact) {
        currentGuardians.forEach((g) => {
          upsertGuardian(deviceId, {
            ...g,
            isEmergencyContact: g.guardianId === guardianId
          });
        });
      } else {
        const updatedGuardian = currentGuardians.find(
          (g) => g.guardianId === guardianId
        );

        if (updatedGuardian) {
          upsertGuardian(deviceId, {
            ...updatedGuardian,
            isEmergencyContact: false
          });
        }
      }

      setToast({
        show: true,
        type: "success",
        message: isEmergencyContact
          ? "Set as emergency contact"
          : "Removed from emergency contacts"
      });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to update emergency contact";
      setToast({
        show: true,
        type: "error",
        message: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditRelationshipClick = (guardian) => {
    setSelectedGuardian(guardian);
    setIsEditRelationshipOpen(true);
  };

  const handleEditRoleClick = (guardian) => {
    setSelectedGuardian(guardian);
    setIsSetRoleOpen(true);
  };

  const handleRemoveClick = (guardian) => {
    setDeleteConfirm({
      show: true,
      guardianId: guardian.guardianId,
      guardianName: capitalizeWords(guardian.firstName)
    });
  };

  const stats = {
    total: currentGuardians.length,
    active: currentGuardians.filter((g) => g.status === "active").length,
    pending: currentGuardians.filter((g) => g.status === "pending").length,
    emergency: currentGuardians.filter((g) => g.isEmergencyContact).length
  };

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
                        className="bg-[#2ECC71] text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 justify-center cursor-pointer hover:bg-green-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed w-full md:w-auto whitespace-nowrap text-sm sm:text-base"
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
                        Assigned Guardians ({stats.total})
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

                  {stats.total === 0 ? (
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
                  ) : viewMode === "tiles" ? (
                    <GuardiansTileView
                      guardians={currentGuardians}
                      currentRole={currentRole}
                      isSelf={isSelf}
                      canManageGuardian={canManageGuardian}
                      onEditRelationship={handleEditRelationshipClick}
                      onEditRole={handleEditRoleClick}
                      onRemove={handleRemoveClick}
                      onToggleEmergency={handleToggleEmergencyContact}
                      isSubmitting={isSubmitting}
                    />
                  ) : (
                    <GuardiansListView
                      guardians={currentGuardians}
                      currentRole={currentRole}
                      isSelf={isSelf}
                      canManageGuardian={canManageGuardian}
                      onEditRelationship={handleEditRelationshipClick}
                      onEditRole={handleEditRoleClick}
                      onRemove={handleRemoveClick}
                      onToggleEmergency={handleToggleEmergencyContact}
                      isSubmitting={isSubmitting}
                    />
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
                        <p className="text-2xl font-bold">{stats.total}</p>
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
                        <p className="text-2xl font-bold">{stats.active}</p>
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
                        <p className="text-2xl font-bold">{stats.pending}</p>
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

      {/* Invite Modal */}
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

      {/* Role Selection Modal */}
      <SelectRole
        key="edit-guardian-role-modal"
        isSubmitting={isSubmitting}
        isOpen={isSetRoleOpen}
        onClose={() => setIsSetRoleOpen(false)}
        selectedGuardian={selectedGuardian}
        setSelectedGuardian={setSelectedGuardian}
        handleEditGuardianRole={handleEditGuardianRole}
      />

      {/* Relationship Edit Modal */}
      <EditRelationshipModal
        key="edit-relationship-modal"
        isOpen={isEditRelationshipOpen}
        onClose={() => {
          setIsEditRelationshipOpen(false);
          setSelectedGuardian(null);
        }}
        guardian={selectedGuardian}
        onSave={handleEditRelationship}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
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
