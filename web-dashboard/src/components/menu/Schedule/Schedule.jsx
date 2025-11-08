import React, { useState } from "react";
import "./Schedule.css";
import ScheduleDay from "./ScheduleDay";
import ScheduleWeek from "./ScheduleWeek";
import ScheduleMonth from "./ScheduleMonth";
import ScheduleList from "./ScheduleList";
import ScheduleAddModal from "./ScheduleAddModal";
import { useScheduleStore } from './ScheduleStore';
import ScheduleDeleteModal from "./ScheduleDeleteModal";

export default function Schedule() {
  const { schedules } = useScheduleStore();
  const [viewMode, setViewMode] = useState("week");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const openAddModal = () => setIsAddOpen(true);
  const closeAddModal = () => setIsAddOpen(false);

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

      {/* ✅ 모드별 렌더링 */}
      {viewMode === "day" && <ScheduleDay schedules={schedules} />}
      {viewMode === "week" && <ScheduleWeek schedules={schedules} />}
      {viewMode === "month" && <ScheduleMonth schedules={schedules} />}
      {viewMode === "list" && <ScheduleList schedules={schedules} />}

      {/* ✅ Zustand에서는 handleAddSchedule 불필요 */}
      {isAddOpen && <ScheduleAddModal onClose={closeAddModal} />}
      {isDeleteOpen && <ScheduleDeleteModal onClose={closeDeleteModal} />}
    </div>
  );
}
