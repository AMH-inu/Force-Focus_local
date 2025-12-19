import React, { useState } from "react";
import "./Schedule.css";
import { useScheduleStore } from './ScheduleStore';

import ScheduleDay from "./sub/ScheduleDay";
import ScheduleWeek from "./sub/ScheduleWeek";
import ScheduleMonth from "./sub/ScheduleMonth";
import ScheduleList from "./sub/ScheduleList";
import ScheduleAddModal from "./sub/ScheduleAddModal";
import ScheduleDeleteModal from "./sub/ScheduleDeleteModal";
import ScheduleEditModal from "./sub/ScheduleEditModal";

// 스케줄 메뉴 컴포넌트
export default function Schedule() {
  const { schedules } = useScheduleStore(); // 현재 저장된 일정 가져오기
  const [viewMode, setViewMode] = useState("week"); // 기본 뷰 모드는 '주'로 설정
  const [isAddOpen, setIsAddOpen] = useState(false); // 일정 추가 모달 상태 (초기값 : 닫힘)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false); // 일정 삭제 모달 상태 (초기값 : 닫힘)
  const [isEditOpen, setIsEditOpen] = useState(false); // 일정 수정 모달 상태 (초기값 : 닫힘)
  const [selectedSchedule, setSelectedSchedule] = useState(null); // 수정할 일정 정보 상태

  // 일정 추가 모달 열기/닫기 함수
  const openAddModal = () => setIsAddOpen(true);
  const closeAddModal = () => setIsAddOpen(false);

  // 일정 삭제 모달 열기/닫기 함수
  const openDeleteModal = () => setIsDeleteOpen(true);
  const closeDeleteModal = () => setIsDeleteOpen(false);

  // 수정 모달 제어 함수
  const openEditModal = (schedule) => {
    setSelectedSchedule(schedule);
    setIsEditOpen(true);
  };
  const closeEditModal = () => {
    setSelectedSchedule(null);
    setIsEditOpen(false);
  };

  return (
    <div className="schedule-container">
      <div className="schedule-header">
        <div className="view-buttons">
          <button
            className={viewMode === "day" ? "active" : ""}
            onClick={() => setViewMode("day")}
          >
            일
          </button>
          <button
            className={viewMode === "week" ? "active" : ""}
            onClick={() => setViewMode("week")}
          >
            주
          </button>
          <button
            className={viewMode === "month" ? "active" : ""}
            onClick={() => setViewMode("month")}
          >
            월
          </button>
          <button
            className={viewMode === "list" ? "active" : ""}
            onClick={() => setViewMode("list")}
          >
            목록
          </button>
        </div>

        <div className="action-buttons">
          <button className="add-btn" onClick={openAddModal}>
            일정 추가
          </button>
          <button className="delete-btn" onClick={openDeleteModal}>
            일정 삭제
          </button>
        </div>
      </div>

      {/* 각 뷰 컴포넌트에 onScheduleClick 프롭으로 수정 함수 전달 */}
      {viewMode === "day" && <ScheduleDay schedules={schedules} onScheduleClick={openEditModal} />}
      {viewMode === "week" && <ScheduleWeek schedules={schedules} onScheduleClick={openEditModal} />}
      {viewMode === "month" && <ScheduleMonth schedules={schedules} onScheduleClick={openEditModal} />}
      {viewMode === "list" && <ScheduleList schedules={schedules} onScheduleClick={openEditModal} />}

      {isAddOpen && <ScheduleAddModal onClose={closeAddModal} />}
      {isDeleteOpen && <ScheduleDeleteModal onClose={closeDeleteModal} />}
      
      {/* 수정 모달 렌더링 */}
      {isEditOpen && selectedSchedule && (
        <ScheduleEditModal 
          schedule={selectedSchedule} 
          onClose={closeEditModal} 
        />
      )}
    </div>
  );
}
