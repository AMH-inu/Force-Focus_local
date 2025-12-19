import { create } from 'zustand';
import { persist } from "zustand/middleware";

const useMainStore = create(
  persist(
    (set) => ({
      // 1. 메뉴 열림/닫힘 상태
      isOpen: true,
      toggleMenu: () => set((state) => ({ isOpen: !state.isOpen })),

      // 2. 현재 활성화된 메뉴
      activeMenu: 'Overview',
      setActiveMenu: (menu) => set({ activeMenu: menu }),
      
      // 3. 도움말 모달 열림/닫힘 상태
      isHelpOpen: false,
      openHelp: () => set({ isHelpOpen: true }),
      closeHelp: () => set({ isHelpOpen: false }),

      // 4. 다크모드 상태 및 토글 함수
      isDarkMode: false,
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
    }),
    { name: 'main-storage' }
  )
);

export default useMainStore;