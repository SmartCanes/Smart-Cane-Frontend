import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useUserStore = create(
  persist(
    (set) => ({
      userName: "",
      isLoggedIn: false,

      login: (username) => set({ userName: username, isLoggedIn: true }),
      logout: () => set({ userName: "", isLoggedIn: false })
    }),
    {
      name: "user-session",
      getStorage: () => sessionStorage
    }
  )
);
