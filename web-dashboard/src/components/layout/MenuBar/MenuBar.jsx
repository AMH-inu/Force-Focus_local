import './MenuBar.css'
import useMainStore from '../../../MainStore.jsx'

// 메뉴 바 컴포넌트 (좌측 사이드바 영역)
export default function MenuBar() {
  const { isOpen, toggleMenu, activeMenu, setActiveMenu } = useMainStore() // MainStore에서 상태와 액션을 가져옴

  // 메뉴 아이템(아이콘, 레이블) 정의
  const menus = [
    { icon: '🏠', label: 'Overview' },
    { icon: '📝', label: '스케줄' },
    { icon: '📊', label: '활동 요약' },
    { icon: '🚨', label: '피드백' },
    { icon: '⚙️', label: '설정' },
  ]

  return (
    <aside className={`menu-bar ${isOpen ? '' : 'collapsed'}`}>
      {/* 상단 헤더 영역 */}
      <div className="menu-bar__header">
        <span className="menu-bar__title">{isOpen ? 'MENU' : '≡'}</span>
        <button className="menu-bar__toggle" onClick={toggleMenu}>
          {isOpen ? '←' : '→'}
        </button>
      </div>

      {/* 메뉴 리스트 */}
      <nav className="menu-bar__nav">
        <ul className="menu-bar__list">
          {menus.map((menu) => (
            <li
              key={menu.label}
              className={`menu-bar__item ${activeMenu === menu.label ? 'active' : ''}`}
              onClick={() => setActiveMenu(menu.label)}
            >
              <span className="menu-bar__icon">{menu.icon}</span>
              {isOpen && <span className="menu-bar__label">{menu.label}</span>}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}