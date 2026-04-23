// web/src/hooks/useWorkoutLog.js
import { useState, useCallback } from 'react';
import DataService from '../services/dataService.js';

export function useWorkoutLog() {
  const [weekLogs, setWeekLogs] = useState([]);
  const [monthLogs, setMonthLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadWeekLogs = useCallback(async (weekKey, dayIndex) => {
    setLoading(true);
    try {
      const data = await DataService.getWeekLogs(weekKey, dayIndex);
      setWeekLogs(data);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMonthLogs = useCallback(async (year, month) => {
    setLoading(true);
    try {
      const data = await DataService.getMonthLogs(year, month);
      setMonthLogs(data);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const saveSet = useCallback(async (data) => {
    const saved = await DataService.saveSet(data);
    setWeekLogs(prev => {
      const idx = prev.findIndex(l =>
        l.exerciseId === saved.exerciseId &&
        l.weekKey    === saved.weekKey &&
        l.dayIndex   === saved.dayIndex &&
        l.setNumber  === saved.setNumber
      );
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [...prev, saved];
    });
    return saved;
  }, []);

  const deleteSet = useCallback(async (id) => {
    await DataService.deleteSet(id);
    setWeekLogs(prev => prev.filter(l => l.id !== id));
  }, []);

  return { weekLogs, monthLogs, loading, loadWeekLogs, loadMonthLogs, saveSet, deleteSet };
}
