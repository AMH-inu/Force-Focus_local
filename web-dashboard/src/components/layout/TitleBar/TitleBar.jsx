import './TitleBar.css'

// 제목 바 컴포넌트 (상단 바 영역)
export default function TitleBar({ title = '실행 강제 시스템 웹 대시보드', onRefresh, onHelp }) {
  return (
    <header className="titlebar">      {/* 좌측 제목 영역 */}
    <div className="titlebar__inner">
    <div className="titlebar__left">
      <div className="titlebar__logo">F</div>
      <div className="titlebar__title">실행 강제 시스템 웹 대시보드</div>
    </div>

    <div className="titlebar__right">   {/* 우측 메뉴 영역 */}
    <button className="titlebar__btn" onClick={onRefresh}>새로고침</button>
    <button className="titlebar__btn titlebar__btn--danger" onClick={onHelp}>도움말</button>
    </div>
    </div>
    </header>
  )
}