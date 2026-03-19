import { useEffect } from "react";
import {
  ensureBrowserPushSubscription,
  registerPushServiceWorker
} from "@/utils/pushNotifications";

const PushNotificationsBridge = () => {
  useEffect(() => {
    const setup = async () => {
      try {
        await registerPushServiceWorker();
        await ensureBrowserPushSubscription({ requestPermission: false });
      } catch (error) {
        console.error("Push bridge setup failed:", error);
      }
    };

    setup();
  }, []);

  return null;
};

export default PushNotificationsBridge;
