import { Icon } from "@iconify/react";
import Modal from "@/ui/components/Modal";

const STATUS_STYLES = {
  active: "bg-green-100 text-green-700 border-green-200",
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  inactive: "bg-gray-100 text-gray-600 border-gray-200",
  blocked: "bg-red-100 text-red-700 border-red-200"
};

const PermissionCard = ({
  title,
  description,
  icon,
  status,
  actionLabel,
  onAction,
  isBusy = false,
  isHighlighted = false
}) => (
  <div
    className={`rounded-2xl border p-4 transition-colors ${
      isHighlighted
        ? "border-[#11285A] bg-[#F7F9FF]"
        : "border-gray-200 bg-white"
    }`}
  >
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F0F4FF]">
          <Icon icon={icon} className="text-2xl text-[#11285A]" />
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm font-semibold text-[#1F2937] sm:text-base">
              {title}
            </h4>
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium ${STATUS_STYLES[status.tone] || STATUS_STYLES.inactive}`}
            >
              {status.label}
            </span>
          </div>

          <p className="mt-1 text-sm leading-relaxed text-[#6B7280]">
            {description}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onAction}
        disabled={isBusy}
        className={`inline-flex min-w-[150px] items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
          isBusy
            ? "cursor-not-allowed bg-gray-100 text-gray-400"
            : "cursor-pointer bg-[#11285A] text-white hover:bg-[#0D1F4A]"
        }`}
      >
        {isBusy && (
          <Icon icon="ph:circle-notch-bold" className="h-4 w-4 animate-spin" />
        )}
        {actionLabel}
      </button>
    </div>
  </div>
);

const resolveLocationStatus = (enabled, browserState) => {
  if (enabled) {
    return { label: "Enabled", tone: "active" };
  }

  if (browserState === "denied") {
    return { label: "Blocked in browser", tone: "blocked" };
  }

  if (browserState === "unsupported") {
    return { label: "Unavailable", tone: "blocked" };
  }

  if (browserState === "granted") {
    return { label: "Browser access ready", tone: "pending" };
  }

  return { label: "Not enabled", tone: "inactive" };
};

const resolvePushStatus = (enabled, browserState) => {
  if (enabled && browserState === "granted") {
    return { label: "Enabled", tone: "active" };
  }

  if (browserState === "denied") {
    return { label: "Blocked in browser", tone: "blocked" };
  }

  if (browserState === "unsupported") {
    return { label: "Unavailable", tone: "blocked" };
  }

  if (enabled) {
    return { label: "Awaiting browser access", tone: "pending" };
  }

  return { label: "Not enabled", tone: "inactive" };
};

const PermissionPreferencesModal = ({
  isOpen,
  onClose,
  highlightedKey = null,
  locationEnabled,
  locationBrowserState,
  pushEnabled,
  pushBrowserState,
  emailEnabled,
  smsEnabled,
  busyKey,
  errorMessage,
  onLocationAction,
  onPushAction,
  onEmailAction,
  onSmsAction
}) => {
  const cards = [
    {
      key: "location",
      title: "Browser Location Access",
      description:
        "Allow the browser to share your location so guardian tracking can stay accurate in real time.",
      icon: "solar:map-point-bold",
      status: resolveLocationStatus(locationEnabled, locationBrowserState),
      actionLabel: locationEnabled ? "Disable location" : "Allow location",
      onAction: onLocationAction
    },
    {
      key: "push",
      title: "Push Notifications",
      description:
        "Enable browser notifications for emergency alerts, fall detection, and important updates even when this tab is not active.",
      icon: "solar:bell-bold",
      status: resolvePushStatus(pushEnabled, pushBrowserState),
      actionLabel: pushEnabled ? "Disable push" : "Allow push",
      onAction: onPushAction
    },
    {
      key: "email",
      title: "Email Notifications",
      description:
        "Receive important account and safety updates through email.",
      icon: "solar:letter-bold",
      status: emailEnabled
        ? { label: "Enabled", tone: "active" }
        : { label: "Not enabled", tone: "inactive" },
      actionLabel: emailEnabled ? "Disable email" : "Enable email",
      onAction: onEmailAction
    },
    {
      key: "sms",
      title: "SMS Alerts",
      description:
        "Turn on text message alerts for urgent situations and quick status updates.",
      icon: "solar:chat-round-dots-bold",
      status: smsEnabled
        ? { label: "Enabled", tone: "active" }
        : { label: "Not enabled", tone: "inactive" },
      actionLabel: smsEnabled ? "Disable SMS" : "Enable SMS",
      onAction: onSmsAction
    }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Permission & Notification Setup"
      message="Choose which browser permissions and update channels you want to turn on."
      modalType={errorMessage ? "warning" : "info"}
      variant="dialog"
      closeTimer={0}
      icon="solar:shield-keyhole-bold"
      width="max-w-3xl"
    >
      <div className="space-y-4">
        <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-[#1E3A8A]">
          Browser prompts only appear after you press an allow button below.
        </div>

        {errorMessage && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        {cards.map(({ key, ...card }) => (
          <PermissionCard
            key={key}
            {...card}
            isBusy={busyKey === key}
            isHighlighted={highlightedKey === key}
          />
        ))}
      </div>
    </Modal>
  );
};

export default PermissionPreferencesModal;
