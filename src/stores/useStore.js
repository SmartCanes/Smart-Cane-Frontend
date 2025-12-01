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
  connectWs: () => {
    wsApi.connect();

    wsApi.off("status");
    wsApi.off("location");
    wsApi.off("connect");
    wsApi.off("disconnect");

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
      set({ _wsConnected: true, connectionStatus: true });
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
        emergency: data.emergency
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
