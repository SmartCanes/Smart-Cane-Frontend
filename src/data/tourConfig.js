/**
 * Per-page tour step definitions for the first-time user onboarding system.
 *
 * Each page path maps to an ordered array of steps.
 * Each step describes:
 *   - target     → value of the `data-tour` attribute on the target DOM element
 *   - title      → short heading shown in the tooltip
 *   - description→ explanatory text shown in the tooltip
 *   - position   → preferred tooltip placement: "top" | "bottom" | "left" | "right" | "auto"
 */
export const TOUR_STEPS = {
  "/dashboard": [
    {
      target: "tour-vip-dropdown",
      title: "Switch Your VIP",
      description:
        "Use this dropdown to switch between your paired iCane devices. Each device is assigned to a specific VIP.",
      position: "bottom",
      icon: "streamline-plump:user-pin-remix"
    },
    {
      target: "tour-connection-status",
      title: "Connection Status",
      description:
        "This badge shows whether your iCane is live and transmitting data. Green means connected — grey means the device is offline.",
      position: "bottom",
      icon: "mdi:wifi"
    },
    {
      target: "tour-notifications",
      title: "Alerts & Notifications",
      description:
        "Tap the bell to view incoming alerts from your iCane — fall detection, low battery, emergency triggers, and more.",
      position: "bottom",
      icon: "ph:bell-ringing-fill"
    },
    {
      target: "tour-profile-menu",
      title: "Your Account Menu",
      description:
        "Access your profile, activity history, app settings, or sign out from this menu.",
      position: "bottom",
      icon: "ph:user-circle-fill"
    },
    {
      target: "tour-live-map",
      title: "Live Location Tracking",
      description:
        "See your iCane's real-time position on the map. Tap anywhere on the map to open routing options and set a destination for your VIP.",
      position: "bottom",
      icon: "ph:map-pin-fill"
    },
    {
      target: "tour-gps-info",
      title: "GPS Signal Info",
      description:
        "Monitor the satellite count, signal quality, and last known GPS coordinates of your iCane device.",
      position: "top",
      icon: "mdi:satellite-variant"
    },
    {
      target: "tour-guardian-network",
      title: "Guardian Network",
      description:
        "See which co-guardians are currently online. Green means active — they're monitoring alongside you right now.",
      position: "right",
      icon: "ph:users-three-fill"
    },
    {
      target: "tour-recent-alerts",
      title: "Recent Alerts",
      description:
        "Stay updated with the latest fall detection and emergency alerts triggered by the iCane device.",
      position: "right",
      icon: "ph:bell-ringing-fill"
    },
    {
      target: "tour-send-note",
      title: "Send a Quick Note",
      description:
        "Send a short reminder or message directly to your VIP through the iCane's voice engine.",
      position: "left",
      icon: "ph:note-pencil-fill"
    },
    {
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
      target: "tour-devices-header",
      title: "Your Paired iCane Devices",
      description:
        "All iCane devices linked to your account are shown here. You can manage, rename, or unpair any device.",
      position: "bottom",
      icon: "mdi:devices"
    },
    {
      target: "tour-add-device",
      title: "Add a New Device",
      description:
        "Tap 'Add Cane' and scan the QR code on your iCane to pair it with your account. It only takes a few seconds.",
      position: "bottom",
      icon: "ph:plus-circle-fill"
    },
    {
      target: "tour-device-vip",
      title: "Assign & Manage VIP",
      description:
        "Here you can also view the VIP's name, photo, and basic info",
      position: "bottom",
      icon: "ph:user-circle-fill"
    },
    {
      target: "tour-device-manage",
      title: "Cane Settings & Guardians",
      description:
        "Click this to edit the cane's nickname, or open 'Manage Guardians' to invite co-guardians and transfer emergency alerts to them.",
      position: "bottom",
      icon: "ph:gear-six-fill"
    }
  ],

  "/activity-report": [
    {
      target: "tour-activity-header",
      title: "Activity Reports",
      description:
        "A full audit trail of all account actions — logins, device changes, guardian invites, and more.",
      position: "bottom",
      icon: "solar:history-linear"
    },
    {
      target: "tour-activity-search",
      title: "Search & Filter",
      description:
        "Quickly find specific activities by searching for a guardian name, action type, or description.",
      position: "bottom",
      icon: "ph:magnifying-glass"
    }
  ],

  "/weather-board": [
    {
      target: "tour-weather-main",
      title: "Weather Forecast",
      description:
        "Check current conditions and multi-day forecasts to help plan safe outdoor activities for your VIP.",
      position: "bottom",
      icon: "solar:cloud-rain-outline"
    },
    {
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
      target: "tour-advanced-header",
      title: "Component Management",
      description:
        "Monitor real-time health of each hardware component and tweak sensor thresholds from here.",
      position: "bottom",
      icon: "fa6-brands:unity"
    },
    {
      target: "tour-advanced-stats",
      title: "Live Component Stats",
      description:
        "Quickly see how many components are currently online and functioning properly out of your total modules.",
      position: "bottom",
      icon: "mdi:chart-box"
    },
    {
      target: "tour-device-status",
      title: "Health at a Glance",
      description:
        "This panel summarizes how many components are online and gives an overall health percentage for your iCane.",
      position: "bottom",
      icon: "mdi:chip"
    },
    {
      target: "tour-advanced-tabs",
      title: "Component Categories",
      description:
        "Switch between Sensors, Hardware controllers, and Voice engine settings using these tabs.",
      position: "bottom",
      icon: "mdi:tab"
    }
  ]
};

/**
 * Mobile-only tour behavior overrides.
 * TourGuide uses this when it rewrites desktop header steps into a
 * hamburger-first sequence for small screens.
 */
export const MOBILE_TOUR_FLOW = {
  "/dashboard": {
    headerMenuIntro: {
      title: "Open the Header Menu",
      description:
        "Open the Header Menu to access your connection status, VIP dropdown, and other settings.",
      icon: "ph:list-bold"
    }
  }
};
