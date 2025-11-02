import React from "react";
import "./Overview.css";

export default function Overview() {
  return (
    <div className="overview-container">
      {/* 좌측 일정 영역 */}
      <div className="overview-left">
        <div className="overview-header">
          <div className="view-buttons">
            <button>일</button>
            <button>주</button>
            <button>월</button>
          </div>
          <div className="action-buttons">
            <button className="add-btn">추가</button>
            <button className="delete-btn">삭제</button>
          </div>
        </div>

        <div className="schedule-area">
          <h4>시간표</h4>
          <div className="schedule-placeholder">
            {/* 캘린더나 표를 이곳에 렌더링 */}
          </div>
        </div>
      </div>

      {/* 우측 정보 영역 */}
      <div className="overview-right">
        <div className="card">
          <h4>최근 작업</h4>
          <p>최근 작업 내역 표시 예정</p>
        </div>
        <div className="card">
          <h4>최근 작업 피드백</h4>
          <p>피드백 데이터 표시 예정</p>
        </div>
        <div className="card">
          <h4>최근 작업 그래프</h4>
          <p>그래프 영역 표시 예정<br/> (예: Recharts, Chart.js)</p>
        </div>
      </div>
    </div>
  );
}