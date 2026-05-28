import { create } from "zustand";

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("verbiq-theme") || "night",
  setTheme: (theme) => {
    localStorage.setItem("verbiq-theme", theme);
    set({ theme });
  },
}));
