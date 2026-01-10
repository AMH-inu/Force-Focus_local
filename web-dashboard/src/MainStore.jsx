import { create } from 'zustand';
import { persist } from "zustand/middleware";

const useMainStore = create(
  persist(
    (set) => ({
      // 1. 메뉴 열림/닫힘 상태 (각 메뉴)
      isOpen: true,
      toggleMenu: () => set((state) => ({ isOpen: !state.isOpen })),

      // 2. 현재 활성화된 메뉴 (전체 메뉴 목록)
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

      // 3. 스케줄 메뉴 진입 시 적용할 임시 뷰 모드 (스케줄 메뉴)
      scheduleInitialView: null, 
      clearScheduleInitialView: () => set({ scheduleInitialView: null }),

      // 4. 활동 요약 메뉴 진입 시 적용할 뷰 모드 (활동 요약 메뉴)
      activityViewMode: 'horizontal', 
      setActivityViewMode: (mode) => set({ activityViewMode: mode }),

      // 5. 피드백 메뉴 진입 시 적용할 뷰 모드 (피드백 메뉴)
      feedbackViewMode: '종합', 
      setFeedbackViewMode: (mode) => set({ feedbackViewMode: mode }),

      // 6. 설정 메뉴 진입 시 적용할 뷰 모드 (설정 메뉴)
      settingsViewMode: 'limit', 
      setSettingsViewMode: (mode) => set({ settingsViewMode: mode }),
      
      // 7. 작업 변경 사항 추적 (작업 메뉴)
      isDirty: false,
      setIsDirty: (status) => set({ isDirty: status }),

      // 8. 도움말 모달 열림/닫힘 상태 (도움말)
      isHelpOpen: false,
      openHelp: () => set({ isHelpOpen: true }),
      closeHelp: () => set({ isHelpOpen: false }),

      // 9. 다크모드 상태 및 토글 함수 (다크 모드)
      isDarkMode: false,
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
    }),
    { name: 'main-storage',
      partialize: (state) => ({ isDarkMode: state.isDarkMode })
    }
  )
);

export default useMainStore;