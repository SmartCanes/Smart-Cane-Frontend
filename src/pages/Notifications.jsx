import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import { useActivityReportsStore, useNotificationsStore, useUserStore } from "@/stores/useStore";

//colors
const COLOR = {
  blue:   { bg: "bg-blue-100",   icon: "text-blue-600",   dot: "bg-blue-500",   badge: "bg-blue-50 text-blue-700 border-blue-200"     },
  indigo: { bg: "bg-indigo-100", icon: "text-indigo-600", dot: "bg-indigo-500", badge: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  green:  { bg: "bg-green-100",  icon: "text-green-600",  dot: "bg-green-500",  badge: "bg-green-50 text-green-700 border-green-200"   },
  orange: { bg: "bg-orange-100", icon: "text-orange-600", dot: "bg-orange-500", badge: "bg-orange-50 text-orange-700 border-orange-200" },
  purple: { bg: "bg-purple-100", icon: "text-purple-600", dot: "bg-purple-500", badge: "bg-purple-50 text-purple-700 border-purple-200" },
  red:    { bg: "bg-red-100",    icon: "text-red-600",    dot: "bg-red-500",    badge: "bg-red-50 text-red-700 border-red-200"         },
  gray:   { bg: "bg-gray-100",   icon: "text-gray-500",   dot: "bg-gray-400",   badge: "bg-gray-50 text-gray-600 border-gray-200"      },
};

//time converter
const toManilaDate = (raw) => {
  if (!raw) return null;
  const str = typeof raw === "string" ? raw.replace(" ", "T") : String(raw);
  const withZ = !str.endsWith("Z") && !str.includes("+") ? str + "Z" : str;
  const date = new Date(withZ);
  return isNaN(date.getTime()) ? null : date;
};

const formatTime = (raw) => {
  const date = toManilaDate(raw);
  if (!date) return "—";
  const diff  = Date.now() - date.getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins  < 1)  return "Just now";
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days  < 7)  return `${days}d ago`;
  return date.toLocaleDateString("en-PH", {
    timeZone: "Asia/Manila",
    month: "short", day: "numeric", year: "numeric",
  });
};

// group notif by date
const groupByDate = (notifs) => {
  const groups = {};
  const nowManila = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" }));
  notifs.forEach((n) => {
    const d = toManilaDate(n.timestamp);
    let label = "Older";
    if (d) {
      const dManila = new Date(d.toLocaleString("en-US", { timeZone: "Asia/Manila" }));
      const days = Math.floor((nowManila - dManila) / 86_400_000);
      if (days === 0)      label = "Today";
      else if (days === 1) label = "Yesterday";
      else if (days < 7)  label = "This Week";
    }
    if (!groups[label]) groups[label] = [];
    groups[label].push(n);
  });
  const order = ["Today", "Yesterday", "This Week", "Older"];
  return order.filter((k) => groups[k]).map((k) => ({ label: k, items: groups[k] }));
};

//date group divider
const DateDivider = ({ label }) => (
  <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 border-y border-gray-100">
    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
      {label}
    </span>
  </div>
);

// single notification card 
const NotifCard = ({ notif, onRead, onNavigate, index }) => {
  const c = COLOR[notif.color] || COLOR.gray;

  const handleClick = () => {
    if (!notif.read) onRead(notif.historyId);
    onNavigate(notif.historyId);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, transition: { duration: 0.18 } }}
      transition={{ delay: index * 0.04, duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
      onClick={handleClick}
      className={`
        group relative flex gap-3 px-4 py-4 cursor-pointer
        transition-colors duration-150 border-b border-gray-50 last:border-b-0
        ${notif.read ? "bg-white hover:bg-gray-50/80" : "bg-blue-50/40 hover:bg-blue-50/70"}
      `}
    >
      {/* unread left bar */}
      {!notif.read && (
        <span className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full bg-blue-500" />
      )}

      {/* icon bubble */}
      <div className={`shrink-0 w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center`}>
        <Icon icon={notif.icon} className={`w-5 h-5 ${c.icon}`} />
      </div>

      {/* content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${c.badge}`}>
              {notif.title}
            </span>
            {!notif.read && (
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${c.dot}`} />
            )}
          </div>
          <span className="text-xs text-gray-400 shrink-0 mt-0.5 whitespace-nowrap">
            {formatTime(notif.timestamp)}
          </span>
        </div>

        <p className="text-sm text-gray-700 mt-1.5 leading-snug line-clamp-2">
          {notif.message}
        </p>

        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Icon icon="ph:user-circle" className="w-3.5 h-3.5" />
            {notif.guardianName}
          </span>

          <div className="flex items-center gap-3">
            {!notif.read && (
              <button
                onClick={(e) => { e.stopPropagation(); onRead(notif.historyId); }}
                className="text-xs text-blue-500 font-medium hover:text-blue-700 transition-colors cursor-pointer"
              >
                Mark as read
              </button>
            )}
            <span className="text-xs text-blue-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
              View log <Icon icon="ph:arrow-right" className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// skeleton loader 
const Skeleton = () => (
  <div className="divide-y divide-gray-50">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="flex gap-3 px-4 py-4 animate-pulse">
        <div className="w-10 h-10 rounded-xl bg-gray-100 shrink-0" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-3.5 w-28 bg-gray-100 rounded-full" />
          <div className="h-3 w-full bg-gray-100 rounded-full" />
          <div className="h-3 w-3/4 bg-gray-100 rounded-full" />
        </div>
      </div>
    ))}
  </div>
);

// filter tabs
const FILTERS = ["All", "Unread", "Read"];

const Notifications = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("All");

  const { history, isLoading, fetchHistory } = useActivityReportsStore();
  const { readIds, getNotifications, markAsRead, markAllRead } = useNotificationsStore();
  const { user } = useUserStore();
  const currentGuardianId = user?.guardian_id ?? user?.guardianId;

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const allNotifications = useMemo(
    () => getNotifications(history, currentGuardianId),
    [history, readIds, currentGuardianId]
  );

  const filtered = useMemo(() => {
    if (filter === "Unread") return allNotifications.filter((n) => !n.read);
    if (filter === "Read")   return allNotifications.filter((n) =>  n.read);
    return allNotifications;
  }, [allNotifications, filter]);

  const grouped     = useMemo(() => groupByDate(filtered), [filtered]);
  const unreadCount = allNotifications.filter((n) => !n.read).length;
  const allIds      = allNotifications.map((n) => n.historyId);

  const handleNavigate = (historyId) => {
    navigate("/activity-reports", { state: { highlightId: historyId } });
  };

  return (
    <main
      id="app-main"
      className="bg-white md:bg-[#f9fafb] rounded-t-[32px] md:rounded-none min-h-[calc(100vh-var(--header-height)-var(--mobile-nav-height))] md:min-h-[calc(100vh-var(--header-height))] md:max-h-[calc(100vh-var(--header-height))] overflow-y-visible md:overflow-y-auto p-6 pb-[calc(var(--mobile-nav-height)+1.5rem)] md:pb-6"
    >
      <div className="mx-auto w-full space-y-4 sm:space-y-6">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 font-poppins">
              Notifications
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              {isLoading
                ? "Loading…"
                : `${allNotifications.length} total • ${unreadCount} unread`}
            </p>
          </div>

          {unreadCount > 0 && (
            <div className="flex w-full sm:w-auto justify-end">
              <button
                onClick={() => markAllRead(allIds)}
                className="flex items-center gap-1.5 px-4 py-2 bg-white rounded-lg shadow-sm hover:bg-gray-100 transition text-sm font-medium cursor-pointer"
              >
                <Icon icon="ph:checks" className="w-4 h-4 text-blue-500" />
                Mark all as read
              </button>
            </div>
          )}
        </div>

        {/* ── Filter Tabs ── */}
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
                transition-colors cursor-pointer
                ${filter === f
                  ? "bg-[#11285A] text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"}
              `}
            >
              {f}
              {f === "Unread" && unreadCount > 0 && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full font-semibold
                  ${filter === "Unread" ? "bg-white/20 text-white" : "bg-red-500 text-white"}`}
                >
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Notification List ── */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {isLoading ? (
            <Skeleton />
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
              <Icon
                icon="ph:bell-slash"
                className="w-16 h-16 mx-auto mb-4 text-gray-300"
              />
              <h3 className="text-lg font-semibold mb-2">
                {filter === "Unread" ? "All caught up!" : "No notifications"}
              </h3>
              <p className="text-gray-400">
                {filter === "Unread"
                  ? "No unread notifications right now."
                  : "Activity on your shared devices will appear here."}
              </p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {grouped.map(({ label, items }, gi) => (
                <div key={label}>
                  <DateDivider label={label} />
                  {items.map((notif, i) => (
                    <NotifCard
                      key={notif.id}
                      notif={notif}
                      index={gi * 10 + i}
                      onRead={markAsRead}
                      onNavigate={handleNavigate}
                    />
                  ))}
                </div>
              ))}
            </AnimatePresence>
          )}
        </div>
        
        {!isLoading && allNotifications.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <div className="text-sm text-gray-500">Total</div>
              <div className="text-2xl font-bold text-gray-800">
                {allNotifications.length}
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm">
              <div className="text-sm text-gray-500">Unread</div>
              <div className="text-2xl font-bold text-blue-600">
                {unreadCount}
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm">
              <div className="text-sm text-gray-500">Action Types</div>
              <div className="text-2xl font-bold text-[#11285A]">
                {new Set(allNotifications.map((n) => n.action)).size}
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  );
};

export default Notifications;