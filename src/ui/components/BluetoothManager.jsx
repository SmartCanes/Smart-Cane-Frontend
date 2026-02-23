import { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/ui/components/Button";
import {
  useUserStore,
  useGuardiansStore,
  useBluetoothStore
} from "@/stores/useStore";

// API Service imports (you'll need to create these endpoints)
// import {
//   fetchAvailableBluetoothDevices,
//   pairBluetoothDevice,
//   unpairBluetoothDevice,
//   forgetBluetoothDevice,
//   connectBluetoothDevice,
//   disconnectBluetoothDevice
// } from "@/api/bluetoothService";
import Toast from "./Toast";
import Modal from "./Modal";
import { wsApi } from "@/api/ws-api";

const pairBluetoothDevice = () => {};
const unpairBluetoothDevice = () => {};
const forgetBluetoothDevice = () => {};
const connectBluetoothDevice = () => {};
const disconnectBluetoothDevice = () => {};

const BluetoothManager = () => {
  const { user } = useUserStore();
  const { currentGuardianRole } = useGuardiansStore();
  const { requestScan, devices, handleBluetoothPayload } = useBluetoothStore();

  const [isScanning, setIsScanning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, type: "", message: "" });
  const [viewMode, setViewMode] = useState("all"); // 'all', 'paired', 'available'
  const [searchQuery, setSearchQuery] = useState("");

  const [pairModal, setPairModal] = useState({
    show: false,
    device: null
  });

  const [unpairModal, setUnpairModal] = useState({
    show: false,
    device: null
  });

  const [forgetModal, setForgetModal] = useState({
    show: false,
    device: null
  });

  const [connectionModal, setConnectionModal] = useState({
    show: false,
    device: null,
    action: "connect" // 'connect' or 'disconnect'
  });

  const timeoutRef = useRef(null);
  const currentRole = currentGuardianRole(user?.guardianId);
  const canManageBluetooth =
    currentRole === "primary" || currentRole === "secondary";

  useEffect(() => {
    const listener = (data) => {
      const devices = data?.payload?.devices || data?.devices;
      if (!devices) return;

      handleBluetoothPayload({
        payload: { devices }
      });

      setIsScanning(false);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    wsApi.on("bluetoothDevices", listener);

    return () => {
      wsApi.off("bluetoothDevices", listener);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [handleBluetoothPayload]);

  useEffect(() => {
    scanForDevices();
  }, []);

  const scanForDevices = async () => {
    setIsScanning(true);
    requestScan();

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setIsScanning(false);
    }, 10000);
  };

  // Handle device pairing
  const handlePairDevice = async (device) => {
    // try {
    //   setIsSubmitting(true);
    //   const response = await pairBluetoothDevice(device.deviceId);
    //   if (response.success) {
    //     // Update device status
    //     setAvailableDevices((prev) =>
    //       prev.map((d) =>
    //         d.deviceId === device.deviceId
    //           ? { ...d, isPaired: true, pairedCane: response.data.cane }
    //           : d
    //       )
    //     );
    //     setPairModal({ show: false, device: null });
    //     setToast({
    //       show: true,
    //       type: "success",
    //       message: `Successfully paired with ${device.name || device.deviceId}`
    //     });
    //   }
    // } catch (error) {
    //   setToast({
    //     show: true,
    //     type: "error",
    //     message: error.message || "Failed to pair device"
    //   });
    // } finally {
    //   setIsSubmitting(false);
    // }
  };

  // Handle device unpairing
  const handleUnpairDevice = async (device) => {
    // try {
    //   setIsSubmitting(true);
    //   const response = await unpairBluetoothDevice(device.deviceId);
    //   if (response.success) {
    //     setAvailableDevices((prev) =>
    //       prev.map((d) =>
    //         d.deviceId === device.deviceId
    //           ? { ...d, isPaired: false, pairedCane: null, isConnected: false }
    //           : d
    //       )
    //     );
    //     setUnpairModal({ show: false, device: null });
    //     setToast({
    //       show: true,
    //       type: "success",
    //       message: `Unpaired from ${device.name || device.deviceId}`
    //     });
    //   }
    // } catch (error) {
    //   setToast({
    //     show: true,
    //     type: "error",
    //     message: error.message || "Failed to unpair device"
    //   });
    // } finally {
    //   setIsSubmitting(false);
    // }
  };

  // Handle forgetting a device
  const handleForgetDevice = async (device) => {
    // try {
    //   setIsSubmitting(true);
    //   const response = await forgetBluetoothDevice(device.deviceId);
    //   if (response.success) {
    //     // Remove device from list
    //     setAvailableDevices((prev) =>
    //       prev.filter((d) => d.deviceId !== device.deviceId)
    //     );
    //     setForgetModal({ show: false, device: null });
    //     setToast({
    //       show: true,
    //       type: "success",
    //       message: `Forgot ${device.name || device.deviceId}`
    //     });
    //   }
    // } catch (error) {
    //   setToast({
    //     show: true,
    //     type: "error",
    //     message: error.message || "Failed to forget device"
    //   });
    // } finally {
    //   setIsSubmitting(false);
    // }
  };

  // Handle connection/disconnection
  const handleConnectionToggle = async (device, action) => {
    // try {
    //   setIsSubmitting(true);
    //   const apiCall =
    //     action === "connect"
    //       ? connectBluetoothDevice
    //       : disconnectBluetoothDevice;
    //   const response = await apiCall(device.deviceId);
    //   if (response.success) {
    //     setAvailableDevices((prev) =>
    //       prev.map((d) =>
    //         d.deviceId === device.deviceId
    //           ? { ...d, isConnected: action === "connect" }
    //           : d
    //       )
    //     );
    //     setConnectionModal({ show: false, device: null, action: "connect" });
    //     setToast({
    //       show: true,
    //       type: "success",
    //       message: `${action === "connect" ? "Connected to" : "Disconnected from"} ${device.name || device.deviceId}`
    //     });
    //   }
    // } catch (error) {
    //   setToast({
    //     show: true,
    //     type: "error",
    //     message: error.message || `Failed to ${action} device`
    //   });
    // } finally {
    //   setIsSubmitting(false);
    // }
  };

  // Filter devices based on view mode and search
  const filteredDevices = devices.filter((device) => {
    const matchesSearch =
      device.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.deviceId?.toLowerCase().includes(searchQuery.toLowerCase());

    if (viewMode === "paired") return device.isPaired && matchesSearch;
    if (viewMode === "available") return !device.isPaired && matchesSearch;
    return matchesSearch;
  });

  return (
    <main
      id="app-main"
      className="bg-white md:bg-[#f9fafb] rounded-t-[32px] md:rounded-none min-h-[calc(100vh-var(--header-height)-var(--mobile-nav-height))] md:min-h-[calc(100vh-var(--header-height))] md:max-h-[calc(100vh-var(--header-height))] overflow-y-visible md:overflow-y-auto p-6 pb-[calc(var(--mobile-nav-height)+1.5rem)] md:pb-6"
    >
      <div className="mx-auto w-full space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4 sm:mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
              Bluetooth Management
            </h2>
            {/* <p className="text-sm sm:text-base text-gray-600">
              Manage and monitor Bluetooth devices connected to your iCane
              system
            </p> */}
            <p className="text-gray-500 text-sm mt-1">
              {devices.filter((d) => d.isPaired).length} paired •{" "}
              {devices.filter((d) => d.isConnected).length} connected
            </p>
          </div>

          <div className="flex flex-col gap-3 w-full sm:w-auto">
            <Button
              onClick={scanForDevices}
              disabled={isScanning}
              className="w-full sm:w-auto text-white font-bold py-3 px-6 rounded-lg transition-all hover:shadow-lg flex items-center gap-2 justify-center"
            >
              <Icon
                icon={
                  isScanning
                    ? "ph:circle-notch-bold"
                    : "ph:magnifying-glass-bold"
                }
                className={`w-5 h-5 ${isScanning ? "animate-spin" : ""}`}
              />
              {isScanning ? "Scanning..." : "Scan for Devices"}
            </Button>

            {/* Filter Tabs */}
            <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
              {["all", "paired", "available"].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-all cursor-pointer ${
                    viewMode === mode
                      ? "bg-white shadow-sm text-blue-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Icon
            icon="ph:magnifying-glass-bold"
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by device name or ID..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          />
        </div>

        {/* Devices Grid */}
        {filteredDevices.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
            {filteredDevices.map((device) => (
              <BluetoothDeviceCard
                key={device.mac}
                device={device}
                onPair={() => setPairModal({ show: true, device })}
                onUnpair={() => setUnpairModal({ show: true, device })}
                onForget={() => setForgetModal({ show: true, device })}
                onConnect={() =>
                  setConnectionModal({
                    show: true,
                    device,
                    action: device.isConnected ? "disconnect" : "connect"
                  })
                }
                canManage={canManageBluetooth}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            isScanning={isScanning}
            onScan={scanForDevices}
            viewMode={viewMode}
          />
        )}

        {/* Modals */}
        <PairDeviceModal
          isOpen={pairModal.show}
          device={pairModal.device}
          onClose={() => setPairModal({ show: false, device: null })}
          onConfirm={() => handlePairDevice(pairModal.device)}
          isSubmitting={isSubmitting}
        />

        <UnpairDeviceModal
          isOpen={unpairModal.show}
          device={unpairModal.device}
          onClose={() => setUnpairModal({ show: false, device: null })}
          onConfirm={() => handleUnpairDevice(unpairModal.device)}
          isSubmitting={isSubmitting}
        />

        <ForgetDeviceModal
          isOpen={forgetModal.show}
          device={forgetModal.device}
          onClose={() => setForgetModal({ show: false, device: null })}
          onConfirm={() => handleForgetDevice(forgetModal.device)}
          isSubmitting={isSubmitting}
        />

        <ConnectionModal
          isOpen={connectionModal.show}
          device={connectionModal.device}
          action={connectionModal.action}
          onClose={() =>
            setConnectionModal({ show: false, device: null, action: "connect" })
          }
          onConfirm={() =>
            handleConnectionToggle(
              connectionModal.device,
              connectionModal.action
            )
          }
          isSubmitting={isSubmitting}
        />

        {/* Toast Notification */}
        {toast.show && (
          <Toast
            type={toast.type}
            message={toast.message}
            position="bottom-right"
            onClose={() => setToast({ show: false, type: "", message: "" })}
          />
        )}
      </div>
    </main>
  );
};

const BluetoothDeviceCard = ({
  device,
  onPair,
  onUnpair,
  onForget,
  onConnect,
  canManage
}) => {
  const [showActions, setShowActions] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowActions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getSignalStrengthIcon = (rssi) => {
    if (!rssi || rssi === null) return "ph:wifi-slash-bold";
    if (rssi > -50) return "ph:wifi-high-bold";
    if (rssi > -70) return "ph:wifi-medium-bold";
    return "ph:wifi-low-bold";
  };

  const getSignalStrengthColor = (rssi) => {
    if (!rssi || rssi === null) return "text-gray-400";
    if (rssi > -50) return "text-green-600";
    if (rssi > -70) return "text-yellow-600";
    return "text-red-600";
  };

  const getBatteryIcon = (level) => {
    if (level >= 90) return "ph:battery-full-bold";
    if (level >= 70) return "ph:battery-high-bold";
    if (level >= 40) return "ph:battery-medium-bold";
    if (level >= 15) return "ph:battery-low-bold";
    return "ph:battery-warning-bold";
  };

  const getBatteryColor = (level) => {
    if (level >= 70) return "text-green-600";
    if (level >= 30) return "text-yellow-600";
    return "text-red-600";
  };

  const getConnectionStatus = () => {
    if (!device.isPaired)
      return { label: "Not Paired", color: "bg-gray-100 text-gray-700" };
    if (device.isConnected)
      return { label: "Connected", color: "bg-green-100 text-green-800" };
    return { label: "Disconnected", color: "bg-yellow-100 text-yellow-800" };
  };

  const status = getConnectionStatus();

  const getDeviceTypeIcon = (type) => {
    switch (type) {
      case "Computer":
        return "ph:desktop-bold";
      case "Phone":
        return "ph:device-mobile-bold";
      case "Audio":
        return "ph:speaker-high-bold";
      case "Peripheral":
        return "ph:mouse-bold";
      default:
        return "ph:devices-bold";
    }
  };

  const handleManageClick = (e) => {
    e.stopPropagation();
    setShowActions(!showActions);
  };

  const handleActionClick = (action) => {
    setShowActions(false);
    action();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 overflow-hidden relative group"
    >
      <div
        className={`h-1.5 w-full ${
          !device.isPaired
            ? "bg-gray-300"
            : device.isConnected
              ? "bg-green-500"
              : "bg-yellow-500"
        }`}
      />

      {/* Card Header */}
      <div className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          {/* Device Info */}
          <div className="flex items-start gap-3 min-w-0 flex-1">
            {/* Icon with Connection Indicator */}
            <div className="relative flex-shrink-0">
              <div
                className={`p-3 rounded-xl transition-all duration-300 ${
                  !device.isPaired
                    ? "bg-gray-100"
                    : device.isConnected
                      ? "bg-green-100"
                      : "bg-yellow-100"
                }`}
              >
                <Icon
                  icon={getDeviceTypeIcon(device.type)}
                  className={`w-6 h-6 sm:w-7 sm:h-7 transition-colors ${
                    !device.isPaired
                      ? "text-gray-500"
                      : device.isConnected
                        ? "text-green-600"
                        : "text-yellow-600"
                  }`}
                />
              </div>
              {/* Animated Pulse for Connected Devices */}
              {device.isConnected && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-gray-900 text-base sm:text-lg truncate max-w-[150px] sm:max-w-[200px]">
                  {device.name !== "Unknown" ? device.name : "---"}
                </h3>
                {/* Device Type Badge - Mobile */}
                {device.type && (
                  <span className="sm:hidden px-2 py-0.5 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                    {device.type}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-gray-500 font-mono truncate">
                {device.deviceId}
              </p>
            </div>
          </div>

          {/* Status Badges - Desktop */}
          <div className="hidden sm:flex items-center gap-2">
            <span
              className={`px-3 py-1 text-xs font-medium rounded-full ${status.color}`}
            >
              {status.label}
            </span>
            {device.type && (
              <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                {device.type}
              </span>
            )}
          </div>

          {/* Mobile Status Badge - Single Line */}
          <div className="sm:hidden flex items-center justify-between w-full">
            <span
              className={`px-2 py-0.5 text-xs font-medium rounded-full ${status.color}`}
            >
              {status.label}
            </span>
          </div>
        </div>
      </div>

      {/* Device Details Grid */}
      <div className="px-4 sm:px-5 pb-4">
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Signal Strength Card */}
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <Icon
                icon={getSignalStrengthIcon(device.rssi)}
                className={`w-4 h-4 ${getSignalStrengthColor(device.rssi)}`}
              />
              <span className="text-xs text-gray-600">Signal</span>
            </div>
            <p className="text-sm font-semibold text-gray-900">
              {device.rssi ? `${device.rssi} dBm` : "—"}
            </p>
          </div>

          {/* Battery Level Card */}
          {device.isPaired &&
          device.batteryLevel !== null &&
          device.batteryLevel !== undefined ? (
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <Icon
                  icon={getBatteryIcon(device.batteryLevel)}
                  className={`w-4 h-4 ${getBatteryColor(device.batteryLevel)}`}
                />
                <span className="text-xs text-gray-600">Battery</span>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-gray-900">
                  {device.batteryLevel}%
                </p>
                <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      device.batteryLevel > 70
                        ? "bg-green-500"
                        : device.batteryLevel > 30
                          ? "bg-yellow-500"
                          : "bg-red-500"
                    }`}
                    style={{ width: `${device.batteryLevel}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <Icon
                  icon="ph:battery-slash-bold"
                  className="w-4 h-4 text-gray-400"
                />
                <span className="text-xs text-gray-600">Battery</span>
              </div>
              <p className="text-sm text-gray-500">Not available</p>
            </div>
          )}
        </div>

        {/* Paired Cane Info */}
        {device.pairedCane && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-4"
          >
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Icon
                    icon="ph:walking-stick"
                    className="w-4 h-4 text-blue-600"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-blue-700 font-medium">
                    Paired to Cane
                  </p>
                  <p className="text-sm text-gray-900 font-medium truncate">
                    {device.pairedCane.deviceName || "iCane"}
                    <span className="text-xs text-gray-500 ml-2">
                      • {device.pairedCane.deviceSerialNumber}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Last Seen */}
        {device.lastSeen && (
          <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg p-2">
            <Icon icon="ph:clock-bold" className="w-3.5 h-3.5" />
            <span>
              Last seen:{" "}
              {new Date(device.lastSeen).toLocaleString(undefined, {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              })}
            </span>
          </div>
        )}
      </div>

      {/* Actions Footer */}
      <div className="relative px-4 sm:px-5 py-3 bg-gray-50 border-t border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2">
          {/* Connection/Pair Button */}
          {device.isPaired ? (
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={(e) => {
                e.stopPropagation();
                onConnect();
              }}
              className={`flex-1 sm:flex-none px-4 py-2.5 sm:py-1.5 text-sm font-medium rounded-xl sm:rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                device.isConnected
                  ? "bg-orange-100 text-orange-700 hover:bg-orange-200"
                  : "bg-green-100 text-green-700 hover:bg-green-200"
              }`}
            >
              <Icon
                icon={
                  device.isConnected
                    ? "ph:plugs-connected-bold"
                    : "ph:plugs-bold"
                }
                className="w-4 h-4"
              />
              <span>{device.isConnected ? "Disconnect" : "Connect"}</span>
            </motion.button>
          ) : (
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={(e) => {
                e.stopPropagation();
                onPair();
              }}
              className="flex-1 sm:flex-none px-4 py-2.5 sm:py-1.5 text-sm font-medium bg-blue-600 text-white rounded-xl sm:rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow"
            >
              <Icon icon="ph:link-bold" className="w-4 h-4" />
              <span>Pair Device</span>
            </motion.button>
          )}

          {/* Manage Dropdown */}
          <div className="relative flex-1 sm:flex-none" ref={menuRef}>
            <button
              ref={buttonRef}
              onClick={handleManageClick}
              className="w-full sm:w-auto px-4 py-2.5 sm:py-1.5 text-sm text-gray-700 hover:text-gray-900 bg-white hover:bg-gray-100 rounded-xl sm:rounded-lg transition-all flex items-center justify-center gap-2 border border-gray-200 cursor-pointer"
            >
              {/* <Icon icon="ph:dots-three-bold" className="w-4 h-4" /> */}
              <span className="sm:hidden">Options</span>
              <span className="hidden sm:inline">Manage</span>
              <Icon
                icon="ph:caret-down-bold"
                className={`w-3 h-3 transition-transform duration-200 ${
                  showActions ? "rotate-180" : ""
                }`}
              />
            </button>

            <AnimatePresence>
              {showActions && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute bottom-full left-0 sm:left-auto sm:right-0 mb-2 w-full sm:w-56 bg-white rounded-xl shadow-xl border border-gray-200 z-[100] overflow-hidden"
                  style={{
                    boxShadow:
                      "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)"
                  }}
                >
                  <div className="py-1">
                    {device.isPaired ? (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleActionClick(onUnpair);
                          }}
                          className="w-full px-4 py-3 sm:py-2.5 text-left text-sm text-orange-600 hover:bg-orange-50 flex items-center gap-3 cursor-pointer transition-colors"
                        >
                          <Icon icon="ph:link-break-bold" className="w-4 h-4" />
                          <span>Unpair Device</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleActionClick(onForget);
                          }}
                          className="w-full px-4 py-3 sm:py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 border-t border-gray-100 cursor-pointer transition-colors"
                        >
                          <Icon icon="ph:trash-bold" className="w-4 h-4" />
                          <span>Forget Device</span>
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleActionClick(onPair);
                        }}
                        className="w-full px-4 py-3 sm:py-2.5 text-left text-sm text-green-600 hover:bg-green-50 flex items-center gap-3 cursor-pointer transition-colors"
                      >
                        <Icon icon="ph:link-bold" className="w-4 h-4" />
                        <span>Pair Device</span>
                      </button>
                    )}
                    {/* <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleActionClick(() => {
                          // View details action
                          console.log("View details:", device);
                        });
                      }}
                      className="w-full px-4 py-3 sm:py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 border-t border-gray-100 cursor-pointer transition-colors"
                    >
                      <Icon icon="ph:info-bold" className="w-4 h-4" />
                      <span>Device Details</span>
                    </button> */}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Hover Effect Gradient Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 0.03 : 0 }}
        className="absolute inset-0 pointer-events-none bg-gradient-to-r from-blue-600 to-purple-600"
      />
    </motion.div>
  );
};

// Modal Components
const PairDeviceModal = ({
  isOpen,
  device,
  onClose,
  onConfirm,
  isSubmitting
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title="Pair Bluetooth Device"
    modalType="info"
    message={`Are you sure you want to pair with ${device?.name || device?.deviceId}?`}
    handleCancel={onClose}
    handleConfirm={onConfirm}
    isSubmitting={isSubmitting}
    confirmText={isSubmitting ? "Pairing..." : "Pair Device"}
  />
);

const UnpairDeviceModal = ({
  isOpen,
  device,
  onClose,
  onConfirm,
  isSubmitting
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title="Unpair Device"
    modalType="warning"
    message={`This will unpair ${device?.name || device?.deviceId} from your account. The device can be paired again later.`}
    handleCancel={onClose}
    handleConfirm={onConfirm}
    isSubmitting={isSubmitting}
    confirmText={isSubmitting ? "Unpairing..." : "Unpair Device"}
  />
);

const ForgetDeviceModal = ({
  isOpen,
  device,
  onClose,
  onConfirm,
  isSubmitting
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title="Forget Device"
    modalType="error"
    message={`This will permanently remove ${device?.name || device?.deviceId} from your device list. You'll need to scan again to find it.`}
    handleCancel={onClose}
    handleConfirm={onConfirm}
    isSubmitting={isSubmitting}
    confirmText={isSubmitting ? "Forgetting..." : "Forget Device"}
  />
);

const ConnectionModal = ({
  isOpen,
  device,
  action,
  onClose,
  onConfirm,
  isSubmitting
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title={action === "connect" ? "Connect Device" : "Disconnect Device"}
    modalType={action === "connect" ? "info" : "warning"}
    message={`Are you sure you want to ${action} ${device?.name || device?.deviceId}?`}
    handleCancel={onClose}
    handleConfirm={onConfirm}
    isSubmitting={isSubmitting}
    confirmText={
      isSubmitting
        ? `${action === "connect" ? "Connecting..." : "Disconnecting..."}`
        : `${action === "connect" ? "Connect" : "Disconnect"}`
    }
  />
);

// Empty State Component
const EmptyState = ({ isScanning, onScan, viewMode }) => (
  <div className="text-center py-12">
    <Icon
      icon="ph:device-bluetooth-slash"
      className="w-16 h-16 text-gray-300 mx-auto mb-4"
    />
    <p className="text-gray-500 text-lg">
      {viewMode === "all" && "No Bluetooth devices found"}
      {viewMode === "paired" && "No paired devices"}
      {viewMode === "available" && "No available devices"}
    </p>
    <p className="text-gray-400 text-sm mt-2">
      {viewMode === "available"
        ? "Click 'Scan for Devices' to discover nearby Bluetooth devices"
        : "Pair a device to get started"}
    </p>
    {viewMode === "available" && (
      <Button
        onClick={onScan}
        disabled={isScanning}
        className="mt-4 text-white font-bold py-2 px-6 rounded-lg transition-all hover:shadow-lg inline-flex items-center gap-2"
      >
        <Icon
          icon={
            isScanning ? "ph:circle-notch-bold" : "ph:magnifying-glass-bold"
          }
          className={`w-5 h-5 ${isScanning ? "animate-spin" : ""}`}
        />
        {isScanning ? "Scanning..." : "Scan Now"}
      </Button>
    )}
  </div>
);

export default BluetoothManager;
