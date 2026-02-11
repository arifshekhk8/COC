import { create } from "zustand";

interface UIState {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
}

export const useUIStore = create<UIState>()((set) => ({
  activeTab: "chat",
  setActiveTab: (tab) => set({ activeTab: tab }),
  isMobileMenuOpen: false,
  toggleMobileMenu: () =>
    set((s) => ({ isMobileMenuOpen: !s.isMobileMenuOpen })),
}));
