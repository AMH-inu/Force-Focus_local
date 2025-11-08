import React from "react";
import "./ScheduleWeek.css";

export default function ScheduleWeek({ schedules }) {
  const today = new Date();
  const currentWeekStart = new Date(today);
  currentWeekStart.setDate(today.getDate() - today.getDay());

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(currentWeekStart);
    d.setDate(currentWeekStart.getDate() + i);
    return d;
  });

  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="week-calendar">
      {/* 좌측 시간 컬럼 */}
      <div className="time-column">
        {/* 상단 '시간' 헤더 */}
        <div className="time-header">시간</div>
        {/* 시간 레이블 */}
        {hours.map((h) => (
          <div key={h} className="time-label">
            {h}
          </div>
        ))}
      </div>

      {/* 요일 + 본문 컬럼 */}
      <div className="day-columns">
        {weekDays.map((day) => {
          const dayStr = day.toISOString().split("T")[0];
          const daySchedules = schedules.filter((s) => s.start_date === dayStr);

          return (
            <div key={dayStr} className="day-column">
              {/* 요일 헤더 */}
              <div
                className={`day-header-cell ${
                  day.getDay() === 0
                    ? "sunday"
                    : day.getDay() === 6
                    ? "saturday"
                    : ""
                }`}
              >
                <div className="week-header-day">
                  {["일", "월", "화", "수", "목", "금", "토"][day.getDay()]}
                </div>
                <div className="week-header-date">
                  {day.getMonth() + 1}/{day.getDate()}
                </div>
              </div>

              {/* 본문 영역 */}
              <div className="day-body">
                {hours.map((h) => (
                  <div key={h} className="time-line"></div>
                ))}

                {daySchedules.map((s) => {
                  const startHour = parseInt(s.start_time.split(":")[0]) + 1;
                  const startMin = parseInt(s.start_time.split(":")[1]);
                  const endHour = parseInt(s.due_time.split(":")[0]) + 1;
                  const endMin = parseInt(s.due_time.split(":")[1]);

                  const startTotal = startHour * 60 + startMin;
                  const endTotal = endHour * 60 + endMin;

                  const top = (startTotal / 60) * 40; // 1시간=40px
                  const height = ((endTotal - startTotal) / 60) * 40;

                  return (
                    <div
                      key={s.id}
                      className="schedule-block"
                      style={{ top: `${top}px`, height: `${height}px` }}
                    >
                      <div className="task-title">{s.name}</div>
                      <div className="task-time">
                        {s.start_time} ~ {s.due_time}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
