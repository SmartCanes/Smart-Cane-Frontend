import {
  deletePushSubscription,
  savePushSubscription
} from "@/api/backendService";
import { useUserStore } from "@/stores/useStore";

const SERVICE_WORKER_PATH = "/sw.js";

const urlBase64ToUint8Array = (base64String) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);

  return Uint8Array.from(rawData, (char) => char.charCodeAt(0));
};

const getGuardianId = () => {
  const user = useUserStore.getState().user;
  return user?.guardian_id ?? user?.guardianId ?? null;
};
  
export const registerPushServiceWorker = async () => {
  if (!("serviceWorker" in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register(SERVICE_WORKER_PATH);
    return registration;
  } catch (error) {
    console.error("Service worker registration failed:", error);
    return null;
  }
};

export const ensureBrowserPushSubscription = async ({
  requestPermission = false
} = {}) => {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    return null;
  }

  const vapidPublicKey = import.meta.env.VITE_WEB_PUSH_PUBLIC_KEY;

  if (!vapidPublicKey) {
    console.warn("Missing VITE_WEB_PUSH_PUBLIC_KEY.");
    return null;
  }

  let permission = Notification.permission;

  if (permission !== "granted" && requestPermission) {
    permission = await Notification.requestPermission();
  }

  if (permission !== "granted") {
    return null;
  }

  const registration =
    (await navigator.serviceWorker.getRegistration()) ||
    (await registerPushServiceWorker());

  if (!registration) {
    return null;
  }

  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
    });
  }

  try {
    await savePushSubscription({
      guardianId: getGuardianId(),
      subscription: subscription.toJSON(),
      userAgent: navigator.userAgent
    });
  } catch (error) {
    console.error("Failed to save push subscription:", error);
  }

  return subscription;
};

export const removeBrowserPushSubscription = async () => {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    return false;
  }

  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration) {
    return false;
  }

  const subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    return false;
  }

  try {
    await deletePushSubscription({
      guardianId: getGuardianId(),
      subscription: subscription.toJSON()
    });
  } catch (error) {
    console.error("Failed to delete push subscription from backend:", error);
  }

  try {
    return await subscription.unsubscribe();
  } catch (error) {
    console.error("Failed to unsubscribe:", error);
    return false;
  }
};

export const showForegroundNotification = async ({
  title,
  message,
  tag,
  icon = "/icane.svg",
  path = "/notifications",
  requireInteraction = false
}) => {
  if (!("serviceWorker" in navigator)) {
    return false;
  }

  const registration =
    (await navigator.serviceWorker.getRegistration()) ||
    (await registerPushServiceWorker());

  if (!registration?.showNotification) {
    return false;
  }

  await registration.showNotification(title, {
    body: message,
    icon,
    badge: icon,
    tag,
    requireInteraction,
    renotify: true,
    vibrate: [300, 150, 300],
    data: { path }
  });

  return true;
};