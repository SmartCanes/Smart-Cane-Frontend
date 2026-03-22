import { useMemo } from "react";
import { useTranslation } from "react-i18next";

const BASE_TOUR_STEPS = {
  "/dashboard": [
    {
      key: "switchVip",
      target: "tour-vip-dropdown",
      title: "Switch Your VIP",
      description:
        "Use this dropdown to switch between your paired iCane devices. Each device is assigned to a specific VIP.",
      position: "bottom",
      icon: "streamline-plump:user-pin-remix"
    },
    {
      key: "connectionStatus",
      target: "tour-connection-status",
      title: "Connection Status",
      description:
        "This badge shows whether your iCane is live and transmitting data. Green means connected - grey means the device is offline.",
      position: "bottom",
      icon: "mdi:wifi"
    },
    {
      key: "alerts",
      target: "tour-notifications",
      title: "Alerts & Notifications",
      description:
        "Tap the bell to view incoming alerts from your iCane - fall detection, low battery, emergency triggers, and more.",
      position: "bottom",
      icon: "ph:bell-ringing-fill"
    },
    {
      key: "accountMenu",
      target: "tour-profile-menu",
      title: "Your Account Menu",
      description:
        "Access your profile, activity history, app settings, or sign out from this menu.",
      position: "bottom",
      icon: "ph:user-circle-fill"
    },
    {
      key: "liveMap",
      target: "tour-live-map",
      title: "Live Location Tracking",
      description:
        "See your iCane's real-time position on the map. Tap anywhere on the map to open routing options and set a destination for your VIP.",
      position: "bottom",
      icon: "ph:map-pin-fill"
    },
    {
      key: "gpsInfo",
      target: "tour-gps-info",
      title: "GPS Signal Info",
      description:
        "Monitor the satellite count, signal quality, and last known GPS coordinates of your iCane device.",
      position: "top",
      icon: "mdi:satellite-variant"
    },
    {
      key: "guardianNetwork",
      target: "tour-guardian-network",
      title: "Guardian Network",
      description:
        "See which co-guardians are currently online. Green means active - they're monitoring alongside you right now.",
      position: "right",
      icon: "ph:users-three-fill"
    },
    {
      key: "recentAlerts",
      target: "tour-recent-alerts",
      title: "Recent Alerts",
      description:
        "Stay updated with the latest fall detection and emergency alerts triggered by the iCane device.",
      position: "right",
      icon: "ph:bell-ringing-fill"
    },
    {
      key: "sendNote",
      target: "tour-send-note",
      title: "Send a Quick Note",
      description:
        "Send a short reminder or message directly to your VIP through the iCane's voice engine.",
      position: "left",
      icon: "ph:note-pencil-fill"
    },
    {
      key: "mapControls",
      target: "tour-map-controls",
      title: "Map Controls",
      description:
        "Lock the map to your VIP's route, follow their movement in real time, center on your own location, or zoom in and out using these controls.",
      position: "left",
      icon: "mdi:map-marker-radius"
    }
  ],
  "/devices": [
    {
      key: "devicesHeader",
      target: "tour-devices-header",
      title: "Your Paired iCane Devices",
      description:
        "All iCane devices linked to your account are shown here. You can manage, rename, or unpair any device.",
      position: "bottom",
      icon: "mdi:devices"
    },
    {
      key: "addDevice",
      target: "tour-add-device",
      title: "Add a New Device",
      description:
        "Tap 'Add Cane' and scan the QR code on your iCane to pair it with your account. It only takes a few seconds.",
      position: "bottom",
      icon: "ph:plus-circle-fill"
    },
    {
      key: "deviceActions",
      target: "tour-device-manage-button",
      title: "Open Device Actions",
      description:
        "Click Manage on a device card to open quick actions for nickname, guardians, and pairing controls.",
      position: "top",
      icon: "ph:gear-six-bold",
      hideNext: true,
      advanceOn: {
        target: "tour-device-manage-button",
        event: "click",
        waitForTarget: "tour-device-manage-dropdown"
      }
    },
    {
      key: "deviceMenu",
      target: "tour-device-manage-dropdown",
      title: "Device Action Menu",
      description:
        "These options let you edit nickname, manage guardians, or unpair the device. Click Manage Guardians to continue.",
      position: "top",
      icon: "ph:list-checks",
      hideNext: true,
      advanceOn: {
        target: "tour-device-manage-guardians",
        event: "click",
        waitForTarget: "tour-manage-guardians-modal"
      }
    },
    {
      key: "inviteGuardian",
      target: "tour-manage-guardians-invite",
      title: "Invite Another Guardian",
      description:
        "Use this button to invite a new guardian by email so they can help monitor this VIP.",
      position: "bottom",
      icon: "ph:user-plus-bold"
    },
    {
      key: "editGuardian",
      target: "tour-manage-guardians-edit-relationship",
      title: "Edit Guardian Details",
      description:
        "Use this edit icon on a guardian card to update relationship details when roles change.",
      position: "left",
      icon: "ph:pencil-simple-bold",
      skipIfMissing: true
    },
    {
      key: "guardianStats",
      target: "tour-manage-guardians-stats",
      title: "Guardian Summary Stats",
      description:
        "Track Total Guardians, currently Active guardians, and Pending Invites from these summary cards.",
      position: "top",
      icon: "ph:chart-bar"
    }
  ],
  "/activity-logs": [
    {
      key: "activityHeader",
      target: "tour-activity-header",
      title: "Activity Reports",
      description:
        "A full audit trail of all account actions - logins, device changes, guardian invites, and more.",
      position: "bottom",
      icon: "solar:history-linear"
    },
    {
      key: "activitySearch",
      target: "tour-activity-search",
      title: "Search & Filter",
      description:
        "Quickly find specific activities by searching for a guardian name, action type, or description.",
      position: "bottom",
      icon: "ph:magnifying-glass"
    }
  ],
  "/device-logs": [
    {
      key: "deviceLogsHeader",
      target: "tour-device-logs-header",
      title: "Device Activity Logs",
      description:
        "View route activities, safety events, and movement history for your VIP's iCane device.",
      position: "bottom",
      icon: "ph:list-checks"
    },
    {
      key: "deviceLogsSearch",
      target: "tour-device-logs-search",
      title: "Search and Filters",
      description:
        "Quickly narrow records by keyword, status, or date range to find the events you need.",
      position: "bottom",
      icon: "ph:funnel-simple"
    }
  ],
  "/weather-board": [
    {
      key: "weatherMain",
      target: "tour-weather-main",
      title: "Weather Forecast",
      description:
        "Check current conditions and multi-day forecasts to help plan safe outdoor activities for your VIP.",
      position: "bottom",
      icon: "solar:cloud-rain-outline"
    },
    {
      key: "weatherSearch",
      target: "tour-weather-search",
      title: "Search Any Location",
      description:
        "Type any city or place in the Philippines to get a localized forecast for that area.",
      position: "bottom",
      icon: "carbon:search"
    }
  ],
  "/advanced": [
    {
      key: "advancedHeader",
      target: "tour-advanced-header",
      title: "Component Management",
      description:
        "Monitor real-time health of each hardware component and tweak sensor thresholds from here.",
      position: "bottom",
      icon: "fa6-brands:unity"
    },
    {
      key: "deviceStatus",
      target: "tour-device-status",
      title: "Health at a Glance",
      description:
        "This panel summarizes how many components are online and gives an overall health percentage for your iCane.",
      position: "bottom",
      icon: "mdi:chip"
    }
  ]
};

const BASE_MOBILE_TOUR_FLOW = {
  "/dashboard": {
    headerMenuIntro: {
      title: "Open the Header Menu",
      description:
        "Open the Header Menu to access your connection status, VIP dropdown, and other settings.",
      icon: "ph:list-bold"
    }
  }
};

const routeToKey = (routePath) => routePath.replace(/^\//, "").replace(/-/g, "_");

export function useTourSteps() {
  const { t, i18n } = useTranslation("pages");

  const tourSteps = useMemo(() => {
    const translated = {};

    Object.entries(BASE_TOUR_STEPS).forEach(([path, steps]) => {
      const routeKey = routeToKey(path);
      translated[path] = steps.map((step) => ({
        ...step,
        title: t(`tour.steps.${routeKey}.${step.key}.title`, {
          defaultValue: step.title
        }),
        description: t(`tour.steps.${routeKey}.${step.key}.description`, {
          defaultValue: step.description
        })
      }));
    });

    return translated;
  }, [t, i18n.resolvedLanguage]);

  const mobileTourFlow = useMemo(() => {
    const translated = {};

    Object.entries(BASE_MOBILE_TOUR_FLOW).forEach(([path, flow]) => {
      const routeKey = routeToKey(path);
      translated[path] = {
        ...flow,
        headerMenuIntro: {
          ...flow.headerMenuIntro,
          title: t(`tour.mobile.${routeKey}.headerMenuIntro.title`, {
            defaultValue: flow.headerMenuIntro.title
          }),
          description: t(`tour.mobile.${routeKey}.headerMenuIntro.description`, {
            defaultValue: flow.headerMenuIntro.description
          })
        }
      };
    });

    return translated;
  }, [t, i18n.resolvedLanguage]);

  return { tourSteps, mobileTourFlow };
}
