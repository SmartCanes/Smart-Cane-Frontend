import { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import Toast from "../ui/components/Toast";
import Modal from "../ui/components/Modal";
import VipProfileModal from "@/ui/components/VipProfileModal";
import ScannerCamera from "@/ui/components/Scanner";
// import { useUserStore } from "@/stores/useStore";

import {
  assignVipToDevice,
  deleteVIP,
  getDevices,
  unpairDevice,
  updateDeviceName,
  updateVIP,
  uploadVIPImage
} from "@/api/backendService";
import { resolveProfileImageSrc } from "@/utils/ResolveImage";

// ========== DEVICES COMPONENT ==========
const Devices = () => {
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await getDevices();

        if (!response.success) {
          throw new Error(response.message || "Failed to fetch devices");
        }

        setDevices(response.data.devices);
      } catch (error) {
        const errorMessage =
          error.response?.data?.message || error.message || "Login failed";
        console.error("Error fetching devices:", errorMessage);
      }
    };

    fetchDevices();
  }, []);

  const [toast, setToast] = useState({ show: false, type: "", message: "" });
  const [showScanner, setShowScanner] = useState(false);

  const [newDeviceName, setNewDeviceName] = useState("");

  const [vipModal, setVipModal] = useState({
    show: false,
    mode: "view", // 'view', 'create', or 'edit'
    device: null,
    vipData: null
  });

  const [pairDeviceModal, setPairDeviceModal] = useState({
    show: false,
    deviceId: null
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

  const handleEditDeviceName = async (deviceId, newName) => {
    try {
      const payload =
        newName !== null ? { device_name: newName } : { device_name: null };

      const response = await updateDeviceName(deviceId, payload);

      if (!response.success) {
        throw new Error(response.message || "Failed to update cane nickname");
      }

      setDevices((prev) =>
        prev.map((d) =>
          d.deviceId === deviceId ? { ...d, deviceName: newName } : d
        )
      );

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
    }
  };

  const handleUnpairDevice = async (deviceId) => {
    try {
      const response = await unpairDevice(deviceId);

      if (!response.success) {
        throw new Error(response.message || "Failed to unpair cane");
      }

      setDevices((prev) => prev.filter((d) => d.deviceId !== deviceId));
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
    }
  };

  // ======== VIP HANDLERS ========
  const handleViewVIP = (device) => {
    const { vip } = device;
    if (!device.vip) {
      setToast({
        show: true,
        type: "info",
        message: "No VIP assigned to this cane"
      });
      return;
    }

    const vipData = {
      vipId: vip.vipId,
      firstName: vip.firstName,
      middleName: vip.middleName || "",
      lastName: vip.lastName,
      vipImageUrl: vip.vipImageUrl || "",
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

            setToast({
              show: true,
              message: "Profile image uploaded successfully",
              type: "success"
            });
          }
        } catch (imageError) {
          console.error("Failed to upload image:", imageError);
          setToast({
            show: true,
            message:
              "Profile saved, but image upload failed. Please try uploading the image again.",
            type: "warning"
          });
        }
      }

      setDevices((prev) =>
        prev.map((d) =>
          d.deviceId === vipModal.device.deviceId
            ? { ...d, vip: { ...newVip, vipImageUrl: uploadedImageUrl } }
            : d
        )
      );

      setVipModal({ show: false, mode: "view", device: null, vipData: null });

      setToast({
        show: true,
        type: "success",
        message: "VIP profile created for cane"
      });
    } catch (error) {
      setToast({
        show: true,
        type: "error",
        message: error.response?.data?.message || error.message
      });
    }
  };

  const handleUpdateVIP = async (formData, imageFile) => {
    try {
      let uploadedImageUrl;

      if (imageFile) {
        try {
          const imageResponse = await uploadVIPImage(
            vipModal.vipData.vipId,
            imageFile
          );

          if (imageResponse.success) {
            uploadedImageUrl = imageResponse.data.relativePath;

            setToast({
              show: true,
              message: "Profile image uploaded successfully",
              type: "success"
            });
          }
        } catch (imageError) {
          console.error("Failed to upload image:", imageError);
          setToast({
            show: true,
            message:
              "Profile saved, but image upload failed. Please try uploading the image again.",
            type: "warning"
          });
        }
      }

      const response = await updateVIP(vipModal.device.deviceId, {
        ...formData,
        vip_image_url: uploadedImageUrl
      });

      const newVip = response.data.vip;

      setDevices((prev) =>
        prev.map((d) =>
          d.deviceId === vipModal.device.deviceId ? { ...d, vip: newVip } : d
        )
      );

      setVipModal({ show: false, mode: "view", device: null, vipData: null });

      setToast({
        show: true,
        type: "success",
        message: "VIP profile updated for cane"
      });
    } catch (error) {
      setToast({
        show: true,
        type: "error",
        message: error.response?.data?.message || error.message
      });
    }
  };

  const handleRemoveVIP = async (deviceId) => {
    try {
      setDeleteVIPConfirm({ show: false, deviceId: null });

      const response = await deleteVIP(deviceId);
      if (!response.success) {
        throw new Error(response.message || "Failed to remove VIP from cane");
      }

      setDevices((prev) =>
        prev.map((d) => (d.deviceId === deviceId ? { ...d, vip: null } : d))
      );

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
          <button
            onClick={() => setShowScanner(true)}
            className="w-full sm:w-auto bg-gradient-to-r bg-[#11285A] text-white font-bold py-3 px-6 rounded-lg hover:bg-[#0d1b3d] transition-all hover:shadow-lg flex items-center justify-center gap-2"
          >
            <Icon icon="ph:plus-bold" className="w-5 h-5" />
            Add Cane
          </button>
        </div>

        {/* TOAST NOTIFICATIONS */}
        {toast.show && (
          <Toast
            type={toast.type}
            message={toast.message}
            position="top-right"
            onClose={() => setToast({ show: false, type: "", message: "" })}
          />
        )}

        {/* UNPAIR CONFIRMATION MODAL */}
        <Modal
          isOpen={unpairConfirm.show}
          onClose={() => setUnpairConfirm({ show: false, deviceId: null })}
          title="Unpair Cane?"
          modalType="error"
          message="This will unpair and remove the cane from your account."
          handleCancel={() => setUnpairConfirm({ show: false, deviceId: null })}
          handleConfirm={() => handleUnpairDevice(unpairConfirm.deviceId)}
        />

        <Modal
          isOpen={deleteVIPConfirm.show}
          onClose={() => setDeleteVIPConfirm({ show: false, deviceId: null })}
          title="Remove VIP Profile?"
          modalType="error"
          message="This will remove the VIP profile assigned to this cane."
          handleCancel={() =>
            setDeleteVIPConfirm({ show: false, deviceId: null })
          }
          handleConfirm={() => handleRemoveVIP(deleteVIPConfirm.deviceId)}
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
        >
          <div className="flex flex-col gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Cane Nickname *
              </label>
              <input
                type="text"
                value={editDeviceModal.deviceName}
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
                  handleEditDeviceName(editDeviceModal.deviceId, null);
                }}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all"
              >
                Reset to Default
              </button>
              <button
                onClick={() =>
                  handleEditDeviceName(
                    editDeviceModal.deviceId,
                    editDeviceModal.deviceName
                  )
                }
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all hover:shadow-lg"
              >
                Save Changes
              </button>
            </div>
          </div>
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
          isLoading={false}
          isUploadingImage={false}
          title={
            vipModal.mode === "view"
              ? "Cane VIP Profile"
              : vipModal.mode === "create"
                ? "Add VIP to Cane"
                : "Edit Cane VIP"
          }
          submitText={
            vipModal.mode === "create" ? "Add VIP to Cane" : "Update VIP"
          }
          mode={vipModal.mode}
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
                setDevices((prev) => [...prev, res.data]);
              }}
            />
          </div>
        </Modal>

        {devices.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
            {devices.map((device) => (
              <DeviceCard
                key={device.deviceId}
                device={device}
                onEditVIP={handleVipModalAction}
                onViewVIP={() => handleViewVIP(device)}
                onRemoveVIP={() =>
                  setDeleteVIPConfirm({ show: true, deviceId: device.deviceId })
                }
                onUnpairDevice={() =>
                  setUnpairConfirm({ show: true, deviceId: device.deviceId })
                }
                onEditDevice={() =>
                  setEditDeviceModal({
                    show: true,
                    deviceId: device.deviceId,
                    deviceName: device.name
                  })
                }
              />
            ))}
          </div>
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
    </main>
  );
};

// UPDATED DeviceCard component with fixed dropdown positioning
const DeviceCard = ({
  device,
  onEditVIP,
  onViewVIP,
  onRemoveVIP,
  onUnpairDevice,
  onEditDevice
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
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden">
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
                    onClick={() => onViewVIP(device)}
                    className="px-3 py-1.5 text-xs sm:text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Icon icon="ph:eye-bold" className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">View</span>
                  </button>
                  <button
                    onClick={() => onEditVIP(device)}
                    className="px-3 py-1.5 text-xs sm:text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
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
                  >
                    <Icon icon="ph:trash-bold" className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Remove</span>
                  </button>
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
                {device.relationship
                  ? device.relationship
                  : "No relationship available"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="relative px-4 sm:px-5 py-3 bg-gray-50 border-t border-gray-100">
        <div className="flex justify-between items-center">
          {/* Manage Button with Dropdown */}
          <div className="relative" ref={actionsMenuRef}>
            <button
              onClick={() => setShowActionsMenu(!showActionsMenu)}
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
                    onClick={() => {
                      onEditDevice(device);
                      setShowActionsMenu(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Icon icon="ph:pencil-simple-bold" className="w-4 h-4" />
                    Edit Nickname
                  </button>

                  <button
                    onClick={() => {
                      onUnpairDevice(device.deviceId);
                      setShowActionsMenu(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-orange-600 hover:bg-orange-50 flex items-center gap-2 border-t border-gray-100"
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
    </div>
  );
};

export default Devices;
