import React, { useState } from "react";
import { useScheduleStore } from "./ScheduleStore";
import "./ScheduleDeleteModal.css"; // 🆕 분리된 스타일 파일

export default function ScheduleDeleteModal({ onClose }) {
  const { schedules, deleteSchedule } = useScheduleStore();
  const [selectedId, setSelectedId] = useState(null);

  const handleDelete = () => {
    if (!selectedId) {
      alert("삭제할 일정을 선택하세요.");
      return;
    }

    // ✅ 브라우저 기본 confirm 창으로 변경
    const confirmed = window.confirm("정말 삭제하시겠습니까?");
    if (confirmed) {
      deleteSchedule(selectedId);
      alert("선택한 일정이 삭제되었습니다.");
      setSelectedId(null);
    }
  };

  return (
    <div className="delete-modal-overlay">
      <div className="delete-modal">
        <h2 className="delete-modal-title">일정 삭제</h2>

        {/* 일정 목록 */}
        <div className="delete-schedule-list">
          {schedules.length === 0 ? (
            <p className="delete-empty-text">등록된 일정이 없습니다.</p>
          ) : (
            schedules.map((s) => (
              <label
                key={s.id}
                className={`delete-schedule-card ${
                  selectedId === s.id ? "selected" : ""
                }`}
              >
                <div className="delete-card-left">
                  <input
                    type="radio"
                    name="selectedSchedule"
                    value={s.id}
                    checked={selectedId === s.id}
                    onChange={() => setSelectedId(s.id)}
                    className="delete-radio"
                  />
                  <div className="delete-schedule-info">
                    <h3 className="delete-schedule-name">{s.name}</h3>
                    <p className="delete-schedule-time">
                      {s.start_date} {s.start_time} ~ {s.due_time}
                    </p>
                    {s.description && (
                      <p className="delete-schedule-desc">{s.description}</p>
                    )}
                  </div>
                </div>
              </label>
            ))
          )}
        </div>

        {/* 하단 버튼 */}
        <div className="delete-modal-footer">
          <button
            className="delete-main-btn"
            onClick={handleDelete}
            disabled={!selectedId}
          >
            삭제
          </button>
          <button className="delete-cancel-btn" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}