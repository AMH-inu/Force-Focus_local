import { create } from 'zustand'

const useMenuStore = create((set) => ({
  // 메뉴 열림/닫힘 상태
  isOpen: true,
  toggleMenu: () => set((state) => ({ isOpen: !state.isOpen })),

  // 현재 활성화된 메뉴
  activeMenu: 'Overview',
  setActiveMenu: (menu) => set({ activeMenu: menu }),
}))

export default useMenuStore