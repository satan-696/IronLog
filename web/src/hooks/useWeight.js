// web/src/hooks/useWeight.js
import { useState, useCallback } from 'react';
import DataService from '../services/dataService.js';

export function useWeight() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await DataService.getWeightLogs();
      setLogs(data);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const saveWeight = useCallback(async (weightKg, dateKey) => {
    const saved = await DataService.saveWeightLog(weightKg, dateKey);
    setLogs(prev => {
      const idx = prev.findIndex(l => l.dateKey === dateKey);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [...prev, saved].sort((a, b) => a.dateKey.localeCompare(b.dateKey));
    });
    return saved;
  }, []);

  const deleteWeight = useCallback(async (id) => {
    await DataService.deleteWeightLog(id);
    setLogs(prev => prev.filter(l => l.id !== id));
  }, []);

  return { logs, loading, loadLogs, saveWeight, deleteWeight };
}
