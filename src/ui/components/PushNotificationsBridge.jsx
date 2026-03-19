import { useEffect } from "react";
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

  useEffect(() => {
    const setup = async () => {
      try {
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
  }, [pushEnabled]);

  return null;
};

export default PushNotificationsBridge;
