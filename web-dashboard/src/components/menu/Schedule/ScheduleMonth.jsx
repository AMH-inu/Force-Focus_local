import React, { useState } from "react";
import "./ScheduleMonth.css";

export default function ScheduleMonth({ schedules }) {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDayOfWeek = new Date(year, month, 1).getDay();
  const endDayOfWeek = new Date(year, month, daysInMonth).getDay();

  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() === month;
  const todayDate = today.getDate();

  // ✅ 지난/다음 달 정보
  const prevMonthDays = new Date(year, month, 0).getDate();
  const nextMonthDayCount = 6 - endDayOfWeek;

  // ✅ 공휴일/기념일
  const holidays = [
    { month: 1, day: 1, name: "신정" },
    { month: 3, day: 1, name: "삼일절" },
    { month: 5, day: 5, name: "어린이날" },
    { month: 6, day: 6, name: "현충일" },
    { month: 8, day: 15, name: "광복절" },
    { month: 10, day: 3, name: "개천절" },
    { month: 10, day: 9, name: "한글날" },
    { month: 12, day: 25, name: "성탄절" },
  ];

  // ✅ 날짜 배열 구성
  const days = [];

  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    days.push({
      date: new Date(year, month - 1, prevMonthDays - i),
      type: "prev",
    });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      date: new Date(year, month, i),
      type: "current",
    });
  }
  for (let i = 1; i <= nextMonthDayCount; i++) {
    days.push({
      date: new Date(year, month + 1, i),
      type: "next",
    });
  }

  // ✅ 날짜 포맷 함수 (YYYY-MM-DD)
  const formatDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  // ✅ 이동 함수
  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const handleToday = () =>
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));

  return (
    <div className="month-view">
      {/* 상단 제목바 */}
      <div className="month-title-bar">
        <div className="month-nav-group">
          <button onClick={handlePrevMonth} className="nav-btn small">
            ◀
          </button>
          <div className="month-title">
            {year}년 {month + 1}월
          </div>
          <button onClick={handleNextMonth} className="nav-btn small">
            ▶
          </button>
        </div>

        <button onClick={handleToday} className="today-btn-inline">
          오늘
        </button>
      </div>

      {/* 달력 본문 */}
      <div className="month-grid">
        {["일", "월", "화", "수", "목", "금", "토"].map((d, i) => (
          <div
            key={i}
            className={`month-day-header ${
              i === 0 ? "sunday" : i === 6 ? "saturday" : ""
            }`}
          >
            {d}
          </div>
        ))}

        {days.map((item, i) => {
          const dayOfWeek = i % 7;
          const isSunday = dayOfWeek === 0;
          const isSaturday = dayOfWeek === 6;
          const isToday =
            isCurrentMonth &&
            item.type === "current" &&
            item.date.getDate() === todayDate;

          const isHoliday =
            item.type === "current" &&
            holidays.some(
              (h) =>
                h.month === item.date.getMonth() + 1 &&
                h.day === item.date.getDate()
            );

          // ✅ 현재 날짜(YYYY-MM-DD)
          const currentDateStr = formatDate(item.date);

          // ✅ 해당 날짜의 일정 필터링
          const dailySchedules = schedules.filter(
            (s) => s.start_date === currentDateStr
          );

          return (
            <div
              key={i}
              className={`month-cell ${
                item.type !== "current" ? "faded-cell" : ""
              } ${isToday ? "today-cell" : ""}`}
            >
              <div
                className={`day-number
                  ${item.type !== "current" ? "faded-text" : ""}
                  ${isSunday || isHoliday ? "sunday-text" : ""}
                  ${isSaturday ? "saturday-text" : ""}`}
              >
                {item.date.getDate()}
              </div>

              {/* ✅ 일정 표시 */}
              {dailySchedules.map((s) => (
                <div key={s.id} className="month-task">
                  <strong>{s.name}</strong>
                  <div className="task-time">
                    {s.start_time} ~ {s.due_time}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
