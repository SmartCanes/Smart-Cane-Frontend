import { useEffect, useRef } from "react";
import {
  ensureBrowserPushSubscription,
  registerPushServiceWorker,
  removeBrowserPushSubscription
} from "@/utils/pushNotifications";
import { useSettingsStore } from "@/stores/useStore";

const PushNotificationsBridge = () => {
  const pushEnabled = useSettingsStore(
    (state) => state.settings.notifications.push
  );
  const updateNotifications = useSettingsStore(
    (state) => state.updateNotifications
  );
  const hasSyncedPermission = useRef(false);

  useEffect(() => {
    const setup = async () => {
      try {
        const permission =
          typeof Notification !== "undefined"
            ? Notification.permission
            : "default";

        if (!hasSyncedPermission.current && permission === "granted") {
          hasSyncedPermission.current = true;
          updateNotifications({ push: true });
          await registerPushServiceWorker();
          await ensureBrowserPushSubscription({ requestPermission: false });
          return;
        }

        if (!pushEnabled) {
          await removeBrowserPushSubscription();
          return;
        }

        await registerPushServiceWorker();
        await ensureBrowserPushSubscription({ requestPermission: false });
      } catch (error) {
        console.error("Push bridge setup failed:", error);
      }
    };

    setup();
  }, [pushEnabled, updateNotifications]);

  return null;
};

export default PushNotificationsBridge;
