import React, { useEffect, useState } from "react";
import "./ScheduleDay.css";

// 날짜 조작을 위해 Date 객체 대신 timestamp나 문자열을 사용하는 것이 안전합니다.
const getFormattedDateString = (date) => date.toISOString().split("T")[0];

export default function ScheduleDay({ schedules = [] }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // 표시 대상 날짜의 '연-월-일' 문자열을 상태 변화 없이 계산
  const currentDisplayDateStr = getFormattedDateString(currentDate);
  
  // 실제 '오늘' 날짜의 '연-월-일' 문자열
  const todayStr = getFormattedDateString(new Date()); 
  const isCurrentlyToday = currentDisplayDateStr === todayStr;

  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  const dayOfWeek = weekdays[currentDate.getDay()];

  const dayClass =
    currentDate.getDay() === 0
      ? "sunday"
      : currentDate.getDay() === 6
      ? "saturday"
      : "";

  const HOUR_HEIGHT = 60;
  // 현재 날짜일 때만 위치를 계산하고, 아니면 null로 설정
  const [currentPosition, setCurrentPosition] = useState(null); 

  useEffect(() => {
    
    const updatePosition = () => {
      // isCurrentlyToday가 false이면 업데이트 중단
      if (!isCurrentlyToday) { 
        setCurrentPosition(null);
        return;
      }
      
      const now = new Date();
      const minutes = now.getHours() * 60 + now.getMinutes();
      const position = (minutes / 60) * HOUR_HEIGHT - 1; 
      setCurrentPosition(position);
    };

    if (isCurrentlyToday) {
      updatePosition();
      // 오늘 날짜일 때만 타이머를 설정
      const timer = setInterval(updatePosition, 60000);
      return () => clearInterval(timer);
    } else {
      // 오늘 날짜가 아닐 경우 위치 초기화 및 타이머 없음 보장
      setCurrentPosition(null);
      return () => {};
    }
    
  }, [currentDisplayDateStr, todayStr, isCurrentlyToday]);

  // 날짜 조작 함수 개선 (timestamp 사용)
  const navigateDay = (direction) => {
    const newDate = new Date(currentDate);
    // 현재 날짜의 밀리초를 가져와 24시간(86400000ms)을 더하거나 뺌
    newDate.setDate(newDate.getDate() + direction);
    setCurrentDate(newDate);
  };

  const handlePrevDay = () => navigateDay(-1);
  const handleNextDay = () => navigateDay(1);
  const handleToday = () => setCurrentDate(new Date());

  // 일정 필터링
  const daySchedules = schedules.filter(
    (s) => s.start_date === currentDisplayDateStr || s.due_date === currentDisplayDateStr
  );

  return (
    <div className="day-view">
      {/* 상단 날짜 헤더 */}
      <div className="day-header">
        {/* ⬅️ 좌측 영역: ◀, ▶, '오늘' 버튼을 모두 포함하며 동일 간격 배치 */}
        <div className="day-header-left">
          <button className="nav-btn" onClick={handlePrevDay}>
            ◀
          </button>
          <button className="nav-btn" onClick={handleNextDay}>
            ▶
          </button>
          <button className="today-btn" onClick={handleToday}>
            오늘
          </button>
        </div>

        {/* ⬅️ 중앙 영역: 제목만 배치 */}
        <div className="day-header-center">
          <span className={`day-title ${dayClass}`}>
            {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월{" "}
            {currentDate.getDate()}일 ({dayOfWeek})
          </span>
        </div>

        {/* ⬅️ 우측 영역: 비워두고 flex: 1로 중앙 정렬 보조 */}
        <div className="day-header-right">
          {/* 비움 */}
        </div>
      </div>

      {/* 본문 */}
      <div className="day-body">
        {/* 시간 라벨 컬럼 */}
        <div className="day-time-column">
          {/* 0시부터 23시까지 라벨을 생성합니다. */}
          {Array.from({ length: 24 }, (_, i) => (
            <div 
              key={i} 
              className="day-time-label" 
            >
              {/* ⚠️ span 태그로 감싸서 CSS에서 상대 위치 조정 */}
              <span>{i.toString().padStart(2, "0")}:00</span>
            </div>
          ))}
        </div>

        {/* 타임라인 및 일정 영역 */}
        <div className="day-timeline">
          {/* 현재 시간선: 오늘일 경우에만 렌더링 */}
          {isCurrentlyToday && currentPosition !== null && (
            <div
              className="current-time-line"
              style={{ top: `${currentPosition}px` }}
            ></div>
          )}

          {/* 시간 구분선 (0시부터 23시까지) */}
          {Array.from({ length: 24 }, (_, i) => (
            <div key={i} className="time-line"></div>
          ))}

          {/* 일정 */}
          {daySchedules.map((s) => {
            const [sh, sm] = s.start_time.split(":").map((v) => parseInt(v, 10));
            const [eh, em] = s.due_time.split(":").map((v) => parseInt(v, 10));
            const totalStart = sh * 60 + sm;
            const totalEnd = eh * 60 + em;
            const top = (totalStart / 60) * HOUR_HEIGHT;
            const height = ((totalEnd - totalStart) / 60) * HOUR_HEIGHT;

            return (
              <div
                key={s.id}
                className="day-task"
                style={{ top: `${top}px`, height: `${height}px` }}
              >
                <div className="task-title">{s.name}</div>
                <div className="task-time">
                  {s.start_time} ~ {s.due_time}
                </div>
                <div className="task-desc">{s.description}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}