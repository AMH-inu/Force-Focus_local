import { useState, useEffect, useCallback } from 'react';
import { scheduleApi } from '../api/scheduleApi';

export const useSchedules = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 1. READ ALL: 모든 일정 가져오기
  const fetchSchedules = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await scheduleApi.getAll(); // GET /schedules/
      setSchedules(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || "일정을 불러오는 데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. CREATE: 일정 추가
  const addSchedule = async (scheduleData) => {
    try {
      const response = await scheduleApi.create(scheduleData); // POST /schedules/
      setSchedules((prev) => [...prev, response.data]);
      return response.data;
    } catch (err) {
      setError("일정 추가 중 오류가 발생했습니다.");
      throw err;
    }
  };

  // 3. UPDATE: 일정 수정
  const updateSchedule = async (id, updateData) => {
    try {
      const response = await scheduleApi.update(id, updateData); // PUT /schedules/{schedule_id}
      setSchedules((prev) =>
        prev.map((s) => (s.id === id ? response.data : s))
      );
      return response.data;
    } catch (err) {
      setError("일정 수정 중 오류가 발생했습니다.");
      throw err;
    }
  };

  // 4. DELETE: 일정 삭제
  const removeSchedule = async (id) => {
    try {
      await scheduleApi.delete(id); // DELETE /schedules/{schedule_id}
      setSchedules((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      setError("일정 삭제 중 오류가 발생했습니다.");
      throw err;
    }
  };

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  return {
    schedules,
    loading,
    error,
    addSchedule,
    updateSchedule,
    removeSchedule,
    refreshSchedules: fetchSchedules,
  };
};