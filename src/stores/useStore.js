import { wsApi } from "@/api/ws-api";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useUserStore = create(
  persist(
    (set, get) => ({
      userName: "",
      isLoggedIn: false,
      showLoginModal: false,

      login: (username) => set({ userName: username, isLoggedIn: true }),
      logout: () => set({ userName: "", isLoggedIn: false }),
      setShowLoginModal: (value) => set({ showLoginModal: value }),

      _wsConnected: false,
      status: false,
      emergency: false,
      caneLocation: null,
      guardianLocation: null,

      connectWs: () => {
        if (get()._wsConnected) return;

        wsApi.connect();

        wsApi.on("status", (data) => {
          console.log("STATUS UPDATE", data);
          set({
            status: data.status === "online",
            emergency: data.emergency
          });
        });

        wsApi.on("location", (data) => {
          console.log("LOCATION UPDATE", data);
          if (data?.lat != null && data?.lng != null) {
            set({ caneLocation: [data.lat, data.lng] });
          }
        });

        set({ _wsConnected: true });
      },

      setGuardianLocation: (loc) => set({ guardianLocation: loc })
    }),
    {
      name: "user-session",
      getStorage: () => sessionStorage,
      partialize: (state) => ({
        userName: state.userName,
        isLoggedIn: state.isLoggedIn,
        showLoginModal: state.showLoginModal
      })
    }
  )
);
