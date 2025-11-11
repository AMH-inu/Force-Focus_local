import React, { useState } from "react";
import "./ScheduleAddModal.css";
import { useScheduleStore } from '../ScheduleStore';

// 일정 추가 모달 컴포넌트
export default function ScheduleAddModal({ onClose }) {
  const addSchedule = useScheduleStore((state) => state.addSchedule); // Zustand 전역 스토어에서 추가 함수 가져오기

  const [form, setForm] = useState({
    name: "",
    description: "",
    start_date: "",
    start_time: "",
    due_date: "",
    due_time: "",
  }); // 각 스케줄의 필드 상태 관리 (추후 수정 가능)

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name || !form.start_date || !form.due_date) {
      alert("필수 항목을 입력해주세요.");
      return;
    }

    addSchedule(form); // Zustand 전역 스토어에 추가
    onClose(); // 닫기
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content large">
        <h2>새 일정 추가</h2>
        <form onSubmit={handleSubmit} className="modal-form">
          <label>
            일정 이름
            <input
              type="text"
              name="name"
              placeholder="예: 팀 회의, 코딩 작업 등"
              value={form.name}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            설명
            <textarea
              name="description"
              placeholder="예: 프론트엔드 대시보드 기능 구현"
              value={form.description}
              onChange={handleChange}
            />
          </label>

          <label>
            시작 날짜
            <input
              type="date"
              name="start_date"
              value={form.start_date}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            시작 시간
            <input
              type="time"
              name="start_time"
              value={form.start_time}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            종료 날짜
            <input
              type="date"
              name="due_date"
              value={form.due_date}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            종료 시간
            <input
              type="time"
              name="due_time"
              value={form.due_time}
              onChange={handleChange}
              required
            />
          </label>

          <div className="modal-actions">
            <button type="submit" className="submit-btn">
              저장
            </button>
            <button type="button" className="cancel-btn" onClick={onClose}>
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
