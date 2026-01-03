import React, { useState, useEffect } from "react";
import "./ScheduleList.css";

const ScheduleList = ({ schedules = [], onScheduleClick }) => {
  // 작업 목록을 가져와서 taskId에 해당하는 작업 이름을 매핑하기 위함
  const [taskSessions, setTaskSessions] = useState([]);

  useEffect(() => {
    const savedSessions = localStorage.getItem('task-db-sessions');
    if (savedSessions) {
      setTaskSessions(JSON.parse(savedSessions));
    }
  }, []);

  const sortedSchedules = [...schedules].sort(
    (a, b) => new Date(b.start_date + " " + b.start_time) - new Date(a.start_date + " " + a.start_time)
  );

  // taskId를 통해 작업 라벨을 찾는 함수
  const getTaskLabel = (taskId) => {
    const task = taskSessions.find(t => t.id === taskId);
    return task ? task.label : "연결된 작업 없음";
  };

  return (
    <div className="schedule-list-container">
      <h2 className="list-title">일정 목록</h2>

      {sortedSchedules.length === 0 ? (
        <div className="empty-list">등록된 일정이 없습니다.</div>
      ) : (
        <div className="schedule-card-list">
          {sortedSchedules.map((item) => (
            <div key={item.id} className="schedule-card"
              style={{ cursor: "pointer" }}
              onClick={() => onScheduleClick && onScheduleClick(item)}
            >
              <div className="card-header">
                <div className="title-row">
                  <h3 className="card-title">{item.name}</h3>
                  {/* 연결된 작업 유형을 태그 형태로 출력 */}
                  <span className="task-badge">{getTaskLabel(item.taskId)}</span>
                </div>
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