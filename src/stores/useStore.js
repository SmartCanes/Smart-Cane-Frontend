import { wsApi } from "@/api/ws-api";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export const useUserStore = create(
  persist(
    (set, get) => ({
      user: null,
      setUser: (userData) => set({ user: userData }),
      clearUser: () => set({ user: null }),
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null
        })),
      updateProfileImage: (imageUrl) =>
        set((state) => ({
          user: state.user
            ? { ...state.user, guardian_image_url: imageUrl }
            : null
        })),
      getUserInfo: () => get().user,
      getUsername: () => get().user?.username || "",
      getAvatar: () => get().user?.guardian_image_url || ""
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user })
    }
  )
);

export const useRealtimeStore = create((set, get) => ({
  _wsConnected: false,
  connectionStatus: false,
  emergency: false,
  caneLocation: null,
  guardianLocation: null,
  componentHealth: {
    gpsStatus: false,
    ultrasonicStatus: false,
    infraredStatus: false,
    accelerometerStatus: false,
    esp32Status: false,
    raspberryPiStatus: false
  },
  connectWs: () => {
    wsApi.off("status");
    wsApi.off("location");
    wsApi.off("connect");
    wsApi.off("disconnect");
    wsApi.connect();

    let heartbeatTimeout;

    const resetHeartbeat = () => {
      if (heartbeatTimeout) clearTimeout(heartbeatTimeout);
      heartbeatTimeout = setTimeout(() => {
        set({ connectionStatus: false });
        console.log("WebSocket connection lost (timeout)");
      }, 12000);
    };

    wsApi.on("connect", () => {
      console.log("WebSocket connected:", wsApi.socket?.id);
      set({ _wsConnected: true });
      resetHeartbeat();
    });

    wsApi.on("disconnect", () => {
      console.log("WebSocket disconnected");
      set({ _wsConnected: false, connectionStatus: false });
      clearTimeout(heartbeatTimeout);

      setTimeout(() => {
        get().connectWs();
      }, 5000);
    });

    wsApi.on("status", (data) => {
      set({
        connectionStatus: data.status === "online",
        emergency: data.emergency,
        componentHealth: {
          gpsStatus: Number(data.gpsStatus) === 2,
          ultrasonicStatus:
            data.ultrasonicStatus === true || data.ultrasonicStatus === "false",
          infraredStatus:
            data.infraredStatus === true || data.infraredStatus === "false",
          mpuStatus: data.mpuStatus === true || data.mpuStatus === "false",
          esp32Status: data.status === "online",
          raspberryPiStatus:
            data.raspberryPiStatus === true ||
            data.raspberryPiStatus === "false"
        }
      });
      resetHeartbeat();
    });

    wsApi.on("location", (data) => {
      if (data?.lat != null && data?.lng != null) {
        set({ caneLocation: [data.lat, data.lng] });
      }
      resetHeartbeat();
    });
  },
  setGuardianLocation: (loc) => set({ guardianLocation: loc }),
  disconnectWs: () => {
    wsApi.disconnect();
    set({ _wsConnected: false, connectionStatus: false });
  }
}));

export const useUIStore = create(
  persist(
    (set) => ({
      isAnimationDone: false,
      setIsAnimationDone: () => set({ isAnimationDone: true }),

      error: null,
      setError: (msg) => set({ error: msg }),
      clearError: () => set({ error: null })
    }),
    {
      name: "ui-storage",
      storage: createJSONStorage(() => sessionStorage)
    }
  )
);
