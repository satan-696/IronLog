// web/src/hooks/useExercises.js
import { useState, useCallback } from 'react';
import DataService from '../services/dataService.js';

export function useExercises() {
  const [exercisesByDay, setExercisesByDay] = useState({});
  const [loading, setLoading] = useState(false);

  const loadExercises = useCallback(async (scheduleId) => {
    if (!scheduleId) return;
    setLoading(true);
    try {
      const data = await DataService.getExercises(scheduleId);
      setExercisesByDay(prev => ({ ...prev, [scheduleId]: data }));
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const addExercise = useCallback(async (scheduleId, data) => {
    const created = await DataService.addExercise({ scheduleId, ...data });
    setExercisesByDay(prev => ({
      ...prev,
      [scheduleId]: [...(prev[scheduleId] || []), created],
    }));
    return created;
  }, []);

  const updateExercise = useCallback(async (id, scheduleId, data) => {
    const updated = await DataService.updateExercise(id, data);
    setExercisesByDay(prev => ({
      ...prev,
      [scheduleId]: (prev[scheduleId] || []).map(e => e.id === id ? updated : e),
    }));
    return updated;
  }, []);

  const deleteExercise = useCallback(async (id, scheduleId) => {
    await DataService.deleteExercise(id);
    setExercisesByDay(prev => ({
      ...prev,
      [scheduleId]: (prev[scheduleId] || []).filter(e => e.id !== id),
    }));
  }, []);

  const reorderExercises = useCallback(async (scheduleId, exerciseIds) => {
    await DataService.reorderExercises(exerciseIds);
    setExercisesByDay(prev => {
      const list = [...(prev[scheduleId] || [])];
      const sorted = exerciseIds.map(id => list.find(e => e.id === id)).filter(Boolean);
      return { ...prev, [scheduleId]: sorted };
    });
  }, []);

  return { exercisesByDay, loading, loadExercises, addExercise, updateExercise, deleteExercise, reorderExercises };
}
