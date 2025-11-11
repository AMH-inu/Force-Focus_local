import React, { useState } from "react";
import "./ActivitySummary.css"

// 활동 요약(Activity Summary) 컴포넌트
export default function ActivitySummary() {
  const [isVertical, setIsVertical] = useState(false);

  const toggleLayout = () => setIsVertical(!isVertical);

  return (
    <div className={`activity-summary ${isVertical ? "vertical" : "horizontal"}`}>
      {/* 상단 메뉴 / 전환 버튼 */}
      <div className="summary-header">
        <span>메뉴바</span>
        <button onClick={toggleLayout} className="toggle-btn">
          {isVertical ? "가로로 보기" : "세로로 보기"}
        </button>
      </div>

      {/* 본문 콘텐츠 */}
      <div className="summary-content">
        {/* 그래프 영역 */}
        <div className="summary-graph">
        <h3>그래프</h3>
        <div className="graph-placeholder">
            <svg viewBox="0 0 100 40" preserveAspectRatio="none">
            <path className="wave purple" d="M0 25 Q 20 10, 40 25 T 80 25 T 100 25" />
            <path className="wave blue" d="M0 20 Q 25 30, 50 15 T 100 20" />
            </svg>
        </div>
        </div>

        {/* 보고서 영역 */}
        <div className="summary-report">
          <h3>보고서</h3>
          <p>보고서 내용 표시 예정</p>
        </div>
      </div>
    </div>
  );
}