import React, { useState } from "react";
import "./ScheduleEditModal.css";
import { useScheduleStore } from "../ScheduleStore";

export default function ScheduleEditModal({ schedule, onClose }) {
  // Store에서 삭제 및 추가 함수 가져오기
  const { addSchedule, deleteSchedule } = useScheduleStore();

  // 기존 일정 데이터로 초기 상태 설정
  const [formData, setFormData] = useState({
    name: schedule.name,
    description: schedule.description,
    start_date: schedule.start_date,
    start_time: schedule.start_time,
    due_date: schedule.due_date,
    due_time: schedule.due_time,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // 1. 기존 ID를 가진 일정을 삭제
    deleteSchedule(schedule.id);

    // 2. 수정된 데이터를 새 일정으로 추가
    // (Zustand persist 구조상 ID는 addSchedule 내부에서 새로 생성됨)
    addSchedule(formData);

    alert("일정이 수정되었습니다.");
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>일정 수정</h2>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>일정 이름</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="예: 팀 회의, 코딩 작업 등"
              required
            />
          </div>

          <div className="form-group">
            <label>설명</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="예: 프론트엔드 대시보드 기능 구현"
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>시작 날짜</label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>시작 시간</label>
              <input
                type="time"
                name="start_time"
                value={formData.start_time}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>종료 날짜</label>
              <input
                type="date"
                name="due_date"
                value={formData.due_date}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>종료 시간</label>
              <input
                type="time"
                name="due_time"
                value={formData.due_time}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="cancel-btn" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="save-btn">
              변경사항 저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}