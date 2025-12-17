import { useState, useEffect } from 'react';
import { taskApi } from '../api/taskApi';

export const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await taskApi.getAll(); //
      setTasks(res.data);
    } catch (err) {
      console.error("Task 로딩 실패", err);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (taskData) => {
    const res = await taskApi.create(taskData); //
    setTasks(prev => [...prev, res.data]);
  };

  const removeTask = async (id) => {
    await taskApi.delete(id); //
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  useEffect(() => { fetchTasks(); }, []);

  return { tasks, loading, addTask, removeTask };
};