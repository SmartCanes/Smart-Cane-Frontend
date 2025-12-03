import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export const useLoginStore = create(
  persist(
    (set) => ({
      guardianId: null,
      username: "",
      password: "",
      showScanner: false,
      setGuardianId: (id) => set({ guardianId: id }),
      setShowScanner: (show) => set({ showScanner: show }),
      setCredentials: (username, password) => set({ username, password }),
      clearLoginStore: () =>
        set({
          guardianId: null,
          username: "",
          password: ""
        })
    }),

    {
      name: "login-session",
      storage: createJSONStorage(() => sessionStorage)
    }
  )
);
