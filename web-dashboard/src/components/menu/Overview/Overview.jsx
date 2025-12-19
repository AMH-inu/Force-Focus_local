import React, { useState, useEffect, useRef } from "react";
import "./Overview.css";
import useMainStore from "../../../MainStore";
import { useScheduleStore } from "../Schedule/ScheduleStore"; 

// 스케줄 관련 컴포넌트 임포트
import ScheduleDay from "../Schedule/sub/ScheduleDay";
import ScheduleWeek from "../Schedule/sub/ScheduleWeek";
import ScheduleMonth from "../Schedule/sub/ScheduleMonth";

export default function Overview() {
  const setActiveMenu = useMainStore((state) => state.setActiveMenu);
  const schedules = useScheduleStore((state) => state.schedules);
  const [viewMode, setViewMode] = useState("주");
  
  const scrollRef = useRef(null);

  // --- 오늘 날짜 계산 로직 추가 ---
  const today = new Date();
  const dayIndex = today.getDay(); // 0: 일요일, 6: 토요일
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const date = today.getDate();
  const dayOfWeek = ["일", "월", "화", "수", "목", "금", "토"][today.getDay()];
  const dateString = `${year}년 ${month}월 ${date}일 (${dayOfWeek})`;
  // -----------------------------

  // 요일에 따른 클래스 결정
  const dayClassName = dayIndex === 0 ? "sunday" : dayIndex === 6 ? "saturday" : "";

  useEffect(() => {
    if (viewMode === "월") return;

    const scrollToCurrentTime = () => {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      
      let hourHeight = 0;
      if (viewMode === "일") hourHeight = 60;
      if (viewMode === "주") hourHeight = 40;

      if (scrollRef.current && hourHeight > 0) {
        const scrollPosition = (currentMinutes / 60) * hourHeight;
        scrollRef.current.scrollTo({
          top: scrollPosition - 100 > 0 ? scrollPosition - 100 : 0,
          behavior: "smooth"
        });
      }
    };

    const timer = setTimeout(scrollToCurrentTime, 100);
    return () => clearTimeout(timer);
  }, [viewMode]);

  const renderSchedulePreview = () => {
    switch (viewMode) {
      case "일": return <ScheduleDay schedules={schedules} />;
      case "주": return <ScheduleWeek schedules={schedules} />;
      case "월": return <ScheduleMonth schedules={schedules} />;
      default: return <ScheduleDay schedules={schedules} />;
    }
  };

  return (
    <div className="overview-container">
      <div className="overview-left">
        <div className="overview-header">
          {/* 1. 좌측: 제목 */}
          <h4 
            className="schedule-title-link"
            onClick={() => setActiveMenu("스케줄")}
          >
            시간표 ❯
          </h4>

          {/* 2. 중앙: 오늘 날짜 추가 */}
          <div className={`overview-today-date ${dayClassName}`}>
            {dateString}
          </div>

          {/* 3. 우측: 보기 전환 버튼 */}
          <div className="view-buttons">
            <button 
              className={viewMode === "일" ? "active" : ""} 
              onClick={() => setViewMode("일")}
            >일</button>
            <button 
              className={viewMode === "주" ? "active" : ""} 
              onClick={() => setViewMode("주")}
            >주</button>
            <button 
              className={viewMode === "월" ? "active" : ""} 
              onClick={() => setViewMode("월")}
            >월</button>
          </div>
        </div>

        <div className="schedule-area">
          <div className="schedule-preview-content" ref={scrollRef}>
            {renderSchedulePreview()}
          </div>
        </div>
      </div>

      <div className="overview-right">
        <div className="card" onClick={() => setActiveMenu("활동 요약")} style={{ cursor: "pointer" }}>
          <h4>최근 작업</h4>
          <p>최근 작업 내역 표시 예정</p>
        </div>
        <div className="card" onClick={() => setActiveMenu("피드백")} style={{ cursor: "pointer" }}>
          <h4>최근 작업 피드백</h4>
          <p>피드백 데이터 표시 예정</p>
        </div>
        <div className="card" onClick={() => setActiveMenu("활동 요약")} style={{ cursor: "pointer" }}>
          <h4>최근 작업 그래프</h4>
          <p>그래프 영역 표시 예정</p>
        </div>
      </div>
    </div>
  );
}