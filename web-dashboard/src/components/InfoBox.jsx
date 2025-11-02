import './InfoBox.css'
import useMenuStore from '../MenuStore.jsx'

// 각 메뉴별 컴포넌트를 불러옴
import Overview from "./Overview.jsx" // 메뉴 1 : Overview
import Schedule from "./Schedule.jsx" // 메뉴 2 : 스케줄
import ActivitySummary from "./ActivitySummary.jsx" // 메뉴 3 : 활동 요약
import Feedback from "./Feedback.jsx" // 메뉴 4 : 피드백
import Settings from "./Settings.jsx" // 메뉴 5 : 설정

export default function InfoBox() {
  const activeMenu = useMenuStore((state) => state.activeMenu);

  const renderComponent = () => {
    switch (activeMenu) {
      case 'Overview':
        return <Overview />;
      case '스케줄':
        return <Schedule />;
      case '활동 요약':
        return <ActivitySummary />;
      case '피드백':
        return <Feedback />;
      case '설정':
        return <Settings />;
      default:
        return (
          <div className="infobox-content">
            <h2>현재 시스템 상태</h2>
            <p>이 페이지는 “실행 강제 시스템 웹 대시보드”의 상태를 표시합니다.</p>
            <p>왼쪽 메뉴에서 항목을 선택하세요.</p>
          </div>
        );
    }
  };

  return (
    <div className="infobox">
      <div className="infobox-inner">{renderComponent()}</div>
    </div>
  );
}