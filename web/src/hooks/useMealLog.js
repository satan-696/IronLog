// web/src/hooks/useMealLog.js
import { useState, useCallback } from 'react';
import DataService from '../services/dataService.js';

export function useMealLog() {
  const [meals,   setMeals]   = useState([]);
  const [grouped, setGrouped] = useState({});
  const [totals,  setTotals]  = useState({ calories: 0, protein: 0, carbs: 0, fat: 0, itemCount: 0 });
  const [loading, setLoading] = useState(false);

  const loadMeals = useCallback(async (dateKey) => {
    setLoading(true);
    try {
      const data = await DataService.getMealsForDay(dateKey);
      setMeals(data.meals || []);
      setGrouped(data.grouped || {});
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadTotals = useCallback(async (dateKey) => {
    try {
      const data = await DataService.getDailyTotals(dateKey);
      setTotals(data);
      return data;
    } catch { /* silently fail */ }
  }, []);

  const addFood = useCallback(async (data) => {
    const created = await DataService.addFood(data);
    setMeals(prev => [...prev, created]);
    setGrouped(prev => {
      const group = data.mealType || 'snacks';
      return { ...prev, [group]: [...(prev[group] || []), created] };
    });
    setTotals(prev => ({
      calories:  prev.calories  + (created.calories  || 0),
      protein:   prev.protein   + (created.proteinG  || 0),
      carbs:     prev.carbs     + (created.carbsG    || 0),
      fat:       prev.fat       + (created.fatG      || 0),
      itemCount: prev.itemCount + 1,
    }));
    return created;
  }, []);

  const deleteFood = useCallback(async (id) => {
    const meal = meals.find(m => m.id === id);
    await DataService.deleteFood(id);
    setMeals(prev => prev.filter(m => m.id !== id));
    if (meal) {
      setGrouped(prev => ({
        ...prev,
        [meal.mealType]: (prev[meal.mealType] || []).filter(m => m.id !== id),
      }));
      setTotals(prev => ({
        calories:  prev.calories  - (meal.calories  || 0),
        protein:   prev.protein   - (meal.proteinG  || 0),
        carbs:     prev.carbs     - (meal.carbsG    || 0),
        fat:       prev.fat       - (meal.fatG      || 0),
        itemCount: Math.max(0, prev.itemCount - 1),
      }));
    }
  }, [meals]);

  return { meals, grouped, totals, loading, loadMeals, loadTotals, addFood, deleteFood };
}
