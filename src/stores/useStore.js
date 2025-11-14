import { create } from "zustand";

export const useUserStore = create((set) => ({
  userName: "",
  isLoggedIn: false,

  login: (username) => set(() => ({ userName: username, isLoggedIn: true })),
  logout: () => set(() => ({ userName: "", isLoggedIn: false }))
}));
