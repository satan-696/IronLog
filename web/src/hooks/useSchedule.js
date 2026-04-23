// web/src/hooks/useSchedule.js
import { useState, useCallback } from 'react';
import DataService from '../services/dataService.js';

export function useSchedule() {
  const [schedule, setSchedule] = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);

  const loadSchedule = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const data = await DataService.getSchedule();
      setSchedule(data);
      return data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load schedule');
    } finally {
      setLoading(false);
    }
  }, []);

  const saveDay = useCallback(async (dayIndex, type, muscleGroups) => {
    try {
      const updated = await DataService.saveScheduleDay(dayIndex, type, muscleGroups);
      setSchedule(prev => {
        if (!prev) return prev;
        const next = [...prev];
        next[dayIndex] = { ...next[dayIndex], ...updated };
        return next;
      });
      return updated;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to save day');
    }
  }, []);

  const applyPresetSplit = useCallback(async (splitId) => {
    setLoading(true);
    try {
      const data = await DataService.applyPresetSplit(splitId);
      setSchedule(data);
      return data;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to apply split');
    } finally {
      setLoading(false);
    }
  }, []);

  return { schedule, loading, error, loadSchedule, saveDay, applyPresetSplit };
}
