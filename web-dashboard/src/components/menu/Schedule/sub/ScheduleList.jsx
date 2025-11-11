import React from "react";
import "./ScheduleList.css";

// 일정 목록 컴포넌트
const ScheduleList = ({ schedules = [] }) => {
  // 기본적으로 최신순 정렬 (가장 최근 일정이 위로)
  const sortedSchedules = [...schedules].sort(
    (a, b) => new Date(b.start_date + " " + b.start_time) - new Date(a.start_date + " " + a.start_time)
  );

  return (
    <div className="schedule-list-container">
      <h2 className="list-title">일정 목록</h2>

      {sortedSchedules.length === 0 ? (
        <div className="empty-list">등록된 일정이 없습니다.</div>
      ) : (
        <div className="schedule-card-list">
          {sortedSchedules.map((item) => (
            <div key={item.id} className="schedule-card">
              <div className="card-header">
                <h3 className="card-title">{item.name}</h3>
                <span className="card-date">
                  {item.start_date} {item.start_time} ~ {item.due_date} {item.due_time}
                </span>
              </div>

              <p className="card-description">{item.description}</p>

              <div className="card-footer">
                <span className="created-at">
                  생성일: {new Date(item.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ScheduleList;