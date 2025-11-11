import React, { useState } from "react";
import "./Schedule.css";
import { useScheduleStore } from './ScheduleStore';

import ScheduleDay from "./sub/ScheduleDay";
import ScheduleWeek from "./sub/ScheduleWeek";
import ScheduleMonth from "./sub/ScheduleMonth";
import ScheduleList from "./sub/ScheduleList";
import ScheduleAddModal from "./sub/ScheduleAddModal";
import ScheduleDeleteModal from "./sub/ScheduleDeleteModal";

// 스케줄 메뉴 컴포넌트
export default function Schedule() {
  const { schedules } = useScheduleStore(); // 현재 저장된 일정 가져오기
  const [viewMode, setViewMode] = useState("week"); // 기본 뷰 모드는 '주'로 설정
  const [isAddOpen, setIsAddOpen] = useState(false); // 일정 추가 모달 상태 (초기값 : 닫힘)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false); // 일정 삭제 모달 상태 (초기값 : 닫힘)

  // 일정 추가 모달 열기/닫기 함수
  const openAddModal = () => setIsAddOpen(true);
  const closeAddModal = () => setIsAddOpen(false);

  // 일정 삭제 모달 열기/닫기 함수
  const openDeleteModal = () => setIsDeleteOpen(true);
  const closeDeleteModal = () => setIsDeleteOpen(false);

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

      {/* 모드별 렌더링 (일, 주, 월, 목록) */}
      {viewMode === "day" && <ScheduleDay schedules={schedules} />}
      {viewMode === "week" && <ScheduleWeek schedules={schedules} />}
      {viewMode === "month" && <ScheduleMonth schedules={schedules} />}
      {viewMode === "list" && <ScheduleList schedules={schedules} />}

      {/* Zustand 사용 */}
      {isAddOpen && <ScheduleAddModal onClose={closeAddModal} />}
      {isDeleteOpen && <ScheduleDeleteModal onClose={closeDeleteModal} />}
    </div>
  );
}
