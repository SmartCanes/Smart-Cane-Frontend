import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useUserStore = create(
  persist(
    (set) => ({
      userName: "",
      isLoggedIn: false,
      showLoginModal: false,

      login: (username) => set({ userName: username, isLoggedIn: true }),
      logout: () => set({ userName: "", isLoggedIn: false }),
      setShowLoginModal: (value) => set({ showLoginModal: value })
    }),
    {
      name: "user-session",
      getStorage: () => sessionStorage
    }
  )
);
