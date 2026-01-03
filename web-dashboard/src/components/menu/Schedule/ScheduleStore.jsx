import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useScheduleStore = create(
  persist(
    (set, get) => ({
      // 초기 일정 데이터
      schedules: [
        {
          id: 1,
          name: "코딩 작업",
          taskId: 101,
          description: "프론트엔드 대시보드 기능 구현",
          created_at: "2025-11-05",
          start_date: "2025-11-08",
          start_time: "15:00",
          due_date: "2025-11-08",
          due_time: "23:00",
        },
        {
          id: 2,
          name: "팀 회의",
          taskId: 102,
          description: "AI 시스템 진행 상황 점검",
          created_at: "2025-11-06",
          start_date: "2025-11-09",
          start_time: "14:00",
          due_date: "2025-11-09",
          due_time: "15:00",
        },
        {
          id: 3,
          name: "문서 작성",
          taskId: 103,
          description: "발표 자료 정리",
          created_at: "2025-11-06",
          start_date: "2025-11-11",
          start_time: "09:00",
          due_date: "2025-11-11",
          due_time: "11:30",
        },
      ],

      /** 일정 추가 함수 */
      addSchedule: (newSchedule) => {
        const schedules = get().schedules;
        const maxId = schedules.length > 0 ? Math.max(...schedules.map((s) => s.id)) : 0;
        const nextId = maxId + 1;

        const now = new Date();
        const formattedDate = now.toISOString().split("T")[0];

        const scheduleToAdd = {
          id: nextId,
          name: newSchedule.name || "제목 없음",
          taskId: newSchedule.taskId || "",
          description: newSchedule.description || "",
          created_at: formattedDate,
          start_date: newSchedule.start_date,
          start_time: newSchedule.start_time,
          due_date: newSchedule.due_date,
          due_time: newSchedule.due_time,
        };

        const updated = [...schedules, scheduleToAdd];
        set({ schedules: updated });
      },

      /* 일정 삭제 함수 */
      deleteSchedule: (id) => {
        const updated = get().schedules.filter((s) => s.id !== id);
        set({ schedules: updated });
      },
    }),
    {
      name: "schedule-storage", // localStorage에 저장되는 key 이름
      getStorage: () => localStorage,
    }
  )
);