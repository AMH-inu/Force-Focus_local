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
      scheduleViewMode: "week",
      setScheduleViewMode: (mode) => set({ scheduleViewMode: mode }),
      setActiveMenu: (menu, initialView = null) => {
        if (initialView) {
          set({ activeMenu: menu, scheduleViewMode: initialView });
        } else {
          set({ activeMenu: menu });
        }
      },

      // 3. 스케줄 메뉴 진입 시 적용할 임시 뷰 모드
      scheduleInitialView: null, 
      clearScheduleInitialView: () => set({ scheduleInitialView: null }),
      
      // 4. 작업 변경 사항 추적
      isDirty: false,
      setIsDirty: (status) => set({ isDirty: status }),

      // 5. 도움말 모달 열림/닫힘 상태
      isHelpOpen: false,
      openHelp: () => set({ isHelpOpen: true }),
      closeHelp: () => set({ isHelpOpen: false }),

      // 6. 다크모드 상태 및 토글 함수
      isDarkMode: false,
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
    }),
    { name: 'main-storage' }
  )
);

export default useMainStore;