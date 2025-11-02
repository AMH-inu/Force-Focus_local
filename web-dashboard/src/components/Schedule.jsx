import React from "react";
import "./Schedule.css"

export default function Schedule() {
  const schedules = [
    { day: 1, start: 10, end: 13, title: "코딩 작업" },
    { day: 2, start: 5, end: 8, title: "코딩 작업" },
    { day: 3, start: 11, end: 14, title: "코딩 작업" },
    { day: 4, start: 7, end: 9, title: "코딩 작업" },
    { day: 5, start: 9, end: 12, title: "코딩 작업" },
  ];

  return (
    <div className="schedule-container">
      {/* 상단 버튼 */}
      <div className="schedule-header">
        <div className="view-buttons">
          <button>일</button>
          <button className="active">주</button>
          <button>월</button>
          <button>목록</button>
        </div>
        <div className="action-buttons">
          <button className="add-btn">일정 추가</button>
          <button className="delete-btn">일정 삭제</button>
        </div>
      </div>

      {/* 캘린더 영역 */}
      <div className="calendar-grid">
        {/* 요일 헤더 */}
        <div className="day-header">
          {["", "일", "월", "화", "수", "목", "금", "토"].map((day, i) => (
            <div key={i} className="day-cell">{day}</div>
          ))}
        </div>

        {/* 시간표 본문 */}
        <div className="time-grid">
          {/* 왼쪽 시간 표시 */}
          <div className="time-column">
            {Array.from({ length: 24 }, (_, i) => (
              <div key={i} className="time-label">{i}</div>
            ))}
          </div>

          {/* 요일별 칸 */}
          <div className="day-columns">
            {Array.from({ length: 7 }, (_, day) => (
              <div key={day} className="day-column">
                {schedules
                  .filter(s => s.day === day)
                  .map((s, i) => (
                    <div
                      key={i}
                      className="schedule-block"
                      style={{
                        top: `${s.start * 40}px`,
                        height: `${(s.end - s.start) * 40}px`
                      }}
                    >
                      {s.title}
                    </div>
                  ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}