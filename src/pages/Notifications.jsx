import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";
import { format } from "date-fns";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all"); // all, unread, read

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockNotifications = [
      {
        id: 1,
        title: "Fall Detected",
        message: "John Smith's iCane detected a fall at Main Street",
        timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        type: "alert",
        read: false,
        deviceId: "ICN-001"
      },
      {
        id: 2,
        title: "Battery Low",
        message: "iCane device IC-12345 battery is at 15%",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        type: "warning",
        read: true,
        deviceId: "IC-12345"
      },
      {
        id: 3,
        title: "Device Offline",
        message: "iCane device IC-67890 has been offline for 30 minutes",
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        type: "info",
        read: false,
        deviceId: "IC-67890"
      },
      {
        id: 4,
        title: "Safe Zone Alert",
        message: "VIP has exited the designated safe zone",
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        type: "alert",
        read: true,
        deviceId: "ICN-001"
      }
    ];
    setNotifications(mockNotifications);
  }, []);

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
  };

  const deleteNotification = (id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === "unread") return !notif.read;
    if (filter === "read") return notif.read;
    return true;
  });

  const getTypeIcon = (type) => {
    switch (type) {
      case "alert":
        return "ph:warning-circle";
      case "warning":
        return "ph:warning";
      case "info":
        return "ph:info";
      default:
        return "ph:bell";
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "alert":
        return "bg-red-500";
      case "warning":
        return "bg-yellow-500";
      case "info":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return format(date, "MMM dd, yyyy");
  };

  return (
    <main
      id="app-main"
      className="bg-white md:bg-[#f9fafb] rounded-t-[32px] md:rounded-none min-h-[calc(100vh-var(--header-height)-var(--mobile-nav-height))] md:min-h-[calc(100vh-var(--header-height))] md:max-h-[calc(100vh-var(--header-height))] overflow-y-visible md:overflow-y-auto p-6 pb-[calc(var(--mobile-nav-height)+1.5rem)] md:pb-6"
    >
      <div className="mx-auto w-full space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 font-poppins">
              Notifications
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              {notifications.length} total •{" "}
              {notifications.filter((n) => !n.read).length} unread
            </p>
          </div>

          <div className="flex w-full sm:w-auto justify-end">
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 bg-white rounded-lg shadow-sm hover:bg-gray-100 transition text-sm font-medium cursor-pointer"
            >
              Mark all as read
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {["all", "unread", "read"].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
                filter === type
                  ? "bg-primary-100 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
              {type === "unread" && (
                <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {notifications.filter((n) => !n.read).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <AnimatePresence>
            {filteredNotifications.length === 0 ? (
              <div className="p-10 text-center text-gray-500">
                <Icon
                  icon="ph:bell-slash"
                  className="w-16 h-16 mx-auto mb-4 text-gray-300"
                />
                <h3 className="text-lg font-semibold mb-2">No notifications</h3>
                <p className="text-gray-400">You're all caught up!</p>
              </div>
            ) : (
              filteredNotifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 ${!notification.read ? "bg-blue-50/50" : ""}`}
                >
                  <div className="flex gap-3">
                    <div
                      className={`w-10 h-10 rounded-full ${getTypeColor(
                        notification.type
                      )} flex items-center justify-center`}
                    >
                      <Icon
                        icon={getTypeIcon(notification.type)}
                        className="w-5 h-5 text-white"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between gap-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {notification.title}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                        </div>

                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {formatTime(notification.timestamp)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center mt-3">
                        <span className="text-xs text-gray-400">
                          Device: {notification.deviceId}
                        </span>

                        <div className="flex gap-3">
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="text-xs text-primary-600 font-medium cursor-pointer"
                            >
                              Mark as read
                            </button>
                          )}

                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="text-xs text-red-600 font-medium cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <div className="text-sm text-gray-500">Total</div>
            <div className="text-2xl font-bold">{notifications.length}</div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm">
            <div className="text-sm text-gray-500">Unread</div>
            <div className="text-2xl font-bold text-blue-600">
              {notifications.filter((n) => !n.read).length}
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm">
            <div className="text-sm text-gray-500">Alerts</div>
            <div className="text-2xl font-bold text-red-600">
              {notifications.filter((n) => n.type === "alert").length}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Notifications;
