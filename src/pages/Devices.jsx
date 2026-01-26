import { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import Toast from "../ui/components/Toast";
import Modal from "../ui/components/Modal";
import VipProfileModal from "@/ui/components/VipProfileModal";
import ScannerCamera from "@/ui/components/Scanner";
import { motion } from "framer-motion";

import {
  assignVipToDevice,
  deleteVIP,
  unpairDevice,
  updateDeviceName,
  updateVIP,
  uploadVIPImage
} from "@/api/backendService";
import { resolveProfileImageSrc } from "@/utils/ResolveImage";
import Button from "@/ui/components/Button";
import {
  useDevicesStore,
  useGuardiansStore,
  useUserStore
} from "@/stores/useStore";
import ManageGuardiansModal from "@/ui/components/ManageGuardians";

const Devices = () => {
  const { devices, fetchDevices, upsertDevice, removeDevice, hasFetchedOnce } =
    useDevicesStore();
  const { fetchGuardiansAndInvites, currentGuardianRole } = useGuardiansStore();
  const { user } = useUserStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nicknameSubmitting, setNicknameSubmitting] = useState(false);
  const [resetNicknameSubmitting, setResetNicknameSubmitting] = useState(false);

  const [toast, setToast] = useState({ show: false, type: "", message: "" });
  const [showScanner, setShowScanner] = useState(false);
  const [viewMode, setViewMode] = useState("tiles");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 764);

  const [vipModal, setVipModal] = useState({
    show: false,
    mode: "view", // 'view', 'create', or 'edit'
    device: null,
    vipData: null
  });

  const [editDeviceModal, setEditDeviceModal] = useState({
    show: false,
    deviceId: null,
    deviceName: ""
  });

  const [unpairConfirm, setUnpairConfirm] = useState({
    show: false,
    deviceId: null
  });

  const [deleteVIPConfirm, setDeleteVIPConfirm] = useState({
    show: false,
    deviceId: null
  });

  const [manageGuardiansModal, setManageGuardiansModal] = useState({
    show: false,
    deviceId: null,
    vipName: "",
    vipId: null
  });

  const currentRole = currentGuardianRole(user.guardianId);

  const canManageVIP = currentRole === "primary" || currentRole === "secondary";

  useEffect(() => {
    fetchDevices();
    fetchGuardiansAndInvites();

    const interval = setInterval(() => {
      fetchDevices();
      fetchGuardiansAndInvites();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    window.addEventListener("resize", handleResize);

    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setViewMode("tiles");
    }
  }, [isMobile]);

  useEffect(() => {
    if (showScanner) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [showScanner]);

  const handleEditDeviceName = async (deviceId, newName, actionType) => {
    const setSubmitting =
      actionType === "save"
        ? setNicknameSubmitting
        : setResetNicknameSubmitting;
    try {
      setSubmitting(true);
      const payload =
        newName !== null ? { device_name: newName } : { device_name: null };

      const response = await updateDeviceName(deviceId, payload);

      if (!response.success) {
        throw new Error(response.message || "Failed to update cane nickname");
      }

      upsertDevice({
        deviceId,
        deviceName: newName
      });

      setEditDeviceModal({
        show: false,
        deviceId: null,
        deviceName: ""
      });

      setToast({
        show: true,
        type: "success",
        message: "Cane nickname updated"
      });
    } catch (error) {
      setToast({
        show: true,
        type: "error",
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to update cane nickname"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnpairDevice = async (deviceId) => {
    try {
      setIsSubmitting(true);
      const response = await unpairDevice(deviceId);

      if (!response.success) {
        throw new Error(response.message || "Failed to unpair cane");
      }

      removeDevice(deviceId);
      setUnpairConfirm({ show: false, deviceId: null });
      setToast({
        show: true,
        type: "success",
        message: "Cane unpaired and removed from your account"
      });
    } catch (error) {
      setToast({
        show: true,
        type: "error",
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to unpair cane"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ======== VIP HANDLERS ========
  const handleViewVIP = (device) => {
    const { vip } = device;
    if (!device.vip) {
      return;
    }

    const vipData = {
      vipId: vip.vipId,
      firstName: vip.firstName,
      middleName: vip.middleName || "",
      lastName: vip.lastName,
      vipImageUrl: vip.vipImageUrl || "",
      relationship: device.relationship || "",
      province: vip.province,
      city: vip.city,
      barangay: vip.barangay,
      streetAddress: vip.streetAddress || "",
      createdAt: vip.createdAt,
      updatedAt: vip.updatedAt
    };

    setVipModal({
      show: true,
      mode: "view",
      device,
      vipData
    });
  };

  const handleManageGuardians = (device) => {
    setManageGuardiansModal({
      show: true,
      deviceId: device.deviceId,
      vipName: device.vip
        ? `${device.vip.firstName} ${device.vip.lastName}`
        : "No VIP assigned",
      vipId: device.vip ? device.vip.vipId : null
    });
  };

  const handleVipModalAction = (device) => {
    if (!device.vip) {
      setVipModal({
        show: true,
        mode: "create",
        device,
        vipData: null
      });
      return;
    }

    setVipModal({
      show: true,
      mode: "edit",
      device,
      vipData: {
        vipId: device.vip.vipId,
        firstName: device.vip.firstName,
        middleName: device.vip.middleName || "",
        lastName: device.vip.lastName,
        relationship: device.relationship || "",
        vipImageUrl: device.vip.vipImageUrl || "",
        province: device.vip.province,
        city: device.vip.city,
        barangay: device.vip.barangay,
        streetAddress: device.vip.streetAddress || ""
      }
    });
  };

  const handleCreateVIP = async (formData, imageFile) => {
    try {
      setIsSubmitting(true);
      const response = await assignVipToDevice(
        vipModal.device.deviceId,
        formData
      );

      const newVip = response.data.vip;

      let uploadedImageUrl;

      if (imageFile) {
        try {
          const imageResponse = await uploadVIPImage(newVip.vipId, imageFile);

          if (imageResponse.success) {
            uploadedImageUrl = imageResponse.data.relativePath;

            // setToast({
            //   show: true,
            //   message: "Profile image uploaded successfully",
            //   type: "success"
            // });
          }
        } catch (imageError) {
          console.error("Failed to upload image:", imageError);
          // setToast({
          //   show: true,
          //   message:
          //     "Profile saved, but image upload failed. Please try uploading the image again.",
          //   type: "warning"
          // });
        }
      }

      upsertDevice({
        deviceId: vipModal.device.deviceId,
        vip: { ...newVip, vipImageUrl: uploadedImageUrl }
      });

      setVipModal({ show: false, mode: "view", device: null, vipData: null });

      setToast({
        show: true,
        type: "success",
        message: "VIP profile created for cane"
      });
      return true;
    } catch (error) {
      setToast({
        show: true,
        type: "error",
        message: error.response?.data?.message || error.message
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateVIP = async (formData, imageFile) => {
    try {
      setIsSubmitting(true);
      let uploadedImageUrl;

      if (imageFile) {
        try {
          const imageResponse = await uploadVIPImage(
            vipModal.vipData.vipId,
            imageFile
          );

          if (imageResponse.success) {
            uploadedImageUrl = imageResponse.data.relativePath;
          }
        } catch (imageError) {
          console.error("Failed to upload image:", imageError);
          // setToast({
          //   show: true,
          //   message:
          //     "Profile saved, but image upload failed. Please try uploading the image again.",
          //   type: "warning"
          // });
        }
      }

      const response = await updateVIP(vipModal.device.deviceId, {
        ...formData,
        vip_image_url: uploadedImageUrl
      });

      const newVip = response.data.vip;

      upsertDevice({
        deviceId: vipModal.device.deviceId,
        vip: newVip
      });

      setVipModal({ show: false, mode: "view", device: null, vipData: null });

      setToast({
        show: true,
        type: "success",
        message: "VIP profile updated for cane"
      });
      return true;
    } catch (error) {
      setToast({
        show: true,
        type: "error",
        message: error.response?.data?.message || error.message
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveVIP = async (deviceId) => {
    try {
      setIsSubmitting(true);

      const response = await deleteVIP(deviceId);
      if (!response.success) {
        throw new Error(response.message || "Failed to remove VIP from cane");
      }

      upsertDevice({
        deviceId,
        vip: null
      });

      setDeleteVIPConfirm({ show: false, deviceId: null });
      setToast({
        show: true,
        type: "success",
        message: "VIP profile removed from cane"
      });
    } catch (error) {
      setToast({
        show: true,
        type: "error",
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to remove VIP"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="bg-white md:bg-[#f9fafb] rounded-t-[32px] md:rounded-none min-h-[calc(100vh-var(--header-height)-var(--mobile-nav-height))] md:min-h-[calc(100vh-var(--header-height))] md:max-h-[calc(100vh-var(--header-height))] overflow-y-visible md:overflow-y-auto p-6 pb-[calc(var(--mobile-nav-height)+1.5rem)] md:pb-6">
      <div className="mx-auto w-full space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 font-poppins">
              Manage Devices
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              {devices.length} cane{devices.length !== 1 ? "s" : ""} •{" "}
              {devices.filter((d) => d.isPaired).length} active
            </p>
          </div>
          <div className="flex flex-col gap-3 w-full">
            <div className="flex items-center gap-3 w-full justify-end">
              <Button
                onClick={() => setShowScanner(true)}
                className="w-full sm:w-auto text-white font-bold py-3 px-6 rounded-lg transition-all hover:shadow-lg flex items-center gap-2 justify-center"
              >
                <Icon icon="ph:plus-bold" className="w-5 h-5" />
                Add Cane
              </Button>
            </div>

            {!isMobile && (
              <div className="flex justify-end items-center rounded-lg p-1">
                <button
                  onClick={() => setViewMode("tiles")}
                  className={`px-3 py-1.5 rounded-md flex items-center gap-2 transition-colors cursor-pointer ${
                    viewMode === "tiles"
                      ? "bg-white shadow-sm text-blue-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Icon icon="ph:squares-four-bold" className="w-4 h-4" />
                  <span className="text-sm font-medium hidden sm:inline">
                    Tiles
                  </span>
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-3 py-1.5 rounded-md flex items-center gap-2 transition-colors cursor-pointer ${
                    viewMode === "list"
                      ? "bg-white shadow-sm text-blue-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Icon icon="ph:list-bullets-bold" className="w-4 h-4" />
                  <span className="text-sm font-medium hidden sm:inline">
                    List
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* UNPAIR CONFIRMATION MODAL */}
        <Modal
          isOpen={unpairConfirm.show}
          closeTimer={null}
          onClose={() => setUnpairConfirm({ show: false, deviceId: null })}
          title="Unpair Cane?"
          modalType="error"
          message="This will unpair and remove the cane from your account."
          handleCancel={() => setUnpairConfirm({ show: false, deviceId: null })}
          handleConfirm={() => handleUnpairDevice(unpairConfirm.deviceId)}
          isSubmitting={isSubmitting}
          confirmText={isSubmitting ? "Unpairing..." : "Unpair"}
        />

        <Modal
          isOpen={deleteVIPConfirm.show}
          closeTimer={null}
          onClose={() => setDeleteVIPConfirm({ show: false, deviceId: null })}
          title="Remove VIP Profile?"
          modalType="error"
          message="This will remove the VIP profile assigned to this cane."
          handleCancel={() =>
            setDeleteVIPConfirm({ show: false, deviceId: null })
          }
          handleConfirm={() => handleRemoveVIP(deleteVIPConfirm.deviceId)}
          isSubmitting={isSubmitting}
          confirmText={isSubmitting ? "Removing..." : "Remove"}
        />

        {/* EDIT CANE NAME MODAL */}
        <Modal
          isOpen={editDeviceModal.show}
          onClose={() =>
            setEditDeviceModal({
              show: false,
              deviceId: null,
              deviceName: ""
            })
          }
          closeTimer={null}
          title="Edit Cane Nickname"
          modalType="info"
          footer={null}
          isSubmitting={nicknameSubmitting || resetNicknameSubmitting}
        >
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              handleEditDeviceName(
                editDeviceModal.deviceId,
                editDeviceModal.deviceName,
                "save"
              );
            }}
          >
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Cane Nickname *
              </label>
              <input
                type="text"
                value={
                  resetNicknameSubmitting ? "" : editDeviceModal.deviceName
                }
                onChange={(e) =>
                  setEditDeviceModal((prev) => ({
                    ...prev,
                    deviceName: e.target.value
                  }))
                }
                placeholder="Enter new cane nickname"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                autoFocus
              />
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  handleEditDeviceName(editDeviceModal.deviceId, null, "reset");
                }}
                type="button"
                disabled={nicknameSubmitting || resetNicknameSubmitting}
                className={`flex justify-center items-center gap-2 flex-1 px-4 py-2.5 border  font-medium rounded-lg  transition-all ${
                  resetNicknameSubmitting || nicknameSubmitting
                    ? "border-gray-200 text-gray-400 cursor-not-allowed"
                    : "border-gray-300 text-gray-700 hover:bg-gray-100 cursor-pointer"
                }`}
              >
                {resetNicknameSubmitting && (
                  <Icon
                    icon="ph:circle-notch-bold"
                    className="w-5 h-5 animate-spin"
                  />
                )}
                {resetNicknameSubmitting ? "Resetting..." : "Reset to Default"}
              </button>
              <button
                type="submit"
                disabled={
                  resetNicknameSubmitting ||
                  nicknameSubmitting ||
                  (editDeviceModal.deviceName || "").trim() === ""
                }
                className={`flex justify-center items-center gap-2 flex-1 px-4 py-2.5 bg-[#11285A] hover:bg-[#0d1b3d] text-white font-semibold rounded-lg  transition-all hover:shadow-lg ${
                  resetNicknameSubmitting ||
                  nicknameSubmitting ||
                  (editDeviceModal.deviceName || "").trim() === ""
                    ? "cursor-not-allowed opacity-70"
                    : "cursor-pointer"
                }`}
              >
                {nicknameSubmitting && (
                  <Icon
                    icon="ph:circle-notch-bold"
                    className="w-5 h-5 animate-spin"
                  />
                )}
                {nicknameSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </Modal>

        {/* VIP PROFILE MODAL */}
        <VipProfileModal
          isOpen={vipModal.show}
          onClose={() =>
            setVipModal({
              show: false,
              mode: "view",
              device: null,
              vipData: null
            })
          }
          onSubmit={
            vipModal.mode === "create" ? handleCreateVIP : handleUpdateVIP
          }
          initialData={vipModal.vipData}
          isSubmitting={isSubmitting}
          isUploadingImage={false}
          title={
            vipModal.mode === "view"
              ? "Cane VIP Profile"
              : vipModal.mode === "create"
                ? "Add VIP to Cane"
                : "Edit Cane VIP"
          }
          submitText={
            vipModal.mode === "create"
              ? isSubmitting
                ? "Creating..."
                : "Create"
              : isSubmitting
                ? "Updating..."
                : "Update VIP"
          }
          mode={vipModal.mode}
        />

        <ManageGuardiansModal
          isOpen={manageGuardiansModal.show}
          onClose={() =>
            setManageGuardiansModal({
              show: false,
              deviceId: null,
              vipName: "",
              deviceName: ""
            })
          }
          deviceId={manageGuardiansModal.deviceId}
          vipName={manageGuardiansModal.vipName}
          vipId={manageGuardiansModal.vipId}
        />

        <Modal
          isOpen={showScanner}
          onClose={() => setShowScanner(false)}
          title="Scan iCane Device"
          closeTimer={null}
          // handleConfirm={handleConfirmUnpair}
          footer={<></>}
        >
          <div className="flex flex-col gap-7 sm:justify-center items-center pt-[30px] sm:pt-5 pb-8 sm:pb-5 px-6">
            <ScannerCamera
              onSuccess={() => {
                setShowScanner(false);
                setToast({
                  show: true,
                  type: "success",
                  message: "Cane successfully paired to your account"
                });
              }}
              response={(res) => {
                fetchGuardiansAndInvites();
                upsertDevice(res.data);
              }}
            />
          </div>
        </Modal>

        {!devices.length && !hasFetchedOnce ? (
          <DevicesLoading />
        ) : devices.length > 0 ? (
          <>
            {viewMode === "list" ? (
              <DevicesListView
                devices={devices}
                onEditVIP={handleVipModalAction}
                onViewVIP={handleViewVIP}
                onRemoveVIP={(deviceId) =>
                  setDeleteVIPConfirm({ show: true, deviceId })
                }
                onUnpairDevice={(deviceId) =>
                  setUnpairConfirm({ show: true, deviceId })
                }
                onEditDevice={(device) =>
                  setEditDeviceModal({
                    show: true,
                    deviceId: device.deviceId,
                    deviceName: device.deviceName
                  })
                }
                onManageGuardians={handleManageGuardians}
              />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                {devices.map((device) => (
                  <DeviceCard
                    key={device.deviceId}
                    device={device}
                    onEditVIP={handleVipModalAction}
                    onViewVIP={() => handleViewVIP(device)}
                    onRemoveVIP={() =>
                      setDeleteVIPConfirm({
                        show: true,
                        deviceId: device.deviceId
                      })
                    }
                    onUnpairDevice={() =>
                      setUnpairConfirm({
                        show: true,
                        deviceId: device.deviceId
                      })
                    }
                    onEditDevice={() =>
                      setEditDeviceModal({
                        show: true,
                        deviceId: device.deviceId,
                        deviceName: device.name
                      })
                    }
                    onManageGuardians={() => {
                      handleManageGuardians(device);
                    }}
                    canManageGuardian={canManageVIP}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <Icon
              icon="ph:walking-stick"
              className="w-16 h-16 text-gray-300 mx-auto mb-4"
            />
            <p className="text-gray-500 text-lg">No canes added yet.</p>
            <p className="text-gray-400 text-sm mt-2">
              Click 'Add Cane' to get started
            </p>
          </div>
        )}
      </div>

      {toast.show && (
        <Toast
          type={toast.type}
          message={toast.message}
          position="bottom-right"
          onClose={() => setToast({ show: false, type: "", message: "" })}
        />
      )}
    </main>
  );
};

const DeviceCard = ({
  device,
  onEditVIP,
  onViewVIP,
  onRemoveVIP,
  onUnpairDevice,
  onEditDevice,
  onManageGuardians,
  canManageGuardian
}) => {
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const actionsMenuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        actionsMenuRef.current &&
        !actionsMenuRef.current.contains(event.target)
      ) {
        setShowActionsMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <motion.div
      onClick={() => onViewVIP(device)}
      whileHover={{ y: -6, scale: 1.015 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
    >
      {/* Card Header with Status */}
      <div className="p-4 sm:p-5 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative">
              <div className="p-2.5 bg-white rounded-lg shadow-sm">
                <Icon
                  icon="ph:walking-stick"
                  className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600"
                />
              </div>
              <div
                className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                  device.status === "online" ? "bg-green-500" : "bg-red-400"
                }`}
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-900 font-poppins text-base sm:text-lg truncate">
                  {device?.deviceName
                    ? device.deviceName
                    : device.deviceSerialNumber || "Unnamed Cane"}
                </h3>
                <button
                  onClick={() => onEditDevice(device)}
                  className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                  title="Edit cane nickname"
                >
                  <Icon
                    icon="ph:pencil-simple-bold"
                    className="w-3 h-3 sm:w-4 sm:h-4"
                  />
                </button>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 truncate">
                {!device.lastActive
                  ? "Active Now"
                  : `Last active: ${device.lastActive}`}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div
            className={
              "px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 "
            }
          >
            Paired
          </div>
        </div>
      </div>

      {/* VIP Profile Section */}
      <div className="p-4 sm:p-5">
        <div className="mb-4">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2 ">
              <Icon
                icon="ph:user-circle-bold"
                className="w-4 h-4 text-blue-600"
              />
              Assigned VIP
            </h4>
            <div className="flex flex-wrap gap-2">
              {device?.vip ? (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation;
                      onViewVIP(device);
                    }}
                    className="px-3 py-1.5 text-xs sm:text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Icon icon="ph:eye-bold" className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">View</span>
                  </button>
                  {canManageGuardian && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditVIP(device);
                        }}
                        className="px-3 py-1.5 text-xs sm:text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Icon
                          icon="ph:pencil-simple-bold"
                          className="w-3.5 h-3.5"
                        />
                        <span className="hidden sm:inline">Edit</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveVIP(device.deviceId);
                        }}
                        className="px-3 py-1.5 text-xs sm:text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Icon icon="ph:trash-bold" className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Remove</span>
                      </button>
                    </>
                  )}
                </>
              ) : (
                <button
                  onClick={() => onEditVIP(device)}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#11285A] hover:bg-[#0d1b3d] rounded-lg cursor-pointer transition-all hover:shadow-md flex items-center gap-2"
                >
                  <Icon icon="ph:user-plus-bold" className="w-4 h-4" />
                  <span>Assign VIP</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* VIP Profile Image */}
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 border-white shadow-lg">
                  {device.vip ? (
                    <img
                      loading="lazy"
                      src={resolveProfileImageSrc(device.vip.vipImageUrl)}
                      alt={device.vipName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                      <span className="text-white font-bold text-xl">
                        {device.vipName
                          ? device.vipName.charAt(0).toUpperCase()
                          : "VIP"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* VIP Info */}
            <div className="flex-1 min-w-0">
              <h5 className="font-semibold text-gray-900 text-base sm:text-lg truncate">
                {device?.vip
                  ? `${device.vip.firstName} ${device.vip.lastName}`
                  : "No VIP Assigned"}
              </h5>
              <p className="text-sm text-gray-500 mt-1">
                VIP ID: {device?.vip ? device.vip.vipId : "No Vip Available"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="relative px-4 sm:px-5 py-3 bg-gray-50 border-t border-gray-100">
        <div className="flex justify-between items-center">
          {/* Manage button with Dropdown */}
          <div className="relative" ref={actionsMenuRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowActionsMenu(!showActionsMenu);
              }}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Icon icon="ph:gear-six-bold" className="w-4 h-4" />
              <span className="hidden sm:inline">Manage</span>
            </button>

            {/* Dropdown Menu - Positioned absolutely and stays on top */}
            {showActionsMenu && (
              <div className="absolute bottom-full left-0 mb-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                <div className="py-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditDevice(device);
                      setShowActionsMenu(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                  >
                    <Icon icon="ph:pencil-simple-bold" className="w-4 h-4" />
                    Edit Nickname
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onManageGuardians();
                      setShowActionsMenu(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-t border-gray-100 cursor-pointer"
                  >
                    <Icon icon="ph:users-bold" className="w-4 h-4" />
                    Manage Guardians
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUnpairDevice(device.deviceId);
                      setShowActionsMenu(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-orange-600 hover:bg-orange-50 flex items-center gap-2 border-t border-gray-100 cursor-pointer"
                  >
                    <Icon icon="ph:link-break-bold" className="w-4 h-4" />
                    Unpair
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const DevicesListView = ({
  devices,
  onEditVIP,
  onViewVIP,
  onRemoveVIP,
  onUnpairDevice,
  onEditDevice,
  onManageGuardians
}) => {
  const [openMenuId, setOpenMenuId] = useState(null);

  return (
    <div className="space-y-3">
      {devices.map((device) => (
        <motion.div
          key={device.deviceId}
          whileHover={{ y: -6, scale: 1.015 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="bg-white rounded-2xl border border-gray-100 hover:border-blue-200 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <div className="p-4 sm:p-5">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
              {/* Left Info Section */}
              <div className="flex items-start gap-4 flex-1 min-w-0">
                {/* Device Icon with Status - Consistent with DeviceCard */}
                <div className="relative flex-shrink-0">
                  <div className="p-2.5 bg-white rounded-lg shadow-sm">
                    <Icon
                      icon="ph:walking-stick"
                      className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600"
                    />
                  </div>
                  <div
                    className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                      device.status === "online" ? "bg-green-500" : "bg-red-400"
                    }`}
                    title={device.status === "online" ? "Online" : "Offline"}
                  />
                </div>

                {/* Device Details */}
                <div className="flex-1 min-w-0">
                  {/* Device Name and Status */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900 text-base sm:text-lg truncate">
                        {device.deviceName ||
                          device.deviceSerialNumber ||
                          "Unnamed Cane"}
                      </h3>
                      <button
                        onClick={() => onEditDevice(device)}
                        className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                        title="Edit cane nickname"
                      >
                        <Icon
                          icon="ph:pencil-simple-bold"
                          className="w-3 h-3 sm:w-4 sm:h-4"
                        />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full whitespace-nowrap">
                        Paired
                      </span>
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                          device.status === "online"
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {device.status === "online" ? "Online" : "Offline"}
                      </span>
                    </div>
                  </div>

                  {/* Device Info Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1.5">
                      <Icon
                        icon="ph:clock-bold"
                        className="w-3.5 h-3.5 text-gray-400 flex-shrink-0"
                      />
                      <span className="truncate">
                        {!device.lastActive
                          ? "Active Now"
                          : `Last active: ${device.lastActive}`}
                      </span>
                    </div>
                    <div className="hidden sm:block text-gray-300">•</div>
                    <div className="flex items-center gap-1.5">
                      <Icon
                        icon="ph:device-mobile-bold"
                        className="w-3.5 h-3.5 text-gray-400 flex-shrink-0"
                      />
                      <span className="font-mono truncate">
                        {device.deviceSerialNumber || "—"}
                      </span>
                    </div>
                  </div>

                  {/* VIP Info Section */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {/* VIP Avatar */}
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-sm">
                            {device.vip ? (
                              <img
                                loading="lazy"
                                src={resolveProfileImageSrc(
                                  device.vip.vipImageUrl
                                )}
                                alt={device.vipName}
                                className="w-full h-full object-cover rounded-full"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center rounded-full px-5 py-5">
                                <span
                                  className={`text-white font-bold text-base sm:text-lg`}
                                >
                                  {device.vipName
                                    ? device.vipName.charAt(0).toUpperCase()
                                    : "VIP"}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* VIP Info */}
                        <div className="min-w-0">
                          <h4 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                            {device.vip
                              ? `${device.vip.firstName} ${device.vip.lastName}`
                              : "No VIP Assigned"}
                          </h4>
                          <p className="text-xs text-gray-500 mt-0.5">
                            VIP ID: {device.vip ? device.vip.vipId : "—"}
                          </p>
                        </div>
                      </div>

                      {/* VIP Action Buttons */}
                      <div className="flex flex-wrap gap-2">
                        {device.vip ? (
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => onViewVIP(device)}
                              className="px-3 py-1.5 text-xs sm:text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                              title="View VIP"
                            >
                              <Icon
                                icon="ph:eye-bold"
                                className="w-3.5 h-3.5"
                              />
                              <span className="hidden sm:inline">View</span>
                            </button>
                            <button
                              onClick={() => onEditVIP(device)}
                              className="px-3 py-1.5 text-xs sm:text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                              title="Edit VIP"
                            >
                              <Icon
                                icon="ph:pencil-simple-bold"
                                className="w-3.5 h-3.5"
                              />
                              <span className="hidden sm:inline">Edit</span>
                            </button>
                            <button
                              onClick={() => onRemoveVIP(device.deviceId)}
                              className="px-3 py-1.5 text-xs sm:text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                              title="Remove VIP"
                            >
                              <Icon
                                icon="ph:trash-bold"
                                className="w-3.5 h-3.5"
                              />
                              <span className="hidden sm:inline">Remove</span>
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => onEditVIP(device)}
                            className="px-4 py-2 text-sm font-medium text-white bg-[#11285A] hover:bg-[#0d1b3d] rounded-lg cursor-pointer transition-all hover:shadow-md flex items-center gap-2"
                          >
                            <Icon
                              icon="ph:user-plus-bold"
                              className="w-4 h-4"
                            />
                            <span>Assign VIP</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Actions Section - Desktop Only */}
              <div className="hidden lg:flex flex-col gap-2 items-end">
                {/* Manage Dropdown */}
                <div className="relative">
                  <button
                    onClick={() =>
                      setOpenMenuId(
                        openMenuId === device.deviceId ? null : device.deviceId
                      )
                    }
                    className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Icon icon="ph:gear-six-bold" className="w-4 h-4" />
                    <span>Manage</span>
                  </button>

                  {openMenuId === device.deviceId && (
                    <>
                      {/* Backdrop */}
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setOpenMenuId(null)}
                      />

                      {/* Dropdown Menu */}
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                        <div className="py-1">
                          <button
                            onClick={() => {
                              onEditDevice(device);
                              setOpenMenuId(null);
                            }}
                            className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                          >
                            <Icon
                              icon="ph:pencil-simple-bold"
                              className="w-4 h-4"
                            />
                            Edit Nickname
                          </button>

                          <button
                            onClick={() => {
                              onManageGuardians(device);
                              setOpenMenuId(null);
                            }}
                            className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-t border-gray-100 cursor-pointer"
                          >
                            <Icon icon="ph:users-bold" className="w-4 h-4" />
                            Manage Guardians
                          </button>

                          <button
                            onClick={() => {
                              onUnpairDevice(device.deviceId);
                              setOpenMenuId(null);
                            }}
                            className="w-full px-4 py-2.5 text-left text-sm text-orange-600 hover:bg-orange-50 flex items-center gap-2 border-t border-gray-100 cursor-pointer"
                          >
                            <Icon
                              icon="ph:link-break-bold"
                              className="w-4 h-4"
                            />
                            Unpair
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Device Creation Date */}
                {device.createdAt && (
                  <div className="text-xs text-gray-500 text-right">
                    <div className="flex items-center gap-1.5">
                      <Icon icon="ph:calendar-blank-bold" className="w-3 h-3" />
                      <span>
                        Added: {new Date(device.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Actions Section - Only shown on mobile */}
              <div className="lg:hidden pt-3 border-t border-gray-200">
                <div className="flex flex-col gap-3">
                  {/* Mobile Manage Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() =>
                        setOpenMenuId(
                          openMenuId === device.deviceId
                            ? null
                            : device.deviceId
                        )
                      }
                      className="w-full px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Icon icon="ph:gear-six-bold" className="w-4 h-4" />
                      Manage Cane Options
                    </button>

                    {openMenuId === device.deviceId && (
                      <div className="mt-2 bg-white border rounded-lg shadow-lg">
                        <div className="py-1">
                          <button
                            onClick={() => {
                              onEditDevice(device);
                              setOpenMenuId(null);
                            }}
                            className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Icon
                              icon="ph:pencil-simple-bold"
                              className="w-4 h-4"
                            />
                            Edit Nickname
                          </button>

                          <button
                            onClick={() => {
                              onManageGuardians(device);
                              setOpenMenuId(null);
                            }}
                            className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-t border-gray-100"
                          >
                            <Icon icon="ph:users-bold" className="w-4 h-4" />
                            Manage Guardians
                          </button>

                          <button
                            onClick={() => {
                              onUnpairDevice(device.deviceId);
                              setOpenMenuId(null);
                            }}
                            className="w-full px-4 py-2.5 text-left text-sm text-orange-600 hover:bg-orange-50 flex items-center gap-2 border-t border-gray-100"
                          >
                            <Icon
                              icon="ph:link-break-bold"
                              className="w-4 h-4"
                            />
                            Unpair Device
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Mobile Creation Date */}
                  {device.createdAt && (
                    <div className="text-xs text-gray-500 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Icon
                          icon="ph:calendar-blank-bold"
                          className="w-3 h-3"
                        />
                        <span>
                          Added:{" "}
                          {new Date(device.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

const DevicesLoading = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
    {[...Array(6)].map((_, i) => (
      <div
        key={i}
        className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-gray-200 rounded-lg" />
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
        </div>

        <div className="h-24 bg-gray-200 rounded-xl mb-4" />

        <div className="flex justify-between">
          <div className="h-8 w-24 bg-gray-200 rounded-lg" />
          <div className="h-8 w-16 bg-gray-200 rounded-lg" />
        </div>
      </div>
    ))}
  </div>
);

export default Devices;
