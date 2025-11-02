import './TitleBar.css'

export default function TitleBar({ title = '실행 강제 시스템 웹 대시보드', onRefresh, onHelp }) {
  return (
    <header className="titlebar">
    <div className="titlebar__inner">
    <div className="titlebar__left">
      <div className="titlebar__logo">F</div>
      <div className="titlebar__title">실행 강제 시스템 웹 대시보드</div>
    </div>

    <div className="titlebar__right">
    <button className="titlebar__btn" onClick={onRefresh}>새로고침</button>
    <button className="titlebar__btn titlebar__btn--danger" onClick={onHelp}>도움말</button>
    </div>
    </div>
    </header>
  )
}