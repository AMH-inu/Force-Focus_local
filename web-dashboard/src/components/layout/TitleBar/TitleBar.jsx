import './TitleBar.css'

// 제목 바 컴포넌트 (상단 바 영역)
// props에 onLogout을 추가합니다.
export default function TitleBar({ 
  title = '실행 강제 시스템 웹 대시보드', 
  onRefresh, 
  onHelp, 
  onLogout 
}) {
  return (
    <header className="titlebar">
      <div className="titlebar__inner">
        {/* 좌측 제목 영역 */}
        <div className="titlebar__left">
          <div className="titlebar__logo">F</div>
          <div className="titlebar__title">{title}</div>
        </div>

        {/* 우측 메뉴 영역 */}
        <div className="titlebar__right">
          <button className="titlebar__btn" onClick={onRefresh}>새로고침</button>
          <button className="titlebar__btn" onClick={onHelp}>도움말</button>
          {/* 로그아웃 버튼 추가: 시각적 구분을 위해 별도 클래스 부여 가능 */}
          <button className="titlebar__btn titlebar__btn--logout" onClick={onLogout}>
            로그아웃
          </button>
        </div>
      </div>
    </header>
  )
}